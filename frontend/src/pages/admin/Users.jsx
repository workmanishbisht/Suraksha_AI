import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Search,
    Users as UsersIcon,
    UserCheck,
    UserX,
    ShieldCheck,
    MoreHorizontal,
    Eye,
    X,
    Mail,
    CalendarDays,
    RefreshCw,
    SlidersHorizontal,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    UserRound,
    Trash2,
} from "lucide-react";
import { toast } from "sonner";

const API_BASE_URL = "http://localhost:5000/api";

const ROLE_LABELS = {
    admin: "Admin",
    citizen: "Citizen",
    field_officer: "Field Officer",
    department_officer: "Department Officer",
};

const ROLE_OPTIONS = [
    { label: "All Roles", value: "All" },
    { label: "Admin", value: "Admin" },
    { label: "Citizen", value: "Citizen" },
    { label: "Field Officer", value: "Field Officer" },
    { label: "Department Officer", value: "Department Officer" },
];

const EDITABLE_ROLE_OPTIONS = [
    { label: "Citizen", value: "citizen" },
    { label: "Field Officer", value: "field_officer" },
    { label: "Department Officer", value: "department_officer" },
];

const STATUS_OPTIONS = [
    { label: "All Status", value: "All" },
    { label: "Active", value: "Active" },
    { label: "Inactive", value: "Inactive" },
];

const panelClass =
    "rounded-[6px] border border-[#173149] bg-[#091a2a]";

const inputClass =
    "h-10 rounded-[5px] border border-[#21415c] bg-[#071827] px-3 text-[12px] text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-cyan-500/50";

function formatDate(value) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function getRoleLabel(role) {
    return ROLE_LABELS[role] || role || "Unknown";
}

function getInitials(name) {
    return (
        name
            ?.trim()
            .split(/\s+/)
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "U"
    );
}

function UserAvatar({ user, large = false }) {
    const sizeClass = large
        ? "h-12 w-12 text-sm"
        : "h-9 w-9 text-[11px]";

    if (user?.profileImage) {
        return (
            <img
                src={user.profileImage}
                alt={user.name || "User"}
                className={`${sizeClass} shrink-0 rounded-[5px] object-cover`}
            />
        );
    }

    return (
        <div
            className={`${sizeClass} flex shrink-0 items-center justify-center rounded-[5px] border border-[#21415c] bg-[#10263a] font-semibold text-cyan-400`}
        >
            {getInitials(user?.name)}
        </div>
    );
}

function StatusBadge({ status }) {
    const active = status === "Active";

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-[4px] border px-2 py-1 text-[10px] font-medium ${active
                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                    : "border-red-500/20 bg-red-500/10 text-red-400"
                }`}
        >
            <span
                className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-400" : "bg-red-400"
                    }`}
            />
            {status}
        </span>
    );
}

function RoleBadge({ role }) {
    const styles = {
        Admin: "border-cyan-500/20 bg-cyan-500/10 text-cyan-400",
        Citizen: "border-blue-500/20 bg-blue-500/10 text-blue-400",
        "Field Officer":
            "border-amber-500/20 bg-amber-500/10 text-amber-400",
        "Department Officer":
            "border-purple-500/20 bg-purple-500/10 text-purple-400",
    };

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-[4px] border px-2 py-1 text-[10px] font-medium ${styles[role] || styles.Citizen
                }`}
        >
            <ShieldCheck size={11} />
            {role}
        </span>
    );
}

function StatCard({
    label,
    value,
    description,
    icon: Icon,
    color,
}) {
    return (
        <div className="group rounded-[6px] border border-[#173149] bg-[#091a2a] p-4 transition-colors hover:border-[#28506d]">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                        {label}
                    </p>

                    <h3 className="mt-2 text-[24px] font-semibold leading-none text-white">
                        {value}
                    </h3>

                    <p className="mt-2 text-[10px] text-slate-500">
                        {description}
                    </p>
                </div>

                <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[5px] border ${color}`}
                >
                    <Icon size={16} />
                </div>
            </div>
        </div>
    );
}

