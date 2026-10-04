import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, Lock, HeartPulse, Languages, ExternalLink, Check } from 'lucide-react';
import { navigate } from '../utils/navigation';

export const DPDP_CONSENT_KEY = 'bloom_dpdp_consent_v1';

interface ComplianceConsentModalProps {
  onAccept?: () => void;
  forceOpen?: boolean;
}

export const ComplianceConsentModal: React.FC<ComplianceConsentModalProps> = ({
  onAccept,
  forceOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    if (forceOpen) return true;
    try {
      return !localStorage.getItem(DPDP_CONSENT_KEY);
    } catch {
      return true;
    }
  });

  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const [acceptedDisclaimer, setAcceptedDisclaimer] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

  if (!isOpen) return null;

  const handleAgreeAndContinue = () => {
    try {
      localStorage.setItem(
        DPDP_CONSENT_KEY,
        JSON.stringify({
          accepted: true,
          timestamp: new Date().toISOString(),
          version: '1.0',
          locale: lang,
        })
      );
    } catch (e) {
      console.warn('Could not persist consent in localStorage:', e);
    }
    setIsOpen(false);
    if (onAccept) onAccept();
  };

  const handleQuickAcceptAll = () => {
    setAcceptedDisclaimer(true);
    setAcceptedPrivacy(true);
    try {
      localStorage.setItem(
        DPDP_CONSENT_KEY,
        JSON.stringify({
          accepted: true,
          timestamp: new Date().toISOString(),
          version: '1.0',
          locale: lang,
        })
      );
    } catch (e) {
      console.warn('Could not persist consent in localStorage:', e);
    }
    setIsOpen(false);
    if (onAccept) onAccept();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-charcoal/70 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[28px] max-w-lg w-full max-h-[90dvh] flex flex-col shadow-2xl border border-border overflow-hidden">
        
        {/* Header with Language Switcher */}
        <div className="bg-gradient-to-r from-sage-pale/80 via-cream to-cream p-5 sm:p-6 border-b border-border/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sage-dark/10 flex items-center justify-center text-sage-dark">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-charcoal leading-tight">
                {lang === 'en' ? 'Maternal Care & Data Consent' : 'मातृत्व सुरक्षा एवं डेटा सहमति'}
              </h2>
              <p className="text-[12px] text-charcoal/60 font-medium">
                {lang === 'en' ? 'Compliance with DPDP Act 2023 & CDSCO' : 'DPDP अधिनियम 2023 और CDSCO दिशानिर्देश'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setLang(l => (l === 'en' ? 'hi' : 'en'))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-border text-xs font-semibold text-charcoal shadow-sm active:scale-95 transition-all hover:bg-cream cursor-pointer"
            title="Switch language / भाषा बदलें"
          >
            <Languages className="w-3.5 h-3.5 text-sage-dark" />
            <span>{lang === 'en' ? 'हिन्दी' : 'English'}</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-charcoal/80 leading-relaxed">
          
          {/* Section 1: CDSCO Non-Medical Device Disclaimer */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-amber-900 text-xs sm:text-sm">
                {lang === 'en' ? 'Medical Disclaimer (Non-Diagnostic Software)' : 'चिकित्सीय अस्वीकरण (गैर-नैदानिक सॉफ़्टवेयर)'}
              </h4>
              <p className="text-[11px] sm:text-xs text-amber-800/90 leading-normal">
                {lang === 'en'
                  ? 'Our Pregnancy is an educational wellness companion designed for information and healthy lifestyle tracking. It does NOT provide medical diagnosis, clinical treatment, or prescriptions. Always seek the advice of your obstetrician, gynecologist (OB-GYN), or qualified healthcare professional.'
                  : 'अवर प्रेग्नेंसी एक मातृत्व कल्याण और शैक्षिक ऐप है। यह किसी भी प्रकार का चिकित्सीय निदान, उपचार या डॉक्टरी नुस्खा प्रदान नहीं करता है। चिकित्सीय निर्णयों के लिए हमेशा अपने स्त्री रोग विशेषज्ञ (Gynecologist) से सलाह लें।'}
              </p>
            </div>
          </div>

          {/* Section 2: DPDP Act 2023 & Privacy Commitment */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-start gap-3">
            <Lock className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-emerald-900 text-xs sm:text-sm">
                {lang === 'en' ? 'Your Rights Under DPDP Act 2023' : 'DPDP अधिनियम 2023 के तहत आपके अधिकार'}
              </h4>
              <p className="text-[11px] sm:text-xs text-emerald-800/90 leading-normal">
                {lang === 'en'
                  ? 'Your pregnancy vitals and health records are processed strictly for personal tracking. Your data is encrypted and never sold or shared with third-party advertisers. Under Section 12, you have full rights to withdraw consent and permanently erase your data anytime from Profile settings.'
                  : 'आपका स्वास्थ्य डेटा केवल आपकी व्यक्तिगत ट्रैकिंग के लिए उपयोग किया जाता है। आपका डेटा सुरक्षित और एन्क्रिप्टेड है और किसी भी विज्ञापनदाता को बेचा नहीं जाता है। धारा 12 के तहत, आप जब चाहें अपनी प्रोफ़ाइल से अपना डेटा पूरी तरह मिटा सकते हैं।'}
              </p>
            </div>
          </div>

          {/* Section 3: Emergency Protocol (108) */}
          <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200/80 flex items-start gap-3">
            <HeartPulse className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-rose-900 text-xs sm:text-sm">
                {lang === 'en' ? 'Emergency Protocol: Call 108' : 'आपातकालीन सहायता: 108 पर कॉल करें'}
              </h4>
              <p className="text-[11px] sm:text-xs text-rose-800/90 leading-normal">
                {lang === 'en'
                  ? 'If experiencing severe symptoms (abnormal bleeding, acute abdominal pain, lack of fetal movements), do not wait for app data. Contact your hospital or call 108 immediately.'
                  : 'यदि आपको गंभीर लक्षण (अधिक रक्तस्राव, तेज पेट दर्द, शिशु की हलचल में कमी) महसूस हो, तो ऐप की प्रतीक्षा न करें। तुरंत अपने डॉक्टर से संपर्क करें या 108 डायल करें।'}
              </p>
            </div>
          </div>

          {/* Interactive Checkbox 1 */}
          <label className="flex items-start gap-3 p-3 rounded-xl hover:bg-cream/60 cursor-pointer border border-transparent hover:border-border/40 transition-colors">
            <input
              type="checkbox"
              checked={acceptedDisclaimer}
              onChange={(e) => setAcceptedDisclaimer(e.target.checked)}
              className="mt-1 w-4 h-4 text-sage-dark accent-[#3F5E4D] rounded border-border focus:ring-sage-dark cursor-pointer"
            />
            <span className="text-xs text-charcoal select-none">
              {lang === 'en'
                ? 'I acknowledge that this app is for educational and wellness tracking only, and not a substitute for professional medical care.'
                : 'मैं स्वीकार करती हूँ कि यह ऐप केवल शैक्षिक और कल्याण ट्रैकिंग के लिए है, न कि चिकित्सीय उपचार का विकल्प।'}
            </span>
          </label>

          {/* Interactive Checkbox 2 */}
          <label className="flex items-start gap-3 p-3 rounded-xl hover:bg-cream/60 cursor-pointer border border-transparent hover:border-border/40 transition-colors">
            <input
              type="checkbox"
              checked={acceptedPrivacy}
              onChange={(e) => setAcceptedPrivacy(e.target.checked)}
              className="mt-1 w-4 h-4 text-sage-dark accent-[#3F5E4D] rounded border-border focus:ring-sage-dark cursor-pointer"
            />
            <span className="text-xs text-charcoal select-none">
              {lang === 'en'
                ? 'I consent to the processing of my maternal vitals in compliance with the Digital Personal Data Protection (DPDP) Act 2023.'
                : 'मैं डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम 2023 के तहत अपने स्वास्थ्य डेटा के सुरक्षित उपयोग की सहमति देती हूँ।'}
            </span>
          </label>

          {/* Legal Links */}
          <div className="flex items-center justify-center gap-4 pt-1 text-xs text-charcoal/60">
            <button
              type="button"
              onClick={() => navigate('/privacy')}
              className="hover:text-sage-dark underline flex items-center gap-1 cursor-pointer"
            >
              <span>{lang === 'en' ? 'Privacy Policy' : 'गोपनीयता नीति'}</span>
              <ExternalLink className="w-3 h-3" />
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => navigate('/terms')}
              className="hover:text-sage-dark underline flex items-center gap-1 cursor-pointer"
            >
              <span>{lang === 'en' ? 'Terms of Service' : 'नियम और शर्तें'}</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-cream/70 border-t border-border/80 flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            disabled={!acceptedDisclaimer || !acceptedPrivacy}
            onClick={handleAgreeAndContinue}
            className={`w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              acceptedDisclaimer && acceptedPrivacy
                ? 'bg-[#3F5E4D] hover:bg-[#2F473A] text-white shadow-md active:scale-[0.98] cursor-pointer'
                : 'bg-charcoal/10 text-charcoal/40 cursor-not-allowed'
            }`}
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>
              {lang === 'en' ? 'Accept & Continue' : 'स्वीकार करें और जारी रखें'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleQuickAcceptAll}
            className="w-full sm:w-auto text-[11px] sm:text-xs text-charcoal/70 hover:text-sage-dark px-3 py-2 text-center underline font-medium cursor-pointer"
          >
            {lang === 'en' ? 'Agree to All' : 'सभी पर सहमति दें'}
          </button>
        </div>

      </div>
    </div>
  );
};
