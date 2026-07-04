module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/renderer/app/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$renderer$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/renderer/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$renderer$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/renderer/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
'use client';
;
;
function getRootFolder(relativePath) {
    return relativePath.split(/[\\/]/)[0];
}
function getFileName(relativePath) {
    return relativePath.split(/[\\/]/).pop() || relativePath;
}
function Home() {
    const [duplicates, setDuplicates] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$renderer$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [selected, setSelected] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$renderer$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    const [baseFolder, setBaseFolder] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$renderer$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$renderer$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // Per-group selected folder
    const [keepFolderMap, setKeepFolderMap] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$renderer$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    const scanFolder = async ()=>{
        const folder = await window.electronAPI.pickFolder();
        if (!folder) return;
        setLoading(true);
        setBaseFolder(folder);
        setSelected({});
        setKeepFolderMap({});
        const result = await window.electronAPI.findDuplicates(folder);
        setDuplicates(result);
        setLoading(false);
    };
    // Get all unique top-level folders across all groups (A, B, C...)
    const allFolders = (0, __TURBOPACK__imported__module__$5b$project$5d2f$renderer$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const set = new Set();
        duplicates.forEach((group)=>group.files.forEach((file)=>set.add(getRootFolder(file.relativePath))));
        return Array.from(set);
    }, [
        duplicates
    ]);
    const keepFromFolder = (group, keepFolder)=>{
        // Check if the selected folder actually has this file
        const keepFileExists = group.files.some((file)=>getRootFolder(file.relativePath) === keepFolder);
        // If B does NOT have this file (example: E.txt),
        // then do NOTHING for this group
        if (!keepFileExists) {
            return;
        }
        // Mark UI selection
        setKeepFolderMap((prev)=>({
                ...prev,
                [group.hash]: keepFolder
            }));
        // Select only duplicates OUTSIDE keepFolder
        setSelected((prev)=>{
            const updated = {
                ...prev
            };
            group.files.forEach((file)=>{
                const root = getRootFolder(file.relativePath);
                if (root !== keepFolder) {
                    updated[file.fullPath] = file;
                } else {
                    delete updated[file.fullPath];
                }
            });
            return updated;
        });
    };
    // ⭐ APPLY TO ALL
    const applyToAll = (keepFolder)=>{
        const newSelected = {};
        const newKeepMap = {};
        duplicates.forEach((group)=>{
            // Only apply rule if keepFolder has this file
            const keepExists = group.files.some((file)=>getRootFolder(file.relativePath) === keepFolder);
            if (!keepExists) return;
            newKeepMap[group.hash] = keepFolder;
            group.files.forEach((file)=>{
                const root = getRootFolder(file.relativePath);
                if (root !== keepFolder) {
                    newSelected[file.fullPath] = file;
                }
            });
        });
        setKeepFolderMap(newKeepMap);
        setSelected(newSelected);
    };
    const deleteSelected = async ()=>{
        if (!baseFolder) return;
        const files = Object.values(selected);
        if (files.length === 0) return;
        const confirmed = confirm(`Move ${files.length} files to recycle bin?`);
        if (!confirmed) return;
        await window.electronAPI.deleteFiles(baseFolder, files);
        // Remove resolved groups
        setDuplicates((prev)=>prev.filter((group)=>group.files.some((f)=>!selected[f.fullPath])));
        setSelected({});
        setKeepFolderMap({});
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$renderer$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "min-h-screen bg-gray-100 p-6",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$renderer$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "max-w-5xl mx-auto",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$renderer$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                    className: "mb-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$renderer$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            className: "text-3xl font-bold text-gray-800",
                            children: "Duplicate File Finder"
                        }, void 0, false, {
                            fileName: "[project]/renderer/app/page.tsx",
                            lineNumber: 151,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$renderer$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-gray-600 mt-1",
                            children: "Choose which folder to keep duplicates from"
                        }, void 0, false, {
                            fileName: "[project]/renderer/app/page.tsx",
                            lineNumber: 154,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/renderer/app/page.tsx",
                    lineNumber: 150,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$renderer$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-wrap gap-4 mb-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$renderer$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: scanFolder,
                            disabled: loading,
                            className: "px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50",
                            children: loading ? 'Scanning...' : 'Scan Folder'
                        }, void 0, false, {
                            fileName: "[project]/renderer/app/page.tsx",
                            lineNumber: 161,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$renderer$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: deleteSelected,
                            disabled: Object.keys(selected).length === 0,
                            className: "px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50",
                            children: [
                                "Move duplicates to recycle bin (",
                                Object.keys(selected).length,
                                ")"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/renderer/app/page.tsx",
                            lineNumber: 170,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/renderer/app/page.tsx",
                    lineNumber: 160,
                    columnNumber: 17
                }, this),
                duplicates.length > 0 && allFolders.length > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$renderer$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mb-6 bg-white border rounded-xl p-4 shadow-sm",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$renderer$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm font-medium mb-3",
                            children: "Apply to all duplicates:"
                        }, void 0, false, {
                            fileName: "[project]/renderer/app/page.tsx",
                            lineNumber: 183,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$renderer$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-3 flex-wrap",
                            children: allFolders.map((folder)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$renderer$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>applyToAll(folder),
                                    className: "px-4 py-2 rounded-lg border text-sm font-medium hover:bg-blue-50 hover:border-blue-400",
                                    children: [
                                        "Keep from ",
                                        folder
                                    ]
                                }, folder, true, {
                                    fileName: "[project]/renderer/app/page.tsx",
                                    lineNumber: 188,
                                    columnNumber: 33
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/renderer/app/page.tsx",
                            lineNumber: 186,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/renderer/app/page.tsx",
                    lineNumber: 182,
                    columnNumber: 21
                }, this),
                !loading && duplicates.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$renderer$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-center text-gray-500 mt-20",
                    children: "No duplicates found"
                }, void 0, false, {
                    fileName: "[project]/renderer/app/page.tsx",
                    lineNumber: 203,
                    columnNumber: 21
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$renderer$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-4",
                    children: duplicates.map((group)=>{
                        const folders = Array.from(new Set(group.files.map((f)=>getRootFolder(f.relativePath))));
                        const fileName = getFileName(group.files[0].relativePath);
                        const selectedFolder = keepFolderMap[group.hash];
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$renderer$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-white rounded-xl shadow border p-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$renderer$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center justify-between mb-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$renderer$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "text-lg font-semibold text-gray-800",
                                            children: fileName
                                        }, void 0, false, {
                                            fileName: "[project]/renderer/app/page.tsx",
                                            lineNumber: 226,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$renderer$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-sm text-gray-500",
                                            children: [
                                                group.files.length,
                                                " copies"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/renderer/app/page.tsx",
                                            lineNumber: 229,
                                            columnNumber: 37
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/renderer/app/page.tsx",
                                    lineNumber: 225,
                                    columnNumber: 33
                                }, this),
                                folders.length > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$renderer$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex gap-3 flex-wrap",
                                    children: folders.map((folder)=>{
                                        const isSelected = selectedFolder === folder;
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$renderer$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>keepFromFolder(group, folder),
                                            className: `px-4 py-2 rounded-lg border text-sm font-medium
                            ${isSelected ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 hover:bg-blue-50 hover:border-blue-400'}`,
                                            children: [
                                                "Keep from ",
                                                folder
                                            ]
                                        }, folder, true, {
                                            fileName: "[project]/renderer/app/page.tsx",
                                            lineNumber: 240,
                                            columnNumber: 49
                                        }, this);
                                    })
                                }, void 0, false, {
                                    fileName: "[project]/renderer/app/page.tsx",
                                    lineNumber: 235,
                                    columnNumber: 37
                                }, this)
                            ]
                        }, group.hash, true, {
                            fileName: "[project]/renderer/app/page.tsx",
                            lineNumber: 221,
                            columnNumber: 29
                        }, this);
                    })
                }, void 0, false, {
                    fileName: "[project]/renderer/app/page.tsx",
                    lineNumber: 209,
                    columnNumber: 17
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/renderer/app/page.tsx",
            lineNumber: 147,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/renderer/app/page.tsx",
        lineNumber: 146,
        columnNumber: 9
    }, this);
}
}),
"[project]/renderer/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
else {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    else {
        if ("TURBOPACK compile-time truthy", 1) {
            if ("TURBOPACK compile-time truthy", 1) {
                module.exports = __turbopack_context__.r("[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)");
            } else //TURBOPACK unreachable
            ;
        } else //TURBOPACK unreachable
        ;
    }
} //# sourceMappingURL=module.compiled.js.map
}),
"[project]/renderer/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/renderer/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].ReactJsxDevRuntime; //# sourceMappingURL=react-jsx-dev-runtime.js.map
}),
"[project]/renderer/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/renderer/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].React; //# sourceMappingURL=react.js.map
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__91d4964d._.js.map