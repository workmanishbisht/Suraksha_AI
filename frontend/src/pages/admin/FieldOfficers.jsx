import { useEffect, useMemo, useState } from "react";
import {
    Search,
    UserRound,
    UserCheck,
    UserX,
    Mail,
    ShieldCheck,
    MoreHorizontal,
    UserPlus,
    RefreshCw,
    MapPin,
    X,
    Lock,
    Map,
    Eye,
    Edit3,
    Trash2,
    Power,
    AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

const API_BASE_URL = "http://localhost:5000/api";

function FieldOfficers() {
    const [officers, setOfficers] = useState([]);

    const [stats, setStats] = useState({
        totalOfficers: 0,
        activeOfficers: 0,
        inactiveOfficers: 0,
    });

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [showAddModal, setShowAddModal] =
        useState(false);

    const [creating, setCreating] =
        useState(false);

    const [actionMenuId, setActionMenuId] =
        useState(null);

    const [selectedOfficer, setSelectedOfficer] =
        useState(null);

    const [showViewModal, setShowViewModal] =
        useState(false);

    const [showEditModal, setShowEditModal] =
        useState(false);

    const [showDeleteModal, setShowDeleteModal] =
        useState(false);

    const [updating, setUpdating] =
        useState(false);

    const [deleting, setDeleting] =
        useState(false);

    const [editFormData, setEditFormData] =
        useState({
            name: "",
            username: "",
            email: "",
            password: "",
            location: "",
            state: "",
        });

    const [formData, setFormData] = useState({
        name: "",
        username: "",
        email: "",
        password: "",
        location: "",
        state: "",
    });

    /* =========================================
       FETCH OFFICERS
    ========================================== */

    const fetchOfficers = async () => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/field-officers`,
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Unable to fetch field officers"
                );
            }

            setOfficers(data.officers || []);
        } catch (error) {
            console.error(
                "Field Officers Fetch Error:",
                error
            );

            toast.error(
                error.message ||
                "Unable to fetch field officers"
            );
        }
    };

    /* =========================================
       FETCH STATS
    ========================================== */

    const fetchStats = async () => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/field-officers/stats`,
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Unable to fetch officer stats"
                );
            }

            setStats(
                data.stats || {
                    totalOfficers: 0,
                    activeOfficers: 0,
                    inactiveOfficers: 0,
                }
            );
        } catch (error) {
            console.error(
                "Field Officer Stats Error:",
                error
            );

            toast.error(
                error.message ||
                "Unable to fetch officer stats"
            );
        }
    };

    /* =========================================
       LOAD DATA
    ========================================== */

    const loadData = async () => {
        try {
            setLoading(true);

            await Promise.all([
                fetchOfficers(),
                fetchStats(),
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    /* =========================================
       REFRESH
    ========================================== */

    const handleRefresh = async () => {
        try {
            setRefreshing(true);

            await Promise.all([
                fetchOfficers(),
                fetchStats(),
            ]);

            toast.success(
                "Field officers refreshed"
            );
        } finally {
            setRefreshing(false);
        }
    };

    /* =========================================
       FORM CHANGE
    ========================================== */

    const handleFormChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    /* =========================================
       CREATE FIELD OFFICER
    ========================================== */

    const handleCreateOfficer = async (event) => {
        event.preventDefault();

        if (
            !formData.name.trim() ||
            !formData.username.trim() ||
            !formData.email.trim() ||
            !formData.password.trim()
        ) {
            toast.error(
                "Please fill all required fields"
            );

            return;
        }

        if (formData.password.length < 6) {
            toast.error(
                "Password must be at least 6 characters"
            );

            return;
        }

        try {
            setCreating(true);

            const response = await fetch(
                `${API_BASE_URL}/field-officers`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        name: formData.name.trim(),
                        username:
                            formData.username.trim(),
                        email:
                            formData.email.trim(),
                        password:
                            formData.password,
                        location: formData.location
                            .trim()
                            ? {
                                name: formData.location.trim(),
                                state: formData.state.trim(),
                                country: "India",
                                source: "manual",
                            }
                            : null,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Unable to create field officer"
                );
            }

            toast.success(
                "Field officer created successfully"
            );

            setFormData({
                name: "",
                username: "",
                email: "",
                password: "",
                location: "",
                state: "",
            });

            setShowAddModal(false);

            await Promise.all([
                fetchOfficers(),
                fetchStats(),
            ]);
        } catch (error) {
            console.error(
                "Create Field Officer Error:",
                error
            );

            toast.error(
                error.message ||
                "Unable to create field officer"
            );
        } finally {
            setCreating(false);
        }
    };

    /* =========================================
       ACTION MENU
    ========================================== */

    const handleViewOfficer = (officer) => {
        setActionMenuId(null);
        setSelectedOfficer(officer);
        setShowViewModal(true);
    };

    const handleEditOfficer = (officer) => {
        setActionMenuId(null);
        setSelectedOfficer(officer);

        setEditFormData({
            name: officer.name || "",
            username: officer.username || "",
            email: officer.email || "",
            password: "",
            location: officer.location?.name || "",
            state: officer.location?.state || "",
        });

        setShowEditModal(true);
    };

    const handleEditFormChange = (event) => {
        const { name, value } = event.target;

        setEditFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    /* =========================================
       UPDATE FIELD OFFICER
    ========================================== */

    const handleUpdateOfficer = async (event) => {
        event.preventDefault();

        if (!selectedOfficer?._id) {
            return;
        }

        if (
            !editFormData.name.trim() ||
            !editFormData.username.trim() ||
            !editFormData.email.trim()
        ) {
            toast.error(
                "Name, username and email are required"
            );

            return;
        }

        if (
            editFormData.password &&
            editFormData.password.length < 6
        ) {
            toast.error(
                "Password must be at least 6 characters"
            );

            return;
        }

        try {
            setUpdating(true);

            const payload = {
                name: editFormData.name.trim(),
                username:
                    editFormData.username.trim(),
                email:
                    editFormData.email.trim(),
                location: editFormData.location.trim()
                    ? {
                        name: editFormData.location.trim(),
                        state: editFormData.state.trim(),
                        country:
                            selectedOfficer.location
                                ?.country || "India",
                        latitude:
                            selectedOfficer.location
                                ?.latitude,
                        longitude:
                            selectedOfficer.location
                                ?.longitude,
                        source:
                            selectedOfficer.location
                                ?.source || "manual",
                    }
                    : null,
            };

            if (editFormData.password.trim()) {
                payload.password =
                    editFormData.password;
            }

            const response = await fetch(
                `${API_BASE_URL}/field-officers/${selectedOfficer._id}`,
                {
                    method: "PUT",
                    credentials: "include",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify(payload),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Unable to update field officer"
                );
            }

            toast.success(
                "Field officer updated successfully"
            );

            setShowEditModal(false);
            setSelectedOfficer(null);

            await Promise.all([
                fetchOfficers(),
                fetchStats(),
            ]);
        } catch (error) {
            console.error(
                "Update Field Officer Error:",
                error
            );

            toast.error(
                error.message ||
                "Unable to update field officer"
            );
        } finally {
            setUpdating(false);
        }
    };

    /* =========================================
       TOGGLE OFFICER STATUS
    ========================================== */

    const handleToggleStatus = async (officer) => {
        setActionMenuId(null);

        try {
            const response = await fetch(
                `${API_BASE_URL}/field-officers/${officer._id}`,
                {
                    method: "PUT",
                    credentials: "include",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        isActive: !officer.isActive,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Unable to update officer status"
                );
            }

            toast.success(
                officer.isActive
                    ? "Officer deactivated"
                    : "Officer activated"
            );

            await Promise.all([
                fetchOfficers(),
                fetchStats(),
            ]);
        } catch (error) {
            console.error(
                "Toggle Officer Status Error:",
                error
            );

            toast.error(
                error.message ||
                "Unable to update officer status"
            );
        }
    };

    /* =========================================
       DELETE FIELD OFFICER
    ========================================== */

    const handleDeleteOfficer = async () => {
        if (!selectedOfficer?._id) {
            return;
        }

        try {
            setDeleting(true);

            const response = await fetch(
                `${API_BASE_URL}/field-officers/${selectedOfficer._id}`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Unable to delete field officer"
                );
            }

            toast.success(
                "Field officer deleted successfully"
            );

            setShowDeleteModal(false);
            setSelectedOfficer(null);

            await Promise.all([
                fetchOfficers(),
                fetchStats(),
            ]);
        } catch (error) {
            console.error(
                "Delete Field Officer Error:",
                error
            );

            toast.error(
                error.message ||
                "Unable to delete field officer"
            );
        } finally {
            setDeleting(false);
        }
    };

    /* =========================================
       FILTER
    ========================================== */

    const filteredOfficers = useMemo(() => {
        const query = search
            .trim()
            .toLowerCase();

        return officers.filter((officer) => {
            const location =
                officer.location?.name
                    ? `${officer.location.name}, ${officer.location.state || ""
                    }`
                    : "";

            const status = officer.isActive
                ? "Active"
                : "Inactive";

            const matchesSearch =
                !query ||
                officer.name
                    ?.toLowerCase()
                    .includes(query) ||
                officer.username
                    ?.toLowerCase()
                    .includes(query) ||
                officer.email
                    ?.toLowerCase()
                    .includes(query) ||
                location
                    .toLowerCase()
                    .includes(query);

            const matchesStatus =
                statusFilter === "All" ||
                status === statusFilter;

            return (
                matchesSearch &&
                matchesStatus
            );
        });
    }, [
        officers,
        search,
        statusFilter,
    ]);

    return (
        <div className="space-y-5">

            {/* PAGE HEADER */}

            <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <div className="mb-2 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                        <span className="text-[9px] font-medium uppercase tracking-[0.16em] text-emerald-400">
                            Field Operations
                        </span>
                    </div>

                    <h1 className="text-[25px] font-semibold tracking-tight text-white sm:text-[28px]">
                        Field Officers
                    </h1>

                    <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                        Manage and monitor officers assigned to field operations.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() =>
                        setShowAddModal(true)
                    }
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-[5px] border border-cyan-400/30 bg-cyan-400/10 px-3.5 text-[12px] font-medium text-cyan-300 transition hover:border-cyan-400/50 hover:bg-cyan-400/[0.16] hover:text-cyan-200"
                >
                    <UserPlus size={14} />
                    Add Officer
                </button>
            </section>

            {/* STATS */}

            <div className="grid gap-3 sm:grid-cols-3">

                <StatCard
                    icon={UserRound}
                    iconClass="border-cyan-500/10 bg-cyan-500/10 text-cyan-400"
                    value={stats.totalOfficers}
                    title="Total Officers"
                    footer="Registered field officers"
                />

                <StatCard
                    icon={UserCheck}
                    iconClass="border-emerald-500/10 bg-emerald-500/10 text-emerald-400"
                    value={stats.activeOfficers}
                    title="Active Officers"
                    footer="Currently available"
                />

                <StatCard
                    icon={UserX}
                    iconClass="border-red-500/10 bg-red-500/10 text-red-400"
                    value={stats.inactiveOfficers}
                    title="Inactive Officers"
                    footer="Currently unavailable"
                />

            </div>

            {/* OFFICERS PANEL */}

            <section className="overflow-hidden rounded-[6px] border border-[#173149] bg-[#091a2a]">

                <div className="flex flex-col gap-3 border-b border-[#173149] p-3.5 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                        <h2 className="text-[13px] font-semibold text-slate-100">
                            Officer Directory
                        </h2>

                        <p className="mt-1 text-[9px] text-slate-500">
                            {filteredOfficers.length} officers shown
                        </p>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">

                        <div className="relative">
                            <Search
                                size={14}
                                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                            />

                            <input
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value
                                    )
                                }
                                placeholder="Search officers..."
                                className="h-9 w-full rounded-[5px] border border-[#21415c] bg-[#071827] pl-9 pr-3 text-[10px] text-slate-200 outline-none placeholder:text-slate-600 focus:border-cyan-500/50 sm:w-[230px]"
                            />
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(
                                    event.target.value
                                )
                            }
                            className="h-9 rounded-[5px] border border-[#21415c] bg-[#071827] px-3 text-[10px] text-slate-300 outline-none focus:border-cyan-500/50"
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

                        <button
                            type="button"
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[5px] border border-[#21415c] bg-[#071827] text-slate-400 transition hover:border-cyan-500/40 hover:text-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                            title="Refresh"
                        >
                            <RefreshCw
                                size={14}
                                className={
                                    refreshing
                                        ? "animate-spin"
                                        : ""
                                }
                            />
                        </button>

                    </div>
                </div>

                {/* LOADING */}

                {loading ? (
                    <div className="flex min-h-[300px] items-center justify-center">
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            <RefreshCw
                                size={15}
                                className="animate-spin text-cyan-400"
                            />
                            Loading field officers...
                        </div>
                    </div>
                ) : (
                    <>
                        {/* DESKTOP TABLE */}

                        <div className="hidden overflow-x-auto md:block">
                            <table className="w-full min-w-[760px]">

                                <thead>
                                    <tr className="border-b border-[#173149] text-left">

                                        <th className="px-4 py-3 text-[9px] font-medium uppercase tracking-wider text-slate-600">
                                            Officer
                                        </th>

                                        <th className="px-4 py-3 text-[9px] font-medium uppercase tracking-wider text-slate-600">
                                            Contact
                                        </th>

                                        <th className="px-4 py-3 text-[9px] font-medium uppercase tracking-wider text-slate-600">
                                            Location
                                        </th>

                                        <th className="px-4 py-3 text-[9px] font-medium uppercase tracking-wider text-slate-600">
                                            Status
                                        </th>

                                        <th className="px-4 py-3 text-[9px] font-medium uppercase tracking-wider text-slate-600">
                                            Joined
                                        </th>

                                        <th className="px-4 py-3 text-right text-[9px] font-medium uppercase tracking-wider text-slate-600">
                                            Action
                                        </th>

                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-[#173149]">

                                    {filteredOfficers.map(
                                        (officer) => (
                                            <OfficerRow
                                                key={
                                                    officer._id
                                                }
                                                officer={
                                                    officer
                                                }
                                                actionMenuId={
                                                    actionMenuId
                                                }
                                                setActionMenuId={
                                                    setActionMenuId
                                                }
                                                onView={
                                                    handleViewOfficer
                                                }
                                                onEdit={
                                                    handleEditOfficer
                                                }
                                                onToggleStatus={
                                                    handleToggleStatus
                                                }
                                                onDelete={(selected) => {
                                                    setActionMenuId(null);
                                                    setSelectedOfficer(selected);
                                                    setShowDeleteModal(true);
                                                }}
                                            />
                                        )
                                    )}

                                </tbody>

                            </table>
                        </div>

                        {/* MOBILE LIST */}

                        <div className="divide-y divide-[#173149] md:hidden">

                            {filteredOfficers.map(
                                (officer) => (
                                    <OfficerMobileCard
                                        key={
                                            officer._id
                                        }
                                        officer={
                                            officer
                                        }
                                        actionMenuId={
                                            actionMenuId
                                        }
                                        setActionMenuId={
                                            setActionMenuId
                                        }
                                        onView={
                                            handleViewOfficer
                                        }
                                        onEdit={
                                            handleEditOfficer
                                        }
                                        onToggleStatus={
                                            handleToggleStatus
                                        }
                                        onDelete={(selected) => {
                                            setActionMenuId(null);
                                            setSelectedOfficer(selected);
                                            setShowDeleteModal(true);
                                        }}
                                    />
                                )
                            )}

                        </div>

                        {/* EMPTY STATE */}

                        {filteredOfficers.length ===
                            0 && (
                                <div className="py-12 text-center">

                                    <UserRound
                                        size={22}
                                        className="mx-auto text-slate-600"
                                    />

                                    <p className="mt-2 text-[11px] text-slate-500">
                                        {search ||
                                            statusFilter !==
                                            "All"
                                            ? "No field officers match your search."
                                            : "No field officers found."}
                                    </p>

                                </div>
                            )}

                    </>
                )}

            </section>

            {/* ADD OFFICER MODAL */}

            {showAddModal && (
                <AddOfficerModal
                    formData={formData}
                    creating={creating}
                    onChange={handleFormChange}
                    onSubmit={handleCreateOfficer}
                    onClose={() =>
                        setShowAddModal(false)
                    }
                />
            )}

            {showViewModal && selectedOfficer && (
                <ViewOfficerModal
                    officer={selectedOfficer}
                    onClose={() => {
                        setShowViewModal(false);
                        setSelectedOfficer(null);
                    }}
                />
            )}

            {showEditModal && selectedOfficer && (
                <EditOfficerModal
                    formData={editFormData}
                    updating={updating}
                    onChange={handleEditFormChange}
                    onSubmit={handleUpdateOfficer}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedOfficer(null);
                    }}
                />
            )}

            {showDeleteModal && selectedOfficer && (
                <DeleteOfficerModal
                    officer={selectedOfficer}
                    deleting={deleting}
                    onConfirm={handleDeleteOfficer}
                    onClose={() => {
                        setShowDeleteModal(false);
                        setSelectedOfficer(null);
                    }}
                />
            )}

        </div>
    );
}


