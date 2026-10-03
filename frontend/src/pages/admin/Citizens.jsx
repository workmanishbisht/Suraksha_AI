import { useCallback, useEffect, useState } from "react";
import {
    Search,
    SlidersHorizontal,
    Users,
    UserCheck,
    UserX,
    ShieldCheck,
    MoreHorizontal,
    Eye,
    X,
    Mail,
    MapPin,
    CalendarDays,
    Power,
    Loader2,
} from "lucide-react";
import { toast } from "sonner";

const API_BASE_URL = "http://localhost:5000/api";

function StatCard({ icon: Icon, label, value, description, iconClass }) {
    return (
        <div className="rounded-[6px] border border-[var(--border)] bg-[var(--surface)] p-5">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-[12px] font-medium text-[var(--text-muted)]">
                        {label}
                    </p>
                    <h3 className="mt-2 text-[25px] font-semibold text-[var(--text-primary)]">
                        {value}
                    </h3>
                    <p className="mt-1 text-[10px] text-[var(--text-muted)]">
                        {description}
                    </p>
                </div>
                <div
                    className={`flex h-10 w-10 items-center justify-center rounded-[5px] ${iconClass}`}
                >
                    <Icon size={19} strokeWidth={1.8} />
                </div>
            </div>
        </div>
    );
}

