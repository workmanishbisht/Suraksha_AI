
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    ShieldCheck,
    KeyRound,
    RefreshCw,
    Save,
    Search,
    Check,
    LockKeyhole,
    AlertCircle,
    Eye,
    Plus,
    Pencil,
    Trash2,
    CheckSquare,
    Square,
} from "lucide-react";
import { toast } from "sonner";

const API_BASE_URL = "http://localhost:5000/api";

const ROLE_LABELS = {
    admin: "Admin",
    citizen: "Citizen",
    field_officer: "Field Officer",
    department_officer: "Department Officer",
};

const ACTIONS = [
    { key: "read", label: "View", icon: Eye },
    { key: "create", label: "Create", icon: Plus },
    { key: "update", label: "Update", icon: Pencil },
    { key: "delete", label: "Delete", icon: Trash2 },
];

const panelClass =
    "rounded-[6px] border border-[#173149] bg-[#091a2a]";

const buttonClass =
    "inline-flex h-9 items-center justify-center gap-2 rounded-[5px] border border-[#21415c] px-3 text-[11px] font-medium text-slate-300 transition hover:border-cyan-500/40 hover:text-cyan-400 disabled:cursor-not-allowed disabled:opacity-40";

function getRoleLabel(name) {
    return ROLE_LABELS[name] || name || "Unknown Role";
}

function normalizePermissions(permissions) {
    return Array.isArray(permissions) ? permissions : [];
}

function getPermissionId(permission) {
    return typeof permission === "string"
        ? permission
        : permission?._id;
}

function getPermissionName(permission) {
    return typeof permission === "string"
        ? permission
        : permission?.name;
}

function StatCard({ label, value, description, icon: Icon, color }) {
    return (
        <div className="rounded-[6px] border border-[#173149] bg-[#091a2a] p-4 transition hover:border-[#28506d]">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                        {label}
                    </p>
                    <p className="mt-2 text-[24px] font-semibold leading-none text-white">
                        {value}
                    </p>
                    <p className="mt-2 text-[10px] text-slate-500">
                        {description}
                    </p>
                </div>

                <div
                    className={`flex h-9 w-9 items-center justify-center rounded-[5px] border ${color}`}
                >
                    <Icon size={16} />
                </div>
            </div>
        </div>
    );
}

