
const NearbyPlace = require("../models/NearbyPlace");

/* =========================================
   GET SAVED NEARBY PLACES - MONGODB
========================================= */

const getNearbyPlaces = async (req, res) => {
    try {
        const { category, search } = req.query;
        const filter = { isActive: true };

        if (category && category !== "All") {
            filter.category = category;
        }

        if (search && search.trim()) {
            const searchValue = search.trim();

            filter.$or = [
                { name: { $regex: searchValue, $options: "i" } },
                { address: { $regex: searchValue, $options: "i" } },
            ];
        }

        const places = await NearbyPlace.find(filter)
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            count: places.length,
            places,
        });
    } catch (error) {
        console.error("Get Nearby Places Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch nearby places.",
        });
    }
};

/* =========================================
   CREATE SAVED PLACE - MONGODB
========================================= */

const createNearbyPlace = async (req, res) => {
    try {
        const {
            name,
            category,
            address,
            phone,
            status,
            latitude,
            longitude,
        } = req.body;

        if (
            typeof name !== "string" ||
            !name.trim() ||
            typeof category !== "string" ||
            !["Police", "Hospital", "Fire Station"].includes(category) ||
            typeof address !== "string" ||
            !address.trim() ||
            typeof phone !== "string" ||
            !phone.trim()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Enter a valid name, category, address and phone number.",
            });
        }

        if (
            latitude != null &&
            (!Number.isFinite(latitude) ||
                latitude < -90 ||
                latitude > 90)
        ) {
            return res.status(400).json({
                success: false,
                message: "Latitude must be between -90 and 90.",
            });
        }

        if (
            longitude != null &&
            (!Number.isFinite(longitude) ||
                longitude < -180 ||
                longitude > 180)
        ) {
            return res.status(400).json({
                success: false,
                message: "Longitude must be between -180 and 180.",
            });
        }

        const validStatuses = [
            "Open 24/7",
            "Emergency Available",
            "Temporarily Closed",
        ];

        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid place status.",
            });
        }

        const place = await NearbyPlace.create({
            name: name.trim(),
            category,
            address: address.trim(),
            phone: phone.trim(),
            status: status || "Open 24/7",
            latitude: latitude ?? null,
            longitude: longitude ?? null,
        });

        return res.status(201).json({
            success: true,
            message: "Nearby place created successfully.",
            place,
        });
    } catch (error) {
        console.error("Create Nearby Place Error:", error);

        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }

        return res.status(500).json({
            success: false,
            message: "Unable to create nearby place.",
        });
    }
};

/* =========================================
   LIVE EMERGENCY PLACES - GEOAPIFY
========================================= */

const getLiveNearbyPlaces = async (req, res) => {
    try {
        const apiKey = process.env.GEOAPIFY_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                success: false,
                message: "Geoapify API key is not configured.",
            });
        }

        const {
            latitude,
            longitude,
            city,
            category = "All",
            radius = "10000",
        } = req.query;

        let lat;
        let lon;

        /* -------------------------------------
           1. GET LOCATION OR SEARCH CITY
        ------------------------------------- */

        const hasCoordinates =
            latitude !== undefined && longitude !== undefined;

        if (hasCoordinates) {
            lat = Number(latitude);
            lon = Number(longitude);

            if (
                !Number.isFinite(lat) ||
                !Number.isFinite(lon) ||
                lat < -90 ||
                lat > 90 ||
                lon < -180 ||
                lon > 180
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid latitude or longitude.",
                });
            }
        } else {
            if (typeof city !== "string" || !city.trim()) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Provide latitude/longitude or a city name.",
                });
            }

            const geoUrl = new URL(
                "https://api.geoapify.com/v1/geocode/search"
            );

            geoUrl.searchParams.set("text", city.trim());
            geoUrl.searchParams.set("format", "json");
            geoUrl.searchParams.set("filter", "countrycode:in");
            geoUrl.searchParams.set("limit", "1");
            geoUrl.searchParams.set("apiKey", apiKey);

            const geoResponse = await fetch(geoUrl);

            if (!geoResponse.ok) {
                const errorDetails = await geoResponse.text();

                console.error("Geoapify Geocoding Error:", {
                    status: geoResponse.status,
                    details: errorDetails,
                });

                return res.status(502).json({
                    success: false,
                    message: "Unable to search for this location.",
                    providerStatus: geoResponse.status,
                    details: errorDetails,
                });
            }

            const geoData = await geoResponse.json();
            const result = geoData.results?.[0];

            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: "Location not found in India.",
                });
            }

            lat = result.lat;
            lon = result.lon;
        }

        /* -------------------------------------
           2. VALIDATE SEARCH RADIUS
        ------------------------------------- */

        const radiusMeters = Number(radius);

        if (
            !Number.isInteger(radiusMeters) ||
            radiusMeters < 100 ||
            radiusMeters > 50000
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Radius must be between 100 and 50000 metres.",
            });
        }

        /* -------------------------------------
           3. EMERGENCY CATEGORIES
        ------------------------------------- */


