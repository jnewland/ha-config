module.exports = {
  extends: ['github>urcomputeringpal/.github'],
  hostRules: [
    {
      hostType: 'github',
      matchHost: 'github.com',
      username: process.env.RENOVATE_USERNAME,
      token: process.env.RENOVATE_GITHUB_COM_TOKEN,
    },
  ],
  allowedPostUpgradeCommands: ['./script/sync-components'],
  postUpgradeTasks: {
    commands: ['./script/sync-components'],
    fileFilters: ['**/**'],
    executionMode: 'branch',
  },
  packageRules: [
    {
      matchPackageNames: ['homeassistant/home-assistant', 'homeassistant/core'],
      addLabels: ['deploy:manually-deployed', 'deploy:auto-merge'],
      prBodyNotes:
        'Auto-updating [home-assistant](https://github.com/home-assistant/core/releases) /cc @jnewland',
    }
  ],
};
