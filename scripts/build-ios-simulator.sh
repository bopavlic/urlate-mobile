#!/bin/sh
# Builds the dev client and installs it on the booted iOS simulator.
# Use this instead of `expo run:ios`: with Xcode 27, Expo's CLI mistakes simulators for
# physical devices and stops at code signing.
set -e
cd "$(dirname "$0")/.."

pnpm expo prebuild --platform ios --no-install
(cd ios && pod install)
xcodebuild -workspace ios/UrLate.xcworkspace -scheme UrLate -configuration Debug \
  -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' \
  -derivedDataPath ios/build -quiet
xcrun simctl install booted ios/build/Build/Products/Debug-iphonesimulator/UrLate.app
echo "Installed. Start Metro with 'pnpm start' and press i (or open Ur Late in the simulator)."
