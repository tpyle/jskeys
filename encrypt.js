const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const Readable = require('stream').Readable;

const AppendInitVect = require('./AppendInitVect');
const getCipherKey = require('./getCipherKey');

function encrypt({ string, file, password }, cb) {
    const textStream = new Readable();
    textStream._read = () => {}; // redundant? see update below
    textStream.push(string);
    textStream.push(null);

    // Generate a secure, pseudo random initialization vector.
    const initVect = crypto.randomBytes(16);
    
    // Generate a cipher key from the password.
    const CIPHER_KEY = getCipherKey(password);
    const gzip = zlib.createGzip();
    const cipher = crypto.createCipheriv('aes256', CIPHER_KEY, initVect);
    const appendInitVect = new AppendInitVect(initVect);
    // Create a write stream with a different file extension.
    const writeStream = fs.createWriteStream(file);

    let str = "";
    textStream
	.pipe(gzip)
	.pipe(cipher)
	.pipe(appendInitVect)
	.pipe(writeStream);
    writeStream.on('finish', ()=>{
	if ( cb ) {
	    cb();
	}
    });
}

module.exports = encrypt;
