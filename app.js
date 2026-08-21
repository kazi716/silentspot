// SilentSpot - Full Application Logic with Geolocation, Nominatim Map, Workspace Comparison & Focus Audio Synthesizer

// Preset Location Work Hubs
const PRESET_LOCATIONS = [
    { name: "Lower Manhattan, NY", lat: 40.7185, lng: -74.0080 },
    { name: "Midtown West, NY", lat: 40.7535, lng: -73.9810 },
    { name: "Greenwich Village, NY", lat: 40.7295, lng: -73.9970 },
    { name: "SoHo, NY", lat: 40.7250, lng: -74.0025 },
    { name: "Brooklyn Heights, NY", lat: 40.6945, lng: -73.9930 },
    { name: "Upper East Side, NY", lat: 40.7794, lng: -73.9632 }
];

// Dynamic Venues Array — populated from OpenStreetMap Overpass API
let VENUES = [];

// App State
const state = {
    currentTab: 'explore',
    currentLocation: 'Lower Manhattan, NY',
    currentLat: 40.7185,
    currentLng: -74.0080,
    maxDistanceRadius: 5.0,
    savedVenueIds: JSON.parse(localStorage.getItem('silentspot_saved_venues') || '[]'),
    activeQuickFilter: 'all',
    searchQuery: '',
    filters: {
        maxDb: 55,
        minWifi: 0,
        minOutlets: 0,
        amenities: []
    },
    selectedVenueId: null,
    checkInVenueId: null,
    checkInTimerInterval: null,
    checkInSeconds: 0,
    micStream: null,
    audioContext: null,
    analyser: null,
    leafletMap: null,
    mapMarkers: [],
    heatmapCircles: [],
    targetMarker: null,
    activeAmbientTrack: null,
    ambientNodes: null,
    ambientGain: null,
    totalFocusMinutes: parseInt(localStorage.getItem('silentspot_focus_minutes') || '0', 10),
    userName: 'You',
    isLoggedIn: false,
    userEmail: null
};

// --- GAMIFICATION & AI VIBE LOGIC ---
const GAMIFICATION_LEVELS = [
    { name: 'Novice', min: 0, icon: 'psychology', color: 'from-gray-300 to-gray-400' },
    { name: 'Focused', min: 60, icon: 'self_improvement', color: 'from-blue-400 to-indigo-500' },
    { name: 'Deep Worker', min: 300, icon: 'mindfulness', color: 'from-emerald-400 to-teal-500' },
    { name: 'Zen Master', min: 1000, icon: 'diamond', color: 'from-purple-500 to-fuchsia-500' },
];

function getUserLevel(minutes) {
    let currentLevel = GAMIFICATION_LEVELS[0];
    let nextLevel = GAMIFICATION_LEVELS[1];

    for (let i = 0; i < GAMIFICATION_LEVELS.length; i++) {
        if (minutes >= GAMIFICATION_LEVELS[i].min) {
            currentLevel = GAMIFICATION_LEVELS[i];
            nextLevel = GAMIFICATION_LEVELS[i + 1] || null;
        }
    }
    return { currentLevel, nextLevel };
}

function generateVibeSummary(venue) {
    const isQuiet = venue.dbAvg <= 45;
    const isFast = venue.wifiSpeed >= 100;
    const isPower = venue.outletCoverage >= 70;

    let vibes = [];
    if (isQuiet && isFast) vibes.push("Ultimate productivity sanctuary");
    else if (isQuiet) vibes.push("Library-like hush for deep work");
    else if (isFast) vibes.push("High-speed hub with energetic chatter");
    else vibes.push("Casual spot for light reading");

    if (venue.amenities && venue.amenities.includes("Ergonomic Chairs")) vibes[0] += " & great seating.";
    else if (venue.amenities && venue.amenities.includes("Abundant Natural Light")) vibes[0] += " drenched in sunlight.";
    else if (isPower) vibes[0] += " with endless power.";
    else vibes[0] += ".";

    return vibes[0];
}

function renderProfileView() {
    const { currentLevel, nextLevel } = getUserLevel(state.totalFocusMinutes);

    document.getElementById('profile-focus-minutes').textContent = state.totalFocusMinutes;
    document.getElementById('profile-level-name').textContent = currentLevel.name;

    // New Header Fields
    const greetingName = document.getElementById('profile-greeting-name');
    if (greetingName) greetingName.textContent = state.userName;

    const emailDisplay = document.getElementById('profile-email-display');
    if (emailDisplay) emailDisplay.textContent = state.userEmail || 'Guest';

    const avatar = document.getElementById('profile-avatar-initial');
    if (avatar) avatar.textContent = state.userName.charAt(0).toUpperCase();

    const badge = document.getElementById('profile-level-badge');
    badge.className = `w-24 h-24 rounded-full bg-gradient-to-br ${currentLevel.color} mx-auto flex items-center justify-center shadow-lg border-4 border-white dark:border-dark-surface-card mb-3 transition-colors duration-500`;
    badge.innerHTML = `<span class="material-symbols-outlined text-5xl text-white">${currentLevel.icon}</span>`;

    const progressBar = document.getElementById('profile-progress-bar');
    const nextLevelText = document.getElementById('profile-next-level');

    if (nextLevel) {
        const progress = Math.min(100, (state.totalFocusMinutes / nextLevel.min) * 100);
        progressBar.style.width = `${progress}%`;
        nextLevelText.textContent = `${nextLevel.name} (${nextLevel.min}m)`;
    } else {
        progressBar.style.width = '100%';
        nextLevelText.textContent = 'Max Level Reached!';
    }

    const leaderboardList = document.getElementById('leaderboard-list');
    const mockUsers = [
        { name: "Sarah K.", mins: 1240, level: "Zen Master" },
        { name: "Alex M.", mins: 850, level: "Deep Worker" },
        { name: state.userName, mins: state.totalFocusMinutes, level: currentLevel.name, isUser: true },
        { name: "Jordan T.", mins: 320, level: "Deep Worker" },
        { name: "Emily R.", mins: 45, level: "Novice" }
    ];

    mockUsers.sort((a, b) => b.mins - a.mins);

    leaderboardList.innerHTML = mockUsers.map((u, i) => `
        <div class="flex items-center justify-between p-4 ${u.isUser ? 'bg-primary/5 dark:bg-primary/10' : ''}">
            <div class="flex items-center gap-4">
                <div class="font-bold text-secondary dark:text-gray-400 w-4 text-center">#${i + 1}</div>
                <div>
                    <div class="font-semibold text-sm ${u.isUser ? 'text-primary dark:text-primary-fixed-dim' : 'text-on-surface dark:text-gray-200'}">${u.name}</div>
                    <div class="text-[10px] text-secondary dark:text-gray-400">${u.level}</div>
                </div>
            </div>
            <div class="font-data-display text-sm font-bold text-on-surface dark:text-white">${u.mins} <span class="text-[10px] font-normal text-secondary">mins</span></div>
        </div>
    `).join('');

    renderContributionsList();
    renderProfileSavedGrid();
}

