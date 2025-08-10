
import React, { useState } from 'react';
import { DOC_LINKS } from '../constants';
import DocContent from './DocContent';
import { useTranslation } from '../services/i18n';

interface DocsPageProps {
  onExit: () => void;
}

const DocsPage: React.FC<DocsPageProps> = ({ onExit }) => {
  const [activeDocId, setActiveDocId] = useState(DOC_LINKS[0].id);
  const { t } = useTranslation();

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-700 p-4 flex-shrink-0 flex flex-col">
        <div className="mb-8">
            <h1 className="text-2xl font-bold text-orange-400 font-mono">{t('questCraftTitle')}</h1>
            <h2 className="text-lg text-gray-400">{t('docs')}</h2>
        </div>
        <nav className="flex-grow space-y-2">
            {DOC_LINKS.map(link => (
              <button 
                key={link.id}
                onClick={() => setActiveDocId(link.id)}
                className={`w-full text-left p-2.5 rounded-md text-sm font-medium transition-colors ${activeDocId === link.id ? 'bg-indigo-600 text-white shadow' : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'}`}
                aria-current={activeDocId === link.id ? 'page' : undefined}
              >
                {link.title}
              </button>
            ))}
        </nav>
        <button 
            onClick={onExit} 
            className="mt-4 w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          {t('backToMainMenu')}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-6 md:p-10 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
            <DocContent docId={activeDocId} />
        </div>
      </main>
    </div>
  );
};

export default DocsPage;
