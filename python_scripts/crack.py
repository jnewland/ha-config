""" Slightly open a cover """

entities = data.get("entity_id")
delay = float(data.get("delay", 0.5))
for entity_id in entities:
    hass.services.call('cover', 'open_cover', {'entity_id': entity_id})
    end = datetime.datetime.now() + datetime.timedelta(seconds=delay)
    while datetime.datetime.now() < end:
        pass
    hass.services.call('cover', 'stop_cover', {'entity_id': entity_id})
