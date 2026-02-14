
const { getAllKeywords } = require('./utils/cveKeywords');

const keywords = getAllKeywords();
if (keywords.has('tp-link')) {
    console.log('FAIL: tp-link is still in the whitelist.');
    process.exit(1);
} else {
    console.log('PASS: tp-link is NOT in the whitelist.');
}
