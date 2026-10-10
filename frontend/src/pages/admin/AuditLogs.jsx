
import { useCallback, useEffect, useState } from "react";
import {
    Activity,
    Search,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    ShieldCheck,
    CircleCheck,
    CircleX,
    CalendarDays,
    Filter,
    Clock3,
} from "lucide-react";

const API_BASE_URL = "http://localhost:5000/api";

const panelClass =
    "rounded-[6px] border border-[#173149] bg-[#091a2a]";

const buttonClass =
    "inline-flex h-9 items-center justify-center gap-2 rounded-[5px] border border-[#21415c] px-3 text-[11px] font-medium text-slate-200 transition hover:border-cyan-500/40 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-40";

const controlClass =
    "h-9 w-full min-w-0 rounded-[5px] border border-[#21415c] bg-[#071827] px-3 text-[11px] text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/10";

const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const titleCase = (value = "") =>
    String(value)
        .replace(/[._-]/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());

function StatCard({ label, value, description, icon: Icon, iconClass }) {
    return (
        <div className="min-w-0 rounded-[6px] border border-[#173149] bg-[#091a2a] p-4 transition hover:border-[#28506d]">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                        {label}
                    </p>
                    <p className="mt-2 text-[24px] font-semibold leading-none text-white">
                        {value}
                    </p>
                    <p className="mt-2 text-[10px] leading-4 text-slate-500">
                        {description}
                    </p>
                </div>

                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[5px] border ${iconClass}`}>
                    <Icon size={16} strokeWidth={2} />
                </div>
            </div>
        </div>
    );
}

function AuditLogs() {
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        successful: 0,
        failed: 0,
    });

    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
    });

    const [searchInput, setSearchInput] = useState("");
    const [filters, setFilters] = useState({
        action: "",
        resource: "",
        status: "",
        from: "",
        to: "",
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const params = new URLSearchParams({
                page: String(page),
                limit: "20",
            });

            if (searchInput.trim()) {
                params.set("search", searchInput.trim());
            }

            Object.entries(filters).forEach(([key, value]) => {
                if (value) params.set(key, value);
            });

            const response = await fetch(
                `${API_BASE_URL}/audit-logs?${params.toString()}`,
                {
                    method: "GET",
                    credentials: "include",
                    cache: "no-store",
                }
            );

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    `Failed to load audit logs (${response.status}).`
                );
            }

            setLogs(Array.isArray(data.logs) ? data.logs : []);
            setStats(
                data.stats || {
                    total: 0,
                    successful: 0,
                    failed: 0,
                }
            );
            setPagination(
                data.pagination || {
                    page: 1,
                    limit: 20,
                    total: 0,
                    totalPages: 0,
                }
            );
        } catch (err) {
            console.error("Audit Logs Error:", err);
            setError(err.message || "Unable to load audit logs.");
            setLogs([]);
        } finally {
            setLoading(false);
        }
    }, [page, searchInput, filters]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const updateFilter = (key, value) => {
        setPage(1);
        setFilters((current) => ({
            ...current,
            [key]: value,
        }));
    };

    const clearFilters = () => {
        setSearchInput("");
        setPage(1);
        setFilters({
            action: "",
            resource: "",
            status: "",
            from: "",
            to: "",
        });
    };

    const statCards = [
        {
            label: "Total Events",
            value: stats.total,
            description: "Events matching current filters",
            icon: Activity,
            iconClass: "border-cyan-500/20 bg-cyan-500/10 text-cyan-300",
        },
        {
            label: "Successful",
            value: stats.successful,
            description: "Successful recorded actions",
            icon: CircleCheck,
            iconClass: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
        },
        {
            label: "Failed",
            value: stats.failed,
            description: "Failed recorded actions",
            icon: CircleX,
            iconClass: "border-red-500/20 bg-red-500/10 text-red-300",
        },
    ];

    return (
        <div className="min-h-full w-full min-w-0 space-y-6 font-['Poppins'] text-slate-200">
            {/* Page Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                    <div className="mb-3 flex items-center gap-2">
                        <span className="h-6 w-[4px] rounded-full bg-cyan-400" />
                        <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-cyan-400">
                            System Administration
                        </p>
                    </div>

                    <h1 className="text-[25px] font-semibold leading-tight tracking-[-0.03em] text-white">
                        Audit Logs
                    </h1>

                    <p className="mt-2 max-w-2xl text-[12px] leading-5 text-slate-500">
                        Review recorded actions and system activity.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={fetchLogs}
                    disabled={loading}
                    className={buttonClass}
                >
                    <RefreshCw
                        size={14}
                        className={loading ? "animate-spin" : ""}
                    />
                    Refresh
                </button>
            </div>

            {/* Statistics */}
            <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {statCards.map((card) => (
                    <StatCard key={card.label} {...card} />
                ))}
            </div>

            {/* Filters */}
            <section className={`${panelClass} min-w-0 p-4`}>
                <div className="mb-3 flex items-center gap-2">
                    <Filter
                        size={15}
                        strokeWidth={2}
                        className="shrink-0 text-cyan-300"
                    />
                    <h2 className="text-[13px] font-semibold text-white">
                        Filter Activity
                    </h2>
                </div>

                <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-12">
                    {/* Search */}
                    <label className="relative block min-w-0 sm:col-span-2 xl:col-span-3">
                        <Search
                            size={15}
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white"
                        />
                        <input
                            type="search"
                            value={searchInput}
                            onChange={(event) => {
                                setSearchInput(event.target.value);
                                setPage(1);
                            }}
                            placeholder="Search actor, action, resource..."
                            className={`${controlClass} pl-9 placeholder:text-slate-400`}
                        />
                    </label>

                    {/* Action filter: actual audit action values */}
                    <select
                        aria-label="Filter by action"
                        value={filters.action}
                        onChange={(event) =>
                            updateFilter("action", event.target.value)
                        }
                        className={`${controlClass} xl:col-span-3`}
                    >
                        <option value="">All Actions</option>
                        <option value="USER_ROLE_UPDATED">
                            User Role Updated
                        </option>
                        <option value="USER_ACTIVATED">
                            User Activated
                        </option>
                        <option value="USER_DEACTIVATED">
                            User Deactivated
                        </option>
                        <option value="USER_DELETED">
                            User Deleted
                        </option>
                        <option value="ROLE_PERMISSIONS_UPDATED">
                            Role Permissions Updated
                        </option>
                        <option value="create">Create (Legacy)</option>
                        <option value="read">Read (Legacy)</option>
                        <option value="update">Update (Legacy)</option>
                        <option value="delete">Delete (Legacy)</option>
                        <option value="login">Login</option>
                        <option value="logout">Logout</option>
                    </select>

                    {/* Resource */}
                    <select
                        aria-label="Filter by resource"
                        value={filters.resource}
                        onChange={(event) =>
                            updateFilter("resource", event.target.value)
                        }
                        className={`${controlClass} xl:col-span-3`}
                    >
                        <option value="">All Resources</option>
                        <option value="users">Users</option>
                        <option value="roles">Roles</option>
                        <option value="permissions">Permissions</option>
                        <option value="incidents">Incidents</option>
                        <option value="reports">Reports</option>
                        <option value="auth">Authentication</option>
                    </select>

                    {/* Result */}
                    <select
                        aria-label="Filter by result"
                        value={filters.status}
                        onChange={(event) =>
                            updateFilter("status", event.target.value)
                        }
                        className={`${controlClass} xl:col-span-3`}
                    >
                        <option value="">All Results</option>
                        <option value="success">Successful</option>
                        <option value="failure">Failed</option>
                    </select>

                    {/* From date */}
                    <label className="flex h-9 min-w-0 items-center gap-2 rounded-[5px] border border-[#21415c] bg-[#071827] px-3 focus-within:border-cyan-500/50 sm:col-span-1 xl:col-span-4">
                        <CalendarDays
                            size={15}
                            className="shrink-0 text-white"
                        />
                        <input
                            aria-label="From date"
                            type="date"
                            value={filters.from}
                            max={filters.to || undefined}
                            onChange={(event) =>
                                updateFilter("from", event.target.value)
                            }
                            className="w-full min-w-0 bg-transparent text-[11px] text-white outline-none [color-scheme:dark]"
                        />
                    </label>

                    {/* To date */}
                    <label className="flex h-9 min-w-0 items-center gap-2 rounded-[5px] border border-[#21415c] bg-[#071827] px-3 focus-within:border-cyan-500/50 sm:col-span-1 xl:col-span-4">
                        <CalendarDays
                            size={15}
                            className="shrink-0 text-white"
                        />
                        <input
                            aria-label="To date"
                            type="date"
                            value={filters.to}
                            min={filters.from || undefined}
                            onChange={(event) =>
                                updateFilter("to", event.target.value)
                            }
                            className="w-full min-w-0 bg-transparent text-[11px] text-white outline-none [color-scheme:dark]"
                        />
                    </label>

                    <button
                        type="button"
                        onClick={clearFilters}
                        className={`${buttonClass} w-full xl:col-span-4`}
                    >
                        Clear Filters
                    </button>
                </div>
            </section>

            {/* Activity History */}
            <section className={`${panelClass} w-full min-w-0 overflow-hidden`}>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#173149] px-4 py-3">
                    <div className="flex items-center gap-2">
                        <ShieldCheck
                            size={17}
                            strokeWidth={2}
                            className="text-cyan-300"
                        />
                        <h2 className="text-[13px] font-semibold text-white">
                            Activity History
                        </h2>
                    </div>

                    <span className="text-[10px] text-slate-500">
                        {pagination.total} records
                    </span>
                </div>

                {error && (
                    <div
                        role="alert"
                        className="m-3 rounded-[5px] border border-red-500/30 bg-red-500/[0.07] p-3 text-[11px] text-red-200"
                    >
                        <p>{error}</p>
                        <p className="mt-1 text-[10px] text-red-200/80">
                            Check the backend route and your permission to read
                            audit logs.
                        </p>
                        <button
                            type="button"
                            onClick={fetchLogs}
                            className="mt-2 text-[11px] font-medium text-white underline underline-offset-4"
                        >
                            Try again
                        </button>
                    </div>
                )}

                <div className="w-full min-w-0 overflow-x-auto">
                    <table className="w-full min-w-[780px] border-collapse text-left">
                        <thead>
                            <tr className="border-b border-[#173149] bg-[#071827]">
                                {[
                                    "ACTOR",
                                    "ACTION",
                                    "RESOURCE",
                                    "RESULT",
                                    "IP ADDRESS",
                                    "DATE & TIME",
                                ].map((heading) => (
                                    <th
                                        key={heading}
                                        className="whitespace-nowrap px-4 py-3 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400"
                                    >
                                        {heading}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-[#173149]">
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-4 py-12 text-center text-[11px] text-slate-400"
                                    >
                                        Loading audit logs...
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-12">
                                        <div className="flex flex-col items-center text-center">
                                            <Activity
                                                size={25}
                                                strokeWidth={1.8}
                                                className="mb-3 text-cyan-300"
                                            />
                                            <p className="text-[12px] font-medium text-white">
                                                No audit logs found
                                            </p>
                                            <p className="mt-1 text-[10px] text-slate-500">
                                                No events match the selected
                                                filters.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr
                                        key={log._id}
                                        className="transition hover:bg-white/[0.025]"
                                    >
                                        <td className="px-4 py-3">
                                            <p className="text-[11px] font-medium text-white">
                                                {log.actorName ||
                                                    log.actor?.name ||
                                                    log.actor?.username ||
                                                    "System"}
                                            </p>
                                            <p className="mt-1 text-[10px] text-slate-400">
                                                {log.actorEmail ||
                                                    log.actor?.email ||
                                                    "—"}
                                            </p>
                                        </td>

                                        <td className="px-4 py-3">
                                            <p className="text-[11px] text-white">
                                                {titleCase(log.action)}
                                            </p>
                                            {log.description && (
                                                <p
                                                    title={log.description}
                                                    className="mt-1 max-w-[220px] truncate text-[10px] text-slate-400"
                                                >
                                                    {log.description}
                                                </p>
                                            )}
                                        </td>

                                        <td className="px-4 py-3">
                                            <p className="text-[11px] text-slate-200">
                                                {titleCase(log.resource)}
                                            </p>
                                            {log.resourceId && (
                                                <p className="mt-1 max-w-[140px] truncate text-[10px] text-slate-400">
                                                    ID: {log.resourceId}
                                                </p>
                                            )}
                                        </td>

                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-flex items-center gap-1.5 rounded-[4px] border px-2 py-1 text-[10px] font-medium ${log.status === "failure"
                                                        ? "border-red-400/30 bg-red-400/10 text-red-300"
                                                        : "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                                                    }`}
                                            >
                                                {log.status === "failure" ? (
                                                    <CircleX size={12} />
                                                ) : (
                                                    <CircleCheck size={12} />
                                                )}
                                                {titleCase(
                                                    log.status || "success"
                                                )}
                                            </span>
                                        </td>

                                        <td className="px-4 py-3 text-[11px] text-slate-300">
                                            {log.ipAddress || "—"}
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-3 text-[11px] text-slate-300">
                                            <span className="inline-flex items-center gap-2">
                                                <Clock3
                                                    size={13}
                                                    className="shrink-0 text-white"
                                                />
                                                {formatDate(log.createdAt)}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#173149] px-4 py-3">
                    <p className="text-[10px] text-slate-500">
                        {pagination.total === 0
                            ? "Page 0 of 0"
                            : `Page ${pagination.page} of ${pagination.totalPages}`}
                    </p>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            disabled={loading || page <= 1}
                            onClick={() =>
                                setPage((current) => current - 1)
                            }
                            className={buttonClass}
                        >
                            <ChevronLeft size={14} />
                            Previous
                        </button>

                        <span className="flex h-9 min-w-9 items-center justify-center rounded-[5px] border border-cyan-500/30 bg-cyan-500/10 px-2 text-[11px] text-cyan-300">
                            {pagination.totalPages ? page : 0}
                        </span>

                        <button
                            type="button"
                            disabled={
                                loading ||
                                page >= pagination.totalPages ||
                                pagination.totalPages === 0
                            }
                            onClick={() =>
                                setPage((current) => current + 1)
                            }
                            className={buttonClass}
                        >
                            Next
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default AuditLogs;
