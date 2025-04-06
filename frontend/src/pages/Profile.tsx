// Simple Profile Section
import {Button} from "@/components/ui/button.tsx";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";

function ProfileSection() {
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
                                JD
                            </div>
                            <div>
                                <h3 className="text-xl font-medium">John Doe</h3>
                                <p className="text-gray-500">john.doe@example.com</p>
                                <p className="text-sm text-blue-600">Administrator</p>
                            </div>
                        </div>

                        <div className="pt-4 space-y-4">
                            <h4 className="font-medium">Account Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Full Name</p>
                                    <p>John Doe</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Email Address</p>
                                    <p>john.doe@example.com</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Account Created</p>
                                    <p>April 1, 2025</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Last Login</p>
                                    <p>Today at 10:23 AM</p>
                                </div>
                            </div>

                            <div className="flex space-x-2 pt-2">
                                <Button>Edit Profile</Button>
                                <Button variant="outline">Change Password</Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default ProfileSection