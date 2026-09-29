import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App } from '@capacitor/app';
import { LocalNotifications } from '@capacitor/local-notifications';

/**
 * Checks whether the application is running inside a native mobile container (Capacitor Android / iOS)
 */
export const isNativeApp = (): boolean => {
  return Capacitor.isNativePlatform();
};

/**
 * Returns the current platform name: 'android' | 'ios' | 'web'
 */
export const getPlatform = (): 'android' | 'ios' | 'web' => {
  return Capacitor.getPlatform() as 'android' | 'ios' | 'web';
};

/**
 * Native tactile haptic feedback for kick counts, contraction timer, and action buttons.
 * Gracefully falls back to navigator.vibrate on mobile web / PWA browsers.
 */
export const triggerHaptic = async (
  type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light'
): Promise<void> => {
  try {
    if (Capacitor.isNativePlatform()) {
      switch (type) {
        case 'light':
          await Haptics.impact({ style: ImpactStyle.Light });
          break;
        case 'medium':
          await Haptics.impact({ style: ImpactStyle.Medium });
          break;
        case 'heavy':
          await Haptics.impact({ style: ImpactStyle.Heavy });
          break;
        case 'success':
          await Haptics.notification({ type: NotificationType.Success });
          break;
        case 'warning':
          await Haptics.notification({ type: NotificationType.Warning });
          break;
        case 'error':
          await Haptics.notification({ type: NotificationType.Error });
          break;
      }
    } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
      // Web vibration API fallback
      switch (type) {
        case 'light':
          navigator.vibrate(15);
          break;
        case 'medium':
          navigator.vibrate(35);
          break;
        case 'heavy':
          navigator.vibrate(60);
          break;
        case 'success':
          navigator.vibrate([20, 50, 20]);
          break;
        case 'warning':
          navigator.vibrate([40, 60, 40]);
          break;
        case 'error':
          navigator.vibrate([60, 40, 60]);
          break;
      }
    }
  } catch (err) {
    // Haptics not supported or blocked by user gesture policy; silent failure
    console.debug('Haptics not available:', err);
  }
};

/**
 * Initializes the native status bar to match the brand aesthetic (Sandalwood #FDFBF7 with dark icons)
 */
export const initStatusBar = async (): Promise<void> => {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await StatusBar.setStyle({ style: Style.Light });
    await StatusBar.setBackgroundColor({ color: '#FDFBF7' });
  } catch (err) {
    console.debug('StatusBar configuration error:', err);
  }
};

/**
 * Registers a handler for the native Android hardware back button.
 * Returns an unregister function to remove the listener.
 */
export const registerBackButtonHandler = (
  onBack: (canGoBack: boolean) => boolean | void
): (() => void) => {
  if (!Capacitor.isNativePlatform()) return () => {};

  let handlePromise = App.addListener('backButton', ({ canGoBack }) => {
    // If onBack returns true, the event is considered handled.
    // Otherwise, standard navigation or exit can occur.
    const handled = onBack(canGoBack);
    if (!handled && !canGoBack) {
      App.exitApp();
    }
  });

  return () => {
    handlePromise.then((handle) => handle.remove()).catch(() => {});
  };
};

/**
 * Creates Android Notification Channels for distinct pregnancy categories.
 */
export const initNotificationChannels = async (): Promise<void> => {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await LocalNotifications.createChannel({
      id: 'bloom_hydration',
      name: 'Hydration Reminders',
      description: 'Gentle nudges to drink water and tender coconut water',
      importance: 3,
      visibility: 1,
      vibration: true,
    });

    await LocalNotifications.createChannel({
      id: 'bloom_kicks',
      name: 'Fetal Movement Reminders',
      description: 'Daily reminders to count baby kicks after meals',
      importance: 3,
      visibility: 1,
      vibration: true,
    });

    await LocalNotifications.createChannel({
      id: 'bloom_appointments',
      name: 'Doctor Appointment Alerts',
      description: 'Important alerts for upcoming prenatal checkups and scans',
      importance: 4,
      visibility: 1,
      vibration: true,
    });
  } catch (err) {
    console.debug('Failed to create notification channels:', err);
  }
};

/**
 * Checks if notification permissions have been granted.
 */
export const checkNotificationPermissions = async (): Promise<'granted' | 'denied' | 'prompt'> => {
  try {
    if (Capacitor.isNativePlatform()) {
      const res = await LocalNotifications.checkPermissions();
      return res.display === 'granted' ? 'granted' : res.display === 'denied' ? 'denied' : 'prompt';
    } else if (typeof Notification !== 'undefined') {
      return Notification.permission as 'granted' | 'denied' | 'prompt';
    }
  } catch (e) {
    console.debug('Error checking notification permissions:', e);
  }
  return 'denied';
};

/**
 * Explicitly requests notification permissions from the operating system (Android 13+ / iOS).
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    if (Capacitor.isNativePlatform()) {
      const res = await LocalNotifications.requestPermissions();
      return res.display === 'granted';
    } else if (typeof Notification !== 'undefined') {
      const res = await Notification.requestPermission();
      return res === 'granted';
    }
  } catch (e) {
    console.debug('Error requesting notification permissions:', e);
  }
  return false;
};

/**
 * Sends an instant / short-delay test notification to verify device banners and audio.
 */
