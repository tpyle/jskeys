const axios = require('axios');

let config = {};

async function getSessionId() {
    config.token = config.token.toString().trim();
    let res = undefined;
    try {
	res = await axios.post(`${config.key_server}/token`, config.token, { headers: { 'Content-Type': 'text/plain' } })
    } catch ( e ) {
	throw e.response.data.error;
    }
    config.headers = { Cookie: res.headers["set-cookie"][0] };
}

async function getFile() {
    let res = undefined;
    try {
	res = await axios.get(config.key_server, { headers: config.headers, responseType: 'arraybuffer', responseEncoding: 'binary' });
    } catch ( e ) {
	throw e;
    }
    return res.data;
}

async function putFile(data) {
    let res = undefined;
    try {
	res = await axios.put(config.key_server, data, { headers: config.headers });
    } catch ( e ) {
	throw e;
    }
}

async function init(token, key_server) {
    config = { token, key_server };
    await getSessionId();
    return { getFile, putFile };
}

module.exports = init;
