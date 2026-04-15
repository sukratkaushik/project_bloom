import React from 'react';
import { usePlanner } from '../../store';
import { DECISIONS } from '../../data';

export const Decisions: React.FC = () => {
  const { state, setDecision, setDecisionNote } = usePlanner();

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-7 flex justify-between items-start">
        <div>
          <h2 className="font-serif text-[clamp(28px,4vw,40px)] font-normal mb-1.5">Key Decisions</h2>
          <p className="text-[14px] text-medium max-w-[560px] leading-[1.7]">Document your preferences so your care team is aligned. These can always change.</p>
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
      
      {!state.isCalmModeActive && (
        <div className="bg-sage-pale border-l-[3px] border-sage rounded-[0_10px_10px_0] p-[13px_16px] text-[13px] text-medium mb-5 leading-[1.65]">
          <strong className="text-charcoal">Remember:</strong> These are preferences, not contracts. Many can — and will — evolve as your pregnancy progresses and as you learn more. The goal is to think them through in advance, not lock them in.
        </div>
      )}
      
      <div>
        {DECISIONS.map(d => {
          const saved = state.decisions[d.id] || '';
          const savedNote = state.decisionNotes[d.id] || '';
          
          return (
            <div key={d.id} className="bg-white border-[1.5px] border-border rounded-[14px] p-[22px] mb-3.5">
              <h3 className="font-serif text-[20px] font-medium mb-1.5">{d.title}</h3>
              {!state.isCalmModeActive && (
                <p className="text-[13px] text-medium mb-3.5 leading-[1.65]">{d.desc}</p>
              )}
              
              <div className="flex flex-wrap gap-[7px] mb-3">
                {d.options.map(o => (
                  <button
                    key={o}
                    onClick={() => setDecision(d.id, o)}
                    className={`inline-flex items-center gap-1.5 p-[7px_14px] border-[1.5px] rounded-[20px] text-[13px] transition-all select-none cursor-pointer
                      ${saved === o ? 'border-blush bg-blush-pale text-blush font-medium' : 'border-border bg-white text-medium hover:border-blush-light'}`}
                  >
                    {o}
                  </button>
                ))}
              </div>
              
              <textarea 
                value={savedNote}
                onChange={(e) => setDecisionNote(d.id, e.target.value)}
                placeholder="Notes or additional preferences…"
                className="w-full p-[10px_13px] border-[1.5px] border-border rounded-[10px] font-sans text-[13px] text-charcoal bg-cream resize-y min-h-[56px] transition-all focus:outline-none focus:border-sage placeholder:text-light placeholder:italic"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
