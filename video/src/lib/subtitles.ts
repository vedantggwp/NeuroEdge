import type { SubtitleEntry } from "../components/Subtitle";

/**
 * Subtitle entries per scene.
 * Script source: docs/plans/2026-03-07-remotion-pitch-video-design.md
 * Each scene's frame counter starts at 0.
 */

// S01: Sarah's Morning (750 frames / 25s) — Speaker: Shashwati
export const SUBTITLES_S01: readonly SubtitleEntry[] = [
  { text: "This is Sarah.", start: 5, end: 55 },
  { text: "She's 34, she lives in Liverpool, and she's partially sighted.", start: 55, end: 125 },
  { text: "This morning, she wants to order birthday flowers for her mum.", start: 130, end: 210 },
  { text: "She finds a local florist online — Bloom and Petal. Beautiful website.", start: 215, end: 310 },
  { text: "But when her screen reader hits the checkout button… nothing happens.", start: 315, end: 410 },
  { text: "No label. No focus. The page just stops.", start: 415, end: 480 },
  { text: "Sarah tries three more times. Then she closes the tab.", start: 490, end: 600 },
] as const;

// S02: Sarah Isn't Alone (600 frames / 20s) — Speaker: Shashwati
export const SUBTITLES_S02: readonly SubtitleEntry[] = [
  { text: "Sarah isn't alone.", start: 5, end: 60 },
  { text: "94.8% of the top million websites have accessibility failures.", start: 70, end: 170 },
  { text: "That's 51 errors per homepage.", start: 175, end: 265 },
  { text: "And in the UK, 24% of the population — 16 million people — are now disabled.", start: 270, end: 400 },
  { text: "Most businesses have no idea their websites are shutting them out.", start: 410, end: 560 },
] as const;

// S03: The Money & The Law (600 frames / 20s) — Speaker: Shashwati
export const SUBTITLES_S03: readonly SubtitleEntry[] = [
  { text: "Those 16 million people control 274 billion pounds a year in spending.", start: 5, end: 100 },
  { text: "7 in 10 of them click away from sites they can't use.", start: 105, end: 200 },
  { text: "And here's what most business owners don't realise — this isn't optional.", start: 205, end: 300 },
  { text: "The Equality Act 2010 makes it a legal obligation.", start: 310, end: 400 },
  { text: "The European Accessibility Act is now in force.", start: 405, end: 490 },
  { text: "This isn't coming. It's here.", start: 495, end: 570 },
] as const;

// S04: Enter NeuroEdge (750 frames / 25s) — Speaker: Vedant
export const SUBTITLES_S04: readonly SubtitleEntry[] = [
  { text: "That florist had no idea their checkout was broken.", start: 5, end: 70 },
  { text: "They're not bad people — they just didn't know.", start: 70, end: 130 },
  { text: "That's where NeuroEdge comes in.", start: 135, end: 210 },
  { text: "We scan any website for accessibility issues and translate the results into plain English.", start: 215, end: 340 },
  { text: "Not error codes. Not developer jargon.", start: 345, end: 420 },
  { text: "A report that says: your checkout button is invisible to screen readers.", start: 425, end: 560 },
  { text: "Disabled visitors can't complete purchases. Here's how to fix it.", start: 565, end: 700 },
] as const;

// S05: How It Works (450 frames / 15s) — Speaker: Vedant
export const SUBTITLES_S05: readonly SubtitleEntry[] = [
  { text: "Five steps. Enter a URL.", start: 5, end: 75 },
  { text: "We run WCAG 2.2 scans. AI interprets the results.", start: 80, end: 170 },
  { text: "You get a branded report with a score, priority fixes, and revenue at risk.", start: 175, end: 300 },
  { text: "For premium clients — a personal walkthrough.", start: 305, end: 410 },
] as const;

// S06: Who We Serve & What It Costs (600 frames / 20s) — Speaker: Shashwati
export const SUBTITLES_S06: readonly SubtitleEntry[] = [
  { text: "We built this for UK SMEs — 5 to 50 employees, businesses that have never heard of WCAG.", start: 5, end: 120 },
  { text: "A free scan gives them their score and top 3 issues.", start: 125, end: 210 },
  { text: "Full report: 29 to 49 pounds. Video walkthrough: 99 pounds.", start: 215, end: 310 },
  { text: "And our monitoring agent checks weekly for 19 pounds a month — recurring revenue.", start: 315, end: 430 },
  { text: "100 subscribers gets us to 22,800 pounds ARR.", start: 435, end: 560 },
] as const;

// S07: Where We Sit (450 frames / 15s) — Speaker: Vedant
export const SUBTITLES_S07: readonly SubtitleEntry[] = [
  { text: "We're not competing with enterprise tools that cost thousands.", start: 5, end: 100 },
  { text: "We're not another overlay that hides problems without fixing them.", start: 105, end: 210 },
  { text: "We sit in the gap — affordable, honest, readable.", start: 215, end: 320 },
  { text: "Audit and explain.", start: 325, end: 410 },
] as const;

// S08: The Team (450 frames / 15s) — Speaker: Both
export const SUBTITLES_S08: readonly SubtitleEntry[] = [
  { text: "I'm Shashwati — MSc Advanced Marketing.", start: 5, end: 80 },
  { text: "I design the audit methodology, the reports, and the go-to-market.", start: 85, end: 180 },
  { text: "I'm Vedant — MSc Computer Science, former agency co-founder.", start: 185, end: 290 },
  { text: "I build the scanning engine, the AI pipeline, and the product.", start: 295, end: 410 },
] as const;

// S09: The Plan & The Ask (600 frames / 20s) — Speaker: Shashwati
export const SUBTITLES_S09: readonly SubtitleEntry[] = [
  { text: "We're asking for 5,000 pounds.", start: 5, end: 75 },
  { text: "500 for user research with disabled testers. 1,000 for marketing. 400 for AI infrastructure.", start: 80, end: 200 },
  { text: "The rest for design, legal, and workshops.", start: 205, end: 290 },
  { text: "April: build the MVP. May: pilot with 20 Liverpool SMEs.", start: 300, end: 400 },
  { text: "By September — 100 customers, 30 monitoring subscribers, and over 5,000 pounds recovered.", start: 405, end: 520 },
  { text: "At 100 subscribers, that's 22,800 pounds ARR.", start: 525, end: 570 },
] as const;

// S10: The Flowers Arrive (600 frames / 20s) — Speaker: Shashwati
export const SUBTITLES_S10: readonly SubtitleEntry[] = [
  { text: "Three weeks later, the florist at Bloom and Petal runs a NeuroEdge audit.", start: 5, end: 85 },
  { text: "Scores 34 out of 100. Fixes 23 issues — including that checkout button.", start: 90, end: 180 },
  { text: "Sarah visits again.", start: 185, end: 250 },
  { text: "This time, the flowers arrive on her mum's birthday.", start: 255, end: 340 },
  { text: "Every audit we sell is a barrier removed, a customer unlocked, and a legal risk reduced.", start: 345, end: 470 },
  { text: "This is NeuroEdge.", start: 475, end: 570 },
] as const;
