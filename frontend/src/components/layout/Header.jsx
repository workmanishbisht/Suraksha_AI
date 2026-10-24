
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
    Search,
    Bell,
    ChevronDown,
    MapPin,
    Navigation,
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
    TriangleAlert,
    Users,
    SearchIcon,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import {
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
} from "../../services/notificationApi";

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
            iconClass: isDay ? "text-amber-400" : "text-blue-300",
        };
    }

    if ([1, 2].includes(code)) {
        return {
            condition: code === 1 ? "Mainly Clear" : "Partly Cloudy",
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

    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
        return {
            condition: "Rain",
            icon: CloudRain,
            iconClass: "text-blue-400",
        };
    }

    if ([71, 73, 75, 77, 85, 86].includes(code)) {
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

const formatNotificationTime = (value) => {
    if (!value) return "Just now";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    const diffMs = Date.now() - date.getTime();
    const minutes = Math.floor(diffMs / 60000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);

    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);

    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year:
            date.getFullYear() !== new Date().getFullYear()
                ? "numeric"
                : undefined,
    });
};

const getSearchLabel = (item) => {
    if (item.type === "incident") {
        return item.title || item.name || "Incident";
    }

    if (item.type === "citizen") {
        return item.name || item.username || "Citizen";
    }

    return item.name || "Location";
};

const getSearchSubtitle = (item) => {
    if (item.type === "incident") {
        return [
            item.incidentId || item.id,
            item.location?.address ||
            item.location?.name ||
            item.location,
            item.status,
        ]
            .filter(Boolean)
            .join(" • ");
    }

    if (item.type === "citizen") {
        return [item.email, item.location, item.status]
            .filter(Boolean)
            .join(" • ");
    }

    return [item.state, item.country]
        .filter(Boolean)
        .join(", ");
};

