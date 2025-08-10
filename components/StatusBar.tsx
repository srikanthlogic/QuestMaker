
import React from 'react';
import type { AppStats } from '../types';
import { TokenIcon, MoneyIcon, TimeIcon, DocsIcon } from '../constants';
import { useTranslation } from '../services/i18n';

interface StatusBarProps {
    stats: AppStats | null;
    isAiConnected: boolean;
    onNavigateToDocs: () => void;
    onOpenSettings: () => void;
}

const formatTime = (totalSeconds: number): string => {
    if (isNaN(totalSeconds) || totalSeconds < 0) return '00:00:00';
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
};

const StatItem: React.FC<{ icon: React.ReactNode; label: string; value: string | number; tooltip: string; }> = ({ icon, label, value, tooltip }) => (
    <div className="flex items-center gap-2" title={tooltip}>
        <div className="text-gray-400">{icon}</div>
        <div className="flex items-baseline gap-1.5">
            <span className="hidden sm:inline text-sm font-medium text-gray-200">{label}:</span>
            <span className="text-sm font-semibold font-mono text-orange-300">{value}</span>
        </div>
    </div>
);

const StatusBar: React.FC<StatusBarProps> = ({ stats, isAiConnected, onNavigateToDocs, onOpenSettings }) => {
    const { t } = useTranslation();
    if (!stats) return null;

    const totalTokens = (stats.totalInputTokens || 0) + (stats.totalOutputTokens || 0);

    return (
        <footer className="fixed bottom-0 left-0 right-0 h-12 bg-gray-900/80 backdrop-blur-md border-t border-gray-700 z-50">
            <div className="container mx-auto h-full flex items-center justify-between px-4">
                {/* Left Side */}
                <div className="flex items-center gap-4">
                    <button onClick={onNavigateToDocs} className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors" title={t('readTheDocs')}>
                        <DocsIcon className="w-4 h-4" />
                        <span className="hidden sm:inline text-sm font-medium">{t('docs')}</span>
                    </button>
                     <button onClick={onOpenSettings} className="flex items-center gap-2" title={isAiConnected ? t('aiConnected') : t('aiDisconnected')}>
                        <div className={`w-3 h-3 rounded-full ${isAiConnected ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></div>
                        <span className="hidden sm:inline text-sm font-medium text-gray-200">{t('aiStatus')}</span>
                    </button>
                </div>
                {/* Right Side */}
                <div className="flex items-center gap-4 md:gap-6">
                    <StatItem
                        icon={<TokenIcon className="w-4 h-4" />}
                        label={t('tokens')}
                        value={totalTokens.toLocaleString()}
                        tooltip={`Input: ${stats.totalInputTokens.toLocaleString()} | Output: ${stats.totalOutputTokens.toLocaleString()}`}
                    />
                    <StatItem
                        icon={<MoneyIcon className="w-4 h-4" />}
                        label={t('estCost')}
                        value={stats.totalCost.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 6 })}
                        tooltip="Estimated cost based on gemini-2.5-flash pricing. Other models may vary."
                    />
                    <StatItem
                        icon={<TimeIcon className="w-4 h-4" />}
                        label={t('playTime')}
                        value={formatTime(stats.timePlayedInSeconds)}
                        tooltip="Total time spent in an active game."
                    />
                </div>
            </div>
        </footer>
    );
};

export default StatusBar;
