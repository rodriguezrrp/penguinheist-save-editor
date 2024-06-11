# 🐧 Penguin Heist save file editor
Custom tool to inspect and edit save files of [The Greatest Penguin Heist of All Time](https://store.steampowered.com/app/1451480/The_Greatest_Penguin_Heist_of_All_Time/).

Live version can be found at https://rodriguezrrp.github.io/penguinheist-save-editor/

⭐🎮⚙️ Additionally comes with a guide on how to _downgrade_ your Penguin Heist game to an _older version!_  
Includes a table of Steam build & manifest info for significant game versions for Windows, Mac OS, and Linux.

Rebuilt with React :)

## Current Features
- Upload a save file (e.g. `PHSaveMain.sav`) to inspect or edit
  - or create your own from a game version's default values
- Download the modified save file
- View which save data values are valid in different game versions
- Display unreadable lines found in save files
  - should help troubleshooting "corrupted" saves
- Allow rich editing of most complex save properties
  - Dropdowns for selecting current loadout, equipped clothing, heists, difficulties, and more
  - Color pickers for clothing colors
  - Key press / mouse input listeners for changing keybinds
  - Toggles for all the items, clothing, and furniture you can own
  - And much more!
- All save file properties recognized by the game should be supported and editable.
- Quick action buttons if you just want to give yourself a lot of money and unlock everything. (If you're that type of player 👀)

## Planned Features
- Improved select dropdowns with item / clothing icons
  - (looking at [react-dropdown](https://npmjs.org/package/react-dropdown))
- Find the missing manifest IDs for the older game versions
- Fill in support for older game versions
- Richer furniture transform editors
- Dark theme? ;)

## Bugs or Suggestions
Found something wrong? Have a suggestion? You can mention it in [Issues](https://github.com/rodriguezrrp/penguinheist-save-editor/issues).

## Running Locally
1. Install [Node.js](https://nodejs.org/) (I recommend 18.18.0 or higher)

2. [Download](https://github.com/rodriguezrrp/penguinheist-save-editor/archive/refs/heads/master.zip) or clone repository (e.g. `git clone https://github.com/rodriguezrrp/penguinheist-save-editor.git`)

3. Navigate into the project directory using your terminal.
    ```bash
    cd penguinheist-save-editor
    ```
4. Install the required packages.
    ```bash
    npm install
    ```
5. Run the web app.
    ```bash
    npm start
    ```

## Contributing
Contributions are welcome! Feel free to submit a pull request with your features or bugfixes.
