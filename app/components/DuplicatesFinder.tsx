import {useCallback, useMemo, useState} from "react";
import {FolderSelector} from "./FolderSelector";
import {Button} from "./ui/button";
import {FileIcon, FilePreview, PreviewFile} from "./FilePreview";
import {Checkbox} from "./ui/checkbox";
import {
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Copy,
  Eye,
  Folder,
  FolderTree,
  HardDrive,
  Hash,
  Loader2,
  Search,
  Shield,
  Square,
  Trash2
} from "lucide-react";
import {cn} from "../lib/utils";
import {toast} from "sonner";
import {LoadingOverlay} from "@/app/components/LoadingOverlay";

interface FileData {
  id: string;
  name: string;
  fullPath: string;
  relativePath: string;
  size: number;
  content?: string;
  imageUrl?: string;
}

interface DuplicateGroup {
  name: string;
  size: number;
  files: FileData[];
  subfolders: string[];
}

interface FileWithStatus {
  file: FileData;
  subfolder: string;
  isInDeleteFolder: boolean;
  willBeDeleted: boolean;
  isKept: boolean;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

const getSubfolder = (path: string): string => {
  const parts = path.split("\\");
  return parts.length > 1 ? parts.slice(0, -1).join("/") : "/"
};

const DuplicateGroupCard = ({
                              group,
                              onPreview,
                              selectedFiles,
                              onFileSelect,
                              onSelectAllDuplicates,
                              onDeselectAll,
                              preferredFolders,
                            }: {
  group: DuplicateGroup;
  onPreview: (file: PreviewFile) => void;
  selectedFiles: Set<string>;
  onFileSelect: (fileId: string, selected: boolean) => void;
  onSelectAllDuplicates: (group: DuplicateGroup) => void;
  onDeselectAll: (group: DuplicateGroup) => void;
  preferredFolders: Set<string>;
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const wastedSpace = group.size * (group.files.length - 1);

  // Determine which files should be kept based on preferred folders
  const getFilesToKeep = () => {
    if (preferredFolders.size === 0) return new Set<string>();

    const keepFiles = new Set<string>();
    group.files.forEach(file => {
      const subfolder = getSubfolder(file.relativePath);
      if (preferredFolders.has(subfolder)) {
        keepFiles.add(file.id);
      }
    });
    return keepFiles;
  };

  const keepFiles = getFilesToKeep();
  const duplicateFiles = group.files.filter(f => !keepFiles.has(f.id));
  const selectedDuplicatesCount = duplicateFiles.filter(f => selectedFiles.has(f.id)).length;
  const allDuplicatesSelected = duplicateFiles.length > 0 && selectedDuplicatesCount === duplicateFiles.length;
  const hasPreferredFolder = keepFiles.size === 0;

  return (
      <div className="border border-warning/20 rounded-xl overflow-hidden bg-warning/5 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 hover:bg-warning/10 transition-colors">
          <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex-shrink-0"
          >
            {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-warning" />
            ) : (
                <ChevronRight className="w-4 h-4 text-warning" />
            )}
          </button>

          <div className="p-2 rounded-lg bg-warning/20 flex-shrink-0">
            <FileIcon filename={group.name} className="w-5 h-5" />
          </div>

          <div className="flex-1 text-left min-w-0">
            <p className="font-semibold truncate">{group.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(group.size)} each
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Quick select duplicates button */}
            {hasPreferredFolder && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => allDuplicatesSelected ? onDeselectAll(group) : onSelectAllDuplicates(group)}
                    className={cn(
                        "h-8 px-2 gap-1",
                        allDuplicatesSelected ? "text-primary" : "text-muted-foreground"
                    )}
                >
                  {allDuplicatesSelected ? (
                      <CheckSquare className="w-4 h-4" />
                  ) : (
                      <Square className="w-4 h-4" />
                  )}
                  <span className="text-xs">
                {selectedDuplicatesCount > 0 ? `${selectedDuplicatesCount}/${duplicateFiles.length}` : "Select all"}
              </span>
                </Button>
            )}

            <div className="text-right">
              <p className="text-sm font-medium text-warning">{group.files.length} copies</p>
              <p className="text-xs text-destructive">
                {formatFileSize(wastedSpace)} wasted
              </p>
            </div>

            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-warning/20">
              <Copy className="w-3.5 h-3.5 text-warning" />
              <span className="text-xs font-medium text-warning">{group.files.length}x</span>
            </div>
          </div>
        </div>

        {/* Files List */}
        {isExpanded && (
            <div className="border-t border-warning/20 bg-background/50">
              {group.files.map((file) => {
                const subfolder = getSubfolder(file.relativePath);
                const isKept = keepFiles.has(file.id);
                const isSelected = selectedFiles.has(file.id);
                const canSelect = hasPreferredFolder && !isKept;

                return (
                    <div
                        key={file.relativePath}
                        className={cn(
                            "group flex items-center gap-3 px-4 py-3 transition-colors border-b border-border/30 last:border-b-0",
                            isSelected && canSelect && "bg-destructive/10",
                            isKept && "bg-success/10",
                            canSelect && "hover:bg-secondary/50"
                        )}
                    >
                      {/* Checkbox or status */}
                      <div className="w-6 flex justify-center flex-shrink-0">
                        {isKept ? (
                            <span className="text-xs font-medium text-success px-1.5 py-0.5 rounded flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                    </span>
                        ) : hasPreferredFolder ? (
                            <Checkbox
                                checked={isSelected}
                                onCheckedChange={(checked) => onFileSelect(file.id, !!checked)}
                                className="border-destructive/50 data-[state=checked]:bg-destructive data-[state=checked]:border-destructive"
                            />
                        ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </div>

                      <Folder className="w-4 h-4 text-primary flex-shrink-0" />

                      <div className="flex-1 min-w-0">
                        <p className={cn(
                            "text-sm font-mono truncate",
                            isSelected && canSelect ? "text-destructive" :
                                isKept ? "text-success" : "text-muted-foreground"
                        )}>
                          {subfolder || "/"}
                        </p>
                      </div>

                      <button
                          onClick={() => onPreview({
                            name: file.name,
                            type: "file",
                            content: file.content,
                            imageUrl: file.imageUrl,
                            size: file.size,
                          })}
                          className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 bg-secondary hover:bg-secondary/80 transition-all"
                          title="Preview file"
                      >
                        <Eye className="w-3.5 h-3.5 text-primary" />
                      </button>
                    </div>
                );
              })}
            </div>
        )}
      </div>
  );
};

