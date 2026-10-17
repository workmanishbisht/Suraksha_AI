
import { useEffect, useState } from "react";

import {
    TriangleAlert,
    Users,
    CheckCircle2,
    UserRound,
    ArrowUpRight,
    ChevronRight,
    Megaphone,
    UserPlus,
    Send,
    FileBarChart,
    Ambulance,
    Plane,
    Building2,
    Cross,
    MapPin,
    Activity,
    Clock3,
    ShieldCheck,
} from "lucide-react";

import Map, {
    Marker,
    Popup,
    NavigationControl,
    GeolocateControl,
} from "react-map-gl/mapbox";

import "mapbox-gl/dist/mapbox-gl.css";

import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
} from "recharts";

/* =========================================
   API CONFIGURATION
========================================= */

const API_BASE_URL = (
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:5000"
).replace(/\/+$/, "");

/* =========================================
   MAP HELPERS
========================================= */

const getIncidentMapColor = (severity, status) => {
    if (String(status || "").toLowerCase() === "resolved") {
        return "#3b82f6";
    }

    const colors = {
        critical: "#ef4444",
        high: "#f97316",
        medium: "#f59e0b",
        low: "#10b981",
    };

    return (
        colors[String(severity || "").toLowerCase()] ||
        "#06b6d4"
    );
};

/* =========================================
   FORMATTING HELPERS
========================================= */

const formatLabel = (value = "") =>
    String(value)
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());

const formatNumber = (value) =>
    new Intl.NumberFormat("en-IN").format(Number(value) || 0);

