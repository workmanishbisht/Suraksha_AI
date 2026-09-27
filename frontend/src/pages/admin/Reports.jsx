import { useEffect, useMemo, useState } from "react";
import {
    AlertTriangle,
    CalendarDays,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock3,
    Download,
    Eye,
    FileText,
    Filter,
    Search,
    X,
} from "lucide-react";

const API_BASE_URL = "http://localhost:5000/api";

const statusConfig = {
    "Under Review": {
        className: "border-amber-500/20 bg-amber-500/10 text-amber-400",
        icon: Clock3,
    },
    Pending: {
        className: "border-blue-500/20 bg-blue-500/10 text-blue-400",
        icon: Clock3,
    },
    Resolved: {
        className:
            "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
        icon: CheckCircle2,
    },
    Rejected: {
        className: "border-red-500/20 bg-red-500/10 text-red-400",
        icon: AlertTriangle,
    },
};

const priorityConfig = {
    Critical: "border-red-500/20 bg-red-500/10 text-red-400",
    High: "border-orange-500/20 bg-orange-500/10 text-orange-400",
    Medium: "border-amber-500/20 bg-amber-500/10 text-amber-400",
    Low: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
};

function Reports() {
    const [reportsData, setReportsData] = useState([]);
    const [reportStats, setReportStats] = useState({
        totalReports: 0,
        pendingReports: 0,
        underReviewReports: 0,
        resolvedReports: 0,
    });
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [typeFilter, setTypeFilter] = useState("All Types");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedReport, setSelectedReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const reportsPerPage = 5;

    const formatLabel = (value = "") =>
        value
            .replace(/_/g, " ")
            .replace(/\b\w/g, (letter) => letter.toUpperCase());

    const formatDate = (value) => {
        if (!value) return "—";

        return new Date(value).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const formatTime = (value) => {
        if (!value) return "—";

        return new Date(value).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const normalizeReport = (report) => {
        const statusMap = {
            reported: "Pending",
            investigating: "Under Review",
            responding: "Under Review",
            resolved: "Resolved",
            rejected: "Rejected",
        };

        const location = report.location || {};

        return {
            ...report,
            id:
                report.id ||
                `INC-${new Date(report.createdAt).getFullYear()}-${String(
                    report._id
                ).slice(-4).toUpperCase()}`,
            title: report.title || "Untitled Report",
            type: formatLabel(report.type || "incident"),
            submittedBy:
                report.reportedBy?.name ||
                report.reportedBy?.username ||
                "Unknown User",
            location:
                location.address ||
                [location.city, location.state]
                    .filter(Boolean)
                    .join(", ") ||
                "Location not available",
            date: formatDate(report.createdAt),
            time: formatTime(report.createdAt),
            status: statusMap[report.status] || "Pending",
            priority: formatLabel(report.severity || "medium"),
            description:
                report.description || "No description available.",
        };
    };

    const fetchReports = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `${API_BASE_URL}/reports?limit=100`,
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.message || "Failed to fetch reports."
                );
            }

            const reports = Array.isArray(data?.reports)
                ? data.reports.map(normalizeReport)
                : [];

            setReportsData(reports);
        } catch (error) {
            console.error("Fetch Reports Error:", error);
            setError(error.message || "Failed to load reports.");
            setReportsData([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchReportStats = async () => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/reports/stats`,
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.message || "Failed to fetch report statistics."
                );
            }

            setReportStats(
                data?.stats || {
                    totalReports: 0,
                    pendingReports: 0,
                    underReviewReports: 0,
                    resolvedReports: 0,
                }
            );
        } catch (error) {
            console.error("Fetch Report Stats Error:", error);
        }
    };

    useEffect(() => {
        fetchReports();
        fetchReportStats();
    }, []);

    const filteredReports = useMemo(() => {
        const searchValue = search.toLowerCase().trim();

        return reportsData.filter((report) => {
            const matchesSearch =
                !searchValue ||
                report.id.toLowerCase().includes(searchValue) ||
                report.title.toLowerCase().includes(searchValue) ||
                report.submittedBy.toLowerCase().includes(searchValue) ||
                report.location.toLowerCase().includes(searchValue);

            const matchesStatus =
                statusFilter === "All Status" ||
                report.status === statusFilter;

            const matchesType =
                typeFilter === "All Types" || report.type === typeFilter;

            return matchesSearch && matchesStatus && matchesType;
        });
    }, [reportsData, search, statusFilter, typeFilter]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredReports.length / reportsPerPage)
    );

    const visibleReports = filteredReports.slice(
        (currentPage - 1) * reportsPerPage,
        currentPage * reportsPerPage
    );

    const reportTypes = [
        ...new Set(reportsData.map((report) => report.type)),
    ];

    const totalReports = reportStats.totalReports;
    const pendingReports = reportStats.pendingReports;
    const reviewReports = reportStats.underReviewReports;
    const resolvedReports = reportStats.resolvedReports;

    const handleSearch = (value) => {
        setSearch(value);
        setCurrentPage(1);
    };

    const handleStatusFilter = (value) => {
        setStatusFilter(value);
        setCurrentPage(1);
    };

    const handleTypeFilter = (value) => {
        setTypeFilter(value);
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setSearch("");
        setStatusFilter("All Status");
        setTypeFilter("All Types");
        setCurrentPage(1);
    };

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-400">
                        <FileText size={15} />
                        Report Management
                    </div>

                    <h1 className="text-2xl font-semibold text-white">
                        Reports
                    </h1>

                    <p className="mt-1 text-sm text-slate-400">
                        Review, monitor and manage submitted reports.
                    </p>
                </div>

                <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 rounded-[5px] border border-slate-700 bg-[#091522] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-cyan-500/40 hover:text-cyan-400"
                >
                    <Download size={16} />
                    Export Reports
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-[6px] border border-[var(--border)] bg-[var(--surface)] p-4">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                            Total Reports
                        </p>
                        <FileText size={19} className="text-cyan-400" />
                    </div>
                    <p className="mt-3 text-2xl font-semibold text-white">
                        {totalReports}
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                        All submitted reports
                    </p>
                </div>

                <div className="rounded-[6px] border border-[var(--border)] bg-[var(--surface)] p-4">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                            Under Review
                        </p>
                        <Clock3 size={19} className="text-amber-400" />
                    </div>
                    <p className="mt-3 text-2xl font-semibold text-white">
                        {reviewReports}
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                        Reports being reviewed
                    </p>
                </div>

                <div className="rounded-[6px] border border-[var(--border)] bg-[var(--surface)] p-4">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                            Pending
                        </p>
                        <AlertTriangle size={19} className="text-blue-400" />
                    </div>
                    <p className="mt-3 text-2xl font-semibold text-white">
                        {pendingReports}
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                        Awaiting action
                    </p>
                </div>

                <div className="rounded-[6px] border border-[var(--border)] bg-[var(--surface)] p-4">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                            Resolved
                        </p>
                        <CheckCircle2
                            size={19}
                            className="text-emerald-400"
                        />
                    </div>
                    <p className="mt-3 text-2xl font-semibold text-white">
                        {resolvedReports}
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                        Completed reports
                    </p>
                </div>
            </div>

            {/* Reports Table */}
            <div className="overflow-hidden rounded-[6px] border border-[var(--border)] bg-[var(--surface)]">
                {error && (
                    <div className="border-b border-red-500/20 bg-red-500/5 px-4 py-3 text-xs text-red-400">
                        {error}
                    </div>
                )}
                <div className="flex flex-col gap-3 border-b border-[var(--border)] p-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="relative w-full xl:max-w-md">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="Search reports, ID, user or location..."
                            className="w-full rounded-[5px] border border-slate-700 bg-[#091522] py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-cyan-500"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative">
                            <Filter
                                size={15}
                                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                            />
                            <select
                                value={statusFilter}
                                onChange={(e) =>
                                    handleStatusFilter(e.target.value)
                                }
                                className="h-10 appearance-none rounded-[5px] border border-slate-700 bg-[#091522] pl-9 pr-8 text-sm text-slate-300 outline-none focus:border-cyan-500"
                            >
                                <option>All Status</option>
                                <option>Pending</option>
                                <option>Under Review</option>
                                <option>Resolved</option>
                                <option>Rejected</option>
                            </select>
                        </div>

                        <select
                            value={typeFilter}
                            onChange={(e) =>
                                handleTypeFilter(e.target.value)
                            }
                            className="h-10 rounded-[5px] border border-slate-700 bg-[#091522] px-3 text-sm text-slate-300 outline-none focus:border-cyan-500"
                        >
                            <option>All Types</option>
                            <option>Incident Report</option>
                            <option>Infrastructure</option>
                            <option>Emergency</option>
                        </select>

                        {(search ||
                            statusFilter !== "All Status" ||
                            typeFilter !== "All Types") && (
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="inline-flex h-10 items-center gap-1.5 rounded-[5px] border border-slate-700 px-3 text-xs font-medium text-slate-400 transition hover:border-red-500/30 hover:text-red-400"
                                >
                                    <X size={14} />
                                    Clear
                                </button>
                            )}
                    </div>
                </div>

                <div className="hidden overflow-x-auto md:block">
                    <table className="w-full min-w-[1050px]">
                        <thead>
                            <tr className="border-b border-[var(--border)] bg-[#091522] text-left">
                                <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                                    Report
                                </th>
                                <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                                    Submitted By
                                </th>
                                <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                                    Location
                                </th>
                                <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                                    Date
                                </th>
                                <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                                    Priority
                                </th>
                                <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                                    Status
                                </th>
                                <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">
                                    Action
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-5 py-16 text-center text-sm text-slate-500"
                                    >
                                        Loading reports...
                                    </td>
                                </tr>
                            ) : (
                                visibleReports.map((report) => {
                                    const status =
                                        statusConfig[report.status] ||
                                        statusConfig.Pending;
                                    const StatusIcon = status.icon;

                                    return (
                                        <tr
                                            key={report.id}
                                            className="border-b border-[var(--border)] last:border-b-0 transition hover:bg-white/[0.015]"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[5px] bg-cyan-500/10">
                                                        <FileText
                                                            size={17}
                                                            className="text-cyan-400"
                                                        />
                                                    </div>

                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-200">
                                                            {report.title}
                                                        </p>
                                                        <p className="mt-0.5 text-xs text-slate-600">
                                                            #{report.id} •{" "}
                                                            {report.type}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4 text-sm text-slate-400">
                                                {report.submittedBy}
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                                    <AlertTriangle size={14} />
                                                    {report.location}
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                                    <CalendarDays size={14} />
                                                    <div>
                                                        <p>{report.date}</p>
                                                        <p className="text-slate-600">
                                                            {report.time}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${priorityConfig[report.priority]}`}
                                                >
                                                    {report.priority}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${status.className}`}
                                                >
                                                    <StatusIcon size={13} />
                                                    {report.status}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setSelectedReport(report)
                                                    }
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-[4px] text-slate-500 transition hover:bg-cyan-500/10 hover:text-cyan-400"
                                                    title="View Report"
                                                >
                                                    <Eye size={17} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile */}
                <div className="divide-y divide-[var(--border)] md:hidden">
                    {visibleReports.map((report) => {
                        const status =
                            statusConfig[report.status] ||
                            statusConfig.Pending;
                        const StatusIcon = status.icon;

                        return (
                            <div key={report.id} className="space-y-4 p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex gap-3">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[5px] bg-cyan-500/10">
                                            <FileText
                                                size={17}
                                                className="text-cyan-400"
                                            />
                                        </div>

                                        <div>
                                            <p className="text-sm font-semibold text-slate-200">
                                                {report.title}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-600">
                                                #{report.id}
                                            </p>
                                        </div>
                                    </div>

                                    <span
                                        className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-medium ${priorityConfig[report.priority]}`}
                                    >
                                        {report.priority}
                                    </span>
                                </div>

                                <div className="space-y-2 text-xs text-slate-500">
                                    <p>{report.submittedBy}</p>
                                    <p>{report.location}</p>
                                    <p>
                                        {report.date} • {report.time}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span
                                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${status.className}`}
                                    >
                                        <StatusIcon size={13} />
                                        {report.status}
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSelectedReport(report)
                                        }
                                        className="inline-flex items-center gap-1.5 text-xs font-medium text-cyan-400"
                                    >
                                        View
                                        <Eye size={14} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {!loading && visibleReports.length === 0 && (
                    <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-[5px] bg-slate-800">
                            <Search size={22} className="text-slate-500" />
                        </div>
                        <h3 className="text-sm font-semibold text-slate-300">
                            No reports found
                        </h3>
                        <p className="mt-1 text-xs text-slate-600">
                            Try changing your search or filter criteria.
                        </p>
                    </div>
                )}

                {!loading && visibleReports.length > 0 && (
                    <div className="flex items-center justify-between border-t border-[var(--border)] px-4 py-3">
                        <p className="text-xs text-slate-600">
                            Showing{" "}
                            <span className="text-slate-400">
                                {(currentPage - 1) * reportsPerPage + 1}
                            </span>
                            {" - "}
                            <span className="text-slate-400">
                                {Math.min(
                                    currentPage * reportsPerPage,
                                    filteredReports.length
                                )}
                            </span>{" "}
                            of{" "}
                            <span className="text-slate-400">
                                {filteredReports.length}
                            </span>
                        </p>

                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                disabled={currentPage === 1}
                                onClick={() =>
                                    setCurrentPage((page) =>
                                        Math.max(1, page - 1)
                                    )
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-[4px] border border-slate-700 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <ChevronLeft size={16} />
                            </button>

                            <div className="flex h-8 min-w-8 items-center justify-center rounded-[4px] bg-cyan-500 px-2 text-xs font-semibold text-slate-950">
                                {currentPage}
                            </div>

                            <button
                                type="button"
                                disabled={currentPage >= totalPages}
                                onClick={() =>
                                    setCurrentPage((page) =>
                                        Math.min(totalPages, page + 1)
                                    )
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-[4px] border border-slate-700 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Details Modal */}
            {selectedReport && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
                    onClick={() => setSelectedReport(null)}
                >
                    <div
                        className="w-full max-w-2xl overflow-hidden rounded-[6px] border border-slate-700 bg-[#071827]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between border-b border-[var(--border)] px-5 py-4">
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-400">
                                    Report Details
                                </p>
                                <h2 className="mt-1 text-xl font-semibold text-white">
                                    {selectedReport.title}
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={() => setSelectedReport(null)}
                                className="flex h-9 w-9 items-center justify-center rounded-[5px] border border-slate-700 text-slate-400 transition hover:bg-white/5 hover:text-white"
                            >
                                <X size={17} />
                            </button>
                        </div>

                        <div className="space-y-5 p-5">
                            <div className="flex flex-wrap gap-2">
                                <span
                                    className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${priorityConfig[selectedReport.priority]}`}
                                >
                                    {selectedReport.priority}
                                </span>

                                <span
                                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${(
                                            statusConfig[
                                            selectedReport.status
                                            ] || statusConfig.Pending
                                        ).className
                                        }`}
                                >
                                    {(() => {
                                        const StatusIcon =
                                            (
                                                statusConfig[
                                                selectedReport.status
                                                ] || statusConfig.Pending
                                            ).icon;
                                        return <StatusIcon size={13} />;
                                    })()}
                                    {selectedReport.status}
                                </span>

                                <span className="rounded-[5px] bg-white/[0.03] px-2.5 py-1 text-[11px] text-slate-500">
                                    #{selectedReport.id}
                                </span>
                            </div>

                            <div>
                                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                                    Description
                                </p>
                                <p className="text-sm leading-6 text-slate-300">
                                    {selectedReport.description}
                                </p>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="rounded-[5px] border border-[var(--border)] bg-[#091522] p-4">
                                    <p className="text-[10px] uppercase tracking-wide text-slate-600">
                                        Submitted By
                                    </p>
                                    <p className="mt-2 text-sm text-slate-300">
                                        {selectedReport.submittedBy}
                                    </p>
                                </div>

                                <div className="rounded-[5px] border border-[var(--border)] bg-[#091522] p-4">
                                    <p className="text-[10px] uppercase tracking-wide text-slate-600">
                                        Report Type
                                    </p>
                                    <p className="mt-2 text-sm text-slate-300">
                                        {selectedReport.type}
                                    </p>
                                </div>

                                <div className="rounded-[5px] border border-[var(--border)] bg-[#091522] p-4">
                                    <p className="text-[10px] uppercase tracking-wide text-slate-600">
                                        Location
                                    </p>
                                    <p className="mt-2 text-sm text-slate-300">
                                        {selectedReport.location}
                                    </p>
                                </div>

                                <div className="rounded-[5px] border border-[var(--border)] bg-[#091522] p-4">
                                    <p className="text-[10px] uppercase tracking-wide text-slate-600">
                                        Reported
                                    </p>
                                    <p className="mt-2 text-sm text-slate-300">
                                        {selectedReport.date}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {selectedReport.time}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end border-t border-[var(--border)] px-5 py-4">
                            <button
                                type="button"
                                onClick={() => setSelectedReport(null)}
                                className="rounded-[5px] bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Reports;
