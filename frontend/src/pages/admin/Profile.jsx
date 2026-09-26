import { useState } from "react";
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
    Phone,
    Shield,
    ShieldCheck,
    Smartphone,
    UserRound,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

function Profile() {
    const { user } = useAuth();
    const [editing, setEditing] = useState(false);

    const name = user?.name || "SurakshaAI Administrator";
    const email = user?.email || "admin@surakshaai.com";
    const username = user?.username || "surakshaai_admin";

    const roleLabel =
        user?.role === "admin"
            ? "Super Administrator"
            : user?.role === "field_officer"
                ? "Field Officer"
                : user?.role === "department_officer"
                    ? "Department Officer"
                    : "Citizen";

    const initials = name
        .split(" ")
        .filter(Boolean)
        .map((item) => item[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    const handleEdit = () => {
        if (editing) {
            setEditing(false);
            toast.success("Profile changes saved.");
            return;
        }

        setEditing(true);
    };

    return (
        <div className="space-y-5">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Settings</span>
                <span className="text-slate-600">›</span>
                <span className="text-cyan-400">Profile</span>
            </div>

            {/* Page Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-[28px] font-semibold tracking-tight text-white sm:text-[32px]">
                        Administrator Profile
                    </h1>
                    <p className="mt-1 text-sm text-slate-400">
                        Manage your account information, security settings and activity.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleEdit}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-[6px] bg-blue-600 px-5 text-sm font-medium text-white transition hover:bg-blue-500"
                >
                    <Edit3 size={17} />
                    {editing ? "Save Profile" : "Edit Profile"}
                </button>
            </div>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(330px,.9fr)]">
                <div className="min-w-0 space-y-5">
                    {/* Profile Hero */}
                    <section className="relative overflow-hidden rounded-[7px] border border-blue-500/30 bg-gradient-to-br from-[#0b2a69] via-[#09214d] to-[#0a1b34] p-6">
                        <div className="pointer-events-none absolute right-[-50px] top-[-60px] h-52 w-52 rounded-full bg-blue-500/10 blur-2xl" />
                        <div className="pointer-events-none absolute right-6 top-6 opacity-[0.07]">
                            <Shield size={170} />
                        </div>

                        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center">
                            <div className="relative shrink-0 self-center lg:self-auto">
                                <div className="flex h-28 w-28 items-center justify-center rounded-full border border-blue-400 bg-gradient-to-br from-blue-500/70 to-indigo-700 text-3xl font-semibold text-white shadow-[0_0_0_8px_rgba(59,130,246,0.08)]">
                                    {initials}
                                </div>
                                <span className="absolute bottom-1 right-1 h-6 w-6 rounded-full border-4 border-[#0b2a69] bg-emerald-400" />
                            </div>

                            <div className="min-w-0 flex-1">
                                <h2 className="text-2xl font-semibold text-white">
                                    {name}
                                </h2>

                                <div className="mt-2 flex flex-wrap items-center gap-3">
                                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-300">
                                        <span className="text-base">♛</span>
                                        {roleLabel}
                                    </span>

                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                        Active
                                    </span>
                                </div>

                                <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
                                    Managing a safer, smarter and more resilient India through
                                    technology and collaboration.
                                </p>

                                <div className="mt-5 grid grid-cols-1 gap-4 border-t border-white/10 pt-4 sm:grid-cols-3">
                                    <MetaItem
                                        icon={UserRound}
                                        label="Administrator ID"
                                        value="ADM-00001"
                                    />
                                    <MetaItem
                                        icon={CalendarDays}
                                        label="Member Since"
                                        value={
                                            user?.createdAt
                                                ? new Date(user.createdAt).toLocaleDateString(
                                                    "en-GB",
                                                    {
                                                        day: "2-digit",
                                                        month: "short",
                                                        year: "numeric",
                                                    }
                                                )
                                                : "Account Active"
                                        }
                                    />
                                    <MetaItem
                                        icon={Clock3}
                                        label="Last Login"
                                        value="Current Session"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Account Information */}
                    <ProfileSection
                        icon={UserRound}
                        title="Account Information"
                        description="Your primary account details and contact information."
                    >
                        <InfoCard
                            icon={UserRound}
                            label="Full Name"
                            value={name}
                            editing={editing}
                        />
                        <InfoCard
                            icon={Mail}
                            label="Email Address"
                            value={email}
                            editing={editing}
                        />
                        <InfoCard
                            icon={UserRound}
                            label="Username"
                            value={username}
                            editing={false}
                        />
                        <InfoCard
                            icon={Phone}
                            label="Mobile Number"
                            value="Not added"
                            editing={editing}
                        />
                        <InfoCard
                            icon={Shield}
                            label="Role"
                            value={roleLabel}
                            editing={false}
                        />
                        <InfoCard
                            icon={CheckCircle2}
                            label="Account Status"
                            value="Active"
                            status
                        />
                    </ProfileSection>

                    {/* Organization Details */}
                    <ProfileSection
                        icon={Building2}
                        title="Organization Details"
                        description="Your organization and access details."
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
                    {/* Security */}
                    <ProfileSection
                        icon={Shield}
                        title="Security"
                        description="Manage your password and security settings."
                    >
                        <div className="space-y-3 sm:col-span-2">
                            <SecurityRow
                                icon={KeyRound}
                                title="Password"
                                description="Last changed 30 days ago"
                                action="Change Password"
                                onClick={() =>
                                    toast.info("Change password flow coming soon.")
                                }
                            />

                            <SecurityRow
                                icon={Smartphone}
                                title="Two-Factor Authentication"
                                description="Add an additional layer of security to your account."
                                badge="Not Enabled"
                                action="Enable"
                                onClick={() =>
                                    toast.info("Two-factor authentication will be connected soon.")
                                }
                                compact
                            />

                            <SecurityRow
                                icon={ShieldCheck}
                                title="Active Sessions"
                                description="Manage your logged-in devices."
                                action="View Sessions"
                                onClick={() =>
                                    toast.info("Active sessions will be connected soon.")
                                }
                            />
                        </div>
                    </ProfileSection>

                    {/* Recent Activity */}
                    <ProfileSection
                        icon={Activity}
                        title="Recent Activity"
                        description="Your latest account activity and actions."
                        action={
                            <button
                                type="button"
                                onClick={() => toast.info("Full activity history coming soon.")}
                                className="inline-flex items-center gap-1.5 rounded-[5px] border border-blue-500/50 px-3 py-2 text-[11px] font-medium text-blue-300 transition hover:bg-blue-500/10"
                            >
                                View All
                                <ArrowRight size={13} />
                            </button>
                        }
                    >
                        <div className="relative space-y-5 sm:col-span-2">
                            <div className="absolute bottom-4 left-[7px] top-4 w-px bg-blue-500/30" />

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

            {/* Footer Security Notice */}
            <div className="flex items-start gap-3 rounded-[6px] border border-blue-500/15 bg-blue-500/5 p-4">
                <ShieldCheck
                    size={18}
                    className="mt-0.5 shrink-0 text-blue-400"
                />
                <div>
                    <p className="text-xs font-medium text-blue-300">
                        Secure administrator account
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                        Keep your account credentials private. Security-sensitive
                        changes should only be performed by authorized administrators.
                    </p>
                </div>
            </div>
        </div>
    );
}

function ProfileSection({ icon: Icon, title, description, action, children }) {
    return (
        <section className="rounded-[7px] border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
            <div className="mb-4 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-blue-500/20 bg-blue-500/10">
                        <Icon size={19} className="text-blue-300" />
                    </div>

                    <div>
                        <h2 className="text-base font-semibold text-white">
                            {title}
                        </h2>
                        <p className="mt-1 text-xs text-slate-400">
                            {description}
                        </p>
                    </div>
                </div>

                {action}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
    status = false,
}) {
    return (
        <div className="flex min-h-[68px] items-center gap-3 rounded-[6px] border border-[#1d3146] bg-[#0c1a2a] p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[5px] bg-slate-800/80">
                <Icon size={17} className="text-slate-300" />
            </div>

            <div className="min-w-0 flex-1">
                <p className="text-[10px] text-slate-500">{label}</p>

                {editing && (label === "Full Name" || label === "Mobile Number") ? (
                    <input
                        defaultValue={value === "Not added" ? "" : value}
                        placeholder={`Enter ${label.toLowerCase()}`}
                        className="mt-1 h-7 w-full rounded-[4px] border border-slate-700 bg-[#091522] px-2 text-xs text-white outline-none focus:border-blue-500"
                    />
                ) : status ? (
                    <p className="mt-1 flex items-center gap-2 text-xs font-medium text-slate-200">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
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
        <div className="flex items-center gap-2.5">
            <Icon size={18} className="shrink-0 text-slate-300" />
            <div className="min-w-0">
                <p className="text-[10px] text-slate-400">{label}</p>
                <p className="mt-0.5 truncate text-xs font-medium text-white">
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
        <div className="rounded-[6px] border border-[#1d3146] bg-[#0c1a2a] p-3">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] bg-slate-800/80">
                    <Icon size={18} className="text-slate-200" />
                </div>

                <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-100">
                        {title}
                    </p>
                    <p className="mt-1 text-[10px] leading-4 text-slate-500">
                        {description}
                    </p>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                    {badge && (
                        <span className="rounded-full border border-red-500/30 bg-red-500/10 px-2 py-1 text-[10px] font-medium text-red-300">
                            {badge}
                        </span>
                    )}

                    <button
                        type="button"
                        onClick={onClick}
                        className={`inline-flex items-center gap-1.5 rounded-[5px] border border-blue-500/60 px-3 py-2 text-[11px] font-medium text-blue-300 transition hover:bg-blue-500/10 ${compact ? "min-w-[70px] justify-center" : ""
                            }`}
                    >
                        {action}
                        {compact && <ArrowRight size={13} />}
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
        <div className="relative flex gap-3 pl-0">
            <span
                className={`relative z-10 mt-2 h-[15px] w-[15px] shrink-0 rounded-full border-2 border-[#0b1522] ${color}`}
            />

            <div className="flex min-w-0 flex-1 items-start gap-3 rounded-[6px] border border-[#1d3146] bg-[#0c1a2a] p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[5px] bg-slate-800/80">
                    <Icon size={16} className="text-slate-300" />
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs font-semibold text-slate-100">
                            {title}
                        </p>
                        <span className="text-[10px] text-slate-500">
                            {time}
                        </span>
                    </div>
                    <p className="mt-1 text-[10px] leading-4 text-slate-500">
                        {description}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Profile;
