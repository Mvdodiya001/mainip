from subprocess import Popen, PIPE

def extractPortFromData(data):
    x = data.split("\n")
    xnew = []
    for i in x:
        try:
            if(i[0]!="" and i[0].isnumeric()):
                xnew.append(i)
        except:
            pass
    outputs = []
    for i in xnew:
        output = []
        for j in i.split(' '):
            if(j!=""):
                output.append(j)
        outputs.append(output[:3])
    ports = [output[0] for output in outputs]
    services = [output[2] for output in outputs]
    return {"ports": ports, "services": services}

def portfinder(ip):             # check for question mark at end of serviuces
    pid = Popen(["nmap", ip], stdout=PIPE)
    data = pid.communicate()[0].decode("utf-8")
    return extractPortFromData(data)
