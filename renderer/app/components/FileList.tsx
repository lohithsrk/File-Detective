import {AlertTriangle, CheckCircle2, Copy, File} from "lucide-react";
import {cn} from "@/app/lib/utils";

export interface FileItem {
  name: string;
  path: string;
  size: number;
  type: "duplicate" | "missing" | "match";
  duplicateOf?: string;
}

interface FileListProps {
  files: FileItem[];
  emptyMessage?: string;
  showType?: boolean;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

const FileTypeIcon = ({ type }: { type: FileItem["type"] }) => {
  switch (type) {
    case "duplicate":
      return <Copy className="w-4 h-4 text-warning" />;
    case "missing":
      return <AlertTriangle className="w-4 h-4 text-destructive" />;
    case "match":
      return <CheckCircle2 className="w-4 h-4 text-success" />;
  }
};

export const FileList = ({ files, emptyMessage = "No files to display", showType = true }: FileListProps) => {
  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <File className="w-12 h-12 text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {files.map((file, index) => (
        <div
          key={`${file.path}-${index}`}
          className={cn(
            "file-row animate-fade-in",
            file.type === "duplicate" && "file-row-duplicate",
            file.type === "missing" && "file-row-missing"
          )}
          style={{ animationDelay: `${index * 30}ms` }}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={cn(
              "p-2 rounded-lg",
              file.type === "duplicate" && "bg-warning/10",
              file.type === "missing" && "bg-destructive/10",
              file.type === "match" && "bg-success/10"
            )}>
              <File className={cn(
                "w-4 h-4",
                file.type === "duplicate" && "text-warning",
                file.type === "missing" && "text-destructive",
                file.type === "match" && "text-success"
              )} />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground font-mono truncate">
                {file.path}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground font-mono">
              {formatFileSize(file.size)}
            </span>
            {showType && <FileTypeIcon type={file.type} />}
          </div>
        </div>
      ))}
    </div>
  );
};
