import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
    Activity,
    ArrowRight,
    Building2,
    CalendarDays,
    Camera,
    Check,
    CheckCircle2,
    Clock3,
    Copy,
    Edit3,
    ImagePlus,
    KeyRound,
    Mail,
    MapPin,
    QrCode,
    Shield,
    ShieldCheck,
    Smartphone,
    Trash2,
    Upload,
    UserRound,
    X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL = "http://localhost:5000/api";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
];

function Profile() {
    const { user, updateUser } = useAuth();

    const fileInputRef = useRef(null);

    const [profile, setProfile] = useState(user || null);
    const [loading, setLoading] = useState(true);

    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    const [nameInput, setNameInput] = useState("");
    const [selectedImage, setSelectedImage] = useState(null);
    const [imageUploading, setImageUploading] = useState(false);

    const [passwordOpen, setPasswordOpen] = useState(false);
    const [passwordSaving, setPasswordSaving] = useState(false);

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    /* =========================================
       2FA STATE
    ========================================= */

    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [twoFactorLoading, setTwoFactorLoading] = useState(true);

    const [twoFactorModal, setTwoFactorModal] = useState(false);
    const [twoFactorMode, setTwoFactorMode] = useState("setup");

    const [twoFactorSetupLoading, setTwoFactorSetupLoading] =
        useState(false);

    const [twoFactorVerifyLoading, setTwoFactorVerifyLoading] =
        useState(false);

    const [twoFactorDisableLoading, setTwoFactorDisableLoading] =
        useState(false);

    const [twoFactorQrCode, setTwoFactorQrCode] = useState("");
    const [twoFactorSecret, setTwoFactorSecret] = useState("");
    const [twoFactorToken, setTwoFactorToken] = useState("");

    /* =========================================
       FETCH DATA
    ========================================= */

    useEffect(() => {
        fetchProfile();
        fetchTwoFactorStatus();
    }, []);

    useEffect(() => {
        if (user) {
            setProfile((currentProfile) => ({
                ...(currentProfile || {}),
                ...user,
            }));

            setNameInput(user.name || "");
        }
    }, [user]);

    const fetchProfile = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/profile`, {
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to load profile."
                );
            }

            setProfile(data.user);
            setNameInput(data.user?.name || "");

            /*
             * Important:
             * Keep AuthContext user synchronized with
             * the latest backend profile.
             */
            updateUser(data.user);
        } catch (error) {
            console.error("Profile Fetch Error:", error);

            if (user) {
                setProfile(user);
                setNameInput(user.name || "");
            } else {
                toast.error(
                    error.message || "Failed to load profile."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchTwoFactorStatus = async () => {
        try {
            setTwoFactorLoading(true);

            const response = await fetch(
                `${API_BASE_URL}/2fa/status`,
                {
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to fetch 2FA status."
                );
            }

            setTwoFactorEnabled(Boolean(data.enabled));
        } catch (error) {
            console.error("2FA Status Error:", error);
        } finally {
            setTwoFactorLoading(false);
        }
    };

    /* =========================================
       PROFILE VALUES
    ========================================= */

    const name =
        profile?.name ||
        user?.name ||
        "SurakshaAI Administrator";

    const email =
        profile?.email ||
        user?.email ||
        "admin@surakshaai.com";

    const username =
        profile?.username ||
        user?.username ||
        "surakshaai_admin";

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
        ? new Date(
            profile.createdAt
        ).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        })
        : "Account Active";

    /* =========================================
       EDIT PROFILE
    ========================================= */

    const startEditing = () => {
        setNameInput(name);
        setSelectedImage(null);
        setEditing(true);
    };

    const cancelEditing = () => {
        setNameInput(name);
        setSelectedImage(null);
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

            const body = {
                name: trimmedName,
            };

            if (selectedImage !== null) {
                body.profileImage = selectedImage;
            }

            const response = await fetch(
                `${API_BASE_URL}/profile`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify(body),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to update profile."
                );
            }

            setProfile(data.user);
            setNameInput(
                data.user?.name || trimmedName
            );
            setSelectedImage(null);
            setEditing(false);

            /*
             * Important:
             * Update global AuthContext.
             * Header.jsx will immediately receive
             * the new name/profileImage.
             */
            updateUser(data.user);

            toast.success(
                "Profile updated successfully."
            );
        } catch (error) {
            console.error(
                "Profile Update Error:",
                error
            );

            toast.error(
                error.message ||
                "Failed to update profile."
            );
        } finally {
            setSaving(false);
        }
    };

    /* =========================================
       IMAGE UPLOAD
    ========================================= */

    const handleImageSelect = (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            toast.error(
                "Only JPG, PNG and WEBP images are allowed."
            );

            event.target.value = "";
            return;
        }

        if (file.size > MAX_IMAGE_SIZE) {
            toast.error(
                "Profile image must be 10 MB or smaller."
            );

            event.target.value = "";
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            setSelectedImage(reader.result);
            setEditing(true);

            toast.success(
                "Profile image selected."
            );
        };

        reader.onerror = () => {
            toast.error(
                "Failed to read profile image."
            );
        };

        reader.readAsDataURL(file);

        event.target.value = "";
    };

    const removeProfileImage = async () => {
        if (!profile?.profileImage && !selectedImage) {
            return;
        }

        if (selectedImage) {
            setSelectedImage(null);

            toast.success(
                "Selected image removed."
            );

            return;
        }

        try {
            setImageUploading(true);

            const response = await fetch(
                `${API_BASE_URL}/profile`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        profileImage: null,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to remove profile image."
                );
            }

            setProfile(data.user);

            /*
             * Important:
             * Remove image from Header immediately.
             */
            updateUser(data.user);

            toast.success(
                "Profile image removed."
            );
        } catch (error) {
            console.error(
                "Remove Profile Image Error:",
                error
            );

            toast.error(
                error.message ||
                "Failed to remove profile image."
            );
        } finally {
            setImageUploading(false);
        }
    };

    const displayedImage =
        selectedImage ||
        profile?.profileImage ||
        null;

    /* =========================================
       PASSWORD
    ========================================= */

    const updatePasswordField = (
        field,
        value
    ) => {
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
            toast.error(
                "Please fill all password fields."
            );

            return;
        }

        if (
            passwordForm.newPassword.length < 6
        ) {
            toast.error(
                "New password must be at least 6 characters."
            );

            return;
        }

        if (
            passwordForm.newPassword !==
            passwordForm.confirmPassword
        ) {
            toast.error(
                "New passwords do not match."
            );

            return;
        }

        try {
            setPasswordSaving(true);

            const response = await fetch(
                `${API_BASE_URL}/profile/change-password`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify(
                        passwordForm
                    ),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to change password."
                );
            }

            toast.success(
                "Password changed successfully."
            );

            closePasswordModal();
        } catch (error) {
            console.error(
                "Change Password Error:",
                error
            );

            toast.error(
                error.message ||
                "Failed to change password."
            );
        } finally {
            setPasswordSaving(false);
        }
    };

    /* =========================================
       2FA - OPEN SETUP
    ========================================= */

    const openTwoFactorSetup = async () => {
        if (twoFactorEnabled) {
            setTwoFactorMode("disable");
            setTwoFactorToken("");
            setTwoFactorModal(true);
            return;
        }

        try {
            setTwoFactorSetupLoading(true);

            const response = await fetch(
                `${API_BASE_URL}/2fa/setup`,
                {
                    method: "POST",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to start 2FA setup."
                );
            }

            setTwoFactorQrCode(
                data.qrCode || ""
            );

            setTwoFactorSecret(
                data.secret || ""
            );

            setTwoFactorToken("");
            setTwoFactorMode("setup");
            setTwoFactorModal(true);
        } catch (error) {
            console.error(
                "2FA Setup Error:",
                error
            );

            toast.error(
                error.message ||
                "Failed to start 2FA setup."
            );
        } finally {
            setTwoFactorSetupLoading(false);
        }
    };

    /* =========================================
       2FA - VERIFY SETUP
    ========================================= */

    const verifyTwoFactorSetup = async (
        event
    ) => {
        event.preventDefault();

        if (
            !/^\d{6}$/.test(twoFactorToken)
        ) {
            toast.error(
                "Enter a valid 6-digit authenticator code."
            );

            return;
        }

        try {
            setTwoFactorVerifyLoading(true);

            const response = await fetch(
                `${API_BASE_URL}/2fa/verify`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        token: twoFactorToken,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Invalid authentication code."
                );
            }

            setTwoFactorEnabled(true);
            setTwoFactorModal(false);
            setTwoFactorToken("");
            setTwoFactorQrCode("");
            setTwoFactorSecret("");

            toast.success(
                "Two-factor authentication enabled."
            );
        } catch (error) {
            console.error(
                "2FA Verify Error:",
                error
            );

            toast.error(
                error.message ||
                "Invalid authentication code."
            );
        } finally {
            setTwoFactorVerifyLoading(false);
        }
    };

    /* =========================================
       2FA - DISABLE
    ========================================= */

    const disableTwoFactor = async (
        event
    ) => {
        event.preventDefault();

        if (
            !/^\d{6}$/.test(twoFactorToken)
        ) {
            toast.error(
                "Enter your current 6-digit authenticator code."
            );

            return;
        }

        try {
            setTwoFactorDisableLoading(true);

            const response = await fetch(
                `${API_BASE_URL}/2fa/disable`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        token: twoFactorToken,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to disable 2FA."
                );
            }

            setTwoFactorEnabled(false);
            setTwoFactorModal(false);
            setTwoFactorToken("");

            toast.success(
                "Two-factor authentication disabled."
            );
        } catch (error) {
            console.error(
                "2FA Disable Error:",
                error
            );

            toast.error(
                error.message ||
                "Failed to disable 2FA."
            );
        } finally {
            setTwoFactorDisableLoading(false);
        }
    };

    const closeTwoFactorModal = () => {
        if (
            twoFactorVerifyLoading ||
            twoFactorDisableLoading ||
            twoFactorSetupLoading
        ) {
            return;
        }

        setTwoFactorModal(false);
        setTwoFactorToken("");
        setTwoFactorQrCode("");
        setTwoFactorSecret("");
    };

    const copyTwoFactorSecret = async () => {
        if (!twoFactorSecret) return;

        try {
            await navigator.clipboard.writeText(
                twoFactorSecret
            );

            toast.success(
                "Secret key copied."
            );
        } catch {
            toast.error(
                "Unable to copy secret key."
            );
        }
    };

    /* =========================================
       LOADING
    ========================================= */

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

    /* =========================================
       UI
    ========================================= */

    return (
        <>
            <div className="space-y-5">

                {/* Breadcrumb */}

                <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500">
                        Settings
                    </span>

                    <span className="text-slate-700">
                        /
                    </span>

                    <span className="text-blue-400">
                        Profile
                    </span>
                </div>

                {/* Header */}

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
                            onClick={
                                editing
                                    ? saveProfile
                                    : startEditing
                            }
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

                {/* Profile Hero */}

                <section className="overflow-hidden rounded-[7px] border border-[#1d3146] bg-[#0b1522]">
                    <div className="h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600" />

                    <div className="relative p-5 sm:p-6">
                        <div className="pointer-events-none absolute right-0 top-0 h-44 w-44 rounded-full bg-blue-600/10 blur-3xl" />

                        <div className="relative flex flex-col gap-5 md:flex-row md:items-center">

                            {/* Profile Image */}

                            <div className="relative shrink-0">
                                <div className="group relative h-24 w-24">
                                    {displayedImage ? (
                                        <img
                                            src={displayedImage}
                                            alt={name}
                                            className="h-24 w-24 rounded-[18px] border border-blue-400/40 object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-24 w-24 items-center justify-center rounded-[18px] border border-blue-400/40 bg-gradient-to-br from-blue-600 to-indigo-700 text-2xl font-semibold text-white">
                                            {initials}
                                        </div>
                                    )}

                                    {editing && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                fileInputRef.current?.click()
                                            }
                                            className="absolute inset-0 flex items-center justify-center rounded-[18px] bg-black/60 opacity-0 transition group-hover:opacity-100"
                                        >
                                            <Camera
                                                size={22}
                                                className="text-white"
                                            />
                                        </button>
                                    )}
                                </div>

                                <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-4 border-[#0b1522] bg-emerald-400">
                                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                                </span>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={
                                        handleImageSelect
                                    }
                                    className="hidden"
                                />
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

                                    {twoFactorEnabled && (
                                        <ProfileTag
                                            icon={ShieldCheck}
                                            text="2FA Enabled"
                                        />
                                    )}
                                </div>

                                {/* Image Controls */}

                                {editing && (
                                    <div className="mt-4 flex flex-wrap items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                fileInputRef.current?.click()
                                            }
                                            className="inline-flex h-8 items-center gap-1.5 rounded-[4px] border border-blue-500/40 bg-blue-500/5 px-3 text-[10px] font-medium text-blue-300 transition hover:bg-blue-500/10"
                                        >
                                            <Upload size={12} />
                                            Change Photo
                                        </button>

                                        {displayedImage && (
                                            <button
                                                type="button"
                                                onClick={
                                                    removeProfileImage
                                                }
                                                disabled={saving || imageUploading}
                                                className="inline-flex h-8 items-center gap-1.5 rounded-[4px] border border-red-500/30 bg-red-500/5 px-3 text-[10px] font-medium text-red-300 transition hover:bg-red-500/10 disabled:opacity-50"
                                            >
                                                <Trash2 size={12} />
                                                Remove
                                            </button>
                                        )}

                                        <span className="text-[9px] text-slate-600">
                                            JPG, PNG or WEBP • Max 10 MB
                                        </span>

                                        {imageUploading && (
                                            <span className="inline-flex items-center gap-1.5 text-[9px] text-blue-300">
                                                <span className="h-3 w-3 animate-spin rounded-full border border-blue-400/30 border-t-blue-400" />
                                                Updating photo...
                                            </span>
                                        )}
                                    </div>
                                )}

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

                {/* Main Grid */}

                <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,.8fr)]">

                    <div className="space-y-5">

                        {/* Account Information */}

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

                        {/* Organization */}

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

                        {/* Security */}

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
                                    onClick={() =>
                                        setPasswordOpen(true)
                                    }
                                />

                                <SecurityRow
                                    icon={Smartphone}
                                    title="Two-Factor Authentication"
                                    description={
                                        twoFactorEnabled
                                            ? "Your account is protected with authenticator-based 2FA."
                                            : "Add an additional security layer."
                                    }
                                    badge={
                                        twoFactorLoading
                                            ? "Checking..."
                                            : twoFactorEnabled
                                                ? "Enabled"
                                                : "Not Enabled"
                                    }
                                    enabled={
                                        twoFactorEnabled
                                    }
                                    action={
                                        twoFactorEnabled
                                            ? "Disable"
                                            : "Enable"
                                    }
                                    onClick={
                                        openTwoFactorSetup
                                    }
                                    loading={
                                        twoFactorSetupLoading
                                    }
                                    compact
                                />

                                <SecurityRow
                                    icon={ShieldCheck}
                                    title="Active Sessions"
                                    description="Current browser session is protected."
                                    badge="Current"
                                    action="Protected"
                                    onClick={() =>
                                        toast.info(
                                            "You are currently logged in on this browser."
                                        )
                                    }
                                />
                            </div>
                        </ProfileSection>

                        {/* Recent Activity */}

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
                                    title="Security settings"
                                    description={
                                        twoFactorEnabled
                                            ? "Two-factor authentication is enabled."
                                            : "Two-factor authentication is not enabled."
                                    }
                                    time="Current"
                                    icon={Smartphone}
                                />

                                <ActivityItem
                                    color="bg-blue-500"
                                    title="Profile available"
                                    description="Administrator profile loaded successfully."
                                    time="Current"
                                    icon={UserRound}
                                />
                            </div>
                        </ProfileSection>
                    </div>
                </div>

                {/* Security Notice */}

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
                            Keep your account credentials private.
                            Enable two-factor authentication for additional
                            protection.
                        </p>
                    </div>
                </div>
            </div>

            {/* Password Modal */}

            {passwordOpen && (
                <PasswordModal
                    form={passwordForm}
                    saving={passwordSaving}
                    onChange={updatePasswordField}
                    onClose={closePasswordModal}
                    onSubmit={changePassword}
                />
            )}

            {/* 2FA Modal */}

            {twoFactorModal && (
                <TwoFactorModal
                    mode={twoFactorMode}
                    qrCode={twoFactorQrCode}
                    secret={twoFactorSecret}
                    token={twoFactorToken}
                    setToken={setTwoFactorToken}
                    setupLoading={
                        twoFactorSetupLoading
                    }
                    verifyLoading={
                        twoFactorVerifyLoading
                    }
                    disableLoading={
                        twoFactorDisableLoading
                    }
                    onClose={closeTwoFactorModal}
                    onVerify={
                        verifyTwoFactorSetup
                    }
                    onDisable={
                        disableTwoFactor
                    }
                    onCopySecret={
                        copyTwoFactorSecret
                    }
                />
            )}
        </>
    );
}

/* =========================================
   PROFILE TAG
========================================= */

function ProfileTag({ icon: Icon, text }) {
    return (
        <span className="inline-flex max-w-full items-center gap-1.5 rounded-[4px] border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[10px] text-slate-300">
            <Icon
                size={12}
                className="shrink-0 text-blue-300"
            />

            <span className="truncate">
                {text}
            </span>
        </span>
    );
}

/* =========================================
   PROFILE SECTION
========================================= */

function ProfileSection({
    icon: Icon,
    title,
    description,
    action,
    children,
}) {
    return (
        <section className="rounded-[7px] border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
            <div className="mb-4 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[5px] border border-blue-500/15 bg-blue-500/10">
                        <Icon
                            size={17}
                            className="text-blue-300"
                        />
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

/* =========================================
   INFO CARD
========================================= */

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
                <Icon
                    size={15}
                    className="text-slate-300"
                />
            </div>

            <div className="min-w-0 flex-1">
                <p className="text-[9px] uppercase tracking-wide text-slate-600">
                    {label}
                </p>

                {editing &&
                    label === "Full Name" ? (
                    <input
                        value={inputValue}
                        onChange={(event) =>
                            onChange(
                                event.target.value
                            )
                        }
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

/* =========================================
   META ITEM
========================================= */

function MetaItem({
    icon: Icon,
    label,
    value,
}) {
    return (
        <div className="flex min-w-0 items-center gap-2.5">
            <Icon
                size={16}
                className="shrink-0 text-slate-400"
            />

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

/* =========================================
   SECURITY ROW
========================================= */

function SecurityRow({
    icon: Icon,
    title,
    description,
    action,
    onClick,
    badge,
    compact = false,
    enabled = false,
    loading = false,
}) {
    return (
        <div className="rounded-[5px] border border-[#1d3146] bg-[#0c1a2a] p-3">
            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[5px] bg-slate-800/80">
                    <Icon
                        size={16}
                        className={
                            enabled
                                ? "text-emerald-300"
                                : "text-slate-200"
                        }
                    />
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
                        <span
                            className={`rounded-full border px-2 py-0.5 text-[9px] font-medium ${enabled
                                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                                : "border-red-500/20 bg-red-500/10 text-red-300"
                                }`}
                        >
                            {badge}
                        </span>
                    )}

                    <button
                        type="button"
                        onClick={onClick}
                        disabled={loading}
                        className={`inline-flex items-center gap-1 rounded-[4px] border px-2.5 py-1.5 text-[10px] font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${enabled
                            ? "border-red-500/40 text-red-300 hover:bg-red-500/10"
                            : "border-blue-500/50 text-blue-300 hover:bg-blue-500/10"
                            } ${compact
                                ? "justify-center"
                                : ""
                            }`}
                    >
                        {loading
                            ? "Loading..."
                            : action}

                        {compact && !loading && (
                            <ArrowRight size={11} />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* =========================================
   ACTIVITY ITEM
========================================= */

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
                    <Icon
                        size={14}
                        className="text-slate-300"
                    />
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

/* =========================================
   PASSWORD MODAL
========================================= */

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
                if (
                    event.target ===
                    event.currentTarget &&
                    !saving
                ) {
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

                <form
                    onSubmit={onSubmit}
                    className="space-y-4 p-5"
                >
                    <PasswordField
                        label="Current Password"
                        value={
                            form.currentPassword
                        }
                        onChange={(value) =>
                            onChange(
                                "currentPassword",
                                value
                            )
                        }
                    />

                    <PasswordField
                        label="New Password"
                        value={
                            form.newPassword
                        }
                        onChange={(value) =>
                            onChange(
                                "newPassword",
                                value
                            )
                        }
                    />

                    <PasswordField
                        label="Confirm New Password"
                        value={
                            form.confirmPassword
                        }
                        onChange={(value) =>
                            onChange(
                                "confirmPassword",
                                value
                            )
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

                            {saving
                                ? "Updating..."
                                : "Update Password"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* =========================================
   PASSWORD FIELD
========================================= */

function PasswordField({
    label,
    value,
    onChange,
}) {
    return (
        <label className="block">
            <span className="mb-1.5 block text-[10px] font-medium text-slate-400">
                {label}
            </span>

            <input
                type="password"
                value={value}
                onChange={(event) =>
                    onChange(event.target.value)
                }
                autoComplete="new-password"
                className="h-10 w-full rounded-[5px] border border-[#263c54] bg-[#091522] px-3 text-xs text-white outline-none transition placeholder:text-slate-700 focus:border-blue-500"
                placeholder={`Enter ${label.toLowerCase()}`}
            />
        </label>
    );
}

/* =========================================
   2FA MODAL
========================================= */

function TwoFactorModal({
    mode,
    qrCode,
    secret,
    token,
    setToken,
    setupLoading,
    verifyLoading,
    disableLoading,
    onClose,
    onVerify,
    onDisable,
    onCopySecret,
}) {
    const isSetup = mode === "setup";

    return (
        <div
            className="fixed inset-0 z-[110] flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
                if (
                    event.target ===
                    event.currentTarget &&
                    !verifyLoading &&
                    !disableLoading &&
                    !setupLoading
                ) {
                    onClose();
                }
            }}
        >
            <div className="my-6 w-full max-w-md overflow-hidden rounded-[8px] border border-[#243a53] bg-[#0b1522] shadow-2xl">

                {/* Header */}

                <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-[5px] bg-blue-500/10 text-blue-300">
                            {isSetup ? (
                                <QrCode size={17} />
                            ) : (
                                <ShieldCheck size={17} />
                            )}
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-white">
                                {isSetup
                                    ? "Enable Two-Factor Authentication"
                                    : "Disable Two-Factor Authentication"}
                            </h3>

                            <p className="text-[10px] text-slate-500">
                                {isSetup
                                    ? "Secure your account with an authenticator app."
                                    : "Verify your authenticator code to continue."}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={
                            verifyLoading ||
                            disableLoading ||
                            setupLoading
                        }
                        className="rounded-[4px] p-1.5 text-slate-500 transition hover:bg-white/5 hover:text-white disabled:opacity-40"
                    >
                        <X size={17} />
                    </button>
                </div>

                {isSetup ? (
                    <form
                        onSubmit={onVerify}
                        className="space-y-5 p-5"
                    >
                        {/* Step 1 */}

                        <div>
                            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-blue-300">
                                Step 1
                            </p>

                            <p className="text-xs leading-5 text-slate-400">
                                Open Google Authenticator, Microsoft Authenticator,
                                or another TOTP app and scan this QR code.
                            </p>
                        </div>

                        {/* QR */}

                        <div className="flex justify-center">
                            {setupLoading ? (
                                <div className="flex h-52 w-52 items-center justify-center rounded-[6px] border border-[#263c54] bg-white">
                                    <span className="h-7 w-7 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
                                </div>
                            ) : qrCode ? (
                                <div className="rounded-[7px] bg-white p-3">
                                    <img
                                        src={qrCode}
                                        alt="2FA QR Code"
                                        className="h-48 w-48 sm:h-52 sm:w-52"
                                    />
                                </div>
                            ) : (
                                <div className="flex h-52 w-52 items-center justify-center rounded-[6px] border border-red-500/20 bg-red-500/5 text-center text-[10px] text-red-300">
                                    QR code unavailable.
                                </div>
                            )}
                        </div>

                        {/* Secret */}

                        {secret && (
                            <div>
                                <div className="mb-1.5 flex items-center justify-between">
                                    <p className="text-[10px] font-medium text-slate-400">
                                        Manual Setup Key
                                    </p>

                                    <button
                                        type="button"
                                        onClick={
                                            onCopySecret
                                        }
                                        className="inline-flex items-center gap-1 text-[9px] text-blue-300 hover:text-blue-200"
                                    >
                                        <Copy size={11} />
                                        Copy
                                    </button>
                                </div>

                                <div className="rounded-[5px] border border-[#263c54] bg-[#091522] px-3 py-2.5 text-center font-mono text-[11px] tracking-[0.12em] text-slate-200">
                                    {secret}
                                </div>
                            </div>
                        )}

                        {/* Step 2 */}

                        <div>
                            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-blue-300">
                                Step 2
                            </p>

                            <p className="mb-3 text-xs leading-5 text-slate-400">
                                Enter the 6-digit code shown in your authenticator app.
                            </p>

                            <input
                                value={token}
                                onChange={(event) =>
                                    setToken(
                                        event.target.value
                                            .replace(
                                                /\D/g,
                                                ""
                                            )
                                            .slice(0, 6)
                                    )
                                }
                                inputMode="numeric"
                                maxLength={6}
                                autoFocus
                                placeholder="000000"
                                className="h-11 w-full rounded-[5px] border border-[#263c54] bg-[#091522] px-3 text-center font-mono text-lg tracking-[0.35em] text-white outline-none transition placeholder:text-slate-700 focus:border-blue-500"
                            />
                        </div>

                        <div className="flex justify-end gap-2 border-t border-white/5 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={
                                    verifyLoading
                                }
                                className="h-9 rounded-[4px] border border-slate-700 px-4 text-xs font-medium text-slate-300 transition hover:border-slate-600 hover:text-white disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={
                                    verifyLoading ||
                                    token.length !== 6
                                }
                                className="inline-flex h-9 items-center gap-2 rounded-[4px] bg-blue-600 px-4 text-xs font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Check size={14} />

                                {verifyLoading
                                    ? "Verifying..."
                                    : "Verify & Enable"}
                            </button>
                        </div>
                    </form>
                ) : (
                    <form
                        onSubmit={onDisable}
                        className="space-y-5 p-5"
                    >
                        <div className="rounded-[6px] border border-red-500/20 bg-red-500/5 p-4">
                            <div className="flex gap-3">
                                <ShieldCheck
                                    size={18}
                                    className="mt-0.5 shrink-0 text-red-300"
                                />

                                <div>
                                    <p className="text-xs font-semibold text-red-300">
                                        Disable 2FA?
                                    </p>

                                    <p className="mt-1 text-[10px] leading-5 text-slate-500">
                                        This will remove the additional
                                        authenticator protection from your account.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-[10px] font-medium text-slate-400">
                                Current Authenticator Code
                            </label>

                            <input
                                value={token}
                                onChange={(event) =>
                                    setToken(
                                        event.target.value
                                            .replace(
                                                /\D/g,
                                                ""
                                            )
                                            .slice(0, 6)
                                    )
                                }
                                inputMode="numeric"
                                maxLength={6}
                                autoFocus
                                placeholder="000000"
                                className="h-11 w-full rounded-[5px] border border-[#263c54] bg-[#091522] px-3 text-center font-mono text-lg tracking-[0.35em] text-white outline-none transition placeholder:text-slate-700 focus:border-red-500/60"
                            />
                        </div>

                        <div className="flex justify-end gap-2 border-t border-white/5 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={
                                    disableLoading
                                }
                                className="h-9 rounded-[4px] border border-slate-700 px-4 text-xs font-medium text-slate-300 transition hover:border-slate-600 hover:text-white disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={
                                    disableLoading ||
                                    token.length !== 6
                                }
                                className="inline-flex h-9 items-center gap-2 rounded-[4px] bg-red-600 px-4 text-xs font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Shield size={14} />

                                {disableLoading
                                    ? "Disabling..."
                                    : "Disable 2FA"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default Profile;