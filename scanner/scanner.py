import os
import hashlib
import tempfile

import requests
import socket
import subprocess
import json
import platform
import time
import sys
from datetime import datetime
import ctypes
from colorama import init, Fore, Style
import jwt
# Initialize colorama for colored console output
init()

# Flask Backend URL
BACKEND_URL = "http://127.0.0.1:5000"  # Change this to your actual backend URL
TOKEN = ""


def login(email, password, backend_url=None):
    """Authenticate with backend server and get JWT token"""
    try:
        url = backend_url or BACKEND_URL
        print(f"Attempting to connect to: {url}")

        response = requests.post(
            f"{url}/auth/login",
            json={"email": email, "password": password},
            timeout=10
        )

        # Print response status and content for debugging
        print(f"Status code: {response.status_code}")
        print(f"Response content: {response.content[:100]}")  # Print first 100 chars to avoid large output

        # Check if response has content before trying to parse JSON
        if response.content:
            try:
                data = response.json()
                if response.status_code == 200:
                    global TOKEN
                    TOKEN = data.get("access_token")
                    print(f"JWT token: {TOKEN}")
                    return True, None
                else:
                    error_msg = data.get("error", "Authentication failed")
                    return False, error_msg
            except json.JSONDecodeError as e:
                return False, f"Invalid response from server: {str(e)}"
        else:
            return False, "Server returned empty response"

    except requests.exceptions.ConnectionError:
        return False, "Could not connect to server. Please check the server URL and ensure the server is running."
    except requests.exceptions.Timeout:
        return False, "Connection timed out. Server may be overloaded or unreachable."
    except Exception as e:
        return False, f"Error: {str(e)}"

def test_backend_connection(backend_url):
    """ Test connection to backend """
    try:
        url = backend_url or BACKEND_URL
        response = requests.get(f"{url}/test-connection",timeout=10)
        return response.json().get('success',False)
    except Exception as e:
        print(f"{Fore.RED}[!] Connection test failed: {str(e)}{Style.RESET_ALL}")
        return False




# Function: Check if running as administrator
def is_admin():
    try:
        return ctypes.windll.shell32.IsUserAnAdmin() != 0
    except:
        return False


