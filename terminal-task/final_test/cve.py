# from genericpath import exists
import re
import nvdlib
import os
import sys
import json

proxy = 'http://172.31.2.3:8080'

os.environ['http_proxy'] = proxy
os.environ['HTTP_PROXY'] = proxy
os.environ['https_proxy'] = proxy
os.environ['HTTPS_PROXY'] = proxy


def cpe(arr):
    for i in arr:
        if (i["noData"] == "true"):
            ans.append(i)
            continue
        r = nvdlib.searchCPE(keywordSearch=i["version"])
        if not r:
            i["noData"] = "true"
            i["reason"] = "no cpe and cve found for version " + i["version"]
            ans.append(i)
        n = 0
        cve_arr = 0
        for cp in reversed(r):
            n = n+1
            if n == 6:
                break
            cve = nvdlib.searchCVE(cpeName=cp.cpeName)
            curr =0
            for cv in reversed(cve):
                if curr==3:
                    break
                c = {"id": cv.id, "sourceIdentifier": cv.sourceIdentifier, "published": cv.published, "lastModified": cv.lastModified, "vulnStatus": cv.vulnStatus,
                     "descriptions": cv.descriptions[0].value, "scoreType": cv.score[0], "score": cv.score[1], "severity": cv.score[2], "url": cv.url,
                     "noData": "false", "service": i["service"]}
                print(json.dumps(c))
                cve_arr = cve_arr+1
                curr = curr + 1
        if cve_arr == 0:
            i["noData"] = "true"
            i["reason"] = "no cve found for version " + i["version"]
            ans.append(i)
    return

#if(len(sys.argv) < 4):
 #   print("please specify IP Address")
 #   exit()

ip_addr = sys.argv[1]

# if not exists('output{}.txt'.format(ip_addr)):
#     print('No such file exists')
#     exit()

with open('output{}.txt'.format(ip_addr), 'r') as file:
    f = file.read().splitlines()

if "No port open" in f[0]:
    c = {"noData": "true", "reason": "No CVE's found as no ports are open"}
    print(json.dumps(c))
    exit()


data = []
ans = []
for i in range(len(f)):
    j = f[i]
    j = re.sub(r'\([^)]*\)', '', j)
    if "PORT" in j:
        continue
    j = j.split(" ")
    j = list(filter(None, j))

    try:
        j[2]
    except:
        continue

    obj = {"noData": "false", "service": j[2]}
    x = ""
    for k in range(3, len(j)):
        s = re.search('[a-zA-Z]', j[k])
        if not s:
            x = j[k]
            break
        if not len(x):
            for k in range(3, len(j)):
                s = re.search('[0-9]', j[k])
            if s:
                x = j[k]
            break
    if not len(x) or len(j) <= 3:
        obj["noData"] = "true"
        obj["reason"] = "No CVE's for " + j[2] + \
            " due to absence of version number"
    else:
        obj["version"] = j[3] + " " + x
    data.append(obj)

try:
    cpe(data)
except Exception as e:
    pass

for i in ans:
    print(json.dumps(i))
