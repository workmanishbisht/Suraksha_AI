import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
    Activity,
    ArrowRight,
    Building2,
    CalendarDays,
    CheckCircle2,
    Clock3,
    Edit3,
    KeyRound,
    Mail,
    MapPin,
    Shield,
    ShieldCheck,
    Smartphone,
    UserRound,
    X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL = "http://localhost:5000/api";

function Profile() {
    const { user } = useAuth();

    const [profile, setProfile] = useState(user || null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [nameInput, setNameInput] = useState("");
    const [passwordOpen, setPasswordOpen] = useState(false);
    const [passwordSaving, setPasswordSaving] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    useEffect(() => {
        if (user && !profile) {
            setProfile(user);
        }
    }, [user, profile]);

    const fetchProfile = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/profile`, {
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to load profile.");
            }

            setProfile(data.user);
            setNameInput(data.user?.name || "");
        } catch (error) {
            console.error("Profile Fetch Error:", error);
            if (user) {
                setProfile(user);
                setNameInput(user.name || "");
            } else {
                toast.error(error.message || "Failed to load profile.");
            }
        } finally {
            setLoading(false);
        }
    };

    const name = profile?.name || "SurakshaAI Administrator";
    const email = profile?.email || "admin@surakshaai.com";
    const username = profile?.username || "surakshaai_admin";

    const roleLabel =
        profile?.role === "admin"
            ? "Super Administrator"
            : profile?.role === "field_officer"
                ? "Field Officer"
                : profile?.role === "department_officer"
                    ? "Department Officer"
                    : "Citizen";

    const initials = useMemo(
        () =>
            name
                .split(" ")
                .filter(Boolean)
                .map((item) => item[0])
                .join("")
                .slice(0, 2)
                .toUpperCase(),
        [name]
    );

    const memberSince = profile?.createdAt
        ? new Date(profile.createdAt).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        })
        : "Account Active";

    const startEditing = () => {
        setNameInput(name);
        setEditing(true);
    };

    const cancelEditing = () => {
        setNameInput(name);
        setEditing(false);
    };

    const saveProfile = async () => {
        const trimmedName = nameInput.trim();

        if (!trimmedName) {
            toast.error("Full name cannot be empty.");
            return;
        }

        try {
            setSaving(true);

            const response = await fetch(`${API_BASE_URL}/profile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    name: trimmedName,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to update profile.");
            }

            setProfile(data.user);
            setNameInput(data.user?.name || trimmedName);
            setEditing(false);
            toast.success("Profile updated successfully.");
        } catch (error) {
            console.error("Profile Update Error:", error);
            toast.error(error.message || "Failed to update profile.");
        } finally {
            setSaving(false);
        }
    };

    const updatePasswordField = (field, value) => {
        setPasswordForm((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const closePasswordModal = () => {
        if (passwordSaving) return;

        setPasswordOpen(false);
        setPasswordForm({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        });
    };

    const changePassword = async (event) => {
        event.preventDefault();

        if (
            !passwordForm.currentPassword ||
            !passwordForm.newPassword ||
            !passwordForm.confirmPassword
        ) {
            toast.error("Please fill all password fields.");
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            toast.error("New password must be at least 6 characters.");
            return;
        }

        if (
            passwordForm.newPassword !== passwordForm.confirmPassword
        ) {
            toast.error("New passwords do not match.");
            return;
        }

        try {
            setPasswordSaving(true);

            const response = await fetch(
                `${API_BASE_URL}/profile/change-password`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify(passwordForm),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to change password."
                );
            }

            toast.success("Password changed successfully.");
            closePasswordModal();
        } catch (error) {
            console.error("Change Password Error:", error);
            toast.error(error.message || "Failed to change password.");
        } finally {
            setPasswordSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center">
                <div className="flex items-center gap-3 text-sm text-slate-400">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500/30 border-t-blue-400" />
                    Loading profile...
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-5">
                <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500">Settings</span>
                    <span className="text-slate-700">/</span>
                    <span className="text-blue-400">Profile</span>
                </div>

                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/5 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-blue-300">
                            <ShieldCheck size={12} />
                            Account Settings
                        </div>
                        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-[30px]">
                            Administrator Profile
                        </h1>
                        <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500 sm:text-sm">
                            Manage your account information and security settings.
                        </p>
                    </div>

                    <div className="flex gap-2">
                        {editing && (
                            <button
                                type="button"
                                onClick={cancelEditing}
                                disabled={saving}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-[5px] border border-slate-700 bg-slate-900 px-4 text-xs font-medium text-slate-300 transition hover:border-slate-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <X size={15} />
                                Cancel
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={editing ? saveProfile : startEditing}
                            disabled={saving}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-[5px] bg-blue-600 px-4 text-xs font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Edit3 size={15} />
                            {saving
                                ? "Saving..."
                                : editing
                                    ? "Save Changes"
                                    : "Edit Profile"}
                        </button>
                    </div>
                </div>

                <section className="overflow-hidden rounded-[7px] border border-[#1d3146] bg-[#0b1522]">
                    <div className="h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600" />

                    <div className="relative p-5 sm:p-6">
                        <div className="pointer-events-none absolute right-0 top-0 h-44 w-44 rounded-full bg-blue-600/10 blur-3xl" />

                        <div className="relative flex flex-col gap-5 md:flex-row md:items-center">
                            <div className="relative shrink-0">
                                <div className="flex h-24 w-24 items-center justify-center rounded-[18px] border border-blue-400/40 bg-gradient-to-br from-blue-600 to-indigo-700 text-2xl font-semibold text-white">
                                    {initials}
                                </div>
                                <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-4 border-[#0b1522] bg-emerald-400">
                                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                                </span>
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h2 className="text-xl font-semibold text-white">
                                            {name}
                                        </h2>
                                        <p className="mt-1 text-xs text-slate-500">
                                            @{username}
                                        </p>
                                    </div>

                                    <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-medium text-emerald-300">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                        Active
                                    </span>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-2">
                                    <ProfileTag
                                        icon={Shield}
                                        text={roleLabel}
                                    />
                                    <ProfileTag
                                        icon={Mail}
                                        text={email}
                                    />
                                </div>

                                <div className="mt-5 grid grid-cols-1 gap-3 border-t border-white/5 pt-4 sm:grid-cols-3">
                                    <MetaItem
                                        icon={UserRound}
                                        label="Administrator ID"
                                        value="ADM-00001"
                                    />
                                    <MetaItem
                                        icon={CalendarDays}
                                        label="Member Since"
                                        value={memberSince}
                                    />
                                    <MetaItem
                                        icon={Clock3}
                                        label="Session"
                                        value="Current Session"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,.8fr)]">
                    <div className="space-y-5">
                        <ProfileSection
                            icon={UserRound}
                            title="Account Information"
                            description="Your primary account details."
                        >
                            <InfoCard
                                icon={UserRound}
                                label="Full Name"
                                value={name}
                                editing={editing}
                                inputValue={nameInput}
                                onChange={setNameInput}
                            />

                            <InfoCard
                                icon={Mail}
                                label="Email Address"
                                value={email}
                            />

                            <InfoCard
                                icon={UserRound}
                                label="Username"
                                value={username}
                            />

                            <InfoCard
                                icon={Shield}
                                label="Role"
                                value={roleLabel}
                            />

                            <InfoCard
                                icon={CheckCircle2}
                                label="Account Status"
                                value="Active"
                                status
                            />

                            <InfoCard
                                icon={MapPin}
                                label="Work Location"
                                value="Government of India"
                            />
                        </ProfileSection>

                        <ProfileSection
                            icon={Building2}
                            title="Organization Details"
                            description="Your organization and access information."
                        >
                            <InfoCard
                                icon={Building2}
                                label="Department"
                                value="System Administration"
                            />
                            <InfoCard
                                icon={KeyRound}
                                label="Access Level"
                                value="Full Access"
                            />
                            <InfoCard
                                icon={MapPin}
                                label="Work Location"
                                value="Government of India"
                            />
                            <InfoCard
                                icon={Clock3}
                                label="Time Zone"
                                value="IST (UTC +5:30)"
                            />
                        </ProfileSection>
                    </div>

                    <div className="space-y-5">
                        <ProfileSection
                            icon={Shield}
                            title="Security"
                            description="Protect your account and sessions."
                        >
                            <div className="space-y-2.5 sm:col-span-2">
                                <SecurityRow
                                    icon={KeyRound}
                                    title="Password"
                                    description="Update your account password."
                                    action="Change Password"
                                    onClick={() => setPasswordOpen(true)}
                                />

                                <SecurityRow
                                    icon={Smartphone}
                                    title="Two-Factor Authentication"
                                    description="Add an additional security layer."
                                    badge="Not Enabled"
                                    action="Enable"
                                    onClick={() =>
                                        toast.info(
                                            "Two-factor authentication will be connected soon."
                                        )
                                    }
                                    compact
                                />

                                <SecurityRow
                                    icon={ShieldCheck}
                                    title="Active Sessions"
                                    description="Manage your logged-in devices."
                                    action="View Sessions"
                                    onClick={() =>
                                        toast.info(
                                            "Active sessions will be connected soon."
                                        )
                                    }
                                />
                            </div>
                        </ProfileSection>

                        <ProfileSection
                            icon={Activity}
                            title="Recent Activity"
                            description="Latest account activity."
                            action={
                                <button
                                    type="button"
                                    onClick={() =>
                                        toast.info(
                                            "Full activity history coming soon."
                                        )
                                    }
                                    className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-300 transition hover:text-blue-200"
                                >
                                    View All
                                    <ArrowRight size={12} />
                                </button>
                            }
                        >
                            <div className="relative space-y-3 sm:col-span-2">
                                <ActivityItem
                                    color="bg-emerald-400"
                                    title="Logged in"
                                    description="Successfully logged in to the system."
                                    time="Current session"
                                    icon={ShieldCheck}
                                />
                                <ActivityItem
                                    color="bg-blue-500"
                                    title="Updated system settings"
                                    description="Modified incident category settings."
                                    time="Recent"
                                    icon={KeyRound}
                                />
                                <ActivityItem
                                    color="bg-blue-500"
                                    title="Added field officer"
                                    description="New field officer account created."
                                    time="Recent"
                                    icon={UserRound}
                                />
                                <ActivityItem
                                    color="bg-blue-500"
                                    title="Viewed analytics report"
                                    description="Accessed incident analytics dashboard."
                                    time="Recent"
                                    icon={Activity}
                                />
                            </div>
                        </ProfileSection>
                    </div>
                </div>

                <div className="flex items-start gap-3 rounded-[6px] border border-blue-500/15 bg-blue-500/5 p-4">
                    <ShieldCheck
                        size={17}
                        className="mt-0.5 shrink-0 text-blue-400"
                    />
                    <div>
                        <p className="text-xs font-medium text-blue-300">
                            Secure administrator account
                        </p>
                        <p className="mt-1 text-[10px] leading-5 text-slate-500">
                            Keep your account credentials private. Security-sensitive
                            changes should only be performed by authorized administrators.
                        </p>
                    </div>
                </div>
            </div>

            {passwordOpen && (
                <PasswordModal
                    form={passwordForm}
                    saving={passwordSaving}
                    onChange={updatePasswordField}
                    onClose={closePasswordModal}
                    onSubmit={changePassword}
                />
            )}
        </>
    );
}

function ProfileTag({ icon: Icon, text }) {
    return (
        <span className="inline-flex max-w-full items-center gap-1.5 rounded-[4px] border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[10px] text-slate-300">
            <Icon size={12} className="shrink-0 text-blue-300" />
            <span className="truncate">{text}</span>
        </span>
    );
}

function ProfileSection({ icon: Icon, title, description, action, children }) {
    return (
        <section className="rounded-[7px] border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
            <div className="mb-4 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[5px] border border-blue-500/15 bg-blue-500/10">
                        <Icon size={17} className="text-blue-300" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-white">
                            {title}
                        </h2>
                        <p className="mt-1 text-[10px] leading-4 text-slate-500">
                            {description}
                        </p>
                    </div>
                </div>

                {action}
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {children}
            </div>
        </section>
    );
}

function InfoCard({
    icon: Icon,
    label,
    value,
    editing = false,
    inputValue,
    onChange,
    status = false,
}) {
    return (
        <div className="flex min-h-[64px] items-center gap-3 rounded-[5px] border border-[#1d3146] bg-[#0c1a2a] p-3 transition hover:border-[#29415c]">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] bg-slate-800/80">
                <Icon size={15} className="text-slate-300" />
            </div>

            <div className="min-w-0 flex-1">
                <p className="text-[9px] uppercase tracking-wide text-slate-600">
                    {label}
                </p>

                {editing && label === "Full Name" ? (
                    <input
                        value={inputValue}
                        onChange={(event) => onChange(event.target.value)}
                        autoFocus
                        className="mt-1 h-7 w-full rounded-[4px] border border-blue-500/50 bg-[#091522] px-2 text-xs text-white outline-none focus:border-blue-400"
                    />
                ) : status ? (
                    <p className="mt-1 flex items-center gap-2 text-xs font-medium text-slate-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        {value}
                    </p>
                ) : (
                    <p className="mt-1 truncate text-xs font-medium text-slate-100">
                        {value}
                    </p>
                )}
            </div>
        </div>
    );
}

function MetaItem({ icon: Icon, label, value }) {
    return (
        <div className="flex min-w-0 items-center gap-2.5">
            <Icon size={16} className="shrink-0 text-slate-400" />
            <div className="min-w-0">
                <p className="text-[9px] uppercase tracking-wide text-slate-600">
                    {label}
                </p>
                <p className="mt-0.5 truncate text-[11px] font-medium text-white">
                    {value}
                </p>
            </div>
        </div>
    );
}

function SecurityRow({
    icon: Icon,
    title,
    description,
    action,
    onClick,
    badge,
    compact = false,
}) {
    return (
        <div className="rounded-[5px] border border-[#1d3146] bg-[#0c1a2a] p-3">
            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[5px] bg-slate-800/80">
                    <Icon size={16} className="text-slate-200" />
                </div>

                <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-100">
                        {title}
                    </p>
                    <p className="mt-1 text-[9px] leading-4 text-slate-500">
                        {description}
                    </p>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-1.5">
                    {badge && (
                        <span className="rounded-full border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-[9px] font-medium text-red-300">
                            {badge}
                        </span>
                    )}

                    <button
                        type="button"
                        onClick={onClick}
                        className={`inline-flex items-center gap-1 rounded-[4px] border border-blue-500/50 px-2.5 py-1.5 text-[10px] font-medium text-blue-300 transition hover:bg-blue-500/10 ${compact ? "justify-center" : ""
                            }`}
                    >
                        {action}
                        {compact && <ArrowRight size={11} />}
                    </button>
                </div>
            </div>
        </div>
    );
}

function ActivityItem({
    color,
    icon: Icon,
    title,
    description,
    time,
}) {
    return (
        <div className="flex gap-2.5">
            <span
                className={`mt-2 h-2 w-2 shrink-0 rounded-full ${color}`}
            />

            <div className="flex min-w-0 flex-1 items-start gap-2.5 rounded-[5px] border border-[#1d3146] bg-[#0c1a2a] p-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] bg-slate-800/80">
                    <Icon size={14} className="text-slate-300" />
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-[11px] font-semibold text-slate-100">
                            {title}
                        </p>
                        <span className="text-[9px] text-slate-600">
                            {time}
                        </span>
                    </div>
                    <p className="mt-1 text-[9px] leading-4 text-slate-500">
                        {description}
                    </p>
                </div>
            </div>
        </div>
    );
}

function PasswordModal({
    form,
    saving,
    onChange,
    onClose,
    onSubmit,
}) {
    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !saving) {
                    onClose();
                }
            }}
        >
            <div className="w-full max-w-md overflow-hidden rounded-[7px] border border-[#243a53] bg-[#0b1522] shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-[5px] bg-blue-500/10 text-blue-300">
                            <KeyRound size={17} />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-white">
                                Change Password
                            </h3>
                            <p className="text-[10px] text-slate-500">
                                Update your administrator password.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="rounded-[4px] p-1.5 text-slate-500 transition hover:bg-white/5 hover:text-white disabled:opacity-40"
                    >
                        <X size={17} />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="space-y-4 p-5">
                    <PasswordField
                        label="Current Password"
                        value={form.currentPassword}
                        onChange={(value) =>
                            onChange("currentPassword", value)
                        }
                    />

                    <PasswordField
                        label="New Password"
                        value={form.newPassword}
                        onChange={(value) =>
                            onChange("newPassword", value)
                        }
                    />

                    <PasswordField
                        label="Confirm New Password"
                        value={form.confirmPassword}
                        onChange={(value) =>
                            onChange("confirmPassword", value)
                        }
                    />

                    <div className="rounded-[5px] border border-blue-500/10 bg-blue-500/5 px-3 py-2.5 text-[10px] leading-4 text-slate-500">
                        Password must be at least 6 characters long.
                    </div>

                    <div className="flex justify-end gap-2 border-t border-white/5 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="h-9 rounded-[4px] border border-slate-700 px-4 text-xs font-medium text-slate-300 transition hover:border-slate-600 hover:text-white disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex h-9 items-center gap-2 rounded-[4px] bg-blue-600 px-4 text-xs font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <ShieldCheck size={14} />
                            {saving ? "Updating..." : "Update Password"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function PasswordField({ label, value, onChange }) {
    return (
        <label className="block">
            <span className="mb-1.5 block text-[10px] font-medium text-slate-400">
                {label}
            </span>
            <input
                type="password"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                autoComplete="new-password"
                className="h-10 w-full rounded-[5px] border border-[#263c54] bg-[#091522] px-3 text-xs text-white outline-none transition placeholder:text-slate-700 focus:border-blue-500"
                placeholder={`Enter ${label.toLowerCase()}`}
            />
        </label>
    );
}

export default Profile;
