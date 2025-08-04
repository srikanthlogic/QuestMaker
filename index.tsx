import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { DocsPage } from './components/DocsPage';
import { asset, getAppPath } from './services/pathService';

const Main = () => {
    // State now holds the application-relative path, not the full browser path.
    const [appPath, setAppPath] = useState(getAppPath(window.location.pathname));

    // navigate takes an app-relative path (e.g. '/docs/README.md')
    const navigate = (path: string) => {
        const fullPath = asset(path);
        // Only push state if the path is different
        if (window.location.pathname !== fullPath) {
            window.history.pushState({}, '', fullPath);
        }
        setAppPath(path);
    };
    
    useEffect(() => {
        const onPopState = () => {
            // On back/forward, update the app path from the new window location.
            setAppPath(getAppPath(window.location.pathname));
        };
        window.addEventListener('popstate', onPopState);
        return () => window.removeEventListener('popstate', onPopState);
    }, []);

    // Routing is now based on the clean application path.
    if (appPath.startsWith('/docs/')) {
        // The path is something like '/docs/README.md'. We want 'README.md'.
        const docFile = appPath.substring('/docs/'.length) || 'README.md';
        return <DocsPage currentFile={docFile} onNavigate={navigate} />;
    }

    return <App onNavigate={navigate} />;
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
);