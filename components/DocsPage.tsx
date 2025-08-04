import React, { useState, useEffect, useRef } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { ArrowLeftIcon, BookOpenIcon, LoadingSpinner } from './Icons';
import { asset, getAppPath } from '../services/pathService';

const docFiles = [
    // Start with the in-repo Introduction page as the primary landing.
    { title: 'Introduction', file: 'INTRODUCTION.md' },
    { title: 'Roadmap', file: 'ROADMAP.md' },
    { title: 'Design & Architecture', file: 'DESIGN.md' },
    { title: 'Quest Maker Guide', file: 'QUEST-MAKER.md' },
    { title: 'Quest Schema', file: 'quest-schema.md' },
    { title: 'Developer Guide', file: 'DEVELOP.md' },
    // Optional docs index (kept for completeness)
    { title: 'Docs Index', file: 'README.md' },
];

interface DocsPageProps {
    currentFile: string;
    onNavigate: (path: string) => void;
}

export const DocsPage: React.FC<DocsPageProps> = ({ currentFile, onNavigate }) => {
    const [htmlContent, setHtmlContent] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchDoc = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // No special-casing: render markdown files directly from /docs/.

                const response = await fetch(asset(`/docs/${currentFile}`));
                if (!response.ok) {
                    throw new Error(`Could not load ${currentFile}. Please check the file path.`);
                }
                const markdown = await response.text();
                const rawHtml = await Promise.resolve(marked.parse(markdown));
                setHtmlContent(DOMPurify.sanitize(rawHtml));
            } catch (err: any) {
                console.error("Failed to load doc:", err);
                setError(err.message || 'Failed to load document.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDoc();
    }, [currentFile]);

    // Effect to handle clicks on links within the rendered markdown
    useEffect(() => {
        const contentElement = contentRef.current;
        if (!contentElement) return;

        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // Find the closest ancestor `<a>` tag
            const link = target.closest('a');

            // Check if a link was clicked and it has an href
            if (link && link.href) {
                const linkUrl = new URL(link.href);

                // Check if it's an internal link (same domain)
                if (linkUrl.origin === window.location.origin) {
                    e.preventDefault();
                    const appPath = getAppPath(linkUrl.pathname);
                    onNavigate(appPath);
                }
                // External links will be handled by the browser's default behavior
            }
        };

        contentElement.addEventListener('click', handleClick);

        return () => {
            contentElement.removeEventListener('click', handleClick);
        };
    }, [htmlContent, onNavigate]); // Rerun if content changes to re-attach listener
    
    const handleLinkClick = (e: React.MouseEvent, path: string) => {
        e.preventDefault();
        onNavigate(path);
    };

    const docTitle = docFiles.find(d => d.file === currentFile)?.title || 'Documentation';

    return (
        <div className="w-full max-w-7xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-8 border-4 border-gray-200 animate-fade-in flex flex-col md:flex-row h-[95vh] gap-6 md:gap-8">
            {/* Sidebar */}
            <aside className="w-full md:w-64 flex-shrink-0 border-b md:border-b-0 md:border-r border-gray-200 pb-4 md:pb-0 md:pr-8">
                <div className="flex items-center gap-3 mb-6">
                    <BookOpenIcon className="w-8 h-8 text-orange-500"/>
                    <h1 className="text-3xl font-extrabold text-orange-600 font-display">Docs</h1>
                </div>
                <nav>
                    <ul className="space-y-2">
                        {docFiles.map(doc => (
                            <li key={doc.file}>
                                <a
                                    href={asset(`/docs/${doc.file}`)}
                                    onClick={e => handleLinkClick(e, `/docs/${doc.file}`)}
                                    className={`block font-semibold p-2 rounded-md transition-colors text-sm ${
                                        currentFile === doc.file 
                                        ? 'bg-orange-100 text-orange-700' 
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                                >
                                    {doc.title}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="mt-8 pt-4 border-t border-gray-200">
                     <a
                        href={asset('/')}
                        onClick={e => handleLinkClick(e, `/`)}
                        className="flex items-center space-x-2 text-gray-600 hover:text-orange-600 font-semibold"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                        <span>Back to QuestCraft</span>
                    </a>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto custom-scrollbar md:-mr-4 md:pr-4 min-h-0">
                <article className="docs-content">
                    {isLoading ? (
                         <div className="flex items-center justify-center h-full">
                           <LoadingSpinner />
                         </div>
                    ) : error ? (
                         <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-md">
                            <h2 className="font-bold">Error</h2>
                            <p>{error}</p>
                         </div>
                    ) : (
                        <div ref={contentRef} dangerouslySetInnerHTML={{ __html: htmlContent }} />
                    )}
                </article>
            </main>
        </div>
    );
};
