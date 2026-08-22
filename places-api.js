// SilentSpot - Geoapify Places API Integration & User Contribution System
// Primary: Geoapify Places API (reliable, structured, CORS-friendly)
// Fallback: Overpass API (free, no key needed)

const GEOAPIFY_API_KEY = 'a1cb8891652045e49d15b14cb4de0e6e';

const VENUE_PHOTO_POOLS = {
    cafe: [
        'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1453614512568-c4024d13c247?auto=format&fit=crop&w=1200&q=80',
    ],
    library: [
        'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=1200&q=80',
    ],
    coworking: [
        'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1462826303086-329426d1aef5?auto=format&fit=crop&w=1200&q=80',
    ]
};

const VENUE_TYPE_DEFAULTS = {
    cafe: {
        type: 'Quiet Café',
        category: 'cafe',
        dbAvg: 45,
        dbRange: '40-50',
        dbStatus: 'Typical café ambiance with soft background chatter.',
        wifiSpeed: 50,
        wifiStatus: 'Guest Wi-Fi available',
        outletCoverage: 40,
        outletStatus: 'Limited outlets available',
        seating: 'Café Seating',
        seatingDesc: 'Standard café tables and chairs.',
        stayPolicy: '1-2 hr Typical',
        stayPolicyDesc: 'Purchase expected for extended stays.',
        occupancyOptions: ['Low', 'Medium', 'High'],
        occupancyColors: ['bg-emerald-500', 'bg-yellow-400', 'bg-red-400'],
        amenities: ['Wi-Fi Available', 'Coffee & Beverages']
    },
    library: {
        type: 'Library',
        category: 'library',
        dbAvg: 32,
        dbRange: '30-35',
        dbStatus: 'Quiet study environment with minimal noise.',
        wifiSpeed: 80,
        wifiStatus: 'Public network available',
        outletCoverage: 60,
        outletStatus: 'Outlets at study desks',
        seating: 'Study Desks',
        seatingDesc: 'Individual study desks and reading areas.',
        stayPolicy: 'Full Day Access',
        stayPolicyDesc: 'Open to public during library hours.',
        occupancyOptions: ['Low', 'Medium'],
        occupancyColors: ['bg-emerald-500', 'bg-yellow-400'],
        amenities: ['Quiet Zone', 'Free Access', 'Printing Services']
    },
    coworking: {
        type: 'Coworking Space',
        category: 'coworking',
        dbAvg: 38,
        dbRange: '35-42',
        dbStatus: 'Managed noise levels with focus zones.',
        wifiSpeed: 150,
        wifiStatus: 'High-speed business network',
        outletCoverage: 90,
        outletStatus: 'Outlets at every desk',
        seating: 'Ergonomic Workstations',
        seatingDesc: 'Height-adjustable desks and ergonomic chairs.',
        stayPolicy: 'Day Pass / Membership',
        stayPolicyDesc: 'Flexible access with day passes available.',
        occupancyOptions: ['Low', 'Medium', 'High'],
        occupancyColors: ['bg-emerald-500', 'bg-yellow-400', 'bg-red-400'],
        amenities: ['High-Speed Wi-Fi', 'Ergonomic Chairs', 'Meeting Rooms']
    }
};

