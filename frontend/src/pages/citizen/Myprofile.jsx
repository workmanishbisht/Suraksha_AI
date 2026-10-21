
import { useState } from "react";
import {
    UserRound,
    Mail,
    Phone,
    MapPin,
    ShieldCheck,
    LockKeyhole,
    Camera,
    Pencil,
    Check,
    X,
    CalendarDays,
    BadgeCheck,
    Save,
    Eye,
    EyeOff,
    ArrowUpRight,
} from "lucide-react";

const initialProfile = {
    name: "Citizen User",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pinCode: "",
    gender: "",
    dateOfBirth: "",
    emergencyContact: "",
};

const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10";

function Field({ label, value, onChange, placeholder, disabled, type = "text" }) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-600">
                {label}
            </label>
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                className={`${inputClass} disabled:cursor-default disabled:bg-slate-50 disabled:text-slate-600`}
            />
        </div>
    );
}

function SectionHeading({ icon: Icon, title, description }) {
    return (
        <div className="mb-6 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
                <Icon size={19} />
            </div>
            <div>
                <h2 className="font-semibold text-slate-900">{title}</h2>
                <p className="mt-1 text-sm text-slate-500">{description}</p>
            </div>
        </div>
    );
}

export default function Myprofile() {
    const [profile, setProfile] = useState(initialProfile);
    const [savedProfile, setSavedProfile] = useState(initialProfile);
    const [editing, setEditing] = useState(false);
    const [activeTab, setActiveTab] = useState("profile");
    const [avatar, setAvatar] = useState("");
    const [passwords, setPasswords] = useState({
        current: "",
        newPassword: "",
        confirm: "",
    });
    const [showPasswords, setShowPasswords] = useState(false);
    const [notice, setNotice] = useState("");

    const updateField = (field, value) => {
        setProfile((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = (event) => {
        event.preventDefault();

        if (!profile.name.trim()) {
            setNotice("Please enter your full name.");
            return;
        }

        setSavedProfile({ ...profile });
        setEditing(false);
        setNotice("Profile updated in this session.");
    };

    const handleCancel = () => {
        setProfile({ ...savedProfile });
        setEditing(false);
        setNotice("");
    };

    const handleAvatar = (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setNotice("Please select an image file.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setNotice("Image size must be less than 5 MB.");
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            setAvatar(reader.result);
            setNotice("Photo preview updated for this session.");
        };

        reader.readAsDataURL(file);
    };

    const handlePasswordChange = (event) => {
        event.preventDefault();

        if (!passwords.current || !passwords.newPassword || !passwords.confirm) {
            setNotice("Please fill in all password fields.");
            return;
        }

        if (passwords.newPassword.length < 8) {
            setNotice("New password must contain at least 8 characters.");
            return;
        }

        if (passwords.newPassword !== passwords.confirm) {
            setNotice("New password and confirmation do not match.");
            return;
        }

        setNotice(
            "Password form validated. Connect the backend API to change your password."
        );
    };

    const displayName = profile.name.trim() || "Citizen User";
    const initials = displayName
        .split(/\s+/)
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-6">
                {/* Page heading */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
                            <span>Citizen Portal</span>
                            <span>/</span>
                            <span className="text-cyan-700">My Profile</span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                            My Profile
                        </h1>
                        <p className="mt-2 text-sm text-slate-500">
                            Manage your personal information and account security.
                        </p>
                    </div>

                    {activeTab === "profile" && !editing && (
                        <button
                            onClick={() => {
                                setEditing(true);
                                setNotice("");
                            }}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-800"
                        >
                            <Pencil size={16} />
                            Edit Profile
                        </button>
                    )}
                </div>

                {/* Notification */}
                {notice && (
                    <div
                        role="status"
                        className="flex items-start justify-between gap-3 rounded-xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-sm text-cyan-900"
                    >
                        <span>{notice}</span>
                        <button
                            onClick={() => setNotice("")}
                            aria-label="Dismiss message"
                            className="shrink-0 rounded-lg p-1 hover:bg-cyan-100"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}

                {/* Profile banner */}
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="h-28 bg-gradient-to-r from-slate-900 via-cyan-900 to-cyan-700 sm:h-36">
                        <div className="flex h-full items-start justify-end p-5">
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                                <ShieldCheck size={15} />
                                Citizen Account
                            </span>
                        </div>
                    </div>

                    <div className="px-5 pb-6 sm:px-8">
                        <div className="-mt-12 flex flex-col gap-5 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                                <div className="group relative h-24 w-24 shrink-0 sm:h-28 sm:w-28">
                                    <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-cyan-100 text-2xl font-bold text-cyan-800 shadow-md sm:text-3xl">
                                        {avatar ? (
                                            <img
                                                src={avatar}
                                                alt="Profile"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            initials
                                        )}
                                    </div>

                                    <label
                                        title="Upload profile photo"
                                        className="absolute -bottom-2 -right-2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border-2 border-white bg-cyan-700 text-white shadow transition hover:bg-cyan-800"
                                    >
                                        <Camera size={16} />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAvatar}
                                            className="hidden"
                                        />
                                    </label>
                                </div>

                                <div className="pb-1">
                                    <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                                        {displayName}
                                    </h2>
                                    <p className="mt-1 break-all text-sm text-slate-500">
                                        {profile.email || "Add your email address"}
                                    </p>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                            <BadgeCheck size={14} />
                                            Citizen
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                                            <ShieldCheck size={14} />
                                            Account holder
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="pb-1 text-sm text-slate-500">
                                <span className="inline-flex items-center gap-2">
                                    <UserRound size={16} />
                                    SurakshaAI Citizen Portal
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Tabs */}
                <div className="flex gap-2 overflow-x-auto rounded-xl border border-slate-200 bg-white p-2">
                    <button
                        onClick={() => {
                            setActiveTab("profile");
                            setNotice("");
                        }}
                        className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition ${activeTab === "profile"
                                ? "bg-cyan-50 text-cyan-800"
                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                            }`}
                    >
                        <UserRound size={17} />
                        Personal Information
                    </button>

                    <button
                        onClick={() => {
                            setActiveTab("security");
                            setEditing(false);
                            setProfile({ ...savedProfile });
                            setNotice("");
                        }}
                        className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition ${activeTab === "security"
                                ? "bg-cyan-50 text-cyan-800"
                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                            }`}
                    >
                        <LockKeyhole size={17} />
                        Account Security
                    </button>
                </div>

                {activeTab === "profile" ? (
                    <form onSubmit={handleSave} className="space-y-6">
                        {/* Personal information */}
                        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                            <SectionHeading
                                icon={UserRound}
                                title="Personal Information"
                                description="Your basic identity and contact details."
                            />

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <Field
                                    label="Full Name"
                                    value={profile.name}
                                    onChange={(e) => updateField("name", e.target.value)}
                                    placeholder="Enter your full name"
                                    disabled={!editing}
                                />

                                <Field
                                    label="Email Address"
                                    value={profile.email}
                                    onChange={(e) => updateField("email", e.target.value)}
                                    placeholder="you@example.com"
                                    type="email"
                                    disabled={!editing}
                                />

                                <Field
                                    label="Phone Number"
                                    value={profile.phone}
                                    onChange={(e) => updateField("phone", e.target.value)}
                                    placeholder="Enter phone number"
                                    type="tel"
                                    disabled={!editing}
                                />

                                <Field
                                    label="Date of Birth"
                                    value={profile.dateOfBirth}
                                    onChange={(e) => updateField("dateOfBirth", e.target.value)}
                                    type="date"
                                    disabled={!editing}
                                />

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-slate-600">
                                        Gender
                                    </label>
                                    <select
                                        value={profile.gender}
                                        onChange={(e) => updateField("gender", e.target.value)}
                                        disabled={!editing}
                                        className={`${inputClass} disabled:cursor-default disabled:bg-slate-50 disabled:text-slate-600`}
                                    >
                                        <option value="">Select gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                        <option value="Prefer not to say">Prefer not to say</option>
                                    </select>
                                </div>

                                <Field
                                    label="Emergency Contact"
                                    value={profile.emergencyContact}
                                    onChange={(e) =>
                                        updateField("emergencyContact", e.target.value)
                                    }
                                    placeholder="Emergency contact number"
                                    type="tel"
                                    disabled={!editing}
                                />
                            </div>
                        </section>

                        {/* Address */}
                        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                            <SectionHeading
                                icon={MapPin}
                                title="Address Information"
                                description="Your location can help emergency teams identify your area."
                            />

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <div className="space-y-2 sm:col-span-2">
                                    <label className="block text-sm font-medium text-slate-600">
                                        Full Address
                                    </label>
                                    <textarea
                                        value={profile.address}
                                        onChange={(e) => updateField("address", e.target.value)}
                                        placeholder="House number, street, locality..."
                                        rows={3}
                                        disabled={!editing}
                                        className={`${inputClass} resize-y disabled:cursor-default disabled:bg-slate-50 disabled:text-slate-600`}
                                    />
                                </div>

                                <Field
                                    label="City"
                                    value={profile.city}
                                    onChange={(e) => updateField("city", e.target.value)}
                                    placeholder="Enter city"
                                    disabled={!editing}
                                />

                                <Field
                                    label="State"
                                    value={profile.state}
                                    onChange={(e) => updateField("state", e.target.value)}
                                    placeholder="Enter state"
                                    disabled={!editing}
                                />

                                <Field
                                    label="PIN Code"
                                    value={profile.pinCode}
                                    onChange={(e) => updateField("pinCode", e.target.value)}
                                    placeholder="6-digit PIN code"
                                    disabled={!editing}
                                />
                            </div>
                        </section>

                        {/* Form actions */}
                        {editing && (
                            <div className="flex flex-wrap justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                                >
                                    <X size={16} />
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="inline-flex items-center gap-2 rounded-xl bg-cyan-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-800"
                                >
                                    <Save size={16} />
                                    Save Changes
                                </button>
                            </div>
                        )}
                    </form>
                ) : (
                    <div className="space-y-6">
                        {/* Account status */}
                        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                            <SectionHeading
                                icon={ShieldCheck}
                                title="Account Overview"
                                description="Basic information about your citizen account."
                            />

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <BadgeCheck size={17} />
                                        Account Type
                                    </div>
                                    <p className="mt-2 font-semibold text-slate-900">Citizen</p>
                                </div>

                                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <LockKeyhole size={17} />
                                        Security
                                    </div>
                                    <p className="mt-2 font-semibold text-slate-900">
                                        Password protected
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 sm:col-span-2">
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <Mail size={17} />
                                        Registered Email
                                    </div>
                                    <p className="mt-2 break-all font-medium text-slate-900">
                                        {profile.email || "Email not available"}
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Change password */}
                        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                            <SectionHeading
                                icon={LockKeyhole}
                                title="Change Password"
                                description="Use a strong password to help protect your account."
                            />

                            <form onSubmit={handlePasswordChange} className="space-y-5">
                                {[
                                    {
                                        key: "current",
                                        label: "Current Password",
                                        placeholder: "Enter current password",
                                    },
                                    {
                                        key: "newPassword",
                                        label: "New Password",
                                        placeholder: "Minimum 8 characters",
                                    },
                                    {
                                        key: "confirm",
                                        label: "Confirm New Password",
                                        placeholder: "Re-enter new password",
                                    },
                                ].map((item) => (
                                    <div key={item.key} className="space-y-2">
                                        <label className="block text-sm font-medium text-slate-600">
                                            {item.label}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPasswords ? "text" : "password"}
                                                value={passwords[item.key]}
                                                onChange={(e) =>
                                                    setPasswords((prev) => ({
                                                        ...prev,
                                                        [item.key]: e.target.value,
                                                    }))
                                                }
                                                placeholder={item.placeholder}
                                                autoComplete="off"
                                                className={`${inputClass} pr-12`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswords((prev) => !prev)}
                                                aria-label={
                                                    showPasswords ? "Hide passwords" : "Show passwords"
                                                }
                                                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                            >
                                                {showPasswords ? (
                                                    <EyeOff size={18} />
                                                ) : (
                                                    <Eye size={18} />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                                    Password changes are not yet connected to the backend.
                                    Connect a secure API before using this form in production.
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        className="inline-flex items-center gap-2 rounded-xl bg-cyan-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-800"
                                    >
                                        <LockKeyhole size={16} />
                                        Update Password
                                    </button>
                                </div>
                            </form>
                        </section>
                    </div>
                )}

                {/* Footer note */}
                <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
                    <ShieldCheck className="mt-0.5 shrink-0 text-cyan-700" size={19} />
                    <p className="leading-6">
                        Keep your contact details up to date so you can be reached during
                        emergencies. Only share information you are comfortable providing.
                    </p>
                </div>
            </div>
        </div>
    );
}
