const Incident = require("../models/Incident");

/* =========================================
   GET ALL INCIDENTS
========================================= */

const getIncidents = async (req, res) => {
    try {
        const incidents = await Incident.find()
            .populate("reportedBy", "name username email role")
            .populate("assignedOfficer", "name username email role")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: incidents.length,
            incidents,
        });
    } catch (error) {
        console.error("Get Incidents Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch incidents",
        });
    }
};

/* =========================================
   GET SINGLE INCIDENT
========================================= */

const getIncidentById = async (req, res) => {
    try {
        const incident = await Incident.findById(req.params.id)
            .populate("reportedBy", "name username email role")
            .populate("assignedOfficer", "name username email role");

        if (!incident) {
            return res.status(404).json({
                success: false,
                message: "Incident not found",
            });
        }

        return res.status(200).json({
            success: true,
            incident,
        });
    } catch (error) {
        console.error("Get Incident Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch incident",
        });
    }
};

/* =========================================
   CREATE INCIDENT
========================================= */

const createIncident = async (req, res) => {
    try {
        const {
            title,
            description,
            type,
            severity,
            status,
            location,
            peopleAffected,
            reportedBy,
            assignedOfficer,
            source,
            images,
        } = req.body;

        if (
            !title ||
            !type ||
            !location ||
            typeof location !== "object"
        ) {
            return res.status(400).json({
                success: false,
                message: "Title, type and location are required",
            });
        }

        const incident = await Incident.create({
            title: title.trim(),
            description:
                typeof description === "string"
                    ? description.trim()
                    : "",

            type,
            severity: severity || "medium",
            status: status || "reported",

            location: {
                address:
                    typeof location.address === "string"
                        ? location.address.trim()
                        : "",

                city:
                    typeof location.city === "string"
                        ? location.city.trim()
                        : "",

                state:
                    typeof location.state === "string"
                        ? location.state.trim()
                        : "",

                country:
                    typeof location.country === "string"
                        ? location.country.trim()
                        : "India",

                latitude: location.latitude,
                longitude: location.longitude,
            },

            peopleAffected:
                typeof peopleAffected === "number"
                    ? peopleAffected
                    : 0,

            reportedBy: reportedBy || req.user._id,
            assignedOfficer: assignedOfficer || null,

            source:
                source ||
                (req.user.role === "field_officer"
                    ? "field_officer"
                    : req.user.role === "department_officer"
                    ? "department"
                    : "admin"),

            images: Array.isArray(images) ? images : [],
        });

        const populatedIncident =
            await Incident.findById(incident._id)
                .populate(
                    "reportedBy",
                    "name username email role"
                )
                .populate(
                    "assignedOfficer",
                    "name username email role"
                );

        return res.status(201).json({
            success: true,
            message: "Incident created successfully",
            incident: populatedIncident,
        });
    } catch (error) {
        console.error("Create Incident Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to create incident",
        });
    }
};

/* =========================================
   UPDATE INCIDENT
========================================= */

const updateIncident = async (req, res) => {
    try {
        const incident = await Incident.findById(
            req.params.id
        );

        if (!incident) {
            return res.status(404).json({
                success: false,
                message: "Incident not found",
            });
        }

        const {
            title,
            description,
            type,
            severity,
            status,
            location,
            peopleAffected,
            assignedOfficer,
            source,
            images,
        } = req.body;

        if (title !== undefined) {
            incident.title = title.trim();
        }

        if (description !== undefined) {
            incident.description =
                typeof description === "string"
                    ? description.trim()
                    : "";
        }

        if (type !== undefined) {
            incident.type = type;
        }

        if (severity !== undefined) {
            incident.severity = severity;
        }

        if (status !== undefined) {
            incident.status = status;

            if (status === "resolved") {
                incident.resolvedAt = new Date();
            } else {
                incident.resolvedAt = null;
            }
        }

        if (location !== undefined) {
            incident.location = {
                address:
                    typeof location.address === "string"
                        ? location.address.trim()
                        : incident.location?.address || "",

                city:
                    typeof location.city === "string"
                        ? location.city.trim()
                        : incident.location?.city || "",

                state:
                    typeof location.state === "string"
                        ? location.state.trim()
                        : incident.location?.state || "",

                country:
                    typeof location.country === "string"
                        ? location.country.trim()
                        : incident.location?.country || "India",

                latitude:
                    location.latitude ??
                    incident.location?.latitude,

                longitude:
                    location.longitude ??
                    incident.location?.longitude,
            };
        }

        if (peopleAffected !== undefined) {
            incident.peopleAffected = peopleAffected;
        }

        if (assignedOfficer !== undefined) {
            incident.assignedOfficer =
                assignedOfficer || null;
        }

        if (source !== undefined) {
            incident.source = source;
        }

        if (images !== undefined && Array.isArray(images)) {
            incident.images = images;
        }

        await incident.save();

        const updatedIncident =
            await Incident.findById(incident._id)
                .populate(
                    "reportedBy",
                    "name username email role"
                )
                .populate(
                    "assignedOfficer",
                    "name username email role"
                );

        return res.status(200).json({
            success: true,
            message: "Incident updated successfully",
            incident: updatedIncident,
        });
    } catch (error) {
        console.error("Update Incident Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to update incident",
        });
    }
};

/* =========================================
   DELETE INCIDENT
========================================= */

const deleteIncident = async (req, res) => {
    try {
        const incident = await Incident.findById(
            req.params.id
        );

        if (!incident) {
            return res.status(404).json({
                success: false,
                message: "Incident not found",
            });
        }

        await Incident.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Incident deleted successfully",
        });
    } catch (error) {
        console.error("Delete Incident Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to delete incident",
        });
    }
};

module.exports = {
    getIncidents,
    getIncidentById,
    createIncident,
    updateIncident,
    deleteIncident,
};