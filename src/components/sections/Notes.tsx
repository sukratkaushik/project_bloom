import React, { useState } from 'react';
import { usePlanner } from '../../store';
import { 
  Plus, 
  Trash2, 
  Sparkles, 
  X, 
  Check, 
  BookOpen, 
  FileDown, 
  Stethoscope, 
  Heart, 
  Users, 
  Sun, 
  Feather, 
  PenLine 
} from 'lucide-react';
import { triggerHaptic } from '../../utils/nativeBridge';
import { ContextBanner } from '../ContextBanner';

const SUGGESTED_TOPICS = [
  { title: 'Postpartum Meal Prep & Freezing', placeholder: 'Meals to freeze, grocery delivery notes, snack ideas...' },
  { title: 'Doula & Midwife Queries', placeholder: 'Questions on labor support, pain management, birth preferences...' },
  { title: 'Pediatrician Checklist & Notes', placeholder: 'Recommended doctors, clinic hours, first visit questions...' },
  { title: 'Baby Registry & Must-Haves', placeholder: 'Gear we actually need vs skip, gifts received, nursery ideas...' },
  { title: 'Sibling & Pet Preparation', placeholder: 'How to introduce baby to older siblings or pets, transition plan...' },
  { title: 'Work Handover & Leave Notes', placeholder: 'Out-of-office dates, coverage contacts, return-to-work notes...' },
];

const TOPIC_ICONS: Record<string, React.ReactNode> = {
  notesAppt: <Stethoscope size={14} className="text-sage" />,
  notesNames: <Heart size={14} className="text-sage" />,
  notesSupport: <Users size={14} className="text-sage" />,
  notesCultural: <Sun size={14} className="text-sage" />,
  notesWishes: <Feather size={14} className="text-sage" />,
};

