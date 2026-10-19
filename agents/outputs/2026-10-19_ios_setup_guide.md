# Our Pregnancy (OPIN) — iOS Architecture & Build Guide
**Date:** October 19, 2026  
**Platform Version:** iOS 15.0+  
**Architecture:** Capacitor 8.5.2 (Swift Package Manager / SPM)  
**Bundle Identifier:** `in.ourpregnancy.bloom`  
**App Scheme:** `capacitor` / `in.ourpregnancy.bloom`  

---

## 1. Executive Summary & Architecture Overview

Our Pregnancy (*Project Bloom / OPIN*) has been equipped with native iOS platform support via Capacitor 8. The native iOS implementation maintains 100% feature and visual parity with the existing Web and Android applications while preserving existing zero-regression guarantees.

### Key Architectural Characteristics
- **Dependency Management:** Native Swift Package Manager (SPM) architecture (`CapApp-SPM`) replacing legacy CocoaPods. Dependencies resolve via SPM directly within `App.xcworkspace`.
- **Navigation & Routing:** Hash-based routing (`/#dashboard`, `/#onboarding`, etc.) preserved seamlessly inside WebKit `WKWebView`.
- **Viewport & Safe Areas:** Full edge-to-edge support for iPhone notches, Dynamic Island, and Home Indicator pills via `viewport-fit=cover`, dynamic CSS safe-area insets (`env(safe-area-inset-top)` / `env(safe-area-inset-bottom)`), and smooth momentum touch scrolling (`-webkit-overflow-scrolling: touch`).
- **Brand Consistency:** Cream `#FDFBF7` background unified across native `StatusBar`, `LaunchScreen.storyboard`, and web container to eliminate visual flicker.

---

## 2. Capabilities & Hardware Entitlements

The iOS target is configured with the following capabilities and entitlements (`ios/App/App/App.entitlements`):

### HealthKit Integration
- **Entitlement:** `com.apple.developer.healthkit` (`YES`)
- **Background Delivery:** `com.apple.developer.healthkit.access`
- **Plugin:** `@capacitor/health-fitness` (backed by `IONHealthFitnessLib`)
- **Supported Vitals:**
  - Heart Rate (`HKQuantityTypeIdentifierHeartRate`)
  - Blood Pressure (Systolic / Diastolic)
  - Maternal Weight Tracking (`HKQuantityTypeIdentifierBodyMass`)
  - Daily Steps / Activity (`HKQuantityTypeIdentifierStepCount`)

### Biometrics (Face ID & Touch ID)
- **Plugin:** `@aparajita/capacitor-biometric-auth`
- **Native Framework:** `LocalAuthentication.framework`
- **Protection:** Encrypted local maternal health vault, private medical diary, and clinical lab report storage.

### Device Haptics
- **Plugin:** `@capacitor/haptics`
- **Native Framework:** `CoreHaptics.framework`
- **Touchpoints:** Contraction timer kick counters, milestone celebrations, and critical alert acknowledgments.

---

## 3. Apple Privacy & Usage Permissions (`Info.plist`)

All required Apple usage description strings are declared with maternal healthcare context:

| Permission Key | Description Purpose in App |
| :--- | :--- |
| `NSFaceIDUsageDescription` | *"Our Pregnancy uses Face ID / Touch ID to securely lock and protect your personal maternal health diary and medical records."* |
| `NSHealthShareUsageDescription` | *"Our Pregnancy reads heart rate, blood pressure, weight, and step data from Apple Health to display your prenatal vitals."* |
| `NSHealthUpdateUsageDescription` | *"Our Pregnancy can record pregnancy weight logs to Apple Health."* |
| `NSCameraUsageDescription` | *"Our Pregnancy requires camera access to scan prenatal food ingredients and take photos of medical prescriptions and lab reports."* |
| `NSPhotoLibraryUsageDescription` | *"Our Pregnancy requires photo library access to upload ultrasound scans and lab reports to your private medical vault."* |
| `NSUserNotificationsUsageDescription` | *"Our Pregnancy sends reminders for prenatal vitamins, kick counting sessions, and hydration."* |

---

## 4. Developer Workflows & Commands

### Syncing Web Assets to iOS
Whenever changes are made to the React frontend (`src/`):
```bash
# Builds the Vite bundle and copies to ios/App/App/public
npm run cap:sync:ios
# or manually:
npm run build && npx cap sync ios
```

### Opening in Xcode
```bash
npm run cap:open:ios
# or:
npx cap open ios
```

### CLI Build (Simulator)
```bash
npm run cap:build:ios
# or:
xcodebuild -workspace ios/App/App.xcworkspace \
  -scheme App \
  -destination 'generic/platform=iOS Simulator' \
  -configuration Debug \
  CODE_SIGNING_ALLOWED=NO \
  -skipPackageSignatureValidation \
  -disableAutomaticPackageResolution \
  build
```

### CLI Build (Generic Device / Archive)
```bash
xcodebuild -workspace ios/App/App.xcworkspace \
  -scheme App \
  -destination 'generic/platform=iOS' \
  -configuration Release \
  -skipPackageSignatureValidation \
  archive -archivePath build/App.xcarchive
```

---

## 5. Assets & Branding Specifications

- **App Icon:** `ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png` (1024x1024 px square, opaque background `#FDFBF7`, zero transparency to pass App Store validation).
- **Launch Screen:** `ios/App/App/Base.lproj/LaunchScreen.storyboard` featuring brand cream background `#FDFBF7` (`RGB: 0.992, 0.984, 0.969`) with centered vector logo.
- **Brand Protection Policy:** Original branding sources in `branding/logos/` and `public/logo.png` remain permanently immutable.

---

## 6. Pre-Submission Checklist for TestFlight & App Store

Prior to uploading archives to App Store Connect:

1. **Apple Developer Account & Team:**
   - In Xcode under **Signing & Capabilities** for target `App`:
   - Select your registered **Apple Developer Team**.
   - Ensure the Provisioning Profile includes the **HealthKit** capability for bundle identifier `in.ourpregnancy.bloom`.
2. **Version & Build Number:**
   - Update `CURRENT_PROJECT_VERSION` (e.g. `1`) and `MARKETING_VERSION` (e.g. `1.0.0`) in Xcode project build settings.
3. **App Privacy Questionnaire:**
   - Under App Store Connect > App Privacy:
     - Health & Fitness data (used for app functionality).
     - Photos & Videos (used for user-initiated ultrasound and document uploads).
     - User ID / Contact info (if syncing with Firebase Cloud Auth).
4. **Export Archive:**
   - In Xcode: `Product` > `Archive`.
   - Validate App with Apple Transporter.
   - Distribute to TestFlight internal/external testing pools.
