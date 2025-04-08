import MalwareBanner from "@/components/dashboard/malwareBaneer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ShieldIcon, AlertCircle,  Activity, CheckCircle, Zap
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

  // Count active threats from scan results
const countActiveThreats = (): number => {
  if (scanResults.length === 0) return 0; // No threats if no scans available
  
  // Scan through all results to find infected files
  let totalThreats = 0;
  
  for (const scan of scanResults) {
    try {
      // Parse the scan_result if it's a string
      const resultData = typeof scan.scan_result === 'string' 
        ? JSON.parse(scan.scan_result) 
        : scan.scan_result;
      
      if (scan.scan_type === 'directory' && resultData.directory_scan) {
        totalThreats += resultData.directory_scan.infected_files?.length || 0;
      } else if (scan.scan_type === 'quick' && resultData.quick_scan) {
        totalThreats += resultData.quick_scan.infected_files?.length || 0;
      } else if (scan.scan_type === 'full' && resultData.full_scan) {
        totalThreats += resultData.full_scan.infected_files?.length || 0;
      }
    } catch (err) {
      console.error("Error counting threats in scan result:", err);
    }
  }
  
  return totalThreats;
};

    // Sample data for dashboard
    const securityScore = calculateSecurityScore(); // Calculate security score based on scan results
    const activeThreats = countActiveThreats();
    const vulnerabilities = [
      { id: 1, severity: "high", issue: "Outdated software detected", system: "Windows 10 Enterprise", status: "open" },
      { id: 2, severity: "medium", issue: "Weak password policy", system: "User accounts", status: "open" },
      { id: 3, severity: "low", issue: "Non-essential ports open", system: "Network firewall", status: "resolved" },
    ];
    
    const getSeverityColor = (severity: string) => {
      switch (severity) {
        case "high": return "text-red-600 bg-red-50";
        case "medium": return "text-amber-600 bg-amber-50";
        case "low": return "text-blue-600 bg-blue-50";
        default: return "text-gray-600 bg-gray-50";
      }
    };

    const getLastScanTime = (): string => {
      if (scanResults.length === 0) return "No scans";
      
      // Get the most recent scan
      const latestScan = scanResults[0];
      const uploadTime = new Date(latestScan.upload_at);
      const currentTime = new Date();
      
      // Calculate time difference in milliseconds
      const diffMs = currentTime.getTime() - uploadTime.getTime();
      
      // Convert to minutes, hours, days
      const diffMinutes = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / (60000 * 60));
      const diffDays = Math.floor(diffMs / (60000 * 60 * 24));
      
      // Return appropriate string based on elapsed time
      if (diffDays > 0) {
        return `${diffDays}d ago`;
      } else if (diffHours > 0) {
        return `${diffHours}h ago`;
      } else if (diffMinutes > 0) {
        return `${diffMinutes}m ago`;
      } else {
        return "Just now";
      }
    };

    // Function to format scan history data from API results
    const formatScanHistory = () => {
      return scanResults.map((scan) => {
        // Parse the scan_result JSON if it's a string
        const resultData = typeof scan.scan_result === 'string' 
          ? JSON.parse(scan.scan_result) 
          : scan.scan_result;
        
        // Format the date
        const date = new Date(scan.upload_at);
        const formattedDate = date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: '2-digit' 
        });
        
        // Extract findings and duration based on scan type
        let findings = 0;
        let duration = "N/A";
        
        if (scan.scan_type === 'directory' && resultData.directory_scan) {
          findings = resultData.directory_scan.infected_files?.length || 0;
          duration = `${resultData.directory_scan.stats?.scan_duration_seconds.toFixed(2) || 0} seconds`;
        } else if (scan.scan_type === 'quick' && resultData.quick_scan) {
          findings = resultData.quick_scan.infected_files?.length || 0;
          duration = `${resultData.quick_scan.stats?.scan_duration_seconds.toFixed(2) || 0} seconds`;
        } else if (scan.scan_type === 'full' && resultData.full_scan) {
          findings = resultData.full_scan.infected_files?.length || 0;
          duration = `${resultData.full_scan.stats?.scan_duration_seconds.toFixed(2) || 0} seconds`;
        }
        
        // Capitalize scan type for display
        const displayType = scan.scan_type.charAt(0).toUpperCase() + scan.scan_type.slice(1) + " Scan";
        
        return {
          id: scan.id,
          date: formattedDate,
          type: displayType,
          findings: findings,
          duration: duration
        };
      });
    };

    // Then in your component:
    const scanHistory = formatScanHistory();

    
    
    return (
      <div className="space-y-10">
        {/* Top Stats Cards */}
        <MalwareBanner activeThreatCount={activeThreats} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <h3 className="text-2xl font-bold mt-1">{activeThreats}</h3>
                </div>
                <div className="p-3 rounded-full bg-red-100">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
              {activeThreats > 0 && (
                <div className="mt-4 text-sm text-red-600">
                  {activeThreats} critical issue{activeThreats > 1 ? 's' : ''} need{activeThreats === 1 ? 's' : ''} your attention
                </div>
              )}
            </CardContent>
          </Card>
           
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Last Scan</p>
                  <h3 className="text-2xl font-bold mt-1">
                    {loading ? "Loading..." : getLastScanTime()}
                  </h3>
                </div>
                <div className="p-3 rounded-full bg-indigo-100">
                  <Activity className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
              <div className="mt-4 text-sm text-indigo-600">
                {loading ? "Loading..." : scanResults.length > 0 
                  ? `${scanResults[0].scan_type.charAt(0).toUpperCase() + scanResults[0].scan_type.slice(1)} scan completed` 
                  : "No recent scans"}
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
              {loading ? (
                <div className="text-center py-6">Loading scan history...</div>
              ) : error ? (
                <div className="text-center py-6 text-red-500">{error}</div>
              ) : scanResults.length === 0 ? (
                <div className="text-center py-6">No scan history available</div>
              ) : (
                <div className="space-y-2">
                  {formatScanHistory().map((scan) => (
                    <div key={scan.id} className="p-3 bg-white border rounded-lg flex items-center justify-between">
                      <div>
                        <div className="flex items-center">
                          <Zap className="h-4 w-4 text-blue-600 mr-2" />
                          <p className="font-medium">{scan.type}</p>
                        </div>
                        <p className="text-sm text-gray-500">{scan.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{scan.findings} {scan.findings === 1 ? 'issue' : 'issues'} found</p>
                        <p className="text-xs text-gray-500">Duration: {scan.duration}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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