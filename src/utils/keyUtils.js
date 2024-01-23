
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

function getKeyParts(unsafeKeyStr) {
    return [
        unsafeKeyStr.split(' ', 1),
        unsafeKeyStr.substring(unsafeKeyStr.indexOf(' ') + 1)
    ];
}

export {
    DISALLOWED_CHARS_REGEX,
    partsToKey,
    partsToHtmlSafeKey,
    keyStrMakeHtmlSafe,
    getKeyParts
};