import logging

from homeassistant.components.light import LightEntity

from .. import aerogarden

_LOGGER = logging.getLogger(__name__)

DEPENDENCIES = ["aerogarden"]

# since the light state seems to be unreliable on AeroGarden's servers,
# we will only update the state on HA startup, and then rely on HA's "assumed state"
UPDATE_STATE_FROM_CLOUD = True


class AerogardenLight(LightEntity):
    def __init__(self, macaddr, aerogarden_api, field="lightStat", label="Light"):
        self._aerogarden = aerogarden_api
        self._macaddr = macaddr
        self._field = field
        self._label = label
        if not label:
            self._label = field
        self._garden_name = self._aerogarden.garden_name(self._macaddr)
        self._name = "%s %s" % (
            self._garden_name,
            self._label,
        )
        self._state = 1
        # force update state using cloud
        self.update(use_cloud=True)

    @property
    def name(self):
        return self._name

    @property
    def is_on(self):
        if self._state == 1:
            return True
        return False

    def turn_on(self, **kwargs):
        """Toggles once, to go from Off to Bright."""
        self._aerogarden.light_toggle(self._macaddr)
        self._state = 1

    def turn_off(self, **kwargs):
        """Toggles twice, to go from Bright to Dimmed to Off."""
        self._aerogarden.light_toggle(self._macaddr)
        self._aerogarden.light_toggle(self._macaddr)
        self._state = 0

    def update(self, use_cloud=UPDATE_STATE_FROM_CLOUD):
        if use_cloud:
            self._aerogarden.update()
            self._state = self._aerogarden.garden_property(self._macaddr, "lightStat")
        _LOGGER.debug(f"current lightStat: {self._state}")


def setup_platform(hass, config, add_devices, discovery_info=None):
    """ Setup the aerogarden platform """
    ag = hass.data[aerogarden.DATA_AEROGARDEN]
    lights = []
    for garden in ag.gardens:
        lights.append(AerogardenLight(garden, ag))
    add_devices(lights)
