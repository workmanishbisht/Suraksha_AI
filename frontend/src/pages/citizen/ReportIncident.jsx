import { useState } from "react";
import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle2,
    ImagePlus,
    LocateFixed,
    MapPin,
    Send,
    ShieldAlert,
    Upload,
    Users,
    X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const API_BASE_URL = "http://localhost:5000/api";

function ReportIncident() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        incidentType: "",
        severity: "",
        address: "",
        city: "",
        state: "",
        country: "India",
        latitude: "",
        longitude: "",
        description: "",
        peopleAffected: "0",
        contact: "",
    });

    const [image, setImage] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [detecting, setDetecting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Please select a valid image.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size should be less than 5MB.");
            return;
        }

        setImage(file);
    };

    const removeImage = () => {
        setImage(null);
    };

    const detectLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser.");
            return;
        }

        setDetecting(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setFormData((prev) => ({
                    ...prev,
                    latitude: position.coords.latitude.toFixed(6),
                    longitude: position.coords.longitude.toFixed(6),
                }));

                setDetecting(false);
                toast.success("Location coordinates detected.");
            },
            () => {
                setDetecting(false);
                toast.error("Unable to detect your location.");
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    };

    const fileToDataUrl = (file) =>
        new Promise((resolve, reject) => {
            if (!file) {
                resolve(null);
                return;
            }

            const reader = new FileReader();

            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error("Unable to read image."));
            reader.readAsDataURL(file);
        });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (
            !formData.title.trim() ||
            !formData.incidentType ||
            !formData.severity ||
            !formData.city.trim() ||
            !formData.description.trim()
        ) {
            toast.error("Please fill all required fields.");
            return;
        }

        setSubmitting(true);

        try {
            const imageData = await fileToDataUrl(image);

            const response = await fetch(`${API_BASE_URL}/incidents`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: formData.title.trim(),
                    description: formData.description.trim(),
                    type: formData.incidentType,
                    severity: formData.severity,
                    status: "reported",
                    peopleAffected: Number(formData.peopleAffected) || 0,
                    location: {
                        address: formData.address.trim(),
                        city: formData.city.trim(),
                        state: formData.state.trim(),
                        country: formData.country.trim() || "India",
                        latitude:
                            formData.latitude === ""
                                ? undefined
                                : Number(formData.latitude),
                        longitude:
                            formData.longitude === ""
                                ? undefined
                                : Number(formData.longitude),
                    },
                    source: "citizen",
                    images: imageData ? [imageData] : [],
                    contactNumber: formData.contact.trim(),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.message || "Failed to submit incident report."
                );
            }

            toast.success(
                data?.message || "Incident report submitted successfully."
            );

            setFormData({
                title: "",
                incidentType: "",
                severity: "",
                address: "",
                city: "",
                state: "",
                country: "India",
                latitude: "",
                longitude: "",
                description: "",
                peopleAffected: "0",
                contact: "",
            });

            setImage(null);

            setTimeout(() => {
                navigate("/citizen/my-reports");
            }, 700);
        } catch (error) {
            toast.error(
                error.message || "Something went wrong. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <button
                        type="button"
                        onClick={() => navigate("/citizen/dashboard")}
                        className="mb-3 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-cyan-400"
                    >
                        <ArrowLeft size={16} />
                        Back to Dashboard
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-[5px] border border-cyan-500/20 bg-cyan-500/10">
                            <ShieldAlert size={22} className="text-cyan-400" />
                        </div>

                        <div>
                            <h1 className="text-2xl font-semibold text-white">
                                Report an Incident
                            </h1>
                            <p className="mt-1 text-sm text-slate-400">
                                Submit details about an emergency or safety
                                incident.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 rounded-[5px] border border-emerald-500/20 bg-emerald-500/5 px-3 py-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="text-xs font-medium text-emerald-400">
                        Reporting System Online
                    </span>
                </div>
            </div>

            {/* Emergency Notice */}
            <div className="flex gap-3 rounded-[6px] border border-red-500/20 bg-red-500/5 p-4">
                <AlertTriangle size={19} className="mt-0.5 text-red-400" />

                <div>
                    <h3 className="text-sm font-semibold text-red-300">
                        Life-threatening emergency?
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-slate-400">
                        For immediate danger or life-threatening situations,
                        contact your local emergency services first.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_340px]">
                    {/* Main Form */}
                    <div className="rounded-[6px] border border-[var(--border)] bg-[var(--surface)]">
                        <div className="border-b border-[var(--border)] px-5 py-4">
                            <h2 className="text-base font-semibold text-white">
                                Incident Details
                            </h2>
                            <p className="mt-1 text-xs text-slate-500">
                                Provide accurate information to help authorities
                                respond quickly.
                            </p>
                        </div>

                        <div className="space-y-5 p-5">
                            {/* Title */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-300">
                                    Incident Title
                                    <span className="ml-1 text-red-400">*</span>
                                </label>

                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g. Road Accident near Rajpur Road"
                                    maxLength={120}
                                    className="w-full rounded-[5px] border border-slate-700 bg-[#091522] px-3 py-3 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-cyan-500"
                                />
                            </div>

                            {/* Incident Type + Severity */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-300">
                                        Incident Type
                                        <span className="ml-1 text-red-400">
                                            *
                                        </span>
                                    </label>

                                    <select
                                        name="incidentType"
                                        value={formData.incidentType}
                                        onChange={handleChange}
                                        className="w-full rounded-[5px] border border-slate-700 bg-[#091522] px-3 py-3 text-sm text-slate-200 outline-none transition focus:border-cyan-500"
                                    >
                                        <option value="">
                                            Select incident type
                                        </option>
                                        <option value="fire">Fire</option>
                                        <option value="road_accident">
                                            Road Accident
                                        </option>
                                        <option value="flood">Flood</option>
                                        <option value="earthquake">
                                            Earthquake
                                        </option>
                                        <option value="medical_emergency">
                                            Medical Emergency
                                        </option>
                                        <option value="landslide">
                                            Landslide
                                        </option>
                                        <option value="forest_fire">
                                            Forest Fire
                                        </option>
                                        <option value="heavy_rain">
                                            Heavy Rain
                                        </option>
                                        <option value="infrastructure">
                                            Infrastructure Damage
                                        </option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-300">
                                        Severity
                                        <span className="ml-1 text-red-400">
                                            *
                                        </span>
                                    </label>

                                    <select
                                        name="severity"
                                        value={formData.severity}
                                        onChange={handleChange}
                                        className="w-full rounded-[5px] border border-slate-700 bg-[#091522] px-3 py-3 text-sm text-slate-200 outline-none transition focus:border-cyan-500"
                                    >
                                        <option value="">
                                            Select severity
                                        </option>
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="critical">
                                            Critical
                                        </option>
                                    </select>
                                </div>
                            </div>

                            {/* Location */}
                            <div>
                                <div className="mb-2 flex items-center justify-between gap-3">
                                    <label className="block text-sm font-medium text-slate-300">
                                        Incident Location
                                        <span className="ml-1 text-red-400">
                                            *
                                        </span>
                                    </label>

                                    <button
                                        type="button"
                                        onClick={detectLocation}
                                        disabled={detecting}
                                        className="inline-flex items-center gap-1.5 text-xs font-medium text-cyan-400 transition hover:text-cyan-300 disabled:opacity-50"
                                    >
                                        <LocateFixed size={14} />
                                        {detecting
                                            ? "Detecting..."
                                            : "Use My Location"}
                                    </button>
                                </div>

                                <div className="mb-4">
                                    <div className="relative">
                                        <MapPin
                                            size={18}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                                        />

                                        <input
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            placeholder="Address / Landmark"
                                            className="w-full rounded-[5px] border border-slate-700 bg-[#091522] py-3 pl-10 pr-3 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-cyan-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        placeholder="City *"
                                        className="w-full rounded-[5px] border border-slate-700 bg-[#091522] px-3 py-3 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-cyan-500"
                                    />

                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        placeholder="State"
                                        className="w-full rounded-[5px] border border-slate-700 bg-[#091522] px-3 py-3 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-cyan-500"
                                    />

                                    <input
                                        type="text"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleChange}
                                        placeholder="Country"
                                        className="w-full rounded-[5px] border border-slate-700 bg-[#091522] px-3 py-3 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-cyan-500"
                                    />
                                </div>

                                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <input
                                        type="number"
                                        step="any"
                                        name="latitude"
                                        value={formData.latitude}
                                        onChange={handleChange}
                                        placeholder="Latitude"
                                        className="w-full rounded-[5px] border border-slate-700 bg-[#091522] px-3 py-3 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-cyan-500"
                                    />

                                    <input
                                        type="number"
                                        step="any"
                                        name="longitude"
                                        value={formData.longitude}
                                        onChange={handleChange}
                                        placeholder="Longitude"
                                        className="w-full rounded-[5px] border border-slate-700 bg-[#091522] px-3 py-3 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-cyan-500"
                                    />
                                </div>

                                <p className="mt-2 text-xs text-slate-500">
                                    Example: Rajpur Road, Dehradun
                                </p>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-300">
                                    Incident Description
                                    <span className="ml-1 text-red-400">*</span>
                                </label>

                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={6}
                                    maxLength={1000}
                                    placeholder="Describe what happened, when it happened, and any important details..."
                                    className="w-full resize-none rounded-[5px] border border-slate-700 bg-[#091522] px-3 py-3 text-sm leading-6 text-white placeholder:text-slate-600 outline-none transition focus:border-cyan-500"
                                />

                                <div className="mt-1 flex justify-end">
                                    <span className="text-xs text-slate-600">
                                        {formData.description.length}/1000
                                    </span>
                                </div>
                            </div>

                            {/* People Affected + Contact */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-300">
                                        People Affected
                                        <span className="ml-2 text-xs font-normal text-slate-500">
                                            Optional
                                        </span>
                                    </label>

                                    <div className="relative">
                                        <Users
                                            size={17}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                                        />

                                        <input
                                            type="number"
                                            min="0"
                                            name="peopleAffected"
                                            value={formData.peopleAffected}
                                            onChange={handleChange}
                                            className="w-full rounded-[5px] border border-slate-700 bg-[#091522] py-3 pl-10 pr-3 text-sm text-white outline-none transition focus:border-cyan-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-300">
                                        Contact Number
                                        <span className="ml-2 text-xs font-normal text-slate-500">
                                            Optional
                                        </span>
                                    </label>

                                    <input
                                        type="tel"
                                        name="contact"
                                        value={formData.contact}
                                        onChange={handleChange}
                                        placeholder="Enter contact number"
                                        className="w-full rounded-[5px] border border-slate-700 bg-[#091522] px-3 py-3 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-cyan-500"
                                    />
                                </div>
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-300">
                                    Incident Photo
                                    <span className="ml-2 text-xs font-normal text-slate-500">
                                        Optional
                                    </span>
                                </label>

                                {!image ? (
                                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-[5px] border border-dashed border-slate-700 bg-[#091522] px-5 py-8 transition hover:border-cyan-500/50 hover:bg-cyan-500/[0.02]">
                                        <input
                                            type="file"
                                            accept="image/png,image/jpeg,image/webp"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />

                                        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-[5px] bg-slate-800">
                                            <ImagePlus
                                                size={21}
                                                className="text-slate-400"
                                            />
                                        </div>

                                        <p className="text-sm font-medium text-slate-300">
                                            Upload incident photo
                                        </p>

                                        <p className="mt-1 text-xs text-slate-600">
                                            PNG, JPG or WEBP • Max 5MB
                                        </p>
                                    </label>
                                ) : (
                                    <div className="flex items-center justify-between rounded-[5px] border border-slate-700 bg-[#091522] p-3">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[5px] bg-cyan-500/10">
                                                <Upload
                                                    size={18}
                                                    className="text-cyan-400"
                                                />
                                            </div>

                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium text-slate-200">
                                                    {image.name}
                                                </p>

                                                <p className="text-xs text-slate-500">
                                                    {(
                                                        image.size /
                                                        1024 /
                                                        1024
                                                    ).toFixed(2)}{" "}
                                                    MB
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] text-slate-500 transition hover:bg-red-500/10 hover:text-red-400"
                                        >
                                            <X size={17} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Form Footer */}
                        <div className="flex flex-col-reverse gap-3 border-t border-[var(--border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-end">
                            <button
                                type="button"
                                onClick={() => navigate("/citizen/dashboard")}
                                className="rounded-[5px] border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="inline-flex items-center justify-center gap-2 rounded-[5px] bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {submitting ? (
                                    <>
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900/30 border-t-slate-900" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Send size={16} />
                                        Submit Report
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Right Information Panel */}
                    <div className="space-y-5">
                        <div className="rounded-[6px] border border-[var(--border)] bg-[var(--surface)]">
                            <div className="border-b border-[var(--border)] px-5 py-4">
                                <h2 className="text-base font-semibold text-white">
                                    How It Works
                                </h2>
                            </div>

                            <div className="space-y-5 p-5">
                                {[
                                    [
                                        "1",
                                        "Submit Report",
                                        "Provide accurate incident information.",
                                    ],
                                    [
                                        "2",
                                        "Review & Assignment",
                                        "Authorities review and assign the report.",
                                    ],
                                    [
                                        "3",
                                        "Track Progress",
                                        "Track your report status from My Reports.",
                                    ],
                                ].map(([number, title, text]) => (
                                    <div
                                        key={number}
                                        className="flex gap-3"
                                    >
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-sm font-semibold text-cyan-400">
                                            {number}
                                        </div>

                                        <div>
                                            <p className="text-sm font-medium text-slate-200">
                                                {title}
                                            </p>
                                            <p className="mt-1 text-xs leading-5 text-slate-500">
                                                {text}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-[6px] border border-emerald-500/20 bg-emerald-500/5 p-5">
                            <div className="flex gap-3">
                                <CheckCircle2
                                    size={20}
                                    className="shrink-0 text-emerald-400"
                                />

                                <div>
                                    <h3 className="text-sm font-semibold text-emerald-300">
                                        Your information is secure
                                    </h3>

                                    <p className="mt-1 text-xs leading-5 text-slate-500">
                                        Submitted reports are securely recorded
                                        and can be tracked through your account.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default ReportIncident;
