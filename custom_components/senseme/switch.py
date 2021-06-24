"""Support for Big Ass Fans SenseME switch."""
from typing import Any

from aiosenseme import SensemeFan
from homeassistant.components.switch import DEVICE_CLASS_SWITCH, SwitchEntity
from homeassistant.const import CONF_DEVICE

from . import SensemeEntity
from .const import DOMAIN

FAN_SWITCHS = [
    # Turning on sleep mode will disable Whoosh
    ["sleep_mode", "sleep_mode", "Sleep Mode"],
    ["motion_fan_auto", "motion_fan_auto", "Motion"],
]

FAN_LIGHT_SWITCHES = [
    ["motion_light_auto", "motion_light_auto", "Light Motion"],
]

LIGHT_SWITCHES = [
    ["sleep_mode", "sleep_mode", "Sleep Mode"],
    ["motion_light_auto", "motion_light_auto", "Motion"],
]


async def async_setup_entry(hass, entry, async_add_entities):
    """Set up SenseME fans."""
    device = hass.data[DOMAIN][entry.entry_id][CONF_DEVICE]

    if device.is_fan:
        async_add_entities([HASensemeSwitch(device, *args) for args in FAN_SWITCHS])
        if device.has_light:
            async_add_entities(
                [HASensemeSwitch(device, *args) for args in FAN_LIGHT_SWITCHES]
            )
    elif device.is_light:
        async_add_entities([HASensemeSwitch(device, *args) for args in LIGHT_SWITCHES])


class HASensemeSwitch(SensemeEntity, SwitchEntity):
    """SenseME switch component."""

    def __init__(
        self, device: SensemeFan, switch_type: str, attr: str, switch_name: str
    ) -> None:
        """Initialize the entity."""
        self._attr = attr
        self._switch_type = switch_type
        super().__init__(device, f"{device.name} {switch_name}")

    @property
    def device_class(self):
        """Return an device class for this switch."""
        return DEVICE_CLASS_SWITCH

    @property
    def unique_id(self):
        """Return a unique identifier for this fan switch."""
        return f"{self._device.uuid}-SWITCH-{self._switch_type}"

    @property
    def is_on(self) -> bool:
        """Return true if the switch is on."""
        return getattr(self._device, self._attr)

    async def async_turn_on(self, **kwargs: Any):
        """Turn on the switch."""
        setattr(self._device, self._attr, True)

    async def async_turn_off(self, **kwargs: Any):
        """Turn off the switch."""
        setattr(self._device, self._attr, False)