const DEMO_VENUES = [
    {
        id: 'demo-cafe-1',
        name: 'Demo: The Chapter House Café',
        type: 'Quiet Café',
        category: 'cafe',
        address: 'Demo Location',
        neighborhood: 'Demo City',
        distance: '0.3 mi',
        calculatedDistance: 0.3,
        lat: 0, lng: 0,
        dbAvg: 42,
        dbStatus: 'Library-like hush. Ideal for deep focus.',
        wifiSpeed: 145,
        wifiStatus: 'Stable & Fiber-backed',
        outletCoverage: 90,
        outletStatus: 'Every table has access',
        seating: 'Ergonomic Seating',
        seatingDesc: 'Large shared oak tables & padded chairs.',
        stayPolicy: '3 hr+ Stay Friendly',
        stayPolicyDesc: 'No purchase-per-hour pressure.',
        occupancy: 'Low',
        occupancyColor: 'bg-emerald-500',
        hours: 'Open until 8:00 PM',
        image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80',
        amenities: ['Abundant Natural Light', 'Ergonomic Chairs', 'Call-friendly Patio'],
        feedback: [{ quote: 'Perfect for deep work. Extremely quiet.', author: 'Demo User' }],
        isRealData: false
    },
    {
        id: 'demo-library-1',
        name: 'Demo: Central Reading Vault',
        type: 'Library',
        category: 'library',
        address: 'Demo Location',
        neighborhood: 'Demo City',
        distance: '0.5 mi',
        calculatedDistance: 0.5,
        lat: 0, lng: 0,
        dbAvg: 34,
        dbStatus: 'Acoustically soundproofed research hall.',
        wifiSpeed: 280,
        wifiStatus: 'High Speed Fiber Direct',
        outletCoverage: 95,
        outletStatus: 'Outlets at every study desk',
        seating: 'Study Carrels',
        seatingDesc: 'Spacious individual desks with reading lamps.',
        stayPolicy: 'Full Day Access',
        stayPolicyDesc: 'Open to public for quiet study.',
        occupancy: 'Low',
        occupancyColor: 'bg-emerald-500',
        hours: 'Open until 9:00 PM',
        image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80',
        amenities: ['Quiet Zone', 'Abundant Natural Light', 'Printing Services'],
        feedback: [{ quote: 'Super quiet space, perfect for focus.', author: 'Demo User' }],
        isRealData: false
    },
    {
        id: 'demo-cowork-1',
        name: 'Demo: Serenity Work Lab',
        type: 'Coworking Space',
        category: 'coworking',
        address: 'Demo Location',
        neighborhood: 'Demo City',
        distance: '0.8 mi',
        calculatedDistance: 0.8,
        lat: 0, lng: 0,
        dbAvg: 37,
        dbStatus: 'Strict silent focus floor.',
        wifiSpeed: 320,
        wifiStatus: 'Gigabit Mesh',
        outletCoverage: 100,
        outletStatus: 'Built-in AC & USB ports',
        seating: 'Standing & Task Chairs',
        seatingDesc: 'Height adjustable standing desks.',
        stayPolicy: 'Day Pass / Flexible',
        stayPolicyDesc: 'Quiet protocol strictly enforced.',
        occupancy: 'Medium',
        occupancyColor: 'bg-yellow-400',
        hours: 'Open 24/7',
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
        amenities: ['Standing Desks', 'Quiet Zone Only', 'Meeting Rooms'],
        feedback: [{ quote: 'Fast Wi-Fi and zero noise distractions.', author: 'Demo User' }],
        isRealData: false
    },
    {
        id: 'demo-cafe-2',
        name: 'Demo: Acoustic Nook & Roastery',
        type: 'Quiet Café',
        category: 'cafe',
        address: 'Demo Location',
        neighborhood: 'Demo City',
        distance: '1.2 mi',
        calculatedDistance: 1.2,
        lat: 0, lng: 0,
        dbAvg: 44,
        dbStatus: 'Soft acoustic background music.',
        wifiSpeed: 140,
        wifiStatus: 'Fast Wi-Fi',
        outletCoverage: 80,
        outletStatus: 'Booths equipped with outlets',
        seating: 'Leather Booths',
        seatingDesc: 'Spacious booths with soft lighting.',
        stayPolicy: '2-3 hr Friendly',
        stayPolicyDesc: 'Staff respects focused work.',
        occupancy: 'Low',
        occupancyColor: 'bg-emerald-500',
        hours: 'Open until 7:30 PM',
        image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
        amenities: ['Call-friendly Patio', 'Natural Light'],
        feedback: [{ quote: 'Cozy atmosphere with great seating.', author: 'Demo User' }],
        isRealData: false
    }
];

window.VENUE_CONTRIBUTIONS = {};

