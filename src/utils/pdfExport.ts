import { jsPDF } from 'jspdf';
import { PlannerState, Decision, Task } from '../types';
import { DECISIONS, DEV_TASKS, PREP_TASKS, FIN_TASKS, DEADLINE_TASKS, MED_TASKS, VACC_TASKS } from '../data';
import { db } from '../db';

export const exportToPDF = async (state: PlannerState) => {
  const doc = new jsPDF();
  let yPos = 55; // Starting lower due to banner
  const margin = 20;
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;

  const checkPageBreak = (neededHeight: number) => {
    if (yPos + neededHeight > pageHeight - margin - 15) { // Leave room for footer
      doc.addPage();
      yPos = margin + 10;
    }
  };

  const addHeader = (text: string) => {
    checkPageBreak(25);
    yPos += 5;
    doc.setFont('times', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(107, 146, 120); // Sage green #6B9278
    doc.text(text, margin, yPos);

    // Subtle decorative line under header
    doc.setDrawColor(228, 227, 224); // Border color
    doc.setLineWidth(0.5);
    doc.line(margin, yPos + 3, pageWidth - margin, yPos + 3);

    yPos += 12;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(51, 51, 51); // Charcoal #333333
  };

  const printItemLines = (lines: string[], lineSpacing = 6) => {
    lines.forEach((line) => {
      checkPageBreak(lineSpacing);
      doc.text(line, margin, yPos);
      yPos += lineSpacing;
    });
  };

  const printChecklist = (items: { text: string, checked: boolean }[]) => {
    if (items.length === 0) {
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(150, 150, 150);
      doc.text('No items available.', margin, yPos);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 51, 51);
      yPos += 8;
      return;
    }

    items.forEach(item => {
      checkPageBreak(8);

      const boxSize = 4;

      if (item.checked) {
        doc.setFillColor(107, 146, 120); // Sage
        doc.rect(margin, yPos - 3.5, boxSize, boxSize, 'F');
        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(0.5);
        // Draw a tiny checkmark inside
        doc.line(margin + 1, yPos - 1.5, margin + 2, yPos - 0.5);
        doc.line(margin + 2, yPos - 0.5, margin + 3.2, yPos - 2.5);
      } else {
        doc.setDrawColor(170, 170, 170); // Gray border
        doc.setLineWidth(0.3);
        doc.rect(margin, yPos - 3.5, boxSize, boxSize, 'S');
      }

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 51, 51);
      const lines = doc.splitTextToSize(item.text, pageWidth - 2 * margin - 8);
      lines.forEach((line: string, i: number) => {
        if (i > 0) checkPageBreak(6);
        doc.text(line, margin + 7, yPos);
        yPos += 6;
      });
      yPos += 2; // Extra spacing between items
    });
  };

  // ---------------------------------------------------------
  // Front Page Branding Banner
  // ---------------------------------------------------------
  doc.setFillColor(243, 246, 244); // Very light sage bg
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setFont('times', 'bold');
  doc.setFontSize(32);
  doc.setTextColor(107, 146, 120);
  doc.text('Our Pregnancy', margin, 24);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.setTextColor(120, 120, 120);
  doc.text('Personalized Pregnancy Care Plan', margin, 32);

  // Top info metadata
  doc.setFontSize(11);
  doc.setTextColor(51, 51, 51);

  if (state.dueDate) {
    const dateObj = new Date(state.dueDate);
    const formattedDate = dateObj.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    doc.setFont('helvetica', 'bold');
    doc.text('Estimated Due Date:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(formattedDate, margin + 45, yPos);
    yPos += 7;
  }

  const today = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  doc.setFont('helvetica', 'bold');
  doc.text('Generated On:', margin, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(today, margin + 33, yPos);
  yPos += 12;

  // ---------------------------------------------------------
  // Decisions Section
  // ---------------------------------------------------------
  addHeader('Decisions & Preferences');

  DECISIONS.forEach((decision: Decision) => {
    const selectedOption = state.decisions[decision.id] || 'Not decided yet';
    const note = state.decisionNotes[decision.id] || '';

    checkPageBreak(25);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 51, 51);
    doc.text(decision.title, margin, yPos);
    yPos += 6;

    doc.setFont('helvetica', 'italic');
    doc.setTextColor(80, 80, 80);
    const prefLines = doc.splitTextToSize(`Preference: ${selectedOption}`, pageWidth - 2 * margin);
    printItemLines(prefLines);

    if (note) {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      const noteLines = doc.splitTextToSize(`Notes: ${note}`, pageWidth - 2 * margin);
      printItemLines(noteLines);
    }
    yPos += 4;
  });

  // ---------------------------------------------------------
  // Notes & Journal Section
  // ---------------------------------------------------------
  addHeader('Notes & Journal');

  const notesSections = [
    { id: 'notesAppt', label: 'Questions for my next appointment' },
    { id: 'notesNames', label: 'Baby names we love' },
    { id: 'notesSupport', label: 'Support people & roles' },
    { id: 'notesCultural', label: 'Cultural, spiritual & personal wishes' },
    { id: 'notesWishes', label: 'Wishes & hopes — a note to yourself' },
    { id: 'notesJournal', label: 'Journal / Free space' },
    ...(state.customNoteTopics || []).map(t => ({ id: t.id, label: t.title })),
  ];

  notesSections.forEach((section) => {
    const noteContent = state.notes[section.id];
    if (noteContent && noteContent.trim() !== '') {
      checkPageBreak(15);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(80, 80, 80);
      doc.text(section.label, margin, yPos);
      yPos += 6;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 51, 51);
      const contentLines = doc.splitTextToSize(noteContent, pageWidth - 2 * margin);
      printItemLines(contentLines);
      yPos += 6;
    }
  });

  // ---------------------------------------------------------
  // Planning & Tasks
  // ---------------------------------------------------------
  addHeader('Planning & Tasks');
  const planTasks = [
    ...DEV_TASKS.t1, ...DEV_TASKS.t2, ...DEV_TASKS.t3,
    ...PREP_TASKS.t1, ...PREP_TASKS.t2, ...PREP_TASKS.t3,
    ...FIN_TASKS, ...DEADLINE_TASKS
  ];

  const formattedPlanTasks = planTasks.map(t => ({
    text: t.text,
    checked: !!state.checked[t.id]
  }));
  printChecklist(formattedPlanTasks);

  // ---------------------------------------------------------
  // Medical
  // ---------------------------------------------------------
  addHeader('Medical');
  const medicalTasks = [...MED_TASKS.t1, ...MED_TASKS.t2, ...MED_TASKS.t3, ...VACC_TASKS];
  const formattedMedTasks = medicalTasks.map(t => ({
    text: t.text,
    checked: !!state.checked[t.id]
  }));
  printChecklist(formattedMedTasks);

  // ---------------------------------------------------------
  // Labor Readiness
  // ---------------------------------------------------------
  addHeader('Labor Readiness');
  if (state.activeJourneyId) {
    try {
      const wearableLogs = await db.vitalsLogs
        .where('journeyId')
        .equals(state.activeJourneyId)
        .filter(l => l.type === 'WEARABLE')
        .reverse()
        .sortBy('timestamp');

      if (wearableLogs && wearableLogs.length >= 3) {
        // We have actual wearable logs! Calculate score dynamically.
        const { calculateLaborReadiness } = await import('./laborPrediction');

        const sortedLogs = [...wearableLogs].sort((a, b) => a.timestamp - b.timestamp);
        const recentLogs = sortedLogs.slice(-3);
        const baselineLogs = sortedLogs.slice(0, -3);

        const mappedRecent = recentLogs.map(log => ({
          date: new Date(log.timestamp).toISOString().split('T')[0],
          restingHeartRate: log.restingHeartRate || null,
          hrv: log.hrv || null,
          basalBodyTemp: log.basalBodyTemp || null,
          braxtonHicksCount: 4
        }));

        const mappedBaseline = baselineLogs.map(log => ({
          date: new Date(log.timestamp).toISOString().split('T')[0],
          restingHeartRate: log.restingHeartRate || null,
          hrv: log.hrv || null,
          basalBodyTemp: log.basalBodyTemp || null,
          braxtonHicksCount: 1
        }));

        const mockBaseline = [
          { date: '2026-02-20', restingHeartRate: 68, hrv: 55, basalBodyTemp: 36.8, braxtonHicksCount: 0 },
          { date: '2026-02-21', restingHeartRate: 67, hrv: 56, basalBodyTemp: 36.7, braxtonHicksCount: 1 },
        ];

        const result = calculateLaborReadiness(
          mappedBaseline.length > 0 ? mappedBaseline : mockBaseline,
          mappedRecent
        );

        doc.setFont('helvetica', 'bold');
        doc.text(`Labor Readiness Score: ${result.score}/100 (${result.score >= 80 ? 'High' : result.score >= 50 ? 'Elevated' : 'Stable Baseline'})`, margin, yPos);
        yPos += 6;

        doc.setFont('helvetica', 'normal');
        doc.text(`Data Confidence: ${result.confidence}% (Synced via Wearable)`, margin, yPos);
        yPos += 6;

        doc.setFont('helvetica', 'italic');
        const advLines = doc.splitTextToSize(`Advisory: ${result.advisory}`, pageWidth - 2 * margin);
        printItemLines(advLines, 5);
        yPos += 2;

        doc.setFont('helvetica', 'normal');
        result.reasoning.forEach(r => {
          checkPageBreak(6);
          doc.text(`• ${r}`, margin + 4, yPos);
          yPos += 6;
        });
      } else {
        doc.text('Labor Readiness relies on your daily wearable biometric data (RHR, HRV, BBT).', margin, yPos);
        yPos += 6;
        doc.text('Status: Simulated Baseline. Connect your wearable device inside the app to sync live data.', margin, yPos);
        yPos += 6;
      }
    } catch (e) {
      doc.text('Error calculating labor readiness from biometrics.', margin, yPos);
      yPos += 6;
    }
  } else {
    doc.text('No active pregnancy journey context found.', margin, yPos);
    yPos += 6;
  }
  yPos += 4;

  // ---------------------------------------------------------
  // Hospital Bag
  // ---------------------------------------------------------
  addHeader('Hospital Bag');
  if (state.hospitalBagItems && state.hospitalBagItems.length > 0) {
    const bagItems = state.hospitalBagItems.map(item => ({
      text: item.label,
      checked: !!item.packed
    }));
    printChecklist(bagItems);
  } else {
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(150, 150, 150);
    doc.text('No items added to the hospital bag yet.', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 51, 51);
    yPos += 8;
  }

  // ---------------------------------------------------------
  // Tracking (Vitals)
  // ---------------------------------------------------------
  addHeader('Tracking (Vitals)');
  if (state.activeJourneyId) {
    try {
      const vitals = await db.vitalsLogs
        .where('journeyId')
        .equals(state.activeJourneyId)
        .reverse()
        .sortBy('timestamp');

      if (vitals && vitals.length > 0) {
        // Show up to the 20 most recent entries
        vitals.slice(0, 20).forEach(vital => {
          checkPageBreak(16);
          const d = new Date(vital.timestamp).toLocaleString('en-IN', {
            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
          });

          // Decorative dot
          doc.setFillColor(107, 146, 120);
          doc.circle(margin + 2, yPos - 1.5, 1.5, 'F');

          if (vital.type === 'BP') {
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(51, 51, 51);
            doc.text(`BP: ${vital.systolic}/${vital.diastolic} ${vital.pulse ? '(Pulse: ' + vital.pulse + ' bpm)' : ''}`, margin + 6, yPos);
          } else if (vital.type === 'WEARABLE') {
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(51, 51, 51);
            const sourceName = vital.source === 'apple_health' ? 'Apple Health' : vital.source === 'oura' ? 'Oura Ring' : vital.source === 'google_fit' ? 'Google Fit' : vital.source === 'garmin' ? 'Garmin' : vital.source === 'fitbit' ? 'Fitbit' : 'Wearable';
            doc.text(`Wearables Sync (${sourceName})`, margin + 6, yPos);
            yPos += 5;
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(80, 80, 80);
            doc.text(`Steps: ${vital.steps?.toLocaleString() || 0} | Sleep: ${vital.sleepHours || 0}h | RHR: ${vital.restingHeartRate || 0} bpm | HRV: ${vital.hrv || 0} ms | Temp: ${vital.basalBodyTemp || 0}°C | SpO2: ${vital.spo2 || 0}%`, margin + 6, yPos);
          } else {
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(51, 51, 51);
            doc.text(`Weight: ${vital.weight} ${vital.unit || 'kg'}`, margin + 6, yPos);
          }

          doc.setFont('helvetica', 'normal');
          doc.setTextColor(120, 120, 120);
          doc.text(`Logged: ${d}`, pageWidth - margin - doc.getTextWidth(`Logged: ${d}`), yPos);

          yPos += 6;

          if (vital.notes) {
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(100, 100, 100);
            const noteLines = doc.splitTextToSize(`"${vital.notes}"`, pageWidth - 2 * margin - 10);
            noteLines.forEach((line: string) => {
              checkPageBreak(6);
              doc.text(line, margin + 6, yPos);
              yPos += 6;
            });
          }
          yPos += 4;
          doc.setFont('helvetica', 'normal');
        });
      } else {
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(150, 150, 150);
        doc.text('No vitals logged yet.', margin, yPos);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 51, 51);
        yPos += 8;
      }
    } catch (e) {
      doc.text('Error loading vitals logs.', margin, yPos);
      yPos += 6;
    }
  } else {
    doc.text('No active pregnancy journey context found.', margin, yPos);
    yPos += 6;
  }

  // ---------------------------------------------------------
  // Global Page Formatting (Footer)
  // ---------------------------------------------------------
  const totalPages = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(180, 180, 180);

    // Footer line
    doc.setDrawColor(228, 227, 224);
    doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

    doc.text(`Our Pregnancy App • Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
  }

  doc.save('our-pregnancy-plan.pdf');
};
