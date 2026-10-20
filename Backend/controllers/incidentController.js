const mongoose = require("mongoose");
const Incident = require("../models/Incident");

const getUserId = (req) => req.user?._id || req.user?.id;

const getUserRole = (req) =>
    String(req.user?.role || "").toLowerCase();

const isAdmin = (req) => getUserRole(req) === "admin";

const isCitizen = (req) => getUserRole(req) === "citizen";

const isFieldOfficer = (req) =>
    getUserRole(req) === "field_officer";

const isDepartmentOfficer = (req) =>
    getUserRole(req) === "department_officer";

const isValidId = (id) => mongoose.isValidObjectId(id);

const populateIncident = (query) =>
    query
        .populate("reportedBy", "name username email role")
        .populate("assignedOfficer", "name username email role");

/*
 * GET ALL INCIDENTS
 * Admin: all incidents
 * Citizen: own reports only
 * Officers: assigned incidents only
 */
const getIncidents = async (req, res) => {
    try {
        const userId = getUserId(req);

        if (!userId || !isValidId(userId)) {
            return res.status(401).json({
                success: false,
                message: "Valid authenticated user required",
            });
        }

        let filter = {};

        if (isCitizen(req)) {
            filter = { reportedBy: userId };
        } else if (isFieldOfficer(req) || isDepartmentOfficer(req)) {
            filter = { assignedOfficer: userId };
        } else if (!isAdmin(req)) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to view incidents",
            });
        }

        const incidents = await populateIncident(
            Incident.find(filter).sort({ createdAt: -1 })
        );

        return res.status(200).json({
            success: true,
            count: incidents.length,
            incidents,
        });
    } catch (error) {
        console.error("Get Incidents Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch incidents",
        });
    }
};

/*
 * GET SINGLE INCIDENT
 */
const getIncidentById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = getUserId(req);

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid incident ID",
            });
        }

        const incident = await populateIncident(
            Incident.findById(id)
        );

        if (!incident) {
            return res.status(404).json({
                success: false,
                message: "Incident not found",
            });
        }

        const ownsReport =
            incident.reportedBy &&
            String(incident.reportedBy._id) === String(userId);

        const isAssigned =
            incident.assignedOfficer &&
            String(incident.assignedOfficer._id) === String(userId);

        if (
            !isAdmin(req) &&
            !(isCitizen(req) && ownsReport) &&
            !(
                (isFieldOfficer(req) || isDepartmentOfficer(req)) &&
                isAssigned
            )
        ) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to view this incident",
            });
        }

        return res.status(200).json({
            success: true,
            incident,
        });
    } catch (error) {
        console.error("Get Incident Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch incident",
        });
    }
};

/*
 * CREATE INCIDENT
 * Ownership and source are assigned by the server.
 */
const createIncident = async (req, res) => {
    try {
        const userId = getUserId(req);
        const role = getUserRole(req);

        if (!userId || !isValidId(userId)) {
            return res.status(401).json({
                success: false,
                message: "Valid authenticated user required",
            });
        }

        if (
            !["admin", "citizen", "field_officer", "department_officer"].includes(
                role
            )
        ) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to create incidents",
            });
        }

        const {
            title,
            description,
            type,
            severity,
            location,
            peopleAffected,
            images,
            contactNumber,
        } = req.body;

        if (
            typeof title !== "string" ||
            !title.trim() ||
            typeof type !== "string" ||
            !location ||
            typeof location !== "object" ||
            Array.isArray(location)
        ) {
            return res.status(400).json({
                success: false,
                message: "Title, type and location are required",
            });
        }

        const normalizedLocation = {
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
                typeof location.country === "string" &&
                    location.country.trim()
                    ? location.country.trim()
                    : "India",
        };

        if (
            location.latitude !== undefined &&
            location.latitude !== null &&
            location.latitude !== ""
        ) {
            normalizedLocation.latitude = Number(location.latitude);
        }

        if (
            location.longitude !== undefined &&
            location.longitude !== null &&
            location.longitude !== ""
        ) {
            normalizedLocation.longitude = Number(location.longitude);
        }

        if (
            (normalizedLocation.latitude !== undefined &&
                !Number.isFinite(normalizedLocation.latitude)) ||
            (normalizedLocation.longitude !== undefined &&
                !Number.isFinite(normalizedLocation.longitude))
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid location coordinates",
            });
        }

        const allowedSeverities = [
            "critical",
            "high",
            "medium",
            "low",
        ];

        const normalizedSeverity = severity || "medium";

        if (!allowedSeverities.includes(normalizedSeverity)) {
            return res.status(400).json({
                success: false,
                message: "Invalid incident severity",
            });
        }

        const normalizedPeopleAffected =
            peopleAffected === undefined
                ? 0
                : Number(peopleAffected);

        if (
            !Number.isFinite(normalizedPeopleAffected) ||
            normalizedPeopleAffected < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid number of people affected",
            });
        }

        if (images !== undefined && !Array.isArray(images)) {
            return res.status(400).json({
                success: false,
                message: "Images must be an array",
            });
        }

        // Citizens cannot choose the initial status or assign officers.
        const initialStatus = isCitizen(req)
            ? "reported"
            : req.body.status || "reported";

        const allowedStatuses = [
            "reported",
            "investigating",
            "responding",
            "resolved",
            "rejected",
        ];

        if (!allowedStatuses.includes(initialStatus)) {
            return res.status(400).json({
                success: false,
                message: "Invalid incident status",
            });
        }

        const sourceByRole = {
            admin: "admin",
            citizen: "citizen",
            field_officer: "field_officer",
            department_officer: "department",
        };

        const incident = await Incident.create({
            title: title.trim(),
            description:
                typeof description === "string"
                    ? description.trim()
                    : "",
            type,
            severity: normalizedSeverity,
            status: initialStatus,
            location: normalizedLocation,
            peopleAffected: normalizedPeopleAffected,
            reportedBy: userId,
            assignedOfficer: null,
            source: sourceByRole[role],
            images: Array.isArray(images) ? images : [],
        });

        const populatedIncident = await populateIncident(
            Incident.findById(incident._id)
        );

        return res.status(201).json({
            success: true,
            message: "Incident created successfully",
            incident: populatedIncident,
        });
    } catch (error) {
        console.error("Create Incident Error:", error);

        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }

        return res.status(500).json({
            success: false,
            message: "Unable to create incident",
        });
    }
};

