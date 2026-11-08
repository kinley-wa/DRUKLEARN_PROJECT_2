import { colors } from "@/constants/theme";
import { speakWord, stopSpeaking } from "@/services/speechService";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { Pressable } from "react-native";

// word = { word, romanization }
export default function SpeakButton({ word, size = 26, color = colors.gold }) {
  const [speaking, setSpeaking] = useState(false);
  const speakingRef = useRef(false);
  const timer = useRef(null);

  const finish = () => {
    speakingRef.current = false;
    setSpeaking(false);
    if (timer.current) clearTimeout(timer.current);
  };

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
    if (speakingRef.current) stopSpeaking();
  }, []);

  const press = () => {
    if (speakingRef.current) { stopSpeaking(); finish(); return; }
    const ok = speakWord(word, { onDone: finish });
    if (!ok) return;
    speakingRef.current = true;
    setSpeaking(true);
    timer.current = setTimeout(finish, 8000); // safety reset if the phone has no voice and never reports "done"
  };

  return (
    <Pressable onPress={press} hitSlop={10} accessibilityLabel="Hear pronunciation">
      <Ionicons name={speaking ? "volume-high" : "volume-high-outline"} size={size} color={color} />
    </Pressable>
  );
}