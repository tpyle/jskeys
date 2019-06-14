const { Transform } = require('stream');

class AppendInitVect extends Transform {
    constructor(iv, opts) {
	super(opts);
	this.iv = iv;
	this.done = false;
    }

    _transform(chunk, encoding, cb) {
	if ( !this.done ) {
	    this.push(this.iv);
	    this.done = true;
	}
	this.push(chunk);
	cb();
    }
}

module.exports = AppendInitVect;
