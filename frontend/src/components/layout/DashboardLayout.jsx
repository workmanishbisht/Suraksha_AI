import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

function DashboardLayout() {
    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">

            {/* Fixed Sidebar */}
            <Sidebar />

            {/* Main Area */}
            <div className="min-w-0 lg:ml-[248px]">

                {/* Fixed Header */}
                <Header />

                {/* Page Content */}
                <main className="min-h-screen pt-[72px]">
                    <div className="p-4 sm:p-6">
                        <Outlet />
                    </div>
                </main>

            </div>
        </div>
    );
}

export default DashboardLayout;