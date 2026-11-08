import MemoryCard from "@/components/learning/MemoryCard";
import AppButton from "@/components/ui/AppButton";
import AppCard from "@/components/ui/AppCard";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import LoadingView from "@/components/ui/LoadingView";
import Screen from "@/components/ui/Screen";
import { colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { MAX_REWARDED_PER_DAY, finishMemoryGame } from "@/services/memoryGameService";
import { getAllWords } from "@/services/vocabularyService";
import {
    LEVELS, MATCH_POINTS, buildDeck, formatTime, liveScore, starsFor, timeBonus, usableWords, xpFor,
} from "@/utils/memoryGame";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useReducer, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View, useWindowDimensions } from "react-native";

// ---------- game state (a reducer keeps the flip/match rules in one place) ----------
function initGame(cards) {
  return { cards, flipped: [], matched: {}, matchCount: 0, moves: 0, wrongs: 0, started: false, locked: false, finished: false };
}

function reducer(state, action) {
  switch (action.type) {
    case "reset":
      return initGame(action.cards);
    case "flip": {
      if (state.locked || state.finished) return state;
      const card = state.cards[action.index];
      if (!card || state.matched[card.pairId] || state.flipped.includes(action.index)) return state;
      const flipped = [...state.flipped, action.index];
      // the second card of a try: count a move and lock the board until it is resolved
      if (flipped.length === 2) return { ...state, started: true, flipped, moves: state.moves + 1, locked: true };
      return { ...state, started: true, flipped };
    }
    case "resolve": {
      if (state.flipped.length !== 2) return state;
      const [a, b] = state.flipped;
      const ca = state.cards[a];
      const cb = state.cards[b];
      if (ca.pairId === cb.pairId) {
        const matchCount = state.matchCount + 1;
        return {
          ...state, flipped: [], locked: false, matchCount,
          matched: { ...state.matched, [ca.pairId]: true },
          finished: matchCount === state.cards.length / 2,
        };
      }
      return { ...state, flipped: [], locked: false, wrongs: state.wrongs + 1 };
    }
    default:
      return state;
  }
}

