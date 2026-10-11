import React, { useState } from 'react';
import { usePlanner } from '../../store';
import { POSTPARTUM_TASKS } from '../../data';
import { Task } from '../../types';
import { TaskList } from '../TaskItem';
import { ContextBanner } from '../ContextBanner';
import { Paywall } from '../Paywall';
import { triggerHaptic } from '../../utils/nativeBridge';
import { Plus } from 'lucide-react';

export const Postpartum: React.FC<{ filterTasks: (t: Task[]) => Task[] }> = ({ filterTasks }) => {
  const { state, addCustomTask } = usePlanner();
  const [newTaskText, setNewTaskText] = useState('');

  const handleAddTask = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem('customTaskInput') as HTMLInputElement | null;
    const val = newTaskText.trim() || input?.value.trim() || '';
    if (val) {
      triggerHaptic('light');
      addCustomTask('postpartum', val);
      setNewTaskText('');
      if (input) input.value = '';
    }
  };

  const customTasks = state.customTasks['postpartum'] || [];

  return (
    <Paywall featureName="Postpartum">
      <div className="animate-in fade-in duration-300">
        <ContextBanner description="The fourth trimester and beyond — what to expect and prepare for after birth." />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-5">
          <div className="bg-white border border-border/80 rounded-2xl p-4.5 xs:p-5 shadow-3xs">
            <h4 className="font-serif text-[18px] font-medium mb-2.5 text-charcoal">Your Recovery</h4>
            <ul className="list-none space-y-1">
              <li className="text-[13px] text-charcoal/80 py-0.5 flex gap-2 items-start"><span className="text-sage text-[14px] leading-tight shrink-0 mt-0.5">✦</span>Physical healing takes 6–8 weeks minimum</li>
              <li className="text-[13px] text-charcoal/80 py-0.5 flex gap-2 items-start"><span className="text-sage text-[14px] leading-tight shrink-0 mt-0.5">✦</span>Postpartum bleeding (lochia) for 2–6 weeks</li>
              <li className="text-[13px] text-charcoal/80 py-0.5 flex gap-2 items-start"><span className="text-sage text-[14px] leading-tight shrink-0 mt-0.5">✦</span>Night sweats and hormonal shifts are normal</li>
              <li className="text-[13px] text-charcoal/80 py-0.5 flex gap-2 items-start"><span className="text-sage text-[14px] leading-tight shrink-0 mt-0.5">✦</span>Pelvic floor recovery begins gently</li>
              <li className="text-[13px] text-charcoal/80 py-0.5 flex gap-2 items-start"><span className="text-sage text-[14px] leading-tight shrink-0 mt-0.5">✦</span>C-section recovery needs extra care & support</li>
              <li className="text-[13px] text-charcoal/80 py-0.5 flex gap-2 items-start"><span className="text-sage text-[14px] leading-tight shrink-0 mt-0.5">✦</span>6-week check-up with your OB is essential</li>
            </ul>
          </div>

          <div className="bg-white border border-border/80 rounded-2xl p-4.5 xs:p-5 shadow-3xs">
            <h4 className="font-serif text-[18px] font-medium mb-2.5 text-charcoal">Baby's First Weeks</h4>
            <ul className="list-none space-y-1">
              <li className="text-[13px] text-charcoal/80 py-0.5 flex gap-2 items-start"><span className="text-sage text-[14px] leading-tight shrink-0 mt-0.5">✦</span>Newborns sleep 14–17 hours/day in short bursts</li>
              <li className="text-[13px] text-charcoal/80 py-0.5 flex gap-2 items-start"><span className="text-sage text-[14px] leading-tight shrink-0 mt-0.5">✦</span>Feeding every 2–3 hours (breast or bottle)</li>
              <li className="text-[13px] text-charcoal/80 py-0.5 flex gap-2 items-start"><span className="text-sage text-[14px] leading-tight shrink-0 mt-0.5">✦</span>Jaundice is common and usually mild</li>
              <li className="text-[13px] text-charcoal/80 py-0.5 flex gap-2 items-start"><span className="text-sage text-[14px] leading-tight shrink-0 mt-0.5">✦</span>Cord stump falls off naturally at 1–3 weeks</li>
              <li className="text-[13px] text-charcoal/80 py-0.5 flex gap-2 items-start"><span className="text-sage text-[14px] leading-tight shrink-0 mt-0.5">✦</span>Newborn hearing and vision screening</li>
              <li className="text-[13px] text-charcoal/80 py-0.5 flex gap-2 items-start"><span className="text-sage text-[14px] leading-tight shrink-0 mt-0.5">✦</span>First paediatrician visit within 3–5 days</li>
            </ul>
          </div>

          <div className="bg-white border border-border/80 rounded-2xl p-4.5 xs:p-5 shadow-3xs">
            <h4 className="font-serif text-[18px] font-medium mb-2.5 text-charcoal">Mental & Emotional Health</h4>
            <ul className="list-none space-y-1">
              <li className="text-[13px] text-charcoal/80 py-0.5 flex gap-2 items-start"><span className="text-sage text-[14px] leading-tight shrink-0 mt-0.5">✦</span>"Baby blues" affect up to 80% of new parents</li>
              <li className="text-[13px] text-charcoal/80 py-0.5 flex gap-2 items-start"><span className="text-sage text-[14px] leading-tight shrink-0 mt-0.5">✦</span>Postpartum depression is common and treatable</li>
              <li className="text-[13px] text-charcoal/80 py-0.5 flex gap-2 items-start"><span className="text-sage text-[14px] leading-tight shrink-0 mt-0.5">✦</span>Anxiety or intrusive thoughts — seek support early</li>
              <li className="text-[13px] text-charcoal/80 py-0.5 flex gap-2 items-start"><span className="text-sage text-[14px] leading-tight shrink-0 mt-0.5">✦</span>Partners can also experience emotional strain</li>
              <li className="text-[13px] text-charcoal/80 py-0.5 flex gap-2 items-start"><span className="text-sage text-[14px] leading-tight shrink-0 mt-0.5">✦</span>Save key helpline contacts before delivery</li>
              <li className="text-[13px] text-charcoal/80 py-0.5 flex gap-2 items-start"><span className="text-sage text-[14px] leading-tight shrink-0 mt-0.5">✦</span>Rest whenever baby sleeps to recover</li>
            </ul>
          </div>

          <div className="bg-white border border-border/80 rounded-2xl p-4.5 xs:p-5 shadow-3xs">
            <h4 className="font-serif text-[18px] font-medium mb-2.5 text-charcoal">Practical First Weeks</h4>
            <ul className="list-none space-y-1">
              <li className="text-[13px] text-charcoal/80 py-0.5 flex gap-2 items-start"><span className="text-sage text-[14px] leading-tight shrink-0 mt-0.5">✦</span>Accept family and community help with grace</li>
              <li className="text-[13px] text-charcoal/80 py-0.5 flex gap-2 items-start"><span className="text-sage text-[14px] leading-tight shrink-0 mt-0.5">✦</span>Set up a comfortable feeding station before birth</li>
              <li className="text-[13px] text-charcoal/80 py-0.5 flex gap-2 items-start"><span className="text-sage text-[14px] leading-tight shrink-0 mt-0.5">✦</span>Arrange postpartum nourishment & meals</li>
              <li className="text-[13px] text-charcoal/80 py-0.5 flex gap-2 items-start"><span className="text-sage text-[14px] leading-tight shrink-0 mt-0.5">✦</span>Set gentle boundaries around visitors in week 1</li>
              <li className="text-[13px] text-charcoal/80 py-0.5 flex gap-2 items-start"><span className="text-sage text-[14px] leading-tight shrink-0 mt-0.5">✦</span>Register baby's birth certificate on time</li>
              <li className="text-[13px] text-charcoal/80 py-0.5 flex gap-2 items-start"><span className="text-sage text-[14px] leading-tight shrink-0 mt-0.5">✦</span>Add baby to health insurance immediately</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 mb-7">
          <div className="font-serif text-[19px] xs:text-[20px] font-medium text-charcoal mb-0.5">Fourth Trimester Checklist</div>
          <div className="text-[12px] text-light italic mb-3.5">To prepare before birth</div>

          {/* Add Custom Task Input */}
          <form onSubmit={handleAddTask} className="flex gap-2 mb-3.5">
            <input
              name="customTaskInput"
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="Add a custom task..."
              className="flex-1 py-2.5 px-3.5 border border-border/80 rounded-xl font-sans text-[13px] text-charcoal bg-white focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage/20 transition-all placeholder:text-light/70 shadow-3xs"
            />
            <button
              type="submit"
              className={`w-10 h-10 bg-sage text-white rounded-xl font-semibold transition-all hover:bg-sage-dark flex items-center justify-center active:scale-95 shadow-3xs shrink-0 cursor-pointer ${
                !newTaskText.trim() ? 'opacity-70' : 'opacity-100'
              }`}
              title="Add task"
              aria-label="Add task"
            >
              <Plus size={17} strokeWidth={2.4} />
            </button>
          </form>

          <TaskList tasks={[...customTasks, ...POSTPARTUM_TASKS]} filterTasks={filterTasks} />
        </div>
      </div>
    </Paywall>
  );
};
