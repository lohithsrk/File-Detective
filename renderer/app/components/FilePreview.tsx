import {File, FileArchive, FileCode, FileJson, FileSpreadsheet, FileText, Image, X} from "lucide-react";
import {cn} from "@/app/lib/utils";
import {JSX} from "react";

export interface PreviewFile {
  name: string;
  type: string;
  content?: string;
  imageUrl?: string;
  size: number;
}

interface FilePreviewProps {
  file: PreviewFile | null;
  onClose: () => void;
}

const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

const getFileType = (filename: string): "text" | "code" | "json" | "image" | "spreadsheet" | "archive" | "other" => {
  const ext = getFileExtension(filename);
  
  const textExts = ['txt', 'md', 'readme', 'log'];
  const codeExts = ['js', 'ts', 'tsx', 'jsx', 'py', 'rb', 'go', 'rs', 'java', 'c', 'cpp', 'h', 'css', 'scss', 'html', 'xml', 'yaml', 'yml', 'toml'];
  const jsonExts = ['json', 'jsonc'];
  const imageExts = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'ico', 'bmp'];
  const spreadsheetExts = ['csv', 'xls', 'xlsx'];
  const archiveExts = ['zip', 'rar', '7z', 'tar', 'gz'];

  if (textExts.includes(ext)) return 'text';
  if (codeExts.includes(ext)) return 'code';
  if (jsonExts.includes(ext)) return 'json';
  if (imageExts.includes(ext)) return 'image';
  if (spreadsheetExts.includes(ext)) return 'spreadsheet';
  if (archiveExts.includes(ext)) return 'archive';
  return 'other';
};

export const FileIcon = ({ filename, className }: { filename: string; className?: string }) => {
  const type = getFileType(filename);
  
  switch (type) {
    case 'text':
      return <FileText className={cn("text-blue-400", className)} />;
    case 'code':
      return <FileCode className={cn("text-emerald-400", className)} />;
    case 'json':
      return <FileJson className={cn("text-yellow-400", className)} />;
    case 'image':
      return <Image className={cn("text-pink-400", className)} />;
    case 'spreadsheet':
      return <FileSpreadsheet className={cn("text-green-400", className)} />;
    case 'archive':
      return <FileArchive className={cn("text-orange-400", className)} />;
    default:
      return <File className={cn("text-muted-foreground", className)} />;
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

// Syntax highlighting for code
const highlightCode = (code: string, ext: string): JSX.Element => {
  const lines = code.split('\n');
  
  return (
    <pre className="text-sm font-mono leading-relaxed">
      {lines.map((line, i) => (
        <div key={i} className="flex">
          <span className="select-none text-muted-foreground/50 w-8 text-right pr-4 flex-shrink-0">
            {i + 1}
          </span>
          <code className="flex-1 whitespace-pre-wrap break-all">
            {highlightLine(line, ext)}
          </code>
        </div>
      ))}
    </pre>
  );
};

const highlightLine = (line: string, ext: string): JSX.Element => {
  // Simple syntax highlighting
  const keywords = ['const', 'let', 'var', 'function', 'return', 'import', 'export', 'from', 'if', 'else', 'for', 'while', 'class', 'interface', 'type', 'extends', 'implements'];
  const types = ['string', 'number', 'boolean', 'void', 'null', 'undefined', 'any', 'React', 'FC'];
  
  let result = line;
  
  // Highlight strings
  result = result.replace(/(["'`])(.*?)\1/g, '<span class="text-amber-300">$&</span>');
  
  // Highlight comments
  if (result.includes('//')) {
    const commentStart = result.indexOf('//');
    result = result.substring(0, commentStart) + '<span class="text-muted-foreground/60 italic">' + result.substring(commentStart) + '</span>';
  }
  
  return <span dangerouslySetInnerHTML={{ __html: result }} />;
};

export const FilePreview = ({ file, onClose }: FilePreviewProps) => {
  if (!file) return null;

  const fileType = getFileType(file.name);
  const ext = getFileExtension(file.name);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-3xl max-h-[85vh] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-secondary/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary">
              <FileIcon filename={file.name} className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{file.name}</h3>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(file.size)} • {ext.toUpperCase()} file
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="overflow-auto max-h-[calc(85vh-80px)] custom-scrollbar">
          {fileType === 'image' && file.imageUrl && (
            <div className="flex items-center justify-center p-8 bg-[repeating-conic-gradient(hsl(var(--secondary))_0%_25%,hsl(var(--background))_0%_50%)] bg-[length:20px_20px]">
              <img 
                src={file.imageUrl} 
                alt={file.name}
                className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-lg"
              />
            </div>
          )}
          
          {(fileType === 'code' || fileType === 'json') && file.content && (
            <div className="p-4 bg-background/50">
              {highlightCode(file.content, ext)}
            </div>
          )}
          
          {fileType === 'text' && file.content && (
            <div className="p-6">
              <div className="prose prose-invert prose-sm max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/90">
                  {file.content}
                </pre>
              </div>
            </div>
          )}
          
          {(fileType === 'spreadsheet' || fileType === 'archive' || fileType === 'other') && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-6 rounded-2xl bg-secondary/50 mb-4">
                <FileIcon filename={file.name} className="w-16 h-16" />
              </div>
              <p className="text-muted-foreground text-sm">
                Preview not available for {ext.toUpperCase()} files
              </p>
              <p className="text-muted-foreground/60 text-xs mt-1">
                {formatFileSize(file.size)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
