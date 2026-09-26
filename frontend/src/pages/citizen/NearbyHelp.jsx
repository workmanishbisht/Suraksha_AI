import { useMemo, useState } from "react";
import {
    Ambulance,
    Building2,
    ChevronRight,
    Clock3,
    Flame,
    Hospital,
    MapPin,
    Navigation,
    Phone,
    Search,
    Shield,
    ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

const placesData = [
    {
        id: 1,
        name: "Dehradun Police Station",
        category: "Police",
        distance: "1.2 km",
        address: "Rajpur Road, Dehradun",
        phone: "112",
        status: "Open 24/7",
        icon: Shield,
    },
    {
        id: 2,
        name: "Doon Hospital",
        category: "Hospital",
        distance: "2.1 km",
        address: "Haridwar Road, Dehradun",
        phone: "108",
        status: "Emergency Available",
        icon: Hospital,
    },
    {
        id: 3,
        name: "Fire Station Dehradun",
        category: "Fire Station",
        distance: "2.8 km",
        address: "Clock Tower, Dehradun",
        phone: "101",
        status: "Open 24/7",
        icon: Flame,
    },
    {
        id: 4,
        name: "Max Super Speciality Hospital",
        category: "Hospital",
        distance: "3.4 km",
        address: "Mussoorie Diversion Road",
        phone: "108",
        status: "Emergency Available",
        icon: Hospital,
    },
    {
        id: 5,
        name: "Police Control Room",
        category: "Police",
        distance: "3.7 km",
        address: "Dehradun City Centre",
        phone: "112",
        status: "Open 24/7",
        icon: Shield,
    },
];

const categoryConfig = {
    All: {
        icon: ShieldCheck,
    },
    Police: {
        icon: Shield,
    },
    Hospital: {
        icon: Hospital,
    },
    "Fire Station": {
        icon: Flame,
    },
};

function NearbyHelp() {
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");

    const filteredPlaces = useMemo(() => {
        const value = search.toLowerCase().trim();

        return placesData.filter((place) => {
            const matchesSearch =
                !value ||
                place.name.toLowerCase().includes(value) ||
                place.address.toLowerCase().includes(value);

            const matchesCategory =
                category === "All" ||
                place.category === category;

            return matchesSearch && matchesCategory;
        });
    }, [search, category]);

    const handleDirections = (place) => {
        toast.success(`Directions requested for ${place.name}.`);
    };

    const handleCall = (phone) => {
        window.location.href = `tel:${phone}`;
    };

    return (
        <div className="space-y-5">

            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-400">
                        <Navigation size={15} />
                        Emergency Resources
                    </div>

                    <h1 className="text-2xl font-semibold text-white">
                        Nearby Help
                    </h1>

                    <p className="mt-1 text-sm text-slate-400">
                        Find nearby police stations, hospitals and fire
                        stations.
                    </p>
                </div>

                <div className="flex items-center gap-2 rounded-[5px] border border-emerald-500/20 bg-emerald-500/5 px-3 py-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />

                    <span className="text-xs font-medium text-emerald-400">
                        Emergency Network Online
                    </span>
                </div>
            </div>

            {/* Emergency Numbers */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

                <button
                    type="button"
                    onClick={() => handleCall("112")}
                    className="group flex items-center justify-between rounded-[6px] border border-blue-500/20 bg-blue-500/5 p-4 text-left transition hover:border-blue-500/40 hover:bg-blue-500/10"
                >
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-[5px] bg-blue-500/10">
                            <Shield
                                size={20}
                                className="text-blue-400"
                            />
                        </div>

                        <div>
                            <p className="text-xs text-slate-500">
                                Police
                            </p>

                            <p className="mt-0.5 text-lg font-semibold text-white">
                                112
                            </p>
                        </div>
                    </div>

                    <Phone
                        size={17}
                        className="text-slate-600 transition group-hover:text-blue-400"
                    />
                </button>

                <button
                    type="button"
                    onClick={() => handleCall("108")}
                    className="group flex items-center justify-between rounded-[6px] border border-red-500/20 bg-red-500/5 p-4 text-left transition hover:border-red-500/40 hover:bg-red-500/10"
                >
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-[5px] bg-red-500/10">
                            <Ambulance
                                size={20}
                                className="text-red-400"
                            />
                        </div>

                        <div>
                            <p className="text-xs text-slate-500">
                                Ambulance
                            </p>

                            <p className="mt-0.5 text-lg font-semibold text-white">
                                108
                            </p>
                        </div>
                    </div>

                    <Phone
                        size={17}
                        className="text-slate-600 transition group-hover:text-red-400"
                    />
                </button>

                <button
                    type="button"
                    onClick={() => handleCall("101")}
                    className="group flex items-center justify-between rounded-[6px] border border-orange-500/20 bg-orange-500/5 p-4 text-left transition hover:border-orange-500/40 hover:bg-orange-500/10"
                >
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-[5px] bg-orange-500/10">
                            <Flame
                                size={20}
                                className="text-orange-400"
                            />
                        </div>

                        <div>
                            <p className="text-xs text-slate-500">
                                Fire Emergency
                            </p>

                            <p className="mt-0.5 text-lg font-semibold text-white">
                                101
                            </p>
                        </div>
                    </div>

                    <Phone
                        size={17}
                        className="text-slate-600 transition group-hover:text-orange-400"
                    />
                </button>

            </div>

            {/* Location Banner */}
            <div className="flex flex-col gap-3 rounded-[6px] border border-cyan-500/20 bg-cyan-500/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[5px] bg-cyan-500/10">
                        <MapPin
                            size={20}
                            className="text-cyan-400"
                        />
                    </div>

                    <div>
                        <p className="text-sm font-medium text-slate-200">
                            Showing nearby emergency resources
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                            Current service area: Dehradun
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() =>
                        toast.info(
                            "Location detection will be connected with Mapbox."
                        )
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-[5px] border border-cyan-500/30 px-3 py-2 text-xs font-medium text-cyan-400 transition hover:bg-cyan-500/10"
                >
                    <Navigation size={14} />
                    Use My Location
                </button>
            </div>

            {/* Search / Filters */}
            <div className="flex flex-col gap-3 rounded-[6px] border border-[var(--border)] bg-[var(--surface)] p-4 lg:flex-row lg:items-center lg:justify-between">

                <div className="relative w-full lg:max-w-md">
                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                    />

                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search nearby resources..."
                        className="w-full rounded-[5px] border border-slate-700 bg-[#091522] py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-cyan-500"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {["All", "Police", "Hospital", "Fire Station"].map(
                        (item) => {
                            const Icon =
                                categoryConfig[item]?.icon ||
                                ShieldCheck;

                            return (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() => setCategory(item)}
                                    className={`inline-flex items-center gap-1.5 rounded-[5px] px-3 py-2 text-xs font-medium transition ${category === item
                                            ? "bg-cyan-500 text-slate-950"
                                            : "border border-slate-700 bg-[#091522] text-slate-400 hover:text-white"
                                        }`}
                                >
                                    <Icon size={14} />
                                    {item}
                                </button>
                            );
                        }
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_420px]">

                {/* Map Placeholder */}
                <div className="relative min-h-[520px] overflow-hidden rounded-[6px] border border-[var(--border)] bg-[#091522]">

                    {/* Grid */}
                    <div className="absolute inset-0 opacity-30">
                        <div className="absolute left-[15%] top-0 h-full w-px bg-slate-700" />
                        <div className="absolute left-[42%] top-0 h-full w-px rotate-[12deg] bg-slate-700" />
                        <div className="absolute left-[70%] top-0 h-full w-px -rotate-[8deg] bg-slate-700" />

                        <div className="absolute left-0 top-[25%] h-px w-full bg-slate-700" />
                        <div className="absolute left-0 top-[55%] h-px w-full rotate-[5deg] bg-slate-700" />
                        <div className="absolute left-0 top-[78%] h-px w-full -rotate-[4deg] bg-slate-700" />
                    </div>

                    {/* Roads */}
                    <div className="absolute left-[-10%] top-[45%] h-[7px] w-[120%] rotate-[8deg] bg-slate-700/70" />
                    <div className="absolute left-[48%] top-[-10%] h-[120%] w-[6px] rotate-[18deg] bg-slate-700/60" />
                    <div className="absolute left-[-10%] top-[65%] h-[5px] w-[120%] -rotate-[14deg] bg-slate-700/50" />

                    {/* Map Label */}
                    <div className="absolute left-4 top-4 rounded-[5px] border border-slate-700 bg-[#07101b]/90 px-3 py-2 backdrop-blur">
                        <p className="text-xs font-medium text-slate-300">
                            Dehradun Emergency Network
                        </p>

                        <p className="mt-0.5 text-[10px] text-slate-600">
                            Nearby resources
                        </p>
                    </div>

                    {/* Center Location */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div className="relative flex h-12 w-12 items-center justify-center rounded-full border-4 border-cyan-400/20 bg-cyan-500/20">
                            <div className="h-4 w-4 rounded-full bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.7)]" />
                        </div>
                    </div>

                    {/* Police Map Pin */}
                    <div className="absolute left-[25%] top-[32%]">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-blue-400/30 bg-blue-500/20">
                            <Shield
                                size={17}
                                className="text-blue-400"
                            />
                        </div>
                    </div>

                    {/* Hospital Map Pin */}
                    <div className="absolute left-[68%] top-[27%]">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-red-400/30 bg-red-500/20">
                            <Hospital
                                size={17}
                                className="text-red-400"
                            />
                        </div>
                    </div>

                    {/* Fire Map Pin */}
                    <div className="absolute left-[75%] top-[68%]">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-orange-400/30 bg-orange-500/20">
                            <Flame
                                size={17}
                                className="text-orange-400"
                            />
                        </div>
                    </div>

                    {/* Map Footer */}
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-[5px] border border-slate-700 bg-[#07101b]/90 px-3 py-2 backdrop-blur">
                        <div className="flex items-center gap-4 text-[10px] text-slate-500">
                            <span className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-blue-400" />
                                Police
                            </span>

                            <span className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-red-400" />
                                Hospital
                            </span>

                            <span className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-orange-400" />
                                Fire
                            </span>
                        </div>

                        <span className="text-[10px] text-slate-600">
                            Map View
                        </span>
                    </div>
                </div>

                {/* Places List */}
                <div className="rounded-[6px] border border-[var(--border)] bg-[var(--surface)]">

                    <div className="border-b border-[var(--border)] px-5 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-base font-semibold text-white">
                                    Nearby Resources
                                </h2>

                                <p className="mt-1 text-xs text-slate-500">
                                    {filteredPlaces.length} resources found
                                </p>
                            </div>

                            <Building2
                                size={19}
                                className="text-slate-600"
                            />
                        </div>
                    </div>

                    <div className="divide-y divide-[var(--border)]">
                        {filteredPlaces.map((place) => {
                            const Icon = place.icon;

                            return (
                                <div
                                    key={place.id}
                                    className="p-4 transition hover:bg-white/[0.015]"
                                >
                                    <div className="flex gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[5px] bg-cyan-500/10">
                                            <Icon
                                                size={19}
                                                className="text-cyan-400"
                                            />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <h3 className="text-sm font-medium text-slate-200">
                                                        {place.name}
                                                    </h3>

                                                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                                                        <MapPin size={12} />
                                                        {place.address}
                                                    </p>
                                                </div>

                                                <span className="shrink-0 text-xs font-medium text-cyan-400">
                                                    {place.distance}
                                                </span>
                                            </div>

                                            <div className="mt-3 flex items-center gap-2">
                                                <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                                                    <Clock3 size={12} />
                                                    {place.status}
                                                </span>
                                            </div>

                                            <div className="mt-3 flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDirections(place)
                                                    }
                                                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-[4px] border border-slate-700 bg-[#091522] px-2.5 py-2 text-[11px] font-medium text-slate-300 transition hover:border-cyan-500/30 hover:text-cyan-400"
                                                >
                                                    <Navigation size={13} />
                                                    Directions
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleCall(place.phone)
                                                    }
                                                    className="inline-flex items-center justify-center gap-1.5 rounded-[4px] border border-cyan-500/20 bg-cyan-500/5 px-3 py-2 text-[11px] font-medium text-cyan-400 transition hover:bg-cyan-500/10"
                                                >
                                                    <Phone size={13} />
                                                    Call
                                                </button>

                                                <button
                                                    type="button"
                                                    className="flex h-8 w-8 items-center justify-center rounded-[4px] text-slate-600 transition hover:bg-slate-800 hover:text-white"
                                                >
                                                    <ChevronRight size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {filteredPlaces.length === 0 && (
                            <div className="px-5 py-14 text-center">
                                <MapPin
                                    size={24}
                                    className="mx-auto text-slate-600"
                                />

                                <p className="mt-3 text-sm font-medium text-slate-300">
                                    No resources found
                                </p>

                                <p className="mt-1 text-xs text-slate-600">
                                    Try another search or category.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Safety Notice */}
            <div className="flex items-start gap-3 rounded-[6px] border border-amber-500/15 bg-amber-500/5 p-4">
                <ShieldCheck
                    size={18}
                    className="mt-0.5 shrink-0 text-amber-400"
                />

                <div>
                    <p className="text-xs font-medium text-amber-300">
                        Emergency assistance
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                        In an immediate emergency, use the emergency numbers
                        above instead of waiting for a nearby resource search.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default NearbyHelp;