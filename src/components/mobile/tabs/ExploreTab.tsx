import React, { useState, useMemo } from 'react';
import { Search, Star, X } from 'lucide-react';
import { triggerHaptic } from '../../../utils/nativeBridge';

import { ALL_PREGNANCY_TOOLS, CATEGORY_CHIPS, ToolDefinition } from '../toolsData';

interface ExploreTabProps {
  onOpenTool: (toolId: string) => void;
  pinnedIds: string[];
  onTogglePin: (toolId: string) => void;
}

export const ExploreTab: React.FC<ExploreTabProps> = ({ onOpenTool, pinnedIds, onTogglePin }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const tools: ToolDefinition[] = ALL_PREGNANCY_TOOLS;
  const categoryChips = CATEGORY_CHIPS;

  // Filtered tools by search query and category
  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat =
        selectedCategory === 'All' || tool.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [tools, searchQuery, selectedCategory]);


  return (
    <div className="space-y-4 pb-32 animate-in fade-in duration-200">
      {/* 1. Sticky Search Bar & Category Filter Chips */}
      <div className="relative sticky top-0 z-20 pt-1 pb-1 bg-cream/95 backdrop-blur-xs">
        <div className="relative flex items-center">
          <Search size={17} className="absolute left-3.5 text-medium pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search 29 pregnancy tools, scans, schemes..."
            className="w-full pl-10 pr-9 py-2.5 bg-white border border-border/80 rounded-2xl text-[13px] font-medium text-charcoal placeholder:text-light focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage shadow-2xs transition-shadow"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setSearchQuery('');
              }}
              className="absolute right-3 p-1 rounded-full text-light hover:text-charcoal transition-colors cursor-pointer"
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Clean Single-Line Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2.5 pb-1 no-scrollbar">
          {categoryChips.map((chip) => {
            const isSelected = selectedCategory === chip.key;
            return (
              <button
                key={chip.key}
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setSelectedCategory(chip.key);
                }}
                className={`h-8 px-3 rounded-xl text-[11.5px] font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
                  isSelected
                    ? 'bg-charcoal text-white shadow-xs'
                    : 'bg-white text-medium border border-border/70 hover:bg-cream hover:text-charcoal'
                }`}
              >
                <span>{chip.label}</span>
                <span className={`text-[10px] ${isSelected ? 'text-white/70' : 'text-light'}`}>
                  {chip.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>



      {/* 4. Well-Sorted Directory with Uniform Heights */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-serif text-[14.5px] font-bold text-charcoal flex items-center gap-1.5">
            <span>{selectedCategory === 'All' ? 'All Pregnancy Tools' : selectedCategory}</span>
            <span className="text-[10.5px] font-sans font-bold text-sage-dark bg-sage-pale px-2 py-0.2 rounded-full">
              {filteredTools.length}
            </span>
          </h3>
          {searchQuery && (
            <span className="text-[11px] text-medium">
              Filtered by "{searchQuery}"
            </span>
          )}
        </div>

        {filteredTools.length === 0 ? (
          <div className="bg-white border border-border/80 rounded-2xl p-8 text-center shadow-xs">
            <Search size={30} className="mx-auto text-light mb-2" />
            <h4 className="font-bold text-charcoal text-[13.5px]">No matching tools found</h4>
            <p className="text-[11.5px] text-medium mt-1">
              Try searching for "scans", "schemes", "vitals", or "kick counter".
            </p>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="mt-3 px-4 py-1.5 bg-sage text-white text-[12px] font-bold rounded-xl shadow-2xs hover:bg-sage-dark transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTools.map((tool) => {
              const isPinned = pinnedIds.includes(tool.id);
              const IconComp = tool.icon;

              return (
                <div
                  key={tool.id}
                  onClick={() => {
                    triggerHaptic('light');
                    onOpenTool(tool.id);
                  }}
                  className="h-16 bg-white border border-border/80 hover:border-sage rounded-2xl px-3.5 flex items-center justify-between gap-3 shadow-2xs hover:shadow-xs active:scale-[0.99] transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${tool.color} group-hover:scale-105 transition-transform`}>
                      <IconComp size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-charcoal text-[13px] leading-tight truncate group-hover:text-sage-dark transition-colors">
                          {tool.title}
                        </h4>
                        {tool.badge && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-sage-pale text-sage-dark shrink-0">
                            {tool.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-medium truncate mt-0.5">
                        {tool.desc}
                      </p>
                    </div>
                  </div>

                  {/* Pin / Star Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerHaptic('light');
                      onTogglePin(tool.id);
                    }}
                    className={`w-10 h-10 flex items-center justify-center -mr-1.5 rounded-full transition-colors shrink-0 cursor-pointer ${
                      isPinned
                        ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
                        : 'text-stone-300 hover:text-amber-500 hover:bg-amber-50/60'
                    }`}
                    aria-label={isPinned ? 'Unpin from Rituals' : 'Pin to Rituals'}
                    title={isPinned ? 'Pinned to Today Tab' : 'Pin to Today Tab'}
                  >
                    <Star size={18} fill={isPinned ? 'currentColor' : 'none'} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
