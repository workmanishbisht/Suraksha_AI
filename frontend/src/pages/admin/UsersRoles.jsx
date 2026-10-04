import { useCallback, useEffect, useMemo, useState } from "react";
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
    CalendarDays,
    RefreshCw,
    UserCog,
    CheckCircle2,
    KeyRound,
    Shield,
    LockKeyhole,
} from "lucide-react";
import { toast } from "sonner";

const API_BASE_URL = "http://localhost:5000/api";

const roleLabels = {
    admin: "Admin",
    citizen: "Citizen",
    field_officer: "Field Officer",
    department_officer: "Department Officer",
};


const roleApiValues = {
    All: "",
    Admin: "Admin",
    Citizen: "Citizen",
    "Field Officer": "Field Officer",
    "Department Officer": "Department Officer",
};


const roleStyles = {
    Admin: {
        icon: ShieldCheck,
        text: "text-cyan-400",
        bg: "bg-cyan-500/10",
        border: "border-cyan-500/20",
    },
    Citizen: {
        icon: Users,
        text: "text-blue-400",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
    },
    "Field Officer": {
        icon: UserCog,
        text: "text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
    },
    "Department Officer": {
        icon: ShieldCheck,
        text: "text-purple-400",
        bg: "bg-purple-500/10",
        border: "border-purple-500/20",
    },
};

function StatCard({
    icon: Icon,
    label,
    value,
    description,
    iconClass,
}) {
    return (
        <div className="group rounded-[6px] border border-[#173149] bg-[#091a2a] p-4 transition-all duration-200 hover:border-[#28506d] hover:bg-[#0b1d2e]">
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
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[5px] border ${iconClass}`}
                >
                    <Icon size={16} />
                </div>
            </div>
        </div>
    );
}

function RoleBadge({ role }) {
    const style = roleStyles[role] || roleStyles.Citizen;
    const Icon = style.icon;

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-[4px] border px-2 py-1 text-[10px] font-medium ${style.bg} ${style.border} ${style.text}`}
        >
            <Icon size={11} />
            {role}
        </span>
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
                className={`h-1.5 w-1.5 rounded-full ${active
                    ? "bg-emerald-400"
                    : "bg-red-400"
                    }`}
            />
            {status}
        </span>
    );
}

function UserAvatar({ user, large = false }) {
    const initials = user?.name
        ? user.name
            .split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()
        : "U";

    if (user?.profileImage) {
        return (
            <img
                src={user.profileImage}
                alt={user.name || "User"}
                className={`shrink-0 rounded-[5px] object-cover ${large
                    ? "h-14 w-14"
                    : "h-8 w-8"
                    }`}
            />
        );
    }

    return (
        <div
            className={`flex shrink-0 items-center justify-center rounded-[5px] border border-[#21415c] bg-[#10263a] font-semibold text-cyan-400 ${large
                ? "h-14 w-14 text-sm"
                : "h-8 w-8 text-[10px]"
                }`}
        >
            {initials}
        </div>
    );
}

