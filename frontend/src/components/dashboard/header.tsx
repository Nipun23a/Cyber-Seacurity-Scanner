import { Bell, Download } from "lucide-react";
import { Button } from "../ui/button";
import axios from "axios";

// Header Component
function Header() {

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const fullName = user ?.full_name || "John Doe"; // Fallback to default name if not available
  const role = user ?.role || "User"; // Fallback to default role if not available
  const initials = fullName
  .split(' ')
  .map((n: string) => n[0])
  .join('')
  .toUpperCase(); // Extract initials from full name
  const handleDownload = async (): Promise<void> => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get("http://localhost:5000/download/scannerGUI.exe", {
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${token}`, // 👈 must match what Flask expects
        },
      });
      // Create a download link and trigger it
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "scannerGUI.exe"); // Specify the file name
      document.body.appendChild(link);
      link.click();
      
      // Clean up resources
      window.URL.revokeObjectURL(url);
      link.remove(); // Clean up the link element
    } catch (error) {
      console.error("Error downloading the application:", error);
      // Optionally, you can show an error message to the user
    }
  };
    return ( 
      <header className="bg-white shadow-sm z-10">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-semibold text-gray-800">Cybersecurity Dashboard</h1>
          
          <div className="flex items-center space-x-4">
            <Button variant = 'outline' size="sm" className="flex items-center" onClick={handleDownload}>
              <Download className = 'h-4 w-4 mr-2' />
              <span>Download Application</span>
            </Button>
            <Button variant="outline" size="sm" className="flex items-center">
              <Bell className="h-4 w-4 mr-2" />
              <span>Alerts</span>
            </Button>
            
            <div className="flex items-center space-x-2">
              <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                {initials}
              </div>
              <div className="hidden md:block">
                <div className="text-sm font-medium">{fullName}</div>
                <div className="text-xs text-gray-500">{role}</div>
              </div>
            </div>
          </div>
        </div>
      </header>
    );
}

export default Header;