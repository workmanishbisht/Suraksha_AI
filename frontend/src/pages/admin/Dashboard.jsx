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
    CloudSun,
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
   MAP DATA
========================================= */

const incidentLocations = [
    {
        id: 1,
        longitude: 78.0322,
        latitude: 30.3165,
        count: 12,
        label: "Uttarakhand",
        location: "Dehradun / Tehri Region",
        level: "Critical",
        color: "#ef4444",
    },
    {
        id: 2,
        longitude: 77.1025,
        latitude: 28.7041,
        count: 3,
        label: "Delhi",
        location: "New Delhi",
        level: "Resolved",
        color: "#3b82f6",
    },
    {
        id: 3,
        longitude: 78.9629,
        latitude: 26.8467,
        count: 4,
        label: "Uttar Pradesh",
        location: "Northern UP",
        level: "Medium",
        color: "#f59e0b",
    },
    {
        id: 4,
        longitude: 73.8567,
        latitude: 18.5204,
        count: 2,
        label: "Maharashtra",
        location: "Pune Region",
        level: "Low",
        color: "#10b981",
    },
    {
        id: 5,
        longitude: 85.8245,
        latitude: 20.9517,
        count: 7,
        label: "Odisha",
        location: "Coastal Odisha",
        level: "Critical",
        color: "#ef4444",
    },
    {
        id: 6,
        longitude: 77.1734,
        latitude: 31.1048,
        count: 5,
        label: "Himachal Pradesh",
        location: "Shimla Region",
        level: "High",
        color: "#f97316",
    },
    {
        id: 7,
        longitude: 78.6569,
        latitude: 11.1271,
        count: 3,
        label: "Tamil Nadu",
        location: "Northern Tamil Nadu",
        level: "Resolved",
        color: "#3b82f6",
    },
];

/* =========================================
   INCIDENT DATA
========================================= */

const incidents = [
    {
        title: "Landslide reported on NH-07",
        location: "Rudraprayag, Uttarakhand",
        time: "10:12 AM",
        level: "Critical",
    },
    {
        title: "Flash Flood Warning",
        location: "Tehri, Uttarakhand",
        time: "09:48 AM",
        level: "High",
    },
    {
        title: "Forest Fire Detected",
        location: "Pauri, Uttarakhand",
        time: "08:30 AM",
        level: "Medium",
    },
    {
        title: "Heavy Rain Alert",
        location: "Nainital, Uttarakhand",
        time: "07:15 AM",
        level: "Medium",
    },
    {
        title: "Road Blockage",
        location: "Chamoli, Uttarakhand",
        time: "06:40 AM",
        level: "Low",
    },
];

/* =========================================
   RESOURCE DATA
========================================= */

const resources = [
    {
        name: "Rescue Teams",
        value: 24,
        icon: UserRound,
    },
    {
        name: "Ambulances",
        value: 58,
        icon: Ambulance,
    },
    {
        name: "Helicopters",
        value: 12,
        icon: Plane,
    },
    {
        name: "Relief Camps",
        value: 86,
        icon: Building2,
    },
    {
        name: "Medical Units",
        value: 44,
        icon: Cross,
    },
];

/* =========================================
   CHART DATA
========================================= */

const trendData = [
    { day: "12 Sep", total: 36, critical: 7, high: 11 },
    { day: "13 Sep", total: 42, critical: 8, high: 13 },
    { day: "14 Sep", total: 55, critical: 12, high: 17 },
    { day: "15 Sep", total: 44, critical: 9, high: 14 },
    { day: "16 Sep", total: 61, critical: 14, high: 19 },
    { day: "17 Sep", total: 63, critical: 15, high: 21 },
    { day: "18 Sep", total: 48, critical: 10, high: 16 },
];

const categoryData = [
    { name: "Flood", value: 12 },
    { name: "Landslide", value: 10 },
    { name: "Forest Fire", value: 8 },
    { name: "Earthquake", value: 6 },
    { name: "Heavy Rain", value: 4 },
    { name: "Others", value: 2 },
];

