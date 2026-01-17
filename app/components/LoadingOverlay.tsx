import {Loader2} from "lucide-react";
import {cn} from "../lib/utils";

interface LoadingOverlayProps {
    isLoading: boolean;
    message?: string;
    className?: string;
}

export const LoadingOverlay = ({ isLoading, message = "Processing...", className }: LoadingOverlayProps) => {
    if (!isLoading) return null;

    return (
        <div className={cn(
            "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in",
            className
        )}>
            <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-card border border-border shadow-2xl animate-scale-in">
                <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                    <div className="relative p-4 rounded-full bg-primary/10">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                </div>
                <div className="text-center">
                    <p className="text-lg font-semibold">{message}</p>
                    <p className="text-sm text-muted-foreground mt-1">Please wait...</p>
                </div>
                <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
            </div>
        </div>
    );
};

interface InlineLoaderProps {
    isLoading: boolean;
    size?: "sm" | "md" | "lg";
    className?: string;
}

export const InlineLoader = ({ isLoading, size = "md", className }: InlineLoaderProps) => {
    if (!isLoading) return null;

    const sizeClasses = {
        sm: "w-4 h-4",
        md: "w-5 h-5",
        lg: "w-6 h-6",
    };

    return (
        <Loader2 className={cn("animate-spin text-primary", sizeClasses[size], className)} />
    );
};
