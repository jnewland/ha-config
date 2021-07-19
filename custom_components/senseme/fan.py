"""Support for Big Ass Fans SenseME fan."""
import math
from typing import Any, List, Optional

import voluptuous as vol
from aiosenseme import SensemeFan
from homeassistant.components.fan import (
    DIRECTION_FORWARD,
    DIRECTION_REVERSE,
    SUPPORT_DIRECTION,
    SUPPORT_SET_SPEED,
    FanEntity,
)
from homeassistant.const import CONF_DEVICE
from homeassistant.util.percentage import (
    percentage_to_ranged_value,
    ranged_value_to_percentage,
)
from homeassistant.util.temperature import convert, TEMP_CELSIUS
from homeassistant.helpers import config_validation as cv, entity_platform, service

from . import SensemeEntity
from .const import (
    DOMAIN,
    PRESET_MODE_WHOOSH,
    SENSEME_DIRECTION_FORWARD,
    SENSEME_DIRECTION_REVERSE,
)


async def async_setup_entry(hass, entry, async_add_entities):
    """Set up SenseME fans."""
    platform = entity_platform.current_platform.get()
    device = hass.data[DOMAIN][entry.entry_id][CONF_DEVICE]
    if device.is_fan:
        async_add_entities([HASensemeFan(device)])

        platform.async_register_entity_service(
            "smart_mode",
            {
                vol.Required("auto_comfort"): cv.string,
                vol.Optional("cool_temp"): cv.positive_float,
                vol.Optional("cool_min_speed"): cv.positive_int,
                vol.Optional("cool_max_speed"): cv.positive_int,
            },
            "async_set_smart_mode",
        )


class HASensemeFan(SensemeEntity, FanEntity):
    """SenseME ceiling fan component."""

    def __init__(self, device: SensemeFan) -> None:
        """Initialize the entity."""
        super().__init__(device, device.name)

    @property
    def unique_id(self):
        """Return a unique identifier for this fan."""
        return f"{self._device.uuid}-FAN"

    @property
    def device_state_attributes(self) -> dict:
        """Get the current device state attributes."""
        return {
            "auto_comfort": self._device.fan_autocomfort.capitalize(),
            "smartmode": self._device.fan_smartmode.capitalize(),
            **super().device_state_attributes,
        }

    @property
    def is_on(self) -> bool:
        """Return true if the fan is on."""
        return self._device.fan_on

    @property
    def current_direction(self) -> str:
        """Return the fan direction."""
        if self._device.fan_dir == SENSEME_DIRECTION_FORWARD:
            return DIRECTION_FORWARD
        return DIRECTION_REVERSE

    @property
    def supported_features(self) -> int:
        """Flag supported features."""
        return SUPPORT_SET_SPEED | SUPPORT_DIRECTION

    @property
    def speed_count(self) -> int:
        """Return the number of speeds."""
        return self._device.fan_speed_max

    @property
    def percentage(self) -> str:
        """Return the current speed."""
        return ranged_value_to_percentage(
            self._device.fan_speed_limits, self._device.fan_speed
        )

    @property
    def preset_mode(self) -> Optional[str]:
        """Return the current preset mode."""
        if self._device.fan_whoosh_mode:
            return PRESET_MODE_WHOOSH
        return None

    @property
    def preset_modes(self) -> Optional[List[str]]:
        """Return a list of available preset modes."""
        return [PRESET_MODE_WHOOSH]

    async def async_set_percentage(self, percentage: int) -> None:
        """Set the speed of the fan, as a percentage."""
        self._device.fan_speed = math.ceil(
            percentage_to_ranged_value(self._device.fan_speed_limits, percentage)
        )

    async def async_turn_on(
        self,
        speed: Optional[str] = None,
        percentage: Optional[int] = None,
        preset_mode: Optional[str] = None,
        **kwargs: Any,
    ) -> None:
        """Turn the fan on with speed control."""
        if preset_mode is not None:
            await self.async_set_preset_mode(preset_mode)
            if preset_mode == PRESET_MODE_WHOOSH:
                self._device.sleep_mode = True
                return
        if percentage is None:
            self._device.fan_on = True
            return
        await self.async_set_percentage(percentage)

    async def async_turn_off(self, **kwargs: Any) -> None:
        """Turn the fan off."""
        self._device.fan_on = False

    async def async_set_preset_mode(self, preset_mode: str) -> None:
        """Set the preset mode of the fan."""
        if preset_mode == PRESET_MODE_WHOOSH:
            # Sleep mode must be off for Whoosh to work.
            if self._device.sleep_mode:
                self._device.sleep_mode = False
            self._device.fan_whoosh_mode = True
            return
        raise ValueError(f"Invalid preset mode: {preset_mode}")

    async def async_set_direction(self, direction: str) -> None:
        """Set the direction of the fan."""
        if direction == DIRECTION_FORWARD:
            self._device.fan_dir = SENSEME_DIRECTION_FORWARD
        else:
            self._device.fan_dir = SENSEME_DIRECTION_REVERSE

    async def async_set_smart_mode(
        self,
        auto_comfort: str = None,
        cool_temp: float = None,
        cool_min_speed: int = None,
        cool_max_speed: int = None,
    ) -> None:
        """Configure smart_mode settings"""
        if auto_comfort is not None:
            self._device.fan_smartmode = auto_comfort.upper()

        if cool_temp is not None:
            self._device.fan_cooltemp = convert(
                cool_temp,
                self.hass.config.units.temperature_unit,
                TEMP_CELSIUS,
            )

        if cool_min_speed is not None:
            self._device.fan_coolminspeed = cool_min_speed

        if cool_max_speed is not None:
            self._device.fan_coolmaxspeed = cool_max_speed