function Header() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const searchRef = useRef(null);
    const searchTimerRef = useRef(null);

    const [profileOpen, setProfileOpen] = useState(false);

    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [notificationsLoading, setNotificationsLoading] = useState(false);
    const [notificationsError, setNotificationsError] = useState("");
    const [notificationActionLoading, setNotificationActionLoading] =
        useState(false);

    const unreadCount = notifications.filter(
        (item) => !item.isRead
    ).length;

    const [loggingOut, setLoggingOut] = useState(false);

    const fetchNotifications = async () => {
        try {
            setNotificationsLoading(true);
            setNotificationsError("");

            const data = await getNotifications();

            setNotifications(
                Array.isArray(data.notifications)
                    ? data.notifications
                    : []
            );
        } catch (error) {
            console.error("Fetch Notifications Error:", error);

            setNotificationsError(
                error.message || "Unable to load notifications."
            );
        } finally {
            setNotificationsLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const getNotificationDestination = () => {
        switch (user?.role) {
            case "admin":
                return "/admin/communication";

            case "citizen":
                return "/citizen/alerts";

            case "field_officer":
                return "/field-officer/dashboard";

            case "department_officer":
                return "/department/dashboard";

            default:
                return "/login";
        }
    };

    const handleNotificationClick = async (notification) => {
        try {
            if (!notification.isRead) {
                const data = await markNotificationRead(
                    notification._id
                );

                const updatedNotification = data.notification;

                setNotifications((previous) =>
                    previous.map((item) =>
                        item._id === notification._id
                            ? {
                                ...item,
                                ...(updatedNotification || {}),
                                isRead: true,
                            }
                            : item
                    )
                );
            }

            setNotificationsOpen(false);

            navigate(getNotificationDestination());
        } catch (error) {
            console.error("Mark Notification Read Error:", error);

            toast.error(
                error.message ||
                "Unable to mark notification as read."
            );
        }
    };

    const handleMarkAllNotificationsRead = async () => {
        if (unreadCount === 0 || notificationActionLoading) return;

        try {
            setNotificationActionLoading(true);

            await markAllNotificationsRead();

            setNotifications((previous) =>
                previous.map((item) => ({
                    ...item,
                    isRead: true,
                }))
            );

            toast.success("All notifications marked as read.");
        } catch (error) {
            console.error("Mark All Notifications Read Error:", error);

            toast.error(
                error.message || "Unable to update notifications."
            );
        } finally {
            setNotificationActionLoading(false);
        }
    };

    const [globalSearch, setGlobalSearch] = useState("");
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [searchCompleted, setSearchCompleted] = useState(false);

    const [locationOpen, setLocationOpen] = useState(false);
    const [locationMode, setLocationMode] = useState("detect");
    const [manualLocation, setManualLocation] = useState("");
    const [locationSearchLoading, setLocationSearchLoading] =
        useState(false);
    const [locationDetecting, setLocationDetecting] = useState(false);
    const [locationSaving, setLocationSaving] = useState(false);
    const [locationLoading, setLocationLoading] = useState(true);
    const [weatherLoading, setWeatherLoading] = useState(true);
    const [locationError, setLocationError] = useState("");
    const [locationResults, setLocationResults] = useState([]);

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
                    data?.message || "Unable to load saved location"
                );
            }

            if (data?.location) {
                setSelectedLocation(data.location);
            }
        } catch (error) {
            console.error("Saved Location Error:", error);
        } finally {
            setLocationLoading(false);
        }
    };

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
                    data?.message || "Weather request failed"
                );
            }

            const current = data?.weather;

            const details = getWeatherDetails(
                current?.weatherCode,
                current?.isDay
            );

            setWeather({
                temperature:
                    typeof current?.temperature === "number"
                        ? Math.round(current.temperature)
                        : null,
                condition: details.condition,
                icon: details.icon,
                iconClass: details.iconClass,
                humidity: current?.humidity ?? null,
                wind: current?.windSpeed ?? null,
                precipitation: current?.precipitation ?? null,
                sunrise: current?.sunrise || null,
            });

            if (data?.location) {
                setSelectedLocation(data.location);
            }
        } catch (error) {
            console.error("Weather Error:", error);

            setWeather((previous) => ({
                ...previous,
                condition: "Unavailable",
            }));
        } finally {
            setWeatherLoading(false);
        }
    };

    useEffect(() => {
        let mounted = true;

        const initialize = async () => {
            if (!mounted) return;

            await fetchSavedLocation();

            if (!mounted) return;

            await fetchWeather();
        };

        initialize();

        const interval = setInterval(
            fetchWeather,
            10 * 60 * 1000
        );

        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, []);

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
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: location.name,
                        state: location.state || "",
                        country: location.country || "",
                        latitude: location.latitude,
                        longitude: location.longitude,
                        source,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.message || "Unable to save location"
                );
            }

            setSelectedLocation(data.location);

            await fetchWeather();

            toast.success("Location updated successfully.");

            setLocationOpen(false);
            setManualLocation("");
            setLocationResults([]);
        } catch (error) {
            console.error("Save Location Error:", error);

            setLocationError(
                error.message || "Unable to save location."
            );
        } finally {
            setLocationSaving(false);
        }
    };

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
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                latitude: coords.latitude,
                                longitude: coords.longitude,
                            }),
                        }
                    );

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(
                            data?.message ||
                            "Unable to detect location"
                        );
                    }

                    setSelectedLocation(data.location);

                    await fetchWeather();

                    toast.success("Current location detected.");

                    setLocationOpen(false);
                } catch (error) {
                    console.error("Location Error:", error);

                    setLocationError(
                        error.message ||
                        "Could not identify your current location."
                    );
                } finally {
                    setLocationDetecting(false);
                }
            },
            () => {
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

    const searchManualLocation = async () => {
        const query = manualLocation.trim();

        if (!query) {
            setLocationError("Enter a city or place first.");
            return;
        }

        try {
            setLocationSearchLoading(true);
            setLocationError("");
            setLocationResults([]);

            const response = await fetch(
                `${API_BASE_URL}/location/search?q=${encodeURIComponent(query)}`,
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.message || "Location search failed"
                );
            }

            if (!data?.locations?.length) {
                setLocationError(
                    "Location not found. Try another city."
                );
                return;
            }

            setLocationResults(data.locations);
        } catch (error) {
            console.error("Manual Location Error:", error);

            setLocationError(
                error.message || "Unable to search this location."
            );
        } finally {
            setLocationSearchLoading(false);
        }
    };


    const runGlobalSearch = async (query) => {
        const value = query.trim();

        if (value.length < 2) {
            setSearchResults([]);
            setSearchCompleted(false);
            setSearchLoading(false);
            return;
        }

        try {
            setSearchLoading(true);
            setSearchCompleted(false);

            const encoded = encodeURIComponent(value);

            const [
                incidentResponse,
                citizenResponse,
                locationResponse,
            ] = await Promise.all([
                fetch(
                    `${API_BASE_URL}/incidents?search=${encoded}&page=1&limit=5`,
                    {
                        method: "GET",
                        credentials: "include",
                    }
                ),
                fetch(
                    `${API_BASE_URL}/citizens?search=${encoded}&page=1&limit=5`,
                    {
                        method: "GET",
                        credentials: "include",
                    }
                ),
                fetch(
                    `${API_BASE_URL}/location/search?q=${encoded}`,
                    {
                        method: "GET",
                        credentials: "include",
                    }
                ),
            ]);

            const incidentData = await incidentResponse.json();
            const citizenData = await citizenResponse.json();
            const locationData = await locationResponse.json();

            const incidents = Array.isArray(incidentData?.incidents)
                ? incidentData.incidents
                    .map((item) => ({
                        ...item,
                        type: "incident",
                    }))
                    .slice(0, 5)
                : [];

            const citizens = Array.isArray(citizenData?.citizens)
                ? citizenData.citizens
                    .map((item) => ({
                        ...item,
                        type: "citizen",
                    }))
                    .slice(0, 5)
                : [];

            const locations = Array.isArray(locationData?.locations)
                ? locationData.locations
                    .map((item) => ({
                        ...item,
                        type: "location",
                    }))
                    .slice(0, 5)
                : [];

            setSearchResults([
                ...incidents,
                ...citizens,
                ...locations,
            ]);

            setSearchCompleted(true);
        } catch (error) {
            console.error("Global Search Error:", error);

            setSearchResults([]);
            setSearchCompleted(true);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleSearchChange = (event) => {
        const value = event.target.value;

        setGlobalSearch(value);
        setSearchOpen(true);

        if (searchTimerRef.current) {
            clearTimeout(searchTimerRef.current);
        }

        searchTimerRef.current = setTimeout(() => {
            runGlobalSearch(value);
        }, 350);
    };

    useEffect(() => {
        return () => {
            if (searchTimerRef.current) {
                clearTimeout(searchTimerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (
                searchRef.current &&
                !searchRef.current.contains(event.target)
            ) {
                setSearchOpen(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleOutsideClick
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleOutsideClick
            );
        };
    }, []);

    const handleSearchResultClick = (item) => {
        setSearchOpen(false);

        if (item.type === "incident") {
            const value =
                item.incidentId ||
                item.id ||
                item._id ||
                item.title ||
                "";

            navigate(
                `/admin/incidents?search=${encodeURIComponent(value)}`
            );
            return;
        }

        if (item.type === "citizen") {
            const value =
                item.username ||
                item.email ||
                item.name ||
                "";

            navigate(
                `/admin/citizens?search=${encodeURIComponent(value)}`
            );
            return;
        }

        if (item.type === "location") {
            setSelectedLocation(item);
            setManualLocation(item.name || "");
            setLocationMode("manual");
            setLocationOpen(true);
        }
    };

    const handleLogout = async () => {
        try {
            setLoggingOut(true);

            await logout();

            toast.success("Logged out successfully.");

            setProfileOpen(false);

            navigate("/login", {
                replace: true,
            });
        } catch (error) {
            toast.error("Unable to logout. Please try again.");
        } finally {
            setLoggingOut(false);
        }
    };

    // User information from the authenticated session
    const displayName =
        user?.name || user?.username || "Suraksha AI";

    const displayRole =
        user?.role === "admin"
            ? "Admin"
            : user?.role === "field_officer"
                ? "Field Officer"
                : user?.role === "department_officer"
                    ? "Department Officer"
                    : "Citizen";

    const initials = displayName
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    const profileImage = user?.profileImage || null;

    const getProfileDestination = () => {
        switch (user?.role) {
            case "admin":
                return "/admin/profile";

            case "citizen":
                return "/citizen/profile";

            case "field_officer":
                return "/field-officer/profile";

            case "department_officer":
                return "/department/profile";

            default:
                return "/login";
        }
    };


    const getSettingsDestination = () => {
        switch (user?.role) {
            case "admin":
                return "/admin/settings";

            case "citizen":
                return "/citizen/settings";

            case "field_officer":
                return "/field-officer/dashboard";

            case "department_officer":
                return "/department/dashboard";

            default:
                return "/login";
        }
    };

    const SearchResultIcon = ({ type }) => {
        if (type === "incident") {
            return <TriangleAlert size={15} />;
        }

        if (type === "citizen") {
            return <Users size={15} />;
        }

        return <MapPin size={15} />;
    };

    return (
        <>
            <header className="fixed left-0 right-0 top-0 z-50 h-[72px] border-b border-[#173149] bg-[#071827]/95 backdrop-blur-md lg:left-[248px]">
                <div className="flex h-full w-full min-w-0 items-center gap-1.5 pl-[64px] pr-3 sm:gap-3 sm:px-5 lg:px-5 xl:px-6">
                    {/* SEARCH */}
                    <div
                        ref={searchRef}
                        className="relative min-w-0 w-0 flex-1 lg:w-[min(520px,42vw)] lg:flex-none xl:w-[560px]"
                    >
                        <Search
                            size={19}
                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                        />

                        <input
                            type="text"
                            value={globalSearch}
                            onFocus={() => setSearchOpen(true)}
                            onChange={handleSearchChange}
                            onKeyDown={(event) => {
                                if (event.key === "Escape") {
                                    setSearchOpen(false);
                                }
                            }}
                            placeholder="Search incidents, users, locations..."
                            className="h-[40px] w-full min-w-0 rounded-[6px] border border-[#1c3a52] bg-[#0a1a2a] pl-10 pr-9 text-[11px] text-slate-100 outline-none transition placeholder:text-slate-500 hover:border-[#28506d] focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/10 sm:h-[42px] sm:pl-11 sm:pr-10 sm:text-[12px]"
                        />

                        {globalSearch && (
                            <button
                                type="button"
                                onClick={() => {
                                    setGlobalSearch("");
                                    setSearchResults([]);
                                    setSearchCompleted(false);
                                    setSearchOpen(false);
                                }}
                                className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-[4px] text-slate-500 hover:bg-white/5 hover:text-slate-200"
                            >
                                <X size={14} />
                            </button>
                        )}

                        {searchOpen && globalSearch.trim().length >= 2 && (
                            <div className="absolute left-0 right-0 top-[49px] z-[100] max-h-[360px] overflow-y-auto rounded-[7px] border border-[#1c3a52] bg-[#081a2b] shadow-[0_18px_45px_rgba(0,0,0,0.45)]">
                                <div className="border-b border-[#173149] px-3 py-2.5">
                                    <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-slate-500">
                                        Search Results
                                    </p>
                                </div>

                                {searchLoading ? (
                                    <div className="flex items-center gap-2 px-4 py-6 text-[10px] text-slate-500">
                                        <RefreshCw size={13} className="animate-spin text-cyan-400" />
                                        Searching...
                                    </div>
                                ) : searchCompleted && searchResults.length === 0 ? (
                                    <div className="px-4 py-8 text-center">
                                        <SearchIcon size={22} className="mx-auto text-slate-600" />
                                        <p className="mt-2 text-[11px] font-medium text-slate-300">
                                            No data found
                                        </p>
                                        <p className="mt-1 text-[9px] text-slate-600">
                                            Try another incident, user or location.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="p-1.5">
                                        {searchResults.map((item, index) => (
                                            <button
                                                type="button"
                                                key={`${item.type}-${item._id || item.id || item.latitude || index}`}
                                                onClick={() => handleSearchResultClick(item)}
                                                className="flex w-full items-center gap-3 rounded-[5px] px-3 py-2.5 text-left transition hover:bg-white/[0.04]"
                                            >
                                                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[5px] ${item.type === "incident"
                                                    ? "bg-red-500/10 text-red-400"
                                                    : item.type === "citizen"
                                                        ? "bg-blue-500/10 text-blue-400"
                                                        : "bg-cyan-500/10 text-cyan-400"
                                                    }`}>
                                                    <SearchResultIcon type={item.type} />
                                                </span>

                                                <span className="min-w-0 flex-1">
                                                    <span className="flex items-center gap-2">
                                                        <span className="truncate text-[10px] font-medium text-slate-200">
                                                            {getSearchLabel(item)}
                                                        </span>
                                                        <span className="shrink-0 text-[7px] uppercase tracking-wider text-slate-600">
                                                            {item.type}
                                                        </span>
                                                    </span>

                                                    <span className="mt-0.5 block truncate text-[8px] text-slate-500">
                                                        {getSearchSubtitle(item) || "No additional information"}
                                                    </span>
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* RIGHT SIDE */}
                    <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-3 lg:gap-4">
                        {/* LOCATION */}
                        <button
                            type="button"
                            onClick={() => setLocationOpen(true)}
                            aria-label="Change location"
                            className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[6px] border border-[#21415c] bg-[#0a1d2e] transition hover:border-cyan-500/40 hover:bg-[#0b2133] sm:w-auto sm:justify-start sm:gap-2 sm:px-2.5 md:px-3"
                        >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[5px] border border-cyan-500/30 bg-cyan-500/[0.06]">
                                <MapPin size={18} className="text-cyan-400" />
                            </span>

                            <span className="hidden min-w-0 text-left sm:block">
                                <span className="flex items-center gap-1.5">
                                    <span className="max-w-[85px] truncate text-[11px] font-semibold text-slate-200">
                                        {locationLoading ? "Loading..." : selectedLocation?.name || "Unknown"}
                                    </span>
                                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                                </span>

                                <span className="mt-1 flex items-center gap-1.5">
                                    {(() => {
                                        const WeatherIcon = weather.icon;
                                        return <WeatherIcon size={12} className={weather.iconClass} />;
                                    })()}
                                    <span className="text-[9px] font-medium text-slate-400">
                                        {weatherLoading ? "--" : weather.temperature !== null ? `${weather.temperature}°C` : "--"}
                                    </span>
                                    <span className="max-w-[55px] truncate text-[9px] text-slate-500">
                                        {weather.condition || "Unavailable"}
                                    </span>
                                </span>
                            </span>
                        </button>

                        <div className="hidden h-8 w-px bg-[#1b344a] lg:block" />

                        {/* NOTIFICATIONS */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => {
                                    const nextOpen = !notificationsOpen;
                                    setNotificationsOpen(nextOpen);
                                    if (nextOpen) fetchNotifications();
                                }}
                                aria-label="Notifications"
                                aria-expanded={notificationsOpen}
                                className="relative flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[6px] border border-[#21415c] bg-[#0a1d2e] text-slate-300 transition hover:border-cyan-500/40 hover:bg-cyan-500/5 hover:text-white"
                            >
                                <Bell size={18} />
                                {unreadCount > 0 && (
                                    <span className="absolute -right-1 -top-1 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white ring-2 ring-[#0a1d2e]">
                                        {unreadCount > 99 ? "99+" : unreadCount}
                                    </span>
                                )}
                            </button>

                            {notificationsOpen && (
                                <div className="absolute right-0 top-[50px] z-[150] w-[min(340px,calc(100vw-24px))] overflow-hidden rounded-[7px] border border-[#1c3a52] bg-[#081a2b] shadow-[0_18px_45px_rgba(0,0,0,0.45)]">
                                    <div className="flex items-center justify-between border-b border-[#173149] px-4 py-3">
                                        <div>
                                            <h3 className="text-sm font-semibold text-white">Notifications</h3>
                                            <p className="mt-1 text-[10px] text-slate-500">
                                                {unreadCount} unread notifications
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={fetchNotifications}
                                                disabled={notificationsLoading}
                                                aria-label="Refresh notifications"
                                                className="text-slate-500 transition hover:text-cyan-400 disabled:opacity-50"
                                            >
                                                <RefreshCw size={13} className={notificationsLoading ? "animate-spin" : ""} />
                                            </button>

                                            {unreadCount > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={handleMarkAllNotificationsRead}
                                                    disabled={notificationActionLoading}
                                                    className="text-[10px] font-medium text-cyan-400 transition hover:text-cyan-300 disabled:opacity-50"
                                                >
                                                    {notificationActionLoading ? "Updating..." : "Mark all read"}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="max-h-[320px] overflow-y-auto p-2">
                                        {notificationsLoading && notifications.length === 0 ? (
                                            <div className="flex items-center justify-center gap-2 px-3 py-8 text-xs text-slate-500">
                                                <RefreshCw size={14} className="animate-spin text-cyan-400" />
                                                Loading notifications...
                                            </div>
                                        ) : notificationsError && notifications.length === 0 ? (
                                            <div className="px-3 py-8 text-center">
                                                <p className="text-xs text-red-400">{notificationsError}</p>
                                                <button
                                                    type="button"
                                                    onClick={fetchNotifications}
                                                    className="mt-3 text-[10px] font-medium text-cyan-400 hover:text-cyan-300"
                                                >
                                                    Try again
                                                </button>
                                            </div>
                                        ) : notifications.length === 0 ? (
                                            <div className="px-3 py-8 text-center">
                                                <Bell size={20} className="mx-auto mb-2 text-slate-600" />
                                                <p className="text-xs text-slate-500">No notifications yet.</p>
                                            </div>
                                        ) : (
                                            notifications.map((item) => {
                                                const isUnread = !item.isRead;

                                                return (
                                                    <button
                                                        key={item._id}
                                                        type="button"
                                                        onClick={() => handleNotificationClick(item)}
                                                        className={`flex w-full gap-3 rounded-[5px] p-3 text-left transition hover:bg-white/[0.04] ${isUnread ? "bg-cyan-500/[0.05]" : ""}`}
                                                    >
                                                        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[5px] border border-[#21415c] bg-[#0a1d2e]">
                                                            <Bell size={14} className={isUnread ? "text-cyan-400" : "text-slate-500"} />
                                                        </span>

                                                        <span className="min-w-0 flex-1">
                                                            <span className="flex items-center justify-between gap-2">
                                                                <span className="truncate text-[11px] font-medium text-slate-200">
                                                                    {item.title}
                                                                </span>
                                                                {isUnread && (
                                                                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
                                                                )}
                                                            </span>
                                                            <span className="mt-1 block text-[10px] leading-4 text-slate-400">
                                                                {item.message}
                                                            </span>
                                                            <span className="mt-2 block text-[9px] text-slate-600">
                                                                {formatNotificationTime(item.createdAt)}
                                                            </span>
                                                        </span>
                                                    </button>
                                                );
                                            })
                                        )}
                                    </div>

                                    <div className="border-t border-[#173149] px-4 py-3">
                                        <p className="text-center text-[9px] text-slate-600">
                                            Notifications are synced with SurakshaAI.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* PROFILE DROPDOWN */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setProfileOpen((value) => !value)}
                                aria-expanded={profileOpen}
                                className="flex h-[42px] items-center gap-2 rounded-[6px] border border-transparent px-1.5 transition hover:border-[#21415c] hover:bg-[#0a1d2e] sm:gap-2.5"
                            >
                                <div className="relative shrink-0">
                                    {profileImage ? (
                                        <img
                                            src={profileImage}
                                            alt={displayName}
                                            className="h-9 w-9 rounded-full border border-cyan-400/30 object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-[11px] font-semibold text-white">
                                            {initials}
                                        </div>
                                    )}

                                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#071827] bg-emerald-400" />
                                </div>

                                <div className="hidden min-w-0 text-left md:block">
                                    <p className="max-w-[100px] truncate text-[11px] font-semibold text-slate-100">
                                        {displayName}
                                    </p>
                                    <p className="mt-0.5 text-[9px] text-slate-500">
                                        {displayRole}
                                    </p>
                                </div>

                                <ChevronDown
                                    size={14}
                                    className={`hidden text-slate-500 transition-transform md:block ${profileOpen ? "rotate-180" : ""}`}
                                />
                            </button>

                            {profileOpen && (
                                <div className="absolute right-0 top-[50px] z-[100] w-[230px] overflow-hidden rounded-[7px] border border-[#1c3a52] bg-[#0a1a2a] shadow-[0_15px_40px_rgba(0,0,0,0.4)]">
                                    <div className="border-b border-[#173149] px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            {profileImage ? (
                                                <img
                                                    src={profileImage}
                                                    alt={displayName}
                                                    className="h-10 w-10 rounded-full border border-cyan-400/30 object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-xs font-semibold text-white">
                                                    {initials}
                                                </div>
                                            )}

                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium text-white">
                                                    {displayName}
                                                </p>
                                                <p className="mt-1 truncate text-[10px] text-slate-500">
                                                    {user?.email}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setProfileOpen(false);
                                            navigate(getProfileDestination());
                                        }}
                                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-xs text-slate-300 hover:bg-[#0f2639] hover:text-white"
                                    >
                                        <User size={15} />
                                        Profile
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setProfileOpen(false);
                                            navigate(getSettingsDestination());
                                        }}
                                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-xs text-slate-300 hover:bg-[#0f2639] hover:text-white"
                                    >
                                        <Settings size={15} />
                                        Settings
                                    </button>

                                    <div className="mx-3 border-t border-[#173149]" />

                                    <button
                                        type="button"
                                        disabled={loggingOut}
                                        onClick={handleLogout}
                                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-xs text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                                    >
                                        <LogOut size={15} />
                                        {loggingOut ? "Logging out..." : "Logout"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* LOCATION MODAL */}
            {locationOpen && (
                <div
                    className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm"
                    role="presentation"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget && !locationSaving && !locationDetecting) {
                            setLocationOpen(false);
                            setLocationError("");
                        }
                    }}
                >
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="location-modal-title"
                        className="w-full max-w-[480px] overflow-hidden rounded-xl border border-[#24445d] bg-[#081a2b] shadow-2xl shadow-black/50"
                        onMouseDown={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-start justify-between border-b border-[#173149] px-5 py-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-400/20 bg-cyan-400/10">
                                        <MapPin size={18} className="text-cyan-300" />
                                    </span>
                                    <div>
                                        <h2 id="location-modal-title" className="text-sm font-semibold text-white">
                                            Set your location
                                        </h2>
                                        <p className="mt-1 text-[11px] text-slate-400">
                                            Get local weather and location-based updates.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <button
                                type="button"
                                aria-label="Close location modal"
                                disabled={locationSaving || locationDetecting}
                                onClick={() => {
                                    setLocationOpen(false);
                                    setLocationError("");
                                }}
                                className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
                            >
                                <X size={17} />
                            </button>
                        </div>

                        <div className="p-5">
                            <div className="mb-4 grid grid-cols-2 gap-2 rounded-lg border border-[#1c3a52] bg-[#061523] p-1">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setLocationMode("detect");
                                        setLocationError("");
                                    }}
                                    className={`flex items-center justify-center gap-2 rounded-md px-3 py-2.5 text-xs font-medium transition ${locationMode === "detect"
                                            ? "bg-cyan-500/15 text-cyan-300 ring-1 ring-inset ring-cyan-400/30"
                                            : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                                        }`}
                                >
                                    <Navigation size={14} />
                                    Detect location
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setLocationMode("manual");
                                        setLocationError("");
                                    }}
                                    className={`flex items-center justify-center gap-2 rounded-md px-3 py-2.5 text-xs font-medium transition ${locationMode === "manual"
                                            ? "bg-cyan-500/15 text-cyan-300 ring-1 ring-inset ring-cyan-400/30"
                                            : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                                        }`}
                                >
                                    <Search size={14} />
                                    Enter manually
                                </button>
                            </div>

                            {locationMode === "detect" ? (
                                <div className="rounded-lg border border-[#1c3a52] bg-[#0a1d2e] px-4 py-5 text-center">
                                    <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/10">
                                        {locationDetecting ? (
                                            <RefreshCw size={21} className="animate-spin text-cyan-300" />
                                        ) : (
                                            <Navigation size={21} className="text-cyan-300" />
                                        )}
                                    </span>
                                    <h3 className="mt-3 text-sm font-semibold text-slate-100">
                                        {locationDetecting ? "Detecting your location..." : "Use your current location"}
                                    </h3>
                                    <p className="mx-auto mt-1.5 max-w-[300px] text-[11px] leading-5 text-slate-400">
                                        Allow location access in your browser to find your approximate position and local weather.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={detectCurrentLocation}
                                        disabled={locationDetecting || locationSaving}
                                        className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {locationDetecting ? (
                                            <>
                                                <RefreshCw size={14} className="animate-spin" />
                                                Detecting...
                                            </>
                                        ) : (
                                            <>
                                                <Navigation size={14} />
                                                Detect my location
                                            </>
                                        )}
                                    </button>
                                </div>
                            ) : (
                                <form
                                    onSubmit={(event) => {
                                        event.preventDefault();
                                        searchManualLocation();
                                    }}
                                >
                                    <label htmlFor="manual-location" className="mb-2 block text-xs font-medium text-slate-300">
                                        City, town, or place
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            id="manual-location"
                                            type="text"
                                            value={manualLocation}
                                            onChange={(event) => {
                                                setManualLocation(event.target.value);
                                                if (locationError) setLocationError("");
                                            }}
                                            placeholder="e.g. Dehradun, Uttarakhand"
                                            autoFocus
                                            className="h-10 min-w-0 flex-1 rounded-md border border-[#24445d] bg-[#061523] px-3 text-xs text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/10"
                                        />
                                        <button
                                            type="submit"
                                            disabled={locationSearchLoading || locationSaving}
                                            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-cyan-500 px-3 text-xs font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {locationSearchLoading ? (
                                                <RefreshCw size={14} className="animate-spin" />
                                            ) : (
                                                <Search size={14} />
                                            )}
                                            Search
                                        </button>
                                    </div>

                                    {locationResults.length > 0 && (
                                        <div className="mt-3 overflow-hidden rounded-lg border border-[#1c3a52]">
                                            <p className="border-b border-[#1c3a52] px-3 py-2 text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                                                Search results
                                            </p>
                                            <div className="max-h-48 overflow-y-auto p-1">
                                                {locationResults.map((item, index) => (
                                                    <button
                                                        key={`${item.name}-${item.latitude}-${item.longitude}-${index}`}
                                                        type="button"
                                                        disabled={locationSaving}
                                                        onClick={() => saveLocation(item, "manual")}
                                                        className="flex w-full items-start gap-3 rounded-md px-3 py-3 text-left transition hover:bg-cyan-500/10 disabled:opacity-50"
                                                    >
                                                        <MapPin size={15} className="mt-0.5 shrink-0 text-cyan-400" />
                                                        <span className="min-w-0 flex-1">
                                                            <span className="block truncate text-xs font-medium text-slate-100">
                                                                {item.name || "Unknown location"}
                                                            </span>
                                                            <span className="mt-1 block truncate text-[10px] text-slate-500">
                                                                {[item.state, item.country].filter(Boolean).join(", ")}
                                                            </span>
                                                        </span>
                                                        <span className="shrink-0 text-[10px] text-cyan-400">
                                                            {locationSaving ? "Saving..." : "Select"}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </form>
                            )}

                            {locationError && (
                                <div className="mt-3 flex items-start gap-2 rounded-md border border-red-400/20 bg-red-500/10 px-3 py-2.5 text-[11px] leading-5 text-red-300">
                                    <TriangleAlert size={14} className="mt-0.5 shrink-0" />
                                    <span>{locationError}</span>
                                </div>
                            )}

                            <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#173149] pt-4">
                                <div className="min-w-0">
                                    <p className="text-[9px] uppercase tracking-wider text-slate-500">Current saved location</p>
                                    <p className="mt-1 truncate text-xs font-medium text-slate-200">
                                        {selectedLocation?.name || "Not set"}
                                        {selectedLocation?.state ? `, ${selectedLocation.state}` : ""}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    disabled={locationSaving || locationDetecting}
                                    onClick={() => {
                                        setLocationOpen(false);
                                        setLocationError("");
                                    }}
                                    className="shrink-0 rounded-md border border-[#24445d] px-3 py-2 text-[11px] font-medium text-slate-300 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            )}
        </>
    );
}

export default Header;
