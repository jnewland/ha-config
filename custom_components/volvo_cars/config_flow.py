"""Config flow for Volvo Cars integration."""

from __future__ import annotations

from collections.abc import Mapping
import logging
import re
from typing import TYPE_CHECKING, Any, Self
from urllib import parse

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.config_entries import SOURCE_REAUTH, ConfigEntry, ConfigFlowResult
from homeassistant.const import (
    CONF_FRIENDLY_NAME,
    CONF_PASSWORD,
    CONF_USERNAME,
    Platform,
)
from homeassistant.core import callback
from homeassistant.data_entry_flow import section
from homeassistant.exceptions import ConfigEntryError
from homeassistant.helpers.selector import (
    ColorRGBSelector,
    EntitySelector,
    EntitySelectorConfig,
    SelectSelector,
    SelectSelectorConfig,
)
from homeassistant.util.unit_system import US_CUSTOMARY_SYSTEM

from .const import (
    CONF_OTP,
    CONF_VCC_API_KEY,
    CONF_VIN,
    DOMAIN,
    MANUFACTURER,
    OPT_DEVICE_TRACKER_PICTURE,
    OPT_ENERGY_CONSUMPTION_UNIT,
    OPT_FUEL_CONSUMPTION_UNIT,
    OPT_IMG_BG_COLOR,
    OPT_IMG_TRANSPARENT,
    OPT_UNIT_ENERGY_KWH_PER_100KM,
    OPT_UNIT_ENERGY_MILES_PER_KWH,
    OPT_UNIT_LITER_PER_100KM,
    OPT_UNIT_MPG_UK,
    OPT_UNIT_MPG_US,
)
from .coordinator import VolvoCarsData
from .factory import async_create_auth_api
from .store import VolvoCarsStoreManager
from .volvo.models import AuthorizationModel, VolvoAuthException

_LOGGER = logging.getLogger(__name__)
_VIN_REGEX = re.compile(r"[A-Z0-9]{17}")


def get_setting(entry: ConfigEntry, key: str) -> Any:
    """Get setting from options with a fallback to config."""
    if key in entry.options:
        return entry.options[key]

    return entry.data.get(key, None)


def _create_section(name: str, schema: dict[vol.Marker, Any]) -> dict[vol.Marker, Any]:
    return {
        vol.Required(name): section(
            vol.Schema(schema),
            {"collapsed": True},
        )
    }


