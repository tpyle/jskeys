#!/usr/local/bin/node
const encrypt = require('./encrypt');
const decrypt = require('./decrypt');
const genPass = require('./genPass');
const fs      = require('fs');
const getPass = require('./getPass');
const keyServ = require('./keyServ');

let config = undefined;
let session = undefined;

async function end(internal_dict, start) {
    let end = JSON.stringify(internal_dict);
    if ( end != start || (argv.new_password && argv.new_password != config.password) ) {
	if ( argv.new_password ) {
	    config.password = argv.new_password;
	}
	console.error("Updating file...");
	encrypt({ string: end, password: config.password, file: config.keys_file },()=>{
	    fs.readFile(config.keys_file,(err,data)=>{
		if ( err ) {
		    throw err;
		}
		if ( config.token_file ) {
		    session.putFile(data);
		}
		console.error("Updating remote file");
	    });
	});
    }
}

const argv = require('./commandArgs')([{ name: 'add',
					 describe: 'Adds a password and location pair that was created elsewhere',
					 positionals: [{ name: 'location',
							 value: String,
							 describe: 'The location the password belongs to'},
						       { name: 'password',
							 value: String,
							 describe: 'The password for that location' }] },
				       { name: 'remove',
					 describe: 'Removes the entry for the given location',
					 positionals: [{ name: 'location',
							 value: String,
							 describe: 'The location to remove' }] },
				       { name: 'update',
					 describe: 'Updates the entry for a given location, either with a provided password, or it will create a new one. If a password is provided, it will not attempt to generate a new one.',
					 positionals: [{ name: 'location',
							 describe: 'The location to update',
							 value: String },
						       { name: 'password',
							 describe: 'The password to use now',
							 value: String,
							 optional: true } ],
					 args: [{ name: 'n <numbers>',
						  describe: 'The amount of numbers to use in the password',
						  value: Number,
						  default: 4 },
						{ name: 's <specials>',
						  describe: 'The amount of special characters to use in the password',
						  value: Number,
						  default: 4 },
						{ name: 'u <uppercases>',
						  describe: 'The amount of uppercase letters to use in the password',
						  value: Number,
						  default: 4 },
						{ name: 'l <length>',
						  describe: 'The length of the password',
						  value: Number,
						  default: 16 },
						{ name: 'specials <speciallist>',
						  describe: 'The valid special characters',
						  value: String,
						  default: "!@#$%^&*" }] },
				       { name: 'create',
					 describe: 'Creates a new password for the given location',
					 positionals: [{ name: 'location',
							 describe: 'The location to create a password for',
							 value: String }],
					 args: [{ name: 'x',
						  describe: 'Don\'t store this password, or attach a key to it. You do need to give a fake location though.',
						  optional: true },
						{ name: 'n <numbers>',
						  describe: 'The amount of numbers to use in the password',
						  value: Number,
						  default: 4 },
						{ name: 's <specials>',
						  describe: 'The amount of special characters to use in the password',
						  value: Number,
						  default: 4 },
						{ name: 'u <uppercases>',
						  describe: 'The amount of uppercase letters to use in the password',
						  value: Number,
						  default: 4 },
						{ name: 'l <length>',
						  describe: 'The length of the password',
						  value: Number,
						  default: 16 },
						{ name: 'specials <speciallist>',
						  describe: 'The valid special characters',
						  value: String,
						  default: "!@#$%^&*"}] },
				       { name: 'pin',
					 describe: 'Creates a new pin',
					 positionals: [{ name: 'location',
							 describe: 'The location to create a pin for',
							 value: String}],
					 args: [{ name: 'l <length>',
						  describe: 'The length of the pin',
						  value: Number,
						  default: 4 }] },
				       { name: 'lookup',
					 describe: 'Lookups the password for the given location',
					 positionals: [{ name: 'location',
							 describe: 'The location to lookup',
							 value: String }],
					 args: [{ name: 'n',
						  describe: 'Don\'t use a newline when printing',
						  optional: true }] },
				       { name: 'dump',
					 describe: 'Dumps out all information',
					 args: [{ name: 'j',
						  describe: 'Print out data in JSON form instead of as a table',
						  optional: true }] },
				       { name: 'change',
					 describe: 'Change the password used for encryption' }]);