function renderContributionsList() {
    const listEl = document.getElementById('contributions-list');
    if (!listEl) return;

    const contributions = getAllContributions();
    const venueIds = Object.keys(contributions);

    if (venueIds.length === 0) {
        listEl.innerHTML = `
            <div class="text-center p-8 bg-surface-container-lowest dark:bg-dark-surface-card rounded-2xl border border-outline-variant/30 dark:border-dark-surface-border">
                <span class="material-symbols-outlined text-4xl text-secondary opacity-50 mb-2">volunteer_activism</span>
                <h4 class="font-bold text-on-surface dark:text-white mb-1">No Contributions Yet</h4>
                <p class="text-xs text-secondary dark:text-gray-400 max-w-xs mx-auto">Help the community by updating noise levels or Wi-Fi speeds when you visit a venue.</p>
            </div>
        `;
        return;
    }

    listEl.innerHTML = venueIds.map(id => {
        const c = contributions[id];
        const v = VENUES.find(venue => venue.id === id) || DEMO_VENUES.find(venue => venue.id === id);
        const venueName = v ? v.name : 'Unknown Venue';

        return `
            <div class="bg-surface-container-lowest dark:bg-dark-surface-card p-4 rounded-2xl border border-outline-variant/30 dark:border-dark-surface-border flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                    <div class="text-xs font-semibold text-primary dark:text-primary-fixed-dim mb-1">Contributed to</div>
                    <h4 class="font-bold text-sm text-on-surface dark:text-white">${venueName}</h4>
                </div>
                <div class="flex flex-wrap gap-2">
                    ${c.dbAvg ? `<span class="px-2 py-1 bg-surface-container text-[10px] font-bold rounded-lg text-on-surface dark:bg-dark-surface-border dark:text-gray-200">Noise: ${c.dbAvg} dB</span>` : ''}
                    ${c.wifiSpeed ? `<span class="px-2 py-1 bg-surface-container text-[10px] font-bold rounded-lg text-on-surface dark:bg-dark-surface-border dark:text-gray-200">Wi-Fi: ${c.wifiSpeed} Mbps</span>` : ''}
                    ${c.photo ? `<span class="px-2 py-1 bg-primary/10 text-[10px] font-bold rounded-lg text-primary dark:bg-primary-fixed-dim/20 dark:text-primary-fixed-dim">Added Photo</span>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function renderProfileSavedGrid() {
    const gridEl = document.getElementById('profile-saved-grid');
    if (!gridEl) return;

    const savedVenues = VENUES.filter(v => state.savedVenueIds.includes(v.id));
    if (savedVenues.length === 0) {
        gridEl.innerHTML = `
            <div class="col-span-full text-center p-8 bg-surface-container-lowest dark:bg-dark-surface-card rounded-2xl border border-outline-variant/30 dark:border-dark-surface-border">
                <span class="material-symbols-outlined text-4xl text-secondary opacity-50 mb-2">bookmark_border</span>
                <h4 class="font-bold text-on-surface dark:text-white mb-1">No Saved Venues</h4>
                <p class="text-xs text-secondary dark:text-gray-400">Save places you want to visit later.</p>
            </div>
        `;
        return;
    }

    gridEl.innerHTML = savedVenues.map(venue => `
        <div class="venue-card cursor-pointer group bg-surface-container-lowest dark:bg-dark-surface-card rounded-2xl overflow-hidden border border-outline-variant/30 dark:border-dark-surface-border shadow-sm hover:shadow-md transition-all flex flex-col" onclick="openVenueDetails('${venue.id}')">
            <div class="h-24 w-full bg-surface-container-high relative overflow-hidden shrink-0">
                <img src="${venue.image}" alt="${venue.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
            </div>
            <div class="p-3 flex flex-col flex-grow">
                <h3 class="font-bold text-on-surface dark:text-white text-sm line-clamp-1 mb-1 group-hover:text-primary transition-colors">${venue.name}</h3>
                <div class="flex gap-2 text-[10px] text-secondary font-medium">
                    <span class="flex items-center gap-0.5"><span class="material-symbols-outlined text-[12px]">volume_up</span> ${venue.dbAvg}dB</span>
                    <span class="flex items-center gap-0.5"><span class="material-symbols-outlined text-[12px]">wifi</span> ${venue.wifiSpeed}M</span>
                </div>
            </div>
        </div>
    `).join('');
}
// --- AUTHENTICATION LOGIC ---

function initAuthModal() {
    const authModal = document.getElementById('auth-modal');
    const closeBtn = document.getElementById('btn-close-auth');
    const form = document.getElementById('auth-form');
    const toggleBtn = document.getElementById('btn-auth-toggle');
    const toggleText = document.getElementById('auth-toggle-text');
    const submitBtn = document.getElementById('btn-auth-submit');
    const nameGroup = document.getElementById('auth-name-group');
    const title = document.getElementById('auth-title');
    const subtitle = document.getElementById('auth-subtitle');
    const errorText = document.getElementById('auth-error');

    let isLoginMode = true;

    // Toggle Login / Register
    toggleBtn.addEventListener('click', () => {
        isLoginMode = !isLoginMode;
        errorText.classList.add('hidden');
        if (isLoginMode) {
            nameGroup.classList.add('hidden');
            title.textContent = 'Welcome Back';
            subtitle.textContent = 'Sign in to access your profile and saved spots.';
            submitBtn.textContent = 'Sign In';
            toggleText.textContent = "Don't have an account?";
            toggleBtn.textContent = 'Create one';
        } else {
            nameGroup.classList.remove('hidden');
            title.textContent = 'Create Account';
            subtitle.textContent = 'Join SilentSpot to save venues and track your focus.';
            submitBtn.textContent = 'Sign Up';
            toggleText.textContent = 'Already have an account?';
            toggleBtn.textContent = 'Sign In';
        }
    });

    closeBtn.addEventListener('click', () => {
        authModal.classList.add('hidden');
        // Revert to explore tab if user canceled login while trying to access protected tabs
        if (state.currentTab === 'profile' || state.currentTab === 'saved') {
            document.querySelector('[data-tab="explore"]').click();
        }
    });

    const googleBtn = document.getElementById('btn-google-auth');
    if (googleBtn) {
        googleBtn.addEventListener('click', async () => {
            const provider = new firebase.auth.GoogleAuthProvider();
            try {
                await firebase.auth().signInWithPopup(provider);
                authModal.classList.add('hidden');
                errorText.classList.add('hidden');
                
                // state observer handles the refresh
            } catch (err) {
                console.error("Google Auth error:", err);
                errorText.textContent = err.message;
                errorText.classList.remove('hidden');
            }
        });
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Show loading state
        const originalBtnText = submitBtn.textContent;
        submitBtn.innerHTML = '<span class="material-symbols-outlined text-sm animate-spin">sync</span> Authenticating...';
        submitBtn.disabled = true;

        const email = document.getElementById('auth-email').value.trim();
        const password = document.getElementById('auth-password').value;
        const name = document.getElementById('auth-name').value.trim();

        if (!isLoginMode && name === '') {
            errorText.textContent = 'Please enter a display name.';
            errorText.classList.remove('hidden');
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
            return;
        }

        try {
            if (isLoginMode) {
                // Log in existing user
                await firebase.auth().signInWithEmailAndPassword(email, password);
            } else {
                // Create new user
                const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
                // Update profile with their display name
                await userCredential.user.updateProfile({ displayName: name });
                
                // Force a manual state update here so it's instantly ready
                state.userName = name;
            }

            authModal.classList.add('hidden');
            errorText.classList.add('hidden');
            form.reset();

            // Refresh Current Tab View if needed
            if (state.currentTab === 'profile') {
                renderProfileView();
            } else if (state.currentTab === 'saved') {
                renderSavedView();
            }
        } catch (error) {
            console.error("Auth error:", error);
            // Firebase sends back helpful error messages (e.g. 'invalid-email', 'wrong-password')
            errorText.textContent = error.message;
            errorText.classList.remove('hidden');
        } finally {
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
        }
    });
}

function requireAuth(callback) {
    if (state.isLoggedIn) {
        callback();
    } else {
        document.getElementById('auth-modal').classList.remove('hidden');
    }
}

function handleLogout() {
    firebase.auth().signOut().then(() => {
        state.isLoggedIn = false;
        state.userEmail = null;
        state.userName = null;
        
        // Redirect to Explore if they were on a protected tab
        if (state.currentTab === 'profile' || state.currentTab === 'saved') {
            switchTab('explore');
        }
    }).catch((error) => {
        console.error("Sign out error", error);
    });
}

// ------------------------------------

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    // Listen for real Firebase Auth state changes
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            state.isLoggedIn = true;
            state.userEmail = user.email;
            state.userName = user.displayName || 'SilentSpot User';
            
            // Refresh protected views if they are open
            if (state.currentTab === 'profile') renderProfileView();
            if (state.currentTab === 'saved') renderSavedView();
        } else {
            state.isLoggedIn = false;
            state.userEmail = null;
            state.userName = null;
        }
    });

    initTheme();
    initNavigation();
    initAuthModal();
    initLocationModal();
    initQuickFilters();
    initFilterModal();
    initCheckInModal();
    initSoundCheck();
    initAmbientAudio();
    initContributionModal();
    initAddVenueModal();
    initLeafletMap();

    // Initial data fetch based on IP Geolocation
    detectUserRegion().then(() => {
        loadRealVenues(state.currentLat, state.currentLng, state.currentLocation);
    });
    
    updateSavedBadge();
});

// Detect User Region (IP Geolocation)
async function detectUserRegion() {
    try {
        const response = await fetch('https://get.geojs.io/v1/ip/geo.json');
        if (response.ok) {
            const data = await response.json();
            if (data && data.latitude && data.longitude && data.city) {
                const locName = `${data.city}, ${data.region || data.country}`;
                const lat = parseFloat(data.latitude);
                const lng = parseFloat(data.longitude);
                
                state.currentLocation = locName;
                state.currentLat = lat;
                state.currentLng = lng;
                
                // Add to preset locations at the top
                PRESET_LOCATIONS.unshift({
                    name: `📍 Your Region: ${locName}`,
                    lat: lat,
                    lng: lng
                });
                console.log("📍 Detected user region:", locName);
                return;
            }
        }
    } catch (e) {
        console.warn("IP Geolocation failed:", e);
    }
    console.log("Using default region.");
}

// Haversine Distance Formula (miles)
function calcHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 3958.8; // Earth radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Load REAL venues from OpenStreetMap Overpass API
async function loadRealVenues(lat, lng, locationName) {
    const loadingEl = document.getElementById('venues-loading');
    const gridEl = document.getElementById('venues-grid');
    const bannerEl = document.getElementById('data-source-banner');

    // Show loading skeleton
    if (loadingEl) loadingEl.classList.remove('hidden');
    if (gridEl) gridEl.innerHTML = '';

    let newVenues = [];

    // 1 & 2. Fetch External APIs and Firestore Custom Venues in PARALLEL
    const realVenuesPromise = fetchRealVenues(lat, lng, 15000).catch(err => {
        console.warn('External venue APIs found no results or failed:', err);
        return null;
    });

    const customVenuesPromise = fetchCustomVenues().catch(e => {
        console.error("Failed to load custom venues", e);
        return [];
    });

    const [result, customVenues] = await Promise.all([realVenuesPromise, customVenuesPromise]);

    // Process External API Results
    if (result) {
        if (result.source === 'geoapify') {
            newVenues = result.data.features
                .map((f, i) => mapGeoapifyToVenue(f, i, locationName))
                .filter(v => v !== null);
        } else if (result.source === 'overpass') {
            newVenues = result.data.elements
                .map((el, i) => mapOSMToVenue(el, i, locationName))
                .filter(v => v !== null);
        }
    }

    // Merge Custom Venues
    if (customVenues && customVenues.length > 0) {
        newVenues = [...newVenues, ...customVenues];
    }

    if (newVenues.length > 0) {
        VENUES = newVenues;

        // Show success banner
        if (bannerEl) {
            bannerEl.className = 'mb-4 px-4 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800';
            bannerEl.innerHTML = '<span class="material-symbols-outlined text-sm">verified</span> Showing <strong>' + newVenues.length + ' real places</strong> near ' + locationName;
            bannerEl.classList.remove('hidden');
        }
    } else {
        // No named venues found AT ALL — use demo
        loadDemoVenues(lat, lng, locationName, bannerEl);
    }

    // Hide loading skeleton
    if (loadingEl) loadingEl.classList.add('hidden');

    // Recalculate distances and render
    setLocation(locationName, lat, lng);
}

function loadDemoVenues(lat, lng, locationName, bannerEl) {
    VENUES = DEMO_VENUES.map((v, i) => ({
        ...v,
        lat: Number(lat) + (Math.random() - 0.5) * 0.01,
        lng: Number(lng) + (Math.random() - 0.5) * 0.01,
        neighborhood: locationName
    }));

    if (bannerEl) {
        bannerEl.className = 'mb-4 px-4 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800';
        bannerEl.innerHTML = '<span class="material-symbols-outlined text-sm">info</span> Showing <strong>demo venues</strong> — no real places found nearby or API unavailable.';
        bannerEl.classList.remove('hidden');
    }
}

