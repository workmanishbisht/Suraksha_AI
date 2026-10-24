import { useEffect, useState } from "react";
import {
  Settings,
  Bell,
  ShieldCheck,
  LifeBuoy,
  Info,
  LogOut,
  Save,
  RotateCcw,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  FileText,
  Mail,
  Phone,
  ExternalLink,
  ChevronDown,
  LockKeyhole,
  Database,
  ShieldAlert,
  HeartHandshake,
  Smartphone,
  X,
} from "lucide-react";

const STORAGE_KEY = "surakshaai_citizen_preferences";

const defaultPreferences = {
  emergencyAlerts: true,
  incidentUpdates: true,
  inAppNotifications: true,
};

const sections = [
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy & Permissions", icon: ShieldCheck },
  { id: "support", label: "Help & Support", icon: LifeBuoy },
  { id: "about", label: "About SurakshaAI", icon: Info },
];

const faqs = [
  {
    question: "How do I report an incident?",
    answer:
      "Open Report Incident from the sidebar, fill in the required information, confirm the location and submit your report.",
  },
  {
    question: "How can I track my incident?",
    answer:
      "Go to My Reports and open your submitted incident to view its current status and available updates.",
  },
  {
    question: "Can I update my personal information?",
    answer:
      "Yes. Open the Profile page to manage your personal information and account security.",
  },
  {
    question: "What should I do during an emergency?",
    answer:
      "Move to a safe location and contact emergency services. In India, you can dial 112 for emergency assistance.",
  },
];

function loadPreferences() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultPreferences;

    const parsed = JSON.parse(stored);

    return {
      emergencyAlerts:
        typeof parsed.emergencyAlerts === "boolean"
          ? parsed.emergencyAlerts
          : true,
      incidentUpdates:
        typeof parsed.incidentUpdates === "boolean"
          ? parsed.incidentUpdates
          : true,
      inAppNotifications:
        typeof parsed.inAppNotifications === "boolean"
          ? parsed.inAppNotifications
          : true,
    };
  } catch {
    return defaultPreferences;
  }
}

