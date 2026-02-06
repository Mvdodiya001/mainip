import re
from run_command import run_command

TO_BE_GROUPED_CATEGORY = [
    "com.google.and+",

]

def fill_3rd_party_app_list() -> None:
    third_party_app_list = []
    for i in run_command("adb shell pm list packages -3"):
        third_party_app_list.append(i.decode('utf-8').strip().removeprefix("package:"))
    return third_party_app_list


def fill_all_app_list() -> None:
    third_party_app_list = []
    for i in run_command("adb shell pm list packages"):
        third_party_app_list.append(i.decode('utf-8').strip().removeprefix("package:"))
    return third_party_app_list

def fill_system_app_list() -> None:
    third_party_app_list = []
    for i in run_command("adb shell pm list packages -s"):
        third_party_app_list.append(i.decode('utf-8').strip().removeprefix("package:"))
    return third_party_app_list
# def get_package_id(package_name: str):
#     return run_command("adb shell pm list packages -3")


def check_same(package_less, package_name) -> None:
    if(package_less == package_name):
        return True
    if(len(package_less)>len(package_name)-1):
        return False
    return (package_less[-1]=='+') and (package_less[:len(package_less)-1] in package_name)
    

def is_in_3rd_party_app_list(package_name, package_list):
    for package in package_list:
        if(check_same(package_name, package)):
            print(package, end=" ")
            return True
    return False

def is_running(package_name): 
    return True if([pid for pid in run_command(f"adb shell pidof {package_name}", display_error=False)]) else False
# print(fill_3rd_party_app_list())




"""
adb shell pm list packages -3

Here is what each option does:

-f: See their associated file.
-d: Filter to only show disabled packages.
-e: Filter to only show enabled packages.
-s: Filter to only show system packages.
-3: Filter to only show third-party packages.
-i: See the installer for the packages.
-u: Also include uninstalled packages.

"""