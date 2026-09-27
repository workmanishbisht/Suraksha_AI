import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
    Home,
    TriangleAlert,
    FileText,
    Users,
    UserRound,
    Truck,
    Megaphone,
    BarChart3,
    UserCog,
    Settings,
    ClipboardList,
    ShieldCheck,
    ChevronRight,
    Bell,
    MapPin,
    CircleAlert,
    History,
    LifeBuoy,
    Radio,
    ClipboardCheck,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

const API_BASE_URL = "http://localhost:5000/api";

const menuByRole = {
    admin: [
        {
            title: "MAIN",
            items: [
                {
                    label: "Dashboard",
                    icon: Home,
                    path: "/admin/dashboard",
                },
                {
                    label: "Incidents",
                    icon: TriangleAlert,
                    path: "/admin/incidents",
                    dynamicBadge: "incidentCount",
                },
                {
                    label: "Reports",
                    icon: FileText,
                    path: "/admin/reports",
                },
            ],
        },
        {
            title: "MANAGEMENT",
            items: [
                {
                    label: "Citizens",
                    icon: Users,
                    path: "/admin/citizens",
                },
                {
                    label: "Field Officers",
                    icon: UserRound,
                    path: "/admin/field-officers",
                },
                {
                    label: "Emergency Resources",
                    icon: Truck,
                    path: "/admin/resources",
                },
                {
                    label: "Communication",
                    icon: Megaphone,
                    path: "/admin/communication",
                },
            ],
        },
        {
            title: "INSIGHTS",
            items: [
                {
                    label: "Analytics",
                    icon: BarChart3,
                    path: "/admin/analytics",
                },
            ],
        },
        {
            title: "SYSTEM",
            items: [
                {
                    label: "Users & Roles",
                    icon: UserCog,
                    path: "/admin/users",
                },
                {
                    label: "System Settings",
                    icon: Settings,
                    path: "/admin/settings",
                },
                {
                    label: "Audit Logs",
                    icon: ClipboardList,
                    path: "/admin/audit-logs",
                },
            ],
        },
    ],

    citizen: [
        {
            title: "MAIN",
            items: [
                {
                    label: "Dashboard",
                    icon: Home,
                    path: "/citizen/dashboard",
                },
                {
                    label: "Report Incident",
                    icon: TriangleAlert,
                    path: "/citizen/report-incident",
                },
                {
                    label: "My Reports",
                    icon: FileText,
                    path: "/citizen/my-reports",
                },
            ],
        },
        {
            title: "SAFETY",
            items: [
                {
                    label: "Emergency Alerts",
                    icon: Bell,
                    path: "/citizen/alerts",
                },
                {
                    label: "Nearby Help",
                    icon: MapPin,
                    path: "/citizen/nearby-help",
                },
                {
                    label: "Emergency Contacts",
                    icon: LifeBuoy,
                    path: "/citizen/emergency-contacts",
                },
            ],
        },
        {
            title: "ACCOUNT",
            items: [
                {
                    label: "Profile",
                    icon: UserRound,
                    path: "/citizen/profile",
                },
                {
                    label: "Settings",
                    icon: Settings,
                    path: "/citizen/settings",
                },
            ],
        },
    ],

    field_officer: [
        {
            title: "MAIN",
            items: [
                {
                    label: "Dashboard",
                    icon: Home,
                    path: "/field-officer/dashboard",
                },
                {
                    label: "Assigned Incidents",
                    icon: TriangleAlert,
                    path: "/field-officer/incidents",
                },
                {
                    label: "Incident Reports",
                    icon: FileText,
                    path: "/field-officer/reports",
                },
            ],
        },
        {
            title: "OPERATIONS",
            items: [
                {
                    label: "Live Operations",
                    icon: Radio,
                    path: "/field-officer/operations",
                },
                {
                    label: "Emergency Resources",
                    icon: Truck,
                    path: "/field-officer/resources",
                },
                {
                    label: "Communication",
                    icon: Megaphone,
                    path: "/field-officer/communication",
                },
            ],
        },
        {
            title: "ACCOUNT",
            items: [
                {
                    label: "Profile",
                    icon: UserRound,
                    path: "/field-officer/profile",
                },
                {
                    label: "Settings",
                    icon: Settings,
                    path: "/field-officer/settings",
                },
            ],
        },
    ],

    department_officer: [
        {
            title: "MAIN",
            items: [
                {
                    label: "Dashboard",
                    icon: Home,
                    path: "/department/dashboard",
                },
                {
                    label: "Incidents",
                    icon: TriangleAlert,
                    path: "/department/incidents",
                },
                {
                    label: "Reports",
                    icon: FileText,
                    path: "/department/reports",
                },
            ],
        },
        {
            title: "OPERATIONS",
            items: [
                {
                    label: "Field Officers",
                    icon: Users,
                    path: "/department/field-officers",
                },
                {
                    label: "Emergency Resources",
                    icon: Truck,
                    path: "/department/resources",
                },
                {
                    label: "Communication",
                    icon: Megaphone,
                    path: "/department/communication",
                },
            ],
        },
        {
            title: "MONITORING",
            items: [
                {
                    label: "Live Operations",
                    icon: Radio,
                    path: "/department/operations",
                },
                {
                    label: "Activity History",
                    icon: History,
                    path: "/department/activity",
                },
            ],
        },
        {
            title: "ACCOUNT",
            items: [
                {
                    label: "Profile",
                    icon: UserRound,
                    path: "/department/profile",
                },
                {
                    label: "Settings",
                    icon: Settings,
                    path: "/department/settings",
                },
            ],
        },
    ],
};

