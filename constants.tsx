
import React from 'react';

export const MoneyIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 10v-1m0 0c-1.657 0-3-.895-3-2s1.343-2 3-2m0 0c1.11 0 2.08.402 2.599 1M15 9.55c-.25.138-.5.26-.75.366m-6 4.168c.25.138.5.26.75.366M12 6a6 6 0 100 12 6 6 0 000-12z" />
    </svg>
);

export const TimeIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const InfoIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const SettingsIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

export const TokenIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.835 3.036A3 3 0 0113.165 3.036L19.63 6.964a3 3 0 011.665 2.598v6.876a3 3 0 01-1.665 2.598l-6.465 3.928a3 3 0 01-2.33 0l-6.465-3.928a3 3 0 01-1.665-2.598V9.562a3 3 0 011.665-2.598l6.465-3.928z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75V12m0 0V8.25m0 3.75h3.75M12 12H8.25" />
    </svg>
);

export const DocsIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
);

export const JailIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h16v16H4V4z" strokeDasharray="4 2" />
    </svg>
);

export const FreeParkingIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        <path d="M5 12a7 7 0 1 1 14 0a7 7 0 0 1-14 0z" />
    </svg>
);

export const GoToJailIcon = ({ className }: { className?: string }) => (
     <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${className}`} viewBox="0 0 24 24" fill="currentColor">
        <path d="M14 6V5h-4v1H8v4h2v2h4v-2h2V6h-2Zm-2-3c.55 0 1 .45 1 1v1h-2V4c0-.55.45-1 1-1Zm7 6v10c0 1.1-.9 2-2 2H7c-1.1 0-2-.9 2-2V9c0-1.1.9-2 2-2h3.17c0-1.69 1.21-3.1 2.83-3.1s2.83 1.41 2.83 3.1H19c1.1 0 2 .9 2 2Zm-8 1.5c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5Z"/>
    </svg>
);

export const StartIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l4 4m0 0l-4 4m4-4H3" />
    </svg>
);

export const ChanceIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${className} text-blue-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const CommunityChestIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${className} text-orange-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
);

export const TaxIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${className} text-red-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8h6m-5 4h4m5 6H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2z" />
    </svg>
);

export const UtilityIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${className} text-purple-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);

export const IconMap = {
    MoneyIcon,
    TimeIcon,
    InfoIcon,
};

export const DEFAULT_QUESTS = [
    { id: 'aadhaar', name: 'Aadhaar Quest', description: "Navigate India's digital identity system.", filePath: '/quests/aadhaar-quest.json' },
    { id: 'metro-master', name: 'Metro Master: Urban Transit Challenge', description: 'Navigate urban transit in India, balancing time, money, and safety.', filePath: '/quests/metro-master_-urban-transit-challenge-quest.json' },
    { id: 'foodie-fun', name: 'Foodie Fun: The Healthy Habits Game', description: 'Navigate the culinary world, balancing taste, health, and time.', filePath: '/quests/foodie-fun_-the-healthy-habits-game-quest.json' },
    { id: 'architects-of-ai', name: 'Architects of AI', description: 'Balance your Budget, Accuracy, and Efficiency as you navigate the complex world of AI architecture and development.', filePath: '/quests/architects-of-ai-quest.json' },
    { id: 'carbon-crawl', name: 'Carbon Crawl', description: 'Navigate a sustainable future while keeping costs, environmental concerns, and irreversibility in check.', filePath: '/quests/carbon-crawl-quest.json' },
    { id: 'validation', name: 'Schema Validation Quest (Test)', description: 'A test quest for validation purposes.', filePath: '/quests/validation-quest.json' },
];

export const DOC_LINKS = [
    { id: 'introduction', title: 'Introduction to QuestCraft' },
    { id: 'quest-schema', title: 'Quest JSON Schema' },
    { id: 'maker-guide', title: 'Quest Maker Guide' },
    { id: 'architecture', title: 'Architecture & Design' },
    { id: 'privacy', title: 'Privacy & Data Safety' },
];
