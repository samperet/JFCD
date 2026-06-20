# JFCD

A secure, iOS-style group chat **PWA** built with **Next.js 14**. Four friends — Jaya, Fiona, Lucy & Cece — share one thread. Tap a name to join, chat in an authentic iMessage interface, and personalize your avatar.

> Minimum-security demo: no accounts, no passwords, no server. Everything lives on the device.

## Features

- **iOS phone UI** — device frame with Dynamic Island, live status bar, and home indicator on desktop; full-bleed native feel on a real phone.
- **iMessage thread** — grouped bubbles with tails, sender avatars, day/time separators, a "Delivered" receipt, and an animated typing indicator.
- **Tap-to-login** — pick your name from an iOS contacts-style list.
- **Switch user** — iOS bottom sheet with a checkmark on the active user and a notifications toggle.
- **Avatar picker** — bottom sheet with 16 [DiceBear](https://dicebear.com) styles, live preview, and a Shuffle button.
- **PWA** — installable, offline shell caching via service worker, web app manifest, and unread-message notifications.
- **Light & dark mode** — follows the system color scheme.
- **Accessible** — modal focus trap + Escape to close, live-region typing announcements, labeled controls, and AA-contrast text.

## Tech stack

| | |
|---|---|
| Framework | Next.js 14 (App Router, client components) |
| UI | React 18, hand-written iOS design system in CSS |
| State | React Context + `localStorage` persistence |
| Avatars | DiceBear HTTP API |
| PWA | `app/manifest.js` metadata route + `public/sw.js` |

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

```bash
npm run build    # production build
npm start        # serve the production build
```

## Project structure

```
app/
  layout.js          root layout, metadata, viewport, SW registration
  page.js            mounts the store + phone frame
  globals.css        the iOS design system
  manifest.js        PWA manifest (metadata route)
components/
  PhoneFrame.js      device shell (island, status bar, home indicator)
  StatusBar.js       live clock + signal/wifi/battery
  App.js             login vs. chat router
  LoginScreen.js     tap-a-name contacts list
  ChatScreen.js      nav bar + thread + composer + sheets
  NavBar.js          iOS nav bar with member avatars
  MessageList.js     grouping, day stamps, auto-scroll
  MessageRow.js      a single bubble (tails, avatar, receipt)
  TypingRow.js       animated typing indicator
  Composer.js        auto-growing input + send
  Sheet.js           accessible iOS bottom sheet (focus trap, Escape)
  SwitchUserSheet.js / AvatarSheet.js
lib/
  store.js           context, persistence, simulated replies, notifications
  users.js           roster + DiceBear URL helper
public/
  sw.js              offline service worker
```

## Data model

This is a **client-only** app. Messages, the chosen user, and per-user avatars are persisted in `localStorage`. Replies from other users are simulated locally to demonstrate the UI. There is no backend and nothing leaves the device.

To make it a real multi-user chat (messages synced across devices), add Next.js API routes (or a service like Supabase/Firebase) behind `lib/store.js`.

## Deploy to Vercel

Vercel auto-detects Next.js — no config needed.

1. Push to GitHub (already at `github.com/samperet/JFCD`).
2. Import the repo at [vercel.com](https://vercel.com).
3. Deploy. HTTPS (required for PWA install + notifications) is automatic.

To rename the Vercel project: **Project → Settings → General → Project Name**.

## Security notes

- Patched Next.js **14.2.35** (addresses the Dec 2025 critical advisory).
- Security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`) set in `next.config.mjs`.
- User message text is rendered as text (React escaping) — no `dangerouslySetInnerHTML`.
- The service worker never caches cross-origin requests (DiceBear avatars go straight to network).

---

Version 3.0.0 · MIT
