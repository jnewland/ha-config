.PHONY: migration/status.json
migration/status.json:
	./script/template < migration/status.jinja  > migration/status.json