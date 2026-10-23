"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import type { SimliClient } from "simli-client";
import { pcmChunks } from "@/lib/speech/pcm";
import type { VoicePref } from "@/lib/speech/voicePref";

// The teacher's face on a voice call: a Simli session that renders a
// talking face from the audio we send it. Only our synthesized voice goes
// out; the learner's camera is never asked for. The face's own audio is
// muted: the reply plays through the call's existing <audio> element, as
// it always has, so iOS playback and replay keep working, and starts when
// the face starts moving.
//
// "off": not wanted. "unavailable": not configured, or not allowed for this
// learner. "failed": tried and lost. In all three the illustrated teacher
// stays.

export type VideoTeacherStatus = "off" | "connecting" | "live" | "failed" | "unavailable";

const PREF_KEY = "saylo:video-teacher";
// How long a reply waits for the face to start moving before it plays anyway.
const MAX_LIP_WAIT_MS = 700;

export function loadVideoTeacherPref(): boolean {
  try {
    return localStorage.getItem(PREF_KEY) !== "off";
  } catch {
    return true;
  }
}

export function saveVideoTeacherPref(on: boolean) {
  try {
    localStorage.setItem(PREF_KEY, on ? "on" : "off");
  } catch {
    // Blocked storage: the choice lasts for this call only.
  }
}

// The <video> and <audio> elements belong to the screen; the session
// attaches to them once they are mounted.
export function useVideoTeacher(
  videoRef: RefObject<HTMLVideoElement | null>,
  audioRef: RefObject<HTMLAudioElement | null>,
) {
  const clientRef = useRef<SimliClient | null>(null);
  const runRef = useRef(0);
  const waitersRef = useRef<(() => void)[]>([]);
  const [status, setStatus] = useState<VideoTeacherStatus>("off");

  const release = useCallback(() => {
    runRef.current++;
    const client = clientRef.current;
    clientRef.current = null;
    waitersRef.current.splice(0).forEach((resolve) => resolve());
    if (client) void client.stop().catch(() => undefined);
  }, []);

  const stop = useCallback(() => {
    release();
    setStatus("off");
  }, [release]);

  const start = useCallback(
    async (voice: VoicePref) => {
      release();
      const run = runRef.current;
      setStatus("connecting");
      try {
        const res = await fetch("/api/teacher-video/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ voice }),
        });
        if (run !== runRef.current) return;
        if (!res.ok) {
          setStatus(res.status === 404 || res.status === 403 ? "unavailable" : "failed");
          return;
        }
        const { sessionToken, iceServers } = (await res.json()) as { sessionToken: string; iceServers: RTCIceServer[] };
        const { SimliClient, LogLevel } = await import("simli-client");
        if (run !== runRef.current || !videoRef.current || !audioRef.current) return;
        const client = new SimliClient(sessionToken, videoRef.current, audioRef.current, iceServers, LogLevel.ERROR, "p2p");
        clientRef.current = client;
        client.on("speaking", () => {
          waitersRef.current.splice(0).forEach((resolve) => resolve());
        });
        const lost = () => {
          if (run !== runRef.current) return;
          release();
          setStatus("failed");
        };
        client.on("error", lost);
        client.on("startup_error", lost);
        client.on("stop", lost);
        await client.start();
        if (run === runRef.current) setStatus("live");
      } catch {
        if (run !== runRef.current) return;
        release();
        setStatus("failed");
      }
    },
    [release, videoRef, audioRef],
  );

  // Sends a reply's audio to the face; resolves when the face starts
  // speaking (or after a short wait), which is when the reply should play.
  const speak = useCallback((pcm: ArrayBuffer): Promise<void> => {
    const client = clientRef.current;
    if (!client) return Promise.resolve();
    return new Promise<void>((resolve) => {
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        resolve();
      };
      waitersRef.current.push(finish);
      setTimeout(finish, MAX_LIP_WAIT_MS);
      try {
        for (const chunk of pcmChunks(pcm)) client.sendAudioData(chunk);
      } catch {
        finish();
      }
    });
  }, []);

  // Stops the face mid-sentence (the reply was cut off).
  const hush = useCallback(() => {
    try {
      clientRef.current?.ClearBuffer();
    } catch {
      // Connection already gone.
    }
  }, []);

  useEffect(() => release, [release]);

  return { status, start, stop, speak, hush };
}

export type VideoTeacher = ReturnType<typeof useVideoTeacher>;