function LoadingRows() {
    return Array.from({ length: 5 }, (_, index) => (
        <tr key={index} className="border-b border-[#173149]">
            <td colSpan={6} className="px-4 py-3">
                <div className="h-10 animate-pulse rounded-[4px] bg-[#0d2234]" />
            </td>
        </tr>
    ));
}

function UserDetailsModal({ user, onClose }) {
    if (!user) return null;

    const status =
        user.status || (user.isActive ? "Active" : "Inactive");

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <div className="w-full max-w-[480px] overflow-hidden rounded-[6px] border border-[#21415c] bg-[#081522] shadow-2xl">
                <div className="flex items-center justify-between border-b border-[#173149] px-4 py-3">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-cyan-400">
                            USER DETAILS
                        </p>

                        <h2 className="mt-1 text-[15px] font-semibold text-white">
                            Account Information
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close user details"
                        className="flex h-8 w-8 items-center justify-center rounded-[4px] text-slate-500 hover:bg-[#122b40] hover:text-white"
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="p-5">
                    <div className="flex items-center gap-3">
                        <UserAvatar user={user} large />

                        <div className="min-w-0">
                            <h3 className="truncate text-[15px] font-semibold text-white">
                                {user.name || "Unnamed user"}
                            </h3>

                            <p className="mt-1 truncate text-[11px] text-slate-500">
                                @{user.username || "—"}
                            </p>

                            <div className="mt-2 flex flex-wrap gap-2">
                                <RoleBadge
                                    role={getRoleLabel(user.role)}
                                />
                                <StatusBadge status={status} />
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 space-y-2">
                        <div className="flex items-center gap-3 rounded-[5px] border border-[#173149] bg-[#071827] px-3 py-3">
                            <Mail size={15} className="text-slate-500" />

                            <div className="min-w-0">
                                <p className="text-[10px] uppercase tracking-wider text-slate-600">
                                    Email
                                </p>

                                <p className="mt-1 break-all text-[12px] text-slate-300">
                                    {user.email || "—"}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 rounded-[5px] border border-[#173149] bg-[#071827] px-3 py-3">
                            <CalendarDays
                                size={15}
                                className="text-slate-500"
                            />

                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-slate-600">
                                    Joined
                                </p>

                                <p className="mt-1 text-[12px] text-slate-300">
                                    {formatDate(
                                        user.joined || user.createdAt
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 rounded-[5px] border border-[#173149] bg-[#071827] px-3 py-3">
                            <CheckCircle2
                                size={15}
                                className="text-slate-500"
                            />

                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-slate-600">
                                    Last Login
                                </p>

                                <p className="mt-1 text-[12px] text-slate-300">
                                    {formatDate(user.lastLogin)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-3 rounded-[5px] border border-[#173149] bg-[#071827] p-3">
                        <p className="text-[10px] uppercase tracking-wider text-slate-600">
                            User ID
                        </p>

                        <p className="mt-1 break-all font-mono text-[10px] text-slate-400">
                            {user.id || user._id || "—"}
                        </p>
                    </div>
                </div>

                <div className="flex justify-end border-t border-[#173149] px-4 py-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-8 rounded-[4px] border border-[#21415c] px-4 text-[11px] font-medium text-slate-300 transition hover:border-cyan-500/40 hover:text-white"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

function ChangeRoleModal({
    user,
    saving,
    onClose,
    onSave,
}) {
    const [role, setRole] = useState(user?.role || "citizen");

    useEffect(() => {
        setRole(user?.role || "citizen");
    }, [user]);

    if (!user) return null;

    const originalRole = user.role || "citizen";
    const isChanged = role !== originalRole;

    return (
        <div
            className="fixed inset-0 z-[220] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !saving) {
                    onClose();
                }
            }}
        >
            <div className="w-full max-w-[420px] overflow-hidden rounded-[6px] border border-[#21415c] bg-[#081522] shadow-2xl">
                <div className="flex items-center justify-between border-b border-[#173149] px-4 py-3">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-cyan-400">
                            USER MANAGEMENT
                        </p>

                        <h2 className="mt-1 text-[15px] font-semibold text-white">
                            Change User Role
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        aria-label="Close change role modal"
                        className="flex h-8 w-8 items-center justify-center rounded-[4px] text-slate-500 hover:bg-[#122b40] hover:text-white disabled:opacity-50"
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="space-y-4 p-5">
                    <div className="flex items-center gap-3 rounded-[5px] border border-[#173149] bg-[#071827] p-3">
                        <UserAvatar user={user} />

                        <div className="min-w-0">
                            <p className="truncate text-[12px] font-medium text-white">
                                {user.name || "Unnamed user"}
                            </p>

                            <p className="mt-1 truncate text-[11px] text-slate-500">
                                {user.email || "—"}
                            </p>

                            <p className="mt-1 text-[10px] text-slate-600">
                                Current role: {getRoleLabel(originalRole)}
                            </p>
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="change-user-role"
                            className="mb-2 block text-[11px] font-medium text-slate-400"
                        >
                            Select New Role
                        </label>

                        <select
                            id="change-user-role"
                            value={role}
                            onChange={(event) => setRole(event.target.value)}
                            disabled={saving}
                            className={`${inputClass} w-full`}
                        >
                            {EDITABLE_ROLE_OPTIONS.map((option) => (
                                <option
                                    key={option.value}
                                    value={option.value}
                                    className="bg-[#081522]"
                                >
                                    {option.label}
                                </option>
                            ))}
                        </select>

                        <p className="mt-2 text-[10px] leading-relaxed text-slate-600">
                            The new role determines the user's available
                            access and permissions.
                        </p>
                    </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-[#173149] px-4 py-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="h-9 rounded-[4px] border border-[#21415c] px-4 text-[11px] font-medium text-slate-300 transition hover:border-slate-500 disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={() => onSave(role)}
                        disabled={saving || !isChanged}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-[4px] border border-cyan-500/30 bg-cyan-500/10 px-4 text-[11px] font-semibold text-cyan-400 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {saving && (
                            <RefreshCw
                                size={13}
                                className="animate-spin"
                            />
                        )}

                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}
function Users() {
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        adminUsers: 0,
        citizenUsers: 0,
        fieldOfficerUsers: 0,
        departmentOfficerUsers: 0,
    });

    const [search, setSearch] = useState("");
    const [role, setRole] = useState("All");
    const [status, setStatus] = useState("All");
    const [page, setPage] = useState(1);
    const [limit] = useState(8);
    const [totalPages, setTotalPages] = useState(1);

    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [openMenu, setOpenMenu] = useState(null);

    const [roleEditingUser, setRoleEditingUser] = useState(null);
    const [roleSaving, setRoleSaving] = useState(false);

    const fetchStats = useCallback(async () => {
        try {
            setStatsLoading(true);

            const response = await fetch(
                `${API_BASE_URL}/users/stats`,
                {
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Unable to fetch user statistics"
                );
            }

            setStats(data.stats);
        } catch (error) {
            console.error("Fetch User Stats Error:", error);
            toast.error(
                error.message || "Unable to load user statistics"
            );
        } finally {
            setStatsLoading(false);
        }
    }, []);

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams({
                page: String(page),
                limit: String(limit),
            });

            if (search.trim()) {
                params.set("search", search.trim());
            }

            if (role !== "All") {
                params.set("role", role);
            }

            if (status !== "All") {
                params.set("status", status);
            }

            const response = await fetch(
                `${API_BASE_URL}/users?${params.toString()}`,
                { credentials: "include" }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Unable to fetch users"
                );
            }

            setUsers(Array.isArray(data.users) ? data.users : []);

            setTotalPages(
                Math.max(Number(data.pagination?.totalPages) || 1, 1)
            );
        } catch (error) {
            console.error("Fetch Users Error:", error);
            setUsers([]);
            toast.error(error.message || "Unable to load users");
        } finally {
            setLoading(false);
        }
    }, [page, limit, search, role, status]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    useEffect(() => {
        setPage(1);
    }, [search, role, status]);

    const refreshData = async () => {
        await Promise.all([fetchStats(), fetchUsers()]);
        toast.success("Users data refreshed");
    };

    const openUserDetails = async (user) => {
        const userId = user.id || user._id;

        if (!userId) {
            toast.error("User ID is missing");
            return;
        }

        try {
            setDetailsLoading(true);
            setOpenMenu(null);
            setSelectedUser({ ...user, id: userId });

            const response = await fetch(
                `${API_BASE_URL}/users/${userId}`,
                {
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Unable to fetch user details"
                );
            }

            setSelectedUser(data.user || user);
        } catch (error) {
            console.error("User Details Error:", error);
            toast.error(error.message || "Unable to load user details");
        } finally {
            setDetailsLoading(false);
        }
    };

    const updateUserStatus = async (user) => {
        const userId = user.id || user._id;
        const nextStatus = user.status !== "Active";

        if (!userId) {
            toast.error("User ID is missing");
            return;
        }

        try {
            setActionLoading(userId);
            setOpenMenu(null);

            const response = await fetch(
                `${API_BASE_URL}/users/${userId}/status`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ isActive: nextStatus }),
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Unable to update user status"
                );
            }

            toast.success(
                nextStatus
                    ? "User activated successfully"
                    : "User deactivated successfully"
            );

            await Promise.all([fetchUsers(), fetchStats()]);
        } catch (error) {
            console.error("Update User Status Error:", error);
            toast.error(error.message || "Unable to update user status");
        } finally {
            setActionLoading(null);
        }
    };

    const deleteUserAccount = async (user) => {
        const userId = user.id || user._id;

        if (!userId) {
            toast.error("User ID is missing");
            return;
        }

        // Admin accounts are intentionally protected from deletion.
        if (user.role === "admin") {
            toast.error("Admin accounts cannot be deleted from this page");
            setOpenMenu(null);
            return;
        }

        const confirmed = window.confirm(
            `Delete ${user.name || user.email || "this user"} permanently? This action cannot be undone.`
        );

        if (!confirmed) {
            setOpenMenu(null);
            return;
        }

        try {
            setDeleteLoading(userId);
            setOpenMenu(null);

            const response = await fetch(
                `${API_BASE_URL}/users/${userId}`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Unable to delete user"
                );
            }

            toast.success("User deleted successfully");

            if (
                selectedUser &&
                (selectedUser.id || selectedUser._id) === userId
            ) {
                setSelectedUser(null);
            }

            await Promise.all([fetchUsers(), fetchStats()]);
        } catch (error) {
            console.error("Delete User Error:", error);
            toast.error(error.message || "Unable to delete user");
        } finally {
            setDeleteLoading(null);
        }
    };

    const openChangeRole = (user) => {
        const userId = user.id || user._id;

        if (!userId) {
            toast.error("User ID is missing");
            return;
        }

        setOpenMenu(null);

        setRoleEditingUser({
            ...user,
            id: userId,
            role: user.role || "citizen",
        });
    };

    const updateUserRole = async (newRole) => {
        if (!roleEditingUser) return;

        const userId = roleEditingUser.id || roleEditingUser._id;

        if (!userId) {
            toast.error("User ID is missing");
            return;
        }

        if (newRole === roleEditingUser.role) {
            toast.info("Select a different role");
            return;
        }

        try {
            setRoleSaving(true);

            const response = await fetch(
                `${API_BASE_URL}/users/${userId}/role`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({ role: newRole }),
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Unable to update user role"
                );
            }

            toast.success("User role updated successfully");
            setRoleEditingUser(null);

            await Promise.all([fetchUsers(), fetchStats()]);
        } catch (error) {
            console.error("Update User Role Error:", error);
            toast.error(error.message || "Unable to update user role");
        } finally {
            setRoleSaving(false);
        }
    };

    const normalizedUsers = useMemo(
        () =>
            users.map((user) => ({
                ...user,
                displayRole: getRoleLabel(user.role),
                displayStatus:
                    user.status ||
                    (user.isActive ? "Active" : "Inactive"),
            })),
        [users]
    );


    const visiblePages = useMemo(() => {
        const pages = [];
        const maxPages = Math.max(totalPages, 1);

        if (maxPages <= 5) {
            for (let i = 1; i <= maxPages; i += 1) {
                pages.push(i);
            }

            return pages;
        }

        if (page <= 3) {
            return [1, 2, 3, 4, "...", maxPages];
        }

        if (page >= maxPages - 2) {
            return [
                1,
                "...",
                maxPages - 3,
                maxPages - 2,
                maxPages - 1,
                maxPages,
            ];
        }

        return [1, "...", page - 1, page, page + 1, "...", maxPages];
    }, [page, totalPages]);

    return (
        <div className="min-h-full space-y-6 font-['Poppins'] text-slate-200">
            {/* PAGE HEADER */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="mb-3 flex items-center gap-2">
                        <span className="h-6 w-[4px] rounded-full bg-cyan-400" />
                        <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-cyan-400">
                            SYSTEM ADMINISTRATION
                        </p>
                    </div>

                    <h1 className="text-[25px] font-semibold leading-tight tracking-[-0.03em] text-white">
                        Users
                    </h1>

                    <p className="mt-2 text-[12px] text-slate-500">
                        View and manage registered users and account access.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={refreshData}
                    disabled={loading || statsLoading}
                    className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-[5px] border border-[#21415c] bg-[#091a2a] px-4 text-[11px] font-medium text-slate-300 transition hover:border-cyan-500/40 hover:text-cyan-400 disabled:cursor-not-allowed disabled:opacity-50 sm:self-center"
                >
                    <RefreshCw
                        size={14}
                        className={
                            loading || statsLoading ? "animate-spin" : ""
                        }
                    />
                    Refresh
                </button>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    icon={UsersIcon}
                    label="Total Users"
                    value={statsLoading ? "—" : stats.totalUsers}
                    description="All registered platform users"
                    color="border-cyan-500/20 bg-cyan-500/10 text-cyan-400"
                />

                <StatCard
                    icon={ShieldCheck}
                    label="Administrators"
                    value={statsLoading ? "—" : stats.adminUsers}
                    description="Users with admin access"
                    color="border-purple-500/20 bg-purple-500/10 text-purple-400"
                />

                <StatCard
                    icon={UserCheck}
                    label="Active Users"
                    value={statsLoading ? "—" : stats.activeUsers}
                    description="Currently active accounts"
                    color="border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                />

                <StatCard
                    icon={UserX}
                    label="Inactive Users"
                    value={statsLoading ? "—" : stats.inactiveUsers}
                    description="Deactivated accounts"
                    color="border-red-500/20 bg-red-500/10 text-red-400"
                />
            </div>

            {/* USERS TABLE */}
            <section className={`${panelClass} overflow-hidden`}>
                <div className="flex flex-col gap-3 border-b border-[#173149] p-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="relative w-full lg:max-w-[360px]">
                        <Search
                            size={15}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search name, username or email..."
                            className={`${inputClass} w-full pl-9`}
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex h-10 items-center gap-2 rounded-[5px] border border-[#21415c] bg-[#071827] px-3">
                            <SlidersHorizontal
                                size={14}
                                className="text-slate-500"
                            />

                            <select
                                aria-label="Filter by role"
                                value={role}
                                onChange={(event) => setRole(event.target.value)}
                                className="max-w-[165px] bg-transparent text-[12px] text-slate-300 outline-none"
                            >
                                {ROLE_OPTIONS.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                        className="bg-[#081522]"
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <select
                            aria-label="Filter by status"
                            value={status}
                            onChange={(event) =>
                                setStatus(event.target.value)
                            }
                            className={`${inputClass} min-w-[130px]`}
                        >
                            {STATUS_OPTIONS.map((option) => (
                                <option
                                    key={option.value}
                                    value={option.value}
                                    className="bg-[#081522]"
                                >
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* DESKTOP TABLE */}
                <div className="hidden overflow-x-auto md:block">
                    <table className="w-full min-w-[850px]">
                        <thead>
                            <tr className="border-b border-[#173149] bg-[#071827] text-left">
                                {[
                                    "User",
                                    "Role",
                                    "Status",
                                    "Joined",
                                    "Last Login",
                                    "",
                                ].map((heading, index) => (
                                    <th
                                        key={`${heading}-${index}`}
                                        className="px-4 py-3 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-600"
                                    >
                                        {heading}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-[#173149]">
                            {loading ? (
                                <LoadingRows />
                            ) : normalizedUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-16">
                                        <div className="flex flex-col items-center text-center">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-[5px] border border-[#173149] bg-[#071827] text-slate-600">
                                                <Search size={21} />
                                            </div>

                                            <p className="mt-4 text-[13px] font-medium text-slate-300">
                                                No users found
                                            </p>

                                            <p className="mt-1 text-[11px] text-slate-600">
                                                Try changing your search or
                                                filter criteria.
                                            </p>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSearch("");
                                                    setRole("All");
                                                    setStatus("All");
                                                }}
                                                className="mt-4 h-9 rounded-[5px] border border-[#21415c] px-4 text-[11px] text-slate-400 transition hover:border-cyan-500/40 hover:text-cyan-400"
                                            >
                                                Clear Filters
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                normalizedUsers.map((user) => {
                                    const userId = user.id || user._id;

                                    return (
                                        <tr
                                            key={userId}
                                            className="transition hover:bg-[#0b1d2e]"
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <UserAvatar user={user} />

                                                    <div className="min-w-0">
                                                        <p className="truncate text-[12px] font-medium text-slate-200">
                                                            {user.name ||
                                                                "Unnamed user"}
                                                        </p>

                                                        <p className="mt-1 truncate text-[11px] text-slate-600">
                                                            {user.email || "—"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-4 py-3">
                                                <RoleBadge
                                                    role={user.displayRole}
                                                />
                                            </td>

                                            <td className="px-4 py-3">
                                                <StatusBadge
                                                    status={user.displayStatus}
                                                />
                                            </td>

                                            <td className="px-4 py-3 text-[11px] text-slate-500">
                                                {formatDate(
                                                    user.joined ||
                                                    user.createdAt
                                                )}
                                            </td>

                                            <td className="px-4 py-3 text-[11px] text-slate-500">
                                                {formatDate(user.lastLogin)}
                                            </td>

                                            <td className="relative px-4 py-3 text-right">
                                                <div className="relative inline-block">
                                                    <button
                                                        type="button"
                                                        aria-label={`Actions for ${user.name || "user"
                                                            }`}
                                                        onClick={() =>
                                                            setOpenMenu(
                                                                openMenu === userId
                                                                    ? null
                                                                    : userId
                                                            )
                                                        }
                                                        className="flex h-8 w-8 items-center justify-center rounded-[4px] text-slate-500 transition hover:bg-[#122b40] hover:text-white"
                                                    >
                                                        <MoreHorizontal size={16} />
                                                    </button>

                                                    {openMenu === userId && (
                                                        <div className="absolute right-0 top-full z-30 mt-1 w-[190px] overflow-hidden rounded-[5px] border border-[#21415c] bg-[#081522] text-left shadow-2xl">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    openUserDetails(
                                                                        user
                                                                    )
                                                                }
                                                                className="flex w-full items-center gap-2 px-3 py-3 text-[11px] text-slate-300 hover:bg-[#10263a] hover:text-white"
                                                            >
                                                                <Eye size={14} />
                                                                View Details
                                                            </button>

                                                            {user.role !==
                                                                "admin" && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            openChangeRole(
                                                                                user
                                                                            )
                                                                        }
                                                                        className="flex w-full items-center gap-2 border-t border-[#173149] px-3 py-3 text-[11px] text-slate-300 hover:bg-[#10263a] hover:text-cyan-400"
                                                                    >
                                                                        <ShieldCheck
                                                                            size={14}
                                                                        />
                                                                        Change Role
                                                                    </button>
                                                                )}

                                                            <button
                                                                type="button"
                                                                disabled={
                                                                    actionLoading ===
                                                                    userId ||
                                                                    deleteLoading ===
                                                                    userId
                                                                }
                                                                onClick={() =>
                                                                    updateUserStatus(
                                                                        user
                                                                    )
                                                                }
                                                                className="flex w-full items-center gap-2 border-t border-[#173149] px-3 py-3 text-[11px] text-slate-300 hover:bg-[#10263a] hover:text-white disabled:opacity-50"
                                                            >
                                                                {user.displayStatus ===
                                                                    "Active" ? (
                                                                    <UserX size={14} />
                                                                ) : (
                                                                    <UserCheck
                                                                        size={14}
                                                                    />
                                                                )}

                                                                {user.displayStatus ===
                                                                    "Active"
                                                                    ? "Deactivate"
                                                                    : "Activate"}
                                                            </button>

                                                            {user.role !==
                                                                "admin" && (
                                                                    <button
                                                                        type="button"
                                                                        disabled={
                                                                            deleteLoading ===
                                                                            userId
                                                                        }
                                                                        onClick={() =>
                                                                            deleteUserAccount(
                                                                                user
                                                                            )
                                                                        }
                                                                        className="flex w-full items-center gap-2 border-t border-[#173149] px-3 py-3 text-[11px] text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                                                                    >
                                                                        {deleteLoading ===
                                                                            userId ? (
                                                                            <RefreshCw
                                                                                size={14}
                                                                                className="animate-spin"
                                                                            />
                                                                        ) : (
                                                                            <Trash2
                                                                                size={14}
                                                                            />
                                                                        )}
                                                                        {deleteLoading ===
                                                                            userId
                                                                            ? "Deleting..."
                                                                            : "Delete User"}
                                                                    </button>
                                                                )}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                {/* MOBILE USERS */}
                <div className="divide-y divide-[#173149] md:hidden">
                    {loading ? (
                        Array.from({ length: 4 }, (_, index) => (
                            <div key={index} className="p-4">
                                <div className="h-14 animate-pulse rounded-[4px] bg-[#0d2234]" />
                            </div>
                        ))
                    ) : normalizedUsers.length === 0 ? (
                        <div className="px-4 py-14 text-center">
                            <UsersIcon
                                size={24}
                                className="mx-auto text-slate-700"
                            />

                            <p className="mt-3 text-[12px] text-slate-400">
                                No users found
                            </p>

                            <button
                                type="button"
                                onClick={() => {
                                    setSearch("");
                                    setRole("All");
                                    setStatus("All");
                                }}
                                className="mt-3 text-[11px] text-cyan-400"
                            >
                                Clear Filters
                            </button>
                        </div>
                    ) : (
                        normalizedUsers.map((user) => {
                            const userId = user.id || user._id;

                            return (
                                <div key={userId} className="p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <UserAvatar user={user} />

                                            <div className="min-w-0">
                                                <p className="truncate text-[12px] font-medium text-slate-200">
                                                    {user.name ||
                                                        "Unnamed user"}
                                                </p>

                                                <p className="mt-1 truncate text-[11px] text-slate-600">
                                                    {user.email || "—"}
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            aria-label={`Actions for ${user.name || "user"
                                                }`}
                                            onClick={() =>
                                                setOpenMenu(
                                                    openMenu === userId
                                                        ? null
                                                        : userId
                                                )
                                            }
                                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] text-slate-500 hover:bg-[#122b40] hover:text-white"
                                        >
                                            <MoreHorizontal size={16} />
                                        </button>
                                    </div>

                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                        <RoleBadge role={user.displayRole} />
                                        <StatusBadge
                                            status={user.displayStatus}
                                        />
                                    </div>

                                    <p className="mt-3 text-[10px] text-slate-600">
                                        Joined{" "}
                                        {formatDate(
                                            user.joined || user.createdAt
                                        )}
                                    </p>

                                    {openMenu === userId && (
                                        <div className="mt-3 overflow-hidden rounded-[5px] border border-[#21415c] bg-[#081522]">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    openUserDetails(user)
                                                }
                                                className="flex w-full items-center gap-2 px-3 py-3 text-left text-[11px] text-slate-300 hover:bg-[#10263a]"
                                            >
                                                <Eye size={14} />
                                                View Details
                                            </button>

                                            {user.role !== "admin" && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openChangeRole(user)
                                                    }
                                                    className="flex w-full items-center gap-2 border-t border-[#173149] px-3 py-3 text-left text-[11px] text-slate-300 hover:bg-[#10263a] hover:text-cyan-400"
                                                >
                                                    <ShieldCheck size={14} />
                                                    Change Role
                                                </button>
                                            )}

                                            <button
                                                type="button"
                                                disabled={
                                                    actionLoading === userId ||
                                                    deleteLoading === userId
                                                }
                                                onClick={() =>
                                                    updateUserStatus(user)
                                                }
                                                className="flex w-full items-center gap-2 border-t border-[#173149] px-3 py-3 text-left text-[11px] text-slate-300 hover:bg-[#10263a] disabled:opacity-50"
                                            >
                                                {user.displayStatus ===
                                                    "Active" ? (
                                                    <UserX size={14} />
                                                ) : (
                                                    <UserCheck size={14} />
                                                )}

                                                {user.displayStatus ===
                                                    "Active"
                                                    ? "Deactivate"
                                                    : "Activate"}
                                            </button>

                                            {user.role !== "admin" && (
                                                <button
                                                    type="button"
                                                    disabled={
                                                        deleteLoading === userId
                                                    }
                                                    onClick={() =>
                                                        deleteUserAccount(user)
                                                    }
                                                    className="flex w-full items-center gap-2 border-t border-[#173149] px-3 py-3 text-left text-[11px] text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                                                >
                                                    {deleteLoading ===
                                                        userId ? (
                                                        <RefreshCw
                                                            size={14}
                                                            className="animate-spin"
                                                        />
                                                    ) : (
                                                        <Trash2 size={14} />
                                                    )}

                                                    {deleteLoading === userId
                                                        ? "Deleting..."
                                                        : "Delete User"}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* PAGINATION */}
                {!loading && normalizedUsers.length > 0 && (
                    <div className="flex flex-col gap-3 border-t border-[#173149] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-[10px] text-slate-600">
                            Page{" "}
                            <span className="text-slate-300">{page}</span>{" "}
                            of{" "}
                            <span className="text-slate-300">
                                {Math.max(totalPages, 1)}
                            </span>
                        </p>

                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                disabled={page <= 1}
                                onClick={() =>
                                    setPage((current) =>
                                        Math.max(current - 1, 1)
                                    )
                                }
                                className="flex h-8 items-center gap-1 rounded-[4px] border border-[#21415c] px-2.5 text-[10px] text-slate-400 transition hover:border-cyan-500/40 hover:text-cyan-400 disabled:cursor-not-allowed disabled:opacity-30"
                            >
                                <ChevronLeft size={13} />
                                Prev
                            </button>

                            {visiblePages.map((pageNumber, index) =>
                                pageNumber === "..." ? (
                                    <span
                                        key={`dots-${index}`}
                                        className="px-1 text-[10px] text-slate-700"
                                    >
                                        ...
                                    </span>
                                ) : (
                                    <button
                                        key={pageNumber}
                                        type="button"
                                        onClick={() => setPage(pageNumber)}
                                        className={`h-8 min-w-8 rounded-[4px] border px-2 text-[10px] transition ${page === pageNumber
                                                ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-400"
                                                : "border-[#21415c] text-slate-500 hover:border-slate-600 hover:text-slate-300"
                                            }`}
                                    >
                                        {pageNumber}
                                    </button>
                                )
                            )}

                            <button
                                type="button"
                                disabled={page >= totalPages}
                                onClick={() =>
                                    setPage((current) =>
                                        Math.min(
                                            current + 1,
                                            Math.max(totalPages, 1)
                                        )
                                    )
                                }
                                className="flex h-8 items-center gap-1 rounded-[4px] border border-[#21415c] px-2.5 text-[10px] text-slate-400 transition hover:border-cyan-500/40 hover:text-cyan-400 disabled:cursor-not-allowed disabled:opacity-30"
                            >
                                Next
                                <ChevronRight size={13} />
                            </button>
                        </div>
                    </div>
                )}
            </section>
            <UserDetailsModal
                user={
                    selectedUser
                        ? {
                            ...selectedUser,
                            status:
                                selectedUser.status ||
                                (selectedUser.isActive
                                    ? "Active"
                                    : "Inactive"),
                        }
                        : null
                }
                onClose={() => setSelectedUser(null)}
            />

            <ChangeRoleModal
                user={roleEditingUser}
                saving={roleSaving}
                onClose={() => setRoleEditingUser(null)}
                onSave={updateUserRole}
            />

            {detailsLoading && selectedUser && (
                <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[210] flex justify-center">
                    <div className="flex items-center gap-2 rounded-[5px] border border-[#21415c] bg-[#081522] px-4 py-2 text-[11px] text-slate-300 shadow-xl">
                        <RefreshCw
                            size={13}
                            className="animate-spin"
                        />
                        Loading user details...
                    </div>
                </div>
            )}
        </div>
    );
}

export default Users;