function formatDate(value) {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function formatLastLogin(value) {
    if (!value) {
        return "Never";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Never";
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function UsersRoles() {
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

    const [selectedUser, setSelectedUser] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    const [roles, setRoles] = useState([]);
    const [rolesLoading, setRolesLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    const [roleDetailsLoading, setRoleDetailsLoading] = useState(false);

    const [permissions, setPermissions] = useState([]);
    const [permissionsLoading, setPermissionsLoading] = useState(false);
    const [permissionsDenied, setPermissionsDenied] = useState(false);

    const [openMenu, setOpenMenu] = useState(null);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

    const fetchStats = useCallback(async () => {
        try {
            setStatsLoading(true);

            const response = await fetch(
                `${API_BASE_URL}/users/stats`,
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                    "Unable to fetch user statistics"
                );
            }

            setStats(
                data.stats || {
                    totalUsers: 0,
                    activeUsers: 0,
                    inactiveUsers: 0,
                    adminUsers: 0,
                    citizenUsers: 0,
                    fieldOfficerUsers: 0,
                    departmentOfficerUsers: 0,
                }
            );
        } catch (error) {
            console.error(
                "Fetch User Stats Error:",
                error
            );

            toast.error(
                error.message ||
                "Unable to load user statistics"
            );
        } finally {
            setStatsLoading(false);
        }
    }, []);

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams();

            params.set("page", String(page));
            params.set("limit", String(limit));

            if (search.trim()) {
                params.set(
                    "search",
                    search.trim()
                );
            }

            const apiRole =
                roleApiValues[role] || "";

            if (apiRole) {
                params.set("role", apiRole);
            }

            if (status !== "All") {
                params.set("status", status);
            }

            const response = await fetch(
                `${API_BASE_URL}/users?${params.toString()}`,
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                    "Unable to fetch users"
                );
            }

            const apiUsers = Array.isArray(
                data.users
            )
                ? data.users
                : [];

            setUsers(apiUsers);

            const pagination =
                data.pagination || {};

            setTotalPages(
                Number(
                    pagination.totalPages ||
                    pagination.pages ||
                    1
                )
            );
        } catch (error) {
            console.error(
                "Fetch Users Error:",
                error
            );

            setUsers([]);

            toast.error(
                error.message ||
                "Unable to load users"
            );
        } finally {
            setLoading(false);
        }
    }, [
        page,
        limit,
        search,
        role,
        status,
    ]);


    const fetchPermissions = useCallback(async () => {
        try {
            setPermissionsLoading(true);
            setPermissionsDenied(false);

            const response = await fetch(
                `${API_BASE_URL}/permissions`,
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (response.status === 403) {
                setPermissions([]);
                setPermissionsDenied(true);
                return;
            }

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                    "Unable to fetch permissions"
                );
            }

            setPermissions(
                Array.isArray(data.permissions)
                    ? data.permissions
                    : []
            );
        } catch (error) {
            console.error(
                "Fetch Permissions Error:",
                error
            );

            setPermissions([]);
            setPermissionsDenied(false);

            toast.error(
                error.message ||
                "Unable to load permissions"
            );
        } finally {
            setPermissionsLoading(false);
        }
    }, []);

    const fetchRoles = useCallback(async () => {
        try {
            setRolesLoading(true);

            const response = await fetch(
                `${API_BASE_URL}/roles`,
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                    "Unable to fetch roles"
                );
            }

            setRoles(
                Array.isArray(data.roles)
                    ? data.roles
                    : []
            );
        } catch (error) {
            console.error(
                "Fetch Roles Error:",
                error
            );

            setRoles([]);

            toast.error(
                error.message ||
                "Unable to load roles"
            );
        } finally {
            setRolesLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
        fetchRoles();
        fetchPermissions();
    }, [fetchStats, fetchRoles, fetchPermissions]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    useEffect(() => {
        setPage(1);
    }, [search, role, status]);


    const openRoleDetails = async (roleItem) => {
        try {
            setRoleDetailsLoading(true);
            setSelectedRole(roleItem);

            const response = await fetch(
                `${API_BASE_URL}/roles/${roleItem._id}`,
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                    "Unable to fetch role details"
                );
            }

            setSelectedRole(
                data.role || roleItem
            );
        } catch (error) {
            console.error(
                "Role Details Error:",
                error
            );

            toast.error(
                error.message ||
                "Unable to load role details"
            );
        } finally {
            setRoleDetailsLoading(false);
        }
    };

    const refreshData = async () => {
        await Promise.all([
            fetchStats(),
            fetchUsers(),
            fetchRoles(),
            fetchPermissions(),
        ]);

        toast.success("Users data refreshed");
    };

    const openUserDetails = async (user) => {
        try {
            setOpenMenu(null);
            setDetailsLoading(true);
            setSelectedUser(user);

            const response = await fetch(
                `${API_BASE_URL}/users/${user.id}`,
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                    "Unable to fetch user details"
                );
            }

            setSelectedUser(
                data.user || user
            );
        } catch (error) {
            console.error(
                "User Details Error:",
                error
            );

            toast.error(
                error.message ||
                "Unable to load user details"
            );
        } finally {
            setDetailsLoading(false);
        }
    };

    // Current Admin RBAC allows users.update, so status management remains available.
    const updateUserStatus = async (user) => {
        const nextStatus =
            user.status === "Active"
                ? false
                : true;

        try {
            setActionLoading(
                `${user.id}-status`
            );
            setOpenMenu(null);

            const response = await fetch(
                `${API_BASE_URL}/users/${user.id}/status`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type":
                            "application/json",
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
                    data.message ||
                    "Unable to update user status"
                );
            }

            toast.success(
                nextStatus
                    ? "User activated successfully"
                    : "User deactivated successfully"
            );

            await Promise.all([
                fetchUsers(),
                fetchStats(),
            ]);
        } catch (error) {
            console.error(
                "Update User Status Error:",
                error
            );

            toast.error(
                error.message ||
                "Unable to update user status"
            );
        } finally {
            setActionLoading(null);
        }
    };

    const normalizedUsers = useMemo(() => {
        return users.map((user) => ({
            ...user,
            displayRole:
                roleLabels[user.role] ||
                user.role ||
                "Unknown",
            displayStatus:
                user.status ||
                (user.isActive
                    ? "Active"
                    : "Inactive"),
        }));
    }, [users]);

    const visiblePages = useMemo(() => {
        const pages = [];

        const maxPages = Math.max(
            totalPages,
            1
        );

        if (maxPages <= 5) {
            for (
                let index = 1;
                index <= maxPages;
                index += 1
            ) {
                pages.push(index);
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

        return [
            1,
            "...",
            page - 1,
            page,
            page + 1,
            "...",
            maxPages,
        ];
    }, [page, totalPages]);

    return (
        <div className="min-h-full space-y-6">
            {/* PAGE HEADER */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-400">
                        SYSTEM ADMINISTRATION
                    </p>

                    <h1 className="mt-1.5 text-[26px] font-semibold leading-tight tracking-[-0.02em] text-white sm:text-[28px]">
                        Users & Roles
                    </h1>

                    <p className="mt-2 max-w-2xl text-[12px] leading-5 text-slate-500">
                        Manage platform users, roles, account access and permissions.
                    </p>

                </div>

                <button
                    type="button"
                    onClick={refreshData}
                    disabled={
                        loading ||
                        statsLoading
                    }
                    className="inline-flex h-9 shrink-0 items-center justify-center gap-2 self-start rounded-[5px] border border-[#21415c] bg-[#091a2a] px-3 text-[11px] font-medium text-slate-300 transition hover:border-cyan-500/40 hover:text-cyan-400 disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
                >
                    <RefreshCw
                        size={14}
                        className={
                            loading ||
                                statsLoading
                                ? "animate-spin"
                                : ""
                        }
                    />
                    Refresh
                </button>
            </div>

            {/* STATS */}

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    icon={Users}
                    label="Total Users"
                    value={
                        statsLoading
                            ? "—"
                            : stats.totalUsers
                    }
                    description="All registered platform users"
                    iconClass="border-cyan-500/20 bg-cyan-500/10 text-cyan-400"
                />

                <StatCard
                    icon={ShieldCheck}
                    label="Administrators"
                    value={
                        statsLoading
                            ? "—"
                            : stats.adminUsers
                    }
                    description="Users with admin access"
                    iconClass="border-purple-500/20 bg-purple-500/10 text-purple-400"
                />

                <StatCard
                    icon={UserCheck}
                    label="Active Users"
                    value={
                        statsLoading
                            ? "—"
                            : stats.activeUsers
                    }
                    description="Currently active accounts"
                    iconClass="border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                />

                <StatCard
                    icon={UserX}
                    label="Inactive Users"
                    value={
                        statsLoading
                            ? "—"
                            : stats.inactiveUsers
                    }
                    description="Deactivated accounts"
                    iconClass="border-red-500/20 bg-red-500/10 text-red-400"
                />
            </div>

            {/* ROLES */}

            <div className="overflow-hidden rounded-[6px] border border-[#173149] bg-[#091a2a]">
                <div className="flex items-center justify-between border-b border-[#173149] px-4 py-3">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-400">
                            ACCESS CONTROL
                        </p>
                        <h2 className="mt-1 text-sm font-semibold text-white">
                            Roles
                        </h2>
                    </div>

                    <span className="text-[10px] text-slate-600">
                        {rolesLoading ? "Loading..." : `${roles.length} roles`}
                    </span>
                </div>

                <div className="grid gap-3 p-3 sm:grid-cols-2 xl:grid-cols-4">
                    {rolesLoading ? (
                        Array.from({ length: 4 }).map((_, index) => (
                            <div
                                key={index}
                                className="h-[118px] animate-pulse rounded-[5px] border border-[#173149] bg-[#071827]"
                            />
                        ))
                    ) : roles.length === 0 ? (
                        <div className="col-span-full py-8 text-center">
                            <Shield
                                size={22}
                                className="mx-auto text-slate-700"
                            />
                            <p className="mt-2 text-[10px] text-slate-500">
                                No roles available
                            </p>
                        </div>
                    ) : (
                        roles.map((roleItem) => (
                            <button
                                key={roleItem._id}
                                type="button"
                                onClick={() =>
                                    openRoleDetails(roleItem)
                                }
                                className="group rounded-[5px] border border-[#173149] bg-[#071827] p-3 text-left transition hover:border-cyan-500/30 hover:bg-[#0b1d2e]"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
                                        <KeyRound size={14} />
                                    </div>

                                    <span className="text-[10px] text-slate-600 group-hover:text-cyan-400">
                                        View
                                    </span>
                                </div>

                                <p className="mt-3 text-[12px] font-semibold text-slate-200">
                                    {roleLabels[roleItem.name] ||
                                        roleItem.name}
                                </p>

                                <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-slate-600">
                                    {roleItem.description ||
                                        "No description available"}
                                </p>

                                <div className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-500">
                                    <Shield size={10} />
                                    {Array.isArray(roleItem.permissions)
                                        ? `${roleItem.permissions.length} permissions`
                                        : "Permissions protected"}
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* PERMISSIONS */}

            <div className="overflow-hidden rounded-[6px] border border-[#173149] bg-[#091a2a]">
                <div className="flex items-center justify-between border-b border-[#173149] px-4 py-3">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-400">
                            ACCESS CONTROL
                        </p>
                        <h2 className="mt-1 text-sm font-semibold text-white">
                            Permissions
                        </h2>
                    </div>

                    {!permissionsDenied && (
                        <span className="text-[10px] text-slate-600">
                            {permissionsLoading
                                ? "Loading..."
                                : `${permissions.length} permissions`}
                        </span>
                    )}
                </div>

                {permissionsLoading ? (
                    <div className="grid gap-2 p-3 sm:grid-cols-2 lg:grid-cols-4">
                        {Array.from({ length: 8 }).map((_, index) => (
                            <div
                                key={index}
                                className="h-[58px] animate-pulse rounded-[5px] border border-[#173149] bg-[#071827]"
                            />
                        ))}
                    </div>
                ) : permissionsDenied ? (
                    <div className="flex items-center gap-3 p-4">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[5px] border border-amber-500/20 bg-amber-500/10 text-amber-400">
                            <LockKeyhole size={15} />
                        </div>

                        <div>
                            <p className="text-[10px] font-medium text-slate-300">
                                Permission access restricted
                            </p>
                            <p className="mt-1 text-[10px] leading-4 text-slate-600">
                                Your current role does not have
                                <span className="text-slate-500">
                                    {" "}permissions.read
                                </span>
                                {" "}access.
                            </p>
                        </div>
                    </div>
                ) : permissions.length === 0 ? (
                    <div className="p-6 text-center">
                        <p className="text-[10px] text-slate-600">
                            No permissions available
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-2 p-3 sm:grid-cols-2 lg:grid-cols-4">
                        {permissions.map((permission) => (
                            <div
                                key={permission._id}
                                className="rounded-[5px] border border-[#173149] bg-[#071827] p-3"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <p className="text-[10px] font-semibold text-slate-300">
                                        {permission.name}
                                    </p>

                                    <span className="rounded-[3px] border border-cyan-500/20 bg-cyan-500/5 px-1.5 py-0.5 text-[9px] text-cyan-400">
                                        {permission.action}
                                    </span>
                                </div>

                                <p className="mt-1 text-[10px] text-slate-600">
                                    {permission.resource}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* TABLE PANEL */}

            <div className="overflow-hidden rounded-[6px] border border-[#173149] bg-[#091a2a]">
                {/* FILTER BAR */}

                <div className="border-b border-[#173149] p-3">
                    <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                        <div className="relative min-w-0 flex-1 lg:max-w-[360px]">
                            <Search
                                size={14}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
                            />

                            <input
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target
                                            .value
                                    )
                                }
                                placeholder="Search name, username or email..."
                                className="h-9 w-full rounded-[5px] border border-[#21415c] bg-[#071827] pl-9 pr-3 text-[10px] text-slate-200 outline-none placeholder:text-slate-600 focus:border-cyan-500/50"
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <div className="flex h-9 items-center gap-2 rounded-[5px] border border-[#21415c] bg-[#071827] px-2.5">
                                <SlidersHorizontal
                                    size={13}
                                    className="text-slate-600"
                                />

                                <select
                                    value={role}
                                    onChange={(event) =>
                                        setRole(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    className="bg-transparent text-[10px] text-slate-300 outline-none"
                                >
                                    <option value="All">
                                        All Roles
                                    </option>
                                    <option value="Admin">
                                        Admin
                                    </option>
                                    <option value="Citizen">
                                        Citizen
                                    </option>
                                    <option value="Field Officer">
                                        Field Officer
                                    </option>
                                    <option value="Department Officer">
                                        Department Officer
                                    </option>
                                </select>
                            </div>

                            <select
                                value={status}
                                onChange={(event) =>
                                    setStatus(
                                        event.target
                                            .value
                                    )
                                }
                                className="h-9 rounded-[5px] border border-[#21415c] bg-[#071827] px-2.5 text-[10px] text-slate-300 outline-none focus:border-cyan-500/50"
                            >
                                <option value="All">
                                    All Status
                                </option>
                                <option value="Active">
                                    Active
                                </option>
                                <option value="Inactive">
                                    Inactive
                                </option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* DESKTOP TABLE */}

                <div className="hidden overflow-x-auto md:block">
                    <table className="w-full min-w-[850px]">
                        <thead>
                            <tr className="border-b border-[#173149] bg-[#071827] text-left">
                                <th className="px-4 py-3 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                                    User
                                </th>

                                <th className="px-4 py-3 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                                    Role
                                </th>

                                <th className="px-4 py-3 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                                    Status
                                </th>

                                <th className="px-4 py-3 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                                    Joined
                                </th>

                                <th className="px-4 py-3 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                                    Last Login
                                </th>

                                <th className="w-[60px] px-4 py-3" />
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-[#173149]">
                            {loading ? (
                                Array.from({
                                    length: 5,
                                }).map(
                                    (_, index) => (
                                        <tr
                                            key={
                                                index
                                            }
                                        >
                                            <td
                                                colSpan={
                                                    6
                                                }
                                                className="px-4 py-5"
                                            >
                                                <div className="h-9 animate-pulse rounded-[4px] bg-[#0d2234]" />
                                            </td>
                                        </tr>
                                    )
                                )
                            ) : normalizedUsers.length ===
                                0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-4 py-14 text-center"
                                    >
                                        <Users
                                            size={24}
                                            className="mx-auto text-slate-700"
                                        />

                                        <p className="mt-3 text-[10px] font-medium text-slate-400">
                                            No users found
                                        </p>

                                        <p className="mt-1 text-[10px] text-slate-600">
                                            Try changing your
                                            search or filters.
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                normalizedUsers.map(
                                    (user) => (
                                        <tr
                                            key={
                                                user.id
                                            }
                                            className="transition hover:bg-[#0b1d2e]"
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <UserAvatar
                                                        user={
                                                            user
                                                        }
                                                    />

                                                    <div className="min-w-0">
                                                        <p className="truncate text-[13px] font-medium text-slate-200">
                                                            {
                                                                user.name
                                                            }
                                                        </p>

                                                        <p className="mt-0.5 truncate text-[12px] text-slate-600">
                                                            {
                                                                user.email
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-4 py-3">
                                                <RoleBadge
                                                    role={
                                                        user.displayRole
                                                    }
                                                />
                                            </td>

                                            <td className="px-4 py-3">
                                                <StatusBadge
                                                    status={
                                                        user.displayStatus
                                                    }
                                                />
                                            </td>

                                            <td className="px-4 py-3 text-[12px] text-slate-500">
                                                {formatDate(
                                                    user.joined ||
                                                    user.createdAt
                                                )}
                                            </td>

                                            <td className="px-4 py-3 text-[12px] text-slate-500">
                                                {formatLastLogin(
                                                    user.lastLogin
                                                )}
                                            </td>

                                            <td className="relative px-4 py-3 text-right">
                                                <button
                                                    type="button"
                                                    onClick={(event) => {
                                                        if (openMenu === user.id) {
                                                            setOpenMenu(null);
                                                            return;
                                                        }
                                                        const rect = event.currentTarget.getBoundingClientRect();
                                                        const menuWidth = 280;
                                                        const menuHeight = 250;
                                                        let left = rect.right - menuWidth;
                                                        let top = rect.bottom + 6;
                                                        if (top + menuHeight > window.innerHeight - 10) {
                                                            top = rect.top - menuHeight - 6;
                                                        }
                                                        if (left < 10) left = 10;
                                                        if (left + menuWidth > window.innerWidth - 10) {
                                                            left = window.innerWidth - menuWidth - 10;
                                                        }
                                                        setMenuPosition({ top, left });
                                                        setOpenMenu(user.id);
                                                    }}
                                                    className="flex h-7 w-7 items-center justify-center rounded-[4px] text-slate-500 transition hover:bg-[#122b40] hover:text-slate-200"
                                                >
                                                    <MoreHorizontal
                                                        size={
                                                            15
                                                        }
                                                    />
                                                </button>

                                                {openMenu ===
                                                    user.id && (
                                                        <div
                                                            className="fixed z-[200] w-[280px] max-w-[calc(100vw-20px)] overflow-hidden rounded-[5px] border border-[#21415c] bg-[#081522] shadow-2xl"
                                                            style={{ top: menuPosition.top, left: menuPosition.left }}
                                                        >
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    openUserDetails(
                                                                        user
                                                                    )
                                                                }
                                                                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[10px] leading-[1.2] text-slate-300 hover:bg-[#10263a] hover:text-white"
                                                            >
                                                                <Eye
                                                                    size={
                                                                        13
                                                                    }
                                                                />
                                                                View Details
                                                            </button>

                                                            <div className="border-t border-[#173149]" />

                                                            <button
                                                                type="button"
                                                                disabled={
                                                                    actionLoading ===
                                                                    `${user.id}-status`
                                                                }
                                                                onClick={() =>
                                                                    updateUserStatus(
                                                                        user
                                                                    )
                                                                }
                                                                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[10px] leading-[1.2] text-slate-300 hover:bg-[#10263a] hover:text-white disabled:opacity-50"
                                                            >
                                                                {user.displayStatus ===
                                                                    "Active" ? (
                                                                    <>
                                                                        <UserX
                                                                            size={
                                                                                13
                                                                            }
                                                                        />
                                                                        Deactivate
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <UserCheck
                                                                            size={
                                                                                13
                                                                            }
                                                                        />
                                                                        Activate
                                                                    </>
                                                                )}
                                                            </button>
                                                        </div>
                                                    )}
                                            </td>
                                        </tr>
                                    )
                                )
                            )}
                        </tbody>
                    </table>
                </div>

                {/* MOBILE USERS */}

                <div className="divide-y divide-[#173149] md:hidden">
                    {loading ? (
                        Array.from({
                            length: 4,
                        }).map((_, index) => (
                            <div
                                key={index}
                                className="p-4"
                            >
                                <div className="h-14 animate-pulse rounded-[4px] bg-[#0d2234]" />
                            </div>
                        ))
                    ) : normalizedUsers.length ===
                        0 ? (
                        <div className="px-4 py-14 text-center">
                            <Users
                                size={24}
                                className="mx-auto text-slate-700"
                            />

                            <p className="mt-3 text-[10px] text-slate-400">
                                No users found
                            </p>
                        </div>
                    ) : (
                        normalizedUsers.map(
                            (user) => (
                                <div
                                    key={user.id}
                                    className="p-4"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <UserAvatar
                                                user={
                                                    user
                                                }
                                            />

                                            <div className="min-w-0">
                                                <p className="truncate text-[13px] font-medium text-slate-200">
                                                    {
                                                        user.name
                                                    }
                                                </p>

                                                <p className="mt-0.5 truncate text-[12px] text-slate-600">
                                                    {
                                                        user.email
                                                    }
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setOpenMenu(
                                                    openMenu ===
                                                        user.id
                                                        ? null
                                                        : user.id
                                                )
                                            }
                                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[4px] text-slate-500 hover:bg-[#122b40] hover:text-white"
                                        >
                                            <MoreHorizontal
                                                size={
                                                    15
                                                }
                                            />
                                        </button>
                                    </div>

                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                        <RoleBadge
                                            role={
                                                user.displayRole
                                            }
                                        />

                                        <StatusBadge
                                            status={
                                                user.displayStatus
                                            }
                                        />

                                        <span className="text-[10px] text-slate-600">
                                            Joined{" "}
                                            {formatDate(
                                                user.joined ||
                                                user.createdAt
                                            )}
                                        </span>
                                    </div>

                                    {openMenu ===
                                        user.id && (
                                            <div className="mt-3 overflow-hidden rounded-[5px] border border-[#21415c] bg-[#081522]">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openUserDetails(
                                                            user
                                                        )
                                                    }
                                                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-[10px] text-slate-300 hover:bg-[#10263a]"
                                                >
                                                    <Eye size={13} />
                                                    View Details
                                                </button>

                                                <button
                                                    type="button"
                                                    disabled={
                                                        actionLoading ===
                                                        `${user.id}-status`
                                                    }
                                                    onClick={() =>
                                                        updateUserStatus(
                                                            user
                                                        )
                                                    }
                                                    className="flex w-full items-center gap-2 border-t border-[#173149] px-3 py-2 text-left text-[10px] text-slate-300 hover:bg-[#10263a] disabled:opacity-50"
                                                >
                                                    {user.displayStatus ===
                                                        "Active" ? (
                                                        <>
                                                            <UserX size={13} />
                                                            Deactivate
                                                        </>
                                                    ) : (
                                                        <>
                                                            <UserCheck size={13} />
                                                            Activate
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                </div>
                            )
                        )
                    )}
                </div>

                {/* PAGINATION */}

                {!loading &&
                    normalizedUsers.length > 0 && (
                        <div className="flex flex-col gap-2 border-t border-[#173149] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-[10px] text-slate-600">
                                Page {page} of{" "}
                                {Math.max(
                                    totalPages,
                                    1
                                )}
                            </p>

                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    disabled={
                                        page <= 1
                                    }
                                    onClick={() =>
                                        setPage(
                                            (current) =>
                                                Math.max(
                                                    current -
                                                    1,
                                                    1
                                                )
                                        )
                                    }
                                    className="h-7 rounded-[4px] border border-[#21415c] px-2.5 text-[10px] text-slate-500 transition hover:border-slate-600 hover:text-slate-300 disabled:cursor-not-allowed disabled:opacity-30"
                                >
                                    Prev
                                </button>

                                {visiblePages.map(
                                    (
                                        pageNumber,
                                        index
                                    ) =>
                                        pageNumber ===
                                            "..." ? (
                                            <span
                                                key={`dots-${index}`}
                                                className="px-1 text-[9px] text-slate-700"
                                            >
                                                ...
                                            </span>
                                        ) : (
                                            <button
                                                key={
                                                    pageNumber
                                                }
                                                type="button"
                                                onClick={() =>
                                                    setPage(
                                                        pageNumber
                                                    )
                                                }
                                                className={`h-7 min-w-7 rounded-[4px] border px-2 text-[9px] transition ${page ===
                                                    pageNumber
                                                    ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-400"
                                                    : "border-[#21415c] text-slate-500 hover:border-slate-600 hover:text-slate-300"
                                                    }`}
                                            >
                                                {
                                                    pageNumber
                                                }
                                            </button>
                                        )
                                )}

                                <button
                                    type="button"
                                    disabled={
                                        page >=
                                        totalPages
                                    }
                                    onClick={() =>
                                        setPage(
                                            (current) =>
                                                Math.min(
                                                    current +
                                                    1,
                                                    Math.max(
                                                        totalPages,
                                                        1
                                                    )
                                                )
                                        )
                                    }
                                    className="h-7 rounded-[4px] border border-[#21415c] px-2.5 text-[10px] text-slate-500 transition hover:border-slate-600 hover:text-slate-300 disabled:cursor-not-allowed disabled:opacity-30"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
            </div>

            {/* ROLE DETAILS MODAL */}

            {selectedRole && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-[520px] overflow-hidden rounded-[6px] border border-[#21415c] bg-[#081522] shadow-2xl">
                        <div className="flex items-center justify-between border-b border-[#173149] px-4 py-3">
                            <div>
                                <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-cyan-400">
                                    ROLE DETAILS
                                </p>
                                <h2 className="mt-1 text-sm font-semibold text-white">
                                    {roleLabels[selectedRole.name] ||
                                        selectedRole.name}
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedRole(null)
                                }
                                className="flex h-7 w-7 items-center justify-center rounded-[4px] text-slate-500 hover:bg-[#122b40] hover:text-white"
                            >
                                <X size={15} />
                            </button>
                        </div>

                        <div className="p-5">
                            {roleDetailsLoading ? (
                                <div className="space-y-3">
                                    <div className="h-10 animate-pulse rounded-[5px] bg-[#10263a]" />
                                    <div className="h-20 animate-pulse rounded-[5px] bg-[#10263a]" />
                                </div>
                            ) : (
                                <>
                                    <div className="rounded-[5px] border border-[#173149] bg-[#071827] p-3">
                                        <p className="text-[10px] uppercase tracking-wider text-slate-600">
                                            Description
                                        </p>
                                        <p className="mt-1 text-[10px] leading-5 text-slate-300">
                                            {selectedRole.description ||
                                                "No description available"}
                                        </p>
                                    </div>

                                    <div className="mt-3 rounded-[5px] border border-[#173149] bg-[#071827] p-3">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] uppercase tracking-wider text-slate-600">
                                                Permissions
                                            </p>
                                            <span className="text-[10px] text-slate-600">
                                                {Array.isArray(
                                                    selectedRole.permissions
                                                )
                                                    ? selectedRole.permissions.length
                                                    : 0}
                                            </span>
                                        </div>

                                        <div className="mt-2 grid gap-1.5">
                                            {Array.isArray(
                                                selectedRole.permissions
                                            ) &&
                                                selectedRole.permissions.length > 0 ? (
                                                selectedRole.permissions.map(
                                                    (permission) => (
                                                        <div
                                                            key={
                                                                permission._id ||
                                                                permission
                                                            }
                                                            className="flex items-center justify-between rounded-[4px] border border-[#173149] bg-[#081522] px-2.5 py-2"
                                                        >
                                                            <span className="text-[10px] font-medium text-slate-300">
                                                                {permission.name ||
                                                                    permission}
                                                            </span>

                                                            {permission.action && (
                                                                <span className="text-[9px] text-cyan-400">
                                                                    {
                                                                        permission.action
                                                                    }
                                                                </span>
                                                            )}
                                                        </div>
                                                    )
                                                )
                                            ) : (
                                                <p className="py-3 text-center text-[10px] text-slate-600">
                                                    No permissions assigned
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex justify-end border-t border-[#173149] px-4 py-3">
                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedRole(null)
                                }
                                className="h-8 rounded-[4px] border border-[#21415c] px-4 text-[10px] font-medium text-slate-300 transition hover:border-slate-600 hover:text-white"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* USER DETAILS MODAL */}

            {selectedUser && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-[470px] overflow-hidden rounded-[6px] border border-[#21415c] bg-[#081522] shadow-2xl">
                        <div className="flex items-center justify-between border-b border-[#173149] px-4 py-3">
                            <div>
                                <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-cyan-400">
                                    USER DETAILS
                                </p>

                                <h2 className="mt-1 text-sm font-semibold text-white">
                                    Account Information
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedUser(
                                        null
                                    )
                                }
                                className="flex h-7 w-7 items-center justify-center rounded-[4px] text-slate-500 hover:bg-[#122b40] hover:text-white"
                            >
                                <X size={15} />
                            </button>
                        </div>

                        <div className="p-5">
                            {detailsLoading ? (
                                <div className="space-y-3">
                                    <div className="h-14 animate-pulse rounded-[5px] bg-[#10263a]" />
                                    <div className="h-10 animate-pulse rounded-[5px] bg-[#10263a]" />
                                    <div className="h-10 animate-pulse rounded-[5px] bg-[#10263a]" />
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-3">
                                        <UserAvatar
                                            user={
                                                selectedUser
                                            }
                                            large
                                        />

                                        <div className="min-w-0">
                                            <h3 className="truncate text-sm font-semibold text-white">
                                                {
                                                    selectedUser.name
                                                }
                                            </h3>

                                            <p className="mt-0.5 truncate text-[10px] text-slate-500">
                                                @
                                                {
                                                    selectedUser.username
                                                }
                                            </p>

                                            <div className="mt-2 flex flex-wrap gap-1.5">
                                                <RoleBadge
                                                    role={
                                                        roleLabels[
                                                        selectedUser
                                                            .role
                                                        ] ||
                                                        selectedUser.role
                                                    }
                                                />

                                                <StatusBadge
                                                    status={
                                                        selectedUser.status ||
                                                        (selectedUser.isActive
                                                            ? "Active"
                                                            : "Inactive")
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-5 grid gap-2">
                                        <div className="flex items-center gap-3 rounded-[5px] border border-[#173149] bg-[#071827] px-3 py-2.5">
                                            <Mail
                                                size={14}
                                                className="text-slate-600"
                                            />

                                            <div className="min-w-0">
                                                <p className="text-[10px] uppercase tracking-wider text-slate-600">
                                                    Email
                                                </p>

                                                <p className="mt-0.5 truncate text-[10px] text-slate-300">
                                                    {
                                                        selectedUser.email
                                                    }
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 rounded-[5px] border border-[#173149] bg-[#071827] px-3 py-2.5">
                                            <CalendarDays
                                                size={14}
                                                className="text-slate-600"
                                            />

                                            <div>
                                                <p className="text-[10px] uppercase tracking-wider text-slate-600">
                                                    Joined
                                                </p>

                                                <p className="mt-0.5 text-[10px] text-slate-300">
                                                    {formatDate(
                                                        selectedUser.joined ||
                                                        selectedUser.createdAt
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 rounded-[5px] border border-[#173149] bg-[#071827] px-3 py-2.5">
                                            <CheckCircle2
                                                size={14}
                                                className="text-slate-600"
                                            />

                                            <div>
                                                <p className="text-[10px] uppercase tracking-wider text-slate-600">
                                                    Last Login
                                                </p>

                                                <p className="mt-0.5 text-[10px] text-slate-300">
                                                    {formatLastLogin(
                                                        selectedUser.lastLogin
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 rounded-[5px] border border-blue-500/10 bg-blue-500/5 px-3 py-2.5">
                                        <p className="text-[10px] uppercase tracking-wider text-slate-600">
                                            User ID
                                        </p>

                                        <p className="mt-1 break-all font-mono text-[10px] text-slate-500">
                                            {
                                                selectedUser.id
                                            }
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex justify-end border-t border-[#173149] px-4 py-3">
                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedUser(
                                        null
                                    )
                                }
                                className="h-8 rounded-[4px] border border-[#21415c] px-4 text-[10px] font-medium text-slate-300 transition hover:border-slate-600 hover:text-white"
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

export default UsersRoles;