const categoryMap = {
    Police: ["service.police"],
    Hospital: ["healthcare.hospital"],
    "Fire Station": ["service.fire_station"],
    Pharmacy: ["healthcare.pharmacy"],
    Doctor: ["healthcare.clinic_or_praxis"],

    All: [
        "service.police",
        "service.fire_station",
        "healthcare.hospital",
        "healthcare.clinic_or_praxis",
        "healthcare.pharmacy",
    ],
};


        if (!categoryMap[category]) {
            return res.status(400).json({
                success: false,
                message: "Invalid emergency facility category.",
                availableCategories: Object.keys(categoryMap),
            });
        }

        const categories = categoryMap[category];

        /* -------------------------------------
           4. GEOAPIFY PLACES REQUEST
        ------------------------------------- */

        const placesUrl = new URL(
            "https://api.geoapify.com/v2/places"
        );

        placesUrl.searchParams.set(
            "categories",
            categories.join(",")
        );

        placesUrl.searchParams.set(
            "filter",
            `circle:${lon},${lat},${radiusMeters}`
        );

        placesUrl.searchParams.set(
            "bias",
            `proximity:${lon},${lat}`
        );

        placesUrl.searchParams.set("limit", "50");
        placesUrl.searchParams.set("lang", "en");
        placesUrl.searchParams.set("apiKey", apiKey);

        const placesResponse = await fetch(placesUrl);

        if (!placesResponse.ok) {
            const errorDetails = await placesResponse.text();

            console.error("Geoapify Places API Error:", {
                status: placesResponse.status,
                details: errorDetails,
            });

            return res.status(502).json({
                success: false,
                message: "Geoapify request failed.",
                providerStatus: placesResponse.status,
                details: errorDetails,
            });
        }

        const placesData = await placesResponse.json();

        /* -------------------------------------
           5. MAP API RESULTS
        ------------------------------------- */

        const places = (placesData.features || []).map(
            (feature, index) => {
                const properties = feature.properties || {};
                const coordinates =
                    feature.geometry?.coordinates || [];

                const sourceCategories =
                    properties.categories || [];

                let matchedCategory = "Other Emergency";

                if (
                    sourceCategories.some((item) =>
                        item.startsWith("service.police")
                    )
                ) {
                    matchedCategory = "Police";
                } else if (
                    sourceCategories.some((item) =>
                        item.startsWith("service.fire_station")
                    )
                ) {
                    matchedCategory = "Fire Station";
                } else if (
                    sourceCategories.some((item) =>
                        item.startsWith("service.ambulance_station")
                    )
                ) {
                    matchedCategory = "Ambulance";
                } else if (
                    sourceCategories.some((item) =>
                        item.startsWith("healthcare.hospital")
                    )
                ) {
                    matchedCategory = "Hospital";
                } else if (
                    sourceCategories.some((item) =>
                        item.startsWith("healthcare.clinic_or_praxis")
                    )
                ) {
                    matchedCategory = "Doctor / Clinic";
                } else if (
                    sourceCategories.some((item) =>
                        item.startsWith("healthcare.pharmacy")
                    )
                ) {
                    matchedCategory = "Pharmacy";
                }

                return {
                    id:
                        properties.place_id ||
                        `geoapify-${index}`,

                    name:
                        properties.name ||
                        properties.address_line1 ||
                        "Unnamed facility",

                    category: matchedCategory,

                    address:
                        properties.formatted ||
                        properties.address_line1 ||
                        properties.address_line2 ||
                        "Address unavailable",

                    phone:
                        properties.datasource?.raw?.phone ||
                        "Not available",

                    latitude:
                        properties.lat ??
                        coordinates[1] ??
                        null,

                    longitude:
                        properties.lon ??
                        coordinates[0] ??
                        null,

                    distance: properties.distance ?? null,

                    status: "Not verified",

                    source: "Geoapify",
                };
            }
        );

        /* -------------------------------------
           6. RESPONSE
        ------------------------------------- */

        return res.status(200).json({
            success: true,
            message:
                "Nearby emergency facilities fetched successfully.",
            count: places.length,
            center: {
                latitude: lat,
                longitude: lon,
            },
            radius: radiusMeters,
            radiusKm: radiusMeters / 1000,
            category,
            places,
        });
    } catch (error) {
        console.error("Live Nearby Places Error:", error);

        return res.status(502).json({
            success: false,
            message:
                "Unable to fetch nearby emergency facilities.",
        });
    }
};

/* =========================================
   EXPORT CONTROLLERS
========================================= */

module.exports = {
    getNearbyPlaces,
    createNearbyPlace,
    getLiveNearbyPlaces,
};