# Function: Get system details with more comprehensive information
def get_system_info():
    try:
        # Get Windows version details
        win_ver = platform.win32_ver()
        win_edition = subprocess.check_output(
            'wmic os get Caption', shell=True).decode().split('\n')[1].strip()

        # Get RAM information
        ram = subprocess.check_output(
            'wmic ComputerSystem get TotalPhysicalMemory', shell=True
        ).decode().split('\n')[1].strip()
        ram_gb = round(int(ram) / (1024 ** 3), 2)

        # Get processor information
        processor = subprocess.check_output(
            'wmic cpu get Name', shell=True).decode().split('\n')[1].strip()

        # Get antivirus information
        try:
            av_products = subprocess.check_output(
                'wmic /namespace:\\\\root\\SecurityCenter2 path AntiVirusProduct get displayName',
                shell=True).decode()
            av_list = [av.strip() for av in av_products.split('\n')[1:] if av.strip()]
        except:
            av_list = ["Could not detect antivirus software"]

        return {
            "hostname": socket.gethostname(),
            "os_name": platform.system(),
            "os_version": win_ver[0],
            "os_edition": win_edition,
            "platform": platform.platform(),
            "processor": processor,
            "ram_gb": ram_gb,
            "antivirus": av_list,
            "username": os.getlogin(),
            "scan_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
    except Exception as e:
        return {
            "hostname": socket.gethostname(),
            "os": os.name,
            "platform": platform.platform(),
            "error": str(e)
        }


# Function: Get Windows Defender status
def get_defender_status():
    try:
        result = subprocess.check_output(
            'powershell -command "Get-MpComputerStatus | Select-Object AntivirusEnabled,RealTimeProtectionEnabled,IoavProtectionEnabled,AntispywareEnabled"',
            shell=True).decode()

        status = {}
        for line in result.splitlines():
            if ":" in line:
                key, value = line.split(":", 1)
                status[key.strip()] = value.strip().lower() == "true"
        return status
    except:
        return {"error": "Could not retrieve Windows Defender status"}


# Function: Expanded malware signatures database
def get_malware_signatures():
    return {
        "e99a18c428cb38d5f260853678922e03": "Trojan.Generic",
        "c157a79031e1c40f85931829bc5fc552": "Ransomware.WannaCry",
        "5f4dcc3b5aa765d61d8327deb882cf99": "Malware.Password",
        "25f9e794323b453885f5181f1b624d0b": "Trojan.Downloader",
        "827ccb0eea8a706c4c34a16891f84e7b": "Backdoor.Remote",
        "e10adc3949ba59abbe56e057f20f883e": "Keylogger.Common",
        "098f6bcd4621d373cade4e832627b4f6": "Worm.Network",
    }


# Function: Scan Files for Malware Signatures (Enhanced)
def scan_files(directory, callback=None):
    known_hashes = get_malware_signatures()
    infected_files = []
    scanned_files = 0
    skipped_files = 0
    start_time = time.time()

    # List of file extensions to prioritize scanning
    risky_extensions = ['.exe', '.dll', '.bat', '.cmd', '.ps1', '.vbs', '.js', '.jar', '.zip', '.rar']

    print(f"{Fore.CYAN}[*] Scanning directory: {directory}{Style.RESET_ALL}")

    # Get total files for progress reporting
    total_files = 0
    for root, _, files in os.walk(directory):
        total_files += len(files)

    # Start scanning
    for root, _, files in os.walk(directory):
        for file in files:
            scanned_files += 1

            if callback and scanned_files % 50 == 0:  # Update progress every 50 files
                progress = (scanned_files / total_files) * 100
                callback(int(progress), scanned_files, total_files)

            file_path = os.path.join(root, file)
            file_ext = os.path.splitext(file)[1].lower()

            # Skip very large files to improve performance
            try:
                if os.path.getsize(file_path) > 100 * 1024 * 1024:  # Skip files larger than 100MB
                    skipped_files += 1
                    continue

                # Prioritize scanning risky file extensions
                if file_ext in risky_extensions:
                    with open(file_path, "rb") as f:
                        file_hash = hashlib.md5(f.read()).hexdigest()
                    if file_hash in known_hashes:
                        infected_files.append({
                            "file": file_path,
                            "malware": known_hashes[file_hash],
                            "hash": file_hash,
                            "size": os.path.getsize(file_path)
                        })
                        print(
                            f"{Fore.RED}[!] Found infected file: {file_path} - {known_hashes[file_hash]}{Style.RESET_ALL}")
                else:
                    # For non-risky extensions, scan with lower priority
                    # This approach can be modified based on performance needs
                    with open(file_path, "rb") as f:
                        file_hash = hashlib.md5(f.read()).hexdigest()
                    if file_hash in known_hashes:
                        infected_files.append({
                            "file": file_path,
                            "malware": known_hashes[file_hash],
                            "hash": file_hash,
                            "size": os.path.getsize(file_path)
                        })
                        print(
                            f"{Fore.RED}[!] Found infected file: {file_path} - {known_hashes[file_hash]}{Style.RESET_ALL}")
            except Exception as e:
                skipped_files += 1
                continue

    scan_duration = time.time() - start_time

    return {
        "infected_files": infected_files,
        "stats": {
            "scanned_files": scanned_files,
            "skipped_files": skipped_files,
            "scan_duration_seconds": round(scan_duration, 2)
        }
    }


# Function: Scan Open Ports with service detection
def scan_open_ports():
    print(f"{Fore.CYAN}[*] Scanning for open ports...{Style.RESET_ALL}")
    common_ports = {
        20: "FTP-Data", 21: "FTP", 22: "SSH", 23: "Telnet", 25: "SMTP",
        53: "DNS", 80: "HTTP", 110: "POP3", 135: "RPC", 139: "NetBIOS",
        143: "IMAP", 443: "HTTPS", 445: "SMB", 993: "IMAPS", 995: "POP3S",
        1433: "MSSQL", 3306: "MySQL", 3389: "RDP", 5900: "VNC", 8080: "HTTP-Alt"
    }

    open_ports = []
    for port in range(1, 1025):  # Scan common ports
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(0.5)
        if sock.connect_ex(("127.0.0.1", port)) == 0:
            service = common_ports.get(port, "Unknown")
            open_ports.append({"port": port, "service": service})
            print(f"{Fore.YELLOW}[+] Found open port: {port} ({service}){Style.RESET_ALL}")
        sock.close()

    # Additional scan for common high ports
    high_ports = [1433, 3306, 3389, 5432, 5900, 8080, 8443]
    for port in high_ports:
        if port > 1024:  # Avoid duplicate scans
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(0.5)
            if sock.connect_ex(("127.0.0.1", port)) == 0:
                service = common_ports.get(port, "Unknown")
                open_ports.append({"port": port, "service": service})
                print(f"{Fore.YELLOW}[+] Found open port: {port} ({service}){Style.RESET_ALL}")
            sock.close()

    return open_ports


# Function: Scan Installed Software with vulnerability check
def scan_installed_software():
    print(f"{Fore.CYAN}[*] Scanning installed software...{Style.RESET_ALL}")
    software_list = []

    # Sample vulnerable software database (this would be more comprehensive in production)
    vulnerable_software = {
        "adobe reader": "Multiple versions have critical vulnerabilities. Update to latest version.",
        "java 8": "Older versions have remote code execution vulnerabilities.",
        "internet explorer": "Legacy browser with security issues. Consider alternative browsers.",
        "flash player": "Deprecated software with known vulnerabilities.",
        "quicktime": "Deprecated software with security vulnerabilities."
    }

    try:
        # Get installed software using WMI
        result = subprocess.run(
            ["wmic", "product", "get", "name,version"],
            capture_output=True, text=True, shell=True
        )

        lines = result.stdout.strip().split('\n')
        if len(lines) > 1:  # Skip header row
            for line in lines[1:]:
                parts = line.strip().split()
                if parts:
                    name = " ".join(parts[:-1]) if len(parts) > 1 else parts[0]
                    version = parts[-1] if len(parts) > 1 else "Unknown"

                    # Skip empty entries
                    if not name:
                        continue

                    # Check for known vulnerabilities
                    vulnerable = False
                    vulnerability_info = None

                    for vuln_keyword, vuln_info in vulnerable_software.items():
                        if vuln_keyword.lower() in name.lower():
                            vulnerable = True
                            vulnerability_info = vuln_info
                            print(f"{Fore.RED}[!] Potentially vulnerable software: {name} {version}{Style.RESET_ALL}")
                            break

                    software_list.append({
                        "name": name,
                        "version": version,
                        "vulnerable": vulnerable,
                        "vulnerability_info": vulnerability_info
                    })

        return software_list
    except Exception as e:
        print(f"{Fore.RED}[!] Error scanning installed software: {str(e)}{Style.RESET_ALL}")
        return []


# Function: Check Windows Firewall Status
def check_firewall_status():
    try:
        result = subprocess.check_output(
            'netsh advfirewall show allprofiles state',
            shell=True).decode()

        status = {
            "Domain Profile": "Unknown",
            "Private Profile": "Unknown",
            "Public Profile": "Unknown"
        }

        for line in result.splitlines():
            for profile in status.keys():
                if profile in line:
                    if "ON" in line:
                        status[profile] = "Enabled"
                    elif "OFF" in line:
                        status[profile] = "Disabled"

        return status
    except:
        return {"error": "Could not retrieve firewall status"}



# Function: Save scan results to local file
def save_scan_results(data, filename=None):
    if not filename:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"security_scan_{timestamp}.json"

    try:
        with open(filename, 'w') as f:
            json.dump(data, f, indent=4)
        print(f"{Fore.GREEN}[✓] Scan results saved to {filename}{Style.RESET_ALL}")
        return True
    except Exception as e:
        print(f"{Fore.RED}[!] Error saving scan results: {str(e)}{Style.RESET_ALL}")
        return False


# Function: Progress callback
def update_progress(progress, scanned, total):
    bar_length = 40
    filled_length = int(bar_length * progress // 100)
    bar = '█' * filled_length + '-' * (bar_length - filled_length)
    sys.stdout.write(f'\r[{bar}] {progress}% ({scanned}/{total} files scanned)')
    sys.stdout.flush()


# Function: Run Full System Scan
def run_full_system_scan():
    print(f"{Fore.GREEN}===== Starting Full System Scan ====={Style.RESET_ALL}")

    # Get list of all drives
    drives = []
    for drive in range(ord('A'), ord('Z') + 1):
        drive_letter = chr(drive) + ':\\'
        if os.path.exists(drive_letter):
            drives.append(drive_letter)

    # Collect all scan results
    scan_results = {
        "system_info": get_system_info(),
        "defender_status": get_defender_status(),
        "firewall_status": check_firewall_status(),
        "open_ports": scan_open_ports(),
        "installed_software": scan_installed_software(),
        "drive_scans": {}
    }

    # Scan each drive
    for drive in drives:
        print(f"\n{Fore.CYAN}[*] Starting scan on drive {drive}{Style.RESET_ALL}")
        try:
            # FIX: Pass update_progress as the callback parameter
            result = scan_files(drive, update_progress)
            scan_results["drive_scans"][drive] = result
        except Exception as e:
            scan_results["drive_scans"][drive] = {"error": str(e)}

    return scan_results


# Function: Run scan on specific directory
def run_directory_scan(directory):
    print(f"{Fore.GREEN}===== Starting Scan on {directory} ====={Style.RESET_ALL}")

    # Verify directory exists
    if not os.path.exists(directory):
        print(f"{Fore.RED}[!] Directory does not exist: {directory}{Style.RESET_ALL}")
        return None

    # Collect all scan results
    scan_results = {
        "directory_scan": scan_files(directory, update_progress)
    }

    return scan_results

# Function: Send Scan Data to Backend
def upload_scan_results(scan_result, scan_type):
    headers = {}

    # Handle Authorization header using internal TOKEN constant
    if TOKEN:
        headers['Authorization'] = TOKEN if TOKEN.startswith("Bearer ") else f"Bearer {TOKEN}"
    else:
        print("WARNING: No auth token provided - authentication will fail!")

    try:
        # Prepare the JSON data directly
        json_data = {
            'scan_type': scan_type,
            'scan_result': scan_result,
        }

        print("Creating JSON data:", json_data)
        # Endpoint
        endpoint = f"{BACKEND_URL.rstrip('/')}/scan/upload"

        # Set content type to application/json
        headers['Content-Type'] = 'application/json'

        # Debug
        print(f"Sending data to: {endpoint}")
        print(f"Headers: {headers}")

        # Send POST request with JSON data
        response = requests.post(
            endpoint,
            headers=headers,
            json=json_data  # Use json parameter to automatically serialize
        )

        # Debug
        print(f"Response status: {response.status_code}")
        print(f"Response body: {response.text}")

        if response.status_code == 401:
            return {
                "success": False,
                "error": "Authentication failed. Your session may have expired. Please login again."
            }

        try:
            result = response.json()
        except json.JSONDecodeError:
            return {
                "success": False,
                "error": f"Server returned non-JSON response: {response.text}"
            }

        if response.status_code in (200, 201):
            return result
        else:
            return {"success": False, "error": result.get("error", f"HTTP Error: {response.status_code}")}

    except requests.RequestException as e:
        return {"success": False, "error": f"Request failed: {str(e)}"}
    except Exception as e:
        return {"success": False, "error": f"Unknown error: {str(e)}"}


# Function: Get quick system health check
def quick_system_health_check():
    print(f"{Fore.GREEN}===== Quick System Health Check ====={Style.RESET_ALL}")

    # FIX: Add try-except block for system info to handle thread error
    try:
        system_info = get_system_info()
    except Exception as e:
        system_info = {
            "hostname": socket.gethostname(),
            "os": os.name,
            "platform": platform.platform(),
            "error": str(e)
        }

    results = {
        "system_info": system_info,
        "defender_status": get_defender_status(),
        "firewall_status": check_firewall_status(),
        "open_ports": scan_open_ports()
    }

    # Check for admin directories
    admin_check = {
        "is_admin": is_admin(),
        "recommendations": []
    }

    if not admin_check["is_admin"]:
        admin_check["recommendations"].append("Run as administrator for complete system scan")

    results["admin_check"] = admin_check

    return results


# Main menu display
def display_menu():
    print(f"\n{Fore.CYAN}╔═══════════════════════════════════════════╗{Style.RESET_ALL}")
    print(f"{Fore.CYAN}║          WINDOWS SECURITY SCANNER         ║{Style.RESET_ALL}")
    print(f"{Fore.CYAN}╚═══════════════════════════════════════════╝{Style.RESET_ALL}")
    print(f"{Fore.WHITE}1. Quick System Health Check{Style.RESET_ALL}")
    print(f"{Fore.WHITE}2. Scan Specific Directory{Style.RESET_ALL}")
    print(f"{Fore.WHITE}3. Full System Scan{Style.RESET_ALL}")
    print(f"{Fore.WHITE}4. Exit{Style.RESET_ALL}")
    return input(f"\n{Fore.GREEN}Select an option (1-4): {Style.RESET_ALL}")


# Main Function
def main():
    # Check for admin privileges
    if not is_admin():
        print(f"{Fore.YELLOW}[!] Warning: Not running as administrator. Some features may be limited.{Style.RESET_ALL}")
        print(f"{Fore.YELLOW}    For a complete scan, run this program as administrator.{Style.RESET_ALL}")

    while True:
        choice = display_menu()

        if choice == '1':
            # Quick System Health Check
            results = quick_system_health_check()
            print(f"\n{Fore.GREEN}[✓] Quick health check completed!{Style.RESET_ALL}")

            # Display system info summary
            sys_info = results["system_info"]
            print(f"\n{Fore.CYAN}=== System Information ==={Style.RESET_ALL}")
            print(f"Hostname: {sys_info['hostname']}")
            print(f"OS: {sys_info.get('os_edition', sys_info.get('os_name', 'Unknown'))}")
            print(f"User: {sys_info.get('username', 'Unknown')}")

            # Display defender status
            defender = results["defender_status"]
            print(f"\n{Fore.CYAN}=== Windows Defender Status ==={Style.RESET_ALL}")
            if "error" in defender:
                print(f"Status: Could not retrieve")
            else:
                for key, value in defender.items():
                    status = f"{Fore.GREEN}Enabled{Style.RESET_ALL}" if value else f"{Fore.RED}Disabled{Style.RESET_ALL}"
                    print(f"{key}: {status}")

            # Display firewall status
            firewall = results["firewall_status"]
            print(f"\n{Fore.CYAN}=== Firewall Status ==={Style.RESET_ALL}")
            if "error" in firewall:
                print(f"Status: Could not retrieve")
            else:
                for profile, status in firewall.items():
                    color = Fore.GREEN if status == "Enabled" else Fore.RED
                    print(f"{profile}: {color}{status}{Style.RESET_ALL}")

            # Display open ports summary
            ports = results["open_ports"]
            print(f"\n{Fore.CYAN}=== Open Ports ==={Style.RESET_ALL}")
            if ports:
                print(f"Found {len(ports)} open ports")
                for port in ports[:5]:  # Show first 5 ports
                    print(f"Port {port['port']} ({port['service']})")
                if len(ports) > 5:
                    print(f"...and {len(ports) - 5} more")
            else:
                print("No common ports are open")

            # Ask to save results
            if input(f"\n{Fore.GREEN}Save results to file? (y/n): {Style.RESET_ALL}").lower() == 'y':
                save_scan_results(results)

        elif choice == '2':
            # Scan Specific Directory
            print(f"\n{Fore.CYAN}=== Available Drives ==={Style.RESET_ALL}")
            for drive in range(ord('A'), ord('Z') + 1):
                drive_letter = chr(drive) + ':\\'
                if os.path.exists(drive_letter):
                    print(f"{drive_letter}")

            directory = input(f"\n{Fore.GREEN}Enter directory to scan (e.g., C:\\Users): {Style.RESET_ALL}")

            if os.path.exists(directory):
                results = run_directory_scan(directory)
                print(f"\n{Fore.GREEN}[✓] Directory scan completed!{Style.RESET_ALL}")

                # Display infection summary
                scan_data = results["directory_scan"]
                infected = scan_data["infected_files"]
                stats = scan_data["stats"]

                print(f"\n{Fore.CYAN}=== Scan Summary ==={Style.RESET_ALL}")
                print(f"Scanned Files: {stats['scanned_files']}")
                print(f"Skipped Files: {stats['skipped_files']}")
                print(f"Scan Duration: {stats['scan_duration_seconds']} seconds")

                if infected:
                    print(f"\n{Fore.RED}=== Infected Files ({len(infected)}) ==={Style.RESET_ALL}")
                    for file in infected:
                        print(f"{Fore.RED}[!] {file['file']} - {file['malware']}{Style.RESET_ALL}")
                else:
                    print(f"\n{Fore.GREEN}No infected files found.{Style.RESET_ALL}")

                # Ask to save results
                if input(f"\n{Fore.GREEN}Save results to file? (y/n): {Style.RESET_ALL}").lower() == 'y':
                    save_scan_results(results)

                # Ask to upload results
                if input(f"\n{Fore.GREEN}Upload results to security server? (y/n): {Style.RESET_ALL}").lower() == 'y':
                    upload_scan_results(results)
            else:
                print(f"{Fore.RED}[!] Invalid directory path.{Style.RESET_ALL}")

        elif choice == '3':
            # Full System Scan
            print(f"{Fore.YELLOW}[!] Warning: Full system scan may take a long time.{Style.RESET_ALL}")
            if input(f"{Fore.GREEN}Continue with full scan? (y/n): {Style.RESET_ALL}").lower() == 'y':
                results = run_full_system_scan()
                print(f"\n{Fore.GREEN}[✓] Full system scan completed!{Style.RESET_ALL}")

                # Gather infection summary across all drives
                total_infected = 0
                total_scanned = 0
                total_skipped = 0

                for drive, scan_data in results["drive_scans"].items():
                    if "error" in scan_data:
                        continue
                    total_infected += len(scan_data["infected_files"])
                    total_scanned += scan_data["stats"]["scanned_files"]
                    total_skipped += scan_data["stats"]["skipped_files"]

                print(f"\n{Fore.CYAN}=== System Scan Summary ==={Style.RESET_ALL}")
                print(f"Total Scanned Files: {total_scanned}")
                print(f"Total Skipped Files: {total_skipped}")

                if total_infected > 0:
                    print(f"\n{Fore.RED}=== Infected Files ({total_infected}) ==={Style.RESET_ALL}")
                    for drive, scan_data in results["drive_scans"].items():
                        if "error" in scan_data:
                            continue
                        for file in scan_data["infected_files"]:
                            print(f"{Fore.RED}[!] {file['file']} - {file['malware']}{Style.RESET_ALL}")
                else:
                    print(f"\n{Fore.GREEN}No infected files found.{Style.RESET_ALL}")

                # Ask to save results
                if input(f"\n{Fore.GREEN}Save results to file? (y/n): {Style.RESET_ALL}").lower() == 'y':
                    save_scan_results(results)

                # Ask to upload results
                if input(f"\n{Fore.GREEN}Upload results to security server? (y/n): {Style.RESET_ALL}").lower() == 'y':
                    upload_scan_results(results)

        elif choice == '4':
            print(f"{Fore.CYAN}Thank you for using Windows Security Scanner. Goodbye!{Style.RESET_ALL}")
            break

        else:
            print(f"{Fore.RED}[!] Invalid option. Please select 1-4.{Style.RESET_ALL}")


if __name__ == "__main__":
    # Show banner
    print(f"""{Fore.CYAN}
╔══════════════════════════════════════════════════════╗
║                                                      ║
║             WINDOWS SECURITY SCANNER                 ║
║                                                      ║
║  A comprehensive security scanning tool for Windows  ║
║                                                      ║
╚══════════════════════════════════════════════════════╝
{Style.RESET_ALL}""")

    main()