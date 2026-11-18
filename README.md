# Fitshift

An installable fitness web app (PWA) that adapts to where you are and what you have.

- **Today**: tells you what to train based on your logged workouts. Muscle groups are "Recovering" for 48 hours after a workout ends, then "Fresh". You can flag soreness, ease back in after 4+ weeks off, and log workouts you did elsewhere.
- **Train**: builds a workout for your place (gym, home, hotel, park, office, travelling), equipment, time, goal and limits. Swap any move mid-session, add your own equipment and exercises, and tap an exercise to see an animated demo, form steps and video links.
- **Eat**: healthy meal picks for your region, whether you're eating out, cooking or grabbing something on the go.

"Fresh" is an estimate based on your workout history and the soreness you report, not a guarantee of recovery.

## Install it

The app has to be served over HTTPS (or `localhost`) to install and work offline.

**GitHub Pages:** in this repository go to Settings → Pages, set the source to "Deploy from a branch", pick `main` and `/ (root)`, and save. The app appears at `https://<your-username>.github.io/<repo-name>/` after a minute or two.

**On your computer:**

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

**Add to your phone:** open the site, then on Android tap "Install app" at the bottom of the page or in the browser menu. On iPhone, tap Share, then "Add to Home Screen".

## Your data

Everything is stored on your device: settings and workout log in the browser's local storage, exercise photos and videos in IndexedDB. Use **Export backup** at the bottom of the app to save a copy (photos and videos aren't included) and **Import backup** to restore it.

The "Build with Claude" and "Local picks" buttons only work when the app runs inside claude.ai, so they're hidden here. Everything else works offline.

## Files

| File | Purpose |
|---|---|
| `index.html` | The app (generated, don't edit by hand) |
| `src/app.html` | App source |
| `build.py` | Rebuilds `index.html` from `src/app.html` |
| `standalone.js` | Offline support, on-device photo storage, backup, install button |
| `sw.js` | Service worker. Bump `VERSION` when you change files so phones get the update |
| `manifest.webmanifest`, `icons/` | App name, colours and icons |

After editing `src/app.html`, run `python3 build.py`.
