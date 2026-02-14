const fs = require('fs')
const { scanFolder } = require('./fileScanner')
const { hashFile } = require('./fileHasher')
const {basename} = require("node:path");
const { randomUUID } = require("node:crypto")

async function findDuplicates(folderPath, compareByName, compareBySize, compareByHash) {
    const files = await scanFolder(folderPath);
    const duplicates = [];

    const pushDuplicates = async (group) => {
        if (group.length < 2) return;

        for (const file of group) {
            duplicates.push({
                id: randomUUID(),
                name: basename(file.fullPath),
                fullPath: file.fullPath,
                relativePath: file.relativePath,
                size: (await fs.promises.stat(file.fullPath)).size
            });
        }
    };

    const mustCompareBySize = compareBySize || compareByHash;

    // ---------- STEP 1: Size grouping ----------
    const sizeMap = {};

    if (mustCompareBySize) {
        for (const file of files) {
            const { size } = await fs.promises.stat(file.fullPath);
            if (!sizeMap[size]) sizeMap[size] = [];
            sizeMap[size].push(file);
        }
    } else {
        sizeMap["ALL"] = files;
    }

    // ---------- STEP 2: Process groups ----------
    for (const size in sizeMap) {
        const sizeGroup = sizeMap[size];
        if (sizeGroup.length < 2) continue;

        // ---------- HASH ENABLED ----------
        if (compareByHash) {
            const hashMap = {};

            for (const file of sizeGroup) {
                const hash = await hashFile(file.fullPath);
                if (!hashMap[hash]) hashMap[hash] = [];
                hashMap[hash].push(file);
            }

            for (const hash in hashMap) {
                const hashGroup = hashMap[hash];

                if (compareByName) {
                    const nameMap = {};
                    for (const file of hashGroup) {
                        const name = basename(file.fullPath);
                        if (!nameMap[name]) nameMap[name] = [];
                        nameMap[name].push(file);
                    }
                    for (const name in nameMap) {
                        await pushDuplicates(nameMap[name]);
                    }
                } else {
                    await pushDuplicates(hashGroup);
                }
            }

            continue;
        }

        // ---------- HASH DISABLED ----------
        if (compareByName) {
            const nameMap = {};
            for (const file of sizeGroup) {
                const name = basename(file.fullPath);
                if (!nameMap[name]) nameMap[name] = [];
                nameMap[name].push(file);
            }
            for (const name in nameMap) {
                await pushDuplicates(nameMap[name]);
            }
        } else {
            await pushDuplicates(sizeGroup);
        }
    }

    return { basePath: folderPath, duplicates };
}

module.exports = { findDuplicates }
