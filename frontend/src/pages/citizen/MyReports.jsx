import { useMemo, useState } from "react";
import {
    AlertTriangle,
    CalendarDays,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock3,
    Eye,
    FileText,
    MapPin,
    Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const reportsData = [
    {
        id: "INC-10482",
        title: "Road Accident",
        type: "Accident",
        location: "Rajpur Road, Dehradun",
        date: "20 Sep 2026",
        time: "09:42 AM",
        severity: "High",
        status: "Under Review",
        description:
            "Vehicle collision reported near the main road intersection.",
    },
    {
        id: "INC-10476",
        title: "Heavy Waterlogging",
        type: "Flood",
        location: "Clock Tower, Dehradun",
        date: "18 Sep 2026",
        time: "06:15 PM",
        severity: "Medium",
        status: "Resolved",
        description:
            "Heavy waterlogging affecting traffic movement in the area.",
    },
    {
        id: "INC-10451",
        title: "Street Fire",
        type: "Fire",
        location: "Patel Nagar, Dehradun",
        date: "15 Sep 2026",
        time: "02:28 PM",
        severity: "Critical",
        status: "Resolved",
        description:
            "Fire incident reported near a residential building.",
    },
    {
        id: "INC-10432",
        title: "Blocked Road",
        type: "Other",
        location: "Sahastradhara Road, Dehradun",
        date: "12 Sep 2026",
        time: "11:20 AM",
        severity: "Low",
        status: "Under Review",
        description:
            "Road access partially blocked due to fallen debris.",
    },
    {
        id: "INC-10398",
        title: "Medical Emergency",
        type: "Medical",
        location: "Prem Nagar, Dehradun",
        date: "09 Sep 2026",
        time: "08:35 PM",
        severity: "High",
        status: "Resolved",
        description:
            "Medical emergency reported near the local market.",
    },
];

const statusConfig = {
    "Under Review": {
        className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        icon: Clock3,
    },
    Resolved: {
        className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        icon: CheckCircle2,
    },
    Pending: {
        className: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        icon: Clock3,
    },
};

const severityConfig = {
    Critical: "bg-red-500/10 text-red-400 border-red-500/20",
    High: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    Medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    Low: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

function MyReports() {
    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedReport, setSelectedReport] = useState(null);

    const reportsPerPage = 4;

    const filteredReports = useMemo(() => {
        return reportsData.filter((report) => {
            const searchValue = search.toLowerCase().trim();

            const matchesSearch =
                !searchValue ||
                report.id.toLowerCase().includes(searchValue) ||
                report.title.toLowerCase().includes(searchValue) ||
                report.location.toLowerCase().includes(searchValue);

            const matchesStatus =
                statusFilter === "All" ||
                report.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [search, statusFilter]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredReports.length / reportsPerPage)
    );

    const visibleReports = filteredReports.slice(
        (currentPage - 1) * reportsPerPage,
        currentPage * reportsPerPage
    );

    const handleSearch = (value) => {
        setSearch(value);
        setCurrentPage(1);
    };

    const handleStatus = (value) => {
        setStatusFilter(value);
        setCurrentPage(1);
    };

    return (
        <div className="space-y-5">

            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-400">
                        <FileText size={15} />
                        Incident History
                    </div>

                    <h1 className="text-2xl font-semibold text-white">
                        My Reports
                    </h1>

                    <p className="mt-1 text-sm text-slate-400">
                        Track and manage the incidents you have reported.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => navigate("/citizen/report-incident")}
                    className="inline-flex items-center justify-center gap-2 rounded-[5px] bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                >
                    <AlertTriangle size={17} />
                    Report Incident
                </button>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                <div className="rounded-[6px] border border-[var(--border)] bg-[var(--surface)] p-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-400">
                            Total Reports
                        </p>

                        <FileText
                            size={19}
                            className="text-cyan-400"
                        />
                    </div>

                    <p className="mt-3 text-2xl font-semibold text-white">
                        12
                    </p>
                </div>

                <div className="rounded-[6px] border border-[var(--border)] bg-[var(--surface)] p-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-400">
                            Under Review
                        </p>

                        <Clock3
                            size={19}
                            className="text-amber-400"
                        />
                    </div>

                    <p className="mt-3 text-2xl font-semibold text-white">
                        03
                    </p>
                </div>

                <div className="rounded-[6px] border border-[var(--border)] bg-[var(--surface)] p-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-400">
                            Resolved
                        </p>

                        <CheckCircle2
                            size={19}
                            className="text-emerald-400"
                        />
                    </div>

                    <p className="mt-3 text-2xl font-semibold text-white">
                        09
                    </p>
                </div>

            </div>

            {/* Reports Card */}
            <div className="overflow-hidden rounded-[6px] border border-[var(--border)] bg-[var(--surface)]">

                {/* Toolbar */}
                <div className="flex flex-col gap-3 border-b border-[var(--border)] p-4 lg:flex-row lg:items-center lg:justify-between">

                    <div className="relative w-full lg:max-w-md">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="Search reports, ID or location..."
                            className="w-full rounded-[5px] border border-slate-700 bg-[#091522] py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-cyan-500"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        {["All", "Under Review", "Resolved"].map((status) => (
                            <button
                                key={status}
                                type="button"
                                onClick={() => handleStatus(status)}
                                className={`rounded-[5px] px-3 py-2 text-xs font-medium transition ${statusFilter === status
                                        ? "bg-cyan-500 text-slate-950"
                                        : "border border-slate-700 bg-[#091522] text-slate-400 hover:text-white"
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Desktop Table */}
                <div className="hidden overflow-x-auto md:block">
                    <table className="w-full min-w-[850px]">
                        <thead>
                            <tr className="border-b border-[var(--border)] bg-[#091522] text-left">
                                <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                                    Report
                                </th>

                                <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                                    Location
                                </th>

                                <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                                    Date
                                </th>

                                <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                                    Severity
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
                            {visibleReports.map((report) => {
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
                                                        #{report.id}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                                <MapPin size={14} />
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
                                                className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${severityConfig[
                                                    report.severity
                                                    ]
                                                    }`}
                                            >
                                                {report.severity}
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
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="divide-y divide-[var(--border)] md:hidden">
                    {visibleReports.map((report) => {
                        const status =
                            statusConfig[report.status] ||
                            statusConfig.Pending;

                        const StatusIcon = status.icon;

                        return (
                            <div
                                key={report.id}
                                className="space-y-4 p-4"
                            >
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
                                        className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-medium ${severityConfig[
                                            report.severity
                                            ]
                                            }`}
                                    >
                                        {report.severity}
                                    </span>
                                </div>

                                <div className="space-y-2 text-xs text-slate-500">
                                    <div className="flex items-center gap-2">
                                        <MapPin size={14} />
                                        {report.location}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <CalendarDays size={14} />
                                        {report.date} • {report.time}
                                    </div>
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
                                        onClick={() => setSelectedReport(report)}
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

                {/* Empty State */}
                {visibleReports.length === 0 && (
                    <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-[5px] bg-slate-800">
                            <FileText
                                size={22}
                                className="text-slate-500"
                            />
                        </div>

                        <h3 className="text-sm font-semibold text-slate-300">
                            No reports found
                        </h3>

                        <p className="mt-1 text-xs text-slate-600">
                            Try changing your search or filter.
                        </p>
                    </div>
                )}

                {/* Pagination */}
                {visibleReports.length > 0 && (
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

            {/* Report Details Modal */}
            {selectedReport && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
                    onClick={() => setSelectedReport(null)}
                >
                    <div
                        className="w-full max-w-2xl overflow-hidden rounded-[6px] border border-[var(--border-light)] bg-[#071827]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between border-b border-[var(--border)] px-5 py-4">
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-400">
                                    Incident Details
                                </p>
                                <h2 className="mt-1 text-xl font-semibold text-white">
                                    {selectedReport.title}
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={() => setSelectedReport(null)}
                                className="flex h-9 w-9 items-center justify-center rounded-[5px] border border-[var(--border)] text-slate-400 transition hover:bg-white/5 hover:text-white"
                                aria-label="Close"
                            >
                                ×
                            </button>
                        </div>

                        <div className="space-y-5 p-5">
                            <div className="flex flex-wrap items-center gap-2">
                                <span
                                    className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${severityConfig[selectedReport.severity]
                                        }`}
                                >
                                    {selectedReport.severity}
                                </span>

                                {(() => {
                                    const modalStatus =
                                        statusConfig[selectedReport.status] ||
                                        statusConfig.Pending;
                                    const ModalStatusIcon = modalStatus.icon;

                                    return (
                                        <span
                                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${modalStatus.className}`}
                                        >
                                            <ModalStatusIcon size={13} />
                                            {selectedReport.status}
                                        </span>
                                    );
                                })()}

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
                                        Location
                                    </p>
                                    <div className="mt-2 flex items-start gap-2 text-sm text-slate-300">
                                        <MapPin
                                            size={15}
                                            className="mt-0.5 shrink-0 text-cyan-400"
                                        />
                                        <span>{selectedReport.location}</span>
                                    </div>
                                </div>

                                <div className="rounded-[5px] border border-[var(--border)] bg-[#091522] p-4">
                                    <p className="text-[10px] uppercase tracking-wide text-slate-600">
                                        Reported
                                    </p>
                                    <div className="mt-2 flex items-start gap-2 text-sm text-slate-300">
                                        <CalendarDays
                                            size={15}
                                            className="mt-0.5 shrink-0 text-cyan-400"
                                        />
                                        <span>
                                            {selectedReport.date}
                                            <span className="block text-xs text-slate-500">
                                                {selectedReport.time}
                                            </span>
                                        </span>
                                    </div>
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

export default MyReports;