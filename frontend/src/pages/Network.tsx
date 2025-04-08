import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  ShieldIcon, 
  AlertCircle, 
  Activity, 
  Wifi, 
  Globe, 
  Zap,
  Lock,
  WifiOff,
  Server,
  ExternalLink
} from "lucide-react";
import { useEffect, useState } from "react";

interface NetworkScanResult {
  id: number;
  network_scan_result: string;
  upload_at: string;
}

interface SystemInfo {
  hostname: string;
  os_name: string;
  os_version: string;
  os_edition: string;
  platform: string;
  processor: string;
  ram_gb: number;
  antivirus: string[];
  username: string;
  scan_time: string;
}

interface FirewallStatus {
  "Domain Profile": string;
  "Private Profile": string;
  "Public Profile": string;
}

interface Port {
  port: number;
  service: string;
}

interface Software {
  name: string;
  version: string;
  vulnerable: boolean;
  vulnerability_info: any;
}

interface ParsedNetworkScan {
  system_info: SystemInfo;
  defender_status: Record<string, any>;
  firewall_status: FirewallStatus;
  open_ports: Port[];
  installed_software: Software[];
}

function NetworkSecurity() {
  const [networkScanResults, setNetworkScanResults] = useState<NetworkScanResult[]>([]);
  const [parsedResults, setParsedResults] = useState<ParsedNetworkScan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState("");

  const getNetworkScanResults = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const response = await fetch(`http://localhost:5000/scan/network-result`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      });
      const data = await response.json();
      if (data.success) {
        console.log(data.results);
        setNetworkScanResults(data.results);
        parseNetworkResults(data.results);
      } else {
        setError(data.message || "Failed to fetch network scan results");
      }
    } catch (error) {
      setError("An error occurred while fetching network scan results");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const parseNetworkResults = (results: NetworkScanResult[]) => {
    try {
      const parsed = results.map(result => {
        const parsedData = JSON.parse(result.network_scan_result) as ParsedNetworkScan;
        return parsedData;
      });
      setParsedResults(parsed);
    } catch (err) {
      console.error("Error parsing network scan results:", err);
      setError("Error parsing network scan data");
    }
  };

  useEffect(() => {
    getNetworkScanResults();
  }, []);

  // Calculate network security score based on scan results
  const calculateNetworkSecurityScore = (): number => {
    if (parsedResults.length === 0) return 82; // Default score if no scans available
    
    // Get the most recent scan result
    const latestScan = parsedResults[0];
    let score = 100; // Start with perfect score
    
    try {
      // Check for open ports that might be security risks
      const criticalServices = ["SMB", "RPC", "MySQL"];
      const riskyPorts = latestScan.open_ports.filter(port => 
        criticalServices.includes(port.service)
      ).length;
      
      // Deduct points for risky open ports
      score -= riskyPorts * 5;
      
      // Deduct for unknown ports
      const unknownPorts = latestScan.open_ports.filter(port => 
        port.service === "Unknown"
      ).length;
      score -= unknownPorts * 3;
      
      // Check for firewall status
      const firewall = latestScan.firewall_status;
      if (firewall["Public Profile"] === "Unknown" || 
          firewall["Private Profile"] === "Unknown" || 
          firewall["Domain Profile"] === "Unknown") {
        score -= 10; // Deduct points for unknown firewall status
      }
      
      // Check for vulnerable software
      const vulnerableSoftwareCount = latestScan.installed_software.filter(
        software => software.vulnerable === true
      ).length;
      score -= vulnerableSoftwareCount * 8;
      
      return Math.max(0, Math.min(100, Math.round(score)));
    } catch (err) {
      console.error("Error calculating network security score:", err);
      return 82; // Default fallback score
    }
  };

  // Get the system information from the most recent scan
  const getSystemInfo = () => {
    if (parsedResults.length === 0) return null;
    return parsedResults[0].system_info;
  };

  const getLastScanTime = (): string => {
    if (networkScanResults.length === 0) return "No scans";
    
    // Get the most recent scan
    const latestScan = networkScanResults[0];
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

  // Get open ports from the most recent scan
  const getOpenPorts = () => {
    if (parsedResults.length === 0) return [];
    return parsedResults[0].open_ports || [];
  };

  // Sample data for network security dashboard (using actual parsed data)
  const networkSecurityScore = calculateNetworkSecurityScore();
  const systemInfo = getSystemInfo();
  const openPorts = getOpenPorts();
  
  return (
    <div className="space-y-10">
      {/* Page Title */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Network Security Monitor</h1>
      </div>
      
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Network Security Score</p>
                <h3 className="text-2xl font-bold mt-1">{networkSecurityScore}/100</h3>
              </div>
              <div className={`p-3 rounded-full ${networkSecurityScore > 70 ? "bg-green-100" : "bg-amber-100"}`}>
                <ShieldIcon className={`h-6 w-6 ${networkSecurityScore > 70 ? "text-green-600" : "text-amber-600"}`} />
              </div>
            </div>
            <Progress value={networkSecurityScore} className="mt-4 h-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Open Ports</p>
                <h3 className="text-2xl font-bold mt-1">{openPorts.length}</h3>
              </div>
              <div className="p-3 rounded-full bg-red-100">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            {openPorts.length > 0 && (
              <div className="mt-4 text-sm text-red-600">
                {openPorts.length} potentially vulnerable port{openPorts.length > 1 ? 's' : ''} detected
              </div>
            )}
          </CardContent>
        </Card>
         
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Last Network Scan</p>
                <h3 className="text-2xl font-bold mt-1">
                  {loading ? "Loading..." : getLastScanTime()}
                </h3>
              </div>
              <div className="p-3 rounded-full bg-indigo-100">
                <Activity className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-indigo-600">
              {loading ? "Loading..." : networkScanResults.length > 0 
                ? "Network security assessment completed" 
                : "No recent network scans"}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* System Information */}
      {systemInfo && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>System Information</CardTitle>
            <CardDescription>Details about the scanned system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-3 bg-white border rounded-lg">
                <p className="text-sm font-medium text-gray-500">Hostname</p>
                <p className="font-medium">{systemInfo.hostname}</p>
              </div>
              <div className="p-3 bg-white border rounded-lg">
                <p className="text-sm font-medium text-gray-500">Operating System</p>
                <p className="font-medium">{systemInfo.os_edition}</p>
              </div>
              <div className="p-3 bg-white border rounded-lg">
                <p className="text-sm font-medium text-gray-500">CPU</p>
                <p className="font-medium">{systemInfo.processor}</p>
              </div>
              <div className="p-3 bg-white border rounded-lg">
                <p className="text-sm font-medium text-gray-500">RAM</p>
                <p className="font-medium">{systemInfo.ram_gb} GB</p>
              </div>
              <div className="p-3 bg-white border rounded-lg">
                <p className="text-sm font-medium text-gray-500">Antivirus</p>
                <p className="font-medium">{systemInfo.antivirus.join(", ")}</p>
              </div>
              <div className="p-3 bg-white border rounded-lg">
                <p className="text-sm font-medium text-gray-500">User</p>
                <p className="font-medium">{systemInfo.username}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Open Ports and Firewall Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Open Ports</CardTitle>
            <CardDescription>Potentially vulnerable network services</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-6">Loading port information...</div>
            ) : error ? (
              <div className="text-center py-6 text-red-500">{error}</div>
            ) : openPorts.length === 0 ? (
              <div className="text-center py-6">No open ports detected</div>
            ) : (
              <div className="space-y-2">
                {openPorts.map((port, idx) => (
                  <div key={idx} className="p-3 bg-white border rounded-lg flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${
                        port.service === "Unknown" ? "bg-amber-50" :
                        (port.service === "SMB" || port.service === "RPC") ? "bg-red-50" : "bg-blue-50"
                      }`}>
                        <Globe className={`h-4 w-4 ${
                          port.service === "Unknown" ? "text-amber-600" :
                          (port.service === "SMB" || port.service === "RPC") ? "text-red-600" : "text-blue-600"
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium">Port {port.port}</p>
                        <p className="text-sm text-gray-500">{port.service}</p>
                      </div>
                    </div>
                    <div className={`text-xs font-medium px-2 py-1 rounded ${
                      port.service === "Unknown" ? "bg-amber-50 text-amber-600" :
                      (port.service === "SMB" || port.service === "RPC") ? "bg-red-50 text-red-600" : 
                      "bg-blue-50 text-blue-600"
                    }`}>
                      {port.service === "Unknown" ? "Unknown" :
                       (port.service === "SMB" || port.service === "RPC") ? "High Risk" : "Standard"}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Button variant="outline" className="w-full mt-4">
              Run Port Security Scan
            </Button>
          </CardContent>
        </Card>
        
        {parsedResults.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Firewall Status</CardTitle>
              <CardDescription>System firewall configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(parsedResults[0].firewall_status).map(([profile, status], idx) => (
                  <div key={idx} className="p-3 bg-white border rounded-lg flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        status === "Unknown" ? "bg-amber-50" : 
                        status === "Enabled" ? "bg-green-50" : "bg-red-50"
                      }`}>
                        {status === "Unknown" ? (
                          <AlertCircle className="h-4 w-4 text-amber-600" />
                        ) : status === "Enabled" ? (
                          <Lock className="h-4 w-4 text-green-600" />
                        ) : (
                          <WifiOff className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <p className="font-medium">{profile}</p>
                    </div>
                    <div className={`text-xs font-medium px-2 py-1 rounded ${
                      status === "Unknown" ? "bg-amber-50 text-amber-600" : 
                      status === "Enabled" ? "bg-green-50 text-green-600" : 
                      "bg-red-50 text-red-600"
                    }`}>
                      {status}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 bg-amber-50 text-amber-700 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium">Firewall Configuration Issues</p>
                    <p className="text-sm mt-1">Unable to determine firewall status. Check your Windows Defender Firewall settings.</p>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4">
                Configure Firewall Settings
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Installed Software */}
      {parsedResults.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Installed Software</CardTitle>
            <CardDescription>Detected applications with vulnerability status</CardDescription>
          </CardHeader>
          <CardContent>
            {parsedResults[0].installed_software.slice(0, 5).map((software, idx) => (
              <div key={idx} className="p-3 bg-white border rounded-lg flex items-center justify-between mb-2">
                <div>
                  <p className="font-medium">{software.name}</p>
                  <p className="text-sm text-gray-500">Version: {software.version}</p>
                </div>
                <div className={`text-xs font-medium px-2 py-1 rounded ${
                  software.vulnerable ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                }`}>
                  {software.vulnerable ? "Vulnerable" : "Secure"}
                </div>
              </div>
            ))}
            {parsedResults[0].installed_software.length > 5 && (
              <p className="text-center text-sm text-gray-500 mt-2">
                +{parsedResults[0].installed_software.length - 5} more applications
              </p>
            )}
            <Button variant="outline" className="w-full mt-4">
              View All Software ({parsedResults[0].installed_software.length})
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Recommendations */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Security Recommendations</CardTitle>
          <CardDescription>Steps to improve your network security</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {openPorts.some(p => p.service === "SMB" || p.service === "RPC") && (
              <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-start">
                <AlertCircle className="h-5 w-5 mr-3 mt-0.5" />
                <div>
                  <p className="font-medium">Close unnecessary ports (SMB/RPC)</p>
                  <p className="text-sm mt-1">SMB and RPC ports (445, 135) are visible and could be exploited. Consider closing these ports if not required.</p>
                </div>
              </div>
            )}
            
            {openPorts.some(p => p.service === "Unknown") && (
              <div className="p-4 bg-amber-50 text-amber-700 rounded-lg flex items-start">
                <AlertCircle className="h-5 w-5 mr-3 mt-0.5" />
                <div>
                  <p className="font-medium">Investigate unknown services</p>
                  <p className="text-sm mt-1">Unknown services on ports {openPorts.filter(p => p.service === "Unknown").map(p => p.port).join(", ")} should be investigated or disabled if not required.</p>
                </div>
              </div>
            )}
            
            {parsedResults.length > 0 && Object.values(parsedResults[0].firewall_status).includes("Unknown") && (
              <div className="p-4 bg-amber-50 text-amber-700 rounded-lg flex items-start">
                <AlertCircle className="h-5 w-5 mr-3 mt-0.5" />
                <div>
                  <p className="font-medium">Enable and configure firewall</p>
                  <p className="text-sm mt-1">Your firewall configuration couldn't be determined. Ensure Windows Defender Firewall is properly configured on all profiles.</p>
                </div>
              </div>
            )}
            
            {systemInfo && systemInfo.antivirus.length === 1 && systemInfo.antivirus[0] === "Windows Defender" && (
              <div className="p-4 bg-blue-50 text-blue-700 rounded-lg flex items-start">
                <AlertCircle className="h-5 w-5 mr-3 mt-0.5" />
                <div>
                  <p className="font-medium">Consider additional protection</p>
                  <p className="text-sm mt-1">While Windows Defender offers basic protection, consider advanced security solutions for better threat detection.</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default NetworkSecurity;