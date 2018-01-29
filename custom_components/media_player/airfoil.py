"""
Support for interfacing with Airfoil API.

For more details about this platform, please refer to the documentation at
https://home-assistant.io/components/media_player.airfoil-api/
"""
import logging

import requests
import voluptuous as vol

from homeassistant.components.media_player import (
    SUPPORT_TURN_OFF, SUPPORT_TURN_ON, SUPPORT_VOLUME_SET,
    SUPPORT_PREVIOUS_TRACK, SUPPORT_NEXT_TRACK, SUPPORT_PLAY, SUPPORT_PAUSE,
    MEDIA_TYPE_MUSIC,
    PLATFORM_SCHEMA, MediaPlayerDevice)
from homeassistant.const import (
    STATE_OFF, STATE_ON, STATE_PLAYING, STATE_PAUSED, STATE_IDLE,
    CONF_NAME, CONF_HOST, CONF_PORT, CONF_SSL)
import homeassistant.helpers.config_validation as cv

_LOGGER = logging.getLogger(__name__)

DEFAULT_NAME = 'Airfoil speakers'
DEFAULT_PORT = 8080
DEFAULT_TIMEOUT = 3
DEFAULT_SSL = False
DOMAIN = 'airfoil'
DEFAULT_HEADERS = {'content-type': 'text/plain'}

SUPPORT_AIRFOIL_SPEAKER = SUPPORT_VOLUME_SET | SUPPORT_TURN_ON | \
    SUPPORT_TURN_OFF
SUPPORT_AIRFOIL_SATELLITE = SUPPORT_PLAY | SUPPORT_PAUSE | \
    SUPPORT_PREVIOUS_TRACK | SUPPORT_NEXT_TRACK

PLATFORM_SCHEMA = PLATFORM_SCHEMA.extend({
    vol.Required(CONF_HOST): cv.string,
    vol.Optional(CONF_NAME, default=DEFAULT_NAME): cv.string,
    vol.Optional(CONF_PORT, default=DEFAULT_PORT): cv.port,
    vol.Optional(CONF_SSL, default=DEFAULT_SSL): cv.boolean,
})


class AirfoilClient(object):
    """The Airfoil API client."""

    def __init__(self, host, port, use_ssl):
        """Initialize the Airfoil device."""
        self.host = host
        self.port = port
        self.use_ssl = use_ssl

    @property
    def _base_url(self):
        """Return the base url for endpoints."""
        if self.use_ssl:
            uri_scheme = 'https://'
        else:
            uri_scheme = 'http://'

        if self.port:
            return '{}{}:{}'.format(uri_scheme, self.host, self.port)
        else:
            return '{}{}'.format(uri_scheme, self.host)

    def _request(self, method, path, params=None):
        """Make the actual request and return the parsed response."""
        url = '{}{}'.format(self._base_url, path)

        if method == 'GET':
            response = requests.get(url, timeout=DEFAULT_TIMEOUT)
        elif method == 'POST':
            response = requests.post(url, params, timeout=DEFAULT_TIMEOUT,
                                     headers=DEFAULT_HEADERS)

        return response.json()

    def speakers(self):
        """Return a list of speakers."""
        return self._request('GET', '/speakers')

    def toggle_speaker(self, device_id, toggle):
        """Toggle speaker device on or off, id, toggle True or False."""
        command = 'connect' if toggle else 'disconnect'
        path = '/speakers/' + device_id + '/' + command
        return self._request('POST', path)

    def set_volume_speaker(self, device_id, volume):
        """Set volume, returns current state of device."""
        path = '/speakers/' + device_id + '/volume'
        return self._request('POST', path, volume)

    def now_playing(self):
        """Return info about what's playing."""
        return self._request('GET', '/now_playing')

    def next(self):
        """Next track."""
        return self._request('POST', "/next")

    def previous(self):
        """Previous track."""
        return self._request('POST', "/previous")

    def playpause(self):
        """Play/pause."""
        return self._request('POST', "/playpause")


def setup_platform(hass, config, add_devices, discovery_info=None):
    """Set up the Airfoil platform."""
    add_devices([
        Airfoil(
            config.get(CONF_NAME),
            config.get(CONF_HOST),
            config.get(CONF_PORT),
            config.get(CONF_SSL),
            add_devices)])