async function syncFirebaseContributions(venueIds = []) {
    try {
        if (!window.firebaseDb || venueIds.length === 0) return;
        
        // Firestore 'in' query supports max 30 items. Chunk the array.
        const chunkSize = 30;
        for (let i = 0; i < venueIds.length; i += chunkSize) {
            const chunk = venueIds.slice(i, i + chunkSize);
            const snapshot = await window.firebaseDb.collection('contributions')
                .where(firebase.firestore.FieldPath.documentId(), 'in', chunk)
                .get();
                
            snapshot.forEach(doc => {
                window.VENUE_CONTRIBUTIONS[doc.id] = doc.data();
            });
        }
        console.log(`Firebase contributions synced for ${venueIds.length} venues`);
    } catch (e) {
        console.error('Error syncing Firebase contributions:', e);
    }
}

function getUserContribution(venueId) {
    return window.VENUE_CONTRIBUTIONS[venueId] || null;
}

async function saveUserContribution(venueId, field, value) {
    try {
        const contrib = window.VENUE_CONTRIBUTIONS[venueId] || {
            photo: null,
            wifiSpeed: null,
            dbAvg: null,
            review: null
        };
        contrib[field] = value;
        
        // Update local cache instantly
        window.VENUE_CONTRIBUTIONS[venueId] = contrib;
        
        // Persist to Firebase Firestore
        if (window.firebaseDb) {
            const payload = { 
                ...contrib, 
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                userAgent: navigator.userAgent
            };
            await window.firebaseDb.collection('contributions').doc(venueId).set(payload, { merge: true });
        }

        return contrib;
    } catch (e) {
        console.error('Error saving contribution', e);
        throw e; // Throw so UI can catch and alert user gracefully
    }
}

function getAllContributions() {
    return window.VENUE_CONTRIBUTIONS;
}

// ── Geoapify Venue Mapper ──────────────────────────────────────────
function mapGeoapifyToVenue(feature, index, userLocationName) {
    const props = feature.properties;
    if (!props.name) return null;

    // Extract coordinates — try properties first, then geometry
    let lat = parseFloat(props.lat);
    let lng = parseFloat(props.lon);
    
    // Fallback to geometry.coordinates [lng, lat] if properties don't have valid coords
    if ((isNaN(lat) || isNaN(lng)) && feature.geometry && feature.geometry.coordinates) {
        lng = parseFloat(feature.geometry.coordinates[0]);
        lat = parseFloat(feature.geometry.coordinates[1]);
    }
    
    // Skip venues with invalid coordinates entirely
    if (isNaN(lat) || isNaN(lng)) return null;

    // Determine category from Geoapify categories array
    let category = 'cafe';
    const cats = (props.categories || []).join(',');
    if (cats.includes('education.library')) {
        category = 'library';
    } else if (cats.includes('office.coworking') || cats.includes('office')) {
        category = 'coworking';
    }

    const defaults = VENUE_TYPE_DEFAULTS[category];
    const pool = VENUE_PHOTO_POOLS[category];
    const photoUrl = pool[index % pool.length];

    const occupancyIndex = Math.floor(Math.random() * defaults.occupancyOptions.length);
    const randomOccupancy = defaults.occupancyOptions[occupancyIndex];
    const matchingColor = defaults.occupancyColors[occupancyIndex];

    // Use Geoapify's structured address data
    const constructedAddress = props.address_line2 || props.formatted || userLocationName || 'Unknown Location';
    const openingHours = props.opening_hours || 'Hours not listed';

    // Check for Wi-Fi from raw OSM data
    let wifiStatus = defaults.wifiStatus;
    if (props.datasource && props.datasource.raw) {
        const raw = props.datasource.raw;
        if (raw.internet_access === 'wlan' || raw.internet_access === 'yes') {
            wifiStatus = 'Wi-Fi confirmed available';
        }
    }

    // Check for wheelchair accessibility
    const amenities = [...defaults.amenities];
    if (props.facilities && props.facilities.wheelchair) {
        amenities.push('Wheelchair Accessible');
    }

    const venueId = `geo-${props.place_id ? props.place_id.substring(0, 16) : index}`;

    // Load user contributions
    const contrib = getUserContribution(venueId);

    return {
        id: venueId,
        name: props.name,
        type: defaults.type,
        category: category,
        address: constructedAddress,
        neighborhood: props.district || props.suburb || props.city || userLocationName,
        distance: '...',
        calculatedDistance: 0,
        lat: lat,
        lng: lng,
        dbAvg: contrib && contrib.dbAvg != null ? contrib.dbAvg : defaults.dbAvg,
        dbRange: defaults.dbRange,
        isVerifiedDb: !!(contrib && contrib.dbAvg != null),
        dbStatus: defaults.dbStatus,
        wifiSpeed: contrib && contrib.wifiSpeed != null ? contrib.wifiSpeed : defaults.wifiSpeed,
        isVerifiedWifi: !!(contrib && contrib.wifiSpeed != null),
        wifiStatus: wifiStatus,
        outletCoverage: defaults.outletCoverage,
        outletStatus: defaults.outletStatus,
        seating: defaults.seating,
        seatingDesc: defaults.seatingDesc,
        stayPolicy: defaults.stayPolicy,
        stayPolicyDesc: defaults.stayPolicyDesc,
        occupancy: randomOccupancy,
        occupancyColor: matchingColor,
        hours: openingHours,
        image: contrib && contrib.photo ? contrib.photo : photoUrl,
        amenities: amenities,
        feedback: contrib && contrib.review ? [contrib.review] : [{ quote: 'Be the first to leave a review!', author: 'SilentSpot Community' }],
        website: props.website || null,
        phone: props.contact && props.contact.phone ? props.contact.phone : null,
        isRealData: true
    };
}

