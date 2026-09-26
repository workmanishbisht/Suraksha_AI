import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
    Search,
    Bell,
    ChevronDown,
    MapPin,
    Navigation,
    SearchIcon,
    X,
    RefreshCw,
    Droplets,
    Wind,
    Umbrella,
    Sunrise,
    CloudSun,
    Cloud,
    CloudFog,
    CloudRain,
    CloudLightning,
    Sun,
    User,
    Settings,
    LogOut,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

const API_BASE_URL = "http://localhost:5000/api";

const DEFAULT_LOCATION = {
    name: "Dehradun",
    country: "India",
    state: "Uttarakhand",
    latitude: 30.3165,
    longitude: 78.0322,
};

const getWeatherDetails = (code, isDay) => {
    if (code === 0) {
        return {
            condition: isDay ? "Clear" : "Clear Night",
            icon: isDay ? Sun : CloudSun,
            iconClass: isDay
                ? "text-amber-400"
                : "text-blue-300",
        };
    }

    if ([1, 2].includes(code)) {
        return {
            condition:
                code === 1
                    ? "Mainly Clear"
                    : "Partly Cloudy",
            icon: CloudSun,
            iconClass: "text-amber-400",
        };
    }

    if (code === 3) {
        return {
            condition: "Overcast",
            icon: Cloud,
            iconClass: "text-slate-400",
        };
    }

    if ([45, 48].includes(code)) {
        return {
            condition: "Foggy",
            icon: CloudFog,
            iconClass: "text-slate-400",
        };
    }

    if ([51, 53, 55, 56, 57].includes(code)) {
        return {
            condition: "Drizzle",
            icon: CloudRain,
            iconClass: "text-cyan-400",
        };
    }

    if (
        [61, 63, 65, 66, 67, 80, 81, 82].includes(
            code
        )
    ) {
        return {
            condition: "Rain",
            icon: CloudRain,
            iconClass: "text-blue-400",
        };
    }

    if (
        [71, 73, 75, 77, 85, 86].includes(code)
    ) {
        return {
            condition: "Snow",
            icon: Cloud,
            iconClass: "text-sky-300",
        };
    }

    if ([95, 96, 99].includes(code)) {
        return {
            condition: "Thunderstorm",
            icon: CloudLightning,
            iconClass: "text-purple-400",
        };
    }

    return {
        condition: "Unavailable",
        icon: Cloud,
        iconClass: "text-slate-500",
    };
};

