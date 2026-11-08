import * as Speech from "expo-speech";

export function stopSpeaking() {
  Speech.stop();
}

// Speaks the romanization when there is one (phone voices can't read Tibetan script).
// callbacks: { onDone }
export function speakWord(word, callbacks = {}) {
  const roman = (word.romanization || "").trim();
  const text = roman || (word.word || "").trim();
  if (!text) return false;

  Speech.stop();
  const options = {
    rate: 0.8, // slightly slower so learners can hear it clearly
    onDone: callbacks.onDone,
    onStopped: callbacks.onDone,
    onError: callbacks.onDone,
  };
  if (roman) options.language = "en-US";
  Speech.speak(text, options);
  return true;
}