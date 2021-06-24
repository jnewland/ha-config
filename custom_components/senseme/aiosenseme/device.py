"""SensemeFan Class.

This class connects to a SenseME fan by Big Ass Fans to retrieve and maintain its
complete state. It keep a connection always open to the fan and will receive virtually
instantaneous state changes (push) from any source (i.e. remote control or Haiku App).
The always open connection will automatically reconnect on errors or when the SenseME
fan disconnects. Control and access to the fan's current state is provided by class
properties. State changes are announced via callbacks.

Based on work from Bruce at http://bruce.pennypacker.org/tag/senseme-plugin/
and https://github.com/bpennypacker/SenseME-Indigo-Plugin

Based on work from TomFaulkner at https://github.com/TomFaulkner/SenseMe

Source can be found at https://github.com/mikelawrence/aiosenseme
"""
import asyncio
import inspect
import ipaddress
import logging
import random
import traceback
from typing import Any, Callable, Tuple

_LOGGER = logging.getLogger(__name__)

PORT = 31415

ONOFF = ["ON", "OFF"]
DIRECTIONS = ["FWD", "REV"]
AUTOCOMFORTS = ["OFF", "COOLING", "HEATING", "FOLLOWTSTAT"]
INVALID_DATA = "?????"  # data we never expect to be sent by the device
ROOM_TYPES = [
    "Undefined",  # 0, not in a room
    "Other",  # 1
    "Master Bedroom",  # 2
    "Bedroom",  # 3
    "Den",  # 4
    "Family Room",  # 5
    "Living Room",  # 6
    "Kids Room",  # 7
    "Kitchen",  # 8
    "Dining Room",  # 9
    "Basement",  # 10
    "Office",  # 11
    "Patio",  # 12
    "Porch",  # 13
    "Hallway",  # 14
    "Entryway",  # 15
    "Bathroom",  # 16
    "Laundry",  # 17
    "Stairs",  # 18
    "Closet",  # 19
    "Sunroom",  # 20
    "Media Room",  # 21
    "Gym",  # 22
    "Garage",  # 23
    "Outside",  # 24
    "Loft",  # 25
    "Playroom",  # 26
    "Pantry",  # 27
    "Mudroom",  # 28
]

DEVICE_MODELS = {
    "FAN,HAIKU,SENSEME": "Haiku Fan",
    "FAN,HAIKU,HSERIES": "Haiku Fan",  # H Series is now called plain Haiku
    "FAN,LSERIES": "Haiku L Fan",
    "LIGHT,HAIKU": "Haiku Light",
}

DEVICE_TYPES = {
    "FAN,HAIKU,SENSEME": "FAN",
    "FAN,HAIKU,HSERIES": "FAN",
    "FAN,LSERIES": "FAN",
    "LIGHT,HAIKU": "LIGHT",
}

IGNORE_MODELS = [
    "SWITCH,SENSEME",
]

SUPPRESS_CALLBACK_PARAMS = {"SLEEP;EVENT"}


class SensemeEndpoint:
    """High-level endpoint for SenseME protocol."""

    def __init__(self):
        """Initialize Senseme Discovery Endpoint."""
        self.receive_queue = asyncio.Queue()
        self.opened = False
        self.transport = None

    def abort(self):
        """Close the transport immediately. Buffered write data will be flushed."""
        self.transport.abort()
        self.close()

    def close(self):
        """Close the transport gracefully. Buffered write data will be sent."""
        if self.transport is None:
            return
        self.receive_queue.put_nowait(None)  # tell receive() socket is closed
        if self.transport:
            self.transport.close()

    def is_closing(self) -> bool:
        """Return True if the endpoint is closed or closing."""
        if not self.opened:
            return False  # unopened connection is not closed
        if self.transport is None:
            return True  # opened connection but no transport is closed
        return self.transport.is_closing()

    async def receive(self) -> str:
        """Wait for a message from the SenseME fan.

        Return None when the socket is closed.
        This method is a coroutine.
        """
        if not self.transport:
            return None
        if self.receive_queue.empty() and self.transport.is_closing():
            return None
        return await self.receive_queue.get()

    def send(self, cmd):
        """Send a command to the SenseME fan."""
        self.transport.write(cmd.encode("utf-8"))


