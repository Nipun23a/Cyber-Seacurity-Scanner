import tkinter as tk
from tkinter import messagebox, ttk
import requests
import json
from colorama import Fore, Style

from scanner import login

BACKEND_URL = "http://localhost:5000"


class LoginFrame(tk.Frame):
    """Login frame for scanner application"""

    def __init__(self, master, on_login_success=None):
        super().__init__(master)
        self.master = master
        self.on_login_success = on_login_success
        self.token = None
        self.authenticated = False
        self.create_widgets()

    def create_widgets(self):
        # Email field
        tk.Label(self, text="Email:").grid(row=1, column=0, padx=5, pady=5, sticky="w")
        self.email_var = tk.StringVar()
        tk.Entry(self, textvariable=self.email_var, width=30).grid(row=1, column=1, padx=5, pady=5)

        # Password field
        tk.Label(self, text="Password:").grid(row=2, column=0, padx=5, pady=5, sticky="w")
        self.password_var = tk.StringVar()
        tk.Entry(self, textvariable=self.password_var, show="*", width=30).grid(row=2, column=1, padx=5, pady=5)

        # Login button
        self.login_btn = tk.Button(self, text="Login", command=self.attempt_login)
        self.login_btn.grid(row=3, column=0, columnspan=2, pady=10)

        # Status label
        self.status_var = tk.StringVar(value="Please login to continue")
        tk.Label(self, textvariable=self.status_var).grid(row=4, column=0, columnspan=2)

    def attempt_login(self):
        email = self.email_var.get()
        password = self.password_var.get()

        if not email or not password:
            self.status_var.set("Email and password required")
            messagebox.showerror("Login Error", "Please enter both email and password")
            return

        self.status_var.set("Attempting to login...")
        self.login_btn.config(state="disabled")
        self.update()

        success, result = login(email, password, BACKEND_URL)

        if success:
            self.token = result  # JWT token
            self.authenticated = True
            self.status_var.set("Login successful")
            messagebox.showinfo("Login Successful", "You are now logged in.")
            if self.on_login_success:
                self.on_login_success()
        else:
            self.status_var.set(f"Login failed: {result}")
            messagebox.showerror("Login Failed", f"Could not login: {result}")
            self.login_btn.config(state="normal")
