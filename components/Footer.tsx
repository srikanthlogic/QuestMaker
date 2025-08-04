import React, { useState } from 'react';
import type { QuestConfig, FooterSection } from '../types';

interface FooterProps {
    questConfig: QuestConfig;
}

const FooterModal: React.FC<{
    section: FooterSection;
    onClose: () => void;
}> = ({ section, onClose }) => {
    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-white rounded-lg shadow-xl p-8 m-4 max-w-2xl w-full max-h-[80vh] flex flex-col"
                onClick={e => e.stopPropagation()} // Prevent closing when clicking inside the modal
            >
                <h2 className="text-3xl font-bold font-display text-orange-600 mb-4">{section.title}</h2>
                <div className="overflow-y-auto custom-scrollbar pr-4 text-gray-700 space-y-4">
                    <div dangerouslySetInnerHTML={{ __html: section.content }} />
                </div>
                <div className="mt-6 pt-4 border-t border-gray-200 text-right">
                    <button
                        onClick={onClose}
                        className="bg-orange-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-orange-600 transition-colors"
                        aria-label="Close modal"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export const Footer: React.FC<FooterProps> = ({ questConfig }) => {
    const [modalContent, setModalContent] = useState<FooterSection | null>(null);

    return (
        <>
            <footer className="mt-8 pt-4 border-t-2 border-orange-200">
                 <div className="flex justify-center items-center space-x-4 md:space-x-6 flex-wrap">
                    {questConfig.footerSections.map((section, index) => (
                        <button
                            key={index}
                            onClick={() => setModalContent(section)}
                            className="font-semibold text-gray-600 hover:text-orange-600 hover:underline transition-colors py-1 px-2"
                        >
                            {section.title}
                        </button>
                    ))}
                </div>
            </footer>
            {modalContent && <FooterModal section={modalContent} onClose={() => setModalContent(null)} />}
        </>
    );
};
