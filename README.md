# The Moth Collector

A responsive, minimalist portfolio made with HTML, CSS, and vanilla JavaScript. The placeholder character and project artwork are local SVG files; no external services or frameworks are required.

## Run locally

1. Open this folder in VS Code.
2. Install the **Live Server** extension if it is not already installed.
3. Right-click `index.html` and choose **Open with Live Server**.

You can also open `index.html` directly in a modern browser.

## Customize

- Edit project titles, years, descriptions, tags, media paths, and moth types in `js/projects.js`.
- Adjust the character and face overlay in the `:root` variables in `css/style.css`:
  - `--character-width` controls character size.
  - `--face-area-width` and `--face-area-height` set the moth cluster area.
  - `--face-area-x` and `--face-area-y` move that area relative to the character's center. Negative Y moves it upward.
  - `--cluster-density` changes spacing around the cluster's center: values below `1` bring moths closer; values above `1` spread them apart.
- Edit each moth's `x` and `y` resting percentages, `scale`, `rotation`, and `wingDuration` in `mothClusterSettings` near the top of `js/moths.js`. Positions are percentages inside the face area, so they move with the character when its size changes.
- Tune cursor movement in the same CSS variables: `--repulsion-radius` sets how close the pointer must be, `--repulsion-strength` scales the flee distance, `--max-moth-displacement` caps it, and `--return-speed` adjusts how quickly moths spring home.
- Replace `assets/character/keeper.svg` with your own character illustration, keeping the image element and a transparent or otherwise suitable face area. Adjust the face-area variables to place the cluster over the new face. The moth artwork is inline in `js/main.js`; preserve its two separate wing groups for flapping.
- Change visual styling and archive layout in `css/style.css`. The interface uses a system monospace stack and does not load external fonts.
- Add project artwork to `assets/projects/`.

The small top-right icons open search and **Collection**. A moth opens its project in the reusable modal; the first time that project is closed, the moth is collected and its original face position remains empty. Collected project IDs are saved under `moth-collector-collected-projects` in this browser's local storage. In Collection, **Reset collection** clears progress and restores every moth to its original position.

Search and generated tag filters apply to both the living scene and Collection. Tag matching is OR by default, with an AND option. Filtered moths are dimmed without changing saved progress or their resting positions. Filtering lives in `js/filters.js`. Cursor repulsion is limited to mouse/precision-pointer devices, moths remain clickable, and movement respects reduced-motion preferences.
