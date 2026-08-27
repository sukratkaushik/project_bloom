import React from 'react';
import { usePlanner } from '../../store';

export const Notes: React.FC = () => {
  const { state, setNote } = usePlanner();

  const NoteField = ({ id, label, placeholder, minHeight }: { id: string, label: string, placeholder: string, minHeight: string }) => (
    <div>
      <label className="text-[11px] font-semibold tracking-[1px] uppercase text-medium block mb-2">{label}</label>
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
      <div className="mb-7 flex justify-between items-start">
        <div>
          <h2 className="font-serif text-[clamp(28px,4vw,40px)] font-normal mb-1.5">Notes & Journal</h2>
          <p className="text-[14px] text-medium max-w-[560px] leading-[1.7]">A space that's entirely yours — questions, thoughts, names, memories.</p>
        </div>
        <button 
          onClick={() => {
            import('../../utils/pdfExport').then(module => {
              module.exportToPDF(state);
            });
          }}
          className="px-4 py-2 bg-sage-pale border-[1.5px] border-sage rounded-[10px] font-sans text-[13px] font-medium text-sage cursor-pointer transition-all hover:bg-sage hover:text-white"
        >
          📄 Export PDF
        </button>
      </div>
      
      <div className="grid gap-5">
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
      </div>
    </div>
  );
};
