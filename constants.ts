import { TileData } from './types';

export const BOARD_SIZE = 20;

export const TILES: TileData[] = [
  {
    id: 1,
    title: "Start",
    description: "Start here!",
    type: "start",
    category: "general"
  },
  {
    id: 2,
    title: "Introduce Myself",
    description: "Tell us your Name, Age, and where you live.",
    type: "task",
    category: "roleplay",
    prompt: "The user is introducing themselves. Verify if they included a name, an age, and a location. Be encouraging."
  },
  {
    id: 3,
    title: "Count to 30",
    description: "Can you count from 1 to 30?",
    type: "task",
    category: "speaking",
    prompt: "The user will try to count to 30. If they type it out or say they did it, congratulate them. You can also ask them to count by 5s for extra credit."
  },
  {
    id: 4,
    title: "Family Intro",
    description: "Introduce your family members.",
    type: "task",
    category: "roleplay",
    prompt: "The user is talking about their family. Ask a follow-up question like 'Do you have any brothers or sisters?' or compliment their description."
  },
  {
    id: 5,
    title: "Pronunciation",
    description: "Pronounce these words correctly:",
    content: ["Is", "He", "Sister", "Fin", "Policeman", "Niece", "Sit"],
    type: "task",
    category: "speaking",
    prompt: "Read these words out loud for the user using TTS."
  },
  {
    id: 6,
    title: "He vs She",
    description: "Point to He - She. Explain the difference.",
    type: "task",
    category: "grammar",
    prompt: "The user is explaining 'He' vs 'She'. Verify they understand 'He' is for boys/men and 'She' is for girls/women."
  },
  {
    id: 7,
    title: "Family Chat",
    description: "Ask and reply about family members (Name, Age, Live in).",
    type: "task",
    category: "roleplay",
    prompt: "Act as a conversation partner. Ask the user about their family member's name, age, or where they live."
  },
  {
    id: 8,
    title: "Cursive Writing",
    description: "Write this sentence: 'My sister is a doctor.'",
    type: "task",
    category: "writing",
    prompt: "Check if the user typed the sentence correctly: 'My sister is a doctor.' Case sensitive checks are not needed, but spelling is."
  },
  {
    id: 9,
    title: "Countries",
    description: "Name 5 Countries.",
    type: "task",
    category: "vocabulary",
    prompt: "The user lists countries. Verify there are at least 5 valid countries."
  },
  {
    id: 10,
    title: "Nationalities",
    description: "Name 6 Nationalities.",
    type: "task",
    category: "vocabulary",
    prompt: "The user lists nationalities (e.g., American, Algerian). Verify there are at least 6."
  },
  {
    id: 11,
    title: "Languages",
    description: "Name 4 Languages.",
    type: "task",
    category: "vocabulary",
    prompt: "The user lists languages. Verify there are at least 4 valid languages."
  },
  {
    id: 12,
    title: "Pronunciation",
    description: "Pronounce these words correctly:",
    content: ["Shark", "Fish", "Chips", "Cheese", "Chat"],
    type: "task",
    category: "speaking",
    prompt: "Use TTS to read these words."
  },
  {
    id: 13,
    title: "Complete It",
    description: "Fill in: 'Hello! My name is... I am ... years old. I am Algerian.'",
    type: "task",
    category: "writing",
    prompt: "Verify the user filled in the blanks sensibly for the sentence: 'Hello! My name is [Name]. I am [Age] years old. I am Algerian.'"
  },
  {
    id: 14,
    title: "Friend Chat",
    description: "Ask and reply about a friend (Name, Age, Nationality, Language, Lives in).",
    type: "task",
    category: "roleplay",
    prompt: "Roleplay as the user's friend. Let them ask you questions about your name, age, etc., or ask them questions."
  },
  {
    id: 15,
    title: "School Facilities",
    description: "Name 4 School Facilities (e.g., Classroom, Gym).",
    type: "task",
    category: "vocabulary",
    prompt: "Verify the user lists at least 4 school facilities."
  },
  {
    id: 16,
    title: "Pronunciation",
    description: "Pronounce these words correctly:",
    content: ["Classroom", "Look", "Pool", "Food", "Foot", "Spoon"],
    type: "task",
    category: "speaking",
    prompt: "Use TTS."
  },
  {
    id: 17,
    title: "School Chat",
    description: "Ask and reply about: My friend's school.",
    type: "task",
    category: "roleplay",
    prompt: "Ask the user 3 questions about their friend's school."
  },
  {
    id: 18,
    title: "Pronunciation",
    description: "Pronounce these words correctly:",
    content: ["The", "Mother", "Brother", "There"],
    type: "task",
    category: "speaking",
    prompt: "Use TTS."
  },
  {
    id: 19,
    title: "Locate",
    description: "Describe where school facilities are (e.g., 'The library is next to the lab').",
    type: "task",
    category: "vocabulary",
    prompt: "Verify the user uses prepositions of place correctly (next to, behind, in front of, etc.)."
  },
  {
    id: 20,
    title: "Game Over",
    description: "You finished the game! Congratulations!",
    type: "finish",
    category: "general"
  }
];

export const PLAYER_COLORS = {
  red: 'bg-red-500 border-red-700',
  blue: 'bg-blue-500 border-blue-700',
  green: 'bg-green-500 border-green-700',
  yellow: 'bg-yellow-400 border-yellow-600'
};

export const PLAYER_BG = {
  red: 'bg-red-100',
  blue: 'bg-blue-100',
  green: 'bg-green-100',
  yellow: 'bg-yellow-100'
};