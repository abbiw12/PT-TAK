# 📱 PT TAK Mobile App - Quick Start

Your PT TAK app is now a **native mobile application** for iOS and Android! Here's how to get started.

## ✅ What's Been Done

- ✅ Capacitor framework integrated
- ✅ iOS native project created (Xcode ready)
- ✅ Android native project created (Android Studio ready)
- ✅ Essential plugins installed (Geolocation, Camera, Device)
- ✅ Build scripts configured in package.json
- ✅ Your React code converts to native apps automatically

## 🚀 Quick Start (Choose One)

### Option 1: Android (Windows, Mac, or Linux)

```bash
# 1. Make sure you have Android Studio installed
# 2. Run this command:
npm run android:build

# 3. Android Studio will open
# 4. Click the green Play button to run on emulator/device
```

### Option 2: iOS (macOS only)

```bash
# 1. Make sure you have Xcode installed
# 2. Run this command:
npm run ios:build

# 3. Xcode will open
# 4. Click the Play button to run on simulator/device
```

## 📋 Before You Build

Make sure you have:

**For Android:**
- [ ] Android Studio installed
- [ ] Android SDK with API 21+
- [ ] Java Development Kit (JDK 11+)
- [ ] Emulator running (or device connected)

**For iOS:**
- [ ] macOS computer
- [ ] Xcode installed from App Store
- [ ] iOS 13.0 or higher

## 🔄 Development Workflow

### Testing Changes

```bash
# 1. Make changes to your React code
# 2. Test in web browser first (faster):
npm run dev
# Visit http://localhost:3003

# 3. When ready, rebuild for mobile:
npm run mobile:sync
```

### Building the App

**Web Version (for testing):**
```bash
npm run dev          # Development server
npm run build        # Production build
```

**Mobile Versions:**
```bash
npm run ios:build    # Build iOS and open Xcode
npm run android:build # Build Android and open Android Studio
```

## 📂 New Folders Created

- **`ios/`** - iOS Xcode project
  - Open `ios/App/App.xcworkspace` in Xcode
  - Never edit this directly - edit `src/` instead

- **`android/`** - Android Gradle project
  - Open folder in Android Studio
  - App runs on device/emulator automatically

- **`dist/`** - Compiled web assets
  - Auto-generated when you run `npm run build`
  - Copied to native projects when you sync

## 🎮 Running on Device

### Android Physical Device
```bash
# 1. Connect Android phone via USB
# 2. Enable Developer Mode and USB Debugging on phone
# 3. Run: npm run android:build
# 4. Select your device in Android Studio
# 5. Click Play
```

### iOS Physical Device
```bash
# 1. Connect iPhone via USB
# 2. Run: npm run ios:build
# 3. Select your device in Xcode
# 4. Click Play
# 5. Trust developer certificate on phone
```

## 📦 Distributing Your App

### iOS App Store
1. Complete code signing setup in Xcode
2. In Xcode: Product → Archive
3. Follow the distribution wizard
4. Submit through App Store Connect

### Google Play Store
1. Create keystore: https://developer.android.com/training/articles/keystore
2. Sign APK/Bundle in Android Studio
3. Upload to Google Play Console

## 🔗 Backend Configuration

Your app talks to the backend at `localhost:3000`. To deploy:

1. Update API URL in `services/apiClient.ts`
2. Change from `http://localhost:3000` to your production domain
3. Ensure backend has CORS properly configured

## 🛠️ Useful Commands

```bash
# Development
npm run dev                # Web dev server (http://localhost:3003)
npm run build              # Build web app for mobile
npm run preview            # Preview production build locally

# Mobile
npm run mobile:build       # Build web + prepare mobile
npm run mobile:sync        # Build web + sync to iOS & Android
npm run ios:build          # Build web + open iOS in Xcode
npm run android:build      # Build web + open Android in Studio

# Manual control
npx cap copy               # Copy web files to native projects
npx cap sync               # Copy + sync plugins
npx cap open ios           # Open Xcode (macOS only)
npx cap open android       # Open Android Studio
```

## 📚 Documentation

- **[MOBILE_BUILD_GUIDE.md](./MOBILE_BUILD_GUIDE.md)** - Detailed build instructions
- **[BACKEND_SETUP.md](./BACKEND_SETUP.md)** - Backend deployment
- **[README.md](./README.md)** - Overall project info

## 🐛 Troubleshooting

**"Command not found"**
- Run `npm install` to install all dependencies first

**iOS: "Xcode not found"**
- Install from App Store: https://apps.apple.com/us/app/xcode/id497799835

**Android: "Gradle failed"**
- Run `cd android && ./gradlew clean build`
- Restart Android Studio

**App not loading backend**
- For local testing, use your machine's IP instead of localhost
- Edit `capacitor.config.ts` and `services/apiClient.ts`

## 💡 Tips

1. **Build often** - Run `npm run mobile:sync` after each feature
2. **Test on device** - Emulator behavior differs from real devices
3. **Use browser DevTools** - Right-click → Inspect to debug mobile builds
4. **Monitor permissions** - Location/camera need explicit user permission
5. **Optimize bundle size** - Keep app assets small for better performance

## 🎯 Next Steps

1. **Test on Mobile:**
   ```bash
   npm run android:build
   # or
   npm run ios:build
   ```

2. **Create Test Accounts:**
   - Sign up as Host (coach)
   - Sign up as User (trainee)
   - Try all features on mobile

3. **Prepare for Distribution:**
   - Update app icons and splash screens
   - Configure signing certificates
   - Get privacy policy ready

4. **Deploy Backend:**
   - Put backend on staging server
   - Update API URLs in app
   - Test end-to-end

---

**Ready to build? Run `npm run android:build` or `npm run ios:build`!** 🚀

For questions, see MOBILE_BUILD_GUIDE.md or check the [Capacitor docs](https://capacitorjs.com/docs).
