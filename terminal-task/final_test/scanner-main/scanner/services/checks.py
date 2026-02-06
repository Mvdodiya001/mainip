import os
from bs4 import BeautifulSoup
import json
from libsast import Scanner

class Checks:
    def isValid(self, path):
        # dirs = os.listdir(path)
        # if dirs == ['resources', 'sources']:
        #     return True
        # else:
        #     return False
        return True
        
    # def scan(self, path):
    #     i = 0
    #     with open(os.path.join(os.path.dirname(__file__), "../weaknesses/warning.yml"), 'r') as file:
    #         info = yaml.safe_load(file)
    #     print(info)
    #     patterns = []
    #     for ii in info:
    #         print(ii)
    #         patterns.append(re.compile(ii['pattern']))
    #     # print(patterns)
    #     for root, dirs, files in os.walk(path):
    #         for file in files:
    #             if(file == "zzant.java"):
    #                 print(file)
    #             fileextenstion = os.path.splitext(file)[1]
    #             if fileextenstion == ".java":
    #                 self.scanfile(info, patterns, root + '/' + file)
    #                 # print(root,file)
    #                 i = i+1
    #     print(i)

    # def scanfile(self, info, patterns, file):
    #     for i, line in enumerate(open(file, encoding="utf8")):
    #         if("zzant.java" in file and i == 22):
    #             print(line)
    #             for k in re.finditer(r"new ObjectInputStream(...)", line):
    #                 print("Hello",k.group())
    #         for j in range (len(patterns)):
    #             for match in re.finditer(patterns[j], line):
    #                 print('Found on line %s: %s' % (i+1, match.group()))

    def scan(self, path, output):
        # with open(os.path.join(os.path.dirname(__file__), "../weaknesses/warning.yml"), 'r') as file:
        #     warnings = yaml.safe_load(file)
        # with open(os.path.join(os.path.dirname(__file__), "../weaknesses/info.yml"), 'r') as file:
        #     infos = yaml.safe_load(file)
        # with open(os.path.join(os.path.dirname(__file__), "../weaknesses/error.yml"), 'r') as file:
        #     errors = yaml.safe_load(file)
        # for warning in warnings:
        #     warning["pattern"] = re.compile(warning["pattern"])
        # for error in errors:
        #     error["pattern"] = re.compile(error["pattern"])
        # for info in infos:
        #     info["pattern"] = re.compile(info["pattern"])
        
        # for root, dirs, files in os.walk(path):
        #     for file in files:
        #         fileextenstion = os.path.splitext(file)[1]
        #         if fileextenstion == ".java":
        #             self.scanfile(warnings, infos, errors, root + '/' + file)




        options = {
            'match_rules': os.path.join(os.path.dirname(__file__), "../rules/patterns"),
            'sgrep_rules': os.path.join(os.path.dirname(__file__), "../rules/semgrep"),
            'sgrep_extensions': {".java"},
            'match_extensions': {".kt"},
            'ignore_filenames': {".DS_Store"},
            'ignore_extensions': {".apk", ".zip", ".ipa"},
            "ignore_paths": {"__MACOSX", "fixtures", "spec", ".git", ".svn"}
        }
        scanner = Scanner(options, [path])
        results = self.addcves(scanner.scan())

        options = {
            'match_rules': os.path.join(os.path.dirname(__file__), "../vulunerabilities/patterns"),
            'match_extensions': {".java"},
            'ignore_filenames': {".DS_Store"},
            'ignore_extensions': {".apk", ".zip", ".ipa"},
            "ignore_paths": {"__MACOSX", "fixtures", "spec", ".git", ".svn"}
        }
        scanner = Scanner(options, [path])
        results1 = self.addcves(scanner.scan())

        if output:
            with open(output, 'w') as f:
                json.dump(results, f, indent = 2)
                f.write("\n-------------------RESULTS-------------------\n")
                json.dump(results1, f, indent = 2)
        else:
            print(json.dumps(results))
            print("-------------------RESULTS-------------------")
            print(json.dumps(results1))
    

        
    def addcves(self, results):
        with open(os.path.join(os.path.dirname(__file__), '../cwe_database/cwec_v4.13.xml'), 'r') as f:
            data = f.read()
        data = BeautifulSoup(data, "xml")

        for i in results['pattern_matcher']:
            cwe = data.find('Weakness', {'ID':results['pattern_matcher'][i]['metadata']['cwe'].split("CWE-")[1].split()[0].replace(":", "")})
            if cwe is None:
                results['pattern_matcher'][i]['metadata']['cves'] = []
                continue
            cve = cwe.find('Observed_Examples')
            if cve is None:
                results['pattern_matcher'][i]['metadata']['cves'] = []
                continue
            cve = cve.find_all('Observed_Example')

            cves = []

            if cve!="None":
                for j in cve:
                    cves.append(j.find('Reference').get_text(strip=True))
            
            if cves:
                results['pattern_matcher'][i]['metadata']['cves'] = cves
        
        if "semantic_grep" in results.keys():
            for i in results["semantic_grep"]["matches"]:
                cwe = data.find('Weakness', {'ID':results["semantic_grep"]["matches"][i]['metadata']['cwe'].split("CWE-")[1].split()[0].replace(":", "")})
                if cwe is None:
                    results["semantic_grep"]["matches"][i]['metadata']['cves'] = []
                    continue
                cve = cwe.find('Observed_Examples')
                if cve is None:
                    results["semantic_grep"]["matches"][i]['metadata']['cves'] = []
                    continue
                cve = cve.find_all('Observed_Example')

                cves = []

                if cve!="None":
                    for j in cve:
                        cves.append(j.find('Reference').get_text(strip=True))
                
                if cves:
                    results["semantic_grep"]["matches"][i]['metadata']['cves'] = cves

        return results




            
        # if output:
        #     results = {
        #         'match_rules': os.path.join(os.path.dirname(__file__), "../vulunerabilities/patterns"),
        #         'match_extensions': {".java"}
        #     }
        #     with open(output, 'w') as f:
        #         f.write("Hello\n")
        #         f.write("Hello 1\n")
        #         f.write(json.dumps(str(results), indent=4))
        #         print(type(results))
        #         print(os.getcwd())
    
    # def scanfile(self, warnings, infos, errors, file):
    #     for i, line in enumerate(open(file, encoding="utf8")):
    #         for warning in warnings:
    #             for match in re.finditer(warning["pattern"], line):
    #                 obj = {
    #                     "id":warning["id"],
    #                     "description": warning["message"],
    #                     "match_line": "Found on line " + str(i+1) + " , " + str(match.group()),
    #                     "severity": warning["severity"],
    #                     "cwe": warning["cwe"]
    #                 }
    #                 print(obj)
            
    #         for error in errors:
    #             # if("SafeDKWebAppInterface.java" in file and i == 147):
    #             #     print(line, error["pattern"])
    #             for match in re.finditer(error["pattern"], line):
    #                 obj = {
    #                     "id":error["id"],
    #                     "description": error["message"],
    #                     "match_line": "Found on line " + str(i+1) + " , " + str(match.group()),
    #                     "severity": error["severity"],
    #                     "cwe": error["cwe"]
    #                 }
    #                 print(obj)
            
    #         for info in infos:
    #             for match in re.finditer(info["pattern"], line):
    #                 obj = {
    #                     "id":info["id"],
    #                     "description": info["message"],
    #                     "match_line": "Found on line " + str(i+1) + " , " + str(match.group()),
    #                     "severity": info["severity"],
    #                     "cwe": info["cwe"]
    #                 }
    #                 print(obj)
