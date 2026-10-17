
const API_URL = "http://localhost:5000/api/notifications";

// Fetch notifications
export const getNotifications = async () => {
    const response = await fetch(API_URL, {
        method: "GET",
        credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to fetch notifications"
        );
    }

    return data;
};

// Mark one notification as read
export const markNotificationRead = async (id) => {
    const response = await fetch(
        `${API_URL}/${id}/read`,
        {
            method: "PATCH",
            credentials: "include",
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to mark notification as read"
        );
    }

    return data;
};

// Mark all notifications as read
export const markAllNotificationsRead = async () => {
    const response = await fetch(
        `${API_URL}/read-all`,
        {
            method: "PATCH",
            credentials: "include",
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to mark notifications as read"
        );
    }

    return data;
};
