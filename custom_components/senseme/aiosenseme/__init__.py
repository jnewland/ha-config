import asyncio
import logging

from .device import SensemeDevice, SensemeFan, SensemeLight


_LOGGER = logging.getLogger(__name__)

async def async_get_device_by_device_info(
        info: dict, start_first=False, refresh_minutes: int = 1, timeout_seconds: int = 10
) -> SensemeDevice:
    """Asynchronously get a device by device info dict.

    The device info dict comes from SensemeDevice.get_device_info(). This
    method will use the device info dict to determine the model so an
    appropriate SensemeFan or SensmeLight object can be returned. This
    method will also either start the device or retrieve secondary
    information based on start_first.
    A Tuple of status and the device are returned. When status is True the
    device was either started or secondary information was retrieved from
    the device based on start_first. False means failed to connect to device.
    This method will take up timeout_seconds to complete or fail.
    """
    try:
        if info.get("is_fan"):
            device = SensemeFan(info=info, refresh_minutes=refresh_minutes)
        elif info.get("is_light"):
            device = SensemeLight(info=info, refresh_minutes=refresh_minutes)
        if start_first:
            if await device.async_update(timeout_seconds=timeout_seconds):
                return [True, device]
        else:
            if await asyncio.wait_for(device.async_fill_out_info(), timeout_seconds):
                return [True, device]
    except asyncio.TimeoutError:
        _LOGGER.debug("Get device by device info dict (%s) failed. No response", info)
    except asyncio.CancelledError:
        _LOGGER.debug("Task get device by device info dict(%s) cancelled", info)
    return [False, device]
