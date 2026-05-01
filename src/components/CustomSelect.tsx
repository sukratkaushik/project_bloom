import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  className?: string;
  placeholder?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({ value, onChange, options, className = '', placeholder = 'Select...' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full p-[11px_14px] border-[1.5px] border-border rounded-[10px] bg-cream font-sans text-[14px] text-left transition-all focus:outline-none focus:border-sage focus:ring-[3px] focus:ring-sage/10 ${isOpen ? 'border-sage ring-[3px] ring-sage/10' : ''} ${!selectedOption ? 'text-medium/70' : 'text-charcoal'}`}
      >
        <span className="truncate pr-2">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown size={16} className={`text-medium transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 max-h-[240px] overflow-y-auto bg-white border-[1.5px] border-border rounded-[10px] shadow-[0_8px_24px_rgba(44,62,80,0.12)] overscroll-contain animate-in fade-in slide-in-from-top-1">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`w-full text-left px-[14px] py-[11px] text-[14px] transition-colors focus:outline-none 
                ${opt.value === value 
                  ? 'bg-sage-pale/60 text-sage font-medium' 
                  : 'text-charcoal hover:bg-cream focus:bg-cream'
                }
              `}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
