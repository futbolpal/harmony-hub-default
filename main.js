const { HarmonyHub } = require('harmonyhub-api')
const HUB_HOST = '192.168.1.163';
const HUB_REMOTE_ID = '17979795';
const HUB_ACTIVITY_OFF = '-1';
const hub = new HarmonyHub(HUB_HOST, HUB_REMOTE_ID);


const run = async () => {
  const config = await hub.connect();
  const getDefaultActivityId = async () => config.activity.find((a) => a.label === 'Default').id
  const getActivityById = (activityId) => config.activity.find((a) => a.id === activityId)


  console.log("Hub connected!");
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
}

run();
