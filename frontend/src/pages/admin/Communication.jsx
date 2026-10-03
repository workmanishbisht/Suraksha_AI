import { useEffect, useState } from "react";
import {
    Bell,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock3,
    Megaphone,
    Pencil,
    Plus,
    Search,
    Send,
    ShieldAlert,
    Trash2,
    Users,
    X,
} from "lucide-react";
import { toast } from "sonner";

const API_BASE_URL = "http://localhost:5000/api";

const initialForm = {
    title: "",
    message: "",
    type: "General",
    audience: "All Citizens",
    priority: "Normal",
    status: "Sent",
};

function Communication() {
    const [announcements, setAnnouncements] = useState([]);
    const [stats, setStats] = useState({
        totalMessages: 0,
        sentMessages: 0,
        scheduledMessages: 0,
        criticalMessages: 0,
    });

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [typeFilter, setTypeFilter] = useState("All");

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const [selectedAnnouncement, setSelectedAnnouncement] =
        useState(null);

    const [form, setForm] = useState(initialForm);

    const [loading, setLoading] = useState(false);
    const [statsLoading, setStatsLoading] = useState(false);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const itemsPerPage = 8;

    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter, typeFilter]);

    useEffect(() => {
        fetchAnnouncements();
    }, [search, statusFilter, typeFilter, currentPage]);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams({
                page: String(currentPage),
                limit: String(itemsPerPage),
            });

            if (search.trim()) {
                params.append("search", search.trim());
            }

            if (statusFilter !== "All") {
                params.append("status", statusFilter);
            }

            if (typeFilter !== "All") {
                params.append("type", typeFilter);
            }

            const response = await fetch(
                `${API_BASE_URL}/announcements?${params.toString()}`,
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                    "Unable to fetch announcements."
                );
            }

            const formattedAnnouncements =
                (data.announcements || []).map(
                    (announcement) => ({
                        ...announcement,
                        id:
                            announcement._id ||
                            announcement.id,
                    })
                );

            setAnnouncements(formattedAnnouncements);

            setTotalPages(
                Math.max(
                    data.pagination?.totalPages || 1,
                    1
                )
            );

            setTotalItems(
                data.pagination?.total || 0
            );
        } catch (error) {
            console.error(
                "Fetch Announcements Error:",
                error
            );

            toast.error(
                error.message ||
                "Unable to fetch announcements."
            );
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            setStatsLoading(true);

            const response = await fetch(
                `${API_BASE_URL}/announcements/stats`,
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                    "Unable to fetch communication statistics."
                );
            }

            setStats({
                totalMessages:
                    data.stats?.totalMessages || 0,
                sentMessages:
                    data.stats?.sentMessages || 0,
                scheduledMessages:
                    data.stats?.scheduledMessages || 0,
                criticalMessages:
                    data.stats?.criticalMessages || 0,
            });
        } catch (error) {
            console.error(
                "Fetch Announcement Stats Error:",
                error
            );

            toast.error(
                error.message ||
                "Unable to fetch statistics."
            );
        } finally {
            setStatsLoading(false);
        }
    };

    const fetchAnnouncementById = async (id) => {
        try {
            setDetailsLoading(true);

            const response = await fetch(
                `${API_BASE_URL}/announcements/${id}`,
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                    "Unable to fetch announcement details."
                );
            }

            setSelectedAnnouncement({
                ...data.announcement,
                id:
                    data.announcement?._id ||
                    data.announcement?.id,
            });
        } catch (error) {
            console.error(
                "Fetch Announcement Details Error:",
                error
            );

            toast.error(
                error.message ||
                "Unable to fetch announcement details."
            );
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleCreateAnnouncement = async (e) => {
        e.preventDefault();

        if (!form.title.trim()) {
            toast.error(
                "Announcement title is required."
            );
            return;
        }

        if (!form.message.trim()) {
            toast.error(
                "Announcement message is required."
            );
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                `${API_BASE_URL}/announcements`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        title: form.title.trim(),
                        message: form.message.trim(),
                        type: form.type,
                        audience: form.audience,
                        priority: form.priority,
                        status: form.status,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                    "Unable to create announcement."
                );
            }

            setForm(initialForm);
            setShowCreateModal(false);
            setCurrentPage(1);

            await Promise.all([
                fetchAnnouncements(),
                fetchStats(),
            ]);

            toast.success(
                "Announcement created successfully."
            );
        } catch (error) {
            console.error(
                "Create Announcement Error:",
                error
            );

            toast.error(
                error.message ||
                "Unable to create announcement."
            );
        } finally {
            setLoading(false);
        }
    };

    const openEditModal = () => {
        if (!selectedAnnouncement) {
            return;
        }

        setForm({
            title: selectedAnnouncement.title || "",
            message:
                selectedAnnouncement.message || "",
            type:
                selectedAnnouncement.type ||
                "General",
            audience:
                selectedAnnouncement.audience ||
                "All Citizens",
            priority:
                selectedAnnouncement.priority ||
                "Normal",
            status:
                selectedAnnouncement.status ||
                "Sent",
        });

        setShowEditModal(true);
    };

    const handleUpdateAnnouncement = async (e) => {
        e.preventDefault();

        if (!selectedAnnouncement?.id) {
            return;
        }

        if (!form.title.trim()) {
            toast.error(
                "Announcement title is required."
            );
            return;
        }

        if (!form.message.trim()) {
            toast.error(
                "Announcement message is required."
            );
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                `${API_BASE_URL}/announcements/${selectedAnnouncement.id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        title: form.title.trim(),
                        message: form.message.trim(),
                        type: form.type,
                        audience: form.audience,
                        priority: form.priority,
                        status: form.status,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                    "Unable to update announcement."
                );
            }

            const updatedAnnouncement = {
                ...data.announcement,
                id:
                    data.announcement?._id ||
                    data.announcement?.id,
            };

            setSelectedAnnouncement(
                updatedAnnouncement
            );

            setShowEditModal(false);
            setForm(initialForm);

            await Promise.all([
                fetchAnnouncements(),
                fetchStats(),
            ]);

            toast.success(
                "Announcement updated successfully."
            );
        } catch (error) {
            console.error(
                "Update Announcement Error:",
                error
            );

            toast.error(
                error.message ||
                "Unable to update announcement."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAnnouncement = async () => {
        if (!selectedAnnouncement?.id) {
            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to delete this announcement?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeleteLoading(true);

            const response = await fetch(
                `${API_BASE_URL}/announcements/${selectedAnnouncement.id}`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                    "Unable to delete announcement."
                );
            }

            setSelectedAnnouncement(null);
            setShowEditModal(false);

            await Promise.all([
                fetchAnnouncements(),
                fetchStats(),
            ]);

            toast.success(
                "Announcement deleted successfully."
            );
        } catch (error) {
            console.error(
                "Delete Announcement Error:",
                error
            );

            toast.error(
                error.message ||
                "Unable to delete announcement."
            );
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleFormChange = (field, value) => {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const formatDate = (date) => {
        if (!date) {
            return "—";
        }

        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };

    const formatTime = (date) => {
        if (!date) {
            return "";
        }

        return new Date(date).toLocaleTimeString(
            "en-IN",
            {
                hour: "2-digit",
                minute: "2-digit",
            }
        );
    };

    const getPriorityClass = (priority) => {
        switch (priority) {
            case "Critical":
                return "border-red-500/20 bg-red-500/10 text-red-400";
            case "High":
                return "border-orange-500/20 bg-orange-500/10 text-orange-400";
            case "Low":
                return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
            default:
                return "border-blue-500/20 bg-blue-500/10 text-blue-400";
        }
    };

    const getStatusClass = (status) => {
        if (status === "Sent") {
            return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
        }

        return "border-amber-500/20 bg-amber-500/10 text-amber-400";
    };

    const closeCreateModal = () => {
        if (loading) {
            return;
        }

        setShowCreateModal(false);
        setForm(initialForm);
    };

    const closeEditModal = () => {
        if (loading) {
            return;
        }

        setShowEditModal(false);
        setForm(initialForm);
    };

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div>
                    <div className="mb-2 flex items-center gap-2">
                        <span className="h-5 w-1 rounded-full bg-[var(--info)]" />

                        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--info)]">
                            COMMUNICATION CENTER
                        </span>
                    </div>

                    <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
                        Communication
                    </h1>

                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                        Create and manage emergency alerts,
                        announcements, and citizen
                        notifications.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => {
                        setForm(initialForm);
                        setShowCreateModal(true);
                    }}
                    className="flex h-10 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--primary)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--primary-hover)]"
                >
                    <Plus className="h-4 w-4" />
                    New Announcement
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    icon={Megaphone}
                    label="Total Messages"
                    value={
                        statsLoading
                            ? "..."
                            : stats.totalMessages
                    }
                    iconClass="text-blue-400"
                    iconBg="bg-blue-500/10"
                />

                <StatCard
                    icon={Send}
                    label="Sent"
                    value={
                        statsLoading
                            ? "..."
                            : stats.sentMessages
                    }
                    iconClass="text-emerald-400"
                    iconBg="bg-emerald-500/10"
                />

                <StatCard
                    icon={Clock3}
                    label="Scheduled"
                    value={
                        statsLoading
                            ? "..."
                            : stats.scheduledMessages
                    }
                    iconClass="text-amber-400"
                    iconBg="bg-amber-500/10"
                />

                <StatCard
                    icon={ShieldAlert}
                    label="Critical Alerts"
                    value={
                        statsLoading
                            ? "..."
                            : stats.criticalMessages
                    }
                    iconClass="text-red-400"
                    iconBg="bg-red-500/10"
                />
            </div>

            <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
                <div className="flex flex-col gap-3 lg:flex-row">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            placeholder="Search announcements..."
                            className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--background)] pl-10 pr-4 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--primary)]"
                        />
                    </div>

                    <select
                        value={typeFilter}
                        onChange={(e) =>
                            setTypeFilter(e.target.value)
                        }
                        className="h-10 min-w-[150px] rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--background)] px-3 text-sm text-[var(--text-secondary)] outline-none focus:border-[var(--primary)]"
                    >
                        <option value="All">
                            All Types
                        </option>
                        <option value="Alert">
                            Alert
                        </option>
                        <option value="Advisory">
                            Advisory
                        </option>
                        <option value="System">
                            System
                        </option>
                        <option value="General">
                            General
                        </option>
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) =>
                            setStatusFilter(e.target.value)
                        }
                        className="h-10 min-w-[150px] rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--background)] px-3 text-sm text-[var(--text-secondary)] outline-none focus:border-[var(--primary)]"
                    >
                        <option value="All">
                            All Status
                        </option>
                        <option value="Sent">
                            Sent
                        </option>
                        <option value="Scheduled">
                            Scheduled
                        </option>
                    </select>
                </div>
            </div>

            <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px]">
                        <thead>
                            <tr className="border-b border-[var(--border)] bg-[var(--background)]">
                                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                                    Announcement
                                </th>

                                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                                    Type
                                </th>

                                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                                    Audience
                                </th>

                                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                                    Priority
                                </th>

                                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                                    Status
                                </th>

                                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                                    Date
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading &&
                                announcements.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-5 py-12 text-center"
                                    >
                                        <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-[var(--border-light)] border-t-[var(--primary)]" />

                                        <p className="mt-3 text-sm text-[var(--text-muted)]">
                                            Loading
                                            announcements...
                                        </p>
                                    </td>
                                </tr>
                            ) : announcements.length > 0 ? (
                                announcements.map(
                                    (announcement) => (
                                        <tr
                                            key={
                                                announcement.id
                                            }
                                            onClick={() =>
                                                fetchAnnouncementById(
                                                    announcement.id
                                                )
                                            }
                                            className="cursor-pointer border-b border-[var(--border)] last:border-b-0 transition hover:bg-[var(--surface-hover)]"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--primary)]/10">
                                                        <Bell className="h-4 w-4 text-[var(--primary-light)]" />
                                                    </div>

                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                                                            {
                                                                announcement.title
                                                            }
                                                        </p>

                                                        <p className="mt-1 max-w-[330px] truncate text-xs text-[var(--text-muted)]">
                                                            {
                                                                announcement.message
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4 text-sm text-[var(--text-secondary)]">
                                                {
                                                    announcement.type
                                                }
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                                                    <Users className="h-4 w-4 text-[var(--text-muted)]" />
                                                    {
                                                        announcement.audience
                                                    }
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${getPriorityClass(
                                                        announcement.priority
                                                    )}`}
                                                >
                                                    {
                                                        announcement.priority
                                                    }
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${getStatusClass(
                                                        announcement.status
                                                    )}`}
                                                >
                                                    {announcement.status ===
                                                        "Sent" ? (
                                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                                    ) : (
                                                        <Clock3 className="h-3.5 w-3.5" />
                                                    )}

                                                    {
                                                        announcement.status
                                                    }
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <p className="text-sm text-[var(--text-secondary)]">
                                                    {formatDate(
                                                        announcement.createdAt
                                                    )}
                                                </p>

                                                <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
                                                    {formatTime(
                                                        announcement.createdAt
                                                    )}
                                                </p>
                                            </td>
                                        </tr>
                                    )
                                )
                            ) : (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-5 py-12 text-center"
                                    >
                                        <Megaphone className="mx-auto h-8 w-8 text-[var(--text-muted)]" />

                                        <p className="mt-3 text-sm font-medium text-[var(--text-secondary)]">
                                            No announcements
                                            found
                                        </p>

                                        <p className="mt-1 text-xs text-[var(--text-muted)]">
                                            Try changing your
                                            search or filters.
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {totalItems > 0 && (
                    <div className="flex items-center justify-between border-t border-[var(--border)] px-5 py-3">
                        <p className="text-xs text-[var(--text-muted)]">
                            Showing{" "}
                            <span className="font-medium text-[var(--text-secondary)]">
                                {(currentPage - 1) *
                                    itemsPerPage +
                                    1}
                            </span>{" "}
                            to{" "}
                            <span className="font-medium text-[var(--text-secondary)]">
                                {Math.min(
                                    currentPage *
                                    itemsPerPage,
                                    totalItems
                                )}
                            </span>{" "}
                            of{" "}
                            <span className="font-medium text-[var(--text-secondary)]">
                                {totalItems}
                            </span>
                        </p>

                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                disabled={
                                    currentPage === 1 ||
                                    loading
                                }
                                onClick={() =>
                                    setCurrentPage(
                                        (page) =>
                                            page - 1
                                    )
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] text-[var(--text-muted)] transition hover:bg-[var(--surface-hover)] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>

                            <span className="px-2 text-xs text-[var(--text-secondary)]">
                                {currentPage} /{" "}
                                {totalPages}
                            </span>

                            <button
                                type="button"
                                disabled={
                                    currentPage ===
                                    totalPages ||
                                    loading
                                }
                                onClick={() =>
                                    setCurrentPage(
                                        (page) =>
                                            page + 1
                                    )
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] text-[var(--text-muted)] transition hover:bg-[var(--surface-hover)] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {showCreateModal && (
                <AnnouncementFormModal
                    title="New Announcement"
                    description="Send a notification to selected users."
                    form={form}
                    loading={loading}
                    onChange={handleFormChange}
                    onClose={closeCreateModal}
                    onSubmit={handleCreateAnnouncement}
                    submitText="Send Announcement"
                />
            )}

            {selectedAnnouncement && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
                    onMouseDown={() => {
                        if (!showEditModal) {
                            setSelectedAnnouncement(
                                null
                            );
                        }
                    }}
                >
                    <div
                        className="w-full max-w-[520px] rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-lg)]"
                        onMouseDown={(e) =>
                            e.stopPropagation()
                        }
                    >
                        <div className="flex items-start justify-between border-b border-[var(--border)] px-5 py-4">
                            <div>
                                <div className="mb-2 flex items-center gap-2">
                                    <Megaphone className="h-4 w-4 text-[var(--primary-light)]" />

                                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--primary-light)]">
                                        Announcement
                                    </span>
                                </div>

                                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                                    {
                                        selectedAnnouncement.title
                                    }
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedAnnouncement(
                                        null
                                    )
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] text-[var(--text-muted)] transition hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {detailsLoading ? (
                            <div className="flex items-center justify-center p-10">
                                <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--border-light)] border-t-[var(--primary)]" />
                            </div>
                        ) : (
                            <>
                                <div className="space-y-5 p-5">
                                    <p className="text-sm leading-6 text-[var(--text-secondary)]">
                                        {
                                            selectedAnnouncement.message
                                        }
                                    </p>

                                    <div className="grid grid-cols-2 gap-3">
                                        <DetailItem
                                            label="Type"
                                            value={
                                                selectedAnnouncement.type
                                            }
                                        />

                                        <DetailItem
                                            label="Audience"
                                            value={
                                                selectedAnnouncement.audience
                                            }
                                        />

                                        <DetailItem
                                            label="Priority"
                                            value={
                                                selectedAnnouncement.priority
                                            }
                                        />

                                        <DetailItem
                                            label="Status"
                                            value={
                                                selectedAnnouncement.status
                                            }
                                        />
                                    </div>

                                    <div className="border-t border-[var(--border)] pt-4">
                                        <p className="text-[11px] text-[var(--text-muted)]">
                                            Created
                                        </p>

                                        <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                            {formatDate(
                                                selectedAnnouncement.createdAt
                                            )}{" "}
                                            at{" "}
                                            {formatTime(
                                                selectedAnnouncement.createdAt
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-2 border-t border-[var(--border)] px-5 py-4">
                                    <button
                                        type="button"
                                        onClick={
                                            handleDeleteAnnouncement
                                        }
                                        disabled={
                                            deleteLoading
                                        }
                                        className="flex h-9 items-center gap-2 rounded-[var(--radius-md)] border border-red-500/30 px-3 text-xs font-medium text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />

                                        {deleteLoading
                                            ? "Deleting..."
                                            : "Delete"}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openEditModal();
                                        }}
                                        className="flex h-9 items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-light)] px-3 text-xs font-medium text-[var(--text-secondary)] transition hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                        Edit
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSelectedAnnouncement(
                                                null
                                            )
                                        }
                                        className="flex h-9 items-center rounded-[var(--radius-md)] bg-[var(--primary)] px-3 text-xs font-semibold text-white transition hover:bg-[var(--primary-hover)]"
                                    >
                                        Close
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {showEditModal && (
                <AnnouncementFormModal
                    title="Edit Announcement"
                    description="Update announcement details."
                    form={form}
                    loading={loading}
                    onChange={handleFormChange}
                    onClose={closeEditModal}
                    onSubmit={handleUpdateAnnouncement}
                    submitText="Update Announcement"
                />
            )}
        </div>
    );
}

function AnnouncementFormModal({
    title,
    description,
    form,
    loading,
    onChange,
    onClose,
    onSubmit,
    submitText,
}) {
    return (
        <div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onMouseDown={onClose}
        >
            <div
                className="w-full max-w-[560px] rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-lg)]"
                onMouseDown={(e) =>
                    e.stopPropagation()
                }
            >
                <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
                    <div>
                        <h2 className="text-base font-semibold text-[var(--text-primary)]">
                            {title}
                        </h2>

                        <p className="mt-1 text-xs text-[var(--text-muted)]">
                            {description}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] text-[var(--text-muted)] transition hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] disabled:opacity-50"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <form
                    onSubmit={onSubmit}
                    className="space-y-4 p-5"
                >
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
                            Title
                        </label>

                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) =>
                                onChange(
                                    "title",
                                    e.target.value
                                )
                            }
                            placeholder="Enter announcement title"
                            className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--background)] px-3 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--primary)]"
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
                            Message
                        </label>

                        <textarea
                            rows={5}
                            value={form.message}
                            onChange={(e) =>
                                onChange(
                                    "message",
                                    e.target.value
                                )
                            }
                            placeholder="Write your announcement..."
                            className="w-full resize-none rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--primary)]"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <SelectField
                            label="Type"
                            value={form.type}
                            onChange={(value) =>
                                onChange(
                                    "type",
                                    value
                                )
                            }
                            options={[
                                "General",
                                "Alert",
                                "Advisory",
                                "System",
                            ]}
                        />

                        <SelectField
                            label="Audience"
                            value={form.audience}
                            onChange={(value) =>
                                onChange(
                                    "audience",
                                    value
                                )
                            }
                            options={[
                                "All Citizens",
                                "All Users",
                                "Citizens",
                                "Field Officers",
                                "Department Officers",
                            ]}
                        />

                        <SelectField
                            label="Priority"
                            value={form.priority}
                            onChange={(value) =>
                                onChange(
                                    "priority",
                                    value
                                )
                            }
                            options={[
                                "Low",
                                "Normal",
                                "High",
                                "Critical",
                            ]}
                        />

                        <SelectField
                            label="Status"
                            value={form.status}
                            onChange={(value) =>
                                onChange(
                                    "status",
                                    value
                                )
                            }
                            options={[
                                "Sent",
                                "Scheduled",
                            ]}
                        />
                    </div>

                    <div className="flex justify-end gap-2 border-t border-[var(--border)] pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="h-10 rounded-[var(--radius-md)] border border-[var(--border-light)] px-4 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--surface-hover)] disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex h-10 items-center gap-2 rounded-[var(--radius-md)] bg-[var(--primary)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Send className="h-4 w-4" />

                            {loading
                                ? "Saving..."
                                : submitText}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function StatCard({
    icon: Icon,
    label,
    value,
    iconClass,
    iconBg,
}) {
    return (
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs text-[var(--text-muted)]">
                        {label}
                    </p>

                    <p className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">
                        {value}
                    </p>
                </div>

                <div
                    className={`flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] ${iconBg}`}
                >
                    <Icon
                        className={`h-5 w-5 ${iconClass}`}
                    />
                </div>
            </div>
        </div>
    );
}

function SelectField({
    label,
    value,
    onChange,
    options,
}) {
    return (
        <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
                {label}
            </label>

            <select
                value={value}
                onChange={(e) =>
                    onChange(e.target.value)
                }
                className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--background)] px-3 text-sm text-[var(--text-secondary)] outline-none focus:border-[var(--primary)]"
            >
                {options.map((option) => (
                    <option
                        key={option}
                        value={option}
                    >
                        {option}
                    </option>
                ))}
            </select>
        </div>
    );
}

function DetailItem({ label, value }) {
    return (
        <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background)] p-3">
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                {label}
            </p>

            <p className="mt-1 text-sm font-medium text-[var(--text-secondary)]">
                {value || "—"}
            </p>
        </div>
    );
}

export default Communication;