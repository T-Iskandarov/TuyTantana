# React Native & Expo Mobile Debugging Rules for Antigravity

## 1. Mobile Debugging Source of Truth (DevTools over Screenshots)
When debugging React Native / Expo applications on physical devices, always prioritize errors, logs, and stack traces from the PC-based **React Native DevTools** window over mobile screenshots. Encourage the user to share console logs or stack traces from DevTools for rapid 100% accurate diagnosis. Never ask the user to take mobile phone screenshots when DevTools is open.

## 2. Windows React Native USB Setup
When launching or debugging Android builds (`npm run android` / `expo run:android`) on Windows with a physical USB device:
1. Verify or automatically configure `$env:JAVA_HOME` to point to Android Studio's bundled runtime (e.g., `C:\Program Files\Android\Android Studio\jbr`) and ensure its `bin` directory is in `PATH`.
2. Use ADB reverse forwarding (`adb reverse tcp:8081 tcp:8081`) to bridge the physical device to the PC's Metro bundler over USB without requiring Wi-Fi.
3. Explain Hot Reloading (`Ctrl + S` in IDE) and Developer Menu shortcuts (`r` to reload, `d` for dev menu) clearly to the user.

## 3. Synthetic Event Safety in React Native (Map / Interactive Events)
When handling native events in interactive components (such as `onMapPress` in `react-native-yamap` or `react-native-maps`), **NEVER** access properties of `e.nativeEvent` directly inside asynchronous callbacks or state updater functions (`setForm(prev => ...)`). Because of React's synthetic event pooling, `e.nativeEvent` will be nullified, causing `Cannot read property 'lat' of null` and crashing the app on repeated clicks. Always destructure or extract properties synchronously at the top of the event handler before invoking state updates:
```javascript
// CORRECT:
onMapPress={(e) => {
  if (!e || !e.nativeEvent) return;
  const { lat, lon } = e.nativeEvent;
  if (lat !== undefined && lon !== undefined) {
    setForm(prev => ({ ...prev, location_lat: Number(lat), location_lng: Number(lon) }));
  }
}}
```