class SensemeProtocol(asyncio.Protocol):
    """Protocol for SenseME communication."""

    def __init__(self, name, endpoint: SensemeEndpoint):
        """Initialize Senseme Protocol."""
        self._name = name
        self._endpoint = endpoint

    # Protocol methods
    def connection_made(self, transport: asyncio.Protocol):
        """Socket connect on SenseME Protocol."""
        _LOGGER.debug("%s: Connected", self._name)
        self._endpoint.transport = transport
        self._endpoint.opened = True

    def connection_lost(self, exc):  # pylint: disable=unused-argument
        """Lost connection SenseME Protocol."""
        _LOGGER.debug("%s: Connection lost", self._name)
        self._endpoint.close()  # half-closed connections are not permitted

    # Streaming Protocol methods
    def data_received(self, data: str) -> str:
        """UDP packet received on SenseME Protocol."""
        if data:
            msg = data.decode("utf-8")
            try:
                self._endpoint.receive_queue.put_nowait(msg)
            except asyncio.QueueFull:
                _LOGGER.error("%s: Receive queue full", self._name)

    def eof_received(self) -> bool:
        """EOF received on SenseME Protocol."""
        return False  # tell the transport to close itself


class SensemeDevice:
    """SensemeDevice base class."""

    def __init__(
        self,
        info: dict = None,
        name: str = None,
        uuid: str = None,
        mac: str = None,
        address: str = None,
        base_model: str = None,
        refresh_minutes: int = 1,
    ):
        """Initialize SensemeDevice Class."""
        self.refresh_minutes = refresh_minutes
        if info is not None:
            self._name = info.get("name", None)
            self._uuid = info.get("uuid", None)
            self._mac = info.get("mac", None)
            self._address = info.get("address", None)
            self._base_model = info.get("base_model", None)
            self._has_light = info.get("has_light", None)
            self._has_sensor = info.get("has_sensor", None)
        else:
            self._name = name
            self._uuid = uuid
            self._mac = mac
            self._address = address
            self._base_model = base_model
            self._has_light = None
            if base_model is not None:
                if self.model in ["Haiku Fan", "Haiku Light"]:
                    self._has_sensor = True
                elif self.model == "Haiku L Fan":
                    self._has_sensor = None
                else:
                    self._has_sensor = False
            else:
                self._has_sensor = None
        self._room_name = None
        self._room_type = None
        self._fw_name = "Unknown"
        self._fw_version = None

        self._data = dict()
        self._is_running = False
        self._is_connected = asyncio.Event()
        self._connection_lost = False
        self._endpoint = None
        self._listener_task = None
        self._updater_task = None
        self._error_count = 0
        self._leftover = ""
        self._callbacks = []
        self._coroutine_callbacks = []
        self._first_update = asyncio.Event()

    def __eq__(self, other: Any) -> bool:
        """Equals magic method."""
        try:
            ip_addr = ipaddress.ip_address(other)
            return ip_addr == ipaddress.ip_address(self._address)
        except ValueError:
            pass
        if isinstance(other, SensemeDevice):
            if self._address and other.address:
                return self._address == other.address
        if isinstance(other, str):
            return other in [self._name]

        return NotImplemented

    def __hash__(self) -> int:
        """Hash magic method."""
        return hash(self._uuid)

    @property
    def is_sec_info_complete(self) -> bool:
        """Return if all secondary information is complete."""
        if self._name is None:
            return False
        if self._uuid is None:
            return False
        if self._mac is None:
            return False
        if self._base_model is None:
            return False
        if self._room_name is None:
            return False
        if self._room_type is None:
            return False
        if self._has_light is None:
            return False
        if self._has_sensor is None:
            return False
        if self._fw_version is None:
            return False
        if self._base_model is None:
            return False
        return True

    @property
    def get_device_info(self) -> dict:
        """Get a dict with all key information abouth this device."""
        return {
            "name": self._name,
            "uuid": self._uuid,
            "mac": self._mac,
            "address": self._address,
            "base_model": self._base_model,
            "has_light": self._has_light,
            "has_sensor": self._has_sensor,
            "is_fan": self.is_fan,
            "is_light": self.is_light,
        }

    @property
    def is_fan(self) -> str:
        """Return True if this device is a fan."""
        return False

    @property
    def is_light(self) -> str:
        """Return True if the device is a standalone light."""
        return False

    @property
    def name(self) -> str:
        """Return name of device."""
        if self._name is None:
            if self._mac is None:
                return self._address
            return self._mac
        return self._name

    @property
    def uuid(self) -> str:
        """Return UUID for this device.

        This is the network token read from the device.
        It will be unique for each device.
        """
        return self._uuid

    @property
    def mac(self) -> str:
        """Return MAC address of device."""
        return self._mac

    @property
    def address(self) -> str:
        """Return IP address of device."""
        return self._address

    @property
    def available(self) -> bool:
        """Return True when device is connected and all parameters have been updated."""
        return self._is_connected.is_set() and self._first_update.is_set()

    @property
    def connected(self) -> bool:
        """Return True when device is connected."""
        return self._is_connected.is_set()

    @property
    def device_type(self) -> str:
        """Return type of device.

        If the model is unknown then the default response is a "FAN".
        """
        return DEVICE_TYPES.get(self._base_model.upper(), "FAN")

    @property
    def model(self) -> str:
        """Return Model of device."""
        return DEVICE_MODELS.get(self._base_model.upper(), self._base_model.upper())

    @property
    def base_model(self) -> str:
        """Return Model of device as reported."""
        return self._base_model

    @classmethod
    def models(cls) -> list:
        """Return list of possible model names."""
        no_duplicates = []
        for model_name in DEVICE_MODELS.values():
            if model_name not in no_duplicates:
                no_duplicates.append(model_name)
        return no_duplicates

    @property
    def is_unknown_model(self) -> bool:
        """Return True if the model is unknown."""
        return DEVICE_MODELS.get(self._base_model.upper(), None) is None

    @property
    def fw_version(self) -> str:
        """Return the version of the firmware running on the SenseME device."""
        return self._fw_version

    @property
    def has_light(self) -> bool:
        """Return True if the device has an installed light."""
        return self._has_light

    @property
    def has_sensor(self) -> bool:
        """Return True if the device has an occupancy sensor."""
        return self._has_sensor

    @property
    def device_indicators(self) -> str:
        """Return True if the device LED indicator is enabled."""
        value = self._data.get("DEVICE;INDICATORS", None)
        if value:
            return value == "ON"
        return None

    @device_indicators.setter
    def device_indicators(self, value: bool):
        """Enable/disable the device LED indicator."""
        if value:
            state = "ON"
        else:
            state = "OFF"
        self._send_command(f"DEVICE;INDICATORS;{state}")

    @property
    def device_beeper(self) -> bool:
        """Return the device audible alert enabled state."""
        status = self._data.get("DEVICE;BEEPER", None)
        if status:
            return status == "ON"
        return None

    @device_beeper.setter
    def device_beeper(self, value: bool):
        """Enable/disable the device audible alert."""
        if value:
            state = "ON"
        else:
            state = "OFF"
        self._send_command(f"DEVICE;BEEPER;{state}")

    @property
    def network_ap_on(self) -> bool:
        """Return the wireless access point running state."""
        status = self._data.get("NW;AP;STATUS", None)
        if status:
            return status == "ON"
        return None

    @property
    def network_dhcp_on(self) -> bool:
        """Return the device local DHCP service running state."""
        dhcp = self._data.get("NW;DHCP", None)
        if dhcp:
            return dhcp == "ON"
        return None

    @property
    def network_ip(self) -> str:
        """Return the network IP address of the device.

        This IP address is reported by the SenseME device and not necessarily the same IP
        address used to connect with the device.
        """
        addresses = self._data.get("NW;PARAMS;ACTUAL", None)
        if addresses:
            addresses = addresses.split(";")
            return addresses[0]
        return None

    @property
    def network_subnetmask(self) -> str:
        """Return the network gateway address of the device."""
        addresses = self._data.get("NW;PARAMS;ACTUAL", None)
        if addresses:
            addresses = addresses.split(";")
            return addresses[2]
        return None

    @property
    def network_gateway(self) -> str:
        """Return the network gateway address of the device."""
        addresses = self._data.get("NW;PARAMS;ACTUAL", None)
        if addresses:
            addresses = addresses.split(";")
            return addresses[1]
        return None

    @property
    def network_ssid(self) -> str:
        """Return the wireless SSID the device is connected to."""
        return self._data.get("NW;SSID", None)

    @property
    def network_token(self) -> str:
        """Return the network token of the device. This is the same as uuid."""
        return self._uuid

    @property
    def room_status(self) -> bool:
        """Return True if the device is in a room."""
        if self._room_name and self._room_type:
            return self._room_name != "EMPTY" and self._room_type != "0"
        return None

    @property
    def room_name(self) -> str:
        """Return the room name of the device.

        'EMPTY' is returned if not in a group.
        """
        return self._room_name

    @property
    def room_type(self) -> str:
        """Return the room type of the device."""
        room_type = self._room_type
        if room_type:
            if room_type >= len(ROOM_TYPES):
                room_type = 0
            return ROOM_TYPES[room_type]
        return None

    @property
    def light_on(self) -> bool:
        """Return True when light is on at any brightness."""
        state = self._data.get("LIGHT;PWR", None)
        if state:
            return state == "ON"
        return None

    @light_on.setter
    def light_on(self, state: bool):
        """Set the light power state."""
        value = "ON" if state else "OFF"
        self._send_command(f"LIGHT;PWR;{value}")

    @property
    def light_brightness(self) -> int:
        """Return the light brightness."""
        level = self._data.get("LIGHT;LEVEL;ACTUAL", None)
        if level:
            return int(level)
        return None

    @light_brightness.setter
    def light_brightness(self, level: int):
        """Set the light brightness."""
        if level < 0:
            level = 0
        if level > 16:
            level = 16
        self._send_command(f"LIGHT;LEVEL;SET;{level}")

    @property
    def light_brightness_min(self) -> int:
        """Return the light brightness minimum."""
        min_brightness = self._data.get("LIGHT;LEVEL;MIN", None)
        if min_brightness:
            return int(min_brightness)
        return None

    @property
    def light_brightness_max(self) -> int:
        """Return the light brightness maximum."""
        max_brightness = self._data.get("LIGHT;LEVEL;MAX", None)
        if max_brightness:
            return int(max_brightness)
        return None

    @property
    def light_brightness_limits_room(self) -> Tuple:
        """Return a tuple of the min and max light brightness for the room.

        A room can limit the minimum/maximum light brightness while keeping the same
        number of light brightness levels. On the Haiku by BAF application this setting
        can be found by clicking the room info button. You have to have at least one
        fan with installed light added to a room.
        """
        raw = self._data.get("LIGHT;BOOKENDS", None)
        if raw is None:
            return None
        values = raw.split(";")
        if len(values) != 2:
            return None
        min_bright = int(values[0])
        max_bright = int(values[1])
        return min_bright, max_bright

    @property
    def motion_detected(self) -> bool:
        """Return True when device motion sensor says room is occupied.

        Available on all SenseME fans.
        """
        status = self._data.get("SNSROCC;STATUS", None)
        if status:
            return status == "OCCUPIED"
        return None

    @property
    def motion_light_auto(self) -> bool:
        """Return True when light is in automatic on with motion mode."""
        if not self.has_light:
            return None
        state = self._data.get("LIGHT;AUTO", None)
        if state:
            return state == "ON"
        return None

    @motion_light_auto.setter
    def motion_light_auto(self, state: bool):
        """Set the light automatic on with motion mode."""
        if not self.has_light:
            return
        state = "ON" if state else "OFF"
        self._send_command(f"LIGHT;AUTO;{state}")

    @property
    def sleep_mode(self) -> bool:
        """Return True when sleep mode is enabled."""
        state = self._data.get("SLEEP;STATE", None)
        if state:
            return state == "ON"
        return None

    @sleep_mode.setter
    def sleep_mode(self, state: bool):
        """Set the sleep mode."""
        state = "ON" if state else "OFF"
        self._send_command(f"SLEEP;STATE;{state}")

    async def async_fill_out_info(self) -> bool:
        """Retrieve info from the SenseME device directly.

        Does not start background tasks to retrieve device/parameter information.
        This method is a coroutine.
        """
        writer = None
        if self.is_sec_info_complete:
            return True
        try:
            _LOGGER.debug(
                "Retrieve device information: Connecting to address %s", self.address
            )
            reader, writer = await asyncio.open_connection(self._address, PORT)
            _LOGGER.debug(
                "Retrieve device information: Status Update from address %s",
                self.address,
            )
            writer.write(f"<{self._address};DEVICE;ID;GET>".encode("utf-8"))
            writer.write(f"<{self._address};SNSROCC;STATUS;GET>".encode("utf-8"))
            writer.write(f"<{self._address};GETALL;GET>".encode("utf-8"))

            leftover = ""
            while True:
                # socket will throw a timeout error and abort this function if
                # no proper response is received
                line = await asyncio.wait_for(reader.readuntil(b")"), 10)
                leftover, _ = self._process_message(leftover + line.decode("utf-8"))
                if self._first_update.is_set():
                    return True
        except asyncio.TimeoutError:
            _LOGGER.debug(
                "Retrieve device information: Failed to connect to address %s",
                self.address,
            )
            return False
        except OSError:
            _LOGGER.debug(
                "%s: Retrieve device information: Error\n%s",
                self.address,
                traceback.format_exc(),
            )
            return False
        finally:
            # close the socket
            if writer is not None:
                _LOGGER.debug(
                    "Retrieve device information: Disconnecting from address %s",
                    self.address,
                )
                writer.close()
                await writer.wait_closed()

    def add_callback(self, callback: Callable):
        """Add callback function/coroutine. Called when parameters are updated."""
        is_coroutine = inspect.iscoroutinefunction(callback)
        if is_coroutine:
            if callback not in self._coroutine_callbacks:
                self._coroutine_callbacks.append(callback)
            _LOGGER.debug("%s: Added coroutine callback", self.name)
            return

        if callback not in self._callbacks:
            self._callbacks.append(callback)
        _LOGGER.debug("%s: Added function callback", self.name)

    def remove_callback(self, callback):
        """Remove existing callback function/coroutine."""
        if callback in self._coroutine_callbacks:
            self._coroutine_callbacks.remove(callback)
            _LOGGER.debug("%s: Removed coroutine callback", self.name)
            return
        if callback in self._callbacks:
            self._callbacks.remove(callback)
            _LOGGER.debug("%s: Removed function callback", self.name)
            return

    async def async_update(self, connection_lost=False, timeout_seconds=10) -> bool:
        """Wait for first update of all parameters in SenseME device.

        If connection_lost is True this connect will be treated as a reconnect.
        If timeout_seconds is how long this method will wait for a response
        before timing out. The Device will be started if not already.
        This method is a coroutine.
        """
        if connection_lost:
            self._connection_lost = True
        if not self._is_running:
            self.start()
        try:
            await asyncio.wait(
                [self._first_update.wait(), self._is_connected.wait()],
                timeout=timeout_seconds,
            )
        except asyncio.TimeoutError:
            return False
        else:
            return True

    def _execute_callbacks(self):
        """Run all callbacks to indicate something has changed."""
        count = 0
        for callback in self._callbacks:
            count += 1
            callback()
        for callback in self._coroutine_callbacks:
            count += 1
            asyncio.create_task(callback())
        _LOGGER.debug("%s: %s callback(s) happened.", self.name, count)

    def _send_command(self, cmd):
        """Send a command to SenseME device."""
        msg = f"<{self.mac};{cmd}>"
        self._endpoint.send(msg)
        # _LOGGER.debug("%s: Command sent '%s'", self.name, cmd)

    def _process_message(self, line) -> str:
        """Process messages from device.

        May contain multiple responses in one line string.
        Last response may be a partial so it is returned.
        This partial should be added to next line.
        """
        should_callback = False
        # The line received may have multiple parenthesized responses
        # Split them and process each individual message.
        # Convert "(msg1)(msg2)(msg3)" to "(msg1)|(msg2)|(msg3)"
        # then split on the '|'
        for msg in line.replace(")(", ")|(").split("|"):
            if msg[-1] != ")":
                return msg, should_callback
            # remove begining '(' and ending ')' from string
            # also extract name if undefined
            name, result = msg[1:-1].split(";", 1)
            if self._name is None:
                self._data["NAME;VALUE"] = name
                self._name = name
            # most messages have only one value at the end
            valuecount = 1
            if "BOOKENDS" in result:
                valuecount = 2
            elif "NW;PARAMS;ACTUAL" in result:
                valuecount = 3
            elif "DEVICE;LIGHT" in result:
                valuecount = len(result.split(";")) - 2
            elif "DEVICE;ID" in result:
                valuecount = 2
            # split on ';' and the associate the correct number of values
            values = result.split(";")
            key = ";".join(values[:-valuecount])
            value = ";".join(values[-valuecount:])
            if key == "ERROR":
                _LOGGER.error(
                    "%s: Command error response",
                    self.name,
                )
                continue
            if key == "TIME;VALUE":
                # ignore time parameter
                continue
            if self._data.get(key, INVALID_DATA) == value:
                # parameter has not changed, nothing to do
                continue
            self._data[key] = value  # update new key/value or changed value
            _LOGGER.debug("%s: Param updated: [%s]='%s'", self.name, key, value)
            if self.is_fan:
                if key == "WINTERMODE;STATE":
                    if not self._first_update.is_set():
                        self._first_update.set()
                        _LOGGER.debug("%s: First Update Complete", self.name)
            else:
                if key == "SNSROCC;TIMEOUT;MIN":
                    if not self._first_update.is_set():
                        self._first_update.set()
                        _LOGGER.debug("%s: First Update Complete", self.name)
            if self._first_update.is_set() and key not in SUPPRESS_CALLBACK_PARAMS:
                should_callback = True
            # update certain local variables that are not part of data
            if key == "FW;NAME":
                self._fw_name = value
            elif key == ("FW;" + self._fw_name):
                self._fw_version = value
            elif key == "DEVICE;LIGHT":
                if self._has_light is None:
                    value = value.upper()
                    self._has_light = value in ("PRESENT", "PRESENT;COLOR")
            elif key == "NW;TOKEN":
                self._uuid = value.lower()
            elif key == "NAME;VALUE":
                self._name = value
            elif key == "GROUP;LIST":
                self._room_name = value
            elif key == "GROUP;ROOM;TYPE":
                self._room_type = int(value)
            elif key == "DEVICE;ID":
                self._mac, self._base_model = value.split(";")
                if self.model in ["Haiku Fan", "Haiku Light"]:
                    self._has_sensor = True
                elif self.model == "Haiku L Fan":
                    # determined by "DEVICE;OPTION;SENSORS" below
                    self._has_sensor = None
                else:
                    self._has_sensor = False
            elif key == "DEVICE;OPTION;SENSORS":
                if self._has_sensor is None:
                    value = value.upper()
                    self._has_sensor = value == "PRESENT"
        return "", should_callback

    def _send_update(self):
        """Sends update commands to an already connected device."""
        self._send_command("DEVICE;ID;GET")
        self._send_command("SNSROCC;STATUS;GET")
        self._send_command("GETALL")
        _LOGGER.debug("%s: Status update", self.name)

    async def _updater(self):
        """Periodically update device parameters.

        This method is a coroutine.
        """
        while True:
            try:
                self._send_update()
                await asyncio.sleep(self.refresh_minutes * 60 + random.uniform(-10, 10))
            except asyncio.CancelledError:
                _LOGGER.debug("%s: Updater task cancelled", self.name)
                return
            except OSError:
                _LOGGER.debug(
                    "%s: Updater task error\n%s", self.name, traceback.format_exc()
                )
                await asyncio.sleep(self.refresh_minutes * 60 + random.uniform(-10, 10))
            except Exception:
                _LOGGER.error(
                    "%s: Unhandled updater task error\n%s",
                    self.name,
                    traceback.format_exc(),
                )
                await asyncio.sleep(10)
                raise

    async def _listener(self):
        """Task that listens for device status changes.

        Maintains an open socket to the device at all times.
        Lost connections are automatically reconnected.
        This method is a coroutine.
        """
        while True:
            try:
                if self._error_count > 10:
                    _LOGGER.error("%s: Listener task too many errors", self.name)
                    self._is_connected.clear()
                    self._updater_task.cancel()
                    if self._endpoint is not None:
                        self._endpoint.close()
                    self._endpoint = None
                    break
                if self._endpoint is None:
                    self._is_connected.clear()
                    self._endpoint = SensemeEndpoint()
                    try:
                        _LOGGER.debug("%s: Connecting", self.name)
                        await asyncio.get_running_loop().create_connection(
                            lambda: SensemeProtocol(self._name, self._endpoint),
                            self._address,
                            PORT,
                        )
                        _LOGGER.debug("%s: Creating Updater Task", self.name)
                        self._updater_task = asyncio.create_task(self._updater())
                        self._error_count = 0
                        self._is_connected.set()
                        if self._connection_lost:
                            _LOGGER.warning(
                                "%s: Connection to address %s restored",
                                self.name,
                                self.address,
                            )
                            self._connection_lost = False
                        else:
                            _LOGGER.debug(
                                "%s: Connection to address %s successful",
                                self.name,
                                self.address,
                            )
                    except OSError:
                        _LOGGER.debug(
                            "%s: Connect failed, try again in a minute\n%s",
                            self.name,
                            traceback.format_exc(),
                        )
                        self._endpoint = None
                        await asyncio.sleep(60)
                        continue
                try:
                    data = await asyncio.wait_for(
                        self._endpoint.receive(),
                        timeout=self.refresh_minutes * 60.0 + 30.0,
                    )
                except asyncio.TimeoutError:
                    self._endpoint.abort()
                    data = None
                    _LOGGER.debug("%s: Device has been quiet too long.", self.name)
                if data is None:
                    # endpoint is closed, let task know it's time open another
                    _LOGGER.warning(
                        "%s: Connection to address %s lost", self.name, self.address
                    )
                    self._data = dict()
                    self._is_connected.clear()
                    self._first_update.clear()
                    self._connection_lost = True
                    self._execute_callbacks()  # tell callbacks we disconnected
                    self._endpoint = None
                    self._updater_task.cancel()
                    await asyncio.sleep(1)
                    continue
                # add previous partial data to new data and process
                self._leftover, should_callback = self._process_message(
                    self._leftover + data
                )
                if should_callback:
                    self._execute_callbacks()
            except asyncio.CancelledError:
                _LOGGER.debug("%s: Listener task cancelled", self.name)
                return
            except OSError:
                _LOGGER.debug(
                    "%s: Listener task\n%s", self.name, traceback.format_exc()
                )
                self._error_count += 1
                await asyncio.sleep(1)
            except Exception:
                _LOGGER.error(
                    "%s: Listener task error\n%s", self.name, traceback.format_exc()
                )
                _LOGGER.error(
                    "%s: Listener task will now stop due to unexpected error", self.name
                )
                raise
        _LOGGER.error("%s: Listener task ended", self.name)

    def start(self):
        """Start the async task to handle responses from the device."""
        if not self._is_running:
            self._listener_task = asyncio.create_task(self._listener())
            self._is_running = True
            _LOGGER.debug("%s: Started", self.name)

    def stop(self):
        """Signals thread to stop and returns immediately."""
        if self._is_running is True:
            if self._listener_task is not None:
                self._listener_task.cancel()
            if self._updater_task is not None:
                self._updater_task.cancel()
            self._is_running = False