function getInitials(name = "Citizen") {
    return name
        .split(" ")
        .filter(Boolean)
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

function formatDate(date) {
    if (!date) {
        return "Not available";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "Not available";
    }

    return parsedDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function Citizens() {
    const [citizens, setCitizens] = useState([]);
    const [stats, setStats] = useState({
        totalCitizens: 0,
        activeCitizens: 0,
        inactiveCitizens: 0,
        verifiedCitizens: 0,
    });
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [selectedCitizen, setSelectedCitizen] = useState(null);
    const [loading, setLoading] = useState(true);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [statusUpdating, setStatusUpdating] = useState(false);
    const [error, setError] = useState("");
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });

    const fetchStats = useCallback(async () => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/citizens/stats`,
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Unable to fetch citizen statistics"
                );
            }

            setStats({
                totalCitizens: data.stats?.totalCitizens || 0,
                activeCitizens: data.stats?.activeCitizens || 0,
                inactiveCitizens: data.stats?.inactiveCitizens || 0,
                verifiedCitizens: data.stats?.verifiedCitizens || 0,
            });
        } catch (error) {
            console.error("Citizen Stats Error:", error);
        }
    }, []);

    const fetchCitizens = useCallback(
        async (page = 1) => {
            try {
                setLoading(true);
                setError("");

                const params = new URLSearchParams({
                    page: String(page),
                    limit: "10",
                });

                if (search.trim()) {
                    params.set("search", search.trim());
                }

                if (statusFilter !== "All") {
                    params.set("status", statusFilter);
                }

                const response = await fetch(
                    `${API_BASE_URL}/citizens?${params.toString()}`,
                    {
                        method: "GET",
                        credentials: "include",
                    }
                );

                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(
                        data.message || "Unable to fetch citizens"
                    );
                }

                setCitizens(data.citizens || []);
                setPagination(
                    data.pagination || {
                        page: 1,
                        limit: 10,
                        total: 0,
                        totalPages: 0,
                    }
                );
            } catch (error) {
                console.error("Citizens API Error:", error);
                setError(error.message || "Unable to load citizens");
                setCitizens([]);
            } finally {
                setLoading(false);
            }
        },
        [search, statusFilter]
    );

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCitizens(1);
        }, 350);

        return () => clearTimeout(timer);
    }, [fetchCitizens]);

    const handleViewDetails = async (citizen) => {
        try {
            setDetailsLoading(true);
            setSelectedCitizen(citizen);

            const response = await fetch(
                `${API_BASE_URL}/citizens/${citizen.id}`,
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Unable to fetch citizen details"
                );
            }

            setSelectedCitizen(data.citizen);
        } catch (error) {
            console.error("Citizen Details Error:", error);
            toast.error(
                error.message || "Unable to fetch citizen details"
            );
            setSelectedCitizen(null);
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleStatusChange = async () => {
        if (!selectedCitizen || statusUpdating) {
            return;
        }

        const nextStatus = selectedCitizen.status !== "Active";

        try {
            setStatusUpdating(true);

            const response = await fetch(
                `${API_BASE_URL}/citizens/${selectedCitizen.id}/status`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        isActive: nextStatus,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Unable to update citizen status"
                );
            }

            toast.success(data.message);

            setSelectedCitizen((currentCitizen) => ({
                ...currentCitizen,
                status: data.citizen.status,
            }));

            await Promise.all([
                fetchCitizens(pagination.page),
                fetchStats(),
            ]);
        } catch (error) {
            console.error("Citizen Status Error:", error);
            toast.error(
                error.message || "Unable to update citizen status"
            );
        } finally {
            setStatusUpdating(false);
        }
    };

    const handlePageChange = (page) => {
        if (
            page < 1 ||
            page > pagination.totalPages ||
            page === pagination.page
        ) {
            return;
        }

        fetchCitizens(page);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <span className="h-6 w-1 rounded-full bg-cyan-400" />
                        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-400">
                            Citizen Management
                        </span>
                    </div>
                    <h1 className="mt-3 text-[24px] font-semibold tracking-tight text-[var(--text-primary)]">
                        Citizens
                    </h1>
                    <p className="mt-1 text-[12px] text-[var(--text-muted)]">
                        Manage registered citizens and account activity.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        className="flex h-10 items-center gap-2 rounded-[5px] border border-[var(--border)] bg-[var(--surface)] px-4 text-[11px] font-medium text-[var(--text-secondary)] transition hover:border-[var(--border-light)] hover:text-white"
                    >
                        <SlidersHorizontal size={15} />
                        Filters
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    icon={Users}
                    label="Total Citizens"
                    value={stats.totalCitizens}
                    description="Registered citizen accounts"
                    iconClass="bg-blue-500/10 text-blue-400"
                />
                <StatCard
                    icon={UserCheck}
                    label="Active Citizens"
                    value={stats.activeCitizens}
                    description="Currently active accounts"
                    iconClass="bg-emerald-500/10 text-emerald-400"
                />
                <StatCard
                    icon={UserX}
                    label="Inactive Citizens"
                    value={stats.inactiveCitizens}
                    description="Inactive accounts"
                    iconClass="bg-amber-500/10 text-amber-400"
                />
                <StatCard
                    icon={ShieldCheck}
                    label="Verified"
                    value={stats.verifiedCitizens}
                    description="Verified citizen accounts"
                    iconClass="bg-cyan-500/10 text-cyan-400"
                />
            </div>

            <div className="overflow-hidden rounded-[6px] border border-[var(--border)] bg-[var(--surface)]">
                <div className="flex flex-col gap-3 border-b border-[var(--border)] p-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h2 className="text-[14px] font-semibold text-[var(--text-primary)]">
                            Citizen Directory
                        </h2>
                        <p className="mt-1 text-[10px] text-[var(--text-muted)]">
                            {pagination.total} citizens found
                        </p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <div className="relative">
                            <Search
                                size={15}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                            />
                            <input
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search citizens..."
                                className="h-10 w-full rounded-[5px] border border-[var(--border)] bg-[var(--background)] pl-9 pr-3 text-[11px] text-white outline-none placeholder:text-slate-600 focus:border-cyan-500/50 sm:w-[250px]"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(event.target.value)
                            }
                            className="h-10 rounded-[5px] border border-[var(--border)] bg-[var(--background)] px-3 text-[11px] text-[var(--text-secondary)] outline-none focus:border-cyan-500/50"
                        >
                            <option value="All">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px]">
                        <thead>
                            <tr className="border-b border-[var(--border)] bg-[#09111d]">
                                <th className="px-5 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                                    Citizen
                                </th>
                                <th className="px-5 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                                    Contact
                                </th>
                                <th className="px-5 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                                    Location
                                </th>
                                <th className="px-5 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                                    Status
                                </th>
                                <th className="px-5 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                                    Joined
                                </th>
                                <th className="px-5 py-3 text-right text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="h-[220px] text-center"
                                    >
                                        <div className="flex items-center justify-center gap-2 text-[11px] text-[var(--text-muted)]">
                                            <Loader2
                                                size={16}
                                                className="animate-spin text-cyan-400"
                                            />
                                            Loading citizens...
                                        </div>
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="h-[220px] text-center"
                                    >
                                        <div className="flex flex-col items-center justify-center">
                                            <Users
                                                size={28}
                                                className="text-slate-700"
                                            />
                                            <p className="mt-3 text-[12px] font-medium text-red-400">
                                                {error}
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    fetchCitizens(
                                                        pagination.page
                                                    )
                                                }
                                                className="mt-3 rounded-[5px] bg-cyan-500 px-4 py-2 text-[10px] font-medium text-white transition hover:bg-cyan-600"
                                            >
                                                Try Again
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : citizens.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="h-[220px] text-center"
                                    >
                                        <div className="flex flex-col items-center justify-center">
                                            <Users
                                                size={28}
                                                className="text-slate-700"
                                            />
                                            <p className="mt-3 text-[12px] font-medium text-slate-400">
                                                No citizens found
                                            </p>
                                            <p className="mt-1 text-[10px] text-slate-600">
                                                Try changing your search or
                                                filter.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                citizens.map((citizen) => (
                                    <tr
                                        key={citizen.id}
                                        className="border-b border-[var(--border)] transition hover:bg-white/[0.018]"
                                    >
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                {citizen.profileImage ? (
                                                    <img
                                                        src={
                                                            citizen.profileImage
                                                        }
                                                        alt={citizen.name}
                                                        className="h-9 w-9 shrink-0 rounded-[5px] object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[5px] bg-cyan-400/10 text-[11px] font-semibold text-cyan-400">
                                                        {getInitials(
                                                            citizen.name
                                                        )}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-[12px] font-medium text-[var(--text-primary)]">
                                                            {citizen.name}
                                                        </p>
                                                    </div>
                                                    <p className="mt-0.5 text-[9px] text-[var(--text-muted)]">
                                                        {citizen.username}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="text-[10px] text-[var(--text-secondary)]">
                                                {citizen.email}
                                            </p>
                                            <p className="mt-1 text-[9px] text-[var(--text-muted)]">
                                                Contact not available
                                            </p>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2 text-[10px] text-[var(--text-secondary)]">
                                                <MapPin
                                                    size={13}
                                                    className="text-[var(--text-muted)]"
                                                />
                                                {citizen.location ||
                                                    "Not available"}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-1 text-[9px] font-medium ${citizen.status === "Active"
                                                        ? "bg-emerald-400/10 text-emerald-400"
                                                        : "bg-slate-500/10 text-slate-400"
                                                    }`}
                                            >
                                                {citizen.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-[10px] text-[var(--text-muted)]">
                                            {formatDate(citizen.joined)}
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleViewDetails(citizen)
                                                }
                                                className="inline-flex h-8 w-8 items-center justify-center rounded-[5px] text-slate-500 transition hover:bg-white/[0.04] hover:text-cyan-400"
                                            >
                                                <MoreHorizontal size={17} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {!loading &&
                    !error &&
                    pagination.totalPages > 0 && (
                        <div className="flex items-center justify-between border-t border-[var(--border)] px-5 py-3">
                            <p className="text-[10px] text-[var(--text-muted)]">
                                Page {pagination.page} of{" "}
                                {pagination.totalPages}
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    disabled={pagination.page === 1}
                                    onClick={() =>
                                        handlePageChange(
                                            pagination.page - 1
                                        )
                                    }
                                    className="rounded-[5px] border border-[var(--border)] px-3 py-1.5 text-[10px] text-[var(--text-secondary)] transition hover:border-[var(--border-light)] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Previous
                                </button>
                                <button
                                    type="button"
                                    disabled={
                                        pagination.page ===
                                        pagination.totalPages
                                    }
                                    onClick={() =>
                                        handlePageChange(
                                            pagination.page + 1
                                        )
                                    }
                                    className="rounded-[5px] border border-[var(--border)] px-3 py-1.5 text-[10px] text-[var(--text-secondary)] transition hover:border-[var(--border-light)] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
            </div>

            {selectedCitizen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]">
                    <div className="w-full max-w-[480px] overflow-hidden rounded-[6px] border border-[var(--border)] bg-[var(--surface)]">
                        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
                            <div>
                                <h3 className="text-[14px] font-semibold text-white">
                                    Citizen Details
                                </h3>
                                <p className="mt-1 text-[9px] text-slate-500">
                                    {selectedCitizen.id}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedCitizen(null)}
                                className="flex h-8 w-8 items-center justify-center rounded-[5px] text-slate-500 transition hover:bg-white/[0.04] hover:text-white"
                            >
                                <X size={17} />
                            </button>
                        </div>

                        <div className="p-5">
                            {detailsLoading ? (
                                <div className="flex min-h-[280px] items-center justify-center">
                                    <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
                                        <Loader2
                                            size={17}
                                            className="animate-spin text-cyan-400"
                                        />
                                        Loading citizen details...
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-4 border-b border-[var(--border)] pb-5">
                                        {selectedCitizen.profileImage ? (
                                            <img
                                                src={
                                                    selectedCitizen.profileImage
                                                }
                                                alt={selectedCitizen.name}
                                                className="h-14 w-14 rounded-[6px] object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-14 w-14 items-center justify-center rounded-[6px] bg-cyan-400/10 text-[15px] font-semibold text-cyan-400">
                                                {getInitials(
                                                    selectedCitizen.name
                                                )}
                                            </div>
                                        )}
                                        <div>
                                            <h4 className="text-[15px] font-semibold text-white">
                                                {selectedCitizen.name}
                                            </h4>
                                            <p className="mt-1 text-[10px] text-slate-500">
                                                @{selectedCitizen.username}
                                            </p>
                                            <span
                                                className={`mt-1.5 inline-flex rounded-full px-2.5 py-1 text-[9px] font-medium ${selectedCitizen.status ===
                                                        "Active"
                                                        ? "bg-emerald-400/10 text-emerald-400"
                                                        : "bg-slate-500/10 text-slate-400"
                                                    }`}
                                            >
                                                {selectedCitizen.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-5 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <Mail
                                                size={16}
                                                className="text-slate-500"
                                            />
                                            <div>
                                                <p className="text-[9px] text-slate-600">
                                                    Email
                                                </p>
                                                <p className="mt-0.5 text-[11px] text-slate-300">
                                                    {selectedCitizen.email}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <MapPin
                                                size={16}
                                                className="text-slate-500"
                                            />
                                            <div>
                                                <p className="text-[9px] text-slate-600">
                                                    Location
                                                </p>
                                                <p className="mt-0.5 text-[11px] text-slate-300">
                                                    {selectedCitizen.location ||
                                                        "Not available"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <CalendarDays
                                                size={16}
                                                className="text-slate-500"
                                            />
                                            <div>
                                                <p className="text-[9px] text-slate-600">
                                                    Joined
                                                </p>
                                                <p className="mt-0.5 text-[11px] text-slate-300">
                                                    {formatDate(
                                                        selectedCitizen.createdAt
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {!detailsLoading && (
                            <div className="flex items-center justify-between border-t border-[var(--border)] px-5 py-4">
                                <button
                                    type="button"
                                    onClick={handleStatusChange}
                                    disabled={statusUpdating}
                                    className={`flex h-9 items-center gap-2 rounded-[5px] px-4 text-[10px] font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${selectedCitizen.status === "Active"
                                            ? "border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/15"
                                            : "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/15"
                                        }`}
                                >
                                    {statusUpdating ? (
                                        <Loader2
                                            size={14}
                                            className="animate-spin"
                                        />
                                    ) : (
                                        <Power size={14} />
                                    )}
                                    {selectedCitizen.status === "Active"
                                        ? "Deactivate"
                                        : "Activate"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setSelectedCitizen(null)}
                                    className="flex h-9 items-center gap-2 rounded-[5px] bg-cyan-500 px-4 text-[10px] font-medium text-white transition hover:bg-cyan-600"
                                >
                                    <Eye size={14} />
                                    Close Details
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Citizens;