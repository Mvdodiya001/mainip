const { execSync, spawn } = require('child_process');
const { io } = require('../utils/constants');

const thirdPartyApps = () => {
    const command = "adb shell pm list packages -3";
    let data;
    try {
        data = execSync(command, { shell: true });
    }
    catch (err) {
        io.emit({
            errorType: 'Third Party App Error',
            message: err,
            code: 500,
        });
        return [];
    }

    return data.toString().split('\n');
};

const fillAllAppList = () => {
    const allAppList = [];
    for (const i of runCommand("adb shell pm list packages")) {
        allAppList.push(i.toString().trim().replace("package:", ""));
    }

    return allAppList;
};


const checkSame = (packageLess, packageName) => {     // Need Check TODO();
    if (packageLess === packageName) {
        return true;
    }
    if (packageLess.length > packageName.length - 1) {
        return false;
    }
    return packageLess[packageLess.length - 1] === "+" && packageLess.slice(0, packageLess.length - 1) === packageName;
};

const packageInList = (packageName, packageList) => {
    for (const package of packageList) {
        if (checkSame(packageName, package)) {
            return {
                trueName: package,
                result: true,
            };
        }
    }
    return {
        result: false,
    };
};

const isAppRunning = (packageName) => {
    const command = `adb shell pidof ${packageName}`;
    try {
        const data = execSync(command, { shell: true });
        return true;
    }
    catch (err) {
        return false;
    }
};

// const isProcessRunning = (pidArray) => {
//     const command = `adb shell ps ${pidArray.join(" ")}`;
//     try{
//         const data = execSync(command, { shell: true });
//         const ans = data.toString().split('\n').slice(1, -1).map((value)=>{
//             return parseInt(value.trim().split(/ +/)[1]);
//         });
//         return ans.join(' ');
//     } catch(err){
//         return new Error("Command running failed!");
//     }
// };

const isProcessRunning = (pid) => {
    const command = `adb shell ps ${pid}`;
    try{
        const data = execSync(command, { shell: true });
        // console.log(pid, data.toString().split('\n').length);
        return data.toString().split('\n').length > 2;
    } catch(err){
        return new Error("Command running failed!");
    }
};

const runCommand = (command, displayError = true) => {
    const p = spawn(command, { shell: true });
    p.stdout.on('data', (data) => {
        yield (data.toString());
    });
    p.stderr.on('data', (data) => {
        if (displayError) {
            console.error(`Error: ${data}`);
        }
    });
    p.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });
};

module.exports = {
    thirdPartyApps,
    fillAllAppList,
    packageInList,
    checkSame,
    isAppRunning,
    isProcessRunning,
    runCommand,
}
