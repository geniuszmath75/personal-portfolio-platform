import {
  BlockKind,
  ISectionType,
  ProjectSourceType,
  ProjectStatusType,
  UserSchemaRole,
} from "../../shared/types/enums";
import type { Block } from "../../shared/types";

/** Stable project title used as the idempotent upsert key. */
export const SEED_PROJECT_TITLE = "Brick Breaker Game";

export const SEED_SECTION_SLUGS = {
  hero: "home-hero",
  skills: "home-skills",
  contact: "home-contact",
  aboutMe: "about-me",
} as const;

export type SeedSectionInput = {
  slug: string;
  title?: string;
  type: ISectionType;
  order: number;
  blocks: Block[];
};

export const seedSections: SeedSectionInput[] = [
  {
    slug: SEED_SECTION_SLUGS.hero,
    type: ISectionType.HERO,
    order: 1,
    blocks: [
      {
        kind: BlockKind.PARAGRAPH,
        paragraphs: ["Turn ideas into reality with code & creativity"],
      },
      {
        kind: BlockKind.BUTTON,
        buttons: ["PROJECTS", "ABOUT ME"],
      },
      {
        kind: BlockKind.IMAGE,
        images: [
          {
            srcPath: "/images/hero-image.png",
            altText: "Hero portrait placeholder",
          },
        ],
      },
    ],
  },
  {
    slug: SEED_SECTION_SLUGS.skills,
    title: "Skills",
    type: ISectionType.SKILLS,
    order: 2,
    blocks: [
      {
        kind: BlockKind.GROUP,
        header: "FRONTEND",
        items: [
          {
            icon: "mdi:language-html5",
            label: "HTML",
          },
          {
            icon: "mdi:language-css3",
            label: "CSS",
          },
          {
            icon: "mdi:language-javascript",
            label: "JavaScript",
          },
          {
            icon: "mdi:language-typescript",
            label: "TypeScript",
          },
          {
            icon: "simple-icons:tailwindcss",
            label: "TailwindCSS",
          },
          {
            icon: "simple-icons:nuxt",
            label: "Nuxt 4",
          },
        ],
      },
      {
        kind: BlockKind.GROUP,
        header: "BACKEND/DATABASES",
        items: [
          {
            icon: "mdi:language-java",
            label: "Java",
          },
          {
            icon: "simple-icons:spring",
            label: "Spring",
          },
          {
            icon: "simple-icons:postgresql",
            label: "PostgreSQL",
          },
          {
            icon: "simple-icons:mongodb",
            label: "MongoDB",
          },
          {
            icon: "simple-icons:mysql",
            label: "MySQL",
          },
        ],
      },
      {
        kind: BlockKind.GROUP,
        header: "CI/CD",
        items: [
          {
            icon: "mdi:git",
            label: "Git",
          },
        ],
      },
      {
        kind: BlockKind.GROUP,
        header: "AI TOOLS",
        items: [
          {
            icon: "simple-icons:githubcopilot",
            label: "GitHub Copilot",
          },
        ],
      },
      {
        kind: BlockKind.PARAGRAPH,
        paragraphs: [
          "A quick look at the languages, frameworks, and tools I'm comfortable working with.",
        ],
      },
    ],
  },
  {
    slug: SEED_SECTION_SLUGS.contact,
    title: "Get In Touch",
    type: ISectionType.CONTACT,
    order: 3,
    blocks: [
      {
        kind: BlockKind.PARAGRAPH,
        paragraphs: [
          "Have an idea for a project, need a developer on your team, or just want to chat about code?",
          "I'm always open to new opportunities and collaborations.",
          "Feel free to reach out — I’ll get back to you as soon as possible.",
        ],
      },
      {
        kind: BlockKind.GROUP,
        items: [
          {
            icon: "mdi:email",
            label: "damianjudka4500@gmail.com",
          },
          {
            icon: "mdi:phone",
            label: "+48 123 456 789",
          },
          {
            icon: "mdi:linkedin",
            label: "https://www.linkedin.com/in/damian-judka-8b0492248/",
          },
          {
            icon: "mdi:facebook",
            label: "https://www.facebook.com/damian.judka.1",
          },
        ],
      },
    ],
  },
  {
    slug: SEED_SECTION_SLUGS.aboutMe,
    title: "About me",
    type: ISectionType.ABOUT_ME,
    order: 1,
    blocks: [
      {
        kind: BlockKind.PARAGRAPH,
        paragraphs: [
          "Hello,",
          "My name is Damian. I am currently a third-year part-time student of Computer Science. I have built a couple of projects using Java, C# (.NET) and TypeScript/JavaScript languages so far.",
          "I got experience with various type of databases like: PostgreSQL, MySQL or MongoDB. I am always eager to learn new things, especially these related with software engineering and design patterns.",
          "In my free time I often listen to music (EDM, dance), play video games. Twice a week, I attend volleball training.",
        ],
      },
      {
        kind: BlockKind.IMAGE,
        images: [
          {
            srcPath: "/images/hero-image.png",
            altText: "About me image",
          },
        ],
      },
      {
        kind: BlockKind.GROUP,
        items: [
          {
            icon: "mdi:briefcase",
            label: "Vue + TypeScript + Nuxt",
          },
          {
            icon: "mdi:location",
            label: "Cracov, Poland",
          },
        ],
      },
    ],
  },
];

export const seedProject = {
  title: SEED_PROJECT_TITLE,
  technologies: ["Java", "Swing", "MVC Pattern"],
  startDate: new Date("2024-06-30T00:00:00.000Z"),
  endDate: new Date("2024-09-29T00:00:00.000Z"),
  shortDescription: "Classic brick breaker game built in Java",
  longDescription:
    "A complete desktop game implementing physics, multiple levels, and custom brick layouts.",
  projectSource: ProjectSourceType.UNIVERSITY,
  status: ProjectStatusType.COMPLETED,
  githubLink: "https://github.com/geniuszmath75/brick-breaker-game",
  websiteLink: null,
  mainImage: {
    srcPath: "/logo/og-default.png",
    altText: "Sample project cover",
  },
  otherImages: [
    {
      srcPath: "/images/projects/project5.jpg",
      altText: "project5.jpg",
    },
    {
      srcPath: "/images/projects/project6.jpg",
      altText: "project6.jpg",
    },
    {
      srcPath: "/images/projects/project1.jpg",
      altText: "project1.jpg",
    },
  ],
  gainedExperience: [
    "Improved understanding of object-oriented design and MVC pattern in Java.",
    "Learned to handle collision detection and physics in 2D games.",
    "Practiced building modular architecture for scalable game logic.",
  ],
};

export { UserSchemaRole };