export const scheduleTestNotification = async (delaySeconds = 2): Promise<boolean> => {
  try {
    const granted = await requestNotificationPermissions();
    if (!granted) return false;

    await initNotificationChannels();

    await LocalNotifications.schedule({
      notifications: [
        {
          id: 9999,
          title: '🌸 Time for a Sip of Water!',
          body: 'Tender coconut water or fresh water keeps your baby well-hydrated and happy.',
          channelId: 'bloom_hydration',
          schedule: { at: new Date(Date.now() + delaySeconds * 1000) },
          extra: { route: 'hydration' },
        },
      ],
    });
    return true;
  } catch (err) {
    console.error('Error scheduling test notification:', err);
    return false;
  }
};

/**
 * Schedules daily hydration reminder nudges during daytime hours (e.g. 10 AM, 1 PM, 4 PM, 7 PM).
 */
export const scheduleHydrationReminders = async (enabled: boolean): Promise<void> => {
  try {
    // Cancel existing hydration notifications (IDs 1001-1005)
    await LocalNotifications.cancel({
      notifications: [{ id: 1001 }, { id: 1002 }, { id: 1003 }, { id: 1004 }],
    });

    if (!enabled) return;

    const granted = await requestNotificationPermissions();
    if (!granted) return;

    await initNotificationChannels();

    const hours = [10, 13, 16, 19];
    const notifications = hours.map((hour, idx) => {
      const target = new Date();
      target.setHours(hour, 0, 0, 0);
      if (target.getTime() <= Date.now()) {
        target.setDate(target.getDate() + 1);
      }

      return {
        id: 1001 + idx,
        title: '💧 Hydration Check-In',
        body: 'Keep your amniotic fluid levels optimal! Have a glass of water or coconut water.',
        channelId: 'bloom_hydration',
        schedule: { at: target, repeats: true, every: 'day' as const },
        extra: { route: 'hydration' },
      };
    });

    await LocalNotifications.schedule({ notifications });
  } catch (err) {
    console.error('Error scheduling hydration reminders:', err);
  }
};

/**
 * Schedules daily fetal movement reminders after meals (e.g. 11:00 AM after breakfast, 8:30 PM after dinner).
 */
export const scheduleKickReminders = async (enabled: boolean): Promise<void> => {
  try {
    await LocalNotifications.cancel({
      notifications: [{ id: 2001 }, { id: 2002 }],
    });

    if (!enabled) return;

    const granted = await requestNotificationPermissions();
    if (!granted) return;

    await initNotificationChannels();

    const times = [
      { hour: 11, minute: 0, title: '👣 Morning Kick Count', body: 'Baby is usually active after breakfast. Take 15 minutes to count kicks!' },
      { hour: 20, minute: 30, title: '🌙 Evening Kick Count', body: 'Time for your evening bonding ritual. Log 10 gentle movements with baby.' },
    ];

    const notifications = times.map((t, idx) => {
      const target = new Date();
      target.setHours(t.hour, t.minute, 0, 0);
      if (target.getTime() <= Date.now()) {
        target.setDate(target.getDate() + 1);
      }

      return {
        id: 2001 + idx,
        title: t.title,
        body: t.body,
        channelId: 'bloom_kicks',
        schedule: { at: target, repeats: true, every: 'day' as const },
        extra: { route: 'kickcounter' },
      };
    });

    await LocalNotifications.schedule({ notifications });
  } catch (err) {
    console.error('Error scheduling kick reminders:', err);
  }
};

/**
 * Schedules prenatal doctor appointment alerts (24 hours and 2 hours prior).
 */
export const scheduleAppointmentAlert = async (appointmentDate: Date, doctorName = 'your Obstetrician'): Promise<void> => {
  try {
    const granted = await requestNotificationPermissions();
    if (!granted) return;

    await initNotificationChannels();

    const alerts = [];
    const oneDayPrior = new Date(appointmentDate.getTime() - 24 * 60 * 60 * 1000);
    const twoHoursPrior = new Date(appointmentDate.getTime() - 2 * 60 * 60 * 1000);

    if (oneDayPrior.getTime() > Date.now()) {
      alerts.push({
        id: 3001,
        title: `🩺 Tomorrow: Appointment with ${doctorName}`,
        body: 'Remember to review your questions list and keep your ultrasound file handy.',
        channelId: 'bloom_appointments',
        schedule: { at: oneDayPrior },
        extra: { route: 'care' },
      });
    }

    if (twoHoursPrior.getTime() > Date.now()) {
      alerts.push({
        id: 3002,
        title: `🏥 Reminder: Checkup in 2 Hours`,
        body: `Your prenatal visit with ${doctorName} is coming up shortly. Stay relaxed!`,
        channelId: 'bloom_appointments',
        schedule: { at: twoHoursPrior },
        extra: { route: 'care' },
      });
    }

    if (alerts.length > 0) {
      await LocalNotifications.schedule({ notifications: alerts });
    }
  } catch (err) {
    console.error('Error scheduling appointment alert:', err);
  }
};

/**
 * Cancels all scheduled local notifications across all categories.
 */
export const cancelAllReminders = async (): Promise<void> => {
  try {
    await LocalNotifications.cancelAll();
  } catch (err) {
    console.debug('Error cancelling notifications:', err);
  }
};

/**
 * Listens for user interaction with a local notification (tapping banner),
 * and passes the target route or tool ID to the provided callback.
 */
export const registerNotificationActionListener = (
  onAction: (route: string) => void
): (() => void) => {
  if (!Capacitor.isNativePlatform()) return () => {};

  let handlePromise = LocalNotifications.addListener(
    'localNotificationActionPerformed',
    (action) => {
      const route = action.notification.extra?.route;
      if (route) {
        onAction(route);
      }
    }
  );

  return () => {
    handlePromise.then((handle) => handle.remove()).catch(() => {});
  };
};
