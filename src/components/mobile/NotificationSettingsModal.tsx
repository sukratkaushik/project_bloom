import React, { useState, useEffect } from 'react';
import { Bell, Droplets, Footprints, Calendar, Sparkles, X, Check, AlertCircle } from 'lucide-react';
import {
  triggerHaptic,
  checkNotificationPermissions,
  requestNotificationPermissions,
  scheduleTestNotification,
  scheduleHydrationReminders,
  scheduleKickReminders,
} from '../../utils/nativeBridge';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [isHydrationEnabled, setIsHydrationEnabled] = useState(() => {
    return localStorage.getItem('bloom_reminders_hydration') !== 'false';
  });
  const [isKicksEnabled, setIsKicksEnabled] = useState(() => {
    return localStorage.getItem('bloom_reminders_kicks') !== 'false';
  });
  const [isAppointmentsEnabled, setIsAppointmentsEnabled] = useState(() => {
    return localStorage.getItem('bloom_reminders_appointments') !== 'false';
  });
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      checkNotificationPermissions().then(setPermissionStatus);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleHydration = async () => {
    triggerHaptic('light');
    const next = !isHydrationEnabled;
    setIsHydrationEnabled(next);
    localStorage.setItem('bloom_reminders_hydration', String(next));

    if (next && permissionStatus !== 'granted') {
      const granted = await requestNotificationPermissions();
      setPermissionStatus(granted ? 'granted' : 'denied');
    }
    await scheduleHydrationReminders(next);
    onShowToast(next ? '💧 Hydration reminders enabled' : 'Hydration reminders paused');
  };

  const handleToggleKicks = async () => {
    triggerHaptic('light');
    const next = !isKicksEnabled;
    setIsKicksEnabled(next);
    localStorage.setItem('bloom_reminders_kicks', String(next));

    if (next && permissionStatus !== 'granted') {
      const granted = await requestNotificationPermissions();
      setPermissionStatus(granted ? 'granted' : 'denied');
    }
    await scheduleKickReminders(next);
    onShowToast(next ? '👣 Kick session reminders enabled' : 'Kick session reminders paused');
  };

  const handleToggleAppointments = async () => {
    triggerHaptic('light');
    const next = !isAppointmentsEnabled;
    setIsAppointmentsEnabled(next);
    localStorage.setItem('bloom_reminders_appointments', String(next));

    if (next && permissionStatus !== 'granted') {
      const granted = await requestNotificationPermissions();
      setPermissionStatus(granted ? 'granted' : 'denied');
    }
    onShowToast(next ? '🩺 Appointment alerts enabled' : 'Appointment alerts paused');
  };

  const handleSendTest = async () => {
    triggerHaptic('medium');
    setIsTesting(true);

    const success = await scheduleTestNotification(2);
    if (success) {
      setPermissionStatus('granted');
      onShowToast('🌸 Test notification sent! Check your notification shade in 2s.');
    } else {
      onShowToast('⚠️ Notification permission required to display alerts.');
    }

    setTimeout(() => setIsTesting(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-charcoal/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-border/80 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border/60 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-sage/15 flex items-center justify-center text-sage-dark">
              <Bell size={18} />
            </div>
            <div>
              <h2 className="font-serif font-bold text-charcoal text-[18px] leading-tight">
                Prenatal Reminders
              </h2>
              <p className="text-[12px] text-medium">Mindful notifications for you & baby</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="p-1.5 text-medium hover:text-charcoal hover:bg-cream rounded-full transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Permission Banner */}
        {permissionStatus !== 'granted' && (
          <div className="mb-5 p-3.5 bg-gold/10 border border-gold/30 rounded-2xl flex items-start gap-3">
            <AlertCircle size={18} className="text-gold-dark shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-[12.5px] font-medium text-charcoal leading-snug">
                Notification access is required to receive gentle check-ins on your device.
              </p>
              <button
                type="button"
                onClick={async () => {
                  triggerHaptic('light');
                  const granted = await requestNotificationPermissions();
                  setPermissionStatus(granted ? 'granted' : 'denied');
                }}
                className="mt-2 text-[11.5px] font-bold text-sage-dark bg-white px-3 py-1 rounded-full border border-border shadow-2xs hover:bg-cream transition-colors cursor-pointer"
              >
                Allow Notifications
              </button>
            </div>
          </div>
        )}

        {/* Reminders List */}
        <div className="space-y-3 mb-6">
          {/* 1. Hydration Reminder */}
          <div className="flex items-center justify-between p-3.5 bg-cream/60 border border-border/70 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Droplets size={16} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-[14px] text-charcoal">Hydration Check-ins</h4>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-100/70 px-1.5 py-0.2 rounded-full">
                    Daytime
                  </span>
                </div>
                <p className="text-[11.5px] text-medium">
                  Gentle nudges at 10 AM, 1 PM, 4 PM, 7 PM
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleToggleHydration}
              className={`w-12 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                isHydrationEnabled ? 'bg-sage-dark' : 'bg-gray-300'
              }`}
            >
              <div
                className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                  isHydrationEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 2. Kick Counting Sessions */}
          <div className="flex items-center justify-between p-3.5 bg-cream/60 border border-border/70 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Footprints size={16} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-[14px] text-charcoal">Fetal Movement Sessions</h4>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded-full">
                    Post-Meals
                  </span>
                </div>
                <p className="text-[11.5px] text-medium">
                  Reminders at 11:00 AM and 8:30 PM
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleToggleKicks}
              className={`w-12 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                isKicksEnabled ? 'bg-sage-dark' : 'bg-gray-300'
              }`}
            >
              <div
                className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                  isKicksEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 3. Appointment Alerts */}
          <div className="flex items-center justify-between p-3.5 bg-cream/60 border border-border/70 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Calendar size={16} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-[14px] text-charcoal">Doctor Appointments</h4>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-100/70 px-1.5 py-0.2 rounded-full">
                    High Priority
                  </span>
                </div>
                <p className="text-[11.5px] text-medium">
                  Alerts 24 hours & 2 hours prior to scans
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleToggleAppointments}
              className={`w-12 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                isAppointmentsEnabled ? 'bg-sage-dark' : 'bg-gray-300'
              }`}
            >
              <div
                className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                  isAppointmentsEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Instant Test Action */}
        <div className="pt-2 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            disabled={isTesting}
            onClick={handleSendTest}
            className="w-full sm:w-auto px-4 py-2.5 bg-sage/15 text-sage-dark font-bold text-[12.5px] rounded-2xl border border-sage/30 hover:bg-sage/25 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
          >
            <Sparkles size={14} className={isTesting ? 'animate-spin' : ''} />
            <span>{isTesting ? 'Sending Notification...' : '🔔 Send Test Notification (2s)'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="w-full sm:w-auto px-6 py-2.5 bg-sage-dark text-white font-bold text-[13px] rounded-2xl hover:opacity-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Check size={14} />
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
};
