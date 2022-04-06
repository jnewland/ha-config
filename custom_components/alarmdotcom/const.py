"""Const for the Alarmdotcom integration."""
from __future__ import annotations

from collections.abc import Callable
from enum import Enum
from typing import TypedDict

from pyalarmdotcomajax.const import ADCSensorSubtype
from typing_extensions import NotRequired

INTEGRATION_NAME = "Alarm.com"
DOMAIN = "alarmdotcom"
ISSUE_URL = ""
STARTUP_MESSAGE = f"""
===================================================================
{DOMAIN}
This is a custom component
If you have any issues with this you need to open an issue here:
{ISSUE_URL}
===================================================================
"""

STATE_MALFUNCTION = "Malfunction"

# ADC Binary Sensor Types
ADC_BINARY_TYPE_UNKNOWN = "generic_sensor"
ADC_BINARY_TYPE_CONTACT = "contact_sensor"
ADC_BINARY_TYPE_SMOKE = "smoke_sensor"
ADC_BINARY_TYPE_CO = "co_sensor"
ADC_BINARY_TYPE_PANIC = "panic_sensor"
ADC_BINARY_TYPE_GLASS = "glass_sensor"

MIGRATE_MSG_ALERT = (
    "The Alarm.com integration is now configured exclusively via Home Assistant's"
    " integrations page. Please delete the Alarm.com entry from configuration.yaml."
    " Your existing settings have already been migrated."
)

# #
# CONFIGURATION
# #

# Configuration
CONF_USERNAME = "username"
CONF_PASSWORD = "password"  # nosec
CONF_2FA_COOKIE = "2fa_cookie"
CONF_OTP = "otp"

CONF_ARM_CODE = "arm_code"
CONF_UPDATE_INTERVAL = "update_interval"
CONF_ARM_HOME = "arm_home_options"
CONF_ARM_AWAY = "arm_away_options"
CONF_ARM_NIGHT = "arm_night_options"

CONF_UPDATE_INTERVAL_DEFAULT = 60
CONF_ARM_MODE_OPTIONS = {
    "bypass": "Force Bypass",
    "silent": "Arm Silently",
    "delay": "Arming Delay",
}
CONF_ARM_MODE_OPTIONS_DEFAULT = ["delay"]

SENSOR_SUBTYPE_BLACKLIST = [
    ADCSensorSubtype.MOBILE_PHONE,  # No purpose
    ADCSensorSubtype.MOTION_SENSOR,  # Not reliable with polling
    ADCSensorSubtype.PANEL_MOTION_SENSOR,  # Not reliable with polling
    ADCSensorSubtype.PANEL_IMAGE_SENSOR,  # No support yet
]


# #
# Device States
# #


class ADCIPartitionState(Enum):
    """Enum of arming states."""

    UNKNOWN = "UNKNOWN"
    DISARMED = "DISARMED"
    ARMED_STAY = "ARMED_STAY"
    ARMED_AWAY = "ARMED_AWAY"
    ARMED_NIGHT = "ARMED_NIGHT"


class ADCILockState(Enum):
    """Enum of lock states."""

    FAILED = "FAILED"
    LOCKED = "LOCKED"
    UNLOCKED = "UNLOCKED"


class ADCILightState(Enum):
    """Enum of light states."""

    ON = "ON"
    OFF = "OFF"


class ADCISensorState(Enum):
    """Enum of sensor states."""

    UNKNOWN = "UNKNOWN"
    CLOSED = "CLOSED"
    OPEN = "OPEN"
    IDLE = "IDLE"
    ACTIVE = "ACTIVE"
    DRY = "DRY"
    WET = "WET"


class ADCIGarageDoorState(Enum):
    """Enum of garage door states."""

    OPEN = "OPEN"
    CLOSED = "CLOSED"


# #
# Device Data Dictionaries
# #


class ADCIBaseEntity(TypedDict):
    """Base dict for an ADCI entity."""

    unique_id: str
    name: str
    identifiers: NotRequired[list]
    battery_low: NotRequired[bool]
    malfunction: NotRequired[bool]
    mac_address: NotRequired[str]


class ADCISystemData(ADCIBaseEntity):
    """Dict for an ADCI system."""

    unit_id: str


class ADCIPartitionData(ADCIBaseEntity):
    """Dict for an ADCI partition."""

    make_and_model: NotRequired[dict]
    uncleared_issues: bool
    desired_state: Enum
    raw_state_text: str
    system_id: NotRequired[str]
    state: ADCIPartitionState
    parent_id: str

    async_disarm_callback: Callable
    async_arm_home_callback: Callable
    async_arm_away_callback: Callable
    async_arm_night_callback: Callable


class ADCISensorData(ADCIBaseEntity):
    """Dict for an ADCI sensor."""

    make_and_model: NotRequired[dict]
    device_subtype: NotRequired[Enum]
    partition_id: NotRequired[str]
    raw_state_text: NotRequired[str]
    state: ADCISensorState | bool | None
    parent_id: str


class ADCILockData(ADCIBaseEntity):
    """Dict for an ADCI Lock."""

    make_and_model: NotRequired[dict]
    desired_state: Enum
    raw_state_text: str
    state: ADCILockState
    parent_id: str

    async_lock_callback: Callable
    async_unlock_callback: Callable


class ADCILightData(ADCIBaseEntity):
    """Dict for an ADCI Light."""

    brightness: int | None
    make_and_model: NotRequired[dict]
    desired_state: Enum
    raw_state_text: str
    state: ADCILightState
    parent_id: str
    async_turn_on_callback: Callable
    async_turn_off_callback: Callable


class ADCIGarageDoorData(ADCIBaseEntity):
    """Dict for an ADCI garage door."""

    make_and_model: NotRequired[dict]
    desired_state: Enum
    raw_state_text: str
    state: ADCIGarageDoorState
    async_open_callback: Callable
    async_close_callback: Callable
    parent_id: str


class ADCIEntities(TypedDict):
    """Hold all sensors, panels, etc. belonging to a controller."""

    entity_data: dict[
        str,
        ADCIGarageDoorData
        | ADCISystemData
        | ADCISensorData
        | ADCILockData
        | ADCILightData
        | ADCIPartitionData,
    ]
    system_ids: set[str]
    partition_ids: set[str]
    sensor_ids: set[str]
    lock_ids: set[str]
    light_ids: set[str]
    garage_door_ids: set[str]
    low_battery_ids: set[str]
    malfunction_ids: set[str]


class ADCIDevices:
    """Define device-related constants."""
