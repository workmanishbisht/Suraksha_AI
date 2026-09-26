import {
    AlertTriangle,
    ArrowRight,
    Bell,
    CheckCircle2,
    Clock3,
    FileText,
    MapPin,
    ShieldCheck,
    Siren,
    TrendingUp,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const stats = [
    {
        label: "My Reports",
        value: "12",
        change: "+2 this month",
        icon: FileText,
        iconClass: "text-blue-400",
        bgClass: "bg-blue-400/10",
    },
    {
        label: "Active Reports",
        value: "03",
        change: "2 under review",
        icon: Clock3,
        iconClass: "text-amber-400",
        bgClass: "bg-amber-400/10",
    },
    {
        label: "Resolved Reports",
        value: "09",
        change: "75% resolution rate",
        icon: CheckCircle2,
        iconClass: "text-emerald-400",
        bgClass: "bg-emerald-400/10",
    },
    {
        label: "Safety Alerts",
        value: "04",
        change: "1 new alert",
        icon: Bell,
        iconClass: "text-red-400",
        bgClass: "bg-red-400/10",
    },
];

const recentReports = [
    {
        id: "#INC-10482",
        title: "Road Accident",
        location: "Rajpur Road, Dehradun",
        date: "Today, 09:42 AM",
        status: "Under Review",
        statusClass: "text-amber-400 bg-amber-400/10",
        icon: AlertTriangle,
        iconClass: "text-amber-400",
    },
    {
        id: "#INC-10476",
        title: "Water Logging",
        location: "Clock Tower Area",
        date: "Yesterday, 06:18 PM",
        status: "Resolved",
        statusClass: "text-emerald-400 bg-emerald-400/10",
        icon: CheckCircle2,
        iconClass: "text-emerald-400",
    },
    {
        id: "#INC-10451",
        title: "Street Light Failure",
        location: "Vasant Vihar",
        date: "18 Sep 2026, 08:25 PM",
        status: "Resolved",
        statusClass: "text-emerald-400 bg-emerald-400/10",
        icon: CheckCircle2,
        iconClass: "text-emerald-400",
    },
];

const alerts = [
    {
        title: "Heavy Rainfall Warning",
        location: "Dehradun District",
        time: "15 min ago",
        level: "High",
        levelClass: "text-red-400 bg-red-400/10",
    },
    {
        title: "Traffic Advisory",
        location: "Rajpur Road",
        time: "42 min ago",
        level: "Medium",
        levelClass: "text-amber-400 bg-amber-400/10",
    },
    {
        title: "Weather Update",
        location: "Mussoorie Region",
        time: "1 hr ago",
        level: "Low",
        levelClass: "text-emerald-400 bg-emerald-400/10",
    },
];

function Dashboard() {
    const { user } = useAuth();

    const userName = user?.name || "Citizen";

    return (
        <div className="space-y-6">

            {/* =========================================
                WELCOME HEADER
            ========================================== */}
            <section
                className="
                    relative overflow-hidden
                    rounded-[6px]
                    border border-[#173149]
                    bg-[#0a1b2c]
                    px-5 py-5
                    sm:px-6 sm:py-6
                "
            >
                <div
                    className="
                        pointer-events-none absolute
                        -right-20 -top-24
                        h-64 w-64
                        rounded-full
                        bg-cyan-400/[0.06]
                        blur-3xl
                    "
                />

                <div
                    className="
                        pointer-events-none absolute
                        -bottom-28 left-1/3
                        h-56 w-56
                        rounded-full
                        bg-blue-500/[0.05]
                        blur-3xl
                    "
                />

                <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                    <div>
                        <div className="mb-2 flex items-center gap-2">
                            <span
                                className="
                                    flex h-7 w-7
                                    items-center justify-center
                                    rounded-[5px]
                                    bg-cyan-400/10
                                "
                            >
                                <ShieldCheck
                                    size={16}
                                    className="text-cyan-400"
                                />
                            </span>

                            <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-cyan-400">
                                Citizen Portal
                            </span>
                        </div>

                        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-[28px]">
                            Welcome back, {userName}
                        </h1>

                        <p className="mt-2 max-w-xl text-xs leading-5 text-slate-400 sm:text-sm">
                            Stay informed, report emergencies and help keep
                            your community safe with SurakshaAI.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="
                            inline-flex h-11
                            items-center justify-center
                            gap-2
                            rounded-[6px]
                            bg-red-500
                            px-5
                            text-xs font-semibold
                            text-white
                            transition
                            hover:bg-red-600
                            active:scale-[0.98]
                        "
                    >
                        <Siren size={17} />
                        Report Emergency
                    </button>
                </div>
            </section>

            {/* =========================================
                STATS
            ========================================== */}
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;

                    return (
                        <div
                            key={stat.label}
                            className="
                                rounded-[6px]
                                border border-[#173149]
                                bg-[#0a1b2c]
                                p-4
                                transition
                                hover:border-[#28506d]
                            "
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-[11px] text-slate-500">
                                        {stat.label}
                                    </p>

                                    <h2 className="mt-2 text-2xl font-semibold text-white">
                                        {stat.value}
                                    </h2>
                                </div>

                                <div
                                    className={`
                                        flex h-9 w-9
                                        items-center justify-center
                                        rounded-[5px]
                                        ${stat.bgClass}
                                    `}
                                >
                                    <Icon
                                        size={18}
                                        className={stat.iconClass}
                                    />
                                </div>
                            </div>

                            <div className="mt-3 flex items-center gap-1.5">
                                <TrendingUp
                                    size={12}
                                    className="text-emerald-400"
                                />

                                <span className="text-[10px] text-slate-500">
                                    {stat.change}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </section>

            {/* =========================================
                MAIN CONTENT
            ========================================== */}
            <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.6fr_1fr]">

                {/* Recent Reports */}
                <div
                    className="
                        overflow-hidden
                        rounded-[6px]
                        border border-[#173149]
                        bg-[#0a1b2c]
                    "
                >
                    <div
                        className="
                            flex items-center
                            justify-between
                            border-b border-[#173149]
                            px-5 py-4
                        "
                    >
                        <div>
                            <h2 className="text-sm font-semibold text-white">
                                Recent Reports
                            </h2>

                            <p className="mt-1 text-[10px] text-slate-500">
                                Your latest incident reports
                            </p>
                        </div>

                        <button
                            type="button"
                            className="
                                flex items-center gap-1
                                text-[10px] font-medium
                                text-cyan-400
                                transition
                                hover:text-cyan-300
                            "
                        >
                            View All
                            <ArrowRight size={13} />
                        </button>
                    </div>

                    <div className="divide-y divide-[#173149]">
                        {recentReports.map((report) => {
                            const Icon = report.icon;

                            return (
                                <div
                                    key={report.id}
                                    className="
                                        flex items-center
                                        gap-4
                                        px-5 py-4
                                        transition
                                        hover:bg-white/[0.015]
                                    "
                                >
                                    <div
                                        className="
                                            flex h-10 w-10 shrink-0
                                            items-center justify-center
                                            rounded-[5px]
                                            bg-slate-800/70
                                        "
                                    >
                                        <Icon
                                            size={18}
                                            className={report.iconClass}
                                        />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="text-xs font-medium text-slate-200">
                                                {report.title}
                                            </p>

                                            <span className="text-[9px] text-slate-600">
                                                {report.id}
                                            </span>
                                        </div>

                                        <div className="mt-1 flex flex-wrap items-center gap-2">
                                            <span className="flex items-center gap-1 text-[10px] text-slate-500">
                                                <MapPin size={11} />
                                                {report.location}
                                            </span>

                                            <span className="text-[9px] text-slate-600">
                                                •
                                            </span>

                                            <span className="text-[10px] text-slate-600">
                                                {report.date}
                                            </span>
                                        </div>
                                    </div>

                                    <span
                                        className={`
                                            shrink-0
                                            rounded-full
                                            px-2.5 py-1
                                            text-[9px] font-medium
                                            ${report.statusClass}
                                        `}
                                    >
                                        {report.status}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Emergency Alerts */}
                <div
                    className="
                        overflow-hidden
                        rounded-[6px]
                        border border-[#173149]
                        bg-[#0a1b2c]
                    "
                >
                    <div
                        className="
                            flex items-center
                            justify-between
                            border-b border-[#173149]
                            px-5 py-4
                        "
                    >
                        <div>
                            <h2 className="text-sm font-semibold text-white">
                                Emergency Alerts
                            </h2>

                            <p className="mt-1 text-[10px] text-slate-500">
                                Latest safety notifications
                            </p>
                        </div>

                        <div
                            className="
                                flex h-7 w-7
                                items-center justify-center
                                rounded-[5px]
                                bg-red-400/10
                            "
                        >
                            <Bell
                                size={14}
                                className="text-red-400"
                            />
                        </div>
                    </div>

                    <div className="divide-y divide-[#173149]">
                        {alerts.map((alert) => (
                            <div
                                key={alert.title}
                                className="
                                    px-5 py-4
                                    transition
                                    hover:bg-white/[0.015]
                                "
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex min-w-0 gap-3">
                                        <div
                                            className="
                                                mt-0.5
                                                flex h-8 w-8
                                                shrink-0
                                                items-center justify-center
                                                rounded-[5px]
                                                bg-red-400/10
                                            "
                                        >
                                            <AlertTriangle
                                                size={15}
                                                className="text-red-400"
                                            />
                                        </div>

                                        <div className="min-w-0">
                                            <p className="truncate text-xs font-medium text-slate-200">
                                                {alert.title}
                                            </p>

                                            <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-500">
                                                <MapPin size={10} />
                                                {alert.location}
                                            </div>

                                            <p className="mt-1 text-[9px] text-slate-600">
                                                {alert.time}
                                            </p>
                                        </div>
                                    </div>

                                    <span
                                        className={`
                                            shrink-0
                                            rounded-full
                                            px-2 py-1
                                            text-[8px] font-medium
                                            ${alert.levelClass}
                                        `}
                                    >
                                        {alert.level}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        className="
                            flex w-full
                            items-center justify-center
                            gap-2
                            border-t border-[#173149]
                            py-3
                            text-[10px] font-medium
                            text-cyan-400
                            transition
                            hover:bg-white/[0.02]
                        "
                    >
                        View All Alerts
                        <ArrowRight size={13} />
                    </button>
                </div>
            </section>

            {/* =========================================
                QUICK ACTIONS
            ========================================== */}
            <section
                className="
                    rounded-[6px]
                    border border-[#173149]
                    bg-[#0a1b2c]
                    p-5
                "
            >
                <div className="mb-4">
                    <h2 className="text-sm font-semibold text-white">
                        Quick Actions
                    </h2>

                    <p className="mt-1 text-[10px] text-slate-500">
                        Frequently used safety services
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <QuickAction
                        icon={Siren}
                        title="Report Emergency"
                        text="Report an incident immediately"
                        iconClass="text-red-400"
                        bgClass="bg-red-400/10"
                    />

                    <QuickAction
                        icon={FileText}
                        title="My Reports"
                        text="Track your submitted reports"
                        iconClass="text-blue-400"
                        bgClass="bg-blue-400/10"
                    />

                    <QuickAction
                        icon={MapPin}
                        title="Nearby Help"
                        text="Find emergency services nearby"
                        iconClass="text-cyan-400"
                        bgClass="bg-cyan-400/10"
                    />

                    <QuickAction
                        icon={Bell}
                        title="Safety Alerts"
                        text="View latest emergency alerts"
                        iconClass="text-amber-400"
                        bgClass="bg-amber-400/10"
                    />
                </div>
            </section>

            {/* =========================================
                SAFETY NOTICE
            ========================================== */}
            <section
                className="
                    flex flex-col gap-4
                    rounded-[6px]
                    border border-emerald-400/15
                    bg-emerald-400/[0.035]
                    p-4
                    sm:flex-row sm:items-center
                    sm:justify-between
                "
            >
                <div className="flex items-start gap-3">
                    <div
                        className="
                            flex h-9 w-9 shrink-0
                            items-center justify-center
                            rounded-[5px]
                            bg-emerald-400/10
                        "
                    >
                        <ShieldCheck
                            size={18}
                            className="text-emerald-400"
                        />
                    </div>

                    <div>
                        <p className="text-xs font-medium text-slate-200">
                            Stay Safe, Stay Informed
                        </p>

                        <p className="mt-1 text-[10px] leading-4 text-slate-500">
                            In case of immediate danger, contact your local
                            emergency services.
                        </p>
                    </div>
                </div>

                <span
                    className="
                        inline-flex items-center gap-1.5
                        text-[10px] font-medium
                        text-emerald-400
                    "
                >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    System Operational
                </span>
            </section>
        </div>
    );
}

function QuickAction({
    icon: Icon,
    title,
    text,
    iconClass,
    bgClass,
}) {
    return (
        <button
            type="button"
            className="
                flex items-center gap-3
                rounded-[6px]
                border border-[#173149]
                bg-[#071827]
                p-3.5
                text-left
                transition-all
                hover:border-[#28506d]
                hover:bg-[#0d2133]
            "
        >
            <div
                className={`
                    flex h-9 w-9 shrink-0
                    items-center justify-center
                    rounded-[5px]
                    ${bgClass}
                `}
            >
                <Icon
                    size={17}
                    className={iconClass}
                />
            </div>

            <div className="min-w-0">
                <p className="text-[11px] font-medium text-slate-200">
                    {title}
                </p>

                <p className="mt-0.5 truncate text-[9px] text-slate-500">
                    {text}
                </p>
            </div>
        </button>
    );
}

export default Dashboard;