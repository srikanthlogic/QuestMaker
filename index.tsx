import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { DocsPage } from './components/DocsPage';

const Main = () => {
    const [pathname, setPathname] = useState(window.location.pathname);

    const navigate = (path: string) => {
        // Only push state if the path is different
        if (window.location.pathname !== path) {
            window.history.pushState({}, '', path);
        }
        setPathname(path);
    };
    
    useEffect(() => {
        const onPopState = () => setPathname(window.location.pathname);
        window.addEventListener('popstate', onPopState);
        return () => window.removeEventListener('popstate', onPopState);
    }, []);

    if (pathname.startsWith('/docs/')) {
        const docFile = pathname.substring(6) || 'README.md';
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