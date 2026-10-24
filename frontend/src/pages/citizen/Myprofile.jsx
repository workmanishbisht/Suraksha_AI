import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import {
    UserRound,
    Mail,
    Phone,
    MapPin,
    ShieldCheck,
    LockKeyhole,
    Camera,
    Pencil,
    X,
    BadgeCheck,
    Save,
    Eye,
    EyeOff,
    LoaderCircle,
    Shield,
    KeyRound,
    CheckCircle2,
    AlertCircle,
    Copy,
} from "lucide-react";
const API_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");
const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});
const inputClass =
    "w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 disabled:cursor-not-allowed disabled:opacity-60";
const cardClass =
    "min-w-0 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl shadow-black/10 sm:p-7";
function Field({
    label,
    value,
    onChange,
    placeholder,
    disabled,
    type = "text",
    autoComplete,
}) {
    return (
        <div className="min-w-0 space-y-2">
            <label className="block text-sm font-medium text-slate-300">
                {label}
            </label>
            <input
                type={type}
                value={value ?? ""}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                autoComplete={autoComplete}
                style={{ colorScheme: "dark" }}
                className={`${inputClass} ${type === "date" ? "[color-scheme:dark]" : ""
                    }`}
            />
        </div>
    );
}
function SectionHeading({ icon: Icon, title, description }) {
    return (
        <div className="mb-6 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
                <Icon size={19} />
            </div>
            <div className="min-w-0">
                <h2 className="font-semibold text-white">{title}</h2>
                <p className="mt-1 text-sm leading-6 text-slate-400">
                    {description}
                </p>
            </div>
        </div>
    );
}
function getErrorMessage(error, fallback) {
    return error?.response?.data?.message || fallback;
}
function formatDateForInput(value) {
    if (!value) return "";
    const dateString = String(value);
    // Keep date-only values unchanged; convert timestamps to the local calendar date.
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

const emptyProfile = {
    name: "",
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
export default function Myprofile() {
    const { updateUser, refreshUser } = useAuth();
    const [profile, setProfile] = useState(emptyProfile);
    const [savedProfile, setSavedProfile] = useState(emptyProfile);
    const [avatar, setAvatar] = useState(null);
    const [savedAvatar, setSavedAvatar] = useState(null);
    const [editing, setEditing] = useState(false);
    const [activeTab, setActiveTab] = useState("profile");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notice, setNotice] = useState("");
    const [noticeType, setNoticeType] = useState("success");
    const [passwords, setPasswords] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [showPasswords, setShowPasswords] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [twoFactorVerifiedAt, setTwoFactorVerifiedAt] = useState(null);
    const [twoFactorLoading, setTwoFactorLoading] = useState(true);
    const [twoFactorActionLoading, setTwoFactorActionLoading] =
        useState(false);
    const [twoFactorSetup, setTwoFactorSetup] = useState(null);
    const [twoFactorOtp, setTwoFactorOtp] = useState("");
    const [twoFactorMode, setTwoFactorMode] = useState("");
    const [twoFactorSecretVisible, setTwoFactorSecretVisible] =
        useState(false);
    const notify = (message, type = "success") => {
        setNotice(message);
        setNoticeType(type);
    };
    const updateField = (field, value) => {
        setProfile((previous) => ({
            ...previous,
            [field]: value,
        }));
    };
    const loadProfile = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/api/profile");
            const user = data.user;
            if (!user) {
                throw new Error("Profile data was not returned.");
            }
            const nextProfile = {
                name: user.name || "",
                email: user.email || "",
                phone: user.phone || "",
                address: user.address || "",
                city: user.location?.name || "",
                state: user.location?.state || "",
                pinCode: user.location?.pinCode || "",
                gender: String(user.gender || "").toLowerCase(),
                dateOfBirth: formatDateForInput(user.dateOfBirth),
                emergencyContact: user.emergencyContact || "",
            };
            setProfile(nextProfile);
            setSavedProfile(nextProfile);
            setAvatar(user.profileImage || null);
            setSavedAvatar(user.profileImage || null);
        } catch (error) {
            notify(
                getErrorMessage(error, "Unable to load your profile."),
                "error"
            );
        } finally {
            setLoading(false);
        }
    }, []);
    const loadTwoFactorStatus = useCallback(async () => {
        setTwoFactorLoading(true);
        try {
            const { data } = await api.get("/api/2fa/status");
            setTwoFactorEnabled(Boolean(data.enabled));
            setTwoFactorVerifiedAt(data.verifiedAt || null);
        } catch (error) {
            notify(
                getErrorMessage(
                    error,
                    "Unable to load two-factor status."
                ),
                "error"
            );
        } finally {
            setTwoFactorLoading(false);
        }
    }, []);
    useEffect(() => {
        loadProfile();
        loadTwoFactorStatus();
    }, [loadProfile, loadTwoFactorStatus]);
    const handleSave = async (event) => {
        event.preventDefault();
        if (!profile.name.trim()) {
            notify("Please enter your full name.", "error");
            return;
        }
        if (!profile.email.trim()) {
            notify("Please enter your email address.", "error");
            return;
        }
        setSaving(true);
        try {
            const payload = {
                name: profile.name.trim(),
                email: profile.email.trim(),
                phone: profile.phone,
                address: profile.address,
                gender: profile.gender.toLowerCase(),
                dateOfBirth: profile.dateOfBirth || null,
                emergencyContact: profile.emergencyContact,
            };
            if (avatar !== savedAvatar) {
                payload.profileImage = avatar || null;
            }
            payload.location = {
                name: profile.city.trim(),
                state: profile.state.trim(),
                pinCode: profile.pinCode.trim(),
                source: "manual",
            };
            const { data } = await api.put("/api/profile", payload);
            let user = data.user;

            // Sync saved profile changes with the global auth state so the
            // header avatar, name, and email update immediately.
            if (user) {
                updateUser(user);
            } else {
                user = await refreshUser();
            }

            if (user) {
                const nextProfile = {
                    name: user.name || "",
                    email: user.email || "",
                    phone: user.phone || "",
                    address: user.address || "",
                    city: user.location?.name || "",
                    state: user.location?.state || "",
                    pinCode: user.location?.pinCode || "",
                    gender: String(user.gender || "").toLowerCase(),
                    dateOfBirth: formatDateForInput(user.dateOfBirth),
                    emergencyContact: user.emergencyContact || "",
                };
                setProfile(nextProfile);
                setSavedProfile(nextProfile);
                setAvatar(user.profileImage || null);
                setSavedAvatar(user.profileImage || null);
            } else {
                await loadProfile();
            }
            setEditing(false);
            notify(data.message || "Profile updated successfully.");
        } catch (error) {
            notify(
                getErrorMessage(error, "Unable to update profile."),
                "error"
            );
        } finally {
            setSaving(false);
        }
    };
    const handleCancel = () => {
        setProfile({ ...savedProfile });
        setAvatar(savedAvatar);
        setEditing(false);
        setNotice("");
    };
    const handleAvatar = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            notify("Only JPG, PNG and WEBP images are allowed.", "error");
            event.target.value = "";
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            notify("Profile image must be 10 MB or smaller.", "error");
            event.target.value = "";
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            setAvatar(reader.result);
            notify("Image selected. Save your profile to upload it.");
        };
        reader.onerror = () => {
            notify("Unable to read the selected image.", "error");
        };
        reader.readAsDataURL(file);
    };
    const handlePasswordChange = async (event) => {
        event.preventDefault();
        const {
            currentPassword,
            newPassword,
            confirmPassword,
        } = passwords;
        if (!currentPassword || !newPassword || !confirmPassword) {
            notify("Please fill in all password fields.", "error");
            return;
        }
        if (newPassword.length < 8) {
            notify(
                "New password must contain at least 8 characters.",
                "error"
            );
            return;
        }
        if (newPassword !== confirmPassword) {
            notify(
                "New password and confirmation do not match.",
                "error"
            );
            return;
        }
        setPasswordLoading(true);
        try {
            const { data } = await api.post(
                "/api/profile/change-password",
                {
                    currentPassword,
                    newPassword,
                    confirmPassword,
                }
            );
            setPasswords({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
            notify(data.message || "Password changed successfully.");
        } catch (error) {
            notify(
                getErrorMessage(error, "Unable to change password."),
                "error"
            );
        } finally {
            setPasswordLoading(false);
        }
    };
    // Start 2FA setup and retrieve the QR code from the backend.
    const handleTwoFactorSetup = async () => {
        setTwoFactorActionLoading(true);
        setTwoFactorSetup(null);
        setTwoFactorOtp("");
        try {
            const { data } = await api.post("/api/2fa/setup");
            setTwoFactorSetup({
                qrCode: data.qrCode || data.qr || data.qrCodeDataUrl || "",
                secret: data.secret || "",
            });
            setTwoFactorMode("setup");
            notify("Scan the QR code with your authenticator app.");
        } catch (error) {
            notify(
                getErrorMessage(error, "Unable to start 2FA setup."),
                "error"
            );
        } finally {
            setTwoFactorActionLoading(false);
        }
    };
    const handleTwoFactorVerify = async (event) => {
        event.preventDefault();
        if (!/^\d{6}$/.test(twoFactorOtp)) {
            notify(
                "Enter the 6-digit code from your authenticator app.",
                "error"
            );
            return;
        }
        setTwoFactorActionLoading(true);
        try {
            const { data } = await api.post("/api/2fa/verify", {
                token: twoFactorOtp,
            });
            setTwoFactorEnabled(true);
            setTwoFactorVerifiedAt(
                data.verifiedAt || new Date().toISOString()
            );
            setTwoFactorSetup(null);
            setTwoFactorOtp("");
            setTwoFactorMode("");
            notify(
                data.message || "Two-factor authentication enabled."
            );
            await loadTwoFactorStatus();
        } catch (error) {
            notify(
                getErrorMessage(
                    error,
                    "The verification code is invalid."
                ),
                "error"
            );
        } finally {
            setTwoFactorActionLoading(false);
        }
    };
    const handleTwoFactorDisable = async (event) => {
        event.preventDefault();
        if (!/^\d{6}$/.test(twoFactorOtp)) {
            notify(
                "Enter your current 6-digit authenticator code.",
                "error"
            );
            return;
        }
        setTwoFactorActionLoading(true);
        try {
            const { data } = await api.post("/api/2fa/disable", {
                token: twoFactorOtp,
            });
            setTwoFactorEnabled(false);
            setTwoFactorVerifiedAt(null);
            setTwoFactorOtp("");
            setTwoFactorMode("");
            setTwoFactorSetup(null);
            notify(
                data.message || "Two-factor authentication disabled."
            );
            await loadTwoFactorStatus();
        } catch (error) {
            notify(
                getErrorMessage(
                    error,
                    "Unable to disable 2FA. Check your code."
                ),
                "error"
            );
        } finally {
            setTwoFactorActionLoading(false);
        }
    };
    const cancelTwoFactorAction = () => {
        setTwoFactorSetup(null);
        setTwoFactorOtp("");
        setTwoFactorMode("");
        setTwoFactorSecretVisible(false);
        setNotice("");
    };
    const copySecret = async () => {
        if (!twoFactorSetup?.secret) return;
        try {
            await navigator.clipboard.writeText(twoFactorSetup.secret);
            notify("Setup key copied.");
        } catch {
            notify("Unable to copy the setup key.", "error");
        }
    };
    const displayName = profile.name.trim() || "Citizen User";
    const initials = displayName
        .split(/\s+/)
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
    return (
        <div className="w-full min-w-0 space-y-5 text-slate-100">
            {/* Page heading */}
            <div className="flex min-w-0 flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="min-w-0">
                    <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-500">
                        <span>Citizen Portal</span>
                        <span>/</span>
                        <span className="text-cyan-400">My Profile</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                        My Profile
                    </h1>
                    <p className="mt-2 text-sm text-slate-400">
                        Manage your personal information and account security.
                    </p>
                </div>
                {activeTab === "profile" && (
                    <div className="flex flex-wrap items-center gap-2">
                        {editing ? (
                            <>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    disabled={saving}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
                                >
                                    <X size={16} />
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    form="citizen-profile-form"
                                    disabled={saving}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {saving ? (
                                        <LoaderCircle
                                            size={16}
                                            className="animate-spin"
                                        />
                                    ) : (
                                        <Save size={16} />
                                    )}
                                    {saving ? "Saving..." : "Save Changes"}
                                </button>
                            </>
                        ) : (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditing(true);
                                    setNotice("");
                                }}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-5 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/20"
                            >
                                <Pencil size={16} />
                                Edit Profile
                            </button>
                        )}
                    </div>
                )}
            </div>
            {/* Notifications */}
            {notice && (
                <div
                    role="status"
                    className={`flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${noticeType === "error"
                            ? "border-rose-500/20 bg-rose-500/10 text-rose-300"
                            : "border-cyan-500/20 bg-cyan-500/10 text-cyan-200"
                        }`}
                >
                    <span className="flex min-w-0 items-start gap-2">
                        {noticeType === "error" ? (
                            <AlertCircle
                                size={17}
                                className="mt-0.5 shrink-0"
                            />
                        ) : (
                            <CheckCircle2
                                size={17}
                                className="mt-0.5 shrink-0"
                            />
                        )}
                        <span>{notice}</span>
                    </span>
                    <button
                        type="button"
                        onClick={() => setNotice("")}
                        aria-label="Dismiss message"
                        className="shrink-0 rounded-lg p-1 hover:bg-white/5"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}
            {/* Profile banner */}
            <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl shadow-black/10">
                <div className="relative h-28 bg-gradient-to-r from-[#101a30] via-[#063c54] to-[#087e98] sm:h-36">
                    <div className="flex h-full items-start justify-end p-5">
                        <span className="inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-slate-950/30 px-3 py-1.5 text-xs font-medium text-cyan-100 backdrop-blur-sm">
                            <ShieldCheck size={15} />
                            Citizen Account
                        </span>
                    </div>
                </div>
                <div className="px-5 pb-6 sm:px-8">
                    <div className="-mt-12 flex min-w-0 flex-col gap-5 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
                        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end">
                            <div className="group relative h-24 w-24 shrink-0 sm:h-28 sm:w-28">
                                <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border-4 border-slate-900 bg-cyan-500/15 text-2xl font-bold text-cyan-300 shadow-lg sm:text-3xl">
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
                                    className={`absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-xl border-2 border-slate-900 text-white shadow transition ${editing && !saving ? "cursor-pointer bg-cyan-600 hover:bg-cyan-500" : "cursor-not-allowed bg-slate-700 opacity-60"}`}
                                >
                                    <Camera size={16} />
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        disabled={!editing || saving}
                                        onChange={handleAvatar}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                            <div className="min-w-0 pb-1">
                                <h2 className="break-words text-xl font-bold text-white sm:text-2xl">
                                    {displayName}
                                </h2>
                                <p className="mt-1 break-all text-sm text-slate-400">
                                    {profile.email || "Add your email address"}
                                </p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                                        <BadgeCheck size={14} />
                                        Citizen
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
                                        <ShieldCheck size={14} />
                                        Account holder
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="pb-1 text-sm text-slate-400">
                            <span className="inline-flex items-center gap-2">
                                <UserRound
                                    size={16}
                                    className="text-cyan-400"
                                />
                                SurakshaAI Citizen Portal
                            </span>
                        </div>
                    </div>
                </div>
            </section>
            {/* Tabs */}
            <div className="flex min-w-0 gap-2 overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/80 p-2">
                <button
                    type="button"
                    onClick={() => {
                        setActiveTab("profile");
                        setNotice("");
                    }}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition ${activeTab === "profile"
                            ? "border border-cyan-500/20 bg-cyan-500/10 text-cyan-300"
                            : "text-slate-400 hover:bg-slate-800 hover:text-white"
                        }`}
                >
                    <UserRound size={17} />
                    Personal Information
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setActiveTab("security");
                        setEditing(false);
                        setProfile({ ...savedProfile });
                        setAvatar(savedAvatar);
                        setNotice("");
                    }}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition ${activeTab === "security"
                            ? "border border-cyan-500/20 bg-cyan-500/10 text-cyan-300"
                            : "text-slate-400 hover:bg-slate-800 hover:text-white"
                        }`}
                >
                    <LockKeyhole size={17} />
                    Account Security
                </button>
            </div>
            {/* Profile content */}
            {loading ? (
                <div
                    className={`${cardClass} flex min-h-48 items-center justify-center gap-3 text-slate-400`}
                >
                    <LoaderCircle
                        className="animate-spin text-cyan-400"
                        size={22}
                    />
                    Loading profile...
                </div>
            ) : activeTab === "profile" ? (
                <form
                    id="citizen-profile-form"
                    onSubmit={handleSave}
                    className="min-w-0 space-y-5"
                >
                    {/* Personal Information */}
                    <section className={cardClass}>
                        <SectionHeading
                            icon={UserRound}
                            title="Personal Information"
                            description="Your basic identity and contact details."
                        />
                        <div className="grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2">
                            <Field
                                label="Full Name"
                                value={profile.name}
                                onChange={(e) =>
                                    updateField("name", e.target.value)
                                }
                                placeholder="Enter your full name"
                                disabled={!editing || saving}
                            />
                            <Field
                                label="Email Address"
                                value={profile.email}
                                onChange={(e) =>
                                    updateField("email", e.target.value)
                                }
                                placeholder="you@example.com"
                                type="email"
                                disabled={!editing || saving}
                            />
                            <Field
                                label="Phone Number"
                                value={profile.phone}
                                onChange={(e) =>
                                    updateField("phone", e.target.value)
                                }
                                placeholder="Enter phone number"
                                type="tel"
                                disabled={!editing || saving}
                            />
                            <Field
                                label="Date of Birth"
                                value={profile.dateOfBirth}
                                onChange={(e) =>
                                    updateField("dateOfBirth", e.target.value)
                                }
                                type="date"
                                disabled={!editing || saving}
                            />
                            <div className="min-w-0 space-y-2">
                                <label className="block text-sm font-medium text-slate-300">
                                    Gender
                                </label>
                                <select
                                    value={profile.gender}
                                    onChange={(e) =>
                                        updateField("gender", e.target.value)
                                    }
                                    disabled={!editing || saving}
                                    className={inputClass}
                                    style={{ colorScheme: "dark" }}
                                >
                                    <option value="">Select gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <Field
                                label="Emergency Contact"
                                value={profile.emergencyContact}
                                onChange={(e) =>
                                    updateField(
                                        "emergencyContact",
                                        e.target.value
                                    )
                                }
                                placeholder="Emergency contact number"
                                type="tel"
                                disabled={!editing || saving}
                            />
                        </div>
                    </section>
                    {/* Address Information */}
                    <section className={cardClass}>
                        <SectionHeading
                            icon={MapPin}
                            title="Address Information"
                            description="Your location can help emergency teams identify your area."
                        />
                        <div className="grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2">
                            <div className="min-w-0 space-y-2 sm:col-span-2">
                                <label className="block text-sm font-medium text-slate-300">
                                    Full Address
                                </label>
                                <textarea
                                    value={profile.address}
                                    onChange={(e) =>
                                        updateField("address", e.target.value)
                                    }
                                    placeholder="House number, street, locality..."
                                    rows={3}
                                    disabled={!editing || saving}
                                    className={`${inputClass} resize-y`}
                                    style={{
                                        colorScheme: "dark",
                                        backgroundColor: "#0f172a",
                                        color: "#f1f5f9",
                                    }}
                                />
                            </div>
                            <Field
                                label="City"
                                value={profile.city}
                                onChange={(e) =>
                                    updateField("city", e.target.value)
                                }
                                placeholder="Enter city"
                                disabled={!editing || saving}
                            />
                            <Field
                                label="State"
                                value={profile.state}
                                onChange={(e) =>
                                    updateField("state", e.target.value)
                                }
                                placeholder="Enter state"
                                disabled={!editing || saving}
                            />
                            <Field
                                label="PIN Code"
                                value={profile.pinCode}
                                onChange={(e) =>
                                    updateField("pinCode", e.target.value)
                                }
                                placeholder="6-digit PIN code"
                                disabled={!editing || saving}
                            />
                        </div>
                    </section>
                    {/* Form Actions */}
                    {editing && (
                        <div className="flex flex-wrap justify-end gap-3">
                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={saving}
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <X size={16} />
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {saving ? (
                                    <LoaderCircle
                                        size={16}
                                        className="animate-spin"
                                    />
                                ) : (
                                    <Save size={16} />
                                )}
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    )}
                </form>
            ) : (
                <div className="min-w-0 space-y-5">
                    {/* Account Security */}
                {/* Account Overview */}
                <section className={cardClass}>
                    <SectionHeading
                        icon={ShieldCheck}
                        title="Account Overview"
                        description="Manage your account security settings."
                    />
                    <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                <BadgeCheck size={17} className="text-cyan-400" />
                                Account Type
                            </div>
                            <p className="mt-2 font-semibold text-white">
                                Citizen
                            </p>
                        </div>
                        <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                <LockKeyhole size={17} className="text-cyan-400" />
                                Two-Factor Authentication
                            </div>
                            <p
                                className={`mt-2 font-semibold ${twoFactorEnabled
                                        ? "text-emerald-300"
                                        : "text-amber-300"
                                    }`}
                            >
                                {twoFactorLoading
                                    ? "Checking status..."
                                    : twoFactorEnabled
                                        ? "Enabled"
                                        : "Not enabled"}
                            </p>
                        </div>
                        <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 sm:col-span-2">
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                <Mail size={17} className="text-cyan-400" />
                                Registered Email
                            </div>
                            <p className="mt-2 break-all font-medium text-white">
                                {profile.email || "Email not available"}
                            </p>
                        </div>
                    </div>
                </section>
                {/* Two-Factor Authentication */}
                <section className={cardClass}>
                    <SectionHeading
                        icon={Shield}
                        title="Two-Factor Authentication"
                        description="Use an authenticator app to add another layer of security to your account."
                    />
                    <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 sm:p-5">
                        <div className="flex min-w-0 flex-col justify-between gap-4 sm:flex-row sm:items-center">
                            <div className="flex min-w-0 items-start gap-3">
                                <div
                                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${twoFactorEnabled
                                            ? "bg-emerald-500/10 text-emerald-300"
                                            : "bg-cyan-500/10 text-cyan-300"
                                        }`}
                                >
                                    <ShieldCheck size={22} />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-semibold text-white">
                                        Authenticator app
                                    </h3>
                                    <p className="mt-1 text-sm text-slate-400">
                                        {twoFactorEnabled
                                            ? "Your account requires a time-based code during login."
                                            : "Set up an authenticator app to protect your account."}
                                    </p>
                                    {twoFactorEnabled &&
                                        twoFactorVerifiedAt && (
                                            <p className="mt-2 text-xs text-slate-500">
                                                Verified:{" "}
                                                {new Date(
                                                    twoFactorVerifiedAt
                                                ).toLocaleString()}
                                            </p>
                                        )}
                                </div>
                            </div>
                            {!twoFactorLoading && !twoFactorMode && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (twoFactorEnabled) {
                                            setTwoFactorMode("disable");
                                            setTwoFactorOtp("");
                                        } else {
                                            handleTwoFactorSetup();
                                        }
                                    }}
                                    disabled={twoFactorActionLoading}
                                    className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition disabled:opacity-60 ${twoFactorEnabled
                                            ? "border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
                                            : "bg-cyan-600 text-white hover:bg-cyan-500"
                                        }`}
                                >
                                    {twoFactorActionLoading ? (
                                        <LoaderCircle
                                            size={16}
                                            className="animate-spin"
                                        />
                                    ) : (
                                        <KeyRound size={16} />
                                    )}
                                    {twoFactorEnabled
                                        ? "Disable 2FA"
                                        : "Set Up 2FA"}
                                </button>
                            )}
                        </div>
                        {/* QR setup */}
                        {twoFactorMode === "setup" && twoFactorSetup && (
                            <div className="mt-5 space-y-5 border-t border-slate-800 pt-5">
                                <div>
                                    <h4 className="font-semibold text-white">
                                        1. Scan the QR code
                                    </h4>
                                    <p className="mt-1 text-sm leading-6 text-slate-400">
                                        Open Google Authenticator or another
                                        compatible app and scan this QR code.
                                    </p>
                                </div>
                                {twoFactorSetup.qrCode ? (
                                    <div className="flex justify-center rounded-xl border border-slate-700 bg-white p-4">
                                        <img
                                            src={twoFactorSetup.qrCode}
                                            alt="Two-factor authentication QR code"
                                            className="h-52 w-52 object-contain"
                                        />
                                    </div>
                                ) : (
                                    <p className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-200">
                                        The backend did not return a QR code.
                                        Check the QR field name in your setup
                                        API response.
                                    </p>
                                )}
                                {twoFactorSetup.secret && (
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-slate-300">
                                            Manual setup key
                                        </label>
                                        <div className="flex min-w-0 gap-2">
                                            <input
                                                readOnly
                                                type={
                                                    twoFactorSecretVisible
                                                        ? "text"
                                                        : "password"
                                                }
                                                value={twoFactorSetup.secret}
                                                className={`${inputClass} min-w-0`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setTwoFactorSecretVisible(
                                                        (value) => !value
                                                    )
                                                }
                                                className="shrink-0 rounded-xl border border-slate-700 p-3 text-slate-300 hover:bg-slate-800"
                                                aria-label="Toggle setup key visibility"
                                            >
                                                {twoFactorSecretVisible ? (
                                                    <EyeOff size={17} />
                                                ) : (
                                                    <Eye size={17} />
                                                )}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={copySecret}
                                                className="shrink-0 rounded-xl border border-slate-700 p-3 text-slate-300 hover:bg-slate-800"
                                                aria-label="Copy setup key"
                                            >
                                                <Copy size={17} />
                                            </button>
                                        </div>
                                        <p className="mt-2 text-xs leading-5 text-amber-300">
                                            Keep this key private. Do not share
                                            it with anyone.
                                        </p>
                                    </div>
                                )}
                                <form
                                    onSubmit={handleTwoFactorVerify}
                                    className="space-y-3"
                                >
                                    <h4 className="font-semibold text-white">
                                        2. Verify your code
                                    </h4>
                                    <label className="block text-sm text-slate-300">
                                        Six-digit authenticator code
                                    </label>
                                    <input
                                        inputMode="numeric"
                                        autoComplete="one-time-code"
                                        maxLength={6}
                                        value={twoFactorOtp}
                                        onChange={(event) =>
                                            setTwoFactorOtp(
                                                event.target.value
                                                    .replace(/\D/g, "")
                                                    .slice(0, 6)
                                            )
                                        }
                                        placeholder="000000"
                                        className={`${inputClass} max-w-xs tracking-[0.35em]`}
                                    />
                                    <div className="flex flex-wrap gap-3 pt-2">
                                        <button
                                            type="submit"
                                            disabled={
                                                twoFactorActionLoading ||
                                                twoFactorOtp.length !== 6
                                            }
                                            className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-500 disabled:opacity-50"
                                        >
                                            {twoFactorActionLoading ? (
                                                <LoaderCircle
                                                    size={16}
                                                    className="animate-spin"
                                                />
                                            ) : (
                                                <CheckCircle2 size={16} />
                                            )}
                                            Verify &amp; Enable
                                        </button>
                                        <button
                                            type="button"
                                            onClick={cancelTwoFactorAction}
                                            className="rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-800"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                        {/* Disable 2FA */}
                        {twoFactorMode === "disable" && (
                            <form
                                onSubmit={handleTwoFactorDisable}
                                className="mt-5 space-y-4 border-t border-slate-800 pt-5"
                            >
                                <div>
                                    <h4 className="font-semibold text-white">
                                        Confirm disabling 2FA
                                    </h4>
                                    <p className="mt-1 text-sm leading-6 text-slate-400">
                                        Enter the current six-digit code from
                                        your authenticator app to confirm.
                                    </p>
                                </div>
                                <input
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    maxLength={6}
                                    value={twoFactorOtp}
                                    onChange={(event) =>
                                        setTwoFactorOtp(
                                            event.target.value
                                                .replace(/\D/g, "")
                                                .slice(0, 6)
                                        )
                                    }
                                    placeholder="000000"
                                    className={`${inputClass} max-w-xs tracking-[0.35em]`}
                                />
                                <div className="flex flex-wrap gap-3">
                                    <button
                                        type="submit"
                                        disabled={
                                            twoFactorActionLoading ||
                                            twoFactorOtp.length !== 6
                                        }
                                        className="rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white hover:bg-rose-500 disabled:opacity-50"
                                    >
                                        {twoFactorActionLoading
                                            ? "Please wait..."
                                            : "Confirm & Disable"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={cancelTwoFactorAction}
                                        className="rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-800"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                        <div className="mt-5 flex items-start gap-2 rounded-xl border border-cyan-500/15 bg-cyan-500/5 p-3 text-xs leading-5 text-slate-400">
                            <ShieldCheck
                                size={16}
                                className="mt-0.5 shrink-0 text-cyan-400"
                            />
                            <p>
                                Never share your authentication code or setup
                                key. You will need access to your authenticator
                                when logging in with 2FA enabled.
                            </p>
                        </div>
                    </div>
                </section>
                {/* Change Password */}
                <section className={cardClass}>
                    <SectionHeading
                        icon={LockKeyhole}
                        title="Change Password"
                        description="Use a strong password to help protect your account."
                    />
                    <form
                        onSubmit={handlePasswordChange}
                        className="space-y-5"
                    >
                        {[
                            {
                                key: "currentPassword",
                                label: "Current Password",
                                placeholder: "Enter current password",
                            },
                            {
                                key: "newPassword",
                                label: "New Password",
                                placeholder: "Minimum 8 characters",
                            },
                            {
                                key: "confirmPassword",
                                label: "Confirm New Password",
                                placeholder: "Re-enter new password",
                            },
                        ].map((item) => (
                            <div
                                key={item.key}
                                className="min-w-0 space-y-2"
                            >
                                <label className="block text-sm font-medium text-slate-300">
                                    {item.label}
                                </label>
                                <div className="relative">
                                    <input
                                        type={
                                            showPasswords
                                                ? "text"
                                                : "password"
                                        }
                                        value={passwords[item.key]}
                                        onChange={(event) =>
                                            setPasswords((previous) => ({
                                                ...previous,
                                                [item.key]:
                                                    event.target.value,
                                            }))
                                        }
                                        placeholder={item.placeholder}
                                        autoComplete="off"
                                        className={`${inputClass} pr-12`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPasswords(
                                                (previous) => !previous
                                            )
                                        }
                                        aria-label={
                                            showPasswords
                                                ? "Hide passwords"
                                                : "Show passwords"
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
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
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={passwordLoading}
                                className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:opacity-60"
                            >
                                {passwordLoading ? (
                                    <LoaderCircle
                                        size={16}
                                        className="animate-spin"
                                    />
                                ) : (
                                    <LockKeyhole size={16} />
                                )}
                                {passwordLoading
                                    ? "Updating..."
                                    : "Update Password"}
                            </button>
                        </div>
                    </form>
                </section>
            </div>
            )}
            {/* Footer */}
            <div className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-400">
                <ShieldCheck
                    className="mt-0.5 shrink-0 text-cyan-400"
                    size={19}
                />
                <p className="leading-6">
                    Keep your contact details up to date so emergency teams can
                    reach you when needed. Only share information you are
                    comfortable providing.
                </p>
            </div>
        </div>
    );
}