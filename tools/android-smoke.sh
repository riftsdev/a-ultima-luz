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
    adb shell uiautomator dump /sdcard/ultima-window.xml > /dev/null
    adb pull /sdcard/ultima-window.xml android-check/window.xml > /dev/null
    python3 - <<'PY'
import re, subprocess, xml.etree.ElementTree as ET
root = ET.parse('android-check/window.xml').getroot()
for node in root.iter('node'):
    if 'INICIAR JORNADA' in (node.get('text', '') + node.get('content-desc', '')):
        x1, y1, x2, y2 = map(int, re.findall(r'\d+', node.get('bounds')))
        subprocess.run(['adb', 'shell', 'input', 'tap', str((x1+x2)//2), str((y1+y2)//2)], check=True)
        break
else:
    raise SystemExit('Start button was not accessible in the Android WebView')
PY
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
