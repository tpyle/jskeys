const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const WritableString = require('./WritableString');

const getCipherKey = require('./getCipherKey');

function decrypt({ file, password }, cb) {
    // First, get the iv from the file
    const readInitVect = fs.createReadStream(file, { end: 15 });

    let initVect;
    readInitVect.on('data', (chunk) => {
	initVect = chunk;
    });

    // Decrypt the file:
    readInitVect.on('close', ()=>{
		const cipherKey = getCipherKey(password);
		const readStream = fs.createReadStream(file, { start: 16 });
		const decipher = crypto.createDecipheriv('aes256', cipherKey, initVect);
		const unzip = zlib.createUnzip();
		const writeStream = new WritableString();//fs.createWriteStream(file + '.unenc');

		readStream
			.pipe(decipher)
			.pipe(unzip)
			.pipe(writeStream);

		writeStream.on('finish', ()=>{
			cb(writeStream.getString());
		})
    });
}

module.exports = decrypt;
