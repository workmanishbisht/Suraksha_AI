import { useCallback, useEffect, useState } from "react";
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
    Clock3,
    Database,
    Server,
    ChevronRight,
    AlertCircle,
    FileText,
    LoaderCircle,
    CheckCircle2,
} from "lucide-react";

const API_URL = "http://localhost:5000/api/system-settings";
const PROFILE_API_URL = "http://localhost:5000/api/profile";

const sections = [
    { id: "general", label: "General Settings", icon: SettingsIcon },
    { id: "profile", label: "Profile & Account", icon: UserRound },
    { id: "security", label: "Security", icon: ShieldCheck },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "system", label: "System Information", icon: Info },
];

const defaults = {
    systemName: "SurakshaAI",
    organization: "Disaster Management Authority",
    supportEmail: "support@surakshaai.com",
    timezone: "Asia/Kolkata",
    language: "English",

    adminName: "Suraksha AI",
    adminEmail: "",
    profileImage: null,

    currentPassword: "",
    newPassword: "",
    confirmPassword: "",

    emailNotifications: true,
    incidentAlerts: true,
    criticalAlerts: true,
    officerUpdates: true,
    weeklyReports: false,

    compactSidebar: false,
};

const inputClass =
    "w-full rounded-md border border-[#254158] bg-[#071827] px-3 py-2 text-xs text-slate-200 outline-none placeholder:text-slate-600 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-60";

async function parseResponse(response, fallback) {
    const result = await response.json().catch(() => ({}));

    if (!response.ok || result.success === false) {
        throw new Error(result.message || fallback);
    }

    return result;
}

function mapSettings(data = {}, user = {}) {
    return {
        systemName: data.general?.systemName ?? defaults.systemName,
        organization:
            data.general?.organization ?? defaults.organization,
        supportEmail:
            data.general?.supportEmail ?? defaults.supportEmail,
        timezone: data.general?.timezone ?? defaults.timezone,
        language: data.general?.language ?? defaults.language,

        // Keep the same display name in this settings card.
        adminName: "Suraksha AI",
        adminEmail: user.email ?? "",
        profileImage: user.profileImage ?? null,

        currentPassword: "",
        newPassword: "",
        confirmPassword: "",

        emailNotifications:
            data.notifications?.emailNotifications ??
            defaults.emailNotifications,
        incidentAlerts:
            data.notifications?.incidentAlerts ?? defaults.incidentAlerts,
        criticalAlerts:
            data.notifications?.criticalAlerts ?? defaults.criticalAlerts,
        officerUpdates:
            data.notifications?.officerUpdates ?? defaults.officerUpdates,
        weeklyReports:
            data.notifications?.weeklyReports ?? defaults.weeklyReports,

        compactSidebar:
            data.preferences?.compactSidebar ?? defaults.compactSidebar,
    };
}