async function fstart() {
    if ( argv.mode == 'create' && argv.x ) {
	let { location, numbers, specials, uppercases, length, speciallist } = argv;
	console.log(genPass({ length, number: numbers, uppercase: uppercases, special: specials, specials: speciallist }));
	return;
    }
    config = await require('./config')();
    config.password = await getPass();
    if ( config.token_file ) {
	let token = fs.readFileSync(config.token_file);
	session = await keyServ(token, config.key_server);
	let servdata = await session.getFile();
	let currdata = fs.readFileSync(config.keys_file);
	if ( servdata != currdata ) {
	    fs.writeFileSync(config.keys_file,servdata);
	}
    }
    init();
};

async function handler(data) {
    let internal_dict = data ? JSON.parse(data) : {};
    let start = JSON.stringify(internal_dict);

    switch (argv.mode) {
    case 'add':
	{
	    let { location, password } = argv;
	    if ( internal_dict[location] ) {
		console.error(`${location} already has a password. Use 'update' to replace the password`);
	    } else {
		internal_dict[location] = password;
		console.log(password);
	    }
	}
	break;
    case 'remove':
	{
	    let { location } = argv;
	    if ( internal_dict[location] ) {
		console.log(internal_dict[location]);
		delete internal_dict[location];
	    } else {
		console.error(`There is no such location ${location}`);
	    }
	}
	break;
    case 'update':
	{
	    let { location, password, numbers, specials, uppercases, length, speciallist } = argv;
	    if ( password == undefined ) {
		password = genPass({ length, number: numbers, uppercase: uppercases, special: specials, specials: speciallist });
	    }
	    if ( internal_dict[location] == undefined ) {
		console.error(`No location ${location}. Creating a new entry.`);
	    }
	    internal_dict[location] = password;
	    console.log(password);
	}
	break;
    case 'create':
	{
	    let { location, numbers, specials, uppercases, length, speciallist } = argv;
	    if ( internal_dict[location] == undefined ) {
		internal_dict[location] = genPass({ length, number: numbers, uppercase: uppercases, special: specials, specials: speciallist });
		console.log(internal_dict[location]);
	    } else {
		console.error(`Location ${location} already exists. Please use 'update'.`);
	    }
	}
	break;
    case 'pin':
	{
	    let { location, l  } = argv;
	    if ( location.indexOf("/pin") < 0 ) {
		location = `${location}/pin`;
	    }
	    if ( internal_dict[location] != undefined ) {
		console.error(`Location ${location} already exists.`);
	    } else {
		internal_dict[location] = genPass({ length: 4, number: 4, uppercase:0, special:0});
		console.log(internal_dict[location]);
	    }
	}
	break;
    case 'lookup':
	{
	    let { location, n } = argv;
	    if ( internal_dict[location] ) {
		if ( n ) {
		    process.stdout.write(internal_dict[location])
		} else {
		    console.log(internal_dict[location]);
		}
	    } else {
		location = location + '/pin';
		if ( internal_dict[location] ) {
		    if ( n ) {
			process.stdout.write(internal_dict[location])
		    } else {
			console.log(internal_dict[location]);
		    }
		} else {
		    console.error(`Location ${location} is not stored`);
		}
	    }
	}
	break;
    case 'dump':
	{
	    let { j } = argv;
	    if ( j ) {
		console.log(JSON.stringify(internal_dict));
	    } else {
		let len = 0;
		Object.keys(internal_dict).forEach(arg=>{
		    len = Math.max(len,arg.length);
		});
		len++;
		Object.entries(internal_dict).sort().forEach(arg=>{
		    console.log(`${arg[0]}${' '.repeat(len - arg[0].length)}${arg[1]}`);
		});
	    }
	}
	break;
    case 'change':
	{
	    let pass1 = 1;
	    let pass2 = 2;
	    let tried = false;
	    while ( pass1 != pass2 ) {
		if ( tried ) {
		    console.error("Oops! Try again.");
		}
		pass1 = await getPass("New Password:");
		pass2 = await getPass("Confirm Password:");
		tried = true;
	    }
	    argv.new_password = pass1;
	}
	break;
    default:
	throw `Illegal Command Attempted`;
    }
    
    end(internal_dict, start, argv);
}

function init() {
    fs.stat(config.keys_file,async err=>{
	if ( err ) {
	    handler();
	} else {
	    let attempts = 0;
	    while ( attempts < 3 ) {
		if ( attempts > 0 ) {
		    console.error("Failed to decrypt the password. Please try again.");
		    config.password = await getPass();
		}
		try {
		    let result = await decrypt(config.keys_file, config.password);
		    handler(result);
		    attempts = 100;
		} catch ( e ) {
		    attempts++;
		}
	    }
	    if ( attempts == 3 ) {
		console.error("Too many failed attempts.");
	    }
	}
    });
}

fstart().catch(console.error)
