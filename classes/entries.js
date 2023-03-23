let Entry = require('./entry');

class Entries{

    constructor(entries){
        this.entries = [];
        entries.forEach(entry => {
            this.entries.push(new Entry.Entry(entry));
        });
    }
}

module.exports= {
    Entries:Entries
};