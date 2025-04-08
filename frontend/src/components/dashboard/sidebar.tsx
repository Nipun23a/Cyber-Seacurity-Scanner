import { Bell, BookOpen, Bug, ChevronRight, Home, LogOut, Shield, User, Wifi } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

function Sidebar({ collapsed, setCollapsed, onLogout }: { 
  collapsed: boolean, 
  setCollapsed: (value: boolean) => void, 
  onLogout: () => void 
}) {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Extract the active route from the current path
    const [activeItem, setActiveItem] = useState("dashboard");
    
    // Update activeItem when the route changes
    useEffect(() => {
      const path = location.pathname.split("/").pop() || "dashboard";
      setActiveItem(path);
    }, [location]);
   
    const menuItems = [
      { id: "dashboard", icon: Home, label: "Dashboard", path: "/dashboard" },
      { id: "malware", icon: Bug, label: "Malware Detection", path: "/dashboard/malware" },
      { id: "network", icon: Wifi, label: "Network Security", path: "/dashboard/network" },
      { id: "education", icon: BookOpen, label: "Security Education", path: "/dashboard/education" },
      { id: "alerts", icon: Bell, label: "Threat Alerts", path: "/dashboard/alerts" },
    ];

    // Handle navigation
    const handleNavigation = (itemId: string, path: string) => {
      setActiveItem(itemId);
      navigate(path);
    };
 
    return (
      <div
        className={`${
          collapsed ? "w-20" : "w-64"
        } bg-gradient-to-b from-blue-700 to-indigo-800 text-white transition-all duration-300 flex flex-col shadow-xl`}
      >
        {/* Logo & Toggle */}
        <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"} p-4 border-b border-blue-600`}>
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-white" />
            {!collapsed && <span className="ml-2 font-bold text-xl">SecureScan</span>}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className={`${collapsed ? "hidden" : "flex"} hover:bg-blue-600`}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
       
        {/* Nav Items */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-2 space-y-1">
            {menuItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                className={`w-full ${collapsed ? "justify-center" : "justify-start"} mb-1 ${
                  activeItem === item.id
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "hover:bg-blue-600/50"
                }`}
                onClick={() => handleNavigation(item.id, item.path)}
              >
                {React.createElement(item.icon, { className: `h-5 w-5 ${collapsed ? "" : "mr-3"}` })}
                {!collapsed && <span>{item.label}</span>}
              </Button>
            ))}
          </nav>
        </div>
       
        {/* User Profile & Logout */}
        <div className="p-4 border-t border-blue-600">
          <Button
            variant="ghost"
            className={`w-full ${collapsed ? "justify-center" : "justify-start"} mb-2 hover:bg-blue-600/50`}
            onClick={() => handleNavigation("profile", "/dashboard/profile")}
          >
            <User className={`h-5 w-5 ${collapsed ? "" : "mr-3"}`} />
            {!collapsed && <span>Profile</span>}
          </Button>
          <Button
              variant="ghost"
              className={`w-full ${collapsed ? "justify-center" : "justify-start"} hover:bg-blue-600/50`}
              onClick={onLogout}
          >
            <LogOut className={`h-5 w-5 ${collapsed ? "" : "mr-3"}`} />
            {!collapsed && <span>Sign Out</span>}
          </Button>
        </div>
      </div>
    );
}

export default Sidebar;