function Stat({ icon, label, value }) {
  return (
    <View style={s.stat}>
      <Ionicons name={icon} size={18} color={colors.goldDark} />
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

function Row({ label, value, color }) {
  return (
    <View style={s.rowLine}>
      <Text style={s.rowLabel}>{label}</Text>
      <Text style={[s.rowValue, color ? { color } : null]}>{value}</Text>
    </View>
  );
}

export default function MemoryGame() {
  const router = useRouter();
  const { user } = useAuth();
  const { width } = useWindowDimensions();

  const [phase, setPhase] = useState("loading"); // loading | error | menu | playing | done
  const [usable, setUsable] = useState([]);
  const [level, setLevel] = useState(LEVELS[0]);
  const [seconds, setSeconds] = useState(0);
  const [result, setResult] = useState(null);
  const [game, dispatch] = useReducer(reducer, null, () => initGame([]));
  const rewarded = useRef(false);

  const loadWords = async () => {
    setPhase("loading");
    try {
      setUsable(usableWords(await getAllWords()));
      setPhase("menu");
    } catch (e) {
      setPhase("error");
    }
  };
  useEffect(() => { loadWords(); }, []);

  // after two cards are flipped: wait a moment, then keep them (match) or flip them back (no match)
  useEffect(() => {
    if (game.flipped.length !== 2) return;
    const [a, b] = game.flipped;
    const isMatch = game.cards[a].pairId === game.cards[b].pairId;
    const t = setTimeout(() => dispatch({ type: "resolve" }), isMatch ? 450 : 950);
    return () => clearTimeout(t);
  }, [game.flipped]);

  // timer: starts with the first flipped card and stops when the game is finished
  useEffect(() => {
    if (phase !== "playing" || !game.started || game.finished) return;
    const t = setInterval(() => setSeconds((v) => v + 1), 1000);
    return () => clearInterval(t);
  }, [phase, game.started, game.finished]);

  // all pairs found: work out the score and stars, show the result, then save the XP
  useEffect(() => {
    if (!game.finished || rewarded.current || !user) return;
    rewarded.current = true;

    const pairs = level.pairs;
    const matchPoints = game.matchCount * MATCH_POINTS;
    const base = liveScore(game.matchCount, game.wrongs);
    const bonus = timeBonus(pairs, seconds);
    const stars = starsFor(pairs, game.wrongs);
    const xp = xpFor(level, stars);
    setResult({
      pairs, moves: game.moves, wrongs: game.wrongs, seconds, stars, xp,
      matchPoints, penalty: matchPoints - base, bonus, score: base + bonus, reward: null,
    });

    finishMemoryGame({ uid: user.uid, pairs, xp })
      .then((reward) => setResult((prev) => (prev ? { ...prev, reward } : prev)))
      .catch(() => setResult((prev) => (prev ? { ...prev, reward: { failed: true, xpAwarded: 0 } } : prev)));

    const t = setTimeout(() => setPhase("done"), 800); // let the last pair show as matched first
    return () => clearTimeout(t);
  }, [game.finished]);

  const start = (lvl) => {
    rewarded.current = false;
    setLevel(lvl);
    setSeconds(0);
    setResult(null);
    dispatch({ type: "reset", cards: buildDeck(usable, lvl.pairs) });
    setPhase("playing");
  };

  // ---------- screens ----------
  if (phase === "loading") return <Screen hasHeader><LoadingView /></Screen>;
  if (phase === "error") return <Screen hasHeader><ErrorState onRetry={loadWords} /></Screen>;

  if (phase === "menu") {
    if (usable.length < LEVELS[0].pairs) {
      return (
        <Screen hasHeader>
          <EmptyState
            icon="albums-outline" title="Not enough words yet"
            message="The game needs at least 4 Dzongkha words with different meanings. Ask your teacher to add them in the Words tab."
            actionLabel="Back" onAction={() => router.back()} />
        </Screen>
      );
    }
    return (
      <Screen hasHeader>
        <Text style={s.h}>Choose a difficulty</Text>
        <Text style={s.sub}>Flip two cards at a time and match each Dzongkha word with its English meaning.</Text>
        {LEVELS.map((lvl) => {
          const ok = usable.length >= lvl.pairs;
          return (
            <AppCard key={lvl.key} onPress={ok ? () => start(lvl) : undefined} style={ok ? undefined : { opacity: 0.55 }}>
              <View style={s.levelRow}>
                <View style={[s.levelIcon, { backgroundColor: lvl.color + "26" }]}>
                  <Ionicons name={ok ? "albums" : "lock-closed"} size={24} color={lvl.color} />
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={s.levelTitle}>{lvl.label}</Text>
                  <Text style={s.levelSub}>
                    {ok ? `${lvl.pairs} pairs • ${lvl.pairs * 2} cards` : `Needs ${lvl.pairs} words (available: ${usable.length})`}
                  </Text>
                </View>
                {ok ? <Text style={[s.levelXp, { color: lvl.color }]}>{xpFor(lvl, 1)}–{xpFor(lvl, 3)} XP</Text> : null}
              </View>
            </AppCard>
          );
        })}
        <AppCard>
          <Text style={s.infoTitle}>How scoring works</Text>
          <Text style={s.info}>
            +{MATCH_POINTS} points for every match, −10 for every wrong try, plus a time bonus for finishing fast.
            Fewer wrong tries earn more stars and more XP. XP is given for your first {MAX_REWARDED_PER_DAY} games each day.
          </Text>
        </AppCard>
      </Screen>
    );
  }

  if (phase === "done" && result) {
    const r = result.reward;
    const msg = result.stars === 3 ? "Brilliant memory! 🌟" : result.stars === 2 ? "Well done! 👏" : "Good effort, try again! 💪";
    return (
      <Screen hasHeader>
        <View style={s.doneTop}>
          <View style={s.trophy}><Ionicons name="trophy" size={52} color={colors.goldDark} /></View>
          <Text style={s.doneTitle}>{msg}</Text>
          <View style={s.stars}>
            {[1, 2, 3].map((n) => (
              <Ionicons key={n} name={n <= result.stars ? "star" : "star-outline"} size={42} color={n <= result.stars ? colors.gold : colors.border} />
            ))}
          </View>
          <Text style={s.scoreLabel}>FINAL SCORE</Text>
          <Text style={s.score}>{result.score}</Text>
        </View>

        <AppCard>
          <Row label={`Matches (${result.pairs} × ${MATCH_POINTS})`} value={`+${result.matchPoints}`} color={colors.success} />
          <Row label={`Wrong tries (${result.wrongs})`} value={result.penalty > 0 ? `−${result.penalty}` : "0"} color={result.penalty > 0 ? colors.error : undefined} />
          <Row label="Time bonus" value={`+${result.bonus}`} color={colors.success} />
          <View style={s.divider} />
          <Row label="Moves" value={String(result.moves)} />
          <Row label="Time" value={formatTime(result.seconds)} />
        </AppCard>

        <AppCard style={s.xpCard}>
          {r === null ? (
            <View style={s.xpRow}><ActivityIndicator color={colors.gold} /><Text style={s.xpText}>Saving your points…</Text></View>
          ) : r.failed ? (
            <Text style={[s.xpText, { color: colors.error }]}>Couldn't save your points. Check your connection and play again.</Text>
          ) : r.capped ? (
            <Text style={s.xpText}>Daily XP limit reached ({MAX_REWARDED_PER_DAY} games). Come back tomorrow for more XP!</Text>
          ) : (
            <>
              <Text style={s.xpBig}>+{r.xpAwarded} XP</Text>
              <Text style={s.xpText}>Added to your total{r.leveledUp ? " — 🎉 Level up!" : "."}</Text>
            </>
          )}
        </AppCard>

        <AppButton title="Play Again" icon="refresh" onPress={() => start(level)} />
        <View style={{ height: 10 }} />
        <AppButton title="Change Difficulty" variant="ghost" onPress={() => setPhase("menu")} />
        <View style={{ height: 10 }} />
        <AppButton title="Back" variant="ghost" onPress={() => router.back()} />
      </Screen>
    );
  }

  // ---------- playing ----------
  const gap = 10;
  const cardW = (width - 40 - gap * (level.cols - 1)) / level.cols;
  const cardH = cardW * level.ratio;
  return (
    <Screen hasHeader>
      <View style={s.stats}>
        <Stat icon="footsteps" label="Moves" value={game.moves} />
        <Stat icon="time" label="Time" value={formatTime(seconds)} />
        <Stat icon="ribbon" label="Score" value={liveScore(game.matchCount, game.wrongs)} />
      </View>
      <View style={s.legend}>
        <View style={s.legendItem}><View style={[s.swatch, { backgroundColor: "#FFF6E3", borderColor: colors.gold }]} /><Text style={s.legendText}>Dzongkha</Text></View>
        <View style={s.legendItem}><View style={[s.swatch, { backgroundColor: "#EAF1F9", borderColor: colors.blue }]} /><Text style={s.legendText}>English</Text></View>
        <Text style={s.legendText}>{game.matchCount}/{level.pairs} pairs</Text>
      </View>
      <View style={[s.board, { gap }]}>
        {game.cards.map((card, i) => (
          <MemoryCard
            key={card.id} card={card} width={cardW} height={cardH}
            faceUp={game.flipped.includes(i)} matched={!!game.matched[card.pairId]}
            onPress={() => dispatch({ type: "flip", index: i })} />
        ))}
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  h: { fontSize: 20, fontWeight: "800", color: colors.text },
  sub: { color: colors.textSecondary, marginTop: 4, marginBottom: 16 },
  levelRow: { flexDirection: "row", alignItems: "center" },
  levelIcon: { width: 50, height: 50, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  levelTitle: { fontSize: 17, fontWeight: "800", color: colors.text },
  levelSub: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  levelXp: { fontWeight: "800", fontSize: 13 },
  infoTitle: { fontWeight: "800", color: colors.text, marginBottom: 6 },
  info: { color: colors.textSecondary, lineHeight: 20, fontSize: 13 },
  stats: { flexDirection: "row", gap: 10, marginBottom: 10 },
  stat: { flex: 1, backgroundColor: "#fff", borderRadius: 14, paddingVertical: 10, alignItems: "center", borderWidth: 1, borderColor: colors.border },
  statValue: { fontSize: 18, fontWeight: "800", color: colors.text, marginTop: 2 },
  statLabel: { fontSize: 11, color: colors.textSecondary },
  legend: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  swatch: { width: 14, height: 14, borderRadius: 4, borderWidth: 2 },
  legendText: { fontSize: 12, color: colors.textSecondary, fontWeight: "600" },
  board: { flexDirection: "row", flexWrap: "wrap" },
  doneTop: { alignItems: "center", paddingVertical: 12 },
  trophy: { width: 96, height: 96, borderRadius: 48, backgroundColor: colors.gold + "33", alignItems: "center", justifyContent: "center" },
  doneTitle: { fontSize: 22, fontWeight: "800", color: colors.text, marginTop: 12 },
  stars: { flexDirection: "row", gap: 6, marginVertical: 12 },
  scoreLabel: { color: colors.textSecondary, fontSize: 11, letterSpacing: 1 },
  score: { fontSize: 52, fontWeight: "900", color: colors.text },
  rowLine: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 5 },
  rowLabel: { color: colors.textSecondary },
  rowValue: { fontWeight: "800", color: colors.text },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 8 },
  xpCard: { alignItems: "center" },
  xpRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  xpBig: { fontSize: 28, fontWeight: "900", color: colors.success },
  xpText: { color: colors.textSecondary, textAlign: "center" },
});