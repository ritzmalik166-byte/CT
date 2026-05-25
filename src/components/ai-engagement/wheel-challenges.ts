import type {
  ActiveChallenge,
  AiHumanChallenge,
  ChallengeType,
  PromptChallenge,
  TrueFalseChallenge,
} from "./types";

const TRUE_FALSE: TrueFalseChallenge[] = [
  {
    kind: "truefalse",
    statement: "Generative AI can create cinematic brand films from text prompts.",
    answer: true,
  },
  {
    kind: "truefalse",
    statement: "AI models never need human creative direction for brand storytelling.",
    answer: false,
  },
  {
    kind: "truefalse",
    statement: "Prompt engineering improves the quality of AI-generated visuals.",
    answer: true,
  },
  {
    kind: "truefalse",
    statement: "All AI outputs are identical when given the same prompt.",
    answer: false,
  },
  {
    kind: "truefalse",
    statement: "AI can help personalize content for different social platforms.",
    answer: true,
  },
];

const PROMPTS: PromptChallenge[] = [
  {
    kind: "prompt",
    scenario: "Luxury perfume launch film — pick the strongest prompt:",
    options: [
      "make a video",
      "Cinematic macro shots, golden hour, slow motion, luxury perfume, AI brand film",
      "perfume ad fast cheap",
    ],
    answerIndex: 1,
  },
  {
    kind: "prompt",
    scenario: "Tech startup hero reel — pick the strongest prompt:",
    options: [
      "futuristic UI motion, neon data streams, confident tone, 15s social reel",
      "startup video",
      "cool tech stuff",
    ],
    answerIndex: 0,
  },
  {
    kind: "prompt",
    scenario: "Emotional documentary clip — pick the strongest prompt:",
    options: [
      "sad movie",
      "Handheld intimacy, natural light, human resilience, documentary tone, subtle score",
      "documentary about people",
    ],
    answerIndex: 1,
  },
];

const AI_HUMAN: AiHumanChallenge[] = [
  {
    kind: "aihuman",
    text: "Where intelligence meets imagination — stories that breathe.",
    answer: "ai",
    hint: "Written for a generative AI studio homepage.",
  },
  {
    kind: "aihuman",
    text: "We shot for three days in the rain and kept every imperfect take.",
    answer: "human",
    hint: "A director's behind-the-scenes note.",
  },
  {
    kind: "aihuman",
    text: "Neural frames, cinematic soul, infinite variations in one prompt.",
    answer: "ai",
    hint: "Marketing copy for an AI film pipeline.",
  },
  {
    kind: "aihuman",
    text: "My grandmother's recipe inspired this campaign — not a dataset.",
    answer: "human",
    hint: "A copywriter's personal creative brief.",
  },
];

const tfRef = { current: 0 };
const promptRef = { current: 0 };
const aiRef = { current: 0 };

function next<T>(pool: T[], indexRef: { current: number }): T {
  const item = pool[indexRef.current % pool.length];
  indexRef.current += 1;
  return item;
}

export function resetChallengePools() {
  tfRef.current = 0;
  promptRef.current = 0;
  aiRef.current = 0;
}

export function createChallenge(type: ChallengeType): ActiveChallenge {
  switch (type) {
    case "truefalse":
      return next(TRUE_FALSE, tfRef);
    case "prompt":
      return next(PROMPTS, promptRef);
    case "aihuman":
      return next(AI_HUMAN, aiRef);
    case "tap":
      return { kind: "tap" };
    case "reaction":
      return { kind: "reaction" };
  }
}

export function scoreForChallenge(spinIndex: number, streak: number, bonus = 0) {
  return 100 + spinIndex * 40 + streak * 25 + bonus;
}
