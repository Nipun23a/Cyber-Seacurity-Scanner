import ctypes
import os
import sys
import json
import threading
import tkinter as tk
from tkinter import ttk, filedialog, messagebox, scrolledtext
from datetime import datetime

# Import custom theme for modern look
import ttkthemes as ttkth

# Import your scanner functionality
# Assuming your existing scan code is in a file called security_scanner.py
# If not, you'll need to move those functions to a separate file
from scanner import (
    get_system_info, get_defender_status, check_firewall_status,
    scan_open_ports, scan_installed_software, scan_files, is_admin,
    run_full_system_scan, save_scan_results, upload_scan_results,
    quick_system_health_check, run_directory_scan, update_progress, test_backend_connection
)

class SecurityScannerGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Windows Security Scanner")
        self.root.geometry("1000x700")
        self.root.minsize(900, 650)
        # Backend Connection settings and authentication
        self.backend_url_var = tk.StringVar(value="http://localhost:5000")
        self.username_var = tk.StringVar()
        self.password_var = tk.StringVar()
        self.authenticated = False

        # Apply modern theme
        self.theme = ttkth.ThemedStyle(self.root)
        self.theme.set_theme("arc")  # Modern flat theme



        
        # Set icon
        try:
            self.root.iconbitmap("shield.ico")  # You'll need to create/download this icon
        except:
            pass  # Icon not found, continue without it
        
        # Colors
        self.bg_color = "#f5f5f5"
        self.accent_color = "#3498db"
        self.danger_color = "#e74c3c"
        self.success_color = "#2ecc71"
        self.warning_color = "#f39c12"
        
        # Configure root background
        self.root.configure(bg=self.bg_color)
        
        # Scan results
        self.scan_results = None
        self.scan_thread = None
        self.scan_type = None
        
        self.create_widgets()
        self.check_admin_status()
        
    def create_widgets(self):
        """Create all GUI elements"""
        # Main frame
        self.main_frame = ttk.Frame(self.root)
        self.main_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Create header
        self.create_header()
        
        # Create tab control
        self.tab_control = ttk.Notebook(self.main_frame)
        self.tab_control.pack(fill=tk.BOTH, expand=True, pady=10)
        
        # Dashboard tab
        self.dashboard_tab = ttk.Frame(self.tab_control)
        self.tab_control.add(self.dashboard_tab, text="Dashboard")
        self.create_dashboard()
        
        # Scan tab
        self.scan_tab = ttk.Frame(self.tab_control)
        self.tab_control.add(self.scan_tab, text="Security Scan")
        self.create_scan_tab()
        
        # Results tab
        self.results_tab = ttk.Frame(self.tab_control)
        self.tab_control.add(self.results_tab, text="Scan Results")
        self.create_results_tab()
        
        # Settings tab
        self.settings_tab = ttk.Frame(self.tab_control)
        self.tab_control.add(self.settings_tab, text="Settings")
        self.create_settings_tab()
        
        # Status bar
        self.status_bar = ttk.Label(self.main_frame, text="Ready", anchor=tk.W)
        self.status_bar.pack(fill=tk.X, pady=(5, 0))
        
    def create_header(self):
        """Create the application header"""
        header_frame = ttk.Frame(self.main_frame)
        header_frame.pack(fill=tk.X, pady=(0, 10))
        
        # Logo/title
        title_label = ttk.Label(
            header_frame, 
            text="Windows Security Scanner", 
            font=("Segoe UI", 18, "bold")
        )
        title_label.pack(side=tk.LEFT, padx=(10, 0))
        
        # Admin badge
        self.admin_badge = ttk.Label(
            header_frame,
            text="ADMIN",
            font=("Segoe UI", 9),
        )
        self.admin_badge.pack(side=tk.LEFT, padx=(15, 0))
        
        # System info label
        self.system_info_label = ttk.Label(
            header_frame,
            text="Loading system info...",
            font=("Segoe UI", 9)
        )
        self.system_info_label.pack(side=tk.RIGHT, padx=(0, 10))
        
        # Update system info in background
        threading.Thread(target=self.update_system_info, daemon=True).start()

    def login(self):
        """Login to backend server"""
        try:
            username = self.username_var.get()
            password = self.password_var.get()
            backend_url = self.backend_url_var.get()

            self.log(f"Attempting to login as {username}")
            self.status_bar.config(text="Logging in...")

            # Try to login
            if login(username, password):
                self.authenticated = True
                self.log("Login successful")
                self.status_bar.config(text="Logged in")
                messagebox.showinfo("Login", "Successfully logged in to the server.")
                # Enable scan upload buttons
                # ... enable UI elements ...
            else:
                self.log("Login failed")
                self.status_bar.config(text="Login failed")
                messagebox.showerror("Login Failed", "Invalid username or password.")
        except Exception as e:
            self.log(f"Login error: {str(e)}")
            messagebox.showerror("Login Error", f"Failed to login: {str(e)}")


        
    def create_dashboard(self):
        """Create dashboard tab content"""
        # Main container with some padding
        dashboard_container = ttk.Frame(self.dashboard_tab, padding=(20, 10))
        dashboard_container.pack(fill=tk.BOTH, expand=True)
        dashboard_container.grid_columnconfigure(0, weight=1)
        dashboard_container.grid_columnconfigure(1, weight=1)
        
        # Welcome message
        welcome_frame = ttk.LabelFrame(dashboard_container, text="System Status")
        welcome_frame.grid(row=0, column=0, columnspan=2, sticky="nsew", padx=5, pady=10)
        
        ttk.Label(
            welcome_frame, 
            text="Welcome to Windows Security Scanner",
            font=("Segoe UI", 12)
        ).pack(anchor=tk.W, padx=10, pady=5)
        
        self.system_status_text = scrolledtext.ScrolledText(
            welcome_frame, height=4, font=("Segoe UI", 10)
        )
        self.system_status_text.pack(fill=tk.BOTH, expand=True, padx=10, pady=5)
        self.system_status_text.insert(tk.END, "Analyzing system status...")
        self.system_status_text.config(state=tk.DISABLED)
        
        # Security tiles
        self.create_security_tiles(dashboard_container)
        
        # Quick actions
        quick_actions = ttk.LabelFrame(dashboard_container, text="Quick Actions")
        quick_actions.grid(row=2, column=0, columnspan=2, sticky="nsew", padx=5, pady=10)
        
        # Quick scan button
        quick_scan_btn = ttk.Button(
            quick_actions, 
            text="Quick System Health Check", 
            command=self.start_quick_scan
        )
        quick_scan_btn.grid(row=0, column=0, padx=10, pady=10, sticky="ew")
        
        # Full scan button
        full_scan_btn = ttk.Button(
            quick_actions, 
            text="Full System Scan", 
            command=self.start_full_scan
        )
        full_scan_btn.grid(row=0, column=1, padx=10, pady=10, sticky="ew")
        
        # Directory scan button
        directory_scan_btn = ttk.Button(
            quick_actions, 
            text="Scan Specific Directory", 
            command=self.browse_and_scan_directory
        )
        directory_scan_btn.grid(row=0, column=2, padx=10, pady=10, sticky="ew")
        
        # Exit button
        exit_btn = ttk.Button(
            quick_actions, 
            text="Exit Application", 
            command=self.root.quit
        )
        exit_btn.grid(row=0, column=3, padx=10, pady=10, sticky="ew")
        
        # Configure the grid columns to expand
        for i in range(4):
            quick_actions.grid_columnconfigure(i, weight=1)
            
        # Update dashboard status in background
        threading.Thread(target=self.update_dashboard_status, daemon=True).start()
        
    def create_security_tiles(self, parent):
        """Create security status tiles"""
        # Frame for the tiles
        tiles_frame = ttk.Frame(parent)
        tiles_frame.grid(row=1, column=0, columnspan=2, sticky="nsew", padx=5, pady=10)
        tiles_frame.grid_columnconfigure(0, weight=1)
        tiles_frame.grid_columnconfigure(1, weight=1)
        tiles_frame.grid_columnconfigure(2, weight=1)
        
        # Defender status tile
        self.defender_tile = ttk.LabelFrame(tiles_frame, text="Windows Defender")
        self.defender_tile.grid(row=0, column=0, padx=5, pady=5, sticky="nsew")
        
        self.defender_status = ttk.Label(
            self.defender_tile, 
            text="Checking...",
            font=("Segoe UI", 10)
        )
        self.defender_status.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Firewall status tile
        self.firewall_tile = ttk.LabelFrame(tiles_frame, text="Windows Firewall")
        self.firewall_tile.grid(row=0, column=1, padx=5, pady=5, sticky="nsew")
        
        self.firewall_status = ttk.Label(
            self.firewall_tile, 
            text="Checking...",
            font=("Segoe UI", 10)
        )
        self.firewall_status.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Open ports tile
        self.ports_tile = ttk.LabelFrame(tiles_frame, text="Open Ports")
        self.ports_tile.grid(row=0, column=2, padx=5, pady=5, sticky="nsew")
        
        self.ports_status = ttk.Label(
            self.ports_tile, 
            text="Checking...",
            font=("Segoe UI", 10)
        )
        self.ports_status.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
    def create_scan_tab(self):
        """Create scan tab content"""
        # Main container
        scan_container = ttk.Frame(self.scan_tab, padding=(20, 10))
        scan_container.pack(fill=tk.BOTH, expand=True)
        
        # Top section - scan options
        scan_options = ttk.LabelFrame(scan_container, text="Scan Options")
        scan_options.pack(fill=tk.X, padx=5, pady=10)
        
        # Scan type selection
        ttk.Label(scan_options, text="Select Scan Type:").grid(row=0, column=0, padx=10, pady=10, sticky=tk.W)
        
        self.scan_type_var = tk.StringVar(value="quick")
        
        quick_radio = ttk.Radiobutton(
            scan_options, 
            text="Quick Health Check", 
            variable=self.scan_type_var, 
            value="quick"
        )
        quick_radio.grid(row=0, column=1, padx=10, pady=10, sticky=tk.W)
        
        dir_radio = ttk.Radiobutton(
            scan_options, 
            text="Directory Scan", 
            variable=self.scan_type_var, 
            value="directory"
        )
        dir_radio.grid(row=0, column=2, padx=10, pady=10, sticky=tk.W)
        
        full_radio = ttk.Radiobutton(
            scan_options, 
            text="Full System Scan", 
            variable=self.scan_type_var, 
            value="full"
        )
        full_radio.grid(row=0, column=3, padx=10, pady=10, sticky=tk.W)
        
        # Directory selection (disabled by default, enabled when directory scan selected)
        ttk.Label(scan_options, text="Target Directory:").grid(row=1, column=0, padx=10, pady=10, sticky=tk.W)
        
        self.directory_var = tk.StringVar()
        self.directory_entry = ttk.Entry(scan_options, textvariable=self.directory_var, width=50)
        self.directory_entry.grid(row=1, column=1, columnspan=2, padx=10, pady=10, sticky=tk.W+tk.E)
        self.directory_entry.config(state=tk.DISABLED)
        
        self.browse_btn = ttk.Button(
            scan_options, 
            text="Browse...", 
            command=self.browse_directory
        )
        self.browse_btn.grid(row=1, column=3, padx=10, pady=10, sticky=tk.W)
        self.browse_btn.config(state=tk.DISABLED)
        
        # Enable/disable directory fields based on scan type
        self.scan_type_var.trace("w", self.update_scan_options)
        
        # Middle section - scan controls
        scan_controls = ttk.Frame(scan_container)
        scan_controls.pack(fill=tk.X, padx=5, pady=10)
        
        self.start_scan_btn = ttk.Button(
            scan_controls, 
            text="Start Scan", 
            command=self.start_scan
        )
        self.start_scan_btn.pack(side=tk.LEFT, padx=5)
        
        self.stop_scan_btn = ttk.Button(
            scan_controls, 
            text="Stop Scan", 
            command=self.stop_scan
        )
        self.stop_scan_btn.pack(side=tk.LEFT, padx=5)
        self.stop_scan_btn.config(state=tk.DISABLED)
        
        # Bottom section - scan progress
        scan_progress_frame = ttk.LabelFrame(scan_container, text="Scan Progress")
        scan_progress_frame.pack(fill=tk.BOTH, expand=True, padx=5, pady=10)
        
        self.progress_var = tk.DoubleVar()
        self.progress_bar = ttk.Progressbar(
            scan_progress_frame, 
            orient=tk.HORIZONTAL, 
            length=100, 
            mode='determinate', 
            variable=self.progress_var
        )
        self.progress_bar.pack(fill=tk.X, padx=10, pady=10)
        
        self.progress_label = ttk.Label(
            scan_progress_frame, 
            text="Ready to scan",
            font=("Segoe UI", 10)
        )
        self.progress_label.pack(padx=10, pady=5)
        
        # Log output
        self.log_text = scrolledtext.ScrolledText(
            scan_progress_frame, 
            height=15, 
            font=("Consolas", 10)
        )
        self.log_text.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
    def create_results_tab(self):
        """Create results tab content"""
        # Main container
        results_container = ttk.Frame(self.results_tab, padding=(20, 10))
        results_container.pack(fill=tk.BOTH, expand=True)
        
        # Top section - summary
        self.summary_frame = ttk.LabelFrame(results_container, text="Scan Summary")
        self.summary_frame.pack(fill=tk.X, padx=5, pady=10)
        
        self.summary_text = scrolledtext.ScrolledText(
            self.summary_frame, 
            height=6, 
            font=("Segoe UI", 10)
        )
        self.summary_text.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        self.summary_text.insert(tk.END, "No scan results available. Run a scan first.")
        self.summary_text.config(state=tk.DISABLED)
        
        # Middle section - detailed results notebook
        self.results_notebook = ttk.Notebook(results_container)
        self.results_notebook.pack(fill=tk.BOTH, expand=True, padx=5, pady=10)
        
        # Tab for infected files
        self.infected_tab = ttk.Frame(self.results_notebook)
        self.results_notebook.add(self.infected_tab, text="Infected Files")
        
        # Create treeview for infected files
        self.infected_tree = ttk.Treeview(
            self.infected_tab,
            columns=("file", "malware", "hash", "size"),
            show="headings"
        )
        self.infected_tree.heading("file", text="File Path")
        self.infected_tree.heading("malware", text="Malware Type")
        self.infected_tree.heading("hash", text="Hash")
        self.infected_tree.heading("size", text="Size (bytes)")
        
        self.infected_tree.column("file", width=300)
        self.infected_tree.column("malware", width=150)
        self.infected_tree.column("hash", width=220)
        self.infected_tree.column("size", width=100)
        
        # Add scrollbar to infected files treeview
        infected_scroll = ttk.Scrollbar(self.infected_tab, orient=tk.VERTICAL, command=self.infected_tree.yview)
        self.infected_tree.configure(yscrollcommand=infected_scroll.set)
        
        infected_scroll.pack(side=tk.RIGHT, fill=tk.Y)
        self.infected_tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        
        # Tab for system info
        self.sysinfo_tab = ttk.Frame(self.results_notebook)
        self.results_notebook.add(self.sysinfo_tab, text="System Information")
        
        self.sysinfo_text = scrolledtext.ScrolledText(
            self.sysinfo_tab,
            font=("Consolas", 10)
        )
        self.sysinfo_text.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Tab for open ports
        self.ports_tab = ttk.Frame(self.results_notebook)
        self.results_notebook.add(self.ports_tab, text="Open Ports")
        
        # Create treeview for ports
        self.ports_tree = ttk.Treeview(
            self.ports_tab,
            columns=("port", "service"),
            show="headings"
        )
        self.ports_tree.heading("port", text="Port Number")
        self.ports_tree.heading("service", text="Service")
        
        self.ports_tree.column("port", width=100)
        self.ports_tree.column("service", width=200)
        
        # Add scrollbar to ports treeview
        ports_scroll = ttk.Scrollbar(self.ports_tab, orient=tk.VERTICAL, command=self.ports_tree.yview)
        self.ports_tree.configure(yscrollcommand=ports_scroll.set)
        
        ports_scroll.pack(side=tk.RIGHT, fill=tk.Y)
        self.ports_tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        
        # Tab for installed software
        self.software_tab = ttk.Frame(self.results_notebook)
        self.results_notebook.add(self.software_tab, text="Installed Software")
        
        # Create treeview for software
        self.software_tree = ttk.Treeview(
            self.software_tab,
            columns=("name", "version", "vulnerable", "info"),
            show="headings"
        )
        self.software_tree.heading("name", text="Software Name")
        self.software_tree.heading("version", text="Version")
        self.software_tree.heading("vulnerable", text="Vulnerable")
        self.software_tree.heading("info", text="Vulnerability Info")
        
        self.software_tree.column("name", width=250)
        self.software_tree.column("version", width=100)
        self.software_tree.column("vulnerable", width=100)
        self.software_tree.column("info", width=300)
        
        # Add scrollbar to software treeview
        software_scroll = ttk.Scrollbar(self.software_tab, orient=tk.VERTICAL, command=self.software_tree.yview)
        self.software_tree.configure(yscrollcommand=software_scroll.set)
        
        software_scroll.pack(side=tk.RIGHT, fill=tk.Y)
        self.software_tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        
        # Bottom section - action buttons
        action_frame = ttk.Frame(results_container)
        action_frame.pack(fill=tk.X, padx=5, pady=10)
        
        self.save_results_btn = ttk.Button(
            action_frame, 
            text="Save Results", 
            command=self.save_results
        )
        self.save_results_btn.pack(side=tk.LEFT, padx=5)
        
        self.upload_results_btn = ttk.Button(
            action_frame, 
            text="Upload to Server", 
            command=self.upload_results
        )
        self.upload_results_btn.pack(side=tk.LEFT, padx=5)
        
        # Disable buttons initially
        self.save_results_btn.config(state=tk.DISABLED)
        self.upload_results_btn.config(state=tk.DISABLED)
        
    def create_settings_tab(self):
        """Create settings tab content"""
        # Main container
        settings_container = ttk.Frame(self.settings_tab, padding=(20, 10))
        settings_container.pack(fill=tk.BOTH, expand=True)
        
        # Backend settings section
        backend_frame = ttk.LabelFrame(settings_container, text="Backend Configuration")
        backend_frame.pack(fill=tk.X, padx=5, pady=10)
        
        ttk.Label(backend_frame, text="Backend URL:").grid(row=0, column=0, padx=10, pady=10, sticky=tk.W)
        
        self.backend_url_var = tk.StringVar(value="http://127.0.0.1:5000")
        backend_entry = ttk.Entry(backend_frame, textvariable=self.backend_url_var, width=50)
        backend_entry.grid(row=0, column=1, padx=10, pady=10, sticky=tk.W+tk.E)
        
        ttk.Button(
            backend_frame, 
            text="Test Connection", 
            command=self.test_backend_connection
        ).grid(row=0, column=2, padx=10, pady=10)
        
        # Scan settings section
        scan_settings_frame = ttk.LabelFrame(settings_container, text="Scan Settings")
        scan_settings_frame.pack(fill=tk.X, padx=5, pady=10)
        
        # Auto save results checkbox
        self.auto_save_var = tk.BooleanVar(value=True)
        auto_save_check = ttk.Checkbutton(
            scan_settings_frame, 
            text="Automatically save scan results", 
            variable=self.auto_save_var
        )
        auto_save_check.grid(row=0, column=0, columnspan=2, padx=10, pady=5, sticky=tk.W)
        
        # Default save location
        ttk.Label(scan_settings_frame, text="Default save location:").grid(row=1, column=0, padx=10, pady=5, sticky=tk.W)
        
        self.save_location_var = tk.StringVar(value=os.path.join(os.path.expanduser("~"), "Documents"))
        save_location_entry = ttk.Entry(scan_settings_frame, textvariable=self.save_location_var, width=50)
        save_location_entry.grid(row=1, column=1, padx=10, pady=5, sticky=tk.W+tk.E)
        
        ttk.Button(
            scan_settings_frame, 
            text="Browse...", 
            command=self.browse_save_location
        ).grid(row=1, column=2, padx=10, pady=5)
        
        # Auto upload results checkbox
        self.auto_upload_var = tk.BooleanVar(value=False)
        auto_upload_check = ttk.Checkbutton(
            scan_settings_frame, 
            text="Automatically upload scan results", 
            variable=self.auto_upload_var
        )
        auto_upload_check.grid(row=2, column=0, columnspan=2, padx=10, pady=5, sticky=tk.W)
        
        # Apply settings button
        ttk.Button(
            settings_container,
            text="Apply Settings",
            command=self.apply_settings
        ).pack(pady=10)
        
        # About section
        about_frame = ttk.LabelFrame(settings_container, text="About")
        about_frame.pack(fill=tk.BOTH, expand=True, padx=5, pady=10)
        
        about_text = scrolledtext.ScrolledText(about_frame, height=8, font=("Segoe UI", 10))
        about_text.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        about_text.insert(tk.END, "Windows Security Scanner\n\n")
        about_text.insert(tk.END, "A comprehensive security scanning tool for Windows systems.\n\n")
        about_text.insert(tk.END, "Features:\n")
        about_text.insert(tk.END, "• System health checks\n")
        about_text.insert(tk.END, "• Malware scanning\n")
        about_text.insert(tk.END, "• Port scanning\n")
        about_text.insert(tk.END, "• Installed software vulnerability analysis\n")
        about_text.config(state=tk.DISABLED)
        
    def check_admin_status(self):
        """Check admin status and update badge"""
        admin_status = is_admin()
        
        if admin_status:
            self.admin_badge.configure(text="ADMIN", foreground="green")
        else:
            self.admin_badge.configure(text="NON-ADMIN", foreground="red")
            
            # Show warning
            messagebox.showwarning(
                "Limited Permissions", 
                "Windows Security Scanner is running without administrator privileges.\n\n"
                "Some features may be limited or unavailable. For complete scanning capabilities, "
                "please restart the application with administrator rights."
            )

    def _update_system_info_ui(self, hostname, os_name):
        """Update the UI with system info (called from main thread)"""
        self.system_info_label.config(text=f"Hostname: {hostname} | OS: {os_name}")

    def update_system_info(self):
        """Update system info in background thread"""
        try:
            system_info = get_system_info()
            hostname = system_info.get("hostname", "Unknown")
            os_name = system_info.get("os_edition", system_info.get("os_name", "Unknown"))

            # Use a queue or event to signal the main thread
            self.queue.put((hostname, os_name))
            # Or directly schedule the update using after
            self.root.after(0, lambda: self._update_system_info_ui(hostname, os_name))
        except Exception as e:
            print(f"Error getting system info: {e}")
            
    def update_dashboard_status(self):
        """Update dashboard security status"""
        try:
            # Get security status information
            defender_status = get_defender_status()
            firewall_status = check_firewall_status()
            open_ports = scan_open_ports()
            
            # Update system status text
            is_admin_status = is_admin()
            status_text = f"System scan performed on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
            status_text += f"Running as administrator: {'Yes' if is_admin_status else 'No'}\n"
            
            if not is_admin_status:
                status_text += "WARNING: Limited scanning capabilities in non-administrator mode.\n"
                
            # Update UI components in main thread
            self.root.after(0, lambda: self.update_security_status(
                defender_status, firewall_status, open_ports, status_text
            ))
        except Exception as e:
            print(f"Error updating dashboard: {e}")
            
    def update_security_status(self, defender_status, firewall_status, open_ports, status_text):
        """Update security status UI elements"""
        # Update system status text
        self.system_status_text.config(state=tk.NORMAL)
        self.system_status_text.delete(1.0, tk.END)
        self.system_status_text.insert(tk.END, status_text)
        self.system_status_text.config(state=tk.DISABLED)
        
        # Update Windows Defender status
        defender_text = ""
        if "error" in defender_status:
            defender_text = "Unable to retrieve status"
        else:
            for key, value in defender_status.items():
                status = "Enabled" if value else "Disabled"
                color = "green" if value else "red"
                defender_text += f"{key}: {status}\n"
                
        self.defender_status.config(text=defender_text)
        
        # Update Firewall status
        firewall_text = ""
        if "error" in firewall_status:
            firewall_text = "Unable to retrieve status"
        else:
            for profile, status in firewall_status.items():
                color = "green" if status == "Enabled" else "red"
                firewall_text += f"{profile}: {status}\n"
                
        self.firewall_status.config(text=firewall_text)
        
        # Update open ports status
        if open_ports:
            ports_text = f"Found {len(open_ports)} open ports\n"
            for port in open_ports[:5]:  # Show first 5 ports
                ports_text += f"Port {port['port']} ({port['service']})\n"
            if len(open_ports) > 5:
                ports_text += f"...and {len(open_ports) - 5} more"
        else:
            ports_text = "No common ports are open"
            
        self.ports_status.config(text=ports_text)
        
    def update_scan_options(self, *args):
        """Update scan options based on scan type"""
        scan_type = self.scan_type_var.get()
        
        if scan_type == "directory":
            self.directory_entry.config(state=tk.NORMAL)
            self.browse_btn.config(state=tk.NORMAL)
        else:
            self.directory_entry.config(state=tk.DISABLED)
            self.browse_btn.config(state=tk.DISABLED)
            
    def browse_directory(self):
        """Browse for directory to scan"""
        directory = filedialog.askdirectory()
        if directory:
            self.directory_var.set(directory)
            
    def browse_save_location(self):
        """Browse for directory and immediately start scanning it"""
        directory = filedialog.askdirectory()
        if directory:
            self.save_location_var.set(directory)
            
    def browse_and_scan_directory(self):
        """Browse for directory and immediately start scanning it"""
        directory = filedialog.askdirectory()
        if directory:
            self.directory_var.set(directory)
            self.scan_type_var.set("directory")
            self.start_scan()
        
    def start_quick_scan(self):
        """Start quick system health check"""
        self.scan_type_var.set("quick")
        self.start_scan()
        
    def start_full_scan(self):
        """Start full system scan"""
        self.scan_type_var.set("full")
        self.start_scan()
        
    def start_scan(self):
        """Start the selected scan type"""
        scan_type = self.scan_type_var.get()
        
        # Validate directory if directory scan
        if scan_type == "directory" and not os.path.isdir(self.directory_var.get()):
            messagebox.showerror("Invalid Directory", "Please select a valid directory to scan.")
            return
        
        # Update UI elements
        self.log_text.delete(1.0, tk.END)
        self.progress_var.set(0)
        self.progress_label.config(text="Starting scan...")
        self.start_scan_btn.config(state=tk.DISABLED)
        self.stop_scan_btn.config(state=tk.NORMAL)
        
        # Update status bar
        self.status_bar.config(text="Scanning in progress...")
        
        # Switch to scan tab if not already there
        self.tab_control.select(self.scan_tab)
        
        # Store scan type for later reference
        self.scan_type = scan_type
        
        # Start scan in a separate thread
        self.scan_thread = threading.Thread(target=self.run_scan, daemon=True)
        self.scan_thread.start()
        
    def run_scan(self):
        """Run the actual scan in a background thread"""
        try:
            scan_type = self.scan_type
            
            self.log("Starting security scan. Please wait...")
            
            if scan_type == "quick":
                self.log("Performing quick system health check...")
                self.scan_results = quick_system_health_check(
                )
                
            elif scan_type == "directory":
                directory = self.directory_var.get()
                self.log(f"Scanning directory: {directory}")
                self.scan_results = run_directory_scan(
                    directory
                )
                
            elif scan_type == "full":
                self.log("Performing full system scan. This may take a while...")
                self.scan_results = run_full_system_scan()
                
            # Update UI with results
            self.root.after(0, self.display_scan_results)
            
            # Auto-save if configured
            if self.auto_save_var.get():
                save_path = os.path.join(
                    self.save_location_var.get(),
                    f"scan_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
                )
                self.save_scan_results_to_file(save_path)
                
            # Auto-upload if configured
            if self.auto_upload_var.get():
                self.upload_scan_results_to_server()
                
        except Exception as e:
            self.log(f"Error during scan: {str(e)}")
            
        finally:
            # Re-enable UI elements
            self.root.after(0, self.scan_completed)
            
    def update_scan_progress(self, progress, status_message):
        """Update scan progress from scan thread"""
        self.root.after(0, lambda: self.progress_var.set(progress))
        self.root.after(0, lambda: self.progress_label.config(text=status_message))
        self.log(status_message)
        
    def log(self, message):
        """Add a message to the log text"""
        # Ensure UI updates happen in the main thread
        self.root.after(0, lambda: self._append_to_log(message))
        
    def _append_to_log(self, message):
        """Append message to log (called in main thread)"""
        timestamp = datetime.now().strftime('%H:%M:%S')
        self.log_text.insert(tk.END, f"[{timestamp}] {message}\n")
        self.log_text.see(tk.END)  # Scroll to the end
        
    def scan_completed(self):
        """Update UI after scan is completed"""
        self.start_scan_btn.config(state=tk.NORMAL)
        self.stop_scan_btn.config(state=tk.DISABLED)
        self.progress_label.config(text="Scan completed")
        
        if self.scan_results:
            self.save_results_btn.config(state=tk.NORMAL)
            self.upload_results_btn.config(state=tk.NORMAL)
            
        self.status_bar.config(text="Ready")
        
    def stop_scan(self):
        """Stop the current scan"""
        # Implementation depends on how scanner functions are implemented
        # For this example, we'll just disable the button and update the status
        self.stop_scan_btn.config(state=tk.DISABLED)
        self.log("Attempting to stop scan...")
        self.status_bar.config(text="Stopping scan...")
        
    def display_scan_results(self):
        """Display scan results in the results tab"""
        if not self.scan_results:
            return
            
        # Switch to results tab
        self.tab_control.select(self.results_tab)
        
        # Clear previous results
        self.infected_tree.delete(*self.infected_tree.get_children())
        self.ports_tree.delete(*self.ports_tree.get_children())
        self.software_tree.delete(*self.software_tree.get_children())
        
        self.sysinfo_text.config(state=tk.NORMAL)
        self.sysinfo_text.delete(1.0, tk.END)
        
        self.summary_text.config(state=tk.NORMAL)
        self.summary_text.delete(1.0, tk.END)
        
        # Update summary
        scan_time = self.scan_results.get("scan_time", "Unknown")
        scan_type = self.scan_results.get("scan_type", "Unknown")
        total_scanned = self.scan_results.get("total_files_scanned", 0)
        threats_found = len(self.scan_results.get("infected_files", []))
        
        summary = f"Scan Type: {scan_type}\n"
        summary += f"Scan Time: {scan_time}\n"
        summary += f"Files Scanned: {total_scanned}\n"
        summary += f"Threats Found: {threats_found}\n"
        
        if threats_found > 0:
            summary += f"\nWARNING: Malware detected! See the Infected Files tab for details."
        else:
            summary += f"\nNo threats detected."
            
        self.summary_text.insert(tk.END, summary)
        self.summary_text.config(state=tk.DISABLED)
        
        # Update system info tab
        system_info = self.scan_results.get("system_info", {})
        if system_info:
            self.sysinfo_text.insert(tk.END, json.dumps(system_info, indent=4))
            
        self.sysinfo_text.config(state=tk.DISABLED)
        
        # Update infected files tab
        infected_files = self.scan_results.get("infected_files", [])
        for file_info in infected_files:
            self.infected_tree.insert("", "end", values=(
                file_info.get("file_path", "Unknown"),
                file_info.get("malware_type", "Unknown"),
                file_info.get("file_hash", "Unknown"),
                file_info.get("file_size", "Unknown")
            ))
            
        # Update open ports tab
        open_ports = self.scan_results.get("open_ports", [])
        for port_info in open_ports:
            self.ports_tree.insert("", "end", values=(
                port_info.get("port", "Unknown"),
                port_info.get("service", "Unknown")
            ))
            
        # Update installed software tab
        software = self.scan_results.get("installed_software", [])
        for sw_info in software:
            self.software_tree.insert("", "end", values=(
                sw_info.get("name", "Unknown"),
                sw_info.get("version", "Unknown"),
                "Yes" if sw_info.get("vulnerable", False) else "No",
                sw_info.get("vulnerability_info", "")
            ))
        
    def save_results(self):
        """Save scan results to file"""
        if not self.scan_results:
            messagebox.showwarning("No Results", "No scan results available to save.")
            return
            
        # Ask for save location
        default_filename = f"scan_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        default_path = os.path.join(self.save_location_var.get(), default_filename)
        
        save_path = filedialog.asksaveasfilename(
            initialdir=self.save_location_var.get(),
            initialfile=default_filename,
            defaultextension=".json",
            filetypes=[("JSON files", "*.json"), ("All files", "*.*")]
        )
        
        if save_path:
            self.save_scan_results_to_file(save_path)
            
    def save_scan_results_to_file(self, save_path):
        """Save scan results to specified file path"""
        try:
            save_scan_results(self.scan_results, save_path)
            self.log(f"Scan results saved to: {save_path}")
            self.status_bar.config(text=f"Results saved to: {os.path.basename(save_path)}")
        except Exception as e:
            self.log(f"Error saving results: {str(e)}")
            messagebox.showerror("Save Error", f"Failed to save results: {str(e)}")
            
    def upload_results(self):
        """Upload scan results to server"""
        if not self.scan_results:
            messagebox.showwarning("No Results", "No scan results available to upload.")
            return
            
        self.upload_scan_results_to_server()

    def upload_scan_results_to_server(self):
        """Upload scan results to configured server"""
        try:
            if not self.authenticated:
                messagebox.showwarning("Authentication Required", "Please login first.")
                return

            if not self.scan_results:
                messagebox.showwarning("No Data", "No scan results to upload.")
                return

            backend_url = self.backend_url_var.get()
            self.log(f"Uploading results to server: {backend_url}")
            self.status_bar.config(text="Uploading results...")

            # Format the scan data
            scan_data = {
                "scan_type": self.scan_type,  # 'full_health', 'full_scan', or 'custom_scan'
                "results": self.scan_results,
                "scanned_files": self.scanned_files if hasattr(self, 'scanned_files') else []
            }

            response = upload_scan_results(scan_data, backend_url)

            if response.get("success"):
                self.log("Results uploaded successfully.")
                self.status_bar.config(text="Results uploaded successfully.")
                messagebox.showinfo("Upload Complete", "Scan results uploaded successfully.")
            else:
                error_msg = response.get("error", "Unknown error")
                self.log(f"Upload failed: {error_msg}")
                messagebox.showerror("Upload Failed", f"Failed to upload results: {error_msg}")
        except Exception as e:
            self.log(f"Error uploading results: {str(e)}")
            messagebox.showerror("Upload Error", f"Failed to upload results: {str(e)}")

    def test_backend_connection(self):
        """Test connection to backend server"""
        try:
            backend_url = self.backend_url_var.get()
            self.status_bar.config(text=f"Testing connection to {backend_url}...")

            if test_backend_connection(backend_url):
                self.log(f"Connection to {backend_url} successful")
                self.status_bar.config(text="Connection test successful.")
                messagebox.showinfo("Connection Test", "Successfully connected to the backend server.")
            else:
                self.log(f"Connection to {backend_url} failed")
                self.status_bar.config(text="Connection test failed.")
                messagebox.showerror("Connection Failed", "Could not connect to the backend server.")
        except Exception as e:
            self.log(f"Connection test error: {str(e)}")
            messagebox.showerror("Connection Failed", f"Failed to connect: {str(e)}")
            
    def apply_settings(self):
        """Apply the current settings"""
        # Save settings (in a real app, would save to config file)
        messagebox.showinfo("Settings Applied", "Settings have been applied successfully.")

# Main execution
if __name__ == "__main__":
    if not is_admin():
        ctypes.windll.shell32.ShellExecuteW(None, "runas", sys.executable, " ".join(sys.argv), None, 1)
        sys.exit()
    root = tk.Tk()
    app = SecurityScannerGUI(root)
    root.mainloop()