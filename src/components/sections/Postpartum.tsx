import React from 'react';
import { usePlanner } from '../../store';
import { POSTPARTUM_TASKS } from '../../data';
import { Task } from '../../types';
import { TaskList } from '../TaskItem';

export const Postpartum: React.FC<{ filterTasks: (t: Task[]) => Task[] }> = ({ filterTasks }) => {
  const { state, setNote } = usePlanner();

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-7">
        <h2 className="font-serif text-[clamp(28px,4vw,40px)] font-normal mb-1.5">Early Parenthood</h2>
        {!state.isCalmModeActive && (
          <p className="text-[14px] text-medium max-w-[560px] leading-[1.7]">The fourth trimester and beyond — what to expect and prepare for after birth.</p>
        )}
      </div>
      
      {!state.isCalmModeActive && (
        <div className="bg-sage-pale border-l-[3px] border-sage rounded-[0_10px_10px_0] p-[13px_16px] text-[13px] text-medium mb-5 leading-[1.65]">
          <strong className="text-charcoal">The fourth trimester (weeks 0–12 after birth)</strong> is a profound adjustment period for both baby and parents. Planning ahead for this time is just as important as preparing for birth.
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-5">
        <div className="bg-white border-[1.5px] border-border rounded-[14px] p-5">
          <h4 className="font-serif text-[18px] font-medium mb-2.5 text-charcoal">Your Recovery</h4>
          <ul className="list-none">
            <li className="text-[13px] text-medium py-1 flex gap-1.5"><span className="text-sage-light text-[18px] leading-[1.2] shrink-0">·</span>Physical healing takes 6–8 weeks minimum</li>
            <li className="text-[13px] text-medium py-1 flex gap-1.5"><span className="text-sage-light text-[18px] leading-[1.2] shrink-0">·</span>Postpartum bleeding (lochia) for 2–6 weeks</li>
            <li className="text-[13px] text-medium py-1 flex gap-1.5"><span className="text-sage-light text-[18px] leading-[1.2] shrink-0">·</span>Night sweats and hormonal shifts are normal</li>
            <li className="text-[13px] text-medium py-1 flex gap-1.5"><span className="text-sage-light text-[18px] leading-[1.2] shrink-0">·</span>Pelvic floor recovery begins immediately</li>
            <li className="text-[13px] text-medium py-1 flex gap-1.5"><span className="text-sage-light text-[18px] leading-[1.2] shrink-0">·</span>C-section recovery needs extra time and support</li>
            <li className="text-[13px] text-medium py-1 flex gap-1.5"><span className="text-sage-light text-[18px] leading-[1.2] shrink-0">·</span>6-week check-up with your GP / OB is critical</li>
          </ul>
        </div>
        <div className="bg-white border-[1.5px] border-border rounded-[14px] p-5">
          <h4 className="font-serif text-[18px] font-medium mb-2.5 text-charcoal">Baby's First Weeks</h4>
          <ul className="list-none">
            <li className="text-[13px] text-medium py-1 flex gap-1.5"><span className="text-sage-light text-[18px] leading-[1.2] shrink-0">·</span>Newborns sleep 14–17 hours/day in short bursts</li>
            <li className="text-[13px] text-medium py-1 flex gap-1.5"><span className="text-sage-light text-[18px] leading-[1.2] shrink-0">·</span>Feeding every 2–3 hours (breast or bottle)</li>
            <li className="text-[13px] text-medium py-1 flex gap-1.5"><span className="text-sage-light text-[18px] leading-[1.2] shrink-0">·</span>Jaundice is common and usually mild</li>
            <li className="text-[13px] text-medium py-1 flex gap-1.5"><span className="text-sage-light text-[18px] leading-[1.2] shrink-0">·</span>Cord stump falls off at 1–3 weeks</li>
            <li className="text-[13px] text-medium py-1 flex gap-1.5"><span className="text-sage-light text-[18px] leading-[1.2] shrink-0">·</span>Newborn hearing and vision screening</li>
            <li className="text-[13px] text-medium py-1 flex gap-1.5"><span className="text-sage-light text-[18px] leading-[1.2] shrink-0">·</span>First paediatrician visit within 3–5 days</li>
          </ul>
        </div>
        <div className="bg-white border-[1.5px] border-border rounded-[14px] p-5">
          <h4 className="font-serif text-[18px] font-medium mb-2.5 text-charcoal">Mental & Emotional Health</h4>
          <ul className="list-none">
            <li className="text-[13px] text-medium py-1 flex gap-1.5"><span className="text-sage-light text-[18px] leading-[1.2] shrink-0">·</span>"Baby blues" affect up to 80% of new parents</li>
            <li className="text-[13px] text-medium py-1 flex gap-1.5"><span className="text-sage-light text-[18px] leading-[1.2] shrink-0">·</span>Postpartum depression is common and treatable</li>
            <li className="text-[13px] text-medium py-1 flex gap-1.5"><span className="text-sage-light text-[18px] leading-[1.2] shrink-0">·</span>Anxiety, intrusive thoughts — seek support early</li>
            <li className="text-[13px] text-medium py-1 flex gap-1.5"><span className="text-sage-light text-[18px] leading-[1.2] shrink-0">·</span>Partners can also experience postpartum depression</li>
            <li className="text-[13px] text-medium py-1 flex gap-1.5"><span className="text-sage-light text-[18px] leading-[1.2] shrink-0">·</span>Know your support contacts before baby arrives</li>
            <li className="text-[13px] text-medium py-1 flex gap-1.5"><span className="text-sage-light text-[18px] leading-[1.2] shrink-0">·</span>Sleep deprivation amplifies all emotions</li>
          </ul>
        </div>
        <div className="bg-white border-[1.5px] border-border rounded-[14px] p-5">
          <h4 className="font-serif text-[18px] font-medium mb-2.5 text-charcoal">Practical First Weeks</h4>
          <ul className="list-none">
            <li className="text-[13px] text-medium py-1 flex gap-1.5"><span className="text-sage-light text-[18px] leading-[1.2] shrink-0">·</span>Accept all help that is offered</li>
            <li className="text-[13px] text-medium py-1 flex gap-1.5"><span className="text-sage-light text-[18px] leading-[1.2] shrink-0">·</span>Set up a feeding station before birth</li>
            <li className="text-[13px] text-medium py-1 flex gap-1.5"><span className="text-sage-light text-[18px] leading-[1.2] shrink-0">·</span>Batch-cook or arrange meal support</li>
            <li className="text-[13px] text-medium py-1 flex gap-1.5"><span className="text-sage-light text-[18px] leading-[1.2] shrink-0">·</span>Limit visitors in the first week</li>
            <li className="text-[13px] text-medium py-1 flex gap-1.5"><span className="text-sage-light text-[18px] leading-[1.2] shrink-0">·</span>Register baby's birth within required timeframe</li>
            <li className="text-[13px] text-medium py-1 flex gap-1.5"><span className="text-sage-light text-[18px] leading-[1.2] shrink-0">·</span>Add baby to health insurance immediately</li>
          </ul>
        </div>
      </div>
      
      <div className="mt-2 mb-7">
        <div className="font-serif text-[20px] font-medium mb-1">Fourth Trimester Checklist</div>
        <div className="text-[12px] text-light italic mb-3">To prepare before birth</div>
        <TaskList tasks={POSTPARTUM_TASKS} filterTasks={filterTasks} />
      </div>
      
      <div className="h-px bg-border my-7" />
      
      <div>
        <label className="text-[11px] font-semibold tracking-[1px] uppercase text-medium block mb-2">Postpartum Support Plan</label>
        <textarea 
          value={state.notes['notesPostpartum'] || ''}
          onChange={(e) => setNote('notesPostpartum', e.target.value)}
          className="w-full p-3.5 border-[1.5px] border-border rounded-[12px] font-sans text-[14px] text-charcoal bg-white resize-y min-h-[120px] transition-all leading-[1.65] focus:outline-none focus:border-sage focus:ring-[3px] focus:ring-sage/10 placeholder:text-light placeholder:italic"
          placeholder="Who is helping in week 1? Week 2? Who can you call at 3am? What meals are planned? List your village here…"
        />
      </div>
    </div>
  );
};
