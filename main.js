#!/usr/bin/env node

const { Explorer } = require('@harmonyhub/discover')
const { HarmonyHub } = require('harmonyhub-api')

const HUB_NAME = process.env.HUB_NAME;
const HUB_ACTIVITY_OFF = '-1';

const discover = new Explorer(51000);
discover.on(Explorer.Events.ONLINE, async (discoveredHub) => {
  console.log('Discovered ' + discoveredHub.friendlyName);
  if(discoveredHub.friendlyName !== HUB_NAME) {
    console.log("Skipping ", discoveredHub.friendlyName)
    return;
  }

  const { ip, remoteId } = discoveredHub.fullHubInfo
  const hub = new HarmonyHub(ip, remoteId);
  const config = await hub.connect();
  console.log("Hub connected!");

  const getDefaultActivityId = async () => config.activity.find((a) => a.label === 'Default').id
  const getActivityById = (activityId) => config.activity.find((a) => a.id === activityId)
  const activity = await hub.getCurrentActivity();
  const defaultActivity = await getDefaultActivityId();

  console.log("Current activity:", getActivityById(activity).label);
  hub.on('close', () => {
    console.log("Reconnecting");
    hub.connect()
  });
  hub.on('message', async (message) => {
    if(message.data && message.data.activityId) {
      console.log("Activity set to:", getActivityById(message.data.activityId).label);
      if(message.data.activityId === HUB_ACTIVITY_OFF) {
        console.log("Setting activity to Default");
        await hub.startActivity(defaultActivity);
      }
    }
  })
  if(activity === HUB_ACTIVITY_OFF) {
    console.log("Setting activity to Default");
    await hub.startActivity(defaultActivity);
  }

});

discover.on(Explorer.Events.OFFLINE, (hub) => {
  console.log('lost ' + hub.ip);
});

discover.start();
