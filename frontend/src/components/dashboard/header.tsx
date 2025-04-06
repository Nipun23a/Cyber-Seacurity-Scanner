import { Bell } from "lucide-react";
import { Button } from "../ui/button";

// Header Component
function Header() {
    return (
      <header className="bg-white shadow-sm z-10">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-semibold text-gray-800">Cybersecurity Dashboard</h1>
          
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" className="flex items-center">
              <Bell className="h-4 w-4 mr-2" />
              <span>Alerts</span>
            </Button>
            
            <div className="flex items-center space-x-2">
              <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                JD
              </div>
              <div className="hidden md:block">
                <div className="text-sm font-medium">John Doe</div>
                <div className="text-xs text-gray-500">Administrator</div>
              </div>
            </div>
          </div>
        </div>
      </header>
    );
}

export default Header;