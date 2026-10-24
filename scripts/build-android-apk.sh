#!/bin/sh
# Builds the dev client as an APK you can send to a phone (WeTransfer, Drive, …) and install
# without a cable. It is a debug build: it loads the JS from Metro, so `pnpm start` on the Mac
# gives it Fast Refresh over Wi-Fi like `pnpm android` does. Only real phones (arm64).
set -e
cd "$(dirname "$0")/.."

pnpm expo prebuild --platform android --no-install
(cd android && ./gradlew assembleDebug -PreactNativeArchitectures=arm64-v8a)
mkdir -p dist
cp android/app/build/outputs/apk/debug/app-debug.apk dist/UrLate-dev.apk
echo "Built dist/UrLate-dev.apk. Send it to the phone, install it, then run 'pnpm start' and scan the QR code."
