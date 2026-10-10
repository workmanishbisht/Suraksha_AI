import { useState } from "react";
import {
    Settings,
    ShieldCheck,
    Bell,
    SlidersHorizontal,
    Save,
    RotateCcw,
    LockKeyhole,
    Mail,
    Globe2,
    Clock3,
    Database,
    AlertTriangle,
    CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

const settingSections = [
    {
        id: "general",
        label: "General",
        icon: Settings,
    },
    {
        id: "security",
        label: "Security",
        icon: ShieldCheck,
    },
    {
        id: "notifications",
        label: "Notifications",
        icon: Bell,
    },
    {
        id: "preferences",
        label: "Preferences",
        icon: SlidersHorizontal,
    },
];

function SettingToggle({
    checked,
    onChange,
    label,
    description,
}) {
    return (
        <div className="flex items-center justify-between gap-4 rounded-[5px] border border-[#173149] bg-[#071827] px-4 py-3">
            <div className="min-w-0">
                <p className="text-[11px] font-medium text-slate-300">
                    {label}
                </p>

                <p className="mt-1 text-[10px] leading-4 text-slate-600">
                    {description}
                </p>
            </div>

            <button
                type="button"
                onClick={() => onChange(!checked)}
                className={`relative h-5 w-9 shrink-0 rounded-full transition ${checked
                        ? "bg-cyan-500"
                        : "bg-slate-700"
                    }`}
            >
                <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${checked
                            ? "left-[18px]"
                            : "left-0.5"
                        }`}
                />
            </button>
        </div>
    );
}

function SystemSettings() {
    const [activeSection, setActiveSection] =
        useState("general");

    const [settings, setSettings] = useState({
        systemName: "SurakshaAI",
        organizationName:
            "SurakshaAI Emergency Management System",
        timezone: "Asia/Kolkata",
        language: "English",
        maintenanceMode: false,

        loginProtection: true,
        sessionTimeout: "30",
        requireStrongPassword: true,
        allowTwoFactor: true,

        emailNotifications: true,
        incidentAlerts: true,
        criticalAlerts: true,
        systemNotifications: true,

        autoRefresh: true,
        refreshInterval: "10",
        showIncidentCount: true,
        enableLocationServices: true,
    });

    const updateSetting = (
        key,
        value
    ) => {
        setSettings((current) => ({
            ...current,
            [key]: value,
        }));
    };

    const saveSettings = () => {
        toast.success(
            "System settings saved successfully"
        );
    };

    const resetSettings = () => {
        setSettings({
            systemName: "SurakshaAI",
            organizationName:
                "SurakshaAI Emergency Management System",
            timezone: "Asia/Kolkata",
            language: "English",
            maintenanceMode: false,

            loginProtection: true,
            sessionTimeout: "30",
            requireStrongPassword: true,
            allowTwoFactor: true,

            emailNotifications: true,
            incidentAlerts: true,
            criticalAlerts: true,
            systemNotifications: true,

            autoRefresh: true,
            refreshInterval: "10",
            showIncidentCount: true,
            enableLocationServices: true,
        });

        toast.success("Settings reset");
    };

    return (
        <div className="space-y-5">
            {/* HEADER */}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-cyan-400">
                        SYSTEM ADMINISTRATION
                    </p>

                    <h1 className="mt-1 text-xl font-semibold text-white sm:text-2xl">
                        System Settings
                    </h1>

                    <p className="mt-1 max-w-2xl text-[10px] leading-5 text-slate-500 sm:text-[11px]">
                        Configure security, notifications,
                        system preferences and platform
                        behaviour.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={resetSettings}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-[5px] border border-[#21415c] bg-[#091a2a] px-3 text-[10px] font-medium text-slate-400 transition hover:border-slate-600 hover:text-slate-200"
                    >
                        <RotateCcw size={13} />
                        Reset
                    </button>

                    <button
                        type="button"
                        onClick={saveSettings}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-[5px] border border-cyan-500/30 bg-cyan-500/10 px-3 text-[10px] font-medium text-cyan-400 transition hover:bg-cyan-500/15"
                    >
                        <Save size={13} />
                        Save Changes
                    </button>
                </div>
            </div>

            {/* SETTINGS LAYOUT */}

            <div className="grid gap-4 lg:grid-cols-[210px_minmax(0,1fr)]">
                {/* SIDEBAR */}

                <div className="h-fit rounded-[6px] border border-[#173149] bg-[#091a2a] p-2">
                    <p className="px-3 pb-2 pt-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                        Configuration
                    </p>

                    <div className="space-y-1">
                        {settingSections.map(
                            (section) => {
                                const Icon =
                                    section.icon;

                                const active =
                                    activeSection ===
                                    section.id;

                                return (
                                    <button
                                        key={
                                            section.id
                                        }
                                        type="button"
                                        onClick={() =>
                                            setActiveSection(
                                                section.id
                                            )
                                        }
                                        className={`flex w-full items-center gap-2.5 rounded-[5px] px-3 py-2.5 text-left text-[10px] font-medium transition ${active
                                                ? "bg-cyan-500/10 text-cyan-400"
                                                : "text-slate-500 hover:bg-[#10263a] hover:text-slate-300"
                                            }`}
                                    >
                                        <Icon
                                            size={14}
                                        />

                                        {
                                            section.label
                                        }
                                    </button>
                                );
                            }
                        )}
                    </div>

                    <div className="mt-3 border-t border-[#173149] pt-3">
                        <div className="flex items-center gap-2 px-3 py-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                            <span className="text-[9px] text-slate-600">
                                System Operational
                            </span>
                        </div>
                    </div>
                </div>

                {/* CONTENT */}

                <div className="min-w-0 rounded-[6px] border border-[#173149] bg-[#091a2a]">
                    {/* GENERAL */}

                    {activeSection ===
                        "general" && (
                            <div>
                                <div className="border-b border-[#173149] px-4 py-4">
                                    <div className="flex items-center gap-2">
                                        <Globe2
                                            size={15}
                                            className="text-cyan-400"
                                        />

                                        <div>
                                            <h2 className="text-sm font-semibold text-white">
                                                General Settings
                                            </h2>

                                            <p className="mt-0.5 text-[10px] text-slate-600">
                                                Basic platform
                                                configuration.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-4 p-4 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-1.5 block text-[10px] font-medium text-slate-400">
                                            System Name
                                        </label>

                                        <input
                                            value={
                                                settings.systemName
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                updateSetting(
                                                    "systemName",
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            className="h-9 w-full rounded-[5px] border border-[#21415c] bg-[#071827] px-3 text-[10px] text-slate-200 outline-none focus:border-cyan-500/50"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-[10px] font-medium text-slate-400">
                                            Organization Name
                                        </label>

                                        <input
                                            value={
                                                settings.organizationName
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                updateSetting(
                                                    "organizationName",
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            className="h-9 w-full rounded-[5px] border border-[#21415c] bg-[#071827] px-3 text-[10px] text-slate-200 outline-none focus:border-cyan-500/50"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-[10px] font-medium text-slate-400">
                                            Timezone
                                        </label>

                                        <div className="relative">
                                            <Clock3
                                                size={13}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
                                            />

                                            <select
                                                value={
                                                    settings.timezone
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    updateSetting(
                                                        "timezone",
                                                        event
                                                            .target
                                                            .value
                                                    )
                                                }
                                                className="h-9 w-full appearance-none rounded-[5px] border border-[#21415c] bg-[#071827] pl-9 pr-3 text-[10px] text-slate-300 outline-none focus:border-cyan-500/50"
                                            >
                                                <option value="Asia/Kolkata">
                                                    India /
                                                    Kolkata
                                                </option>

                                                <option value="UTC">
                                                    UTC
                                                </option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-[10px] font-medium text-slate-400">
                                            Language
                                        </label>

                                        <select
                                            value={
                                                settings.language
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                updateSetting(
                                                    "language",
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            className="h-9 w-full rounded-[5px] border border-[#21415c] bg-[#071827] px-3 text-[10px] text-slate-300 outline-none focus:border-cyan-500/50"
                                        >
                                            <option value="English">
                                                English
                                            </option>

                                            <option value="Hindi">
                                                Hindi
                                            </option>
                                        </select>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <SettingToggle
                                            checked={
                                                settings.maintenanceMode
                                            }
                                            onChange={(
                                                value
                                            ) =>
                                                updateSetting(
                                                    "maintenanceMode",
                                                    value
                                                )
                                            }
                                            label="Maintenance Mode"
                                            description="Temporarily restrict normal platform access while maintenance is being performed."
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                    {/* SECURITY */}

                    {activeSection ===
                        "security" && (
                            <div>
                                <div className="border-b border-[#173149] px-4 py-4">
                                    <div className="flex items-center gap-2">
                                        <LockKeyhole
                                            size={15}
                                            className="text-cyan-400"
                                        />

                                        <div>
                                            <h2 className="text-sm font-semibold text-white">
                                                Security Settings
                                            </h2>

                                            <p className="mt-0.5 text-[10px] text-slate-600">
                                                Configure account
                                                protection and
                                                authentication.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 p-4">
                                    <SettingToggle
                                        checked={
                                            settings.loginProtection
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            updateSetting(
                                                "loginProtection",
                                                value
                                            )
                                        }
                                        label="Login Protection"
                                        description="Protect user accounts with additional login security controls."
                                    />

                                    <SettingToggle
                                        checked={
                                            settings.requireStrongPassword
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            updateSetting(
                                                "requireStrongPassword",
                                                value
                                            )
                                        }
                                        label="Strong Password Policy"
                                        description="Require stronger passwords for platform accounts."
                                    />

                                    <SettingToggle
                                        checked={
                                            settings.allowTwoFactor
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            updateSetting(
                                                "allowTwoFactor",
                                                value
                                            )
                                        }
                                        label="Allow Two-Factor Authentication"
                                        description="Allow administrators and users to use 2FA for account protection."
                                    />

                                    <div className="rounded-[5px] border border-[#173149] bg-[#071827] p-4">
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck
                                                size={14}
                                                className="text-cyan-400"
                                            />

                                            <p className="text-[11px] font-medium text-slate-300">
                                                Session Timeout
                                            </p>
                                        </div>

                                        <div className="mt-3 flex items-center gap-2">
                                            <input
                                                type="number"
                                                min="5"
                                                max="240"
                                                value={
                                                    settings.sessionTimeout
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    updateSetting(
                                                        "sessionTimeout",
                                                        event
                                                            .target
                                                            .value
                                                    )
                                                }
                                                className="h-9 w-24 rounded-[5px] border border-[#21415c] bg-[#091a2a] px-3 text-[10px] text-slate-300 outline-none focus:border-cyan-500/50"
                                            />

                                            <span className="text-[10px] text-slate-600">
                                                minutes
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 rounded-[5px] border border-amber-500/20 bg-amber-500/5 p-3">
                                        <AlertTriangle
                                            size={14}
                                            className="mt-0.5 shrink-0 text-amber-400"
                                        />

                                        <p className="text-[9px] leading-4 text-amber-400/80">
                                            Security settings
                                            affect all
                                            platform users.
                                            Review changes
                                            carefully before
                                            saving.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                    {/* NOTIFICATIONS */}

                    {activeSection ===
                        "notifications" && (
                            <div>
                                <div className="border-b border-[#173149] px-4 py-4">
                                    <div className="flex items-center gap-2">
                                        <Bell
                                            size={15}
                                            className="text-cyan-400"
                                        />

                                        <div>
                                            <h2 className="text-sm font-semibold text-white">
                                                Notification Settings
                                            </h2>

                                            <p className="mt-0.5 text-[10px] text-slate-600">
                                                Control system and
                                                incident
                                                notifications.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 p-4">
                                    <SettingToggle
                                        checked={
                                            settings.emailNotifications
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            updateSetting(
                                                "emailNotifications",
                                                value
                                            )
                                        }
                                        label="Email Notifications"
                                        description="Send important platform notifications through email."
                                    />

                                    <SettingToggle
                                        checked={
                                            settings.incidentAlerts
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            updateSetting(
                                                "incidentAlerts",
                                                value
                                            )
                                        }
                                        label="Incident Alerts"
                                        description="Notify authorized users when new incidents are reported."
                                    />

                                    <SettingToggle
                                        checked={
                                            settings.criticalAlerts
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            updateSetting(
                                                "criticalAlerts",
                                                value
                                            )
                                        }
                                        label="Critical Alerts"
                                        description="Send immediate notifications for critical severity incidents."
                                    />

                                    <SettingToggle
                                        checked={
                                            settings.systemNotifications
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            updateSetting(
                                                "systemNotifications",
                                                value
                                            )
                                        }
                                        label="System Notifications"
                                        description="Receive important system status and maintenance notifications."
                                    />

                                    <div className="mt-3 flex items-center gap-2 rounded-[5px] border border-emerald-500/15 bg-emerald-500/5 px-3 py-2.5">
                                        <CheckCircle2
                                            size={14}
                                            className="text-emerald-400"
                                        />

                                        <p className="text-[9px] text-emerald-400/80">
                                            Notification service is
                                            currently enabled.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                    {/* PREFERENCES */}

                    {activeSection ===
                        "preferences" && (
                            <div>
                                <div className="border-b border-[#173149] px-4 py-4">
                                    <div className="flex items-center gap-2">
                                        <SlidersHorizontal
                                            size={15}
                                            className="text-cyan-400"
                                        />

                                        <div>
                                            <h2 className="text-sm font-semibold text-white">
                                                System Preferences
                                            </h2>

                                            <p className="mt-0.5 text-[10px] text-slate-600">
                                                Configure dashboard
                                                behaviour and
                                                system services.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 p-4">
                                    <SettingToggle
                                        checked={
                                            settings.autoRefresh
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            updateSetting(
                                                "autoRefresh",
                                                value
                                            )
                                        }
                                        label="Auto Refresh"
                                        description="Automatically refresh dashboard data in the background."
                                    />

                                    <div className="rounded-[5px] border border-[#173149] bg-[#071827] p-4">
                                        <div className="flex items-center gap-2">
                                            <Database
                                                size={14}
                                                className="text-cyan-400"
                                            />

                                            <div>
                                                <p className="text-[11px] font-medium text-slate-300">
                                                    Refresh Interval
                                                </p>

                                                <p className="mt-0.5 text-[9px] text-slate-600">
                                                    How frequently
                                                    dashboard data
                                                    should refresh.
                                                </p>
                                            </div>
                                        </div>

                                        <select
                                            value={
                                                settings.refreshInterval
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                updateSetting(
                                                    "refreshInterval",
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            className="mt-3 h-9 w-full max-w-[180px] rounded-[5px] border border-[#21415c] bg-[#091a2a] px-3 text-[10px] text-slate-300 outline-none focus:border-cyan-500/50"
                                        >
                                            <option value="5">
                                                Every 5 minutes
                                            </option>

                                            <option value="10">
                                                Every 10 minutes
                                            </option>

                                            <option value="15">
                                                Every 15 minutes
                                            </option>

                                            <option value="30">
                                                Every 30 minutes
                                            </option>
                                        </select>
                                    </div>

                                    <SettingToggle
                                        checked={
                                            settings.showIncidentCount
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            updateSetting(
                                                "showIncidentCount",
                                                value
                                            )
                                        }
                                        label="Show Incident Count"
                                        description="Display live incident count badges in navigation."
                                    />

                                    <SettingToggle
                                        checked={
                                            settings.enableLocationServices
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            updateSetting(
                                                "enableLocationServices",
                                                value
                                            )
                                        }
                                        label="Location Services"
                                        description="Allow location-based services such as weather and nearby safety information."
                                    />
                                </div>
                            </div>
                        )}

                    {/* FOOTER */}

                    <div className="border-t border-[#173149] bg-[#071827] px-4 py-3">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-[9px] text-slate-600">
                                Changes are currently stored
                                for this session.
                            </p>

                            <button
                                type="button"
                                onClick={saveSettings}
                                className="inline-flex h-8 items-center justify-center gap-2 rounded-[4px] bg-cyan-500 px-3 text-[10px] font-medium text-slate-950 transition hover:bg-cyan-400"
                            >
                                <Save size={12} />
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SystemSettings;