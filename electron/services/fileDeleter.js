const fs = require('fs')
const path = require('path')

async function moveToRecycleBin(baseFolder, files) {
    const trashDir = path.join(baseFolder, '.duplicate-finder-trash')

    for (const file of files) {
        const targetPath = path.join(trashDir, file.relativePath)

        // Ensure destination folder exists
        await fs.promises.mkdir(path.dirname(targetPath), { recursive: true })

        // Move file
        await fs.promises.rename(file.fullPath, targetPath)
    }

    return true
}

module.exports = { moveToRecycleBin }
