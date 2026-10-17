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
        year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
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
            item.location?.address || item.location?.name || item.location,
            item.status,
        ]
            .filter(Boolean)
            .join(" • ");
    }

    if (item.type === "citizen") {
        return [item.email, item.location, item.status].filter(Boolean).join(" • ");
    }

    return [item.state, item.country].filter(Boolean).join(", ");
};

function Header() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const searchRef = useRef(null);
    const searchTimerRef = useRef(null);

    const [profileOpen, setProfileOpen] = useState(false);

    // Notifications loaded from the authenticated backend API
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [notificationsLoading, setNotificationsLoading] = useState(false);
    const [notificationsError, setNotificationsError] = useState("");
    const [notificationActionLoading, setNotificationActionLoading] = useState(false);
    const unreadCount = notifications.filter((item) => !item.isRead).length;

    const [loggingOut, setLoggingOut] = useState(false);

    const fetchNotifications = async () => {
        try {
            setNotificationsLoading(true);
            setNotificationsError("");

            const data = await getNotifications();
            setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
        } catch (error) {
            console.error("Fetch Notifications Error:", error);
            setNotificationsError(error.message || "Unable to load notifications.");
        } finally {
            setNotificationsLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const getNotificationDestination = () => {
        // Always use a route allowed for the currently logged-in role.
        // Notification links may point to an admin-only page, so don't
        // blindly navigate to notification.link for citizen accounts.
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
                const data = await markNotificationRead(notification._id);
                const updatedNotification = data.notification;

                setNotifications((previous) =>
                    previous.map((item) =>
                        item._id === notification._id
                            ? { ...item, ...(updatedNotification || {}), isRead: true }
                            : item
                    )
                );
            }

            setNotificationsOpen(false);
            navigate(getNotificationDestination());
        } catch (error) {
            console.error("Mark Notification Read Error:", error);
            toast.error(error.message || "Unable to mark notification as read.");
        }
    };

    const handleMarkAllNotificationsRead = async () => {
        if (unreadCount === 0 || notificationActionLoading) return;

        try {
            setNotificationActionLoading(true);
            await markAllNotificationsRead();
            setNotifications((previous) =>
                previous.map((item) => ({ ...item, isRead: true }))
            );
            toast.success("All notifications marked as read.");
        } catch (error) {
            console.error("Mark All Notifications Read Error:", error);
            toast.error(error.message || "Unable to update notifications.");
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

    const [locationSearchLoading, setLocationSearchLoading] = useState(false);

    const [locationDetecting, setLocationDetecting] = useState(false);

    const [locationSaving, setLocationSaving] = useState(false);

    const [locationLoading, setLocationLoading] = useState(true);

    const [weatherLoading, setWeatherLoading] = useState(true);

    const [locationError, setLocationError] = useState("");

    const [locationResults, setLocationResults] = useState([]);

    const [selectedLocation, setSelectedLocation] = useState(DEFAULT_LOCATION);

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

            const response = await fetch(`${API_BASE_URL}/location/me`, {
                method: "GET",
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.message || "Unable to load saved location");
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

            const response = await fetch(`${API_BASE_URL}/weather`, {
                method: "GET",
                credentials: "include",
                cache: "no-store",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.message || "Weather request failed");
            }

            const current = data?.weather;

            const details = getWeatherDetails(current?.weatherCode, current?.isDay);

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

        const interval = setInterval(fetchWeather, 10 * 60 * 1000);

        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, []);

    const saveLocation = async (location, source = "manual") => {
        try {
            setLocationSaving(true);
            setLocationError("");

            const response = await fetch(`${API_BASE_URL}/location`, {
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
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.message || "Unable to save location");
            }

            setSelectedLocation(data.location);

            await fetchWeather();

            toast.success("Location updated successfully.");

            setLocationOpen(false);
            setManualLocation("");
            setLocationResults([]);
        } catch (error) {
            console.error("Save Location Error:", error);

            setLocationError(error.message || "Unable to save location.");
        } finally {
            setLocationSaving(false);
        }
    };

    const detectCurrentLocation = () => {
        if (!navigator.geolocation) {
            setLocationError("Geolocation is not supported by this browser.");

            return;
        }

        setLocationError("");
        setLocationDetecting(true);

        navigator.geolocation.getCurrentPosition(
            async ({ coords }) => {
                try {
                    const response = await fetch(`${API_BASE_URL}/location/detect`, {
                        method: "POST",
                        credentials: "include",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            latitude: coords.latitude,
                            longitude: coords.longitude,
                        }),
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(data?.message || "Unable to detect location");
                    }

                    setSelectedLocation(data.location);

                    await fetchWeather();

                    toast.success("Current location detected.");

                    setLocationOpen(false);
                } catch (error) {
                    console.error("Location Error:", error);

                    setLocationError(
                        error.message || "Could not identify your current location.",
                    );
                } finally {
                    setLocationDetecting(false);
                }
            },
            () => {
                setLocationDetecting(false);

                setLocationError("Location permission was denied or unavailable.");
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000,
            },
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
                },
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.message || "Location search failed");
            }

            if (!data?.locations?.length) {
                setLocationError("Location not found. Try another city.");

                return;
            }

            setLocationResults(data.locations);
        } catch (error) {
            console.error("Manual Location Error:", error);

            setLocationError(error.message || "Unable to search this location.");
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

            const [incidentResponse, citizenResponse, locationResponse] =
                await Promise.all([
                    fetch(`${API_BASE_URL}/incidents?search=${encoded}&page=1&limit=5`, {
                        method: "GET",
                        credentials: "include",
                    }),
                    fetch(`${API_BASE_URL}/citizens?search=${encoded}&page=1&limit=5`, {
                        method: "GET",
                        credentials: "include",
                    }),
                    fetch(`${API_BASE_URL}/location/search?q=${encoded}`, {
                        method: "GET",
                        credentials: "include",
                    }),
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

            setSearchResults([...incidents, ...citizens, ...locations]);

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
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setSearchOpen(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, []);

    const handleSearchResultClick = (item) => {
        setSearchOpen(false);

        if (item.type === "incident") {
            const value = item.incidentId || item.id || item._id || item.title || "";

            navigate(`/admin/incidents?search=${encodeURIComponent(value)}`);

            return;
        }

        if (item.type === "citizen") {
            const value = item.username || item.email || item.name || "";

            navigate(`/admin/citizens?search=${encodeURIComponent(value)}`);

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

// DISPLAY NAME
const displayName = "Suraksha AI";

const displayRole =
    user?.role === "admin"
        ? "Admin"
        : user?.role === "field_officer"
            ? "Field Officer"
            : user?.role === "department_officer"
                ? "Department Officer"
                : "Citizen";

const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const profileImage = user?.profileImage || null;

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
            <header
                className="
                    fixed
                    left-0
                    right-0
                    top-0
                    z-50
                    h-[72px]
                    border-b
                    border-[#173149]
                    bg-[#071827]/95
                    backdrop-blur-md
                    lg:left-[248px]
                "
            >
                <div
                    className="
                        flex
                        h-full
                        w-full
                        min-w-0
                        items-center
                        gap-1.5
                        pl-[64px]
                        pr-3
                        sm:gap-3
                        sm:px-5
                        lg:px-5
                        xl:px-6
                    "
                >
                    {/* SEARCH */}
                    <div
                        ref={searchRef}
                        className="
                            relative
                            min-w-0
                            w-0
                            flex-1
                            lg:w-[min(520px,42vw)]
                            lg:flex-none
                            xl:w-[560px]
                        "
                    >
                        <Search
                            size={19}
                            className="
                                pointer-events-none
                                absolute
                                left-4
                                top-1/2
                                -translate-y-1/2
                                text-slate-500
                            "
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
                            className="
                                h-[40px]
                                w-full
                                min-w-0
                                rounded-[6px]
                                border
                                border-[#1c3a52]
                                bg-[#0a1a2a]
                                pl-10
                                pr-9
                                text-[11px]
                                text-slate-100
                                outline-none
                                transition
                                placeholder:text-slate-500
                                hover:border-[#28506d]
                                focus:border-cyan-500/60
                                focus:ring-2
                                focus:ring-cyan-500/10
                                sm:h-[42px]
                                sm:pl-11
                                sm:pr-10
                                sm:text-[12px]
                            "
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
                                className="
                                    absolute
                                    right-2
                                    top-1/2
                                    flex
                                    h-7
                                    w-7
                                    -translate-y-1/2
                                    items-center
                                    justify-center
                                    rounded-[4px]
                                    text-slate-500
                                    hover:bg-white/5
                                    hover:text-slate-200
                                "
                            >
                                <X size={14} />
                            </button>
                        )}

                        {/* SEARCH DROPDOWN */}
                        {searchOpen && globalSearch.trim().length >= 2 && (
                            <div
                                className="
                                        absolute
                                        left-0
                                        right-0
                                        top-[49px]
                                        z-[100]
                                        max-h-[360px]
                                        overflow-y-auto
                                        rounded-[7px]
                                        border
                                        border-[#1c3a52]
                                        bg-[#081a2b]
                                        shadow-[0_18px_45px_rgba(0,0,0,0.45)]
                                    "
                            >
                                <div className="border-b border-[#173149] px-3 py-2.5">
                                    <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-slate-500">
                                        Search Results
                                    </p>
                                </div>

                                {searchLoading ? (
                                    <div className="flex items-center gap-2 px-4 py-6 text-[10px] text-slate-500">
                                        <RefreshCw
                                            size={13}
                                            className="animate-spin text-cyan-400"
                                        />
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
                                                className="
                                                            flex
                                                            w-full
                                                            items-center
                                                            gap-3
                                                            rounded-[5px]
                                                            px-3
                                                            py-2.5
                                                            text-left
                                                            transition
                                                            hover:bg-white/[0.04]
                                                        "
                                            >
                                                <span
                                                    className={`
                                                                flex
                                                                h-8
                                                                w-8
                                                                shrink-0
                                                                items-center
                                                                justify-center
                                                                rounded-[5px]
                                                                ${item.type ===
                                                            "incident"
                                                            ? "bg-red-500/10 text-red-400"
                                                            : item.type ===
                                                                "citizen"
                                                                ? "bg-blue-500/10 text-blue-400"
                                                                : "bg-cyan-500/10 text-cyan-400"
                                                        }
                                                            `}
                                                >
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
                                                        {getSearchSubtitle(item) ||
                                                            "No additional information"}
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
                    <div
                        className="
                            ml-auto
                            flex
                            shrink-0
                            items-center
                            gap-1.5
                            sm:gap-3
                            lg:gap-4
                        "
                    >
                        {/* LOCATION */}
                        <button
                            type="button"
                            onClick={() => setLocationOpen(true)}
                            aria-label="Change location"
                            className="
        hidden
        h-[42px]
        w-[42px]
        shrink-0
        items-center
        justify-center
        rounded-[6px]
        border
        border-[#21415c]
        bg-[#0a1d2e]
        transition
        hover:border-cyan-500/40
        hover:bg-[#0b2133]
        min-[480px]:flex
        sm:h-[42px]
        sm:w-auto
        sm:justify-start
        sm:gap-2
        sm:px-2.5
        md:px-3
    "
                        >
                            <span
                                className="
        flex
        h-8
        w-8
        shrink-0
        items-center
        justify-center
        rounded-[5px]
        border
        border-cyan-500/30
        bg-cyan-500/[0.06]
    "
                            >
                                <MapPin size={18} strokeWidth={2} className="text-cyan-400" />
                            </span>

                            <span className="hidden min-w-0 text-left sm:block">
                                <span className="flex items-center gap-1.5 leading-none">
                                    <span className="max-w-[85px] truncate text-[11px] font-semibold text-slate-200">
                                        {locationLoading
                                            ? "Loading..."
                                            : selectedLocation?.name || "Unknown"}
                                    </span>

                                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                                </span>

                                <span className="mt-1 flex items-center gap-1.5 leading-none">
                                    {(() => {
                                        const WeatherIcon = weather.icon;

                                        return (
                                            <WeatherIcon size={12} className={weather.iconClass} />
                                        );
                                    })()}

                                    <span className="text-[9px] font-medium text-slate-400">
                                        {weatherLoading
                                            ? "--"
                                            : weather.temperature !== null
                                                ? `${weather.temperature}°C`
                                                : "--"}
                                    </span>

                                    <span className="max-w-[55px] truncate text-[9px] text-slate-500">
                                        {weather.condition || "Unavailable"}
                                    </span>
                                </span>
                            </span>
                        </button>

                        {/* DIVIDER */}
                        <div className="hidden h-8 w-px bg-[#1b344a] lg:block" />

                        {/* NOTIFICATION */}
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
                                className="
                                    relative flex h-[42px] w-[42px] shrink-0 items-center justify-center
                                    rounded-[6px] border border-[#21415c] bg-[#0a1d2e] text-slate-300
                                    transition hover:border-cyan-500/40 hover:bg-cyan-500/5 hover:text-white
                                "
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
                                                                <span className="truncate text-[11px] font-medium text-slate-200">{item.title}</span>
                                                                {isUnread && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />}
                                                            </span>
                                                            <span className="mt-1 block text-[10px] leading-4 text-slate-400">{item.message}</span>
                                                            <span className="mt-2 block text-[9px] text-slate-600">{formatNotificationTime(item.createdAt)}</span>
                                                        </span>
                                                    </button>
                                                );
                                            })
                                        )}
                                    </div>
                                    <div className="border-t border-[#173149] px-4 py-3">
                                        <p className="text-center text-[9px] text-slate-600">Notifications are synced with SurakshaAI.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* PROFILE */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setProfileOpen((value) => !value)}
                                className="
                                    flex
                                    h-[42px]
                                    items-center
                                    gap-2
                                    rounded-[6px]
                                    border
                                    border-transparent
                                    px-1.5
                                    transition
                                    hover:border-[#21415c]
                                    hover:bg-[#0a1d2e]
                                    sm:gap-2.5
                                "
                            >
                                <div className="relative shrink-0">
                                    {profileImage ? (
                                        <img
                                            src={profileImage}
                                            alt={displayName}
                                            className="
                                                h-9
                                                w-9
                                                rounded-full
                                                border
                                                border-cyan-400/30
                                                object-cover
                                            "
                                        />
                                    ) : (
                                        <div
                                            className="
                                                flex
                                                h-9
                                                w-9
                                                items-center
                                                justify-center
                                                rounded-full
                                                bg-gradient-to-br
                                                from-blue-500
                                                to-cyan-500
                                                text-[11px]
                                                font-semibold
                                                text-white
                                            "
                                        >
                                            {initials}
                                        </div>
                                    )}

                                    <span
                                        className="
                                            absolute
                                            bottom-0
                                            right-0
                                            h-2.5
                                            w-2.5
                                            rounded-full
                                            border-2
                                            border-[#071827]
                                            bg-emerald-400
                                        "
                                    />
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
                                    className={`
                                        hidden
                                        text-slate-500
                                        transition-transform
                                        md:block
                                        ${profileOpen ? "rotate-180" : ""}
                                    `}
                                />
                            </button>

                            {profileOpen && (
                                <div
                                    className="
                                        absolute
                                        right-0
                                        top-[50px]
                                        z-[100]
                                        w-[230px]
                                        overflow-hidden
                                        rounded-[7px]
                                        border
                                        border-[#1c3a52]
                                        bg-[#0a1a2a]
                                        shadow-[0_15px_40px_rgba(0,0,0,0.4)]
                                    "
                                >
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
                                            navigate("/admin/profile");
                                        }}
                                        className="
                                            flex
                                            w-full
                                            items-center
                                            gap-3
                                            px-4
                                            py-3
                                            text-left
                                            text-xs
                                            text-slate-300
                                            hover:bg-[#0f2639]
                                            hover:text-white
                                        "
                                    >
                                        <User size={15} />
                                        Profile
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setProfileOpen(false);
                                            navigate("/admin/settings");
                                        }}
                                        className="
                                            flex
                                            w-full
                                            items-center
                                            gap-3
                                            px-4
                                            py-3
                                            text-left
                                            text-xs
                                            text-slate-300
                                            hover:bg-[#0f2639]
                                            hover:text-white
                                        "
                                    >
                                        <Settings size={15} />
                                        Settings
                                    </button>

                                    <div className="mx-3 border-t border-[#173149]" />

                                    <button
                                        type="button"
                                        disabled={loggingOut}
                                        onClick={handleLogout}
                                        className="
                                            flex
                                            w-full
                                            items-center
                                            gap-3
                                            px-4
                                            py-3
                                            text-left
                                            text-xs
                                            text-red-400
                                            hover:bg-red-500/10
                                            disabled:opacity-50
                                        "
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
                    className="
                        fixed
                        inset-0
                        z-[120]
                        flex
                        items-center
                        justify-center
                        bg-black/60
                        px-3
                        backdrop-blur-sm
                    "
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setLocationOpen(false);
                        }
                    }}
                >
                    <div className="max-h-[90vh] w-full max-w-[430px] overflow-y-auto rounded-[8px] border border-[#1c3a52] bg-[#071827] shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
                        <div className="flex items-start justify-between border-b border-[#173149] px-5 py-4">
                            <div>
                                <h3 className="text-sm font-semibold text-white">
                                    Set Your Location
                                </h3>

                                <p className="mt-1 text-[9px] leading-4 text-slate-500">
                                    Get real-time weather information for your selected location.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setLocationOpen(false)}
                                className="
                                    flex
                                    h-7
                                    w-7
                                    items-center
                                    justify-center
                                    rounded-[5px]
                                    text-slate-500
                                    hover:bg-white/5
                                    hover:text-white
                                "
                            >
                                <X size={15} />
                            </button>
                        </div>

                        <div className="p-4">
                            <div className="grid grid-cols-2 gap-2 rounded-[6px] border border-[#173149] bg-[#0a1a2a] p-1">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setLocationMode("detect");
                                        setLocationError("");
                                        setLocationResults([]);
                                    }}
                                    className={`
                                        rounded-[5px]
                                        px-3
                                        py-2.5
                                        text-left
                                        ${locationMode === "detect"
                                            ? "border border-blue-500/60 bg-blue-500/10"
                                            : "hover:bg-white/[0.03]"
                                        }
                                    `}
                                >
                                    <div className="flex items-center gap-2">
                                        <Navigation size={14} className="text-blue-400" />

                                        <span className="text-[10px] font-medium text-slate-200">
                                            Detect My Location
                                        </span>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setLocationMode("manual");
                                        setLocationError("");
                                    }}
                                    className={`
                                        rounded-[5px]
                                        px-3
                                        py-2.5
                                        text-left
                                        ${locationMode === "manual"
                                            ? "border border-blue-500/60 bg-blue-500/10"
                                            : "hover:bg-white/[0.03]"
                                        }
                                    `}
                                >
                                    <div className="flex items-center gap-2">
                                        <SearchIcon size={14} className="text-blue-400" />

                                        <span className="text-[10px] font-medium text-slate-200">
                                            Enter Manually
                                        </span>
                                    </div>
                                </button>
                            </div>

                            {locationMode === "detect" ? (
                                <div className="mt-3 rounded-[6px] border border-[#173149] bg-[#091b2c] p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-500/10">
                                            <Navigation size={21} className="text-blue-400" />
                                        </div>

                                        <div>
                                            <p className="text-xs font-semibold text-white">
                                                Use current location
                                            </p>

                                            <p className="mt-1 text-[9px] text-slate-500">
                                                Allow location access to get local weather.
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        disabled={locationDetecting}
                                        onClick={detectCurrentLocation}
                                        className="
                                            mt-4
                                            flex
                                            h-10
                                            w-full
                                            items-center
                                            justify-center
                                            gap-2
                                            rounded-[5px]
                                            bg-blue-600
                                            text-[10px]
                                            font-medium
                                            text-white
                                            hover:bg-blue-500
                                            disabled:opacity-60
                                        "
                                    >
                                        <Navigation size={13} />

                                        {locationDetecting ? "Detecting..." : "Detect My Location"}
                                    </button>
                                </div>
                            ) : (
                                <div className="mt-3 rounded-[6px] border border-[#173149] bg-[#091b2c] p-4">
                                    <label className="text-[10px] font-medium text-slate-300">
                                        City or place
                                    </label>

                                    <div className="mt-2 flex gap-2">
                                        <input
                                            value={manualLocation}
                                            onChange={(event) => {
                                                setManualLocation(event.target.value);

                                                setLocationError("");
                                            }}
                                            onKeyDown={(event) => {
                                                if (event.key === "Enter") {
                                                    searchManualLocation();
                                                }
                                            }}
                                            placeholder="e.g. Dehradun, Delhi"
                                            className="
                                                h-10
                                                min-w-0
                                                flex-1
                                                rounded-[5px]
                                                border
                                                border-[#1c3a52]
                                                bg-[#071827]
                                                px-3
                                                text-[10px]
                                                text-white
                                                outline-none
                                                placeholder:text-slate-600
                                                focus:border-blue-500/60
                                            "
                                        />

                                        <button
                                            type="button"
                                            disabled={locationSearchLoading}
                                            onClick={searchManualLocation}
                                            className="
                                                flex
                                                h-10
                                                shrink-0
                                                items-center
                                                gap-1.5
                                                rounded-[5px]
                                                bg-blue-600
                                                px-3
                                                text-[10px]
                                                font-medium
                                                text-white
                                                hover:bg-blue-500
                                                disabled:opacity-60
                                            "
                                        >
                                            <SearchIcon size={13} />
                                            Search
                                        </button>
                                    </div>

                                    {locationResults.length > 0 && (
                                        <div className="mt-3 max-h-[170px] space-y-1.5 overflow-y-auto">
                                            {locationResults.map((location, index) => (
                                                <button
                                                    type="button"
                                                    key={`${location.name}-${index}`}
                                                    onClick={() => {
                                                        setSelectedLocation(location);

                                                        setManualLocation(location.name || "");

                                                        setLocationResults([]);
                                                    }}
                                                    className="
                                                            flex
                                                            w-full
                                                            items-start
                                                            gap-2
                                                            rounded-[5px]
                                                            border
                                                            border-[#173149]
                                                            bg-[#071827]
                                                            px-3
                                                            py-2
                                                            text-left
                                                            hover:border-blue-500/40
                                                        "
                                                >
                                                    <MapPin
                                                        size={13}
                                                        className="mt-0.5 shrink-0 text-cyan-400"
                                                    />

                                                    <div className="min-w-0">
                                                        <p className="truncate text-[10px] font-medium text-slate-200">
                                                            {location.name}
                                                        </p>

                                                        <p className="mt-0.5 truncate text-[8px] text-slate-500">
                                                            {[location.state, location.country]
                                                                .filter(Boolean)
                                                                .join(", ")}
                                                        </p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {locationError && (
                                        <p className="mt-2 text-[9px] text-red-400">
                                            {locationError}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* WEATHER */}
                            <div className="mt-3 overflow-hidden rounded-[6px] border border-[#173149] bg-[#081a2b]">
                                <div className="flex items-center justify-between border-b border-[#173149] px-3 py-2.5">
                                    <span className="text-[9px] text-slate-500">
                                        Current Weather
                                    </span>

                                    <button
                                        type="button"
                                        onClick={fetchWeather}
                                        className="flex items-center gap-1 text-[9px] text-cyan-400"
                                    >
                                        <RefreshCw
                                            size={10}
                                            className={weatherLoading ? "animate-spin" : ""}
                                        />
                                        Refresh
                                    </button>
                                </div>

                                <div className="grid grid-cols-[1fr_auto] gap-3 px-3 py-3">
                                    <div className="flex items-center gap-3">
                                        {(() => {
                                            const WeatherIcon = weather.icon;

                                            return (
                                                <WeatherIcon size={28} className={weather.iconClass} />
                                            );
                                        })()}

                                        <div>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-xl font-semibold text-white">
                                                    {weather.temperature !== null
                                                        ? `${weather.temperature}°C`
                                                        : "--"}
                                                </span>

                                                <span className="text-[9px] text-slate-400">
                                                    {weather.condition}
                                                </span>
                                            </div>

                                            <p className="mt-1 text-[9px] text-slate-500">
                                                {selectedLocation.name}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-[10px] font-medium text-slate-200">
                                            {selectedLocation.name}
                                        </p>

                                        <p className="mt-0.5 max-w-[130px] text-[8px] text-slate-500">
                                            {[selectedLocation.state, selectedLocation.country]
                                                .filter(Boolean)
                                                .join(", ")}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-4 border-t border-[#173149]">
                                    <div className="px-2 py-2.5 text-center">
                                        <Droplets size={12} className="mx-auto text-cyan-400" />

                                        <p className="mt-1 text-[9px] text-slate-300">
                                            {weather.humidity ?? "--"}%
                                        </p>

                                        <span className="text-[7px] text-slate-600">Humidity</span>
                                    </div>

                                    <div className="border-l border-[#173149] px-2 py-2.5 text-center">
                                        <Wind size={12} className="mx-auto text-slate-400" />

                                        <p className="mt-1 text-[9px] text-slate-300">
                                            {weather.wind ?? "--"} km/h
                                        </p>

                                        <span className="text-[7px] text-slate-600">Wind</span>
                                    </div>

                                    <div className="border-l border-[#173149] px-2 py-2.5 text-center">
                                        <Umbrella size={12} className="mx-auto text-blue-400" />

                                        <p className="mt-1 text-[9px] text-slate-300">
                                            {weather.precipitation ?? "--"} mm
                                        </p>

                                        <span className="text-[7px] text-slate-600">Rain</span>
                                    </div>

                                    <div className="border-l border-[#173149] px-2 py-2.5 text-center">
                                        <Sunrise size={12} className="mx-auto text-amber-400" />

                                        <p className="mt-1 text-[9px] text-slate-300">
                                            {formatTime(weather.sunrise)}
                                        </p>

                                        <span className="text-[7px] text-slate-600">Sunrise</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setLocationOpen(false)}
                                    className="
                                        h-9
                                        rounded-[5px]
                                        border
                                        border-[#29445b]
                                        px-4
                                        text-[10px]
                                        text-slate-300
                                        hover:bg-white/5
                                    "
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    disabled={
                                        locationSaving ||
                                        !selectedLocation?.latitude ||
                                        !selectedLocation?.longitude
                                    }
                                    onClick={() => saveLocation(selectedLocation, "manual")}
                                    className="
                                        h-9
                                        rounded-[5px]
                                        bg-blue-600
                                        px-4
                                        text-[10px]
                                        font-medium
                                        text-white
                                        hover:bg-blue-500
                                        disabled:opacity-60
                                    "
                                >
                                    {locationSaving ? "Saving..." : "Use This Location"}
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