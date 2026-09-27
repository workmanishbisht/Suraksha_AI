const Incident = require("../models/Incident");

// @desc    Get reports generated from incidents
// @route   GET /api/reports
// @access  Protected
const getReports = async (req, res) => {
    try {
        const {
            search = "",
            status = "all",
            type = "all",
            severity = "all",
            page = 1,
            limit = 10,
        } = req.query;

        const query = {};

        // Status filter
        if (status !== "all") {
            query.status = status;
        }

        // Incident type filter
        if (type !== "all") {
            query.type = type;
        }

        // Severity filter
        if (severity !== "all") {
            query.severity = severity;
        }

        // Search
        if (search.trim()) {
            const searchRegex = new RegExp(search.trim(), "i");

            query.$or = [
                { title: searchRegex },
                { description: searchRegex },
                { "location.address": searchRegex },
                { "location.city": searchRegex },
                { "location.state": searchRegex },
            ];
        }

        const pageNumber = Math.max(Number(page) || 1, 1);
        const limitNumber = Math.min(
            Math.max(Number(limit) || 10, 1),
            100
        );

        const skip = (pageNumber - 1) * limitNumber;

        const [reports, totalReports] = await Promise.all([
            Incident.find(query)
                .populate(
                    "reportedBy",
                    "name username email"
                )
                .populate(
                    "assignedOfficer",
                    "name username email"
                )
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNumber)
                .lean(),

            Incident.countDocuments(query),
        ]);

        const totalPages = Math.ceil(
            totalReports / limitNumber
        );

        const formattedReports = reports.map((incident) => ({
            id: `INC-${new Date(incident.createdAt).getFullYear()}-${String(
                incident._id
            ).slice(-4).toUpperCase()}`,

            _id: incident._id,

            title: incident.title,

            description: incident.description,

            type: incident.type,

            severity: incident.severity,

            status: incident.status,

            location: incident.location || null,

            peopleAffected: incident.peopleAffected || 0,

            source: incident.source,

            images: incident.images || [],

            reportedBy: incident.reportedBy
                ? {
                      id: incident.reportedBy._id,
                      name:
                          incident.reportedBy.name ||
                          incident.reportedBy.username ||
                          "Unknown User",
                      email:
                          incident.reportedBy.email || "",
                  }
                : null,

            assignedOfficer: incident.assignedOfficer
                ? {
                      id: incident.assignedOfficer._id,
                      name:
                          incident.assignedOfficer.name ||
                          incident.assignedOfficer.username ||
                          "Unassigned",
                      email:
                          incident.assignedOfficer.email || "",
                  }
                : null,

            createdAt: incident.createdAt,

            updatedAt: incident.updatedAt,

            resolvedAt: incident.resolvedAt || null,
        }));

        res.status(200).json({
            success: true,

            reports: formattedReports,

            pagination: {
                currentPage: pageNumber,
                totalPages,
                totalReports,
                limit: limitNumber,
                hasNextPage: pageNumber < totalPages,
                hasPreviousPage: pageNumber > 1,
            },
        });
    } catch (error) {
        console.error("Get Reports Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch reports.",
        });
    }
};


// @desc    Get report statistics
// @route   GET /api/reports/stats
// @access  Protected
const getReportStats = async (req, res) => {
    try {
        const [
            totalReports,
            pendingReports,
            underReviewReports,
            resolvedReports,
            rejectedReports,
            criticalReports,
        ] = await Promise.all([
            Incident.countDocuments(),

            Incident.countDocuments({
                status: "reported",
            }),

            Incident.countDocuments({
                status: {
                    $in: ["investigating", "responding"],
                },
            }),

            Incident.countDocuments({
                status: "resolved",
            }),

            Incident.countDocuments({
                status: "rejected",
            }),

            Incident.countDocuments({
                severity: "critical",
            }),
        ]);

        res.status(200).json({
            success: true,

            stats: {
                totalReports,
                pendingReports,
                underReviewReports,
                resolvedReports,
                rejectedReports,
                criticalReports,
            },
        });
    } catch (error) {
        console.error("Get Report Stats Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch report statistics.",
        });
    }
};


// @desc    Get single report
// @route   GET /api/reports/:id
// @access  Protected
const getReportById = async (req, res) => {
    try {
        const report = await Incident.findById(req.params.id)
            .populate(
                "reportedBy",
                "name username email"
            )
            .populate(
                "assignedOfficer",
                "name username email"
            );

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Report not found.",
            });
        }

        res.status(200).json({
            success: true,
            report,
        });
    } catch (error) {
        console.error("Get Report Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch report.",
        });
    }
};


module.exports = {
    getReports,
    getReportStats,
    getReportById,
};