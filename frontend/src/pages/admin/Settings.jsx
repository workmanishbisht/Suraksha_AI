
import { useState } from "react";
import {
    Settings as SettingsIcon,
    UserRound,
    ShieldCheck,
    Bell,
    Palette,
    Info,
    Save,
    RotateCcw,
    Globe,
    Building2,
    Mail,
    LockKeyhole,
    Eye,
    EyeOff,
    Monitor,
    Moon,
    Sun,
    Check,
    Clock3,
    Database,
    Server,
    ChevronRight,
    AlertCircle,
} from "lucide-react";

const settingsSections = [
    { id: "general", label: "General Settings", icon: SettingsIcon },
    { id: "profile", label: "Profile & Account", icon: UserRound },
    { id: "security", label: "Security", icon: ShieldCheck },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "system", label: "System Information", icon: Info },
];

const initialSettings = {
    systemName: "SurakshaAI",
    organization: "Disaster Management Authority",
    supportEmail: "support@surakshaai.com",
    timezone: "Asia/Kolkata",
    language: "English",
    adminName: "Admin",
    adminEmail: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    emailNotifications: true,
    incidentAlerts: true,
    criticalAlerts: true,
    officerUpdates: true,
    weeklyReports: false,
    theme: "dark",
    compactSidebar: false,
};

