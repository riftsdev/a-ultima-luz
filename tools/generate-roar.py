"""Create the original creature roar; no third-party recording is used."""
from pathlib import Path
import subprocess, tempfile
import numpy as np
from scipy.signal import butter, sosfilt
from scipy.io.wavfile import write

rate = 22050
t = np.arange(int(rate * 2.35)) / rate
rng = np.random.default_rng(3803)
pitch = 145 - 77 * (t / t[-1]) + 9 * np.sin(2 * np.pi * 4.6 * t)
phase = 2 * np.pi * np.cumsum(pitch) / rate
voice = sum(np.sin(phase * n + .15 * n) / n for n in range(1, 13))
voice = np.tanh(voice * 1.8)
rasp = sosfilt(butter(3, [180, 2200], btype='bandpass', fs=rate, output='sos'), rng.normal(0, 1, len(t)))
formant = sosfilt(butter(2, [450, 1050], btype='bandpass', fs=rate, output='sos'), voice)
envelope = np.minimum(1, t / .09) * np.minimum(1, (t[-1] - t) / .65)
envelope *= .7 + .3 * np.sin(np.pi * np.minimum(1, t / 1.8))
signal = (voice * .38 + formant * 1.8 + rasp * .9) * envelope
signal *= .82 + .18 * np.sin(2 * np.pi * 23 * t + np.sin(t * 9))
signal = sosfilt(butter(2, 95, btype='highpass', fs=rate, output='sos'), signal)
signal = np.tanh(signal * 1.5)
signal = signal / max(abs(signal)) * .88
destination = Path(__file__).resolve().parents[1] / 'dist/assets/audio/Allosaurus_Roar.m4a'
with tempfile.TemporaryDirectory() as folder:
    wav = Path(folder) / 'roar.wav'
    write(wav, rate, np.int16(signal * 32767))
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(wav), '-c:a', 'aac', '-b:a', '64k', '-ac', '1', str(destination)], check=True)
print(destination.name, destination.stat().st_size, 'bytes')
