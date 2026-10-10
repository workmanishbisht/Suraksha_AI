
const AuditLog = require("../models/AuditLog");

const getAuditLogs = async (req, res) => {
    try {
        const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
        const limit = Math.min(
            100,
            Math.max(1, Number.parseInt(req.query.limit, 10) || 20)
        );

        const {
            search = "",
            action = "",
            resource = "",
            status = "",
            from = "",
            to = "",
        } = req.query;

        const filter = {};

        if (action) {
            filter.action = action;
        }

        if (resource) {
            filter.resource = resource;
        }

        if (["success", "failure"].includes(status)) {
            filter.status = status;
        }

        if (search.trim()) {
            const safeSearch = search.trim().replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
            );

            const regex = new RegExp(safeSearch, "i");

            filter.$or = [
                { actorName: regex },
                { actorEmail: regex },
                { action: regex },
                { resource: regex },
                { resourceId: regex },
                { description: regex },
                { ipAddress: regex },
            ];
        }

        if (from || to) {
            filter.createdAt = {};

            if (from) {
                const fromDate = new Date(from);

                if (Number.isNaN(fromDate.getTime())) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid from date.",
                    });
                }

                filter.createdAt.$gte = fromDate;
            }

            if (to) {
                const toDate = new Date(to);

                if (Number.isNaN(toDate.getTime())) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid to date.",
                    });
                }

                // Include the full selected day for YYYY-MM-DD inputs.
                if (/^\d{4}-\d{2}-\d{2}$/.test(to)) {
                    toDate.setHours(23, 59, 59, 999);
                }

                filter.createdAt.$lte = toDate;
            }

            if (
                filter.createdAt.$gte &&
                filter.createdAt.$lte &&
                filter.createdAt.$gte > filter.createdAt.$lte
            ) {
                return res.status(400).json({
                    success: false,
                    message: "'from' date must be before 'to' date.",
                });
            }
        }

        const skip = (page - 1) * limit;

        const [logs, total, successful, failed] = await Promise.all([
            AuditLog.find(filter)
                .populate("actor", "name username email")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),

            AuditLog.countDocuments(filter),

            AuditLog.countDocuments({
                ...filter,
                status: "success",
            }),

            AuditLog.countDocuments({
                ...filter,
                status: "failure",
            }),
        ]);

        return res.status(200).json({
            success: true,
            logs,
            stats: {
                total,
                successful,
                failed,
            },
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Get Audit Logs Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch audit logs.",
        });
    }
};

module.exports = {
    getAuditLogs,
};
