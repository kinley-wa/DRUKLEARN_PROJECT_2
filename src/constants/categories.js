import { colors } from "./theme";

export const CATEGORY_OPTIONS = ["Basic Greetings", "Numbers", "Family", "School", "Daily Life"];

const STYLES = {
  "Basic Greetings": { icon: "hand-left", color: colors.gold },
  Numbers: { icon: "calculator", color: colors.blue },
  Family: { icon: "heart", color: colors.pink },
  School: { icon: "school", color: colors.green },
  "Daily Life": { icon: "sunny", color: colors.amber },
};

export function getCategoryStyle(category) {
  return STYLES[category] || { icon: "book", color: colors.textSecondary };
}