import React, { useState } from 'react';
import { usePlanner } from '../../store';
import { auth, db, doc, setDoc, serverTimestamp, deleteMyOwnAccountCallable } from '../../firebase';
import { signOut } from 'firebase/auth';
import { db as dexieDb } from '../../db';
import { User, Settings, FileText, Weight, Calendar, Cloud, ShieldCheck, Trash2, AlertTriangle, Loader2, Sparkles } from 'lucide-react';
import { navigate } from '../../utils/navigation';

export const Profile: React.FC = () => {
  const { state, updateState } = usePlanner();
  
  const [userName, setUserName] = useState(state.userName || '');
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Self-service account deletion state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      // 1. Invoke server-side account deletion
      await deleteMyOwnAccountCallable();

      // 2. Clear local Dexie IndexedDB
      try {
        await Promise.all(dexieDb.tables.map(table => table.clear()));
      } catch (dbErr) {
        console.warn("Could not clear local database:", dbErr);
      }

      // 3. Clear local & session storage
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (storageErr) {
        console.warn("Could not clear storage:", storageErr);
      }

      // 4. Sign out from Firebase Auth
      await signOut(auth);

      // 5. Redirect to Landing Page
      window.location.hash = '#/';
      window.location.reload();
    } catch (err: any) {
      console.error("Failed to delete account:", err);
      const msg = err?.message || "Failed to delete account. Please try again.";
      setDeleteError(msg);
      setToastMessage(msg);
      setTimeout(() => setToastMessage(null), 5000);
      setIsDeleting(false);
    }
  };


  const handleEmailClick = (email: string, e: React.MouseEvent) => {
    e.preventDefault();
    // Attempt standard mailto redirect
    window.location.href = `mailto:${email}`;
    
    // Copy to clipboard fallback
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email).then(() => {
        setToastMessage("Email copied to clipboard!");
        setTimeout(() => setToastMessage(null), 3000);
      }).catch((err) => {
        console.error("Could not copy email: ", err);
      });
    } else {
      try {
        const tempInput = document.createElement("input");
        tempInput.value = email;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand("copy");
        document.body.removeChild(tempInput);
        setToastMessage("Email copied to clipboard!");
        setTimeout(() => setToastMessage(null), 3000);
      } catch (err) {
        console.error("Fallback copy failed: ", err);
      }
    }
  };
  
  const handleNameSave = () => {
    updateState({ userName });
  };

  const isAiEnabled = state.aiProcessingConsent !== false;

  const handleToggleAiConsent = async (enabled: boolean) => {
    updateState({ aiProcessingConsent: enabled });
    if (auth.currentUser) {
      try {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await setDoc(userRef, {
          aiProcessingConsent: enabled,
          aiProcessingConsentedAt: enabled ? serverTimestamp() : null,
        }, { merge: true });
        setToastMessage(enabled ? "AI-powered features enabled" : "AI-powered features disabled");
        setTimeout(() => setToastMessage(null), 3000);
      } catch (err) {
        console.error("Failed to update AI processing consent:", err);
        setToastMessage("Failed to update AI settings. Please try again.");
        setTimeout(() => setToastMessage(null), 3000);
      }
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="font-serif text-3xl text-charcoal mb-2">Settings & Profile</h2>
        <p className="text-medium w-full max-w-2xl leading-relaxed">
          Manage your account information and app preferences. These settings are synced across your devices.
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Info */}
        <section className="bg-white rounded-[24px] p-6 shadow-sm border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-sage-pale flex items-center justify-center text-sage">
              <User className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-2xl text-charcoal">Your Profile</h3>
          </div>
          
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-[12px] font-semibold tracking-wide uppercase text-light mb-1.5">Email Address</label>
              <div className="p-3 bg-gray-50 border border-border rounded-[10px] text-charcoal opacity-70">
                {auth.currentUser?.email || 'Not signed in'}
              </div>
              <p className="text-[11px] text-medium mt-1">Your email is managed securely via Google Sign-In.</p>
            </div>

            <div>
              <label className="block text-[12px] font-semibold tracking-wide uppercase text-light mb-1.5">Your Name (Optional)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="How should we call you?"
                  className="flex-1 p-3 border border-border rounded-[10px] focus:outline-none focus:border-sage bg-transparent"
                />
                <button 
                  onClick={handleNameSave}
                  className="px-4 py-3 bg-sage text-white font-medium rounded-[10px] hover:bg-sage-dark transition-colors"
                >
                  Save
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-border space-y-2">
              <label className="block text-[12px] font-semibold tracking-wide uppercase text-light">Membership Plan</label>
              
              <div className="p-4 bg-gray-50 dark:bg-charcoal/20 border border-border rounded-2xl space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    {state.isAdmin || auth.currentUser?.email === 'sukrat.kaushik@gmail.com' ? (
                      <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-bold rounded-full text-[12px] uppercase tracking-wider border border-purple-300">
                        👑 Admin / App Owner (Lifetime Access)
                      </span>
                    ) : state.planTier === 'premium' || state.isPremium ? (
                      <span className="px-3 py-1 bg-gold-pale text-gold-dark font-bold rounded-full text-[12px] uppercase tracking-wider border border-gold/30">
                        👑 AI Premium Active
                      </span>
                    ) : state.planTier === 'standard' ? (
                      <span className="px-3 py-1 bg-sage-pale text-sage-dark font-bold rounded-full text-[12px] uppercase tracking-wider border border-sage/30">
                        🩺 Standard Maternal Care Active
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-gray-200 text-charcoal font-semibold rounded-full text-[12px]">
                        Free Starter Plan
                      </span>
                    )}
                  </div>

                  {!(state.isAdmin || auth.currentUser?.email === 'sukrat.kaushik@gmail.com') && (
                    <button
                      onClick={() => { navigate('/checkout?plan=premium'); }}
                      className="text-[12.5px] font-bold text-sage hover:underline cursor-pointer"
                    >
                      {state.planTier === 'premium' ? 'Manage Plan →' : 'Upgrade to Premium →'}
                    </button>
                  )}
                </div>

                <p className="text-[12.5px] text-medium leading-relaxed">
                  {state.isAdmin || auth.currentUser?.email === 'sukrat.kaushik@gmail.com'
                    ? 'You have perpetual lifetime access to all 24/7 Bloom AI tools, clinical checklists, food safety scanner, and admin controls.'
                    : state.planTier === 'premium' || state.isPremium
                    ? 'All features unlocked: 24/7 Bloom AI prenatal assistant, smart food safety scanner, EHR medical exports, and partner sync.'
                    : state.planTier === 'standard'
                    ? 'Maternal care features unlocked: Government schemes, postpartum recovery guide, and partner sync.'
                    : 'Free starter tier with core milestone checklists. Upgrade anytime for 24/7 AI prenatal guidance and smart scanner.'}
                </p>

                {state.planExpiry && !state.isAdmin && auth.currentUser?.email !== 'sukrat.kaushik@gmail.com' && (
                  <div className="text-[11.5px] text-light pt-1 border-t border-border/50">
                    Expires on: <strong>{new Date(state.planExpiry).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: '2-digit' })}</strong>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Preferences */}
        <section className="bg-white rounded-[24px] p-6 shadow-sm border border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-sage-pale flex items-center justify-center text-sage">
              <Settings className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-2xl text-charcoal">App Preferences</h3>
          </div>

          <div className="space-y-6 max-w-xl">
            {/* Weight Unit */}
            <div className="flex items-start justify-between p-4 bg-gray-50 rounded-[16px] border border-border">
              <div>
                <h4 className="font-semibold text-charcoal flex items-center gap-2 mb-1">
                  <Weight className="w-4 h-4 text-sage" />
                  Unit of Measurement
                </h4>
                <p className="text-medium text-sm">Choose how you want to track your weight in the Vitals section.</p>
              </div>
              <div className="flex bg-white border border-border rounded-[8px] overflow-hidden shadow-sm">
                <button
                  className={`px-4 py-2 text-sm font-medium transition-colors ${state.weightUnit !== 'lbs' ? 'bg-sage text-white' : 'text-medium hover:bg-sage-pale hover:text-sage'}`}
                  onClick={() => updateState({ weightUnit: 'kg' })}
                >
                  kg
                </button>
                <div className="w-px bg-border"></div>
                <button
                  className={`px-4 py-2 text-sm font-medium transition-colors ${state.weightUnit === 'lbs' ? 'bg-sage text-white' : 'text-medium hover:bg-sage-pale hover:text-sage'}`}
                  onClick={() => updateState({ weightUnit: 'lbs' })}
                >
                  lbs
                </button>
              </div>
            </div>

            {/* Calendar Start Day */}
            <div className="flex items-start justify-between p-4 bg-gray-50 rounded-[16px] border border-border">
              <div>
                <h4 className="font-semibold text-charcoal flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-sage" />
                  Calendar Start Day
                </h4>
                <p className="text-medium text-sm">Select the preferred first day of the week for calendars in the app.</p>
              </div>
              <div className="flex bg-white border border-border rounded-[8px] overflow-hidden shadow-sm">
                <button
                  className={`px-4 py-2 text-sm font-medium transition-colors ${state.calendarStartDay !== 'sunday' ? 'bg-sage text-white' : 'text-medium hover:bg-sage-pale hover:text-sage'}`}
                  onClick={() => updateState({ calendarStartDay: 'monday' })}
                >
                  Mon
                </button>
                <div className="w-px bg-border"></div>
                <button
                  className={`px-4 py-2 text-sm font-medium transition-colors ${state.calendarStartDay === 'sunday' ? 'bg-sage text-white' : 'text-medium hover:bg-sage-pale hover:text-sage'}`}
                  onClick={() => updateState({ calendarStartDay: 'sunday' })}
                >
                  Sun
                </button>
              </div>
            </div>
            
          </div>
        </section>

        {/* Cloud Sync & Privacy */}
        <section className="bg-white rounded-[24px] p-6 shadow-sm border border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
              <Cloud className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-2xl text-charcoal">Data Privacy & Cloud Sync</h3>
          </div>

          <div className="space-y-4 max-w-xl">
            <div className="flex items-start gap-4 p-4 bg-blue-50/30 rounded-[16px] border border-blue-100">
              <ShieldCheck className="w-6 h-6 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-charcoal mb-1">Your Data is Secure</h4>
                <p className="text-medium text-sm leading-relaxed">
                  Tracking data (kicks, vitals, mood) is encrypted and synced to your private cloud profile. This allows you to access your journey from any device.
                </p>
              </div>
            </div>

            {/* AI Processing Consent Setting */}
            <div id="ai-consent-setting" className="p-4 bg-sage-pale/30 rounded-[16px] border border-sage/20">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-sage shrink-0" />
                    <h4 className="font-semibold text-charcoal text-sm">AI Features & Processing</h4>
                  </div>
                  <p className="text-medium text-xs sm:text-sm leading-relaxed">
                    Allow Bloom AI chat, the food safety scanner, and medical report analysis to process photos and health details using secure third-party AI models.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5" aria-label="Toggle AI processing consent">
                  <input
                    type="checkbox"
                    checked={isAiEnabled}
                    onChange={(e) => handleToggleAiConsent(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sage"></div>
                </label>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-[16px] border border-border">
              <h4 className="text-[12px] font-semibold tracking-wide uppercase text-light mb-2">Retention Policy</h4>
              <p className="text-medium text-sm leading-relaxed">
                Your pregnancy journey and health logs are safely preserved in your private cloud profile for as long as your account remains active. You can export a complete summary of your records as a PDF at any time, or permanently delete your account and erase all associated data whenever you wish using the Delete My Account option below.
              </p>
            </div>

            {/* Self-Service Account Deletion */}
            <div className="p-4 bg-red-50/40 rounded-[16px] border border-red-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-semibold text-red-950 mb-1 flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-red-600 shrink-0" />
                    Delete My Account
                  </h4>
                  <p className="text-red-800/80 text-sm leading-relaxed">
                    Permanently delete your account, journeys, tracking logs, and cloud backups. This cannot be undone.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setDeleteConfirmText('');
                    setDeleteError(null);
                    setShowDeleteModal(true);
                  }}
                  className="px-4 py-2 bg-white text-red-600 border border-red-300 hover:bg-red-50 hover:border-red-400 font-medium text-sm rounded-xl transition-colors cursor-pointer shrink-0 self-start sm:self-center"
                >
                  Delete My Account
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Legal Links */}
        <section className="bg-white rounded-[24px] p-6 shadow-sm border border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-sage-pale flex items-center justify-center text-sage">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-2xl text-charcoal">Legal & Support</h3>
          </div>
          
          <div className="space-y-3">
            <button onClick={() => setShowDisclaimer(true)} className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-[16px] border border-border hover:bg-sage-pale/50 transition-colors cursor-pointer group text-left">
              <span className="font-medium text-charcoal group-hover:text-sage">Medical Disclaimer</span>
              <span className="text-sage">→</span>
            </button>
            <a href="/privacy" onClick={(e) => { e.preventDefault(); navigate('/privacy'); }} className="flex items-center justify-between p-4 bg-gray-50 rounded-[16px] border border-border hover:bg-sage-pale/50 transition-colors cursor-pointer group">
              <span className="font-medium text-charcoal group-hover:text-sage">Privacy Policy</span>
              <span className="text-sage">→</span>
            </a>
            <a href="/terms" onClick={(e) => { e.preventDefault(); navigate('/terms'); }} className="flex items-center justify-between p-4 bg-gray-50 rounded-[16px] border border-border hover:bg-sage-pale/50 transition-colors cursor-pointer group">
              <span className="font-medium text-charcoal group-hover:text-sage">Terms of Service</span>
              <span className="text-sage">→</span>
            </a>
            <a href="mailto:grievance@ourpregnancy.in" onClick={(e) => handleEmailClick("grievance@ourpregnancy.in", e)} className="flex items-center justify-between p-4 bg-gray-50 rounded-[16px] border border-border hover:bg-sage-pale/50 transition-colors cursor-pointer group">
              <span className="font-medium text-charcoal group-hover:text-sage">Contact Support / Grievance Officer</span>
              <span className="text-sage">→</span>
            </a>
          </div>
        </section>

      </div>

      {showDisclaimer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] p-8 max-w-[480px] w-full shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="w-12 h-12 bg-sage-pale rounded-full flex items-center justify-center mb-5 mx-auto">
              <span className="text-sage text-2xl">⚕️</span>
            </div>
            <h3 className="font-serif text-[24px] text-charcoal font-medium text-center mb-3">Important Disclaimer</h3>
            <p className="text-[15px] text-medium leading-relaxed text-center mb-6">
              Our Pregnancy is an informational tool only. <strong className="font-semibold text-charcoal">It is not a substitute for professional medical advice, diagnosis, or treatment.</strong> Always consult your doctor or midwife for any health concerns or before making medical decisions.
            </p>
            <button
              onClick={() => setShowDisclaimer(false)}
              className="w-full p-4 bg-sage text-white rounded-[12px] font-semibold hover:bg-sage-dark transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] max-w-[480px] w-full p-6 sm:p-8 shadow-2xl border border-red-100 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-charcoal">Delete Account Permanently?</h3>
                <p className="text-xs text-red-600 font-medium">This action cannot be undone.</p>
              </div>
            </div>

            <div className="text-sm text-medium space-y-2 bg-red-50/50 p-4 rounded-xl border border-red-100">
              <p className="font-medium text-charcoal text-xs sm:text-sm">The following will be permanently erased from our servers:</p>
              <ul className="list-disc list-inside space-y-1 text-xs text-red-900">
                <li>Your profile and login credentials</li>
                <li>All pregnancy journeys and due date calculations</li>
                <li>All kick counts, contraction logs, and vitals</li>
                <li>All symptom, mood, hydration, and supplement records</li>
                <li>All local device logs and synced cloud storage</li>
              </ul>
            </div>

            {deleteError && (
              <div className="p-3 bg-red-100 text-red-800 text-xs rounded-xl font-medium border border-red-200">
                {deleteError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1.5">
                Type <span className="text-red-600 font-bold">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                disabled={isDeleting}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:border-red-500 focus:outline-hidden text-sm font-medium tracking-wider"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (!isDeleting) {
                    setShowDeleteModal(false);
                    setDeleteConfirmText('');
                    setDeleteError(null);
                  }
                }}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl border border-border text-charcoal text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold shadow-xs disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Permanently Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-[100] bg-charcoal text-white px-5 py-3 rounded-[12px] shadow-lg flex items-center gap-2 text-sm font-semibold animate-in slide-in-from-bottom-5 duration-300 border border-light/20">
          <span>📋</span> {toastMessage}
        </div>
      )}
    </div>
  );
};
