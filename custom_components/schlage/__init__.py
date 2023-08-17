"""Schlage Wifi Home Assistant Integration."""

from dataclasses import dataclass
from datetime import timedelta
from pyschlage import Auth, Schlage
from pyschlage.code import AccessCode
from pyschlage.lock import Lock
from pyschlage.log import LockLog
from pyschlage.user import User

from homeassistant.const import CONF_PASSWORD, CONF_USERNAME
from homeassistant.core import HomeAssistant
from homeassistant.config_entries import ConfigEntry
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator

from .const import DOMAIN, LOGGER, PLATFORMS

UPDATE_INTERVAL = timedelta(seconds=15)


async def async_setup(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Schlage using YAML. (Not supported)."""
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Schlage from a config entry."""
    hass.data.setdefault(DOMAIN, {})

    auth = await hass.async_add_executor_job(
        Auth, entry.data[CONF_USERNAME], entry.data[CONF_PASSWORD]
    )
    api = Schlage(auth)

    async def async_update_data():
        locks = {}
        for lock in await hass.async_add_executor_job(api.locks):
            try:
                access_codes = await hass.async_add_executor_job(lock.access_codes)
            except Exception as ex:  # pylint: disable=broad-exception-caught
                # We don't technically need access codes, so simply log the error and continue.
                # This will prevent the integration from failing for all locks.
                # See: https://github.com/dknowles2/ha-schlage/issues/45
                LOGGER.exception(
                    "Failed to fetch access codes for lock %s: %s", lock.name, ex
                )
                access_codes = {}
            try:
                logs = await hass.async_add_executor_job(lock.logs)
            except Exception as ex:  # pylint: disable=broad-exception-caught
                # We also don't technically need logs, so simply log the error and continue.
                # This will prevent the integration from failing for all locks.
                # See: https://github.com/dknowles2/ha-schlage/issues/45
                LOGGER.exception("Failed to fetch logs for lock %s: %s", lock.name, ex)
                logs = []
            locks[lock.device_id] = LockData(
                lock, logs, {ac.access_code_id: ac for ac in access_codes}
            )
        users = {u.user_id: u for u in await hass.async_add_executor_job(api.users)}
        return SchlageData(locks, users)

    coordinator = DataUpdateCoordinator(
        hass,
        LOGGER,
        name=DOMAIN,
        update_method=async_update_data,
        update_interval=UPDATE_INTERVAL,
    )
    await coordinator.async_config_entry_first_refresh()
    hass.data[DOMAIN][entry.entry_id] = coordinator

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload Schlage config entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id)
    return unload_ok


async def async_reload_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Reload Schlage config entry."""
    await async_unload_entry(hass, entry)
    await async_setup_entry(hass, entry)


@dataclass
class LockData:
    """Container for lock data fetched from the Schlage API."""

    lock: Lock
    logs: list[LockLog]
    access_codes: dict[str, AccessCode]


@dataclass
class SchlageData:
    """Container for all data fetched from the Schlage API."""

    locks: dict[str, LockData]
    users: dict[str, User]
