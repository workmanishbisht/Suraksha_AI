import { useState } from "react";
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

const initialContacts = [
    {
        id: 1,
        name: "Amit Sharma",
        relation: "Brother",
        phone: "9876543210",
    },
    {
        id: 2,
        name: "Neha Sharma",
        relation: "Mother",
        phone: "9876543211",
    },
];

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

function EmergencyContacts() {
    const [contacts, setContacts] = useState(initialContacts);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        relation: "",
        phone: "",
    });

    const resetForm = () => {
        setFormData({
            name: "",
            relation: "",
            phone: "",
        });
        setEditingId(null);
    };

    const closeModal = () => {
        setShowModal(false);
        resetForm();
    };

    const openAddModal = () => {
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (contact) => {
        setEditingId(contact.id);

        setFormData({
            name: contact.name,
            relation: contact.relation,
            phone: contact.phone,
        });

        setShowModal(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (
            !formData.name.trim() ||
            !formData.relation.trim() ||
            !formData.phone.trim()
        ) {
            toast.error("Please fill all fields.");
            return;
        }

        if (!/^[0-9]{10}$/.test(formData.phone)) {
            toast.error("Enter a valid 10-digit mobile number.");
            return;
        }

        if (editingId) {
            setContacts((prev) =>
                prev.map((contact) =>
                    contact.id === editingId
                        ? {
                              ...contact,
                              name: formData.name.trim(),
                              relation: formData.relation.trim(),
                              phone: formData.phone,
                          }
                        : contact
                )
            );

            toast.success("Emergency contact updated.");
        } else {
            setContacts((prev) => [
                ...prev,
                {
                    id: Date.now(),
                    name: formData.name.trim(),
                    relation: formData.relation.trim(),
                    phone: formData.phone,
                },
            ]);

            toast.success("Emergency contact added.");
        }

        closeModal();
    };

    const handleDelete = (id) => {
        setContacts((prev) =>
            prev.filter((contact) => contact.id !== id)
        );

        toast.success("Emergency contact removed.");
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

                    <h1 className="text-2xl font-semibold text-white">
                        Emergency Contacts
                    </h1>

                    <p className="mt-1 text-sm text-slate-400">
                        Manage trusted people you may need to contact during
                        an emergency.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={openAddModal}
                    className="inline-flex items-center justify-center gap-2 rounded-[5px] bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                >
                    <Plus size={17} />
                    Add Contact
                </button>
            </div>

            {/* Emergency Numbers */}
            <div>
                <div className="mb-3">
                    <h2 className="text-base font-semibold text-white">
                        Emergency Services
                    </h2>

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
                                        <p className="text-sm font-medium text-slate-200">
                                            {item.name}
                                        </p>

                                        <p className="mt-1 text-xs text-slate-500">
                                            {item.description}
                                        </p>

                                        <p className="mt-2 text-lg font-semibold text-white">
                                            {item.number}
                                        </p>
                                    </div>
                                </div>

                                <Phone
                                    size={17}
                                    className="opacity-50 transition group-hover:opacity-100"
                                />
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Trusted Contacts */}
            <div className="overflow-hidden rounded-[6px] border border-[var(--border)] bg-[var(--surface)]">

                <div className="flex flex-col gap-3 border-b border-[var(--border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-base font-semibold text-white">
                            Trusted Contacts
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            {contacts.length} contact
                            {contacts.length !== 1 ? "s" : ""} saved
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openAddModal}
                        className="inline-flex w-fit items-center gap-2 rounded-[5px] border border-cyan-500/25 bg-cyan-500/5 px-3 py-2 text-xs font-medium text-cyan-400 transition hover:bg-cyan-500/10"
                    >
                        <Plus size={14} />
                        Add New
                    </button>
                </div>

                {contacts.length > 0 ? (
                    <div className="divide-y divide-[var(--border)]">
                        {contacts.map((contact) => (
                            <div
                                key={contact.id}
                                className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cyan-500/10">
                                        <UserRound
                                            size={20}
                                            className="text-cyan-400"
                                        />
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold text-slate-200">
                                            {contact.name}
                                        </p>

                                        <p className="mt-1 text-xs text-slate-500">
                                            {contact.relation}
                                        </p>

                                        <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                                            <Phone size={12} />
                                            {contact.phone}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleCall(contact.phone)
                                        }
                                        className="inline-flex items-center gap-1.5 rounded-[5px] border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs font-medium text-emerald-400 transition hover:bg-emerald-500/10"
                                    >
                                        <Phone size={14} />
                                        Call
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            openEditModal(contact)
                                        }
                                        className="flex h-8 w-8 items-center justify-center rounded-[4px] text-slate-500 transition hover:bg-slate-800 hover:text-cyan-400"
                                        title="Edit Contact"
                                    >
                                        <Edit3 size={15} />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleDelete(contact.id)
                                        }
                                        className="flex h-8 w-8 items-center justify-center rounded-[4px] text-slate-500 transition hover:bg-red-500/10 hover:text-red-400"
                                        title="Delete Contact"
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
                            <UserRound
                                size={22}
                                className="text-slate-500"
                            />
                        </div>

                        <h3 className="mt-3 text-sm font-semibold text-slate-300">
                            No emergency contacts
                        </h3>

                        <p className="mt-1 text-xs text-slate-600">
                            Add someone you trust for emergency situations.
                        </p>

                        <button
                            type="button"
                            onClick={openAddModal}
                            className="mt-4 inline-flex items-center gap-2 rounded-[5px] bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950"
                        >
                            <Plus size={14} />
                            Add Contact
                        </button>
                    </div>
                )}
            </div>

            {/* Safety Notice */}
            <div className="flex items-start gap-3 rounded-[6px] border border-amber-500/15 bg-amber-500/5 p-4">
                <Shield
                    size={18}
                    className="mt-0.5 shrink-0 text-amber-400"
                />

                <div>
                    <p className="text-xs font-medium text-amber-300">
                        Keep your contacts updated
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                        Make sure the phone numbers of your trusted contacts
                        are current so they can be reached when needed.
                    </p>
                </div>
            </div>

            {/* Add / Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-[6px] border border-slate-700 bg-[#0b111d] shadow-2xl">

                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
                            <div>
                                <h2 className="text-base font-semibold text-white">
                                    {editingId
                                        ? "Edit Emergency Contact"
                                        : "Add Emergency Contact"}
                                </h2>

                                <p className="mt-1 text-xs text-slate-500">
                                    Enter trusted contact details.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeModal}
                                className="flex h-8 w-8 items-center justify-center rounded-[4px] text-slate-500 transition hover:bg-slate-800 hover:text-white"
                            >
                                <X size={17} />
                            </button>
                        </div>

                        {/* Form */}
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-4 p-5"
                        >
                            <div>
                                <label className="mb-2 block text-xs font-medium text-slate-300">
                                    Full Name
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter full name"
                                    className="w-full rounded-[5px] border border-slate-700 bg-[#091522] px-3 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-cyan-500"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-medium text-slate-300">
                                    Relationship
                                </label>

                                <select
                                    name="relation"
                                    value={formData.relation}
                                    onChange={handleChange}
                                    className="w-full rounded-[5px] border border-slate-700 bg-[#091522] px-3 py-2.5 text-sm text-slate-200 outline-none transition focus:border-cyan-500"
                                >
                                    <option value="">
                                        Select relationship
                                    </option>
                                    <option value="Father">
                                        Father
                                    </option>
                                    <option value="Mother">
                                        Mother
                                    </option>
                                    <option value="Brother">
                                        Brother
                                    </option>
                                    <option value="Sister">
                                        Sister
                                    </option>
                                    <option value="Spouse">
                                        Spouse
                                    </option>
                                    <option value="Friend">
                                        Friend
                                    </option>
                                    <option value="Other">
                                        Other
                                    </option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-medium text-slate-300">
                                    Mobile Number
                                </label>

                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    maxLength={10}
                                    placeholder="Enter 10-digit mobile number"
                                    className="w-full rounded-[5px] border border-slate-700 bg-[#091522] px-3 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-cyan-500"
                                />
                            </div>

                            <div className="flex justify-end gap-2 border-t border-slate-800 pt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="rounded-[5px] border border-slate-700 px-4 py-2.5 text-xs font-medium text-slate-300 transition hover:bg-slate-800"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="rounded-[5px] bg-cyan-500 px-4 py-2.5 text-xs font-semibold text-slate-950 transition hover:bg-cyan-400"
                                >
                                    {editingId
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