export const DuplicatesFinder = () => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [folderName, setFolderName] = useState<string>("");
  const [isScanning, setIsScanning] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewFile, setPreviewFile] = useState<PreviewFile | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [preferredFolders, setPreferredFolders] = useState<Set<string>>(new Set());

  const handleFolderSelect = async () => {
    const fileList = await window.electronAPI.pickFolder()
    setIsImporting(true);
    loadDuplicates(fileList)
  };

  const refreshDuplicates = async () => {
    setIsImporting(true);
    const fileList = await window.electronAPI.refresh(folderName)
    loadDuplicates(fileList)
  }

  const loadDuplicates = (fileList: FileList) => {
    const fileArray: FileData[] = [];

    for (let i = 0; i < fileList.duplicates.length; i++) {
      const file = fileList.duplicates[i];
      fileArray.push({
        id: file.id,
        name: file.name,
        fullPath: file.fullPath,
        relativePath: file.relativePath,
        size: file.size,
      });
    }

    setFolderName(fileList.basePath || "Selected Folder");
    setFiles(fileArray);
    setSelectedFiles(new Set());
    setPreferredFolders(new Set());
    setIsImporting(false);
    toast.success(`Imported ${fileArray.length} files from "${fileList.basePath || "folder"}"`);
  }

  const { duplicateGroups, stats, allSubfolders } = useMemo(() => {
    setIsScanning(true);

    // Group files by name + size (more accurate duplicate detection)
    const filesByKey = new Map<string, FileData[]>();
    files.forEach(file => {
      const key = `${file.name}::${file.size}`;
      const existing = filesByKey.get(key) || [];
      existing.push({
        id: file.id,
        name: file.name,
        fullPath: file.fullPath,
        relativePath: file.relativePath,
        size: file.size
      });
      filesByKey.set(key, existing);
    });

    // Find duplicates and create groups
    const groups: DuplicateGroup[] = [];
    let totalDuplicateFiles = 0;
    let wastedSpace = 0;
    const subfoldersSet = new Set<string>();

    filesByKey.forEach((fileGroup) => {
      if (fileGroup.length > 1) {
        const subfolders = [...new Set(fileGroup.map(f => getSubfolder(f.relativePath)))];
        subfolders.forEach(sf => subfoldersSet.add(sf));
        groups.push({
          name: fileGroup[0].name,
          size: fileGroup[0].size,
          files: fileGroup,
          subfolders,
        });
        totalDuplicateFiles += fileGroup.length;
        wastedSpace += fileGroup[0].size * (fileGroup.length - 1);
      }
    });

    // Sort by wasted space (descending)
    groups.sort((a, b) => {
      const wastedA = a.size * (a.files.length - 1);
      const wastedB = b.size * (b.files.length - 1);
      return wastedB - wastedA;
    });

    setTimeout(() => setIsScanning(false), 300);

    return {
      duplicateGroups: groups,
      stats: {
        groups: groups.length,
        totalFiles: totalDuplicateFiles,
        wastedSpace,
        subfolders: subfoldersSet.size,
      },
      allSubfolders: [...subfoldersSet].sort(),
    };
  }, [folderName]);

  // Preferred folder handlers
  const handleTogglePreferredFolder = useCallback((folder: string) => {
    setPreferredFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folder)) {
        newSet.delete(folder);
      } else {
        newSet.add(folder);
      }
      return newSet;
    });
    // Clear selections when preferred folders change
    setSelectedFiles(new Set());
  }, []);

  // Selection handlers
  const handleFileSelect = useCallback((fileId: string, selected: boolean) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(fileId);
      } else {
        newSet.delete(fileId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAllDuplicates = useCallback((group: DuplicateGroup) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      // Add all files NOT in preferred folders
      group.files.forEach(file => {
        const subfolder = getSubfolder(file.relativePath);
        if (!preferredFolders.has(subfolder)) {
          newSet.add(file.id);
        }
      });
      return newSet;
    });
  }, [preferredFolders]);

  const handleDeselectAll = useCallback((group: DuplicateGroup) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      group.files.forEach(file => newSet.delete(file.id));
      return newSet;
    });
  }, []);

  const handleSelectAllGroups = useCallback(() => {
    if (preferredFolders.size === 0) {
      toast.error("Please select at least one folder to keep files from first");
      return;
    }
    const allDuplicates = new Set<string>();
    duplicateGroups.forEach(group => {
      group.files.forEach(file => {
        const subfolder = getSubfolder(file.relativePath);
        if (!preferredFolders.has(subfolder)) {
          allDuplicates.add(file.id);
        }
      });
    });
    setSelectedFiles(allDuplicates);
  }, [duplicateGroups, preferredFolders]);

  const handleDeselectAllGroups = useCallback(() => {
    setSelectedFiles(new Set());
  }, []);

  const handleDeleteSelected = useCallback(async () => {
    if (selectedFiles.size === 0) return;
    setIsDeleting(true);

    const filesToDelete: DuplicateFile[] = []

    // Calculate space to be freed
    let spaceToFree = 0;
    duplicateGroups.forEach(group => {
      group.files.forEach(file => {
        if (selectedFiles.has(file.id)) {
          spaceToFree += group.size;
          filesToDelete.push({
            fullPath: file.fullPath,
            relativePath: file.relativePath
          })
        }
      });
    });

    const res = await window.electronAPI.deleteFiles(folderName, filesToDelete)

    if(res) {
      await refreshDuplicates()
      setIsDeleting(false);
      toast.success(`${selectedFiles.size} duplicate files deleted, freed ${formatFileSize(spaceToFree)}`);
    }

    // In a real implementation, you would delete the files here
    setSelectedFiles(new Set());
  }, [selectedFiles, duplicateGroups]);

  // Calculate selected stats
  const selectedCount = selectedFiles.size;
  const selectedSpace = useMemo(() => {
    let space = 0;
    duplicateGroups.forEach(group => {
      group.files.forEach(file => {
        if (selectedFiles.has(file.id)) {
          space += group.size;
        }
      });
    });
    return space;
  }, [selectedFiles, duplicateGroups]);

  // Calculate total duplicates count (files not in preferred folders)
  const totalDuplicatesCount = useMemo(() => {
    if (preferredFolders.size === 0) return 0;
    return duplicateGroups.reduce((acc, group) => {
      return acc + group.files.filter(f => !preferredFolders.has(getSubfolder(f.relativePath))).length;
    }, 0);
  }, [duplicateGroups, preferredFolders]);

  const allSelected = selectedCount === totalDuplicatesCount && totalDuplicatesCount > 0;

  return (
      <div className="space-y-6 animate-fade-in">
        {/* Loading Overlays */}
        <LoadingOverlay isLoading={isImporting} message="Importing files..." />
        <LoadingOverlay isLoading={isDeleting} message="Deleting duplicates..." />

        {/* File Preview Modal */}
        <FilePreview file={previewFile} onClose={() => setPreviewFile(null)} />

        <div className="grid md:grid-cols-2 gap-6">
          <FolderSelector
              label="Select folder to scan"
              onFolderSelect={handleFolderSelect}
              selectedFolder={folderName}
          />

          <div className="glass-card p-6 flex flex-col justify-center">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Hash className="w-4 h-4 text-warning" />
                </div>
                <p className="text-2xl font-bold text-warning">{stats.groups}</p>
                <p className="text-xs text-muted-foreground mt-1">Groups</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Copy className="w-4 h-4 text-foreground" />
                </div>
                <p className="text-2xl font-bold text-foreground">{stats.totalFiles}</p>
                <p className="text-xs text-muted-foreground mt-1">Files</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <FolderTree className="w-4 h-4 text-primary" />
                </div>
                <p className="text-2xl font-bold text-primary">{stats.subfolders}</p>
                <p className="text-xs text-muted-foreground mt-1">Subfolders</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <HardDrive className="w-4 h-4 text-destructive" />
                </div>
                <p className="text-2xl font-bold text-destructive">
                  {formatFileSize(stats.wastedSpace)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Wasted</p>
              </div>
            </div>
          </div>
        </div>

        {/* Preferred Folders Selection */}
        {folderName.length > 0 && duplicateGroups.length > 0 && allSubfolders.length > 0 && (
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-success" />
                <h3 className="font-semibold">Select Folders to Keep Files From</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Files in selected folders will be kept. Duplicates in other folders can be selected for deletion.
              </p>

              {preferredFolders.size === 0 && (
                  <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 mb-4">
                    <p className="text-sm text-warning flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Please select at least one folder to keep files from before selecting duplicates to delete.
                    </p>
                  </div>
              )}

              <div className="flex flex-wrap gap-2">
                {allSubfolders.map(folder => {
                  const isSelected = preferredFolders.has(folder);
                  return (
                      <button
                          key={folder}
                          onClick={() => handleTogglePreferredFolder(folder)}
                          className={cn(
                              "px-3 py-2 rounded-lg border text-sm font-mono transition-all flex items-center gap-2",
                              isSelected
                                  ? "bg-success/20 border-success text-success"
                                  : "bg-secondary/50 border-border hover:bg-secondary hover:border-primary/50"
                          )}
                      >
                        {isSelected && <Shield className="w-3.5 h-3.5" />}
                        <Folder className="w-3.5 h-3.5" />
                        {folder || "/"}
                      </button>
                  );
                })}
              </div>
            </div>
        )}

        {/* Action Bar */}
        {folderName.length > 0 && duplicateGroups.length > 0 && (
            <div className="glass-card p-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <Button
                      variant="outline"
                      size="sm"
                      onClick={allSelected ? handleDeselectAllGroups : handleSelectAllGroups}
                      className="gap-2"
                      disabled={preferredFolders.size === 0}
                  >
                    {allSelected ? (
                        <CheckSquare className="w-4 h-4" />
                    ) : (
                        <Square className="w-4 h-4" />
                    )}
                    {allSelected ? "Deselect All" : "Select All Duplicates"}
                  </Button>

                  <span className="text-sm text-muted-foreground">
                {preferredFolders.size === 0 ? (
                    "Select folders to keep first"
                ) : selectedCount > 0 ? (
                    <>
                      <span className="font-medium text-foreground">{selectedCount}</span> files selected
                      <span className="text-destructive ml-1">({formatFileSize(selectedSpace)})</span>
                    </>
                ) : (
                    "No files selected"
                )}
              </span>
                </div>

                <Button
                    variant="destructive"
                    size="sm"
                    className="gap-2"
                    disabled={selectedCount === 0 || isDeleting}
                    onClick={handleDeleteSelected}
                >
                  {isDeleting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                      <Trash2 className="w-4 h-4" />
                  )}
                  {isDeleting ? "Deleting..." : `Delete Selected (${selectedCount})`}
                </Button>
              </div>
            </div>
        )}

        {folderName.length > 0 && (
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
            Scanned {folderName.length} files across multiple subfolders
          </span>
            </div>
        )}

        {/* Duplicate Groups */}
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/50">
            <Copy className="w-5 h-5 text-warning" />
            <h3 className="font-semibold">Duplicate Files by Subfolder</h3>
            {isScanning && folderName.length > 0 && (
                <span className="text-xs text-muted-foreground animate-pulse-soft ml-2">
              Scanning...
            </span>
            )}
            <span className="ml-auto text-xs text-muted-foreground">
            Sorted by wasted space
          </span>
          </div>

          {duplicateGroups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Copy className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground text-sm">
                  {folderName.length === 0
                      ? "Select a folder to scan for duplicates"
                      : "No duplicates found! Your folder is clean."}
                </p>
              </div>
          ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {duplicateGroups.map((group) => (
                    <DuplicateGroupCard
                        key={`${group.name}-${group.size}`}
                        group={group}
                        onPreview={setPreviewFile}
                        selectedFiles={selectedFiles}
                        onFileSelect={handleFileSelect}
                        onSelectAllDuplicates={handleSelectAllDuplicates}
                        onDeselectAll={handleDeselectAll}
                        preferredFolders={preferredFolders}
                    />
                ))}
              </div>
          )}
        </div>
      </div>
  );
};