const formatRelativeTime = (date) => {
    if (!date) return "--";

    const timestamp = new Date(date).getTime();

    if (Number.isNaN(timestamp)) return "--";

    const diff = Math.max(0, Date.now() - timestamp);
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "Just now";

    if (minutes < 60) {
        return `${minutes} min ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
        return `${hours} hr${hours > 1 ? "s" : ""} ago`;
    }

    const days = Math.floor(hours / 24);

    return `${days} day${days > 1 ? "s" : ""} ago`;
};

const getSeverityIconClass = (severity) => {
    const classes = {
        critical: "text-red-400",
        high: "text-orange-400",
        medium: "text-amber-400",
        low: "text-cyan-400",
    };

    return (
        classes[String(severity || "").toLowerCase()] ||
        "text-cyan-400"
    );
};

/* =========================================
   ANALYTICS HELPERS
========================================= */

const getBreakdownCount = (items = [], key) =>
    items.find((item) => item?._id === key)?.count || 0;

const buildTrendData = (items = []) =>
    items.map((item) => ({
        day: new Intl.DateTimeFormat("en-IN", {
            day: "2-digit",
            month: "short",
        }).format(new Date(`${item._id}T00:00:00`)),
        total: item.count || 0,
    }));

const buildCategoryData = (items = []) =>
    items.map((item) => ({
        name: formatLabel(item._id),
        value: item.count || 0,
    }));

const categoryColors = [
    "#22a7e8",
    "#06b6d4",
    "#f59e0b",
    "#fbbf24",
    "#14b8a6",
    "#64748b",
];

/* =========================================
   AFFECTED POPULATION CHART DATA
========================================= */

const populationData = [
    { day: "12 Sep", population: 150 },
    { day: "13 Sep", population: 200 },
    { day: "14 Sep", population: 170 },
    { day: "15 Sep", population: 225 },
    { day: "16 Sep", population: 275 },
    { day: "17 Sep", population: 325 },
    { day: "18 Sep", population: 250 },
];

/* =========================================
   DASHBOARD COMPONENT
========================================= */

function Dashboard() {

    const [selectedIncident, setSelectedIncident] = useState(null);
    const [currentDateTime, setCurrentDateTime] = useState(new Date());

    const [analytics, setAnalytics] = useState(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(true);
    const [analyticsError, setAnalyticsError] = useState("");

    const [fieldOfficerStats, setFieldOfficerStats] = useState({
        totalOfficers: 0,
        activeOfficers: 0,
        inactiveOfficers: 0,
    });
    const [fieldOfficerLoading, setFieldOfficerLoading] = useState(true);

    const [emergencyResources, setEmergencyResources] = useState([]);
    const [resourceLoading, setResourceLoading] = useState(true);
    const [resourceError, setResourceError] = useState("");

    const [mapIncidents, setMapIncidents] = useState([]);
    const [mapLoading, setMapLoading] = useState(true);
    const [mapError, setMapError] = useState("");

    /* LIVE DATE & TIME */

    useEffect(() => {
        const updateDateTime = () => setCurrentDateTime(new Date());

        updateDateTime();
        const interval = setInterval(updateDateTime, 1000);

        return () => clearInterval(interval);
    }, []);

    /* ANALYTICS */

    useEffect(() => {
        let active = true;

        const fetchAnalytics = async () => {
            try {
                const response = await fetch(
                    `${API_BASE_URL}/api/analytics`,
                    {
                        method: "GET",
                        credentials: "include",
                        cache: "no-store",
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data?.message || "Unable to fetch analytics"
                    );
                }

                if (active) {
                    setAnalytics(data?.analytics || null);
                    setAnalyticsError("");
                }
            } catch (error) {
                console.error("Dashboard Analytics Error:", error);

                if (active) {
                    setAnalyticsError(
                        error?.message || "Unable to fetch analytics"
                    );
                }
            } finally {
                if (active) setAnalyticsLoading(false);
            }
        };

        fetchAnalytics();
        const interval = setInterval(fetchAnalytics, 5 * 60 * 1000);

        return () => {
            active = false;
            clearInterval(interval);
        };
    }, []);

    /* FIELD OFFICERS */

    useEffect(() => {
        let active = true;

        const fetchFieldOfficerStats = async () => {
            try {
                const response = await fetch(
                    `${API_BASE_URL}/api/field-officers/stats`,
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
                        "Unable to fetch field officer stats"
                    );
                }

                if (active) {
                    setFieldOfficerStats(
                        data?.stats || {
                            totalOfficers: 0,
                            activeOfficers: 0,
                            inactiveOfficers: 0,
                        }
                    );
                }
            } catch (error) {
                console.error(
                    "Dashboard Field Officer Stats Error:",
                    error
                );

                if (active) {
                    setFieldOfficerStats({
                        totalOfficers: 0,
                        activeOfficers: 0,
                        inactiveOfficers: 0,
                    });
                }
            } finally {
                if (active) setFieldOfficerLoading(false);
            }
        };

        fetchFieldOfficerStats();
        const interval = setInterval(fetchFieldOfficerStats, 60 * 1000);

        return () => {
            active = false;
            clearInterval(interval);
        };
    }, []);

    /* EMERGENCY RESOURCES */

    useEffect(() => {
        let active = true;

        const fetchEmergencyResources = async () => {
            try {
                const response = await fetch(
                    `${API_BASE_URL}/api/emergency-resources`,
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
                        "Unable to fetch emergency resources"
                    );
                }

                if (active) {
                    setEmergencyResources(data?.resources || []);
                    setResourceError("");
                }
            } catch (error) {
                console.error(
                    "Dashboard Emergency Resources Error:",
                    error
                );

                if (active) {
                    setResourceError(
                        error?.message ||
                        "Unable to fetch emergency resources"
                    );
                    setEmergencyResources([]);
                }
            } finally {
                if (active) setResourceLoading(false);
            }
        };

        fetchEmergencyResources();
        const interval = setInterval(fetchEmergencyResources, 60 * 1000);

        return () => {
            active = false;
            clearInterval(interval);
        };
    }, []);

    /* LIVE INCIDENT MAP */

    useEffect(() => {
        let active = true;

        const fetchMapIncidents = async () => {
            try {
                const response = await fetch(
                    `${API_BASE_URL}/api/incidents`,
                    {
                        method: "GET",
                        credentials: "include",
                        cache: "no-store",
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data?.message || "Unable to fetch incidents"
                    );
                }

                const incidentsWithCoordinates = (
                    data?.incidents || []
                )
                    .filter((incident) => {
                        const latitude = Number(
                            incident?.location?.latitude
                        );
                        const longitude = Number(
                            incident?.location?.longitude
                        );

                        return (
                            incident?.location?.latitude != null &&
                            incident?.location?.longitude != null &&
                            Number.isFinite(latitude) &&
                            Number.isFinite(longitude) &&
                            latitude >= -90 &&
                            latitude <= 90 &&
                            longitude >= -180 &&
                            longitude <= 180
                        );
                    })
                    .map((incident) => ({
                        ...incident,
                        longitude: Number(incident.location.longitude),
                        latitude: Number(incident.location.latitude),
                        label:
                            incident.title || formatLabel(incident.type),
                        location: [
                            incident.location?.address,
                            incident.location?.city,
                            incident.location?.state,
                        ]
                            .filter(Boolean)
                            .join(", ") || "Location unavailable",
                        level: formatLabel(
                            incident.severity || "medium"
                        ),
                        color: getIncidentMapColor(
                            incident.severity,
                            incident.status
                        ),
                        count: 1,
                    }));

                if (active) {
                    setMapIncidents(incidentsWithCoordinates);
                    setMapError("");
                }
            } catch (error) {
                console.error(
                    "Dashboard Map Incidents Error:",
                    error
                );

                if (active) {
                    setMapError(
                        error?.message || "Unable to fetch map incidents"
                    );
                }
            } finally {
                if (active) setMapLoading(false);
            }
        };

        fetchMapIncidents();
        const interval = setInterval(fetchMapIncidents, 60 * 1000);

        return () => {
            active = false;
            clearInterval(interval);
        };
    }, []);

    /* DATE & TIME FORMAT */

    const formattedDate = new Intl.DateTimeFormat("en-IN", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(currentDateTime);

    const formattedTime = new Intl.DateTimeFormat("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    }).format(currentDateTime);

    const currentHour = currentDateTime.getHours();

    const greeting =
        currentHour < 12
            ? "Good Morning"
            : currentHour < 17
                ? "Good Afternoon"
                : "Good Evening";

    /*  RETURN JSX WILL CONTINUE HERE */


    return (
        <div className="space-y-5">
            {/* PAGE HEADER */}
            <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div>
                    <div className="mb-2 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        <span className="text-[9px] font-medium uppercase tracking-[0.16em] text-emerald-400">
                            Live Operations
                        </span>
                    </div>

                    <h1 className="text-[25px] font-semibold tracking-tight text-white sm:text-[28px]">
                        {greeting}, Admin
                    </h1>

                    <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                        Here's what's happening across the country today.
                    </p>
                </div>

                <div className="text-right">
                    <p className="text-[10px] text-slate-500">
                        {formattedDate}
                    </p>
                    <p className="mt-1 flex items-center justify-end gap-1.5 text-sm font-semibold text-slate-200">
                        <Clock3 size={13} className="text-cyan-400" />
                        {formattedTime}
                    </p>
                </div>
            </section>

            {/* STATISTICS */}
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    icon={TriangleAlert}
                    iconClass="border-red-500/10 bg-red-500/10 text-red-400"
                    value={
                        analyticsLoading
                            ? "--"
                            : analytics?.overview?.activeIncidents ?? 0
                    }
                    title="Active Incidents"
                    trend="Live"
                    trendClass="text-red-400"
                    footer={`${analytics?.overview?.criticalIncidents ?? 0} Critical • ${getBreakdownCount(analytics?.severityBreakdown, "high")} High • ${getBreakdownCount(analytics?.severityBreakdown, "medium") + getBreakdownCount(analytics?.severityBreakdown, "low")} Others`}
                />

                <StatCard
                    icon={Users}
                    iconClass="border-cyan-500/10 bg-cyan-500/10 text-cyan-400"
                    value={
                        analyticsLoading
                            ? "--"
                            : formatNumber(
                                analytics?.overview?.peopleAffected ?? 0
                            )
                    }
                    title="People Affected"
                    trend="Live"
                    trendClass="text-emerald-400"
                    footer="From reported incidents"
                />

                <StatCard
                    icon={CheckCircle2}
                    iconClass="border-blue-500/10 bg-blue-500/10 text-blue-400"
                    value={
                        analyticsLoading
                            ? "--"
                            : analytics?.overview?.resolvedIncidents ?? 0
                    }
                    title="Resolved Incidents"
                    trend="Live"
                    trendClass="text-emerald-400"
                    footer={`Total ${analytics?.overview?.totalIncidents ?? 0} incidents`}
                />

                <StatCard
                    icon={UserRound}
                    iconClass="border-indigo-500/10 bg-indigo-500/10 text-indigo-400"
                    value={
                        fieldOfficerLoading
                            ? "--"
                            : fieldOfficerStats.activeOfficers
                    }
                    title="Field Officers"
                    trend={
                        fieldOfficerLoading
                            ? "Loading"
                            : `${fieldOfficerStats.totalOfficers} Total`
                    }
                    trendClass="text-emerald-400"
                    footer={
                        fieldOfficerLoading
                            ? "Fetching current operations"
                            : `${fieldOfficerStats.activeOfficers} Active • ${fieldOfficerStats.inactiveOfficers} Inactive`
                    }
                />
            </div>

            {/* MAP / INCIDENTS / RESOURCES */}
            <div className="grid gap-4 xl:grid-cols-[1.45fr_1fr_0.78fr]">
                {/* LIVE INCIDENT MAP */}
                <Panel
                    title="Live Incident Map"
                    action="View Full Map"
                    extra={
                        <span className="hidden items-center gap-1.5 text-[9px] text-slate-500 sm:flex">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                            Real-time monitoring
                        </span>
                    }
                >
                    <div className="relative h-[370px] overflow-hidden rounded-md border border-[#173149]">
                        <Map
                            initialViewState={{
                                longitude: 78.9629,
                                latitude: 23.5937,
                                zoom: 4.2,
                            }}
                            mapboxAccessToken={
                                import.meta.env.VITE_MAPBOX_TOKEN
                            }
                            mapStyle="mapbox://styles/mapbox/streets-v12"
                            attributionControl={false}
                            onClick={() => setSelectedIncident(null)}
                        >
                            <NavigationControl
                                position="top-left"
                                showCompass
                                showZoom
                            />

                            <GeolocateControl
                                position="top-left"
                                trackUserLocation={false}
                            />

                            {mapIncidents.map((incident) => (
                                <Marker
                                    key={incident._id}
                                    longitude={incident.longitude}
                                    latitude={incident.latitude}
                                    anchor="center"
                                >
                                    <button
                                        type="button"
                                        aria-label={`View incident: ${incident.label}`}
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            setSelectedIncident(incident);
                                        }}
                                        className="group relative flex items-center justify-center"
                                    >
                                        <span
                                            className="absolute h-11 w-11 animate-ping rounded-full opacity-20"
                                            style={{
                                                backgroundColor: incident.color,
                                            }}
                                        />

                                        <span
                                            className="relative flex h-9 w-9 items-center justify-center rounded-full border-2 border-white text-[9px] font-semibold text-white transition-transform duration-200 group-hover:scale-110"
                                            style={{
                                                backgroundColor: incident.color,
                                                boxShadow: `0 0 18px ${incident.color}66`,
                                            }}
                                        >
                                            {incident.count}
                                        </span>
                                    </button>
                                </Marker>
                            ))}

                            {selectedIncident && (
                                <Popup
                                    longitude={selectedIncident.longitude}
                                    latitude={selectedIncident.latitude}
                                    anchor="bottom"
                                    closeButton
                                    closeOnClick={false}
                                    onClose={() => setSelectedIncident(null)}
                                >
                                    <div className="min-w-[180px] text-slate-900">
                                        <p className="text-xs font-semibold">
                                            {selectedIncident.label}
                                        </p>

                                        <p className="mt-1 text-[10px] text-slate-500">
                                            {selectedIncident.location}
                                        </p>

                                        <div className="mt-3 h-px bg-slate-200" />

                                        <div className="mt-2 flex justify-between">
                                            <span className="text-[10px] text-slate-500">
                                                Severity
                                            </span>
                                            <span
                                                className="text-[10px] font-semibold"
                                                style={{
                                                    color: selectedIncident.color,
                                                }}
                                            >
                                                {selectedIncident.level}
                                            </span>
                                        </div>

                                        <div className="mt-1 flex justify-between">
                                            <span className="text-[10px] text-slate-500">
                                                People Affected
                                            </span>
                                            <span className="text-xs font-semibold">
                                                {formatNumber(
                                                    selectedIncident.peopleAffected
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </Popup>
                            )}
                        </Map>

                        {mapLoading && (
                            <div className="pointer-events-none absolute left-3 top-3 rounded-md border border-[#29445b] bg-[#071827]/90 px-3 py-2">
                                <span className="text-[9px] text-slate-300">
                                    Loading incidents...
                                </span>
                            </div>
                        )}

                        {!mapLoading && mapError && (
                            <div className="pointer-events-none absolute left-3 top-3 rounded-md border border-red-500/20 bg-[#071827]/95 px-3 py-2">
                                <span className="text-[9px] text-red-400">
                                    {mapError}
                                </span>
                            </div>
                        )}

                        {!mapLoading && !mapError && mapIncidents.length === 0 && (
                            <div className="pointer-events-none absolute left-3 top-3 rounded-md border border-[#29445b] bg-[#071827]/90 px-3 py-2">
                                <span className="text-[9px] text-slate-300">
                                    No incidents with map location
                                </span>
                            </div>
                        )}

                        <div className="pointer-events-none absolute left-3 top-12 flex items-center gap-2 rounded-md border border-[#29445b] bg-[#071827]/90 px-3 py-2">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                            <span className="text-[9px] text-slate-300">
                                Live Monitoring
                            </span>
                        </div>

                        <div className="absolute bottom-3 right-3 rounded-md border border-[#29445b] bg-[#071827]/95 p-3">
                            <p className="mb-2 text-[9px] font-medium text-slate-400">
                                Incident Severity
                            </p>

                            <div className="space-y-2 text-[9px] text-slate-300">
                                <Legend color="bg-red-500" label="Critical" />
                                <Legend color="bg-orange-500" label="High" />
                                <Legend color="bg-amber-400" label="Medium" />
                                <Legend color="bg-emerald-400" label="Low" />
                                <Legend color="bg-blue-500" label="Resolved" />
                            </div>
                        </div>
                    </div>
                </Panel>

                {/* CONTINUES HERE */}


                {/* RECENT INCIDENTS */}
                <Panel title="Recent Incidents" action="View All">
                    <div className="divide-y divide-[#173149]">
                        {analyticsLoading ? (
                            <div className="py-8 text-center text-[10px] text-slate-500">
                                Loading incidents...
                            </div>
                        ) : analyticsError ? (
                            <div className="py-8 text-center text-[10px] text-red-400">
                                {analyticsError}
                            </div>
                        ) : analytics?.recentIncidents?.length ? (
                            analytics.recentIncidents.map((incident) => {
                                const level = formatLabel(incident.severity);
                                const location = [
                                    incident.location?.address,
                                    incident.location?.city,
                                    incident.location?.state,
                                ]
                                    .filter(Boolean)
                                    .join(", ");

                                return (
                                    <div
                                        key={incident._id}
                                        className="flex items-center gap-3 py-3"
                                    >
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-[#24394d] bg-[#102538]">
                                            <TriangleAlert
                                                size={17}
                                                className={getSeverityIconClass(
                                                    incident.severity
                                                )}
                                            />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-[11px] font-medium text-slate-200">
                                                {incident.title ||
                                                    formatLabel(incident.type)}
                                            </p>

                                            <p className="mt-1 flex items-center gap-1 truncate text-[9px] text-slate-500">
                                                <MapPin size={10} />
                                                {location ||
                                                    "Location unavailable"}
                                            </p>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-[9px] text-slate-500">
                                                {formatRelativeTime(
                                                    incident.createdAt
                                                )}
                                            </p>
                                            <Severity level={level} />
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="py-8 text-center text-[10px] text-slate-500">
                                No incidents found.
                            </div>
                        )}
                    </div>
                </Panel>

                {/* EMERGENCY RESOURCES & QUICK ACTIONS */}
                <div className="space-y-4">
                    <Panel title="Emergency Resources" action="View All">
                        <div>
                            {resourceLoading ? (
                                <div className="py-8 text-center text-[10px] text-slate-500">
                                    Loading resources...
                                </div>
                            ) : resourceError ? (
                                <div className="py-8 text-center text-[10px] text-red-400">
                                    {resourceError}
                                </div>
                            ) : emergencyResources.length ? (
                                emergencyResources.map((resource) => {
                                    const resourceIcons = {
                                        rescue_teams: UserRound,
                                        ambulances: Ambulance,
                                        helicopters: Plane,
                                        relief_camps: Building2,
                                        medical_units: Cross,
                                    };

                                    const Icon =
                                        resourceIcons[resource.type] ||
                                        UserRound;

                                    return (
                                        <div
                                            key={resource._id}
                                            className="group flex items-center gap-3 rounded-md px-1.5 py-3 transition hover:bg-white/[0.025]"
                                        >
                                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#102538]">
                                                <Icon
                                                    size={15}
                                                    className="text-slate-400 group-hover:text-cyan-400"
                                                />
                                            </div>

                                            <span className="flex-1 truncate text-[10px] text-slate-300">
                                                {resource.name}
                                            </span>

                                            <div className="text-right">
                                                <span className="text-[11px] font-semibold text-slate-200">
                                                    {formatNumber(
                                                        resource.available
                                                    )}
                                                    <span className="text-[9px] font-normal text-slate-500">
                                                        {" "}/{" "}
                                                        {formatNumber(
                                                            resource.total
                                                        )}
                                                    </span>
                                                </span>
                                            </div>

                                            <ChevronRight
                                                size={14}
                                                className="text-slate-600"
                                            />
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="py-8 text-center text-[10px] text-slate-500">
                                    No emergency resources found.
                                </div>
                            )}
                        </div>
                    </Panel>

                    <Panel title="Quick Actions">
                        <div className="grid grid-cols-2 gap-2">
                            <QuickAction
                                icon={Megaphone}
                                label="Create Alert"
                            />
                            <QuickAction
                                icon={UserPlus}
                                label="Assign Team"
                            />
                            <QuickAction
                                icon={Send}
                                label="Send Notification"
                            />
                            <QuickAction
                                icon={FileBarChart}
                                label="Generate Report"
                            />
                        </div>
                    </Panel>
                </div>
            </div>

            {/* ANALYTICS CHARTS */}
            <div className="grid gap-4 xl:grid-cols-[1.35fr_0.9fr_1.1fr]">
                <Panel title="Incident Trends" action="Last 7 Days">
                    <TrendChart
                        data={buildTrendData(analytics?.dailyTrend)}
                    />
                </Panel>

                <Panel title="Incidents by Category">
                    <CategoryChart
                        data={buildCategoryData(analytics?.typeBreakdown)}
                        total={analytics?.overview?.totalIncidents ?? 0}
                    />
                </Panel>

                <Panel title="Affected Population" action="Last 7 Days">
                    <PopulationChart />
                </Panel>
            </div>

            {/* SYSTEM STATUS */}
            <div className="grid gap-4 md:grid-cols-3">
                <StatusCard
                    icon={ShieldCheck}
                    title="Emergency Network"
                    value="Operational"
                    description="Emergency network status needs live health-check integration."
                />

                <StatusCard
                    icon={UserRound}
                    title="Field Operations"
                    value={
                        fieldOfficerLoading
                            ? "Loading..."
                            : `${fieldOfficerStats.activeOfficers} Active Officers`
                    }
                    description={
                        fieldOfficerLoading
                            ? "Fetching field operations."
                            : `${fieldOfficerStats.totalOfficers} registered • ${fieldOfficerStats.inactiveOfficers} inactive`
                    }
                />

                <StatusCard
                    icon={Activity}
                    title="Weather Service"
                    value="Connected"
                    description="Verify live provider status before displaying this as operational."
                />
            </div>
        </div>
    );
}


/* =========================================
   STAT CARD
========================================= */

function StatCard({
    icon: Icon,
    iconClass,
    value,
    title,
    trend,
    trendClass,
    footer,
}) {
    return (
        <div className="group relative overflow-hidden rounded-md border border-[#173149] bg-[#091a2a] p-4 transition-all duration-200 hover:border-[#28516c]">
            <div className="relative flex items-start gap-3">
                <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-md border ${iconClass}`}
                >
                    <Icon size={22} strokeWidth={1.8} />
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                        <p className="text-[25px] font-semibold leading-none text-white">
                            {value}
                        </p>
                        <span className={`text-[10px] font-medium ${trendClass}`}>
                            {trend}
                        </span>
                    </div>
                    <p className="mt-2 text-[11px] text-slate-400">
                        {title}
                    </p>
                </div>
            </div>

            <div className="relative mt-4 flex items-center gap-2">
                <Activity size={11} className="text-slate-600" />
                <p className="text-[9px] text-slate-500">{footer}</p>
            </div>
        </div>
    );
}

