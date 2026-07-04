import { useState } from "react";
import { ChevronRight, ChevronDown, Folder, FolderOpen, Plus, Minus, Equal, Eye, MoveRight } from "lucide-react";
import { cn } from "@/app/lib/utils";
import { FileIcon, PreviewFile } from "./FilePreview";
import { Checkbox } from "./ui/checkbox";

export type DiffStatus = "added" | "removed" | "modified" | "unchanged";

export interface TreeNode {
  name: string;
  type: "folder" | "file";
  status: DiffStatus;
  size?: number;
  children?: TreeNode[];
  content?: string;
  imageUrl?: string;
  path?: string;
}

interface FolderTreeProps {
  data: TreeNode[];
  side: "left" | "right";
  onFilePreview?: (file: PreviewFile) => void;
  selectable?: boolean;
  selectedFiles?: Set<string>;
  onFileSelect?: (path: string, selected: boolean) => void;
  onMoveFile?: (file: TreeNode, path: string) => void;
  showMoveButton?: boolean;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

const StatusIcon = ({ status }: { status: DiffStatus }) => {
  switch (status) {
    case "added":
      return <Plus className="w-3.5 h-3.5 text-success" />;
    case "removed":
      return <Minus className="w-3.5 h-3.5 text-destructive" />;
    case "modified":
      return <span className="w-3.5 h-3.5 flex items-center justify-center text-warning text-xs font-bold">~</span>;
    case "unchanged":
      return <Equal className="w-3.5 h-3.5 text-muted-foreground/50" />;
  }
};

const getStatusColors = (status: DiffStatus) => {
  switch (status) {
    case "added":
      return "bg-success/10 border-success/20 hover:bg-success/15";
    case "removed":
      return "bg-destructive/10 border-destructive/20 hover:bg-destructive/15";
    case "modified":
      return "bg-warning/10 border-warning/20 hover:bg-warning/15";
    case "unchanged":
      return "bg-secondary/30 border-border/30 hover:bg-secondary/50";
  }
};

const buildPath = (node: TreeNode, parentPath: string = ""): string => {
  return parentPath ? `${parentPath}/${node.name}` : node.name;
};

const TreeNodeItem = ({ 
  node, 
  depth = 0,
  parentPath = "",
  onFilePreview,
  selectable,
  selectedFiles,
  onFileSelect,
  onMoveFile,
  showMoveButton,
}: { 
  node: TreeNode; 
  depth?: number;
  parentPath?: string;
  onFilePreview?: (file: PreviewFile) => void;
  selectable?: boolean;
  selectedFiles?: Set<string>;
  onFileSelect?: (path: string, selected: boolean) => void;
  onMoveFile?: (file: TreeNode, path: string) => void;
  showMoveButton?: boolean;
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.type === "folder" && node.children && node.children.length > 0;
  const nodePath = buildPath(node, parentPath);
  const isSelected = selectedFiles?.has(nodePath) || false;
  const canMove = showMoveButton && node.type === "file" && (node.status === "added" || node.status === "removed");

  const handleClick = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  const handlePreviewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (node.type === "file" && onFilePreview) {
      onFilePreview({
        name: node.name,
        type: node.type,
        content: node.content,
        imageUrl: node.imageUrl,
        size: node.size || 0,
      });
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    if (onFileSelect) {
      onFileSelect(nodePath, checked);
    }
  };

  const handleMoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMoveFile) {
      onMoveFile(node, nodePath);
    }
  };

