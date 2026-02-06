1. Run the get_all_app_list.py this will print a dict with two keys : system, third_party, these two keys contain a 
array each giving name of all the apps of that categories.

2. As decided we will make the third_party apps already but also having option to select the system apps and deselecting the 
third_party apps.

3. Store the result of user selected apps in apps_list.txt with a endline char.

4. Run the get_data.py the output of this function is displayed in the image help.png.

5. Display these data on frontend whenever there is a print.

6. With this max work is done except the following -

        a. When the app get closed we need to remove it or make it's backgroung red.
        b. For this we have the file is_running.py which can be run like -> python is_running.py package_name will print True or False
            depending on is running or not.
        c. Best time to run this script is in interval of some time (may be 30 sec) on the package we already received.

Things to note:
1. Apps should be unique for pid.