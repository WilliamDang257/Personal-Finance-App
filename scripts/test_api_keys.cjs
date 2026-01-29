const https = require('https');

const keys = [
    "AIzaSyDxM0Q97S_0Ofwnm7H6noiwJJUt2cCXDas",
    "AIzaSyBqh8hPaM9zLmCWX_kBkX4lLQOMoLYpVAk",
    "AIzaSyAJf81HLfpD8YLAGvt0nfpYmmPw5lGqDnY",
    "AIzaSyCs30rKFidkXwM-sVx1wXh4_KU_gL_cXpo",
    "AIzaSyDQm2i6B9KtwOanUtNuhvJ3Jyrbnasv-h8"
];

const model = 'gemini-1.5-flash';

async function testKey(key) {
    return new Promise((resolve) => {
        const options = {
            hostname: 'generativelanguage.googleapis.com',
            path: `/v1beta/models?key=${key}`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (d) => body += d);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log(`✅ Key ${key.slice(0, 10)}...: Success!`);
                    try {
                        const data = JSON.parse(body);
                        const models = data.models?.map(m => m.name) || [];
                        console.log(`   Available Models: ${models.join(', ')}`);
                    } catch (e) {
                        console.log(`   Error parsing body`);
                    }
                    resolve(true);
                } else {
                    console.log(`❌ Key ${key.slice(0, 10)}...: Failed (${res.statusCode})`);
                    try {
                        const err = JSON.parse(body);
                        console.log(`   Reason: ${err.error?.message || body}`);
                    } catch (e) {
                        console.log(`   Body: ${body}`);
                    }
                    resolve(false);
                }
            });
        });

        req.on('error', (error) => {
            console.error(`ERROR call: ${error}`);
            resolve(false);
        });

        req.end();
    });
}

async function run() {
    console.log(`Testing ${keys.length} keys with model ${model}...\n`);
    for (const key of keys) {
        await testKey(key);
    }
}

run();