function Settings() {
    const [activeSection, setActiveSection] = useState("general");
    const [settings, setSettings] = useState(initialSettings);
    const [savedSettings, setSavedSettings] = useState(initialSettings);
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const hasChanges =
        JSON.stringify(settings) !== JSON.stringify(savedSettings);

    const updateSetting = (key, value) => {
        setSettings((previous) => ({ ...previous, [key]: value }));
        setMessage("");
        setError("");
    };

    const handleSave = (event) => {
        event.preventDefault();

        if (activeSection === "security") {
            if (
                settings.newPassword &&
                settings.newPassword !== settings.confirmPassword
            ) {
                setError("New password and confirmation do not match.");
                setMessage("");
                return;
            }

            if (
                settings.newPassword &&
                settings.newPassword.length < 8
            ) {
                setError("Password must contain at least 8 characters.");
                setMessage("");
                return;
            }
        }

        // Frontend-only demo: no API or database is connected yet.
        setSavedSettings(settings);
        setMessage("Changes confirmed in this session. Backend saving is not connected yet.");
        setError("");
    };

    const handleReset = () => {
        setSettings(savedSettings);
        setMessage("");
        setError("");
    };

    const activeItem = settingsSections.find(
        (item) => item.id === activeSection
    );

    return (
        <div className="min-h-full space-y-6 pb-8 text-slate-200">
            {/* PAGE HEADER */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <div className="mb-2 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-400">
                            System Configuration
                        </span>
                    </div>

                    <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-[28px]">
                        System Settings
                    </h1>

                    <p className="mt-1.5 max-w-xl text-xs leading-5 text-slate-500 sm:text-sm">
                        Manage your platform preferences, account security,
                        notifications and system configuration.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleReset}
                        disabled={!hasChanges}
                        className="flex h-10 items-center gap-2 rounded-md border border-[#254158] bg-[#0a1b2b] px-3 text-xs font-medium text-slate-300 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <RotateCcw size={14} />
                        Reset
                    </button>

                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={!hasChanges}
                        className="flex h-10 items-center gap-2 rounded-md border border-cyan-400/30 bg-cyan-400/10 px-4 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <Save size={14} />
                        Save Changes
                    </button>
                </div>
            </div>

            {/* DEMO STATUS */}
            <div className="flex items-start gap-3 rounded-md border border-amber-400/20 bg-amber-400/[0.05] p-3.5">
                <AlertCircle
                    size={17}
                    className="mt-0.5 shrink-0 text-amber-400"
                />
                <div>
                    <p className="text-xs font-semibold text-amber-300">
                        Frontend preview
                    </p>
                    <p className="mt-1 text-[11px] leading-5 text-slate-400">
                        Settings are not connected to the backend yet.
                        Save Changes currently validates the form and updates
                        the page's local state only.
                    </p>
                </div>
            </div>

            {/* SETTINGS LAYOUT */}
            <div className="grid items-start gap-5 xl:grid-cols-[245px_minmax(0,1fr)]">
                {/* SETTINGS NAVIGATION */}
                <aside className="rounded-lg border border-[#173149] bg-[#091a2a] p-3">
                    <p className="px-3 pb-3 pt-2 text-[9px] font-semibold uppercase tracking-[0.17em] text-slate-600">
                        Preferences
                    </p>

                    <nav className="space-y-1">
                        {settingsSections.map((section) => {
                            const Icon = section.icon;
                            const active = activeSection === section.id;

                            return (
                                <button
                                    key={section.id}
                                    type="button"
                                    onClick={() => {
                                        setActiveSection(section.id);
                                        setMessage("");
                                        setError("");
                                    }}
                                    className={`group flex min-h-[43px] w-full items-center gap-3 rounded-md px-3 text-left text-xs font-medium transition ${
                                        active
                                            ? "bg-cyan-400/[0.09] text-white"
                                            : "text-slate-400 hover:bg-white/[0.035] hover:text-slate-200"
                                    }`}
                                >
                                    <Icon
                                        size={17}
                                        strokeWidth={1.8}
                                        className={
                                            active
                                                ? "text-cyan-400"
                                                : "text-slate-500 group-hover:text-slate-300"
                                        }
                                    />

                                    <span className="flex-1">
                                        {section.label}
                                    </span>

                                    {active && (
                                        <ChevronRight
                                            size={14}
                                            className="text-cyan-400"
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </nav>

                    <div className="mt-5 border-t border-[#173149] pt-4">
                        <div className="flex items-center gap-2.5 rounded-md border border-[#173149] bg-[#0b2031] p-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-400/10">
                                <ShieldCheck
                                    size={16}
                                    className="text-emerald-400"
                                />
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold text-slate-200">
                                    Admin Console
                                </p>
                                <p className="mt-1 text-[9px] text-slate-500">
                                    Configuration workspace
                                </p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* ACTIVE SETTINGS PANEL */}
                <form
                    onSubmit={handleSave}
                    className="min-w-0 overflow-hidden rounded-lg border border-[#173149] bg-[#091a2a]"
                >
                    <div className="flex items-center gap-3 border-b border-[#173149] px-5 py-5 sm:px-6">
                        <div className="flex h-10 w-10 items-center justify-center rounded-md border border-cyan-400/15 bg-cyan-400/[0.07]">
                            {activeItem && (
                                <activeItem.icon
                                    size={19}
                                    className="text-cyan-400"
                                />
                            )}
                        </div>

                        <div>
                            <h2 className="text-sm font-semibold text-white">
                                {activeItem?.label}
                            </h2>
                            <p className="mt-1 text-[10px] text-slate-500">
                                Configure your {activeItem?.label.toLowerCase()}.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6 p-5 sm:p-6">
                        {activeSection === "general" && (
                            <>
                                <SectionHeading
                                    title="General Configuration"
                                    description="Set your platform identity and regional preferences."
                                />

                                <div className="grid gap-5 md:grid-cols-2">
                                    <Field
                                        label="System Name"
                                        icon={SettingsIcon}
                                    >
                                        <input
                                            value={settings.systemName}
                                            onChange={(e) =>
                                                updateSetting(
                                                    "systemName",
                                                    e.target.value
                                                )
                                            }
                                            className={inputClass}
                                            placeholder="Enter system name"
                                        />
                                    </Field>

                                    <Field
                                        label="Organization Name"
                                        icon={Building2}
                                    >
                                        <input
                                            value={settings.organization}
                                            onChange={(e) =>
                                                updateSetting(
                                                    "organization",
                                                    e.target.value
                                                )
                                            }
                                            className={inputClass}
                                            placeholder="Enter organization"
                                        />
                                    </Field>

                                    <Field
                                        label="Support Email"
                                        icon={Mail}
                                    >
                                        <input
                                            type="email"
                                            value={settings.supportEmail}
                                            onChange={(e) =>
                                                updateSetting(
                                                    "supportEmail",
                                                    e.target.value
                                                )
                                            }
                                            className={inputClass}
                                            placeholder="support@example.com"
                                        />
                                    </Field>

                                    <Field label="Timezone" icon={Globe}>
                                        <select
                                            value={settings.timezone}
                                            onChange={(e) =>
                                                updateSetting(
                                                    "timezone",
                                                    e.target.value
                                                )
                                            }
                                            className={inputClass}
                                        >
                                            <option value="Asia/Kolkata">
                                                India Standard Time (IST)
                                            </option>
                                            <option value="UTC">
                                                Coordinated Universal Time (UTC)
                                            </option>
                                            <option value="Asia/Dubai">
                                                Gulf Standard Time (GST)
                                            </option>
                                            <option value="Europe/London">
                                                United Kingdom
                                            </option>
                                        </select>
                                    </Field>

                                    <Field label="Language" icon={Globe}>
                                        <select
                                            value={settings.language}
                                            onChange={(e) =>
                                                updateSetting(
                                                    "language",
                                                    e.target.value
                                                )
                                            }
                                            className={inputClass}
                                        >
                                            <option value="English">
                                                English
                                            </option>
                                            <option value="Hindi">
                                                Hindi
                                            </option>
                                        </select>
                                    </Field>
                                </div>
                            </>
                        )}

                        {activeSection === "profile" && (
                            <>
                                <SectionHeading
                                    title="Profile & Account"
                                    description="Manage the administrator's display information."
                                />

                                <div className="flex items-center gap-4 rounded-md border border-[#173149] bg-[#0b2031] p-4">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/10 text-lg font-semibold text-cyan-300">
                                        {settings.adminName
                                            .trim()
                                            .charAt(0)
                                            .toUpperCase() || "A"}
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold text-white">
                                            {settings.adminName || "Admin"}
                                        </p>
                                        <p className="mt-1 text-[10px] text-slate-500">
                                            Administrator account
                                        </p>
                                    </div>
                                </div>

                                <div className="grid gap-5 md:grid-cols-2">
                                    <Field label="Display Name" icon={UserRound}>
                                        <input
                                            value={settings.adminName}
                                            onChange={(e) =>
                                                updateSetting(
                                                    "adminName",
                                                    e.target.value
                                                )
                                            }
                                            className={inputClass}
                                            placeholder="Enter display name"
                                        />
                                    </Field>

                                    <Field label="Email Address" icon={Mail}>
                                        <input
                                            type="email"
                                            value={settings.adminEmail}
                                            onChange={(e) =>
                                                updateSetting(
                                                    "adminEmail",
                                                    e.target.value
                                                )
                                            }
                                            className={inputClass}
                                            placeholder="Enter admin email"
                                        />
                                    </Field>
                                </div>

                                <p className="text-[10px] leading-5 text-slate-500">
                                    These are preview fields. The authenticated
                                    account will be connected when the profile
                                    API is implemented.
                                </p>
                            </>
                        )}

                        {activeSection === "security" && (
                            <>
                                <SectionHeading
                                    title="Security & Password"
                                    description="Password fields are for the upcoming security API."
                                />

                                <div className="flex items-start gap-3 rounded-md border border-emerald-400/15 bg-emerald-400/[0.04] p-3.5">
                                    <ShieldCheck
                                        size={17}
                                        className="mt-0.5 text-emerald-400"
                                    />
                                    <div>
                                        <p className="text-xs font-medium text-emerald-300">
                                            Security settings
                                        </p>
                                        <p className="mt-1 text-[10px] leading-5 text-slate-500">
                                            Password changes will require
                                            authenticated backend verification.
                                            No password is changed in this preview.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    <Field
                                        label="Current Password"
                                        icon={LockKeyhole}
                                    >
                                        <PasswordInput
                                            value={settings.currentPassword}
                                            showPassword={showPassword}
                                            onToggle={() =>
                                                setShowPassword((prev) => !prev)
                                            }
                                            onChange={(value) =>
                                                updateSetting(
                                                    "currentPassword",
                                                    value
                                                )
                                            }
                                        />
                                    </Field>

                                    <div className="grid gap-5 md:grid-cols-2">
                                        <Field
                                            label="New Password"
                                            icon={LockKeyhole}
                                        >
                                            <PasswordInput
                                                value={settings.newPassword}
                                                showPassword={showPassword}
                                                onToggle={() =>
                                                    setShowPassword((prev) => !prev)
                                                }
                                                onChange={(value) =>
                                                    updateSetting(
                                                        "newPassword",
                                                        value
                                                    )
                                                }
                                            />
                                        </Field>

                                        <Field
                                            label="Confirm New Password"
                                            icon={LockKeyhole}
                                        >
                                            <PasswordInput
                                                value={settings.confirmPassword}
                                                showPassword={showPassword}
                                                onToggle={() =>
                                                    setShowPassword((prev) => !prev)
                                                }
                                                onChange={(value) =>
                                                    updateSetting(
                                                        "confirmPassword",
                                                        value
                                                    )
                                                }
                                            />
                                        </Field>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeSection === "notifications" && (
                            <>
                                <SectionHeading
                                    title="Notification Preferences"
                                    description="Choose which notifications you want the interface to display."
                                />

                                <div className="space-y-3">
                                    <ToggleRow
                                        icon={Mail}
                                        title="Email Notifications"
                                        description="Receive system updates through email."
                                        checked={settings.emailNotifications}
                                        onChange={(value) =>
                                            updateSetting(
                                                "emailNotifications",
                                                value
                                            )
                                        }
                                    />

                                    <ToggleRow
                                        icon={Bell}
                                        title="Incident Alerts"
                                        description="Receive notifications when new incidents are reported."
                                        checked={settings.incidentAlerts}
                                        onChange={(value) =>
                                            updateSetting(
                                                "incidentAlerts",
                                                value
                                            )
                                        }
                                    />

                                    <ToggleRow
                                        icon={ShieldCheck}
                                        title="Critical Incident Alerts"
                                        description="Highlight critical and high-severity incidents."
                                        checked={settings.criticalAlerts}
                                        onChange={(value) =>
                                            updateSetting(
                                                "criticalAlerts",
                                                value
                                            )
                                        }
                                    />

                                    <ToggleRow
                                        icon={UserRound}
                                        title="Field Officer Updates"
                                        description="Receive updates about field officer operations."
                                        checked={settings.officerUpdates}
                                        onChange={(value) =>
                                            updateSetting(
                                                "officerUpdates",
                                                value
                                            )
                                        }
                                    />

                                    <ToggleRow
                                        icon={FileReportIcon}
                                        title="Weekly Reports"
                                        description="Enable a weekly report preference."
                                        checked={settings.weeklyReports}
                                        onChange={(value) =>
                                            updateSetting(
                                                "weeklyReports",
                                                value
                                            )
                                        }
                                    />
                                </div>
                            </>
                        )}

                        {activeSection === "appearance" && (
                            <>
                                <SectionHeading
                                    title="Appearance"
                                    description="Preview your preferred dashboard appearance."
                                />

                                <div>
                                    <p className="mb-3 text-xs font-medium text-slate-300">
                                        Interface Theme
                                    </p>

                                    <div className="grid gap-3 sm:grid-cols-3">
                                        {[
                                            {
                                                id: "dark",
                                                label: "Dark",
                                                icon: Moon,
                                            },
                                            {
                                                id: "light",
                                                label: "Light",
                                                icon: Sun,
                                            },
                                            {
                                                id: "system",
                                                label: "System",
                                                icon: Monitor,
                                            },
                                        ].map((theme) => {
                                            const Icon = theme.icon;
                                            const selected =
                                                settings.theme === theme.id;

                                            return (
                                                <button
                                                    key={theme.id}
                                                    type="button"
                                                    onClick={() =>
                                                        updateSetting(
                                                            "theme",
                                                            theme.id
                                                        )
                                                    }
                                                    className={`flex items-center gap-3 rounded-md border p-4 text-left transition ${
                                                        selected
                                                            ? "border-cyan-400/40 bg-cyan-400/[0.07]"
                                                            : "border-[#214057] bg-[#0b2031] hover:border-slate-500"
                                                    }`}
                                                >
                                                    <Icon
                                                        size={18}
                                                        className={
                                                            selected
                                                                ? "text-cyan-400"
                                                                : "text-slate-400"
                                                        }
                                                    />

                                                    <span className="flex-1 text-xs font-medium text-slate-200">
                                                        {theme.label}
                                                    </span>

                                                    {selected && (
                                                        <Check
                                                            size={14}
                                                            className="text-cyan-400"
                                                        />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="border-t border-[#173149] pt-5">
                                    <ToggleRow
                                        icon={SettingsIcon}
                                        title="Compact Sidebar"
                                        description="Save a preference for a more compact navigation layout."
                                        checked={settings.compactSidebar}
                                        onChange={(value) =>
                                            updateSetting(
                                                "compactSidebar",
                                                value
                                            )
                                        }
                                    />
                                </div>

                                <p className="text-[10px] leading-5 text-slate-500">
                                    Theme and sidebar preferences are currently
                                    form state only; the application-wide theme
                                    has not been connected.
                                </p>
                            </>
                        )}

                        {activeSection === "system" && (
                            <>
                                <SectionHeading
                                    title="System Information"
                                    description="Application details and current connection information."
                                />

                                <div className="space-y-3">
                                    <InfoRow
                                        icon={Building2}
                                        label="Application"
                                        value="SurakshaAI"
                                    />

                                    <InfoRow
                                        icon={Monitor}
                                        label="Environment"
                                        value="Development Preview"
                                    />

                                    <InfoRow
                                        icon={Server}
                                        label="Backend API"
                                        value="http://localhost:5000/api"
                                    />

                                    <InfoRow
                                        icon={Database}
                                        label="Database"
                                        value="MongoDB — status not verified here"
                                    />

                                    <InfoRow
                                        icon={Clock3}
                                        label="Local Time"
                                        value={new Date().toLocaleString()}
                                    />

                                    <InfoRow
                                        icon={ShieldCheck}
                                        label="Authentication"
                                        value="Managed by existing AuthContext"
                                    />
                                </div>

                                <div className="rounded-md border border-[#173149] bg-[#0b2031] p-4">
                                    <p className="text-xs font-medium text-slate-200">
                                        System health checks
                                    </p>
                                    <p className="mt-1 text-[10px] leading-5 text-slate-500">
                                        Live backend and database health checks
                                        will be added after the health endpoint
                                        is implemented.
                                    </p>
                                </div>
                            </>
                        )}

                        {error && (
                            <div
                                role="alert"
                                className="rounded-md border border-red-400/20 bg-red-400/[0.06] p-3 text-xs text-red-300"
                            >
                                {error}
                            </div>
                        )}

                        {message && (
                            <div
                                role="status"
                                className="flex items-start gap-2 rounded-md border border-amber-400/20 bg-amber-400/[0.05] p-3 text-[11px] leading-5 text-amber-300"
                            >
                                <AlertCircle
                                    size={15}
                                    className="mt-0.5 shrink-0"
                                />
                                {message}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col-reverse justify-between gap-3 border-t border-[#173149] bg-[#081827] px-5 py-4 sm:flex-row sm:items-center sm:px-6">
                        <p className="text-[10px] text-slate-600">
                            <span className="text-cyan-400">*</span> Backend
                            integration is pending.
                        </p>

                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={handleReset}
                                disabled={!hasChanges}
                                className="rounded-md border border-[#254158] px-3 py-2 text-[11px] font-medium text-slate-300 transition hover:bg-white/[0.03] disabled:opacity-40"
                            >
                                Discard
                            </button>

                            <button
                                type="submit"
                                disabled={!hasChanges}
                                className="flex items-center gap-2 rounded-md bg-cyan-400 px-4 py-2 text-[11px] font-semibold text-[#061522] transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <Save size={13} />
                                Save Changes
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

const inputClass =
    "h-10 w-full rounded-md border border-[#254158] bg-[#071827] px-3 text-xs text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/[0.07]";

function SectionHeading({ title, description }) {
    return (
        <div>
            <h3 className="text-xs font-semibold text-slate-200">{title}</h3>
            <p className="mt-1.5 text-[10px] leading-5 text-slate-500">
                {description}
            </p>
        </div>
    );
}

function Field({ label, icon: Icon, children }) {
    return (
        <label className="block min-w-0">
            <span className="mb-2 flex items-center gap-2 text-[11px] font-medium text-slate-300">
                {Icon && <Icon size={13} className="text-slate-500" />}
                {label}
            </span>
            {children}
        </label>
    );
}

function PasswordInput({ value, onChange, showPassword, onToggle }) {
    return (
        <div className="relative">
            <input
                type={showPassword ? "text" : "password"}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`${inputClass} pr-10`}
                placeholder="Enter password"
                autoComplete="off"
            />
            <button
                type="button"
                onClick={onToggle}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-200"
            >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
        </div>
    );
}

function ToggleRow({
    icon: Icon,
    title,
    description,
    checked,
    onChange,
}) {
    return (
        <div className="flex items-center gap-3 rounded-md border border-[#173149] bg-[#0b2031] p-3.5 sm:p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#102a3e]">
                <Icon size={16} className="text-slate-400" />
            </div>

            <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-200">
                    {title}
                </p>
                <p className="mt-1 text-[10px] leading-4 text-slate-500">
                    {description}
                </p>
            </div>

            <button
                type="button"
                role="switch"
                aria-checked={checked}
                aria-label={title}
                onClick={() => onChange(!checked)}
                className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
                    checked ? "bg-cyan-400" : "bg-slate-700"
                }`}
            >
                <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                        checked ? "translate-x-[18px]" : "translate-x-0.5"
                    }`}
                />
            </button>
        </div>
    );
}

function InfoRow({ icon: Icon, label, value }) {
    return (
        <div className="flex items-center gap-3 rounded-md border border-[#173149] bg-[#0b2031] p-3.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#102a3e]">
                <Icon size={16} className="text-cyan-400" />
            </div>

            <div className="min-w-0 flex-1">
                <p className="text-[10px] text-slate-500">{label}</p>
                <p className="mt-1 break-words text-xs font-medium text-slate-200">
                    {value}
                </p>
            </div>
        </div>
    );
}

function FileReportIcon(props) {
    return <Info {...props} />;
}

export default Settings;
