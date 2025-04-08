import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@radix-ui/react-progress";
import { ShieldIcon, AlertCircle, HardDrive, Activity, CheckCircle, Zap
} from "lucide-react";
import { useEffect, useState } from "react";

interface ScanResult {
  id: number;
  scan_type: string;
  scan_result: string;
  uploaded_at: string;
}




function Dashboard() {
    const [scanResults, setScanResults] = useState<ScanResult[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState("");



    const getUserScanResults = async () => {
      try{
        setLoading(true);
        const token = localStorage.getItem("authToken");
        const response = await fetch(`http://localhost:5000/scan/result`,{
          headers:{
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          }
        });
        const data = await response.json();
        if(data.success){
          console.log(data.results);
          setScanResults(data.results);
        }else{
          setError(data.message || "Failed to fetch scan results");
        }
      }catch(error){
        setError("An error occurred while fetching scan results");
        console.error(error);
      }finally{
        setLoading(false);
      }
    };


    useEffect(() => {
      getUserScanResults();}, []);

    // Calculate security score based on scan results
  const calculateSecurityScore = (): number => {
    if (scanResults.length === 0) return 76; // Default score if no scans available
    
    // Get the most recent scan result
    const latestScan = scanResults[0];
    let score = 100; // Start with perfect score
    
    try {
      // Parse the scan_result if it's a string
      const resultData = typeof latestScan.scan_result === 'string' 
        ? JSON.parse(latestScan.scan_result) 
        : latestScan.scan_result;
      
      if (latestScan.scan_type === 'directory' && resultData.directory_scan) {
        const infectedCount: number = resultData.directory_scan.infected_files?.length || 0;
        const scannedFiles: number = resultData.directory_scan.stats?.scanned_files || 0;
        const skippedFiles: number = resultData.directory_scan.stats?.skipped_files || 0;
        const relevantFiles: number = scannedFiles - skippedFiles;
        
        if (relevantFiles > 0) {
          // Calculate infection rate as a percentage
          const infectionRate: number = (infectedCount / relevantFiles) * 100;
          // Convert infection rate to security score (higher infection = lower score)
          score = Math.max(0, Math.round(100 - infectionRate));
        }
      } else if (latestScan.scan_type === 'quick' && resultData.quick_scan) {
        // Similar calculation for quick scan if available
        const infectedCount: number = resultData.quick_scan.infected_files?.length || 0;
        const scannedFiles: number = resultData.quick_scan.stats?.scanned_files || 0;
        const skippedFiles: number = resultData.quick_scan.stats?.skipped_files || 0;
        const relevantFiles: number = scannedFiles - skippedFiles;
        
        if (relevantFiles > 0) {
          const infectionRate: number = (infectedCount / relevantFiles) * 100;
          score = Math.max(0, Math.round(100 - infectionRate));
        }
      } else if (latestScan.scan_type === 'full' && resultData.full_scan) {
        // Similar calculation for full scan if available
        const infectedCount: number = resultData.full_scan.infected_files?.length || 0;
        const scannedFiles: number = resultData.full_scan.stats?.scanned_files || 0;
        const skippedFiles: number = resultData.full_scan.stats?.skipped_files || 0;
        const relevantFiles: number = scannedFiles - skippedFiles;
        
        if (relevantFiles > 0) {
          const infectionRate: number = (infectedCount / relevantFiles) * 100;
          score = Math.max(0, Math.round(100 - infectionRate));
        }
      }
      
      return score;
    } catch (err) {
      console.error("Error calculating security score:", err);
      return 76; // Default fallback score
    }
  };

    // Sample data for dashboard
    const securityScore = calculateSecurityScore(); // Calculate security score based on scan results
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