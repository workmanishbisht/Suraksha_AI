import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

const AuthContext = createContext(null);

const API_URL = "http://localhost:5000/api/auth";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    /* =========================================
       CHECK AUTH
    ========================================= */

    const checkAuth = async () => {
        try {
            const response = await fetch(`${API_URL}/me`, {
                method: "GET",
                credentials: "include",
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setUser(data.user);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error("Auth Check Error:", error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    /* =========================================
       INITIAL AUTH CHECK
    ========================================= */

    useEffect(() => {
        checkAuth();
    }, []);

    /* =========================================
       LOGIN
    ========================================= */

    const login = async (username, password) => {
        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
                username,
                password,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Login failed"
            );
        }

        /*
            When 2FA is enabled, the first login
            request only returns a challenge token.
            Final user session is created after
            OTP verification.
        */

        if (
            !data.requiresTwoFactor &&
            data.user
        ) {
            setUser(data.user);
        }

        return data;
    };

    /* =========================================
       REGISTER
    ========================================= */

    const register = async ({
        name,
        username,
        email,
        password,
        accountType,
    }) => {
        const response = await fetch(
            `${API_URL}/register`,
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    name,
                    username,
                    email,
                    password,
                    accountType,
                }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message ||
                    "Registration failed"
            );
        }

        return data;
    };

    /* =========================================
       UPDATE USER
       Used after profile changes

       Example:
       - Name changed
       - Profile image uploaded
       - Profile image removed
       - Email changed
       ========================================= */

    const updateUser = (updatedUser) => {
        if (!updatedUser) {
            return;
        }

        setUser((currentUser) => {
            if (!currentUser) {
                return updatedUser;
            }

            return {
                ...currentUser,
                ...updatedUser,
            };
        });
    };

    /* =========================================
       REFRESH USER
       Get latest user from backend
    ========================================= */

    const refreshUser = async () => {
        try {
            const response = await fetch(
                `${API_URL}/me`,
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (
                response.ok &&
                data.success &&
                data.user
            ) {
                setUser(data.user);

                return data.user;
            }

            return null;
        } catch (error) {
            console.error(
                "Refresh User Error:",
                error
            );

            return null;
        }
    };

    /* =========================================
       LOGOUT
    ========================================= */

    const logout = async () => {
        try {
            await fetch(
                `${API_URL}/logout`,
                {
                    method: "POST",
                    credentials: "include",
                }
            );
        } catch (error) {
            console.error(
                "Logout Error:",
                error
            );
        } finally {
            setUser(null);
        }
    };

    /* =========================================
       CONTEXT VALUE
    ========================================= */

    const value = {
        user,
        loading,

        login,
        register,
        logout,

        updateUser,
        refreshUser,

        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

/* =========================================
   USE AUTH
========================================= */

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
}