export const Notes: React.FC = () => {
  const { state, setNote, addCustomNoteTopic, deleteCustomNoteTopic } = usePlanner();
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDetails, setNewDetails] = useState('');
  const [newPlaceholder, setNewPlaceholder] = useState('');
  const [error, setError] = useState('');

  const handleAddTopic = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newTitle.trim()) {
      setError('Please provide a topic title.');
      return;
    }
    triggerHaptic('medium');
    addCustomNoteTopic(newTitle.trim(), newDetails.trim(), newPlaceholder.trim());
    setNewTitle('');
    setNewDetails('');
    setNewPlaceholder('');
    setError('');
    setIsAddingTopic(false);
  };

  const handleSelectSuggestion = (s: { title: string; placeholder: string }) => {
    triggerHaptic('light');
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
  }) => {
    const hasContent = Boolean(state.notes[id] && state.notes[id].trim());
    const icon = TOPIC_ICONS[id] || <PenLine size={14} className="text-sage" />;

    return (
      <div className="bg-white border border-border/80 rounded-2xl p-4 shadow-3xs hover:border-sage/40 transition-all space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-[13px] font-bold text-charcoal flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-sage/10 flex items-center justify-center shrink-0">
              {icon}
            </div>
            <span>{label}</span>
          </label>
          <div className="flex items-center gap-2">
            {hasContent && (
              <span className="text-[10.5px] font-semibold text-sage-dark bg-sage-pale px-2 py-0.5 rounded-full flex items-center gap-1">
                <Check size={10} /> Saved
              </span>
            )}
            {isCustom && onDelete && (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  if (window.confirm(`Delete topic "${label}" and its notes?`)) {
                    onDelete();
                  }
                }}
                className="text-light hover:text-critical p-1 rounded-lg transition-colors cursor-pointer"
                title="Delete topic"
                aria-label={`Delete topic ${label}`}
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
        <textarea
          value={state.notes[id] || ''}
          onChange={(e) => setNote(id, e.target.value)}
          className={`w-full p-3 border border-border/70 rounded-xl text-[13px] text-charcoal bg-cream/30 focus:bg-white resize-y transition-all leading-relaxed focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage placeholder:text-light/70 ${minHeight}`}
          placeholder={placeholder}
        />
      </div>
    );
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Brand Context Banner */}
      <ContextBanner description="Personal reflections, questions for your OB-GYN & custom pregnancy logs." />

      {/* Action Bar */}
      <div className="flex items-center justify-between gap-2 px-1">
        <span className="text-[12px] font-bold uppercase tracking-wider text-medium">
          Journal Topics
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setIsAddingTopic(true);
            }}
            className="py-1.5 px-3 bg-sage hover:bg-sage-dark text-white rounded-xl text-[12px] font-bold cursor-pointer transition-all shadow-3xs flex items-center gap-1.5 active:scale-[0.98]"
          >
            <Plus size={14} />
            <span>Add Topic</span>
          </button>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              import('../../utils/pdfExport').then((module) => {
                module.exportToPDF(state);
              });
            }}
            className="py-1.5 px-3 bg-white border border-border/80 hover:bg-cream text-charcoal rounded-xl text-[12px] font-bold cursor-pointer transition-all shadow-3xs flex items-center gap-1.5 active:scale-[0.98]"
          >
            <FileDown size={14} className="text-medium" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {/* Core Default Topics */}
        <NoteField
          id="notesAppt"
          label="Questions for Next Doctor Visit"
          placeholder="Write down anything you want to ask your obstetrician so you don't forget in the moment…"
          minHeight="min-h-[90px]"
        />
        <NoteField
          id="notesNames"
          label="Baby Names We Love"
          placeholder="First names, middles, combinations, meanings…"
          minHeight="min-h-[75px]"
        />
        <NoteField
          id="notesSupport"
          label="Support People & Birth Circle"
          placeholder="Who is at the birth? Who brings postpartum meals? Emergency contact..."
          minHeight="min-h-[75px]"
        />
        <NoteField
          id="notesCultural"
          label="Cultural, Spiritual & Family Traditions"
          placeholder="Godh Bharai / Seemantham wishes, naming traditions, dietary requirements…"
          minHeight="min-h-[75px]"
        />
        <NoteField
          id="notesWishes"
          label="Hopes & Reflections — A Note to Yourself"
          placeholder="What do you want to remember about this time? How are you feeling today?"
          minHeight="min-h-[90px]"
        />

        {/* User-Added Custom Topics Section Header */}
        {state.customNoteTopics && state.customNoteTopics.length > 0 && (
          <div className="pt-2 flex items-center justify-between px-1">
            <h3 className="text-[12px] font-bold uppercase tracking-wider text-charcoal/80 flex items-center gap-2">
              <span>My Custom Topics</span>
              <span className="px-2 py-0.5 rounded-full bg-sage-pale text-sage-dark text-[10.5px] font-bold">
                {state.customNoteTopics.length}
              </span>
            </h3>
          </div>
        )}

        {/* User-Added Custom Topics */}
        {(state.customNoteTopics || []).map((topic) => (
          <NoteField
            key={topic.id}
            id={topic.id}
            label={topic.title}
            placeholder={topic.placeholder || 'Write your thoughts, questions, or notes here...'}
            minHeight="min-h-[85px]"
            isCustom={true}
            onDelete={() => deleteCustomNoteTopic(topic.id)}
          />
        ))}

        {/* Add New Topic Form or Trigger */}
        {!isAddingTopic ? (
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setIsAddingTopic(true);
            }}
            className="w-full py-3 border-2 border-dashed border-border/80 hover:border-sage rounded-2xl text-[12.5px] font-bold text-medium hover:text-sage-dark flex items-center justify-center gap-2 transition-all cursor-pointer bg-white/50 hover:bg-cream"
          >
            <Plus size={15} />
            <span>Add Custom Journal Topic</span>
          </button>
        ) : (
          <form
            onSubmit={handleAddTopic}
            className="p-4 rounded-2xl border border-sage/40 bg-white shadow-3xs space-y-3 animate-in fade-in"
          >
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <h4 className="text-[13.5px] font-serif font-bold text-charcoal flex items-center gap-2">
                <Sparkles size={15} className="text-sage" />
                <span>Add Custom Topic</span>
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
                <X size={16} />
              </button>
            </div>

            {/* Quick Suggestions */}
            <div>
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-light block mb-1.5">
                Quick Inspirations
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_TOPICS.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSuggestion(s)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-cream hover:bg-sage-pale border border-border/70 hover:border-sage/40 text-charcoal font-medium transition-colors cursor-pointer"
                  >
                    + {s.title}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Topic Title (e.g. Sibling Preparation)"
                className="w-full px-3 py-2 border border-border/80 rounded-xl text-[13px] text-charcoal bg-cream/40 focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage"
              />
              <input
                type="text"
                value={newPlaceholder}
                onChange={(e) => setNewPlaceholder(e.target.value)}
                placeholder="Helpful prompt placeholder (optional)"
                className="w-full px-3 py-2 border border-border/80 rounded-xl text-[12.5px] text-charcoal bg-cream/40 focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage"
              />
            </div>

            {error && (
              <p className="text-[11.5px] text-critical font-medium">{error}</p>
            )}

            <div className="flex gap-2 justify-end pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsAddingTopic(false);
                  setError('');
                }}
                className="px-3 py-1.5 rounded-xl text-[12px] font-bold text-medium hover:bg-cream transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-sage hover:bg-sage-dark text-white rounded-xl text-[12px] font-bold transition-all shadow-3xs cursor-pointer"
              >
                Create Topic
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
