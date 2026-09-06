import React, { useState, useEffect } from 'react';
import { usePlanner } from '../../store';
import { db, MedicalReport } from '../../db';
import {
  UploadCloud,
  FileText,
  FileImage,
  Calendar,
  Download,
  Trash2,
  Eye,
  Lock,
  Info,
  AlertCircle,
  X,
  File,
  Brain,
  Sparkles,
  Pill,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  Loader2,
  Scale
} from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase';
import { Paywall } from '../Paywall';

const formatBytes = (bytes: number, decimals = 2) => {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const AILoadingMessage: React.FC = () => {
  const messages = [
    "Reading report file...",
    "Deciphering doctor handwriting...",
    "Translating medical abbreviations...",
    "Extracting prescribed medications...",
    "Formulating safe guidelines...",
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return <span className="text-[12px] text-sage font-medium">{messages[index]}</span>;
};

export const MedicalReports: React.FC = () => {
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { state } = usePlanner();
  const [previewReport, setPreviewReport] = useState<MedicalReport | null>(null);
  const [analyzingMap, setAnalyzingMap] = useState<Record<string, boolean>>({});
  const [analysisErrorMap, setAnalysisErrorMap] = useState<Record<string, string | null>>({});

  const loadReports = async () => {
    if (!state.activeJourneyId) return;
    try {
      const records = await db.medicalReports
        .where('journeyId')
        .equals(state.activeJourneyId)
        .reverse()
        .sortBy('timestamp');
      setReports(records);
    } catch (e) {
      console.error("Failed to load medical reports:", e);
    }
  };

  useEffect(() => {
    loadReports();
  }, [state.activeJourneyId]);

  const processFile = async (file: File) => {
    setUploadError(null);

    // File size validation (limit to 10MB)
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      setUploadError("File is too large. Maximum size is 10MB to ensure smooth app performance.");
      return;
    }

    // Allowed file types: PDF and images
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Unsupported file type. Please upload a PDF or an Image (PNG, JPG, WebP).");
      return;
    }

    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;

        const reportId = 'report_' + Date.now();
        const newReport: MedicalReport = {
          id: reportId,
          journeyId: state.activeJourneyId || 'local-journey',
          title: file.name.substring(0, file.name.lastIndexOf('.')) || file.name,
          date: new Date().toISOString().split('T')[0],
          timestamp: Date.now(),
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          fileData: base64,
          notes: '',
          createdAt: Date.now()
        };

        await db.medicalReports.put(newReport);
        await loadReports();
        setIsUploading(false);
      };

      reader.onerror = () => {
        setUploadError("Failed to read the file. Please try again.");
        setIsUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Error uploading report:", err);
      setUploadError("An error occurred during file upload. Please try again.");
      setIsUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      await processFile(selectedFiles[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const updateReportField = async (id: string, field: keyof MedicalReport, value: any) => {
    try {
      const report = reports.find(r => r.id === id);
      if (report) {
        const updated = { ...report, [field]: value };
        if (field === 'date') {
          updated.timestamp = new Date(value).getTime();
        }
        await db.medicalReports.put(updated);
        setReports(prev => prev.map(r => r.id === id ? updated : r));
      }
    } catch (e) {
      console.error(`Failed to update report ${field}:`, e);
    }
  };

  const deleteReport = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this report? This cannot be undone.")) {
      try {
        await db.medicalReports.delete(id);
        await loadReports();
      } catch (e) {
        console.error("Failed to delete report:", e);
      }
    }
  };

  const runAIAnalysis = async (report: MedicalReport) => {
    setAnalyzingMap(prev => ({ ...prev, [report.id]: true }));
    setAnalysisErrorMap(prev => ({ ...prev, [report.id]: null }));

    try {
      const base64Data = report.fileData.split(',')[1];
      const fileType = report.fileType;
      const fileName = report.fileName;

      const analyzeMedicalReport = httpsCallable(functions, 'analyzeMedicalReport');
      const response = await analyzeMedicalReport({ base64Data, fileType, fileName });

      const data = response.data as {
        summary: string;
        prescriptions: string[];
        warnings: string[];
      };

      const updated = {
        ...report,
        aiSummary: data.summary,
        aiPrescriptions: data.prescriptions,
        aiWarnings: data.warnings,
        aiAnalysedAt: Date.now()
      };

      await db.medicalReports.put(updated);
      setReports(prev => prev.map(r => r.id === report.id ? updated : r));
    } catch (err: any) {
      console.error("AI Analysis error:", err);
      setAnalysisErrorMap(prev => ({
        ...prev,
        [report.id]: err?.message || "Failed to analyze report. Please try again."
      }));
    } finally {
      setAnalyzingMap(prev => ({ ...prev, [report.id]: false }));
    }
  };

  const resetAIAnalysis = async (report: MedicalReport) => {
    if (window.confirm("Are you sure you want to clear this AI analysis?")) {
      try {
        const updated = {
          ...report,
          aiSummary: undefined,
          aiPrescriptions: undefined,
          aiWarnings: undefined,
          aiAnalysedAt: undefined
        };
        await db.medicalReports.put(updated);
        setReports(prev => prev.map(r => r.id === report.id ? updated : r));
        setAnalysisErrorMap(prev => ({ ...prev, [report.id]: null }));
      } catch (e) {
        console.error("Failed to reset AI analysis:", e);
      }
    }
  };

  const triggerDownload = (report: MedicalReport) => {
    const link = document.createElement('a');
    link.href = report.fileData;
    link.download = report.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFileIcon = (fileType: string) => {
    if (fileType === 'application/pdf') {
      return <FileText className="w-8 h-8 text-rose-500" />;
    } else if (fileType.startsWith('image/')) {
      return <FileImage className="w-8 h-8 text-emerald-500" />;
    }
    return <File className="w-8 h-8 text-sage" />;
  };

  return (
    <Paywall featureName="EhrExports">
      <div className="animate-in fade-in duration-300">
        <div className="mb-7">
          <h2 className="font-serif text-[clamp(28px,4vw,40px)] font-normal mb-1.5">Medical Reports</h2>
          <p className="text-[14px] text-medium max-w-[560px] leading-[1.7]">
            Upload and organize your ultrasound scans, blood test reports, and clinic prescriptions.
          </p>
        </div>

        {/* Privacy Notice Banner */}
        <div className="bg-sage-pale/40 border border-sage/20 rounded-[16px] p-4 mb-3 flex gap-3 items-start">
          <Lock className="w-5 h-5 text-sage shrink-0 mt-0.5" />
          <div>
            <h4 className="text-[13px] font-bold text-sage-dark mb-0.5">🔒 Secure Cloud Storage & Privacy</h4>
            <p className="text-[12px] text-medium leading-relaxed">
              All medical reports are stored securely in the cloud with strict industry-standard encryption and privacy controls.
              Your health records are confidential, secure, and accessible across all your linked devices.
            </p>
          </div>
        </div>

        {/* Indian Law Compliance: PCPNDT Act Banner */}
        <div className="bg-amber-500/10 border border-amber-500/25 rounded-[16px] p-4 mb-6 flex gap-3 items-start">
          <Scale className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-[13px] font-bold text-amber-900 dark:text-amber-300 mb-0.5">⚖️ Strict Compliance with Indian Law (PCPNDT Act, 1994)</h4>
            <p className="text-[12px] text-charcoal/85 dark:text-gray-300 leading-relaxed">
              In accordance with the <strong>Pre-Conception and Pre-Natal Diagnostic Techniques (PCPNDT) Act, 1994</strong>, determination or disclosure of the sex/gender of a fetus is strictly prohibited in India. This application and its AI tools <strong>do not identify, predict, or reveal fetal gender</strong> under any circumstances. This feature is intended solely for organizing your prescriptions, tracking diagnostic test records, and preparing medical summaries for your OB-GYN consultations.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.8fr] gap-6 items-start">
          {/* Left Column: Upload Area */}
          <div className="flex flex-col gap-4">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-[2px] border-dashed rounded-[20px] p-8 flex flex-col items-center justify-center text-center transition-all duration-300 min-h-[240px] cursor-pointer relative bg-white
              ${isDragOver
                  ? 'border-sage bg-sage-pale/20 scale-[1.02]'
                  : 'border-border hover:border-sage-light hover:shadow-sm'
                }`}
            >
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                disabled={isUploading}
              />

              <div className="w-16 h-16 bg-sage-pale/50 text-sage rounded-full flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
                <UploadCloud className="w-8 h-8" />
              </div>

              <h3 className="text-[15px] font-bold text-charcoal mb-1">
                {isUploading ? "Uploading & encrypting..." : "Upload Medical Report"}
              </h3>
              <p className="text-[12px] text-medium max-w-[200px] leading-relaxed mb-3">
                Drag & drop your files here, or click to browse.
              </p>
              <span className="text-[10px] text-light uppercase tracking-wider font-bold">
                PDF, PNG, JPG (Max 10MB)
              </span>
            </div>

            {uploadError && (
              <div className="bg-critical-bg border border-critical/30 rounded-[12px] p-3 flex gap-2 items-start animate-in zoom-in-95 duration-200">
                <AlertCircle className="w-4 h-4 text-critical shrink-0 mt-0.5" />
                <span className="text-[12px] text-critical font-medium">{uploadError}</span>
              </div>
            )}

            <div className="bg-white border border-border rounded-[18px] p-5 shadow-sm">
              <h4 className="text-[13px] font-bold text-charcoal mb-2 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-sage" /> Quick Tip
              </h4>
              <p className="text-[12px] text-medium leading-relaxed">
                When storing reports, rename them with clear labels (e.g. <em>"12 Week Ultrasound Scan"</em> or <em>"CBC Blood Test - May 2026"</em>) and add important summaries in the doctor notes block.
              </p>
            </div>
          </div>

          {/* Right Column: Reports List */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between pl-1">
              <h3 className="text-[14px] font-bold text-charcoal uppercase tracking-[1px]">
                My Stored Records ({reports.length})
              </h3>
            </div>

            {reports.length === 0 ? (
              <div className="bg-white border border-border rounded-[20px] p-10 text-center flex flex-col items-center justify-center min-h-[300px]">
                <div className="w-12 h-12 bg-cream text-light rounded-full flex items-center justify-center mb-3">
                  <FileText className="w-6 h-6" />
                </div>
                <h4 className="text-[14px] font-bold text-charcoal mb-1">No reports uploaded yet</h4>
                <p className="text-[12px] text-medium max-w-[260px] leading-relaxed">
                  Keep all your screenings, vitals records, and vaccine receipts safe in one place. Drag & drop files on the left to add one!
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="bg-white border border-border rounded-[18px] p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-cream border border-border rounded-[12px] shrink-0 mt-0.5">
                        {getFileIcon(report.fileType)}
                      </div>

                      <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-3">
                        <div>
                          {/* Title input */}
                          <input
                            type="text"
                            value={report.title}
                            onChange={(e) => updateReportField(report.id, 'title', e.target.value)}
                            className="w-full font-serif text-[17px] font-semibold text-charcoal border-b border-transparent hover:border-border focus:border-sage focus:outline-none bg-transparent py-0.5 truncate transition-colors"
                            placeholder="Report Title"
                          />
                          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1 text-[11px] text-light">
                            <span className="truncate max-w-[150px]" title={report.fileName}>
                              {report.fileName}
                            </span>
                            <span>•</span>
                            <span>{formatBytes(report.fileSize)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 md:justify-end">
                          <Calendar size={14} className="text-light shrink-0" />
                          <input
                            type="date"
                            value={report.date}
                            onChange={(e) => updateReportField(report.id, 'date', e.target.value)}
                            className="font-sans text-[12px] text-medium font-medium bg-cream border border-border rounded-[8px] p-1.5 focus:outline-none focus:border-sage transition-all max-w-[130px]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Doctor Notes Textarea */}
                    <div>
                      <label className="text-[10px] font-bold tracking-[0.8px] uppercase text-light mb-1.5 block">Summary & Doctor Instructions</label>
                      <textarea
                        value={report.notes || ''}
                        onChange={(e) => updateReportField(report.id, 'notes', e.target.value)}
                        placeholder="Doctor guidelines, vaccine follow-ups, parameters to watch out for..."
                        className="w-full p-2.5 bg-cream/30 border border-border rounded-[10px] text-[13px] text-charcoal resize-y min-h-[50px] font-sans leading-relaxed focus:outline-none focus:border-sage transition-colors placeholder:text-light/80 placeholder:italic"
                      />
                    </div>

                    {/* AI Assistant Section */}
                    <div className="mt-2 border-t border-border/40 pt-4">
                      {!report.aiAnalysedAt && !analyzingMap[report.id] && (
                        <div className="bg-sage-pale/20 border border-sage/10 rounded-[14px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex gap-2.5 items-start">
                            <Brain className="w-5 h-5 text-sage shrink-0 mt-0.5" />
                            <div className="text-left">
                              <h5 className="text-[13px] font-bold text-charcoal">Decipher & Summarize with AI</h5>
                              <p className="text-[11px] text-medium leading-relaxed max-w-[400px]">
                                Extract prescriptions, decode doctor's handwriting, and get a simplified medical summary.
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => runAIAnalysis(report)}
                            className="px-4 py-2 bg-sage hover:bg-sage-dark text-white font-semibold text-xs rounded-[10px] flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 self-start sm:self-center"
                          >
                            <Sparkles size={13} /> Analyze Report
                          </button>
                        </div>
                      )}

                      {analyzingMap[report.id] && (
                        <div className="bg-cream/40 border border-border rounded-[14px] p-4 flex items-center justify-center gap-3 min-h-[80px]">
                          <Loader2 className="w-5 h-5 text-sage animate-spin" />
                          <AILoadingMessage />
                        </div>
                      )}

                      {analysisErrorMap[report.id] && (
                        <div className="bg-critical-bg/50 border border-critical/20 rounded-[12px] p-3 flex gap-2 items-start mt-2">
                          <AlertCircle className="w-4 h-4 text-critical shrink-0 mt-0.5" />
                          <div className="flex-1 text-left">
                            <span className="text-[12px] text-critical font-medium">{analysisErrorMap[report.id]}</span>
                            <button
                              onClick={() => runAIAnalysis(report)}
                              className="text-[11px] text-sage hover:text-sage-dark underline font-bold ml-2 transition-colors cursor-pointer"
                            >
                              Retry
                            </button>
                          </div>
                        </div>
                      )}

                      {report.aiAnalysedAt && (
                        <div className="flex flex-col gap-3 text-left">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <Brain size={16} className="text-sage" />
                              <span className="text-[11px] font-bold tracking-[0.8px] uppercase text-sage">AI Digital Helper Findings</span>
                            </div>
                            <button
                              onClick={() => resetAIAnalysis(report)}
                              className="text-[11px] text-medium hover:text-critical flex items-center gap-1 transition-colors cursor-pointer"
                              title="Clear AI Analysis"
                            >
                              <RotateCcw size={11} /> Reset Analysis
                            </button>
                          </div>

                          {/* Summary */}
                          {report.aiSummary && (
                            <div className="bg-sage-pale/20 border border-sage/10 rounded-[12px] p-3.5">
                              <h6 className="text-[11px] font-bold text-sage-dark mb-1 flex items-center gap-1">
                                <Sparkles size={12} /> Patient-Friendly Summary
                              </h6>
                              <p className="text-[12.5px] text-charcoal leading-relaxed font-sans">{report.aiSummary}</p>
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {/* Prescriptions */}
                            <div className="bg-cream/40 border border-border/70 rounded-[12px] p-3.5 flex flex-col gap-2">
                              <h6 className="text-[11px] font-bold text-charcoal mb-1 flex items-center gap-1">
                                <Pill size={12} className="text-rose-400" /> Deciphered Prescriptions
                              </h6>
                              {report.aiPrescriptions && report.aiPrescriptions.length > 0 ? (
                                <ul className="space-y-1.5 flex-1">
                                  {report.aiPrescriptions.map((presc, idx) => (
                                    <li key={idx} className="text-[12px] text-charcoal leading-relaxed pl-3 relative before:content-[''] before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-rose-400/70 before:rounded-full font-medium">
                                      {presc}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <span className="text-[12px] text-light italic">No prescriptions detected in this record.</span>
                              )}
                            </div>

                            {/* Warnings / Guidance */}
                            <div className="bg-cream/40 border border-border/70 rounded-[12px] p-3.5 flex flex-col gap-2">
                              <h6 className="text-[11px] font-bold text-charcoal mb-1 flex items-center gap-1">
                                <AlertTriangle size={12} className="text-amber-500" /> Key Warnings & Guidelines
                              </h6>
                              {report.aiWarnings && report.aiWarnings.length > 0 ? (
                                <ul className="space-y-1.5 flex-1">
                                  {report.aiWarnings.map((warn, idx) => (
                                    <li key={idx} className="text-[12px] text-charcoal leading-relaxed pl-3 relative before:content-[''] before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-amber-400/70 before:rounded-full font-medium">
                                      {warn}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <span className="text-[12px] text-light italic">No safety warnings detected.</span>
                              )}
                            </div>
                          </div>

                          {/* Disclaimer */}
                          <div className="bg-cream/20 border border-border/50 rounded-[10px] p-2.5 flex gap-2 items-start">
                            <ShieldCheck size={14} className="text-sage shrink-0 mt-0.5" />
                            <p className="text-[10px] text-medium leading-relaxed font-sans">
                              <strong>Medical Verification Notice:</strong> This analysis is processed using AI to decipher doctor note formats and is strictly for informational aid. Never alter medications, dosages, or schedules without consulting your practitioner or pharmacist.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2 border-t border-border/50 pt-3">
                      {report.fileType.startsWith('image/') && (
                        <button
                          onClick={() => setPreviewReport(report)}
                          className="p-2 border border-border text-medium hover:text-sage hover:bg-sage-pale/20 rounded-[10px] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Preview Image"
                        >
                          <Eye size={14} /> Preview
                        </button>
                      )}
                      <button
                        onClick={() => triggerDownload(report)}
                        className="p-2 border border-border text-medium hover:text-sage hover:bg-sage-pale/20 rounded-[10px] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Download File"
                      >
                        <Download size={14} /> Download
                      </button>
                      <button
                        onClick={() => deleteReport(report.id)}
                        className="p-2 border border-border text-medium hover:text-critical hover:bg-critical-bg rounded-[10px] text-xs font-semibold flex items-center gap-1.5 transition-colors ml-auto cursor-pointer"
                        title="Delete Report"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Lightbox / Preview Modal for Images */}
        {previewReport && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-charcoal/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[24px] overflow-hidden max-w-[90%] max-h-[90%] w-full md:w-auto relative shadow-2xl flex flex-col">
              <div className="p-4 border-b border-border flex justify-between items-center bg-cream">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-charcoal">{previewReport.title}</span>
                  <span className="text-[11px] bg-sage text-white font-bold px-2 py-0.5 rounded uppercase">{previewReport.fileType.split('/')[1]}</span>
                </div>
                <button
                  onClick={() => setPreviewReport(null)}
                  className="text-medium hover:text-charcoal p-1.5 rounded-full hover:bg-black/5 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="overflow-auto flex items-center justify-center p-4 bg-charcoal/5 flex-1 min-h-0">
                <img
                  src={previewReport.fileData}
                  alt={previewReport.title}
                  className="max-w-full max-h-[70vh] object-contain rounded-md"
                />
              </div>
              <div className="p-4 border-t border-border flex justify-end gap-3 bg-cream">
                <button
                  onClick={() => triggerDownload(previewReport)}
                  className="px-4 py-2 bg-sage text-white font-semibold text-sm rounded-[10px] flex items-center gap-2 hover:bg-sage-dark transition-colors cursor-pointer"
                >
                  <Download size={16} /> Download File
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Paywall>
  );
};
