""" Dim or brighten a light by a customizable amount """

entity_ids = data.get("entity_id")
action     = data.get("action", "dim")

if action == "down":
    multiplier = -1
elif action == "up":
    multiplier = 1

for entity_id in entity_ids.split(","):
    state      = hass.states.get(entity_id.replace(" ", ""))
    change     = state.attributes.get("duck_step", 127)
    brightness = state.attributes.get("brightness", 0)

    dim = (brightness + (int(change) * int(multiplier)))

    if dim >= 255:
        dim = 255

    if dim <= 0:
        logger.info("Turning off " + str(entity_id))
        data = { "entity_id" : entity_id }
        hass.services.call("light", "turn_off", data)
    else:
        logger.info("Dimming " + str(entity_id) + " from " + str(brightness) + " to " + str(dim))
        data = { "entity_id" : entity_id, "brightness" : dim }
        hass.services.call("light", "turn_on", data)
