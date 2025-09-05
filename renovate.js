module.exports = {
  extends: ['github>urcomputeringpal/.github'],
  allowedPostUpgradeCommands: ['./script/sync-components'],
  postUpgradeTasks: {
    commands: ['./script/sync-components'],
    fileFilters: ['**/**'],
    executionMode: 'branch',
  },
  packageRules: [
    {
      matchPackageNames: ['homeassistant/home-assistant', 'homeassistant/core'],
      addLabels: ['deploy', 'deploy:auto-merge'],
      prBodyNotes:
        'Auto-updating [home-assistant](https://github.com/home-assistant/core/releases) /cc @jnewland',
    }
  ],
};
