"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { Theme, type EmojiClickData } from "emoji-picker-react";

// Dynamic import to avoid SSR issues with emoji-picker-react
const EmojiPickerLib = dynamic(() => import("emoji-picker-react"), {
  ssr: false,
});

interface EmojiPickerProps {
  onEmojiClick: (emojiData: EmojiClickData) => void;
}

export default function EmojiPicker({ onEmojiClick }: EmojiPickerProps) {
  const { resolvedTheme } = useTheme();

  // Map resolved theme to emoji-picker-react theme
  const emojiPickerTheme = useMemo<Theme>(() => {
    if (resolvedTheme === "dark") return Theme.DARK;
    if (resolvedTheme === "light") return Theme.LIGHT;
    return Theme.AUTO; // fallback for system theme
  }, [resolvedTheme]);

  return (
    <EmojiPickerLib
      onEmojiClick={onEmojiClick}
      theme={emojiPickerTheme}
      skinTonesDisabled={false}
      previewConfig={{ showPreview: false }}
    />
  );
}
