import logging


from homeassistant.components.binary_sensor import BinarySensorEntity

from .. import aerogarden

_LOGGER = logging.getLogger(__name__)

DEPENDENCIES = ["aerogarden"]


class AerogardenBinarySensor(BinarySensorEntity):
    def __init__(self, macaddr, aerogarden_api, field, label=None, icon=None):

        self._aerogarden = aerogarden_api
        self._macaddr = macaddr
        self._field = field
        self._label = label
        if not label:
            self._label = field
        self._icon = icon

        self._garden_name = self._aerogarden.garden_name(self._macaddr)

        self._name = "%s %s" % (
            self._garden_name,
            self._label,
        )
        self._state = self._aerogarden.garden_property(self._macaddr, self._field)

    @property
    def name(self):
        return self._name

    @property
    def is_on(self):
        if self._state == 1:
            return True
        return False

    @property
    def icon(self):
        return self._icon

    def update(self):
        self._aerogarden.update()
        self._state = self._aerogarden.garden_property(self._macaddr, self._field)


def setup_platform(hass, config, add_entities, discovery_info=None):

    ag = hass.data[aerogarden.DATA_AEROGARDEN]

    sensors = []
    sensor_fields = {
        #        "lightStat" : {
        #            "label" : "light",
        #            "icon" : "mdi:lightbulb"
        #        },
        "pumpStat": {
            "label": "Pump",
            "icon": "mdi:water-pump",
        },
        "nutriStatus": {
            "label": "Needs Nutrients",
            "icon": "mdi:cup-water",
        },
        "pumpHydro": {
            "label": "Needs Water",
            "icon": "mdi:water",
        },
    }

    for garden in ag.gardens:

        for field in sensor_fields.keys():
            s = sensor_fields[field]
            sensors.append(
                AerogardenBinarySensor(
                    garden, ag, field, label=s["label"], icon=s["icon"]
                )
            )

    add_entities(sensors)
