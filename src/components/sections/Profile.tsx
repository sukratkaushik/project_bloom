import React, { useState, useEffect } from 'react';
import { usePlanner } from '../../store';
import { auth, db, doc, setDoc, serverTimestamp, deleteMyOwnAccountCallable, signInWithGoogle } from '../../firebase';
import { signOut } from 'firebase/auth';
import { db as dexieDb } from '../../db';
import { 
  User, Settings, FileText, Weight, Calendar, Cloud, ShieldCheck, 
  Trash2, AlertTriangle, Loader2, Sparkles, Fingerprint, 
  ChevronRight, Check, Lock, Stethoscope, BookOpen, Briefcase, HelpCircle,
  Pencil, Plus, MapPin, Phone, ArrowRight, Map, Heart, Users, MessageCircle
} from 'lucide-react';
import { navigate } from '../../utils/navigation';
import { triggerHaptic } from '../../utils/nativeBridge';
import { ComplianceConsentModal } from '../ComplianceConsentModal';
import { DoctorModal } from '../mobile/DoctorModal';
import { PartnerModal } from '../mobile/PartnerModal';
import { 
  isBiometricLockEnabled, 
  setBiometricLockEnabled, 
  checkBiometricSupport, 
  authenticateWithBiometrics, 
  BiometricStatus 
} from '../../utils/biometricService';

interface ProfileProps {
  isMobileModal?: boolean;
}

