"use client";

import { useState } from "react";
import { Volume2, Loader2 } from "lucide-react";

interface Props {
  mp3: string | null;
  ogg: string | null;
  label?: string;
}

export default function AudioButton({ mp3, ogg, label }: Props) {
  const [playing, setPlaying] = useState(false);

  const play = async () => {
    const src = mp3 || ogg;
    if (!src || playing) return;
    setPlaying(true);
    const audio = new Audio(src);
    audio.onended = () => setPlaying(false);
    audio.onerror = () => setPlaying(false);
    try {
      await audio.play();
    } catch {
      setPlaying(false);
    }
  };

  return (
    <button
      onClick={play}
      disabled={playing}
      className="p-1 rounded-full hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors disabled:opacity-50"
      aria-label={label}
      title={label}
    >
      {playing ? (
        <Loader2 size={13} className="animate-spin text-blue-500" />
      ) : (
        <Volume2 size={13} />
      )}
    </button>
  );
}
