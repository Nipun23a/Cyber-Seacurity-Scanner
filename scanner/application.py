import ctypes
import tkinter as tk
from tkinter import messagebox
import sys

from loginGUI import LoginFrame
from scanner import is_admin
from scannerGUI import SecurityScannerGUI


# Import your classes/functions



class Application:
    def __init__(self, root):
        self.root = root
        self.root.title("Security Scanner")
        self.root.geometry("1000x700")

        # Create login frame first
        self.login_frame = LoginFrame(self.root, on_login_success=self.on_successful_login)
        self.login_frame.pack(fill=tk.BOTH, expand=True)

        # Scanner GUI will be initialized after successful login
        self.scanner_gui = None

    def on_successful_login(self):
        self.login_frame.pack_forget()

        self.scanner_gui = SecurityScannerGUI(self.root)

        # Pass token and authenticated status to scanner GUI
        self.scanner_gui.token = self.login_frame.token
        self.scanner_gui.authenticated = self.login_frame.authenticated

        print(self.scanner_gui.token)
        # If your scanner needs the token, pass it from login
        # You can modify LoginFrame to store the token as an instance variable
        # Example: self.scanner_gui.token = self.login_frame.token


def main():
    root = tk.Tk()
    if not is_admin():
        ctypes.windll.shell32.ShellExecuteW(None, "runas", sys.executable, " ".join(sys.argv), None, 1)
        sys.exit()
    app = Application(root)
    root.mainloop()


if __name__ == "__main__":
    main()
