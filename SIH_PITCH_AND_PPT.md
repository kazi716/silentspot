# 🚀 SilentSpot - SIH 2026 Pitch (Travel & Tourism)

**Targeting:** SIH26207 (AICTE) – Travel & Tourism (Student Innovation)

## 📌 The Problem
Digital Nomads, "Workation" tourists, and remote workers constantly struggle to find reliable workspaces. When travelling to new cities or states in India, existing apps like Google Maps show you *where* a café is, but they do not tell you if the Wi-Fi is reliable enough for a Zoom call, or if it is quiet enough to actually work. This lack of data hurts local tourism economies that could otherwise attract long-term digital nomads.

## 💡 The Solution
SilentSpot is a data-driven workspace discovery platform for "Workation" tourists. It maps out cafés, libraries, and coworking spaces globally and ranks them based on their **acoustic environment (dB)**, Wi-Fi speeds, and power outlet availability.

---

# 📊 SIH PPT Slide Content (Template Mapping)

### Slide 1: Idea / Approach
- **Problem:** "Workation" tourists and digital nomads visiting new cities struggle to find quiet, reliable workspaces. Current map apps lack acoustic and Wi-Fi reliability data.
- **Solution:** A crowdsourced discovery platform that ranks venues based on real-time acoustic environments (dB) and technical amenities.
- **Theme:** Travel & Tourism (Boosting local economies by attracting digital nomads).
- **Core Value:** Helping tourists find guaranteed focus zones in unfamiliar cities.

### Slide 2: Technology Stack
- **Frontend:** HTML5, Vanilla JavaScript, Tailwind CSS (Optimized for fast LCP).
- **Backend & Database:** Firebase Authentication & Firebase Firestore (NoSQL).
- **Mapping & GIS:** Leaflet.js, CARTO Basemaps, **Geofire (Geohashing)** for scalable global queries.
- **External APIs:** Geoapify Places API, OpenStreetMap (Overpass), Photon Geocoding, GeoJS.

### Slide 3: Use Cases
- **Live dB Sound Check:** Tourists can use their browser's Web Audio API to measure and submit the actual Decibel (dB) level of the room they are sitting in.
- **Community Crowdsourcing:** Travelers can drop pins, add new hidden gems, and submit verified Wi-Fi speeds to help future tourists.
- **Focus Audio Synthesizer:** Built-in ambient noise generator (Rain, Lo-fi Café) to help tourists zone in anywhere.

### Slide 4: Dependencies / Showstoppers (Our Hackathon Roadmap)
*Here is what we will build during the 36-hour event to expand our deployed MVP:*
1. **React/Next.js Migration:** Upgrading the frontend architecture for better state management.
2. **Historical dB Analytics:** Upgrading Firebase to track noise levels over time, generating graphs that show tourists the "Quietest times to visit".
3. **AI "Vibe Check" Summaries:** Integrating the Gemini AI API to read through all tourist feedback and generate a 1-sentence summary of the venue's vibe.
4. **IoT Hardware Extension:** Providing cheap Raspberry Pi decibel meters to local cafés to stream live noise data to our map.
