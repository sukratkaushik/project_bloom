import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, MedicalReport } from '../../../db';
import {
  ShieldCheck, FileText, Lock, FileUp, CheckCircle2,
  Download, FolderLock, Sparkles, HelpCircle, Loader2
} from 'lucide-react';
import { triggerHaptic } from '../../../utils/nativeBridge';
import { usePlanner } from '../../../store';
import { AbhaInfoModal } from '../AbhaInfoModal';

interface VaultTabProps {
  onOpenTool: (toolId: string) => void;
  onShowToast: (message: string) => void;
}

export const VaultTab: React.FC<VaultTabProps> = ({ onOpenTool, onShowToast }) => {
  const { state } = usePlanner();
  const [isExporting, setIsExporting] = useState(false);
  const [isAbhaModalOpen, setIsAbhaModalOpen] = useState(false);

  // Gestational calculations matching Today and Care tabs
  const due = state.dueDate ? new Date(state.dueDate) : new Date(Date.now() + 112 * 24 * 60 * 60 * 1000);
  const now = new Date();
  const diffDays = Math.max(0, Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const completedDays = Math.max(1, 280 - diffDays);
  const currentWeek = Math.min(40, Math.max(1, Math.floor(completedDays / 7) + 1));
  const gestationDays = completedDays % 7;

  // Medical Records Filter
  const [recordFilter, setRecordFilter] = useState<'all' | 'ultrasound' | 'lab' | 'prescription'>('all');

  // Dexie live query for user-uploaded medical reports
  const liveReports = useLiveQuery<MedicalReport[]>(
    async () => {
      try {
        if (!db.medicalReports) return [];
        return await db.medicalReports.orderBy('timestamp').reverse().toArray();
      } catch (err) {
        console.warn('Could not query medicalReports:', err);
        return [];
      }
    },
    []
  );

  // Default sample records if live query is empty
  const defaultSampleRecords = [
    {
      id: 'sample-1',
      title: 'Level II TIFFA Anomaly Scan',
      type: 'ultrasound',
      date: '28 Aug • Cloudnine',
      size: '3.2 MB',
      aiSummary: 'Normal fetal anatomy. Four-chamber heart, normal spine & AFI 14.2 cm.',
      badge: 'Ultrasound',
    },
    {
      id: 'sample-2',
      title: 'Complete Blood Count & Ferritin',
      type: 'lab',
      date: '15 Aug • Manipal',
      size: '1.1 MB',
      aiSummary: 'Hb: 11.4 g/dL (Adequate). Ferritin: 42 ng/mL. Platelets normal.',
      badge: 'Bloodwork',
    },
    {
      id: 'sample-3',
      title: 'NT Scan & Dual Marker Risk',
      type: 'ultrasound',
      date: '18 Jul • Cloudnine',
      size: '2.8 MB',
      aiSummary: 'Low risk for Trisomy 21 (1:4500). NT 1.3 mm. Nasal bone present.',
      badge: 'NT Screen',
    },
  ];

  const handleOpenLocker = () => {
    triggerHaptic('success');
    onOpenTool('medical-reports');
  };

  const handleExportPdf = async () => {
    try {
      setIsExporting(true);
      triggerHaptic('success');
      onShowToast('📄 Generating Mother\'s Care Plan PDF...');
      const { exportCarePlanPdf } = await import('../../../utils/pdfExport');
      await exportCarePlanPdf(state);
      onShowToast('✅ Care Plan PDF downloaded! Ready to print or share.');
    } catch (err) {
      console.error('Failed to export Care Plan PDF:', err);
      onShowToast('❌ Could not generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportAbha = async () => {
    await handleExportPdf();
  };

  return (
    <div className="space-y-4 pb-32 animate-in fade-in duration-200">
      {/* ABHA Security Banner */}
      <div className="bg-white border border-border/80 rounded-2xl p-4 shadow-3xs">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-sage-pale text-sage-dark flex items-center justify-center shrink-0 border border-sage/20">
              <Lock size={18} />
            </div>
            <div className="min-w-0">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setIsAbhaModalOpen(true);
                }}
                className="group inline-flex items-center gap-1.5 text-left cursor-pointer active:scale-[0.99] transition-transform"
                title="What is ABHA? Tap to learn more"
                aria-label="What is ABHA? Tap to learn more"
              >
                <h3 className="font-serif font-bold text-charcoal group-hover:text-sage-dark transition-colors text-[15px] leading-tight whitespace-nowrap">
                  ABHA Encrypted Records
                </h3>
                <span className="w-5 h-5 rounded-full bg-cream group-hover:bg-sage-pale border border-border/80 group-hover:border-sage/40 text-medium group-hover:text-sage-dark flex items-center justify-center transition-all shadow-3xs shrink-0">
                  <HelpCircle size={12} />
                </span>
              </button>
              <span className="text-[10.5px] text-medium block mt-0.5">AES-256 On Device</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleExportAbha}
            disabled={isExporting}
            className="w-9 h-9 rounded-xl bg-cream hover:bg-sage-pale text-charcoal hover:text-sage-dark flex items-center justify-center border border-border/70 transition-colors cursor-pointer shrink-0 active:scale-95 shadow-3xs"
            title="Download Medical Records & Care Plan PDF"
            aria-label="Download Medical Records & Care Plan PDF"
          >
            {isExporting ? (
              <Loader2 size={16} className="animate-spin text-sage-dark" />
            ) : (
              <Download size={16} />
            )}
          </button>
        </div>

        <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between text-[11px]">
          <span className="text-medium">ABHA ID:</span>
          <span className="font-mono font-bold text-sage-dark bg-sage-pale px-2 py-0.5 rounded-lg">
            91-8421-9920-5512
          </span>
        </div>
      </div>

      {/* Mother's Overall Clinical Health Report (PDF & Print) Banner */}
      <div className="bg-gradient-to-br from-sage-pale/60 via-white to-cream border border-sage/40 rounded-2xl p-4 shadow-3xs">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-sage text-white flex items-center justify-center shrink-0 shadow-2xs">
              <FileText size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-serif font-bold text-charcoal text-[14px] xs:text-[15px] leading-tight">
                Mother's Overall Health Report
              </h3>
              <span className="text-[11px] text-sage-dark font-medium mt-0.5 block truncate">
                Comprehensive clinical summary for OB-GYN & hospital
              </span>
            </div>
          </div>
          <span className="text-[10px] font-bold text-sage-dark bg-sage-pale px-2 py-0.5 rounded-full border border-sage/20 shrink-0">
            Wk {currentWeek} Active
          </span>
        </div>

        {/* Patient Clinical Parameters Bar */}
        <div className="mt-3 pt-3 border-t border-sage/20 grid grid-cols-4 gap-2 text-center">
          <div className="bg-white/80 rounded-xl py-2 px-1 border border-border/50 flex flex-col justify-center shadow-3xs">
            <span className="text-medium text-[9px] font-bold uppercase tracking-wider block">UHID</span>
            <span className="font-mono font-bold text-charcoal text-[11px] truncate mt-0.5">#98421</span>
          </div>
          <div className="bg-white/80 rounded-xl py-2 px-1 border border-border/50 flex flex-col justify-center shadow-3xs">
            <span className="text-medium text-[9px] font-bold uppercase tracking-wider block">Blood</span>
            <span className="font-bold text-charcoal text-[11px] truncate mt-0.5">B+ (Rh+)</span>
          </div>
          <div className="bg-white/80 rounded-xl py-2 px-1 border border-border/50 flex flex-col justify-center shadow-3xs">
            <span className="text-medium text-[9px] font-bold uppercase tracking-wider block">Gestation</span>
            <span className="font-bold text-sage-dark text-[11px] truncate mt-0.5">Wk {currentWeek}+{gestationDays}d</span>
          </div>
          <div className="bg-white/80 rounded-xl py-2 px-1 border border-border/50 flex flex-col justify-center shadow-3xs">
            <span className="text-medium text-[9px] font-bold uppercase tracking-wider block">Allergy</span>
            <span className="font-bold text-emerald-700 text-[11px] truncate mt-0.5">NKDA</span>
          </div>
        </div>

        <p className="text-[11.5px] text-medium mt-2.5 leading-relaxed">
          Export and print a complete report including gestational age, maternal vitals history (BP, glucose, weight), medical checklists, emergency contacts, and birth preferences.
        </p>

        <div className="mt-3 pt-2.5 border-t border-sage/20 flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportPdf}
            disabled={isExporting}
            className="w-full h-11 rounded-xl bg-charcoal hover:bg-black text-white text-[12.5px] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-[0.99]"
          >
            <Download size={15} />
            <span>{isExporting ? 'Generating Report...' : '📄 Export & Print Clinical Care Plan (PDF)'}</span>
          </button>
        </div>
      </div>

      {/* Single-Line Upload Button */}
      <button
        type="button"
        onClick={handleOpenLocker}
        className="w-full h-12 bg-gradient-to-r from-sage-pale/80 to-cream hover:from-sage-pale hover:to-cream border-[1.5px] border-dashed border-sage/60 rounded-xl text-sage-dark font-bold text-[12.5px] flex items-center justify-center gap-2 shadow-3xs active:scale-[0.99] transition-all cursor-pointer whitespace-nowrap"
      >
        <FileUp size={16} />
        <span>+ Upload Ultrasound Scan or Lab Report</span>
      </button>

      {/* Filter Chips for Medical Records */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
        {[
          { key: 'all', label: 'All' },
          { key: 'ultrasound', label: 'Ultrasounds' },
          { key: 'lab', label: 'Bloodwork' },
          { key: 'prescription', label: 'Prescriptions' },
        ].map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setRecordFilter(f.key as any);
            }}
            className={`h-8 px-3 rounded-xl text-[11px] font-bold transition-all shrink-0 cursor-pointer whitespace-nowrap ${
              recordFilter === f.key
                ? 'bg-charcoal text-white shadow-2xs'
                : 'bg-white text-medium border border-border/70 hover:bg-cream'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Medical Records List */}
      <div className="space-y-2">
        {liveReports && liveReports.length > 0 ? (
          liveReports.map((report) => (
            <div
              key={report.id}
              onClick={() => {
                triggerHaptic('light');
                onOpenTool('medical-reports');
              }}
              className="bg-white border border-border/80 hover:border-sage rounded-xl p-3.5 shadow-3xs hover:shadow-2xs transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-700 flex items-center justify-center shrink-0">
                    <FileText size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-charcoal text-[13px] leading-tight truncate">
                      {report.title || report.fileName}
                    </h4>
                    <span className="text-[10.5px] text-medium truncate block mt-0.5">
                      {report.date} • {(report.fileSize / (1024 * 1024)).toFixed(1)} MB
                    </span>
                  </div>
                </div>
                <CheckCircle2 size={16} className="text-sage shrink-0" />
              </div>

              {report.aiSummary && (
                <div className="mt-2 p-2 rounded-lg bg-cream/70 border border-border/50 text-[11px] text-medium truncate">
                  <strong className="text-charcoal font-semibold">AI Summary: </strong> {report.aiSummary}
                </div>
              )}
            </div>
          ))
        ) : (
          defaultSampleRecords
            .filter((r) => recordFilter === 'all' || r.type === recordFilter)
            .map((r) => (
              <div
                key={r.id}
                onClick={() => {
                  triggerHaptic('light');
                  onOpenTool('medical-reports');
                }}
                className="bg-white border border-border/80 hover:border-sage rounded-xl p-3.5 shadow-3xs hover:shadow-2xs transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-lg bg-sage-pale text-sage-dark flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <FileText size={17} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-charcoal text-[13px] leading-tight truncate group-hover:text-sage-dark transition-colors">
                          {r.title}
                        </h4>
                        <span className="text-[9px] font-bold text-sage-dark bg-sage-pale px-1.5 py-0.2 rounded-md uppercase whitespace-nowrap shrink-0">
                          {r.badge}
                        </span>
                      </div>
                      <span className="text-[11px] text-medium truncate block mt-0.5">
                        {r.date} • {r.size}
                      </span>
                    </div>
                  </div>
                  <CheckCircle2 size={16} className="text-sage shrink-0" />
                </div>

                <div className="mt-2 p-2 rounded-lg bg-cream/70 border border-border/50 text-[11px] text-charcoal/90 truncate">
                  <span className="font-bold text-sage-dark mr-1">AI:</span>
                  {r.aiSummary}
                </div>
              </div>
            ))
        )}
      </div>

      {/* ABHA Educational Information Modal */}
      <AbhaInfoModal
        isOpen={isAbhaModalOpen}
        onClose={() => setIsAbhaModalOpen(false)}
      />
    </div>
  );
};