// ── Legacy OSM Venue Mapper (for Overpass fallback) ────────────────
function mapOSMToVenue(element, index, userLocationName) {
    if (!element.tags || !element.tags.name) return null;

    const lat = parseFloat(element.lat || (element.center && element.center.lat)) || 0;
    const lng = parseFloat(element.lon || (element.center && element.center.lon)) || 0;

    // Skip venues with invalid coordinates
    if (isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) return null;

    let category = 'cafe';
    if (element.tags.amenity === 'library') {
        category = 'library';
    } else if (element.tags.amenity === 'coworking_space' || element.tags.office === 'coworking') {
        category = 'coworking';
    }

    const defaults = VENUE_TYPE_DEFAULTS[category];
    const pool = VENUE_PHOTO_POOLS[category];
    const photoUrl = pool[index % pool.length];

    const occupancyIndex = Math.floor(Math.random() * defaults.occupancyOptions.length);
    const randomOccupancy = defaults.occupancyOptions[occupancyIndex];
    const matchingColor = defaults.occupancyColors[occupancyIndex];

    let constructedAddress = userLocationName || 'Unknown Location';
    if (element.tags['addr:street']) {
        constructedAddress = `${element.tags['addr:housenumber'] ? element.tags['addr:housenumber'] + ' ' : ''}${element.tags['addr:street']}`;
        if (element.tags['addr:city']) constructedAddress += `, ${element.tags['addr:city']}`;
    }

    let openingHours = element.tags.opening_hours || 'Hours not listed';

    let wifiStatus = defaults.wifiStatus;
    if (element.tags.internet_access === 'wlan' || element.tags.internet_access === 'yes') {
        wifiStatus = 'Wi-Fi confirmed available';
    }

    const venueId = `osm-${element.id}`;
    const contrib = getUserContribution(venueId);

    return {
        id: venueId,
        name: element.tags.name,
        type: defaults.type,
        category: category,
        address: constructedAddress,
        neighborhood: userLocationName,
        distance: '...',
        calculatedDistance: 0,
        lat: lat,
        lng: lng,
        dbAvg: contrib && contrib.dbAvg != null ? contrib.dbAvg : defaults.dbAvg,
        dbRange: defaults.dbRange,
        isVerifiedDb: !!(contrib && contrib.dbAvg != null),
        dbStatus: defaults.dbStatus,
        wifiSpeed: contrib && contrib.wifiSpeed != null ? contrib.wifiSpeed : defaults.wifiSpeed,
        isVerifiedWifi: !!(contrib && contrib.wifiSpeed != null),
        wifiStatus: wifiStatus,
        outletCoverage: defaults.outletCoverage,
        outletStatus: defaults.outletStatus,
        seating: defaults.seating,
        seatingDesc: defaults.seatingDesc,
        stayPolicy: defaults.stayPolicy,
        stayPolicyDesc: defaults.stayPolicyDesc,
        occupancy: randomOccupancy,
        occupancyColor: matchingColor,
        hours: openingHours,
        image: contrib && contrib.photo ? contrib.photo : photoUrl,
        amenities: defaults.amenities,
        feedback: contrib && contrib.review ? [contrib.review] : [{ quote: 'Be the first to leave a review!', author: 'SilentSpot Community' }],
        isRealData: true
    };
}