// Location Selector System with Geocoding
function initLocationModal() {
    const modal = document.getElementById('location-modal');
    const openBtn = document.getElementById('btn-location-selector');
    const closeBtn = document.getElementById('btn-close-location-modal');
    const applyBtn = document.getElementById('btn-apply-location');
    const gpsBtn = document.getElementById('btn-detect-gps');
    const gpsBtnText = document.getElementById('gps-btn-text');
    const searchInput = document.getElementById('location-search-input');
    const radiusSlider = document.getElementById('location-radius-slider');
    const radiusDisplay = document.getElementById('location-radius-display');
    const discoverHereBtn = document.getElementById('btn-discover-here');

    if (openBtn) {
        openBtn.addEventListener('click', () => {
            renderPresetLocationsList();
            modal.classList.remove('hidden');
        });
    }

    if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.add('hidden'));

    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            // Check if there is an active search and we have results
            if (autocompleteDropdown) {
                const firstResult = autocompleteDropdown.querySelector('.autocomplete-item');
                if (searchInput.value.trim().length >= 3 && firstResult && !autocompleteDropdown.classList.contains('hidden')) {
                    firstResult.click(); // This triggers loadRealVenues and closes modal
                    return;
                }
            }

            // Otherwise, just close modal and reload venues with current radius/location
            modal.classList.add('hidden');
            loadRealVenues(state.currentLat, state.currentLng, state.currentLocation);
        });
    }

    if (discoverHereBtn) {
        discoverHereBtn.addEventListener('click', () => {
            loadRealVenues(state.currentLat, state.currentLng, state.currentLocation);
        });
    }

    // Photon City Search Autocomplete
    const autocompleteDropdown = document.getElementById('location-autocomplete-results');
    let debounceTimer;

    if (searchInput && autocompleteDropdown) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            const query = e.target.value.trim();

            if (query.length < 3) {
                autocompleteDropdown.classList.add('hidden');
                autocompleteDropdown.innerHTML = '';
                return;
            }

            debounceTimer = setTimeout(async () => {
                try {
                    const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`);
                    if (!res.ok) throw new Error('Photon API error');
                    const data = await res.json();

                    if (data.features.length === 0) {
                        autocompleteDropdown.innerHTML = '<li class="p-3 text-xs text-secondary text-center">No results found</li>';
                        autocompleteDropdown.classList.remove('hidden');
                        return;
                    }

                    const results = data.features.map(f => ({
                        name: f.properties.name,
                        city: f.properties.city || f.properties.country || f.properties.state,
                        lat: f.geometry.coordinates[1],
                        lng: f.geometry.coordinates[0]
                    }));

                    autocompleteDropdown.innerHTML = results.map(r => `
                        <li class="p-3 border-b border-outline-variant/20 last:border-0 hover:bg-surface-container-low dark:hover:bg-dark-surface-border cursor-pointer transition-colors autocomplete-item" data-lat="${r.lat}" data-lng="${r.lng}" data-name="${r.name}${r.city ? ', ' + r.city : ''}">
                            <div class="font-bold text-xs text-on-surface dark:text-white">${r.name}</div>
                            <div class="text-[10px] text-secondary dark:text-gray-400">${r.city || ''}</div>
                        </li>
                    `).join('');
                    autocompleteDropdown.classList.remove('hidden');

                    // Bind click events to items
                    document.querySelectorAll('.autocomplete-item').forEach(item => {
                        item.addEventListener('click', () => {
                            const lat = parseFloat(item.getAttribute('data-lat'));
                            const lng = parseFloat(item.getAttribute('data-lng'));
                            const name = item.getAttribute('data-name');

                            searchInput.value = '';
                            autocompleteDropdown.classList.add('hidden');
                            modal.classList.add('hidden');

                            loadRealVenues(lat, lng, name);
                        });
                    });
                } catch (err) {
                    console.error('Photon autocomplete error:', err);
                }
            }, 300);
        });

        // Hide dropdown on clicking outside
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !autocompleteDropdown.contains(e.target)) {
                autocompleteDropdown.classList.add('hidden');
            }
        });

        // Allow pressing Enter to select first result
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const firstResult = autocompleteDropdown.querySelector('.autocomplete-item');
                if (firstResult && !autocompleteDropdown.classList.contains('hidden')) {
                    firstResult.click();
                } else if (applyBtn) {
                    applyBtn.click();
                }
            }
        });
    }

    // Radius Slider
    if (radiusSlider && radiusDisplay) {
        radiusSlider.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value).toFixed(1);
            radiusDisplay.textContent = `${val} miles`;
            state.maxDistanceRadius = parseFloat(val);
        });
        
        radiusSlider.addEventListener('change', () => {
            renderVenuesGrid();
            if (state.currentTab === 'map') renderMapMarkers();
        });
    }

    // GPS Location Detection Button
    if (gpsBtn) {
        gpsBtn.addEventListener('click', () => {
            if (!navigator.geolocation) {
                alert('Geolocation is not supported by your browser.');
                return;
            }

            gpsBtnText.textContent = 'Locating GPS Coordinates...';
            gpsBtn.disabled = true;

            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;

                    let locationName = 'Current GPS Location';
                    try {
                        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                        const data = await res.json();
                        if (data && data.display_name) {
                            const parts = data.display_name.split(',');
                            locationName = `${parts[0].trim()}, ${parts[1] ? parts[1].trim() : ''}`;
                        }
                    } catch (e) {
                        console.warn('Reverse geocode error:', e);
                    }

                    gpsBtnText.textContent = 'GPS Found!';
                    setTimeout(() => {
                        loadRealVenues(lat, lng, locationName);
                        modal.classList.add('hidden');
                        gpsBtnText.textContent = 'Detect My Current GPS Location';
                        gpsBtn.disabled = false;
                    }, 500);
                },
                (err) => {
                    alert('Unable to retrieve your GPS location. Please select or search a location.');
                    gpsBtnText.textContent = 'Detect My Current GPS Location';
                    gpsBtn.disabled = false;
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        });
    }

    // Search Input with OpenStreetMap Nominatim Geocoding API
    let searchTimeout = null;
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            if (searchTimeout) clearTimeout(searchTimeout);

            if (query.length < 2) {
                renderPresetLocationsList();
                return;
            }

            searchTimeout = setTimeout(async () => {
                const list = document.getElementById('preset-locations-list');
                if (list) list.innerHTML = '<p class="text-xs text-secondary py-2 flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-primary animate-ping"></span> Searching world map coordinates...</p>';

                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
                    const results = await res.json();

                    if (!results || results.length === 0) {
                        if (list) list.innerHTML = '<p class="text-xs text-secondary py-2">No map locations found for this query.</p>';
                        return;
                    }

                    const formattedResults = results.map(item => {
                        const parts = item.display_name.split(',');
                        const shortName = `${parts[0].trim()}, ${parts[1] ? parts[1].trim() : ''}`;
                        return {
                            name: shortName,
                            full: item.display_name,
                            lat: parseFloat(item.lat),
                            lng: parseFloat(item.lon)
                        };
                    });

                    renderCustomLocationsList(formattedResults);
                } catch (err) {
                    console.warn('Location search API error:', err);
                    renderPresetLocationsList();
                }
            }, 400);
        });
    }
}

function renderPresetLocationsList() {
    renderCustomLocationsList(PRESET_LOCATIONS);
}

function renderCustomLocationsList(locationsArray) {
    const list = document.getElementById('preset-locations-list');
    if (!list) return;

    list.innerHTML = locationsArray.map(loc => {
        const isSelected = state.currentLocation === loc.name;
        return `
            <button class="preset-loc-btn w-full p-2.5 rounded-xl border ${isSelected ? 'bg-primary/10 border-primary text-primary font-bold dark:bg-primary-fixed-dim/20 dark:text-primary-fixed-dim dark:border-primary-fixed-dim' : 'border-outline-variant/30 dark:border-dark-surface-border text-on-surface dark:text-gray-200 hover:bg-surface-container dark:hover:bg-dark-surface-border'} flex items-center justify-between text-xs transition-colors" data-name="${loc.name}" data-lat="${loc.lat}" data-lng="${loc.lng}">
                <div class="flex items-center gap-2 text-left truncate">
                    <span class="material-symbols-outlined text-base ${isSelected ? 'text-primary dark:text-primary-fixed-dim' : 'text-secondary'} shrink-0">location_on</span>
                    <span class="truncate">${loc.name}</span>
                </div>
                ${isSelected ? '<span class="material-symbols-outlined text-base shrink-0">check</span>' : ''}
            </button>
        `;
    }).join('');

    list.querySelectorAll('.preset-loc-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const name = btn.getAttribute('data-name');
            const lat = parseFloat(btn.getAttribute('data-lat'));
            const lng = parseFloat(btn.getAttribute('data-lng'));

            loadRealVenues(lat, lng, name);
            document.getElementById('location-modal').classList.add('hidden');
        });
    });
}

function setLocation(name, lat, lng) {
    lat = parseFloat(lat);
    lng = parseFloat(lng);

    // Guard against NaN coordinates
    if (isNaN(lat) || isNaN(lng)) {
        console.warn('setLocation called with invalid coords, using defaults');
        lat = 40.7185;
        lng = -74.0080;
    }

    state.currentLocation = name;
    state.currentLat = lat;
    state.currentLng = lng;

    const locText = document.getElementById('current-location-text');
    if (locText) locText.textContent = name;

    // Recalculate distance from new location for all venues
    VENUES.forEach(venue => {
        if (isNaN(venue.lat) || isNaN(venue.lng)) return;
        const dist = calcHaversineDistance(lat, lng, venue.lat, venue.lng);
        venue.calculatedDistance = dist;
        venue.distance = `${dist.toFixed(1)} mi`;
    });

    // Sort by proximity
    VENUES.sort((a, b) => a.calculatedDistance - b.calculatedDistance);

    renderVenuesGrid();

    if (state.leafletMap) {
        state.leafletMap.flyTo([lat, lng], 13, { duration: 1.2 });
        renderMapMarkers();
    }
}

// Theme Toggle Functionality
function initTheme() {
    const isDark = localStorage.getItem('silentspot_theme') === 'dark' ||
        (!('silentspot_theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }

    document.getElementById('btn-theme-toggle').addEventListener('click', () => {
        const currentlyDark = document.documentElement.classList.contains('dark');
        if (currentlyDark) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('silentspot_theme', 'light');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('silentspot_theme', 'dark');
        }
        if (state.leafletMap) {
            updateMapTileLayer();
        }
    });
}

// Navigation & Tab Switcher
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-btn');
    navLinks.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetTab = btn.getAttribute('data-tab');
            if (targetTab) {
                switchTab(targetTab);
            }
        });
    });

    document.getElementById('nav-brand').addEventListener('click', () => switchTab('explore'));
    document.getElementById('btn-toggle-list').addEventListener('click', () => switchTab('explore'));
    document.getElementById('btn-toggle-map').addEventListener('click', () => switchTab('map'));
    document.getElementById('map-btn-list').addEventListener('click', () => switchTab('explore'));
    document.getElementById('btn-back-to-explore').addEventListener('click', () => switchTab('explore'));
    document.getElementById('btn-explore-from-saved').addEventListener('click', () => switchTab('explore'));
    document.getElementById('btn-map-soundcheck').addEventListener('click', () => switchTab('soundcheck'));

    // Search Input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            state.searchQuery = e.target.value.toLowerCase().trim();
            renderVenuesGrid();
        });
    }

    // Profile Sub-tabs
    document.querySelectorAll('.profile-tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.profile-tab-btn').forEach(b => {
                b.classList.remove('active', 'text-primary', 'dark:text-primary-fixed-dim', 'border-b-2', 'border-primary', 'dark:border-primary-fixed-dim');
                b.classList.add('text-secondary');
            });
            e.target.classList.add('active', 'text-primary', 'dark:text-primary-fixed-dim', 'border-b-2', 'border-primary', 'dark:border-primary-fixed-dim');
            e.target.classList.remove('text-secondary');

            document.querySelectorAll('.profile-section').forEach(sec => {
                sec.classList.remove('block');
                sec.classList.add('hidden');
            });
            const targetId = e.target.getAttribute('data-target');
            document.getElementById(targetId).classList.remove('hidden');
            document.getElementById(targetId).classList.add('block');
        });
    });

    // Profile Logout and Theme
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    const themeProfileBtn = document.getElementById('btn-theme-toggle-profile');
    if (themeProfileBtn) {
        themeProfileBtn.addEventListener('click', () => {
            const html = document.documentElement;
            if (html.classList.contains('dark')) {
                html.classList.remove('dark');
                localStorage.setItem('silentspot_theme', 'light');
            } else {
                html.classList.add('dark');
                localStorage.setItem('silentspot_theme', 'dark');
            }
        });
    }
}

function switchTab(tabName) {
    if ((tabName === 'profile' || tabName === 'saved') && !state.isLoggedIn) {
        document.getElementById('auth-modal').classList.remove('hidden');
        return;
    }

    state.currentTab = tabName;

    // Update nav button active states
    document.querySelectorAll('.nav-link, .mobile-nav-btn').forEach(btn => {
        if (btn.getAttribute('data-tab') === tabName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Hide all view sections
    document.querySelectorAll('.tab-view').forEach(view => {
        view.classList.add('hidden');
        view.classList.remove('active');
    });

    // Show target view
    const activeView = document.getElementById(`view-${tabName}`);
    if (activeView) {
        activeView.classList.remove('hidden');
        activeView.classList.add('active');
    }

    // Tab-specific handlers
    if (tabName === 'map') {
        setTimeout(() => {
            if (state.leafletMap) {
                state.leafletMap.invalidateSize();
                renderMapMarkers();
            }
        }, 100);
    } else if (tabName === 'compare') {
        renderComparisonTable();
    } else if (tabName === 'profile') {
        renderProfileView();
    } else if (tabName === 'saved') {
        renderSavedVenues();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Quick Pills Filters
function initQuickFilters() {
    const pills = document.querySelectorAll('.quick-pill');
    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            pills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            state.activeQuickFilter = pill.getAttribute('data-quick-filter');
            renderVenuesGrid();
        });
    });
}

// Filter Venues by Search, Quick Pills, Distance Radius, and Modal Filters
function getFilteredVenues() {
    return VENUES.filter(venue => {
        // Distance Radius Filter
        if (venue.calculatedDistance && venue.calculatedDistance > state.maxDistanceRadius) {
            return false;
        }

        // Search Query
        if (state.searchQuery) {
            const q = state.searchQuery;
            const matchesName = venue.name.toLowerCase().includes(q);
            const matchesLoc = venue.neighborhood.toLowerCase().includes(q) || venue.address.toLowerCase().includes(q);
            const matchesType = venue.type.toLowerCase().includes(q);
            const matchesAmenities = venue.amenities.some(a => a.toLowerCase().includes(q));
            if (!matchesName && !matchesLoc && !matchesType && !matchesAmenities) {
                return false;
            }
        }

        // Quick Pill Filter
        if (state.activeQuickFilter === 'silent' && venue.dbAvg >= 45) return false;
        if (state.activeQuickFilter === 'wifi' && venue.wifiSpeed < 100) return false;
        if (state.activeQuickFilter === 'outlets' && venue.outletCoverage < 80) return false;
        if (state.activeQuickFilter === 'cafe' && venue.category !== 'cafe') return false;
        if (state.activeQuickFilter === 'library' && venue.category !== 'library') return false;

        // Modal Filters
        if (venue.dbAvg > state.filters.maxDb) return false;
        if (venue.wifiSpeed < state.filters.minWifi) return false;
        if (venue.outletCoverage < state.filters.minOutlets) return false;

        if (state.filters.amenities.length > 0) {
            const hasAllSelected = state.filters.amenities.every(amenity => venue.amenities.includes(amenity));
            if (!hasAllSelected) return false;
        }

        return true;
    });
}

// Render Venue Cards Grid
function renderVenuesGrid() {
    const grid = document.getElementById('venues-grid');
    const emptyState = document.getElementById('empty-state');
    if (!grid || !emptyState) return;

    const filtered = getFilteredVenues();

    if (filtered.length === 0) {
        grid.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');
    grid.innerHTML = filtered.map(venue => createVenueCardHtml(venue)).join('');

    // Attach Click Event Listeners
    filtered.forEach(venue => {
        const cardElem = document.getElementById(`card-${venue.id}`);
        if (cardElem) {
            cardElem.addEventListener('click', (e) => {
                if (e.target.closest('.btn-save-bookmark')) {
                    toggleSaveVenue(venue.id);
                    return;
                }
                openVenueDetail(venue.id);
            });
        }
    });
}

// Helper: Generate HTML for Venue Card
function createVenueCardHtml(venue) {
    const isSaved = state.savedVenueIds.includes(venue.id);
    const bookmarkIcon = isSaved ? 'bookmark' : 'bookmark_border';
    const bookmarkClass = isSaved ? 'text-primary dark:text-primary-fixed-dim' : 'text-secondary hover:text-primary';
    const aiVibe = generateVibeSummary(venue);

    return `
        <article id="card-${venue.id}" class="bg-surface-container-lowest dark:bg-dark-surface-card rounded-2xl shadow-ambient overflow-hidden border border-outline-variant/30 dark:border-dark-surface-border transition-all hover:shadow-modal hover:-translate-y-1 cursor-pointer flex flex-col group">
            <div class="h-48 w-full relative overflow-hidden bg-surface-container-high dark:bg-dark-surface-border">
                <img src="${venue.image}" alt="${venue.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy"/>
                
                <!-- Floating Distance Badge -->
                <div class="absolute top-3 left-3 bg-surface-container-lowest/90 dark:bg-dark-bg/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 text-on-surface dark:text-gray-200 shadow-sm border border-outline-variant/20 dark:border-dark-surface-border">
                    <span class="material-symbols-outlined text-xs text-primary dark:text-primary-fixed-dim">near_me</span>
                    <span class="font-data-display text-xs font-semibold">${venue.distance}</span>
                </div>

                <!-- Floating Bookmark Button -->
                <button class="btn-save-bookmark absolute top-3 right-3 p-2 rounded-full bg-surface-container-lowest/90 dark:bg-dark-bg/90 backdrop-blur-md ${bookmarkClass} shadow-sm transition-colors hover:scale-110">
                    <span class="material-symbols-outlined text-lg">${bookmarkIcon}</span>
                </button>
            </div>

            <div class="p-5 flex-grow flex flex-col justify-between">
                <div>
                    <!-- Header Title & dB Badge -->
                    <div class="flex justify-between items-start mb-2 gap-2">
                        <div>
                            <h3 class="font-headline-sm text-lg font-bold text-on-surface dark:text-white group-hover:text-primary dark:group-hover:text-primary-fixed-dim transition-colors leading-snug">${venue.name}</h3>
                            <p class="text-xs text-secondary dark:text-gray-400 font-medium">${venue.type} • ${venue.neighborhood}</p>
                        </div>
                        <div class="bg-primary/10 dark:bg-primary-fixed-dim/15 px-2.5 py-1.5 rounded-xl text-center min-w-[60px] shrink-0 border border-primary/20 flex flex-col justify-center items-center">
                            <div class="flex items-baseline gap-0.5">
                                <span class="block font-data-display text-base font-extrabold text-primary dark:text-primary-fixed-dim leading-none">${venue.isVerifiedDb ? venue.dbAvg : venue.dbRange}</span>
                                <span class="block font-label-caps text-[9px] font-bold text-primary dark:text-primary-fixed-dim uppercase tracking-wider">dB</span>
                            </div>
                            ${venue.isVerifiedDb
            ? `<span class="block text-[8px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mt-1">Verified</span>`
            : `<span class="block text-[7px] font-medium text-primary/70 dark:text-primary-fixed-dim/70 uppercase tracking-widest mt-1">Est.</span>`
        }
                        </div>
                    </div>

                    <!-- AI Vibe Insight -->
                    <div class="mb-3 px-2 py-1.5 bg-gradient-to-r from-purple-500/10 to-transparent border-l-2 border-purple-500 rounded-r text-[10px] font-medium text-secondary dark:text-gray-300 flex items-start gap-1">
                        <span class="material-symbols-outlined text-purple-500 text-[14px]">auto_awesome</span>
                        <span>${aiVibe}</span>
                    </div>

                    <!-- Amenities Tags -->
                    <div class="flex flex-wrap gap-1.5 mb-4">
                        ${venue.amenities.slice(0, 3).map(amenity => `
                            <span class="bg-surface-container dark:bg-dark-surface-border px-2 py-0.5 rounded-md text-[11px] text-secondary dark:text-gray-300 border border-outline-variant/20 dark:border-dark-surface-border">${amenity}</span>
                        `).join('')}
                    </div>

                    <!-- Metrics Bento Grid -->
                    <div class="grid grid-cols-4 gap-2 bg-surface-container-low dark:bg-dark-bg p-2.5 rounded-xl border border-outline-variant/30 dark:border-dark-surface-border mb-4">
                        <div class="flex flex-col">
                            <span class="text-[10px] text-secondary dark:text-gray-400 font-semibold uppercase">Noise</span>
                            <span class="font-data-display text-xs font-bold text-on-surface dark:text-gray-200">${venue.dbAvg} dB</span>
                        </div>
                        <div class="flex flex-col">
                            <span class="text-[10px] text-secondary dark:text-gray-400 font-semibold uppercase">Plugs</span>
                            <span class="font-data-display text-xs font-bold text-on-surface dark:text-gray-200">${venue.outletCoverage}%</span>
                        </div>
                        <div class="flex flex-col">
                            <span class="text-[10px] text-secondary dark:text-gray-400 font-semibold uppercase">Wi-Fi</span>
                            <span class="font-data-display text-xs font-bold text-on-surface dark:text-gray-200">${venue.wifiSpeed}M</span>
                        </div>
                        <div class="flex flex-col">
                            <span class="text-[10px] text-secondary dark:text-gray-400 font-semibold uppercase">Stay</span>
                            <span class="font-data-display text-xs font-bold text-on-surface dark:text-gray-200">${venue.stayPolicy.split(' ')[0]}</span>
                        </div>
                    </div>
                </div>

                <!-- Card Footer -->
                <div class="flex items-center justify-between pt-3 border-t border-outline-variant/30 dark:border-dark-surface-border">
                    <div class="flex items-center gap-1.5 text-xs font-medium text-secondary dark:text-gray-400">
                        <span class="w-2.5 h-2.5 rounded-full ${venue.occupancyColor} shadow-sm animate-pulse"></span>
                        <span>Occupancy: <strong class="text-on-surface dark:text-gray-200">${venue.occupancy}</strong></span>
                    </div>
                    <span class="text-xs font-semibold text-primary dark:text-primary-fixed-dim group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                        View Details
                        <span class="material-symbols-outlined text-sm">chevron_right</span>
                    </span>
                </div>
            </div>
        </article>
    `;
}

// Render Workspace Comparison Table Matrix
function renderCompareMatrix() {
    const headerRow = document.getElementById('compare-table-header');
    const tbody = document.getElementById('compare-table-body');
    if (!headerRow || !tbody) return;

    const visibleVenues = getFilteredVenues().slice(0, 4);

    if (visibleVenues.length === 0) {
        headerRow.innerHTML = '<th class="p-4">No venues to compare</th>';
        tbody.innerHTML = '';
        return;
    }

    headerRow.innerHTML = `
        <th class="p-4 text-xs font-bold uppercase text-secondary dark:text-gray-400 w-48">Metric / Spot</th>
        ${visibleVenues.map(v => `
            <th class="p-4 text-on-surface dark:text-white">
                <div class="flex items-center gap-2">
                    <img src="${v.image}" class="w-10 h-10 rounded-lg object-cover shadow-sm"/>
                    <div>
                        <div class="font-headline-sm font-bold text-sm leading-tight">${v.name}</div>
                        <div class="text-[11px] font-normal text-secondary dark:text-gray-400">${v.type} • ${v.distance}</div>
                    </div>
                </div>
            </th>
        `).join('')}
    `;

    tbody.innerHTML = `
        <tr>
            <td class="p-4 font-semibold text-secondary dark:text-gray-300">Live Noise Level (dB)</td>
            ${visibleVenues.map(v => `
                <td class="p-4">
                    <span class="font-data-display font-bold text-base ${v.dbAvg < 40 ? 'text-emerald-600 dark:text-emerald-400' : 'text-yellow-600 dark:text-yellow-400'}">${v.dbAvg} dB</span>
                    <div class="text-[10px] text-secondary">${v.dbStatus}</div>
                </td>
            `).join('')}
        </tr>
        <tr>
            <td class="p-4 font-semibold text-secondary dark:text-gray-300">Wi-Fi Speed</td>
            ${visibleVenues.map(v => `
                <td class="p-4">
                    <span class="font-data-display font-bold text-sm text-on-surface dark:text-white">${v.wifiSpeed} Mbps</span>
                    <div class="text-[10px] text-secondary">${v.wifiStatus}</div>
                </td>
            `).join('')}
        </tr>
        <tr>
            <td class="p-4 font-semibold text-secondary dark:text-gray-300">Power Outlet Coverage</td>
            ${visibleVenues.map(v => `
                <td class="p-4">
                    <span class="font-data-display font-bold text-sm text-on-surface dark:text-white">${v.outletCoverage}%</span>
                    <div class="text-[10px] text-secondary">${v.outletStatus}</div>
                </td>
            `).join('')}
        </tr>
        <tr>
            <td class="p-4 font-semibold text-secondary dark:text-gray-300">Seating Ergonomics</td>
            ${visibleVenues.map(v => `
                <td class="p-4 font-medium text-on-surface dark:text-gray-200">
                    ${v.seating}
                </td>
            `).join('')}
        </tr>
        <tr>
            <td class="p-4 font-semibold text-secondary dark:text-gray-300">Stay Policy</td>
            ${visibleVenues.map(v => `
                <td class="p-4 font-medium text-on-surface dark:text-gray-200">
                    ${v.stayPolicy}
                </td>
            `).join('')}
        </tr>
        <tr>
            <td class="p-4 font-semibold text-secondary dark:text-gray-300">Action</td>
            ${visibleVenues.map(v => `
                <td class="p-4">
                    <button onclick="openVenueDetail('${v.id}')" class="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-container transition-colors">
                        View Details
                    </button>
                </td>
            `).join('')}
        </tr>
    `;
}

// Web Audio Focus Audio Synthesizer (Rain, Café, Ocean Waves, 432Hz Alpha Binaural Beats)
function initAmbientAudio() {
    const ambientCards = document.querySelectorAll('.ambient-card');
    const stopBtn = document.getElementById('btn-stop-ambient');
    const volumeSlider = document.getElementById('ambient-volume-slider');
    const titleElem = document.getElementById('ambient-current-title');
    const statusElem = document.getElementById('ambient-current-status');
    const masterIcon = document.getElementById('ambient-master-icon');

    let audioCtx = null;

    function getAudioCtx() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }

    function stopCurrentTrack() {
        if (state.ambientNodes) {
            if (Array.isArray(state.ambientNodes)) {
                state.ambientNodes.forEach(n => { try { n.stop(); n.disconnect(); } catch (e) { } });
            } else {
                try { state.ambientNodes.stop(); state.ambientNodes.disconnect(); } catch (e) { }
            }
            state.ambientNodes = null;
        }
        state.activeAmbientTrack = null;
        if (titleElem) titleElem.textContent = 'Select a Sound Track';
        if (statusElem) statusElem.textContent = 'Click play above to start ambient focus audio';
        if (masterIcon) masterIcon.className = 'material-symbols-outlined text-2xl';

        document.querySelectorAll('.ambient-card').forEach(c => {
            const btn = c.querySelector('.btn-play-ambient');
            if (btn) btn.innerHTML = '<span class="material-symbols-outlined text-base">play_arrow</span><span>Play</span>';
        });
    }

    if (stopBtn) stopBtn.addEventListener('click', stopCurrentTrack);

    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            if (state.ambientGain) {
                state.ambientGain.gain.setValueAtTime(parseFloat(e.target.value), getAudioCtx().currentTime);
            }
        });
    }

    ambientCards.forEach(card => {
        card.addEventListener('click', () => {
            const soundType = card.getAttribute('data-sound');
            if (state.activeAmbientTrack === soundType) {
                stopCurrentTrack();
                return;
            }

            stopCurrentTrack();
            const ctx = getAudioCtx();

            state.ambientGain = ctx.createGain();
            state.ambientGain.gain.setValueAtTime(volumeSlider ? parseFloat(volumeSlider.value) : 0.7, ctx.currentTime);
            state.ambientGain.connect(ctx.destination);

            state.activeAmbientTrack = soundType;
            const cardBtn = card.querySelector('.btn-play-ambient');
            if (cardBtn) cardBtn.innerHTML = '<span class="material-symbols-outlined text-base">pause</span><span>Stop</span>';

            if (soundType === 'rain') {
                if (titleElem) titleElem.textContent = 'Playing: Soft Rainfall';
                if (statusElem) statusElem.textContent = 'Synthetic pink noise rain drops with low-pass filter';

                const bufferSize = ctx.sampleRate * 2;
                const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
                const output = buffer.getChannelData(0);
                let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
                for (let i = 0; i < bufferSize; i++) {
                    const white = Math.random() * 2 - 1;
                    b0 = 0.99886 * b0 + white * 0.0555179;
                    b1 = 0.99332 * b1 + white * 0.0750759;
                    b2 = 0.96900 * b2 + white * 0.1538520;
                    b3 = 0.86650 * b3 + white * 0.3104856;
                    b4 = 0.55000 * b4 + white * 0.5329522;
                    b5 = -0.7616 * b5 - white * 0.0168980;
                    output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
                    output[i] *= 0.11;
                    b6 = white * 0.115926;
                }

                const noise = ctx.createBufferSource();
                noise.buffer = buffer;
                noise.loop = true;

                const filter = ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.value = 1000;

                noise.connect(filter);
                filter.connect(state.ambientGain);
                noise.start();
                state.ambientNodes = noise;

            } else if (soundType === 'binaural') {
                if (titleElem) titleElem.textContent = 'Playing: 432Hz Alpha Waves';
                if (statusElem) statusElem.textContent = '10Hz Alpha brainwave entrainment (432Hz left, 442Hz right)';

                const oscL = ctx.createOscillator();
                const oscR = ctx.createOscillator();
                const merger = ctx.createChannelMerger(2);

                oscL.type = 'sine';
                oscL.frequency.value = 432;

                oscR.type = 'sine';
                oscR.frequency.value = 442;

                oscL.connect(merger, 0, 0);
                oscR.connect(merger, 0, 1);
                merger.connect(state.ambientGain);

                oscL.start();
                oscR.start();
                state.ambientNodes = [oscL, oscR];

            } else {
                // Ocean / Cafe ambient fallback
                if (titleElem) titleElem.textContent = `Playing: ${soundType === 'cafe' ? 'Café Ambience' : 'Ocean Waves'}`;
                if (statusElem) statusElem.textContent = 'Modulated background focus audio';

                const osc = ctx.createOscillator();
                osc.type = 'triangle';
                osc.frequency.value = soundType === 'cafe' ? 180 : 120;
                osc.connect(state.ambientGain);
                osc.start();
                state.ambientNodes = osc;
            }
        });
    });
}

// Bookmark / Save Venue Toggle
function toggleSaveVenue(venueId) {
    const idx = state.savedVenueIds.indexOf(venueId);
    if (idx >= 0) {
        state.savedVenueIds.splice(idx, 1);
    } else {
        state.savedVenueIds.push(venueId);
    }
    localStorage.setItem('silentspot_saved_venues', JSON.stringify(state.savedVenueIds));
    updateSavedBadge();
    renderVenuesGrid();
    if (state.currentTab === 'saved') {
        renderSavedVenues();
    }
    if (state.selectedVenueId === venueId) {
        updateDetailSaveButton();
    }
}

function updateSavedBadge() {
    const badge = document.getElementById('saved-badge');
    if (!badge) return;
    const count = state.savedVenueIds.length;
    if (count > 0) {
        badge.textContent = count;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

// Saved Venues Tab View Render
function renderSavedVenues() {
    const grid = document.getElementById('saved-venues-grid');
    const emptyState = document.getElementById('saved-empty-state');
    if (!grid || !emptyState) return;

    const savedVenues = VENUES.filter(v => state.savedVenueIds.includes(v.id));

    if (savedVenues.length === 0) {
        grid.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');
    grid.innerHTML = savedVenues.map(venue => createVenueCardHtml(venue)).join('');

    savedVenues.forEach(venue => {
        const cardElem = document.getElementById(`card-${venue.id}`);
        if (cardElem) {
            cardElem.addEventListener('click', (e) => {
                if (e.target.closest('.btn-save-bookmark')) {
                    toggleSaveVenue(venue.id);
                    return;
                }
                openVenueDetail(venue.id);
            });
        }
    });
}

// Workspace Comparison Matrix Render
function renderComparisonTable() {
    const headerRow = document.getElementById('compare-table-header');
    const body = document.getElementById('compare-table-body');
    if (!headerRow || !body) return;

    // Compare saved venues. If none, grab the top 3 visible ones as fallback.
    let compareVenues = VENUES.filter(v => state.savedVenueIds.includes(v.id)).slice(0, 3);
    if (compareVenues.length === 0) {
        compareVenues = VENUES.slice(0, 3);
    } else if (compareVenues.length === 1 && VENUES.length > 1) {
        // Add one more just so there's a comparison
        const fallback = VENUES.find(v => !state.savedVenueIds.includes(v.id));
        if (fallback) compareVenues.push(fallback);
    }

    if (compareVenues.length === 0) {
        headerRow.innerHTML = '<th class="p-4 text-center text-secondary">No venues available to compare</th>';
        body.innerHTML = '';
        return;
    }

    // Render Header
    let headerHtml = `<th class="p-4 font-bold text-on-surface dark:text-white w-32 sticky left-0 bg-surface-container-lowest dark:bg-dark-surface-card z-10 border-r border-outline-variant/30 dark:border-dark-surface-border">Metrics</th>`;
    compareVenues.forEach(v => {
        headerHtml += `
            <th class="p-4 min-w-[200px]">
                <div class="h-24 w-full rounded-xl overflow-hidden mb-3">
                    <img src="${v.image}" class="w-full h-full object-cover"/>
                </div>
                <div class="font-bold text-sm text-on-surface dark:text-white line-clamp-1">${v.name}</div>
                <div class="text-[10px] text-primary dark:text-primary-fixed-dim mt-1">${v.type}</div>
            </th>
        `;
    });
    headerRow.innerHTML = headerHtml;

    // Render Body Rows
    const metrics = [
        { label: 'Noise Level', key: 'dbAvg', format: val => `<span class="material-symbols-outlined text-sm align-middle mr-1 text-secondary">volume_up</span> ${val} dB` },
        { label: 'Wi-Fi Speed', key: 'wifiSpeed', format: val => `<span class="material-symbols-outlined text-sm align-middle mr-1 text-secondary">wifi</span> ${val} Mbps` },
        { label: 'Power Outlets', key: 'outletCoverage', format: val => `<span class="material-symbols-outlined text-sm align-middle mr-1 text-secondary">electrical_services</span> ${val}% Coverage` },
        { label: 'Occupancy', key: 'occupancy', format: val => `<span class="font-semibold px-2 py-0.5 rounded-full text-[10px] ${val === 'High' ? 'bg-red-500/10 text-red-600 dark:text-red-400' : val === 'Medium' ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}">${val}</span>` },
        { label: 'Stay Policy', key: 'stayPolicy', format: val => val },
        { label: 'Amenities', key: 'amenities', format: val => val.join(' • ') }
    ];

    let bodyHtml = '';
    metrics.forEach(metric => {
        bodyHtml += `<tr class="hover:bg-surface-container-low/50 dark:hover:bg-dark-surface-border/50 transition-colors">`;
        bodyHtml += `<td class="p-4 font-semibold text-secondary dark:text-gray-400 sticky left-0 bg-surface-container-lowest dark:bg-dark-surface-card z-10 border-r border-outline-variant/30 dark:border-dark-surface-border">${metric.label}</td>`;
        compareVenues.forEach(v => {
            bodyHtml += `<td class="p-4 text-on-surface dark:text-gray-200">${metric.format(v[metric.key])}</td>`;
        });
        bodyHtml += `</tr>`;
    });

    body.innerHTML = bodyHtml;
}

// Venue Detail View
function openVenueDetail(venueId) {
    const venue = VENUES.find(v => v.id === venueId);
    if (!venue) return;

    state.selectedVenueId = venueId;
    const container = document.getElementById('detail-container');
    if (!container) return;

    const isSaved = state.savedVenueIds.includes(venue.id);
    const aiVibe = generateVibeSummary(venue);

    container.innerHTML = `
        <!-- Detail Hero Section -->
        <section class="relative w-full h-[320px] md:h-[480px] rounded-3xl overflow-hidden mb-8 shadow-ambient">
            <img src="${venue.image}" alt="${venue.name}" class="w-full h-full object-cover"/>
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-6 md:p-10 flex flex-col justify-end text-white">
                <div class="inline-flex self-start bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold mb-3 border border-white/20">
                    ${venue.type}
                </div>
                <h1 class="font-headline-lg text-2xl md:text-4xl font-bold mb-2">${venue.name}</h1>
                <p class="text-sm md:text-base text-gray-200">${venue.hours} • Occupancy: <span class="font-bold text-emerald-400">${venue.occupancy}</span></p>
            </div>
        </section>

        <!-- Main Detail Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Left Column: Primary Details -->
            <div class="lg:col-span-2 flex flex-col gap-6">
                
                <!-- AI Vibe Section -->
                <div class="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-5 rounded-2xl border border-purple-100 dark:border-purple-800/50 flex items-start gap-3">
                    <span class="material-symbols-outlined text-purple-600 dark:text-purple-400 text-2xl animate-pulse">auto_awesome</span>
                    <div>
                        <h4 class="text-sm font-bold text-purple-900 dark:text-purple-300 mb-1">AI Vibe Check</h4>
                        <p class="text-sm text-purple-800 dark:text-purple-200/80">${aiVibe}</p>
                    </div>
                </div>

                <!-- Address Section -->
                <section class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-surface-container-lowest dark:bg-dark-surface-card p-5 rounded-2xl border border-outline-variant/30 dark:border-dark-surface-border shadow-ambient">
                    <div class="flex items-start gap-3">
                        <span class="material-symbols-outlined text-primary dark:text-primary-fixed-dim text-2xl mt-0.5">location_on</span>
                        <div>
                            <p class="font-body-lg font-semibold text-on-surface dark:text-white">${venue.address}</p>
                            <p class="text-xs text-secondary dark:text-gray-400">${venue.neighborhood} (${venue.distance} away)</p>
                        </div>
                    </div>
                    <button onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${venue.lat},${venue.lng}', '_blank')" class="px-4 py-2 bg-primary/10 dark:bg-primary-fixed-dim/20 text-primary dark:text-primary-fixed-dim rounded-xl text-xs font-semibold hover:bg-primary/20 transition-colors shrink-0 flex items-center gap-1">
                        <span class="material-symbols-outlined text-base">directions</span>
                        Get Directions
                    </button>
                </section>

                <!-- Core Workspace Productivity Bento Grid -->
                <section>
                    <h2 class="font-headline-md text-xl font-bold mb-4 text-on-surface dark:text-white">Workspace Acoustic & Technical Metrics</h2>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        <!-- Live Noise Level Bento Card -->
                        <div class="bg-surface-container-lowest dark:bg-dark-surface-card rounded-2xl p-6 shadow-ambient border border-outline-variant/30 dark:border-dark-surface-border flex flex-col justify-between relative overflow-hidden">
                            <div class="flex items-center justify-between mb-4">
                                <div class="flex items-center gap-2 text-secondary dark:text-gray-400 text-xs font-semibold">
                                    <span class="material-symbols-outlined text-lg">volume_mute</span>
                                    <span>Noise Level</span>
                                </div>
                                ${venue.isVerifiedDb
            ? `<div class="flex items-center gap-1.5 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold">
        <span class="material-symbols-outlined text-[14px]">verified</span> Verified
       </div>`
            : `<div class="flex items-center gap-1.5 bg-amber-500/15 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold">
        Estimated
       </div>`
        }
                            </div>
                            <div>
                                <div class="flex items-baseline gap-1 mb-1">
                                    <span class="font-data-display text-5xl font-extrabold text-on-surface dark:text-white">${venue.isVerifiedDb ? venue.dbAvg : venue.dbRange}</span>
                                    <span class="font-data-display text-lg font-bold text-secondary dark:text-gray-400">dB</span>
                                </div>
                                <p class="text-xs text-secondary dark:text-gray-400 font-medium">${venue.dbStatus}</p>
                            </div>
                        </div>

                        <!-- Wi-Fi Speed Bento Card -->
                        <div class="bg-surface-container-lowest dark:bg-dark-surface-card rounded-2xl p-6 shadow-ambient border border-outline-variant/30 dark:border-dark-surface-border flex flex-col justify-between">
                            <div class="flex items-center justify-between mb-4">
                                <div class="flex items-center gap-2 text-secondary dark:text-gray-400 text-xs font-semibold">
                                    <span class="material-symbols-outlined text-lg">wifi</span>
                                    <span>Wi-Fi Speed</span>
                                </div>
                                ${venue.isVerifiedWifi
            ? `<div class="flex items-center gap-1.5 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold">
        <span class="material-symbols-outlined text-[14px]">verified</span> Verified
       </div>`
            : `<div class="flex items-center gap-1.5 bg-amber-500/15 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold">
        Estimated
       </div>`
        }
                            </div>
                            <div>
                                <div class="font-data-display text-3xl font-extrabold text-on-surface dark:text-white mb-1">${venue.isVerifiedWifi ? venue.wifiSpeed : '~' + venue.wifiSpeed} Mbps</div>
                                <span class="inline-block bg-primary/10 dark:bg-primary-fixed-dim/20 text-primary dark:text-primary-fixed-dim px-2.5 py-0.5 rounded text-xs font-bold">${venue.wifiStatus}</span>
                            </div>
                        </div>

                        <!-- Power Outlet Bento Card -->
                        <div class="bg-surface-container-lowest dark:bg-dark-surface-card rounded-2xl p-6 shadow-ambient border border-outline-variant/30 dark:border-dark-surface-border flex flex-col justify-between">
                            <div class="flex items-center gap-2 text-secondary dark:text-gray-400 text-xs font-semibold mb-4">
                                <span class="material-symbols-outlined text-lg">electrical_services</span>
                                <span>Power Outlet Availability</span>
                            </div>
                            <div>
                                <div class="font-data-display text-3xl font-extrabold text-on-surface dark:text-white mb-1">${venue.outletCoverage}%</div>
                                <p class="text-xs text-secondary dark:text-gray-400 font-medium">${venue.outletStatus}</p>
                            </div>
                        </div>

                        <!-- Seating Card -->
                        <div class="bg-surface-container-lowest dark:bg-dark-surface-card rounded-2xl p-6 shadow-ambient border border-outline-variant/30 dark:border-dark-surface-border flex flex-col justify-between">
                            <div class="flex items-center gap-2 text-secondary dark:text-gray-400 text-xs font-semibold mb-2">
                                <span class="material-symbols-outlined text-lg">chair_alt</span>
                                <span>Seating Ergonomics</span>
                            </div>
                            <div>
                                <h3 class="font-headline-sm text-base font-bold text-on-surface dark:text-white mb-1">${venue.seating}</h3>
                                <p class="text-xs text-secondary dark:text-gray-400 font-medium">${venue.seatingDesc}</p>
                            </div>
                        </div>

                    </div>
                </section>

                <!-- Amenities Checklist -->
                <section class="bg-surface-container-lowest dark:bg-dark-surface-card p-6 rounded-2xl border border-outline-variant/30 dark:border-dark-surface-border">
                    <h2 class="font-headline-md text-lg font-bold text-on-surface dark:text-white mb-4">Work Amenities</h2>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        ${venue.amenities.map(amenity => `
                            <div class="flex items-center gap-3 p-3 bg-surface-container-low dark:bg-dark-bg rounded-xl border border-outline-variant/20 dark:border-dark-surface-border">
                                <span class="material-symbols-outlined text-primary dark:text-primary-fixed-dim bg-primary/10 p-2 rounded-full text-base">check_circle</span>
                                <span class="text-xs font-semibold text-on-surface dark:text-gray-200">${amenity}</span>
                            </div>
                        `).join('')}
                    </div>
                </section>
            </div>

            <!-- Right Column: Policy, Feedback & CTA -->
            <div class="flex flex-col gap-6">
                <!-- Stay Policy Card -->
                <div class="bg-surface-container-lowest dark:bg-dark-surface-card p-6 rounded-2xl shadow-ambient border border-outline-variant/30 dark:border-dark-surface-border">
                    <div class="flex items-center gap-2 mb-3">
                        <span class="material-symbols-outlined text-secondary dark:text-gray-400">hourglass_empty</span>
                        <h3 class="font-headline-sm text-base font-bold text-on-surface dark:text-white">Stay Policy</h3>
                    </div>
                    <p class="text-xs text-secondary dark:text-gray-300 leading-relaxed">
                        <strong class="text-on-surface dark:text-white">${venue.stayPolicy}.</strong> ${venue.stayPolicyDesc}
                    </p>
                </div>

                <!-- Community Feedback Card -->
                <div class="bg-surface-container-lowest dark:bg-dark-surface-card p-6 rounded-2xl shadow-ambient border border-outline-variant/30 dark:border-dark-surface-border">
                    <div class="flex items-center gap-2 mb-4">
                        <span class="material-symbols-outlined text-secondary dark:text-gray-400">forum</span>
                        <h3 class="font-headline-sm text-base font-bold text-on-surface dark:text-white">Community Feedback</h3>
                    </div>
                    <div class="flex flex-col gap-3">
                        ${venue.feedback ? venue.feedback.map(f => `
                            <div class="border-l-2 border-primary p-2 pl-3">
                                <p class="text-xs italic text-on-surface dark:text-gray-200 mb-1">"${f.quote}"</p>
                                <span class="text-[10px] font-bold text-secondary dark:text-gray-400">- ${f.author}</span>
                            </div>
                        `).join('') : '<p class="text-xs text-secondary">No community reviews yet.</p>'}
                    </div>
                </div>

                <!-- CTA Button -->
                <div class="bg-surface-container-lowest dark:bg-dark-surface-card p-6 rounded-2xl shadow-ambient border border-outline-variant/30 dark:border-dark-surface-border text-center">
                    <button id="btn-open-checkin" class="w-full bg-primary hover:bg-primary-container text-white font-headline-sm text-sm font-semibold py-3.5 rounded-xl shadow-ambient transition-all flex items-center justify-center gap-2 active:scale-95">
                        <span class="material-symbols-outlined text-lg">login</span>
                        <span>Check In / Start Session</span>
                    </button>
                    <p class="text-[11px] text-secondary dark:text-gray-400 mt-2">Track live dB and focus session time</p>
                    <button id="btn-open-contribute" class="w-full mt-3 bg-surface-container hover:bg-surface-container-high text-on-surface dark:bg-dark-bg dark:text-gray-200 dark:hover:bg-dark-surface-border font-headline-sm text-sm font-semibold py-3 rounded-xl border border-outline-variant/30 dark:border-dark-surface-border transition-all flex items-center justify-center gap-2" onclick="openContributionModal('${venue.id}')">
                        <span class="material-symbols-outlined text-lg">edit_square</span>
                        <span>Contribute Info</span>
                    </button>
                </div>
            </div>
        </div>
    `;

    // Attach listeners for venue detail view
    const saveBtn = document.getElementById('btn-save-detail-venue');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            toggleSaveVenue(venue.id);
        });
    }

    const shareBtn = document.getElementById('btn-share-venue');
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            if (navigator.share) {
                navigator.share({ title: venue.name, text: `Check out ${venue.name} on SilentSpot!`, url: window.location.href });
            } else {
                alert(`Link copied for ${venue.name}!`);
            }
        });
    }

    const checkinBtn = document.getElementById('btn-open-checkin');
    if (checkinBtn) {
        checkinBtn.addEventListener('click', () => {
            openCheckInModal(venue);
        });
    }

    switchTab('detail');
}

function updateDetailSaveButton() {
    const btnIcon = document.getElementById('detail-bookmark-icon');
    if (!btnIcon || !state.selectedVenueId) return;
    const isSaved = state.savedVenueIds.includes(state.selectedVenueId);
    btnIcon.textContent = isSaved ? 'bookmark' : 'bookmark_border';
}

// Leaflet Map Initialization & Interactive Map Click Listener
function initLeafletMap() {
    const mapContainer = document.getElementById('leaflet-map');
    if (!mapContainer) return;

    if (state.leafletMap) {
        state.leafletMap.invalidateSize();
        return;
    }

    state.leafletMap = L.map('leaflet-map', {
        zoomControl: false
    }).setView([state.currentLat, state.currentLng], 13);

    L.control.zoom({ position: 'bottomright' }).addTo(state.leafletMap);

    updateMapTileLayer();
    renderMapMarkers();

    // INTERACTIVE MAP CLICK LISTENER: Click anywhere on the map to find quiet spots in that exact location!
    state.leafletMap.on('click', async (e) => {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;

        if (state.targetMarker) {
            state.leafletMap.removeLayer(state.targetMarker);
        }

        const targetIcon = L.divIcon({
            className: 'leaflet-div-pin',
            html: `<div class="custom-map-pin pin-active"><span class="material-symbols-outlined text-sm">my_location</span> Clicked Point</div>`,
            iconSize: [110, 30],
            iconAnchor: [55, 15]
        });

        state.targetMarker = L.marker([lat, lng], { icon: targetIcon }).addTo(state.leafletMap);

        let locationName = `Point (${lat.toFixed(3)}, ${lng.toFixed(3)})`;
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await res.json();
            if (data && data.display_name) {
                const parts = data.display_name.split(',');
                locationName = `${parts[0].trim()}, ${parts[1] ? parts[1].trim() : ''}`;
            }
        } catch (err) {
            console.warn('Reverse geocoding error:', err);
        }

        loadRealVenues(lat, lng, locationName);
    });
}

function updateMapTileLayer() {
    if (!state.leafletMap) return;

    const isDark = document.documentElement.classList.contains('dark');
    const tileUrl = isDark
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

    if (state.tileLayer) {
        state.leafletMap.removeLayer(state.tileLayer);
    }

    state.tileLayer = L.tileLayer(tileUrl, {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        maxZoom: 19
    }).addTo(state.leafletMap);
}

function renderMapMarkers() {
    if (!state.leafletMap) return;

    // Clear existing markers & heatmap circles
    state.mapMarkers.forEach(m => state.leafletMap.removeLayer(m));
    state.heatmapCircles.forEach(c => state.leafletMap.removeLayer(c));
    state.mapMarkers = [];
    state.heatmapCircles = [];

    const visibleVenues = getFilteredVenues();

    visibleVenues.forEach(venue => {
        // Acoustic Heatmap Circle Overlay
        const circleColor = venue.dbAvg < 40 ? '#006948' : venue.dbAvg < 48 ? '#eab308' : '#ef4444';
        const circle = L.circle([venue.lat, venue.lng], {
            color: circleColor,
            fillColor: circleColor,
            fillOpacity: 0.18,
            radius: 350,
            stroke: false
        }).addTo(state.leafletMap);
        state.heatmapCircles.push(circle);

        const pinClass = venue.dbAvg < 40 ? 'pin-quiet' : 'pin-moderate';
        const customIcon = L.divIcon({
            className: 'leaflet-div-pin',
            html: `<div class="custom-map-pin ${pinClass}">${venue.dbAvg} dB</div>`,
            iconSize: [60, 30],
            iconAnchor: [30, 15]
        });

        const marker = L.marker([venue.lat, venue.lng], { icon: customIcon }).addTo(state.leafletMap);
        marker.on('click', () => {
            showMapBottomSheet(venue);
        });

        state.mapMarkers.push(marker);
    });
}

function showMapBottomSheet(venue) {
    const sheet = document.getElementById('map-bottom-sheet');
    const content = document.getElementById('map-sheet-content');
    if (!sheet || !content) return;

    content.innerHTML = `
        <div class="flex justify-between items-start mb-2">
            <div>
                <h3 class="font-headline-sm text-base font-bold text-on-surface dark:text-white">${venue.name}</h3>
                <p class="text-xs text-secondary dark:text-gray-400">${venue.type} • ${venue.distance}</p>
            </div>
        </div>

        <div class="grid grid-cols-3 gap-2 my-3">
            <div class="bg-surface-container dark:bg-dark-bg p-2 rounded-xl text-center">
                <span class="material-symbols-outlined text-primary text-base">volume_up</span>
                <div class="font-data-display text-xs font-bold text-on-surface dark:text-white">${venue.dbAvg} dB</div>
            </div>
            <div class="bg-surface-container dark:bg-dark-bg p-2 rounded-xl text-center">
                <span class="material-symbols-outlined text-secondary text-base">wifi</span>
                <div class="font-data-display text-xs font-bold text-on-surface dark:text-white">${venue.wifiSpeed}M</div>
            </div>
            <div class="bg-surface-container dark:bg-dark-bg p-2 rounded-xl text-center">
                <span class="material-symbols-outlined text-secondary text-base">power</span>
                <div class="font-data-display text-xs font-bold text-on-surface dark:text-white">${venue.outletCoverage}%</div>
            </div>
        </div>

        <button id="map-btn-view-details" class="w-full bg-primary hover:bg-primary-container text-white py-2 rounded-xl text-xs font-semibold transition-colors">
            View Details
        </button>
    `;

    document.getElementById('map-btn-view-details').addEventListener('click', () => {
        sheet.classList.add('hidden');
        openVenueDetail(venue.id);
    });

    document.getElementById('btn-close-map-sheet').addEventListener('click', () => {
        sheet.classList.add('hidden');
    });

    sheet.classList.remove('hidden');
}

// Modal Filters Logic
function initFilterModal() {
    const modal = document.getElementById('filter-modal');
    const openBtn = document.getElementById('btn-open-filter-modal');
    const closeBtn = document.getElementById('btn-close-filter-modal');
    const applyBtn = document.getElementById('btn-apply-modal-filters');
    const resetBtn = document.getElementById('btn-reset-modal-filters');

    const dbSlider = document.getElementById('filter-db-slider');
    const dbDisplay = document.getElementById('filter-db-display');
    const wifiSlider = document.getElementById('filter-wifi-slider');
    const wifiDisplay = document.getElementById('filter-wifi-display');
    const outletsSlider = document.getElementById('filter-outlets-slider');
    const outletsDisplay = document.getElementById('filter-outlets-display');

    if (dbSlider && dbDisplay) dbSlider.addEventListener('input', (e) => dbDisplay.textContent = `${e.target.value} dB`);
    if (wifiSlider && wifiDisplay) wifiSlider.addEventListener('input', (e) => wifiDisplay.textContent = `${e.target.value} Mbps`);
    if (outletsSlider && outletsDisplay) outletsSlider.addEventListener('input', (e) => outletsDisplay.textContent = `${e.target.value}%`);

    if (openBtn) openBtn.addEventListener('click', () => modal.classList.remove('hidden'));
    if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.add('hidden'));

    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            state.filters.maxDb = parseInt(dbSlider.value);
            state.filters.minWifi = parseInt(wifiSlider.value);
            state.filters.minOutlets = parseInt(outletsSlider.value);

            const checkedAmenities = Array.from(document.querySelectorAll('.amenity-checkbox:checked')).map(c => c.value);
            state.filters.amenities = checkedAmenities;

            updateActiveFilterBadge();
            renderVenuesGrid();
            modal.classList.add('hidden');
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            dbSlider.value = 55;
            dbDisplay.textContent = '55 dB';
            wifiSlider.value = 0;
            wifiDisplay.textContent = '0 Mbps';
            outletsSlider.value = 0;
            outletsDisplay.textContent = '0%';
            document.querySelectorAll('.amenity-checkbox').forEach(c => c.checked = false);

            state.filters = { maxDb: 55, minWifi: 0, minOutlets: 0, amenities: [] };
            updateActiveFilterBadge();
            renderVenuesGrid();
        });
    }

    const resetFilterBtn = document.getElementById('btn-reset-filters');
    if (resetFilterBtn && resetBtn) {
        resetFilterBtn.addEventListener('click', () => {
            resetBtn.click();
        });
    }
}

function updateActiveFilterBadge() {
    const badge = document.getElementById('active-filter-count');
    if (!badge) return;
    let count = 0;
    if (state.filters.maxDb < 65) count++;
    if (state.filters.minWifi > 0) count++;
    if (state.filters.minOutlets > 0) count++;
    count += state.filters.amenities.length;

    if (count > 0) {
        badge.textContent = count;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

// Check-In Session Modal & Timer
function initCheckInModal() {
    const modal = document.getElementById('checkin-modal');
    const cancelBtn = document.getElementById('btn-cancel-checkin');
    const confirmBtn = document.getElementById('btn-confirm-checkin');

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            if (state.checkInSeconds > 0) {
                // Earn 1 focus minute per minute focused (or at least 1 min if under 1 minute for demo)
                const earnedMinutes = Math.max(1, Math.floor(state.checkInSeconds / 60));
                state.totalFocusMinutes += earnedMinutes;
                localStorage.setItem('silentspot_focus_minutes', state.totalFocusMinutes);
            }
            stopCheckInTimer();
            modal.classList.add('hidden');
        });
    }

    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            confirmBtn.textContent = 'Session Active';
            confirmBtn.classList.add('bg-emerald-600');
        });
    }
}

function openCheckInModal(venue) {
    state.checkInVenueId = venue.id;
    const nameElem = document.getElementById('checkin-venue-name');
    if (nameElem) nameElem.textContent = venue.name;
    document.getElementById('checkin-modal').classList.remove('hidden');
    startCheckInTimer();
}

function startCheckInTimer() {
    stopCheckInTimer();
    state.checkInSeconds = 0;
    const timerElem = document.getElementById('checkin-timer');

    state.checkInTimerInterval = setInterval(() => {
        state.checkInSeconds++;
        const hrs = String(Math.floor(state.checkInSeconds / 3600)).padStart(2, '0');
        const mins = String(Math.floor((state.checkInSeconds % 3600) / 60)).padStart(2, '0');
        const secs = String(state.checkInSeconds % 60).padStart(2, '0');
        if (timerElem) timerElem.textContent = `${hrs}:${mins}:${secs}`;
    }, 1000);
}

function stopCheckInTimer() {
    if (state.checkInTimerInterval) {
        clearInterval(state.checkInTimerInterval);
        state.checkInTimerInterval = null;
    }
}

// Live Sound Check Tool (Microphone API & Spectrum Visualizer)
function initSoundCheck() {
    const canvas = document.getElementById('sound-spectrum-canvas');
    const dbValElem = document.getElementById('soundcheck-db-val');
    const statusPill = document.getElementById('soundcheck-status-pill');
    const micBtn = document.getElementById('btn-start-mic-test');
    const simBtn = document.getElementById('btn-simulate-sound');

    if (!canvas || !dbValElem || !statusPill || !micBtn || !simBtn) return;

    let isMicActive = false;
    let animId = null;

    const ctx = canvas.getContext('2d');
    canvas.width = canvas.clientWidth * window.devicePixelRatio || 600;
    canvas.height = canvas.clientHeight * window.devicePixelRatio || 200;

    simBtn.addEventListener('click', () => {
        if (isMicActive) stopMic();
        startSimulation();
    });

    micBtn.addEventListener('click', async () => {
        if (isMicActive) {
            stopMic();
            micBtn.innerHTML = '<span class="material-symbols-outlined">mic</span><span>Start Microphone Sound Check</span>';
            isMicActive = false;
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                state.micStream = stream;
                state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const source = state.audioContext.createMediaStreamSource(stream);
                state.analyser = state.audioContext.createAnalyser();
                state.analyser.fftSize = 64;
                source.connect(state.analyser);

                isMicActive = true;
                micBtn.innerHTML = '<span class="material-symbols-outlined">mic_off</span><span>Stop Microphone Test</span>';
                renderMicSpectrum();
            } catch (err) {
                alert('Microphone access denied or unavailable. Running acoustic simulation instead.');
                startSimulation();
            }
        }
    });

    function stopMic() {
        if (state.micStream) {
            state.micStream.getTracks().forEach(t => t.stop());
            state.micStream = null;
        }
        if (animId) cancelAnimationFrame(animId);
    }

    function renderMicSpectrum() {
        if (!state.analyser) return;

        const bufferLength = state.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        function draw() {
            animId = requestAnimationFrame(draw);
            state.analyser.getByteFrequencyData(dataArray);

            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i];
            }
            const avg = sum / bufferLength;
            const dbEstimate = Math.min(80, Math.max(30, Math.round(30 + (avg / 255) * 45)));

            dbValElem.textContent = dbEstimate;
            updateDbStatusPill(dbEstimate);
            drawCanvasBars(dataArray, bufferLength);
        }

        draw();
    }

    function startSimulation() {
        if (animId) cancelAnimationFrame(animId);

        let time = 0;
        function drawSim() {
            animId = requestAnimationFrame(drawSim);
            time += 0.05;

            const fakeDb = Math.round(38 + Math.sin(time) * 4 + Math.cos(time * 0.5) * 3);
            dbValElem.textContent = fakeDb;
            updateDbStatusPill(fakeDb);

            const simData = new Uint8Array(32);
            for (let i = 0; i < 32; i++) {
                simData[i] = Math.max(10, Math.round(40 + Math.sin(time + i * 0.2) * 35));
            }

            drawCanvasBars(simData, 32);
        }

        drawSim();
    }

    function drawCanvasBars(dataArray, length) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const barWidth = (canvas.width / length) * 0.7;
        let x = 0;

        const isDark = document.documentElement.classList.contains('dark');
        const barColor = isDark ? '#68dba9' : '#006948';

        for (let i = 0; i < length; i++) {
            const barHeight = (dataArray[i] / 255) * canvas.height * 0.85;

            ctx.fillStyle = barColor;
            ctx.shadowBlur = 8;
            ctx.shadowColor = barColor;
            ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

            x += barWidth + (canvas.width / length) * 0.3;
        }
    }

    function updateDbStatusPill(db) {
        if (db < 40) {
            statusPill.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Pin-drop Silent (&lt;40 dB)';
        } else if (db < 48) {
            statusPill.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Library-like Hush (40-48 dB)';
        } else {
            statusPill.innerHTML = '<span class="w-2 h-2 rounded-full bg-yellow-500"></span> Moderate Ambient Noise (&gt;48 dB)';
        }
    }
}

// User Contribution Logic
function initContributionModal() {
    const modal = document.getElementById('contribution-modal');
    const closeBtn = document.getElementById('btn-close-contribution');
    const cancelBtn = document.getElementById('btn-cancel-contribution');
    const form = document.getElementById('contribution-form');

    if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
    if (cancelBtn) cancelBtn.addEventListener('click', () => modal.classList.add('hidden'));

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Change button state to show loading
            const submitBtn = document.getElementById('btn-save-contribution');
            const originalBtnHtml = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="material-symbols-outlined text-lg animate-spin">sync</span> Saving...';
            submitBtn.disabled = true;

            const venueId = document.getElementById('contrib-venue-id').value;
            const photoUrl = document.getElementById('contrib-photo').value.trim();
            const wifiSpeed = document.getElementById('contrib-wifi').value;
            const noiseLevel = document.getElementById('contrib-noise').value;
            const reviewQuote = document.getElementById('contrib-review').value.trim();

            try {
                const promises = [];
                if (photoUrl) promises.push(saveUserContribution(venueId, 'photo', photoUrl));
                if (wifiSpeed) promises.push(saveUserContribution(venueId, 'wifiSpeed', parseInt(wifiSpeed, 10)));
                if (noiseLevel) promises.push(saveUserContribution(venueId, 'dbAvg', parseInt(noiseLevel, 10)));
                if (reviewQuote) promises.push(saveUserContribution(venueId, 'review', { quote: reviewQuote, author: 'SilentSpot User' }));
                
                await Promise.all(promises);

                modal.classList.add('hidden');
                form.reset();

                // Show toast and reload venues to apply changes
                alert('Thank you! Your contribution has been saved globally.');
                renderVenuesGrid();

                // Update open detail view if active
                if (state.currentTab === 'details' && state.selectedVenueId === venueId) {
                    openVenueDetail(venueId);
                }
            } catch (error) {
                alert('We are experiencing high traffic and cannot save contributions right now. Please try again later.');
            } finally {
                submitBtn.innerHTML = originalBtnHtml;
                submitBtn.disabled = false;
            }
        });
    }
}

function openContributionModal(venueId) {
    const modal = document.getElementById('contribution-modal');
    if (!modal) return;

    document.getElementById('contrib-venue-id').value = venueId;

    const venue = VENUES.find(v => v.id === venueId);
    if (venue) {
        document.getElementById('contribution-venue-name').textContent = venue.name;
    }

    document.getElementById('contribution-form').reset();
    modal.classList.remove('hidden');
}

// Add Custom Venue Logic
function initAddVenueModal() {
    const modal = document.getElementById('add-venue-modal');
    const openBtn = document.getElementById('btn-open-add-venue');
    const closeBtn = document.getElementById('btn-close-add-venue');
    const form = document.getElementById('add-venue-form');
    const errorText = document.getElementById('add-venue-error');

    if (openBtn) {
        openBtn.addEventListener('click', () => {
            if (!state.isLoggedIn) {
                // Force login if not logged in
                document.getElementById('auth-modal').classList.remove('hidden');
                return;
            }
            modal.classList.remove('hidden');
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
            errorText.classList.add('hidden');
        });
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = document.getElementById('btn-save-new-venue');
            const originalText = submitBtn.innerHTML;
            
            submitBtn.innerHTML = '<span class="material-symbols-outlined text-sm animate-spin">sync</span> Adding...';
            submitBtn.disabled = true;
            errorText.classList.add('hidden');

            try {
                const name = document.getElementById('add-venue-name').value.trim();
                const address = document.getElementById('add-venue-address').value.trim();
                const category = document.getElementById('add-venue-category').value;
                const wifi = document.getElementById('add-venue-wifi').value;
                const noise = document.getElementById('add-venue-noise').value;

                // Geocode the address
                const geoData = await geocodeAddress(address);
                if (!geoData) {
                    throw new Error("Could not find this address on the map. Please try a more specific address.");
                }

                // Construct venue data
                const venueData = {
                    name,
                    address: geoData.formattedAddress,
                    lat: geoData.lat,
                    lng: geoData.lng,
                    category,
                    wifiSpeed: wifi ? parseInt(wifi, 10) : null,
                    dbAvg: noise ? parseInt(noise, 10) : null
                };

                // Save to Firestore
                await saveCustomVenue(venueData);

                // Success
                modal.classList.add('hidden');
                form.reset();
                alert("Venue added successfully! It is now visible on the map.");

                // Reload map
                loadRealVenues(state.currentLat, state.currentLng, state.currentLocation);
            } catch (err) {
                console.error(err);
                errorText.textContent = err.message || "Failed to add venue.";
                errorText.classList.remove('hidden');
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
}
