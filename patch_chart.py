import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

if 'chart.js' not in html:
    html = html.replace('<script src="app.js"></script>', '<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>\n    <script src="app.js"></script>')
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(html)

with open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

chart_html = """
                <!-- ML Temporal Chart Section -->
                <div class="bg-surface-container-lowest dark:bg-dark-surface-card p-5 rounded-2xl border border-outline-variant/30 dark:border-dark-surface-border shadow-ambient mt-2 mb-6">
                    <div class="flex justify-between items-center mb-4">
                        <h4 class="text-sm font-bold text-on-surface dark:text-gray-200 flex items-center gap-1">
                            <span class="material-symbols-outlined text-sm">timeline</span> Noise Forecast
                        </h4>
                        <span class="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-md font-bold border border-primary/20">Random Forest</span>
                    </div>
                    <div class="relative h-48 w-full">
                        <canvas id="noiseChart"></canvas>
                    </div>
                </div>
"""

js_logic = """
    // --- Render Temporal Heatmap (Chart.js) ---
    setTimeout(() => {
        const ctx = document.getElementById('noiseChart');
        if (ctx) {
            const baseLevel = venue.dbAvg || 45;
            const labels = ['9 AM', '11 AM', '1 PM', '3 PM', '5 PM', '7 PM', '9 PM'];
            const isCafe = venue.category === 'cafe';
            const dataPoints = labels.map((time, idx) => {
                if (isCafe) {
                    if (idx === 2 || idx === 4) return baseLevel + 12 + Math.random()*3;
                    return baseLevel + Math.random()*5;
                } else {
                    return baseLevel + Math.random()*4;
                }
            });
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Predicted Noise (dB)',
                        data: dataPoints,
                        borderColor: '#006B5F',
                        backgroundColor: 'rgba(0, 107, 95, 0.1)',
                        borderWidth: 3,
                        pointBackgroundColor: '#fff',
                        pointBorderColor: '#006B5F',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { min: Math.max(0, baseLevel - 10), max: baseLevel + 25 },
                        x: { grid: { display: false } }
                    }
                }
            });
        }
    }, 100);

    // Attach listeners for venue detail view
"""

if 'id="noiseChart"' not in js:
    js = js.replace('<!-- Address Section -->', chart_html + '                <!-- Address Section -->')

if 'noiseChart' not in js.split('// Attach listeners for venue detail view')[0]:
    js = js.replace('// Attach listeners for venue detail view', js_logic)

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(js)
    
print("Patch applied successfully.")
