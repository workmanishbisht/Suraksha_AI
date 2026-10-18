
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    AlertTriangle,
    Bell,
    CalendarDays,
    CheckCircle2,
    ChevronDown,
    Clock3,
    MapPin,
    Megaphone,
    RefreshCw,
    Search,
    ShieldAlert,
    Siren,
    XCircle,
} from "lucide-react";

const API_URL = "http://localhost:5000/api/emergency-alerts";
const ANNOUNCEMENTS_API_URL = "http://localhost:5000/api/announcements";

const severityConfig = {
    Critical: {
        className: "border-red-500/20 bg-red-500/10 text-red-400",
        icon: Siren,
    },
    High: {
        className: "border-orange-500/20 bg-orange-500/10 text-orange-400",
        icon: AlertTriangle,
    },
    Medium: {
        className: "border-amber-500/20 bg-amber-500/10 text-amber-400",
        icon: ShieldAlert,
    },
    Low: {
        className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
        icon: CheckCircle2,
    },
};

const formatDate = (value) => {
    if (!value) return "Date unavailable";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Date unavailable";
    }

    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(date);
};

const formatTime = (value) => {
    if (!value) return "--";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "--";
    }

    return new Intl.DateTimeFormat("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    }).format(date);
};

function Alerts() {
    const [alerts, setAlerts] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [activeTab, setActiveTab] = useState("alerts");
    const [announcementLoading, setAnnouncementLoading] = useState(false);
    const [announcementError, setAnnouncementError] = useState("");
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("All");
    const [expandedAlert, setExpandedAlert] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [refreshing, setRefreshing] = useState(false);

    const fetchAlerts = useCallback(async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        setError("");

        try {
            const response = await fetch(API_URL, {
                method: "GET",
                credentials: "include",
                headers: {
                    Accept: "application/json",
                },
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    (response.status === 401
                        ? "Please log in to view emergency alerts."
                        : response.status === 403
                            ? "You do not have permission to view alerts."
                            : "Unable to fetch emergency alerts.")
                );
            }

            if (!Array.isArray(data.alerts)) {
                throw new Error("Invalid response received from alerts API.");
            }

            setAlerts(data.alerts);
        } catch (err) {
            console.error("Emergency Alerts Error:", err);
            setError(
                err.message ||
                "Unable to load alerts. Please try again."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    const fetchAnnouncements = useCallback(async () => {
        setAnnouncementLoading(true);
        setAnnouncementError("");
        try {
            const response = await fetch(ANNOUNCEMENTS_API_URL, {
                method: "GET",
                credentials: "include",
                headers: { Accept: "application/json" },
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.message || (response.status === 401
                    ? "Please log in to view announcements."
                    : response.status === 403
                        ? "You do not have permission to view announcements."
                        : "Unable to fetch announcements."));
            }
            if (!Array.isArray(data.announcements)) {
                throw new Error("Invalid response received from announcements API.");
            }
            setAnnouncements(data.announcements.filter((item) =>
                ["Sent", "Published", "Active"].includes(item.status)
            ));
        } catch (err) {
            console.error("Announcements Error:", err);
            setAnnouncementError(err.message || "Unable to load announcements. Please try again.");
        } finally {
            setAnnouncementLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAlerts();
        fetchAnnouncements();
    }, [fetchAlerts, fetchAnnouncements]);

    const filteredAlerts = useMemo(() => {
        const value = search.toLowerCase().trim();

        return alerts.filter((alert) => {
            const title = alert.title || "";
            const location = alert.location || "";
            const category = alert.category || "";

            const matchesSearch =
                !value ||
                title.toLowerCase().includes(value) ||
                location.toLowerCase().includes(value) ||
                category.toLowerCase().includes(value) ||
                (alert.description || "").toLowerCase().includes(value);

            const matchesFilter =
                filter === "All" ||
                alert.status === filter ||
                alert.severity === filter;

            return matchesSearch && matchesFilter;
        });
    }, [alerts, search, filter]);

    const activeAlerts = alerts.filter(
        (alert) => alert.status === "Active"
    ).length;

    const criticalAlerts = alerts.filter(
        (alert) =>
            alert.status === "Active" &&
            alert.severity === "Critical"
    ).length;

    return (
        <div className="space-y-5">
            {/* Communication tabs */}
            <div className="flex flex-wrap items-center gap-2 rounded-[6px] border border-[var(--border)] bg-[var(--surface)] p-2">
                <button
                    type="button"
                    onClick={() => setActiveTab("announcements")}
                    className={`flex items-center gap-2 rounded-[5px] px-4 py-3 text-sm font-medium transition ${activeTab === "announcements" ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}
                >
                    <Megaphone size={18} /> Announcements
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab("alerts")}
                    className={`flex items-center gap-2 rounded-[5px] px-4 py-3 text-sm font-medium transition ${activeTab === "alerts" ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}
                >
                    <Siren size={18} /> Emergency Alerts
                </button>
            </div>

            {activeTab === "announcements" ? (
                <section className="space-y-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-400"><Megaphone size={15} /> Citizen Updates</div>
                            <h1 className="text-2xl font-semibold text-white">Announcements</h1>
                            <p className="mt-1 text-sm text-slate-400">Updates and important messages shared by SurakshaAI.</p>
                        </div>
                        <button type="button" onClick={fetchAnnouncements} disabled={announcementLoading} className="flex items-center gap-2 self-start rounded-[5px] border border-slate-700 bg-[#091522] px-3 py-2 text-xs text-slate-300 transition hover:border-blue-500 hover:text-white disabled:opacity-50"><RefreshCw size={14} className={announcementLoading ? "animate-spin" : ""} /> Refresh</button>
                    </div>
                    {announcementError && <div role="alert" className="rounded-[6px] border border-red-500/25 bg-red-500/5 p-4 text-sm text-red-300">{announcementError}<button type="button" onClick={fetchAnnouncements} className="ml-3 underline">Try again</button></div>}
                    {announcementLoading ? (
                        <div className="rounded-[6px] border border-[var(--border)] bg-[var(--surface)] px-5 py-16 text-center"><div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-slate-700 border-t-blue-400" /><p className="mt-3 text-sm text-slate-400">Loading announcements...</p></div>
                    ) : !announcementError && announcements.length === 0 ? (
                        <div className="rounded-[6px] border border-[var(--border)] bg-[var(--surface)] px-5 py-16 text-center"><Megaphone size={24} className="mx-auto mb-3 text-slate-500" /><h3 className="text-sm font-semibold text-slate-300">No announcements yet</h3><p className="mt-1 text-xs text-slate-500">New announcements from the administration will appear here.</p></div>
                    ) : !announcementError && announcements.map((announcement) => (
                        <article key={announcement._id} className="rounded-[6px] border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[5px] bg-blue-500/10 text-blue-400"><Megaphone size={19} /></div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2"><h2 className="text-sm font-semibold text-white">{announcement.title || "Announcement"}</h2><span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] text-blue-300">{announcement.type || "General"}</span>{announcement.priority && <span className="rounded-full border border-slate-700 px-2 py-0.5 text-[10px] text-slate-400">{announcement.priority}</span>}</div>
                                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-300">{announcement.message || announcement.description || "No message provided."}</p>
                                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500"><span>{announcement.audience || "All Users"}</span><span>{announcement.createdAt ? new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(announcement.createdAt)) : "Date unavailable"}</span></div>
                                </div>
                            </div>
                        </article>
                    ))}
                </section>
            ) : (
                <>
                    {/* Header */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-400">
                                <Bell size={15} />
                                Citizen Safety
                            </div>

                            <h1 className="text-2xl font-semibold text-white">
                                Emergency Alerts
                            </h1>

                            <p className="mt-1 text-sm text-slate-400">
                                Stay informed about active safety alerts and emergency
                                situations in your area.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                type="button"
                                onClick={() => fetchAlerts(true)}
                                disabled={loading || refreshing}
                                className="flex items-center gap-2 rounded-[5px] border border-slate-700 bg-[#091522] px-3 py-2 text-xs text-slate-300 transition hover:border-cyan-500 hover:text-white disabled:opacity-50"
                            >
                                <RefreshCw
                                    size={14}
                                    className={
                                        refreshing ? "animate-spin" : ""
                                    }
                                />
                                Refresh
                            </button>

                            <div className="flex items-center gap-2 rounded-[5px] border border-emerald-500/20 bg-emerald-500/5 px-3 py-2">
                                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                                <span className="text-xs font-medium text-emerald-400">
                                    Live Alerts
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Error State */}
                    {error && (
                        <div
                            role="alert"
                            className="rounded-[6px] border border-red-500/25 bg-red-500/5 p-4"
                        >
                            <div className="flex items-start gap-3">
                                <AlertTriangle
                                    size={19}
                                    className="mt-0.5 shrink-0 text-red-400"
                                />

                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-red-300">
                                        Unable to load emergency alerts
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-slate-400">
                                        {error}
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() => fetchAlerts()}
                                        className="mt-3 rounded-[5px] border border-red-500/25 px-3 py-2 text-xs text-red-300 hover:bg-red-500/10"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Critical Alert Banner */}
                    {!loading && !error && criticalAlerts > 0 && (
                        <div className="flex flex-col gap-4 rounded-[6px] border border-red-500/25 bg-red-500/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[5px] bg-red-500/10">
                                    <Siren size={20} className="text-red-400" />
                                </div>

                                <div>
                                    <p className="text-sm font-semibold text-red-300">
                                        Critical Emergency Alert Active
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-slate-500">
                                        Check the alert details below and follow
                                        official safety instructions.
                                    </p>
                                </div>
                            </div>

                            <span className="w-fit rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-[11px] font-medium text-red-400">
                                {criticalAlerts} Critical Alert
                                {criticalAlerts !== 1 ? "s" : ""}
                            </span>
                        </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="rounded-[6px] border border-[var(--border)] bg-[var(--surface)] p-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-slate-400">
                                    Active Alerts
                                </p>
                                <Bell size={19} className="text-cyan-400" />
                            </div>

                            <p className="mt-3 text-2xl font-semibold text-white">
                                {loading ? "—" : activeAlerts}
                            </p>
                        </div>

                        <div className="rounded-[6px] border border-[var(--border)] bg-[var(--surface)] p-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-slate-400">
                                    Critical
                                </p>
                                <Siren size={19} className="text-red-400" />
                            </div>

                            <p className="mt-3 text-2xl font-semibold text-white">
                                {loading ? "—" : criticalAlerts}
                            </p>
                        </div>

                        <div className="rounded-[6px] border border-[var(--border)] bg-[var(--surface)] p-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-slate-400">
                                    Total Alerts
                                </p>
                                <ShieldAlert size={19} className="text-amber-400" />
                            </div>

                            <p className="mt-3 text-2xl font-semibold text-white">
                                {loading ? "—" : alerts.length}
                            </p>
                        </div>
                    </div>

                    {/* Search & Filter */}
                    <div className="flex flex-col gap-3 rounded-[6px] border border-[var(--border)] bg-[var(--surface)] p-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="relative w-full lg:max-w-md">
                            <Search
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                            />

                            <input
                                type="text"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search alerts or locations..."
                                className="w-full rounded-[5px] border border-slate-700 bg-[#091522] py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-cyan-500"
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            {[
                                "All",
                                "Active",
                                "Critical",
                                "High",
                                "Medium",
                                "Low",
                                "Resolved",
                            ].map((item) => (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() => setFilter(item)}
                                    className={`rounded-[5px] px-3 py-2 text-xs font-medium transition ${filter === item
                                            ? "bg-cyan-500 text-slate-950"
                                            : "border border-slate-700 bg-[#091522] text-slate-400 hover:text-white"
                                        }`}
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Alerts List */}
                    <div className="space-y-3">
                        {loading && (
                            <div className="rounded-[6px] border border-[var(--border)] bg-[var(--surface)] px-5 py-16 text-center">
                                <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-slate-700 border-t-cyan-400" />
                                <p className="mt-3 text-sm text-slate-400">
                                    Loading emergency alerts...
                                </p>
                            </div>
                        )}

                        {!loading &&
                            !error &&
                            filteredAlerts.map((alert) => {
                                const severity =
                                    severityConfig[alert.severity] ||
                                    severityConfig.Medium;

                                const SeverityIcon = severity.icon;
                                const alertId = alert._id;

                                const isExpanded =
                                    expandedAlert === alertId;

                                return (
                                    <div
                                        key={alertId}
                                        className={`rounded-[6px] border bg-[var(--surface)] transition ${alert.status === "Active" &&
                                                alert.severity === "Critical"
                                                ? "border-red-500/25"
                                                : "border-[var(--border)]"
                                            }`}
                                    >
                                        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start">
                                            {/* Severity Icon */}
                                            <div
                                                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[5px] border ${severity.className}`}
                                            >
                                                <SeverityIcon size={21} />
                                            </div>

                                            {/* Alert Content */}
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                                    <div>
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <h2 className="text-sm font-semibold text-slate-200">
                                                                {alert.title}
                                                            </h2>

                                                            <span
                                                                className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${severity.className}`}
                                                            >
                                                                {alert.severity}
                                                            </span>

                                                            <span
                                                                className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${alert.status === "Active"
                                                                        ? "border-cyan-500/20 bg-cyan-500/10 text-cyan-400"
                                                                        : "border-slate-700 bg-slate-800 text-slate-500"
                                                                    }`}
                                                            >
                                                                {alert.status}
                                                            </span>
                                                        </div>

                                                        <p className="mt-1 text-[11px] text-slate-600">
                                                            {alert.category || "Other"}
                                                            {" · "}
                                                            {String(alertId || "")
                                                                .slice(-8)
                                                                .toUpperCase()}
                                                        </p>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        aria-label={
                                                            isExpanded
                                                                ? "Collapse alert details"
                                                                : "Expand alert details"
                                                        }
                                                        aria-expanded={isExpanded}
                                                        onClick={() =>
                                                            setExpandedAlert(
                                                                isExpanded
                                                                    ? null
                                                                    : alertId
                                                            )
                                                        }
                                                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] text-slate-500 transition hover:bg-slate-800 hover:text-white"
                                                    >
                                                        <ChevronDown
                                                            size={17}
                                                            className={`transition ${isExpanded
                                                                    ? "rotate-180"
                                                                    : ""
                                                                }`}
                                                        />
                                                    </button>
                                                </div>

                                                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                                                    <span className="flex items-center gap-1.5">
                                                        <MapPin size={14} />
                                                        {alert.location || "Location unavailable"}
                                                    </span>

                                                    <span className="flex items-center gap-1.5">
                                                        <CalendarDays size={14} />
                                                        {formatDate(alert.createdAt)}
                                                    </span>

                                                    <span className="flex items-center gap-1.5">
                                                        <Clock3 size={14} />
                                                        {formatTime(alert.createdAt)}
                                                    </span>
                                                </div>

                                                {isExpanded && (
                                                    <div className="mt-4 border-t border-[var(--border)] pt-4">
                                                        <p className="whitespace-pre-wrap text-xs leading-6 text-slate-400">
                                                            {alert.description}
                                                        </p>

                                                        {alert.status === "Active" && (
                                                            <div className="mt-3 flex items-start gap-2 rounded-[5px] border border-amber-500/20 bg-amber-500/5 p-3">
                                                                <AlertTriangle
                                                                    size={15}
                                                                    className="mt-0.5 shrink-0 text-amber-400"
                                                                />

                                                                <p className="text-xs leading-5 text-slate-400">
                                                                    Follow instructions
                                                                    issued by local
                                                                    authorities and avoid
                                                                    entering restricted or
                                                                    unsafe areas.
                                                                </p>
                                                            </div>
                                                        )}

                                                        {alert.status === "Resolved" && (
                                                            <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400">
                                                                <CheckCircle2 size={15} />
                                                                This alert has been resolved.
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                        {/* Empty State */}
                        {!loading &&
                            !error &&
                            filteredAlerts.length === 0 && (
                                <div className="rounded-[6px] border border-[var(--border)] bg-[var(--surface)] px-5 py-16 text-center">
                                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-[5px] bg-slate-800">
                                        <XCircle
                                            size={22}
                                            className="text-slate-500"
                                        />
                                    </div>

                                    <h3 className="text-sm font-semibold text-slate-300">
                                        {alerts.length === 0
                                            ? "No emergency alerts yet"
                                            : "No alerts found"}
                                    </h3>

                                    <p className="mt-1 text-xs text-slate-600">
                                        {alerts.length === 0
                                            ? "There are currently no emergency alerts available."
                                            : "Try changing your search or selected filter."}
                                    </p>

                                    {alerts.length === 0 && (
                                        <button
                                            type="button"
                                            onClick={() => fetchAlerts()}
                                            className="mt-4 rounded-[5px] border border-slate-700 px-3 py-2 text-xs text-slate-300 transition hover:border-cyan-500 hover:text-white"
                                        >
                                            Check Again
                                        </button>
                                    )}
                                </div>
                            )}
                    </div>

                    {/* Footer Notice */}
                    <div className="flex items-start gap-3 rounded-[6px] border border-cyan-500/15 bg-cyan-500/5 p-4">
                        <Bell
                            size={18}
                            className="mt-0.5 shrink-0 text-cyan-400"
                        />

                        <div>
                            <p className="text-xs font-medium text-cyan-300">
                                Stay alert and informed
                            </p>

                            <p className="mt-1 text-xs leading-5 text-slate-500">
                                Emergency alerts provide safety information. Always
                                follow official instructions during an emergency.
                            </p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default Alerts;