// ── PRIMARY: Geoapify Places API ───────────────────────────────────
async function fetchRealVenues(lat, lng, radiusMeters = 15000) {
    // 1. Try Geoapify Places API first (Primary Source)
    try {
        const data = await fetchGeoapifyVenues(lat, lng, radiusMeters);
        if (data && data.features && data.features.length > 0) {
            console.log(`✅ Geoapify returned ${data.features.length} venues`);
            // Sync ONLY the specific venues on screen to prevent massive read quotas
            const venueIds = data.features.map((f, i) => `geo-${f.properties.place_id ? f.properties.place_id.substring(0, 16) : i}`);
            await syncFirebaseContributions(venueIds);
            
            return { source: 'geoapify', data: data };
        }
    } catch (err) {
        console.warn('Geoapify failed, falling back to Overpass:', err);
    }

    // 2. Fallback to Overpass API
    try {
        const data = await fetchOverpassVenues(lat, lng, radiusMeters);
        if (data && data.elements && data.elements.length > 0) {
            console.log(`✅ Overpass returned ${data.elements.length} elements`);
            // Sync ONLY the specific venues on screen
            const venueIds = data.elements.map(el => `osm-${el.id}`);
            await syncFirebaseContributions(venueIds);
            
            return { source: 'overpass', data: data };
        }
    } catch (err) {
        console.warn('Overpass fallback also failed:', err);
    }

    // Both failed
    throw new Error('All venue APIs failed');
}

// Geoapify Places API call
async function fetchGeoapifyVenues(lat, lng, radiusMeters) {
    const categories = 'catering.cafe,education.library,office.coworking';
    const url = `https://api.geoapify.com/v2/places?categories=${categories}&filter=circle:${lng},${lat},${radiusMeters}&limit=40&apiKey=${GEOAPIFY_API_KEY}`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Geoapify API error: ${response.status}`);
    }
    return await response.json();
}

// --- Custom Venues Logic (User-Submitted) ---

async function geocodeAddress(address) {
    try {
        const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(address)}&limit=1`;
        const response = await fetch(url);
        const data = await response.json();
        if (data && data.features && data.features.length > 0) {
            const props = data.features[0].properties;
            const coords = data.features[0].geometry.coordinates; // [lng, lat]
            
            // Reconstruct a nice formatted address from Photon data
            const formatted = [props.name, props.street, props.city, props.state, props.postcode]
                .filter(Boolean)
                .join(', ');

            return {
                lat: coords[1],
                lng: coords[0],
                formattedAddress: formatted || address
            };
        }
    } catch (e) {
        console.warn("Photon geocoding failed:", e);
    }
    return null;
}

