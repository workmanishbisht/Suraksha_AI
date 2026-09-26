import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import {
    User,
    Mail,
    Phone,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    ShieldCheck,
    Bell,
    MapPin,
    Users,
    ChevronDown,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import logo from "../../assets/images/suraksha-logo.png";
import registerBg from "../../assets/images/login-bg.webp";

function Register() {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [accountType, setAccountType] = useState("Citizen");
    const [accountOpen, setAccountOpen] = useState(false);

    const [terms, setTerms] = useState(false);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        username: "",
        phone: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { id, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [id]: value,
        }));

        setErrors((prev) => ({
            ...prev,
            [id]: "",
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = {};

        const nameRegex = /^[A-Za-zÀ-ÿ]+(?:[ '-][A-Za-zÀ-ÿ]+)*$/;
        const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
        const phoneRegex = /^[6-9]\d{9}$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formData.name.trim()) {
            newErrors.name = "Full name is required.";
        } else if (formData.name.trim().length < 3) {
            newErrors.name = "Full name must be at least 3 characters.";
        } else if (!nameRegex.test(formData.name.trim())) {
            newErrors.name = "Enter a valid full name.";
        }

        if (!formData.username.trim()) {
            newErrors.username = "Username is required.";
        } else if (!usernameRegex.test(formData.username.trim())) {
            newErrors.username =
                "Username must be 3-30 characters using letters, numbers or underscore.";
        }

        const phone = formData.phone.replace(/\D/g, "");

        if (!formData.phone.trim()) {
            newErrors.phone = "Mobile number is required.";
        } else if (!phoneRegex.test(phone)) {
            newErrors.phone = "Enter a valid 10-digit mobile number.";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email address is required.";
        } else if (!emailRegex.test(formData.email.trim())) {
            newErrors.email = "Enter a valid email address.";
        }

        if (!formData.password) {
            newErrors.password = "Password is required.";
        } else if (formData.password.length < 8) {
            newErrors.password =
                "Password must be at least 8 characters.";
        } else if (!/[A-Z]/.test(formData.password)) {
            newErrors.password =
                "Password must contain an uppercase letter.";
        } else if (!/[a-z]/.test(formData.password)) {
            newErrors.password =
                "Password must contain a lowercase letter.";
        } else if (!/\d/.test(formData.password)) {
            newErrors.password =
                "Password must contain a number.";
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword =
                "Please confirm your password.";
        } else if (
            formData.password !== formData.confirmPassword
        ) {
            newErrors.confirmPassword =
                "Passwords do not match.";
        }

        if (!terms) {
            newErrors.terms =
                "Please accept the Terms of Service and Privacy Policy.";
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            toast.error("Please fix the highlighted fields.");
            return;
        }

        try {
            setLoading(true);

            await register({
                name: formData.name.trim(),
                username: formData.username.trim(),
                email: formData.email.trim().toLowerCase(),
                password: formData.password,
                accountType,
            });

            toast.success("Account created successfully!");

            setTimeout(() => {
                navigate("/login", {
                    replace: true,
                    state: {
                        registeredUsername: formData.username.trim(),
                    },
                });
            }, 800);
        } catch (error) {
            toast.error(
                error.message || "Unable to create your account."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
            <div className="grid min-h-screen lg:grid-cols-[58%_42%]">

                {/* LEFT SIDE */}

                <section
                    className="
                        relative hidden min-h-screen overflow-hidden
                        bg-cover bg-center lg:flex
                    "
                    style={{
                        backgroundImage: `url(${registerBg})`,
                    }}
                >
                    <div
                        className="
                            absolute inset-0
                            bg-gradient-to-r
                            from-[#06101c]/35
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
                        <div>
                            <img
                                src={logo}
                                alt="SurakshaAI"
                                className="h-auto w-[245px] object-contain"
                            />
                        </div>

                        <div className="my-auto max-w-2xl">
                            <h1
                                className="
                                    max-w-[620px]
                                    text-5xl font-semibold
                                    leading-[1.12]
                                    tracking-tight
                                    xl:text-[56px]
                                "
                            >
                                <span className="block">
                                    Build Safer
                                </span>

                                <span className="block">
                                    Communities
                                </span>

                                <span
                                    className="
                                        block
                                        bg-gradient-to-r
                                        from-[#20a5ff]
                                        to-[#13d7d1]
                                        bg-clip-text
                                        text-transparent
                                    "
                                >
                                    Together.
                                </span>
                            </h1>

                            <p
                                className="
                                    mt-6 max-w-xl
                                    text-[15px] leading-7
                                    text-slate-300
                                    xl:text-base
                                "
                            >
                                Create your SurakshaAI account to report
                                emergencies, stay informed and help build
                                a more resilient tomorrow.
                            </p>

                            <div className="mt-8 max-w-[420px] space-y-4">
                                <FeatureCard
                                    icon={Bell}
                                    iconColor="text-[#19b9ff]"
                                    bgColor="bg-[#087fc1]/10"
                                    title="Report Emergencies"
                                    text="Submit incidents with location and supporting evidence."
                                />

                                <FeatureCard
                                    icon={MapPin}
                                    iconColor="text-[#16d5c7]"
                                    bgColor="bg-[#0acfc0]/10"
                                    title="Stay Informed"
                                    text="Track incidents and receive real-time emergency alerts."
                                />

                                <FeatureCard
                                    icon={Users}
                                    iconColor="text-[#7770ff]"
                                    bgColor="bg-[#5148ff]/10"
                                    title="Coordinated Response"
                                    text="Connect citizens, field officers and control centers."
                                />
                            </div>
                        </div>

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


                {/* RIGHT SIDE */}

                <section
                    className="
                        relative flex min-h-screen
                        items-center justify-center
                        bg-[var(--background)]
                        px-5 py-8 sm:px-8
                    "
                >
                    <div className="w-full max-w-[540px]">

                        <div
                            className="
                                rounded-[var(--radius-xl)]
                                border border-[var(--border)]
                                bg-[var(--surface)]
                                p-6 sm:p-7
                            "
                        >
                            <div className="mb-6">
                                <h2
                                    className="
                                        text-3xl font-semibold
                                        tracking-tight
                                        sm:text-[36px]
                                    "
                                >
                                    Create Your Account
                                </h2>

                                <p
                                    className="
                                        mt-2 text-sm
                                        text-[var(--text-secondary)]
                                    "
                                >
                                    Join{" "}
                                    <span className="font-medium text-[#13d7d1]">
                                        SurakshaAI
                                    </span>{" "}
                                    and be a part of a safer tomorrow.
                                </p>
                            </div>


                            <form
                                onSubmit={handleSubmit}
                                className="space-y-4"
                            >

                                {/* NAME + USERNAME */}

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <InputField
                                        id="name"
                                        label="Full Name"
                                        placeholder="Enter your full name"
                                        icon={User}
                                        value={formData.name}
                                        onChange={handleChange}
                                        error={errors.name}
                                    />

                                    <InputField
                                        id="username"
                                        label="Username"
                                        placeholder="Choose a username"
                                        icon={User}
                                        value={formData.username}
                                        onChange={handleChange}
                                        error={errors.username}
                                    />
                                </div>


                                {/* PHONE + EMAIL */}

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <InputField
                                        id="phone"
                                        label="Mobile Number"
                                        placeholder="+91 98765 43210"
                                        icon={Phone}
                                        type="tel"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        error={errors.phone}
                                    />

                                    <InputField
                                        id="email"
                                        label="Email Address"
                                        placeholder="you@example.com"
                                        icon={Mail}
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        error={errors.email}
                                    />
                                </div>


                                {/* ACCOUNT TYPE */}

                                <div className="relative">
                                    <label
                                        className="
                                            mb-2 block text-sm
                                            font-medium
                                            text-[var(--text-secondary)]
                                        "
                                    >
                                        Account Type
                                    </label>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setAccountOpen(!accountOpen)
                                        }
                                        className="
                                            flex h-[54px] w-full
                                            items-center justify-between
                                            rounded-[var(--radius-md)]
                                            border border-[var(--border-light)]
                                            bg-[var(--background)]
                                            px-4 text-sm outline-none
                                            transition
                                            hover:border-slate-500
                                            focus:border-[var(--primary)]
                                        "
                                    >
                                        <div className="flex items-center gap-3">
                                            <ShieldCheck
                                                className="
                                                    h-[19px] w-[19px]
                                                    text-[var(--text-muted)]
                                                "
                                            />

                                            <span className="text-[var(--text-primary)]">
                                                {accountType}
                                            </span>
                                        </div>

                                        <ChevronDown
                                            className={`
                                                h-4 w-4
                                                text-[var(--text-muted)]
                                                transition-transform
                                                ${
                                                    accountOpen
                                                        ? "rotate-180"
                                                        : ""
                                                }
                                            `}
                                        />
                                    </button>

                                    {accountOpen && (
                                        <div
                                            className="
                                                absolute left-0 right-0
                                                top-[78px] z-50
                                                overflow-hidden
                                                rounded-[var(--radius-md)]
                                                border border-[var(--border)]
                                                bg-[var(--surface)]
                                                p-1
                                                shadow-[var(--shadow-md)]
                                            "
                                        >
                                            {[
                                                "Citizen",
                                                "Field Officer",
                                                "Department Officer",
                                            ].map((type) => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => {
                                                        setAccountType(type);
                                                        setAccountOpen(false);
                                                    }}
                                                    className="
                                                        w-full
                                                        rounded-[var(--radius-sm)]
                                                        px-3 py-2.5
                                                        text-left text-sm
                                                        text-[var(--text-secondary)]
                                                        transition
                                                        hover:bg-[var(--surface-hover)]
                                                        hover:text-white
                                                    "
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    <p
                                        className="
                                            mt-1.5 text-[11px]
                                            text-[var(--text-muted)]
                                        "
                                    >
                                        {accountType === "Citizen" &&
                                            "Citizens can report incidents and receive alerts."}

                                        {accountType === "Field Officer" &&
                                            "Field officers can manage and respond to incidents."}

                                        {accountType === "Department Officer" &&
                                            "Department officers can coordinate emergency response."}
                                    </p>
                                </div>


                                {/* PASSWORDS */}

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <PasswordField
                                        id="password"
                                        label="Password"
                                        placeholder="Create a password"
                                        showPassword={showPassword}
                                        setShowPassword={setShowPassword}
                                        value={formData.password}
                                        onChange={handleChange}
                                        error={errors.password}
                                    />

                                    <PasswordField
                                        id="confirmPassword"
                                        label="Confirm Password"
                                        placeholder="Confirm password"
                                        showPassword={showConfirmPassword}
                                        setShowPassword={setShowConfirmPassword}
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        error={errors.confirmPassword}
                                    />
                                </div>


                                {/* TERMS */}

                                <label
                                    className="
                                        flex cursor-pointer
                                        items-start gap-2.5
                                        pt-1 text-xs leading-5
                                        text-[var(--text-secondary)]
                                    "
                                >
                                    <input
                                        type="checkbox"
                                        checked={terms}
                                        onChange={(e) =>
                                            setTerms(e.target.checked)
                                        }
                                        className="
                                            mt-1 h-4 w-4 shrink-0
                                            cursor-pointer
                                            accent-[var(--primary)]
                                        "
                                    />

                                    <span>
                                        I agree to the{" "}
                                        <button
                                            type="button"
                                            className="
                                                text-[var(--primary-light)]
                                                hover:underline
                                            "
                                        >
                                            Terms of Service
                                        </button>{" "}
                                        and{" "}
                                        <button
                                            type="button"
                                            className="
                                                text-[var(--primary-light)]
                                                hover:underline
                                            "
                                        >
                                            Privacy Policy
                                        </button>
                                    </span>
                                </label>

                                {errors.terms && (
                                    <p className="text-xs text-red-400">
                                        {errors.terms}
                                    </p>
                                )}


                                {/* CREATE ACCOUNT */}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="
                                        flex h-[54px] w-full
                                        items-center justify-center
                                        gap-2
                                        rounded-[var(--radius-md)]
                                        bg-[var(--primary)]
                                        text-sm font-semibold
                                        text-white
                                        shadow-[var(--shadow-sm)]
                                        transition-all duration-200
                                        hover:bg-[var(--primary-hover)]
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
                                            Creating Account...
                                        </>
                                    ) : (
                                        <>
                                            Create Account
                                            <ArrowRight className="h-[18px] w-[18px]" />
                                        </>
                                    )}
                                </button>

                            </form>


                            {/* SIGN IN */}

                            <div className="my-6 flex items-center gap-4">
                                <div className="h-px flex-1 bg-[var(--border)]" />

                                <span
                                    className="
                                        whitespace-nowrap text-xs
                                        text-[var(--text-muted)]
                                    "
                                >
                                    Already have an account?
                                </span>

                                <div className="h-px flex-1 bg-[var(--border)]" />
                            </div>

                            <button
                                type="button"
                                onClick={() => navigate("/login")}
                                className="
                                    flex h-[50px] w-full
                                    items-center justify-center
                                    rounded-[var(--radius-md)]
                                    border border-[var(--primary)]
                                    bg-transparent
                                    text-sm font-semibold
                                    text-[var(--primary-light)]
                                    transition-all duration-200
                                    hover:bg-[var(--primary)]/10
                                "
                            >
                                Sign In
                            </button>

                        </div>


                        {/* SECURITY */}

                        <div
                            className="
                                mt-5 flex items-center
                                justify-center gap-3
                                text-xs text-[var(--text-muted)]
                            "
                        >
                            <ShieldCheck className="h-6 w-6 shrink-0" />

                            <span>
                                This is a secure government platform.
                                <br />
                                Your information is protected.
                            </span>
                        </div>

                    </div>
                </section>

            </div>
        </main>
    );
}


/* =========================================================
   INPUT FIELD
========================================================= */

function InputField({
    id,
    label,
    placeholder,
    icon: Icon,
    type = "text",
    value,
    onChange,
    error,
}) {
    return (
        <div>
            <label
                htmlFor={id}
                className="
                    mb-2 block text-sm font-medium
                    text-[var(--text-secondary)]
                "
            >
                {label}
            </label>

            <div className="group relative">
                <Icon
                    className="
                        absolute left-4 top-1/2
                        h-[19px] w-[19px]
                        -translate-y-1/2
                        text-[var(--text-muted)]
                        transition-colors
                        group-focus-within:text-[var(--primary-light)]
                    "
                />

                <input
                    id={id}
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className={`
                        h-[54px] w-full
                        rounded-[var(--radius-md)]
                        border bg-[var(--background)]
                        pl-12 pr-4
                        text-sm text-[var(--text-primary)]
                        outline-none
                        transition-all duration-200
                        placeholder:text-[var(--text-muted)]
                        hover:border-slate-500
                        focus:border-[var(--primary)]
                        focus:ring-2
                        focus:ring-[var(--primary)]/10
                        ${
                            error
                                ? "border-red-500"
                                : "border-[var(--border-light)]"
                        }
                    `}
                />
            </div>

            {error && (
                <p className="mt-1.5 text-xs text-red-400">
                    {error}
                </p>
            )}
        </div>
    );
}


/* =========================================================
   PASSWORD FIELD
========================================================= */

function PasswordField({
    id,
    label,
    placeholder,
    showPassword,
    setShowPassword,
    value,
    onChange,
    error,
}) {
    return (
        <div>
            <label
                htmlFor={id}
                className="
                    mb-2 block text-sm font-medium
                    text-[var(--text-secondary)]
                "
            >
                {label}
            </label>

            <div className="group relative">
                <Lock
                    className="
                        absolute left-4 top-1/2
                        h-[19px] w-[19px]
                        -translate-y-1/2
                        text-[var(--text-muted)]
                        transition-colors
                        group-focus-within:text-[var(--primary-light)]
                    "
                />

                <input
                    id={id}
                    type={showPassword ? "text" : "password"}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className={`
                        h-[54px] w-full
                        rounded-[var(--radius-md)]
                        border bg-[var(--background)]
                        pl-12 pr-11
                        text-sm text-[var(--text-primary)]
                        outline-none
                        transition-all duration-200
                        placeholder:text-[var(--text-muted)]
                        hover:border-slate-500
                        focus:border-[var(--primary)]
                        focus:ring-2
                        focus:ring-[var(--primary)]/10
                        ${
                            error
                                ? "border-red-500"
                                : "border-[var(--border-light)]"
                        }
                    `}
                />

                <button
                    type="button"
                    onClick={() =>
                        setShowPassword(!showPassword)
                    }
                    className="
                        absolute right-4 top-1/2
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

            {error && (
                <p className="mt-1.5 text-xs text-red-400">
                    {error}
                </p>
            )}
        </div>
    );
}


/* =========================================================
   FEATURE CARD
========================================================= */

function FeatureCard({
    icon: Icon,
    iconColor,
    bgColor,
    title,
    text,
}) {
    return (
        <div
            className="
                flex items-center gap-5
                rounded-[var(--radius-md)]
                border border-cyan-400/20
                bg-[#071a2a]/75
                p-4 backdrop-blur-sm
            "
        >
            <div
                className={`
                    flex h-16 w-16 shrink-0
                    items-center justify-center
                    rounded-[var(--radius-md)]
                    border border-white/10
                    ${bgColor}
                `}
            >
                <Icon className={`h-8 w-8 ${iconColor}`} />
            </div>

            <div>
                <h3 className="text-sm font-semibold text-white">
                    {title}
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-400">
                    {text}
                </p>
            </div>
        </div>
    );
}

export default Register;