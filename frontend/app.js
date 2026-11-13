// app.js — логика для ZORI Earth Dance Observatory
// Связывает интерфейс с бэкендом на Google Cloud

document.addEventListener('DOMContentLoaded', () => {
    // --- Проверяем конфиг ---
    if (!window.NISAR_CONFIG) {
        console.error("config.js не загружен!");
        alert("Ошибка: config.js не загружен.");
        return;
    }

    // --- Состояние ---
    let selectedChange = null;
    let selectedLat = null;
    let selectedLng = null;
    let map = null;
    let currentMarker = null;

    // --- Элементы ---
    const intro = document.getElementById('intro');
    const app = document.getElementById('app');
    const btnBegin = document.getElementById('begin');
    const btnAnalyze = document.getElementById('analyze');
    const statusBox = document.getElementById('status');
    const statusText = document.getElementById('status-text');
    const statusDetail = document.getElementById('status-detail');
    const resultBox = document.getElementById('result');

    // --- Карта MapLibre ---
    if (typeof maplibregl !== 'undefined' && document.getElementById('map')) {
        map = new maplibregl.Map({
            container: 'map',
            style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
            center: [0, 20],
            zoom: 1.5
        });

        map.on('click', (e) => {
            selectedLng = e.lngLat.lng;
            selectedLat = e.lngLat.lat;

            document.getElementById('p-coords').innerText = `${selectedLat.toFixed(4)}, ${selectedLng.toFixed(4)}`;
            document.getElementById('p-name').innerText = 'Selected Point';

            if (currentMarker) currentMarker.remove();
            currentMarker = new maplibregl.Marker({color: '#a78bfa'})
                .setLngLat([selectedLng, selectedLat])
                .addTo(map);

            checkDataAvailability();
        });
    }

    // --- Выбор типа изменения ---
    document.querySelectorAll('.change-card').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.change-card').forEach(b => b.setAttribute('aria-pressed', 'false'));
            btn.setAttribute('aria-pressed', 'true');
            selectedChange = btn.dataset.change;
            document.documentElement.dataset.change = selectedChange;
            if (selectedLat && selectedLng) checkDataAvailability();
        });
    });

    // --- Кнопка "Begin mission" ---
    if (btnBegin) {
        btnBegin.addEventListener('click', () => {
            intro.classList.add('leaving');
            setTimeout(() => {
                intro.hidden = true;
                app.hidden = false;
                document.body.dataset.screen = 'app';
                if (map) map.resize();
            }, 450);
        });
    }

    // --- Проверка доступности данных ---
    async function checkDataAvailability() {
        if (!selectedChange || !selectedLat) return;

        statusBox.dataset.state = 'checking';
        statusText.innerText = 'Scanning NISAR archive...';
        statusDetail.innerText = 'Please wait...';
        btnAnalyze.disabled = true;

        try {
            const res = await fetch(`${window.NISAR_CONFIG.BACKEND_URL}/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': window.NISAR_CONFIG.API_KEY
                },
                body: JSON.stringify({
                    lat: selectedLat,
                    lon: selectedLng,
                    start_date: '2025-07-30',
                    end_date: new Date().toISOString().split('T')[0]
                })
            });

            const data = await res.json();
            if (data.error) throw new Error(data.error);

            if (data.count > 0) {
                statusBox.dataset.state = 'found';
                statusText.innerText = 'NISAR Data Found';
                statusDetail.innerText = `${data.count} scenes available.`;
                btnAnalyze.disabled = false;
            } else {
                statusBox.dataset.state = 'none';
                statusText.innerText = 'No data here yet';
                statusDetail.innerText = 'NISAR has not covered this exact point.';
            }
        } catch (err) {
            statusBox.dataset.state = 'error';
            statusText.innerText = 'Connection Error';
            statusDetail.innerText = err.message;
        }
    }

    // --- Запуск анализа ---
    if (btnAnalyze) {
        btnAnalyze.addEventListener('click', async () => {
            btnAnalyze.disabled = true;
            btnAnalyze.innerText = 'Launching...';

            try {
                const res = await fetch(`${window.NISAR_CONFIG.BACKEND_URL}/analyze`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-API-Key': window.NISAR_CONFIG.API_KEY
                    },
                    body: JSON.stringify({
                        lat: selectedLat,
                        lon: selectedLng,
                        start_date: '2025-07-30',
                        end_date: new Date().toISOString().split('T')[0]
                    })
                });

                const data = await res.json();
                if (data.error) throw new Error(data.error);
                pollJobStatus(data.job_id);

            } catch (err) {
                alert('Analysis failed: ' + err.message);
                btnAnalyze.disabled = false;
                btnAnalyze.innerText = 'Analyze this place';
            }
        });
    }

    // --- Опрос статуса ---
    async function pollJobStatus(jobId) {
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`${window.NISAR_CONFIG.BACKEND_URL}/status/${jobId}`, {
                    headers: { 'X-API-Key': window.NISAR_CONFIG.API_KEY }
                });
                const data = await res.json();

                if (data.status === 'done') {
                    clearInterval(interval);
                    showResult(jobId, data.stats);
                } else if (data.status === 'error') {
                    clearInterval(interval);
                    alert('Processing error: ' + data.error);
                }
            } catch (e) { console.error(e); }
        }, 5000);
    }

    // --- Показ результата ---
    function showResult(jobId, stats) {
        resultBox.hidden = false;
        resultBox.innerHTML = `
            <h2>Analysis Complete</h2>
            <div style="display:flex; gap:20px; flex-wrap:wrap;">
                <div style="flex:2; min-width:300px;">
                    <img src="${window.NISAR_CONFIG.BACKEND_URL}/image/${jobId}?api_key=${window.NISAR_CONFIG.API_KEY}" style="width:100%; border-radius:10px;">
                </div>
                <div style="flex:1; min-width:200px;">
                    <p><strong>Phase Range:</strong> ${stats.phase_min.toFixed(2)} to ${stats.phase_max.toFixed(2)} rad</p>
                    <p><strong>Displacement:</strong> ${stats.disp_min_cm.toFixed(2)} to ${stats.disp_max_cm.toFixed(2)} cm</p>
                </div>
            </div>
        `;
    }
});
