const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

module.exports = () => ({
  expo: {
    name: 'Geotela',
    slug: 'geotela',
    scheme: 'geotela',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.geotela.app',
      config: {
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
      },
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          'Geotela uses your location to show nearby insights and let you tag new ones.',
        NSPhotoLibraryUsageDescription:
          'Geotela needs access to your photos so you can attach evidence to insights.',
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: 'com.geotela.app',
      config: {
        googleMaps: {
          apiKey: GOOGLE_MAPS_API_KEY,
        },
      },
      permissions: ['ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION', 'READ_MEDIA_IMAGES'],
    },
    web: {
      favicon: './assets/favicon.png',
      bundler: 'metro',
    },
    plugins: [
      'expo-router',
      'expo-secure-store',
      'expo-splash-screen',
      [
        'expo-location',
        {
          locationAlwaysAndWhenInUsePermission:
            'Geotela uses your location to show nearby insights and let you tag new ones.',
        },
      ],
      [
        'expo-image-picker',
        {
          photosPermission:
            'Geotela needs access to your photos so you can attach evidence to insights.',
        },
      ],
      '@react-native-community/datetimepicker',
      [
        '@stripe/stripe-react-native',
        {
          merchantIdentifier: 'merchant.com.geotela.app',
          enableGooglePay: true,
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: '0a7044d5-a181-4a44-b849-88e1a5b92f5b',
      },
      googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    },
    owner: 'geotela',
    runtimeVersion: {
      policy: 'appVersion',
    },
    updates: {
      url: 'https://u.expo.dev/0a7044d5-a181-4a44-b849-88e1a5b92f5b',
    },
  },
});
