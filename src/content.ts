// ─── Terminal OSC 8 Hyperlink Helper ─────────────────────────────
/**
 * Generates an OSC 8 terminal hyperlink escape sequence.
 * Clickable in modern terminals: Windows Terminal, iTerm2, VS Code, Alacritty, WezTerm, etc.
 * Opens on client-side terminal without needing server-side browser execution.
 */
export function terminalLink(text: string, url: string): string {
  return `\x1b]8;;${url}\x07${text}\x1b]8;;\x07`;
}

// ─── Site Metadata ──────────────────────────────────────────────
export const SITE_META = {
  domain: "ssh.riteshgharat.in",
  author: "Ritesh Gharat",
  badge: "[connected]",
} as const;

// ─── Navigation Directories & Shortcuts ─────────────────────────
export const DIRECTORIES = ["about/", "projects/", "contact/"] as const;
export type DirectoryRoute = "about" | "projects" | "contact";

export const KEYBOARD_SHORTCUTS = {
  main: "[← →] navigate    [↵] enter    [t] theme    [q] quit",
  about: "[ESC] cd ..    [t] theme    [q] quit",
  projects: "[ESC] cd ..    [↑ ↓] select    [1-4] jump    [t] theme    [q] quit",
  contact: "[ESC] cd ..    [t] theme    [q] quit",
} as const;

// ─── Main Screen Typewriter Bio ─────────────────────────────────
export const BIO_TEXT =
  "is a builder creating systems, tools, and intelligent applications. He works across AI, embedded devices, and full-stack systems, focused on building things that are practical, efficient, and real. His work explores the edge of systems, intelligence, and real-world impact.";

// ─── Projects Data ──────────────────────────────────────────────
export interface Project {
  id: string;
  num: string;
  shortName: string;
  name: string;
  tech: string[];
  status: string;
  statusSymbol: string;
  url: string;
  desc: string[];
}
export const PROJECTS: Project[] = [
  {
    id: "6sense",
    num: "01",
    shortName: "6Sense",
    name: "6Sense — Edge AI Surveillance",
    tech: ["YOLOv11", "TensorRT", "MiniCPM-V", "FastAPI", "Next.js"],
    status: "SHIPPED",
    statusSymbol: "✓",
    url: "https://github.com/riteshgharat/6sense",
    desc: [
      "Edge-native AI CCTV anomaly detection: YOLOv11",
      "pre-filter + vision-language reasoning, 100%",
      "on-device. Part 1 shipped & benchmarked.",
    ],
  },
  {
    id: "tamx",
    num: "02",
    shortName: "TAMX",
    name: "TAMX — ESP32 Handheld",
    tech: ["ESP32", "C++", "SSD1306", "Groq"],
    status: "ACTIVE",
    statusSymbol: "◈",
    url: "https://github.com/riteshgharat/tamx",
    desc: [
      "ESP32 handheld multi-tool built from scratch:",
      "Wi-Fi tools, Groq AI chat, graphing calculator,",
      "PPT remote. Tamagotchi-sized, zero regrets.",
    ],
  },
  {
    id: "clinico",
    num: "03",
    shortName: "Clinico",
    name: "Clinico — Healthcare Platform",
    tech: ["React", "Bun", "PostgreSQL", "WhatsApp", "Sarvam AI"],
    status: "SHIPPED",
    statusSymbol: "✓",
    url: "https://github.com/riteshgharat/clinico",
    desc: [
      "Clinic management with WhatsApp booking and an",
      "AI voice-to-voice receptionist. TechBlitz 2026",
      "First Prize.",
    ],
  },

];


// ─── About Screen Content ───────────────────────────────────────
export interface AboutSection {
  id: string;
  title: string;
  items: string[];
}

export const ABOUT_INTRO = [
  "builder, maker, indi-hacker",
  "Working at the edge of systems, intelligence,",
  "and real-world impact.",
];

export const ABOUT_SECTIONS: AboutSection[] = [
  {
    id: "stack",
    title: "▸ STACK",
    items: [
      "Full-Stack  ·  Embedded Systems  ·  Applied AI",
      "React  ·  Nodejs/Bun  ·  FastAPI",
      "Docker  ·  Git  ·  Linux  ·  TensorFlow",
      "LLMs  ·  Generative AI  ·  RAG",
    ],
  },
  {
    id: "approach",
    title: "▸ APPROACH",
    items: [
      "Build things that are practical, scalable,",
      "and go beyond traditional software.",
      "Ship things that actually run in the real world.",
    ],
  },
  {
    id: "philosophy",
    title: "▸ PHILOSOPHY",
    items: [
      '"Be Unrealistic!"',
    ],
  },
  {
    id: "exploring",
    title: "▸ CURRENTLY EXPLORING",
    items: [
      "· Edge AI & on-device inference",
      "· AI tooling",
      "· Hardware experimentation (ESP32)",
      "· Applied VLM on embedded targets",
    ],
  },
];

// ─── Contact Screen Content ─────────────────────────────────────
export interface ContactItem {
  id: string;
  label: string;
  value: string;
  url: string;
}

export const CONTACT_ITEMS: ContactItem[] = [
  {
    id: "portfolio",
    label: "PORTFOLIO",
    value: "riteshgharat.in",
    url: "https://riteshgharat.in",
  },
  {
    id: "github",
    label: "GITHUB",
    value: "riteshgharat",
    url: "https://github.com/riteshgharat",
  },
  {
    id: "linkedin",
    label: "LINKEDIN",
    value: "/in/riteshgharat",
    url: "https://www.linkedin.com/in/riteshgharat/",
  },
  {
    id: "twitter",
    label: "TWITTER / X",
    value: "@hsetir_0",
    url: "https://x.com/hsetir_0",
  },
  {
    id: "email",
    label: "EMAIL",
    value: "riteshgharat@gmail.com",
    url: "mailto:riteshgharat@gmail.com",
  },
];
