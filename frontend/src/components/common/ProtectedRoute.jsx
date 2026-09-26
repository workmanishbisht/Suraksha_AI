import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function ProtectedRoute({ allowedRoles }) {
    const { user, loading, isAuthenticated } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
                <div className="text-sm text-slate-400">
                    Checking authentication...
                </div>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location.pathname }}
            />
        );
    }

    if (
        allowedRoles &&
        !allowedRoles.includes(user.role)
    ) {
        const dashboardRoutes = {
            admin: "/admin/dashboard",
            citizen: "/citizen/dashboard",
            field_officer: "/field-officer/dashboard",
            department_officer: "/department/dashboard",
        };

        const userDashboard =
            dashboardRoutes[user.role];

        if (userDashboard) {
            return (
                <Navigate
                    to={userDashboard}
                    replace
                />
            );
        }

        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}

export default ProtectedRoute;