# Flagomat 🌍🚩

Guess every flag on Earth — plus cities, regions and **222 memes**. A web app that installs on iPhone/Android like a normal app and works offline.

## Game modes
| Mode | What you do |
|---|---|
| 🌍 **World Tour** | Flag → pick the country (10 / 25 / all 197) |
| 🗺️ **Continents** | Same, one continent at a time (Europe, Asia, Africa, N. & S. America, Oceania) |
| 🔁 **Reverse** | Country name → pick the right flag |
| ⌨️ **Type It** | No options — type the name (small typos forgiven, hints available) |
| ⏱️ **Speedrun** | As many flags as possible in 60 seconds |
| ❤️ **Survival** | Endless, 3 lives |
| 🏙️ **City Flags** | 34 cities: Amsterdam, Chicago, Tokyo, Berlin, NYC, Rio, Singapore… |
| 🏴 **Regions & Nations** | Scotland, Wales, Catalonia, Bavaria, Texas, Ohio, Québec, EU, UN… |
| 😂 **Meme Origins** | 222 memes from 54 countries — guess where each one was born |
| 📖 **Flag Atlas** | Browse/search every flag with capital, continent and fun facts |

Fun stuff: "aura" points, streak bonuses, brainrot commentary ("Ate and left no crumbs 💅" / "Skill issue 💀"), ranks from *NPC Energy 🤖* to *Geography GOAT 🐐*, confetti, share-your-score. Brainrot, sound and territories (+53 flags) can be toggled in Settings.

## Install on iPhone
1. Open the site in **Safari**.
2. Tap **Share** → **Add to Home Screen**.
3. It launches full-screen with its own icon and works offline.

(Android/Chrome: menu → *Install app*.)

## Run locally
```bash
npm start            # serves on http://localhost:8080
```
No build step: plain HTML/CSS/JS.

## Hosting
`.github/workflows/pages.yml` deploys to GitHub Pages on every push to `main`. Enable it once under **Settings → Pages → Source: GitHub Actions**.

## Data
- Country flags: [flag-icons](https://github.com/lipis/flag-icons) (MIT). Country data: [world-countries](https://github.com/mledoze/countries) (ODbL). Regenerate with `npm run build:data`.
- City and some regional flags are hand-drawn simplified SVGs in `js/data/cities.js` (seals/coats of arms simplified).
- Memes: `js/data/memes.js` — "origin" means where the original clip, image, song or creator came from.
