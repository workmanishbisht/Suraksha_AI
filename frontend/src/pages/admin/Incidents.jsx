import { useEffect, useMemo, useState } from "react";
import {
    Search,
    SlidersHorizontal,
    Plus,
    MoreHorizontal,
    Eye,
    Pencil,
    Trash2,
    MapPin,
    Clock3,
    Users,
    AlertTriangle,
    CheckCircle2,
    Radio,
    ChevronDown,
    ArrowUpRight,
    X,
} from "lucide-react";

const API_BASE_URL = "http://localhost:5000/api";


const severityStyles = {
    Critical: {
        dot: "bg-red-400",
        text: "text-red-400",
        bg: "bg-red-500/[0.08]",
        border: "border-red-500/20",
    },
    High: {
        dot: "bg-orange-400",
        text: "text-orange-400",
        bg: "bg-orange-500/[0.08]",
        border: "border-orange-500/20",
    },
    Medium: {
        dot: "bg-amber-400",
        text: "text-amber-400",
        bg: "bg-amber-500/[0.08]",
        border: "border-amber-500/20",
    },
    Low: {
        dot: "bg-emerald-400",
        text: "text-emerald-400",
        bg: "bg-emerald-500/[0.08]",
        border: "border-emerald-500/20",
    },
};

const statusStyles = {
    Active: {
        dot: "bg-red-400",
        text: "text-red-400",
        bg: "bg-red-500/[0.08]",
        border: "border-red-500/20",
    },
    Responding: {
        dot: "bg-blue-400",
        text: "text-blue-400",
        bg: "bg-blue-500/[0.08]",
        border: "border-blue-500/20",
    },
    Investigating: {
        dot: "bg-amber-400",
        text: "text-amber-400",
        bg: "bg-amber-500/[0.08]",
        border: "border-amber-500/20",
    },
    Resolved: {
        dot: "bg-emerald-400",
        text: "text-emerald-400",
        bg: "bg-emerald-500/[0.08]",
        border: "border-emerald-500/20",
    },
};