class SensemeFan(SensemeDevice):
    """SensemeFan Class."""

    def __str__(self) -> str:
        """Return string representation of SensemeFan object."""
        string = f"Name: {self._name}"
        if self._room_name is not None:
            string += f", Room Name: {self._room_name}"
        string += f", Model: {self.model}"
        string += f", UUID: {self._uuid}"
        string += f", IP: {self._address}"
        string += f", MAC: {self._mac}"
        if self._fw_version is not None:
            string += f", FW Version: {self._fw_version}"
        if self._has_light is not None:
            string += f", Has Light: {self._has_light}"
        return string

    @property
    def is_fan(self) -> str:
        """Return True if this device is a fan."""
        return True

    @property
    def has_light(self) -> bool:
        """Return True if the fan has an installed light."""
        return self._has_light

    @property
    def fan_on(self) -> bool:
        """Return True when fan is on at any speed."""
        state = self._data.get("FAN;PWR", None)
        if state:
            return state == "ON"
        return None

    @fan_on.setter
    def fan_on(self, state: bool):
        """Set the fan power state."""
        state = "ON" if state else "OFF"
        self._send_command(f"FAN;PWR;{state}")

    def _normalize_fan_speed(self, speed: int) -> int:
        normalized_speed = speed

        if speed < self.fan_speed_min:
            normalized_speed = 0
        elif speed > self.fan_speed_max:
            normalized_speed = self.fan_speed_max

        return normalized_speed

    @property
    def fan_speed(self) -> int:
        """Return the fan speed."""
        speed = self._data.get("FAN;SPD;ACTUAL", None)
        if speed:
            return int(speed)
        return None

    @fan_speed.setter
    def fan_speed(self, speed: int):
        """Set the fan speed."""
        self._send_command(f"FAN;SPD;SET;{self._normalize_fan_speed(speed)}")

    @property
    def fan_speed_min(self) -> int:
        """Return the fan speed minimum."""
        min_speed = self._data.get("FAN;SPD;MIN", None)
        if min_speed:
            return int(min_speed)
        return None

    @property
    def fan_speed_max(self) -> int:
        """Return the fan speed maximum."""
        max_speed = self._data.get("FAN;SPD;MAX", None)
        if max_speed:
            return int(max_speed)
        return None

    @property
    def fan_speed_limits(self) -> Tuple:
        """Return a tuple of the min/max fan speeds."""
        return self.fan_speed_min, self.fan_speed_max

    @property
    def fan_speed_limits_room(self) -> Tuple:
        """Return a tuple of the min/max fan speeds the room is configured to support.

        A room can limit the minimum/maximum fan speed while keeping the same number of
        speed settings. On the Haiku by BAF application this setting can be found by
        clicking the room info button. There must be at least one fan added to a room.
        """
        raw = self._data.get("FAN;BOOKENDS", None)
        if raw is None:
            return None
        values = raw.split(";")
        if len(values) != 2:
            return None
        min_speed = int(values[0])
        max_speed = int(values[1])
        return min_speed, max_speed

    @fan_speed_limits_room.setter
    def fan_speed_limits_room(self, speeds: Tuple):
        """Set a tuple of the min/max fan speeds the room is configured to support."""
        if speeds[0] >= speeds[1]:
            _LOGGER.error("Min speed cannot exceed max speed")
            return
        self._send_command(f"FAN;BOOKENDS;SET;{speeds[0]};{speeds[1]}")

    @property
    def fan_dir(self) -> str:
        """Return the fan direction."""
        return self._data.get("FAN;DIR", None)

    @fan_dir.setter
    def fan_dir(self, direction: str):
        """Set the fan direction."""
        if direction not in DIRECTIONS:
            raise ValueError(
                f"{direction} is not a valid direction. Must be one of {DIRECTIONS}"
            )
        self._send_command(f"FAN;DIR;SET;{direction}")

    @property
    def fan_whoosh_mode(self) -> bool:
        """Return True when fan whoosh mode is on."""
        state = self._data.get("FAN;WHOOSH;STATUS", None)
        if state:
            return state == "ON"
        return None

    @fan_whoosh_mode.setter
    def fan_whoosh_mode(self, state: bool):
        """Set the fan whoosh mode."""
        value = "ON" if state else "OFF"
        self._send_command(f"FAN;WHOOSH;{value}")

    @property
    def fan_autocomfort(self) -> str:
        """Get the auto comfort mode from the fan.

        'OFF' no automatic adjustment,
        'COOLING' increases fan speed as temp increases,
        'HEATING' means slow mixing of air while room is occupied and faster mix speeds
        while room is not occupied.
        'FOLLOWTSTAT' means change between 'COOLING' and 'HEATING based on thermostat.
        """
        return self._data.get("SMARTMODE;STATE", None)

    @fan_autocomfort.setter
    def fan_autocomfort(self, state: str):
        """Set the fan auto comfort mode.

        'OFF' no automatic adjustment.
        'COOLING' increases fan speed as temp increases.
        'HEATING' means slow mixing of air while room is occupied and faster mix speeds
        while room is not occupied.
        'FOLLOWTSTAT' means change between 'COOLING' and 'HEATING based on thermostat.
        """
        value = "ON" if state else "OFF"
        self._send_command(f"SMARTMODE;STATE;SET;{value}")

    @property
    def fan_smartmode(self) -> str:
        """Get the current smart mode from the fan.

        'OFF' no automatic adjustment.
        'COOLING' increases fan speed as temp increases.
        'HEATING' means slow mixing of air while room is occupied and faster mix speeds
                  while room is not occupied.
        """
        return self._data.get("SMARTMODE;ACTUAL", None)

    @fan_smartmode.setter
    def fan_smartmode(self, mode: str):
        """Set the fan auto comfort mode.

        'OFF' no automatic adjustment.
        'COOLING' increases fan speed as temp increases.
        'HEATING' means slow mixing of air while room is occupied and faster mix speeds
        while room is not occupied.
        'FOLLOWTSTAT' means change between 'COOLING' and 'HEATING based on thermostat.
        """
        if mode not in AUTOCOMFORTS:
            raise ValueError(f"Mode '{mode}' not supported")
        self._send_command(f"SMARTMODE;STATE;SET;{mode}")

    @property
    def fan_cooltemp(self) -> float:
        """Return the auto shutoff temperature for 'COOLING' smart mode in Celsius."""
        temp = int(self._data.get("LEARN;ZEROTEMP", None))
        if temp:
            return float(temp) / 100.0
        return None

    @fan_cooltemp.setter
    def fan_cooltemp(self, temp: float):
        """Set the auto shutoff temperature for 'COOLING' smart mode in Celsius."""
        # force temperature into range
        if temp < 10:
            temp = 10
        elif temp > 31.5:
            temp = 31.5
        temp = int(round(temp * 100))
        self._send_command(f"LEARN;ZEROTEMP;SET;{temp}")

    @property
    def fan_coolminspeed(self) -> int:
        """Return the min speed of smart cooling mode"""
        return int(self._data.get("LEARN;MINSPEED", None))

    @fan_coolminspeed.setter
    def fan_coolminspeed(self, speed: int):
        """Set the min fan speed for 'COOLING' smart mode."""
        self._send_command(f"LEARN;MINSPEED;SET;{self._normalize_fan_speed(speed)}")

    @property
    def fan_coolmaxspeed(self) -> int:
        """Return the max speed of smart cooling mode"""
        return int(self._data.get("LEARN;MAXSPEED", None))

    @fan_coolmaxspeed.setter
    def fan_coolmaxspeed(self, speed: int):
        """Set the max fan speed for 'COOLING' smart mode."""
        self._send_command(f"LEARN;MAXSPEED;SET;{self._normalize_fan_speed(speed)}")

    @property
    def motion_fan_auto(self) -> bool:
        """Return True when fan is in automatic on with motion mode."""
        state = self._data.get("FAN;AUTO", None)
        if state:
            return state == "ON"
        return None

    @motion_fan_auto.setter
    def motion_fan_auto(self, state: bool):
        """Set the fan automatic on with motion mode."""
        state = "ON" if state else "OFF"
        self._send_command(f"FAN;AUTO;{state}")


