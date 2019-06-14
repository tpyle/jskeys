const read = require('read');

async function getPass(prompt) {
    return new Promise((resolve,reject)=>{
	prompt = prompt || "Password: ";
	read({prompt, silent: true, output: process.stderr},(err,pass)=>{
	    if ( err ) {
		reject ( err );
	    } else {
		resolve(pass);
	    }
	});
    });
}

module.exports = getPass;