/* =========================================
   ADD OFFICER MODAL
========================================= */

function AddOfficerModal({
    formData,
    creating,
    onChange,
    onSubmit,
    onClose,
}) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]">

            <div className="w-full max-w-[480px] overflow-hidden rounded-[7px] border border-[#21415c] bg-[#091a2a]">

                {/* HEADER */}

                <div className="flex items-center justify-between border-b border-[#173149] px-5 py-4">

                    <div>
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-[5px] border border-cyan-400/20 bg-cyan-400/10 text-cyan-400">
                                <UserPlus size={15} />
                            </div>

                            <div>
                                <h2 className="text-[13px] font-semibold text-white">
                                    Add Field Officer
                                </h2>

                                <p className="mt-0.5 text-[9px] text-slate-500">
                                    Create a new field officer account
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-7 w-7 items-center justify-center rounded-[4px] text-slate-500 transition hover:bg-white/[0.04] hover:text-white"
                    >
                        <X size={15} />
                    </button>

                </div>

                {/* FORM */}

                <form
                    onSubmit={onSubmit}
                    className="p-5"
                >

                    <div className="grid gap-4 sm:grid-cols-2">

                        <FormField
                            label="Full Name"
                            name="name"
                            value={formData.name}
                            onChange={onChange}
                            placeholder="Amit Verma"
                            required
                        />

                        <FormField
                            label="Username"
                            name="username"
                            value={formData.username}
                            onChange={onChange}
                            placeholder="amit_field"
                            required
                        />

                        <FormField
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={onChange}
                            placeholder="amit@example.com"
                            required
                        />

                        <FormField
                            label="Password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={onChange}
                            placeholder="Minimum 6 characters"
                            required
                        />

                        <FormField
                            label="City / Location"
                            name="location"
                            value={formData.location}
                            onChange={onChange}
                            placeholder="Dehradun"
                        />

                        <FormField
                            label="State"
                            name="state"
                            value={formData.state}
                            onChange={onChange}
                            placeholder="Uttarakhand"
                        />

                    </div>

                    {/* INFO */}

                    <div className="mt-4 flex items-start gap-2 rounded-[5px] border border-cyan-500/10 bg-cyan-500/[0.04] p-3">

                        <ShieldCheck
                            size={13}
                            className="mt-0.5 shrink-0 text-cyan-400"
                        />

                        <p className="text-[9px] leading-4 text-slate-500">
                            The officer will be created with
                            the <span className="text-cyan-400">
                                field_officer
                            </span>{" "}
                            role and active status.
                        </p>

                    </div>

                    {/* ACTIONS */}

                    <div className="mt-5 flex justify-end gap-2">

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={creating}
                            className="h-9 rounded-[5px] border border-[#21415c] bg-[#071827] px-4 text-[10px] font-medium text-slate-400 transition hover:border-[#31516a] hover:text-slate-200 disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={creating}
                            className="inline-flex h-9 items-center justify-center gap-2 rounded-[5px] border border-cyan-400/30 bg-cyan-400/10 px-4 text-[10px] font-medium text-cyan-300 transition hover:border-cyan-400/50 hover:bg-cyan-400/[0.16] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {creating ? (
                                <>
                                    <RefreshCw
                                        size={13}
                                        className="animate-spin"
                                    />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <UserPlus size={13} />
                                    Create Officer
                                </>
                            )}
                        </button>

                    </div>

                </form>

            </div>
        </div>
    );
}


