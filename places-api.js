// SilentSpot - OpenStreetMap Places API Integration & User Contribution System
// Fetches real venue data from the Overpass API (free, no API key needed)

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

function getUserContribution(venueId) {
    try {
        const data = localStorage.getItem(`silentspot_contrib_${venueId}`);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        console.error('Error reading contribution', e);
        return null;
    }
}

function saveUserContribution(venueId, field, value) {
    try {
        const contrib = getUserContribution(venueId) || {
            photo: null,
            wifiSpeed: null,
            dbAvg: null,
            review: null
        };
        contrib[field] = value;
        localStorage.setItem(`silentspot_contrib_${venueId}`, JSON.stringify(contrib));
        return contrib;
    } catch (e) {
        console.error('Error saving contribution', e);
        return null;
    }
}

function getAllContributions() {
    const contributions = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('silentspot_contrib_')) {
            try {
                const venueId = key.replace('silentspot_contrib_', '');
                contributions[venueId] = JSON.parse(localStorage.getItem(key));
            } catch (e) {
                console.error('Error parsing contribution key', key, e);
            }
        }
    }
    return contributions;
}

function mapOSMToVenue(element, index, userLocationName) {
    if (!element.tags || !element.tags.name) return null;

    const lat = element.lat || (element.center && element.center.lat) || 0;
    const lng = element.lon || (element.center && element.center.lon) || 0;

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
    
    // Load contributions
    const contrib = getUserContribution(venueId);

    return {
        id: venueId,
        name: element.tags.name,
        type: defaults.type,
        category: category,
        address: constructedAddress,
        neighborhood: userLocationName,
        distance: '...', // Can be updated externally
        calculatedDistance: 0,
        lat: lat,
        lng: lng,
        dbAvg: contrib && contrib.dbAvg != null ? contrib.dbAvg : defaults.dbAvg,
        dbStatus: defaults.dbStatus,
        wifiSpeed: contrib && contrib.wifiSpeed != null ? contrib.wifiSpeed : defaults.wifiSpeed,
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

async function fetchRealVenues(lat, lng, radiusMeters = 2000) {
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
                console.warn(`Overpass API error on ${endpoint}: ${response.status}`);
                lastError = new Error(`Overpass API error: ${response.status}`);
                continue; // try next endpoint
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.warn(`Error fetching from ${endpoint}:`, error);
            lastError = error;
            continue; // try next endpoint
        }
    }

    console.error('All Overpass API endpoints failed.');
    throw lastError;
}
