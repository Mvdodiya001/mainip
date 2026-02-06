const axios = require('axios');
const fs = require('fs');
const path = require('path');
const dns = require('dns');

const NVD_PATH = path.join(__dirname, '../CVE/nvdcve-2.0.json');
const NVD_API_URL = 'https://services.nvd.nist.gov/rest/json/cves/2.0';

// Helper to check internet connection
const checkInternet = () => {
    return new Promise((resolve) => {
        dns.lookup('google.com', (err) => {
            if (err && err.code === "ENOTFOUND") {
                resolve(false);
            } else {
                resolve(true); // Internet is fine (or at least DNS is)
            }
        });
    });
};

const updateDataset = async () => {
    console.log('[Dataset Updater] Initiating update check...');

    const isOnline = await checkInternet();
    if (!isOnline) {
        console.log('[Dataset Updater] No internet connection. Skipping update.');
        return;
    }

    try {
        // 1. Determine Start Date (Last 7 days to keep it lightweight)
        const daysLookback = 7;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysLookback);

        // NIST strictly requires: YYYY-MM-DDTHH:mm:ss.SSS
        // We'll strip the 'Z' from ISOString and ensure milliseconds are present
        const pubStartDate = startDate.toISOString().replace('Z', '');

        const endDate = new Date();
        const pubEndDate = endDate.toISOString().replace('Z', '');

        console.log(`[Dataset Updater] Fetching updates from ${pubStartDate} to ${pubEndDate}`);

        const response = await axios.get(NVD_API_URL, {
            headers: {
                'User-Agent': 'IoT-Security-Lab-Tool/1.0'
            },
            params: {
                pubStartDate: pubStartDate,
                pubEndDate: pubEndDate,
                resultsPerPage: 2000
            },
            timeout: 30000
        });

        const newVulnerabilities = response.data.vulnerabilities || [];
        console.log(`[Dataset Updater] Fetched ${newVulnerabilities.length} CVEs.`);

        if (newVulnerabilities.length === 0) {
            console.log('[Dataset Updater] No new updates found.');
            return;
        }

        // 2. Load Local Data
        let localData = { vulnerabilities: [] };
        if (fs.existsSync(NVD_PATH)) {
            try {
                const fileContent = fs.readFileSync(NVD_PATH, 'utf-8');
                localData = JSON.parse(fileContent);
                // Ensure structure
                if (!localData.vulnerabilities) localData.vulnerabilities = [];
            } catch (err) {
                console.error('[Dataset Updater] Error reading local file, starting fresh.', err.message);
            }
        }

        // 3. Merge Updates (Upsert based on CVE ID)
        // Map required for O(1) lookup
        const cveMap = new Map();

        // Load existing
        localData.vulnerabilities.forEach(v => {
            if (v.cve && v.cve.id) {
                cveMap.set(v.cve.id, v);
            }
        });

        // Merge new
        let addedCount = 0;
        let updatedCount = 0;

        newVulnerabilities.forEach(item => {
            if (item.cve && item.cve.id) {
                if (cveMap.has(item.cve.id)) {
                    updatedCount++;
                } else {
                    addedCount++;
                }
                cveMap.set(item.cve.id, item); // Overwrite/Add
            }
        });

        // Reconstruct array
        localData.vulnerabilities = Array.from(cveMap.values());

        // Update Metadata
        localData.timestamp = new Date().toISOString();
        localData.totalResults = localData.vulnerabilities.length; // Approximate local total

        // 4. Save to file
        fs.writeFileSync(NVD_PATH, JSON.stringify(localData, null, 2));
        console.log(`[Dataset Updater] Update Complete. Added: ${addedCount}, Updated: ${updatedCount}. Total: ${localData.totalResults}`);

    } catch (error) {
        if (error.response) {
            console.error(`[Dataset Updater] API Error: ${error.response.status} - ${error.response.statusText}`);
        } else {
            console.error('[Dataset Updater] Error during update:', error.message);
        }
    }
};

module.exports = { updateDataset };
