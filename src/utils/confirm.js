import { Alert } from "react-native";

export function confirmDelete(name, onConfirm) {
  Alert.alert("Delete?", `Are you sure you want to delete "${name}"? This cannot be undone.`, [
    { text: "Cancel", style: "cancel" },
    { text: "Delete", style: "destructive", onPress: onConfirm },
  ]);
}