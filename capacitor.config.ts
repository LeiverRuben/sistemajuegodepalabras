import type { CapacitorConfig } from "@capacitor/core"

const config: CapacitorConfig = {
  appId: "com.sistemaeducativo.tablet",
  appName: "Sistema Educativo Tablet",
  webDir: "out",
  server: {
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      backgroundColor: "#667eea",
      showSpinner: false,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#ffffff",
    },
  },
}

export default config
