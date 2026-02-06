# class Weather:
#     pass

from libsast import Scanner
from bs4 import BeautifulSoup
import os

options = {
            'match_rules': os.path.join(os.path.dirname(__file__), "../vulunerabilities/patterns"),
            'match_extensions': {".java"},
            'ignore_filenames': {".DS_Store"},
            'ignore_extensions': {".apk", ".zip", ".ipa"},
            "ignore_paths": {"__MACOSX", "fixtures", "spec", ".git", ".svn"}
        }

paths = [r"/home/mallik/Desktop/Mallik/Mini_Project/apks/test"]
# paths = [r"/home/iot-lab/Desktop/Mallik/com.imangi.templerun_v1.23.5-66_Android-4.4"]

scanner = Scanner(options, paths)

results = scanner.scan()

with open(os.path.join(os.path.dirname(__file__), '../cwe_database/cwec_v4.13.xml'), 'r') as f:
    data = f.read()
data = BeautifulSoup(data, "xml")

# cwe = data.find('Weakness', {'ID':"1004"})
# cve = data.find('Observed_Examples').find_all('Observed_Example')

# cves = []
# for i in cve:
#     # print(i.find('Reference').get_text(strip=True))
#     cves.append(i.find('Reference').get_text(strip=True))


for i in results['pattern_matcher']:
    print(i)
    print(results['pattern_matcher'][i]['metadata']['cwe'].split("CWE-"))

    cwe = data.find('Weakness', {'ID':results['pattern_matcher'][i]['metadata']['cwe'].split("CWE-")[1].split()[0].replace(":", "")})
    cve = cwe.find('Observed_Examples').find_all('Observed_Example')

    if cve != "None":
        cves = []
        for j in cve:
            # print(i.find('Reference').get_text(strip=True))
            cves.append(j.find('Reference').get_text(strip=True))

        results['pattern_matcher'][i]['metadata']['cves'] = cves

print(results)