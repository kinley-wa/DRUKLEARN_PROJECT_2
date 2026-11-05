import { LAST_LEARN_KEY, NOTIF_PREFS_KEY } from "@/constants/storage";
import { toDateString } from "@/utils/date";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const CHANNEL_ID = "reminders";
export const DEFAULT_PREFS = { enabled: false, hour: 18, minute: 0 };

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false,
  }),
});

export async function getPrefs() {
  const raw = await AsyncStorage.getItem(NOTIF_PREFS_KEY);
  return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS;
}
export async function savePrefs(p) {
  await AsyncStorage.setItem(NOTIF_PREFS_KEY, JSON.stringify(p));
}

async function ensureChannel() {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: "Learning reminders",
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

// Android 13+ needs the channel to exist BEFORE the permission prompt. iOS simply prompts.
export async function requestPermission() {
  await ensureChannel();
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

// Re-schedules everything from scratch. A local notification cannot check Firestore while the app is
// closed, so this runs every time Home is shown: today's streak reminder is skipped once you've learned.
export async function syncReminders() {
  const prefs = await getPrefs();
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!prefs.enabled) return;
  const perm = await Notifications.getPermissionsAsync();
  if (!perm.granted) return;
  await ensureChannel();

  // 1) daily lesson / mission reminder at the chosen time
  await Notifications.scheduleNotificationAsync({
    content: { title: "Time to learn Dzongkha! 📚", body: "Your daily missions are waiting." },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: prefs.hour, minute: prefs.minute, channelId: CHANNEL_ID,
    },
  });

  // 2) streak-at-risk reminder at 8:30 PM for today (if you haven't learned yet) and the next 2 days
  const learnedToday = (await AsyncStorage.getItem(LAST_LEARN_KEY)) === toDateString();
  const now = new Date();
  for (let i = 0; i < 3; i++) {
    if (i === 0 && learnedToday) continue;
    const when = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i, 20, 30, 0);
    if (when.getTime() <= now.getTime()) continue;
    await Notifications.scheduleNotificationAsync({
      content: { title: "Don't lose your streak! 🔥", body: "A quick lesson keeps your streak alive." },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: when, channelId: CHANNEL_ID },
    });
  }
}

// For testing: shows a notification 5 seconds from now.
export async function sendTestNotification() {
  await ensureChannel();
  await Notifications.scheduleNotificationAsync({
    content: { title: "DrukLearn test 🔔", body: "Reminders are working on this phone." },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 5, channelId: CHANNEL_ID },
  });
}