const Entry = require('./entry');

class Event{

    constructor(element, config){
        if('Entry' === element.constructor.name){
            // neues Event erstellen
            this.event = this.getEvent(element, config);
        } else{
            // in Google Kalender existierendes Event erstellen
            this.event = element;
            this.event['notionID'] = this.getId();
            this.event['deletable'] = true;
        }
    };

    getEvent(element, config){
        let event = {
            'summary': element.getTitle(),
            'description': element.getURL(),
        };
        if(config.group_by === "fällig"){
            event['start'] = element.getEnd();
            event['end'] = element.getEnd(1);
        } else if(config.group_by === "start"){
            event['start'] = element.getStart();
            event['end'] = element.getStart(1);
        }
        return event; 
    }

    async insert(auth, calendarId, calendar){
        try {
            let request = {
                auth: auth,
                calendarId: calendarId,
                resource: this.event
            };
            
            let response = await calendar.events.insert(request);
        
            if (response['status'] == 200 && response['statusText'] === 'OK') {
                return 1;
            } else {
                return 0;
            }
        } catch (error) {
            console.log(`Error at insert --> ${error}`);
            return 0;
        }
    };

    async delete(auth, calendarId, calendar){
        try {
            let response = await calendar.events.delete({
                auth: auth,
                calendarId: calendarId,
                eventId: this.event.id
            });
    
            if (response.data === '') {
                return 1;
            } else {
                return 0;
            }
        } catch (error) {
            console.log(`Error at delete --> ${error} for event ${this.event.summary}`);
            return 0;
        }
    };

    exists(existingEvents){
        let entryId = this.getId();
        let res = null;
        existingEvents.forEach(existingEvent => {
            if(existingEvent.event.notionID === entryId){
                res = existingEvent;
            }
        });
        return res;
    };

    changed(existingEvent){
        if(this.titleChanged(existingEvent) || this.descriptionChanged(existingEvent) || this.dateChanged(existingEvent)){
            return true;
        }
        else return false;
    };

    titleChanged(existingEvent){
        return this.event.summary !== existingEvent.event.summary;
    };

    descriptionChanged(existingEvent){
        return this.event.description !== existingEvent.event.description;
    };

    dateChanged(existingEvent){
        if(this.event.start.date){
            return this.event.start.date !== existingEvent.event.start.date || this.event.end.date !== existingEvent.event.end.date;
        }
        else if(this.event.start.dateTime){
            return this.event.start.dateTime !== existingEvent.event.start.dateTime || this.event.end.dateTime !== existingEvent.event.end.dateTime;
        }
    };

    getId(){
        let id = null; 
        if(this.event.description){
            let url = this.event.description;
            let index = url.lastIndexOf('-');
            id = url.slice(index + 1);
        }
        return id;
    };

}

module.exports={
    Event:Event
};