import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Activity,
    AlertTriangle,
    BarChart3,
    CheckCircle2,
    Clock3,
    RefreshCw,
    ShieldAlert,
    TrendingUp,
    Users,
} from "lucide-react";
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

const API_URL = "http://localhost:5000/api/analytics";

const chartColors = [
    "#2563eb",
    "#06b6d4",
    "#f59e0b",
    "#f97316",
    "#ef4444",
    "#10b981",
    "#8b5cf6",
    "#64748b",
];

const formatLabel = (value = "") => {
    return String(value)
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatNumber = (value) => {
    return new Intl.NumberFormat("en-IN").format(Number(value) || 0);
};

const getBreakdownCount = (items = [], key) => {
    const item = items.find(
        (entry) =>
            String(entry?._id || "").toLowerCase() ===
            String(key).toLowerCase()
    );

    return item?.count || 0;
};

const buildTrendData = (items = []) => {
    return items.map((item) => {
        const rawDate = item?._id;
        const date = new Date(`${rawDate}T00:00:00`);

        return {
            day: Number.isNaN(date.getTime())
                ? rawDate
                : new Intl.DateTimeFormat("en-IN", {
                    day: "2-digit",
                    month: "short",
                }).format(date),
            total: Number(item?.count) || 0,
        };
    });
};

const buildBreakdownData = (items = []) => {
    return items.map((item) => ({
        name: formatLabel(item?._id || "Unknown"),
        value: Number(item?.count) || 0,
    }));
};

function Analytics() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const fetchAnalytics = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const response = await fetch(API_URL, {
                method: "GET",
                credentials: "include",
                cache: "no-store",
            });

            let data = null;

            try {
                data = await response.json();
            } catch {
                throw new Error(
                    "Invalid response received from analytics API."
                );
            }

            if (!response.ok || !data?.success) {
                throw new Error(
                    data?.message ||
                    `Analytics API request failed with status ${response.status}.`
                );
            }

            setAnalytics(data.analytics || null);
        } catch (error) {
            console.error("Analytics Fetch Error:", error);

            setAnalytics(null);
            setError(
                error?.message ||
                "Unable to fetch analytics data."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchAnalytics();

        const interval = setInterval(() => {
            fetchAnalytics(true);
        }, 5 * 60 * 1000);

        return () => {
            clearInterval(interval);
        };
    }, [fetchAnalytics]);

    const overview = analytics?.overview || {};

    const trendData = useMemo(() => {
        return buildTrendData(analytics?.dailyTrend || []);
    }, [analytics]);

    const typeData = useMemo(() => {
        return buildBreakdownData(
            analytics?.typeBreakdown || []
        );
    }, [analytics]);

    const severityData = useMemo(() => {
        return buildBreakdownData(
            analytics?.severityBreakdown || []
        );
    }, [analytics]);

    const statusData = useMemo(() => {
        return buildBreakdownData(
            analytics?.statusBreakdown || []
        );
    }, [analytics]);

    const criticalCount = getBreakdownCount(
        analytics?.severityBreakdown,
        "critical"
    );

    const highCount = getBreakdownCount(
        analytics?.severityBreakdown,
        "high"
    );

    const mediumCount = getBreakdownCount(
        analytics?.severityBreakdown,
        "medium"
    );

    const lowCount = getBreakdownCount(
        analytics?.severityBreakdown,
        "low"
    );

    const resolutionPercentage =
        Number(overview.totalIncidents) > 0
            ? Math.round(
                ((Number(overview.resolvedIncidents) || 0) /
                    Number(overview.totalIncidents)) *
                100
            )
            : 0;

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div>
                    <div className="mb-2 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--info)]" />
                        <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--info)]">
                            ANALYTICS CENTER
                        </span>
                    </div>

                    <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
                        Analytics
                    </h1>

                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                        Monitor incident activity, severity,
                        response status and affected population.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => fetchAnalytics(true)}
                    disabled={refreshing}
                    className="flex h-10 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface)] px-4 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--surface-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <RefreshCw
                        className={`h-4 w-4 ${refreshing ? "animate-spin" : ""
                            }`}
                    />
                    {refreshing ? "Refreshing..." : "Refresh Data"}
                </button>
            </div>

            {error && (
                <div className="flex items-center justify-between gap-4 rounded-[var(--radius-md)] border border-red-500/20 bg-red-500/5 px-4 py-3">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
                        <p className="text-sm text-red-300">
                            {error}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => fetchAnalytics(true)}
                        className="text-xs font-medium text-red-400 hover:text-red-300"
                    >
                        Retry
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    icon={Activity}
                    title="Total Incidents"
                    value={
                        loading
                            ? "--"
                            : formatNumber(
                                overview.totalIncidents
                            )
                    }
                    description="All reported incidents"
                    iconClass="text-blue-400"
                    iconBg="bg-blue-500/10"
                />

                <StatCard
                    icon={ShieldAlert}
                    title="Active Incidents"
                    value={
                        loading
                            ? "--"
                            : formatNumber(
                                overview.activeIncidents
                            )
                    }
                    description={`${criticalCount} critical alerts`}
                    iconClass="text-red-400"
                    iconBg="bg-red-500/10"
                />

                <StatCard
                    icon={Users}
                    title="People Affected"
                    value={
                        loading
                            ? "--"
                            : formatNumber(
                                overview.peopleAffected
                            )
                    }
                    description="Across reported incidents"
                    iconClass="text-cyan-400"
                    iconBg="bg-cyan-500/10"
                />

                <StatCard
                    icon={CheckCircle2}
                    title="Resolved Incidents"
                    value={
                        loading
                            ? "--"
                            : formatNumber(
                                overview.resolvedIncidents
                            )
                    }
                    description="Successfully resolved"
                    iconClass="text-emerald-400"
                    iconBg="bg-emerald-500/10"
                />
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.45fr_0.8fr]">
                <Panel
                    title="Incident Trends"
                    subtitle="Daily incident volume"
                    icon={TrendingUp}
                >
                    <div className="h-[320px]">
                        {loading ? (
                            <ChartLoader />
                        ) : trendData.length > 0 ? (
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
                                        bottom: 0,
                                    }}
                                >
                                    <CartesianGrid
                                        stroke="var(--border)"
                                        strokeDasharray="3 3"
                                        vertical={false}
                                    />

                                    <XAxis
                                        dataKey="day"
                                        stroke="var(--text-muted)"
                                        tick={{
                                            fill: "var(--text-muted)",
                                            fontSize: 11,
                                        }}
                                        axisLine={false}
                                        tickLine={false}
                                    />

                                    <YAxis
                                        stroke="var(--text-muted)"
                                        tick={{
                                            fill: "var(--text-muted)",
                                            fontSize: 11,
                                        }}
                                        axisLine={false}
                                        tickLine={false}
                                        allowDecimals={false}
                                    />

                                    <Tooltip
                                        contentStyle={{
                                            background:
                                                "var(--surface)",
                                            border: "1px solid var(--border)",
                                            borderRadius: "5px",
                                            color: "var(--text-primary)",
                                            fontSize: "12px",
                                        }}
                                    />

                                    <Line
                                        type="monotone"
                                        dataKey="total"
                                        name="Incidents"
                                        stroke="#2563eb"
                                        strokeWidth={2.5}
                                        dot={{
                                            r: 3,
                                            fill: "#2563eb",
                                        }}
                                        activeDot={{
                                            r: 5,
                                        }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyChart text="No incident trend data available." />
                        )}
                    </div>
                </Panel>

                <Panel
                    title="Incident Categories"
                    subtitle="Distribution by type"
                    icon={BarChart3}
                >
                    <div className="h-[320px]">
                        {loading ? (
                            <ChartLoader />
                        ) : typeData.length > 0 ? (
                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >
                                <PieChart>
                                    <Pie
                                        data={typeData}
                                        cx="50%"
                                        cy="45%"
                                        innerRadius={65}
                                        outerRadius={105}
                                        paddingAngle={3}
                                        dataKey="value"
                                    >
                                        {typeData.map(
                                            (item, index) => (
                                                <Cell
                                                    key={`type-${index}`}
                                                    fill={
                                                        chartColors[
                                                        index %
                                                        chartColors.length
                                                        ]
                                                    }
                                                />
                                            )
                                        )}
                                    </Pie>

                                    <Tooltip
                                        contentStyle={{
                                            background:
                                                "var(--surface)",
                                            border: "1px solid var(--border)",
                                            borderRadius: "5px",
                                            color: "var(--text-primary)",
                                            fontSize: "12px",
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyChart text="No category data available." />
                        )}
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-2">
                        {typeData.slice(0, 6).map(
                            (item, index) => (
                                <div
                                    key={`${item.name}-${index}`}
                                    className="flex items-center gap-2"
                                >
                                    <span
                                        className="h-2 w-2 rounded-full"
                                        style={{
                                            backgroundColor:
                                                chartColors[
                                                index %
                                                chartColors.length
                                                ],
                                        }}
                                    />

                                    <span className="truncate text-[11px] text-[var(--text-muted)]">
                                        {item.name}
                                    </span>

                                    <span className="ml-auto text-[11px] font-medium text-[var(--text-secondary)]">
                                        {item.value}
                                    </span>
                                </div>
                            )
                        )}
                    </div>
                </Panel>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <Panel
                    title="Severity Distribution"
                    subtitle="Incidents by severity level"
                    icon={AlertTriangle}
                >
                    <div className="h-[300px]">
                        {loading ? (
                            <ChartLoader />
                        ) : severityData.length > 0 ? (
                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >
                                <BarChart
                                    data={severityData}
                                    margin={{
                                        top: 10,
                                        right: 10,
                                        left: -20,
                                        bottom: 0,
                                    }}
                                >
                                    <CartesianGrid
                                        stroke="var(--border)"
                                        strokeDasharray="3 3"
                                        vertical={false}
                                    />

                                    <XAxis
                                        dataKey="name"
                                        stroke="var(--text-muted)"
                                        tick={{
                                            fill: "var(--text-muted)",
                                            fontSize: 11,
                                        }}
                                        axisLine={false}
                                        tickLine={false}
                                    />

                                    <YAxis
                                        stroke="var(--text-muted)"
                                        tick={{
                                            fill: "var(--text-muted)",
                                            fontSize: 11,
                                        }}
                                        axisLine={false}
                                        tickLine={false}
                                        allowDecimals={false}
                                    />

                                    <Tooltip
                                        contentStyle={{
                                            background:
                                                "var(--surface)",
                                            border: "1px solid var(--border)",
                                            borderRadius: "5px",
                                            color: "var(--text-primary)",
                                            fontSize: "12px",
                                        }}
                                    />

                                    <Bar
                                        dataKey="value"
                                        name="Incidents"
                                        radius={[
                                            4,
                                            4,
                                            0,
                                            0,
                                        ]}
                                    >
                                        {severityData.map(
                                            (item, index) => {
                                                const key =
                                                    item.name.toLowerCase();

                                                let fill =
                                                    "#64748b";

                                                if (
                                                    key ===
                                                    "critical"
                                                ) {
                                                    fill =
                                                        "#dc2626";
                                                } else if (
                                                    key ===
                                                    "high"
                                                ) {
                                                    fill =
                                                        "#f97316";
                                                } else if (
                                                    key ===
                                                    "medium"
                                                ) {
                                                    fill =
                                                        "#f59e0b";
                                                } else if (
                                                    key === "low"
                                                ) {
                                                    fill =
                                                        "#22c55e";
                                                }

                                                return (
                                                    <Cell
                                                        key={`severity-${index}`}
                                                        fill={fill}
                                                    />
                                                );
                                            }
                                        )}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyChart text="No severity data available." />
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <MiniMetric
                            label="Critical"
                            value={
                                loading
                                    ? "--"
                                    : criticalCount
                            }
                            className="text-red-400"
                        />

                        <MiniMetric
                            label="High"
                            value={
                                loading
                                    ? "--"
                                    : highCount
                            }
                            className="text-orange-400"
                        />

                        <MiniMetric
                            label="Medium"
                            value={
                                loading
                                    ? "--"
                                    : mediumCount
                            }
                            className="text-amber-400"
                        />

                        <MiniMetric
                            label="Low"
                            value={
                                loading
                                    ? "--"
                                    : lowCount
                            }
                            className="text-emerald-400"
                        />
                    </div>
                </Panel>

                <Panel
                    title="Incident Status"
                    subtitle="Current response status"
                    icon={Clock3}
                >
                    <div className="h-[300px]">
                        {loading ? (
                            <ChartLoader />
                        ) : statusData.length > 0 ? (
                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >
                                <BarChart
                                    data={statusData}
                                    layout="vertical"
                                    margin={{
                                        top: 5,
                                        right: 20,
                                        left: 10,
                                        bottom: 5,
                                    }}
                                >
                                    <CartesianGrid
                                        stroke="var(--border)"
                                        strokeDasharray="3 3"
                                        horizontal={false}
                                    />

                                    <XAxis
                                        type="number"
                                        allowDecimals={false}
                                        stroke="var(--text-muted)"
                                        tick={{
                                            fill: "var(--text-muted)",
                                            fontSize: 11,
                                        }}
                                        axisLine={false}
                                        tickLine={false}
                                    />

                                    <YAxis
                                        type="category"
                                        dataKey="name"
                                        width={100}
                                        stroke="var(--text-muted)"
                                        tick={{
                                            fill: "var(--text-muted)",
                                            fontSize: 11,
                                        }}
                                        axisLine={false}
                                        tickLine={false}
                                    />

                                    <Tooltip
                                        contentStyle={{
                                            background:
                                                "var(--surface)",
                                            border: "1px solid var(--border)",
                                            borderRadius: "5px",
                                            color: "var(--text-primary)",
                                            fontSize: "12px",
                                        }}
                                    />

                                    <Bar
                                        dataKey="value"
                                        name="Incidents"
                                        fill="#06b6d4"
                                        radius={[
                                            0,
                                            4,
                                            4,
                                            0,
                                        ]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyChart text="No status data available." />
                        )}
                    </div>
                </Panel>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <InfoCard
                    icon={AlertTriangle}
                    title="Critical Incidents"
                    value={
                        loading
                            ? "--"
                            : formatNumber(criticalCount)
                    }
                    description="Require immediate attention"
                    iconClass="text-red-400"
                    bgClass="bg-red-500/10"
                />

                <InfoCard
                    icon={TrendingUp}
                    title="Active Response"
                    value={
                        loading
                            ? "--"
                            : formatNumber(
                                overview.activeIncidents
                            )
                    }
                    description="Currently being handled"
                    iconClass="text-blue-400"
                    bgClass="bg-blue-500/10"
                />

                <InfoCard
                    icon={CheckCircle2}
                    title="Resolution"
                    value={
                        loading
                            ? "--"
                            : `${resolutionPercentage}%`
                    }
                    description="Of total incidents resolved"
                    iconClass="text-emerald-400"
                    bgClass="bg-emerald-500/10"
                />
            </div>
        </div>
    );
}

function StatCard({
    icon: Icon,
    title,
    value,
    description,
    iconClass,
    iconBg,
}) {
    return (
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs text-[var(--text-muted)]">
                        {title}
                    </p>

                    <p className="mt-1.5 text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
                        {value}
                    </p>

                    <p className="mt-1 text-[11px] text-[var(--text-muted)]">
                        {description}
                    </p>
                </div>

                <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] ${iconBg}`}
                >
                    <Icon
                        className={`h-5 w-5 ${iconClass}`}
                    />
                </div>
            </div>
        </div>
    );
}

function Panel({
    title,
    subtitle,
    icon: Icon,
    children,
}) {
    return (
        <section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="mb-4 flex items-start gap-3">
                {Icon && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--primary)]/10">
                        <Icon className="h-4 w-4 text-[var(--primary-light)]" />
                    </div>
                )}

                <div>
                    <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                        {title}
                    </h2>

                    {subtitle && (
                        <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>

            {children}
        </section>
    );
}

function MiniMetric({
    label,
    value,
    className,
}) {
    return (
        <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background)] p-3">
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                {label}
            </p>

            <p
                className={`mt-1 text-lg font-semibold ${className}`}
            >
                {value}
            </p>
        </div>
    );
}

function InfoCard({
    icon: Icon,
    title,
    value,
    description,
    iconClass,
    bgClass,
}) {
    return (
        <div className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
            <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] ${bgClass}`}
            >
                <Icon
                    className={`h-5 w-5 ${iconClass}`}
                />
            </div>

            <div className="min-w-0">
                <p className="text-xs text-[var(--text-muted)]">
                    {title}
                </p>

                <p className="mt-0.5 text-lg font-semibold text-[var(--text-primary)]">
                    {value}
                </p>

                <p className="mt-0.5 truncate text-[10px] text-[var(--text-muted)]">
                    {description}
                </p>
            </div>
        </div>
    );
}

function ChartLoader() {
    return (
        <div className="flex h-full items-center justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-[var(--border-light)] border-t-[var(--primary)]" />
        </div>
    );
}

function EmptyChart({ text }) {
    return (
        <div className="flex h-full items-center justify-center">
            <div className="text-center">
                <BarChart3 className="mx-auto h-7 w-7 text-[var(--text-muted)]" />

                <p className="mt-2 text-xs text-[var(--text-muted)]">
                    {text}
                </p>
            </div>
        </div>
    );
}

export default Analytics;