import { useEffect, useMemo, useState } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
    Ambulance,
    Building2,
    ChevronRight,
    Clock3,
    Flame,
    Hospital,
    MapPin,
    Navigation,
    Phone,
    Search,
    Shield,
    ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

const DEFAULT_CENTER = [30.3165, 78.0322];

const markerColors = {
    Police: "#60a5fa",
    Hospital: "#f87171",
    "Fire Station": "#fb923c",
    Ambulance: "#f43f5e",
    Pharmacy: "#a78bfa",
    Doctor: "#34d399",
    "Doctor / Clinic": "#34d399",
};

const createPlaceIcon = (category) => {
    const color = markerColors[category] || "#22d3ee";
    return L.divIcon({
        className: "nearby-place-marker-wrapper",
        html: `<div style="width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:${color};border:3px solid #ffffff;box-shadow:0 2px 12px rgba(0,0,0,.4);color:#07101b;font-weight:800;font-size:15px;">${category === "Police" ? "P" : category === "Hospital" ? "+" : category === "Fire Station" ? "F" : category === "Ambulance" ? "A" : category === "Pharmacy" ? "Rx" : "D"}</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -17],
    });
};

function FitMapToPlaces({ places, mapCenter }) {
    const map = useMap();

    useEffect(() => {
        if (mapCenter) {
            map.setView(mapCenter, 13);
            return;
        }

        const validPlaces = places.filter(
            (place) => Number.isFinite(place.latitude) && Number.isFinite(place.longitude)
        );

        if (validPlaces.length === 1) {
            map.setView([validPlaces[0].latitude, validPlaces[0].longitude], 14);
        } else if (validPlaces.length > 1) {
            const bounds = L.latLngBounds(
                validPlaces.map((place) => [place.latitude, place.longitude])
            );
            map.fitBounds(bounds, { padding: [35, 35], maxZoom: 14 });
        }
    }, [places, mapCenter, map]);

    return null;
}

const EARTH_RADIUS_KM = 6371;
const SEARCH_RADIUS_METERS = 10000;

function getDistanceKm(lat1, lon1, lat2, lon2) {
    const toRadians = (degrees) => (degrees * Math.PI) / 180;
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) ** 2;

    return 2 * EARTH_RADIUS_KM * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(distanceKm) {
    if (!Number.isFinite(distanceKm)) return "Distance unavailable";
    return distanceKm < 1
        ? `${Math.round(distanceKm * 1000)} m`
        : `${distanceKm.toFixed(1)} km`;
}

async function fetchGeoapifyNearbyPlaces(params) {
    const query = new URLSearchParams({
        radius: String(SEARCH_RADIUS_METERS),
        category: "All",
        ...params,
    });

    const response = await fetch(
        `http://localhost:5000/api/nearby-places/live?${query.toString()}`,
        {
            method: "GET",
            credentials: "include",
            headers: { Accept: "application/json" },
        }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.success) {
        const detail = typeof data.details === "string" ? data.details : "";
        throw new Error(
            [data.message || "Unable to fetch nearby emergency facilities.", detail]
                .filter(Boolean)
                .join(" ")
        );
    }

    const mappedPlaces = (data.places || []).map((place, index) => {
        const latitude = Number(place.latitude);
        const longitude = Number(place.longitude);
        const distanceKm = Number.isFinite(Number(place.distance))
            ? Number(place.distance) / 1000
            : null;

        return {
            ...place,
            _id: place.id || `geoapify-${index}`,
            latitude,
            longitude,
            distanceKm,
            distance: distanceKm == null ? "Distance unavailable" : formatDistance(distanceKm),
            phone: place.phone && place.phone !== "Not available" ? place.phone : "",
            source: "Geoapify",
        };
    }).filter((place) => Number.isFinite(place.latitude) && Number.isFinite(place.longitude));

    // Keep the geocoded center alongside the results so city search only makes one API call.
    mappedPlaces.center = data.center || null;
    return mappedPlaces;
}

function mergeNearbyPlaces(livePlaces, savedPlaces, latitude, longitude) {
    const savedNearby = (savedPlaces || [])
        .filter((place) => {
            const lat = Number(place.latitude);
            const lon = Number(place.longitude);
            return Number.isFinite(lat) && Number.isFinite(lon) &&
                getDistanceKm(latitude, longitude, lat, lon) <= SEARCH_RADIUS_METERS / 1000;
        })
        .map((place) => {
            const lat = Number(place.latitude);
            const lon = Number(place.longitude);
            const distanceKm = getDistanceKm(latitude, longitude, lat, lon);
            return {
                ...place,
                _id: place._id || place.id,
                latitude: lat,
                longitude: lon,
                distanceKm,
                distance: formatDistance(distanceKm),
                source: "Saved database",
            };
        });

    const combined = [...(livePlaces || []), ...savedNearby];
    const seen = new Set();

    return combined.filter((place) => {
        const key = `${(place.name || "").toLowerCase()}|${Number(place.latitude).toFixed(4)}|${Number(place.longitude).toFixed(4)}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    }).sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
}

function getBrowserLocation(onRetry) {
    const getPosition = (options) =>
        new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, options);
        });

    return getPosition({
        enableHighAccuracy: false,
        timeout: 12000,
        maximumAge: 300000,
    }).catch(async (error) => {
        // If a quick/coarse location is unavailable, try GPS once more.
        if (error.code !== 3) throw error;
        onRetry?.();
        return getPosition({
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0,
        });
    });
}

const categoryConfig = {
    All: { icon: ShieldCheck },
    Police: { icon: Shield },
    Hospital: { icon: Hospital },
    "Fire Station": { icon: Flame },
    Ambulance: { icon: Ambulance },
    Pharmacy: { icon: Building2 },
    Doctor: { icon: Hospital },
    "Doctor / Clinic": { icon: Hospital },
};

const NEARBY_LOCATION_STORAGE_KEY = "surakshaai_nearby_location_v1";

function readStoredNearbyLocation() {
    try {
        const raw = localStorage.getItem(NEARBY_LOCATION_STORAGE_KEY);
        if (!raw) return null;

        const saved = JSON.parse(raw);
        const latitude = Number(saved.latitude);
        const longitude = Number(saved.longitude);

        if (
            !Number.isFinite(latitude) || latitude < -90 || latitude > 90 ||
            !Number.isFinite(longitude) || longitude < -180 || longitude > 180
        ) return null;

        return {
            latitude,
            longitude,
            mode: saved.mode === "city" ? "city" : "gps",
            label: typeof saved.label === "string" ? saved.label : "your saved location",
        };
    } catch {
        return null;
    }
}

function NearbyHelp() {
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [initialLocation] = useState(() => readStoredNearbyLocation());
    const [userLocation, setUserLocation] = useState(() => {
        const saved = readStoredNearbyLocation();
        return saved?.mode === "gps" ? [saved.latitude, saved.longitude] : null;
    });
    const [mapCenter, setMapCenter] = useState(() => {
        const saved = readStoredNearbyLocation();
        return saved ? [saved.latitude, saved.longitude] : null;
    });
    const [nearbySearching, setNearbySearching] = useState(false);
    const [locationDetecting, setLocationDetecting] = useState(false);
    const [locationMessage, setLocationMessage] = useState(() => {
        const saved = readStoredNearbyLocation();
        return saved
            ? `Restoring ${saved.label} and loading facilities within 10 km…`
            : "Showing saved locations from the database";
    });

    useEffect(() => {
        const controller = new AbortController();

        const fetchNearbyPlaces = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    "http://localhost:5000/api/nearby-places",
                    {
                        method: "GET",
                        credentials: "include",
                        signal: controller.signal,
                    }
                );

                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(data.message || "Unable to load nearby places.");
                }

                const savedPlaces = Array.isArray(data.places) ? data.places : [];
                setPlaces(savedPlaces);

                // Restore the last GPS/city location and reload live results after refresh.
                if (initialLocation) {
                    setNearbySearching(true);
                    try {
                        const livePlaces = await fetchGeoapifyNearbyPlaces({
                            latitude: String(initialLocation.latitude),
                            longitude: String(initialLocation.longitude),
                            category: "All",
                        });
                        setPlaces(
                            mergeNearbyPlaces(
                                livePlaces,
                                savedPlaces,
                                initialLocation.latitude,
                                initialLocation.longitude
                            )
                        );
                        setMapCenter([
                            initialLocation.latitude,
                            initialLocation.longitude,
                        ]);
                        setUserLocation(
                            initialLocation.mode === "gps"
                                ? [initialLocation.latitude, initialLocation.longitude]
                                : null
                        );
                        setLocationMessage(
                            `${livePlaces.length} live facilities loaded within 10 km of ${initialLocation.label}.`
                        );
                    } catch (restoreError) {
                        console.error("Restore nearby location error:", restoreError);
                        setLocationMessage(
                            `Saved location restored, but live search failed: ${restoreError.message}`
                        );
                    } finally {
                        setNearbySearching(false);
                    }
                }
            } catch (fetchError) {
                if (fetchError.name === "AbortError") return;

                console.error("Nearby Places API Error:", fetchError);
                setError(fetchError.message || "Unable to load nearby places.");
                toast.error(fetchError.message || "Unable to load nearby places.");
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        };

        fetchNearbyPlaces();
        return () => controller.abort();
    }, [initialLocation]);

    const filteredPlaces = useMemo(() => {
        const value = search.toLowerCase().trim();

        return places.filter((place) => {
            const matchesSearch =
                !value ||
                (place.name || "").toLowerCase().includes(value) ||
                (place.address || "").toLowerCase().includes(value) ||
                (place.phone || "").toLowerCase().includes(value);

            const matchesCategory =
                category === "All" ||
                place.category === category ||
                (category === "Doctor" && place.category === "Doctor / Clinic");

            return matchesSearch && matchesCategory;
        });
    }, [places, search, category]);

    const handleUseMyLocation = async () => {
        if (!navigator.geolocation) {
            const message = "This browser does not support location detection. Try Chrome or Edge.";
            setLocationMessage(message);
            toast.error(message);
            return;
        }

        setLocationDetecting(true);
        setNearbySearching(false);
        setError("");
        setLocationMessage("Detecting your location… Please allow location access if your browser asks.");

        try {
            const position = await getBrowserLocation(() => {
                setLocationMessage("Location is taking longer than expected. Trying GPS…");
            });

            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            const coords = [latitude, longitude];

            try {
                localStorage.setItem(
                    NEARBY_LOCATION_STORAGE_KEY,
                    JSON.stringify({
                        latitude,
                        longitude,
                        mode: "gps",
                        label: "your detected location",
                        savedAt: new Date().toISOString(),
                    })
                );
            } catch (storageError) {
                console.warn("Could not persist detected location:", storageError);
            }

            setUserLocation(coords);
            setMapCenter(coords);
            setLocationDetecting(false);
            setNearbySearching(true);
            setLocationMessage("Location detected. Searching emergency facilities within 10 km…");

            try {
                const livePlaces = await fetchGeoapifyNearbyPlaces({
                    latitude: String(latitude),
                    longitude: String(longitude),
                    category: "All",
                });
                const combined = mergeNearbyPlaces(livePlaces, places, latitude, longitude);

                setPlaces(combined);
                setCategory("All");
                setLocationMessage(
                    `${livePlaces.length} live facilities found within 10 km of your detected location.`
                );

                if (livePlaces.length === 0) {
                    toast.info("Location detected, but no mapped facilities were returned within 10 km.");
                } else {
                    toast.success(`${livePlaces.length} nearby facilities loaded.`);
                }
            } catch (nearbyError) {
                console.error("Geoapify Nearby Search Error:", nearbyError);
                setLocationMessage("Your location was detected, but live nearby search failed. Please try again.");
                toast.error(nearbyError.message || "Could not load nearby facilities.");
            } finally {
                setNearbySearching(false);
            }
        } catch (geoError) {
            setLocationDetecting(false);
            let message;
            if (geoError.code === 1) {
                message = "Location permission denied. Allow Location from the browser address-bar permissions, then try again.";
            } else if (geoError.code === 2) {
                message = "Your device could not determine your location. Check Windows Location Services and internet access.";
            } else if (geoError.code === 3) {
                message = "Location detection timed out. Enable location access and try again near a window or outdoors.";
            } else {
                message = geoError.message || "Unable to detect your location.";
            }
            setLocationMessage(message);
            toast.error(message);
        }
    };

    const handleSearchLocation = async () => {
        const query = search.trim();
        if (!query) {
            toast.info("Type a city or area, for example Haridwar or Dehradun.");
            return;
        }

        setNearbySearching(true);
        setLocationDetecting(false);
        setError("");
        setLocationMessage(`Searching ${query} and nearby emergency facilities…`);

        try {
            const livePlaces = await fetchGeoapifyNearbyPlaces({
                city: query,
                category: "All",
            });

            // The backend returns the geocoded city center with the results.
            const centerLat = Number(livePlaces.center?.latitude);
            const centerLon = Number(livePlaces.center?.longitude);
            const finalLat = Number.isFinite(centerLat) ? centerLat : null;
            const finalLon = Number.isFinite(centerLon) ? centerLon : null;

            if (Number.isFinite(finalLat) && Number.isFinite(finalLon)) {
                try {
                    localStorage.setItem(
                        NEARBY_LOCATION_STORAGE_KEY,
                        JSON.stringify({
                            latitude: finalLat,
                            longitude: finalLon,
                            mode: "city",
                            label: query,
                            savedAt: new Date().toISOString(),
                        })
                    );
                } catch (storageError) {
                    console.warn("Could not persist searched location:", storageError);
                }

                setMapCenter([finalLat, finalLon]);
                setUserLocation(null);
                setPlaces(mergeNearbyPlaces(livePlaces, places, finalLat, finalLon));
            } else {
                setPlaces(livePlaces);
            }

            setCategory("All");
            setSearch("");
            setLocationMessage(`${livePlaces.length} live facilities found within 10 km of ${query}.`);

            if (livePlaces.length) {
                toast.success(`${livePlaces.length} nearby facilities loaded for ${query}.`);
            } else {
                toast.info(`No mapped emergency facilities were returned within 10 km of ${query}.`);
            }
        } catch (searchError) {
            console.error("Nearby location search error:", searchError);
            setLocationMessage(searchError.message || "Unable to search this location.");
            toast.error(searchError.message || "Unable to search this location.");
        } finally {
            setNearbySearching(false);
        }
    };

    const handleSearchKeyDown = (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            handleSearchLocation();
        }
    };

    const handleDirections = (place) => {
        if (typeof place.latitude === "number" && typeof place.longitude === "number") {
            window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`,
                "_blank",
                "noopener,noreferrer"
            );
            return;
        }

        const destination = encodeURIComponent(place.address || place.name);
        window.open(
            `https://www.google.com/maps/dir/?api=1&destination=${destination}`,
            "_blank",
            "noopener,noreferrer"
        );
    };

    const handleCall = (phone) => {
        if (!phone) {
            toast.error("Phone number is not available.");
            return;
        }
        window.location.href = `tel:${phone}`;
    };

    const getCategoryIcon = (placeCategory) => {
        return categoryConfig[placeCategory]?.icon || Building2;
    };

    return (
        <div className="space-y-5">
            <style>{`
                .nearby-leaflet-map { z-index: 0; font-family: inherit; }
                .nearby-leaflet-map .leaflet-control-zoom a { background: #07101b; color: #e2e8f0; border-color: #334155; }
                .nearby-leaflet-map .leaflet-control-attribution { background: rgba(7,16,27,.8); color: #94a3b8; }
                .nearby-leaflet-map .leaflet-control-attribution a { color: #67e8f9; }
                .nearby-leaflet-map .leaflet-popup-content-wrapper, .nearby-leaflet-map .leaflet-popup-tip { background: #0f172a; color: #e2e8f0; }
                .nearby-leaflet-map .leaflet-popup-content { line-height: 1.5; }
            `}</style>

            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-400">
                        <Navigation size={15} />
                        Emergency Resources
                    </div>

                    <h1 className="text-2xl font-semibold text-white">
                        Nearby Help
                    </h1>

                    <p className="mt-1 text-sm text-slate-400">
                        Find nearby police stations, hospitals and fire
                        stations.
                    </p>
                </div>

                <div className="flex items-center gap-2 rounded-[5px] border border-emerald-500/20 bg-emerald-500/5 px-3 py-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />

                    <span className="text-xs font-medium text-emerald-400">
                        Emergency Network Online
                    </span>
                </div>
            </div>

            {/* Emergency Numbers */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

                <button
                    type="button"
                    onClick={() => handleCall("112")}
                    className="group flex items-center justify-between rounded-[6px] border border-blue-500/20 bg-blue-500/5 p-4 text-left transition hover:border-blue-500/40 hover:bg-blue-500/10"
                >
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-[5px] bg-blue-500/10">
                            <Shield
                                size={20}
                                className="text-blue-400"
                            />
                        </div>

                        <div>
                            <p className="text-xs text-slate-500">
                                Police
                            </p>

                            <p className="mt-0.5 text-lg font-semibold text-white">
                                112
                            </p>
                        </div>
                    </div>

                    <Phone
                        size={17}
                        className="text-slate-600 transition group-hover:text-blue-400"
                    />
                </button>

                <button
                    type="button"
                    onClick={() => handleCall("108")}
                    className="group flex items-center justify-between rounded-[6px] border border-red-500/20 bg-red-500/5 p-4 text-left transition hover:border-red-500/40 hover:bg-red-500/10"
                >
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-[5px] bg-red-500/10">
                            <Ambulance
                                size={20}
                                className="text-red-400"
                            />
                        </div>

                        <div>
                            <p className="text-xs text-slate-500">
                                Ambulance
                            </p>

                            <p className="mt-0.5 text-lg font-semibold text-white">
                                108
                            </p>
                        </div>
                    </div>

                    <Phone
                        size={17}
                        className="text-slate-600 transition group-hover:text-red-400"
                    />
                </button>

                <button
                    type="button"
                    onClick={() => handleCall("101")}
                    className="group flex items-center justify-between rounded-[6px] border border-orange-500/20 bg-orange-500/5 p-4 text-left transition hover:border-orange-500/40 hover:bg-orange-500/10"
                >
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-[5px] bg-orange-500/10">
                            <Flame
                                size={20}
                                className="text-orange-400"
                            />
                        </div>

                        <div>
                            <p className="text-xs text-slate-500">
                                Fire Emergency
                            </p>

                            <p className="mt-0.5 text-lg font-semibold text-white">
                                101
                            </p>
                        </div>
                    </div>

                    <Phone
                        size={17}
                        className="text-slate-600 transition group-hover:text-orange-400"
                    />
                </button>

            </div>

            {/* Location Banner */}
            <div className="flex flex-col gap-3 rounded-[6px] border border-cyan-500/20 bg-cyan-500/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[5px] bg-cyan-500/10">
                        <MapPin
                            size={20}
                            className="text-cyan-400"
                        />
                    </div>

                    <div>
                        <p className="text-sm font-medium text-slate-200">
                            Showing nearby emergency resources
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                            {locationMessage}
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleUseMyLocation}
                    disabled={nearbySearching || locationDetecting}
                    className="inline-flex items-center justify-center gap-2 rounded-[5px] border border-cyan-500/30 px-3 py-2 text-xs font-medium text-cyan-400 transition hover:bg-cyan-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {locationDetecting || nearbySearching ? (
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-cyan-400/30 border-t-cyan-400" />
                    ) : (
                        <Navigation size={14} />
                    )}
                    {locationDetecting ? "Detecting Location..." : nearbySearching ? "Searching Nearby..." : "Use My Location"}
                </button>
            </div>

            {/* Search / Filters */}
            <div className="flex flex-col gap-3 rounded-[6px] border border-[var(--border)] bg-[var(--surface)] p-4 lg:flex-row lg:items-center lg:gap-4">

                <div className="relative w-full min-w-0 lg:w-[340px] lg:max-w-[340px] lg:flex-none">
                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                    />

                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                        placeholder="Search place or city (e.g. Haridwar)..."
                        className="h-[52px] w-full rounded-[5px] border border-slate-700 bg-[#091522] py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-cyan-500"
                    />
                </div>

                <button
                    type="button"
                    onClick={handleSearchLocation}
                    disabled={nearbySearching || !search.trim()}
                    className="inline-flex min-h-[52px] w-full shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[5px] border border-cyan-500/30 px-5 py-3 text-sm font-semibold text-cyan-400 transition hover:bg-cyan-500/10 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto lg:min-w-[176px]"
                >
                    {nearbySearching ? (
                        <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-cyan-400/30 border-t-cyan-400" />
                    ) : (
                        <Search size={20} strokeWidth={2.2} className="shrink-0" />
                    )}
                    {nearbySearching ? "Searching..." : "Search Location"}
                </button>

                <div className="flex min-w-0 flex-wrap items-center gap-2 lg:flex-1">
                    {["All", "Police", "Hospital", "Fire Station", "Pharmacy", "Doctor"].map(
                        (item) => {
                            const Icon =
                                categoryConfig[item]?.icon ||
                                ShieldCheck;

                            return (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() => setCategory(item)}
                                    className={`inline-flex items-center gap-1.5 rounded-[5px] px-3 py-2 text-xs font-medium transition ${category === item
                                        ? "bg-cyan-500 text-slate-950"
                                        : "border border-slate-700 bg-[#091522] text-slate-400 hover:text-white"
                                        }`}
                                >
                                    <Icon size={14} />
                                    {item}
                                </button>
                            );
                        }
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">

                {/* Real interactive OpenStreetMap */}
                <div className="relative min-h-[420px] overflow-hidden rounded-[6px] border border-[var(--border)] bg-[#091522] xl:sticky xl:top-[120px] xl:h-[calc(100vh-140px)] xl:min-h-[460px]">
                    {(locationDetecting || nearbySearching) && (
                        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-[#07101b]/65 p-5 backdrop-blur-[2px]">
                            <div className="flex max-w-sm flex-col items-center rounded-xl border border-cyan-500/25 bg-[#0b1724] px-6 py-5 text-center shadow-2xl">
                                <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-cyan-400/20 border-t-cyan-400" />
                                <p className="mt-3 text-sm font-semibold text-white">
                                    {locationDetecting ? "Detecting your location" : "Finding nearby emergency services"}
                                </p>
                                <p className="mt-1 text-xs leading-5 text-slate-400">
                                    {locationDetecting
                                        ? "Waiting for GPS coordinates. This usually takes a few seconds."
                                        : "Searching hospitals, police stations, fire stations, clinics and pharmacies within 10 km. The map is already centered on your location."}
                                </p>
                            </div>
                        </div>
                    )}
                    <MapContainer
                        center={mapCenter || userLocation || DEFAULT_CENTER}
                        zoom={12}
                        scrollWheelZoom={true}
                        className="nearby-leaflet-map"
                        style={{ height: "100%", minHeight: "420px", width: "100%", background: "#091522" }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <FitMapToPlaces places={filteredPlaces} mapCenter={mapCenter || userLocation} />

                        {filteredPlaces
                            .filter((place) => Number.isFinite(place.latitude) && Number.isFinite(place.longitude))
                            .map((place) => (
                                <Marker
                                    key={place._id || place.id}
                                    position={[place.latitude, place.longitude]}
                                    icon={createPlaceIcon(place.category)}
                                >
                                    <Popup>
                                        <div style={{ minWidth: "170px" }}>
                                            <strong>{place.name}</strong>
                                            <div>{place.category}</div>
                                            <div>{place.address}</div>
                                            <div>{place.phone}</div>
                                            <div>{place.status}</div>
                                            <button
                                                type="button"
                                                onClick={() => handleDirections(place)}
                                                style={{ marginTop: "8px", color: "#0891b2", cursor: "pointer" }}
                                            >
                                                Get directions
                                            </button>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}

                        {userLocation && (
                            <Marker position={userLocation}>
                                <Popup>Your current location</Popup>
                            </Marker>
                        )}
                    </MapContainer>

                    <div className="pointer-events-none absolute left-4 top-4 z-[500] rounded-[5px] border border-slate-700 bg-[#07101b]/90 px-3 py-2 backdrop-blur">
                        <p className="text-xs font-medium text-slate-200">Nearby Emergency Network</p>
                        <p className="mt-0.5 text-[10px] text-slate-400">{filteredPlaces.filter((place) => Number.isFinite(place.latitude) && Number.isFinite(place.longitude)).length} mapped nearby places</p>
                    </div>

                    <div className="pointer-events-none absolute bottom-4 left-4 z-[500] rounded-[5px] border border-slate-700 bg-[#07101b]/90 px-3 py-2 text-[10px] text-slate-300 backdrop-blur">
                        Drag to move · Scroll to zoom · Select a marker for details
                    </div>
                </div>

                {/* Places List */}
                <div className="rounded-[6px] border border-[var(--border)] bg-[var(--surface)] xl:max-h-[calc(100vh-140px)] xl:overflow-y-auto xl:overscroll-contain">

                    <div className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--surface)] px-5 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-base font-semibold text-white">
                                    Nearby Resources
                                </h2>

                                <p className="mt-1 text-xs text-slate-500">
                                    {filteredPlaces.length} resources found
                                </p>
                                {filteredPlaces.some((place) => !Number.isFinite(place.latitude) || !Number.isFinite(place.longitude)) && (
                                    <p className="mt-1 text-[10px] text-amber-400">Some places have no coordinates and cannot appear as map markers.</p>
                                )}
                            </div>

                            <Building2
                                size={19}
                                className="text-slate-600"
                            />
                        </div>
                    </div>

                    <div className="divide-y divide-[var(--border)]">
                        {loading ? (
                            <div className="flex flex-col items-center px-5 py-14 text-center text-sm text-slate-500">
                                <span className="h-7 w-7 animate-spin rounded-full border-2 border-cyan-400/20 border-t-cyan-400" />
                                <span className="mt-3">Loading saved nearby places...</span>
                            </div>
                        ) : nearbySearching || locationDetecting ? (
                            <div className="flex flex-col items-center px-5 py-14 text-center text-sm text-slate-500">
                                <span className="h-7 w-7 animate-spin rounded-full border-2 border-cyan-400/20 border-t-cyan-400" />
                                <span className="mt-3 text-slate-300">{locationDetecting ? "Detecting your location..." : "Searching nearby emergency services..."}</span>
                                <span className="mt-1 text-xs">Please wait; this may take a few seconds.</span>
                            </div>
                        ) : error ? (
                            <div className="px-5 py-14 text-center">
                                <p className="text-sm font-medium text-red-300">Unable to load nearby places</p>
                                <p className="mt-1 text-xs text-slate-500">Check that the backend is running and you are logged in.</p>
                                <button
                                    type="button"
                                    onClick={() => window.location.reload()}
                                    className="mt-3 rounded-[5px] border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:text-white"
                                >
                                    Retry
                                </button>
                            </div>
                        ) : filteredPlaces.map((place) => {
                            const Icon = getCategoryIcon(place.category);

                            return (
                                <div
                                    key={place._id || place.id}
                                    className="p-4 transition hover:bg-white/[0.015]"
                                >
                                    <div className="flex gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[5px] bg-cyan-500/10">
                                            <Icon
                                                size={19}
                                                className="text-cyan-400"
                                            />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <h3 className="text-sm font-medium text-slate-200">
                                                        {place.name}
                                                    </h3>

                                                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                                                        <MapPin size={12} />
                                                        {place.address}
                                                    </p>
                                                    {place.source === "Geoapify" && (
                                                        <p className="mt-1 text-[10px] text-slate-600">Map data · verify details before travel</p>
                                                    )}
                                                </div>

                                                <span className="shrink-0 text-xs font-medium text-cyan-400">
                                                    {place.distance || "Distance unavailable"}
                                                </span>
                                            </div>

                                            <div className="mt-3 flex items-center gap-2">
                                                <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                                                    <Clock3 size={12} />
                                                    {place.status}
                                                </span>
                                            </div>

                                            <div className="mt-3 flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDirections(place)
                                                    }
                                                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-[4px] border border-slate-700 bg-[#091522] px-2.5 py-2 text-[11px] font-medium text-slate-300 transition hover:border-cyan-500/30 hover:text-cyan-400"
                                                >
                                                    <Navigation size={13} />
                                                    Directions
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => handleCall(place.phone)}
                                                    disabled={!place.phone}
                                                    title={!place.phone ? "Phone number not listed" : "Call place"}
                                                    className="inline-flex items-center justify-center gap-1.5 rounded-[4px] border border-cyan-500/20 bg-cyan-500/5 px-3 py-2 text-[11px] font-medium text-cyan-400 transition hover:bg-cyan-500/10"
                                                >
                                                    <Phone size={13} />
                                                    Call
                                                </button>

                                                <button
                                                    type="button"
                                                    className="flex h-8 w-8 items-center justify-center rounded-[4px] text-slate-600 transition hover:bg-slate-800 hover:text-white"
                                                >
                                                    <ChevronRight size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {!loading && !error && filteredPlaces.length === 0 && (
                            <div className="px-5 py-14 text-center">
                                <MapPin
                                    size={24}
                                    className="mx-auto text-slate-600"
                                />

                                <p className="mt-3 text-sm font-medium text-slate-300">
                                    No resources found
                                </p>

                                <p className="mt-1 text-xs text-slate-600">
                                    Try another search or category.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Safety Notice */}
            <div className="flex items-start gap-3 rounded-[6px] border border-amber-500/15 bg-amber-500/5 p-4">
                <ShieldCheck
                    size={18}
                    className="mt-0.5 shrink-0 text-amber-400"
                />

                <div>
                    <p className="text-xs font-medium text-amber-300">
                        Emergency assistance
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                        In an immediate emergency, use the emergency numbers
                        above instead of waiting for a nearby resource search.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default NearbyHelp;