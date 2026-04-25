"use client"

import { useCallback, useRef } from "react"

/**
 * useNewChatSound — plays a pleasant chime when a new chat arrives.
 *
 * Usage:
 *   const playNewChat = useNewChatSound()
 *   // call playNewChat() whenever a new conversation is detected
 */
export function useNewChatSound() {
  const ctxRef = useRef<AudioContext | null>(null)

  const play = useCallback(() => {
    try {
      // Lazily create the AudioContext (browsers require a user gesture first;
      // subsequent programmatic calls are fine once it's been unlocked).
      if (!ctxRef.current) {
        ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      const ctx = ctxRef.current

      // Two-tone chime: a warm "ding-dong"
      const notes = [
        { freq: 880, start: 0,    duration: 0.25 },   // high A
        { freq: 660, start: 0.22, duration: 0.35 },   // E — resolves warmly
      ]

      notes.forEach(({ freq, start, duration }) => {
        const osc  = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.type = "sine"
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start)

        // Quick attack, smooth exponential decay
        gain.gain.setValueAtTime(0, ctx.currentTime + start)
        gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + start + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration)

        osc.start(ctx.currentTime + start)
        osc.stop(ctx.currentTime + start + duration)
      })
    } catch (err) {
      // Silently ignore — audio is non-critical
      console.warn("useNewChatSound: could not play audio", err)
    }
  }, [])

  return play
}