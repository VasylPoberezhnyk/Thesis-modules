
import socket
import requests
import json
from word_list import WORDLIST

def scan_ports(host, ports):
    results = []
    for port in ports:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1)
        try:
            sock.connect((host, port))
            results.append({"port": port, "status": "open"})
        except:
            results.append({"port": port, "status": "closed"})
        finally:
            sock.close()
    return results

def scan_urls(base_url, paths):
    results = []
    for path in paths:
        url = f"{base_url}/{path}"
        try:
            response = requests.get(url, timeout=2)
            results.append({
                "url": url,
                "status_code": response.status_code,
                "found": response.status_code == 200
            })
        except:
            results.append({"url": url, "status_code": None, "found": False})
    return results

def generate_log(host, ports, base_url, paths):
    log = {
        "host": host,
        "port_scan": scan_ports(host, ports),
        "url_scan": scan_urls(base_url, paths)
    }
    with open("scan_log.json", "w") as f:
        json.dump(log, f, indent=4)
    print("Лог збережено у scan_log.json")

host = "Цільовий хост або IP-адреса"
ports = [22, 80, 443, 3306, 3005]


base_url = "Цільовий базовий URL (наприклад, http://example.com)"

paths = WORDLIST

generate_log(host, ports, base_url, paths)