class SensemeLight(SensemeDevice):
    """SensemeLight Class."""

    def __str__(self) -> str:
        """Return string representation of SensemeLight object."""
        string = f"Name: {self._name}"
        if self._room_name is not None:
            string += f", Room Name: {self._room_name}"
        string += f", Model: {self.model}"
        string += f", UUID: {self._uuid}"
        string += f", IP: {self._address}"
        string += f", MAC: {self._mac}"
        if self._fw_version is not None:
            string += f", FW Version: {self._fw_version}"
        return string

    @property
    def is_light(self) -> str:
        """Return True if the device is a standalone light."""
        return True

    @property
    def has_light(self) -> bool:
        """Return True if the fan has an installed light."""
        return True

    @property
    def light_color_temp(self) -> int:
        """Return the light color temperature."""
        color_temp = self._data.get("LIGHT;COLOR;TEMP;VALUE", None)
        if color_temp:
            return int(color_temp)
        return None

    @light_color_temp.setter
    def light_color_temp(self, color_temp: int):
        """Set the light color temperature."""
        if color_temp < self.light_color_temp_min:
            color_temp = self.light_color_temp_min
        if color_temp > self.light_color_temp_max:
            color_temp = self.light_color_temp_max
        color_temp = int(round(color_temp / 100.0)) * 100
        self._send_command(f"LIGHT;COLOR;TEMP;VALUE;SET;{color_temp}")

    @property
    def light_color_temp_min(self) -> int:
        """Return the light color temperature minimum (warmest light)."""
        min_color_temp = self._data.get("LIGHT;COLOR;TEMP;MIN", None)
        if min_color_temp:
            return int(min_color_temp)
        return None

    @property
    def light_color_temp_max(self) -> int:
        """Return the light color temperature maximum (coolest light)."""
        max_color_temp = self._data.get("LIGHT;COLOR;TEMP;MAX", None)
        if max_color_temp:
            return int(max_color_temp)
        return None