  return (
    <div className="animate-fade-in" style={{ animationDelay: `${depth * 20}ms` }}>
      <div
        className={cn(
          "group flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 mb-1 cursor-pointer",
          getStatusColors(node.status),
          isSelected && "ring-2 ring-primary"
        )}
        style={{ marginLeft: `${depth * 16}px` }}
        onClick={handleClick}
      >
        {/* Checkbox for selection */}
        {selectable && node.type === "file" && (
          <div onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={isSelected}
              onCheckedChange={handleCheckboxChange}
              className="flex-shrink-0"
            />
          </div>
        )}

        {/* Expand/Collapse Icon */}
        <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )
          ) : (
            <span className="w-4" />
          )}
        </div>

        {/* Folder/File Icon */}
        <div className="flex-shrink-0">
          {node.type === "folder" ? (
            isExpanded ? (
              <FolderOpen className={cn(
                "w-4 h-4",
                node.status === "added" && "text-success",
                node.status === "removed" && "text-destructive",
                node.status === "modified" && "text-warning",
                node.status === "unchanged" && "text-primary"
              )} />
            ) : (
              <Folder className={cn(
                "w-4 h-4",
                node.status === "added" && "text-success",
                node.status === "removed" && "text-destructive",
                node.status === "modified" && "text-warning",
                node.status === "unchanged" && "text-primary"
              )} />
            )
          ) : (
            <FileIcon filename={node.name} className="w-4 h-4" />
          )}
        </div>

        {/* Name */}
        <span className={cn(
          "flex-1 text-sm font-medium truncate",
          node.status === "removed" && "line-through opacity-60"
        )}>
          {node.name}
        </span>

        {/* Size for files */}
        {node.type === "file" && node.size !== undefined && (
          <span className="text-xs text-muted-foreground font-mono flex-shrink-0">
            {formatFileSize(node.size)}
          </span>
        )}

        {/* Move Button for movable files */}
        {canMove && (
          <button
            onClick={handleMoveClick}
            className={cn(
              "p-1.5 rounded-md transition-all duration-200 flex-shrink-0",
              "opacity-0 group-hover:opacity-100",
              node.status === "added" ? "bg-success/20 hover:bg-success/30" : "bg-destructive/20 hover:bg-destructive/30"
            )}
            title={node.status === "added" ? "Move to other folder" : "Restore file"}
          >
            <MoveRight className={cn(
              "w-3.5 h-3.5",
              node.status === "added" ? "text-success" : "text-destructive"
            )} />
          </button>
        )}

        {/* Preview Button for files */}
        {node.type === "file" && (
          <button
            onClick={handlePreviewClick}
            className={cn(
              "p-1.5 rounded-md transition-all duration-200 flex-shrink-0",
              "opacity-0 group-hover:opacity-100",
              "bg-secondary hover:bg-secondary/80"
            )}
            title="Preview file"
          >
            <Eye className="w-3.5 h-3.5 text-primary" />
          </button>
        )}

        {/* Status Icon */}
        <div className={cn(
          "p-1 rounded-md flex-shrink-0",
          node.status === "added" && "bg-success/20",
          node.status === "removed" && "bg-destructive/20",
          node.status === "modified" && "bg-warning/20",
          node.status === "unchanged" && "bg-secondary"
        )}>
          <StatusIcon status={node.status} />
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="relative">
          <div 
            className="absolute left-4 top-0 bottom-2 w-px bg-border/50"
            style={{ marginLeft: `${depth * 16}px` }}
          />
          {node.children!.map((child, index) => (
            <TreeNodeItem 
              key={`${child.name}-${index}`} 
              node={child} 
              depth={depth + 1}
              parentPath={nodePath}
              onFilePreview={onFilePreview}
              selectable={selectable}
              selectedFiles={selectedFiles}
              onFileSelect={onFileSelect}
              onMoveFile={onMoveFile}
              showMoveButton={showMoveButton}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const FolderTree = ({ 
  data, 
  side, 
  onFilePreview,
  selectable,
  selectedFiles,
  onFileSelect,
  onMoveFile,
  showMoveButton,
}: FolderTreeProps) => {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Folder className="w-12 h-12 text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground text-sm">No folder data to display</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {data.map((node, index) => (
        <TreeNodeItem 
          key={`${node.name}-${index}`} 
          node={node}
          onFilePreview={onFilePreview}
          selectable={selectable}
          selectedFiles={selectedFiles}
          onFileSelect={onFileSelect}
          onMoveFile={onMoveFile}
          showMoveButton={showMoveButton}
        />
      ))}
    </div>
  );
};
