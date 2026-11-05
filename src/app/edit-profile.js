import AppButton from "@/components/ui/AppButton";
import AppTextField from "@/components/ui/AppTextField";
import Screen from "@/components/ui/Screen";
import { useAuth } from "@/context/AuthContext";
import { updateUserName } from "@/services/userService";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

export default function EditProfile() {
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();
  const [name, setName] = useState(profile ? profile.fullName : "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!user || !name.trim()) return Alert.alert("Name required", "Please enter your name.");
    setSaving(true);
    try {
      await updateUserName(user.uid, name.trim());
      await refreshProfile();
      router.back();
    } catch (e) {
      Alert.alert("Couldn't save", e.message);
    } finally { setSaving(false); }
  };

  return (
    <Screen hasHeader>
      <Stack.Screen options={{ headerShown: true, title: "Edit Profile" }} />
      <AppTextField label="Full Name" value={name} onChangeText={setName} autoCapitalize="words" />
      <AppButton title="Save Changes" onPress={save} loading={saving} />
    </Screen>
  );
}