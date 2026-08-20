const query = '[out:json];node["amenity"="cafe"](around:1000,40.7185,-74.0080);out center;';
fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: 'data=' + encodeURIComponent(query)
}).then(r => console.log(r.status)).catch(console.error);