const populationData = [
    { day: "12 Sep", population: 150 },
    { day: "13 Sep", population: 200 },
    { day: "14 Sep", population: 170 },
    { day: "15 Sep", population: 225 },
    { day: "16 Sep", population: 275 },
    { day: "17 Sep", population: 325 },
    { day: "18 Sep", population: 250 },
];

const categoryColors = [
    "#22a7e8",
    "#06b6d4",
    "#f59e0b",
    "#fbbf24",
    "#14b8a6",
    "#64748b",
];

/* =========================================
   DASHBOARD
========================================= */

function Dashboard() {
    const [selectedIncident, setSelectedIncident] =
        useState(null);

    const [dashboardLocation, setDashboardLocation] =
        useState(null);

    const [dashboardWeather, setDashboardWeather] =
        useState({
            temperature: null,
            condition: "Loading...",
            isDay: true,
        });

    const [currentDateTime, setCurrentDateTime] =
        useState(new Date());

    /* =========================================
       LIVE DATE & TIME
    ========================================= */

    useEffect(() => {
        const updateDateTime = () => {
            setCurrentDateTime(new Date());
        };

        updateDateTime();

        const interval = setInterval(
            updateDateTime,
            1000
        );

        return () => clearInterval(interval);
    }, []);

    /* =========================================
       LOCATION + WEATHER
    ========================================= */

    useEffect(() => {
        const fetchDashboardWeather = async () => {
            try {
                const response = await fetch(
                    "http://localhost:5000/api/weather",
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
                            "Unable to fetch weather"
                    );
                }

                setDashboardLocation(
                    data?.location || null
                );

                setDashboardWeather({
                    temperature:
                        data?.weather?.temperature ??
                        null,

                    condition:
                        data?.weather?.condition ||
                        "Unavailable",

                    isDay:
                        data?.weather?.isDay ?? true,
                });
            } catch (error) {
                console.error(
                    "Dashboard Weather Error:",
                    error
                );

                setDashboardWeather({
                    temperature: null,
                    condition: "Unavailable",
                    isDay: true,
                });
            }
        };

        fetchDashboardWeather();

        const interval = setInterval(
            fetchDashboardWeather,
            10 * 60 * 1000
        );

        return () => clearInterval(interval);
    }, []);

    /* =========================================
       DATE & TIME FORMAT
    ========================================= */

    const formattedDate =
        new Intl.DateTimeFormat("en-IN", {
            weekday: "short",
            day: "2-digit",
            month: "short",
            year: "numeric",
        }).format(currentDateTime);

    const formattedTime =
        new Intl.DateTimeFormat("en-IN", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        }).format(currentDateTime);

    const currentHour =
        currentDateTime.getHours();

    const greeting =
        currentHour < 12
            ? "Good Morning"
            : currentHour < 17
              ? "Good Afternoon"
              : "Good Evening";

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

                <div className="flex items-center gap-4">
                    {/* DATE & TIME */}

                    <div className="text-right">
                        <p className="text-[10px] text-slate-500">
                            {formattedDate}
                        </p>

                        <p className="mt-1 flex items-center justify-end gap-1.5 text-sm font-semibold text-slate-200">
                            <Clock3
                                size={13}
                                className="text-cyan-400"
                            />

                            {formattedTime}
                        </p>
                    </div>

                    <div className="h-9 w-px bg-[#173149]" />

                    {/* LOCATION & WEATHER */}

                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-[6px] border border-[#21415c] bg-[#0b2032]">
                            <MapPin
                                size={17}
                                className="text-cyan-400"
                            />
                        </div>

                        <div>
                            <p className="flex items-center gap-1.5 text-xs font-medium text-slate-200">
                                {dashboardLocation?.name ||
                                    "Loading..."}

                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            </p>

                            <p className="mt-1 flex items-center gap-1 text-[10px] text-slate-500">
                                <CloudSun
                                    size={12}
                                    className="text-amber-400"
                                />

                                {dashboardWeather.temperature !==
                                null
                                    ? `${Math.round(
                                          dashboardWeather.temperature
                                      )}°C`
                                    : "--"}

                                <span>•</span>

                                {
                                    dashboardWeather.condition
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* STATS */}

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    icon={TriangleAlert}
                    iconClass="border-red-500/10 bg-red-500/10 text-red-400"
                    value="42"
                    title="Active Incidents"
                    trend="↑ 12%"
                    trendClass="text-red-400"
                    footer="8 Critical • 14 High • 20 Others"
                />

                <StatCard
                    icon={Users}
                    iconClass="border-cyan-500/10 bg-cyan-500/10 text-cyan-400"
                    value="1,248"
                    title="People Affected"
                    trend="↑ 8%"
                    trendClass="text-emerald-400"
                    footer="Across 6 States"
                />

                <StatCard
                    icon={CheckCircle2}
                    iconClass="border-blue-500/10 bg-blue-500/10 text-blue-400"
                    value="318"
                    title="Resolved Incidents"
                    trend="↑ 18%"
                    trendClass="text-emerald-400"
                    footer="This Month"
                />

                <StatCard
                    icon={UserRound}
                    iconClass="border-indigo-500/10 bg-indigo-500/10 text-indigo-400"
                    value="256"
                    title="Field Officers"
                    trend="↑ 5%"
                    trendClass="text-emerald-400"
                    footer="On Ground"
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
                    <div className="relative h-[370px] overflow-hidden rounded-[6px] border border-[#173149]">
                        <Map
                            initialViewState={{
                                longitude: 78.9629,
                                latitude: 23.5937,
                                zoom: 4.2,
                            }}
                            mapboxAccessToken={
                                import.meta.env
                                    .VITE_MAPBOX_TOKEN
                            }
                            mapStyle="mapbox://styles/mapbox/streets-v12"
                            attributionControl={false}
                            onClick={() =>
                                setSelectedIncident(
                                    null
                                )
                            }
                        >
                            <NavigationControl
                                position="top-left"
                                showCompass={true}
                                showZoom={true}
                            />

                            <GeolocateControl
                                position="top-left"
                                trackUserLocation={false}
                            />

                            {incidentLocations.map(
                                (incident) => (
                                    <Marker
                                        key={
                                            incident.id
                                        }
                                        longitude={
                                            incident.longitude
                                        }
                                        latitude={
                                            incident.latitude
                                        }
                                        anchor="center"
                                    >
                                        <button
                                            type="button"
                                            onClick={(
                                                event
                                            ) => {
                                                event.stopPropagation();

                                                setSelectedIncident(
                                                    incident
                                                );
                                            }}
                                            className="
                                                group relative
                                                flex items-center
                                                justify-center
                                            "
                                        >
                                            <span
                                                className="
                                                    absolute h-11 w-11
                                                    animate-ping
                                                    rounded-full
                                                    opacity-20
                                                "
                                                style={{
                                                    backgroundColor:
                                                        incident.color,
                                                }}
                                            />

                                            <span
                                                className="
                                                    relative flex h-9 w-9
                                                    items-center justify-center
                                                    rounded-full
                                                    border-2 border-white
                                                    text-[9px]
                                                    font-semibold
                                                    text-white
                                                    transition-transform
                                                    duration-200
                                                    group-hover:scale-110
                                                "
                                                style={{
                                                    backgroundColor:
                                                        incident.color,
                                                    boxShadow: `0 0 18px ${incident.color}66`,
                                                }}
                                            >
                                                {
                                                    incident.count
                                                }
                                            </span>
                                        </button>
                                    </Marker>
                                )
                            )}

                            {selectedIncident && (
                                <Popup
                                    longitude={
                                        selectedIncident.longitude
                                    }
                                    latitude={
                                        selectedIncident.latitude
                                    }
                                    anchor="bottom"
                                    closeButton={true}
                                    closeOnClick={false}
                                    onClose={() =>
                                        setSelectedIncident(
                                            null
                                        )
                                    }
                                >
                                    <div className="min-w-[180px] text-slate-900">
                                        <p className="text-xs font-semibold">
                                            {
                                                selectedIncident.label
                                            }
                                        </p>

                                        <p className="mt-1 text-[10px] text-slate-500">
                                            {
                                                selectedIncident.location
                                            }
                                        </p>

                                        <div className="mt-3 h-px bg-slate-200" />

                                        <div className="mt-2 flex items-center justify-between">
                                            <span className="text-[10px] text-slate-500">
                                                Incidents
                                            </span>

                                            <span className="text-xs font-semibold text-slate-900">
                                                {
                                                    selectedIncident.count
                                                }
                                            </span>
                                        </div>

                                        <div className="mt-1 flex items-center justify-between">
                                            <span className="text-[10px] text-slate-500">
                                                Severity
                                            </span>

                                            <span
                                                className="text-[10px] font-semibold"
                                                style={{
                                                    color:
                                                        selectedIncident.color,
                                                }}
                                            >
                                                {
                                                    selectedIncident.level
                                                }
                                            </span>
                                        </div>
                                    </div>
                                </Popup>
                            )}
                        </Map>

                        {/* LIVE MAP STATUS */}

                        <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 rounded-[5px] border border-[#29445b] bg-[#071827]/90 px-3 py-2 shadow-lg backdrop-blur-sm">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />

                            <span className="text-[9px] font-medium text-slate-300">
                                Live Monitoring
                            </span>
                        </div>

                        {/* MAP LEGEND */}

                        <div className="absolute bottom-3 right-3 rounded-[5px] border border-[#29445b] bg-[#071827]/95 p-3 shadow-lg backdrop-blur-sm">
                            <p className="mb-2 text-[9px] font-medium text-slate-400">
                                Incident Severity
                            </p>

                            <div className="space-y-2 text-[9px] text-slate-300">
                                <Legend
                                    color="bg-red-500"
                                    label="Critical"
                                />

                                <Legend
                                    color="bg-orange-400"
                                    label="High"
                                />

                                <Legend
                                    color="bg-amber-400"
                                    label="Medium"
                                />

                                <Legend
                                    color="bg-emerald-400"
                                    label="Low"
                                />

                                <Legend
                                    color="bg-blue-500"
                                    label="Resolved"
                                />
                            </div>
                        </div>
                    </div>
                </Panel>

                {/* RECENT INCIDENTS */}

                <Panel
                    title="Recent Incidents"
                    action="View All"
                >
                    <div className="divide-y divide-[#173149]">
                        {incidents.map(
                            (incident) => (
                                <div
                                    key={
                                        incident.title
                                    }
                                    className="
                                        flex items-center gap-3
                                        py-3
                                    "
                                >
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[5px] border border-[#24394d] bg-gradient-to-br from-[#172b40] to-[#0a1726]">
                                        <TriangleAlert
                                            size={17}
                                            className={
                                                incident.level ===
                                                "Critical"
                                                    ? "text-red-400"
                                                    : incident.level ===
                                                        "High"
                                                      ? "text-orange-400"
                                                      : incident.level ===
                                                          "Medium"
                                                        ? "text-amber-400"
                                                        : "text-cyan-400"
                                            }
                                        />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-[11px] font-medium text-slate-200">
                                            {
                                                incident.title
                                            }
                                        </p>

                                        <p className="mt-1 flex items-center gap-1 truncate text-[9px] text-slate-500">
                                            <MapPin
                                                size={
                                                    10
                                                }
                                            />
                                            {
                                                incident.location
                                            }
                                        </p>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-[9px] text-slate-500">
                                            {
                                                incident.time
                                            }
                                        </p>

                                        <Severity
                                            level={
                                                incident.level
                                            }
                                        />
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                </Panel>

                {/* RESOURCES */}

                <div className="space-y-4">
                    <Panel
                        title="Emergency Resources"
                        action="View All"
                    >
                        <div className="space-y-0.5">
                            {resources.map(
                                (resource) => {
                                    const Icon =
                                        resource.icon;

                                    return (
                                        <div
                                            key={
                                                resource.name
                                            }
                                            className="
                                                group flex items-center gap-3
                                                rounded-[5px]
                                                px-1.5 py-3
                                                transition
                                                hover:bg-white/[0.025]
                                            "
                                        >
                                            <div className="flex h-7 w-7 items-center justify-center rounded-[5px] bg-[#102538]">
                                                <Icon
                                                    size={
                                                        15
                                                    }
                                                    className="
                                                        text-slate-400
                                                        transition
                                                        group-hover:text-cyan-400
                                                    "
                                                />
                                            </div>

                                            <span className="flex-1 text-[10px] text-slate-300">
                                                {
                                                    resource.name
                                                }
                                            </span>

                                            <span className="text-[11px] font-semibold text-slate-200">
                                                {
                                                    resource.value
                                                }
                                            </span>

                                            <ChevronRight
                                                size={
                                                    14
                                                }
                                                className="text-slate-600"
                                            />
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    </Panel>

                    {/* QUICK ACTIONS */}

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

            {/* ANALYTICS */}

            <div className="grid gap-4 xl:grid-cols-[1.35fr_0.9fr_1.1fr]">
                <Panel
                    title="Incident Trends"
                    action="Last 7 Days"
                >
                    <TrendChart />
                </Panel>

                <Panel title="Incidents by Category">
                    <CategoryChart />
                </Panel>

                <Panel
                    title="Affected Population"
                    action="Last 7 Days"
                >
                    <PopulationChart />
                </Panel>
            </div>

            {/* SYSTEM STATUS */}

            <div className="grid gap-4 md:grid-cols-3">
                <StatusCard
                    icon={ShieldCheck}
                    title="Emergency Network"
                    value="Operational"
                    description="All emergency channels are active."
                />

                <StatusCard
                    icon={UserRound}
                    title="Field Operations"
                    value="256 Officers"
                    description="Officers currently active on ground."
                />

                <StatusCard
                    icon={Activity}
                    title="Response System"
                    value="98.4% Active"
                    description="Emergency response network availability."
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
        <div className="group relative overflow-hidden rounded-[6px] border border-[#173149] bg-[#091a2a] p-4 transition-all duration-200 hover:border-[#28516c]">
            <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-cyan-400/[0.02] blur-2xl" />

            <div className="relative flex items-start gap-3">
                <div
                    className={`
                        flex h-12 w-12 shrink-0
                        items-center justify-center
                        rounded-[6px]
                        border
                        ${iconClass}
                    `}
                >
                    <Icon
                        size={22}
                        strokeWidth={1.8}
                    />
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                        <p className="text-[25px] font-semibold leading-none text-white">
                            {value}
                        </p>

                        <span
                            className={`text-[10px] font-medium ${trendClass}`}
                        >
                            {trend}
                        </span>
                    </div>

                    <p className="mt-2 text-[11px] text-slate-400">
                        {title}
                    </p>
                </div>
            </div>

            <div className="relative mt-4 flex items-center gap-2">
                <Activity
                    size={11}
                    className="text-slate-600"
                />

                <p className="text-[9px] text-slate-500">
                    {footer}
                </p>
            </div>
        </div>
    );
}

/* =========================================
   PANEL
========================================= */

function Panel({
    title,
    action,
    extra,
    children,
}) {
    return (
        <section className="overflow-hidden rounded-[6px] border border-[#173149] bg-[#091a2a]">
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
                        className="
                            flex shrink-0 items-center gap-1
                            rounded-[4px]
                            px-1.5 py-1
                            text-[10px]
                            font-medium
                            text-cyan-400
                            transition-all
                            hover:bg-cyan-400/[0.06]
                            hover:text-cyan-300
                        "
                    >
                        {action}

                        <ArrowUpRight size={13} />
                    </button>
                )}
            </div>

            <div className="p-3.5">
                {children}
            </div>
        </section>
    );
}

/* =========================================
   MAP LEGEND
========================================= */

function Legend({
    color,
    label,
}) {
    return (
        <div className="flex items-center gap-2">
            <span
                className={`h-2 w-2 rounded-full ${color}`}
            />

            <span>{label}</span>
        </div>
    );
}

/* =========================================
   SEVERITY
========================================= */

function Severity({ level }) {
    const styles = {
        Critical:
            "border-red-500/30 bg-red-500/10 text-red-400",

        High:
            "border-orange-400/30 bg-orange-400/10 text-orange-300",

        Medium:
            "border-amber-400/30 bg-amber-400/10 text-amber-300",

        Low:
            "border-cyan-400/30 bg-cyan-400/10 text-cyan-300",
    };

    return (
        <span
            className={`
                mt-1 inline-flex
                rounded-full
                border
                px-2
                py-0.5
                text-[8px]
                font-medium
                ${styles[level]}
            `}
        >
            {level}
        </span>
    );
}

/* =========================================
   QUICK ACTION
========================================= */

function QuickAction({
    icon: Icon,
    label,
}) {
    return (
        <button
            type="button"
            className="
                group
                flex min-h-[45px]
                items-center gap-2
                rounded-[5px]
                border border-[#21415c]
                bg-[#0b2134]
                px-2.5
                text-left
                text-[10px]
                text-slate-300
                transition-all
                hover:border-cyan-500/40
                hover:bg-cyan-500/[0.06]
                hover:text-white
            "
        >
            <Icon
                size={15}
                className="
                    text-cyan-400
                    transition-transform
                    group-hover:scale-110
                "
            />

            <span>{label}</span>
        </button>
    );
}

/* =========================================
   CHART TOOLTIP
========================================= */

function ChartTooltip({
    active,
    payload,
    label,
}) {
    if (!active || !payload?.length) {
        return null;
    }

    return (
        <div className="rounded-[5px] border border-[#28445b] bg-[#071827] px-3 py-2 shadow-xl">
            <p className="mb-1 text-[9px] text-slate-500">
                {label}
            </p>

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
   TREND CHART
========================================= */

function TrendChart() {
    return (
        <div className="h-[245px] w-full">
            <ResponsiveContainer
                width="100%"
                height="100%"
            >
                <LineChart
                    data={trendData}
                    margin={{
                        top: 10,
                        right: 10,
                        left: -20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid
                        stroke="#173149"
                        strokeDasharray="3 3"
                        vertical={false}
                    />

                    <XAxis
                        dataKey="day"
                        tick={{
                            fill: "#64748b",
                            fontSize: 9,
                        }}
                        axisLine={false}
                        tickLine={false}
                    />

                    <YAxis
                        domain={[0, 80]}
                        tick={{
                            fill: "#64748b",
                            fontSize: 9,
                        }}
                        axisLine={false}
                        tickLine={false}
                    />

                    <Tooltip
                        content={<ChartTooltip />}
                        cursor={{
                            stroke: "#28445b",
                        }}
                    />

                    <Line
                        type="monotone"
                        dataKey="total"
                        name="Total"
                        stroke="#2196ff"
                        strokeWidth={2.5}
                        dot={{
                            r: 3,
                            fill: "#2196ff",
                            strokeWidth: 0,
                        }}
                        activeDot={{
                            r: 5,
                        }}
                    />

                    <Line
                        type="monotone"
                        dataKey="critical"
                        name="Critical"
                        stroke="#ef4444"
                        strokeWidth={1.5}
                        dot={false}
                    />

                    <Line
                        type="monotone"
                        dataKey="high"
                        name="High"
                        stroke="#f97316"
                        strokeWidth={1.5}
                        dot={false}
                    />
                </LineChart>
            </ResponsiveContainer>

            <div className="-mt-1 flex flex-wrap gap-4 pl-7 text-[9px] text-slate-500">
                <ChartLegend
                    color="bg-blue-500"
                    label="Total"
                />

                <ChartLegend
                    color="bg-red-500"
                    label="Critical"
                />

                <ChartLegend
                    color="bg-orange-400"
                    label="High"
                />
            </div>
        </div>
    );
}

/* =========================================
   CHART LEGEND
========================================= */

function ChartLegend({
    color,
    label,
}) {
    return (
        <span className="flex items-center gap-1.5">
            <span
                className={`h-2 w-2 rounded-full ${color}`}
            />

            {label}
        </span>
    );
}

/* =========================================
   CATEGORY CHART
========================================= */

function CategoryChart() {
    return (
        <div className="h-[245px] w-full">
            <div className="relative h-[170px]">
                <ResponsiveContainer
                    width="100%"
                    height="100%"
                >
                    <PieChart>
                        <Pie
                            data={categoryData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={68}
                            paddingAngle={3}
                            stroke="none"
                        >
                            {categoryData.map(
                                (item, index) => (
                                    <Cell
                                        key={
                                            item.name
                                        }
                                        fill={
                                            categoryColors[
                                                index
                                            ]
                                        }
                                    />
                                )
                            )}
                        </Pie>

                        <Tooltip
                            content={<ChartTooltip />}
                        />
                    </PieChart>
                </ResponsiveContainer>

                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-[21px] font-semibold text-white">
                        42
                    </p>

                    <p className="text-[9px] text-slate-500">
                        Total
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2 px-2">
                {categoryData.map(
                    (item, index) => (
                        <div
                            key={item.name}
                            className="flex items-center gap-2"
                        >
                            <span
                                className="h-2 w-2 shrink-0 rounded-full"
                                style={{
                                    backgroundColor:
                                        categoryColors[
                                            index
                                        ],
                                }}
                            />

                            <span className="truncate text-[9px] text-slate-400">
                                {item.name}
                            </span>

                            <span className="ml-auto text-[9px] text-slate-500">
                                {item.value}
                            </span>
                        </div>
                    )
                )}
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
            <ResponsiveContainer
                width="100%"
                height="100%"
            >
                <BarChart
                    data={populationData}
                    margin={{
                        top: 10,
                        right: 5,
                        left: -20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid
                        stroke="#173149"
                        strokeDasharray="3 3"
                        vertical={false}
                    />

                    <XAxis
                        dataKey="day"
                        tick={{
                            fill: "#64748b",
                            fontSize: 8,
                        }}
                        axisLine={false}
                        tickLine={false}
                    />

                    <YAxis
                        domain={[0, 400]}
                        tick={{
                            fill: "#64748b",
                            fontSize: 8,
                        }}
                        axisLine={false}
                        tickLine={false}
                    />

                    <Tooltip
                        content={<ChartTooltip />}
                        cursor={{
                            fill: "rgba(34, 167, 232, 0.04)",
                        }}
                    />

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

function StatusCard({
    icon: Icon,
    title,
    value,
    description,
}) {
    return (
        <div className="flex items-center gap-3 rounded-[6px] border border-[#173149] bg-[#091a2a] p-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] border border-emerald-400/10 bg-emerald-400/10">
                <Icon
                    size={19}
                    className="text-emerald-400"
                />
            </div>

            <div className="min-w-0 flex-1">
                <p className="text-[10px] text-slate-500">
                    {title}
                </p>

                <p className="mt-0.5 text-xs font-semibold text-slate-200">
                    {value}
                </p>

                <p className="mt-1 truncate text-[8px] text-slate-600">
                    {description}
                </p>
            </div>

            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        </div>
    );
}

export default Dashboard;