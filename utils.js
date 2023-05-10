const os = require('os');
const { exec } = require('child_process');


function getAllIPAddress() {
    let map = new Map();
    const networkInterfaces = os.networkInterfaces();

    for (const name of Object.keys(networkInterfaces)) {
        if (name === 'lo') {
            // console.log(`Interface: ${name}, PASS`);
            continue;
        }
        const iface = networkInterfaces[name];
        // console.log(`Interface: ${name}`);

        let arr = [];
        for (const addr of iface) {
            if (addr.family === 'IPv6') {
                // console.log(`  ${addr.family} IP address: PASS`);
                continue;
            }
            // console.log(`  ${addr.family} IP address: ${addr.address}`);
            arr.push(addr.address);
        }
        if (arr.length > 0) {
            map.set(name, arr);
        }
    }
    return map
}

// Define the URL to open
function openBrowser(url) {
    // Use the appropriate command to open the browser based on the platform
    const command = process.platform === 'win32' ? 'start' : 'open';

    // Execute the command to open the browser
    exec(`${command} ${url}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error opening browser: ${error}`);
            return;
        }
        console.log(`Opened browser with URL: ${url}`);
    });
}

module.exports = { 
    getAllIPAddress,
    openBrowser,
};