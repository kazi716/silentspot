const query = '[out:json];node["amenity"="cafe"](around:1000,40.7185,-74.0080);out center;';
fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain', 'User-Agent': 'SilentSpot/1.0' },
    body: query
}).then(async r => {
    console.log(r.status);
    if(r.status === 200) {
        const text = await r.text();
        console.log(text.substring(0, 100));
    }
}).catch(console.error);
