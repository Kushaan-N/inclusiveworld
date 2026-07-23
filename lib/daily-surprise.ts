// Daily Surprise — a small, cheerful moment that greets students at login.
//
// Every login shows one surprise: a fun fact, a joke, an animal of the day, a
// bite-sized Python challenge, or a riddle. The pick is seeded from the user's
// last login time, so it stays put while they move around the app during a
// session but becomes something new the next time they sign in.

export type SurpriseCategory =
  | "fact"
  | "joke"
  | "animal"
  | "challenge"
  | "riddle";

export interface Surprise {
  /** Stable, unique key — used to avoid repeating the previous login's pick. */
  id: string;
  category: SurpriseCategory;
  /** The headline content: the fact, the joke setup, the question. */
  text: string;
  /** Optional payoff revealed on demand: a punchline, answer, or solution. */
  reveal?: string;
  /** Button label for revealing (defaults per category). */
  revealLabel?: string;
}

export interface CategoryMeta {
  label: string;
  emoji: string;
  /** Soft gradient for the banner background. */
  gradient: string;
  /** Accent text/border tone for the category chip. */
  accent: string;
}

export const CATEGORY_META: Record<SurpriseCategory, CategoryMeta> = {
  fact: {
    label: "Fun Fact",
    emoji: "🌟",
    gradient: "from-amber-50 to-orange-50",
    accent: "bg-amber-100 text-amber-700",
  },
  joke: {
    label: "Joke of the Day",
    emoji: "😄",
    gradient: "from-sky-50 to-blue-50",
    accent: "bg-sky-100 text-sky-700",
  },
  animal: {
    label: "Animal of the Day",
    emoji: "🐾",
    gradient: "from-green-50 to-emerald-50",
    accent: "bg-green-100 text-green-700",
  },
  challenge: {
    label: "Python Challenge",
    emoji: "🐍",
    gradient: "from-violet-50 to-purple-50",
    accent: "bg-violet-100 text-violet-700",
  },
  riddle: {
    label: "Riddle",
    emoji: "🧩",
    gradient: "from-pink-50 to-rose-50",
    accent: "bg-pink-100 text-pink-700",
  },
};

const DEFAULT_REVEAL_LABEL: Record<SurpriseCategory, string> = {
  fact: "Tell me more",
  joke: "Show the punchline",
  animal: "Cool, right?",
  challenge: "Show the answer",
  riddle: "Show the answer",
};