export const Profile: React.FC<ProfileProps> = ({ isMobileModal = false }) => {
  const { state, updateState, restoreJourney } = usePlanner();
  
  const [userName, setUserName] = useState(state.userName || '');
  const [isNameSaved, setIsNameSaved] = useState(false);
  const [isSigningInGoogle, setIsSigningInGoogle] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showComplianceModal, setShowComplianceModal] = useState(false);
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
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
      // 1. Invoke server-side account deletion (Cloud Firestore, Storage, Auth)
      await deleteMyOwnAccountCallable();

      // 2. Complete Local Erasure under DPDP Act 2023 Sec 12
      try {
        await Promise.all(dexieDb.tables.map(table => table.clear()));
        await dexieDb.delete();
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

      // 5. Redirect cleanly to root
      window.location.href = '/';
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
    if (!userName.trim()) return;
    updateState({ userName: userName.trim() });
    triggerHaptic('success');
    setIsNameSaved(true);
    setToastMessage('Name updated successfully');
    setTimeout(() => {
      setIsNameSaved(false);
      setToastMessage(null);
    }, 2500);
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

  const [isBiometricEnabled, setIsBiometricEnabled] = useState(isBiometricLockEnabled());
  const [biometricInfo, setBiometricInfo] = useState<BiometricStatus | null>(null);

  useEffect(() => {
    checkBiometricSupport().then(setBiometricInfo);
  }, []);

  const handleToggleBiometric = async (enable: boolean) => {
    if (enable) {
      const res = await authenticateWithBiometrics('Verify your identity to enable Biometric Privacy Shield');
      if (res.success) {
        setBiometricLockEnabled(true);
        setIsBiometricEnabled(true);
        setToastMessage('Biometric Privacy Shield enabled');
        setTimeout(() => setToastMessage(null), 3000);
      } else {
        setToastMessage('Biometric verification cancelled');
        setTimeout(() => setToastMessage(null), 3000);
      }
    } else {
      const res = await authenticateWithBiometrics('Verify your identity to disable Biometric Privacy Shield');
      if (res.success) {
        setBiometricLockEnabled(false);
        setIsBiometricEnabled(false);
        setToastMessage('Biometric Privacy Shield turned off');
        setTimeout(() => setToastMessage(null), 3000);
      } else {
        setToastMessage('Biometric verification cancelled');
        setTimeout(() => setToastMessage(null), 3000);
      }
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {!isMobileModal && (
        <div className="mb-6 sm:mb-8">
          <h2 className="font-serif text-2xl sm:text-3xl text-charcoal mb-2">Settings & Profile</h2>
          <p className="text-medium text-sm sm:text-base w-full max-w-2xl leading-relaxed">
            Manage your account information and app preferences. These settings are synced across your devices.
          </p>
        </div>
      )}

      <div className="space-y-4 sm:space-y-6">
        {/* Profile Info */}
        <section className="bg-white rounded-2xl sm:rounded-[24px] p-4 sm:p-6 shadow-2xs border border-border/80">
          <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-sage-pale flex items-center justify-center text-sage shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl sm:text-2xl text-charcoal leading-tight">Your Profile</h3>
              <p className="text-medium text-xs sm:text-sm mt-0.5">Manage identity and maternal membership</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] sm:text-[12px] font-bold tracking-wider uppercase text-charcoal/70 mb-1.5">
                Email Address
              </label>
              <div className="p-3 bg-cream/40 border border-border/80 rounded-xl text-[13px] text-charcoal/80 font-medium truncate flex items-center justify-between">
                <span>{auth.currentUser?.email || 'Not signed in (Guest Mode)'}</span>
                {auth.currentUser && (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Check size={11} /> Synced
                  </span>
                )}
              </div>
              <p className="text-[11px] text-medium mt-1">Your email is managed securely via Google Sign-In.</p>
            </div>

            {!auth.currentUser && (
              <div className="p-4 sm:p-5 bg-gradient-to-r from-sage-pale/60 to-cream/60 border border-sage/40 rounded-2xl space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white shadow-xs flex items-center justify-center shrink-0">
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-charcoal text-[14px]">Connect Google Account</h4>
                    <p className="text-[12px] text-medium">Sync your data between the website and Android app</p>
                  </div>
                </div>
                <p className="text-[12px] text-charcoal/80 leading-relaxed">
                  You are currently using guest mode. Sign in with Google to backup your kick counts, vitals, medical reports, and pregnancy journey securely.
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      setIsSigningInGoogle(true);
                      const googleUser = await signInWithGoogle();
                      if (googleUser) {
                        const restored = await restoreJourney(googleUser.uid);
                        if (!restored && state.isSetup) {
                          const { saveJourney } = await import('../../cloudSync');
                          await saveJourney(googleUser.uid, state);
                        }
                        setToastMessage("Signed in with Google! Your data is synced.");
                        setTimeout(() => setToastMessage(null), 3500);
                      }
                    } catch (err: any) {
                      console.error("Profile Google Sign-In error:", err);
                      alert(`Google Sign-In: ${err?.message || 'Please try again.'}`);
                    } finally {
                      setIsSigningInGoogle(false);
                    }
                  }}
                  disabled={isSigningInGoogle}
                  className="w-full sm:w-auto px-5 py-2.5 bg-sage text-white rounded-xl font-bold text-[13px] hover:bg-sage-dark transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
                >
                  {isSigningInGoogle ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-4 h-4 brightness-200" />
                  )}
                  <span>Sign in with Google to Sync</span>
                </button>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] sm:text-[12px] font-bold tracking-wider uppercase text-charcoal/70">
                  Preferred Name
                </label>
                {isNameSaved && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Check size={11} /> Saved
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => {
                    setUserName(e.target.value);
                    if (isNameSaved) setIsNameSaved(false);
                  }}
                  placeholder="e.g., Ananya"
                  className="min-w-0 flex-1 px-3.5 py-2.5 bg-cream/40 border border-border/80 rounded-xl text-[13.5px] font-medium text-charcoal focus:outline-none focus:border-sage focus:ring-2 focus:ring-sage/20 transition-all placeholder:text-light"
                />
                <button 
                  type="button"
                  onClick={handleNameSave}
                  className={`shrink-0 h-10 px-4 text-white font-bold text-[13px] rounded-xl transition-all shadow-2xs cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 ${
                    isNameSaved
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-sage hover:bg-sage-dark'
                  }`}
                >
                  <Check size={14} className="shrink-0" />
                  <span>{isNameSaved ? 'Saved' : 'Save'}</span>
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-border/70 space-y-2">
              <label className="block text-[11px] sm:text-[12px] font-bold tracking-wider uppercase text-charcoal/70">
                Membership Plan
              </label>
              
              <div className="p-3.5 sm:p-4 bg-cream/40 border border-border/80 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    {state.isAdmin || auth.currentUser?.email === 'sukrat.kaushik@gmail.com' ? (
                      <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-bold rounded-full text-[11px] sm:text-[12px] uppercase tracking-wider border border-purple-300">
                        👑 Admin / App Owner (Lifetime Access)
                      </span>
                    ) : state.planTier === 'premium' || state.isPremium ? (
                      <span className="px-2.5 py-1 bg-gold-pale text-gold-dark font-bold rounded-full text-[11px] sm:text-[12px] uppercase tracking-wider border border-gold/30">
                        👑 AI Premium Active
                      </span>
                    ) : state.planTier === 'standard' ? (
                      <span className="px-2.5 py-1 bg-sage-pale text-sage-dark font-bold rounded-full text-[11px] sm:text-[12px] uppercase tracking-wider border border-sage/30">
                        🩺 Standard Maternal Care Active
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-gray-200 text-charcoal font-semibold rounded-full text-[11px] sm:text-[12px]">
                        Free Starter Plan
                      </span>
                    )}
                  </div>

                  {!(state.isAdmin || auth.currentUser?.email === 'sukrat.kaushik@gmail.com') && (
                    <button
                      type="button"
                      onClick={() => { navigate('/checkout?plan=premium'); }}
                      className="text-[12px] sm:text-[12.5px] font-bold text-sage-dark hover:underline cursor-pointer"
                    >
                      {state.planTier === 'premium' ? 'Manage Plan →' : 'Upgrade to Premium →'}
                    </button>
                  )}
                </div>

                <p className="text-[11.5px] sm:text-[12.5px] text-medium leading-relaxed">
                  {state.isAdmin || auth.currentUser?.email === 'sukrat.kaushik@gmail.com'
                    ? 'You have perpetual lifetime access to all 24/7 Bloom AI tools, clinical checklists, food safety scanner, and admin controls.'
                    : state.planTier === 'premium' || state.isPremium
                    ? 'All features unlocked: 24/7 Bloom AI prenatal assistant, smart food safety scanner, EHR medical exports, and partner sync.'
                    : state.planTier === 'standard'
                    ? 'Maternal care features unlocked: Government schemes, postpartum recovery guide, and partner sync.'
                    : 'Free starter tier with core milestone checklists. Upgrade anytime for 24/7 AI prenatal guidance and smart scanner.'}
                </p>

                {state.planExpiry && !state.isAdmin && auth.currentUser?.email !== 'sukrat.kaushik@gmail.com' && (
                  <div className="text-[11px] text-light pt-1 border-t border-border/50">
                    Expires on: <strong>{new Date(state.planExpiry).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: '2-digit' })}</strong>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* OPIN User Journey & Architecture Guide */}
        <section className="bg-gradient-to-br from-[#F4EBE1]/70 via-cream to-white rounded-2xl sm:rounded-[24px] p-5 sm:p-6 shadow-xs border border-sage/30 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-sage-pale text-sage-dark text-[11px] font-bold uppercase tracking-wider">
                <span>🌸</span>
                <span>User Journey & Architecture</span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-charcoal leading-tight">
                How Our Pregnancy Works
              </h3>
              <p className="text-[13px] sm:text-[13.5px] text-medium leading-relaxed">
                Step-by-step interactive roadmap: Calibrating your gestational timeline, linking your doctor, securing clinical records in the local vault, and 1-click OB-GYN consultations.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                navigate('/dashboard/guide');
              }}
              className="self-start sm:self-center shrink-0 px-5 py-2.5 bg-sage hover:bg-sage-dark text-white font-bold text-[13px] rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span>Explore User Flow</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </section>

        {/* Primary Obstetrician & Care Team */}
        <section className="bg-white rounded-2xl sm:rounded-[24px] p-4 sm:p-6 shadow-2xs border border-border/80">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-sage-pale flex items-center justify-center text-sage shrink-0">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-xl sm:text-2xl text-charcoal leading-tight">Primary Obstetrician</h3>
                <p className="text-medium text-xs sm:text-sm mt-0.5">Manage your OB-GYN, hospital, and emergency OPD line</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setIsDoctorModalOpen(true);
              }}
              className="text-[12px] sm:text-[13px] font-bold text-sage-dark hover:underline cursor-pointer flex items-center gap-1 shrink-0"
            >
              {state.doctor?.name ? (
                <>
                  <Pencil size={13} />
                  <span>Edit</span>
                </>
              ) : (
                <>
                  <Plus size={14} />
                  <span>Add Doctor</span>
                </>
              )}
            </button>
          </div>

          {state.doctor?.name ? (
            <div className="p-3.5 sm:p-4 bg-cream/40 border border-border/80 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-charcoal text-[15px]">{state.doctor.name}</span>
                <span className="text-[10px] font-bold text-sage-dark bg-sage-pale px-2 py-0.5 rounded-full">Active</span>
              </div>
              {state.doctor.hospital && (
                <p className="text-[12.5px] text-medium flex items-center gap-1.5">
                  <MapPin size={13} className="text-sage shrink-0" />
                  <span>{state.doctor.hospital}</span>
                </p>
              )}
              {state.doctor.phone && (
                <p className="text-[12px] text-charcoal/80 flex items-center gap-1.5 font-mono">
                  <Phone size={12} className="text-sage shrink-0" />
                  <span>{state.doctor.phone}</span>
                </p>
              )}
              {state.doctor.notes && (
                <p className="text-[11.5px] text-medium pt-1 border-t border-border/50">
                  {state.doctor.notes}
                </p>
              )}
            </div>
          ) : (
            <div className="p-4 bg-cream/30 border border-dashed border-border/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="font-medium text-[13px] text-charcoal">No doctor assigned yet</p>
                <p className="text-[11.5px] text-medium mt-0.5">
                  Add your doctor or midwife to enable quick calling and personalized visit checklists.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setIsDoctorModalOpen(true);
                }}
                className="px-3.5 py-1.5 bg-sage hover:bg-sage-dark text-white font-bold text-[12px] rounded-xl shadow-2xs transition-all cursor-pointer whitespace-nowrap active:scale-95"
              >
                + Add Obstetrician
              </button>
            </div>
          )}
        </section>

        {/* Partner & Support Person */}
        <section className="bg-white rounded-2xl sm:rounded-[24px] p-4 sm:p-6 shadow-2xs border border-border/80">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blush-pale flex items-center justify-center text-blush shrink-0">
                <Heart className="w-5 h-5 fill-blush/30" />
              </div>
              <div className="min-w-0">
                <h3 className="font-serif text-xl sm:text-2xl text-charcoal leading-tight truncate">Partner & Support Person</h3>
                <p className="text-medium text-xs sm:text-sm mt-0.5 truncate">Define your partner to assign tasks, share updates & sync</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setIsPartnerModalOpen(true);
              }}
              className="text-[12px] sm:text-[13px] font-bold text-sage-dark hover:underline cursor-pointer flex items-center gap-1 shrink-0 ml-2"
            >
              {state.partner?.name ? (
                <>
                  <Pencil size={13} />
                  <span>Edit</span>
                </>
              ) : (
                <>
                  <Plus size={14} />
                  <span>Add Partner</span>
                </>
              )}
            </button>
          </div>

          {state.partner?.name ? (
            <div className="p-3.5 sm:p-4 bg-cream/40 border border-border/80 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-charcoal text-[15px]">{state.partner.name}</span>
                  <span className="text-[10px] font-bold text-sage-dark bg-sage-pale px-2 py-0.5 rounded-full">
                    {state.partner.relationship || 'Partner'}
                  </span>
                </div>
                {state.partner.phone && (
                  <div className="flex items-center gap-1.5">
                    <a
                      href={`https://wa.me/${state.partner.phone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(`Hi ${state.partner.name}! 🌸 Sharing an update from Our Pregnancy.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-[11.5px] rounded-lg border border-emerald-200 transition-colors flex items-center gap-1"
                      title="Open WhatsApp chat"
                    >
                      <MessageCircle size={13} />
                      <span>WhatsApp</span>
                    </a>
                    <a
                      href={`tel:${state.partner.phone.replace(/[^\d+]/g, '')}`}
                      className="px-2.5 py-1 bg-cream hover:bg-black/5 text-charcoal font-semibold text-[11.5px] rounded-lg border border-border/80 transition-colors flex items-center gap-1"
                      title="Call partner"
                    >
                      <Phone size={12} />
                      <span>Call</span>
                    </a>
                  </div>
                )}
              </div>

              {state.partner.phone && (
                <p className="text-[12px] text-charcoal/80 flex items-center gap-1.5 font-mono">
                  <Phone size={12} className="text-sage shrink-0" />
                  <span>{state.partner.phone}</span>
                </p>
              )}

              {state.partner.email && (
                <p className="text-[12px] text-medium flex items-center gap-1.5">
                  <span className="text-[11px] font-bold uppercase text-charcoal/60">Email:</span>
                  <span>{state.partner.email}</span>
                </p>
              )}

              {state.partner.notes && (
                <p className="text-[11.5px] text-medium pt-1 border-t border-border/50">
                  {state.partner.notes}
                </p>
              )}

              <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11.5px]">
                <span className="text-medium">Want milestones to appear inside their app?</span>
                <button
                  type="button"
                  onClick={() => navigate('partnersync')}
                  className="font-bold text-sage-dark hover:underline flex items-center gap-1"
                >
                  <span>Open Partner Sync</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-cream/30 border border-dashed border-border/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="font-medium text-[13px] text-charcoal">No partner or support person defined yet</p>
                <p className="text-[11.5px] text-medium mt-0.5">
                  Add their name and phone to assign tasks, share milestone updates via WhatsApp, and sync in real time.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setIsPartnerModalOpen(true);
                }}
                className="px-3.5 py-1.5 bg-blush hover:opacity-90 text-white font-bold text-[12px] rounded-xl shadow-2xs transition-all cursor-pointer whitespace-nowrap active:scale-95"
              >
                + Define Partner
              </button>
            </div>
          )}
        </section>

        {/* Preferences */}
        <section className="bg-white rounded-2xl sm:rounded-[24px] p-4 sm:p-6 shadow-2xs border border-border/80">
          <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-sage-pale flex items-center justify-center text-sage shrink-0">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl sm:text-2xl text-charcoal leading-tight">App Preferences</h3>
              <p className="text-medium text-xs sm:text-sm mt-0.5">Customize display units and calendar start day</p>
            </div>
          </div>

          <div className="space-y-3">
            {/* Weight Unit */}
            <div className="flex items-center justify-between gap-3 p-3.5 bg-cream/40 rounded-2xl border border-border/70">
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-charcoal text-[13.5px] sm:text-sm flex items-center gap-2">
                  <Weight className="w-4 h-4 text-sage shrink-0" />
                  <span>Unit of Measurement</span>
                </h4>
                <p className="text-medium text-[11.5px] sm:text-xs mt-0.5 leading-snug">
                  Weight tracking unit (Vitals)
                </p>
              </div>
              <div className="inline-flex p-1 bg-white border border-border/80 rounded-xl shrink-0 shadow-2xs">
                <button
                  type="button"
                  className={`w-11 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer text-center ${
                    state.weightUnit !== 'lbs'
                      ? 'bg-sage text-white shadow-3xs'
                      : 'text-medium hover:text-charcoal'
                  }`}
                  onClick={() => {
                    triggerHaptic('light');
                    updateState({ weightUnit: 'kg' });
                  }}
                >
                  kg
                </button>
                <button
                  type="button"
                  className={`w-11 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer text-center ${
                    state.weightUnit === 'lbs'
                      ? 'bg-sage text-white shadow-3xs'
                      : 'text-medium hover:text-charcoal'
                  }`}
                  onClick={() => {
                    triggerHaptic('light');
                    updateState({ weightUnit: 'lbs' });
                  }}
                >
                  lbs
                </button>
              </div>
            </div>

            {/* Calendar Start Day */}
            <div className="flex items-center justify-between gap-3 p-3.5 bg-cream/40 rounded-2xl border border-border/70">
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-charcoal text-[13.5px] sm:text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-sage shrink-0" />
                  <span>Calendar Start Day</span>
                </h4>
                <p className="text-medium text-[11.5px] sm:text-xs mt-0.5 leading-snug">
                  First day of the week
                </p>
              </div>
              <div className="inline-flex p-1 bg-white border border-border/80 rounded-xl shrink-0 shadow-2xs">
                <button
                  type="button"
                  className={`w-11 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer text-center ${
                    state.calendarStartDay !== 'sunday'
                      ? 'bg-sage text-white shadow-3xs'
                      : 'text-medium hover:text-charcoal'
                  }`}
                  onClick={() => {
                    triggerHaptic('light');
                    updateState({ calendarStartDay: 'monday' });
                  }}
                >
                  Mon
                </button>
                <button
                  type="button"
                  className={`w-11 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer text-center ${
                    state.calendarStartDay === 'sunday'
                      ? 'bg-sage text-white shadow-3xs'
                      : 'text-medium hover:text-charcoal'
                  }`}
                  onClick={() => {
                    triggerHaptic('light');
                    updateState({ calendarStartDay: 'sunday' });
                  }}
                >
                  Sun
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Cloud Sync & Privacy */}
        <section className="bg-white rounded-2xl sm:rounded-[24px] p-4 sm:p-6 shadow-2xs border border-border/80">
          <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl sm:text-2xl text-charcoal leading-tight">Data Privacy & Security</h3>
              <p className="text-medium text-xs sm:text-sm mt-0.5">Hardware encryption and private cloud sync</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3.5 bg-blue-50/40 rounded-2xl border border-blue-100">
              <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-charcoal text-[13.5px] sm:text-sm mb-0.5">Your Data is Secure & Encrypted</h4>
                <p className="text-medium text-[11.5px] sm:text-xs leading-relaxed">
                  Tracking data (kicks, vitals, mood) is encrypted and synced to your private cloud profile. This allows you to access your journey from any device.
                </p>
              </div>
            </div>

            {/* AI Processing Consent Setting */}
            <div id="ai-consent-setting" className="p-3.5 bg-cream/40 rounded-2xl border border-border/70">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-sage-pale text-sage-dark flex items-center justify-center shrink-0 border border-sage/20">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h4 className="font-semibold text-charcoal text-[13.5px] sm:text-sm truncate">
                    AI Features & Processing
                  </h4>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0" aria-label="Toggle AI processing consent">
                  <input
                    type="checkbox"
                    checked={isAiEnabled}
                    onChange={(e) => handleToggleAiConsent(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sage"></div>
                </label>
              </div>
              <p className="text-medium text-[11.5px] sm:text-xs mt-2 leading-relaxed">
                Allow Bloom AI chat, food safety scanner, and medical report analysis to process photos and health details using secure third-party AI models.
              </p>
            </div>

            {/* Biometric Maternal Privacy Shield */}
            <div id="biometric-lock-setting" className="p-3.5 bg-sage-pale/40 rounded-2xl border border-sage/30">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-sage text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <Fingerprint className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-semibold text-charcoal text-[13.5px] sm:text-sm truncate">
                        Biometric App Lock
                      </h4>
                      {biometricInfo?.isSupported && (
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-white/90 border border-sage/30 text-sage-dark px-1.5 py-0.2 rounded-full whitespace-nowrap">
                          {biometricInfo.label}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0" aria-label="Toggle Biometric Lock">
                  <input
                    type="checkbox"
                    checked={isBiometricEnabled}
                    onChange={(e) => handleToggleBiometric(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sage"></div>
                </label>
              </div>
              <p className="text-medium text-[11.5px] sm:text-xs mt-2 leading-relaxed">
                Lock maternal vitals and medical logs behind hardware-backed {biometricInfo?.label || 'Fingerprint'}. Requires authentication on launch and after 1 minute of inactivity.
              </p>
            </div>

            <div className="p-3.5 bg-cream/30 rounded-2xl border border-border/70">
              <h4 className="text-[11px] font-bold tracking-wider uppercase text-charcoal/70 mb-1">Retention Policy</h4>
              <p className="text-medium text-[11.5px] sm:text-xs leading-relaxed">
                Your pregnancy journey and health logs are safely preserved in your private cloud profile for as long as your account remains active. You can export a complete summary of your records as a PDF at any time, or permanently delete your account and erase all associated data whenever you wish using the Delete My Account option below.
              </p>
            </div>

            {/* Self-Service Account Deletion */}
            <div className="p-3.5 bg-red-50/40 rounded-2xl border border-red-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-semibold text-red-950 text-[13.5px] sm:text-sm mb-0.5 flex items-center gap-1.5">
                    <Trash2 className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Delete My Account</span>
                  </h4>
                  <p className="text-red-800/80 text-[11.5px] sm:text-xs leading-relaxed">
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
                  className="px-3.5 py-1.5 bg-white text-red-600 border border-red-300 hover:bg-red-50 font-bold text-xs rounded-xl transition-all cursor-pointer shrink-0 self-start sm:self-center shadow-3xs"
                >
                  Delete My Account
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Legal Links — High-End Inset Grouped List Pattern */}
        <section className="bg-white rounded-2xl sm:rounded-[24px] p-4 sm:p-6 shadow-2xs border border-border/80">
          <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-sage-pale flex items-center justify-center text-sage shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl sm:text-2xl text-charcoal leading-tight">Legal & Support</h3>
              <p className="text-medium text-xs sm:text-sm mt-0.5">Clinical disclosures, compliance standards, and assistance</p>
            </div>
          </div>
          
          <div className="bg-cream/20 border border-border/80 rounded-2xl overflow-hidden divide-y divide-border/60 shadow-3xs">
            {/* 1. DPDP Data Rights */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setShowComplianceModal(true);
              }}
              className="w-full flex items-center justify-between p-3.5 hover:bg-sage-pale/30 active:bg-sage-pale/50 transition-colors cursor-pointer group text-left"
            >
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <div className="w-7 h-7 rounded-lg bg-terracotta/10 text-terracotta flex items-center justify-center shrink-0">
                  <ShieldCheck size={16} />
                </div>
                <span className="font-medium text-charcoal text-[13px] sm:text-sm group-hover:text-terracotta transition-colors truncate">
                  DPDP Data Rights & Consent (Bilingual)
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-terracotta font-bold text-[10px] bg-terracotta/10 px-2 py-0.5 rounded-full border border-terracotta/20">
                  Review
                </span>
                <ChevronRight size={15} className="text-light group-hover:text-charcoal transition-colors" />
              </div>
            </button>

            {/* 2. Medical Disclaimer */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setShowDisclaimer(true);
              }}
              className="w-full flex items-center justify-between p-3.5 hover:bg-sage-pale/30 active:bg-sage-pale/50 transition-colors cursor-pointer group text-left"
            >
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <div className="w-7 h-7 rounded-lg bg-sage-pale text-sage-dark flex items-center justify-center shrink-0">
                  <Stethoscope size={15} />
                </div>
                <span className="font-medium text-charcoal text-[13px] sm:text-sm group-hover:text-sage-dark transition-colors truncate">
                  Medical Disclaimer & Clinical Scope
                </span>
              </div>
              <ChevronRight size={15} className="text-light group-hover:text-charcoal transition-colors shrink-0" />
            </button>

            {/* 3. Privacy Policy */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                navigate('/privacy');
              }}
              className="w-full flex items-center justify-between p-3.5 hover:bg-sage-pale/30 active:bg-sage-pale/50 transition-colors cursor-pointer group text-left"
            >
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <div className="w-7 h-7 rounded-lg bg-sage-pale text-sage-dark flex items-center justify-center shrink-0">
                  <Lock size={15} />
                </div>
                <span className="font-medium text-charcoal text-[13px] sm:text-sm group-hover:text-sage-dark transition-colors truncate">
                  Privacy Policy & Data Security
                </span>
              </div>
              <ChevronRight size={15} className="text-light group-hover:text-charcoal transition-colors shrink-0" />
            </button>

            {/* 4. Terms of Service */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                navigate('/terms');
              }}
              className="w-full flex items-center justify-between p-3.5 hover:bg-sage-pale/30 active:bg-sage-pale/50 transition-colors cursor-pointer group text-left"
            >
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <div className="w-7 h-7 rounded-lg bg-sage-pale text-sage-dark flex items-center justify-center shrink-0">
                  <FileText size={15} />
                </div>
                <span className="font-medium text-charcoal text-[13px] sm:text-sm group-hover:text-sage-dark transition-colors truncate">
                  Terms of Service & EULA
                </span>
              </div>
              <ChevronRight size={15} className="text-light group-hover:text-charcoal transition-colors shrink-0" />
            </button>

            {/* 5. Blogs & Guides */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                navigate('/blogs');
              }}
              className="w-full flex items-center justify-between p-3.5 hover:bg-sage-pale/30 active:bg-sage-pale/50 transition-colors cursor-pointer group text-left"
            >
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <div className="w-7 h-7 rounded-lg bg-sage-pale text-sage-dark flex items-center justify-center shrink-0">
                  <BookOpen size={15} />
                </div>
                <span className="font-medium text-charcoal text-[13px] sm:text-sm group-hover:text-sage-dark transition-colors truncate">
                  Pregnancy Blogs & Evidence Guides
                </span>
              </div>
              <ChevronRight size={15} className="text-light group-hover:text-charcoal transition-colors shrink-0" />
            </button>

            {/* 6. Careers */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                navigate('/careers');
              }}
              className="w-full flex items-center justify-between p-3.5 hover:bg-sage-pale/30 active:bg-sage-pale/50 transition-colors cursor-pointer group text-left"
            >
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <div className="w-7 h-7 rounded-lg bg-sage-pale text-sage-dark flex items-center justify-center shrink-0">
                  <Briefcase size={15} />
                </div>
                <span className="font-medium text-charcoal text-[13px] sm:text-sm group-hover:text-sage-dark transition-colors truncate">
                  Careers at Our Pregnancy
                </span>
              </div>
              <ChevronRight size={15} className="text-light group-hover:text-charcoal transition-colors shrink-0" />
            </button>

            {/* 7. Contact Support */}
            <button
              type="button"
              onClick={(e) => handleEmailClick("grievance@ourpregnancy.in", e)}
              className="w-full flex items-center justify-between p-3.5 hover:bg-sage-pale/30 active:bg-sage-pale/50 transition-colors cursor-pointer group text-left"
            >
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <div className="w-7 h-7 rounded-lg bg-sage-pale text-sage-dark flex items-center justify-center shrink-0">
                  <HelpCircle size={15} />
                </div>
                <span className="font-medium text-charcoal text-[13px] sm:text-sm group-hover:text-sage-dark transition-colors truncate">
                  Contact Support & Grievance Officer
                </span>
              </div>
              <ChevronRight size={15} className="text-light group-hover:text-charcoal transition-colors shrink-0" />
            </button>
          </div>
        </section>

      </div>

      {showComplianceModal && (
        <ComplianceConsentModal
          forceOpen={true}
          onAccept={() => setShowComplianceModal(false)}
        />
      )}

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

      {/* Primary Obstetrician Modal */}
      <DoctorModal
        isOpen={isDoctorModalOpen}
        onClose={() => setIsDoctorModalOpen(false)}
        initialDoctor={state.doctor}
        onSave={(doctorData) => {
          updateState({ doctor: doctorData });
        }}
        onRemove={() => {
          updateState({ doctor: null });
        }}
        onShowToast={(msg) => {
          setToastMessage(msg);
          setTimeout(() => setToastMessage(null), 3000);
        }}
      />

      {/* Partner & Support Person Modal */}
      <PartnerModal
        isOpen={isPartnerModalOpen}
        onClose={() => setIsPartnerModalOpen(false)}
        initialPartner={state.partner}
        onSave={(partnerData) => {
          updateState({
            partner: partnerData,
            birthPlan: {
              ...state.birthPlan,
              personalDetails: {
                ...state.birthPlan?.personalDetails,
                partnerName: partnerData.name
              }
            }
          });
        }}
        onRemove={() => {
          updateState({ partner: null });
        }}
        onShowToast={(msg) => {
          setToastMessage(msg);
          setTimeout(() => setToastMessage(null), 3000);
        }}
      />

      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-[100] bg-charcoal text-white px-5 py-3 rounded-[12px] shadow-lg flex items-center gap-2 text-sm font-semibold animate-in slide-in-from-bottom-5 duration-300 border border-light/20">
          <span>📋</span> {toastMessage}
        </div>
      )}
    </div>
  );
};