const formatTime = (value) => {
    if (!value) return "--";

    return new Intl.DateTimeFormat("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    }).format(new Date(value));
};

function Header() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [profileOpen, setProfileOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    const [locationOpen, setLocationOpen] = useState(false);
    const [locationMode, setLocationMode] = useState("detect");

    const [manualLocation, setManualLocation] =
        useState("");

    const [locationSearchLoading, setLocationSearchLoading] =
        useState(false);

    const [locationDetecting, setLocationDetecting] =
        useState(false);

    const [locationSaving, setLocationSaving] =
        useState(false);

    const [locationLoading, setLocationLoading] =
        useState(true);

    const [weatherLoading, setWeatherLoading] =
        useState(true);

    const [locationError, setLocationError] =
        useState("");

    const [searchResults, setSearchResults] =
        useState([]);

    const [selectedLocation, setSelectedLocation] =
        useState(DEFAULT_LOCATION);

    const [weather, setWeather] = useState({
        temperature: null,
        condition: "Loading...",
        icon: CloudSun,
        iconClass: "text-slate-500",
        humidity: null,
        wind: null,
        precipitation: null,
        sunrise: null,
    });

    /* =========================================
       GET SAVED LOCATION
    ========================================= */

    const fetchSavedLocation = async () => {
        try {
            setLocationLoading(true);

            const response = await fetch(
                `${API_BASE_URL}/location/me`,
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                        "Unable to load saved location"
                );
            }

            if (data?.location) {
                setSelectedLocation(data.location);
            }
        } catch (error) {
            console.error(
                "Saved Location Error:",
                error
            );

            setLocationError(
                "Unable to load saved location."
            );
        } finally {
            setLocationLoading(false);
        }
    };

    /* =========================================
       GET BACKEND WEATHER
    ========================================= */

    const fetchWeather = async () => {
        try {
            setWeatherLoading(true);

            const response = await fetch(
                `${API_BASE_URL}/weather`,
                {
                    method: "GET",
                    credentials: "include",
                    cache: "no-store",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                        "Weather request failed"
                );
            }

            const current = data?.weather;

            const details = getWeatherDetails(
                current?.weatherCode,
                current?.isDay
            );

            setWeather({
                temperature:
                    typeof current?.temperature ===
                    "number"
                        ? Math.round(
                              current.temperature
                          )
                        : null,

                condition: details.condition,

                icon: details.icon,

                iconClass: details.iconClass,

                humidity:
                    current?.humidity ?? null,

                wind:
                    current?.windSpeed ?? null,

                precipitation:
                    current?.precipitation ?? null,

                sunrise:
                    current?.sunrise || null,
            });

            if (data?.location) {
                setSelectedLocation(
                    data.location
                );
            }

            setLocationError("");
        } catch (error) {
            console.error(
                "Weather Error:",
                error
            );

            setWeather((prev) => ({
                ...prev,
                condition: "Unavailable",
            }));

            setLocationError(
                "Unable to load weather right now."
            );
        } finally {
            setWeatherLoading(false);
        }
    };

    /* =========================================
       INITIAL LOCATION + WEATHER
    ========================================= */

    useEffect(() => {
        const initializeLocation = async () => {
            await fetchSavedLocation();
            await fetchWeather();
        };

        initializeLocation();

        const interval = setInterval(() => {
            fetchWeather();
        }, 10 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    /* =========================================
       SAVE LOCATION
    ========================================= */

    const saveLocation = async (
        location,
        source = "manual"
    ) => {
        try {
            setLocationSaving(true);
            setLocationError("");

            const response = await fetch(
                `${API_BASE_URL}/location`,
                {
                    method: "PUT",
                    credentials: "include",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        name: location.name,
                        state:
                            location.state || "",
                        country:
                            location.country || "",
                        latitude:
                            location.latitude,
                        longitude:
                            location.longitude,
                        source,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                        "Unable to save location"
                );
            }

            setSelectedLocation(data.location);

            await fetchWeather();

            toast.success(
                "Location updated successfully."
            );

            setLocationOpen(false);
            setManualLocation("");
            setSearchResults([]);
        } catch (error) {
            console.error(
                "Save Location Error:",
                error
            );

            setLocationError(
                error.message ||
                    "Unable to save location."
            );
        } finally {
            setLocationSaving(false);
        }
    };

    /* =========================================
       DETECT CURRENT LOCATION
    ========================================= */

    const detectCurrentLocation = () => {
        if (!navigator.geolocation) {
            setLocationError(
                "Geolocation is not supported by this browser."
            );
            return;
        }

        setLocationError("");
        setLocationDetecting(true);

        navigator.geolocation.getCurrentPosition(
            async ({ coords }) => {
                try {
                    const response = await fetch(
                        `${API_BASE_URL}/location/detect`,
                        {
                            method: "POST",
                            credentials: "include",
                            headers: {
                                "Content-Type":
                                    "application/json",
                            },
                            body: JSON.stringify({
                                latitude:
                                    coords.latitude,
                                longitude:
                                    coords.longitude,
                            }),
                        }
                    );

                    const data =
                        await response.json();

                    if (!response.ok) {
                        throw new Error(
                            data?.message ||
                                "Unable to detect location"
                        );
                    }

                    setSelectedLocation(
                        data.location
                    );

                    setLocationMode("detect");
                    setManualLocation("");

                    await fetchWeather();

                    toast.success(
                        "Current location detected."
                    );

                    setLocationOpen(false);
                } catch (error) {
                    console.error(
                        "Location Error:",
                        error
                    );

                    setLocationError(
                        error.message ||
                            "Could not identify your current location."
                    );
                } finally {
                    setLocationDetecting(false);
                }
            },
            (error) => {
                console.error(
                    "Geolocation Error:",
                    error
                );

                setLocationDetecting(false);

                setLocationError(
                    "Location permission was denied or unavailable."
                );
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000,
            }
        );
    };

    /* =========================================
       SEARCH LOCATION
    ========================================= */

    const searchManualLocation = async () => {
        const query = manualLocation.trim();

        if (!query) {
            setLocationError(
                "Enter a city or place first."
            );
            return;
        }

        try {
            setLocationSearchLoading(true);
            setLocationError("");
            setSearchResults([]);

            const response = await fetch(
                `${API_BASE_URL}/location/search?q=${encodeURIComponent(
                    query
                )}`,
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                        "Location search failed"
                );
            }

            if (
                !data?.locations ||
                data.locations.length === 0
            ) {
                setLocationError(
                    "Location not found. Try another city."
                );
                return;
            }

            setSearchResults(
                data.locations
            );
        } catch (error) {
            console.error(
                "Manual Location Error:",
                error
            );

            setLocationError(
                error.message ||
                    "Unable to search this location."
            );
        } finally {
            setLocationSearchLoading(false);
        }
    };

    /* =========================================
       LOGOUT
    ========================================= */

    const handleLogout = async () => {
        try {
            setLoggingOut(true);

            await logout();

            toast.success(
                "Logged out successfully."
            );

            setProfileOpen(false);

            navigate("/login", {
                replace: true,
            });
        } catch (error) {
            toast.error(
                "Unable to logout. Please try again."
            );
        } finally {
            setLoggingOut(false);
        }
    };

    /* =========================================
       USER DETAILS
    ========================================= */

    const displayName =
        user?.name?.replace(/\s+Admin$/i, "") ||
        "Manish Bisht";

    const displayRole =
        user?.role === "admin"
            ? "Admin"
            : user?.role === "field_officer"
              ? "Field Officer"
              : user?.role ===
                  "department_officer"
                ? "Department Officer"
                : "Citizen";

    const initials = displayName
        .split(" ")
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <>
            <header
                className="
                fixed left-0 right-0 top-0 z-50
                flex h-[72px] items-center justify-between
                border-b border-[#173149]
                bg-[#071827]/95
                px-4
                backdrop-blur-md
                sm:px-6
                lg:left-[248px]
            "
            >
                {/* Search */}
                <div className="relative w-full max-w-[430px]">
                    <Search
                        size={18}
                        className="
                        absolute left-3.5 top-1/2
                        -translate-y-1/2
                        text-slate-500
                    "
                    />

                    <input
                        type="text"
                        placeholder="Search incidents, users, locations..."
                        className="
                        h-10 w-full
                        rounded-[6px]
                        border border-[#1c3a52]
                        bg-[#0a1a2a]
                        pl-11 pr-4
                        text-xs text-slate-100
                        outline-none
                        transition-all
                        placeholder:text-slate-500
                        hover:border-[#28506d]
                        focus:border-cyan-500/60
                        focus:ring-2
                        focus:ring-cyan-500/10
                    "
                    />
                </div>

                {/* Right Section */}
                <div className="ml-4 flex items-center gap-3 sm:gap-5">
                    {/* Location & Temperature */}
                    <button
                        type="button"
                        onClick={() =>
                            setLocationOpen(true)
                        }
                        className="hidden items-center gap-3 rounded-[6px] text-left md:flex"
                        aria-label="Open location and weather"
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-[6px] border border-[#21415c] bg-[#0a1d2e]">
                            <MapPin
                                size={17}
                                className="text-cyan-400"
                            />
                        </div>

                        <div className="leading-tight">
                            <div className="flex items-center gap-1.5">
                                <span className="max-w-[110px] truncate text-xs font-medium text-slate-200">
                                    {locationLoading
                                        ? "Loading..."
                                        : selectedLocation.name}
                                </span>

                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            </div>

                            <div className="mt-1 flex items-center gap-1.5">
                                {(() => {
                                    const WeatherIcon =
                                        weather.icon;

                                    return (
                                        <WeatherIcon
                                            size={13}
                                            className={
                                                weather.iconClass
                                            }
                                        />
                                    );
                                })()}

                                <span className="text-[10px] text-slate-400">
                                    {weatherLoading
                                        ? "--"
                                        : weather.temperature !==
                                            null
                                          ? `${weather.temperature}°C`
                                          : "--"}
                                </span>

                                <span className="max-w-[90px] truncate text-[10px] text-slate-500">
                                    {weather.condition}
                                </span>
                            </div>
                        </div>
                    </button>

                    {/* Divider */}
                    <div
                        className="
                        hidden h-8 w-px
                        bg-[#1b344a]
                        md:block
                    "
                    />

                    {/* Notifications */}
                    <button
                        type="button"
                        aria-label="Notifications"
                        className="
                        relative flex h-9 w-9
                        items-center justify-center
                        rounded-[6px]
                        border border-[#21415c]
                        bg-[#0a1d2e]
                        text-slate-300
                        transition-all
                        hover:border-cyan-500/40
                        hover:bg-cyan-500/5
                        hover:text-white
                    "
                    >
                        <Bell size={18} />

                        <span
                            className="
                            absolute right-2 top-2
                            h-1.5 w-1.5
                            rounded-full
                            bg-red-500
                            ring-2 ring-[#0a1d2e]
                        "
                        />
                    </button>

                    {/* Profile */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() =>
                                setProfileOpen(
                                    (prev) => !prev
                                )
                            }
                            aria-expanded={
                                profileOpen
                            }
                            className="
                            flex items-center gap-2.5
                            rounded-[6px]
                            border border-transparent
                            px-1.5 py-1
                            transition
                            hover:border-[#21415c]
                            hover:bg-[#0a1d2e]
                        "
                        >
                            <div className="relative">
                                <div
                                    className="
                                    flex h-9 w-9
                                    items-center justify-center
                                    rounded-full
                                    bg-gradient-to-br
                                    from-blue-500
                                    to-cyan-500
                                    text-xs font-semibold
                                    text-white
                                "
                                >
                                    {initials}
                                </div>

                                <span
                                    className="
                                    absolute bottom-0 right-0
                                    h-2.5 w-2.5
                                    rounded-full
                                    border-2
                                    border-[#071827]
                                    bg-emerald-400
                                "
                                />
                            </div>

                            <div className="hidden text-left sm:block">
                                <p className="text-xs font-medium text-slate-100">
                                    {displayName}
                                </p>

                                <p className="mt-0.5 text-[10px] text-slate-500">
                                    {displayRole}
                                </p>
                            </div>

                            <ChevronDown
                                size={15}
                                className={`
                                hidden text-slate-500
                                transition-transform
                                sm:block
                                ${
                                    profileOpen
                                        ? "rotate-180"
                                        : ""
                                }
                            `}
                            />
                        </button>

                        {/* Profile Dropdown */}
                        {profileOpen && (
                            <div
                                className="
                                absolute right-0 top-[52px]
                                w-[220px]
                                overflow-hidden
                                rounded-[6px]
                                border border-[#1c3a52]
                                bg-[#0a1a2a]
                                shadow-[0_12px_30px_rgba(0,0,0,0.35)]
                            "
                            >
                                <div className="border-b border-[#173149] px-4 py-3">
                                    <p className="truncate text-sm font-medium text-white">
                                        {displayName}
                                    </p>

                                    <p className="mt-1 truncate text-[11px] text-slate-500">
                                        {user?.email ||
                                            "admin@surakshaai.com"}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setProfileOpen(
                                            false
                                        );
                                        navigate(
                                            "/admin/profile"
                                        );
                                    }}
                                    className="
                                    flex w-full items-center gap-3
                                    px-4 py-3
                                    text-left text-xs
                                    text-slate-300
                                    transition
                                    hover:bg-[#0f2639]
                                    hover:text-white
                                "
                                >
                                    <User
                                        size={16}
                                        className="text-slate-500"
                                    />

                                    <span>Profile</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setProfileOpen(
                                            false
                                        );
                                        navigate(
                                            "/admin/settings"
                                        );
                                    }}
                                    className="
                                    flex w-full items-center gap-3
                                    px-4 py-3
                                    text-left text-xs
                                    text-slate-300
                                    transition
                                    hover:bg-[#0f2639]
                                    hover:text-white
                                "
                                >
                                    <Settings
                                        size={16}
                                        className="text-slate-500"
                                    />

                                    <span>Settings</span>
                                </button>

                                <div className="mx-3 border-t border-[#173149]" />

                                <button
                                    type="button"
                                    onClick={
                                        handleLogout
                                    }
                                    disabled={
                                        loggingOut
                                    }
                                    className="
                                    flex w-full items-center gap-3
                                    px-4 py-3
                                    text-left text-xs
                                    text-red-400
                                    transition
                                    hover:bg-red-500/10
                                    hover:text-red-300
                                    disabled:cursor-not-allowed
                                    disabled:opacity-60
                                "
                                >
                                    <LogOut size={16} />

                                    <span>
                                        {loggingOut
                                            ? "Logging out..."
                                            : "Logout"}
                                    </span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Location Modal */}
            {locationOpen && (
                <div
                    className="fixed inset-0 z-[80] flex items-center justify-center bg-black/55 px-4 py-6 backdrop-blur-[2px]"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            setLocationOpen(false);
                        }
                    }}
                >
                    <div className="w-full max-w-[430px] overflow-hidden rounded-[8px] border border-[#1c3a52] bg-[#071827] shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
                        <div className="flex items-start justify-between border-b border-[#173149] px-5 py-4">
                            <div>
                                <h3 className="text-sm font-semibold text-white">
                                    Set Your Location
                                </h3>

                                <p className="mt-1 max-w-[330px] text-[10px] leading-4 text-slate-500">
                                    Get real-time weather information for your current location or search manually.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setLocationOpen(
                                        false
                                    )
                                }
                                className="flex h-7 w-7 items-center justify-center rounded-[5px] text-slate-500 transition hover:bg-white/5 hover:text-white"
                                aria-label="Close location dialog"
                            >
                                <X size={15} />
                            </button>
                        </div>

                        <div className="p-4">
                            <div className="grid grid-cols-2 gap-2 rounded-[6px] border border-[#173149] bg-[#0a1a2a] p-1">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setLocationMode(
                                            "detect"
                                        );
                                        setLocationError(
                                            ""
                                        );
                                        setSearchResults(
                                            []
                                        );
                                    }}
                                    className={`rounded-[5px] px-3 py-2 text-left transition ${
                                        locationMode ===
                                        "detect"
                                            ? "border border-blue-500/70 bg-blue-500/10"
                                            : "hover:bg-white/[0.03]"
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <Navigation
                                            size={14}
                                            className={
                                                locationMode ===
                                                "detect"
                                                    ? "text-blue-400"
                                                    : "text-slate-500"
                                            }
                                        />

                                        <span className="text-[10px] font-medium text-slate-200">
                                            Detect My Location
                                        </span>
                                    </div>

                                    <p className="mt-1 pl-5 text-[8px] text-slate-500">
                                        Use your device location
                                    </p>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setLocationMode(
                                            "manual"
                                        );
                                        setLocationError(
                                            ""
                                        );
                                    }}
                                    className={`rounded-[5px] px-3 py-2 text-left transition ${
                                        locationMode ===
                                        "manual"
                                            ? "border border-blue-500/70 bg-blue-500/10"
                                            : "hover:bg-white/[0.03]"
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <SearchIcon
                                            size={14}
                                            className={
                                                locationMode ===
                                                "manual"
                                                    ? "text-blue-400"
                                                    : "text-slate-500"
                                            }
                                        />

                                        <span className="text-[10px] font-medium text-slate-200">
                                            Enter Manually
                                        </span>
                                    </div>

                                    <p className="mt-1 pl-5 text-[8px] text-slate-500">
                                        Search any city or place
                                    </p>
                                </button>
                            </div>

                            {locationMode ===
                            "detect" ? (
                                <div className="mt-3 rounded-[6px] border border-[#173149] bg-[#091b2c] p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 ring-1 ring-blue-500/15">
                                            <Navigation
                                                size={22}
                                                className="text-blue-400"
                                            />
                                        </div>

                                        <div>
                                            <p className="text-xs font-semibold text-white">
                                                Use your current location
                                            </p>

                                            <p className="mt-1 text-[9px] leading-4 text-slate-500">
                                                Allow location access to get real-time weather for where you are.
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={
                                            detectCurrentLocation
                                        }
                                        disabled={
                                            locationDetecting ||
                                            locationSaving
                                        }
                                        className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-[5px] bg-blue-600 text-[10px] font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        <Navigation
                                            size={13}
                                        />

                                        {locationDetecting
                                            ? "Detecting Location..."
                                            : "Detect My Location"}
                                    </button>
                                </div>
                            ) : (
                                <div className="mt-3 rounded-[6px] border border-[#173149] bg-[#091b2c] p-4">
                                    <label className="text-[10px] font-medium text-slate-300">
                                        City or place
                                    </label>

                                    <div className="mt-2 flex gap-2">
                                        <input
                                            value={
                                                manualLocation
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setManualLocation(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            onKeyDown={(
                                                event
                                            ) => {
                                                if (
                                                    event.key ===
                                                    "Enter"
                                                ) {
                                                    searchManualLocation();
                                                }
                                            }}
                                            placeholder="e.g. Dehradun, Delhi, Mumbai"
                                            className="h-10 min-w-0 flex-1 rounded-[5px] border border-[#1c3a52] bg-[#071827] px-3 text-[10px] text-white outline-none placeholder:text-slate-600 focus:border-blue-500/60"
                                        />

                                        <button
                                            type="button"
                                            onClick={
                                                searchManualLocation
                                            }
                                            disabled={
                                                locationSearchLoading
                                            }
                                            className="flex h-10 items-center gap-1.5 rounded-[5px] bg-blue-600 px-3 text-[10px] font-medium text-white hover:bg-blue-500 disabled:opacity-60"
                                        >
                                            <SearchIcon
                                                size={13}
                                            />

                                            {locationSearchLoading
                                                ? "Searching..."
                                                : "Search"}
                                        </button>
                                    </div>

                                    {/* Search Results */}
                                    {searchResults.length >
                                        0 && (
                                        <div className="mt-3 space-y-1.5">
                                            {searchResults.map(
                                                (
                                                    location,
                                                    index
                                                ) => (
                                                    <button
                                                        key={`${location.name}-${location.latitude}-${index}`}
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedLocation(
                                                                location
                                                            );
                                                            setSearchResults(
                                                                []
                                                            );
                                                            setLocationError(
                                                                ""
                                                            );
                                                        }}
                                                        className="flex w-full items-start gap-2 rounded-[5px] border border-[#173149] bg-[#071827] px-3 py-2 text-left transition hover:border-blue-500/40 hover:bg-blue-500/5"
                                                    >
                                                        <MapPin
                                                            size={
                                                                13
                                                            }
                                                            className="mt-0.5 shrink-0 text-cyan-400"
                                                        />

                                                        <div className="min-w-0">
                                                            <p className="truncate text-[10px] font-medium text-slate-200">
                                                                {
                                                                    location.name
                                                                }
                                                            </p>

                                                            <p className="mt-0.5 truncate text-[8px] text-slate-500">
                                                                {[
                                                                    location.state,
                                                                    location.country,
                                                                ]
                                                                    .filter(
                                                                        Boolean
                                                                    )
                                                                    .join(
                                                                        ", "
                                                                    )}
                                                            </p>
                                                        </div>
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Weather */}
                            <div className="mt-3 rounded-[6px] border border-[#173149] bg-[#081a2b]">
                                <div className="flex items-center justify-between border-b border-[#173149] px-3 py-2.5">
                                    <span className="text-[9px] text-slate-500">
                                        Current Location{" "}
                                        <span className="text-emerald-400">
                                            •
                                        </span>
                                    </span>

                                    <button
                                        type="button"
                                        onClick={
                                            fetchWeather
                                        }
                                        disabled={
                                            weatherLoading
                                        }
                                        className="flex items-center gap-1 text-[9px] text-cyan-400 hover:text-cyan-300 disabled:opacity-50"
                                    >
                                        <RefreshCw
                                            size={10}
                                            className={
                                                weatherLoading
                                                    ? "animate-spin"
                                                    : ""
                                            }
                                        />

                                        Refresh
                                    </button>
                                </div>

                                <div className="grid grid-cols-[1fr_auto] gap-3 px-3 py-3">
                                    <div className="flex items-center gap-3">
                                        {(() => {
                                            const WeatherIcon =
                                                weather.icon;

                                            return (
                                                <WeatherIcon
                                                    size={29}
                                                    className={
                                                        weather.iconClass
                                                    }
                                                />
                                            );
                                        })()}

                                        <div>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-xl font-semibold text-white">
                                                    {weather.temperature !==
                                                    null
                                                        ? `${weather.temperature}°C`
                                                        : "--"}
                                                </span>

                                                <span className="text-[9px] text-slate-400">
                                                    {
                                                        weather.condition
                                                    }
                                                </span>
                                            </div>

                                            <p className="mt-1 text-[9px] text-slate-500">
                                                {
                                                    selectedLocation.name
                                                }
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-[10px] font-medium text-slate-200">
                                            {
                                                selectedLocation.name
                                            }
                                        </p>

                                        <p className="mt-0.5 max-w-[130px] text-[8px] text-slate-500">
                                            {[
                                                selectedLocation.state,
                                                selectedLocation.country,
                                            ]
                                                .filter(
                                                    Boolean
                                                )
                                                .join(
                                                    ", "
                                                )}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-4 border-t border-[#173149]">
                                    <div className="px-2 py-2.5 text-center">
                                        <Droplets
                                            size={12}
                                            className="mx-auto text-cyan-400"
                                        />

                                        <p className="mt-1 text-[9px] text-slate-300">
                                            {weather.humidity ??
                                                "--"}
                                            %
                                        </p>

                                        <span className="text-[7px] text-slate-600">
                                            Humidity
                                        </span>
                                    </div>

                                    <div className="border-l border-[#173149] px-2 py-2.5 text-center">
                                        <Wind
                                            size={12}
                                            className="mx-auto text-slate-400"
                                        />

                                        <p className="mt-1 text-[9px] text-slate-300">
                                            {weather.wind ??
                                                "--"}{" "}
                                            km/h
                                        </p>

                                        <span className="text-[7px] text-slate-600">
                                            Wind
                                        </span>
                                    </div>

                                    <div className="border-l border-[#173149] px-2 py-2.5 text-center">
                                        <Umbrella
                                            size={12}
                                            className="mx-auto text-blue-400"
                                        />

                                        <p className="mt-1 text-[9px] text-slate-300">
                                            {weather.precipitation ??
                                                "--"}{" "}
                                            mm
                                        </p>

                                        <span className="text-[7px] text-slate-600">
                                            Precipitation
                                        </span>
                                    </div>

                                    <div className="border-l border-[#173149] px-2 py-2.5 text-center">
                                        <Sunrise
                                            size={12}
                                            className="mx-auto text-amber-400"
                                        />

                                        <p className="mt-1 text-[9px] text-slate-300">
                                            {formatTime(
                                                weather.sunrise
                                            )}
                                        </p>

                                        <span className="text-[7px] text-slate-600">
                                            Sunrise
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {locationError && (
                                <p className="mt-2 text-[9px] text-red-400">
                                    {locationError}
                                </p>
                            )}

                            <div className="mt-4 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setLocationOpen(
                                            false
                                        )
                                    }
                                    className="h-9 rounded-[5px] border border-[#29445b] px-4 text-[10px] text-slate-300 hover:bg-white/5"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    disabled={
                                        locationSaving ||
                                        locationDetecting
                                    }
                                    onClick={() =>
                                        saveLocation(
                                            selectedLocation,
                                            "manual"
                                        )
                                    }
                                    className="h-9 rounded-[5px] bg-blue-600 px-4 text-[10px] font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {locationSaving
                                        ? "Saving..."
                                        : "Use This Location"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Header;