import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext, filedialog
import subprocess
import re
import csv
import http.client

# Function to send HTTP request and display response
def send_request(method, path):
    host = entry_target.get().strip()

    if not host:
        messagebox.showwarning("Input Error", "Please enter a target website or IP!")
        return

    try:
        conn = http.client.HTTPConnection(host)
        conn.request(method, path, headers={"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36"
})
        response = conn.getresponse()
        
        print(f"{response=}")

        # Format response headers
        result = f"HTTP/1.1 {response.status} {response.reason}\n"
        for header in response.getheaders():
            result += f"{header[0]}: {header[1]}\n"

        conn.close()
    except Exception as e:
        result = f"Error: {str(e)}"

    # Display response in the text box
    display_response(result)

# Function to run Nmap scan and update table
def run_nmap_scan():
    target = entry_target.get().strip()
    port = entry_port.get().strip()

    if not target:
        messagebox.showwarning("Input Error", "Please enter a target website or IP!")
        return

    if not port.isdigit():
        messagebox.showwarning("Input Error", "Please enter a valid port number!")
        return

    command = ["nmap", "-p", port, "--script", "serverspy.nse", target]

    try:
        result = subprocess.run(command, capture_output=True, text=True, check=True)
        parsed_data = parse_nmap_output(result.stdout)
        update_table(parsed_data)
        display_response(result.stdout)
    except subprocess.CalledProcessError as e:
        messagebox.showerror("Error", f"Failed to run Nmap.\n{e}")
        display_response(str(e))

# Function to parse Nmap output
def parse_nmap_output(output):
    matches = re.findall(r"\|\s+(\d+)\s+([A-Za-z0-9.\- ]+)\s+(\d+)\s+(\d+)", output)
    parsed_data = [(match[0], match[1].strip(), match[2], match[3]) for match in matches]
    return parsed_data if parsed_data else [("No Data", "-", "-", "-")]

# Function to update table with Nmap scan results
def update_table(data):
    table.delete(*table.get_children())
    for item in data:
        table.insert("", "end", values=item)

# Function to export table data to CSV
def export_to_csv():
    if not table.get_children():
        messagebox.showwarning("Export Error", "No scan results to export!")
        return

    file_path = filedialog.asksaveasfilename(defaultextension=".csv",
                                             filetypes=[("CSV files", "*.csv"), ("All Files", "*.*")],
                                             title="Save Scan Results")
    if not file_path:
        return

    with open(file_path, mode="w", newline="") as file:
        writer = csv.writer(file)
        writer.writerow(["Rank", "Server Version", "Score", "Hits"])
        for row_id in table.get_children():
            writer.writerow(table.item(row_id)["values"])

    messagebox.showinfo("Export Successful", f"Scan results saved to {file_path}")

# Function to display response text in the text box
def display_response(response_text):
    response_textbox.config(state=tk.NORMAL)
    response_textbox.delete("1.0", tk.END)
    response_textbox.insert(tk.END, response_text)
    response_textbox.config(state=tk.DISABLED)

# GUI Setup
root = tk.Tk()
root.title("ServerSpy")
root.geometry("700x700")
root.configure(bg="#FFFACD")

# Title Label
tk.Label(root, text="ServerSpy Fingerprinting tool", font=("Arial", 16, "bold"), fg="black", bg="#FFFACD").pack(pady=10)

# Input Frame
input_frame = tk.Frame(root, bg="#FFFACD")
input_frame.pack(pady=5)

# Target Input
tk.Label(input_frame, text="Target URL/IP:", font=("Arial", 10, "bold"), fg="black", bg="#FFFACD").grid(row=0, column=0, padx=5, pady=2)
entry_target = tk.Entry(input_frame, width=30)
entry_target.grid(row=0, column=1, padx=5, pady=2)

# Port Input
tk.Label(input_frame, text="Port:", font=("Arial", 10, "bold"), fg="black", bg="#FFFACD").grid(row=1, column=0, padx=5, pady=2)
entry_port = tk.Entry(input_frame, width=10)
entry_port.grid(row=1, column=1, padx=5, pady=2)
entry_port.insert(0, "80")  # Default port

# Scan Button
scan_button = tk.Button(root, text="Run Scan", command=run_nmap_scan, font=("Arial", 12, "bold"), bg="#E74C3C", fg="black")
scan_button.pack(pady=5)

# HTTP Request Buttons
http_frame = tk.Frame(root, bg="#FFFACD")
http_frame.pack(pady=5)

http_requests = [
    ("GET_EXISITNG", "GET", "/"),
    ("GET_NONEXISTING", "GET", "/404test_.html"),
    ("GET_LONG", "GET", "/" + "a" * 1024),
    ("HEAD_EXISITNG", "HEAD", "/"),
    ("DELETE_EXISITNG", "DELETE", "/"),
    ("OPTIONS_EXISITNG", "OPTIONS", "/"),
    ("TEST_METHOD", "TEST", "/"),
    ("ATTACK REQUEST", "GET", "<attack_request>")
]

for text, method, path in http_requests:
    tk.Button(http_frame, text=text, command=lambda m=method, p=path: send_request(m, p), font=("Arial", 10), bg="#3498DB", fg="white").pack(side=tk.LEFT, padx=5)

# Response Display Panel
response_label = tk.Label(root, text="Response Output:", font=("Arial", 12, "bold"), fg="black", bg="#FFFACD")
response_label.pack()

response_textbox = scrolledtext.ScrolledText(root, height=10, width=80, wrap="word", state=tk.DISABLED, bg="#F8F8F8")
response_textbox.pack()


# Result Table
table_frame = tk.Frame(root, bg="#FFFACD")
table_frame.pack(pady=10)

table_columns = ("Rank", "Server Version", "Score", "Hits")
table = ttk.Treeview(table_frame, columns=table_columns, show="headings", height=10)
for col in table_columns:
    table.heading(col, text=col)
    table.column(col, width=140, anchor="center")

table.pack()

# Export to CSV Button
export_button = tk.Button(root, text="Export to CSV", command=export_to_csv, font=("Arial", 12, "bold"), bg="#2ECC71", fg="black")
export_button.pack(pady=5)

# Run Tkinter event loop
root.mainloop()

