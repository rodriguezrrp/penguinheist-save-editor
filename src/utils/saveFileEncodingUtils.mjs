// This file is prefixed .mjs to have Node recognize it as a ES6 Module when running scripts in the utilityscripts folder
// and be importable with dynamic import()

export const listDelim = ' ';

// Note: Unicode officially considers the regex options (\r\n|[\n\v\f\r\x85\u2028\u2029]) to be possible newlines.

// decode to Map
export function decodeSaveFile(saveDataStr, version, badLineHandler) {
    // No version-specific actions; currently all game versions (supported) have the same save file format!
    return new Map(
        // .match(newline) will return an array of all NON-EMPTY lines!
        saveDataStr.match(/[^\n\v\f\r\x85\u2028\u2029]+/g).map((line) => {
            let parts = line.split('@');
            if(parts.length !== 3 || parts[0] !== '') {
                if(badLineHandler && badLineHandler(line) !== false) {
                    return null; // filter will remove this line
                }
                throw new Error('Expecting three split parts! _, prop\'s full key, and prop\'s value');
            }
            // eslint-disable-next-line no-unused-vars
            let [_, fullKey, value] = parts;

            // will fit into the final Map as  fullKey -> value
            return [fullKey, value];
        })
        .filter(line => line !== null)
    );
}


// encode to string, from Map or array of entries
/**
 * Encode to string, from Map or array of entries.
 * - Note: Keys with undefined or null values will be skipped. Other types, including an empty string, will be encoded.
 * @template V
 * @param {Map<string,V> | [string,V][]} savePropsMap 
 * @param {string} version 
 */
export function encodeSaveFile(savePropsMap, version) {
    // No version-specific actions; currently all game versions (supported) have the same save file format!
    let data = '';
    for(const [fullKey, value] of Array.from(savePropsMap)) {
        // Note: ALLOWING empty string '', for lists such as previousLoadout
        if(typeof(value) === "undefined" || value === null) {
            continue;
        }
        data += `@${fullKey}@${value}\n`;
    }
    // return new Blob([data], {type: 'text/*'});
    return data;
}