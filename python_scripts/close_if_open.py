""" Close a cover only if it is open """

entities = data.get("entity_id")
for entity_id in entities:
    state = hass.states.get(entity_id)

    if state.state == "open":
        logger.info("Closing " + str(entity_id))
        hass.services.call("cover", "close_cover", { "entity_id": entity_id })
    else:
        logger.info("Not closing " + str(entity_id) + " since it was " + state.state)
