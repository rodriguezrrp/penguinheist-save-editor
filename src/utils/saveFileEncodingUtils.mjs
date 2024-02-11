// This file is prefixed .mjs to have Node recognize it as a ES6 Module when running scripts in the utilityscripts folder
// and be importable with dynamic import()

// Note: Unicode officially considers the regex options (\r\n|[\n\v\f\r\x85\u2028\u2029]) to be possible newlines.

// decode to Map
export function decodeSaveFile(saveDataStr, version) {
    // No version-specific actions; currently all game versions (supported) have the same save file format!
    return new Map(
        // .match(newline) will return an array of all NON-EMPTY lines!
        saveDataStr.match(/[^\n\v\f\r\x85\u2028\u2029]+/g).map((line) => {
            let parts = line.split('@');
            if(parts.length !== 3) {
                throw new Error('Expecting three split parts! _, prop\'s full key, and prop\'s value');
            }
            // eslint-disable-next-line no-unused-vars
            let [_, fullKey, value] = parts;

            // will fit into the final Map as  fullKey -> value
            return [fullKey, value];
        })
    );
}