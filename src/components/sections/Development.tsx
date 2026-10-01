import React, { useState } from 'react';
import { usePlanner } from '../../store';
import { DEV_TASKS } from '../../data';
import { Task } from '../../types';
import { TaskList } from '../TaskItem';
import { ContextBanner } from '../ContextBanner';
import { fmtLong } from '../../utils';
import { Plus } from 'lucide-react';

export const Development: React.FC<{ filterTasks: (t: Task[]) => Task[] }> = ({ filterTasks }) => {
  const { state, addCustomTask } = usePlanner();
  const [tri, setTri] = useState('t1');
  const [newTaskText, setNewTaskText] = useState('');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim()) {
      addCustomTask(`dev_${tri}`, newTaskText.trim());
      setNewTaskText('');
    }
  };

  const standardTasks = DEV_TASKS[tri] || [];
  const customTasks = state.customTasks[`dev_${tri}`] || [];
  const combinedTasks = [...standardTasks, ...customTasks];

  const trimesterLabel = tri === 't1' 
    ? 'First Trimester' 
    : tri === 't2' 
      ? 'Second Trimester' 
      : 'Third Trimester';

  const trimesterWeeks = tri === 't1' 
    ? 'Weeks 1–12' 
    : tri === 't2' 
      ? 'Weeks 13–27' 
      : 'Weeks 28–40';

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-7">
        <h2 className="font-serif text-[clamp(28px,4vw,40px)] font-normal mb-1.5">Development & Expectations</h2>
        <p className="text-[14px] text-medium max-w-[560px] leading-[1.7]">What's happening in your body — and your baby's — each stage of the journey.</p>
      </div>
      
      <ContextBanner />
      
      <div className="flex gap-1.5 mb-5">
        <button onClick={() => setTri('t1')} className={`px-4 py-2 rounded-[20px] border-[1.5px] font-sans text-[13px] font-medium transition-all cursor-pointer ${tri === 't1' ? 'border-blush bg-blush-pale text-blush font-semibold' : 'border-border bg-white text-medium'}`}>First Trimester</button>
        <button onClick={() => setTri('t2')} className={`px-4 py-2 rounded-[20px] border-[1.5px] font-sans text-[13px] font-medium transition-all cursor-pointer ${tri === 't2' ? 'border-sage bg-sage-pale text-sage font-semibold' : 'border-border bg-white text-medium'}`}>Second Trimester</button>
        <button onClick={() => setTri('t3')} className={`px-4 py-2 rounded-[20px] border-[1.5px] font-sans text-[13px] font-medium transition-all cursor-pointer ${tri === 't3' ? 'border-gold bg-gold-pale text-gold font-semibold' : 'border-border bg-white text-medium'}`}>Third Trimester</button>
      </div>

      {tri === 't1' && (
        <div className="rounded-[14px] p-6 mb-5 relative overflow-hidden bg-gradient-to-br from-blush-pale to-[#fdf6f4] border-[1.5px] border-blush-light">
          <div className="text-[10px] font-semibold tracking-[2px] uppercase mb-1 text-blush">First Trimester · Weeks 1–12</div>
          <h3 className="font-serif text-[26px] font-normal mb-1">The Hidden Beginning</h3>
          <div className="text-[12px] text-light italic mb-3.5">{fmtLong(state.lmp)} — {fmtLong(state.t1End)}</div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 list-none mt-3.5">
            <li className="text-[13px] text-medium flex items-start gap-1.5"><span className="text-sage-light text-[18px] leading-[1.3] shrink-0">·</span>Fertilisation and implantation occur</li>
            <li className="text-[13px] text-medium flex items-start gap-1.5"><span className="text-sage-light text-[18px] leading-[1.3] shrink-0">·</span>Heart begins beating around week 6</li>
            <li className="text-[13px] text-medium flex items-start gap-1.5"><span className="text-sage-light text-[18px] leading-[1.3] shrink-0">·</span>All major organs begin forming</li>
            <li className="text-[13px] text-medium flex items-start gap-1.5"><span className="text-sage-light text-[18px] leading-[1.3] shrink-0">·</span>Nausea, fatigue, and breast tenderness are common</li>
            <li className="text-[13px] text-medium flex items-start gap-1.5"><span className="text-sage-light text-[18px] leading-[1.3] shrink-0">·</span>Emotional highs, anxiety, and wonder often coexist</li>
            <li className="text-[13px] text-medium flex items-start gap-1.5"><span className="text-sage-light text-[18px] leading-[1.3] shrink-0">·</span>Risk of miscarriage is highest, but most are chromosomal</li>
            <li className="text-[13px] text-medium flex items-start gap-1.5"><span className="text-sage-light text-[18px] leading-[1.3] shrink-0">·</span>Baby grows from a cell to 6cm by week 12</li>
            <li className="text-[13px] text-medium flex items-start gap-1.5"><span className="text-sage-light text-[18px] leading-[1.3] shrink-0">·</span>Sense of smell may sharpen dramatically</li>
          </ul>
        </div>
      )}

      {tri === 't2' && (
        <div className="rounded-[14px] p-6 mb-5 relative overflow-hidden bg-gradient-to-br from-sage-pale to-[#f0f5f1] border-[1.5px] border-sage-light">
          <div className="text-[10px] font-semibold tracking-[2px] uppercase mb-1 text-sage">Second Trimester · Weeks 13–27</div>
          <h3 className="font-serif text-[26px] font-normal mb-1">The Golden Window</h3>
          <div className="text-[12px] text-light italic mb-3.5">{fmtLong(state.t1End)} — {fmtLong(state.t2End)}</div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 list-none mt-3.5">
            <li className="text-[13px] text-medium flex items-start gap-1.5"><span className="text-sage-light text-[18px] leading-[1.3] shrink-0">·</span>Energy often returns as nausea eases</li>
            <li className="text-[13px] text-medium flex items-start gap-1.5"><span className="text-sage-light text-[18px] leading-[1.3] shrink-0">·</span>First movements felt around weeks 18–22</li>
            <li className="text-[13px] text-medium flex items-start gap-1.5"><span className="text-sage-light text-[18px] leading-[1.3] shrink-0">·</span>Baby can hear familiar voices and sounds</li>
            <li className="text-[13px] text-medium flex items-start gap-1.5"><span className="text-sage-light text-[18px] leading-[1.3] shrink-0">·</span>Anatomy scan is the big milestone</li>
            <li className="text-[13px] text-medium flex items-start gap-1.5"><span className="text-sage-light text-[18px] leading-[1.3] shrink-0">·</span>Bump becomes clearly visible</li>
            <li className="text-[13px] text-medium flex items-start gap-1.5"><span className="text-sage-light text-[18px] leading-[1.3] shrink-0">·</span>Baby grows from 6cm to ~35cm</li>
            <li className="text-[13px] text-medium flex items-start gap-1.5"><span className="text-sage-light text-[18px] leading-[1.3] shrink-0">·</span>Emotional adjustment to a changing body</li>
            <li className="text-[13px] text-medium flex items-start gap-1.5"><span className="text-sage-light text-[18px] leading-[1.3] shrink-0">·</span>Hair and nails may grow faster</li>
          </ul>
        </div>
      )}

      {tri === 't3' && (
        <div className="rounded-[14px] p-6 mb-5 relative overflow-hidden bg-gradient-to-br from-gold-pale to-cream border-[1.5px] border-gold">
          <div className="text-[10px] font-semibold tracking-[2px] uppercase mb-1 text-gold">Third Trimester · Weeks 28–40</div>
          <h3 className="font-serif text-[26px] font-normal mb-1">The Final Stretch</h3>
          <div className="text-[12px] text-light italic mb-3.5">{fmtLong(state.t2End)} — {fmtLong(state.dueDate)}</div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 list-none mt-3.5">
            <li className="text-[13px] text-medium flex items-start gap-1.5"><span className="text-sage-light text-[18px] leading-[1.3] shrink-0">·</span>Baby puts on most of their birth weight</li>
            <li className="text-[13px] text-medium flex items-start gap-1.5"><span className="text-sage-light text-[18px] leading-[1.3] shrink-0">·</span>Lungs mature around weeks 34–36</li>
            <li className="text-[13px] text-medium flex items-start gap-1.5"><span className="text-sage-light text-[18px] leading-[1.3] shrink-0">·</span>Baby usually moves head-down by week 36</li>
            <li className="text-[13px] text-medium flex items-start gap-1.5"><span className="text-sage-light text-[18px] leading-[1.3] shrink-0">·</span>Braxton Hicks contractions begin</li>
            <li className="text-[13px] text-medium flex items-start gap-1.5"><span className="text-sage-light text-[18px] leading-[1.3] shrink-0">·</span>Sleep difficulties and back pain increase</li>
            <li className="text-[13px] text-medium flex items-start gap-1.5"><span className="text-sage-light text-[18px] leading-[1.3] shrink-0">·</span>Nesting instinct is powerful and real</li>
            <li className="text-[13px] text-medium flex items-start gap-1.5"><span className="text-sage-light text-[18px] leading-[1.3] shrink-0">·</span>Baby can recognise your voice from inside</li>
            <li className="text-[13px] text-medium flex items-start gap-1.5"><span className="text-sage-light text-[18px] leading-[1.3] shrink-0">·</span>Anticipation, impatience, and excitement peak</li>
          </ul>
        </div>
      )}

      {/* Unified Trimester Tasks & Milestones Section */}
      <div className="mb-7 mt-6">
        <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
          <div className="font-serif text-[21px] font-medium text-charcoal">
            {trimesterLabel} Milestones & Tasks
          </div>
          <span className="text-[11.5px] font-semibold text-sage-dark bg-sage-pale/60 px-2.5 py-0.5 rounded-full border border-sage/20">
            {trimesterWeeks}
          </span>
        </div>
        <p className="text-[12.5px] text-medium mb-3.5">
          Standard milestones for this stage. Add your own custom tasks anytime.
        </p>

        {/* Seamless Unified List */}
        <TaskList tasks={combinedTasks} filterTasks={filterTasks} />

        {/* Inline Add Task Form */}
        <form onSubmit={handleAddTask} className="flex gap-2 mt-3.5 pt-3 border-t border-border/70">
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder={`Add a task to ${trimesterLabel}...`}
            className="flex-1 p-[11px_16px] border border-border/90 rounded-2xl font-sans text-[13.5px] text-charcoal bg-white focus:outline-none focus:border-sage shadow-3xs transition-all placeholder:text-light"
          />
          <button
            type="submit"
            disabled={!newTaskText.trim()}
            className="px-4 py-2.5 bg-sage text-white rounded-2xl font-semibold text-[13px] hover:bg-sage-dark transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shadow-3xs active:scale-95 cursor-pointer shrink-0"
          >
            <Plus size={16} />
            <span>Add Task</span>
          </button>
        </form>
      </div>
    </div>
  );
};