function RolesPermissions() {
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [selectedRoleId, setSelectedRoleId] = useState("");

    const [selectedPermissions, setSelectedPermissions] = useState([]);
    const [savedPermissions, setSavedPermissions] = useState([]);

    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [permissionsDenied, setPermissionsDenied] = useState(false);

    const selectedRole = useMemo(
        () => roles.find((role) => role._id === selectedRoleId) || null,
        [roles, selectedRoleId]
    );

    const fetchData = useCallback(async (showRefresh = false) => {
        try {
            if (showRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const [rolesResponse, permissionsResponse] = await Promise.all([
                fetch(`${API_BASE_URL}/roles`, {
                    method: "GET",
                    credentials: "include",
                }),
                fetch(`${API_BASE_URL}/permissions`, {
                    method: "GET",
                    credentials: "include",
                }),
            ]);

            const rolesData = await rolesResponse.json();
            const permissionsData = await permissionsResponse.json();

            if (!rolesResponse.ok || !rolesData.success) {
                throw new Error(
                    rolesData.message || "Unable to fetch roles"
                );
            }

            if (permissionsResponse.status === 403) {
                setPermissionsDenied(true);
                setPermissions([]);
                throw new Error(
                    "Your account does not have permissions.read access."
                );
            }

            if (!permissionsResponse.ok || !permissionsData.success) {
                throw new Error(
                    permissionsData.message || "Unable to fetch permissions"
                );
            }

            const fetchedRoles = Array.isArray(rolesData.roles)
                ? rolesData.roles
                : [];

            const fetchedPermissions = Array.isArray(
                permissionsData.permissions
            )
                ? permissionsData.permissions
                : [];

            setRoles(fetchedRoles);
            setPermissions(fetchedPermissions);
            setPermissionsDenied(false);

            setSelectedRoleId((currentId) => {
                if (fetchedRoles.some((role) => role._id === currentId)) {
                    return currentId;
                }

                return fetchedRoles[0]?._id || "";
            });
        } catch (error) {
            console.error("Roles & Permissions Error:", error);
            toast.error(error.message || "Unable to load access control data");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (!selectedRole) {
            setSelectedPermissions([]);
            setSavedPermissions([]);
            return;
        }

        const assignedIds = normalizePermissions(
            selectedRole.permissions
        )
            .map(getPermissionId)
            .filter(Boolean);

        setSelectedPermissions(assignedIds);
        setSavedPermissions(assignedIds);
        setSearch("");
    }, [selectedRole]);

    const permissionGroups = useMemo(() => {
        const filteredPermissions = permissions.filter((permission) => {
            const text =
                `${permission.name} ${permission.resource} ${permission.action} ${permission.description || ""}`.toLowerCase();

            return text.includes(search.trim().toLowerCase());
        });

        const grouped = new Map();

        filteredPermissions.forEach((permission) => {
            const resource = permission.resource || "other";

            if (!grouped.has(resource)) {
                grouped.set(resource, []);
            }

            grouped.get(resource).push(permission);
        });

        return Array.from(grouped.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([resource, items]) => ({
                resource,
                permissions: items.sort((a, b) =>
                    a.action.localeCompare(b.action)
                ),
            }));
    }, [permissions, search]);

    const allPermissionIds = useMemo(
        () =>
            permissions
                .map(getPermissionId)
                .filter(Boolean),
        [permissions]
    );

    const hasUnsavedChanges = useMemo(() => {
        const current = [...selectedPermissions].sort();
        const saved = [...savedPermissions].sort();

        return (
            current.length !== saved.length ||
            current.some((id, index) => id !== saved[index])
        );
    }, [selectedPermissions, savedPermissions]);

    const togglePermission = (permissionId) => {
        setSelectedPermissions((current) =>
            current.includes(permissionId)
                ? current.filter((id) => id !== permissionId)
                : [...current, permissionId]
        );
    };

    const toggleResource = (resourcePermissions, checked) => {
        const ids = resourcePermissions
            .map(getPermissionId)
            .filter(Boolean);

        setSelectedPermissions((current) => {
            if (checked) {
                return [...new Set([...current, ...ids])];
            }

            return current.filter((id) => !ids.includes(id));
        });
    };

    const toggleAll = (checked) => {
        setSelectedPermissions((current) => {
            if (checked) {
                return [...new Set([...current, ...allPermissionIds])];
            }

            return current.filter((id) => !allPermissionIds.includes(id));
        });
    };

    const saveChanges = async () => {
        if (!selectedRole?._id) {
            toast.error("Please select a role first");
            return;
        }

        try {
            setSaving(true);

            const response = await fetch(
                `${API_BASE_URL}/roles/${selectedRole._id}/permissions`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        permissions: selectedPermissions,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                if (response.status === 403) {
                    throw new Error(
                        "Access denied. Your role needs permissions.update to save these changes."
                    );
                }

                throw new Error(
                    data.message || "Unable to save role permissions"
                );
            }

            const updatedRole = data.role;

            if (updatedRole) {
                setRoles((current) =>
                    current.map((role) =>
                        role._id === updatedRole._id ? updatedRole : role
                    )
                );

                const savedIds = normalizePermissions(
                    updatedRole.permissions
                )
                    .map(getPermissionId)
                    .filter(Boolean);

                setSelectedPermissions(savedIds);
                setSavedPermissions(savedIds);
            } else {
                setSavedPermissions([...selectedPermissions]);
            }

            toast.success("Role permissions saved successfully");
        } catch (error) {
            console.error("Save Permissions Error:", error);
            toast.error(error.message || "Unable to save permissions");
        } finally {
            setSaving(false);
        }
    };

    const discardChanges = () => {
        setSelectedPermissions([...savedPermissions]);
        toast.message("Unsaved changes discarded");
    };

    const getActionPermission = (resource, action) =>
        permissions.find(
            (permission) =>
                permission.resource === resource &&
                permission.action === action
        );

    const selectedCount = selectedPermissions.length;

    const allSelected =
        allPermissionIds.length > 0 &&
        allPermissionIds.every((id) => selectedPermissions.includes(id));

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
                        Roles & Permissions
                    </h1>

                    <p className="mt-2 max-w-2xl text-[12px] leading-5 text-slate-500">
                        Control which actions each role can access across the
                        platform.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => fetchData(true)}
                    disabled={loading || refreshing || saving}
                    className={buttonClass}
                >
                    <RefreshCw
                        size={14}
                        className={
                            loading || refreshing ? "animate-spin" : ""
                        }
                    />
                    Refresh
                </button>
            </div>

            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <StatCard
                    icon={ShieldCheck}
                    label="Available Roles"
                    value={loading ? "—" : roles.length}
                    description="Roles registered in the database"
                    color="border-cyan-500/20 bg-cyan-500/10 text-cyan-400"
                />

                <StatCard
                    icon={KeyRound}
                    label="Available Permissions"
                    value={loading ? "—" : permissions.length}
                    description="Permissions available to assign"
                    color="border-purple-500/20 bg-purple-500/10 text-purple-400"
                />

                <StatCard
                    icon={Check}
                    label="Assigned Permissions"
                    value={loading ? "—" : selectedCount}
                    description={
                        selectedRole
                            ? `Currently selected for ${getRoleLabel(selectedRole.name)}`
                            : "Select a role to view assignments"
                    }
                    color="border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                />
            </div>

            {/* LOADING / ERROR */}
            {loading && roles.length === 0 ? (
                <div className={`${panelClass} space-y-3 p-5`}>
                    <div className="h-5 w-44 animate-pulse rounded bg-[#10263a]" />
                    <div className="h-10 animate-pulse rounded bg-[#10263a]" />
                    <div className="h-40 animate-pulse rounded bg-[#10263a]" />
                </div>
            ) : permissionsDenied ? (
                <div className={`${panelClass} flex items-start gap-3 p-5`}>
                    <LockKeyhole
                        size={20}
                        className="mt-0.5 shrink-0 text-amber-400"
                    />
                    <div>
                        <p className="text-[13px] font-medium text-slate-200">
                            Permission access restricted
                        </p>
                        <p className="mt-1 text-[11px] leading-5 text-slate-500">
                            Your current role does not have permissions.read
                            access. Ask an administrator to review the role
                            permissions.
                        </p>
                    </div>
                </div>
            ) : (
                <>
                    {/* ROLE SELECTOR */}
                    <section className={`${panelClass} overflow-hidden`}>
                        <div className="flex flex-col gap-2 border-b border-[#173149] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-400">
                                    ACCESS CONTROL
                                </p>
                                <h2 className="mt-1 text-[14px] font-semibold text-white">
                                    Select a role
                                </h2>
                            </div>

                            <span className="text-[10px] text-slate-600">
                                {roles.length} roles
                            </span>
                        </div>

                        {roles.length === 0 ? (
                            <div className="p-8 text-center">
                                <ShieldCheck
                                    size={24}
                                    className="mx-auto text-slate-700"
                                />
                                <p className="mt-3 text-[12px] text-slate-400">
                                    No roles found
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 xl:grid-cols-4">
                                {roles.map((role) => {
                                    const active = role._id === selectedRoleId;
                                    const assignedCount =
                                        normalizePermissions(role.permissions).length;

                                    return (
                                        <button
                                            type="button"
                                            key={role._id}
                                            onClick={() =>
                                                setSelectedRoleId(role._id)
                                            }
                                            className={`rounded-[5px] border p-3 text-left transition ${active
                                                    ? "border-cyan-500/50 bg-cyan-500/[0.07]"
                                                    : "border-[#173149] bg-[#071827] hover:border-[#28506d]"
                                                }`}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div
                                                    className={`flex h-8 w-8 items-center justify-center rounded-[4px] border ${active
                                                            ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-400"
                                                            : "border-[#21415c] bg-[#10263a] text-slate-400"
                                                        }`}
                                                >
                                                    <ShieldCheck size={15} />
                                                </div>

                                                {active && (
                                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-400 text-[#071827]">
                                                        <Check size={12} />
                                                    </span>
                                                )}
                                            </div>

                                            <p className="mt-3 text-[12px] font-semibold text-slate-200">
                                                {getRoleLabel(role.name)}
                                            </p>

                                            <p className="mt-1 line-clamp-2 min-h-8 text-[10px] leading-4 text-slate-500">
                                                {role.description ||
                                                    "No description available"}
                                            </p>

                                            <p className="mt-3 text-[10px] text-slate-500">
                                                {assignedCount} assigned
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    {/* PERMISSIONS MATRIX */}
                    <section className={`${panelClass} overflow-hidden`}>
                        <div className="flex flex-col gap-3 border-b border-[#173149] p-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-400">
                                    PERMISSION MATRIX
                                </p>

                                <h2 className="mt-1 text-[15px] font-semibold text-white">
                                    {selectedRole
                                        ? `${getRoleLabel(selectedRole.name)} permissions`
                                        : "Permissions"}
                                </h2>

                                <p className="mt-1 text-[10px] text-slate-500">
                                    Select the actions this role is allowed to
                                    perform.
                                </p>
                            </div>

                            <div className="relative w-full lg:max-w-[280px]">
                                <Search
                                    size={14}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
                                />
                                <input
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Search permissions..."
                                    className="h-9 w-full rounded-[5px] border border-[#21415c] bg-[#071827] pl-9 pr-3 text-[11px] text-slate-200 outline-none placeholder:text-slate-600 focus:border-cyan-500/50"
                                />
                            </div>
                        </div>

                        {/* MATRIX TOOLBAR */}
                        <div className="flex flex-col gap-3 border-b border-[#173149] bg-[#071827] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                            <button
                                type="button"
                                onClick={() => toggleAll(!allSelected)}
                                disabled={!permissions.length || !selectedRole}
                                className="inline-flex items-center gap-2 self-start text-[11px] text-slate-400 transition hover:text-cyan-400 disabled:opacity-40"
                            >
                                {allSelected ? (
                                    <CheckSquare size={15} />
                                ) : (
                                    <Square size={15} />
                                )}
                                {allSelected ? "Deselect All" : "Select All"}
                            </button>

                            <p className="text-[10px] text-slate-500">
                                {selectedCount} of {permissions.length}{" "}
                                permissions selected
                            </p>
                        </div>

                        {/* MATRIX TABLE */}
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[680px]">
                                <thead>
                                    <tr className="border-b border-[#173149] bg-[#071827] text-left">
                                        <th className="px-4 py-3 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                                            Module
                                        </th>

                                        {ACTIONS.map((action) => (
                                            <th
                                                key={action.key}
                                                className="px-3 py-3 text-center text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-600"
                                            >
                                                <span className="inline-flex items-center justify-center gap-1.5">
                                                    <action.icon size={12} />
                                                    {action.label}
                                                </span>
                                            </th>
                                        ))}

                                        <th className="px-3 py-3 text-center text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                                            Manage
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-[#173149]">
                                    {permissionGroups.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-4 py-14 text-center"
                                            >
                                                <AlertCircle
                                                    size={22}
                                                    className="mx-auto text-slate-700"
                                                />
                                                <p className="mt-3 text-[12px] text-slate-400">
                                                    No permissions found
                                                </p>
                                                <p className="mt-1 text-[10px] text-slate-600">
                                                    Try another search or check
                                                    the permissions in your
                                                    database.
                                                </p>
                                            </td>
                                        </tr>
                                    ) : (
                                        permissionGroups.map((group) => {
                                            const groupIds =
                                                group.permissions
                                                    .map(getPermissionId)
                                                    .filter(Boolean);

                                            const groupSelected =
                                                groupIds.length > 0 &&
                                                groupIds.every((id) =>
                                                    selectedPermissions.includes(id)
                                                );

                                            return (
                                                <tr
                                                    key={group.resource}
                                                    className="transition hover:bg-[#0b1d2e]"
                                                >
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <button
                                                                type="button"
                                                                aria-label={`Toggle all ${group.resource} permissions`}
                                                                onClick={() =>
                                                                    toggleResource(
                                                                        group.permissions,
                                                                        !groupSelected
                                                                    )
                                                                }
                                                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] border ${groupSelected
                                                                        ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-400"
                                                                        : "border-[#21415c] bg-[#10263a] text-slate-500"
                                                                    }`}
                                                            >
                                                                {groupSelected ? (
                                                                    <Check size={14} />
                                                                ) : (
                                                                    <KeyRound size={14} />
                                                                )}
                                                            </button>

                                                            <div>
                                                                <p className="text-[12px] font-medium capitalize text-slate-200">
                                                                    {group.resource.replace(
                                                                        /[_-]/g,
                                                                        " "
                                                                    )}
                                                                </p>
                                                                <p className="mt-1 text-[10px] text-slate-600">
                                                                    {group.permissions.length} available
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {ACTIONS.map((action) => {
                                                        const permission =
                                                            getActionPermission(
                                                                group.resource,
                                                                action.key
                                                            );

                                                        if (!permission) {
                                                            return (
                                                                <td
                                                                    key={action.key}
                                                                    className="px-3 py-4 text-center"
                                                                >
                                                                    <span className="text-[10px] text-slate-700">
                                                                        —
                                                                    </span>
                                                                </td>
                                                            );
                                                        }

                                                        const id =
                                                            getPermissionId(
                                                                permission
                                                            );

                                                        const checked =
                                                            selectedPermissions.includes(
                                                                id
                                                            );

                                                        return (
                                                            <td
                                                                key={action.key}
                                                                className="px-3 py-4 text-center"
                                                            >
                                                                <label className="inline-flex cursor-pointer items-center justify-center">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={checked}
                                                                        onChange={() =>
                                                                            togglePermission(
                                                                                id
                                                                            )
                                                                        }
                                                                        className="peer sr-only"
                                                                        aria-label={`${action.label} ${group.resource}`}
                                                                    />
                                                                    <span
                                                                        className={`flex h-[18px] w-[18px] items-center justify-center rounded-[4px] border transition ${checked
                                                                                ? "border-cyan-400 bg-cyan-400 text-[#071827]"
                                                                                : "border-[#34516a] bg-[#071827] text-transparent peer-hover:border-cyan-500/50"
                                                                            }`}
                                                                    >
                                                                        <Check size={12} />
                                                                    </span>
                                                                </label>
                                                            </td>
                                                        );
                                                    })}

                                                    {(() => {
                                                        const managePermission =
                                                            getActionPermission(
                                                                group.resource,
                                                                "manage"
                                                            );

                                                        if (!managePermission) {
                                                            return (
                                                                <td className="px-3 py-4 text-center">
                                                                    <span className="text-[10px] text-slate-700">
                                                                        —
                                                                    </span>
                                                                </td>
                                                            );
                                                        }

                                                        const id =
                                                            getPermissionId(
                                                                managePermission
                                                            );

                                                        const checked =
                                                            selectedPermissions.includes(
                                                                id
                                                            );

                                                        return (
                                                            <td className="px-3 py-4 text-center">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={checked}
                                                                    onChange={() =>
                                                                        togglePermission(
                                                                            id
                                                                        )
                                                                    }
                                                                    aria-label={`Manage ${group.resource}`}
                                                                    className="h-4 w-4 cursor-pointer accent-cyan-400"
                                                                />
                                                            </td>
                                                        );
                                                    })()}
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* SAVE BAR */}
                        <div className="flex flex-col gap-3 border-t border-[#173149] bg-[#071827] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2">
                                <span
                                    className={`h-2 w-2 rounded-full ${hasUnsavedChanges
                                            ? "bg-amber-400"
                                            : "bg-emerald-400"
                                        }`}
                                />
                                <p className="text-[10px] text-slate-500">
                                    {hasUnsavedChanges
                                        ? "You have unsaved changes"
                                        : "All changes are saved"}
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    type="button"
                                    onClick={discardChanges}
                                    disabled={!hasUnsavedChanges || saving}
                                    className={buttonClass}
                                >
                                    Discard
                                </button>

                                <button
                                    type="button"
                                    onClick={saveChanges}
                                    disabled={
                                        !selectedRole ||
                                        !hasUnsavedChanges ||
                                        saving ||
                                        loading
                                    }
                                    className="inline-flex h-9 items-center justify-center gap-2 rounded-[5px] border border-cyan-400/30 bg-cyan-400 px-4 text-[11px] font-semibold text-[#061522] transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    {saving ? (
                                        <RefreshCw
                                            size={14}
                                            className="animate-spin"
                                        />
                                    ) : (
                                        <Save size={14} />
                                    )}
                                    {saving ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </div>
                    </section>
                </>
            )}
        </div>
    );
}

export default RolesPermissions;
