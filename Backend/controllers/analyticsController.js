const Incident = require("../models/Incident");

/* =========================================
   GET ADMIN ANALYTICS
========================================= */

const getAnalytics = async (req, res) => {
    try {
        const [
            totalIncidents,
            activeIncidents,
            respondingIncidents,
            resolvedIncidents,
            criticalIncidents,
            peopleAffectedResult,
            severityBreakdown,
            statusBreakdown,
            typeBreakdown,
            dailyTrend,
            monthlyTrend,
            recentIncidents,
        ] = await Promise.all([
            // Total incidents
            Incident.countDocuments(),

            // Active = Reported + Investigating
            Incident.countDocuments({
                status: {
                    $in: ["reported", "investigating"],
                },
            }),

            // Responding incidents
            Incident.countDocuments({
                status: "responding",
            }),

            // Resolved incidents
            Incident.countDocuments({
                status: "resolved",
            }),

            // Critical incidents
            Incident.countDocuments({
                severity: "critical",
            }),

            // Total people affected
            Incident.aggregate([
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: "$peopleAffected",
                        },
                    },
                },
            ]),

            // Severity breakdown
            Incident.aggregate([
                {
                    $group: {
                        _id: "$severity",
                        count: {
                            $sum: 1,
                        },
                    },
                },
                {
                    $sort: {
                        count: -1,
                    },
                },
            ]),

            // Status breakdown
            Incident.aggregate([
                {
                    $group: {
                        _id: "$status",
                        count: {
                            $sum: 1,
                        },
                    },
                },
                {
                    $sort: {
                        count: -1,
                    },
                },
            ]),

            // Incident type breakdown
            Incident.aggregate([
                {
                    $group: {
                        _id: "$type",
                        count: {
                            $sum: 1,
                        },
                    },
                },
                {
                    $sort: {
                        count: -1,
                    },
                },
            ]),

            // Last 7 days trend
            Incident.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: new Date(
                                Date.now() -
                                7 *
                                24 *
                                60 *
                                60 *
                                1000
                            ),
                        },
                    },
                },
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format: "%Y-%m-%d",
                                date: "$createdAt",
                            },
                        },
                        count: {
                            $sum: 1,
                        },
                    },
                },
                {
                    $sort: {
                        _id: 1,
                    },
                },
            ]),

            // Last 6 months trend
            Incident.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: new Date(
                                new Date().setMonth(
                                    new Date().getMonth() - 6
                                )
                            ),
                        },
                    },
                },
                {
                    $group: {
                        _id: {
                            year: {
                                $year: "$createdAt",
                            },
                            month: {
                                $month: "$createdAt",
                            },
                        },
                        count: {
                            $sum: 1,
                        },
                    },
                },
                {
                    $sort: {
                        "_id.year": 1,
                        "_id.month": 1,
                    },
                },
            ]),

            // Latest 5 incidents
            Incident.find()
                .populate(
                    "reportedBy",
                    "name username role"
                )
                .populate(
                    "assignedOfficer",
                    "name username role"
                )
                .sort({
                    createdAt: -1,
                })
                .limit(5)
                .lean(),
        ]);

        return res.status(200).json({
            success: true,

            analytics: {
                overview: {
                    totalIncidents,
                    activeIncidents,
                    respondingIncidents,
                    resolvedIncidents,
                    criticalIncidents,
                    peopleAffected:
                        peopleAffectedResult[0]?.total || 0,
                },

                severityBreakdown,

                statusBreakdown,

                typeBreakdown,

                dailyTrend,

                monthlyTrend,

                recentIncidents,
            },
        });
    } catch (error) {
        console.error(
            "Analytics Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Unable to fetch analytics data",
        });
    }
};

module.exports = {
    getAnalytics,
};