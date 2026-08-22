# 🎧 SilentSpot - Find Your Focus

**SilentSpot** is a modern web application designed for remote workers, students, and digital nomads to discover quiet workspaces, cafés, and libraries based on acoustic environments and technical amenities. 

Stop guessing where you can take a quiet meeting or do deep work. SilentSpot provides data-driven venue intelligence, from ambient decibel (dB) averages to Wi-Fi speeds and power outlet coverage.

---

## ✨ Key Features

- 🤫 **Intelligent Venue Discovery**: Filter workspaces by noise level (<45 dB), Wi-Fi speed (100+ Mbps), power outlets, and venue type (Café, Library, Coworking).
- 🗺️ **Global Coverage**: Powered by the **Geoapify Places API** and **OpenStreetMap**, search any city globally to auto-discover quiet focus spots with beautiful CARTO map tiles.
- 📡 **Live Community Database**: Built on **Firebase Firestore**, community members can drop pins, add new quiet workspaces, and verify existing Wi-Fi speeds and acoustic readings anywhere in the world.
- ⚡ **Global Geohashing**: Scalable map architecture utilizing **Geofire** to query Firestore via 15km geohashed bounding boxes, ensuring lightning-fast database reads globally.
- 🎙️ **Live dB Sound Check**: Built-in room noise meter utilizing the Web Audio API and microphone input to measure your current environment's acoustic profile.
- 📊 **Workspace Comparison Matrix**: Side-by-side technical and acoustic comparison engine.
- 🎧 **Focus Audio Synthesizer**: Built-in ambient noise generator (Rain, Lo-fi Café, Ocean Waves, Alpha Waves) to help you zone in anywhere.
- 🚀 **Performance Optimized**: Achieves a near-perfect Vercel Web Vitals score through intelligent LCP (Largest Contentful Paint) splash screen rendering and aggressive API failsafes.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: HTML5, Vanilla JavaScript, Tailwind CSS (CDN for rapid prototyping)
- **Backend & Database**: Firebase Authentication & Firebase Firestore (NoSQL)
- **Mapping & GIS**: Leaflet.js, CARTO Basemaps (Positron & Dark Matter), Geofire (Geohashing)
- **Data APIs**: 
  - **Geoapify Places API** (Primary source for rich, structured POI data)
  - **Overpass API / OpenStreetMap** (Robust global fallback engine)
  - **Photon by Komoot** (Global city autocomplete & geocoding)
  - **GeoJS** (Silent IP Geolocation)
- **Analytics**: Vercel Web Analytics & Vercel Speed Insights

---

## 🚀 Setup & Local Preview

Clone the repository and run a simple local HTTP server:

```bash
git clone https://github.com/kazi716/silentspot.git
cd silentspot
python -m http.server 5500
```

Open `http://localhost:5500` in your browser to view the application.

---

## 🤝 Contributing
Found a great quiet spot? Use the in-app **Add a Spot** feature to drop a pin, submit verified Wi-Fi speeds, and log acoustic dB readings to help the community find focus!

---

*Designed and developed by Kazi Md Samim Faraj for the remote work community.*
