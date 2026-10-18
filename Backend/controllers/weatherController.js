
const User = require("../models/User");

/* =========================================
   WEATHER CONDITION
========================================= */

const getWeatherDetails = (code, isDay) => {
    if (code === 0) {
        return isDay ? "Clear" : "Clear Night";
    }

    if (code === 1) return "Mainly Clear";
    if (code === 2) return "Partly Cloudy";
    if (code === 3) return "Overcast";

    if ([45, 48].includes(code)) return "Foggy";

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
        // 1. Get the logged-in user's saved location
        const user = await User.findById(req.user._id)
            .select("location")
            .lean();

        const location = user?.location;

        if (
            !location ||
            location.latitude == null ||
            location.longitude == null ||
            !location.name
        ) {
            return res.status(404).json({
                success: false,
                message: "No saved location found",
            });
        }

        // 2. Validate coordinates
        const latitude = Number(location.latitude);
        const longitude = Number(location.longitude);

        if (
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude) ||
            latitude < -90 ||
            latitude > 90 ||
            longitude < -180 ||
            longitude > 180
        ) {
            return res.status(400).json({
                success: false,
                message: "Saved location coordinates are invalid",
            });
        }

        // 3. Build Open-Meteo API URL
        const params = new URLSearchParams({
            latitude: String(latitude),
            longitude: String(longitude),
            current: [
                "temperature_2m",
                "relative_humidity_2m",
                "precipitation",
                "wind_speed_10m",
                "weather_code",
                "is_day",
            ].join(","),
            daily: "sunrise,sunset",
            timezone: "auto",
        });

        const url =
            `https://api.open-meteo.com/v1/forecast?${params.toString()}`;

        // 4. Fetch weather with a 10-second timeout
        const response = await fetch(url, {
            method: "GET",
            headers: {
                Accept: "application/json",
            },
            signal: AbortSignal.timeout(10000),
        });

        // 5. Handle provider errors
        if (!response.ok) {
            const errorBody = await response.text();

            console.error("Open-Meteo API Error:", {
                status: response.status,
                statusText: response.statusText,
                body: errorBody.slice(0, 1000),
            });

            return res.status(502).json({
                success: false,
                message: "Weather provider request failed",
            });
        }

        // 6. Parse response
        const data = await response.json();

        if (!data?.current) {
            console.error(
                "Invalid Open-Meteo response:",
                data
            );

            return res.status(502).json({
                success: false,
                message: "Invalid weather response",
            });
        }

        const current = data.current;
        const daily = data.daily;

        // 7. Return formatted weather data
        return res.status(200).json({
            success: true,

            location: {
                name: location.name,
                state: location.state || "",
                country: location.country || "",
                latitude,
                longitude,
            },

            weather: {
                temperature: current.temperature_2m,
                temperatureUnit:
                    data.current_units?.temperature_2m || "°C",

                condition: getWeatherDetails(
                    current.weather_code,
                    current.is_day
                ),

                weatherCode: current.weather_code,
                humidity: current.relative_humidity_2m,
                windSpeed: current.wind_speed_10m,
                precipitation: current.precipitation,
                isDay: current.is_day,

                sunrise: daily?.sunrise?.[0] || null,
                sunset: daily?.sunset?.[0] || null,

                updatedAt: current.time,
            },
        });
    } catch (error) {
        // 8. Log diagnostic information
        console.error("Weather Error:", error.message);

        const isTimeout =
            error.name === "TimeoutError" ||
            error.name === "AbortError";

        const isNetworkError =
            error.name === "TypeError";

        return res.status(502).json({
            success: false,
            message: isTimeout
                ? "Weather provider timed out. Please try again."
                : isNetworkError
                    ? "Weather provider is unreachable. Check your network connection."
                    : "Unable to fetch real-time weather",
        });
    }
};

/* =========================================
   EXPORTS
========================================= */

module.exports = {
    getWeather,
};
