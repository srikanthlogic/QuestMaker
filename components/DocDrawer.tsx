
import React, { useState, useEffect } from 'react';
import Drawer from './Drawer';
import showdown from 'showdown';

const converter = new showdown.Converter({
    ghCompatibleHeaderId: true,
    simpleLineBreaks: true,
    tables: true,
});

interface DocDrawerProps {
    docId: string;
    title: string;
    onClose: () => void;
    show: boolean;
}

const DocDrawer: React.FC<DocDrawerProps> = ({ docId, title, onClose, show }) => {
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Fetch only if the drawer is opening and content hasn't been loaded yet.
        if (show && !content) { 
            setIsLoading(true);
            fetch(`/docs/${docId}.md`)
                .then(res => {
                    if (!res.ok) {
                        throw new Error(`Failed to fetch doc: ${res.status} ${res.statusText}`);
                    }
                    return res.text();
                })
                .then(text => {
                    setContent(converter.makeHtml(text));
                })
                .catch(err => {
                    console.error(err);
                    setContent('<p class="text-red-400">Error: Could not load documentation content.</p>');
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [docId, show, content]);

    return (
        <Drawer title={title} show={show} onClose={onClose}>
            {isLoading ? <p>Loading...</p> : <div dangerouslySetInnerHTML={{ __html: content }} />}
        </Drawer>
    );
};

export default DocDrawer;
