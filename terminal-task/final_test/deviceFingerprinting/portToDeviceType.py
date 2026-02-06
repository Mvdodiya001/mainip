import json
with open("x.json") as f:
    data = json.load(f)
def getDeviceType(ports):
    for i in data["data"]:
        shouldBe = i["ports"]
        #i["correct"] = 0
        for j in shouldBe:
            for k in ports:
                if j == k:
                    #i["correct"]+=1
                    return i['deviceType']