// A curated, kid-friendly library. Keep entries short and warm.
export const SURPRISES: Surprise[] = [
  // ── Fun facts ────────────────────────────────────────────────────────────
  {
    id: "fact-honey",
    category: "fact",
    text: "Honey never spoils. Jars of honey found in ancient tombs are still good to eat after 3,000 years!",
  },
  {
    id: "fact-octopus",
    category: "fact",
    text: "An octopus has three hearts and blue blood.",
  },
  {
    id: "fact-python-name",
    category: "fact",
    text: "The Python language wasn't named after the snake — it was named after a British comedy show called Monty Python's Flying Circus!",
  },
  {
    id: "fact-bananas",
    category: "fact",
    text: "Bananas are berries, but strawberries are not. Fruit names are sneaky!",
  },
  {
    id: "fact-space-quiet",
    category: "fact",
    text: "Space is completely silent because there is no air to carry sound.",
  },
  {
    id: "fact-first-bug",
    category: "fact",
    text: "The very first computer 'bug' was a real moth stuck inside a computer in 1947. That's why fixing code is called 'debugging'!",
  },
  {
    id: "fact-heart-beats",
    category: "fact",
    text: "Your heart beats about 100,000 times every single day without you telling it to.",
  },
  {
    id: "fact-rainbow",
    category: "fact",
    text: "No two people ever see the exact same rainbow — it depends on exactly where you're standing.",
  },

  // ── Jokes ────────────────────────────────────────────────────────────────
  {
    id: "joke-programmer-dark",
    category: "joke",
    text: "Why do programmers prefer dark mode?",
    reveal: "Because light attracts bugs! 🐛",
  },
  {
    id: "joke-atoms",
    category: "joke",
    text: "Why should you never trust atoms?",
    reveal: "Because they make up everything!",
  },
  {
    id: "joke-python-code",
    category: "joke",
    text: "Why was the Python developer calm during the storm?",
    reveal: "Because they knew how to keep their code dry. ☔",
  },
  {
    id: "joke-skeleton",
    category: "joke",
    text: "Why didn't the skeleton go to the party?",
    reveal: "Because he had no body to go with!",
  },
  {
    id: "joke-computer-cold",
    category: "joke",
    text: "Why did the computer catch a cold?",
    reveal: "It left its Windows open!",
  },
  {
    id: "joke-math-book",
    category: "joke",
    text: "Why was the math book sad?",
    reveal: "Because it had too many problems.",
  },
  {
    id: "joke-array",
    category: "joke",
    text: "Why did the two arrays break up?",
    reveal: "They just weren't on the same index.",
  },
  {
    id: "joke-egg",
    category: "joke",
    text: "How do you make an egg laugh?",
    reveal: "Tell it a yolk!",
  },

  // ── Animals ──────────────────────────────────────────────────────────────
  {
    id: "animal-sea-otter",
    category: "animal",
    text: "Sea otters hold hands while they sleep so they don't drift apart in the water. 🦦",
  },
  {
    id: "animal-elephant",
    category: "animal",
    text: "Elephants are the only animals that can't jump — but they can swim really well!",
  },
  {
    id: "animal-axolotl",
    category: "animal",
    text: "The axolotl can regrow whole body parts, including parts of its brain!",
  },
  {
    id: "animal-cow-best-friends",
    category: "animal",
    text: "Cows have best friends and get stressed when they're kept apart.",
  },
  {
    id: "animal-penguin",
    category: "animal",
    text: "A group of penguins in the water is called a 'raft', but on land it's called a 'waddle'. 🐧",
  },
  {
    id: "animal-sloth",
    category: "animal",
    text: "Sloths are so slow that algae grows on their fur, which helps them hide!",
  },
  {
    id: "animal-hummingbird",
    category: "animal",
    text: "A hummingbird can flap its wings about 50 times every second.",
  },
  {
    id: "animal-wombat",
    category: "animal",
    text: "Wombats make poop shaped like little cubes so it won't roll away!",
  },

  // ── Python challenges ────────────────────────────────────────────────────
  {
    id: "challenge-print-repeat",
    category: "challenge",
    text: 'What does this print?\n\nprint("ha" * 3)',
    reveal: 'It prints: hahaha\n\nMultiplying a string repeats it that many times!',
  },
  {
    id: "challenge-len",
    category: "challenge",
    text: 'What number does this print?\n\nprint(len("hello"))',
    reveal: "It prints: 5\n\nlen() counts how many characters are in the word.",
  },
  {
    id: "challenge-add",
    category: "challenge",
    text: "What does this print?\n\nx = 2\ny = 3\nprint(x + y)",
    reveal: "It prints: 5",
  },
  {
    id: "challenge-list-first",
    category: "challenge",
    text: 'What does this print?\n\nfruits = ["apple", "banana", "cherry"]\nprint(fruits[0])',
    reveal: "It prints: apple\n\nLists start counting at 0, so the first item is [0]!",
  },
  {
    id: "challenge-upper",
    category: "challenge",
    text: 'What does this print?\n\nprint("wow".upper())',
    reveal: "It prints: WOW\n\n.upper() makes every letter a capital.",
  },
  {
    id: "challenge-range",
    category: "challenge",
    text: "How many times does this loop say hi?\n\nfor i in range(4):\n    print('hi')",
    reveal: "4 times! range(4) gives 0, 1, 2, 3.",
  },
  {
    id: "challenge-bool",
    category: "challenge",
    text: "What does this print?\n\nprint(10 > 3)",
    reveal: "It prints: True\n\n10 really is bigger than 3.",
  },
  {
    id: "challenge-mod",
    category: "challenge",
    text: "What does this print?\n\nprint(7 % 2)",
    reveal: "It prints: 1\n\nThe % sign gives the remainder after dividing. 7 ÷ 2 leaves 1 left over.",
  },

  // ── Riddles ──────────────────────────────────────────────────────────────
  {
    id: "riddle-keyboard",
    category: "riddle",
    text: "I have keys but open no locks. I have space but no room. You can enter, but you can't go inside. What am I?",
    reveal: "A keyboard!",
  },
  {
    id: "riddle-echo",
    category: "riddle",
    text: "I speak without a mouth and hear without ears. I have no body, but I come alive with the wind. What am I?",
    reveal: "An echo!",
  },
  {
    id: "riddle-map",
    category: "riddle",
    text: "I have cities but no houses, forests but no trees, and water but no fish. What am I?",
    reveal: "A map!",
  },
  {
    id: "riddle-candle",
    category: "riddle",
    text: "The more you take away from me, the bigger I get. What am I?",
    reveal: "A hole!",
  },
  {
    id: "riddle-letter-m",
    category: "riddle",
    text: "What is at the beginning of the word 'monkey', at the end of 'time', and twice in the word 'moment'?",
    reveal: "The letter M!",
  },
  {
    id: "riddle-footsteps",
    category: "riddle",
    text: "The more of me there is, the less you see. What am I?",
    reveal: "Darkness!",
  },
  {
    id: "riddle-towel",
    category: "riddle",
    text: "What gets wetter and wetter the more it dries?",
    reveal: "A towel!",
  },
  {
    id: "riddle-clock",
    category: "riddle",
    text: "I have hands but cannot clap. I have a face but never smile. What am I?",
    reveal: "A clock!",
  },
];

/** Small, stable string hash (djb2). Deterministic across renders/devices. */
function hashString(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  // Force to a positive 32-bit integer.
  return hash >>> 0;
}

/**
 * Picks the surprise for a given login. The same `loginKey` always yields the
 * same surprise (so it's steady while the student navigates around during a
 * session), but a new login produces a new key and a fresh surprise.
 *
 * `previousId` is the id shown at the last login; when the seed happens to land
 * on it again we nudge to the next entry so it never repeats twice in a row.
 */
export function surpriseForLogin(
  loginKey: string,
  previousId?: string | null
): Surprise {
  const pool = SURPRISES;
  let index = hashString(loginKey) % pool.length;
  if (pool.length > 1 && pool[index].id === previousId) {
    index = (index + 1) % pool.length;
  }
  return pool[index];
}

export function getSurpriseById(id: string): Surprise | undefined {
  return SURPRISES.find((s) => s.id === id);
}

export function revealLabelFor(surprise: Surprise): string {
  return surprise.revealLabel ?? DEFAULT_REVEAL_LABEL[surprise.category];
}
