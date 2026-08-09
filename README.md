# 🎧 SilentSpot - Quiet Workspaces & Real-Time Acoustic Intelligence

SilentSpot is a modern web application for discovering quiet workspaces, cafés, and libraries with real-time noise levels (dB), Wi-Fi speeds, power outlet availability %, and stay policies.

## 🌟 Key Features
- 🔍 **Interactive Workspace Discovery**: Filter spots by noise level (<45 dB), Wi-Fi speed (100+ Mbps), power outlets (>80%), cafés, and libraries.
- 🗺️ **Global Connected Map (Leaflet.js & OpenStreetMap)**: Search any city globally or click anywhere on the map to auto-discover quiet focus spots with interactive acoustic heatmap overlays.
- 🎙️ **Live dB Sound Check**: Web Audio API room noise meter using microphone input & simulated spectrum visualizer.
- 📊 **Workspace Comparison Matrix**: Side-by-side technical & acoustic comparison table.
- 🎧 **Focus Audio Synthesizer**: Built-in background white noise generator (Rain, Café, Ocean Waves, 432Hz Alpha Waves).
- ⏱️ **Focus Session Timer & Saved Spots**: Track active work sessions and bookmark favorite spots with local storage.

## 🚀 Setup & Local Preview
Clone the repository and open `index.html` in your browser or run a simple local HTTP server:
```bash
git clone https://github.com/kazi716/silentspot.git
cd silentspot
python -m http.server 8080
```