export default function SystemSettings() {
    const [activeSection, setActiveSection] = useState("general");
    const [settings, setSettings] = useState({ ...defaults });
    const [savedSettings, setSavedSettings] = useState({ ...defaults });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [apiStatus, setApiStatus] = useState("Checking");

    const dirty =
        JSON.stringify(settings) !== JSON.stringify(savedSettings);

    const active = sections.find((item) => item.id === activeSection);
    const ActiveIcon = active?.icon ?? SettingsIcon;

    const loadSettings = useCallback(async () => {
        setLoading(true);
        setError("");
        setMessage("");

        try {
            const [settingsResponse, profileResponse] = await Promise.all([
                fetch(API_URL, {
                    method: "GET",
                    credentials: "include",
                    headers: { Accept: "application/json" },
                }),
                fetch(PROFILE_API_URL, {
                    method: "GET",
                    credentials: "include",
                    headers: { Accept: "application/json" },
                }),
            ]);

            const [settingsResult, profileResult] = await Promise.all([
                parseResponse(settingsResponse, "Could not load system settings."),
                parseResponse(profileResponse, "Could not load your profile."),
            ]);

            const next = mapSettings(
                settingsResult.settings ?? {},
                profileResult.user ?? {}
            );

            setSettings(next);
            setSavedSettings(next);
            setApiStatus("Connected");
        } catch (err) {
            setApiStatus("Unavailable");
            setError(err.message || "Could not connect to the backend.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSettings();
    }, [loadSettings]);

    const update = (key, value) => {
        setSettings((previous) => ({ ...previous, [key]: value }));
        setError("");
        setMessage("");
    };

    const saveProfile = async () => {
        const name = settings.adminName.trim();

        if (!name) {
            throw new Error("Display name cannot be empty.");
        }

        const response = await fetch(PROFILE_API_URL, {
            method: "PUT",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({ name }),
        });

        const result = await parseResponse(response, "Could not update profile.");

        const user = result.user ?? {};

        // The requested display label stays "Suraksha AI".
        const next = {
            ...settings,
            adminName: "Suraksha AI",
            adminEmail: user.email ?? settings.adminEmail,
            profileImage: user.profileImage ?? settings.profileImage,
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        };

        setSettings(next);
        setSavedSettings(next);

        window.dispatchEvent(
            new CustomEvent("surakshaai:profile-updated", {
                detail: { user },
            })
        );

        setMessage(result.message || "Profile updated successfully.");
    };

    const savePassword = async () => {
        const {
            currentPassword,
            newPassword,
            confirmPassword,
        } = settings;

        if (!currentPassword || !newPassword || !confirmPassword) {
            throw new Error("Complete all password fields.");
        }

        if (newPassword.length < 6) {
            throw new Error("New password must contain at least 6 characters.");
        }

        if (newPassword !== confirmPassword) {
            throw new Error("New password and confirmation do not match.");
        }

        const response = await fetch(
            `${PROFILE_API_URL}/change-password`,
            {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                    confirmPassword,
                }),
            }
        );

        const result = await parseResponse(
            response,
            "Could not change password."
        );

        const next = {
            ...settings,
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        };

        setSettings(next);
        setSavedSettings(next);
        setShowPassword(false);
        setMessage(result.message || "Password changed successfully.");
    };

    const saveSystemSettings = async () => {
        let payload = {};

        if (activeSection === "general") {
            if (
                !settings.systemName.trim() ||
                !settings.organization.trim() ||
                !settings.supportEmail.trim()
            ) {
                throw new Error("Complete all required general settings.");
            }

            payload.general = {
                systemName: settings.systemName.trim(),
                organization: settings.organization.trim(),
                supportEmail: settings.supportEmail.trim(),
                timezone: settings.timezone,
                language: settings.language,
            };
        } else if (activeSection === "notifications") {
            payload.notifications = {
                emailNotifications: settings.emailNotifications,
                incidentAlerts: settings.incidentAlerts,
                criticalAlerts: settings.criticalAlerts,
                officerUpdates: settings.officerUpdates,
                weeklyReports: settings.weeklyReports,
            };
        } else if (activeSection === "appearance") {
            payload.preferences = {
                compactSidebar: settings.compactSidebar,
            };
        } else {
            throw new Error("There are no editable settings in this section.");
        }

        const response = await fetch(API_URL, {
            method: "PATCH",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(payload),
        });

        const result = await parseResponse(
            response,
            "Could not save system settings."
        );

        // Preserve the currently loaded profile details.
        const next = mapSettings(result.settings ?? {}, {
            email: settings.adminEmail,
            profileImage: settings.profileImage,
        });

        setSettings(next);
        setSavedSettings(next);
        setApiStatus("Connected");
        setMessage(result.message || "Settings saved successfully.");
    };

    const handleSave = async (event) => {
        event?.preventDefault();

        if (loading || saving) return;

        setSaving(true);
        setError("");
        setMessage("");

        try {
            if (activeSection === "profile") {
                await saveProfile();
            } else if (activeSection === "security") {
                await savePassword();
            } else {
                await saveSystemSettings();
            }
        } catch (err) {
            setError(err.message || "Unable to save changes.");
        } finally {
            setSaving(false);
        }
    };

    const handleReset = async () => {
        if (loading || saving) return;

        const confirmed = window.confirm(
            "Reset system settings to their default values?"
        );

        if (!confirmed) return;

        setSaving(true);
        setError("");
        setMessage("");

        try {
            const response = await fetch(`${API_URL}/reset`, {
                method: "POST",
                credentials: "include",
                headers: { Accept: "application/json" },
            });

            const result = await parseResponse(
                response,
                "Could not reset system settings."
            );

            // Fetch the profile separately; reset must not reset the user account.
            const profileResponse = await fetch(PROFILE_API_URL, {
                method: "GET",
                credentials: "include",
                headers: { Accept: "application/json" },
            });

            const profileResult = await parseResponse(
                profileResponse,
                "Could not reload your profile."
            );

            const next = mapSettings(
                result.settings ?? {},
                profileResult.user ?? {}
            );

            setSettings(next);
            setSavedSettings(next);
            setApiStatus("Connected");
            setMessage(result.message || "System settings reset to defaults.");
        } catch (err) {
            setError(err.message || "Unable to reset system settings.");
        } finally {
            setSaving(false);
        }
    };

    const discardChanges = () => {
        setSettings({ ...savedSettings });
        setError("");
        setMessage("");
    };

    return (
        <div className="min-h-full space-y-4 pb-7 text-slate-200">
            <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                    <div className="mb-1.5 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                        <span className="text-[9px] uppercase tracking-[0.16em] text-cyan-400">
                            System Configuration
                        </span>
                    </div>

                    <h1 className="text-xl font-medium tracking-tight text-white sm:text-[22px]">
                        System Settings
                    </h1>

                    <p className="mt-1 max-w-xl text-[11px] leading-5 text-slate-500">
                        Manage platform preferences, account security, notifications
                        and system configuration.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleReset}
                        disabled={loading || saving}
                        className="flex h-9 items-center gap-1.5 rounded-md border border-[#254158] bg-[#0a1b2b] px-3 text-[10px] text-slate-300 hover:border-slate-500 disabled:opacity-40"
                    >
                        {saving ? (
                            <LoaderCircle size={12} className="animate-spin" />
                        ) : (
                            <RotateCcw size={12} />
                        )}
                        Reset to Defaults
                    </button>

                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={!dirty || loading || saving}
                        className="flex h-9 items-center gap-1.5 rounded-md border border-cyan-400/30 bg-cyan-400/10 px-3 text-[10px] text-cyan-300 hover:bg-cyan-400/15 disabled:opacity-40"
                    >
                        {saving ? (
                            <LoaderCircle size={12} className="animate-spin" />
                        ) : (
                            <Save size={12} />
                        )}
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </header>

            <div className="flex items-start gap-2.5 rounded-md border border-[#173149] bg-[#091a2a] p-3">
                {apiStatus === "Connected" ? (
                    <CheckCircle2 size={14} className="mt-0.5 text-emerald-400" />
                ) : (
                    <AlertCircle size={14} className="mt-0.5 text-amber-400" />
                )}

                <div>
                    <p className="text-[10px] text-slate-200">
                        {loading
                            ? "Loading settings..."
                            : apiStatus === "Connected"
                                ? "Settings and profile APIs connected"
                                : "API connection unavailable"}
                    </p>
                    <p className="mt-1 text-[10px] leading-4 text-slate-500">
                        {loading
                            ? "Fetching saved preferences and profile."
                            : apiStatus === "Connected"
                                ? "Your preferences and profile are loaded from the backend."
                                : "Check the backend and your authenticated administrator session."}
                    </p>
                </div>
            </div>

            <div className="grid items-start gap-4 xl:grid-cols-[230px_minmax(0,1fr)]">
                <aside className="rounded-lg border border-[#173149] bg-[#091a2a] p-2.5">
                    <p className="px-2.5 pb-2.5 pt-1.5 text-[9px] uppercase tracking-[0.15em] text-slate-600">
                        Preferences
                    </p>

                    <nav className="space-y-1">
                        {sections.map((section) => {
                            const Icon = section.icon;
                            const selected = activeSection === section.id;

                            return (
                                <button
                                    key={section.id}
                                    type="button"
                                    onClick={() => {
                                        setActiveSection(section.id);
                                        setError("");
                                        setMessage("");
                                    }}
                                    className={`group flex min-h-[37px] w-full items-center gap-2.5 rounded-md px-2.5 text-left text-[11px] transition ${selected
                                            ? "bg-cyan-400/[0.09] text-white"
                                            : "text-slate-400 hover:bg-white/[0.035] hover:text-slate-200"
                                        }`}
                                >
                                    <Icon
                                        size={15}
                                        className={
                                            selected ? "text-cyan-400" : "text-slate-500"
                                        }
                                    />
                                    <span className="flex-1">{section.label}</span>
                                    {selected && (
                                        <ChevronRight size={13} className="text-cyan-400" />
                                    )}
                                </button>
                            );
                        })}
                    </nav>

                    <div className="mt-4 border-t border-[#173149] pt-3">
                        <div className="flex items-center gap-2 rounded-md border border-[#173149] bg-[#0b2031] p-2.5">
                            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-400/10">
                                <ShieldCheck size={14} className="text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-200">Admin Console</p>
                                <p className="mt-0.5 text-[9px] text-slate-500">
                                    Configuration workspace
                                </p>
                            </div>
                        </div>
                    </div>
                </aside>

                <form
                    onSubmit={handleSave}
                    className="min-w-0 overflow-hidden rounded-lg border border-[#173149] bg-[#091a2a]"
                >
                    <div className="flex items-center gap-2.5 border-b border-[#173149] px-4 py-4 sm:px-5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-md border border-cyan-400/15 bg-cyan-400/[0.07]">
                            <ActiveIcon size={17} className="text-cyan-400" />
                        </div>
                        <div>
                            <h2 className="text-[12px] text-white">{active?.label}</h2>
                            <p className="mt-1 text-[10px] text-slate-500">
                                Configure your {active?.label.toLowerCase()}.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-5 p-4 sm:p-5">
                        {loading && (
                            <div className="flex items-center gap-2 rounded-md border border-cyan-400/15 bg-cyan-400/[0.04] p-3 text-[11px] text-cyan-300">
                                <LoaderCircle size={14} className="animate-spin" />
                                Loading settings and profile...
                            </div>
                        )}

                        {activeSection === "general" && (
                            <>
                                <SectionHeading
                                    title="General Configuration"
                                    description="Set your platform identity and regional preferences."
                                />

                                <div className="grid gap-4 md:grid-cols-2">
                                    <Field label="System Name" icon={SettingsIcon}>
                                        <input
                                            value={settings.systemName}
                                            disabled={loading || saving}
                                            onChange={(e) => update("systemName", e.target.value)}
                                            className={inputClass}
                                            placeholder="System name"
                                        />
                                    </Field>

                                    <Field label="Organization Name" icon={Building2}>
                                        <input
                                            value={settings.organization}
                                            disabled={loading || saving}
                                            onChange={(e) => update("organization", e.target.value)}
                                            className={inputClass}
                                            placeholder="Organization"
                                        />
                                    </Field>

                                    <Field label="Support Email" icon={Mail}>
                                        <input
                                            type="email"
                                            value={settings.supportEmail}
                                            disabled={loading || saving}
                                            onChange={(e) => update("supportEmail", e.target.value)}
                                            className={inputClass}
                                        />
                                    </Field>

                                    <Field label="Timezone" icon={Globe}>
                                        <select
                                            value={settings.timezone}
                                            disabled={loading || saving}
                                            onChange={(e) => update("timezone", e.target.value)}
                                            className={inputClass}
                                        >
                                            <option value="Asia/Kolkata">India Standard Time</option>
                                            <option value="UTC">UTC</option>
                                            <option value="Asia/Dubai">Gulf Standard Time</option>
                                            <option value="Europe/London">United Kingdom</option>
                                        </select>
                                    </Field>

                                    <Field label="Language" icon={Globe}>
                                        <select
                                            value={settings.language}
                                            disabled={loading || saving}
                                            onChange={(e) => update("language", e.target.value)}
                                            className={inputClass}
                                        >
                                            <option value="English">English</option>
                                            <option value="Hindi">Hindi</option>
                                        </select>
                                    </Field>
                                </div>
                            </>
                        )}

                        {activeSection === "profile" && (
                            <>
                                <SectionHeading
                                    title="Profile & Account"
                                    description="Manage administrator account information."
                                />

                                <div className="flex items-center gap-3 rounded-md border border-[#173149] bg-[#0b2031] p-3">
                                    <Avatar
                                        name={settings.adminName}
                                        image={settings.profileImage}
                                    />
                                    <div className="min-w-0">
                                        <p className="text-[12px] text-white">Suraksha AI</p>
                                        <p className="mt-1 break-all text-[10px] text-slate-500">
                                            {settings.adminEmail || "Loading email..."}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <Field label="Display Name" icon={UserRound}>
                                        <input
                                            value={settings.adminName}
                                            disabled={loading || saving}
                                            onChange={(e) => update("adminName", e.target.value)}
                                            className={inputClass}
                                            maxLength={100}
                                        />
                                    </Field>

                                    <Field label="Email Address" icon={Mail}>
                                        <input
                                            type="email"
                                            value={settings.adminEmail}
                                            disabled
                                            readOnly
                                            className={inputClass}
                                        />
                                    </Field>
                                </div>

                                <Notice>
                                    The profile image and email are loaded from your existing
                                    authenticated Profile API. Saving this section updates
                                    the authenticated user's name through that API.
                                </Notice>
                            </>
                        )}

                        {activeSection === "security" && (
                            <>
                                <SectionHeading
                                    title="Security & Password"
                                    description="Change your password securely."
                                />

                                <Notice>
                                    Enter your current password and a new password of at least
                                    6 characters. Password changes use your existing Profile
                                    API.
                                </Notice>

                                <Field label="Current Password" icon={LockKeyhole}>
                                    <PasswordInput
                                        value={settings.currentPassword}
                                        visible={showPassword}
                                        disabled={loading || saving}
                                        onToggle={() => setShowPassword((v) => !v)}
                                        onChange={(v) => update("currentPassword", v)}
                                    />
                                </Field>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <Field label="New Password" icon={LockKeyhole}>
                                        <PasswordInput
                                            value={settings.newPassword}
                                            visible={showPassword}
                                            disabled={loading || saving}
                                            onToggle={() => setShowPassword((v) => !v)}
                                            onChange={(v) => update("newPassword", v)}
                                        />
                                    </Field>

                                    <Field label="Confirm New Password" icon={LockKeyhole}>
                                        <PasswordInput
                                            value={settings.confirmPassword}
                                            visible={showPassword}
                                            disabled={loading || saving}
                                            onToggle={() => setShowPassword((v) => !v)}
                                            onChange={(v) => update("confirmPassword", v)}
                                        />
                                    </Field>
                                </div>
                            </>
                        )}

                        {activeSection === "notifications" && (
                            <>
                                <SectionHeading
                                    title="Notification Preferences"
                                    description="Configure notification preferences for your workspace."
                                />

                                <div className="space-y-2.5">
                                    <ToggleRow
                                        icon={Mail}
                                        title="Email Notifications"
                                        description="Email notification preference."
                                        checked={settings.emailNotifications}
                                        disabled={loading || saving}
                                        onChange={(v) => update("emailNotifications", v)}
                                    />

                                    <ToggleRow
                                        icon={Bell}
                                        title="Incident Alerts"
                                        description="Preference for incident notifications."
                                        checked={settings.incidentAlerts}
                                        disabled={loading || saving}
                                        onChange={(v) => update("incidentAlerts", v)}
                                    />

                                    <ToggleRow
                                        icon={ShieldCheck}
                                        title="Critical Incident Alerts"
                                        description="Preference for critical incident alerts."
                                        checked={settings.criticalAlerts}
                                        disabled={loading || saving}
                                        onChange={(v) => update("criticalAlerts", v)}
                                    />

                                    <ToggleRow
                                        icon={UserRound}
                                        title="Field Officer Updates"
                                        description="Preference for field officer updates."
                                        checked={settings.officerUpdates}
                                        disabled={loading || saving}
                                        onChange={(v) => update("officerUpdates", v)}
                                    />

                                    <ToggleRow
                                        icon={FileText}
                                        title="Weekly Reports"
                                        description="Preference for weekly report notifications."
                                        checked={settings.weeklyReports}
                                        disabled={loading || saving}
                                        onChange={(v) => update("weeklyReports", v)}
                                    />
                                </div>
                            </>
                        )}

                        {activeSection === "appearance" && (
                            <>
                                <SectionHeading
                                    title="Appearance Preferences"
                                    description="Configure the admin navigation layout."
                                />

                                <ToggleRow
                                    icon={SettingsIcon}
                                    title="Compact Sidebar"
                                    description="Save a preference for a compact navigation layout."
                                    checked={settings.compactSidebar}
                                    disabled={loading || saving}
                                    onChange={(v) => update("compactSidebar", v)}
                                />

                                <p className="text-[10px] leading-4 text-slate-500">
                                    This preference is saved in the database. The sidebar
                                    component must also read this value to change its layout.
                                </p>
                            </>
                        )}

                        {activeSection === "system" && (
                            <>
                                <SectionHeading
                                    title="System Information"
                                    description="Application configuration and API status."
                                />

                                <div className="space-y-2.5">
                                    <InfoRow
                                        icon={Building2}
                                        label="Application"
                                        value="SurakshaAI"
                                    />
                                    <InfoRow
                                        icon={Clock3}
                                        label="Environment"
                                        value={import.meta.env.MODE || "Development"}
                                    />
                                    <InfoRow
                                        icon={Server}
                                        label="Backend API"
                                        value={API_URL}
                                    />
                                    <InfoRow
                                        icon={Database}
                                        label="Settings API status"
                                        value={apiStatus}
                                    />
                                    <InfoRow
                                        icon={ShieldCheck}
                                        label="Authentication"
                                        value="Existing authenticated session"
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={loadSettings}
                                    disabled={loading || saving}
                                    className="rounded-md border border-[#254158] px-3 py-2 text-[10px] text-slate-300 hover:bg-white/[0.03] disabled:opacity-40"
                                >
                                    Check Connection
                                </button>

                                <p className="text-[10px] leading-4 text-slate-500">
                                    API status reflects successful requests; it is not an
                                    independent MongoDB health check.
                                </p>
                            </>
                        )}

                        {error && (
                            <div
                                role="alert"
                                className="rounded-md border border-red-400/20 bg-red-400/[0.06] p-3 text-[11px] text-red-300"
                            >
                                {error}
                            </div>
                        )}

                        {message && (
                            <div
                                role="status"
                                className="flex items-start gap-2 rounded-md border border-emerald-400/20 bg-emerald-400/[0.05] p-3 text-[10px] leading-4 text-emerald-300"
                            >
                                <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
                                {message}
                            </div>
                        )}
                    </div>

                    <footer className="flex flex-col-reverse justify-between gap-3 border-t border-[#173149] bg-[#081827] px-4 py-3.5 sm:flex-row sm:items-center sm:px-5">
                        <p className="text-[9px] text-slate-600">
                            <span className="text-cyan-400">*</span> Changes use their
                            respective existing APIs.
                        </p>

                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={discardChanges}
                                disabled={!dirty || saving || loading}
                                className="rounded-md border border-[#254158] px-3 py-2 text-[10px] text-slate-300 hover:bg-white/[0.03] disabled:opacity-40"
                            >
                                Discard
                            </button>

                            <button
                                type="submit"
                                disabled={!dirty || saving || loading}
                                className="flex items-center gap-1.5 rounded-md bg-cyan-400 px-3.5 py-2 text-[10px] font-medium text-[#061522] hover:bg-cyan-300 disabled:opacity-40"
                            >
                                {saving ? (
                                    <LoaderCircle size={12} className="animate-spin" />
                                ) : (
                                    <Save size={12} />
                                )}
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </footer>
                </form>
            </div>
        </div>
    );
}

