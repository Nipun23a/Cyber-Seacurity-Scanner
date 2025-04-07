
import './App.css'
import AuthForm from "@/pages/AuthForm.tsx";
import '@fontsource/open-sans/400.css'; // Regular weight
import '@fontsource/open-sans/600.css'; // Semi-Bold weight
import '@fontsource/open-sans/700.css'; // Bold weight

import { useEffect, useState } from 'react';
import { BrowserRouter,Routes,Route,Navigate } from 'react-router-dom';
import DashboardLayout from "@/layouts/dashboardLayout.tsx";

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authChecked, setAuthChecked] = useState(false); // new state

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            setIsAuthenticated(true);
        }
        setAuthChecked(true); // indicate check complete
    }, []);

    console.log("Authenticated:", isAuthenticated, "Auth Checked:", authChecked);

    if (!authChecked) return null; // or a loading spinner

    const handleLoginSuccess = (token: string, user: unknown) => {
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user)); // Store user object as string
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        setIsAuthenticated(false);
    };

    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path='/auth'
                    element={
                        isAuthenticated ?
                            <Navigate to="/dashboard" replace /> :
                            <AuthForm onLoginSuccess={handleLoginSuccess} />
                    }
                />
                <Route
                    path='/dashboard/*'
                    element={
                        isAuthenticated ?
                            <DashboardLayout onLogout={handleLogout} /> :
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
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App
