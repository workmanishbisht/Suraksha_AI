import { useMemo, useState } from "react";
import {
    AlertTriangle,
    Bell,
    CalendarDays,
    CheckCircle2,
    ChevronDown,
    Clock3,
    MapPin,
    Search,
    ShieldAlert,
    Siren,
    XCircle,
} from "lucide-react";

const alertsData = [
    {
        id: "ALT-2048",
        title: "Heavy Rainfall Warning",
        type: "Weather",
        severity: "High",
        location: "Dehradun District",
        date: "20 Sep 2026",
        time: "10:15 AM",
        status: "Active",
        description:
            "Residents are advised to remain cautious due to heavy rainfall and possible waterlogging in low-lying areas.",
    },
    {
        id: "ALT-2047",
        title: "Road Traffic Advisory",
        type: "Traffic",
        severity: "Medium",
        location: "Rajpur Road",
        date: "20 Sep 2026",
        time: "09:30 AM",
        status: "Active",
        description:
            "Traffic movement may be affected due to an ongoing emergency response operation.",
    },
    {
        id: "ALT-2044",
        title: "Flash Flood Advisory",
        type: "Flood",
        severity: "Critical",
        location: "Sahastradhara Area",
        date: "19 Sep 2026",
        time: "07:45 PM",
        status: "Active",
        description:
            "Citizens near streams and low-lying areas should move to safer locations and follow official instructions.",
    },
    {
        id: "ALT-2039",
        title: "Public Safety Advisory",
        type: "Safety",
        severity: "Low",
        location: "Prem Nagar",
        date: "18 Sep 2026",
        time: "04:20 PM",
        status: "Resolved",
        description:
            "The previously reported public safety situation has been resolved. Normal movement may resume.",
    },
    {
        id: "ALT-2035",
        title: "Road Closure Notice",
        type: "Traffic",
        severity: "Medium",
        location: "Clock Tower",
        date: "17 Sep 2026",
        time: "11:10 AM",
        status: "Resolved",
        description:
            "Temporary road closure has been cleared and traffic movement has returned to normal.",
    },
];

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

