const User = require("../models/User");

/* =========================================
   REVERSE GEOCODING
========================================= */

const reverseGeocode = async (latitude, longitude) => {
    const url =
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2` +
        `&lat=${encodeURIComponent(latitude)}` +
        `&lon=${encodeURIComponent(longitude)}` +
        `&zoom=10&addressdetails=1`;

    const response = await fetch(url, {
        headers: {
            Accept: "application/json",
            "User-Agent": "SurakshaAI/1.0",
        },
    });

    if (!response.ok) {
        throw new Error(
            "Unable to detect location name"
        );
    }

    const data = await response.json();
    const address = data?.address || {};

    return {
        name:
            address.city ||
            address.town ||
            address.municipality ||
            address.village ||
            address.county ||
            "Current Location",

        state: address.state || "",
        country: address.country || "",
    };
};

/* =========================================
   SEARCH LOCATION
========================================= */

const searchLocation = async (req, res) => {
    try {
        const query = String(
            req.query.q || ""
        ).trim();

        if (query.length < 2) {
            return res.status(400).json({
                success: false,
                message:
                    "Enter at least 2 characters to search",
            });
        }

        const url =
            `https://geocoding-api.open-meteo.com/v1/search` +
            `?name=${encodeURIComponent(query)}` +
            `&count=8` +
            `&language=en` +
            `&format=json`;

        const response = await fetch(url, {
            headers: {
                Accept: "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(
                "Location search failed"
            );
        }

        const data = await response.json();

        const locations = (
            data?.results || []
        ).map((item) => ({
            name: item.name || "",
            state: item.admin1 || "",
            country: item.country || "",
            latitude: item.latitude,
            longitude: item.longitude,
        }));

        return res.status(200).json({
            success: true,
            locations,
        });
    } catch (error) {
        console.error(
            "Location Search Error:",
            error.message
        );

        return res.status(502).json({
            success: false,
            message:
                "Unable to search locations",
        });
    }
};

/* =========================================
   GET SAVED LOCATION
========================================= */

const getMyLocation = async (req, res) => {
    try {
        const user = await User.findById(
            req.user._id
        ).select("location");

        return res.status(200).json({
            success: true,
            location:
                user?.location || null,
        });
    } catch (error) {
        console.error(
            "Get Location Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to fetch saved location",
        });
    }
};

/* =========================================
   SAVE MANUAL LOCATION
========================================= */

const saveLocation = async (req, res) => {
    try {
        const {
            name,
            state,
            country,
            latitude,
            longitude,
            source = "manual",
        } = req.body;

        if (
            typeof name !== "string" ||
            !name.trim() ||
            typeof latitude !== "number" ||
            typeof longitude !== "number"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Location name, latitude and longitude are required",
            });
        }

        if (
            latitude < -90 ||
            latitude > 90 ||
            longitude < -180 ||
            longitude > 180
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid coordinates",
            });
        }

        const safeSource =
            source === "detected"
                ? "detected"
                : "manual";

        const user =
            await User.findByIdAndUpdate(
                req.user._id,
                {
                    location: {
                        name: name.trim(),
                        state:
                            typeof state ===
                                "string"
                                ? state.trim()
                                : "",
                        country:
                            typeof country ===
                                "string"
                                ? country.trim()
                                : "",
                        latitude,
                        longitude,
                        source: safeSource,
                    },
                },
                {
                    returnDocument: "after",
                    runValidators: true,
                }
            ).select("location");

        return res.status(200).json({
            success: true,
            message:
                "Location saved successfully",
            location: user.location,
        });
    } catch (error) {
        console.error(
            "Save Location Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to save location",
        });
    }
};

/* =========================================
   DETECT CURRENT LOCATION
========================================= */

const detectLocation = async (req, res) => {
    try {
        const {
            latitude,
            longitude,
        } = req.body;

        if (
            typeof latitude !== "number" ||
            typeof longitude !== "number" ||
            latitude < -90 ||
            latitude > 90 ||
            longitude < -180 ||
            longitude > 180
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Valid latitude and longitude are required",
            });
        }

        const place =
            await reverseGeocode(
                latitude,
                longitude
            );

        const user =
            await User.findByIdAndUpdate(
                req.user._id,
                {
                    location: {
                        ...place,
                        latitude,
                        longitude,
                        source: "detected",
                    },
                },
                {
                    returnDocument: "after",
                    runValidators: true,
                }
            ).select("location");

        return res.status(200).json({
            success: true,
            message:
                "Current location detected and saved",
            location: user.location,
        });
    } catch (error) {
        console.error(
            "Detect Location Error:",
            error.message
        );

        return res.status(502).json({
            success: false,
            message:
                "Unable to detect your current location",
        });
    }
};

/* =========================================
   EXPORTS
========================================= */

module.exports = {
    getMyLocation,
    searchLocation,
    saveLocation,
    detectLocation,
};