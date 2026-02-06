import pandas as pd

dataFrame = pd.read_csv("macToVender.csv")
mac_prefix = dataFrame.iloc[:,0]
vender = dataFrame.iloc[:,1]


def getVenderFromMacPrefix(mac):
    try:
        i = mac_prefix.tolist().index(mac)
        return vender.tolist()[i]
    except Exception as e:
        print(e)
        return "not found"
    
    

