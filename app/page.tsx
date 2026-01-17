'use client'

import {Toaster} from "./components/ui/toaster";
import {Toaster as Sonner} from "./components/ui/sonner";
import {TooltipProvider} from "./components/ui/tooltip";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {useState} from "react";
import {Copy, GitCompare} from "lucide-react";
import {DuplicatesFinder} from "@/app/components/DuplicatesFinder";
import {FolderComparison} from "@/app/components/FolderComparison";

const queryClient = new QueryClient();

type Tab = "duplicates" | "compare";

export default function Home() {
    const [activeTab, setActiveTab] = useState<Tab>("duplicates");

    return (
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
                <Toaster />
                <Sonner />
                <div className="min-h-screen bg-background">
                    {/* Background gradient effects */}
                    <div className="fixed inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
                    </div>

                    <div className="relative z-10 container max-w-5xl mx-auto px-4 py-8">
                        {/* Header */}
                        <header className="text-center mb-8 animate-slide-up">
                            {/*<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">*/}
                            {/*    <Sparkles className="w-4 h-4 text-primary" />*/}
                            {/*    <span className="text-sm font-medium text-primary">File Management Tool</span>*/}
                            {/*</div>*/}

                            <h1 className="text-4xl md:text-5xl font-bold mb-4">
                                <span className="gradient-text">File Detective</span>
                            </h1>
                            <p className="text-muted-foreground text-lg max-w-md mx-auto">
                                Find duplicate files and compare folders with ease
                            </p>
                        </header>

                        {/* Tab Navigation */}
                        <nav className="flex justify-center mb-8 animate-fade-in" style={{ animationDelay: "100ms" }}>
                            <div className="inline-flex gap-2 p-1.5 rounded-xl bg-secondary/50 backdrop-blur-sm border border-border/50">
                                <button
                                    onClick={() => setActiveTab("duplicates")}
                                    className={`
                flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm
                transition-all duration-300
                ${activeTab === "duplicates"
                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"}
              `}
                                >
                                    <Copy className="w-4 h-4" />
                                    Find Duplicates
                                </button>

                                <button
                                    onClick={() => setActiveTab("compare")}
                                    className={`
                flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm
                transition-all duration-300
                ${activeTab === "compare"
                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"}
              `}
                                >
                                    <GitCompare className="w-4 h-4" />
                                    Compare Folders
                                </button>
                            </div>
                        </nav>

                        {/* Content */}
                        <main className="animate-fade-in" style={{ animationDelay: "200ms" }}>
                            {activeTab === "duplicates" ? (
                                <DuplicatesFinder />
                            ) : (
                                <FolderComparison />
                            )}
                        </main>

                        {/* Footer */}
                        <footer className="text-center mt-10 pb-8">
                            <p className="text-xs text-muted-foreground/50">
                                Drag and drop folders or click to browse • All processing happens locally
                            </p>
                        </footer>
                    </div>
                </div>

            </TooltipProvider>
        </QueryClientProvider>
    )
}
