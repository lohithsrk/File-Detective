import {Folder, Upload} from "lucide-react";
import React, {useCallback, useState} from "react";

interface FolderSelectorProps {
  label: string;
  onFolderSelect: () => void;
  selectedFolder?: string;
}

export const FolderSelector = ({ label, onFolderSelect, selectedFolder }: FolderSelectorProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      onFolderSelect();
    }
  }, [onFolderSelect]);

  const handleClick = (e: React.MouseEvent) => {
    onFolderSelect()
  }

  return (
    <div
      className={`
        relative glass-card glow-effect p-6 cursor-pointer
        transition-all duration-300 ease-out
        ${isDragging ? 'border-primary/60 scale-[1.02]' : 'border-border/40'}
        hover:border-primary/40
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <div className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
      
      <div className="flex flex-col items-center gap-4 text-center">
        <div className={`
          p-4 rounded-xl transition-all duration-300
          ${isDragging ? 'bg-primary/20 scale-110' : 'bg-secondary/50'}
        `}>
          {selectedFolder ? (
            <Folder className="w-8 h-8 text-primary" />
          ) : (
            <Upload className="w-8 h-8 text-muted-foreground" />
          )}
        </div>
        
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
          {selectedFolder ? (
            <p className="text-foreground font-mono text-sm truncate max-w-[200px]">
              {selectedFolder}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground/70">
              Drop folder or click to browse
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
