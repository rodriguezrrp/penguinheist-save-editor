const path = require("node:path");
const fs = require('node:fs');
import("../src/utils/saveFileEncodingUtils.mjs").then(({ decodeSaveFile }) => {

    const saveRegex = /-([\w]+).sav$/gi;

    const foldersToProcess = [
        [path.join(__dirname,'/../src/data/saves_default'),  processMappedToDefault,  false, 'mapped-{version}-default.json' ],
        [path.join(__dirname,'/../src/data/saves_relevant'), processMappedToRelevant, true,  'mapped-{version}-relevant.json']
    ]

    function getVersionFromFileName(fileName) {
        return fileName.matchAll(saveRegex).next().value?.[1];
    }

    function isFile(fileName) {
        return fs.lstatSync(fileName).isFile();
    }

    function processMappedToDefault(mappedDecodedData) {
        return Object.fromEntries(mappedDecodedData.entries());
    }
    function processMappedToRelevant(mappedDecodedData, regexList) {
        // return [...mappedDecodedData.keys()];
        return { "regex": regexList || [], "single": [...mappedDecodedData.keys()] };
    }

    // to catch regexes manually put into the save files
    function handleBadLineIfRegex(regexList, /**@type string*/ badLine) {
        const match = badLine.match(/\/(.*)\/([a-z]*)/);
        if(!match) return false; // did not handle the line (it was not regex).
        regexList.push(badLine);
        return true;
    }

    // Go through the folders and process the save files, as laid out in foldersToProcess

    for (const [savesFolder, processMapFunction, tryRegex, outFileNameFormat] of foldersToProcess) {
        fs.readdirSync(savesFolder)
            .filter((fileName) => isFile(path.join(savesFolder, fileName)))
            .forEach((fileName) => {
                // check if it's an expected sav file
                const inputFilePath = path.join(savesFolder, fileName);
                if(!fileName.match(saveRegex)) {
                    console.info(`skipping fileName ${fileName}`);
                    return;
                }
                const version = getVersionFromFileName(fileName);
                const outFileName = outFileNameFormat.replaceAll('{version}', version);
                const outputFilePath = path.join(savesFolder, outFileName);

                // process this file
                fs.readFile(inputFilePath, { encoding: 'utf-8' }, (err, data) => {
                    if(err) throw err;
                    let regexList, tryRegexFn;
                    if(tryRegex) {
                        regexList = [];
                        tryRegexFn = (badLine) => handleBadLineIfRegex(regexList, badLine);
                    }
                    let decodedDataMap = decodeSaveFile(data, version, tryRegexFn);
                    console.info(`decoded save file "${fileName}".`);
                    const outData = processMapFunction(decodedDataMap, regexList);
                    fs.writeFile(outputFilePath, JSON.stringify(outData, null, 4), { encoding: 'utf-8' }, (err) => {
                        if(err) throw err;
                        console.info(`saved save file "${fileName}" to "${outFileName}"!`);
                    })
                })
            });
    }

}); // end of import()