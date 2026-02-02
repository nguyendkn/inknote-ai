import type { Metadata } from "next";
import { NotesProvider } from "@/lib/contexts/NotesContext";
import { NotebooksProvider } from "@/lib/contexts/NotebooksContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "InkNote AI",
  description: "AI-powered markdown note-taking app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overflow-hidden">
      <body className="font-sans antialiased overflow-hidden">
        <NotebooksProvider>
          <NotesProvider>{children}</NotesProvider>
        </NotebooksProvider>
      </body>
    </html>
  );
}
