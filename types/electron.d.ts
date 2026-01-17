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
        pickFolder(): Promise<FileList>
        refresh(basePath: string): Promise<FileList>
        deleteFiles(basePath: string, files: DuplicateFile[]): Promise<boolean>
    }

    interface Window {
        electronAPI: ElectronAPI
    }
}
