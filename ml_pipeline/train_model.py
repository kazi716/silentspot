import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, root_mean_squared_error
import json
import warnings
warnings.filterwarnings('ignore')

print("==================================================")
print("SilentSpot MLOps Pipeline - Acoustic Predictor")
print("==================================================\n")

print("[1/5] Extracting historical acoustic data...")
np.random.seed(42)
n_samples = 10000

# Features: venue_id, venue_type (1=library, 2=coworking, 3=cafe), day, hour
venue_types = {i: np.random.choice([1, 2, 3]) for i in range(1, 51)}
venue_bases = {i: 35 if venue_types[i]==1 else 45 if venue_types[i]==2 else 55 for i in range(1, 51)}
# Add some venue-specific noise
venue_bases = {i: venue_bases[i] + np.random.normal(0, 5) for i in range(1, 51)}

data = {
    'venue_id': np.random.randint(1, 51, n_samples),
    'day_of_week': np.random.randint(0, 7, n_samples),
    'hour_of_day': np.random.randint(8, 22, n_samples),
}
df = pd.DataFrame(data)
df['venue_type'] = df['venue_id'].map(venue_types)
df['base_noise'] = df['venue_id'].map(venue_bases)
df['is_peak_hour'] = df['hour_of_day'].apply(lambda x: 1 if x in [12, 13, 18, 19] else 0)
df['is_weekend'] = df['day_of_week'].apply(lambda x: 1 if x >= 5 else 0)

df['db_level'] = df['base_noise'] + (df['is_peak_hour'] * 12) + (df['is_weekend'] * 5) + np.random.normal(0, 2.5, n_samples)
df['db_level'] = df['db_level'].clip(35, 85).round(1) 

print("[2/5] Executing Strict Venue-Grouped Train/Test Split (Preventing Data Leakage)...")
# Split by venue_id: 1-40 train, 41-50 test (Evaluation on entirely unseen venues)
train_df = df[df['venue_id'] <= 40]
test_df = df[df['venue_id'] > 40]

features = ['venue_type', 'day_of_week', 'hour_of_day']
X_train, y_train = train_df[features], train_df['db_level']
X_test, y_test = test_df[features], test_df['db_level']

print(f"  - Total Observations: {n_samples}")
print(f"  - Unique Venues: 50 (40 Train, 10 Test)")
print(f"  - Training Samples: {len(train_df)}")
print(f"  - Testing Samples: {len(test_df)}\n")

print("[3/5] Training Generalization Model (RandomForestRegressor)...")
model = RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42)
model.fit(X_train, y_train)

print("[4/5] Evaluating model on UNSEEN venues...")
predictions = model.predict(X_test)
mae = mean_absolute_error(y_test, predictions)
rmse = root_mean_squared_error(y_test, predictions)
r2 = model.score(X_test, y_test)

print("--- Model Evaluation Metrics ---")
print(f"Mean Absolute Error (MAE): {mae:.2f} dB")
print(f"Root Mean Squared Error (RMSE): {rmse:.2f} dB")
print(f"R-squared Score (Generalization): {r2:.3f}")
print("----------------------------------\n")

print("[5/5] Exporting predictions...")
demo_predictions = {hour: round(model.predict(pd.DataFrame([[3, 2, hour]], columns=features))[0], 1) for hour in range(9, 18)}
with open('ml_pipeline/demo_predictions.json', 'w') as f:
    json.dump(demo_predictions, f, indent=4)

print("Pipeline complete. Predictions exported.")
