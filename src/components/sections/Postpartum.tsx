import React, { useState } from 'react';
import { usePlanner } from '../../store';
import { POSTPARTUM_TASKS } from '../../data';
import { Task } from '../../types';
import { TaskList } from '../TaskItem';
import { ContextBanner } from '../ContextBanner';
import { triggerHaptic } from '../../utils/nativeBridge';
import { Plus, Minus } from 'lucide-react';

const GUIDE_SECTIONS = [
  {
    id: 'recovery',
    title: 'Your Recovery',
    bullets: [
      'Physical healing takes 6–8 weeks minimum',
      'Postpartum bleeding (lochia) for 2–6 weeks',
      'Night sweats and hormonal shifts are normal',
      'Pelvic floor recovery begins gently',
      'C-section recovery needs extra care & support',
      '6-week check-up with your OB is essential',
    ],
  },
  {
    id: 'baby',
    title: "Baby's First Weeks",
    bullets: [
      'Newborns sleep 14–17 hours/day in short bursts',
      'Feeding every 2–3 hours (breast or bottle)',
      'Jaundice is common and usually mild',
      'Cord stump falls off naturally at 1–3 weeks',
      'Newborn hearing and vision screening',
      'First paediatrician visit within 3–5 days',
    ],
  },
  {
    id: 'mental',
    title: 'Mental & Emotional Health',
    bullets: [
      '"Baby blues" affect up to 80% of new parents',
      'Postpartum depression is common and treatable',
      'Anxiety or intrusive thoughts — seek support early',
      'Partners can also experience emotional strain',
      'Save key helpline contacts before delivery',
      'Rest whenever baby sleeps to recover',
    ],
  },
  {
    id: 'practical',
    title: 'Practical First Weeks',
    bullets: [
      'Accept family and community help with grace',
      'Set up a comfortable feeding station before birth',
      'Arrange postpartum nourishment & meals',
      'Set gentle boundaries around visitors in week 1',
      'Register baby\'s birth certificate on time',
      'Add baby to health insurance immediately',
    ],
  },
];

export const Postpartum: React.FC<{ filterTasks: (t: Task[]) => Task[] }> = ({ filterTasks }) => {
  const { state, addCustomTask } = usePlanner();
  const [newTaskText, setNewTaskText] = useState('');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (id: string) => {
    triggerHaptic('light');
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

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
    <div className="animate-in fade-in duration-300">
        <ContextBanner description="The fourth trimester and beyond — what to expect and prepare for after birth." />

        {/* Collapsible Educational Guidance Boxes */}
        <div className="space-y-2.5 mb-5">
          {GUIDE_SECTIONS.map((sec) => {
            const isOpen = !!openSections[sec.id];
            return (
              <div
                key={sec.id}
                className="bg-white border border-border/80 rounded-xl overflow-hidden shadow-3xs transition-all hover:border-sage/40"
              >
                <button
                  type="button"
                  onClick={() => toggleSection(sec.id)}
                  className="group w-full p-3.5 xs:p-4 flex items-center justify-between text-left cursor-pointer transition-colors hover:bg-cream/20"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <span className="text-sage text-[14px] shrink-0">✦</span>
                    <h4 className="font-serif text-[16px] xs:text-[17px] font-medium text-charcoal truncate">
                      {sec.title}
                    </h4>
                  </div>
                  <div
                    className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                      isOpen
                        ? 'bg-sage-pale border-sage/40 text-sage-dark'
                        : 'bg-cream/60 border-border/80 text-charcoal/60 group-hover:border-sage/40'
                    }`}
                  >
                    {isOpen ? <Minus size={15} strokeWidth={2.4} /> : <Plus size={15} strokeWidth={2.4} />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-1 border-t border-border/40 animate-in fade-in duration-200">
                    <ul className="list-none space-y-1.5 pt-2">
                      {sec.bullets.map((bullet, idx) => (
                        <li key={idx} className="text-[13px] text-charcoal/85 py-0.5 flex gap-2 items-start leading-relaxed">
                          <span className="text-sage text-[13px] leading-tight shrink-0 mt-0.5">✦</span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
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
  );
};
