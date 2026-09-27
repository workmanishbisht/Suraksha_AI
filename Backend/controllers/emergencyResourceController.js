const EmergencyResource = require("../models/EmergencyResource");

/* =========================================
   GET ALL EMERGENCY RESOURCES
========================================= */

const getEmergencyResources = async (req, res) => {
    try {
        const resources = await EmergencyResource.find()
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            count: resources.length,
            resources,
        });
    } catch (error) {
        console.error(
            "Get Emergency Resources Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to fetch emergency resources",
        });
    }
};


/* =========================================
   GET RESOURCE BY ID
========================================= */

const getEmergencyResourceById = async (req, res) => {
    try {
        const resource =
            await EmergencyResource.findById(
                req.params.id
            );

        if (!resource) {
            return res.status(404).json({
                success: false,
                message:
                    "Emergency resource not found",
            });
        }

        return res.status(200).json({
            success: true,
            resource,
        });
    } catch (error) {
        console.error(
            "Get Emergency Resource Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to fetch emergency resource",
        });
    }
};


/* =========================================
   CREATE RESOURCE
========================================= */

const createEmergencyResource = async (req, res) => {
    try {
        const {
            name,
            type,
            total,
            available,
            location,
            status,
            isActive,
        } = req.body;

        if (
            !name ||
            !type ||
            total === undefined
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Name, type and total are required",
            });
        }

        if (
            Number(total) < 0 ||
            (available !== undefined &&
                Number(available) < 0)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Resource values cannot be negative",
            });
        }

        if (
            available !== undefined &&
            Number(available) > Number(total)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Available resources cannot exceed total resources",
            });
        }

        const existingResource =
            await EmergencyResource.findOne({
                type,
            });

        if (existingResource) {
            return res.status(409).json({
                success: false,
                message:
                    "Resource of this type already exists",
            });
        }

        const resource =
            await EmergencyResource.create({
                name: name.trim(),
                type,
                total: Number(total),
                available:
                    available !== undefined
                        ? Number(available)
                        : Number(total),
                location:
                    typeof location === "string"
                        ? location.trim()
                        : "",
                status:
                    status || "available",
                isActive:
                    typeof isActive === "boolean"
                        ? isActive
                        : true,
            });

        return res.status(201).json({
            success: true,
            message:
                "Emergency resource created successfully",
            resource,
        });
    } catch (error) {
        console.error(
            "Create Emergency Resource Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to create emergency resource",
        });
    }
};


/* =========================================
   UPDATE RESOURCE
========================================= */

const updateEmergencyResource = async (req, res) => {
    try {
        const resource =
            await EmergencyResource.findById(
                req.params.id
            );

        if (!resource) {
            return res.status(404).json({
                success: false,
                message:
                    "Emergency resource not found",
            });
        }

        const {
            name,
            type,
            total,
            available,
            location,
            status,
            isActive,
        } = req.body;

        if (name !== undefined) {
            resource.name = name.trim();
        }

        if (type !== undefined) {
            const existingResource =
                await EmergencyResource.findOne({
                    type,
                    _id: {
                        $ne: resource._id,
                    },
                });

            if (existingResource) {
                return res.status(409).json({
                    success: false,
                    message:
                        "Resource of this type already exists",
                });
            }

            resource.type = type;
        }

        if (total !== undefined) {
            if (Number(total) < 0) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Total resources cannot be negative",
                });
            }

            resource.total = Number(total);
        }

        if (available !== undefined) {
            if (Number(available) < 0) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Available resources cannot be negative",
                });
            }

            resource.available =
                Number(available);
        }

        if (
            resource.available >
            resource.total
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Available resources cannot exceed total resources",
            });
        }

        if (location !== undefined) {
            resource.location =
                typeof location === "string"
                    ? location.trim()
                    : "";
        }

        if (status !== undefined) {
            resource.status = status;
        }

        if (typeof isActive === "boolean") {
            resource.isActive = isActive;
        }

        await resource.save();

        return res.status(200).json({
            success: true,
            message:
                "Emergency resource updated successfully",
            resource,
        });
    } catch (error) {
        console.error(
            "Update Emergency Resource Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to update emergency resource",
        });
    }
};


/* =========================================
   DELETE RESOURCE
========================================= */

const deleteEmergencyResource = async (req, res) => {
    try {
        const resource =
            await EmergencyResource.findByIdAndDelete(
                req.params.id
            );

        if (!resource) {
            return res.status(404).json({
                success: false,
                message:
                    "Emergency resource not found",
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "Emergency resource deleted successfully",
        });
    } catch (error) {
        console.error(
            "Delete Emergency Resource Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to delete emergency resource",
        });
    }
};


/* =========================================
   GET RESOURCE STATS
========================================= */

const getEmergencyResourceStats = async (req, res) => {
    try {
        const resources =
            await EmergencyResource.find({
                isActive: true,
            }).lean();

        const totalResources =
            resources.reduce(
                (sum, resource) =>
                    sum + resource.total,
                0
            );

        const availableResources =
            resources.reduce(
                (sum, resource) =>
                    sum + resource.available,
                0
            );

        const unavailableResources =
            Math.max(
                totalResources -
                availableResources,
                0
            );

        const resourceStats =
            resources.map((resource) => ({
                id: resource._id,
                name: resource.name,
                type: resource.type,
                total: resource.total,
                available: resource.available,
                unavailable: Math.max(
                    resource.total -
                    resource.available,
                    0
                ),
                location:
                    resource.location,
                status: resource.status,
                isActive:
                    resource.isActive,
            }));

        return res.status(200).json({
            success: true,
            stats: {
                totalResources,
                availableResources,
                unavailableResources,
                resourceStats,
            },
        });
    } catch (error) {
        console.error(
            "Emergency Resource Stats Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to fetch emergency resource stats",
        });
    }
};


module.exports = {
    getEmergencyResources,
    getEmergencyResourceById,
    createEmergencyResource,
    updateEmergencyResource,
    deleteEmergencyResource,
    getEmergencyResourceStats,
};