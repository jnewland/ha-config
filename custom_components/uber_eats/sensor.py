"""Uber Eats sensors"""
from datetime import datetime, timedelta

import logging
import voluptuous as vol

import homeassistant.helpers.config_validation as cv
from homeassistant.components.sensor import PLATFORM_SCHEMA
from homeassistant.const import CONF_TOKEN
from homeassistant.helpers.entity import Entity

from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.typing import ConfigType, DiscoveryInfoType

from .api import UberEatsApi

from .const import (
    DOMAIN,
    SENSOR_NAME
)

NAME = DOMAIN
ISSUEURL = "https://github.com/codyc1515/hacs_uber_eats/issues"

STARTUP = f"""
-------------------------------------------------------------------
{NAME}
This is a custom component
If you have any issues with this you need to open an issue here:
{ISSUEURL}
-------------------------------------------------------------------
"""

_LOGGER = logging.getLogger(__name__)

PLATFORM_SCHEMA = PLATFORM_SCHEMA.extend({
    vol.Required(CONF_TOKEN): cv.string,
})

SCAN_INTERVAL = timedelta(seconds=60)

async def async_setup_platform(hass, config, async_add_entities,
                               discovery_info=None):
    token = config.get(CONF_TOKEN)
    
    api = UberEatsApi(token)

    _LOGGER.debug('Setting up sensor(s)...')

    sensors = []
    sensors .append(UberEatsDeliveriesSensor(SENSOR_NAME, api))
    async_add_entities(sensors, True)

class UberEatsDeliveriesSensor(Entity):
    def __init__(self, name, api):
        self._name = name
        self._icon = "mdi:truck-delivery"
        self._state = ""
        self._state_attributes = {}
        self._unit_of_measurement = None
        self._device_class = "running"
        self._unique_id = DOMAIN
        self._api = api

    @property
    def name(self):
        """Return the name of the sensor."""
        return self._name

    @property
    def icon(self):
        """Icon to use in the frontend, if any."""
        return self._icon

    @property
    def state(self):
        """Return the state of the device."""
        return self._state

    @property
    def extra_state_attributes(self):
        """Return the state attributes of the sensor."""
        return self._state_attributes

    @property
    def unit_of_measurement(self):
        """Return the unit of measurement."""
        return self._unit_of_measurement

    @property
    def unique_id(self):
        """Return the unique id."""
        return self._unique_id
    
    def update(self):
        _LOGGER.debug('Checking login validity')
        if self._api.check_auth():
            _LOGGER.debug('Fetching deliveries')
            response = self._api.get_deliveries()
            if response['data']['orders']:
                _LOGGER.debug(response['data']['orders'])
                for order in response['data']['orders']:
                    if order['feedCards'][0]['status']['currentProgress'] == 1:
                        self._state = "Preparing your order"
                    elif order['feedCards'][0]['status']['currentProgress'] == 2:
                        self._state = "Preparing your order"
                    elif order['feedCards'][0]['status']['currentProgress'] == 3:
                        self._state = "Heading your way"
                    elif order['feedCards'][0]['status']['currentProgress'] == 4:
                        self._state = "Almost here"
                    else:
                        self._state = "Unknown currentProgress (" + str(order['feedCards'][0]['status']['currentProgress']) + ")"
                    
                    #self._state_attributes['Order Id'] = order['uuid']
                    self._state_attributes['ETA'] = order['feedCards'][0]['status']['title']
                    self._state_attributes['Order Status Description'] = order['feedCards'][0]['status']['timelineSummary']
                    self._state_attributes['Order Status'] = order['feedCards'][0]['status']['currentProgress']
                    self._state_attributes['Restaurant Name'] = order['activeOrderOverview']['title']
                    self._state_attributes['Courier Name'] = order['contacts'][0]['title']
                    
                    if order['feedCards'][1]['mapEntity']:
                        if order['feedCards'][1]['mapEntity'][0]:
                            self._state_attributes['Courier Location'] = str(order['feedCards'][1]['mapEntity'][0]['latitude']) + ',' + str(order['feedCards'][1]['mapEntity'][0]['longitude'])
            else:
                self._state = "None"
        else:
            _LOGGER.error('Unable to log in')
