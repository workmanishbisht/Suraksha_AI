import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "sonner";

function App() {
    return (
        <AuthProvider>
            <Toaster
                position="top-right"
                richColors
                closeButton
                duration={3000}
            />
            <AppRoutes />
        </AuthProvider>
    );
}

export default App;