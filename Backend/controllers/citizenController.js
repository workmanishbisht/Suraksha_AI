const User = require("../models/User");

const getCitizens = async (req, res) => {
    try {
        const {
            search = "",
            status = "All",
            page = 1,
            limit = 10,
        } = req.query;

        const currentPage = Math.max(Number(page) || 1, 1);
        const perPage = Math.min(
            Math.max(Number(limit) || 10, 1),
            100
        );

        const query = {
            role: "citizen",
        };

        if (status === "Active") {
            query.isActive = true;
        }

        if (status === "Inactive") {
            query.isActive = false;
        }

        if (search.trim()) {
            const searchRegex = new RegExp(
                search.trim(),
                "i"
            );

            query.$or = [
                { name: searchRegex },
                { username: searchRegex },
                { email: searchRegex },
            ];
        }

        const totalCitizens = await User.countDocuments(
            query
        );

        const citizens = await User.find(query)
            .select(
                "_id name username email role isActive location createdAt profileImage"
            )
            .sort({
                createdAt: -1,
            })
            .skip((currentPage - 1) * perPage)
            .limit(perPage)
            .lean();

        const formattedCitizens = citizens.map(
            (citizen) => ({
                id: citizen._id,
                name: citizen.name,
                username: citizen.username,
                email: citizen.email,
                role: citizen.role,
                status: citizen.isActive
                    ? "Active"
                    : "Inactive",
                location:
                    citizen.location?.address ||
                    citizen.location?.city ||
                    citizen.location?.name ||
                    "Not available",
                profileImage:
                    citizen.profileImage || null,
                joined: citizen.createdAt,
            })
        );

        return res.status(200).json({
            success: true,
            citizens: formattedCitizens,
            pagination: {
                page: currentPage,
                limit: perPage,
                total: totalCitizens,
                totalPages: Math.ceil(
                    totalCitizens / perPage
                ),
            },
        });
    } catch (error) {
        console.error(
            "Get Citizens Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to fetch citizens",
        });
    }
};

const getCitizenStats = async (req, res) => {
    try {
        const [
            totalCitizens,
            activeCitizens,
            inactiveCitizens,
            verifiedCitizens,
        ] = await Promise.all([
            User.countDocuments({
                role: "citizen",
            }),

            User.countDocuments({
                role: "citizen",
                isActive: true,
            }),

            User.countDocuments({
                role: "citizen",
                isActive: false,
            }),

            User.countDocuments({
                role: "citizen",
                emailVerified: true,
            }),
        ]);

        return res.status(200).json({
            success: true,
            stats: {
                totalCitizens,
                activeCitizens,
                inactiveCitizens,
                verifiedCitizens,
            },
        });
    } catch (error) {
        console.error(
            "Get Citizen Stats Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to fetch citizen statistics",
        });
    }
};

const getCitizenById = async (req, res) => {
    try {
        const { id } = req.params;

        const citizen = await User.findOne({
            _id: id,
            role: "citizen",
        })
            .select(
                "-password"
            )
            .lean();

        if (!citizen) {
            return res.status(404).json({
                success: false,
                message: "Citizen not found",
            });
        }

        return res.status(200).json({
            success: true,
            citizen: {
                id: citizen._id,
                name: citizen.name,
                username: citizen.username,
                email: citizen.email,
                role: citizen.role,
                status: citizen.isActive
                    ? "Active"
                    : "Inactive",
                location:
                    citizen.location?.address ||
                    citizen.location?.city ||
                    citizen.location?.name ||
                    "Not available",
                profileImage:
                    citizen.profileImage || null,
                createdAt: citizen.createdAt,
                updatedAt: citizen.updatedAt,
            },
        });
    } catch (error) {
        console.error(
            "Get Citizen By ID Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to fetch citizen details",
        });
    }
};

const updateCitizenStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        if (typeof isActive !== "boolean") {
            return res.status(400).json({
                success: false,
                message:
                    "isActive must be true or false",
            });
        }

        const citizen = await User.findOne({
            _id: id,
            role: "citizen",
        });

        if (!citizen) {
            return res.status(404).json({
                success: false,
                message: "Citizen not found",
            });
        }

        citizen.isActive = isActive;

        await citizen.save();

        return res.status(200).json({
            success: true,
            message: isActive
                ? "Citizen account activated successfully"
                : "Citizen account deactivated successfully",
            citizen: {
                id: citizen._id,
                name: citizen.name,
                username: citizen.username,
                email: citizen.email,
                role: citizen.role,
                status: citizen.isActive
                    ? "Active"
                    : "Inactive",
            },
        });
    } catch (error) {
        console.error(
            "Update Citizen Status Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to update citizen status",
        });
    }
};

module.exports = {
    getCitizens,
    getCitizenStats,
    getCitizenById,
    updateCitizenStatus,
};