/* =========================================
   VIEW OFFICER MODAL
========================================= */

function ViewOfficerModal({
    officer,
    onClose,
}) {
    if (!officer) {
        return null;
    }

    const location = getLocationText(
        officer.location
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]">

            <div className="w-full max-w-[500px] overflow-hidden rounded-[7px] border border-[#21415c] bg-[#091a2a]">

                <div className="flex items-center justify-between border-b border-[#173149] px-5 py-4">

                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-[5px] border border-cyan-400/20 bg-cyan-400/10 text-cyan-400">
                            <Eye size={15} />
                        </div>

                        <div>
                            <h2 className="text-[13px] font-semibold text-white">
                                Officer Details
                            </h2>

                            <p className="mt-0.5 text-[9px] text-slate-500">
                                Field officer information
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-7 w-7 items-center justify-center rounded-[4px] text-slate-500 transition hover:bg-white/[0.04] hover:text-white"
                    >
                        <X size={15} />
                    </button>

                </div>

                <div className="p-5">

                    <div className="flex items-center gap-3 rounded-[6px] border border-[#173149] bg-[#071827] p-4">

                        <Avatar
                            name={officer.name}
                        />

                        <div className="min-w-0 flex-1">
                            <p className="text-[13px] font-semibold text-white">
                                {officer.name}
                            </p>

                            <p className="mt-0.5 text-[9px] text-slate-500">
                                @{officer.username}
                            </p>
                        </div>

                        <StatusBadge
                            status={
                                officer.isActive
                                    ? "Active"
                                    : "Inactive"
                            }
                        />

                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">

                        <DetailItem
                            icon={Mail}
                            label="Email"
                            value={
                                officer.email ||
                                "—"
                            }
                        />

                        <DetailItem
                            icon={MapPin}
                            label="Location"
                            value={location}
                        />

                        <DetailItem
                            icon={UserRound}
                            label="Role"
                            value="Field Officer"
                        />

                        <DetailItem
                            icon={ShieldCheck}
                            label="Joined"
                            value={formatDate(
                                officer.createdAt
                            )}
                        />

                    </div>

                    <div className="mt-4 flex justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="h-9 rounded-[5px] border border-[#21415c] bg-[#071827] px-4 text-[10px] font-medium text-slate-400 transition hover:border-[#31516a] hover:text-slate-200"
                        >
                            Close
                        </button>
                    </div>

                </div>

            </div>
        </div>
    );
}