/* =========================================
   PANEL
========================================= */

function Panel({ title, action, extra, children }) {
    return (
        <section className="overflow-hidden rounded-md border border-[#173149] bg-[#091a2a]">
            <div className="flex min-h-[50px] items-center justify-between gap-3 border-b border-[#173149] px-4">
                <div className="flex min-w-0 items-center gap-3">
                    <h3 className="truncate text-[13px] font-semibold text-slate-100">
                        {title}
                    </h3>
                    {extra}
                </div>

                {action && (
                    <button
                        type="button"
                        className="flex shrink-0 items-center gap-1 rounded px-1.5 py-1 text-[10px] font-medium text-cyan-400 transition hover:bg-cyan-400/[0.06]"
                    >
                        {action}
                        <ArrowUpRight size={13} />
                    </button>
                )}
            </div>

            <div className="p-3.5">{children}</div>
        </section>
    );
}

/* =========================================
   MAP LEGEND
========================================= */

function Legend({ color, label }) {
    return (
        <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${color}`} />
            <span>{label}</span>
        </div>
    );
}

/* =========================================
   SEVERITY BADGE
========================================= */

function Severity({ level }) {
    const styles = {
        Critical: "border-red-500/20 bg-red-500/10 text-red-400",
        High: "border-orange-500/20 bg-orange-500/10 text-orange-400",
        Medium: "border-amber-500/20 bg-amber-500/10 text-amber-400",
        Low: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
        Resolved: "border-blue-500/20 bg-blue-500/10 text-blue-400",
    };

    return (
        <span
            className={`mt-1 inline-flex rounded border px-1.5 py-0.5 text-[9px] ${styles[level] || styles.Medium
                }`}
        >
            {level || "Medium"}
        </span>
    );
}

/* =========================================
   QUICK ACTION
========================================= */

function QuickAction({ icon: Icon, label }) {
    return (
        <button
            type="button"
            className="flex min-h-[72px] flex-col items-start justify-between rounded-md border border-[#173149] bg-[#0b1d2d] p-3 text-left transition hover:border-cyan-500/30 hover:bg-cyan-500/[0.04]"
        >
            <Icon size={17} className="text-cyan-400" />
            <span className="mt-3 text-[10px] font-medium text-slate-300">
                {label}
            </span>
        </button>
    );
}

/* =========================================
   CHART TOOLTIP
========================================= */

function ChartTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;

    return (
        <div className="rounded-md border border-[#28445b] bg-[#071827] px-3 py-2 shadow-xl">
            <p className="mb-1 text-[9px] text-slate-500">{label}</p>

            {payload.map((item) => (
                <div
                    key={item.dataKey}
                    className="flex items-center justify-between gap-5"
                >
                    <span className="text-[9px] text-slate-400">
                        {item.name}
                    </span>
                    <span className="text-[10px] font-semibold text-white">
                        {item.value}
                    </span>
                </div>
            ))}
        </div>
    );
}

/* =========================================
   CHART LEGEND
========================================= */

function ChartLegend({ color, label }) {
    return (
        <span className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${color}`} />
            {label}
        </span>
    );
}

