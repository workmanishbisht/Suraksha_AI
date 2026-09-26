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
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import logo from "../../assets/images/suraksha-logo.png";
import loginBg from "../../assets/images/login-bg.webp";

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(true);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

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

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = {};

        if (!username.trim()) {
            newErrors.username = "Username or email is required.";
        }

        if (!password.trim()) {
            newErrors.password = "Password is required.";
        } else if (password.length < 8) {
            newErrors.password =
                "Password must be at least 8 characters.";
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            toast.error("Please fix the highlighted fields.");
            return;
        }

        try {
            setLoading(true);

            const data = await login(
                username.trim(),
                password
            );

            const role = data.user?.role;
            const dashboardRoute = getDashboardRoute(role);

            if (!dashboardRoute) {
                toast.error(
                    "Your account does not have an assigned dashboard."
                );

                return;
            }

            toast.success("Login successful!");

            navigate(dashboardRoute, {
                replace: true,
            });
        } catch (error) {
            toast.error(
                error.message || "Invalid username/email or password."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
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
                                An AI-powered platform to detect, respond,
                                and manage disasters — connecting citizens,
                                field officers and control centers for a
                                safer tomorrow.
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
                                <span className="mx-3">•</span>
                                RESPOND
                                <span className="mx-3">•</span>
                                RECOVER
                                <span className="mx-3">•</span>
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

                        {/* Login Card */}
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

                                                if (errors.username) {
                                                    setErrors((prev) => ({
                                                        ...prev,
                                                        username: "",
                                                    }));
                                                }
                                            }}
                                            placeholder="Enter your username or email"
                                            autoComplete="username"
                                            className={`
                                                h-[52px] w-full
                                                rounded-[var(--radius-md)]
                                                border
                                                ${
                                                    errors.username
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

                                                if (errors.password) {
                                                    setErrors((prev) => ({
                                                        ...prev,
                                                        password: "",
                                                    }));
                                                }
                                            }}
                                            placeholder="Enter your password"
                                            autoComplete="current-password"
                                            className={`
                                                h-[52px] w-full
                                                rounded-[var(--radius-md)]
                                                border
                                                ${
                                                    errors.password
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
                            <div
                                className="
                                    my-6 flex
                                    items-center gap-3
                                "
                            >
                                <div
                                    className="
                                        h-px flex-1
                                        bg-[var(--border)]
                                    "
                                />

                                <span
                                    className="
                                        whitespace-nowrap
                                        text-xs
                                        text-[var(--text-muted)]
                                    "
                                >
                                    Don't have an account?
                                </span>

                                <div
                                    className="
                                        h-px flex-1
                                        bg-[var(--border)]
                                    "
                                />
                            </div>

                            {/* CREATE ACCOUNT */}
                            <button
                                type="button"
                                onClick={() => navigate("/register")}
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

                            {/* SECURITY DIVIDER */}
                            <div
                                className="
                                    my-7 flex
                                    items-center gap-4
                                "
                            >
                                <div
                                    className="
                                        h-px flex-1
                                        bg-[var(--border)]
                                    "
                                />

                                <div
                                    className="
                                        flex h-9 w-9
                                        items-center justify-center
                                        rounded-full
                                        border border-[#159cff]/40
                                        bg-[#159cff]/10
                                    "
                                >
                                    <ShieldCheck
                                        className="
                                            h-5 w-5
                                            text-[#159cff]
                                        "
                                    />
                                </div>

                                <div
                                    className="
                                        h-px flex-1
                                        bg-[var(--border)]
                                    "
                                />
                            </div>

                            {/* SECURITY MESSAGE */}
                            <div className="text-center">
                                <p
                                    className="
                                        text-sm
                                        text-[var(--text-secondary)]
                                    "
                                >
                                    This is a secure government platform.
                                </p>

                                <p
                                    className="
                                        mt-1 text-xs
                                        leading-5
                                        text-[var(--text-muted)]
                                    "
                                >
                                    Authorized access only. Activity may be
                                    recorded
                                    <br className="hidden sm:block" />
                                    for security and audit purposes.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}

function Feature({ icon: Icon, title, text }) {
    return (
        <div>
            <div
                className="
                    mb-3 flex h-12 w-12
                    items-center justify-center
                    rounded-[var(--radius-md)]
                    border border-cyan-400/20
                    bg-slate-950/60
                "
            >
                <Icon
                    className="
                        h-6 w-6
                        text-cyan-400
                    "
                />
            </div>

            <h3
                className="
                    text-xs
                    font-semibold
                    text-white
                "
            >
                {title}
            </h3>

            <p
                className="
                    mt-1.5
                    text-[10px]
                    leading-4
                    text-slate-400
                "
            >
                {text}
            </p>
        </div>
    );
}

export default Login;