import React from 'react';
import { Calendar, Compass, HeartPulse, Sparkles, FolderArchive } from 'lucide-react';
import { triggerHaptic } from '../../utils/nativeBridge';

export type MobileTabId = 'today' | 'explore' | 'care' | 'smart' | 'vault';

interface MobileBottomNavProps {
  activeTab: MobileTabId;
  onSelectTab: (tab: MobileTabId) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ activeTab, onSelectTab }) => {
  const tabs: { id: MobileTabId; label: string; icon: React.FC<{ size: number; className?: string }>; badge?: string }[] = [
    { id: 'today', label: 'Today', icon: Calendar },
    { id: 'explore', label: 'Explore', icon: Compass, badge: '29' },
    { id: 'care', label: 'Care', icon: HeartPulse },
    { id: 'smart', label: 'Smart AI', icon: Sparkles },
    { id: 'vault', label: 'Vault', icon: FolderArchive },
  ];

  return (
    <nav className="w-full bg-white/95 backdrop-blur-md border-t border-border/80 px-2 pb-[max(0.75rem,calc(env(safe-area-inset-bottom,0px)+0.25rem))] pt-2 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const IconComponent = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                triggerHaptic('light');
                onSelectTab(tab.id);
              }}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 transition-all relative rounded-xl cursor-pointer ${
                isActive ? 'text-sage-dark font-bold' : 'text-medium font-medium hover:text-charcoal'
              }`}
            >
              <div className="relative">
                <IconComponent
                  size={20}
                  className={`transition-transform duration-200 ${isActive ? 'scale-110 text-sage-dark' : 'text-medium'}`}
                />
                {tab.badge && !isActive && (
                  <span className="absolute -top-1.5 -right-2.5 bg-sage-pale text-sage-dark border border-sage/30 text-[9px] font-bold px-1 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] xs:text-[11px] mt-0.5 leading-tight text-center truncate max-w-full px-0.5 ${isActive ? 'font-bold' : 'font-medium'}`}>
                {tab.label}
              </span>
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-sage-dark mt-1 animate-in zoom-in-50 duration-150" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
