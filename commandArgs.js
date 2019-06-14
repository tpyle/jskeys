function phelp(posargs, oargs, mode, command) {
    let string = "Usage:\n\t";
    string += process.argv[0].substring(process.argv[0].lastIndexOf('/')+1) + " ";
    string += process.argv[1].substring(process.argv[1].lastIndexOf('/')+1) + " ";
    string += mode ? `${mode} ` : "";
    posargs.forEach(arg=>{
		let name = arg.oname ? arg.oname : arg.name;
		if ( arg.optional || arg.default ) {
			string += `[${name}] `;
		} else {
			string += `<${name}> `;
		}
    });
    Object.entries(oargs).forEach(argument=>{
		let key = argument[0];
		let arg = argument[1];
		let name = arg.oname ? arg.oname : arg.name;
		let prefix = key.length > 1 ? '--' : '-';
		if ( arg.optional || arg.default ) {
			string += `[${prefix}${name}] `;
		} else {
			string += `<${prefix}${name}> `;
		}
    });
    if ( command ) {
	string += "\n\nDescription:\n\t";
	string += `${command.describe}\n`;
    }
    string += "\nArguments:\n";

    posargs.forEach(arg=>{
	let name = arg.oname ? arg.oname : arg.name;
	if ( arg.optional || arg.default ) {
	    let def = arg.default ? `=${arg.default}` : ''; 
	    string += `\t[${name}${def}] ${arg.describe}\n`;
	} else {
	    string += `\t<${name}> ${arg.describe}\n`;
	}
    });
    Object.values(oargs).forEach(arg=>{
	let name = arg.oname ? arg.oname : arg.name;
	if ( arg.optional || arg.default ) {
	    let def = arg.default ? `=${arg.default}` : ''; 
	    string += `\t[${name}${def}] ${arg.describe}\n`;
	} else {
	    string += `\t<${name}> ${arg.describe}\n`;
	}
    });
    
    console.log ( string );
    process.exit();
}

function parseArgs(posargs, oargs, clargs, mode=undefined, command={}) {
    let i = 0;
    let ret = { mode };
    for ( i = 0; i < clargs.length; i++ ) {
	let clarg = clargs[i]; // The current command line argument
	if ( clarg.startsWith('-') ) {
	    // It's a non-positional(?) argument
	    if ( clarg.startsWith('--') ) {
		// Its a single argument
		if ( clarg == "--help" ) {
		    phelp(posargs, oargs, mode, command);
		}
		let cparg = oargs[clarg.substring(2)];
		if ( ! cparg ) {
		    throw `Unrecognized flag ${clarg}`
		}
		let value = undefined;
		if ( cparg.hasValue ) {
		    try { 
			value = cparg.value(clargs[i+1]);
		    } catch (e) {
			throw `Failed to retrieve value ${clargs[i+1]} for flag ${clarg}`;
		    }
		    i++;
		} else {
		    value = true;
 		}
		ret[cparg.name] = value;
	    } else {
		// Its potentially many arguments
		let flags = clarg.substring(1);
		for ( let j = 0; j < flags.length; j++ ) {
		    let clarg = flags.charAt(j);
		    let cparg = oargs[clarg];
		    if ( ! cparg ) {
			throw `Unrecognized flag ${clarg}`
		    }
		    let value = undefined;
		    if ( cparg.hasValue ) {
			try { 
			    value = cparg.value(clargs[i+1]);
			} catch (e) {
			    throw `Failed to retrieve value ${clargs[i+1]} for flag ${clarg}`;
			}
			i++;
		    } else {
			value = true;
		    }
		    ret[cparg.name] = value;
		}
	    }
	} else {
	    // It's a positional argument
	    let cparg = posargs.shift();
	    if ( ! cparg ) {
		throw `Extra positional parameter: ${clarg}`;
	    }
	    ret[cparg.name] = cparg.value(clarg);
	}
    }
    posargs.forEach(arg=>{
	if ( ret[arg.name] == undefined ) {
	    if ( arg.default ) {
		ret[arg.name] = arg.default;
	    } else if ( arg.optional ) {
		ret[arg.name] = undefined;
	    } else {
		throw `Missing positional parameters: ${arg.name}`;
	    }
	}
	
    });
    Object.entries(oargs).forEach(v=>{
	if ( ret[v[1].name] == undefined ) {
	    if ( v[1].default ) {
		ret[v[1].name] = v[1].default;
	    } else if ( v[1].optional ) {
		ret[v[1].name] = false;
	    } else { 
		throw `Missing required flag: ${v[0]}`
	    }
	}
    });
    return ret;
}

function commandArgs(commands) {
    let coms = {}
    commands.forEach(command=>{
	coms[command.name] = command;
    });
    let args = process.argv.splice(2);
    if ( args.length == 0 ) {
	console.error('No Command Provided');
	phelp([{name: "command", value: String, describe: "The mode to use. Must be one of " + commands.reduce((a,v)=>a+`, ${v.name}`,"").substring(2)}],{});
    }
    let _command = args[0];
    args = args.splice(1);
    if (coms[_command]) {
	let command = coms[_command];
	let posargs = command.positionals || [];
	let oargs = {};
	if ( command.args ) {
	    command.args.forEach(arg=>{
		let match = undefined;
		let name = arg.name;
		if ( match = arg.name.match(/(?<flag>\w+) <(?<arg>\w+)>/) ) {
		    arg.oname = arg.name;
		    name = match.groups.flag;
		    arg.name = match.groups.arg;
		    arg.hasValue = true;
		}
		oargs[name] = arg;
	    });
	}
	let posargs_copy = [...posargs];
	try {
	    return parseArgs(posargs, oargs, args, _command, command);
	} catch ( e ) {
	    console.error ( e );
	    phelp(posargs_copy, oargs, _command, command);
	}
    } else {
	console.error(`Command ${_command} not recognized`);
	phelp([{name: "command", value: String, describe: "The mode to use. Must be one of " + commands.reduce((a,v)=>a+`, ${v.name}`,"").substring(2)}],{});
    }
}

module.exports = commandArgs;