/* =========================================
   TREND CHART
========================================= */

function TrendChart({ data = [] }) {
    return (
        <div className="h-[245px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data}
                    margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                >
                    <CartesianGrid
                        stroke="#173149"
                        strokeDasharray="3 3"
                        vertical={false}
                    />
                    <XAxis
                        dataKey="day"
                        tick={{ fill: "#64748b", fontSize: 9 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fill: "#64748b", fontSize: 9 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Line
                        type="monotone"
                        dataKey="total"
                        name="Total"
                        stroke="#2196ff"
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: "#2196ff", strokeWidth: 0 }}
                        activeDot={{ r: 5 }}
                    />
                </LineChart>
            </ResponsiveContainer>

            <div className="-mt-1 flex flex-wrap gap-4 pl-7 text-[9px] text-slate-500">
                <ChartLegend color="bg-blue-500" label="Total" />
            </div>
        </div>
    );
}

/* =========================================
   CATEGORY CHART
========================================= */

function CategoryChart({ data = [], total = 0 }) {
    return (
        <div className="h-[245px] w-full">
            <div className="relative h-[170px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={68}
                            paddingAngle={3}
                            stroke="none"
                        >
                            {data.map((item, index) => (
                                <Cell
                                    key={item.name}
                                    fill={categoryColors[index % categoryColors.length]}
                                />
                            ))}
                        </Pie>
                        <Tooltip content={<ChartTooltip />} />
                    </PieChart>
                </ResponsiveContainer>

                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-[21px] font-semibold text-white">
                        {formatNumber(total)}
                    </p>
                    <p className="text-[9px] text-slate-500">Total</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2 px-2">
                {data.map((item, index) => (
                    <div
                        key={item.name}
                        className="flex items-center gap-2"
                    >
                        <span
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{
                                backgroundColor:
                                    categoryColors[index % categoryColors.length],
                            }}
                        />
                        <span className="truncate text-[9px] text-slate-400">
                            {item.name}
                        </span>
                        <span className="ml-auto text-[9px] text-slate-500">
                            {item.value}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* =========================================
   POPULATION CHART
========================================= */

function PopulationChart() {
    return (
        <div className="h-[245px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={populationData}
                    margin={{ top: 10, right: 5, left: -20, bottom: 5 }}
                >
                    <CartesianGrid
                        stroke="#173149"
                        strokeDasharray="3 3"
                        vertical={false}
                    />
                    <XAxis
                        dataKey="day"
                        tick={{ fill: "#64748b", fontSize: 8 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fill: "#64748b", fontSize: 8 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar
                        dataKey="population"
                        name="Affected"
                        fill="#2196ff"
                        radius={[3, 3, 0, 0]}
                        maxBarSize={28}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

/* =========================================
   STATUS CARD
========================================= */

function StatusCard({ icon: Icon, title, value, description }) {
    return (
        <section className="rounded-md border border-[#173149] bg-[#091a2a] p-4">
            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md border border-cyan-500/10 bg-cyan-500/10 text-cyan-400">
                    <Icon size={17} />
                </div>
                <div>
                    <p className="text-[10px] text-slate-500">{title}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-100">
                        {value}
                    </p>
                </div>
            </div>
            <p className="mt-4 text-[10px] leading-5 text-slate-500">
                {description}
            </p>
        </section>
    );
}

export default Dashboard;
