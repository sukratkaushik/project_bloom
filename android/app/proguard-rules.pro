# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.

# Preserve line numbers and source files for clean crash traces
-keepattributes SourceFile,LineNumberTable
-keepattributes *Annotation*
-keepattributes JavascriptInterface

# Preserve WebView JavaScript interface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Capacitor Core
-keep class com.getcapacitor.** { *; }
-keep interface com.getcapacitor.** { *; }
-keep class * extends com.getcapacitor.Plugin { *; }

# Native Capacitor Plugins (Reflection & Bridge Protection)
# 1. Biometric Auth (@aparajita/capacitor-biometric-auth)
-keep class com.aparajita.capacitor.biometricauth.** { *; }

# 2. Firebase Authentication (@capacitor-firebase/authentication)
-keep class io.capawesome.capacitorjs.plugins.firebase.auth.** { *; }

# 3. Capacitor App (@capacitor/app)
-keep class com.capacitorjs.plugins.app.** { *; }

# 4. Haptics Engine (@capacitor/haptics)
-keep class com.capacitorjs.plugins.haptics.** { *; }

# 5. Health Connect & Health Fitness (@capacitor/health-fitness)
-keep class com.capacitorjs.community.healthfitness.** { *; }
-keep class androidx.health.connect.client.** { *; }
-keep interface androidx.health.connect.client.** { *; }
-keep class androidx.health.platform.client.** { *; }

# 6. Local Notifications (@capacitor/local-notifications)
-keep class com.capacitorjs.plugins.localnotifications.** { *; }

# 7. Status Bar Styling (@capacitor/status-bar)
-keep class com.capacitorjs.plugins.statusbar.** { *; }

# Firebase & Google Play Services
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }

# Suppress known harmless library warnings during optimization
-dontwarn kotlinx.coroutines.**
-dontwarn com.google.errorprone.annotations.**
