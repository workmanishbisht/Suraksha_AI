import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import {
    UserRound,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    ShieldCheck,
    Waves,
    Brain,
    Users,
    Shield,
    KeyRound,
    ArrowLeft,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import logo from "../../assets/images/suraksha-logo.png";
import loginBg from "../../assets/images/login-bg.webp";

// Set VITE_API_URL in .env (for example: http://localhost:5000/api).
const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

function Login() {
    const navigate = useNavigate();

    const { login, refreshUser } = useAuth();

    /* =========================================
       LOGIN STATES
    ========================================== */

    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(true);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    /* =========================================
       2FA STATES
    ========================================== */

    const [showTwoFactor, setShowTwoFactor] = useState(false);
    const [challengeToken, setChallengeToken] = useState("");
    const [otp, setOtp] = useState("");
    const [otpError, setOtpError] = useState("");

    /* =========================================
       DASHBOARD ROUTE
    ========================================== */

    const getDashboardRoute = (role) => {
        switch (role) {
            case "admin":
                return "/admin/dashboard";

            case "citizen":
                return "/citizen/dashboard";

            case "field_officer":
                return "/field-officer/dashboard";

            case "department_officer":
                return "/department/dashboard";

            default:
                return null;
        }
    };

    /* =========================================
       NORMAL LOGIN
    ========================================== */

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = {};

        if (!username.trim()) {
            newErrors.username =
                "Username or email is required.";
        }

        if (!password.trim()) {
            newErrors.password =
                "Password is required.";
        } else if (password.length < 8) {
            newErrors.password =
                "Password must be at least 8 characters.";
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            toast.error(
                "Please fix the highlighted fields."
            );

            return;
        }

        try {
            setLoading(true);

            const data = await login(
                username.trim(),
                password
            );

            /* =========================================
               2FA REQUIRED
            ========================================== */

            if (data?.requiresTwoFactor) {
                if (!data.challengeToken) {
                    toast.error(
                        "Unable to start 2FA verification."
                    );

                    return;
                }

                setChallengeToken(
                    data.challengeToken
                );

                setShowTwoFactor(true);

                setOtp("");

                setOtpError("");

                toast.info(
                    "Enter the 6-digit code from your Authenticator app."
                );

                return;
            }

            /* =========================================
               NORMAL LOGIN SUCCESS
            ========================================== */

            const role = data.user?.role;

            const dashboardRoute =
                getDashboardRoute(role);

            if (!dashboardRoute) {
                toast.error(
                    "Your account does not have an assigned dashboard."
                );

                return;
            }

            toast.success(
                "Login successful!"
            );

            navigate(dashboardRoute, {
                replace: true,
            });
        } catch (error) {
            toast.error(
                error.message ||
                "Invalid username/email or password."
            );
        } finally {
            setLoading(false);
        }
    };

    /* =========================================
       VERIFY 2FA
    ========================================== */

    const handleTwoFactorSubmit = async (e) => {
        e.preventDefault();

        setOtpError("");

        if (!otp.trim()) {
            setOtpError(
                "Please enter your 6-digit verification code."
            );

            return;
        }

        const normalizedOtp = otp.trim();

        if (!/^\d{6}$/.test(normalizedOtp)) {
            setOtpError(
                "Verification code must be 6 digits."
            );

            return;
        }

        if (!challengeToken) {
            setOtpError(
                "2FA session expired. Please login again."
            );

            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                `${API_BASE_URL}/auth/verify-2fa`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        challengeToken,
                        token: normalizedOtp,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Invalid verification code."
                );
            }

            if (!data.success) {
                throw new Error(
                    data.message ||
                    "2FA verification failed."
                );
            }

            /* =========================================
               LOGIN SUCCESS
            ========================================== */

            const authenticatedUser =
                await refreshUser();

            if (!authenticatedUser) {
                throw new Error(
                    "Authentication session could not be restored."
                );
            }

            const role =
                authenticatedUser.role ||
                data.user?.role;

            const dashboardRoute =
                getDashboardRoute(role);

            if (!dashboardRoute) {
                toast.error(
                    "Your account does not have an assigned dashboard."
                );

                return;
            }

            toast.success(
                "2FA verified. Login successful!"
            );

            setChallengeToken("");

            setOtp("");

            setOtpError("");

            navigate(dashboardRoute, {
                replace: true,
            });
        } catch (error) {
            setOtpError(
                error.message ||
                "Invalid verification code."
            );

            toast.error(
                error.message ||
                "Invalid verification code."
            );
        } finally {
            setLoading(false);
        }
    };

    /* =========================================
       BACK TO LOGIN
    ========================================== */

    const handleBackToLogin = () => {
        setShowTwoFactor(false);

        setChallengeToken("");

        setOtp("");

        setOtpError("");
    };

    return (
        <main className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
            <style>{`
                input:-webkit-autofill,
                input:-webkit-autofill:hover,
                input:-webkit-autofill:focus,
                input:-webkit-autofill:active {
                    -webkit-box-shadow: 0 0 0 1000px var(--background) inset !important;
                    box-shadow: 0 0 0 1000px var(--background) inset !important;
                    -webkit-text-fill-color: var(--text-primary) !important;
                    caret-color: var(--text-primary) !important;
                    transition: background-color 9999s ease-in-out 0s !important;
                }

                input:-moz-autofill {
                    background-color: var(--background) !important;
                    color: var(--text-primary) !important;
                }
            `}</style>

            <div className="grid min-h-screen lg:grid-cols-[58%_42%]">

                {/* =========================================
                    LEFT SIDE
                ========================================== */}

                <section
                    className="
                        relative hidden min-h-screen overflow-hidden
                        bg-cover bg-center lg:flex
                    "
                    style={{
                        backgroundImage: `url(${loginBg})`,
                    }}
                >
                    <div
                        className="
                            absolute inset-0
                            bg-gradient-to-r
                            from-[#06101c]/30
                            via-[#06101c]/35
                            to-[#06101c]/95
                        "
                    />

                    <div
                        className="
                            relative z-10 flex min-h-screen
                            w-full flex-col px-10 py-9 xl:px-16
                        "
                    >
                        {/* Logo */}

                        <div>
                            <img
                                src={logo}
                                alt="SurakshaAI"
                                className="w-[245px] object-contain"
                            />
                        </div>

                        {/* Hero */}

                        <div className="my-auto max-w-2xl">
                            <h1
                                className="
                                    max-w-[700px]
                                    text-4xl font-semibold
                                    leading-[1.18]
                                    tracking-tight
                                    xl:text-[50px]
                                "
                            >
                                <span className="block whitespace-nowrap">
                                    Safer People.
                                </span>

                                <span className="block whitespace-nowrap">
                                    Stronger Communities.
                                </span>

                                <span
                                    className="
                                        block whitespace-nowrap
                                        bg-gradient-to-r
                                        from-[#20a5ff]
                                        to-[#13d7d1]
                                        bg-clip-text
                                        text-transparent
                                    "
                                >
                                    A More Resilient Tomorrow.
                                </span>
                            </h1>

                            <p
                                className="
                                    mt-6 max-w-xl
                                    text-[15px] leading-7
                                    text-slate-300
                                "
                            >
                                An AI-powered platform to detect,
                                respond, and manage disasters —
                                connecting citizens, field officers
                                and control centers for a safer
                                tomorrow.
                            </p>

                            {/* Features */}

                            <div
                                className="
                                    mt-9 grid
                                    max-w-3xl grid-cols-4 gap-5
                                "
                            >
                                <Feature
                                    icon={Waves}
                                    title="Real-time Monitoring"
                                    text="Stay informed with live incident updates"
                                />

                                <Feature
                                    icon={Brain}
                                    title="AI-Powered Insights"
                                    text="Intelligent analysis for faster response"
                                />

                                <Feature
                                    icon={Users}
                                    title="Coordinated Response"
                                    text="Better collaboration across departments"
                                />

                                <Feature
                                    icon={Shield}
                                    title="Stronger Communities"
                                    text="Building a safer and resilient future"
                                />
                            </div>
                        </div>

                        {/* Bottom */}

                        <div>
                            <div className="mb-4 h-[3px] w-14 bg-[#159cff]" />

                            <p
                                className="
                                    text-[10px] font-medium
                                    tracking-[0.28em] text-slate-400
                                "
                            >
                                PREPARE
                                <span className="mx-3">
                                    •
                                </span>
                                RESPOND
                                <span className="mx-3">
                                    •
                                </span>
                                RECOVER
                                <span className="mx-3">
                                    •
                                </span>
                                TOGETHER
                            </p>
                        </div>
                    </div>
                </section>

                {/* =========================================
                    RIGHT SIDE
                ========================================== */}

                <section
                    className="
                        flex min-h-screen
                        items-center justify-center
                        bg-[var(--background)]
                        px-5 py-8 sm:px-8
                    "
                >
                    <div className="w-full max-w-[520px]">

                        {/* =========================================
                            LOGIN CARD
                        ========================================== */}

                        <div
                            className="
                                rounded-[var(--radius-xl)]
                                border border-[var(--border)]
                                bg-[var(--surface)]
                                p-6
                                shadow-[var(--shadow-lg)]
                                sm:p-8
                            "
                        >
                            {/* Top Accent */}

                            <div
                                className="
                                    mb-5 h-[3px] w-12
                                    rounded-full
                                    bg-gradient-to-r
                                    from-[#159cff]
                                    to-[#13d7d1]
                                "
                            />

                            {/* =========================================
                                NORMAL LOGIN
                            ========================================== */}

                            {!showTwoFactor ? (
                                <>
                                    {/* Heading */}

                                    <div className="mb-7">
                                        <h2
                                            className="
                                                text-3xl
                                                font-semibold
                                                tracking-tight
                                                sm:text-[34px]
                                            "
                                        >
                                            Welcome Back
                                        </h2>

                                        <p
                                            className="
                                                mt-2
                                                text-sm
                                                text-[var(--text-secondary)]
                                            "
                                        >
                                            Sign in to your{" "}

                                            <span className="font-medium text-[#13d7d1]">
                                                SurakshaAI
                                            </span>{" "}

                                            account
                                        </p>
                                    </div>

                                    <form
                                        onSubmit={handleSubmit}
                                        className="space-y-5"
                                    >
                                        {/* USERNAME */}

                                        <div>
                                            <label
                                                htmlFor="username"
                                                className="
                                                    mb-2 block
                                                    text-sm font-medium
                                                    text-[var(--text-secondary)]
                                                "
                                            >
                                                Username
                                            </label>

                                            <div className="group relative">
                                                <UserRound
                                                    className="
                                                        absolute
                                                        left-4 top-1/2
                                                        h-[19px] w-[19px]
                                                        -translate-y-1/2
                                                        text-[var(--text-muted)]
                                                        transition-colors
                                                        group-focus-within:text-[var(--primary-light)]
                                                    "
                                                />

                                                <input
                                                    id="username"
                                                    type="text"
                                                    value={username}
                                                    onChange={(e) => {
                                                        setUsername(
                                                            e.target.value
                                                        );

                                                        if (
                                                            errors.username
                                                        ) {
                                                            setErrors(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    username:
                                                                        "",
                                                                })
                                                            );
                                                        }
                                                    }}
                                                    placeholder="Enter your username or email"
                                                    autoComplete="username"
                                                    className={`
                                                        h-[52px] w-full
                                                        rounded-[var(--radius-md)]
                                                        border
                                                        ${errors.username
                                                            ? "border-red-500/70"
                                                            : "border-[var(--border-light)]"
                                                        }
                                                        bg-[var(--background)]
                                                        pl-12 pr-4
                                                        text-sm
                                                        text-[var(--text-primary)]
                                                        outline-none
                                                        transition-all duration-200
                                                        placeholder:text-[var(--text-muted)]
                                                        hover:border-slate-500
                                                        focus:border-[var(--primary)]
                                                        focus:ring-2
                                                        focus:ring-[var(--primary)]/10
                                                    `}
                                                />
                                            </div>

                                            {errors.username && (
                                                <p className="mt-1.5 text-xs text-red-400">
                                                    {errors.username}
                                                </p>
                                            )}
                                        </div>

                                        {/* PASSWORD */}

                                        <div>
                                            <label
                                                htmlFor="password"
                                                className="
                                                    mb-2 block
                                                    text-sm font-medium
                                                    text-[var(--text-secondary)]
                                                "
                                            >
                                                Password
                                            </label>

                                            <div className="group relative">
                                                <Lock
                                                    className="
                                                        absolute
                                                        left-4 top-1/2
                                                        h-[19px] w-[19px]
                                                        -translate-y-1/2
                                                        text-[var(--text-muted)]
                                                        transition-colors
                                                        group-focus-within:text-[var(--primary-light)]
                                                    "
                                                />

                                                <input
                                                    id="password"
                                                    type={
                                                        showPassword
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    value={password}
                                                    onChange={(e) => {
                                                        setPassword(
                                                            e.target.value
                                                        );

                                                        if (
                                                            errors.password
                                                        ) {
                                                            setErrors(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    password:
                                                                        "",
                                                                })
                                                            );
                                                        }
                                                    }}
                                                    placeholder="Enter your password"
                                                    autoComplete="current-password"
                                                    className={`
                                                        h-[52px] w-full
                                                        rounded-[var(--radius-md)]
                                                        border
                                                        ${errors.password
                                                            ? "border-red-500/70"
                                                            : "border-[var(--border-light)]"
                                                        }
                                                        bg-[var(--background)]
                                                        pl-12 pr-12
                                                        text-sm
                                                        text-[var(--text-primary)]
                                                        outline-none
                                                        transition-all duration-200
                                                        placeholder:text-[var(--text-muted)]
                                                        hover:border-slate-500
                                                        focus:border-[var(--primary)]
                                                        focus:ring-2
                                                        focus:ring-[var(--primary)]/10
                                                    `}
                                                />

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setShowPassword(
                                                            !showPassword
                                                        )
                                                    }
                                                    className="
                                                        absolute
                                                        right-4 top-1/2
                                                        -translate-y-1/2
                                                        text-[var(--text-muted)]
                                                        transition
                                                        hover:text-[var(--text-secondary)]
                                                    "
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-[18px] w-[18px]" />
                                                    ) : (
                                                        <Eye className="h-[18px] w-[18px]" />
                                                    )}
                                                </button>
                                            </div>

                                            {errors.password && (
                                                <p className="mt-1.5 text-xs text-red-400">
                                                    {errors.password}
                                                </p>
                                            )}
                                        </div>

                                        {/* REMEMBER + FORGOT */}

                                        <div
                                            className="
                                                flex items-center
                                                justify-between
                                            "
                                        >
                                            <label
                                                className="
                                                    flex cursor-pointer
                                                    items-center gap-2.5
                                                    text-sm
                                                    text-[var(--text-secondary)]
                                                "
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={remember}
                                                    onChange={(e) =>
                                                        setRemember(
                                                            e.target.checked
                                                        )
                                                    }
                                                    className="
                                                        h-4 w-4
                                                        cursor-pointer
                                                        accent-[var(--primary)]
                                                    "
                                                />

                                                Remember me
                                            </label>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    navigate(
                                                        "/forgot-password"
                                                    )
                                                }
                                                className="
                                                    text-sm
                                                    text-[var(--primary-light)]
                                                    transition
                                                    hover:text-[var(--primary)]
                                                "
                                            >
                                                Forgot password?
                                            </button>
                                        </div>

                                        {/* SIGN IN */}

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="
                                                flex h-[52px] w-full
                                                items-center justify-center
                                                gap-2
                                                rounded-[var(--radius-md)]
                                                bg-[var(--primary)]
                                                text-sm font-semibold
                                                text-white
                                                shadow-[var(--shadow-sm)]
                                                transition-all duration-200
                                                hover:bg-[var(--primary-hover)]
                                                hover:shadow-[0_8px_24px_rgba(37,99,235,0.25)]
                                                active:scale-[0.99]
                                                disabled:cursor-not-allowed
                                                disabled:opacity-60
                                            "
                                        >
                                            {loading ? (
                                                <>
                                                    <span
                                                        className="
                                                            h-[18px] w-[18px]
                                                            animate-spin
                                                            rounded-full
                                                            border-2
                                                            border-white/30
                                                            border-t-white
                                                        "
                                                    />

                                                    Signing In...
                                                </>
                                            ) : (
                                                <>
                                                    Sign In

                                                    <ArrowRight
                                                        className="h-[18px] w-[18px]"
                                                    />
                                                </>
                                            )}
                                        </button>
                                    </form>

                                    {/* CREATE ACCOUNT DIVIDER */}

                                    <div className="my-6 flex items-center gap-3">
                                        <div className="h-px flex-1 bg-[var(--border)]" />

                                        <span className="whitespace-nowrap text-xs text-[var(--text-muted)]">
                                            Don't have an account?
                                        </span>

                                        <div className="h-px flex-1 bg-[var(--border)]" />
                                    </div>

                                    {/* CREATE ACCOUNT */}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigate("/register")
                                        }
                                        className="
                                            flex h-[50px] w-full
                                            items-center justify-center
                                            gap-2
                                            rounded-[var(--radius-md)]
                                            border border-[var(--primary)]
                                            bg-transparent
                                            text-sm font-semibold
                                            text-[var(--primary-light)]
                                            transition-all duration-200
                                            hover:bg-[var(--primary)]/10
                                        "
                                    >
                                        Create Account
                                    </button>
                                </>
                            ) : (
                                /* =========================================
                                   2FA SCREEN
                                ========================================== */

                                <div>
                                    {/* Back Button */}

                                    <button
                                        type="button"
                                        onClick={handleBackToLogin}
                                        className="
                                            mb-7 flex
                                            items-center gap-2
                                            text-sm
                                            text-[var(--text-muted)]
                                            transition
                                            hover:text-[var(--text-primary)]
                                        "
                                    >
                                        <ArrowLeft className="h-4 w-4" />

                                        Back to login
                                    </button>

                                    {/* Icon */}

                                    <div
                                        className="
                                            mb-6 flex
                                            h-14 w-14
                                            items-center justify-center
                                            rounded-[var(--radius-md)]
                                            border border-[#159cff]/30
                                            bg-[#159cff]/10
                                        "
                                    >
                                        <KeyRound
                                            className="
                                                h-7 w-7
                                                text-[#159cff]
                                            "
                                        />
                                    </div>

                                    {/* Heading */}

                                    <div className="mb-7">
                                        <h2
                                            className="
                                                text-3xl
                                                font-semibold
                                                tracking-tight
                                                sm:text-[34px]
                                            "
                                        >
                                            Two-Factor Authentication
                                        </h2>

                                        <p
                                            className="
                                                mt-3
                                                text-sm leading-6
                                                text-[var(--text-secondary)]
                                            "
                                        >
                                            Enter the 6-digit
                                            verification code from
                                            your authenticator app
                                            to continue.
                                        </p>
                                    </div>

                                    <form
                                        onSubmit={handleTwoFactorSubmit}
                                        className="space-y-5"
                                    >
                                        {/* OTP */}

                                        <div>
                                            <label
                                                htmlFor="otp"
                                                className="
                                                    mb-2 block
                                                    text-sm font-medium
                                                    text-[var(--text-secondary)]
                                                "
                                            >
                                                Verification Code
                                            </label>

                                            <input
                                                id="otp"
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={6}
                                                autoFocus
                                                value={otp}
                                                onChange={(e) => {
                                                    const value =
                                                        e.target.value.replace(
                                                            /\D/g,
                                                            ""
                                                        );

                                                    setOtp(value);
                                                    setOtpError("");
                                                }}
                                                placeholder="000000"
                                                autoComplete="one-time-code"
                                                className={`
                                                    h-[58px] w-full
                                                    rounded-[var(--radius-md)]
                                                    border
                                                    ${otpError
                                                        ? "border-red-500/70"
                                                        : "border-[var(--border-light)]"
                                                    }
                                                    bg-[var(--background)]
                                                    px-4
                                                    text-center
                                                    text-xl
                                                    font-semibold
                                                    tracking-[0.5em]
                                                    text-[var(--text-primary)]
                                                    outline-none
                                                    transition-all duration-200
                                                    placeholder:text-[var(--text-muted)]
                                                    placeholder:tracking-[0.5em]
                                                    hover:border-slate-500
                                                    focus:border-[var(--primary)]
                                                    focus:ring-2
                                                    focus:ring-[var(--primary)]/10
                                                `}
                                            />

                                            {otpError && (
                                                <p className="mt-2 text-xs text-red-400">
                                                    {otpError}
                                                </p>
                                            )}
                                        </div>

                                        {/* VERIFY BUTTON */}

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="
                                                flex h-[52px] w-full
                                                items-center justify-center
                                                gap-2
                                                rounded-[var(--radius-md)]
                                                bg-[var(--primary)]
                                                text-sm font-semibold
                                                text-white
                                                shadow-[var(--shadow-sm)]
                                                transition-all duration-200
                                                hover:bg-[var(--primary-hover)]
                                                hover:shadow-[0_8px_24px_rgba(37,99,235,0.25)]
                                                active:scale-[0.99]
                                                disabled:cursor-not-allowed
                                                disabled:opacity-60
                                            "
                                        >
                                            {loading ? (
                                                <>
                                                    <span
                                                        className="
                                                            h-[18px] w-[18px]
                                                            animate-spin
                                                            rounded-full
                                                            border-2
                                                            border-white/30
                                                            border-t-white
                                                        "
                                                    />

                                                    Verifying...
                                                </>
                                            ) : (
                                                <>
                                                    Verify & Continue

                                                    <ShieldCheck
                                                        className="h-[18px] w-[18px]"
                                                    />
                                                </>
                                            )}
                                        </button>
                                    </form>

                                    {/* Security Note */}

                                    <div
                                        className="
                                            mt-6
                                            rounded-[var(--radius-md)]
                                            border border-[var(--border)]
                                            bg-[var(--background)]
                                            px-4 py-3
                                        "
                                    >
                                        <div className="flex gap-3">
                                            <ShieldCheck
                                                className="
                                                    mt-0.5
                                                    h-4 w-4 shrink-0
                                                    text-[#13d7d1]
                                                "
                                            />

                                            <p
                                                className="
                                                    text-xs
                                                    leading-5
                                                    text-[var(--text-muted)]
                                                "
                                            >
                                                Your account is protected
                                                with two-factor
                                                authentication. Never
                                                share your verification
                                                code with anyone.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}

function Feature({ icon: Icon, title, text }) {
    return (
        <div className="flex flex-col">
            <div
                className="
                    mb-3 flex
                    h-10 w-10
                    items-center justify-center
                    rounded-[var(--radius-md)]
                    border border-white/10
                    bg-white/5
                "
            >
                <Icon className="h-[18px] w-[18px] text-[#20a5ff]" />
            </div>

            <h3 className="text-xs font-semibold text-white">
                {title}
            </h3>

            <p className="mt-1.5 text-[10px] leading-4 text-slate-400">
                {text}
            </p>
        </div>
    );
}

export default Login;