function Sidebar() {
    const { user } = useAuth();
    const [incidentCount, setIncidentCount] = useState(0);

    const role = user?.role || "citizen";
    const isAdmin = role === "admin";

    useEffect(() => {
        if (!isAdmin) return;

        let cancelled = false;

        const fetchIncidentCount = async () => {
            try {
                const response = await fetch(
                    `${API_BASE_URL}/analytics`,
                    {
                        method: "GET",
                        credentials: "include",
                    }
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch incident count.");
                }

                const data = await response.json();

                if (!cancelled) {
                    setIncidentCount(
                        Number(data?.totalIncidents ?? 0)
                    );
                }
            } catch (error) {
                if (!cancelled) {
                    setIncidentCount(0);
                }
            }
        };

        fetchIncidentCount();

        const interval = setInterval(fetchIncidentCount, 60000);

        return () => {
            cancelled = true;
            clearInterval(interval);
        };
    }, [isAdmin]);
    const menuGroups = menuByRole[role] || menuByRole.citizen;

    return (
        <aside
            className="
                fixed left-0 top-0 z-50
                hidden h-screen w-[248px]
                border-r border-[#173149]
                bg-[#071827]
                lg:flex lg:flex-col
            "
        >
            {/* Logo */}
            <div
                className="
                    flex h-[72px] shrink-0
                    items-center
                    border-b border-[#173149]
                    px-5
                "
            >
                <div className="flex items-center gap-3">
                    <div
                        className="
                            flex h-10 w-10 shrink-0
                            items-center justify-center
                            rounded-[7px]
                            border border-cyan-400/25
                            bg-cyan-400/[0.08]
                        "
                    >
                        <ShieldCheck
                            size={23}
                            strokeWidth={1.8}
                            className="text-cyan-400"
                        />
                    </div>

                    <div>
                        <h1
                            className="
                                text-[20px]
                                font-semibold
                                leading-none
                                tracking-tight
                                text-white
                            "
                        >
                            Suraksha
                            <span className="text-cyan-400">
                                AI
                            </span>
                        </h1>

                        <p
                            className="
                                mt-1.5
                                text-[8px]
                                font-medium
                                tracking-[0.14em]
                                text-slate-500
                            "
                        >
                            DISASTER MANAGEMENT
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav
                className="
                    flex-1
                    min-h-0
                    overflow-y-auto
                    px-3
                    py-4
                    [scrollbar-width:none]
                    [-ms-overflow-style:none]
                    [&::-webkit-scrollbar]:hidden
                "
            >
                {menuGroups.map((group) => (
                    <div
                        key={group.title}
                        className="mb-5 last:mb-0"
                    >
                        {/* Section Title */}
                        <p
                            className="
                                mb-1.5
                                px-3
                                text-[9px]
                                font-semibold
                                tracking-[0.18em]
                                text-slate-600
                            "
                        >
                            {group.title}
                        </p>

                        {/* Menu Items */}
                        <div className="space-y-0.5">
                            {group.items.map((item) => {
                                const Icon = item.icon;

                                return (
                                    <NavLink
                                        key={item.label}
                                        to={item.path}
                                        className={({ isActive }) =>
                                            `
                                                group relative
                                                flex items-center
                                                gap-3
                                                rounded-[6px]
                                                px-3
                                                py-2.5
                                                text-[12px]
                                                font-medium
                                                transition-all
                                                duration-200

                                                ${isActive
                                                ? "bg-cyan-400/[0.09] text-cyan-300"
                                                : "text-slate-400 hover:bg-white/[0.035] hover:text-slate-100"
                                            }
                                            `
                                        }
                                    >
                                        {({ isActive }) => (
                                            <>
                                                {/* Active Line */}
                                                {isActive && (
                                                    <span
                                                        className="
                                                            absolute
                                                            left-0
                                                            top-1/2
                                                            h-6
                                                            w-[2px]
                                                            -translate-y-1/2
                                                            rounded-r-full
                                                            bg-cyan-400
                                                        "
                                                    />
                                                )}

                                                {/* Icon */}
                                                <div
                                                    className={`
                                                        flex h-8 w-8
                                                        shrink-0
                                                        items-center
                                                        justify-center
                                                        rounded-[5px]
                                                        transition-all

                                                        ${isActive
                                                            ? "bg-cyan-400/10"
                                                            : "group-hover:bg-white/[0.035]"
                                                        }
                                                    `}
                                                >
                                                    <Icon
                                                        size={17}
                                                        strokeWidth={1.8}
                                                        className={
                                                            isActive
                                                                ? "text-cyan-400"
                                                                : "text-slate-500 group-hover:text-slate-300"
                                                        }
                                                    />
                                                </div>

                                                {/* Label */}
                                                <span className="flex-1 truncate">
                                                    {item.label}
                                                </span>

                                                {/* Badge */}
                                                {(item.badge ||
                                                    item.dynamicBadge ===
                                                    "incidentCount") && (
                                                        <span
                                                            className="
                                                            min-w-[25px]
                                                            rounded-full
                                                            bg-red-500/10
                                                            px-1.5
                                                            py-0.5
                                                            text-center
                                                            text-[9px]
                                                            font-medium
                                                            text-red-400
                                                        "
                                                        >
                                                            {item.dynamicBadge ===
                                                                "incidentCount"
                                                                ? incidentCount
                                                                : item.badge}
                                                        </span>
                                                    )}

                                                {/* Active Arrow */}
                                                {isActive && !item.badge && !item.dynamicBadge && (
                                                    <ChevronRight
                                                        size={14}
                                                        strokeWidth={1.8}
                                                        className="
                                                            text-cyan-500/60
                                                        "
                                                    />
                                                )}
                                            </>
                                        )}
                                    </NavLink>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Bottom Section */}
            <div
                className="
                    shrink-0
                    border-t border-[#173149]
                    bg-[#071827]
                    p-3
                "
            >
                {/* System Status */}
                <div
                    className="
                        rounded-[6px]
                        border border-[#173149]
                        bg-[#0a1b2c]
                        p-3
                    "
                >
                    <div className="flex items-center gap-3">
                        <div
                            className="
                                flex h-8 w-8 shrink-0
                                items-center justify-center
                                rounded-[5px]
                                bg-emerald-400/10
                            "
                        >
                            <span
                                className="
                                    h-2 w-2
                                    rounded-full
                                    bg-emerald-400
                                    shadow-[0_0_8px_rgba(52,211,153,0.45)]
                                "
                            />
                        </div>

                        <div className="min-w-0">
                            <p
                                className="
                                    text-[10px]
                                    font-medium
                                    text-slate-200
                                "
                            >
                                System Operational
                            </p>

                            <p
                                className="
                                    mt-0.5
                                    truncate
                                    text-[8px]
                                    text-slate-500
                                "
                            >
                                All services running normally
                            </p>
                        </div>
                    </div>
                </div>

                {/* Government */}
                <div
                    className="
                        mt-2.5
                        flex items-center
                        gap-2
                        px-1
                        text-[9px]
                        text-slate-600
                    "
                >
                    <ShieldCheck size={13} />

                    <span>
                        Government of India
                    </span>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;