export default function Mysettings({ onLogout }) {
  const [activeSection, setActiveSection] = useState("notifications");
  const [preferences, setPreferences] = useState(loadPreferences);
  const [savedPreferences, setSavedPreferences] = useState(loadPreferences);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [locationStatus, setLocationStatus] = useState("unknown");
  const [logoutModal, setLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const hasChanges =
    JSON.stringify(preferences) !== JSON.stringify(savedPreferences);

  const activeItem = sections.find((item) => item.id === activeSection);
  const ActiveIcon = activeItem?.icon || Settings;

  useEffect(() => {
    if (!navigator.permissions?.query) return;

    navigator.permissions
      .query({ name: "geolocation" })
      .then((result) => {
        setLocationStatus(result.state);
      })
      .catch(() => setLocationStatus("unknown"));
  }, []);

  const updatePreference = (key, value) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
    setMessage("");
    setError("");
  };

  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
      setSavedPreferences({ ...preferences });
      setError("");
      setMessage("Preferences saved in this browser.");
    } catch {
      setError("Unable to save preferences in this browser.");
      setMessage("");
    }
  };

  const handleReset = () => {
    setPreferences({ ...savedPreferences });
    setMessage("");
    setError("");
  };

  const changeSection = (id) => {
    setActiveSection(id);
    setMessage("");
    setError("");
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      () => {
        setLocationStatus("granted");
        setError("");
        setMessage("Location access is available.");
      },
      (err) => {
        setLocationStatus("denied");
        setMessage("");
        setError(
          err.code === 1
            ? "Location access was denied. You can change it in your browser settings."
            : "Unable to get your location. Please try again."
        );
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  };

  const handleLogout = async () => {
    if (typeof onLogout !== "function") {
      setLogoutModal(false);
      setError(
        "Logout is not connected yet. Pass your existing authenticated logout function as onLogout."
      );
      return;
    }

    setLoggingOut(true);
    setError("");

    try {
      await onLogout();
      setLogoutModal(false);
    } catch (err) {
      setError(err?.message || "Unable to log out. Please try again.");
      setLogoutModal(false);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="min-h-full space-y-6 pb-8 text-slate-200">
      {/* PAGE HEADER */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-400">
              Citizen Preferences
            </span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-[28px]">
            My Settings
          </h1>

          <p className="mt-1.5 max-w-xl text-xs leading-5 text-slate-500 sm:text-sm">
            Manage your notification preferences, privacy, and support options.
          </p>
        </div>

        {activeSection === "notifications" && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              disabled={!hasChanges}
              className="flex h-10 items-center gap-2 rounded-md border border-[#254158] bg-[#0a1b2b] px-3 text-xs font-medium text-slate-300 transition hover:border-slate-500 disabled:opacity-40"
            >
              <RotateCcw size={14} />
              Reset
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={!hasChanges}
              className="flex h-10 items-center gap-2 rounded-md border border-cyan-400/30 bg-cyan-400/10 px-4 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-400/15 disabled:opacity-40"
            >
              <Save size={14} />
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* MAIN LAYOUT */}
      <div className="grid items-start gap-5 xl:grid-cols-[245px_minmax(0,1fr)]">
        {/* SETTINGS SIDEBAR */}
        <aside className="rounded-lg border border-[#173149] bg-[#091a2a] p-3">
          <p className="px-3 pb-3 pt-2 text-[9px] font-semibold uppercase tracking-[0.17em] text-slate-600">
            Preferences
          </p>

          <nav className="space-y-1">
            {sections.map((section) => {
              const Icon = section.icon;
              const active = activeSection === section.id;

              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => changeSection(section.id)}
                  className={`group flex min-h-[43px] w-full items-center gap-3 rounded-md px-3 text-left text-xs font-medium transition ${
                    active
                      ? "bg-cyan-400/[0.09] text-white"
                      : "text-slate-400 hover:bg-white/[0.035] hover:text-slate-200"
                  }`}
                >
                  <Icon
                    size={17}
                    strokeWidth={1.8}
                    className={
                      active
                        ? "text-cyan-400"
                        : "text-slate-500 group-hover:text-slate-300"
                    }
                  />

                  <span className="flex-1">{section.label}</span>

                  {active && (
                    <ChevronRight size={14} className="text-cyan-400" />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="mt-5 border-t border-[#173149] pt-4">
            <div className="flex items-center gap-2.5 rounded-md border border-[#173149] bg-[#0b2031] p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-400/10">
                <ShieldCheck size={16} className="text-emerald-400" />
              </div>

              <div>
                <p className="text-[10px] font-semibold text-slate-200">
                  Citizen Account
                </p>
                <p className="mt-1 text-[9px] text-slate-500">
                  Personal preferences
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setLogoutModal(true)}
            className="mt-3 flex w-full items-center gap-3 rounded-md border border-red-400/10 bg-red-400/[0.035] px-3 py-3 text-left text-xs font-medium text-red-400 transition hover:bg-red-400/[0.08]"
          >
            <LogOut size={16} />
            <span className="flex-1">Logout</span>
            <ChevronRight size={14} />
          </button>
        </aside>

        {/* CONTENT PANEL */}
        <section className="min-w-0 overflow-hidden rounded-lg border border-[#173149] bg-[#091a2a]">
          <div className="flex items-center gap-3 border-b border-[#173149] px-5 py-5 sm:px-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-md border border-cyan-400/15 bg-cyan-400/[0.07]">
              <ActiveIcon size={19} className="text-cyan-400" />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-white">
                {activeItem?.label}
              </h2>
              <p className="mt-1 text-[10px] text-slate-500">
                Manage your {activeItem?.label.toLowerCase()}.
              </p>
            </div>
          </div>

          <div className="space-y-6 p-5 sm:p-6">
            {/* NOTIFICATIONS */}
            {activeSection === "notifications" && (
              <>
                <SectionHeading
                  title="Notification Preferences"
                  description="Choose your preferred notification categories."
                />

                <div className="space-y-3">
                  <ToggleRow
                    icon={AlertTriangle}
                    title="Emergency Alerts"
                    description="Preference for disaster warnings and important emergency alerts."
                    checked={preferences.emergencyAlerts}
                    onChange={(value) =>
                      updatePreference("emergencyAlerts", value)
                    }
                  />

                  <ToggleRow
                    icon={FileText}
                    title="Incident Status Updates"
                    description="Preference for updates about your submitted incident reports."
                    checked={preferences.incidentUpdates}
                    onChange={(value) =>
                      updatePreference("incidentUpdates", value)
                    }
                  />

                  <ToggleRow
                    icon={Bell}
                    title="In-App Notifications"
                    description="Preference for notification messages inside your account."
                    checked={preferences.inAppNotifications}
                    onChange={(value) =>
                      updatePreference("inAppNotifications", value)
                    }
                  />
                </div>

                <div className="flex items-start gap-3 rounded-md border border-amber-400/15 bg-amber-400/[0.04] p-4">
                  <Info size={16} className="mt-0.5 shrink-0 text-amber-400" />
                  <p className="text-[11px] leading-5 text-slate-400">
                    Preferences are currently saved in this browser only.
                    They do not yet control backend notifications, email,
                    or emergency alert delivery. Critical safety alerts
                    should remain available regardless of these preferences.
                  </p>
                </div>
              </>
            )}

            {/* PRIVACY */}
            {activeSection === "privacy" && (
              <>
                <SectionHeading
                  title="Privacy & Permissions"
                  description="Understand how location and account information are used."
                />

                <div className="space-y-3">
                  <div className="rounded-md border border-[#173149] bg-[#0b2031] p-4">
                    <div className="flex items-start gap-3">
                      <IconBox icon={MapPin} />

                      <div className="min-w-0 flex-1">
                        <h3 className="text-xs font-semibold text-slate-200">
                          Location Permission
                        </h3>

                        <p className="mt-1.5 text-[11px] leading-5 text-slate-500">
                          Location access can help identify nearby emergency
                          services and assist with incident location selection.
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-3">
                          <StatusPill status={locationStatus} />

                          <button
                            type="button"
                            onClick={requestLocation}
                            className="rounded-md border border-cyan-400/20 bg-cyan-400/[0.07] px-3 py-2 text-[10px] font-semibold text-cyan-300 transition hover:bg-cyan-400/[0.12]"
                          >
                            Request Location Access
                          </button>
                        </div>

                        <p className="mt-3 text-[10px] leading-5 text-slate-500">
                          To revoke permission, use your browser's site settings.
                          Location permission normally requires HTTPS or localhost.
                        </p>
                      </div>
                    </div>
                  </div>

                  <InfoRow
                    icon={LockKeyhole}
                    title="Account Security"
                    description="Your password and account information are managed through the Profile page."
                  />

                  <InfoRow
                    icon={Database}
                    title="Personal Information"
                    description="Your incident reports and account details are managed by SurakshaAI's existing backend services."
                  />

                  <InfoRow
                    icon={ShieldCheck}
                    title="Report Privacy"
                    description="Incident reports should only be accessible to their owners and appropriately authorized response personnel."
                  />
                </div>
              </>
            )}

            {/* HELP & SUPPORT */}
            {activeSection === "support" && (
              <>
                <SectionHeading
                  title="Help & Support"
                  description="Find answers and learn how to use SurakshaAI."
                />

                <div className="rounded-md border border-red-400/15 bg-red-400/[0.04] p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-red-400/10">
                      <Phone size={19} className="text-red-400" />
                    </div>

                    <div className="flex-1">
                      <h3 className="text-xs font-semibold text-white">
                        Need Emergency Assistance?
                      </h3>

                      <p className="mt-1.5 text-[11px] leading-5 text-slate-400">
                        If you are in immediate danger in India, contact
                        emergency services directly.
                      </p>

                      <a
                        href="tel:112"
                        className="mt-3 inline-flex items-center gap-2 rounded-md border border-red-400/20 bg-red-400/10 px-4 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-400/15"
                      >
                        <Phone size={14} />
                        Call 112
                      </a>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 text-xs font-semibold text-slate-200">
                    Frequently Asked Questions
                  </h3>

                  <div className="space-y-2">
                    {faqs.map((faq, index) => (
                      <div
                        key={index}
                        className="overflow-hidden rounded-md border border-[#173149] bg-[#0b2031]"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedFaq(
                              expandedFaq === index ? null : index
                            )
                          }
                          aria-expanded={expandedFaq === index}
                          className="flex w-full items-center justify-between gap-3 p-4 text-left text-xs font-medium text-slate-200"
                        >
                          {faq.question}
                          <ChevronDown
                            size={15}
                            className={`shrink-0 text-slate-500 transition-transform ${
                              expandedFaq === index ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {expandedFaq === index && (
                          <p className="border-t border-[#173149] px-4 py-3 text-[11px] leading-6 text-slate-400">
                            {faq.answer}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-md border border-[#173149] bg-[#0b2031] p-4">
                  <div className="flex items-center gap-3">
                    <IconBox icon={HeartHandshake} />
                    <div>
                      <p className="text-xs font-semibold text-slate-200">
                        Additional Support
                      </p>
                      <p className="mt-1 text-[10px] text-slate-500">
                        For non-emergency questions, contact your designated
                        SurakshaAI support administrator.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ABOUT */}
            {activeSection === "about" && (
              <>
                <SectionHeading
                  title="About SurakshaAI"
                  description="Learn more about the emergency management platform."
                />

                <div className="rounded-md border border-[#173149] bg-[#0b2031] p-5 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10">
                    <ShieldCheck size={27} className="text-cyan-400" />
                  </div>

                  <h3 className="mt-4 text-lg font-semibold text-white">
                    SurakshaAI
                  </h3>

                  <p className="mt-1 text-[11px] text-slate-500">
                    Emergency Management & Citizen Safety Platform
                  </p>

                  <span className="mt-3 inline-flex rounded-full border border-cyan-400/15 bg-cyan-400/[0.06] px-3 py-1 text-[10px] font-medium text-cyan-300">
                    Development Version
                  </span>
                </div>

                <div className="space-y-3">
                  <InfoRow
                    icon={Smartphone}
                    title="Application"
                    description="SurakshaAI Citizen Portal"
                  />

                  <InfoRow
                    icon={ShieldCheck}
                    title="Platform Purpose"
                    description="Citizen incident reporting, emergency information and incident tracking."
                  />

                  <InfoRow
                    icon={ShieldAlert}
                    title="Emergency Safety"
                    description="SurakshaAI is not a substitute for official emergency services. Call 112 for immediate assistance in India."
                  />
                </div>

                <div className="rounded-md border border-[#173149] bg-[#0b2031] p-4">
                  <p className="text-xs font-semibold text-slate-200">
                    Our Mission
                  </p>
                  <p className="mt-2 text-[11px] leading-6 text-slate-400">
                    SurakshaAI aims to improve emergency reporting,
                    communication and response coordination by connecting
                    citizens with authorized disaster management teams.
                  </p>
                </div>
              </>
            )}

            {/* FEEDBACK */}
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-md border border-red-400/20 bg-red-400/[0.06] p-3 text-xs text-red-300"
              >
                <AlertTriangle size={15} className="shrink-0" />
                {error}
              </div>
            )}

            {message && (
              <div
                role="status"
                className="flex items-start gap-2 rounded-md border border-emerald-400/20 bg-emerald-400/[0.06] p-3 text-xs text-emerald-300"
              >
                <CheckCircle2 size={15} className="shrink-0" />
                {message}
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="flex flex-col justify-between gap-3 border-t border-[#173149] bg-[#081827] px-5 py-4 sm:flex-row sm:items-center sm:px-6">
            <p className="text-[10px] text-slate-600">
              SurakshaAI Citizen Portal
            </p>

            {activeSection === "notifications" && (
              <button
                type="button"
                onClick={handleSave}
                disabled={!hasChanges}
                className="flex items-center justify-center gap-2 rounded-md bg-cyan-400 px-4 py-2 text-[11px] font-semibold text-[#061522] transition hover:bg-cyan-300 disabled:opacity-40"
              >
                <Save size={13} />
                Save Preferences
              </button>
            )}
          </div>
        </section>
      </div>

      {/* LOGOUT CONFIRMATION MODAL */}
      {logoutModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            className="w-full max-w-md rounded-xl border border-[#254158] bg-[#091a2a] p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-red-400/10">
                <LogOut size={20} className="text-red-400" />
              </div>

              <button
                type="button"
                onClick={() => setLogoutModal(false)}
                disabled={loggingOut}
                aria-label="Close"
                className="text-slate-500 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <h2
              id="logout-title"
              className="mt-4 text-base font-semibold text-white"
            >
              Logout from SurakshaAI?
            </h2>

            <p className="mt-2 text-xs leading-6 text-slate-400">
              Are you sure you want to log out of your citizen account?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setLogoutModal(false)}
                disabled={loggingOut}
                className="rounded-md border border-[#254158] px-4 py-2.5 text-xs font-medium text-slate-300 hover:bg-white/5"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex items-center gap-2 rounded-md bg-red-500 px-4 py-2.5 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-50"
              >
                <LogOut size={14} />
                {loggingOut ? "Logging out..." : "Yes, Logout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* REUSABLE COMPONENTS */

function SectionHeading({ title, description }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-slate-200">{title}</h3>
      <p className="mt-1.5 text-[10px] leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function IconBox({ icon: Icon }) {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#102a3e]">
      <Icon size={16} className="text-cyan-400" />
    </div>
  );
}

function ToggleRow({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
}) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-[#173149] bg-[#0b2031] p-4">
      <IconBox icon={Icon} />

      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-200">{title}</p>
        <p className="mt-1 text-[10px] leading-4 text-slate-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b2031] ${
          checked
            ? "border-cyan-400 bg-cyan-400"
            : "border-slate-600 bg-slate-700"
        }`}
      >
        <span
          className={`pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

function InfoRow({ icon: Icon, title, description }) {
  return (
    <div className="flex items-start gap-3 rounded-md border border-[#173149] bg-[#0b2031] p-3.5">
      <IconBox icon={Icon} />

      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-200">{title}</p>
        <p className="mt-1 text-[10px] leading-5 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  const config = {
    granted: {
      label: "Allowed",
      style: "bg-emerald-400/10 text-emerald-400",
    },
    denied: {
      label: "Blocked",
      style: "bg-red-400/10 text-red-400",
    },
    prompt: {
      label: "Not Requested",
      style: "bg-amber-400/10 text-amber-400",
    },
    unknown: {
      label: "Not Available",
      style: "bg-slate-400/10 text-slate-400",
    },
  };

  const current = config[status] || config.unknown;

  return (
    <span
      className={`rounded-full px-3 py-1 text-[10px] font-medium ${current.style}`}
    >
      {current.label}
    </span>
  );
}
