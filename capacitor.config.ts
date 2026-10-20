import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'in.ourpregnancy.bloom',
  appName: 'Our Pregnancy',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'capacitor'
  },
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: true,
      providers: ['google.com']
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#FDFBF7'
    }
  },
  ios: {
    contentInset: 'never',
    preferredContentMode: 'mobile'
  },
  experimental: {
    ios: {
      spm: {
        packageOptions: {
          '@capacitor-firebase/authentication': {
            symlink: true
          }
        },
        swiftToolsVersion: '6.1',
        packageTraits: {
          '@capacitor-firebase/authentication': ['Google']
        }
      }
    }
  }
};

export default config;
