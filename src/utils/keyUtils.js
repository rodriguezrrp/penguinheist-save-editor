
const DISALLOWED_CHARS_REGEX = /[^a-z0-9-]/gi;

function partsToKey(keyBase, keyExtra) {
    return (keyExtra ? `${keyBase} ${keyExtra}` : keyBase);
}

function partsToHtmlSafeKey(keyBase, keyExtra) {
    return keyStrMakeHtmlSafe(keyExtra ? `${keyBase}_${keyExtra}` : keyBase);
}

function keyStrMakeHtmlSafe(ambiguousSafetyKeyString) {
    return ambiguousSafetyKeyString.replaceAll(DISALLOWED_CHARS_REGEX, '_');
}

function getKeyParts(normalFullKeyStr) {
    return [
        normalFullKeyStr.split(' ', 1)[0],
        // normalFullKeyStr.substring(normalFullKeyStr.indexOf(' ') + 1)
        normalFullKeyStr.split(' ').slice(1).join(' ')
    ];
}

export {
    DISALLOWED_CHARS_REGEX,
    partsToKey,
    partsToHtmlSafeKey,
    keyStrMakeHtmlSafe,
    getKeyParts
};