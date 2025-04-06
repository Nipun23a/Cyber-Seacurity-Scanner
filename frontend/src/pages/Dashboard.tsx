import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@radix-ui/react-progress";
import { ShieldIcon, AlertCircle, HardDrive, Activity, CheckCircle, Zap
} from "lucide-react";

function Dashboard() {
    // Sample data for dashboard
    const securityScore = 76;
    const vulnerabilities = [
      { id: 1, severity: "high", issue: "Outdated software detected", system: "Windows 10 Enterprise", status: "open" },
      { id: 2, severity: "medium", issue: "Weak password policy", system: "User accounts", status: "open" },
      { id: 3, severity: "low", issue: "Non-essential ports open", system: "Network firewall", status: "resolved" },
    ];
    
    const scanHistory = [
      { id: 1, date: "April 05, 2025", type: "Full System Scan", findings: 3, duration: "14 minutes" },
      { id: 2, date: "April 02, 2025", type: "Quick Scan", findings: 1, duration: "5 minutes" },
      { id: 3, date: "March 28, 2025", type: "Network Scan", findings: 4, duration: "8 minutes" },
    ];
  
    const getSeverityColor = (severity: string) => {
      switch (severity) {
        case "high": return "text-red-600 bg-red-50";
        case "medium": return "text-amber-600 bg-amber-50";
        case "low": return "text-blue-600 bg-blue-50";
        default: return "text-gray-600 bg-gray-50";
      }
    };
    
    return (
      <div className="space-y-6">
        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Security Score</p>
                  <h3 className="text-2xl font-bold mt-1">{securityScore}/100</h3>
                </div>
                <div className={`p-3 rounded-full ${securityScore > 70 ? "bg-green-100" : "bg-amber-100"}`}>
                  <ShieldIcon className={`h-6 w-6 ${securityScore > 70 ? "text-green-600" : "text-amber-600"}`} />
                </div>
              </div>
              <Progress value={securityScore} className="mt-4 h-2" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Active Threats</p>
                  <h3 className="text-2xl font-bold mt-1">2</h3>
                </div>
                <div className="p-3 rounded-full bg-red-100">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="mt-4 text-sm text-red-600">
                2 critical issues need your attention
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Protected Devices</p>
                  <h3 className="text-2xl font-bold mt-1">5/8</h3>
                </div>
                <div className="p-3 rounded-full bg-blue-100">
                  <HardDrive className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 text-sm text-blue-600">
                3 devices need security updates
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Last Scan</p>
                  <h3 className="text-2xl font-bold mt-1">2h ago</h3>
                </div>
                <div className="p-3 rounded-full bg-indigo-100">
                  <Activity className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
              <div className="mt-4 text-sm text-indigo-600">
                Next scan scheduled in 22h
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Vulnerability Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Active Vulnerabilities</CardTitle>
              <CardDescription>Most recent vulnerability findings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {vulnerabilities.map((item) => (
                  <div key={item.id} className="p-3 bg-white border rounded-lg flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${getSeverityColor(item.severity)}`}>
                        {item.status === "open" ? (
                          <AlertCircle className="h-4 w-4" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{item.issue}</p>
                        <p className="text-sm text-gray-500">{item.system}</p>
                      </div>
                    </div>
                    <div className={`text-xs font-medium px-2 py-1 rounded capitalize ${
                      item.status === "open" 
                        ? "bg-red-50 text-red-600" 
                        : "bg-green-50 text-green-600"
                    }`}>
                      {item.status}
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                View All Vulnerabilities
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Scan History</CardTitle>
              <CardDescription>Recent security scans performed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {scanHistory.map((scan) => (
                  <div key={scan.id} className="p-3 bg-white border rounded-lg flex items-center justify-between">
                    <div>
                      <div className="flex items-center">
                        <Zap className="h-4 w-4 text-blue-600 mr-2" />
                        <p className="font-medium">{scan.type}</p>
                      </div>
                      <p className="text-sm text-gray-500">{scan.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{scan.findings} issues found</p>
                      <p className="text-xs text-gray-500">Duration: {scan.duration}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                View Full Scan History
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
}

export default Dashboard;