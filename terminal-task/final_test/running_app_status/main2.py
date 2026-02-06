from time import sleep
import threading
import copy
import os
from run_command import run_command
from third_party_app_list import fill_3rd_party_app_list, is_in_3rd_party_app_list, is_running

PID = int

DATA_HEADER: list[str] = ['PID', 'USER', 'PR', 'NI', 'VIRT', 'RES', 'SHR', 'S', 'CPU', 'MEM', 'TIME', 'PACKAGE_NAME']
THIRD_PARTY_APPS_LIST: list[PID] = fill_3rd_party_app_list()
# print(THIRD_PARTY_APPS_LIST)
THIRD_PARTY_APPS_LIST_COSTOME = ['com.nitin.moderncpp', 
                                 'com.fiverr.fiverr', 
                                 'com.truecaller', 'com.railyatri.in.mobile', 'remove.unwanted.object', 
                                 'org.telegram.messenger', 'com.nextbillion.groww', 'com.apps.adrcotfas.goodtime', 
                                 'com.desmos.calculator', 'free.programming.programming', 'com.whatsapp', 
                                 'com.jio.join', 'com.freetymekiyan.apas', 'com.discord', 
                                 'com.Version1', 'com.flipkart.android', 'com.duosecurity.duomobile', 
                                 'com.brave.browser', 'com.instagram.android', 'com.jar.app', 
                                 'com.overlook.android.fing', 'com.kvassyu.coding2.c', 'com.olacabs.customer', 
                                 'com.bigbasket.mobileapp', 'com.Jimjum.chessbaao', 
                                 'com.simplemobiletools.draw', 'net.one97.paytm', 
                                 'com.opera.browser', 'org.geogebra.android.geometry', 'com.uphold.wallet', 
                                 'com.emanuelef.remote_capture', 'ru.iiec.pydroid3', 'pcap.file.reader', 
                                 'cris.org.in.prs.ima', 'com.jio.myjio', 
                                 'com.ubercab', 'com.application.zomato', 'flashcards.words.words', 'io.appground.blek', 
                                 'org.lichess.mobileapp', 'com.geekhaven.sembreaker', 
                                 'com.chess', 'com.leetos', 'com.gamestar.perfectpiano', 'com.jetstartgames.chess', 
                                 'com.linkedin.android', 'ru.iiec.pydroid3.quickinstallrepo', 'com.myntra.android', 
                                 'com.animecoreai.aiart.artgenerator.animeart', 'com.pushbullet.android', 
                                 'br.com.blackmountain.photo.text', 'com.digilocker.android', 'com.unacademyapp', 
                                 'com.vicman.toonmeapp', 'com.geekhaven.aviral', 'io.spck'
                                 ]

class Package:
    def __init__(self, data: list[str]):
        self.package_data_dict  = dict(zip(DATA_HEADER, data))
        self.package_name:str   = self.package_data_dict['PACKAGE_NAME']
        self.cpu_usage:float    = float(self.package_data_dict['CPU'])
        self.mem_usage:float    = float(self.package_data_dict['MEM'])

    def print_data(self):
        print(self.package_data_dict["PID"])
        print(f"{self.package_name:<40} {self.cpu_usage:<10} {self.mem_usage:<10} {self.package_data_dict['TIME']}")

all_packages: dict[PID, Package] = {}

def fill_data():
    for line in run_command("adb shell top"):
        data:str = (line.decode('utf-8').strip())
        # if(data.lower().find("stopped")):
        #     all_packages.clear()

        data = data.split()
        if(len(data) == 12):                               ## ignored some info
            all_packages[data[0]] = Package(data)


def print_data():
    while True:
        all = copy.deepcopy(all_packages)
        print(f" PACKAGE_NAME                        CPU_USAGE   MEM_USAGE      TIME")
        for pid in all:
            # package.print_data()
            # if(all[pid].package_data_dict['PACKAGE_NAME'] in THIRD_PARTY_APPS_LIST):
            if(is_in_3rd_party_app_list(all[pid].package_data_dict['PACKAGE_NAME'], THIRD_PARTY_APPS_LIST_COSTOME)):
                all[pid].print_data()
        sleep(1)
        os.system("cls" if os.name == "nt" else "clear")
        # all_packages.clear()
        
if __name__ == "__main__":
    fill_thread     = threading.Thread(target=fill_data)
    print_thread    = threading.Thread(target=print_data)
    # remove_thread    = threading.Thread(target=remove_data)
    fill_thread.start()
    print_thread.start()
    # remove_thread.start()
