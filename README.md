# **Vibe-Coders**
# 🎙️ SilentSpot - Workation Tourism Intelligence Platform

## 🎯 **Targeting**

**Problem Statement ID:** 26204<br>
**Problem Statement Title:** Student Innovation-A solution/idea that can boost the current situation of the tourism industries including hotels, travel and others.<br>
**Theme:** Travel & Tourism<br>
**PS Category:** Software<br>
**Description:** Technology ideas in tertiary sectors such as Hospitality, Financial Services, Entertainment, and Retail.<br>
**Institution:** JIS University<br>
**Team ID:**<br>
**Team Name:** vibe-coders <br>

---
## 🎯 **Problem** <br>

Finding a place is easy. Finding a good place to work is not. <br>
While travelling, people may need a place to work or attend an important meeting: <br>

• Employees on vacation may need to attend an urgent company meeting. <br>
• Business traveller may need a place to work between meetings. <br>
• Digital nomads and remote workers need a good place to work. <br>
• Traveller may need a quiet place for an important video call. <br>

**Existing maps often do not tell:** <br>
• Is the place quiet? <br>
• Is the internet good? <br>
• Are power outlets available?
• Will the place be noisy at a particular time? <br>
• Is the information recent and reliable? <br>

## 💡 **Solution** <br>

SilentSpot is a Workation Tourism Intelligence Platform that analyzes acoustic conditions, connectivity, amenities, reliability, and geospatial data to identify and rank work-friendly locations. Using community-driven measurements and machine learning-based acoustic prediction, it helps users discover suitable places to work and travel with confidence.<br>

## **Short Overview**
<h5>
SilentSpot is a Workation Tourism Intelligence Platform that helps remote workers, students, and digital nomads discover and evaluate work-friendly places. It analyzes acoustic conditions, Wi-Fi connectivity, amenities, reliability, and location data to generate an intelligent Workation Score and predict how noise levels may change over time. By combining community-driven measurements, machine learning, and geospatial intelligence, SilentSpot makes it easier to find productive and comfortable places to work while exploring new destinations
</h5>

---
## 🎯 Key Features
- **Intelligent Workation Score:** Deterministic ranking based on weighted environmental metrics.
- **Data Reliability Score:** Transparency heuristic scaling with community verification.
- **Temporal Acoustic Prediction:** Random Forest model predicting noise fluctuations based on day and hour.
- **Real-time Community Measurements:** Live Web Audio API integration for instant acoustic feedback.
- **Geospatial Discovery:** Location-aware venue fetching prioritizing local business discovery.



## 🧮 Workation Scoring Engine
The Workation Score (0-100) is a deterministic weighted average:
- **35% Acoustic:** Rewards verified quiet environments (< 45 dB).
- **35% Connectivity:** Rewards high-speed Wi-Fi (> 50 Mbps).
- **15% Amenities:** Rewards comprehensive power outlet coverage.
- **15% Reliability:** Rewards recent crowdsourced verification.


## 🧠 ML Pipeline (Acoustic Prediction)
Our machine learning pipeline extracts historical acoustic data to predict future noise conditions (e.g., "Predicted acoustic level at 1:00 PM: 64").

### Evaluation Methodology
To prevent data leakage, we utilize a strict **Venue-Grouped Split**, ensuring the model is evaluated exclusively on venues it has never seen during training.

- **Total Observations:** 15,000
- **Unique Venues:** 250 (200 Train / 50 Unseen Test)
- **Naive Baseline (Mean Guess):** MAE: 7.33 dB | R²: -0.003
- **Random Forest Model:** MAE: 4.24 dB | RMSE: 5.05 dB | R²: 0.688

*Our prototype Random Forest model demonstrates meaningful generalization to previously unseen venues, reducing the error margin (MAE) by ~42% compared to the naive baseline.*

> **Dataset Note:** Because the live platform does not yet have months of production observations, we generated a synthetic dataset to validate the ML pipeline, features, and evaluation methodology. The production system is designed to seamlessly replace this with real observations as they accumulate.
> 

## ⚙️ Backend Architecture & Scalability
- **Real-Time Database:** Firebase Firestore handles live, cross-device synchronization of community acoustic measurements.
- **Geohashing:** Implements `geofire-common` with 10-character geohashes and 15km bounding boxes. This limits database reads to the user's relevant geographic region instead of retrieving the global venue dataset, ensuring massive scalability.
- **Security:** Strict Firebase Security Rules restricting writes to authenticated payloads.

## 🗺️ Tech Stack
- **Frontend:** Vanilla JavaScript, Tailwind CSS, Leaflet.js (CARTO basemaps)
- **Backend/Auth:** Firebase Authentication, Firestore
- **Data APIs:** Geoapify provides structured POI discovery, with OpenStreetMap-based lookup serving as a fallback source.
- **ML Pipeline:** Python, `pandas`, `scikit-learn`
- **CI/CD (DevOps):** Vercel auto-deployments linked to GitHub `master` branch.


---
## ▶️**Watch the Demo Video** <br>

**YouTube:** [Watch on YouTube] https://www.youtube.com/watch?v=oDWZ_CSJRcg   <br>

📁 **Google Drive:** [Watch on Google Drive] https://drive.google.com/file/d/1dB8atQt1K-9Ontx-IJagq8qdIpfSteYU/view?usp=sharing  <br>

---
## ⚠️ Current Limitations
- **Microphone Calibration:** Acoustic readings from browser microphones are environmental indicators, not calibrated SPL measurements.
- **Synthetic ML Benchmark:** The current ML evaluation uses synthetic data to validate the architecture while real-world observations accumulate. Prediction quality will be re-evaluated using production data.
- **Network Dependency:** Connectivity measurements depend heavily on the user's local network/device capabilities.

---

## 🚀 Local Development

1. Clone the repository.
2. Run a local web server: `python -m http.server 5500`
3. Open `http://localhost:5500`

## 🧠 ML Pipeline Execution
To execute the ML training and evaluation script:
```bash
pip install pandas scikit-learn numpy
python ml_pipeline/train_model.py
```
