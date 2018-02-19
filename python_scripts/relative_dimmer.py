""" Change a light's brightness """

entity_ids = data.get('entity_id')
change     = int(data.get('change'))

for entity_id in entity_ids.split(','):
    state      = hass.states.get(entity_id)
    brightness = state.attributes.get('brightness') or 0

    dim = (brightness + change)

    if dim >= 254:
        dim = 254

    if dim <= 0:
        logger.info('Tuning off ' + str(entity_id))
        data = { "entity_id" : entity_id }
        hass.services.call('light', 'turn_off', data)
    else:
        logger.info('Dimming ' + str(entity_id) + ' from ' + str(brightness) + ' to ' + str(dim))
        data = { "entity_id" : entity_id, "brightness" : dim }
        hass.services.call('light', 'turn_on', data)
