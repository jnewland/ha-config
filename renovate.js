module.exports = {
  extends: ["github>urcomputeringpal/.github"],
  allowedPostUpgradeCommands: ["./script/sync-components"],
  postUpgradeTasks: {
    commands: ["./script/sync-components"],
    executionMode: "branch",
  },
};
