const {google} = require('googleapis');
const Event = require('./event');

class Calendar{

    constructor(credentials, config, entries, calendarIds){
        this.credentials = credentials;
        this.config = config;
        this.calendarId = this.getCalendarId(calendarIds);
        this.scopes = 'https://www.googleapis.com/auth/calendar';
        this.calendar = google.calendar({version : "v3"});
        this.auth = new google.auth.JWT(
            credentials.client_email,
            null,
            credentials.private_key,
            this.scopes
        );

        this.events = [];
        entries.entries.forEach(entry => {
            this.events.push(new Event.Event(entry, config));
        });

        this.existingEvents = [];
    };

    getCalendarId(calendarIds){
        return calendarIds[this.config.calendar_type][this.config.group_by];
    };

    insertEvents(){
        this.getExisitingEvents()
        .then(() => {
            this.events.forEach(event => {
                let existingEvent = event.exists(this.existingEvents);
                if(existingEvent === null){
                    event.insert(this.auth, this.calendarId, this.calendar)
                    .then(() => console.log(`Eintrag '${event.event.summary}' erstellt`));
                } else{
                    this.markEventAsnotDeletable(existingEvent);
                    if(event.changed(existingEvent)) {
                        this.replaceEvent(existingEvent, event);
                    }
                }
            });
            this.deleteAllDeletableEvents();
        })
    };

    async replaceEvent(oldEvent, newEvent){
        oldEvent.delete(this.auth, this.calendarId, this.calendar)
        .then((res) => {
            if(res === 1){
                newEvent.insert(this.auth, this.calendarId, this.calendar)
                .then(() => {
                    console.log(`Eintrag '${oldEvent.event.summary}' angepasst`);
                });
            }
        });
    };

    async getExisitingEvents(){
        try {
            let response = await this.calendar.events.list({
                auth: this.auth,
                calendarId: this.calendarId,
                timeZone: 'Europe/Berlin'
            });

            let results = response['data']['items'];
            for (let i = 0; i < results.length; i++) {
                this.existingEvents.push(new Event.Event(results[i], this.config));
            }

        } catch (error) {
            console.log(`Error at getExisitingEvents --> ${error}`);
            return 0;
        }
    };

    markEventAsnotDeletable(event){
        for (let i = 0; i < this.existingEvents.length; i++) {
            let existingEvent = this.existingEvents[i];
            if(existingEvent.event.id === event.event.id){
                this.existingEvents[i].event.deletable = false;
            }        
        }
    };

    deleteAllDeletableEvents(){
        this.existingEvents.forEach(existingEvent =>{
            if(existingEvent.event.deletable){
                existingEvent.delete(this.auth, this.calendarId, this.calendar)
                .then(() => console.log(`Eintrag '${existingEvent.event.summary}' gelöscht`));
            }            
        })
    };

}

module.exports={
    Calendar:Calendar
};