"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, Square } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A "Read to me" button backed by the browser's built-in speech engine
 * (SpeechSynthesis). No network, no cost, works offline.
 *
 * Reading is a bottleneck for many neurodivergent kids; hearing the words
 * removes it. The rate is slightly slowed for comfort, and only one utterance
 * can play at a time across the whole page.
 */
export function ReadAloud({
  text,
  label = "Read to me",
  className,
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [supported, setSupported] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setSupported(
      typeof window !== "undefined" && "speechSynthesis" in window
    );
    // Stop any speech if this button unmounts (e.g. navigating away).
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        if (utteranceRef.current) window.speechSynthesis.cancel();
      }
    };
  }, []);

  function stop() {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }

  function toggle() {
    if (!("speechSynthesis" in window)) return;
    if (speaking) {
      stop();
      return;
    }
    // Cancel anything another button on the page might be saying first.
    window.speechSynthesis.cancel();

    const clean = text.replace(/\s+/g, " ").trim();
    if (!clean) return;

    const u = new SpeechSynthesisUtterance(clean);
    u.rate = 0.92; // a touch slower than default for younger readers
    u.pitch = 1;
    u.lang = "en-US";
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    utteranceRef.current = u;
    setSpeaking(true);
    window.speechSynthesis.speak(u);
  }

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={speaking ? "Stop reading" : label}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors",
        speaking
          ? "border-brand-200 bg-brand-50 text-brand-700"
          : "border-gray-200 bg-white text-gray-600 hover:border-brand-200 hover:text-brand-600",
        className
      )}
    >
      {speaking ? (
        <>
          <Square className="h-4 w-4 fill-current" />
          Stop
        </>
      ) : (
        <>
          <Volume2 className="h-4 w-4" />
          {label}
        </>
      )}
    </button>
  );
}
