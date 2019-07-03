const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const WritableString = require('./WritableString');

const getCipherKey = require('./getCipherKey');

function decrypt(file_name, password) {
    return new Promise((resolve,reject)=>{
	_decrypt({file: file_name, password},(err,output)=>{
	    if ( err ) {
		reject(err);
	    } else {
		resolve(output);
	    }
	})
    });
}

function _decrypt({ file, password }, cb) {
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

	readStream.on('error',cb)
			.pipe(decipher).on('error',cb)
			.pipe(unzip).on('error',cb)
			.pipe(writeStream).on('error',cb);

		writeStream.on('finish', ()=>{
		    cb(undefined, writeStream.getString());
		})
    });
}

module.exports = decrypt;
