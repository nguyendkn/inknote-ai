import { Note } from "@/types/note";

export const MOCK_NOTES: Note[] = [
  {
    id: "1",
    title: "Create a new PouchDB adapter for op-sqlite",
    updatedAt: new Date(Date.now() - 1000 * 60 * 32), // 32 minutes ago
    tags: ["Awesome SaaS: Mobile app", "Status", "React Native", "Database"],
    notebookId: "ideas",
    content: `# Migration

Specify the absolute path

- [op-sqlite Configuration](https://ospfranco.notion.site/Configuration-6b8b9564afcc4ac6b6b377fe34475090)

\`\`\`typescript
import {
  IOS_LIBRARY_PATH, // Default iOS
  IOS_DOCUMENT_PATH,
  ANDROID_DATABASE_PATH, // Default Android
  ANDROID_FILES_PATH,
  ANDROID_EXTERNAL_FILES_PATH, // Android SD Card
  open,
} from '@op-engineering/op-sqlite';

const db = open({
  name: 'myDb',
  location: Platform.OS === 'ios' ? IOS_LIBRARY_PATH : ANDROID_DATABASE_PATH,
});
\`\`\`

quick-sqlite's [default locations](https://github.com/margelo/react-native-quick-sqlite):

> The library creates/opens databases by appending the passed name plus, the [**documents directory** on iOS]
`,
  },
  {
    id: "2",
    title: "Record a webpage with background transparency using Puppeteer",
    updatedAt: new Date(Date.now() - 1000 * 60 * 31),
    tags: ["Dev"],
    notebookId: "desktop-app",
    content: `# Puppeteer Transparent Recording

Support for transparent video background using Puppeteer.

## Setup

\`\`\`javascript
const browser = await puppeteer.launch({
  args: ['--disable-background-timer-throttling']
});
\`\`\`
`,
  },
  {
    id: "3",
    title: "Migrate ESLint YAML config to flat mjs config",
    updatedAt: new Date(Date.now() - 1000 * 60 * 31),
    tags: ["Maintenance"],
    notebookId: "desktop-app",
    content: `# ESLint Migration

Working on updating this repo to use the new flat config format.

## Steps
1. Create \`eslint.config.mjs\`
2. Convert rules from YAML
3. Test linting
`,
  },
  {
    id: "4",
    title: "Fluid animations with threejs",
    updatedAt: new Date(Date.now() - 1000 * 60 * 31),
    tags: ["Experiment"],
    notebookId: "ideas",
    content: `# Three.js Fluid Animations

Rain & Water Effect Experiments

## Resources
- WebGL water simulation
- Particle systems
- Shader effects
`,
  },
  {
    id: "5",
    title: "Bump up deps of the web app",
    updatedAt: new Date(Date.now() - 1000 * 60 * 33),
    tags: ["Maintenance"],
    notebookId: "website",
    content: `# Dependency Updates

Bump up stripe From 14 to 17.4.0

## Changed
- stripe: 14.x → 17.4.0
- next: 14.x → 15.x
`,
  },
  {
    id: "6",
    title: "Feature idea",
    updatedAt: new Date(Date.now() - 1000 * 60 * 36),
    tags: ["Ideas"],
    notebookId: "ideas",
    content: `# Editor Improvements

Editor hold to select interferes with gesture navigation.

## Proposed Fix
- Add delay before triggering selection
- Consider using long press instead
`,
  },
  {
    id: "7",
    title: "Mermaid diagrams",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 11), // 11 days ago
    tags: ["Docs"],
    notebookId: "learn",
    content: `# Mermaid Diagrams

\`\`\`mermaid
graph LR
A
A --- B
B
B-->C[fa:fa-ban forbidden]
\`\`\`

## Resources
- [Mermaid Live Editor](https://mermaid.live)
`,
  },
];