/*
 * UPDATE INCIDENT
 * Admin: any incident
 * Officers: assigned incidents only
 * Citizen: cannot update incidents through this endpoint
 */
const updateIncident = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = getUserId(req);

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid incident ID",
            });
        }

        const incident = await Incident.findById(id);

        if (!incident) {
            return res.status(404).json({
                success: false,
                message: "Incident not found",
            });
        }

        const isAssigned =
            incident.assignedOfficer &&
            String(incident.assignedOfficer) === String(userId);

        if (
            !isAdmin(req) &&
            !(
                (isFieldOfficer(req) || isDepartmentOfficer(req)) &&
                isAssigned
            )
        ) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to update this incident",
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

        // Officers can only update operational status.
        if (!isAdmin(req)) {
            const allowedKeys = ["status"];
            const suppliedKeys = Object.keys(req.body);

            if (suppliedKeys.some((key) => !allowedKeys.includes(key))) {
                return res.status(403).json({
                    success: false,
                    message: "Officers can only update incident status",
                });
            }

            if (
                status !== undefined &&
                ![
                    "investigating",
                    "responding",
                    "resolved",
                ].includes(status)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid status for officer update",
                });
            }
        }

        if (title !== undefined) {
            if (typeof title !== "string" || !title.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Title must be a non-empty string",
                });
            }

            incident.title = title.trim();
        }

        if (description !== undefined) {
            incident.description =
                typeof description === "string"
                    ? description.trim()
                    : "";
        }

        if (type !== undefined) incident.type = type;
        if (severity !== undefined) incident.severity = severity;

        if (status !== undefined) {
            incident.status = status;
            incident.resolvedAt =
                status === "resolved" ? new Date() : null;
        }

        if (location !== undefined) {
            if (
                !location ||
                typeof location !== "object" ||
                Array.isArray(location)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid incident location",
                });
            }

            const nextLocation = {
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
            };

            const latitude =
                location.latitude ?? incident.location?.latitude;
            const longitude =
                location.longitude ?? incident.location?.longitude;

            if (latitude !== undefined && latitude !== null) {
                nextLocation.latitude = Number(latitude);
            }

            if (longitude !== undefined && longitude !== null) {
                nextLocation.longitude = Number(longitude);
            }

            if (
                (nextLocation.latitude !== undefined &&
                    !Number.isFinite(nextLocation.latitude)) ||
                (nextLocation.longitude !== undefined &&
                    !Number.isFinite(nextLocation.longitude))
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid location coordinates",
                });
            }

            incident.location = nextLocation;
        }

        if (peopleAffected !== undefined) {
            const count = Number(peopleAffected);

            if (!Number.isFinite(count) || count < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid number of people affected",
                });
            }

            incident.peopleAffected = count;
        }

        // Only Admin can reassign officers or change source/images.
        if (isAdmin(req)) {
            if (assignedOfficer !== undefined) {
                if (
                    assignedOfficer &&
                    !isValidId(assignedOfficer)
                ) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid assigned officer ID",
                    });
                }

                incident.assignedOfficer = assignedOfficer || null;
            }

            if (source !== undefined) incident.source = source;

            if (images !== undefined) {
                if (!Array.isArray(images)) {
                    return res.status(400).json({
                        success: false,
                        message: "Images must be an array",
                    });
                }

                incident.images = images;
            }
        }

        await incident.save();

        const updatedIncident = await populateIncident(
            Incident.findById(incident._id)
        );

        return res.status(200).json({
            success: true,
            message: "Incident updated successfully",
            incident: updatedIncident,
        });
    } catch (error) {
        console.error("Update Incident Error:", error);

        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }

        return res.status(500).json({
            success: false,
            message: "Unable to update incident",
        });
    }
};


/*
 * DELETE INCIDENT
 * Admin only
 */
const deleteIncident = async (req, res) => {
    try {
        // Only Admin can delete incidents
        if (!isAdmin(req)) {
            return res.status(403).json({
                success: false,
                message: "Only Admin can delete incidents",
            });
        }

        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid incident ID",
            });
        }

        const incident = await Incident.findById(id);

        if (!incident) {
            return res.status(404).json({
                success: false,
                message: "Incident not found",
            });
        }

        await Incident.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Incident deleted successfully",
        });
    } catch (error) {
        console.error("Delete Incident Error:", error);

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