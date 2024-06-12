const path = require("node:path");
const fs = require("node:fs");
const sharp = require("sharp");

const pathsInOut = [
    [path.join(__dirname,'../src/assets/imgs/item_previews'), path.join(__dirname,'../src/assets/imgs/item_previews_resized')],
    [path.join(__dirname,'../src/assets/imgs/furniture_previews'), path.join(__dirname,'../src/assets/imgs/furniture_previews_resized')],
];

const newSize = 50;

// any filename which ends in .png and which doesn't have a forward slash or backslash in it
const fileRegex = /([a-z0-9_]*)\.png/gi;
const fileRegexNot = /_[0-9]+x[0-9]+\.png$/gi;  // skip ones that have size denoted at the end

// same but extracting the file name (cutting off any size at the end)
const fileNameNoExtRegex = /([a-z0-9_]*?)(?:_[0-9]+x[0-9]+)?\.png$/gi;

function getFileNameNoExt(fileName) {
    return fileName.matchAll(fileNameNoExtRegex).next().value?.[1];
}

// notice the file name extension
function outFileName(imgname) {
    return `${imgname}_${newSize}x${newSize}.webp`;
}
function applyFormatChange(sharpInst) {
    return sharpInst.webp({ lossless: true, effort: 6 }); // max effort for lossless image
}

function isFile(fileName) {
    return fs.lstatSync(fileName).isFile();
}

for (const [sourceFolder, destFolder] of pathsInOut) {
    fs.readdirSync(sourceFolder)
        .filter((fileName) => isFile(path.join(sourceFolder, fileName)))
        .forEach((fileName) => {
            // check if it's an expected image file
            if(!fileName.match(fileRegex) || fileName.match(fileRegexNot)) {
                console.info(`skipping fileName ${fileName}`);
                return;
            }
            const inputFilePath = path.join(sourceFolder, fileName);
            const imgname = getFileNameNoExt(fileName);
            const outFilePath = path.resolve(path.join(destFolder, outFileName(imgname)));

            // console.log(fileName, imgname);
            // console.log(inputFilePath, outFilePath);
            // return;

            // process this file
            // fs.readFile(inputFilePath, { encoding: 'utf-8' }, (err, data) => {
            //     if(err) throw err;
            //     let regexList, tryRegexFn;
            //     if(tryRegex) {
            //         regexList = [];
            //         tryRegexFn = (badLine) => handleBadLineIfRegex(regexList, badLine);
            //     }
            //     let decodedDataMap = decodeSaveFile(data, version, tryRegexFn);
            //     console.info(`decoded save file "${fileName}".`);
            //     const outData = processMapFunction(decodedDataMap, regexList);
            //     fs.writeFile(outputFilePath, JSON.stringify(outData, null, 4), { encoding: 'utf-8' }, (err) => {
            //         if(err) throw err;
            //         console.info(`saved save file "${fileName}" to "${outFileName}"!`);
            //     })
            // })
            let s = sharp(inputFilePath)
                .resize(newSize, newSize);
            s = applyFormatChange(s);
            s.toFile(outFilePath, (err, info) => {
                if(!err) {
                    console.log(`resized "${fileName}" to "${outFilePath}"`);
                } else {
                    console.warn(`encountered error trying to resize ${fileName}:`, err);
                }
            });
        });
}