function Alerts() {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("All");
    const [expandedAlert, setExpandedAlert] = useState(null);

    const filteredAlerts = useMemo(() => {
        return alertsData.filter((alert) => {
            const value = search.toLowerCase().trim();

            const matchesSearch =
                !value ||
                alert.title.toLowerCase().includes(value) ||
                alert.location.toLowerCase().includes(value) ||
                alert.type.toLowerCase().includes(value);

            const matchesFilter =
                filter === "All" ||
                alert.status === filter ||
                alert.severity === filter;

            return matchesSearch && matchesFilter;
        });
    }, [search, filter]);

    const activeAlerts = alertsData.filter(
        (alert) => alert.status === "Active"
    ).length;

    const criticalAlerts = alertsData.filter(
        (alert) =>
            alert.status === "Active" &&
            alert.severity === "Critical"
    ).length;

    return (
        <div className="space-y-5">

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

                <div className="flex items-center gap-2 rounded-[5px] border border-emerald-500/20 bg-emerald-500/5 px-3 py-2">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                    <span className="text-xs font-medium text-emerald-400">
                        Live Alerts
                    </span>
                </div>
            </div>

            {/* Critical Alert Banner */}
            {criticalAlerts > 0 && (
                <div className="flex flex-col gap-4 rounded-[6px] border border-red-500/25 bg-red-500/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[5px] bg-red-500/10">
                            <Siren
                                size={20}
                                className="text-red-400"
                            />
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-red-300">
                                Critical Emergency Alert Active
                            </p>

                            <p className="mt-1 text-xs leading-5 text-slate-500">
                                Please check the alert details below and follow
                                official safety instructions.
                            </p>
                        </div>
                    </div>

                    <span className="w-fit rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-[11px] font-medium text-red-400">
                        {criticalAlerts} Critical Alert
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

                        <Bell
                            size={19}
                            className="text-cyan-400"
                        />
                    </div>

                    <p className="mt-3 text-2xl font-semibold text-white">
                        {activeAlerts}
                    </p>
                </div>

                <div className="rounded-[6px] border border-[var(--border)] bg-[var(--surface)] p-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-400">
                            Critical
                        </p>

                        <Siren
                            size={19}
                            className="text-red-400"
                        />
                    </div>

                    <p className="mt-3 text-2xl font-semibold text-white">
                        {criticalAlerts}
                    </p>
                </div>

                <div className="rounded-[6px] border border-[var(--border)] bg-[var(--surface)] p-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-400">
                            Total Alerts
                        </p>

                        <ShieldAlert
                            size={19}
                            className="text-amber-400"
                        />
                    </div>

                    <p className="mt-3 text-2xl font-semibold text-white">
                        {alertsData.length}
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
                        onChange={(e) => setSearch(e.target.value)}
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
                        "Resolved",
                    ].map((item) => (
                        <button
                            key={item}
                            type="button"
                            onClick={() => setFilter(item)}
                            className={`rounded-[5px] px-3 py-2 text-xs font-medium transition ${
                                filter === item
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

                {filteredAlerts.map((alert) => {
                    const severity =
                        severityConfig[alert.severity] ||
                        severityConfig.Medium;

                    const SeverityIcon = severity.icon;

                    const isExpanded =
                        expandedAlert === alert.id;

                    return (
                        <div
                            key={alert.id}
                            className={`rounded-[6px] border bg-[var(--surface)] transition ${
                                alert.status === "Active" &&
                                alert.severity === "Critical"
                                    ? "border-red-500/25"
                                    : "border-[var(--border)]"
                            }`}
                        >
                            <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start">

                                {/* Icon */}
                                <div
                                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[5px] border ${severity.className}`}
                                >
                                    <SeverityIcon size={21} />
                                </div>

                                {/* Content */}
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
                                                    className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                                                        alert.status === "Active"
                                                            ? "border-cyan-500/20 bg-cyan-500/10 text-cyan-400"
                                                            : "border-slate-700 bg-slate-800 text-slate-500"
                                                    }`}
                                                >
                                                    {alert.status}
                                                </span>
                                            </div>

                                            <p className="mt-1 text-[11px] text-slate-600">
                                                {alert.id}
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setExpandedAlert(
                                                    isExpanded
                                                        ? null
                                                        : alert.id
                                                )
                                            }
                                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] text-slate-500 transition hover:bg-slate-800 hover:text-white"
                                        >
                                            <ChevronDown
                                                size={17}
                                                className={`transition ${
                                                    isExpanded
                                                        ? "rotate-180"
                                                        : ""
                                                }`}
                                            />
                                        </button>
                                    </div>

                                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                                        <span className="flex items-center gap-1.5">
                                            <MapPin size={14} />
                                            {alert.location}
                                        </span>

                                        <span className="flex items-center gap-1.5">
                                            <CalendarDays size={14} />
                                            {alert.date}
                                        </span>

                                        <span className="flex items-center gap-1.5">
                                            <Clock3 size={14} />
                                            {alert.time}
                                        </span>
                                    </div>

                                    {isExpanded && (
                                        <div className="mt-4 border-t border-[var(--border)] pt-4">
                                            <p className="text-xs leading-6 text-slate-400">
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
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Empty State */}
                {filteredAlerts.length === 0 && (
                    <div className="rounded-[6px] border border-[var(--border)] bg-[var(--surface)] px-5 py-16 text-center">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-[5px] bg-slate-800">
                            <XCircle
                                size={22}
                                className="text-slate-500"
                            />
                        </div>

                        <h3 className="text-sm font-semibold text-slate-300">
                            No alerts found
                        </h3>

                        <p className="mt-1 text-xs text-slate-600">
                            Try changing your search or selected filter.
                        </p>
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
                        Emergency alerts are intended to provide timely safety
                        information. Always follow official instructions
                        during an emergency.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Alerts;