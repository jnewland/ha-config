""" Dim or restore a light by a customizable amount """

entity_ids = data.get("entity_id")
action     = data.get("action", "dim")

if action == "dim":
    multiplier = -1
elif action == "restore":
    multiplier = 1

for entity_id in entity_ids.split(","):
    state      = hass.states.get(entity_id)
    change     = state.attributes.get("dim_amount", 127)
    brightness = state.attributes.get("brightness", 0)

    dim = (brightness + (int(change) * int(multiplier)))

    if dim >= 254:
        dim = 254

    if dim <= 0:
        logger.info("Tuning off " + str(entity_id))
        data = { "entity_id" : entity_id }
        hass.services.call("light", "turn_off", data)
    else:
        logger.info("Dimming " + str(entity_id) + " from " + str(brightness) + " to " + str(dim))
        data = { "entity_id" : entity_id, "brightness" : dim }
        hass.services.call("light", "turn_on", data)
