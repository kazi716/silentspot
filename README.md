# 🎧 SilentSpot – Find Your Focus

**SilentSpot** is a modern web application designed for remote workers, students, and digital nomads to discover quiet workspaces, cafés, and libraries based on acoustic environments and technical amenities.

Stop guessing where you can take a quiet meeting or do deep work. SilentSpot provides data-driven venue intelligence, from ambient decibel (dB) averages to Wi-Fi speeds and power outlet coverage.

---

## 🌟 Key Features

- 🔍 **Intelligent Venue Discovery**: Filter workspaces by noise level (<45 dB), Wi-Fi speed (100+ Mbps), power outlets, and venue type (Café, Library, Coworking).
- 🗺️ **Global Coverage (Geoapify + OSM)**: Powered by the Geoapify Places API and OpenStreetMap, search any city globally to auto-discover quiet focus spots with beautiful CARTO map tiles.
- 📊 **Community Estimated & User Verified Data**: Smart venue baselines derived from category averages, which seamlessly upgrade to "User Verified" metrics when the community contributes real data.
- 🎙️ **Live dB Sound Check**: Built-in room noise meter utilizing the Web Audio API and microphone input to measure your current environment's acoustic profile.
- ⚖️ **Workspace Comparison Matrix**: Side-by-side technical and acoustic comparison engine.
- 🎧 **Focus Audio Synthesizer**: Built-in ambient noise generator (Rain, Lo-fi Café, Ocean Waves, Alpha Waves) to help you zone in anywhere.
- 🔮 **AI Vibe Checks**: Smart, auto-generated productivity summaries based on a venue's unique acoustics and amenities.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: HTML5, Vanilla JavaScript, Tailwind CSS (CDN for rapid prototyping)
- **Mapping & GIS**: Leaflet.js, CARTO Basemaps (Positron & Dark Matter)
- **Data APIs**: 
  - **Geoapify Places API** (Primary source for rich, structured POI data)
  - **Overpass API / OpenStreetMap** (Robust global fallback engine)
  - **Photon by Komoot** (Global city autocomplete & geocoding)
- **State & Storage**: Client-side `localStorage` for theming, user contributions, saved venues, and simulated login.

---

## 🚀 Setup & Local Preview

Clone the repository and run a simple local HTTP server:

\`\`\`bash
git clone https://github.com/kazi716/silentspot.git
cd silentspot
npx http-server -p 8080
# OR
python -m http.server 8080
\`\`\`

Open \`http://localhost:8080\` in your browser to view the application.

---

## 🤝 Contributing
Found a great quiet spot? Use the in-app **Contribute** feature to submit verified Wi-Fi speeds and acoustic dB readings to help upgrade the community estimates!

---

*Designed and developed as a personal project for the remote work community.*
