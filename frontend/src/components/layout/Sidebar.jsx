
import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
    Home,
    TriangleAlert,
    FileText,
    Users,
    UserRound,
    Truck,
    Megaphone,
    BarChart3,
    Settings,
    ClipboardList,
    ShieldCheck,
    ChevronRight,
    Bell,
    MapPin,
    History,
    LifeBuoy,
    Radio,
    Menu,
    X,
    UserCog,
    FolderCog,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL = "http://localhost:5000/api";

const menuByRole = {
    admin: [
        {
            title: "MAIN",
            items: [
                { label: "Dashboard", icon: Home, path: "/admin/dashboard" },
                {
                    label: "Incidents",
                    icon: TriangleAlert,
                    path: "/admin/incidents",
                    dynamicBadge: "incidentCount",
                },
                { label: "Reports", icon: FileText, path: "/admin/reports" },
            ],
        },
        {
            title: "MANAGEMENT",
            items: [
                { label: "Citizens", icon: Users, path: "/admin/citizens" },
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
                { label: "Analytics", icon: BarChart3, path: "/admin/analytics" },
            ],
        },
        {
            title: "SYSTEM",
            items: [
                {
                    label: "Administration",
                    icon: FolderCog,
                    children: [
                        {
                            label: "Users",
                            icon: Users,
                            path: "/admin/administration/users",
                        },
                        {
                            label: "Roles & Permissions",
                            icon: UserCog,
                            path: "/admin/administration/roles-permissions",
                        },
                        {
                            label: "Audit Logs",
                            icon: ClipboardList,
                            path: "/admin/audit-logs",
                        },
                    ],
                },
                {
                    label: "System Settings",
                    icon: Settings,
                    path: "/admin/settings",
                },
            ],
        },
    ],

    citizen: [
        {
            title: "MAIN",
            items: [
                { label: "Dashboard", icon: Home, path: "/citizen/dashboard" },
                {
                    label: "Report Incident",
                    icon: TriangleAlert,
                    path: "/citizen/report-incident",
                },
                { label: "My Reports", icon: FileText, path: "/citizen/my-reports" },
            ],
        },
        {
            title: "SAFETY",
            items: [
                { label: "Emergency Alerts", icon: Bell, path: "/citizen/alerts" },
                { label: "Nearby Help", icon: MapPin, path: "/citizen/nearby-help" },
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
                { label: "Profile", icon: UserRound, path: "/citizen/profile" },
                { label: "Settings", icon: Settings, path: "/citizen/settings" },
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
    const location = useLocation();

    const [incidentCount, setIncidentCount] = useState(0);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [administrationOpen, setAdministrationOpen] = useState(false);

    const role = user?.role || "citizen";
    const isAdmin = role === "admin";
    const menuGroups = menuByRole[role] || menuByRole.citizen;

    const isAdministrationActive = location.pathname.startsWith(
        "/admin/administration"
    );

    useEffect(() => {
        if (isAdministrationActive) {
            setAdministrationOpen(true);
        }
    }, [isAdministrationActive]);

    useEffect(() => {
        if (!isAdmin) {
            setIncidentCount(0);
            return;
        }

        let cancelled = false;

        const fetchIncidentCount = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/analytics`, {
                    method: "GET",
                    credentials: "include",
                    cache: "no-store",
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch incident count.");
                }

                const data = await response.json();
                const totalIncidents = Number(
                    data?.analytics?.overview?.totalIncidents ?? 0
                );

                if (!cancelled) {
                    setIncidentCount(totalIncidents);
                }
            } catch (error) {
                console.error("Sidebar Incident Count Error:", error);

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

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setMobileOpen(false);
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        document.body.style.overflow = mobileOpen ? "hidden" : "";

        return () => {
            document.body.style.overflow = "";
        };
    }, [mobileOpen]);

    const closeMobileMenu = () => {
        if (window.innerWidth < 1024) {
            setMobileOpen(false);
        }
    };

    // Same typography for every primary and nested menu label.
    const baseItemClass =
        "group relative flex min-h-[44px] w-full items-center gap-3 rounded-[6px] px-3 py-2 text-left text-[12px] font-medium transition-colors duration-200";

    const getItemClass = (isActive) =>
        `${baseItemClass} ${isActive
            ? "bg-cyan-400/[0.09] text-cyan-300"
            : "text-slate-400 hover:bg-white/[0.035] hover:text-slate-100"
        }`;

    const renderMenuItem = (item) => {
        const Icon = item.icon;

        if (item.children) {
            const isOpen = administrationOpen || isAdministrationActive;

            return (
                <div key={item.label}>
                    <button
                        type="button"
                        onClick={() => setAdministrationOpen((prev) => !prev)}
                        aria-expanded={isOpen}
                        className={getItemClass(isAdministrationActive)}
                    >
                        {isAdministrationActive && (
                            <span className="absolute left-0 top-1/2 h-6 w-[2px] -translate-y-1/2 rounded-r-full bg-cyan-400" />
                        )}

                        <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[5px] ${isAdministrationActive
                                    ? "bg-cyan-400/10"
                                    : "group-hover:bg-white/[0.035]"
                                }`}
                        >
                            <Icon
                                size={17}
                                strokeWidth={1.8}
                                className={
                                    isAdministrationActive
                                        ? "text-cyan-400"
                                        : "text-slate-500 group-hover:text-slate-300"
                                }
                            />
                        </span>

                        <span className="min-w-0 flex-1 truncate text-[12px] font-medium !text-white">
                            {item.label}
                        </span>

                        <ChevronRight
                            size={15}
                            strokeWidth={1.8}
                            className={`shrink-0 transition-transform duration-200 ${isOpen
                                    ? "rotate-90 text-cyan-400"
                                    : "text-slate-500"
                                }`}
                        />
                    </button>

                    {isOpen && (
                        <div className="ml-[22px] mt-1 space-y-0.5 border-l border-[#173149] pl-3">
                            {item.children.map((child) => {
                                const ChildIcon = child.icon;

                                return (
                                    <NavLink
                                        key={child.path}
                                        to={child.path}
                                        onClick={closeMobileMenu}
                                        className={({ isActive }) =>
                                            getItemClass(isActive)
                                        }
                                    >
                                        {({ isActive }) => (
                                            <>
                                                <span
                                                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-[5px] ${isActive
                                                        ? "bg-cyan-400/10"
                                                        : ""
                                                        }`}
                                                >
                                                    <ChildIcon
                                                        size={16}
                                                        strokeWidth={1.8}
                                                        className={
                                                            isActive
                                                                ? "text-cyan-400"
                                                                : "text-slate-500 group-hover:text-slate-300"
                                                        }
                                                    />
                                                </span>

                                                <span className="min-w-0 flex-1 truncate text-[12px] font-medium">
                                                    {child.label}
                                                </span>

                                                {isActive && (
                                                    <ChevronRight
                                                        size={14}
                                                        className="shrink-0 text-cyan-500/60"
                                                    />
                                                )}
                                            </>
                                        )}
                                    </NavLink>
                                );
                            })}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <NavLink
                key={item.path}
                to={item.path}
                onClick={closeMobileMenu}
                className={({ isActive }) => getItemClass(isActive)}
            >
                {({ isActive }) => (
                    <>
                        {isActive && (
                            <span className="absolute left-0 top-1/2 h-6 w-[2px] -translate-y-1/2 rounded-r-full bg-cyan-400" />
                        )}

                        <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[5px] transition-colors ${isActive
                                ? "bg-cyan-400/10"
                                : "group-hover:bg-white/[0.035]"
                                }`}
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
                        </span>

                        <span className="min-w-0 flex-1 truncate text-[12px] font-medium">
                            {item.label}
                        </span>

                        {(item.badge ||
                            item.dynamicBadge === "incidentCount") && (
                                <span className="min-w-[25px] shrink-0 rounded-full bg-red-500/10 px-1.5 py-0.5 text-center text-[9px] font-medium text-red-400">
                                    {item.dynamicBadge === "incidentCount"
                                        ? incidentCount
                                        : item.badge}
                                </span>
                            )}

                        {isActive &&
                            !item.badge &&
                            !item.dynamicBadge && (
                                <ChevronRight
                                    size={14}
                                    strokeWidth={1.8}
                                    className="shrink-0 text-cyan-500/60"
                                />
                            )}
                    </>
                )}
            </NavLink>
        );
    };

    return (
        <>
            {!mobileOpen && (
                <button
                    type="button"
                    aria-label="Open navigation menu"
                    aria-expanded={false}
                    onClick={() => setMobileOpen(true)}
                    className="fixed left-3 top-3 z-[70] flex h-10 w-10 items-center justify-center rounded-[6px] border border-[#173149] bg-[#071827] text-slate-300 shadow-[0_8px_24px_rgba(0,0,0,0.25)] transition hover:border-cyan-400/40 hover:bg-[#0a1b2c] hover:text-cyan-300 lg:hidden"
                >
                    <Menu size={20} strokeWidth={1.8} />
                </button>
            )}

            {mobileOpen && (
                <button
                    type="button"
                    aria-label="Close navigation overlay"
                    onClick={() => setMobileOpen(false)}
                    className="fixed inset-0 z-[45] bg-black/60 backdrop-blur-[1px] lg:hidden"
                />
            )}

            <aside
                className={`fixed bottom-0 left-0 top-0 z-[60] flex h-screen w-[248px] max-w-[85vw] min-w-0 flex-col border-r border-[#173149] bg-[#071827] transition-transform duration-200 ease-out ${mobileOpen ? "translate-x-0" : "-translate-x-full"
                    } lg:translate-x-0`}
            >
                {/* Logo */}
                <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-[#173149] px-5">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[7px] border border-cyan-400/25 bg-cyan-400/[0.08]">
                            <ShieldCheck
                                size={23}
                                strokeWidth={1.8}
                                className="text-cyan-400"
                            />
                        </div>

                        <div className="min-w-0">
                            <h1 className="truncate text-[20px] font-semibold leading-none tracking-tight text-white">
                                Suraksha
                                <span className="text-cyan-400">AI</span>
                            </h1>
                            <p className="mt-1.5 text-[8px] font-medium tracking-[0.14em] text-slate-500">
                                DISASTER MANAGEMENT
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        aria-label="Close navigation menu"
                        onClick={() => setMobileOpen(false)}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[5px] border border-transparent text-slate-400 transition hover:border-[#173149] hover:bg-white/[0.04] hover:text-slate-200 lg:hidden"
                    >
                        <X size={18} strokeWidth={1.8} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    {menuGroups.map((group) => (
                        <div
                            key={group.title}
                            className="mb-5 last:mb-0"
                        >
                            <p className="mb-1.5 px-3 text-[9px] font-semibold tracking-[0.18em] text-slate-600">
                                {group.title}
                            </p>

                            <div className="space-y-0.5">
                                {group.items.map(renderMenuItem)}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Bottom Section */}
                <div className="shrink-0 border-t border-[#173149] bg-[#071827] p-3">
                    <div className="rounded-[6px] border border-[#173149] bg-[#0a1b2c] p-3">
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[5px] bg-emerald-400/10">
                                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.45)]" />
                            </div>

                            <div className="min-w-0">
                                <p className="text-[10px] font-medium text-slate-200">
                                    System Operational
                                </p>
                                <p className="mt-0.5 truncate text-[8px] text-slate-500">
                                    All services running normally
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-2.5 flex items-center gap-2 px-1 text-[9px] text-slate-600">
                        <ShieldCheck size={13} />
                        <span>Government of India</span>
                    </div>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;
