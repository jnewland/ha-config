module.exports = {
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "globalExtends": ["github>jnewland/.github"],
  "postUpgradeTasks": {
    "commands": ["./script/sync-components"],
    "fileFilters": ["custom_components/**/*"],
    "executionMode": "branch"
  },
  "packageRules": [
    {
      "matchPackageNames": [
        "homeassistant/home-assistant",
        "homeassistant/core"
      ],
      "addLabels": ["deploy:manually-deployed", "deploy:auto-merge"],
      "prBodyNotes": "Auto-updating [home-assistant](https://github.com/home-assistant/core/releases) /cc @jnewland"
    }
  ],
  "hostRules": [{
    "matchHost": "api.github.com",
    "token": process.env.GITHUB_COM_TOKEN
  }]
}
