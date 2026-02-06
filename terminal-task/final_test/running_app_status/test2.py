str1 = "com.ubercab"
str2 = 'com.truecallerhsgjdh'

THIRD_PARTY_APPS_LIST_COSTOME = ['com.nitin.moderncpp', 'com.fiverr.fiverr', 'com.truecaller', 'com.railyatri.in.mobile', 'remove.unwanted.object', 'org.telegram.messenger', 'com.google.android.apps.docs.editors.docs', 'com.nextbillion.groww', 'com.apps.adrcotfas.goodtime', 'com.desmos.calculator', 'free.programming.programming', 'com.whatsapp', 'com.jio.join', 'com.google.android.apps.docs.editors.sheets', 'com.google.android.apps.docs.editors.slides', 'com.freetymekiyan.apas', 'com.discord', 'com.sec.android.app.voicenote', 'in.amazon.mShop.android.shopping', 'com.Version1', 'com.flipkart.android', 'com.duosecurity.duomobile', 'com.brave.browser', 'com.instagram.android', 'com.jar.app', 'com.overlook.android.fing', 'com.kvassyu.coding2.c', 'com.olacabs.customer', 'com.bigbasket.mobileapp', 'com.Jimjum.chessbaao', 'com.google.android.apps.classroom', 'com.google.android.apps.docs', 'com.simplemobiletools.draw', 'net.one97.paytm', 'com.opera.browser', 'org.geogebra.android.geometry', 'com.uphold.wallet', 'com.emanuelef.remote_capture', 'ru.iiec.pydroid3', 'pcap.file.reader', 'cris.org.in.prs.ima', 'com.jio.myjio', 'com.google.android.calendar', 'com.ubercab', 'com.application.zomato', 'flashcards.words.words', 'io.appground.blek', 'org.lichess.mobileapp', 'com.geekhaven.sembreaker', 'com.sec.android.app.popupcalculator', 'com.chess', 'com.leetos', 'com.gamestar.perfectpiano', 'com.jetstartgames.chess', 'com.linkedin.android', 'ru.iiec.pydroid3.quickinstallrepo', 'com.myntra.android', 'com.animecoreai.aiart.artgenerator.animeart', 'com.pushbullet.android', 'br.com.blackmountain.photo.text', 'com.digilocker.android', 'com.unacademyapp', 'com.google.android.keep', 'com.vicman.toonmeapp', 'com.geekhaven.aviral', 'io.spck']

def check_same(package_less, package_name) -> None:
    if(package_less == package_name):
        return True
    if(len(package_less)>len(package_name)-1):
        return False
    return (package_less[:len(package_less)-1] in package_name)

def is_in_3rd_party_app_list(package_name, package_list):
    for package in package_list:
        if(check_same(package_name, package)):
            print(package)
            return True
    return False

print(is_in_3rd_party_app_list(str1, THIRD_PARTY_APPS_LIST_COSTOME))