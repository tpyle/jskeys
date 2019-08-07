const fs = require ( 'fs' );
const homedir = require('os').homedir();

function getConfig() {
    return new Promise((resolve,reject)=>{
	fs.mkdir(`${homedir}/.jskeys`,{recursive: true},(err)=>{
	    if ( err ) {
		reject(`Failed to create folder ${process.env.HOME}/.jskeys`);
	    }
	    process.chdir(`${process.env.HOME}/.jskeys`);
	    fs.readFile(`config.json`,(err,file)=>{
		let config = { keys_file: ".keys" };
		if ( err ) {
		    console.error("Failed to read the config file. Assuming defaults.");
		    return resolve(config);
		}
		try {
		    config = JSON.parse(file);
		} catch ( e ) {
		    console.error("Failed to parse the config file, Assuming defaults.");
		}
		resolve(config);
	    });
	});
    });
}

module.exports = getConfig;
