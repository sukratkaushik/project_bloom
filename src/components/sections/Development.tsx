import React, { useState } from 'react';
import { usePlanner } from '../../store';
import { DEV_TASKS } from '../../data';
import { Task } from '../../types';
import { TaskList } from '../TaskItem';
import { ContextBanner } from '../ContextBanner';
import { CustomTaskList } from './CustomTaskList';
import { fmtLong } from '../../utils';

export const Development: React.FC<{ filterTasks: (t: Task[]) => Task[] }> = ({ filterTasks }) => {
  const { state } = usePlanner();
  const [tri, setTri] = useState('t1');

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-7">
        <h2 className="font-serif text-[clamp(28px,4vw,40px)] font-normal mb-1.5">Development & Expectations</h2>
        {!state.isCalmModeActive && (
          <p className="text-[14px] text-medium max-w-[560px] leading-[1.7]">What's happening in your body — and your baby's — each stage of the journey.</p>
        )}
      </div>
      
      {!state.isCalmModeActive && <ContextBanner />}
      
      <div className="flex gap-1.5 mb-5">
        <button onClick={() => setTri('t1')} className={`px-4 py-2 rounded-[20px] border-[1.5px] font-sans text-[13px] font-medium transition-all ${tri === 't1' ? 'border-blush bg-blush-pale text-blush' : 'border-border bg-white text-medium'}`}>First Trimester</button>
        <button onClick={() => setTri('t2')} className={`px-4 py-2 rounded-[20px] border-[1.5px] font-sans text-[13px] font-medium transition-all ${tri === 't2' ? 'border-sage bg-sage-pale text-sage' : 'border-border bg-white text-medium'}`}>Second Trimester</button>
        <button onClick={() => setTri('t3')} className={`px-4 py-2 rounded-[20px] border-[1.5px] font-sans text-[13px] font-medium transition-all ${tri === 't3' ? 'border-gold bg-gold-pale text-gold' : 'border-border bg-white text-medium'}`}>Third Trimester</button>
      </div>

      {tri === 't1' && (
        <div>
          <div className="rounded-[14px] p-6 mb-5 relative overflow-hidden bg-gradient-to-br from-blush-pale to-[#fdf6f4] border-[1.5px] border-blush-light">
            <div className="text-[10px] font-semibold tracking-[2px] uppercase mb-1 text-blush">First Trimester · Weeks 1–12</div>
            <h3 className="font-serif text-[26px] font-normal mb-1">The Hidden Beginning</h3>
            {!state.isCalmModeActive && (
              <div className="text-[12px] text-light italic mb-3.5">{fmtLong(state.lmp)} — {fmtLong(state.t1End)}</div>
            )}
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
          <div className="mb-7">
            <div className="font-serif text-[20px] font-medium mb-1">Emotional milestones worth marking</div>
            <div className="text-[12px] text-light italic mb-3">Not checkboxes — just moments to honour</div>
            <TaskList tasks={DEV_TASKS.t1} filterTasks={filterTasks} />
          </div>
        </div>
      )}

      {tri === 't2' && (
        <div>
          <div className="rounded-[14px] p-6 mb-5 relative overflow-hidden bg-gradient-to-br from-sage-pale to-[#f0f5f1] border-[1.5px] border-sage-light">
            <div className="text-[10px] font-semibold tracking-[2px] uppercase mb-1 text-sage">Second Trimester · Weeks 13–27</div>
            <h3 className="font-serif text-[26px] font-normal mb-1">The Golden Window</h3>
            {!state.isCalmModeActive && (
              <div className="text-[12px] text-light italic mb-3.5">{fmtLong(state.t1End)} — {fmtLong(state.t2End)}</div>
            )}
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 list-none mt-3.5">
              <li className="text-[13px] text-medium flex items-start gap-1.5"><span className="text-sage-light text-[18px] leading-[1.3] shrink-0">·</span>Energy often returns as nausea eases</li>
              <li className="text-[13px] text-medium flex items-start gap-1.5"><span className="text-sage-light text-[18px] leading-[1.3] shrink-0">·</span>First movements felt around weeks 18–22</li>
              <li className="text-[13px] text-medium flex items-start gap-1.5"><span className="text-sage-light text-[18px] leading-[1.3] shrink-0">·</span>Baby's sex becomes detectable</li>
              <li className="text-[13px] text-medium flex items-start gap-1.5"><span className="text-sage-light text-[18px] leading-[1.3] shrink-0">·</span>Anatomy scan is the big milestone</li>
              <li className="text-[13px] text-medium flex items-start gap-1.5"><span className="text-sage-light text-[18px] leading-[1.3] shrink-0">·</span>Bump becomes clearly visible</li>
              <li className="text-[13px] text-medium flex items-start gap-1.5"><span className="text-sage-light text-[18px] leading-[1.3] shrink-0">·</span>Baby grows from 6cm to ~35cm</li>
              <li className="text-[13px] text-medium flex items-start gap-1.5"><span className="text-sage-light text-[18px] leading-[1.3] shrink-0">·</span>Emotional adjustment to a changing body</li>
              <li className="text-[13px] text-medium flex items-start gap-1.5"><span className="text-sage-light text-[18px] leading-[1.3] shrink-0">·</span>Hair and nails may grow faster</li>
            </ul>
          </div>
          <div className="mb-7">
            <div className="font-serif text-[20px] font-medium mb-1">Emotional milestones</div>
            <TaskList tasks={DEV_TASKS.t2} filterTasks={filterTasks} />
          </div>
        </div>
      )}

      {tri === 't3' && (
        <div>
          <div className="rounded-[14px] p-6 mb-5 relative overflow-hidden bg-gradient-to-br from-gold-pale to-cream border-[1.5px] border-gold">
            <div className="text-[10px] font-semibold tracking-[2px] uppercase mb-1 text-gold">Third Trimester · Weeks 28–40</div>
            <h3 className="font-serif text-[26px] font-normal mb-1">The Final Stretch</h3>
            {!state.isCalmModeActive && (
              <div className="text-[12px] text-light italic mb-3.5">{fmtLong(state.t2End)} — {fmtLong(state.dueDate)}</div>
            )}
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
          <div className="mb-7">
            <div className="font-serif text-[20px] font-medium mb-1">Emotional milestones</div>
            <TaskList tasks={DEV_TASKS.t3} filterTasks={filterTasks} />
          </div>
        </div>
      )}

      <CustomTaskList sectionId={`dev_${tri}`} />
    </div>
  );
};
