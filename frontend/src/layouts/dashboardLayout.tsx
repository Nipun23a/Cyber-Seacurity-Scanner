import React, { useState } from "react";
import { useNavigate, Routes, Route } from "react-router-dom";
import Sidebar from "@/components/dashboard/sidebar.tsx";
import Dashboard from "@/pages/Dashboard.tsx";
import Header from "@/components/dashboard/header.tsx";
import ProfileSection from "@/pages/Profile.tsx";

interface DashboardLayoutProps {
    children?: React.ReactNode;
    onLogout?: () => void;
}

// Main Dashboard Layout Component
export default function DashboardLayout({ children, onLogout }: DashboardLayoutProps) {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        if (onLogout) {
            onLogout();
        }
        navigate('/auth');
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <Sidebar
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                onLogout={handleLogout}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto bg-gray-50 p-4">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/profile" element={<ProfileSection />} />
                        
                        {/* Add more routes for other sections as needed */}
                    </Routes>
                    {!children}
                </main>
            </div>
        </div>
    );
}