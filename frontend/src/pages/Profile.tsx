import { useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label";
import axios, { AxiosError } from "axios";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";

type AlertState = {
    show: boolean;
    type: "success"|"error"|"";
    message : string;
};

interface ApiErrorResponse{
    error: string;
}

function ProfileSection() {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const fullName = user?.full_name || "John Doe"; // Fallback to default name if not available
  const email = user?.email;
  const role = user?.role || "User"; // Fallback to default role if not available
  const rawDate = user?.created_at || "2025-04-06T04:24:15.597665";
  const date = new Date(rawDate);
  const monthNames = [
    "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
  ];
  const created_at = `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;

  const initials = fullName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase(); // Extract initials from full name

  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [oldPassword, setOldPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [alert, setAlert] = useState<AlertState>({show: false, type: "", message: ""});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handlePasswordChange = async () => {
    // Basic validation
    if (!oldPassword || !newPassword || !confirmPassword) {
      setAlert({
        show: true,
        type: "error",
        message: "All password fields are required"
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setAlert({
        show: true,
        type: "error",
        message: "New passwords do not match"
      });
      return;
    }

    // Password strength validation (optional)
    if (newPassword.length < 8) {
      setAlert({
        show: true,
        type: "error",
        message: "New password must be at least 8 characters long"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Get the JWT token from localStorage or wherever you store it
      const token = localStorage.getItem("authToken");
      
      if (!token) {
        setAlert({
          show: true,
          type: "error",
          message: "Authentication token missing. Please log in again."
        });
        setIsLoading(false);
        return;
      }

      // Make the API request
      const response = await axios.post(
        "http://localhost:5000/auth/change-password",
        {
          oldPassword,
          newPassword,
          confirmPassword
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        }
      );

      // Handle success
      setAlert({
        show: true,
        type: "success",
        message: "Password updated successfully"
      });

      // Reset form fields
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      // Close dialog after a delay
      setTimeout(() => {
        setIsDialogOpen(false);
      }, 2000);

    } catch (error) {
      // Handle errors
      let errorMessage = "An unexpected error occurred";
      
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        
        if (axiosError.response) {
          errorMessage = axiosError.response.data.error || errorMessage;
        } else if (axiosError.request) {
          errorMessage = "No response received from server. Please check your connection.";
        }
      }
      
      setAlert({
        show: true,
        type: "error",
        message: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
          <CardDescription>View and manage your profile information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="h-20 w-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-medium">
                {initials}
              </div>
              <div>
                <h3 className="text-xl font-medium">{fullName}</h3>
                <p className="text-gray-500">{email}</p>
                <p className="text-sm text-blue-600">{role}</p>
              </div>
            </div>

            <div className="pt-4 space-y-4">
              <h4 className="font-medium">Account Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p>{fullName}</p>
                    </div>
                    <div>
                    <p className="text-sm text-gray-500">Email Address</p>
                    <p>{email}</p>
                    </div>
                    <div>
                    <p className="text-sm text-gray-500">Account Created</p>
                    <p>{created_at}</p>
                    </div>
                </div>

                <div>
      {alert.show && alert.type === "success" && !isDialogOpen && (
        <Alert className="mb-4 bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Success</AlertTitle>
          <AlertDescription className="text-green-700">
            {alert.message}
          </AlertDescription>
        </Alert>
      )}
      
        <div className="flex space-x-2 pt-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">Change Password</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                <DialogTitle>Change Your Password</DialogTitle>
                <DialogDescription>
                    Please enter your current password and a new password.
                </DialogDescription>
                </DialogHeader>
                
                {alert.show && (
                <Alert className={`mb-4 ${
                    alert.type === "success" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                }`}>
                    {alert.type === "success" ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertTitle className={alert.type === "success" ? "text-green-800" : "text-red-800"}>
                    {alert.type === "success" ? "Success" : "Error"}
                    </AlertTitle>
                    <AlertDescription className={alert.type === "success" ? "text-green-700" : "text-red-700"}>
                    {alert.message}
                    </AlertDescription>
                </Alert>
                )}
                
                <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="old-password">Old Password</Label>
                    <input
                    id="old-password"
                    type="password"
                    placeholder="Old Password"
                    value={oldPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOldPassword(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    required
                    />
                </div>
                </div>
                <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <input
                    id="new-password"
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    required
                    />
                </div>
                </div>
                <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    required
                    />
                </div>
                </div>
                <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                </Button>
                <Button onClick={handlePasswordChange} disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save"}
                </Button>
                </DialogFooter>
            </DialogContent>
            </Dialog>
        </div>
    </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProfileSection;