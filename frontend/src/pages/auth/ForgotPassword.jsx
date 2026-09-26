import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Mail,
    Phone,
    ArrowRight,
    ArrowLeft,
    ShieldCheck,
    CheckCircle2,
    LockKeyhole,
} from "lucide-react";

import logo from "../../assets/images/suraksha-logo.png";
import loginBg from "../../assets/images/login-bg.webp";

function ForgotPassword() {
    const navigate = useNavigate();

    const [identifier, setIdentifier] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!identifier.trim()) return;

        setSubmitted(true);
    };

    return (
        <main className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">

            <div className="grid min-h-screen lg:grid-cols-[58%_42%]">

                {/* =========================================
                    LEFT SIDE
                ========================================== */}

                <section
                    className="relative hidden min-h-screen overflow-hidden bg-cover bg-center lg:flex"
                    style={{
                        backgroundImage: `url(${loginBg})`,
                    }}
                >
                    <div
                        className="absolute inset-0
                        bg-gradient-to-r
                        from-[#06101c]/30
                        via-[#06101c]/35
                        to-[#06101c]/95"
                    />

                    <div
                        className="relative z-10 flex min-h-screen
                        w-full flex-col px-10 py-9 xl:px-16"
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
                                className="max-w-[700px]
                                text-4xl font-semibold
                                leading-[1.18]
                                tracking-tight
                                xl:text-[50px]"
                            >
                                <span className="block">
                                    Secure Access.
                                </span>

                                <span className="block">
                                    Protected Accounts.
                                </span>

                                <span
                                    className="block
                                    bg-gradient-to-r
                                    from-[#20a5ff]
                                    to-[#13d7d1]
                                    bg-clip-text
                                    text-transparent"
                                >
                                    Safer Communities.
                                </span>
                            </h1>

                            <p
                                className="mt-6 max-w-xl
                                text-[15px] leading-7
                                text-slate-300"
                            >
                                Recover your SurakshaAI account securely and
                                regain access to your account through a simple
                                and protected recovery process.
                            </p>

                            {/* Features */}
                            <div className="mt-9 grid max-w-3xl grid-cols-3 gap-6">

                                <Feature
                                    icon={ShieldCheck}
                                    title="Secure Recovery"
                                    text="Your account information stays protected"
                                />

                                <Feature
                                    icon={LockKeyhole}
                                    title="Protected Access"
                                    text="Secure verification before account recovery"
                                />

                                <Feature
                                    icon={CheckCircle2}
                                    title="Quick Process"
                                    text="Recover your account in a few simple steps"
                                />

                            </div>
                        </div>

                        {/* Bottom */}
                        <div>

                            <div className="mb-4 h-[3px] w-14 bg-[#159cff]" />

                            <p
                                className="text-[10px] font-medium
                                tracking-[0.28em] text-slate-400"
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
                    className="flex min-h-screen
                    items-center justify-center
                    bg-[var(--background)]
                    px-5 py-8 sm:px-8"
                >

                    <div className="w-full max-w-[520px]">

                        {/* Mobile Logo */}
                        <div className="mb-8 flex justify-center lg:hidden">
                            <img
                                src={logo}
                                alt="SurakshaAI"
                                className="w-[190px] object-contain"
                            />
                        </div>


                        {/* =================================
                            FORGOT PASSWORD CARD
                        ================================= */}

                        <div
                            className="rounded-[var(--radius-xl)]
                            border border-[var(--border)]
                            bg-[var(--surface)]
                            p-6
                            shadow-[var(--shadow-lg)]
                            sm:p-8"
                        >

                            {/* Top Accent */}
                            <div
                                className="mb-5 h-[3px] w-12
                                rounded-full
                                bg-gradient-to-r
                                from-[#159cff]
                                to-[#13d7d1]"
                            />


                            {!submitted ? (
                                <>

                                    {/* Heading */}
                                    <div className="mb-7">

                                        <button
                                            type="button"
                                            onClick={() => navigate("/login")}
                                            className="mb-6 inline-flex
                                            items-center gap-2
                                            text-sm
                                            text-[var(--text-muted)]
                                            transition
                                            hover:text-[var(--text-primary)]"
                                        >
                                            <ArrowLeft className="h-[17px] w-[17px]" />
                                            Back to Login
                                        </button>

                                        <h2
                                            className="text-3xl
                                            font-semibold
                                            tracking-tight
                                            sm:text-[34px]"
                                        >
                                            Forgot Password?
                                        </h2>

                                        <p
                                            className="mt-2
                                            text-sm
                                            leading-6
                                            text-[var(--text-secondary)]"
                                        >
                                            Enter your registered email or
                                            mobile number to recover your
                                            SurakshaAI account.
                                        </p>

                                    </div>


                                    {/* Form */}
                                    <form
                                        onSubmit={handleSubmit}
                                        className="space-y-5"
                                    >

                                        {/* Email / Mobile */}
                                        <div>

                                            <label
                                                htmlFor="identifier"
                                                className="mb-2 block
                                                text-sm font-medium
                                                text-[var(--text-secondary)]"
                                            >
                                                Email or Mobile Number
                                            </label>

                                            <div className="group relative">

                                                {identifier.includes("@") ? (
                                                    <Mail
                                                        className="absolute
                                                        left-4 top-1/2
                                                        h-[19px] w-[19px]
                                                        -translate-y-1/2
                                                        text-[var(--text-muted)]
                                                        transition-colors
                                                        group-focus-within:text-[var(--primary-light)]"
                                                    />
                                                ) : (
                                                    <Phone
                                                        className="absolute
                                                        left-4 top-1/2
                                                        h-[19px] w-[19px]
                                                        -translate-y-1/2
                                                        text-[var(--text-muted)]
                                                        transition-colors
                                                        group-focus-within:text-[var(--primary-light)]"
                                                    />
                                                )}

                                                <input
                                                    id="identifier"
                                                    type="text"
                                                    value={identifier}
                                                    onChange={(e) =>
                                                        setIdentifier(
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="you@example.com or +91 98765 43210"
                                                    className="h-[52px] w-full
                                                    rounded-[var(--radius-md)]
                                                    border border-[var(--border-light)]
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
                                                    focus:ring-[var(--primary)]/10"
                                                />

                                            </div>

                                        </div>


                                        {/* Submit */}
                                        <button
                                            type="submit"
                                            className="flex h-[52px] w-full
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
                                            active:scale-[0.99]"
                                        >
                                            Send Reset Instructions

                                            <ArrowRight
                                                className="h-[18px] w-[18px]"
                                            />
                                        </button>

                                    </form>


                                    {/* Security Divider */}
                                    <div
                                        className="my-7 flex
                                        items-center gap-4"
                                    >

                                        <div
                                            className="h-px flex-1
                                            bg-[var(--border)]"
                                        />

                                        <div
                                            className="flex h-9 w-9
                                            items-center justify-center
                                            rounded-full
                                            border border-[#159cff]/40
                                            bg-[#159cff]/10"
                                        >
                                            <ShieldCheck
                                                className="h-5 w-5
                                                text-[#159cff]"
                                            />
                                        </div>

                                        <div
                                            className="h-px flex-1
                                            bg-[var(--border)]"
                                        />

                                    </div>


                                    {/* Security Message */}
                                    <div className="text-center">

                                        <p
                                            className="text-sm
                                            text-[var(--text-secondary)]"
                                        >
                                            Your account is protected.
                                        </p>

                                        <p
                                            className="mt-1 text-xs
                                            leading-5
                                            text-[var(--text-muted)]"
                                        >
                                            Recovery instructions will only be
                                            sent to your registered contact
                                            details.
                                        </p>

                                    </div>

                                </>
                            ) : (

                                /* =================================
                                    SUCCESS STATE
                                ================================= */

                                <div className="py-5 text-center">

                                    <div
                                        className="mx-auto mb-6 flex
                                        h-16 w-16
                                        items-center justify-center
                                        rounded-full
                                        border border-emerald-400/20
                                        bg-emerald-500/10
                                        text-emerald-400"
                                    >
                                        <CheckCircle2 size={32} />
                                    </div>

                                    <h2
                                        className="text-3xl
                                        font-semibold
                                        tracking-tight
                                        sm:text-[34px]"
                                    >
                                        Instructions Sent
                                    </h2>

                                    <p
                                        className="mx-auto mt-3 max-w-md
                                        text-sm
                                        leading-6
                                        text-[var(--text-secondary)]"
                                    >
                                        If the provided email or mobile number
                                        is registered, you will receive
                                        instructions to reset your password.
                                    </p>


                                    {/* Back Login */}
                                    <button
                                        type="button"
                                        onClick={() => navigate("/login")}
                                        className="mt-7 flex h-[52px] w-full
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
                                        active:scale-[0.99]"
                                    >
                                        Back to Login

                                        <ArrowRight
                                            className="h-[18px] w-[18px]"
                                        />
                                    </button>


                                    {/* Try Again */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIdentifier("");
                                            setSubmitted(false);
                                        }}
                                        className="mt-5 text-sm
                                        text-[var(--text-muted)]
                                        transition
                                        hover:text-[var(--text-primary)]"
                                    >
                                        Try another account
                                    </button>

                                </div>

                            )}

                        </div>


                        {/* Footer */}
                        <div
                            className="mt-7 flex
                            items-center justify-center
                            gap-2 text-xs
                            text-[var(--text-muted)]"
                        >
                            <ShieldCheck className="h-[15px] w-[15px]" />

                            <span>
                                This is a secure government platform.
                            </span>
                        </div>

                    </div>

                </section>

            </div>

        </main>
    );
}


/* =========================================
   FEATURE COMPONENT
========================================= */

function Feature({ icon: Icon, title, text }) {
    return (
        <div>

            <div
                className="mb-3 flex h-12 w-12
                items-center justify-center
                rounded-[var(--radius-md)]
                border border-cyan-400/20
                bg-slate-950/60"
            >
                <Icon
                    className="h-6 w-6
                    text-cyan-400"
                />
            </div>

            <h3
                className="text-xs
                font-semibold
                text-white"
            >
                {title}
            </h3>

            <p
                className="mt-1.5
                text-[10px]
                leading-4
                text-slate-400"
            >
                {text}
            </p>

        </div>
    );
}

export default ForgotPassword;