async function saveCustomVenue(venueData) {
    if (!window.firebaseDb) throw new Error("Firebase not initialized");
    
    // Assign a default photo based on category
    const pool = VENUE_PHOTO_POOLS[venueData.category] || VENUE_PHOTO_POOLS['cafe'];
    const randomPhoto = pool[Math.floor(Math.random() * pool.length)];
    
    const defaults = VENUE_TYPE_DEFAULTS[venueData.category] || VENUE_TYPE_DEFAULTS['cafe'];
    
    const docData = {
        name: venueData.name,
        address: venueData.address,
        lat: venueData.lat,
        lng: venueData.lng,
        category: venueData.category,
        type: defaults.type,
        dbAvg: venueData.dbAvg != null ? venueData.dbAvg : null,
        dbStatus: venueData.dbAvg != null ? defaults.dbStatus : 'Noise level unconfirmed',
        wifiSpeed: venueData.wifiSpeed != null ? venueData.wifiSpeed : null,
        wifiStatus: venueData.wifiSpeed != null ? defaults.wifiStatus : 'Wi-Fi unconfirmed',
        outletCoverage: defaults.outletCoverage,
        outletStatus: defaults.outletStatus,
        seating: defaults.seating,
        seatingDesc: defaults.seatingDesc,
        stayPolicy: defaults.stayPolicy,
        stayPolicyDesc: defaults.stayPolicyDesc,
        occupancyOptions: defaults.occupancyOptions,
        occupancyColors: defaults.occupancyColors,
        hours: 'Hours not listed',
        image: randomPhoto,
        amenities: defaults.amenities,
        feedback: [{ quote: 'Added by the community!', author: 'SilentSpot User' }],
        isRealData: true,
        source: 'user_submission',
        createdBy: venueData.createdBy || 'anonymous',
        verifiedBy: [venueData.createdBy || 'anonymous'],
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    await window.firebaseDb.collection('custom_venues').add(docData);
}

async function verifyCustomVenue(venueId, uid) {
    if (!window.firebaseDb) throw new Error("Firebase not initialized");
    if (!uid) throw new Error("User must be logged in to verify");
    
    const venueRef = window.firebaseDb.collection('custom_venues').doc(venueId);
    await venueRef.update({
        verifiedBy: firebase.firestore.FieldValue.arrayUnion(uid)
    });
}

async function fetchCustomVenues() {
    if (!window.firebaseDb) return [];
    try {
        const snapshot = await window.firebaseDb.collection('custom_venues').get();
        const customVenues = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            
            // Reconstruct it as a full venue object for our grid
            customVenues.push({
                id: `custom-${doc.id}`,
                name: data.name,
                type: data.type,
                category: data.category,
                address: data.address,
                neighborhood: 'Community Added',
                distance: '...',
                calculatedDistance: 0,
                lat: data.lat,
                lng: data.lng,
                dbAvg: data.dbAvg,
                dbRange: data.dbAvg != null ? data.dbAvg : '--',
                isVerifiedDb: data.dbAvg != null,
                dbStatus: data.dbStatus,
                wifiSpeed: data.wifiSpeed,
                isVerifiedWifi: data.wifiSpeed != null,
                wifiStatus: data.wifiStatus,
                outletCoverage: data.outletCoverage,
                outletStatus: data.outletStatus,
                seating: data.seating,
                seatingDesc: data.seatingDesc,
                stayPolicy: data.stayPolicy,
                stayPolicyDesc: data.stayPolicyDesc,
                occupancy: data.occupancyOptions[0],
                occupancyColor: data.occupancyColors[0],
                hours: data.hours,
                image: data.image,
                amenities: data.amenities,
                feedback: data.feedback,
                isRealData: true,
                isCustom: true // Special flag
            });
        });
        return customVenues;
    } catch (e) {
        console.error("Error fetching custom venues:", e);
        return [];
    }
}

// Overpass API call (fallback)
async function fetchOverpassVenues(lat, lng, radiusMeters) {
    const query = `[out:json][timeout:15];
(
  node["amenity"="cafe"](around:${radiusMeters},${lat},${lng});
  node["amenity"="library"](around:${radiusMeters},${lat},${lng});
  node["amenity"="coworking_space"](around:${radiusMeters},${lat},${lng});
  node["office"="coworking"](around:${radiusMeters},${lat},${lng});
  way["amenity"="cafe"](around:${radiusMeters},${lat},${lng});
  way["amenity"="library"](around:${radiusMeters},${lat},${lng});
  way["amenity"="coworking_space"](around:${radiusMeters},${lat},${lng});
  way["office"="coworking"](around:${radiusMeters},${lat},${lng});
);
out center body;`;

    const endpoints = [
        'https://overpass-api.de/api/interpreter',
        'https://lz4.overpass-api.de/api/interpreter',
        'https://z.overpass-api.de/api/interpreter',
        'https://overpass.kumi.systems/api/interpreter'
    ];

    let lastError = null;

    for (const endpoint of endpoints) {
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: 'data=' + encodeURIComponent(query)
            });

            if (!response.ok) {
                console.warn(`Overpass error on ${endpoint}: ${response.status}`);
                lastError = new Error(`Overpass API error: ${response.status}`);
                continue;
            }

            return await response.json();
        } catch (error) {
            console.warn(`Error fetching from ${endpoint}:`, error);
            lastError = error;
            continue;
        }
    }

    throw lastError;
}
