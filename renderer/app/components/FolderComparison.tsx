import React, {useCallback, useEffect, useMemo, useState} from "react";
import {FolderSelector} from "./FolderSelector";
import {FolderTree, TreeNode} from "./FolderTree";
import {FilePreview, PreviewFile} from "./FilePreview";
import {ArrowLeftRight, FileText, Fingerprint, FolderTree as FolderTreeIcon, Scale, Search, X} from "lucide-react";
import {toast} from "sonner";
import {cn} from '@/app/lib/utils';
import {cva} from 'class-variance-authority';
import {LoadingOverlay} from "@/app/components/LoadingOverlay";
import {Checkbox} from "@/app/components/ui/checkbox";

interface HeaderProps {
    title: string;
    className?: string;
}

interface DuplicateCriteria {
    byName: boolean;
    byHash: boolean;
    bySize: boolean;
}

export const Header: React.FC<HeaderProps> = ({title, className}) => {
    return (
        <header className={cn("flex items-center justify-between p-4", className)}>
            <h1 className="text-2xl font-bold">{title}</h1>
            <nav className="flex gap-4">
                <a href="/">Home</a>
                <a href="/about">About</a>
                <a href="/contact">Contact</a>
            </nav>
        </header>
    );
};

const buttonVariants = cva(
    "inline-flex items-center justify-center rounded-md font-medium transition-colors",
    {
        variants: {
            variant: {
                default: "bg-primary text-primary-foreground hover:bg-primary/90",
                outline: "border border-input bg-background hover:bg-accent",
                ghost: "hover:bg-accent hover:text-accent-foreground",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 px-3",
                lg: "h-11 px-8",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

// export const Button = ({ variant, size, ...props }) => {
//   return <button className={buttonVariants({ variant, size })} {...props} />;
// };

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({isOpen, onClose, title, children}) => {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={onClose}/>
            <div className="relative bg-card rounded-lg shadow-xl max-w-lg w-full mx-4">
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold">{title}</h2>
                    <button onClick={onClose}><X className="w-5 h-5"/></button>
                </div>
                <div className="p-4">{children}</div>
            </div>
        </div>
    );
};

interface User {
    id: string;
    email: string;
    name: string;
}

interface AuthState {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
}

export const useAuth = () => {
    const [state, setState] = useState<AuthState>({
        user: null,
        isLoading: true,
        isAuthenticated: false,
    });

    const login = useCallback(async (email: string, password: string) => {
        setState(prev => ({...prev, isLoading: true}));
        // API call would go here
        setState({
            user: {id: '1', email, name: 'User'},
            isLoading: false,
            isAuthenticated: true,
        });
    }, []);

    const logout = useCallback(() => {
        setState({user: null, isLoading: false, isAuthenticated: false});
    }, []);

    return {...state, login, logout};
}

const countByStatus = (nodes: TreeNode[], status: string): number => {
    let count = 0;
    for (const node of nodes) {
        if (node.type === "file" && node.status === status) count++;
        if (node.children) count += countByStatus(node.children, status);
    }
    return count;
};

const collectFilesByStatus = (nodes: TreeNode[], status: string, parentPath: string = ""): string[] => {
    const paths: string[] = [];
    for (const node of nodes) {
        const nodePath = parentPath ? `${parentPath}/${node.name}` : node.name;
        if (node.type === "file" && node.status === status) {
            paths.push(nodePath);
        }
        if (node.children) {
            paths.push(...collectFilesByStatus(node.children, status, nodePath));
        }
    }
    return paths;
};

export const FolderComparison = () => {
    const [folder1Name, setFolder1Name] = useState<string>("project-backup");
    const [folder2Name, setFolder2Name] = useState<string>("project-latest");
    const [previewFile, setPreviewFile] = useState<PreviewFile | null>(null);
    const [selectedFilesLeft, setSelectedFilesLeft] = useState<Set<string>>(new Set());
    const [selectedFilesRight, setSelectedFilesRight] = useState<Set<string>>(new Set());
    const [folder1Data, folder1DataRight] = useState<[]>([]);
    const [folder2Data, folder2DataRight] = useState<[]>([]);
    const [isImportingLeft, setIsImportingLeft] = useState(false);
    const [isImportingRight, setIsImportingRight] = useState(false);
    const [isMovingLeft, setIsMovingLeft] = useState(false);
    const [isMovingRight, setIsMovingRight] = useState(false);
    const [criteria, setCriteria] = useState<DuplicateCriteria>({
        byName: true,
        byHash: false,
        bySize: false,
    });

    const handleCriteriaChange = (key: keyof DuplicateCriteria) => {
        setCriteria(prev => {
            const newCriteria = { ...prev, [key]: !prev[key] };
            // Ensure at least one criterion is selected
            if (!newCriteria.byName && !newCriteria.byHash && !newCriteria.bySize) {
                toast.error("At least one criterion must be selected");
                return prev;
            }
            return newCriteria;
        });
        // Reset selections when criteria change
        // setSelectedFiles(new Set());
    };

    const stats = useMemo(() => ({
        added: countByStatus(folder2Data, "added"),
        removed: countByStatus(folder1Data, "removed"),
        modified: countByStatus(folder1Data, "modified"),
        unchanged: countByStatus(folder1Data, "unchanged"),
    }), [folder1Data, folder2Data]);

    const removedFiles = useMemo(() => collectFilesByStatus(folder1Data, "removed"), [folder1Data]);
    const addedFiles = useMemo(() => collectFilesByStatus(folder2Data, "added"), [folder2Data]);

    const handleFolder1Select = async () => {
        // const fileList = await window.electronAPI.pickFolder()
        // if(fileList == null) return;
        // setIsImportingLeft(true);
        //
        // let folderPath = "";
        // for (let i = 0; i < fileList.length; i++) {
            //   const file = fileList[i];
            //   if (!folderPath && file.path.includes("/")) {
            //     folderPath = file.path.split("/")[0];
            //     break;
            //   }
            // }
            // setFolder1Name(folderPath || "Folder A");
            // setSelectedFilesLeft(new Set());
        // }

        setIsImportingLeft(false);
        // toast.success(`Imported "${folderPath || "Folder A"}" successfully`);
    }

    const handleFolder2Select = async () => {
        // const fileList = await window.electronAPI.pickFolder()
        setIsImportingLeft(true);

        //
        // let folderPath = "";
        // for (let i = 0; i < fileList.length; i++) {
        //   const file = fileList[i];
        //   if (!folderPath && file.path.includes("/")) {
        //     folderPath = file.path.split("/")[0];
        //     break;
        //   }
        // }
        // setFolder2Name(folderPath || "Folder B");
        // setSelectedFilesRight(new Set());
        setIsImportingRight(false);
        // toast.success(`Imported "${folderPath || "Folder B"}" successfully`);
    };

    // Selection handlers
    const handleFileSelectLeft = useCallback((path: string, selected: boolean) => {
        setSelectedFilesLeft(prev => {
            const newSet = new Set(prev);
            if (selected) newSet.add(path);
            else newSet.delete(path);
            return newSet;
        });
    }, []);

    const handleFileSelectRight = useCallback((path: string, selected: boolean) => {
        setSelectedFilesRight(prev => {
            const newSet = new Set(prev);
            if (selected) newSet.add(path);
            else newSet.delete(path);
            return newSet;
        });
    }, []);

    const handleSelectAllRemoved = useCallback(() => {
        if (selectedFilesLeft.size === removedFiles.length) {
            setSelectedFilesLeft(new Set());
        } else {
            setSelectedFilesLeft(new Set(removedFiles));
        }
    }, [removedFiles, selectedFilesLeft.size]);

    const handleSelectAllAdded = useCallback(() => {
        if (selectedFilesRight.size === addedFiles.length) {
            setSelectedFilesRight(new Set());
        } else {
            setSelectedFilesRight(new Set(addedFiles));
        }
    }, [addedFiles, selectedFilesRight.size]);

    // Move handlers
    const handleMoveFileLeft = useCallback((file: TreeNode, path: string) => {
        setIsMovingLeft(true);
        setIsMovingLeft(false);
        toast.success(`Restored "${file.name}" to ${folder2Name}`);
    }, [folder2Name]);

    const handleMoveFileRight = useCallback((file: TreeNode, path: string) => {
        setIsMovingRight(true);
        setIsMovingRight(false);
        toast.success(`Copied "${file.name}" to ${folder1Name}`);
    }, [folder1Name]);

    const handleMoveSelectedLeft = useCallback(() => {
        if (selectedFilesLeft.size === 0) return;
        toast.success(`Would restore ${selectedFilesLeft.size} file(s) to ${folder2Name}`);
        setSelectedFilesLeft(new Set());
    }, [selectedFilesLeft, folder2Name]);

    const handleMoveSelectedRight = useCallback(() => {
        if (selectedFilesRight.size === 0) return;
        setIsMovingRight(true);
        setIsMovingRight(false);
        toast.success(`Copied ${selectedFilesRight.size} file(s) to ${folder1Name}`);
        setSelectedFilesRight(new Set());
    }, [selectedFilesRight, folder1Name]);
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Loading Overlays */}
            <LoadingOverlay isLoading={isImportingLeft || isImportingRight} message="Importing folder..." />
            <LoadingOverlay isLoading={isMovingLeft} message="Restoring files to new folder..." />
            <LoadingOverlay isLoading={isMovingRight} message="Copying files to old folder..." />
            {/* File Preview Modal */}
            <FilePreview file={previewFile} onClose={() => setPreviewFile(null)}/>

            {/* Detection Criteria Checklist */}
            <div className="glass-card p-4">
                <div className="flex items-center gap-2 mb-3">
                    <Search className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Duplicate Detection Criteria</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                    Select the criteria to identify duplicate files. Files matching ALL selected criteria will be grouped as duplicates.
                </p>

                <div className="flex flex-wrap gap-4">
                    {/* By File Name */}
                    <label className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-all",
                        criteria.byName
                            ? "bg-primary/10 border-primary"
                            : "bg-secondary/50 border-border hover:border-primary/50"
                    )}>
                        <Checkbox
                            checked={criteria.byName}
                            onCheckedChange={() => handleCriteriaChange('byName')}
                            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <FileText className={cn("w-5 h-5", criteria.byName ? "text-primary" : "text-muted-foreground")} />
                        <div>
                            <p className={cn("font-medium", criteria.byName ? "text-primary" : "text-foreground")}>File Name</p>
                            <p className="text-xs text-muted-foreground">Match files with the same name</p>
                        </div>
                    </label>

                    {/* By Hash */}
                    <label className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-all",
                        criteria.byHash
                            ? "bg-primary/10 border-primary"
                            : "bg-secondary/50 border-border hover:border-primary/50"
                    )}>
                        <Checkbox
                            checked={criteria.byHash}
                            onCheckedChange={() => handleCriteriaChange('byHash')}
                            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <Fingerprint className={cn("w-5 h-5", criteria.byHash ? "text-primary" : "text-muted-foreground")} />
                        <div>
                            <p className={cn("font-medium", criteria.byHash ? "text-primary" : "text-foreground")}>File Hash</p>
                            <p className="text-xs text-muted-foreground">Match files with identical content</p>
                        </div>
                    </label>

                    {/* By File Size */}
                    <label className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-all",
                        criteria.bySize
                            ? "bg-primary/10 border-primary"
                            : "bg-secondary/50 border-border hover:border-primary/50"
                    )}>
                        <Checkbox
                            checked={criteria.bySize}
                            onCheckedChange={() => handleCriteriaChange('bySize')}
                            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <Scale className={cn("w-5 h-5", criteria.bySize ? "text-primary" : "text-muted-foreground")} />
                        <div>
                            <p className={cn("font-medium", criteria.bySize ? "text-primary" : "text-foreground")}>File Size</p>
                            <p className="text-xs text-muted-foreground">Match files with the same size</p>
                        </div>
                    </label>
                </div>

                {/* Active criteria summary */}
                <div className="mt-4 p-2 bg-secondary/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">Active criteria:</span>{' '}
                        {[
                            criteria.byName && 'File Name',
                            criteria.byHash && 'File Hash',
                            criteria.bySize && 'File Size'
                        ].filter(Boolean).join(' + ') || 'None'}
                    </p>
                </div>
            </div>

            {/* Folder Selectors */}
            <div className="grid md:grid-cols-2 gap-6 relative">
                <FolderSelector
                    label="First Folder"
                    onFolderSelect={handleFolder1Select}
                    selectedFolder={folder1Name}
                />

                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 hidden md:flex">
                    <div className="p-3 rounded-full bg-secondary border border-border">
                        <ArrowLeftRight className="w-5 h-5 text-primary"/>
                    </div>
                </div>

                <FolderSelector
                    label="Second Folder"
                    onFolderSelect={handleFolder2Select}
                    selectedFolder={folder2Name}
                />
            </div>

            {/*/!* Stats Summary *!/*/}
            {/*{showDummy && (*/}
            {/*  <div className="glass-card p-6">*/}
            {/*    <div className="flex items-center justify-center gap-6 md:gap-12 flex-wrap">*/}
            {/*      <div className="text-center">*/}
            {/*        <p className="text-3xl font-bold text-success">{stats.added}</p>*/}
            {/*        <p className="text-xs text-muted-foreground mt-1">Added</p>*/}
            {/*      </div>*/}
            {/*      <div className="h-12 w-px bg-border hidden md:block" />*/}
            {/*      <div className="text-center">*/}
            {/*        <p className="text-3xl font-bold text-destructive">{stats.removed}</p>*/}
            {/*        <p className="text-xs text-muted-foreground mt-1">Removed</p>*/}
            {/*      </div>*/}
            {/*      <div className="h-12 w-px bg-border hidden md:block" />*/}
            {/*      <div className="text-center">*/}
            {/*        <p className="text-3xl font-bold text-warning">{stats.modified}</p>*/}
            {/*        <p className="text-xs text-muted-foreground mt-1">Modified</p>*/}
            {/*      </div>*/}
            {/*      <div className="h-12 w-px bg-border hidden md:block" />*/}
            {/*      <div className="text-center">*/}
            {/*        <p className="text-3xl font-bold text-muted-foreground">{stats.unchanged}</p>*/}
            {/*        <p className="text-xs text-muted-foreground mt-1">Unchanged</p>*/}
            {/*      </div>*/}
            {/*    </div>*/}
            {/*  </div>*/}
            {/*)}*/}

            {/*/!* Action Bar for moving files *!/*/}
            {/*{showDummy && (removedFiles.length > 0 || addedFiles.length > 0) && (*/}
            {/*  <div className="glass-card p-4">*/}
            {/*    <div className="flex items-center justify-between flex-wrap gap-4">*/}
            {/*      /!* Left side actions (for removed files) *!/*/}
            {/*      <div className="flex items-center gap-3">*/}
            {/*        {removedFiles.length > 0 && (*/}
            {/*          <>*/}
            {/*            <Button*/}
            {/*              variant="outline"*/}
            {/*              size="sm"*/}
            {/*              onClick={handleSelectAllRemoved}*/}
            {/*              className="gap-2"*/}
            {/*            >*/}
            {/*              {selectedFilesLeft.size === removedFiles.length ? (*/}
            {/*                <CheckSquare className="w-4 h-4" />*/}
            {/*              ) : (*/}
            {/*                <Square className="w-4 h-4" />*/}
            {/*              )}*/}
            {/*              Select Removed ({removedFiles.length})*/}
            {/*            </Button>*/}
            {/*            */}
            {/*            {selectedFilesLeft.size > 0 && (*/}
            {/*              <Button*/}
            {/*                variant="default"*/}
            {/*                size="sm"*/}
            {/*                onClick={handleMoveSelectedLeft}
                                disabled={isMovingLeft}*/}
            {/*                className="gap-2"*/}
            {/*              >*/}
            {/*                {isMovingLeft ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <MoveRight className="w-4 h-4" />
                      )}
                      {isMovingLeft ? "Restoring..." : `Restore to New (${selectedFilesLeft.size})`}*/}
            {/*              </Button>*/}
            {/*            )}*/}
            {/*          </>*/}
            {/*        )}*/}
            {/*      </div>*/}

            {/*      /!* Center divider *!/*/}
            {/*      <div className="h-8 w-px bg-border hidden md:block" />*/}

            {/*      /!* Right side actions (for added files) *!/*/}
            {/*      <div className="flex items-center gap-3">*/}
            {/*        {addedFiles.length > 0 && (*/}
            {/*          <>*/}
            {/*            {selectedFilesRight.size > 0 && (*/}
            {/*              <Button*/}
            {/*                variant="default"*/}
            {/*                size="sm"*/}
            {/*                onClick={handleMoveSelectedRight}
            disabled={isMovingRight}*/}
            {/*                className="gap-2"*/}
            {/*              >*/}
            {/*                {isMovingRight ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <ArrowLeft className="w-4 h-4" />
                      )}
                      {isMovingRight ? "Copying..." : `Copy to Old (${selectedFilesRight.size})`}*/}
            {/*              </Button>*/}
            {/*            )}*/}
            {/*            */}
            {/*            <Button*/}
            {/*              variant="outline"*/}
            {/*              size="sm"*/}
            {/*              onClick={handleSelectAllAdded}*/}
            {/*              className="gap-2"*/}
            {/*            >*/}
            {/*              {selectedFilesRight.size === addedFiles.length ? (*/}
            {/*                <CheckSquare className="w-4 h-4" />*/}
            {/*              ) : (*/}
            {/*                <Square className="w-4 h-4" />*/}
            {/*              )}*/}
            {/*              Select Added ({addedFiles.length})*/}
            {/*            </Button>*/}
            {/*          </>*/}
            {/*        )}*/}
            {/*      </div>*/}
            {/*    </div>*/}
            {/*  </div>*/}
            {/*)}*/}

            {/*/!* Legend *!/*/}
            {/*{showDummy && (*/}
            {/*  <div className="flex justify-center gap-6 text-xs flex-wrap">*/}
            {/*    <div className="flex items-center gap-2">*/}
            {/*      <div className="w-3 h-3 rounded-full bg-success" />*/}
            {/*      <span className="text-muted-foreground">Added (only in new folder)</span>*/}
            {/*    </div>*/}
            {/*    <div className="flex items-center gap-2">*/}
            {/*      <div className="w-3 h-3 rounded-full bg-destructive" />*/}
            {/*      <span className="text-muted-foreground">Removed (only in old folder)</span>*/}
            {/*    </div>*/}
            {/*    <div className="flex items-center gap-2">*/}
            {/*      <div className="w-3 h-3 rounded-full bg-warning" />*/}
            {/*      <span className="text-muted-foreground">Modified (different content)</span>*/}
            {/*    </div>*/}
            {/*    <div className="flex items-center gap-2">*/}
            {/*      <div className="w-3 h-3 rounded-full bg-muted" />*/}
            {/*      <span className="text-muted-foreground">Unchanged</span>*/}
            {/*    </div>*/}
            {/*  </div>*/}
            {/*)}*/}

            {/* Tree Comparison */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="glass-card p-4">
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/50">
                        <FolderTreeIcon className="w-5 h-5 text-primary"/>
                        <h3 className="font-semibold">{folder1Name}</h3>
                        <span className="ml-auto text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
              Old Version
            </span>
                    </div>

                    <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        <FolderTree
                            data={folder1Data}
                            side="left"
                            onFilePreview={setPreviewFile}
                            selectable={true}
                            selectedFiles={selectedFilesLeft}
                            onFileSelect={handleFileSelectLeft}
                            onMoveFile={handleMoveFileLeft}
                            showMoveButton={true}
                        />
                    </div>
                </div>

                <div className="glass-card p-4">
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/50">
                        <FolderTreeIcon className="w-5 h-5 text-primary"/>
                        <h3 className="font-semibold">{folder2Name}</h3>
                        <span
                            className="ml-auto text-xs text-muted-foreground bg-primary/20 text-primary px-2 py-1 rounded-full">
              New Version
            </span>
                    </div>

                    <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        <FolderTree
                            data={folder2Data}
                            side="right"
                            onFilePreview={setPreviewFile}
                            selectable={true}
                            selectedFiles={selectedFilesRight}
                            onFileSelect={handleFileSelectRight}
                            onMoveFile={handleMoveFileRight}
                            showMoveButton={true}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
