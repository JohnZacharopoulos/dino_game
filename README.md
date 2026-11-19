# 🦖 Δεινο-Παιχνίδια / Dino Games

Sixteen dinosaur games for a 4-year-old, in **Greek and English**, that run in any modern browser.
**No installation, no internet, no server:** copy the folder anywhere and double-click `index.html`.
On an iPhone or iPad, open the hosted link in Safari and use **Share → Add to Home Screen**.

| Game | Easy | Medium | Hard |
|---|---|---|---|
| 🃏 **Memory cards** – find the pairs | 3 pairs, cards shown first | 4 pairs, shorter preview | 6 pairs |
| 🧭 **Maze** – take the dino to its nest | 3×3, footprint trail shows the way | 5×5, hint after 3 bumps | 7×7, hint after 5 bumps |
| 🧩 **Puzzle** – put the pieces in place | 4 pieces + picture hint | 6 pieces + faint hint | 9 pieces, tap 👁 to peek at the picture |
| 🦴 **Fossil dig** – rub the sand away | 1 big fossil in the middle | 1 fossil hidden anywhere | 2 smaller fossils |
| 🥚 **Count the eggs** – how many? | 1–3 eggs | 2–5 eggs | 4–10 eggs |
| 🌑 **Shadow match** – whose shadow? | 2 choices | 3 choices | 4 choices, shadow may face the other way |
| 🔍 **Odd one out** – which is different? | a different dinosaur | same dinosaur, different colour | same dinosaur facing the other way |
| 📏 **Big & small** | big or small (2) | biggest or smallest (3) | tap 4 in order, smallest → biggest |
| 🚂 **Pattern train** – what comes next? | A B A B ? | A A B, A B B patterns | A B C, A A B B patterns |
| 🍎 **Feed the dino** – colours | "something red!" (3 foods) | 5 foods | "give me 3 yellow ones!" |
| ✏️ **Connect the dots** | 5 dots, next one glows | 8 dots, glow after 5 s | 10 dots |
| 🎨 **Colouring** | 4 colours | 6 colours | 8 colours + background to paint |
| 🌿 **Hungry Dino** – eat all the leaves in the garden maze | small maze, no beetles | 1 wandering beetle, 1 golden egg | 2 beetles (one follows you), 2 golden eggs |
| 🏃 **Jumpy Rex** – tap to jump over rocks, logs and bushes, run to the nest | slow, 6 obstacles, an arrow above Rex and a spoken "Jump!" before each one | faster, 9 obstacles, help for the first 2 | fastest, 12 obstacles incl. tall rocks and double rocks |
| 👗 **Dress the dino** *(free play)* | choose a dinosaur, colour, hat, crown, sunglasses, bow tie, flower, then take a photo 📷 | | |
| 🎵 **Dino sounds** *(free play)* | each dinosaur has its own voice; 🎵 starts a dance party | | |

In Hungry Dino, steer with a swipe, a tap beside the dino, the arrow buttons or the keyboard. A golden egg puts the beetles to sleep. Bumping into an awake beetle just sends the dino back to the start, so there is no game over. The maze uses fewer, bigger squares on small screens.
In Jumpy Rex, tap anywhere on the scene to jump (on a computer: Space, ↑ or Enter). Hitting an obstacle only makes Rex stumble and slow down for a moment; every run reaches the nest.

Every level has a few short rounds (footprints at the top show progress) and ends with confetti and a star. ⭐

## Designed for a 4-year-old

- **No reading needed.** Every instruction is spoken aloud (and shown as a caption). The 🔊 button repeats it.
- **No losing.** No timers, no lives. Mistakes get a gentle sound and some help, e.g. in the egg game a wrong answer starts *"Let's count together!"*.
- **Big buttons**, and tap, drag and mouse all work. In the maze he can trace the path with a finger, tap a square, or use the big arrows (or the keyboard arrows).
- **Says his name.** Set it in the parents' settings and the game will say *"Μπράβο, Γιάννη!"*. In Greek, type the name **the way you call him** (vocative), e.g. «Γιάννη», not «Γιάννης».

## For parents

- **Settings:** **press and hold** the ⚙️ button (top right of the home screen) for about 1.5 seconds. There you can set the name, language, voice, sounds, or reset the stars.
- **Language:** pick it on the start screen (flags), with the `EN`/`ΕΛ` button on the home screen, or in settings.
- **Full screen:** use the ⛶ button (not available on iPhone).
- **Stars** are saved in the browser on that device.

### Voice (text-to-speech)

The game uses the voices already installed on the device. English is available almost everywhere.
**Greek** depends on the device:

| Device | How to get a Greek voice |
|---|---|
| iPad / iPhone | Usually built in ("Melina"). Settings → Accessibility → Spoken Content → Voices → Greek |
| Android | Google Text-to-Speech → install Greek voice data |
| Mac | System Settings → Accessibility → Spoken Content → System voice → Manage Voices → Greek |
| Windows | Settings → Time & language → Speech → Add voices → Ελληνικά. Or use **Microsoft Edge**, which has natural Greek voices (Athina, Nestoras) when online |

If no voice is found, the game still works and shows the text bubbles. The settings screen tells you which voice is being used.

### Your own puzzle pictures

1. Put photos (`.jpg`, `.png`, `.webp`) into the `photos/` folder.
2. Add their file names to `photos/photos.js`:
   ```js
   window.DINO_PHOTOS = [
     'museum-trip.jpg',
     'toy-trex.png'
   ];
   ```
They'll be mixed in with the built-in dinosaur pictures. Square photos work best, because the centre square is used.

## Tech notes

Plain HTML, CSS and JavaScript, with no frameworks, no build step and no dependencies. It is written to work when opened from the file system (`file://`):

- Classic `<script>` tags, not ES modules, because modules are blocked on `file://`.
- No `fetch()`. All data is in the JS files.
- All artwork is original inline SVG (`js/core/art.js`). Sound effects are generated with the Web Audio API (`js/core/sound.js`), so there are no image or audio files to load.
- Puzzle pieces use CSS `background-position` rather than canvas, so local photos work.

```
index.html
css/style.css
js/core/   art.js  art-extra.js  i18n.js  store.js  speech.js  sound.js  app.js
js/games/  one file per game (memory, maze, puzzle, fossil, eggs, shadow, odd, size,
           pattern, feed, dots, color, chomp, run, build, sounds)
photos/    photos.js  (+ your pictures)
```

### Adding a game

Create `js/games/<id>.js` with `Dino.games.<id> = { id, color, dark, start(ctx) }` (add `free: true` for a game without levels), add the script tag to
`index.html`, add `<id>` to `GAME_ORDER` in `app.js`, a tile picture in `art.js` (`TILES`) and its texts
(`g_<id>`, instructions) in `i18n.js`. `ctx` gives you the stage element, `ctx.level`, speech, sounds,
auto-cleaned timers and listeners (`ctx.timeout`, `ctx.on`), `ctx.progress(done, total)` and `ctx.complete()`.