/* =========================================
   EDIT OFFICER MODAL
========================================= */

function EditOfficerModal({
    formData,
    updating,
    onChange,
    onSubmit,
    onClose,
}) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]">

            <div className="w-full max-w-[480px] overflow-hidden rounded-[7px] border border-[#21415c] bg-[#091a2a]">

                <div className="flex items-center justify-between border-b border-[#173149] px-5 py-4">

                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-[5px] border border-cyan-400/20 bg-cyan-400/10 text-cyan-400">
                            <Edit3 size={15} />
                        </div>

                        <div>
                            <h2 className="text-[13px] font-semibold text-white">
                                Edit Field Officer
                            </h2>

                            <p className="mt-0.5 text-[9px] text-slate-500">
                                Update officer information
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={updating}
                        className="flex h-7 w-7 items-center justify-center rounded-[4px] text-slate-500 transition hover:bg-white/[0.04] hover:text-white disabled:opacity-50"
                    >
                        <X size={15} />
                    </button>

                </div>

                <form
                    onSubmit={onSubmit}
                    className="p-5"
                >

                    <div className="grid gap-4 sm:grid-cols-2">

                        <FormField
                            label="Full Name"
                            name="name"
                            value={formData.name}
                            onChange={onChange}
                            placeholder="Amit Verma"
                            required
                        />

                        <FormField
                            label="Username"
                            name="username"
                            value={formData.username}
                            onChange={onChange}
                            placeholder="amit_field"
                            required
                        />

                        <FormField
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={onChange}
                            placeholder="amit@example.com"
                            required
                        />

                        <FormField
                            label="New Password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={onChange}
                            placeholder="Leave blank to keep current"
                        />

                        <FormField
                            label="City / Location"
                            name="location"
                            value={formData.location}
                            onChange={onChange}
                            placeholder="Dehradun"
                        />

                        <FormField
                            label="State"
                            name="state"
                            value={formData.state}
                            onChange={onChange}
                            placeholder="Uttarakhand"
                        />

                    </div>

                    <div className="mt-4 flex items-start gap-2 rounded-[5px] border border-cyan-500/10 bg-cyan-500/[0.04] p-3">

                        <ShieldCheck
                            size={13}
                            className="mt-0.5 shrink-0 text-cyan-400"
                        />

                        <p className="text-[9px] leading-4 text-slate-500">
                            Leave the password empty if you do
                            not want to change the current password.
                        </p>

                    </div>

                    <div className="mt-5 flex justify-end gap-2">

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={updating}
                            className="h-9 rounded-[5px] border border-[#21415c] bg-[#071827] px-4 text-[10px] font-medium text-slate-400 transition hover:border-[#31516a] hover:text-slate-200 disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={updating}
                            className="inline-flex h-9 items-center justify-center gap-2 rounded-[5px] border border-cyan-400/30 bg-cyan-400/10 px-4 text-[10px] font-medium text-cyan-300 transition hover:border-cyan-400/50 hover:bg-cyan-400/[0.16] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {updating ? (
                                <>
                                    <RefreshCw
                                        size={13}
                                        className="animate-spin"
                                    />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Edit3 size={13} />
                                    Save Changes
                                </>
                            )}
                        </button>

                    </div>

                </form>

            </div>
        </div>
    );
}


