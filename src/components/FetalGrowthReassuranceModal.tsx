import React, { useState } from 'react';
import {
  X,
  Dna,
  Apple,
  Sparkles,
  Info,
  Calendar,
  Plus,
  Trash2,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Scale
} from 'lucide-react';
import {
  FetalScanRecord,
  saveFetalScan,
  deleteFetalScan,
} from '../utils/fetalGrowth';

interface FetalGrowthReassuranceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentWeek: number;
  activeScan: FetalScanRecord | null;
  lengthRange: string;
  weightRange: string;
  onOpenVaultScan?: () => void;
  onScanSaved?: () => void;
}

export const FetalGrowthReassuranceModal: React.FC<FetalGrowthReassuranceModalProps> = ({
  isOpen,
  onClose,
  currentWeek,
  activeScan,
  lengthRange,
  weightRange,
  onOpenVaultScan,
  onScanSaved,
}) => {
  const [isAddingScan, setIsAddingScan] = useState(false);
  const [scanType, setScanType] = useState<FetalScanRecord['scanType']>(
    currentWeek <= 13 ? 'NT Scan' : currentWeek <= 22 ? 'TIFFA Anomaly' : 'Growth'
  );
  const [scanWeek, setScanWeek] = useState(currentWeek.toString());
  const [scanDate, setScanDate] = useState(new Date().toISOString().split('T')[0]);
  const [scanClinic, setScanClinic] = useState('');
  const [scanWeight, setScanWeight] = useState('');
  const [scanLength, setScanLength] = useState('');
  const [scanNotes, setScanNotes] = useState('');

  if (!isOpen) return null;

  const handleSaveManualScan = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseInt(scanWeek, 10) || currentWeek;
    const weightVal = parseFloat(scanWeight);
    const lengthVal = parseFloat(scanLength);

    saveFetalScan({
      week: w,
      date: scanDate,
      scanType,
      doctorOrClinic: scanClinic.trim() || undefined,
      weightGrams: !isNaN(weightVal) && weightVal > 0 ? weightVal : undefined,
      lengthCm: !isNaN(lengthVal) && lengthVal > 0 ? lengthVal : undefined,
      notes: scanNotes.trim() || undefined,
      source: 'manual',
    });

    setIsAddingScan(false);
    if (onScanSaved) onScanSaved();
  };

  const handleDeleteActiveScan = () => {
    if (!activeScan) return;
    deleteFetalScan(activeScan.id);
    if (onScanSaved) onScanSaved();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#FDFBF7] w-full max-w-lg rounded-t-[32px] sm:rounded-3xl border border-sage/20 shadow-2xl overflow-hidden h-[85vh] sm:h-auto sm:max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-250 pb-[env(safe-area-inset-bottom,16px)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle for mobile */}
        <div className="w-full flex justify-center pt-2.5 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-charcoal/20" />
        </div>

        {/* Header Bar */}
        <div className="px-4 py-3 sm:px-5 sm:py-4 border-b border-border/70 flex items-center justify-between bg-white/95 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sage-pale text-sage-dark flex items-center justify-center shrink-0 border border-sage/25 shadow-2xs">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="font-serif text-[17px] sm:text-[18px] font-bold text-charcoal leading-tight">
                Baby Growth & Measurements
              </h2>
              <span className="text-[11px] text-medium font-medium">
                Week {currentWeek} • Science-backed guidance
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-cream hover:bg-sage-pale/60 text-charcoal flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-charcoal">
          {/* Active Status Banner */}
          {activeScan ? (
            <div className="bg-gradient-to-br from-sage-pale/80 via-white to-cream border border-sage/40 rounded-2xl p-4 shadow-2xs">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-sage text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sage-dark block">
                      Replaced with Doctor's Scan
                    </span>
                    <h4 className="font-bold text-[14px] text-charcoal">
                      {activeScan.scanType} Scan (Week {activeScan.week})
                    </h4>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDeleteActiveScan}
                  className="text-red-500 hover:text-red-700 p-1 rounded-md text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                  title="Remove this scan to restore generic range"
                >
                  <Trash2 size={13} />
                  <span className="text-[10px] font-semibold">Remove</span>
                </button>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                <div className="bg-white/90 rounded-xl p-2.5 border border-sage/20">
                  <span className="text-[10px] uppercase font-bold text-medium block">Doctor Length</span>
                  <p className="font-serif font-bold text-charcoal text-[16px] mt-0.5">
                    {activeScan.lengthCm ? `${activeScan.lengthCm} cm` : 'Not recorded'}
                  </p>
                </div>
                <div className="bg-white/90 rounded-xl p-2.5 border border-sage/20">
                  <span className="text-[10px] uppercase font-bold text-medium block">Doctor Weight</span>
                  <p className="font-serif font-bold text-charcoal text-[16px] mt-0.5">
                    {activeScan.weightGrams ? `${activeScan.weightGrams} g` : 'Not recorded'}
                  </p>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-sage/15 flex items-center justify-between text-[11px] text-medium">
                <span>Date: {activeScan.date || 'Recent'}</span>
                {activeScan.doctorOrClinic && <span>Clinic: {activeScan.doctorOrClinic}</span>}
              </div>
            </div>
          ) : (
            <div className="bg-white/90 border border-border/80 rounded-2xl p-4 shadow-2xs">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-sage-dark block mb-1">
                Currently Showing Indian Standard Range (10th–90th Percentile)
              </span>
              <div className="grid grid-cols-2 gap-2 text-center mt-2">
                <div className="bg-cream/60 rounded-xl p-2.5 border border-border/60">
                  <span className="text-[10px] uppercase font-bold text-medium block">Healthy Length Range</span>
                  <p className="font-serif font-bold text-charcoal text-[15px] mt-0.5">{lengthRange}</p>
                </div>
                <div className="bg-cream/60 rounded-xl p-2.5 border border-border/60">
                  <span className="text-[10px] uppercase font-bold text-medium block">Healthy Weight Range</span>
                  <p className="font-serif font-bold text-charcoal text-[15px] mt-0.5">{weightRange}</p>
                </div>
              </div>
            </div>
          )}

          {/* Clinical & Genetic Reassurance Note */}
          <div className="bg-white border border-border/70 rounded-2xl p-4 shadow-2xs space-y-3">
            <h3 className="font-serif text-[15px] font-bold text-charcoal flex items-center gap-2">
              <span>🌱</span>
              <span>Every Baby Grows at Their Own Unique Pace</span>
            </h3>

            <p className="text-[12.5px] text-charcoal/85 leading-relaxed">
              Standard commercial apps often display a single, rigid number (like <em>&quot;15.3 cm, 240 g&quot;</em>) based on foreign demographic tables. In reality, a fixed number can trigger needless anxiety.
            </p>

            <div className="space-y-2.5 pt-1">
              <div className="flex items-start gap-2.5 text-[12px] text-charcoal/90">
                <div className="w-6 h-6 rounded-full bg-sage-pale text-sage-dark flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  <Dna size={13} />
                </div>
                <div>
                  <strong className="text-charcoal font-semibold">Parental Genetics: </strong>
                  Mother&apos;s and father&apos;s natural height, bone structure, and ancestral background strongly shape fetal sizing.
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-[12px] text-charcoal/90">
                <div className="w-6 h-6 rounded-full bg-amber-50 text-amber-800 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  <Apple size={13} />
                </div>
                <div>
                  <strong className="text-charcoal font-semibold">Nutrition & Metabolism: </strong>
                  Balanced protein, iron, and maternal caloric intake nourish healthy tissue formation along individual growth curves.
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-[12px] text-charcoal/90">
                <div className="w-6 h-6 rounded-full bg-teal-50 text-teal-800 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  <Scale size={13} />
                </div>
                <div>
                  <strong className="text-charcoal font-semibold">Growth Spurts: </strong>
                  Fetuses grow in waves. A difference of a few grams or centimeters from generic charts is completely natural and healthy.
                </div>
              </div>
            </div>

            <div className="mt-3 p-3 bg-cream/70 rounded-xl border border-sage/20 text-[11px] text-medium leading-relaxed flex items-start gap-2">
              <ShieldCheck size={16} className="text-sage-dark shrink-0 mt-0.5" />
              <span>
                Referenced with Indian fetal growth cohort baselines (<strong>GARBH-Ini / FOGSI</strong>). Your obstetrician&apos;s ultrasound scan remains your primary medical compass.
              </span>
            </div>
          </div>

          {/* Add / Update Scan Section */}
          {!isAddingScan ? (
            <div className="bg-gradient-to-r from-sage-pale/60 to-cream border border-sage/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-[13.5px] text-charcoal">
                  {activeScan ? 'Update Ultrasound Measurement' : 'Have Your Doctor\'s Ultrasound Scan?'}
                </h4>
                <p className="text-[11.5px] text-medium mt-0.5">
                  Enter your scan numbers to replace estimated ranges with your baby&apos;s verified values.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingScan(true)}
                className="w-full sm:w-auto h-9 px-4 rounded-xl bg-charcoal hover:bg-black text-white text-[12px] font-bold flex items-center justify-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-xs whitespace-nowrap"
              >
                <Plus size={14} />
                <span>{activeScan ? 'Update Scan' : 'Enter Scan Numbers'}</span>
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSaveManualScan}
              className="bg-white border border-sage/40 rounded-2xl p-4 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between border-b border-border/70 pb-2">
                <h4 className="font-bold text-[13.5px] text-charcoal">
                  Enter Doctor&apos;s Ultrasound Metrics
                </h4>
                <button
                  type="button"
                  onClick={() => setIsAddingScan(false)}
                  className="text-[11px] text-medium hover:text-charcoal font-medium"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10.5px] uppercase font-bold text-medium block mb-1">
                    Scan Type
                  </label>
                  <select
                    value={scanType}
                    onChange={(e) => setScanType(e.target.value as any)}
                    className="w-full h-9 px-2 text-[12px] bg-cream/50 border border-border rounded-xl focus:border-sage focus:outline-none"
                  >
                    <option value="Dating">Dating Scan (6–10w)</option>
                    <option value="NT Scan">NT Scan (11–13w)</option>
                    <option value="TIFFA Anomaly">TIFFA / Anomaly (18–22w)</option>
                    <option value="Growth">Growth Scan (28–36w)</option>
                    <option value="Biophysical">Biophysical Profile</option>
                    <option value="Other">Other Scan</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10.5px] uppercase font-bold text-medium block mb-1">
                    Gestational Week
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="42"
                    value={scanWeek}
                    onChange={(e) => setScanWeek(e.target.value)}
                    className="w-full h-9 px-2.5 text-[12px] bg-cream/50 border border-border rounded-xl focus:border-sage focus:outline-none font-medium"
                    placeholder={`e.g. ${currentWeek}`}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10.5px] uppercase font-bold text-medium block mb-1">
                    Estimated Weight (g)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={scanWeight}
                    onChange={(e) => setScanWeight(e.target.value)}
                    className="w-full h-9 px-2.5 text-[12px] bg-cream/50 border border-border rounded-xl focus:border-sage focus:outline-none font-medium"
                    placeholder="e.g. 240 (grams)"
                  />
                </div>
                <div>
                  <label className="text-[10.5px] uppercase font-bold text-medium block mb-1">
                    Length / CRL (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={scanLength}
                    onChange={(e) => setScanLength(e.target.value)}
                    className="w-full h-9 px-2.5 text-[12px] bg-cream/50 border border-border rounded-xl focus:border-sage focus:outline-none font-medium"
                    placeholder="e.g. 15.2 (cm)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10.5px] uppercase font-bold text-medium block mb-1">
                    Scan Date
                  </label>
                  <input
                    type="date"
                    value={scanDate}
                    onChange={(e) => setScanDate(e.target.value)}
                    className="w-full h-9 px-2 text-[11.5px] bg-cream/50 border border-border rounded-xl focus:border-sage focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10.5px] uppercase font-bold text-medium block mb-1">
                    Hospital / Clinic (Optional)
                  </label>
                  <input
                    type="text"
                    value={scanClinic}
                    onChange={(e) => setScanClinic(e.target.value)}
                    className="w-full h-9 px-2.5 text-[12px] bg-cream/50 border border-border rounded-xl focus:border-sage focus:outline-none"
                    placeholder="e.g. Cloudnine, Fortis"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10.5px] uppercase font-bold text-medium block mb-1">
                  Doctor Notes / AFI (Optional)
                </label>
                <input
                  type="text"
                  value={scanNotes}
                  onChange={(e) => setScanNotes(e.target.value)}
                  className="w-full h-9 px-2.5 text-[12px] bg-cream/50 border border-border rounded-xl focus:border-sage focus:outline-none"
                  placeholder="e.g. Cephalic presentation, AFI 14cm"
                />
              </div>

              <button
                type="submit"
                className="w-full h-10 rounded-xl bg-sage-dark hover:bg-sage text-white text-[12.5px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <CheckCircle2 size={15} />
                <span>Save Scan & Personalize Dashboard</span>
              </button>
            </form>
          )}

          {/* Quick link to Vault Tab if needed */}
          {onOpenVaultScan && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenVaultScan();
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-cream hover:bg-sage-pale/60 border border-border text-center text-[12px] font-semibold text-charcoal flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>📁 Manage uploaded scan PDFs in Private Medical Vault</span>
              <ChevronRight size={14} className="text-medium" />
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-white/90 border-t border-border/70 text-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full h-10 rounded-xl bg-cream hover:bg-sage-pale/50 text-charcoal font-bold text-[12.5px] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
