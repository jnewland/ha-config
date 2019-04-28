""" Close a cover only if it is open """

entity_id = data.get("entity_id")
state = hass.states.get(entity_id)

if state == "open":
    logger.info("Closing " + str(entity_id))
    hass.services.call("cover", "close", { "entity_id": entity_id })
else:
    logger.info("Not closing " + str(entity_id) + " since it was already closed")