/* =========================================
   DELETE CONFIRMATION MODAL
========================================= */

function DeleteOfficerModal({
    officer,
    deleting,
    onConfirm,
    onClose,
}) {
    if (!officer) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]">

            <div className="w-full max-w-[400px] overflow-hidden rounded-[7px] border border-red-500/20 bg-[#091a2a]">

                <div className="p-5">

                    <div className="flex items-start gap-3">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[5px] border border-red-400/20 bg-red-400/10 text-red-400">
                            <AlertTriangle
                                size={17}
                            />
                        </div>

                        <div>
                            <h2 className="text-[13px] font-semibold text-white">
                                Delete Field Officer?
                            </h2>

                            <p className="mt-1 text-[10px] leading-4 text-slate-500">
                                This will permanently remove{" "}
                                <span className="text-slate-300">
                                    {officer.name}
                                </span>{" "}
                                from the field officers list.
                            </p>
                        </div>

                    </div>

                    <div className="mt-4 rounded-[5px] border border-[#173149] bg-[#071827] p-3">

                        <p className="text-[10px] font-medium text-slate-300">
                            @{officer.username}
                        </p>

                        <p className="mt-1 text-[9px] text-slate-600">
                            {officer.email}
                        </p>

                    </div>

                    <div className="mt-5 flex justify-end gap-2">

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={deleting}
                            className="h-9 rounded-[5px] border border-[#21415c] bg-[#071827] px-4 text-[10px] font-medium text-slate-400 transition hover:border-[#31516a] hover:text-slate-200 disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={deleting}
                            className="inline-flex h-9 items-center justify-center gap-2 rounded-[5px] border border-red-400/30 bg-red-400/10 px-4 text-[10px] font-medium text-red-400 transition hover:border-red-400/50 hover:bg-red-400/[0.16] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {deleting ? (
                                <>
                                    <RefreshCw
                                        size={13}
                                        className="animate-spin"
                                    />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 size={13} />
                                    Delete Officer
                                </>
                            )}
                        </button>

                    </div>

                </div>

            </div>
        </div>
    );
}


