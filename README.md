# 🐧 Penguin Heist save file editor
Custom tool to inspect and edit save files of the Penguin Heist game.

Minimal: Built into one webpage with local dependencies so you can download the page and use it offline at your convenience!

⭐🎮⚙️ Additionally comes with a whole guide on how to _downgrade_ your Penguin Heist game to an _older version!_  
Table of common Steam build & manifest info for Windows, Apple OS, and Linux is included.

# **🛠️ CURRENTLY in BETA! 🛠️ Prototyping, fixing dynamic form generation based on scraped and gathered game version data.**
The main page itself is `docs/index.html`. The `docs/` folder will become the GitHub pages source once out of this Beta prototyping phase.

Most data about versions, their properties, the types of values the properties can hold, the allowed ranges of those values, etc. are in `.json` files throughout `saves/`.

Next steps:
- Utilize generated `.js` files (from the python script and data in `saves/`) to populate custom-tailored property editors into the `docs/index.html` form
- Download button generate an end-result save file for the user
- 🛠️✔️ Consider bringing out of beta at this point! it should be minimally up-to-date functional
- Gather manifest IDs for all missing versions, and default saves, to support those formats :)
- GitHub action to run the `.js`-generating python script upon push/etc. into the `docs/` folder. (Note to self: refer to my other repository where I tested this exact capability already)
- Fix icons and background breaking upon right-click downloading:
  - Convert all icons to inlined SVGs to prevent dependencies on svg files?
  - Convert the default background
- Dark theme? ;)

Eventually rewrite in React. Ensure a minimalistic and fully downloadable webpage can still be built
