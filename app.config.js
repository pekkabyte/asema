const IS_DEV = process.env.APP_VARIANT === 'development';

export default {
  name: IS_DEV ? 'Asema (Dev)' : 'Asema',
  "slug": "Asema",
  "version": "1.0.0",
  "newArchEnabled": true,
  "orientation": "portrait",
  "icon": "./assets/images/adaptive-icon.png",
  "scheme": "myapp",
  "userInterfaceStyle": "dark",
  "splash": {
    "image": "./assets/images/splash.png",
    "resizeMode": "contain",
    "backgroundColor": "#ffffff"
  },
  "ios": {
    "supportsTablet": true,
    "bundleIdentifier": "com.anonymous.asema"
  },
  "android": {
    "icon": "./assets/images/icon.png",
    "adaptiveIcon": {
      "monochromeImage": "./assets/images/adaptive-icon.png",
      "backgroundColor": "#262626"
    },
    "edgeToEdgeEnabled": true,
    "userInterfaceStyle": "dark",
    package: IS_DEV ? 'com.anonymous.asema.dev' : 'com.anonymous.asema'
  },
  "web": {
    "bundler": "metro",
    "output": "static",
    "favicon": "./assets/images/favicon.png"
  },
  "plugins": [
    "expo-router",
    "expo-font",
    [
      "expo-asset",
      {
        "assets": [
          "./assets/images/character_front.png"
        ]
      }
    ],
    "expo-web-browser"
  ],
  "experiments": {
    "typedRoutes": true
  }
};