/* =========================================
   DETAIL ITEM
========================================= */

function DetailItem({
    icon: Icon,
    label,
    value,
}) {
    return (
        <div className="rounded-[5px] border border-[#173149] bg-[#071827] p-3">

            <div className="flex items-center gap-2">

                <Icon
                    size={12}
                    className="text-slate-600"
                />

                <span className="text-[8px] font-medium uppercase tracking-wider text-slate-600">
                    {label}
                </span>

            </div>

            <p className="mt-2 truncate text-[10px] text-slate-300">
                {value}
            </p>

        </div>
    );
}


/* =========================================
   FORM FIELD
========================================= */

function FormField({
    label,
    name,
    type = "text",
    value,
    onChange,
    placeholder,
    required = false,
}) {
    return (
        <div>
            <label className="mb-1.5 block text-[9px] font-medium uppercase tracking-wider text-slate-500">
                {label}
                {required && (
                    <span className="ml-1 text-red-400">
                        *
                    </span>
                )}
            </label>

            <div className="relative">

                {type === "password" ? (
                    <Lock
                        size={12}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
                    />
                ) : name === "location" ||
                    name === "state" ? (
                    <Map
                        size={12}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
                    />
                ) : (
                    <UserRound
                        size={12}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
                    />
                )}

                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    className="h-9 w-full rounded-[5px] border border-[#21415c] bg-[#071827] pl-8 pr-3 text-[10px] text-slate-200 outline-none placeholder:text-slate-700 focus:border-cyan-500/50"
                />

            </div>
        </div>
    );
}


