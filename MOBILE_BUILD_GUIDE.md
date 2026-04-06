# PT TAK Mobile App Build Guide

Your React web app has been converted to a native mobile app using **Capacitor**! This guide explains how to build and run it on iOS and Android.

## 📱 What's Included

- **iOS Native App**: Xcode project ready to build
- **Android Native App**: Gradle-based Android project ready to build
- **All Features**: Your web app runs natively on mobile with full functionality
- **Native Plugins**: Geolocation, Camera, Device info plugins installed and ready

## 🚀 Quick Start

### Prerequisites

**For iOS:**
- macOS
- Xcode (download from App Store)
- iOS deployment target: iOS 13.0+

**For Android:**
- Android Studio
- Android SDK (API 21 or higher)
- Java Development Kit (JDK 11+)

### Build for iOS

1. **Prepare the app:**
   ```bash
   npm run ios:build
   ```
   This will:
   - Build your React web app
   - Copy assets to iOS project
   - Open Xcode

2. **In Xcode:**
   - Select your iPhone simulator or connected device
   - Click the Play button to build and run
   - Or use `Cmd+R` keyboard shortcut

3. **To submit to App Store:**
   - Follow Apple's guidelines for code signing
   - Build for "Release" configuration
   - Use Xcode or Transporter to submit

### Build for Android

1. **Prepare the app:**
   ```bash
   npm run android:build
   ```
   This will:
   - Build your React web app
   - Copy assets to Android project
   - Open Android Studio

2. **In Android Studio:**
   - Select your Android emulator or connected device
   - Click the Green Play button to build and run
   - Or use `Ctrl+Shift+F10` (Windows) / `Ctrl+R` (Mac)

3. **To create an APK for testing:**
   - Build → Build Bundle(s) / APK(s) → Build APK(s)
   - Find the APK in `android/app/build/outputs/apk/`

4. **To submit to Google Play Store:**
   - Build → Build Bundle(s) / APK(s) → Build Bundle(s)
   - Sign with your keystore
   - Upload to Google Play Console

## 🔄 Development Workflow

### Making Changes

1. Edit your React code in the `src/` folder
2. Test in web browser: `npm run dev` (runs on http://localhost:3003)
3. When ready to test on mobile:
   ```bash
   npm run mobile:sync
   ```
   This rebuilds and syncs all changes to iOS and Android projects

### Syncing Without Full Rebuild

```bash
npx cap copy    # Manually copy web assets to native projects
npx cap sync    # Update plugins and sync everything
```

## 📁 Project Structure

```
PT TAK/
├── src/                 # React source code
├── dist/                # Built web assets (created by npm run build)
├── ios/                 # iOS Xcode project
│   └── App/
│       └── App.xcworkspace  ← Open this in Xcode
├── android/             # Android Gradle project
│   └── settings.gradle  ← Open folder in Android Studio
├── capacitor.config.ts  # Capacitor configuration
└── vite.config.ts       # Vite build configuration
```

## 🔌 Using Native Plugins

Your app already has these plugins installed:

### Geolocation
```typescript
import { Geolocation } from '@capacitor/geolocation';

const coordinates = await Geolocation.getCurrentPosition();
console.log('Latitude:', coordinates.coords.latitude);
console.log('Longitude:', coordinates.coords.longitude);
```

### Camera
```typescript
import { Camera, CameraResultType } from '@capacitor/camera';

const image = await Camera.getPhoto({
  resultType: CameraResultType.Uri,
  source: CameraSource.Camera,
  quality: 100,
});
```

### Device Info
```typescript
import { Device } from '@capacitor/device';

const info = await Device.getInfo();
console.log('Platform:', info.platform);
console.log('OS Version:', info.osVersion);
```

## ⚙️ Configuration

### iOS Configuration (`ios/App/App/Info.plist`)

For using native features, add required permissions:
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>We need your location for GPS tracking</string>

<key>NSCameraUsageDescription</key>
<string>We need camera access</string>
```

### Android Configuration (`android/app/AndroidManifest.xml`)

Permissions are already configured, but you can customize:
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.CAMERA" />
```

## 🐛 Troubleshooting

### iOS Issues

**"Xcode project not found"**
- Rebuild: `npm run mobile:sync && npm run ios:build`

**Permission denials**
- Check `ios/App/App/Info.plist` for usage descriptions
- Xcode → Build Settings → Search for "Bundle Identifier"

### Android Issues

**"Gradle sync failed"**
- Open Android Studio
- File → Sync Now
- Or run: `cd android && ./gradlew clean build`

**Emulator not showing up**
- Make sure emulator is running
- In Android Studio: Tools → AVD Manager

**Build errors**
- Check Java version: JDK 11+ required
- Clean gradle: `cd android && ./gradlew clean`

## 📦 Building for Distribution

### iOS App Store
1. `npm run ios:build` to open Xcode
2. Select "Product" → "Archive"
3. Click "Distribute App"
4. Follow the submission wizard

### Google Play Store
1. `npm run android:build` to open Android Studio
2. Build → Generate Signed Bundle / APK
3. Sign with your keystore
4. Upload the Bundle (.aab file) to Google Play Console

## 🔗 Backend Configuration

Your app connects to the backend at `localhost:3000`. For mobile:

**For Local Testing (WiFi):**
- Update `vite.config.ts` to build for your machine's IP
- Or modify `capacitor.config.ts` server settings

**For Production:**
- Update API URLs in `services/apiClient.ts`
- Use your actual backend domain (e.g., api.pttakfitness.com)
- Ensure CORS headers are properly set

## 📚 Further Reading

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Capacitor iOS Guide](https://capacitorjs.com/docs/ios)
- [Capacitor Android Guide](https://capacitorjs.com/docs/android)
- [React Native vs Capacitor Comparison](https://capacitorjs.com/)

## 💬 Getting Help

- Capacitor Issues: https://github.com/ionic-team/capacitor/issues
- iOS Development: https://developer.apple.com/
- Android Development: https://developer.android.com/

---

**Your mobile app is ready to build! Start with `npm run ios:build` or `npm run android:build`** 🎉
