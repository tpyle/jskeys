const { Writable } = require('stream');

class WritableString extends Writable {
    constructor(opts) {
	super(opts);
	this.str = "";
    }

    _write(chunk, encoding, next) {
	this.str += chunk;
	next();
    }
    
    getString() {
	return this.str;
    }
}

module.exports = WritableString;
