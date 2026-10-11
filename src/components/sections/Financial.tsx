import React, { useState } from 'react';
import { usePlanner } from '../../store';
import { FIN_TASKS, BUDGET_ITEMS } from '../../data';
import { Task } from '../../types';
import { TaskList } from '../TaskItem';
import { ContextBanner } from '../ContextBanner';
import { CustomTaskList } from './CustomTaskList';

export const Financial: React.FC<{ filterTasks: (t: Task[]) => Task[] }> = ({ filterTasks }) => {
  const { state, setBudgetEst, setBudgetAct, addCustomBudgetItem, setNote } = usePlanner();
  const [newItem, setNewItem] = useState('');

  const handleAddCustom = () => {
    if (newItem.trim()) {
      addCustomBudgetItem(newItem.trim());
      setNewItem('');
    }
  };

  const allBudgetItems = [...BUDGET_ITEMS, ...state.customBudgetItems];

  const totalEst = allBudgetItems.reduce((sum, item) => sum + (parseFloat(state.budgetEst[item.id]) || 0), 0);
  const totalAct = allBudgetItems.reduce((sum, item) => sum + (parseFloat(state.budgetAct[item.id]) || 0), 0);

  return (
    <div className="animate-in fade-in duration-300">
      <ContextBanner description="Insurance, leave, budget — no spreadsheet required." />
      
      <div className="mb-6">
        <div className="font-serif text-[18px] xs:text-[19px] font-medium mb-2.5 text-charcoal">Financial Checklist</div>
        <TaskList tasks={FIN_TASKS} filterTasks={filterTasks} />
      </div>

      <div className="h-px bg-border/70 my-6" />
      
      <div className="mb-6">
        <div className="font-serif text-[18px] xs:text-[19px] font-medium text-charcoal mb-0.5">Budget Tracker</div>
        <div className="text-[12px] text-light italic mb-2.5">Enter estimated and actual costs — totals update live</div>
        
        <div className="grid grid-cols-[1fr_75px_75px] xs:grid-cols-[1fr_85px_85px] gap-2 px-3 py-1 text-[10px] font-bold tracking-wider uppercase text-light mb-1">
          <div>Item</div>
          <div className="text-right">Estimated</div>
          <div className="text-right">Actual Spent</div>
        </div>
        
        <div className="bg-white border border-border/80 rounded-xl divide-y divide-border/50 shadow-3xs overflow-hidden">
          {allBudgetItems.map(item => (
            <div 
              key={item.id} 
              className="grid grid-cols-[1fr_75px_75px] xs:grid-cols-[1fr_85px_85px] items-center gap-2 py-1.5 px-3 hover:bg-cream/20 transition-colors"
            >
              <div className="text-[12px] xs:text-[12.5px] font-medium text-charcoal leading-snug truncate pr-1">
                {item.label}
              </div>
              <div className="relative">
                <input 
                  type="number" 
                  placeholder="0" 
                  min="0"
                  value={state.budgetEst[item.id] || ''}
                  onChange={(e) => setBudgetEst(item.id, e.target.value)}
                  className="w-full py-1 px-2 bg-cream/40 border border-border/70 rounded-md font-sans text-[12px] text-right text-charcoal transition-all focus:outline-none focus:border-sage focus:bg-white tabular-nums placeholder:text-light/60"
                />
              </div>
              <div className="relative">
                <input 
                  type="number" 
                  placeholder="0" 
                  min="0"
                  value={state.budgetAct[item.id] || ''}
                  onChange={(e) => setBudgetAct(item.id, e.target.value)}
                  className="w-full py-1 px-2 bg-cream/40 border border-border/70 rounded-md font-sans text-[12px] text-right text-charcoal transition-all focus:outline-none focus:border-sage focus:bg-white tabular-nums placeholder:text-light/60"
                />
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex gap-2 mt-2">
          <input 
            type="text" 
            placeholder="Add a custom item…"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
            className="flex-1 py-1.5 px-3 border border-dashed border-border/90 rounded-lg font-sans text-[12px] bg-cream/30 text-charcoal placeholder:text-light/70 focus:outline-none focus:border-sage focus:bg-white"
          />
          <button 
            type="button"
            onClick={handleAddCustom}
            className="py-1.5 px-3 bg-sage-pale border border-sage/40 rounded-lg font-sans text-[12px] font-semibold text-sage-dark cursor-pointer transition-all hover:bg-sage hover:text-white active:scale-95"
          >
            + Add
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="bg-white border border-border/80 rounded-xl py-2 px-3 shadow-3xs">
            <span className="text-[10px] font-bold tracking-wider uppercase text-light block mb-0.5">Total Estimated</span>
            <div className="font-sans text-[17px] xs:text-[18px] font-semibold text-charcoal tabular-nums">
              ₹{totalEst.toLocaleString()}
            </div>
          </div>
          <div className="bg-white border border-border/80 rounded-xl py-2 px-3 shadow-3xs">
            <span className="text-[10px] font-bold tracking-wider uppercase text-light block mb-0.5">Total Actual Spent</span>
            <div className="font-sans text-[17px] xs:text-[18px] font-semibold text-charcoal tabular-nums">
              ₹{totalAct.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <div className="h-px bg-border/70 my-5" />
      
      <div className="space-y-3 mb-5">
        <div>
          <label className="text-[10.5px] font-bold tracking-wider uppercase text-light block mb-1">Parental Leave Notes</label>
          <textarea 
            value={state.notes['notesLeave'] || ''}
            onChange={(e) => setNote('notesLeave', e.target.value)}
            rows={2}
            className="w-full py-2 px-3 border border-border/80 rounded-xl font-sans text-[12.5px] text-charcoal bg-white resize-y transition-all leading-relaxed focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage/20 placeholder:text-light/60 placeholder:italic shadow-3xs"
            placeholder="Leave start date, pay during leave, employer contact, partner's leave plan…"
          />
        </div>
        
        <div>
          <label className="text-[10.5px] font-bold tracking-wider uppercase text-light block mb-1">Registry Notes</label>
          <textarea 
            value={state.notes['notesRegistry'] || ''}
            onChange={(e) => setNote('notesRegistry', e.target.value)}
            rows={2}
            className="w-full py-2 px-3 border border-border/80 rounded-xl font-sans text-[12.5px] text-charcoal bg-white resize-y transition-all leading-relaxed focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage/20 placeholder:text-light/60 placeholder:italic shadow-3xs"
            placeholder="Registry platform, link, items already received, wish list priorities…"
          />
        </div>
      </div>

      <CustomTaskList sectionId="finance" />
    </div>
  );
};
