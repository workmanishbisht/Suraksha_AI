const User = require("../models/User");

/* =========================================
   WEATHER CONDITION
========================================= */

const getWeatherDetails = (code, isDay) => {
    if (code === 0) {
        return isDay ? "Clear" : "Clear Night";
    }

    if ([1, 2].includes(code)) {
        return code === 1 ? "Mainly Clear" : "Partly Cloudy";
    }

    if (code === 3) {
        return "Overcast";
    }

    if ([45, 48].includes(code)) {
        return "Foggy";
    }

    if ([51, 53, 55, 56, 57].includes(code)) {
        return "Drizzle";
    }

    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
        return "Rain";
    }

    if ([71, 73, 75, 77, 85, 86].includes(code)) {
        return "Snow";
    }

    if ([95, 96, 99].includes(code)) {
        return "Thunderstorm";
    }

    return "Unavailable";
};

/* =========================================
   GET REAL-TIME WEATHER
========================================= */

const getWeather = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select(
            "location"
        );

        if (
            !user?.location?.latitude ||
            !user?.location?.longitude ||
            !user?.location?.name
        ) {
            return res.status(404).json({
                success: false,
                message: "No saved location found",
            });
        }

        const {
            latitude,
            longitude,
            name,
            state,
            country,
        } = user.location;

        const url =
            `https://api.open-meteo.com/v1/forecast` +
            `?latitude=${encodeURIComponent(latitude)}` +
            `&longitude=${encodeURIComponent(longitude)}` +
            `&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code,is_day` +
            `&daily=sunrise,sunset` +
            `&timezone=auto`;

        const response = await fetch(url, {
            headers: {
                Accept: "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(
                "Weather provider request failed"
            );
        }

        const data = await response.json();

        const current = data?.current;
        const daily = data?.daily;

        if (!current) {
            throw new Error(
                "Invalid weather response"
            );
        }

        return res.status(200).json({
            success: true,

            location: {
                name,
                state: state || "",
                country: country || "",
                latitude,
                longitude,
            },

            weather: {
                temperature: current.temperature_2m,
                temperatureUnit: "°C",

                condition: getWeatherDetails(
                    current.weather_code,
                    current.is_day
                ),

                weatherCode: current.weather_code,

                humidity:
                    current.relative_humidity_2m,

                windSpeed:
                    current.wind_speed_10m,

                precipitation:
                    current.precipitation,

                isDay: current.is_day,

                sunrise:
                    daily?.sunrise?.[0] || null,

                sunset:
                    daily?.sunset?.[0] || null,

                updatedAt: current.time,
            },
        });
    } catch (error) {
        console.error(
            "Weather Error:",
            error.message
        );

        return res.status(502).json({
            success: false,
            message:
                "Unable to fetch real-time weather",
        });
    }
};

/* =========================================
   EXPORTS
========================================= */

module.exports = {
    getWeather,
};