## To check if the app is running in present

## Command to be used :> adb shell pidof "com.instagram.android"


from run_command import run_command


def is_running(package_name) -> bool:
    return True if([pid for pid in run_command(f"adb shell pidof {package_name}", display_error=False)]) else False
package_name = "com.instagram.android"
print(is_running(package_name))