/* =========================================
   STAT CARD
========================================= */

function StatCard({
    icon: Icon,
    iconClass,
    value,
    title,
    footer,
}) {
    return (
        <div className="group relative overflow-hidden rounded-[6px] border border-[#173149] bg-[#091a2a] p-4 transition hover:border-[#28516c]">

            <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-cyan-400/[0.02] blur-2xl" />

            <div className="relative flex items-start gap-3">

                <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[6px] border ${iconClass}`}
                >
                    <Icon
                        size={20}
                        strokeWidth={1.8}
                    />
                </div>

                <div className="min-w-0 flex-1">

                    <p className="text-[23px] font-semibold leading-none text-white">
                        {value}
                    </p>

                    <p className="mt-2 text-[11px] text-slate-400">
                        {title}
                    </p>

                </div>

            </div>

            <div className="relative mt-4 flex items-center gap-2">

                <ShieldCheck
                    size={11}
                    className="text-slate-600"
                />

                <p className="text-[9px] text-slate-500">
                    {footer}
                </p>

            </div>

        </div>
    );
}


/* =========================================
   DESKTOP ROW
========================================= */

function OfficerRow({
    officer,
    actionMenuId,
    setActionMenuId,
    onView,
    onEdit,
    onToggleStatus,
    onDelete,
}) {
    const location = getLocationText(
        officer.location
    );

    const status = officer.isActive
        ? "Active"
        : "Inactive";

    return (
        <tr className="group transition hover:bg-white/[0.018]">

            <td className="px-4 py-3.5">
                <div className="flex items-center gap-3">

                    <Avatar
                        name={officer.name}
                    />

                    <div className="min-w-0">

                        <p className="truncate text-[11px] font-medium text-slate-200">
                            {officer.name}
                        </p>

                        <p className="mt-0.5 text-[9px] text-slate-600">
                            @{officer.username}
                        </p>

                    </div>

                </div>
            </td>

            <td className="px-4 py-3.5">

                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">

                    <Mail
                        size={11}
                        className="text-slate-600"
                    />

                    {officer.email}

                </div>

            </td>

            <td className="px-4 py-3.5">

                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">

                    <MapPin
                        size={11}
                        className="text-slate-600"
                    />

                    {location}

                </div>

            </td>

            <td className="px-4 py-3.5">

                <StatusBadge
                    status={status}
                />

            </td>

            <td className="px-4 py-3.5">

                <p className="text-[10px] text-slate-500">
                    {formatDate(
                        officer.createdAt
                    )}
                </p>

            </td>

            <td className="px-4 py-3.5 text-right">

                <ActionButton
                    officer={officer}
                    isOpen={
                        actionMenuId === officer._id
                    }
                    onToggle={() =>
                        setActionMenuId(
                            actionMenuId === officer._id
                                ? null
                                : officer._id
                        )
                    }
                    onView={() => onView(officer)}
                    onEdit={() => onEdit(officer)}
                    onToggleStatus={() =>
                        onToggleStatus(officer)
                    }
                    onDelete={() => onDelete(officer)}
                />

            </td>

        </tr>
    );
}


/* =========================================
   MOBILE CARD
========================================= */

function OfficerMobileCard({
    officer,
    actionMenuId,
    setActionMenuId,
    onView,
    onEdit,
    onToggleStatus,
    onDelete,
}) {
    const location = getLocationText(
        officer.location
    );

    const status = officer.isActive
        ? "Active"
        : "Inactive";

    return (
        <div className="p-4">

            <div className="flex items-start gap-3">

                <Avatar
                    name={officer.name}
                />

                <div className="min-w-0 flex-1">

                    <div className="flex items-start justify-between gap-2">

                        <div className="min-w-0">

                            <p className="truncate text-[11px] font-medium text-slate-200">
                                {officer.name}
                            </p>

                            <p className="mt-0.5 text-[9px] text-slate-600">
                                @{officer.username}
                            </p>

                        </div>

                        <StatusBadge
                            status={status}
                        />

                    </div>

                    <div className="mt-3 space-y-1.5">

                        <InfoLine
                            icon={Mail}
                            value={officer.email}
                        />

                        <InfoLine
                            icon={MapPin}
                            value={location}
                        />

                    </div>

                    <div className="mt-3 flex items-center justify-between">

                        <span className="text-[9px] text-slate-600">
                            Joined{" "}
                            {formatDate(
                                officer.createdAt
                            )}
                        </span>

                        <ActionButton
                            officer={officer}
                            isOpen={
                                actionMenuId ===
                                officer._id
                            }
                            onToggle={() =>
                                setActionMenuId(
                                    actionMenuId ===
                                        officer._id
                                        ? null
                                        : officer._id
                                )
                            }
                            onView={() =>
                                handleViewOfficer(
                                    officer
                                )
                            }
                            onEdit={() =>
                                handleEditOfficer(
                                    officer
                                )
                            }
                            onToggleStatus={() =>
                                handleToggleStatus(
                                    officer
                                )
                            }
                            onDelete={() => {
                                setActionMenuId(null);
                                setSelectedOfficer(
                                    officer
                                );
                                setShowDeleteModal(
                                    true
                                );
                            }}
                        />

                    </div>

                </div>

            </div>

        </div>
    );
}


/* =========================================
   AVATAR
========================================= */

function Avatar({ name = "" }) {
    const initials = name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[5px] border border-cyan-400/15 bg-cyan-400/[0.08] text-[10px] font-semibold text-cyan-400">
            {initials || "FO"}
        </div>
    );
}


/* =========================================
   STATUS BADGE
========================================= */

function StatusBadge({ status }) {
    const active = status === "Active";

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[8px] font-medium ${active
                    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-400"
                    : "border-slate-500/20 bg-slate-500/10 text-slate-400"
                }`}
        >

            <span
                className={`h-1.5 w-1.5 rounded-full ${active
                        ? "bg-emerald-400"
                        : "bg-slate-500"
                    }`}
            />

            {status}

        </span>
    );
}


