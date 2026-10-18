import { useCallback, useEffect, useState } from "react";
import {
    Ambulance,
    Edit3,
    Flame,
    Phone,
    Plus,
    Shield,
    Trash2,
    UserRound,
    X,
} from "lucide-react";
import { toast } from "sonner";

const API_URL = "http://localhost:5000/api/emergency-contacts";

const emergencyNumbers = [
    {
        name: "Emergency Services",
        number: "112",
        description: "Police, ambulance & emergency response",
        icon: Shield,
        className: "border-blue-500/20 bg-blue-500/5 text-blue-400",
    },
    {
        name: "Ambulance",
        number: "108",
        description: "Medical emergency assistance",
        icon: Ambulance,
        className: "border-red-500/20 bg-red-500/5 text-red-400",
    },
    {
        name: "Fire Emergency",
        number: "101",
        description: "Fire and rescue services",
        icon: Flame,
        className: "border-orange-500/20 bg-orange-500/5 text-orange-400",
    },
];

async function readApiResponse(response) {
    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.success === false) {
        throw new Error(data.message || `Request failed (${response.status})`);
    }

    return data;
}

function EmergencyContacts() {
    const [contacts, setContacts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        relation: "",
        phone: "",
    });

    const fetchContacts = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(API_URL, {
                method: "GET",
                credentials: "include",
                headers: { Accept: "application/json" },
            });
            const data = await readApiResponse(response);
            setContacts(Array.isArray(data.contacts) ? data.contacts : []);
        } catch (error) {
            console.error("Fetch emergency contacts error:", error);
            toast.error(error.message || "Unable to load emergency contacts.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchContacts();
    }, [fetchContacts]);

    const resetForm = () => {
        setFormData({ name: "", relation: "", phone: "" });
        setEditingId(null);
    };

    const closeModal = () => {
        if (isSubmitting) return;
        setShowModal(false);
        resetForm();
    };

    const openAddModal = () => {
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (contact) => {
        setEditingId(contact._id);
        setFormData({
            name: contact.name || "",
            relation: contact.relation || "",
            phone: contact.phone || "",
        });
        setShowModal(true);
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((previous) => ({ ...previous, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const name = formData.name.trim();
        const relation = formData.relation.trim();
        const phone = formData.phone.trim();

        if (!name || !relation || !phone) {
            toast.error("Please fill all fields.");
            return;
        }

        if (!/^[0-9]{10}$/.test(phone)) {
            toast.error("Enter a valid 10-digit mobile number.");
            return;
        }

        setIsSubmitting(true);
        try {
            const isEditing = Boolean(editingId);
            const response = await fetch(
                isEditing ? `${API_URL}/${editingId}` : API_URL,
                {
                    method: isEditing ? "PUT" : "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify({ name, relation, phone }),
                }
            );

            const data = await readApiResponse(response);

            if (data.contact) {
                setContacts((previous) => {
                    if (isEditing) {
                        return previous.map((contact) =>
                            contact._id === data.contact._id ? data.contact : contact
                        );
                    }
                    return [data.contact, ...previous];
                });
            } else {
                await fetchContacts();
            }

            toast.success(
                data.message ||
                    (isEditing
                        ? "Emergency contact updated successfully."
                        : "Emergency contact added successfully.")
            );
            setShowModal(false);
            resetForm();
        } catch (error) {
            console.error("Save emergency contact error:", error);
            toast.error(error.message || "Unable to save emergency contact.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this emergency contact?"
        );
        if (!confirmed) return;

        setDeletingId(id);
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: "DELETE",
                credentials: "include",
                headers: { Accept: "application/json" },
            });
            const data = await readApiResponse(response);
            setContacts((previous) => previous.filter((contact) => contact._id !== id));
            toast.success(data.message || "Emergency contact deleted successfully.");
        } catch (error) {
            console.error("Delete emergency contact error:", error);
            toast.error(error.message || "Unable to delete emergency contact.");
        } finally {
            setDeletingId(null);
        }
    };

    const handleCall = (phone) => {
        window.location.href = `tel:${phone}`;
    };

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-400">
                        <Phone size={15} />
                        Personal Safety
                    </div>
                    <h1 className="text-2xl font-semibold text-white">Emergency Contacts</h1>
                    <p className="mt-1 text-sm text-slate-400">
                        Manage trusted people you may need to contact during an emergency.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={openAddModal}
                    className="inline-flex items-center justify-center gap-2 rounded-[5px] bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                >
                    <Plus size={17} /> Add Contact
                </button>
            </div>

            {/* Emergency Numbers */}
            <div>
                <div className="mb-3">
                    <h2 className="text-base font-semibold text-white">Emergency Services</h2>
                    <p className="mt-1 text-xs text-slate-500">
                        Important emergency numbers available across India.
                    </p>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    {emergencyNumbers.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.number}
                                type="button"
                                onClick={() => handleCall(item.number)}
                                className={`group flex items-center justify-between rounded-[6px] border p-4 text-left transition hover:bg-white/[0.03] ${item.className}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-[5px] bg-black/10">
                                        <Icon size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-200">{item.name}</p>
                                        <p className="mt-1 text-xs text-slate-500">{item.description}</p>
                                        <p className="mt-2 text-lg font-semibold text-white">{item.number}</p>
                                    </div>
                                </div>
                                <Phone size={17} className="opacity-50 transition group-hover:opacity-100" />
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Trusted Contacts */}
            <div className="overflow-hidden rounded-[6px] border border-[var(--border)] bg-[var(--surface)]">
                <div className="flex flex-col gap-3 border-b border-[var(--border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-base font-semibold text-white">Trusted Contacts</h2>
                        <p className="mt-1 text-xs text-slate-500">
                            {contacts.length} contact{contacts.length !== 1 ? "s" : ""} saved
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={openAddModal}
                        className="inline-flex w-fit items-center gap-2 rounded-[5px] border border-cyan-500/25 bg-cyan-500/5 px-3 py-2 text-xs font-medium text-cyan-400 transition hover:bg-cyan-500/10"
                    >
                        <Plus size={14} /> Add New
                    </button>
                </div>

                {isLoading ? (
                    <div className="px-5 py-16 text-center text-sm text-slate-400">
                        Loading emergency contacts...
                    </div>
                ) : contacts.length > 0 ? (
                    <div className="divide-y divide-[var(--border)]">
                        {contacts.map((contact) => (
                            <div
                                key={contact._id}
                                className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cyan-500/10">
                                        <UserRound size={20} className="text-cyan-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-200">{contact.name}</p>
                                        <p className="mt-1 text-xs text-slate-500">{contact.relation}</p>
                                        <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                                            <Phone size={12} /> {contact.phone}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={() => handleCall(contact.phone)}
                                        className="inline-flex items-center gap-1.5 rounded-[5px] border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs font-medium text-emerald-400 transition hover:bg-emerald-500/10"
                                    >
                                        <Phone size={14} /> Call
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => openEditModal(contact)}
                                        className="flex h-8 w-8 items-center justify-center rounded-[4px] text-slate-500 transition hover:bg-slate-800 hover:text-cyan-400"
                                        title="Edit Contact"
                                        aria-label={`Edit ${contact.name}`}
                                    >
                                        <Edit3 size={15} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(contact._id)}
                                        disabled={deletingId === contact._id}
                                        className="flex h-8 w-8 items-center justify-center rounded-[4px] text-slate-500 transition hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                                        title="Delete Contact"
                                        aria-label={`Delete ${contact.name}`}
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="px-5 py-16 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[5px] bg-slate-800">
                            <UserRound size={22} className="text-slate-500" />
                        </div>
                        <h3 className="mt-3 text-sm font-semibold text-slate-300">No emergency contacts</h3>
                        <p className="mt-1 text-xs text-slate-600">
                            Add someone you trust for emergency situations.
                        </p>
                        <button
                            type="button"
                            onClick={openAddModal}
                            className="mt-4 inline-flex items-center gap-2 rounded-[5px] bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950"
                        >
                            <Plus size={14} /> Add Contact
                        </button>
                    </div>
                )}
            </div>

            {/* Safety Notice */}
            <div className="flex items-start gap-3 rounded-[6px] border border-amber-500/15 bg-amber-500/5 p-4">
                <Shield size={18} className="mt-0.5 shrink-0 text-amber-400" />
                <div>
                    <p className="text-xs font-medium text-amber-300">Keep your contacts updated</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                        Make sure the phone numbers of your trusted contacts are current so they can be reached when needed.
                    </p>
                </div>
            </div>

            {/* Add / Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-[6px] border border-slate-700 bg-[#0b111d] shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
                            <div>
                                <h2 className="text-base font-semibold text-white">
                                    {editingId ? "Edit Emergency Contact" : "Add Emergency Contact"}
                                </h2>
                                <p className="mt-1 text-xs text-slate-500">Enter trusted contact details.</p>
                            </div>
                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={isSubmitting}
                                className="flex h-8 w-8 items-center justify-center rounded-[4px] text-slate-500 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
                                aria-label="Close modal"
                            >
                                <X size={17} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4 p-5">
                            <div>
                                <label htmlFor="contact-name" className="mb-2 block text-xs font-medium text-slate-300">
                                    Full Name
                                </label>
                                <input
                                    id="contact-name"
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter full name"
                                    maxLength={100}
                                    required
                                    className="w-full rounded-[5px] border border-slate-700 bg-[#091522] px-3 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-cyan-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="contact-relation" className="mb-2 block text-xs font-medium text-slate-300">
                                    Relationship
                                </label>
                                <select
                                    id="contact-relation"
                                    name="relation"
                                    value={formData.relation}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-[5px] border border-slate-700 bg-[#091522] px-3 py-2.5 text-sm text-slate-200 outline-none transition focus:border-cyan-500"
                                >
                                    <option value="">Select relationship</option>
                                    <option value="Father">Father</option>
                                    <option value="Mother">Mother</option>
                                    <option value="Brother">Brother</option>
                                    <option value="Sister">Sister</option>
                                    <option value="Spouse">Spouse</option>
                                    <option value="Friend">Friend</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="contact-phone" className="mb-2 block text-xs font-medium text-slate-300">
                                    Mobile Number
                                </label>
                                <input
                                    id="contact-phone"
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    maxLength={10}
                                    inputMode="numeric"
                                    pattern="[0-9]{10}"
                                    placeholder="Enter 10-digit mobile number"
                                    required
                                    className="w-full rounded-[5px] border border-slate-700 bg-[#091522] px-3 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-cyan-500"
                                />
                            </div>
                            <div className="flex justify-end gap-2 border-t border-slate-800 pt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={isSubmitting}
                                    className="rounded-[5px] border border-slate-700 px-4 py-2.5 text-xs font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="rounded-[5px] bg-cyan-500 px-4 py-2.5 text-xs font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isSubmitting
                                        ? "Saving..."
                                        : editingId
                                          ? "Update Contact"
                                          : "Save Contact"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EmergencyContacts;
