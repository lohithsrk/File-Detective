export {}

declare global {
    interface DuplicateFile {
        fullPath: string
        relativePath: string
    }

    interface FileList {
        basePath: string,
        duplicates: {
            id: string,
            fullPath,
            relativePath: string,
            size: number,
            name: string
        }[]

    }
    interface ElectronAPI {
        pickFolder(compareByName: boolean, compareBySize: boolean, compareByHash: boolean): Promise<FileList|null>
        refresh(basePath: string, compareByName: boolean, compareBySize: boolean, compareByHash: boolean): Promise<FileList|null>
        deleteFiles(basePath: string, files: DuplicateFile[]): Promise<boolean>
    }

    interface Window {
        electronAPI: ElectronAPI
    }
}
