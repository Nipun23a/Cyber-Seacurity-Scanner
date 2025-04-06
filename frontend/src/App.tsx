
import './App.css'
import AuthForm from "@/pages/AuthForm.tsx";
import '@fontsource/open-sans/400.css'; // Regular weight
import '@fontsource/open-sans/600.css'; // Semi-Bold weight
import '@fontsource/open-sans/700.css'; // Bold weight

import { useEffect, useState } from 'react';
import { BrowserRouter,Routes,Route,Navigate } from 'react-router-dom';
import Dashboard from "@/pages/Dashboard.tsx";
import DashboardLayout from "@/layouts/dashboardLayout.tsx";

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            setIsAuthenticated(true);
        }
    }, []);


    // Function to handle successful login
    const handleLoginSuccess = (token : string) => {
        localStorage.setItem('authToken', token);
    }

    // Function to handle logout
    const handleLoout = () => {
        localStorage.removeItem('authToken');
        setIsAuthenticated(false);
    }
    
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path = '/auth'
                    element = {
                        isAuthenticated ?
                            <Navigate to="/dashboard" replace /> :
                            <AuthForm onLoginSuccess={handleLoginSuccess} />
                    }
                />

                {/* Dashboard Routes - protected by authentication */}
                <Route
                    path = '/dashboard'
                    element = {
                        isAuthenticated ?
                            <DashboardLayout/> :
                            <Navigate to="/auth" replace />
                    }
                />

                <Route
                    path="/"
                    element={
                        isAuthenticated ?
                            <Navigate to="/dashboard" replace /> :
                            <Navigate to="/auth" replace />
                    }
                />

                {/* Catch all - redirect to appropriate location */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
