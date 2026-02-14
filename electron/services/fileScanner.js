const fs = require('fs')
const path = require('path')

async function scanFolder(dir, baseDir = dir) {
    const entries = await fs.promises.readdir(dir, { withFileTypes: true })

    let files = []

    for (const entry of entries) {
        if(entry.name.startsWith('.')) continue;

        const fullPath = path.join(dir, entry.name)

        if (entry.isDirectory()) {
            files.push(...await scanFolder(fullPath, baseDir))
        } else {
            files.push({
                fullPath,
                relativePath: path.relative(baseDir, fullPath)
            })
        }
    }

    return files
}

module.exports = { scanFolder }
