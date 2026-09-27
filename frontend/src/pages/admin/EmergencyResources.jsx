import { useEffect, useState } from "react";
import {
    Ambulance,
    Users,
    Plane,
    Tent,
    HeartPulse,
    RefreshCw,
    Plus,
    Edit3,
    Trash2,
} from "lucide-react";
import { toast } from "sonner";

const API_BASE_URL = "http://localhost:5000/api";

const resourceIcons = {
    rescue_teams: Users,
    ambulances: Ambulance,
    helicopters: Plane,
    relief_camps: Tent,
    medical_units: HeartPulse,
};

function EmergencyResources() {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchResources = async () => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/emergency-resources`,
                {
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Unable to fetch resources"
                );
            }

            setResources(data.resources || []);
        } catch (error) {
            console.error(error);

            toast.error(
                error.message ||
                "Unable to fetch emergency resources"
            );
        }
    };

    const loadResources = async () => {
        try {
            setLoading(true);
            await fetchResources();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadResources();
    }, []);

    const handleRefresh = async () => {
        try {
            setRefreshing(true);

            await fetchResources();

            toast.success(
                "Resources refreshed"
            );
        } finally {
            setRefreshing(false);
        }
    };

    return (
        <div className="space-y-5">

            {/* PAGE HEADER */}

            <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

                <div>
                    <div className="mb-2 flex items-center gap-2">

                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                        <span className="text-[9px] font-medium uppercase tracking-[0.16em] text-emerald-400">
                            Emergency Management
                        </span>

                    </div>

                    <h1 className="text-[25px] font-semibold tracking-tight text-white sm:text-[28px]">
                        Emergency Resources
                    </h1>

                    <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                        Manage and monitor emergency response resources.
                    </p>
                </div>

                <div className="flex gap-2">

                    <button
                        type="button"
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="flex h-9 w-9 items-center justify-center rounded-[5px] border border-[#21415c] bg-[#071827] text-slate-400 transition hover:border-cyan-500/40 hover:text-cyan-400 disabled:opacity-50"
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

                    <button
                        type="button"
                        className="inline-flex h-9 items-center gap-2 rounded-[5px] border border-cyan-400/30 bg-cyan-400/10 px-3.5 text-[11px] font-medium text-cyan-300 transition hover:bg-cyan-400/[0.16]"
                    >
                        <Plus size={14} />
                        Add Resource
                    </button>

                </div>

            </section>

            {/* RESOURCE CARDS */}

            {loading ? (
                <div className="flex min-h-[300px] items-center justify-center rounded-[6px] border border-[#173149] bg-[#091a2a]">

                    <div className="flex items-center gap-2 text-[11px] text-slate-500">

                        <RefreshCw
                            size={15}
                            className="animate-spin text-cyan-400"
                        />

                        Loading emergency resources...

                    </div>

                </div>
            ) : resources.length === 0 ? (
                <div className="rounded-[6px] border border-[#173149] bg-[#091a2a] py-16 text-center">

                    <HeartPulse
                        size={28}
                        className="mx-auto text-slate-600"
                    />

                    <p className="mt-3 text-sm text-slate-400">
                        No emergency resources found.
                    </p>

                    <p className="mt-1 text-[10px] text-slate-600">
                        Add resources to start managing emergency operations.
                    </p>

                </div>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">

                    {resources.map((resource) => {
                        const Icon =
                            resourceIcons[
                            resource.type
                            ] || HeartPulse;

                        const availability =
                            resource.total > 0
                                ? Math.round(
                                    (resource.available /
                                        resource.total) *
                                    100
                                )
                                : 0;

                        return (
                            <ResourceCard
                                key={resource._id}
                                resource={resource}
                                Icon={Icon}
                                availability={
                                    availability
                                }
                            />
                        );
                    })}

                </div>
            )}

        </div>
    );
}


/* =========================================
   RESOURCE CARD
========================================= */

function ResourceCard({
    resource,
    Icon,
    availability,
}) {
    const isAvailable =
        resource.status === "available";

    const isLimited =
        resource.status === "limited";

    return (
        <div className="rounded-[6px] border border-[#173149] bg-[#091a2a] p-4 transition hover:border-[#28516c]">

            <div className="flex items-start justify-between">

                <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-[6px] border border-cyan-400/10 bg-cyan-400/[0.08] text-cyan-400">
                        <Icon size={18} />
                    </div>

                    <div>
                        <h3 className="text-[12px] font-semibold text-slate-100">
                            {resource.name}
                        </h3>

                        <p className="mt-0.5 text-[9px] text-slate-600">
                            {resource.location ||
                                "Location not set"}
                        </p>
                    </div>

                </div>

                <span
                    className={`rounded-full border px-2 py-0.5 text-[8px] ${isAvailable
                            ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-400"
                            : isLimited
                                ? "border-amber-400/20 bg-amber-400/10 text-amber-400"
                                : "border-red-400/20 bg-red-400/10 text-red-400"
                        }`}
                >
                    {resource.status}
                </span>

            </div>

            <div className="mt-5 flex items-end justify-between">

                <div>

                    <p className="text-[25px] font-semibold leading-none text-white">
                        {resource.available}
                    </p>

                    <p className="mt-1 text-[9px] text-slate-500">
                        Available
                    </p>

                </div>

                <div className="text-right">

                    <p className="text-[13px] font-medium text-slate-300">
                        {resource.total}
                    </p>

                    <p className="mt-1 text-[9px] text-slate-600">
                        Total
                    </p>

                </div>

            </div>

            <div className="mt-4">

                <div className="mb-1.5 flex items-center justify-between">

                    <span className="text-[9px] text-slate-600">
                        Availability
                    </span>

                    <span className="text-[9px] text-slate-500">
                        {availability}%
                    </span>

                </div>

                <div className="h-1 overflow-hidden rounded-full bg-[#14283a]">

                    <div
                        className="h-full rounded-full bg-cyan-400 transition-all"
                        style={{
                            width: `${availability}%`,
                        }}
                    />

                </div>

            </div>

            <div className="mt-4 flex justify-end gap-2">

                <button
                    type="button"
                    className="flex h-7 w-7 items-center justify-center rounded-[4px] border border-[#21415c] bg-[#071827] text-slate-500 transition hover:border-cyan-500/40 hover:text-cyan-400"
                    title="Edit"
                >
                    <Edit3 size={12} />
                </button>

                <button
                    type="button"
                    className="flex h-7 w-7 items-center justify-center rounded-[4px] border border-[#21415c] bg-[#071827] text-slate-500 transition hover:border-red-500/40 hover:text-red-400"
                    title="Delete"
                >
                    <Trash2 size={12} />
                </button>

            </div>

        </div>
    );
}

export default EmergencyResources;