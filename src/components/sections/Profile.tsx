import React, { useState } from 'react';
import { usePlanner } from '../../store';
import { auth } from '../../firebase';
import { User, Settings, FileText, Weight, Calendar } from 'lucide-react';

export const Profile: React.FC = () => {
  const { state, updateState } = usePlanner();
  
  const [userName, setUserName] = useState(state.userName || '');
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  
  const handleNameSave = () => {
    updateState({ userName });
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
            <a href="#privacy" onClick={() => window.location.hash = '#privacy'} className="flex items-center justify-between p-4 bg-gray-50 rounded-[16px] border border-border hover:bg-sage-pale/50 transition-colors cursor-pointer group">
              <span className="font-medium text-charcoal group-hover:text-sage">Privacy Policy</span>
              <span className="text-sage">→</span>
            </a>
            <a href="#terms" onClick={() => window.location.hash = '#terms'} className="flex items-center justify-between p-4 bg-gray-50 rounded-[16px] border border-border hover:bg-sage-pale/50 transition-colors cursor-pointer group">
              <span className="font-medium text-charcoal group-hover:text-sage">Terms of Service</span>
              <span className="text-sage">→</span>
            </a>
            <a href="mailto:grievance@ourpregnancy.in" className="flex items-center justify-between p-4 bg-gray-50 rounded-[16px] border border-border hover:bg-sage-pale/50 transition-colors cursor-pointer group">
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
    </div>
  );
};