class VolvoCarsFlowHandler(config_entries.ConfigFlow, domain=DOMAIN):
    """Volvo Cars config flow."""

    VERSION = 1
    MINOR_VERSION = 3

    def __init__(self) -> None:
        """Initialize Volvo Cars config flow."""
        self._username: str | None = None
        self._password: str | None = None
        self._vin: str | None = None
        self._api_key: str | None = None
        self._friendly_name: str | None = None

        self._auth_result: AuthorizationModel | None = None

    # Overridden method
    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Handle user step."""
        errors: dict[str, str] = {}

        if user_input is not None:
            vin = str(user_input[CONF_VIN]).strip().upper()

            if _VIN_REGEX.fullmatch(vin) is None:
                errors[CONF_VIN] = "invalid_vin"
            else:
                flow = await self._async_authenticate(vin, user_input, errors)

                if flow is not None:
                    return flow

        user_input = user_input or {}
        schema = vol.Schema(
            {
                vol.Required(
                    CONF_USERNAME, default=user_input.get(CONF_USERNAME, "")
                ): str,
                vol.Required(
                    CONF_PASSWORD, default=user_input.get(CONF_PASSWORD, "")
                ): str,
                vol.Required(CONF_VIN, default=user_input.get(CONF_VIN, "")): str,
                vol.Required(
                    CONF_VCC_API_KEY, default=user_input.get(CONF_VCC_API_KEY, "")
                ): str,
                vol.Optional(
                    CONF_FRIENDLY_NAME, default=user_input.get(CONF_FRIENDLY_NAME, "")
                ): str,
            },
        )

        return self.async_show_form(step_id="user", data_schema=schema, errors=errors)

    async def async_step_otp(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Handle OTP step."""
        errors: dict[str, str] = {}

        if user_input is not None:
            try:
                api = await async_create_auth_api(self.hass)

                if self._auth_result and self._auth_result.next_url:
                    self._auth_result = await api.async_request_token(
                        self._auth_result.next_url, user_input[CONF_OTP]
                    )
            except VolvoAuthException as ex:
                _LOGGER.exception("Authentication failed: %s", ex.message)
                errors["base"] = "invalid_auth"

            if not errors:
                return await self._async_create_or_update_entry()

        schema = vol.Schema({vol.Required(CONF_OTP, default=""): str})
        return self.async_show_form(step_id="otp", data_schema=schema, errors=errors)

    # By convention method
    async def async_step_reauth(self, _: Mapping[str, Any]) -> ConfigFlowResult:
        """Perform reauth upon an API authentication error."""
        return await self.async_step_reauth_confirm()

    async def async_step_reauth_confirm(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Dialog that informs the user that reauth is required."""
        errors: dict[str, str] = {}
        reauth_entry = self._get_reauth_entry()

        if user_input is not None:
            vin = str(reauth_entry.data[CONF_VIN]).strip().upper()

            if _VIN_REGEX.fullmatch(vin) is None:
                errors[CONF_VIN] = "invalid_vin"
            else:
                flow = await self._async_authenticate(vin, user_input, errors)

                if flow is not None:
                    return flow

        schema = vol.Schema(
            {
                vol.Required(
                    CONF_USERNAME, default=reauth_entry.data.get(CONF_USERNAME)
                ): str,
                vol.Required(CONF_PASSWORD, default=""): str,
                vol.Required(
                    CONF_VCC_API_KEY,
                    default=get_setting(reauth_entry, CONF_VCC_API_KEY),
                ): str,
            },
        )

        return self.async_show_form(
            step_id="reauth_confirm", data_schema=schema, errors=errors
        )

    # Overridden method
    def is_matching(self, other_flow: Self) -> bool:
        """Return True if other_flow is matching this flow."""
        return other_flow._vin == self._vin  # noqa: SLF001 # pylint: disable=protected-access

    # Overridden method
    @staticmethod
    @callback
    def async_get_options_flow(
        config_entry: ConfigEntry,
    ) -> OptionsFlowHandler:
        """Create the options flow."""
        return OptionsFlowHandler(config_entry)

    async def _async_authenticate(
        self, vin: str, user_input: dict[str, Any], errors: dict[str, str]
    ) -> ConfigFlowResult | None:
        await self.async_set_unique_id(vin)

        if self.source == SOURCE_REAUTH:
            self._abort_if_unique_id_mismatch()
        else:
            self._abort_if_unique_id_configured()

        try:
            api = await async_create_auth_api(self.hass)
            result = await api.async_authenticate(
                user_input[CONF_USERNAME], user_input[CONF_PASSWORD]
            )
        except VolvoAuthException as ex:
            _LOGGER.exception("Authentication failed: %s", ex.message)
            errors["base"] = "invalid_auth"

        self._vin = vin
        self._username = user_input[CONF_USERNAME]
        self._password = user_input[CONF_PASSWORD]
        self._api_key = user_input[CONF_VCC_API_KEY]
        self._friendly_name = user_input.get(CONF_FRIENDLY_NAME)

        if not errors:
            self._auth_result = result

            if result.status == "OTP_REQUIRED":
                return await self.async_step_otp()

            if result.status == "COMPLETED":
                return await self._async_create_or_update_entry()

        return None

    async def _async_create_or_update_entry(self) -> ConfigFlowResult:
        if self._auth_result and self._auth_result.token:
            if self.unique_id is None:
                raise ConfigEntryError("Config entry has no unique_id")

            _LOGGER.debug("Storing tokens")
            store = VolvoCarsStoreManager(self.hass, self.unique_id)
            await store.async_update(
                access_token=self._auth_result.token.access_token,
                refresh_token=self._auth_result.token.refresh_token,
            )

        data = {
            CONF_USERNAME: self._username,
            CONF_VIN: self._vin,
            CONF_VCC_API_KEY: self._api_key,
            CONF_FRIENDLY_NAME: self._friendly_name,
        }

        if self.source == SOURCE_REAUTH:
            # Keep API key in sync with options
            reauth_entry = self._get_reauth_entry()
            options = dict(reauth_entry.options) if reauth_entry else {}
            options.update({CONF_VCC_API_KEY: self._api_key})

            return self.async_update_reload_and_abort(
                self._get_reauth_entry(), data_updates=data, options=options
            )

        def _default_energy_unit() -> str:
            return (
                OPT_UNIT_ENERGY_MILES_PER_KWH
                if (
                    self.hass.config.units == US_CUSTOMARY_SYSTEM
                    or self.hass.config.country in ("UK", "US")
                )
                else OPT_UNIT_ENERGY_KWH_PER_100KM
            )

        def _default_fuel_unit() -> str:
            if self.hass.config.country == "UK":
                return OPT_UNIT_MPG_UK

            if (
                self.hass.config.units == US_CUSTOMARY_SYSTEM
                or self.hass.config.country == "US"
            ):
                return OPT_UNIT_MPG_US

            return OPT_UNIT_LITER_PER_100KM

        _LOGGER.debug("Creating entry")
        return self.async_create_entry(
            title=f"{MANUFACTURER} {self._vin}",
            data=data,
            options={
                CONF_VCC_API_KEY: self._api_key,
                OPT_ENERGY_CONSUMPTION_UNIT: _default_energy_unit(),
                OPT_FUEL_CONSUMPTION_UNIT: _default_fuel_unit(),
                OPT_IMG_BG_COLOR: [0, 0, 0],
                OPT_IMG_TRANSPARENT: True,
            },
        )


# OptionsFlowWithConfigEntry is being phased out, probably in 2025.12.
# Use OptionsFlow instead, starting from 2024.12.
class OptionsFlowHandler(config_entries.OptionsFlowWithConfigEntry):
    """Class to handle the options."""

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Manage the options."""
        if user_input is not None:
            # Remove sections from input
            flat_input = {}
            for key, value in user_input.items():
                if isinstance(value, dict):
                    flat_input.update(value)
                else:
                    flat_input[key] = value

            return self.async_create_entry(data=flat_input)

        if TYPE_CHECKING:
            assert isinstance(self.config_entry.runtime_data, VolvoCarsData)

        coordinator = self.config_entry.runtime_data.coordinator

        schema: dict[vol.Marker, Any] = {
            **_create_section(
                "api",
                {
                    vol.Required(
                        CONF_VCC_API_KEY,
                        default=get_setting(self.config_entry, CONF_VCC_API_KEY),
                    ): str
                },
            ),
            **_create_section(
                "device_tracker",
                {
                    vol.Optional(
                        OPT_DEVICE_TRACKER_PICTURE,
                        default=get_setting(
                            self.config_entry, OPT_DEVICE_TRACKER_PICTURE
                        )
                        or vol.UNDEFINED,
                    ): EntitySelector(EntitySelectorConfig(domain=Platform.IMAGE))
                },
            ),
        }

        # Units
        unit_schema: dict[vol.Marker, Any] = {}

        if coordinator.vehicle.has_battery_engine():
            unit_schema.update(
                {
                    vol.Required(
                        OPT_ENERGY_CONSUMPTION_UNIT,
                        default=get_setting(
                            self.config_entry, OPT_ENERGY_CONSUMPTION_UNIT
                        ),
                    ): SelectSelector(
                        SelectSelectorConfig(
                            options=[
                                OPT_UNIT_ENERGY_KWH_PER_100KM,
                                OPT_UNIT_ENERGY_MILES_PER_KWH,
                            ],
                            multiple=False,
                            translation_key=OPT_ENERGY_CONSUMPTION_UNIT,
                        )
                    )
                }
            )

        if coordinator.vehicle.has_combustion_engine():
            unit_schema.update(
                {
                    vol.Required(
                        OPT_FUEL_CONSUMPTION_UNIT,
                        default=get_setting(
                            self.config_entry, OPT_FUEL_CONSUMPTION_UNIT
                        ),
                    ): SelectSelector(
                        SelectSelectorConfig(
                            options=[
                                OPT_UNIT_LITER_PER_100KM,
                                OPT_UNIT_MPG_UK,
                                OPT_UNIT_MPG_US,
                            ],
                            multiple=False,
                            translation_key=OPT_FUEL_CONSUMPTION_UNIT,
                        )
                    )
                }
            )

        schema.update(_create_section("units", unit_schema))

        # Images
        url = coordinator.vehicle.images.exterior_image_url
        url_parts = parse.urlparse(url)

        if url_parts.netloc.startswith("cas"):
            schema.update(
                _create_section(
                    "images",
                    {
                        vol.Optional(
                            OPT_IMG_TRANSPARENT,
                            default=get_setting(self.config_entry, OPT_IMG_TRANSPARENT),
                        ): bool,
                        vol.Optional(
                            OPT_IMG_BG_COLOR,
                            default=get_setting(self.config_entry, OPT_IMG_BG_COLOR),
                        ): ColorRGBSelector(),
                    },
                )
            )

        if len(schema) == 0:
            return self.async_abort(reason="no_options_available")

        return self.async_show_form(
            step_id="init",
            data_schema=self.add_suggested_values_to_schema(
                vol.Schema(schema), self.config_entry.options
            ),
        )
