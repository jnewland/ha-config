""" Set a single attribute on an entity """

entity_ids = data.get("entity_id")
attribute  = data.get("attribute")
value      = data.get("value")

for entity_id in entity_ids.replace(" ", "").split(","):
    state = hass.states.get(entity_id)
    attributes = state.attributes or {}
    attributes[attribute] = value
    hass.states.set(state, state.state, attributes)
    logger.info("Set states." + str(entity_id) + ".attributes." + str(attribute) + " to " + str(value))