function StatCard({
    icon: Icon,
    label,
    value,
    subtext,
    iconClass,
}) {
    return (
        <div
            className="
                group rounded-[6px]
                border border-[#173149]
                bg-[#091a2a]
                p-4
                transition-all duration-200
                hover:border-[#28506d]
                hover:bg-[#0b1d2e]
            "
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                        {label}
                    </p>

                    <h3 className="mt-2 text-[25px] font-semibold leading-none text-white">
                        {value}
                    </h3>

                    <p className="mt-2 text-[9px] text-slate-600">
                        {subtext}
                    </p>
                </div>

                <div
                    className={`
                        flex h-9 w-9 items-center justify-center
                        rounded-[6px] border
                        ${iconClass}
                    `}
                >
                    <Icon size={17} strokeWidth={1.8} />
                </div>
            </div>
        </div>
    );
}

function SeverityBadge({ severity }) {
    const severityKey = String(severity || "").toLowerCase();

    const severityMap = {
        critical: "Critical",
        high: "High",
        medium: "Medium",
        low: "Low",
    };

    const displaySeverity =
        severityMap[severityKey] || "Medium";

    const style =
        severityStyles[displaySeverity] ||
        severityStyles.Medium;

    return (
        <span
            className={`
                inline-flex items-center gap-1.5
                rounded-[4px]
                border px-2 py-1
                text-[9px] font-medium
                ${style.bg}
                ${style.border}
                ${style.text}
            `}
        >
            <span
                className={`h-1.5 w-1.5 rounded-full ${style.dot}`}
            />
            {displaySeverity}
        </span>
    );
}

function StatusBadge({ status }) {
    const statusKey = String(status || "").toLowerCase();

    const statusMap = {
        active: "Active",
        reported: "Active",
        responding: "Responding",
        investigating: "Investigating",
        resolved: "Resolved",
        rejected: "Rejected",
    };

    const displayStatus =
        statusMap[statusKey] || "Active";

    const style =
        statusStyles[displayStatus] || {
            dot: "bg-slate-400",
            text: "text-slate-400",
            bg: "bg-slate-500/[0.08]",
            border: "border-slate-500/20",
        };

    return (
        <span
            className={`
                inline-flex items-center gap-1.5
                rounded-[4px]
                border px-2 py-1
                text-[9px] font-medium
                ${style.bg}
                ${style.border}
                ${style.text}
            `}
        >
            <span
                className={`h-1.5 w-1.5 rounded-full ${style.dot}`}
            />
            {displayStatus}
        </span>
    );
}

function Incidents() {
    const [incidents, setIncidents] = useState([]);
    const [search, setSearch] = useState("");
    const [severity, setSeverity] = useState("All Severity");
    const [status, setStatus] = useState("All Status");
    const [openMenu, setOpenMenu] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showReportModal, setShowReportModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedIncident, setSelectedIncident] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState("");
    const [form, setForm] = useState({
        title: "",
        description: "",
        type: "flood",
        severity: "medium",
        location: {
            address: "",
            city: "",
            state: "",
            country: "India",
            latitude: "",
            longitude: "",
        },
        peopleAffected: "0",
    });

    const fetchIncidents = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `${API_BASE_URL}/incidents`,
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Unable to fetch incidents"
                );
            }

            setIncidents(data.incidents || []);
        } catch (error) {
            console.error("Fetch Incidents Error:", error);
            setError(error.message || "Unable to fetch incidents");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIncidents();
    }, []);

    const formatType = (type) => {
        if (!type) return "Other";

        return type
            .replace(/_/g, " ")
            .replace(/\b\w/g, (char) => char.toUpperCase());
    };

    const formatSeverity = (value) => {
        if (!value) return "Medium";
        return value.charAt(0).toUpperCase() + value.slice(1);
    };

    const formatStatus = (value) => {
        if (!value) return "Active";

        const statusMap = {
            reported: "Active",
            active: "Active",
            investigating: "Investigating",
            responding: "Responding",
            resolved: "Resolved",
            rejected: "Rejected",
        };

        return (
            statusMap[String(value).toLowerCase()] ||
            String(value)
                .replace(/_/g, " ")
                .replace(/\b\w/g, (char) => char.toUpperCase())
        );
    };

    const getLocation = (incident) => {
        const location = incident.location || {};

        return [
            location.address,
            location.city,
            location.state,
        ]
            .filter(Boolean)
            .join(", ") || "Location unavailable";
    };

    const getTimeAgo = (date) => {
        if (!date) return "Unknown";

        const diff = Date.now() - new Date(date).getTime();
        const minutes = Math.floor(diff / 60000);

        if (minutes < 1) return "Just now";
        if (minutes < 60) return `${minutes} min ago`;

        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} hr ago`;

        const days = Math.floor(hours / 24);
        return `${days} day${days > 1 ? "s" : ""} ago`;
    };

    const normalizedIncidents = useMemo(() => {
        return incidents.map((incident) => {
            const createdDate = incident.createdAt
                ? new Date(incident.createdAt)
                : null;

            const year =
                createdDate && !Number.isNaN(createdDate.getTime())
                    ? createdDate.getFullYear()
                    : new Date().getFullYear();

            const shortId = incident._id
                ? String(incident._id).slice(-4).toUpperCase()
                : "0000";

            return {
                ...incident,
                id: `INC-${year}-${shortId}`,
                mongoId: incident._id,
                rawType: incident.type,
                rawSeverity: incident.severity,
                rawStatus: incident.status,
                type: formatType(incident.type),
                severity: formatSeverity(incident.severity),
                status: formatStatus(incident.status),
                location: getLocation(incident),
                people: Number(incident.peopleAffected) || 0,
                time: getTimeAgo(incident.createdAt),
            };
        });
    }, [incidents]);

    const filteredIncidents = useMemo(() => {
        return normalizedIncidents.filter((incident) => {
            const query = search.toLowerCase().trim();

            const matchesSearch =
                String(incident.title || "")
                    .toLowerCase()
                    .includes(query) ||
                String(incident.id || "")
                    .toLowerCase()
                    .includes(query) ||
                String(incident.location || "")
                    .toLowerCase()
                    .includes(query) ||
                String(incident.type || "")
                    .toLowerCase()
                    .includes(query);

            const matchesSeverity =
                severity === "All Severity" ||
                incident.severity === severity;

            const matchesStatus =
                status === "All Status" ||
                incident.status === status;

            return (
                matchesSearch &&
                matchesSeverity &&
                matchesStatus
            );
        });
    }, [normalizedIncidents, search, severity, status]);

    const totalIncidents = incidents.length;

    const activeIncidents = incidents.filter(
        (incident) =>
            ["reported", "active", "investigating"].includes(
                String(incident.status || "").toLowerCase()
            )
    ).length;

    const respondingIncidents = incidents.filter(
        (incident) => incident.status === "responding"
    ).length;

    const resolvedIncidents = incidents.filter(
        (incident) => incident.status === "resolved"
    ).length;

    const openDetailsModal = (incident) => {
        setSelectedIncident(incident);
        setOpenMenu(null);
        setShowDetailsModal(true);
    };

    const openEditModal = (incident) => {
        setSelectedIncident(incident);
        setForm({
            title: incident.title || "",
            description: incident.description || "",
            type: incident.rawType || "other",
            severity: incident.rawSeverity || "medium",
            status: incident.rawStatus || "reported",
            location: {
                address: incident.location?.address || "",
                city: incident.location?.city || "",
                state: incident.location?.state || "",
                country: incident.location?.country || "India",
                latitude: incident.location?.latitude ?? "",
                longitude: incident.location?.longitude ?? "",
            },
            peopleAffected: String(incident.peopleAffected ?? incident.people ?? 0),
        });
        setFormError("");
        setOpenMenu(null);
        setShowEditModal(true);
    };

    const closeDetailsModal = () => {
        setShowDetailsModal(false);
        setSelectedIncident(null);
    };

    const closeEditModal = () => {
        if (submitting) return;
        setShowEditModal(false);
        setSelectedIncident(null);
        resetForm();
    };

    const updateIncident = async (event) => {
        event.preventDefault();

        if (!selectedIncident?.mongoId) return;

        if (!form.title.trim()) {
            setFormError("Incident title is required.");
            return;
        }

        if (!form.location.city.trim()) {
            setFormError("City is required.");
            return;
        }

        try {
            setSubmitting(true);
            setFormError("");

            const payload = {
                title: form.title.trim(),
                description: form.description.trim(),
                type: form.type,
                severity: form.severity,
                status: form.status,
                location: {
                    address: form.location.address.trim(),
                    city: form.location.city.trim(),
                    state: form.location.state.trim(),
                    country: form.location.country.trim() || "India",
                    latitude: form.location.latitude === "" ? undefined : Number(form.location.latitude),
                    longitude: form.location.longitude === "" ? undefined : Number(form.location.longitude),
                },
                peopleAffected: Math.max(0, Number(form.peopleAffected) || 0),
            };

            const response = await fetch(`${API_BASE_URL}/incidents/${selectedIncident.mongoId}`, {
                method: "PUT",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Unable to update incident");
            }

            setIncidents((current) =>
                current.map((incident) =>
                    incident._id === selectedIncident.mongoId ? data.incident : incident
                )
            );

            closeEditModal();
        } catch (error) {
            console.error("Update Incident Error:", error);
            setFormError(error.message || "Unable to update incident");
        } finally {
            setSubmitting(false);
        }
    };

    const clearFilters = () => {
        setSearch("");
        setSeverity("All Severity");
        setStatus("All Status");
    };

    const deleteIncident = async (id) => {
        if (!id) return;

        const confirmed = window.confirm(
            "Are you sure you want to delete this incident?"
        );

        if (!confirmed) return;

        try {
            const response = await fetch(
                `${API_BASE_URL}/incidents/${id}`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Unable to delete incident"
                );
            }

            setIncidents((current) =>
                current.filter((incident) => incident._id !== id)
            );

            setOpenMenu(null);
        } catch (error) {
            console.error("Delete Incident Error:", error);
            window.alert(
                error.message || "Unable to delete incident"
            );
        }
    };


    const updateForm = (field, value) => {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const updateLocation = (field, value) => {
        setForm((current) => ({
            ...current,
            location: {
                ...current.location,
                [field]: value,
            },
        }));
    };

    const resetForm = () => {
        setForm({
            title: "",
            description: "",
            type: "flood",
            severity: "medium",
            status: "reported",
            location: {
                address: "",
                city: "",
                state: "",
                country: "India",
                latitude: "",
                longitude: "",
            },
            peopleAffected: "0",
        });
        setFormError("");
    };

    const closeReportModal = () => {
        if (submitting) return;
        setShowReportModal(false);
        resetForm();
    };

    const createIncident = async (event) => {
        event.preventDefault();

        if (!form.title.trim()) {
            setFormError("Incident title is required.");
            return;
        }

        if (!form.location.city.trim()) {
            setFormError("City is required.");
            return;
        }

        try {
            setSubmitting(true);
            setFormError("");

            const payload = {
                title: form.title.trim(),
                description: form.description.trim(),
                type: form.type,
                severity: form.severity,
                status: "reported",
                location: {
                    address: form.location.address.trim(),
                    city: form.location.city.trim(),
                    state: form.location.state.trim(),
                    country: form.location.country.trim() || "India",
                    latitude:
                        form.location.latitude === ""
                            ? undefined
                            : Number(form.location.latitude),
                    longitude:
                        form.location.longitude === ""
                            ? undefined
                            : Number(form.location.longitude),
                },
                peopleAffected: Math.max(
                    0,
                    Number(form.peopleAffected) || 0
                ),
                source: "admin",
            };

            const response = await fetch(
                `${API_BASE_URL}/incidents`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Unable to create incident"
                );
            }

            setIncidents((current) => [
                data.incident,
                ...current,
            ]);

            setShowReportModal(false);
            resetForm();
        } catch (error) {
            console.error("Create Incident Error:", error);
            setFormError(
                error.message || "Unable to create incident"
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            className="space-y-5"
            onClick={() => setOpenMenu(null)}
        >
            {/* PAGE HEADER */}
            <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="h-5 w-1 rounded-full bg-cyan-400" />

                        <p className="text-[9px] font-semibold uppercase tracking-[0.17em] text-cyan-400">
                            Incident Management
                        </p>
                    </div>

                    <h1 className="mt-2 text-[24px] font-semibold tracking-tight text-white">
                        Incidents
                    </h1>

                    <p className="mt-1 text-[11px] text-slate-500">
                        Monitor, investigate and manage reported incidents.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowReportModal(true);
                        setFormError("");
                    }}
                    className="
                        group
                        inline-flex h-9
                        items-center justify-center gap-1.5
                        rounded-[5px]
                        border border-cyan-400/30
                        bg-cyan-400
                        px-3.5
                        text-[12px] font-medium
                        text-[#03121d]
                        transition-all duration-200
                        hover:border-cyan-300
                        hover:bg-cyan-300
                        active:scale-[0.98]
                    "
                >
                    <Plus
                        size={14}
                        strokeWidth={2.4}
                        className="
                            transition-transform duration-200
                            group-hover:rotate-90
                        "
                    />

                    Report Incident
                </button>
            </div>

            {/* STAT CARDS */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    icon={AlertTriangle}
                    label="Total Incidents"
                    value={totalIncidents}
                    subtext="Live from MongoDB"
                    iconClass="border-cyan-400/20 bg-cyan-400/[0.07] text-cyan-400"
                />

                <StatCard
                    icon={Radio}
                    label="Active Incidents"
                    value={activeIncidents}
                    subtext="Reported + investigating"
                    iconClass="border-red-400/20 bg-red-400/[0.07] text-red-400"
                />

                <StatCard
                    icon={Clock3}
                    label="Under Response"
                    value={respondingIncidents}
                    subtext="Teams currently responding"
                    iconClass="border-orange-400/20 bg-orange-400/[0.07] text-orange-400"
                />

                <StatCard
                    icon={CheckCircle2}
                    label="Resolved"
                    value={resolvedIncidents}
                    subtext="Resolved incidents"
                    iconClass="border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-400"
                />
            </div>

            {/* MAIN PANEL */}
            <div
                className="
                    overflow-visible
                    rounded-[6px]
                    border border-[#173149]
                    bg-[#091a2a]
                "
            >
                {/* TOOLBAR */}
                <div className="border-b border-[#173149] p-4">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">

                        {/* SEARCH */}
                        <div className="relative w-full xl:max-w-[380px]">
                            <Search
                                size={16}
                                className="
                                    absolute left-3 top-1/2
                                    -translate-y-1/2
                                    text-slate-500
                                "
                            />

                            <input
                                type="text"
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                                placeholder="Search incidents, ID or location..."
                                className="
                                    h-9 w-full
                                    rounded-[5px]
                                    border border-[#1c3a52]
                                    bg-[#071827]
                                    pl-9 pr-3
                                    text-[10px] text-slate-200
                                    outline-none
                                    transition-all
                                    placeholder:text-slate-600
                                    hover:border-[#28506d]
                                    focus:border-cyan-500/50
                                    focus:bg-[#081b2b]
                                "
                            />
                        </div>

                        {/* FILTERS */}
                        <div
                            className="flex flex-wrap items-center gap-2"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div
                                className="
                                    flex h-9 items-center gap-2
                                    rounded-[5px]
                                    border border-[#1c3a52]
                                    bg-[#071827]
                                    px-3
                                "
                            >
                                <SlidersHorizontal
                                    size={14}
                                    className="text-cyan-500/70"
                                />

                                <span className="text-[10px] font-medium text-slate-500">
                                    Filters
                                </span>
                            </div>

                            {/* SEVERITY */}
                            <div className="relative">
                                <select
                                    value={severity}
                                    onChange={(e) =>
                                        setSeverity(e.target.value)
                                    }
                                    className="
                                        h-9 min-w-[125px]
                                        appearance-none
                                        rounded-[5px]
                                        border border-[#1c3a52]
                                        bg-[#071827]
                                        px-3 pr-8
                                        text-[10px] text-slate-300
                                        outline-none
                                        transition
                                        hover:border-[#28506d]
                                        focus:border-cyan-500/50
                                    "
                                >
                                    <option>All Severity</option>
                                    <option>Critical</option>
                                    <option>High</option>
                                    <option>Medium</option>
                                    <option>Low</option>
                                </select>

                                <ChevronDown
                                    size={13}
                                    className="
                                        pointer-events-none
                                        absolute right-2.5 top-1/2
                                        -translate-y-1/2
                                        text-slate-600
                                    "
                                />
                            </div>

                            {/* STATUS */}
                            <div className="relative">
                                <select
                                    value={status}
                                    onChange={(e) =>
                                        setStatus(e.target.value)
                                    }
                                    className="
                                        h-9 min-w-[120px]
                                        appearance-none
                                        rounded-[5px]
                                        border border-[#1c3a52]
                                        bg-[#071827]
                                        px-3 pr-8
                                        text-[10px] text-slate-300
                                        outline-none
                                        transition
                                        hover:border-[#28506d]
                                        focus:border-cyan-500/50
                                    "
                                >
                                    <option>All Status</option>
                                    <option>Active</option>
                                    <option>Responding</option>
                                    <option>Investigating</option>
                                    <option>Resolved</option>
                                    <option>Rejected</option>
                                </select>

                                <ChevronDown
                                    size={13}
                                    className="
                                        pointer-events-none
                                        absolute right-2.5 top-1/2
                                        -translate-y-1/2
                                        text-slate-600
                                    "
                                />
                            </div>

                            {/* CLEAR */}
                            {(search ||
                                severity !== "All Severity" ||
                                status !== "All Status") && (
                                    <button
                                        type="button"
                                        onClick={clearFilters}
                                        className="
                                        group
                                        flex h-9 items-center gap-1.5
                                        rounded-[5px]
                                        border border-transparent
                                        px-2.5
                                        text-[10px]
                                        text-slate-500
                                        transition-all
                                        hover:border-red-500/20
                                        hover:bg-red-500/[0.06]
                                        hover:text-red-400
                                    "
                                    >
                                        <X
                                            size={13}
                                            className="transition-transform group-hover:rotate-90"
                                        />

                                        Clear
                                    </button>
                                )}
                            <button
                                type="button"
                                onClick={fetchIncidents}
                                disabled={loading}
                                className="
                                    h-9 rounded-[5px]
                                    border border-[#1c3a52]
                                    bg-[#071827]
                                    px-3
                                    text-[12px] font-medium
                                    text-slate-400
                                    transition
                                    hover:border-cyan-400/30
                                    hover:text-cyan-300
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                "
                            >
                                {loading ? "Loading..." : "Refresh"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* TABLE HEADER */}
                <div
                    className="
                        hidden
                        border-b border-[#173149]
                        bg-[#071827]/60
                        px-4 py-3
                        lg:grid
                        lg:grid-cols-[1.6fr_1.25fr_0.8fr_0.9fr_0.8fr_40px]
                        lg:gap-4
                    "
                >
                    <span className="table-head">
                        INCIDENT
                    </span>

                    <span className="table-head">
                        LOCATION
                    </span>

                    <span className="table-head">
                        SEVERITY
                    </span>

                    <span className="table-head">
                        STATUS
                    </span>

                    <span className="table-head">
                        REPORTED
                    </span>

                    <span />
                </div>

                {/* TABLE BODY */}
                <div>
                    {loading ? (
                        <div className="flex min-h-[260px] items-center justify-center">
                            <p className="text-[12px] text-slate-500">
                                Loading incidents...
                            </p>
                        </div>
                    ) : error ? (
                        <div className="flex min-h-[260px] flex-col items-center justify-center px-5 text-center">
                            <AlertTriangle size={22} className="text-red-400" />

                            <h3 className="mt-3 text-[12px] font-medium text-slate-300">
                                Unable to load incidents
                            </h3>

                            <p className="mt-1 text-[9px] text-slate-600">
                                {error}
                            </p>

                            <button
                                type="button"
                                onClick={fetchIncidents}
                                className="
                                    mt-4 h-8 rounded-[4px]
                                    border border-[#24445c]
                                    bg-[#0c2031]
                                    px-3
                                    text-[12px] font-medium
                                    text-slate-400
                                    transition
                                    hover:border-cyan-400/30
                                    hover:text-cyan-300
                                "
                            >
                                Try Again
                            </button>
                        </div>
                    ) : filteredIncidents.length > 0 ? (
                        filteredIncidents.map((incident, index) => (
                            <div
                                key={incident.id}
                                className="
                                    group
                                    border-b border-[#132d42]
                                    px-4 py-4
                                    transition-all duration-200
                                    hover:bg-[#0c2031]
                                    last:border-b-0
                                "
                            >
                                <div
                                    className="
                                        grid items-center gap-4
                                        lg:grid-cols-[1.6fr_1.25fr_0.8fr_0.9fr_0.8fr_40px]
                                    "
                                >
                                    {/* INCIDENT */}
                                    <div className="min-w-0">
                                        <div className="flex items-start gap-3">
                                            <div
                                                className={`
                                                    mt-0.5 flex h-8 w-8
                                                    shrink-0 items-center
                                                    justify-center
                                                    rounded-[5px]
                                                    border
                                                    ${severityStyles[
                                                        incident.severity
                                                    ].bg
                                                    }
                                                    ${severityStyles[
                                                        incident.severity
                                                    ].border
                                                    }
                                                `}
                                            >
                                                <AlertTriangle
                                                    size={15}
                                                    className={
                                                        severityStyles[
                                                            incident.severity
                                                        ].text
                                                    }
                                                />
                                            </div>

                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p
                                                        className="
                                                            truncate
                                                            text-[11px]
                                                            font-medium
                                                            text-slate-100
                                                        "
                                                    >
                                                        {incident.title}
                                                    </p>

                                                    <ArrowUpRight
                                                        size={12}
                                                        className="
                                                            hidden
                                                            text-slate-600
                                                            transition
                                                            group-hover:text-cyan-400
                                                            sm:block
                                                        "
                                                    />
                                                </div>

                                                <p className="mt-1 text-[9px] text-slate-600">
                                                    {incident.id}
                                                </p>

                                                <span
                                                    className="
                                                        mt-1.5 inline-block
                                                        rounded-[3px]
                                                        bg-white/[0.03]
                                                        px-1.5 py-0.5
                                                        text-[8px]
                                                        text-slate-500
                                                    "
                                                >
                                                    {incident.type}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* LOCATION */}
                                    <div
                                        className="flex min-w-0 items-center gap-2"
                                        title={incident.location}
                                    >
                                        <MapPin
                                            size={14}
                                            className="shrink-0 text-slate-600"
                                        />

                                        <span className="min-w-0 truncate text-[10px] text-slate-400">
                                            {incident.location}
                                        </span>
                                    </div>

                                    {/* SEVERITY */}
                                    <div>
                                        <SeverityBadge
                                            severity={incident.severity}
                                        />
                                    </div>

                                    {/* STATUS */}
                                    <div>
                                        <StatusBadge
                                            status={incident.status}
                                        />
                                    </div>

                                    {/* REPORTED */}
                                    <div>
                                        <p className="text-[10px] text-slate-300">
                                            {incident.time}
                                        </p>

                                        <div className="mt-1 flex items-center gap-1">
                                            <Users
                                                size={11}
                                                className="text-slate-600"
                                            />

                                            <span className="text-[8px] text-slate-600">
                                                {incident.people} affected
                                            </span>
                                        </div>
                                    </div>

                                    {/* ACTION MENU */}
                                    <div
                                        className="relative flex justify-end"
                                        onClick={(e) =>
                                            e.stopPropagation()
                                        }
                                    >
                                        <button
                                            type="button"
                                            aria-label="Incident actions"
                                            onClick={() =>
                                                setOpenMenu(
                                                    openMenu === incident.id
                                                        ? null
                                                        : incident.id
                                                )
                                            }
                                            className="
                                                flex h-8 w-8
                                                items-center justify-center
                                                rounded-[5px]
                                                border border-transparent
                                                bg-transparent
                                                text-slate-500
                                                transition-all duration-200
                                                hover:border-[#23445c]
                                                hover:bg-[#102638]
                                                hover:text-cyan-400
                                                active:scale-95
                                            "
                                        >
                                            <MoreHorizontal
                                                size={17}
                                                strokeWidth={2}
                                            />
                                        </button>

                                        {openMenu === incident.id && (
                                            <div
                                                className={`
                                                    absolute right-0 z-50
                                                    w-[160px]
                                                    overflow-hidden
                                                    rounded-[6px]
                                                    border border-[#23445c]
                                                    bg-[#0a1c2d]
                                                    p-1
                                                    shadow-[0_12px_30px_rgba(0,0,0,0.35)]
                                                    ${index >= filteredIncidents.length - 2
                                                        ? "bottom-10"
                                                        : "top-10"
                                                    }
                                                `}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => openDetailsModal(incident)}
                                                    className="
                                                        flex w-full
                                                        items-center gap-2.5
                                                        rounded-[4px]
                                                        px-2.5 py-2
                                                        text-left text-[10px]
                                                        text-slate-400
                                                        transition-all
                                                        hover:bg-cyan-400/[0.07]
                                                        hover:text-cyan-300
                                                    "
                                                >
                                                    <Eye size={14} />
                                                    View Details
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(incident)}
                                                    className="
                                                        flex w-full
                                                        items-center gap-2.5
                                                        rounded-[4px]
                                                        px-2.5 py-2
                                                        text-left text-[10px]
                                                        text-slate-400
                                                        transition-all
                                                        hover:bg-cyan-400/[0.07]
                                                        hover:text-cyan-300
                                                    "
                                                >
                                                    <Pencil size={14} />
                                                    Edit Incident
                                                </button>

                                                <div className="my-1 h-px bg-[#173149]" />

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        deleteIncident(
                                                            incident.mongoId
                                                        )
                                                    }
                                                    className="
                                                        flex w-full
                                                        items-center gap-2.5
                                                        rounded-[4px]
                                                        px-2.5 py-2
                                                        text-left text-[12px]
                                                        text-red-400
                                                        transition-all
                                                        hover:bg-red-500/[0.08]
                                                        hover:text-red-300
                                                    "
                                                >
                                                    <Trash2 size={14} />
                                                    Delete Incident
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex min-h-[300px] flex-col items-center justify-center px-5 text-center">
                            <div
                                className="
                                    flex h-12 w-12
                                    items-center justify-center
                                    rounded-[6px]
                                    border border-[#173149]
                                    bg-[#071827]
                                "
                            >
                                <Search
                                    size={19}
                                    className="text-slate-600"
                                />
                            </div>

                            <h3 className="mt-4 text-[12px] font-medium text-slate-300">
                                No incidents found
                            </h3>

                            <p className="mt-1 max-w-[280px] text-[9px] text-slate-600">
                                Try changing your search or filter criteria.
                            </p>

                            <button
                                type="button"
                                onClick={clearFilters}
                                className="
                                    mt-4
                                    h-8
                                    rounded-[4px]
                                    border border-[#24445c]
                                    bg-[#0c2031]
                                    px-3
                                    text-[9px]
                                    font-medium
                                    text-slate-400
                                    transition
                                    hover:border-cyan-400/30
                                    hover:text-cyan-300
                                "
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}
                </div>

                {/* FOOTER */}
                <div
                    className="
                        flex flex-col justify-between gap-2
                        border-t border-[#173149]
                        bg-[#071827]/50
                        px-4 py-3
                        sm:flex-row sm:items-center
                    "
                >
                    <p className="text-[9px] text-slate-600">
                        Showing{" "}
                        <span className="font-medium text-slate-400">
                            {filteredIncidents.length}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium text-slate-400">
                            {incidents.length}
                        </span>{" "}
                        incidents
                    </p>

                    <div className="flex items-center">
                        {filteredIncidents.length > 0 && (
                            <span className="rounded-[4px] border border-cyan-400/30 bg-cyan-400/[0.08] px-2.5 py-1.5 text-[9px] font-medium text-cyan-400">
                                1
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {showDetailsModal && selectedIncident && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-[2px]"
                    onClick={closeDetailsModal}
                >
                    <div
                        className="w-full max-w-[560px] rounded-[6px] border border-[#23445c] bg-[#091a2a] shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-[#173149] px-5 py-4">
                            <div>
                                <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-cyan-400">Incident Details</p>
                                <h2 className="mt-1 text-[17px] font-semibold text-white">{selectedIncident.title}</h2>
                            </div>
                            <button type="button" onClick={closeDetailsModal} className="flex h-8 w-8 items-center justify-center rounded-[5px] border border-[#173149] bg-[#071827] text-slate-500 transition hover:border-[#28506d] hover:text-slate-200">
                                <X size={15} />
                            </button>
                        </div>

                        <div className="space-y-4 p-5">
                            <div className="flex flex-wrap items-center gap-2">
                                <SeverityBadge severity={selectedIncident.rawSeverity} />
                                <StatusBadge status={selectedIncident.rawStatus} />
                                <span className="rounded-[4px] bg-white/[0.03] px-2 py-1 text-[9px] text-slate-500">{selectedIncident.id}</span>
                            </div>

                            <div>
                                <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-500">Description</p>
                                <p className="mt-1 text-[11px] leading-5 text-slate-300">{selectedIncident.description || "No description provided."}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-[5px] border border-[#173149] bg-[#071827] p-3">
                                    <p className="text-[9px] text-slate-600">Location</p>
                                    <p className="mt-1 text-[10px] text-slate-300">{selectedIncident.location || "Location unavailable"}</p>
                                </div>
                                <div className="rounded-[5px] border border-[#173149] bg-[#071827] p-3">
                                    <p className="text-[9px] text-slate-600">People Affected</p>
                                    <p className="mt-1 text-[14px] font-semibold text-white">{selectedIncident.people || 0}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between border-t border-[#173149] pt-3">
                                <span className="text-[9px] text-slate-600">Reported</span>
                                <span className="text-[10px] text-slate-300">{selectedIncident.time}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showEditModal && selectedIncident && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-[2px]"
                    onClick={closeEditModal}
                >
                    <div
                        className="custom-scrollbar w-full max-w-[620px] max-h-[90vh] overflow-y-auto rounded-[6px] border border-[#23445c] bg-[#091a2a] shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-[#173149] px-5 py-4">
                            <div>
                                <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-cyan-400">Incident Management</p>
                                <h2 className="mt-1 text-[17px] font-semibold text-white">Edit Incident</h2>
                            </div>
                            <button type="button" onClick={closeEditModal} className="flex h-8 w-8 items-center justify-center rounded-[5px] border border-[#173149] bg-[#071827] text-slate-500 transition hover:border-[#28506d] hover:text-slate-200">
                                <X size={15} />
                            </button>
                        </div>

                        <form onSubmit={updateIncident} className="space-y-4 p-5">
                            <div>
                                <label className="mb-1.5 block text-[10px] font-medium text-slate-400">Incident Title</label>
                                <input value={form.title} onChange={(e) => updateForm("title", e.target.value)} className="h-9 w-full rounded-[5px] border border-[#1c3a52] bg-[#071827] px-3 text-[12px] text-slate-200 outline-none focus:border-cyan-500/50" />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-[10px] font-medium text-slate-400">Description</label>
                                <textarea value={form.description} onChange={(e) => updateForm("description", e.target.value)} rows={3} className="w-full resize-none rounded-[5px] border border-[#1c3a52] bg-[#071827] px-3 py-2 text-[12px] text-slate-200 outline-none focus:border-cyan-500/50" />
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                                <div>
                                    <label className="mb-1.5 block text-[10px] font-medium text-slate-400">Type</label>
                                    <select value={form.type} onChange={(e) => updateForm("type", e.target.value)} className="h-9 w-full rounded-[5px] border border-[#1c3a52] bg-[#071827] px-2 text-[11px] text-slate-300 outline-none">
                                        <option value="flood">Flood</option><option value="landslide">Landslide</option><option value="forest_fire">Forest Fire</option><option value="earthquake">Earthquake</option><option value="heavy_rain">Heavy Rain</option><option value="road_accident">Road Accident</option><option value="fire">Fire</option><option value="medical_emergency">Medical Emergency</option><option value="infrastructure">Infrastructure</option><option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-[10px] font-medium text-slate-400">Severity</label>
                                    <select value={form.severity} onChange={(e) => updateForm("severity", e.target.value)} className="h-9 w-full rounded-[5px] border border-[#1c3a52] bg-[#071827] px-2 text-[11px] text-slate-300 outline-none">
                                        <option value="critical">Critical</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-[10px] font-medium text-slate-400">Status</label>
                                    <select value={form.status} onChange={(e) => updateForm("status", e.target.value)} className="h-9 w-full rounded-[5px] border border-[#1c3a52] bg-[#071827] px-2 text-[11px] text-slate-300 outline-none">
                                        <option value="reported">Reported</option><option value="investigating">Investigating</option><option value="responding">Responding</option><option value="resolved">Resolved</option><option value="rejected">Rejected</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-[10px] font-medium text-slate-400">People Affected</label>
                                    <input type="number" min="0" value={form.peopleAffected} onChange={(e) => updateForm("peopleAffected", e.target.value)} className="h-9 w-full rounded-[5px] border border-[#1c3a52] bg-[#071827] px-3 text-[11px] text-slate-200 outline-none" />
                                </div>
                            </div>

                            <div className="border-t border-[#173149] pt-4">
                                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-cyan-400">Location</p>
                                <div className="space-y-3">
                                    <input value={form.location.address} onChange={(e) => updateLocation("address", e.target.value)} placeholder="Address / landmark" className="h-9 w-full rounded-[5px] border border-[#1c3a52] bg-[#071827] px-3 text-[12px] text-slate-200 outline-none placeholder:text-slate-600 focus:border-cyan-500/50" />
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                        <input value={form.location.city} onChange={(e) => updateLocation("city", e.target.value)} placeholder="City *" className="h-9 rounded-[5px] border border-[#1c3a52] bg-[#071827] px-3 text-[12px] text-slate-200 outline-none placeholder:text-slate-600 focus:border-cyan-500/50" />
                                        <input value={form.location.state} onChange={(e) => updateLocation("state", e.target.value)} placeholder="State" className="h-9 rounded-[5px] border border-[#1c3a52] bg-[#071827] px-3 text-[12px] text-slate-200 outline-none placeholder:text-slate-600 focus:border-cyan-500/50" />
                                        <input value={form.location.country} onChange={(e) => updateLocation("country", e.target.value)} placeholder="Country" className="h-9 rounded-[5px] border border-[#1c3a52] bg-[#071827] px-3 text-[12px] text-slate-200 outline-none placeholder:text-slate-600 focus:border-cyan-500/50" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <input type="number" step="any" value={form.location.latitude} onChange={(e) => updateLocation("latitude", e.target.value)} placeholder="Latitude" className="h-9 rounded-[5px] border border-[#1c3a52] bg-[#071827] px-3 text-[12px] text-slate-200 outline-none" />
                                        <input type="number" step="any" value={form.location.longitude} onChange={(e) => updateLocation("longitude", e.target.value)} placeholder="Longitude" className="h-9 rounded-[5px] border border-[#1c3a52] bg-[#071827] px-3 text-[12px] text-slate-200 outline-none" />
                                    </div>
                                </div>
                            </div>

                            {formError && <div className="rounded-[5px] border border-red-500/20 bg-red-500/[0.07] px-3 py-2 text-[10px] text-red-400">{formError}</div>}

                            <div className="flex justify-end gap-2 border-t border-[#173149] pt-4">
                                <button type="button" onClick={closeEditModal} disabled={submitting} className="h-9 rounded-[5px] border border-[#1c3a52] bg-[#071827] px-3.5 text-[12px] font-medium text-slate-400 transition hover:border-[#28506d] hover:text-slate-200 disabled:opacity-50">Cancel</button>
                                <button type="submit" disabled={submitting} className="h-9 rounded-[5px] border border-cyan-400/30 bg-cyan-400 px-4 text-[12px] font-medium text-[#03121d] transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60">{submitting ? "Saving..." : "Save Changes"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* LOCAL STYLES */}
            <style>{`
                .table-head {
                    font-size: 8px;
                    font-weight: 600;
                    letter-spacing: 0.13em;
                    color: #475569;
                }

                select option {
                    background: #071827;
                    color: #cbd5e1;
                }

                /* Custom thin scrollbar */
                .custom-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: #334155 transparent;
                }

                .custom-scrollbar::-webkit-scrollbar {
                    width: 5px;
                }

                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #334155;
                    border-radius: 999px;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #475569;
                }

                .custom-scrollbar::-webkit-scrollbar-corner {
                    background: transparent;
                }
            `}</style>

            {showReportModal && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-[2px]"
                    onClick={closeReportModal}
                >
                    <div
                        className="custom-scrollbar w-full max-w-[620px] max-h-[90vh] overflow-y-auto rounded-[6px] border border-[#23445c] bg-[#091a2a] shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-[#173149] px-5 py-4">
                            <div>
                                <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-cyan-400">
                                    Incident Management
                                </p>
                                <h2 className="mt-1 text-[17px] font-semibold text-white">
                                    Report Incident
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={closeReportModal}
                                className="flex h-8 w-8 items-center justify-center rounded-[5px] border border-[#173149] bg-[#071827] text-slate-500 transition hover:border-[#28506d] hover:text-slate-200"
                            >
                                <X size={15} />
                            </button>
                        </div>

                        <form onSubmit={createIncident} className="space-y-4 p-5">
                            <div>
                                <label className="mb-1.5 block text-[10px] font-medium text-slate-400">
                                    Incident Title
                                </label>
                                <input
                                    value={form.title}
                                    onChange={(e) =>
                                        updateForm("title", e.target.value)
                                    }
                                    placeholder="e.g. Flash Flood Alert"
                                    className="h-9 w-full rounded-[5px] border border-[#1c3a52] bg-[#071827] px-3 text-[12px] text-slate-200 outline-none placeholder:text-slate-600 focus:border-cyan-500/50"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-[10px] font-medium text-slate-400">
                                    Description
                                </label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) =>
                                        updateForm("description", e.target.value)
                                    }
                                    rows={3}
                                    placeholder="Describe the incident..."
                                    className="w-full resize-none rounded-[5px] border border-[#1c3a52] bg-[#071827] px-3 py-2 text-[12px] text-slate-200 outline-none placeholder:text-slate-600 focus:border-cyan-500/50"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                <div>
                                    <label className="mb-1.5 block text-[10px] font-medium text-slate-400">
                                        Type
                                    </label>
                                    <select
                                        value={form.type}
                                        onChange={(e) =>
                                            updateForm("type", e.target.value)
                                        }
                                        className="h-9 w-full rounded-[5px] border border-[#1c3a52] bg-[#071827] px-3 text-[12px] text-slate-300 outline-none"
                                    >
                                        <option value="flood">Flood</option>
                                        <option value="landslide">Landslide</option>
                                        <option value="forest_fire">Forest Fire</option>
                                        <option value="earthquake">Earthquake</option>
                                        <option value="heavy_rain">Heavy Rain</option>
                                        <option value="road_accident">Road Accident</option>
                                        <option value="fire">Fire</option>
                                        <option value="medical_emergency">Medical Emergency</option>
                                        <option value="infrastructure">Infrastructure</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-[10px] font-medium text-slate-400">
                                        Severity
                                    </label>
                                    <select
                                        value={form.severity}
                                        onChange={(e) =>
                                            updateForm("severity", e.target.value)
                                        }
                                        className="h-9 w-full rounded-[5px] border border-[#1c3a52] bg-[#071827] px-3 text-[12px] text-slate-300 outline-none"
                                    >
                                        <option value="critical">Critical</option>
                                        <option value="high">High</option>
                                        <option value="medium">Medium</option>
                                        <option value="low">Low</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-[10px] font-medium text-slate-400">
                                        People Affected
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={form.peopleAffected}
                                        onChange={(e) =>
                                            updateForm(
                                                "peopleAffected",
                                                e.target.value
                                            )
                                        }
                                        className="h-9 w-full rounded-[5px] border border-[#1c3a52] bg-[#071827] px-3 text-[12px] text-slate-200 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="border-t border-[#173149] pt-4">
                                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-cyan-400">
                                    Location
                                </p>

                                <div className="space-y-3">
                                    <input
                                        value={form.location.address}
                                        onChange={(e) =>
                                            updateLocation(
                                                "address",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Address / landmark"
                                        className="h-9 w-full rounded-[5px] border border-[#1c3a52] bg-[#071827] px-3 text-[12px] text-slate-200 outline-none placeholder:text-slate-600 focus:border-cyan-500/50"
                                    />

                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                        <input
                                            value={form.location.city}
                                            onChange={(e) =>
                                                updateLocation(
                                                    "city",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="City *"
                                            className="h-9 rounded-[5px] border border-[#1c3a52] bg-[#071827] px-3 text-[12px] text-slate-200 outline-none placeholder:text-slate-600 focus:border-cyan-500/50"
                                        />

                                        <input
                                            value={form.location.state}
                                            onChange={(e) =>
                                                updateLocation(
                                                    "state",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="State"
                                            className="h-9 rounded-[5px] border border-[#1c3a52] bg-[#071827] px-3 text-[12px] text-slate-200 outline-none placeholder:text-slate-600 focus:border-cyan-500/50"
                                        />

                                        <input
                                            value={form.location.country}
                                            onChange={(e) =>
                                                updateLocation(
                                                    "country",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Country"
                                            className="h-9 rounded-[5px] border border-[#1c3a52] bg-[#071827] px-3 text-[12px] text-slate-200 outline-none placeholder:text-slate-600 focus:border-cyan-500/50"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <input
                                            type="number"
                                            step="any"
                                            value={form.location.latitude}
                                            onChange={(e) =>
                                                updateLocation(
                                                    "latitude",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Latitude"
                                            className="h-9 rounded-[5px] border border-[#1c3a52] bg-[#071827] px-3 text-[12px] text-slate-200 outline-none placeholder:text-slate-600"
                                        />

                                        <input
                                            type="number"
                                            step="any"
                                            value={form.location.longitude}
                                            onChange={(e) =>
                                                updateLocation(
                                                    "longitude",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Longitude"
                                            className="h-9 rounded-[5px] border border-[#1c3a52] bg-[#071827] px-3 text-[12px] text-slate-200 outline-none placeholder:text-slate-600"
                                        />
                                    </div>
                                </div>
                            </div>

                            {formError && (
                                <div className="rounded-[5px] border border-red-500/20 bg-red-500/[0.07] px-3 py-2 text-[10px] text-red-400">
                                    {formError}
                                </div>
                            )}

                            <div className="flex justify-end gap-2 border-t border-[#173149] pt-4">
                                <button
                                    type="button"
                                    onClick={closeReportModal}
                                    disabled={submitting}
                                    className="h-9 rounded-[5px] border border-[#1c3a52] bg-[#071827] px-3.5 text-[12px] font-medium text-slate-400 transition hover:border-[#28506d] hover:text-slate-200 disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="h-9 rounded-[5px] border border-cyan-400/30 bg-cyan-400 px-4 text-[12px] font-medium text-[#03121d] transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {submitting ? "Creating..." : "Create Incident"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}

export default Incidents;