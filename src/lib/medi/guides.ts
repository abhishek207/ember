export type GuideId = "urge" | "sit" | "body";

export type GuideLine = { at: number; text: string };

export type Guide = {
  id: GuideId;
  label: string;
  hint: string;
  minutes: number;
  lines: GuideLine[];
};

export const GUIDES: Guide[] = [
  {
    id: "urge",
    label: "This wave",
    hint: "About 3 minutes. For a craving.",
    minutes: 3,
    lines: [
      { at: 0, text: "Sit still. You do not need to fix this minute." },
      { at: 12, text: "The pull is real. It is also brief." },
      { at: 24, text: "Breathe in for four. Out for four." },
      { at: 40, text: "Unclench the hands. Let the jaw drop." },
      { at: 58, text: "The urge is a wave. You are the shore it crosses." },
      { at: 80, text: "If a thought arrives, name it. Then return to the breath." },
      { at: 110, text: "Stay with the exhale. Shoulders down." },
      { at: 140, text: "This wave is already leaving." },
      { at: 165, text: "One more slow breath. Keep the air." },
    ],
  },
  {
    id: "sit",
    label: "Even breath",
    hint: "5 minutes. Four in, four out.",
    minutes: 5,
    lines: [
      { at: 0, text: "Find a seat you can keep. Feet on the floor." },
      { at: 15, text: "Breathe in for four. Out for four. Same length both ways." },
      { at: 40, text: "Watch the breath. Do not force it." },
      { at: 75, text: "Feel the weight of the body in the chair." },
      { at: 110, text: "When the mind leaves, bring it back without comment." },
      { at: 150, text: "Nothing to solve in this sit." },
      { at: 190, text: "Four in. Four out." },
      { at: 230, text: "Restlessness can sit beside you. Keep the breath even." },
      { at: 270, text: "This room. This body. This air." },
      { at: 290, text: "One longer breath. Open the eyes when you are ready." },
    ],
  },
  {
    id: "body",
    label: "Body scan",
    hint: "6 minutes. Attention through the body.",
    minutes: 6,
    lines: [
      { at: 0, text: "Let the body be supported. Sit or lie down." },
      { at: 16, text: "Soften the scalp. The forehead. The jaw." },
      { at: 40, text: "Shoulders away from the ears." },
      { at: 65, text: "Down the arms, to the hands. Open the palms." },
      { at: 95, text: "The chest rises and falls. No need to change it." },
      { at: 125, text: "Let the belly be unheld." },
      { at: 155, text: "Hips heavy. Legs heavy. Feet heavy." },
      { at: 190, text: "If a place is tight, breathe toward it. Then move on." },
      { at: 230, text: "The whole body at once. One field. Breathing." },
      { at: 280, text: "Stay with that for a few cycles." },
      { at: 330, text: "Fingers. Toes. Open the eyes. Return without hurry." },
    ],
  },
];

export function lineAt(guide: Guide, elapsed: number): string {
  let text = guide.lines[0]?.text ?? "";
  for (const line of guide.lines) {
    if (elapsed >= line.at) text = line.text;
  }
  return text;
}
