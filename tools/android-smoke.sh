#!/usr/bin/env bash
set -euo pipefail
mkdir -p android-check
adb install -r "${1:-A-Ultima-Luz-dev.apk}"
adb logcat -c
# Prove the bundled game loads without a network connection.
adb shell svc wifi disable
adb shell svc data disable
adb shell settings put secure immersive_mode_confirmations confirmed
adb shell am start -W -n io.github.riftsdev.aultimaluz/.MainActivity
for attempt in $(seq 1 60); do
  adb logcat -d -s UltimaLuz:I AndroidRuntime:E > android-check/startup.log
  if grep -q 'ULTIMA_LUZ_READY:.*"failed":\[\]' android-check/startup.log; then
    sleep 4
    adb exec-out screencap -p > android-check/menu.png
    # Pixel 2 in landscape: tap the visible start button, then capture the cutscene.
    # WebView HTML controls are not exposed in this emulator's UIAutomator tree.
    adb shell input tap 1270 414
    sleep 4
    adb exec-out screencap -p > android-check/intro.png
    cat android-check/startup.log
    exit 0
  fi
  if grep -q 'FATAL EXCEPTION' android-check/startup.log; then break; fi
  sleep 2
done
adb exec-out screencap -p > android-check/menu.png
cat android-check/startup.log
exit 1