/* =========================================
   INFO LINE
========================================= */

function InfoLine({
    icon: Icon,
    value,
}) {
    return (
        <div className="flex min-w-0 items-center gap-1.5 text-[9px] text-slate-500">

            <Icon
                size={10}
                className="shrink-0 text-slate-600"
            />

            <span className="truncate">
                {value}
            </span>

        </div>
    );
}


/* =========================================
   ACTION BUTTON
========================================= */

function ActionButton({
    officer,
    isOpen,
    onToggle,
    onView,
    onEdit,
    onToggleStatus,
    onDelete,
}) {
    return (
        <div className="relative inline-block">

            <button
                type="button"
                onClick={onToggle}
                className={`flex h-7 w-7 items-center justify-center rounded-[4px] border bg-[#071827] transition ${isOpen
                        ? "border-cyan-500/50 text-cyan-400"
                        : "border-[#21415c] text-slate-500 hover:border-cyan-500/40 hover:text-cyan-400"
                    }`}
                title="More actions"
            >
                <MoreHorizontal size={14} />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-8 z-50 w-[155px] overflow-hidden rounded-[5px] border border-[#21415c] bg-[#091a2a] p-1.5 shadow-xl">

                    <button
                        type="button"
                        onClick={onView}
                        className="flex w-full items-center gap-2 rounded-[4px] px-2.5 py-2 text-left text-[9px] text-slate-400 transition hover:bg-cyan-400/[0.06] hover:text-cyan-300"
                    >
                        <Eye size={12} />
                        View Details
                    </button>

                    <button
                        type="button"
                        onClick={onEdit}
                        className="flex w-full items-center gap-2 rounded-[4px] px-2.5 py-2 text-left text-[9px] text-slate-400 transition hover:bg-cyan-400/[0.06] hover:text-cyan-300"
                    >
                        <Edit3 size={12} />
                        Edit Officer
                    </button>

                    <button
                        type="button"
                        onClick={onToggleStatus}
                        className="flex w-full items-center gap-2 rounded-[4px] px-2.5 py-2 text-left text-[9px] text-slate-400 transition hover:bg-emerald-400/[0.06] hover:text-emerald-300"
                    >
                        <Power size={12} />
                        {officer.isActive
                            ? "Deactivate"
                            : "Activate"}
                    </button>

                    <div className="my-1 border-t border-[#173149]" />

                    <button
                        type="button"
                        onClick={onDelete}
                        className="flex w-full items-center gap-2 rounded-[4px] px-2.5 py-2 text-left text-[9px] text-red-400 transition hover:bg-red-400/[0.06] hover:text-red-300"
                    >
                        <Trash2 size={12} />
                        Delete Officer
                    </button>

                </div>
            )}

        </div>
    );
}


/* =========================================
   HELPERS
========================================= */

function getLocationText(location) {
    if (!location) {
        return "Location not set";
    }

    const parts = [
        location.name,
        location.state,
    ].filter(Boolean);

    return parts.length
        ? parts.join(", ")
        : "Location not set";
}


function formatDate(dateValue) {
    if (!dateValue) {
        return "—";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleDateString(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
}


export default FieldOfficers;