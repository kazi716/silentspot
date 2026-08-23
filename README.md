# 🎙️ SilentSpot - Workation Tourism Intelligence Platform

**Targeting:** SIH26207 (Travel & Tourism)
**Institution:** JIS University

**SilentSpot** is an intelligent Workation Tourism Platform that transforms physical venues into measurable workation destinations. It predicts, measures, and recommends work-friendly environments using acoustic data, connectivity metrics, and geospatial intelligence to support India's rapidly growing remote work economy.

---

## 🎯 Hackathon Rubric Alignment

### 1. UI/UX Design & Usability
- **Modern Interface:** Tailwind CSS-powered responsive design optimized for mobile-first travelers.
- **Explainable Metrics:** Mathematical `Workation Score` (0-100) and `Data Reliability` metrics directly exposed in the UI.

### 2. Backend Architecture & Scalability
- **Live Database:** Firebase Firestore (NoSQL) architecture supporting real-time cross-device synchronization.
- **Scalable Geospatial Queries:** Implements `geofire-common` to generate 10-character geohashes, restricting database reads to 15km bounding boxes instead of global scans.
- **Serverless Analytics:** Leaderboard system driven by Firebase user data tracking.

### 3. ML/AI Integration (MLOps)
- **Temporal Acoustic Prediction:** Implements an ML Pipeline (`ml_pipeline/train_model.py`) using `scikit-learn`.
- **Model:** Random Forest Regressor trained on historical venue noise data, day of the week, and hour of the day to predict temporal acoustic conditions (e.g., "Expected noise at 1:00 PM: 64 dB").
- **Evaluation Metrics:** Evaluated against Mean Absolute Error (MAE) and RMSE.

### 4. Code Quality & Best Practices (DevOps)
- **VCS & CI/CD:** Hosted on GitHub with Vercel CI/CD pipeline triggering automated deployments on the `master` branch.
- **Security:** Strict Firebase Security Rules restricting writes to authenticated payloads and validated schemas.

### 5. Problem-Solution Fit
- **Tourism Economic Impact:** Solves the core problem of digital nomads being unable to verify remote work environments, encouraging longer tourist stays in Tier-2 and Tier-3 cities.

---

## ⚙️ Core Technical Features
- 📍 **OpenStreetMap & Geoapify:** Global venue discovery fallback algorithms.
- 🎤 **Web Audio API:** Real-time environmental decibel (dB) sampling via device microphones.
- 🗺️ **Leaflet.js:** Custom geospatial visualization and dynamic map markers.

---

## 🚀 Local Development

1. Clone the repository
2. Run a local web server (e.g., `python -m http.server 5500`)
3. Open `http://localhost:5500`

## 🧠 MLOps Pipeline Execution
To train the acoustic prediction model:
```bash
pip install pandas scikit-learn numpy
python ml_pipeline/train_model.py
```
This will output model accuracy (MAE/RMSE) and generate `demo_predictions.json`.
