
const fetch = require('node-fetch');
const exclude = require('./exclude.local.json');
const conf = require('./config.local.json');

async function main() {
    const url = `${conf.url}/api/v1`;

    // Login

    const loginOpts = {
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({
            user: conf.user,
            password: conf.password
        })
    };
    const loginRes = await fetch(`${url}/login`, loginOpts);
    const loginData = (await loginRes.json()).data;

    const headers = {
        'X-Auth-Token': loginData.authToken,
        'X-User-Id': loginData.userId
    };

    // Deactivate users

    console.log(`Disabling users.`);

    const excludeSet = new Set();
    for (const user of exclude)
        excludeSet.add(user);

    const count = 50;
    let total = 0;
    let promises = [];

    for (let i = 0; true; i++) {
        const params = new URLSearchParams({
            count,
            offset: i * count,
            sort: JSON.stringify({username: 1})
        });
        const res = await fetch(`${url}/users.list?${params}`, {headers});
        const json = await res.json();

        for (const user of json.users)
        if (user.active
        && !excludeSet.has(user.username)
        && user.roles.indexOf('admin') === -1
        && user.roles.indexOf('bot') === -1) {
            console.log(` -> ${user.username}`);

            const updateOpts = {
                method: 'POST',
                headers: Object.assign({}, headers, {
                    'Content-type': 'application/json'
                }),
                body: JSON.stringify({
                    userId: user._id,
                    data: {active: false}
                })
            };

            promises.push(fetch(`${url}/users.update`, updateOpts));
            total++;

            if (promises.length >= count) {
                console.log(`Waiting for last requests to end.`);
                await Promise.all(promises);
                promises = [];
            }
        }

        if (json.users.length == 0) break;
    }

    if (promises.length) {
        console.log(`Waiting for last requests to end.`);
        await Promise.all(promises);
    }

    console.log(`Total: ${total} users disabled.`);

    // Logout

    await fetch(`${url}/logout`, {headers});
}
main();
