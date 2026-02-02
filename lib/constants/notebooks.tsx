"use client";

import {
  Layout,
  Lightbulb,
  Smartphone,
  Settings,
  Globe,
  Inbox,
  BookOpen,
  Send,
} from "lucide-react";
import { Notebook } from "@/types/notebook";

export const MOCK_NOTEBOOKS: Notebook[] = [
  {
    id: "awesome-saas",
    name: "Awesome SaaS",
    type: "folder",
    isExpanded: true,
    children: [
      {
        id: "desktop-app",
        name: "Desktop app",
        type: "notebook",
        icon: <Layout size={16} />,
      },
      {
        id: "ideas",
        name: "Ideas",
        type: "notebook",
        icon: <Lightbulb size={16} className="text-yellow-400" />,
      },
      {
        id: "mobile-app",
        name: "Mobile app",
        type: "notebook",
        icon: <Smartphone size={16} />,
      },
      {
        id: "operations",
        name: "Operations",
        type: "notebook",
        icon: <Settings size={16} />,
      },
      {
        id: "website",
        name: "Website",
        type: "notebook",
        icon: <Globe size={16} />,
      },
    ],
  },
  { id: "empty", name: "Empty", type: "folder" },
  { id: "hobby", name: "Hobby", type: "folder" },
  { id: "huga", name: "huga", type: "folder" },
  { id: "inbox", name: "Inbox", type: "folder", icon: <Inbox size={16} /> },
  { id: "learn", name: "Learn", type: "folder", icon: <BookOpen size={16} /> },
  {
    id: "publishing",
    name: "Publishing",
    type: "folder",
    icon: <Send size={16} />,
  },
];
