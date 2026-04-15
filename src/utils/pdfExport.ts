import { jsPDF } from 'jspdf';
import { PlannerState, Decision } from '../types';
import { DECISIONS } from '../data';

export const exportToPDF = (state: PlannerState) => {
  const doc = new jsPDF();
  let yPos = 20;
  const margin = 20;
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;

  const checkPageBreak = (neededHeight: number) => {
    if (yPos + neededHeight > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
    }
  };

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text('Bloom - Pregnancy Care Plan', margin, yPos);
  yPos += 10;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  if (state.dueDate) {
    const dateObj = new Date(state.dueDate);
    const formattedDate = dateObj.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    doc.text(`Estimated Due Date: ${formattedDate}`, margin, yPos);
    yPos += 6;
  }
  
  const today = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  doc.text(`Generated on: ${today}`, margin, yPos);
  yPos += 15;

  // Decisions Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('Decisions & Preferences', margin, yPos);
  yPos += 10;

  doc.setFontSize(12);
  DECISIONS.forEach((decision: Decision) => {
    const selectedOption = state.decisions[decision.id] || 'Not decided yet';
    const note = state.decisionNotes[decision.id] || '';

    checkPageBreak(30);

    doc.setFont('helvetica', 'bold');
    doc.text(decision.title, margin, yPos);
    yPos += 6;

    doc.setFont('helvetica', 'normal');
    const descLines = doc.splitTextToSize(decision.desc, pageWidth - 2 * margin);
    doc.text(descLines, margin, yPos);
    yPos += descLines.length * 5 + 2;

    doc.setFont('helvetica', 'italic');
    doc.text(`Preference: ${selectedOption}`, margin, yPos);
    yPos += 6;

    if (note) {
      doc.setFont('helvetica', 'normal');
      const noteLines = doc.splitTextToSize(`Notes: ${note}`, pageWidth - 2 * margin);
      doc.text(noteLines, margin, yPos);
      yPos += noteLines.length * 5;
    }
    
    yPos += 5;
  });

  yPos += 10;
  checkPageBreak(20);

  // Notes & Journal Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('Notes & Journal', margin, yPos);
  yPos += 10;

  doc.setFontSize(12);

  const notesSections = [
    { id: 'notesAppt', label: 'Questions for my next appointment' },
    { id: 'notesNames', label: 'Baby names we love' },
    { id: 'notesSupport', label: 'Support people & roles' },
    { id: 'notesCultural', label: 'Cultural, spiritual & personal wishes' },
    { id: 'notesJournal', label: 'Journal / Free space' },
  ];

  notesSections.forEach((section) => {
    const noteContent = state.notes[section.id];
    if (noteContent && noteContent.trim() !== '') {
      checkPageBreak(20);
      
      doc.setFont('helvetica', 'bold');
      doc.text(section.label, margin, yPos);
      yPos += 6;

      doc.setFont('helvetica', 'normal');
      const contentLines = doc.splitTextToSize(noteContent, pageWidth - 2 * margin);
      
      // Handle page breaks within long notes
      contentLines.forEach((line: string) => {
        checkPageBreak(10);
        doc.text(line, margin, yPos);
        yPos += 5;
      });
      
      yPos += 5;
    }
  });

  doc.save('bloom-pregnancy-plan.pdf');
};
