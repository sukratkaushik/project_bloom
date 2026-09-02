import React, { useState } from 'react';
import { usePlanner } from '../../store';
import { Plus, Trash2, Sparkles, X, Check, BookOpen } from 'lucide-react';

const SUGGESTED_TOPICS = [
  { title: 'Postpartum Meal Prep & Freezing', placeholder: 'Meals to freeze, grocery delivery notes, snack ideas...' },
  { title: 'Doula & Midwife Queries', placeholder: 'Questions on labor support, pain management, birth preferences...' },
  { title: 'Pediatrician Checklist & Notes', placeholder: 'Recommended doctors, clinic hours, first visit questions...' },
  { title: 'Baby Registry & Must-Haves', placeholder: 'Gear we actually need vs skip, gifts received, nursery ideas...' },
  { title: 'Sibling & Pet Preparation', placeholder: 'How to introduce baby to older siblings or pets, transition plan...' },
  { title: 'Work Handover & Leave Notes', placeholder: 'Out-of-office dates, coverage contacts, return-to-work notes...' },
];

export const Notes: React.FC = () => {
  const { state, setNote, addCustomNoteTopic, deleteCustomNoteTopic } = usePlanner();
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPlaceholder, setNewPlaceholder] = useState('');
  const [error, setError] = useState('');

  const handleAddTopic = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newTitle.trim()) {
      setError('Please provide a topic title.');
      return;
    }
    addCustomNoteTopic(newTitle.trim(), newPlaceholder.trim());
    setNewTitle('');
    setNewPlaceholder('');
    setError('');
    setIsAddingTopic(false);
  };

  const handleSelectSuggestion = (s: { title: string; placeholder: string }) => {
    setNewTitle(s.title);
    setNewPlaceholder(s.placeholder);
    setError('');
  };

  const NoteField = ({
    id,
    label,
    placeholder,
    minHeight,
    isCustom = false,
    onDelete,
  }: {
    id: string;
    label: string;
    placeholder: string;
    minHeight: string;
    isCustom?: boolean;
    onDelete?: () => void;
  }) => (
    <div className="group relative">
      <div className="flex items-center justify-between mb-2">
        <label className="text-[11px] font-semibold tracking-[1px] uppercase text-medium flex items-center gap-1.5">
          {isCustom && <span className="w-1.5 h-1.5 rounded-full bg-sage" />}
          {label}
        </label>
        {isCustom && onDelete && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Delete topic "${label}" and its notes?`)) {
                onDelete();
              }
            }}
            className="text-light hover:text-critical p-1 rounded-md transition-colors cursor-pointer"
            title="Delete topic"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>
      <textarea
        value={state.notes[id] || ''}
        onChange={(e) => setNote(id, e.target.value)}
        className={`w-full p-3.5 border-[1.5px] border-border rounded-[12px] font-sans text-[14px] text-charcoal bg-white resize-y transition-all leading-[1.65] focus:outline-none focus:border-sage focus:ring-[3px] focus:ring-sage/10 placeholder:text-light placeholder:italic ${minHeight}`}
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-7 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <BookOpen className="w-7 h-7 text-sage" />
            <h2 className="font-serif text-[clamp(28px,4vw,40px)] font-normal">Notes & Journal</h2>
          </div>
          <p className="text-[14px] text-medium max-w-[560px] leading-[1.7]">
            A space that's entirely yours — questions, thoughts, names, memories, and custom pregnancy topics.
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsAddingTopic(true)}
            className="px-3.5 py-2 bg-sage hover:bg-sage-dark text-white rounded-[10px] font-sans text-[13px] font-semibold cursor-pointer transition-all shadow-sm flex items-center gap-1.5"
          >
            <Plus size={16} /> Add Topic
          </button>
          <button
            type="button"
            onClick={() => {
              import('../../utils/pdfExport').then((module) => {
                module.exportToPDF(state);
              });
            }}
            className="px-3.5 py-2 bg-sage-pale border-[1.5px] border-sage rounded-[10px] font-sans text-[13px] font-medium text-sage cursor-pointer transition-all hover:bg-sage hover:text-white"
          >
            📄 Export PDF
          </button>
        </div>
      </div>

      <div className="grid gap-5">
        {/* Core Default Topics */}
        <NoteField
          id="notesAppt"
          label="Questions for my next appointment"
          placeholder="Write down anything you want to ask your midwife or OB so you don't forget in the moment…"
          minHeight="min-h-[120px]"
        />
        <NoteField
          id="notesNames"
          label="Baby names we love"
          placeholder="First names, middles, combinations, meanings…"
          minHeight="min-h-[80px]"
        />
        <NoteField
          id="notesSupport"
          label="Support people & roles"
          placeholder="Who is at the birth? Who is on call for older kids? Who brings meals? Who is the 3am call?"
          minHeight="min-h-[100px]"
        />
        <NoteField
          id="notesCultural"
          label="Cultural, spiritual & personal wishes"
          placeholder="Ceremonies, naming traditions, dietary requirements, faith-based preferences…"
          minHeight="min-h-[80px]"
        />
        <NoteField
          id="notesWishes"
          label="Wishes & hopes — a note to yourself"
          placeholder="What do you want to remember about this time? What are your hopes for your growing family? Write freely…"
          minHeight="min-h-[140px]"
        />

        {/* User-Added Custom Topics */}
        {(state.customNoteTopics || []).map((topic) => (
          <NoteField
            key={topic.id}
            id={topic.id}
            label={topic.title}
            placeholder={topic.placeholder || 'Write your thoughts, questions, or notes here...'}
            minHeight="min-h-[100px]"
            isCustom={true}
            onDelete={() => deleteCustomNoteTopic(topic.id)}
          />
        ))}

        {/* Add New Topic Form or Trigger */}
        {!isAddingTopic ? (
          <button
            type="button"
            onClick={() => setIsAddingTopic(true)}
            className="w-full py-4 border-2 border-dashed border-border hover:border-sage rounded-[14px] text-[13.5px] font-medium text-medium hover:text-sage flex items-center justify-center gap-2 transition-all cursor-pointer bg-white/40 hover:bg-sage-pale/20 mt-2"
          >
            <Plus size={16} /> Add Another Topic
          </button>
        ) : (
          <form
            onSubmit={handleAddTopic}
            className="p-5 border-[1.5px] border-sage/40 rounded-[16px] bg-white shadow-sm space-y-4 animate-in fade-in slide-in-from-bottom-2 mt-2"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h4 className="text-[14px] font-semibold text-charcoal flex items-center gap-2">
                <Sparkles size={16} className="text-sage" /> Add New Topic to Journal
              </h4>
              <button
                type="button"
                onClick={() => {
                  setIsAddingTopic(false);
                  setError('');
                }}
                className="text-light hover:text-charcoal p-1 cursor-pointer transition-colors"
                title="Cancel"
              >
                <X size={17} />
              </button>
            </div>

            {/* Quick Suggestions */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-light block mb-1.5">
                Quick Inspiration (Click to prefill)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_TOPICS.map((s) => (
                  <button
                    key={s.title}
                    type="button"
                    onClick={() => handleSelectSuggestion(s)}
                    className={`text-[12px] px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                      newTitle === s.title
                        ? 'bg-sage text-white border-sage font-medium'
                        : 'bg-gray-50 border-border text-medium hover:border-sage hover:text-sage'
                    }`}
                  >
                    + {s.title}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-light block mb-1">
                  Topic Title *
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => {
                    setNewTitle(e.target.value);
                    setError('');
                  }}
                  placeholder="e.g., Doula Questions, Postpartum Meal Prep, Baby Shower Wishes..."
                  className="w-full p-3 bg-cream border border-border rounded-xl text-[14px] text-charcoal outline-none focus:border-sage"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-light block mb-1">
                  Prompt / Placeholder (Optional)
                </label>
                <input
                  type="text"
                  value={newPlaceholder}
                  onChange={(e) => setNewPlaceholder(e.target.value)}
                  placeholder="e.g., What recipes to freeze? Who will drop off groceries?"
                  className="w-full p-3 bg-cream border border-border rounded-xl text-[14px] text-charcoal outline-none focus:border-sage"
                />
              </div>

              {error && <p className="text-[12.5px] text-critical font-medium">{error}</p>}
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsAddingTopic(false);
                  setError('');
                }}
                className="px-4 py-2 border border-border text-medium hover:bg-gray-100 rounded-xl text-[13px] font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-sage hover:bg-sage-dark text-white rounded-xl text-[13px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <Check size={15} /> Save Topic
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