function SectionHeading({ title, description }) {
    return (
        <div>
            <h3 className="text-[11px] font-medium text-slate-200">{title}</h3>
            <p className="mt-1 text-[10px] leading-4 text-slate-500">
                {description}
            </p>
        </div>
    );
}

function Field({ label, icon: Icon, children }) {
    return (
        <label className="block min-w-0">
            <span className="mb-1.5 flex items-center gap-1.5 text-[10px] text-slate-300">
                {Icon && <Icon size={12} className="text-slate-500" />}
                {label}
            </span>
            {children}
        </label>
    );
}

function Avatar({ name, image }) {
    return (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-cyan-400/20 bg-cyan-400/10 text-sm font-medium text-cyan-300">
            {image ? (
                <img
                    src={image}
                    alt="Administrator profile"
                    className="h-full w-full object-cover"
                    onError={(event) => {
                        event.currentTarget.style.display = "none";
                    }}
                />
            ) : (
                (name?.trim().charAt(0) || "S").toUpperCase()
            )}
        </div>
    );
}

function PasswordInput({
    value,
    visible,
    disabled,
    onToggle,
    onChange,
}) {
    return (
        <div className="relative">
            <input
                type={visible ? "text" : "password"}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className={`${inputClass} pr-9`}
                placeholder="Enter password"
                autoComplete="new-password"
            />

            <button
                type="button"
                onClick={onToggle}
                disabled={disabled}
                aria-label={visible ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200"
            >
                {visible ? <EyeOff size={14} /> : <Eye size={14} />}
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
    disabled,
}) {
    return (
        <div className="flex items-center gap-3 rounded-md border border-[#173149] bg-[#0b2031] px-3.5 py-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#102a3e]">
                <Icon size={14} className="text-slate-400" />
            </div>

            <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium text-slate-200">{title}</p>
                <p className="mt-1 text-[10px] leading-4 text-slate-500">
                    {description}
                </p>
            </div>

            <button
                type="button"
                role="switch"
                aria-checked={checked}
                aria-label={title}
                disabled={disabled}
                onClick={() => onChange(!checked)}
                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${checked ? "bg-cyan-400" : "bg-slate-700"
                    }`}
            >
                <span
                    className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${checked ? "translate-x-4" : "translate-x-0"
                        }`}
                />
            </button>
        </div>
    );
}

function InfoRow({ icon: Icon, label, value }) {
    return (
        <div className="flex items-center gap-2.5 rounded-md border border-[#173149] bg-[#0b2031] p-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#102a3e]">
                <Icon size={14} className="text-cyan-400" />
            </div>

            <div className="min-w-0 flex-1">
                <p className="text-[9px] text-slate-500">{label}</p>
                <p className="mt-0.5 break-words text-[11px] text-slate-200">
                    {value}
                </p>
            </div>
        </div>
    );
}

function Notice({ children }) {
    return (
        <div className="flex items-start gap-2.5 rounded-md border border-amber-400/20 bg-amber-400/[0.05] p-3">
            <AlertCircle
                size={14}
                className="mt-0.5 shrink-0 text-amber-400"
            />
            <p className="text-[10px] leading-4 text-slate-400">{children}</p>
        </div>
    );
}