class Airfoil(MediaPlayerDevice):
    """Representation of an Airfoil API instance."""

    def __init__(self, name, host, port, use_ssl, add_devices):
        """Initialize the Airfoil device."""
        self._name = name
        self._host = host
        self._port = port
        self._use_ssl = use_ssl
        self._client = AirfoilClient(self._host, self._port, self._use_ssl)
        self._add_devices = add_devices
        self._speakers = {}
        self._connected = False
        self._playing = False
        self._artist = None
        self._album = None
        self._track = None

    @property
    def client(self):
        """An Airfoil API client."""
        return self._client

    def update(self):
        """Poll airfoil-api."""
        now_playing = self.client.now_playing()
        self.update_state(now_playing)

        new_devices = []

        for device_data in self.client.speakers():

            device_id = device_data.get('id')

            if self._speakers.get(device_id):
                # update it
                speaker = self._speakers.get(device_id)
                speaker.update_state(device_data)
            else:
                # add it
                speaker = AirfoilSpeakerDevice(device_data, self)
                speaker.update_state(device_data)
                self._speakers[device_id] = speaker
                new_devices.append(speaker)

        if new_devices:
            self._add_devices(new_devices)

    def update_state(self, state_hash):
        """Update all the state properties with the passed in dictionary."""
        if 'error' in state_hash:
            _LOGGER.error("airfoil-api error: %s", state_hash)
            self._connected = False

        if 'playing' in state_hash:
            self._connected = True
            self._playing = state_hash.get('playing')

        self._artist = state_hash.get('artist', None)
        self._album = state_hash.get('album', None)
        self._track = state_hash.get('track', None)

    @property
    def name(self):
        """Return the name of the device."""
        return self._name

    @property
    def icon(self):
        """Return the icon to use in the frontend, if any."""
        if self._playing is True:
            return 'mdi:volume-high'
        else:
            return 'mdi:volume-off'

    @property
    def state(self):
        """Return the state of the device."""
        if self._connected:
            if self._playing:
                return STATE_PLAYING
            else:
                return STATE_PAUSED
        else:
            return STATE_IDLE

    @property
    def media_content_type(self):
        """Content type of current playing media."""
        return MEDIA_TYPE_MUSIC

    @property
    def media_title(self):
        """Title of current playing media."""
        return self._track

    @property
    def media_artist(self):
        """Artist of current playing media (Music track only)."""
        return self._artist

    @property
    def media_album_name(self):
        """Album of current playing media (Music track only)."""
        return self._album

    def media_play_pause(self):
        """Send play_pause command to media player."""
        self.client.playpause()
        self.update()

    def media_next_track(self):
        """Send media_next command to media player."""
        self.client.next()
        self.update()

    def media_previous_track(self):
        """Send media_previous command media player."""
        self.client.previous()
        self.update_state

    @property
    def supported_features(self):
        """Flag media player features that are supported."""
        return SUPPORT_AIRFOIL_SATELLITE


class AirfoilSpeakerDevice(MediaPlayerDevice):
    """Representation an Airfoil speaker via an Airfoil API instance."""

    def __init__(self, device_data, airfoil):
        """Initialize the Airfoil device."""
        self.airfoil = airfoil
        self.client = airfoil.client
        self.update_state(device_data)
        self._connected = False

    def update(self):
        """Retrieve latest state."""

    def update_state(self, state_hash):
        """Update all the state properties with the passed in dictionary."""
        if 'error' in state_hash:
            _LOGGER.error("airfoil-api error: %s", state_hash)
            self._connected = False

        if 'id' in state_hash:
            self._id = state_hash.get('id')

        if 'name' in state_hash:
            name = state_hash.get('name')
            self._name = '{} {}'.format(self.airfoil.name, name)

        if 'connected' in state_hash:
            self._connected = state_hash.get('connected', None) == "true"

        if 'volume' in state_hash:
            self._volume = state_hash.get('volume', 0)

    @property
    def name(self):
        """Return the name of the device."""
        return self._name

    @property
    def icon(self):
        """Return the icon to use in the frontend, if any."""
        if self._connected is True:
            return 'mdi:volume-high'
        else:
            return 'mdi:volume-off'

    @property
    def state(self):
        """Return the state of the device."""
        if self._connected is True:
            return STATE_ON
        else:
            return STATE_OFF

    @property
    def volume_level(self):
        """Return the volume."""
        return float(self._volume)

    @property
    def supported_features(self):
        """Flag media player features that are supported."""
        return SUPPORT_AIRFOIL_SPEAKER

    def set_volume_level(self, volume):
        """Set volume level, range 0..1."""
        response = self.client.set_volume_speaker(self._id, str(volume))
        self.update_state(response)
        self.schedule_update_ha_state()

    def turn_on(self):
        """Select AirPlay."""
        response = self.client.toggle_speaker(self._id, True)
        self.update_state(response)
        self.schedule_update_ha_state()

    def turn_off(self):
        """Deselect AirPlay."""
        response = self.client.toggle_speaker(self._id, False)
        self.update_state(response)
        self.schedule_update_ha_state()
