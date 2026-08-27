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
      <div className="mb-7">
        <h2 className="font-serif text-[clamp(28px,4vw,40px)] font-normal mb-1.5">Financial Planning</h2>
        <p className="text-[14px] text-medium max-w-[560px] leading-[1.7]">Insurance, leave, budget — no spreadsheet required.</p>
      </div>
      
      <ContextBanner />
      
      <div className="mb-7">
        <div className="font-serif text-[20px] font-medium mb-1">Financial Checklist</div>
        <TaskList tasks={FIN_TASKS} filterTasks={filterTasks} />
      </div>

      <div className="h-px bg-border my-7" />
      
      <div className="font-serif text-[20px] font-medium mb-1">Budget Tracker</div>
      <div className="text-[12px] text-light italic mb-3.5">Enter estimated and actual costs — totals update live</div>
      
      <div className="grid grid-cols-[1fr_110px_110px] gap-2.5 p-[8px_14px] text-[11px] font-semibold tracking-[0.8px] uppercase text-light mb-1">
        <div>Item</div>
        <div className="text-right">Estimated</div>
        <div className="text-right">Actual spent</div>
      </div>
      
      <div>
        {allBudgetItems.map(item => (
          <div key={item.id} className="grid grid-cols-[1fr_110px_110px] gap-2.5 items-center p-[11px_14px] bg-white border-[1.5px] border-border rounded-[11px] mb-[7px]">
            <div className="text-[14px] text-charcoal">{item.label}</div>
            <input 
              type="number" 
              placeholder="0" 
              min="0"
              value={state.budgetEst[item.id] || ''}
              onChange={(e) => setBudgetEst(item.id, e.target.value)}
              className="p-[7px_10px] border-[1.5px] border-border rounded-[8px] font-sans text-[14px] text-right text-charcoal w-full transition-all focus:outline-none focus:border-sage"
            />
            <input 
              type="number" 
              placeholder="0" 
              min="0"
              value={state.budgetAct[item.id] || ''}
              onChange={(e) => setBudgetAct(item.id, e.target.value)}
              className="p-[7px_10px] border-[1.5px] border-border rounded-[8px] font-sans text-[14px] text-right text-charcoal w-full transition-all focus:outline-none focus:border-sage"
            />
          </div>
        ))}
      </div>
      
      <div className="flex gap-2 mt-2.5">
        <input 
          type="text" 
          placeholder="Add a custom item…"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
          className="flex-1 p-[9px_13px] border-[1.5px] border-dashed border-border rounded-[10px] font-sans text-[14px] bg-cream text-charcoal focus:outline-none focus:border-sage focus:border-solid"
        />
        <button 
          onClick={handleAddCustom}
          className="p-[9px_16px] bg-sage-pale border-[1.5px] border-sage rounded-[10px] font-sans text-[13px] font-semibold text-sage cursor-pointer transition-all hover:bg-sage hover:text-white"
        >
          + Add
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-5">
        <div className="bg-white border-[1.5px] border-border rounded-[14px] p-5 text-center">
          <div className="font-serif text-[34px] font-normal text-charcoal">₹{totalEst.toLocaleString()}</div>
          <div className="text-[12px] text-light mt-[3px]">Total estimated</div>
        </div>
        <div className="bg-white border-[1.5px] border-border rounded-[14px] p-5 text-center">
          <div className="font-serif text-[34px] font-normal text-charcoal">₹{totalAct.toLocaleString()}</div>
          <div className="text-[12px] text-light mt-[3px]">Total actual spent</div>
        </div>
      </div>

      <div className="h-px bg-border my-7" />
      
      <div className="mb-3.5">
        <label className="text-[11px] font-semibold tracking-[1px] uppercase text-medium block mb-2">Parental Leave Notes</label>
        <textarea 
          value={state.notes['notesLeave'] || ''}
          onChange={(e) => setNote('notesLeave', e.target.value)}
          className="w-full p-3.5 border-[1.5px] border-border rounded-[12px] font-sans text-[14px] text-charcoal bg-white resize-y min-h-[100px] transition-all leading-[1.65] focus:outline-none focus:border-sage focus:ring-[3px] focus:ring-sage/10 placeholder:text-light placeholder:italic"
          placeholder="Leave start date, pay during leave, employer contact, partner's leave plan…"
        />
      </div>
      
      <div>
        <label className="text-[11px] font-semibold tracking-[1px] uppercase text-medium block mb-2">Registry Notes</label>
        <textarea 
          value={state.notes['notesRegistry'] || ''}
          onChange={(e) => setNote('notesRegistry', e.target.value)}
          className="w-full p-3.5 border-[1.5px] border-border rounded-[12px] font-sans text-[14px] text-charcoal bg-white resize-y min-h-[100px] transition-all leading-[1.65] focus:outline-none focus:border-sage focus:ring-[3px] focus:ring-sage/10 placeholder:text-light placeholder:italic"
          placeholder="Registry platform, link, items already received, wish list priorities…"
        />
      </div>

      <CustomTaskList sectionId="finance" />
    </div>
  );
};
