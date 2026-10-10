
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

import Dashboard from "../pages/admin/Dashboard";
import Incidents from "../pages/admin/Incidents";
import Reports from "../pages/admin/Reports";
import Citizens from "../pages/admin/Citizens";
import FieldOfficers from "../pages/admin/FieldOfficers";
import EmergencyResources from "../pages/admin/EmergencyResources";
import Communication from "../pages/admin/Communication";
import Analytics from "../pages/admin/Analytics";
import Users from "../pages/admin/Users";
import RolesPermissions from "../pages/admin/RolesPermissions";
import AuditLogs from "../pages/admin/AuditLogs";
import SystemSettings from "../pages/admin/SystemSettings";
import Profile from "../pages/admin/Profile";

import CitizenDashboard from "../pages/citizen/Dashboard";
import ReportIncident from "../pages/citizen/ReportIncident";
import MyReports from "../pages/citizen/MyReports";
import Alerts from "../pages/citizen/Alerts";
import NearbyHelp from "../pages/citizen/NearbyHelp";
import EmergencyContacts from "../pages/citizen/EmergencyContacts";

import DashboardLayout from "../components/layout/DashboardLayout";
import ProtectedRoute from "../components/common/ProtectedRoute";

function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                {/* AUTH ROUTES */}

                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                    path="/forgot-password"
                    element={<ForgotPassword />}
                />
                <Route
                    path="/reset-password"
                    element={<ResetPassword />}
                />

                {/* ADMIN ROUTES */}

                <Route
                    element={
                        <ProtectedRoute allowedRoles={["admin"]} />
                    }
                >
                    <Route element={<DashboardLayout />}>
                        <Route
                            path="/admin/dashboard"
                            element={<Dashboard />}
                        />

                        <Route
                            path="/admin/incidents"
                            element={<Incidents />}
                        />

                        <Route
                            path="/admin/reports"
                            element={<Reports />}
                        />

                        <Route
                            path="/admin/citizens"
                            element={<Citizens />}
                        />

                        <Route
                            path="/admin/field-officers"
                            element={<FieldOfficers />}
                        />

                        <Route
                            path="/admin/resources"
                            element={<EmergencyResources />}
                        />

                        <Route
                            path="/admin/communication"
                            element={<Communication />}
                        />

                        <Route
                            path="/admin/analytics"
                            element={<Analytics />}
                        />

                        {/* Administration - Users */}
                        <Route
                            path="/admin/administration/users"
                            element={<Users />}
                        />

                        {/* Redirect old Users URL */}
                        <Route
                            path="/admin/users"
                            element={
                                <Navigate
                                    to="/admin/administration/users"
                                    replace
                                />
                            }
                        />

                        {/* Administration - Roles & Permissions */}
                        <Route
                            path="/admin/administration/roles-permissions"
                            element={<RolesPermissions />}
                        />

                        {/* Administration - Audit Logs */}
                        <Route
                            path="/admin/audit-logs"
                            element={<AuditLogs />}
                        />

                        {/* System Settings remains separate */}
                        <Route
                            path="/admin/settings"
                            element={<SystemSettings />}
                        />

                        <Route
                            path="/admin/profile"
                            element={<Profile />}
                        />
                    </Route>
                </Route>

                {/* CITIZEN ROUTES */}

                <Route
                    element={
                        <ProtectedRoute allowedRoles={["citizen"]} />
                    }
                >
                    <Route element={<DashboardLayout />}>
                        <Route
                            path="/citizen/dashboard"
                            element={<CitizenDashboard />}
                        />

                        <Route
                            path="/citizen/report-incident"
                            element={<ReportIncident />}
                        />

                        <Route
                            path="/citizen/my-reports"
                            element={<MyReports />}
                        />

                        <Route
                            path="/citizen/alerts"
                            element={<Alerts />}
                        />

                        <Route
                            path="/citizen/nearby-help"
                            element={<NearbyHelp />}
                        />

                        <Route
                            path="/citizen/emergency-contacts"
                            element={<EmergencyContacts />}
                        />
                    </Route>
                </Route>

                {/* FIELD OFFICER ROUTES */}

                <Route
                    element={
                        <ProtectedRoute
                            allowedRoles={["field_officer"]}
                        />
                    }
                >
                    <Route element={<DashboardLayout />}>
                        <Route
                            path="/field-officer/dashboard"
                            element={
                                <div className="p-6 text-white">
                                    Field Officer Dashboard
                                </div>
                            }
                        />
                    </Route>
                </Route>

                {/* DEPARTMENT OFFICER ROUTES */}

                <Route
                    element={
                        <ProtectedRoute
                            allowedRoles={["department_officer"]}
                        />
                    }
                >
                    <Route element={<DashboardLayout />}>
                        <Route
                            path="/department/dashboard"
                            element={
                                <div className="p-6 text-white">
                                    Department Officer Dashboard
                                </div>
                            }
                        />
                    </Route>
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;
