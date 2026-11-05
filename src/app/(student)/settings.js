import AppButton from "@/components/ui/AppButton";
import AppCard from "@/components/ui/AppCard";
import Chip from "@/components/ui/Chip";
import Screen from "@/components/ui/Screen";
import { colors } from "@/constants/theme";
import {
  DEFAULT_PREFS, getPrefs, requestPermission, savePrefs, sendTestNotification, syncReminders,
} from "@/services/notificationService";
import { useEffect, useState } from "react";
import { Alert, Linking, StyleSheet, Switch, Text, View } from "react-native";

const HOURS = [8, 12, 18, 20];
const label = (h) => `${h > 12 ? h - 12 : h}:00 ${h >= 12 ? "PM" : "AM"}`;

export default function Settings() {
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  useEffect(() => { getPrefs().then(setPrefs); }, []);

  const apply = async (next) => {
    setPrefs(next);
    await savePrefs(next);
    await syncReminders();
  };

  const toggle = async (on) => {
    if (on) {
      const ok = await requestPermission();
      if (!ok) {
        return Alert.alert(
          "Notifications are off",
          "Allow notifications for this app in your phone settings to get reminders.",
          [{ text: "Cancel", style: "cancel" }, { text: "Open settings", onPress: () => Linking.openSettings() }]
        );
      }
    }
    apply({ ...prefs, enabled: on });
  };

  const test = async () => {
    const ok = await requestPermission();
    if (!ok) return Alert.alert("Notifications are off", "Allow notifications first.");
    await sendTestNotification();
    Alert.alert("Scheduled", "A test notification will appear in about 5 seconds. Stay on this screen.");
  };

  return (
    <Screen hasHeader>
      <AppCard>
        <View style={s.row}>
          <View style={{ flex: 1 }}>
            <Text style={s.t}>Learning reminders</Text>
            <Text style={s.sub}>Daily mission reminder and streak alerts</Text>
          </View>
          <Switch value={prefs.enabled} onValueChange={toggle} trackColor={{ true: colors.gold }} />
        </View>
        {prefs.enabled ? (
          <>
            <Text style={[s.sub, { marginTop: 14, marginBottom: 8 }]}>Remind me at</Text>
            <View style={s.chips}>
              {HOURS.map((h) => (
                <Chip key={h} label={label(h)} selected={prefs.hour === h} onPress={() => apply({ ...prefs, hour: h, minute: 0 })} />
              ))}
            </View>
          </>
        ) : null}
      </AppCard>
      <AppButton title="Send a test notification" variant="ghost" onPress={test} />
      <View style={{ height: 12 }} />
      <AppCard>
        <Text style={s.sub}>App version</Text>
        <Text style={s.t}>DrukLearn v2.0 (Project II)</Text>
      </AppCard>
    </Screen>
  );
}
const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
  t: { fontWeight: "700", color: colors.text, fontSize: 15 },
  sub: { color: colors.textSecondary, fontSize: 12 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
});