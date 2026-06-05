export type GamePhase =
  | "start"
  | "instructions"
  | "spinning"
  | "challenge"
  | "feedback"
  | "victory"
  | "gameover";

export type ChallengeType = "tap" | "truefalse" | "prompt" | "reaction" | "aihuman";

export type RoundResult = "correct" | "wrong";

export const TOTAL_SPINS = 5;
export const MAX_LIVES = 3;

export type WheelSegment = {
  type: ChallengeType;
  label: string;
  shortLabel: string;
};

export const WHEEL_SEGMENTS: WheelSegment[] = [
  { type: "tap", label: "Tap Rush", shortLabel: "Tap" },
  { type: "truefalse", label: "True / False", shortLabel: "T/F" },
  { type: "prompt", label: "Best Prompt", shortLabel: "Prompt" },
  { type: "reaction", label: "Reaction Beat", shortLabel: "Beat" },
  { type: "aihuman", label: "AI or Human?", shortLabel: "Guess" },
];

export type TrueFalseChallenge = {
  kind: "truefalse";
  statement: string;
  answer: boolean;
};

export type PromptChallenge = {
  kind: "prompt";
  scenario: string;
  options: string[];
  answerIndex: number;
};

export type AiHumanChallenge = {
  kind: "aihuman";
  text: string;
  answer: "ai" | "human";
  hint: string;
};

export type TapChallenge = {
  kind: "tap";
};

export type ReactionChallenge = {
  kind: "reaction";
};

export type ActiveChallenge =
  | TrueFalseChallenge
  | PromptChallenge
  | AiHumanChallenge
  | TapChallenge
  | ReactionChallenge;

export const CTA_PHRASES = [
  "Solve the AI Puzzle",
  "Beat AI — Slide & Win",
  "AI Picture Challenge",
  "Can You Beat AI?",
] as const;
