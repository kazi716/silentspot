# 🎧 SilentSpot - Quiet Workspaces & Real-Time Acoustic Intelligence

> 🎓 **Project created during the Google for Developers: Build with AI Bootcamp at Techno India University (TIU), Kolkata** (August 9, 2026).

SilentSpot is a modern web application for discovering quiet workspaces, cafés, and libraries with real-time noise levels (dB), Wi-Fi speeds, power outlet availability %, and stay policies.

---

## 🏛️ About The TIU Bootcamp Project
This application was conceptualized and built during the **Build with AI Bootcamp** organized by **Google for Developers** & **Hack2Skill** at **Techno India University (TIU), Kolkata**. 

It combines **Generative UI design ideation**, **Acoustic Intelligence**, and **Interactive GIS Mapping** to solve the productivity challenge of finding quiet focus spaces in urban environments.

---

## 🌟 Key Features
- 🔍 **Interactive Workspace Discovery**: Filter spots by noise level (<45 dB), Wi-Fi speed (100+ Mbps), power outlets (>80%), cafés, and libraries.
- 🗺️ **Global Connected Map (Leaflet.js & OpenStreetMap)**: Search any city globally or click anywhere on the map to auto-discover quiet focus spots with interactive acoustic heatmap overlays.
- 🎙️ **Live dB Sound Check**: Web Audio API room noise meter using microphone input & simulated spectrum visualizer.
- 📊 **Workspace Comparison Matrix**: Side-by-side technical & acoustic comparison table.
- 🎧 **Focus Audio Synthesizer**: Built-in background white noise generator (Rain, Café, Ocean Waves, 432Hz Alpha Waves).
- ⏱️ **Focus Session Timer & Gamification**: Track active work sessions to earn "Focus Minutes". Level up from *Novice* to *Zen Master* and climb the Global Leaderboard.
- 🔮 **AI Vibe Checks**: Smart, auto-generated 1-sentence summaries predicting the productivity potential of each venue based on its acoustics and amenities.

---

## 🚀 Setup & Local Preview
Clone the repository and open `index.html` in your browser or run a simple local HTTP server:
```bash
git clone https://github.com/kazi716/silentspot.git
cd silentspot
python -m http.server 8080
```
