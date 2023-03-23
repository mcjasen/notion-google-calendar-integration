class Entry{

    constructor(entry){
        this.entry = entry;
        if(this.entry.properties.Start) this.entry.properties.Start.date['fullDayEvent'] = this.isFullDayEvent(this.entry.properties.Start.date);
        if(this.entry.properties.Fällig) this.entry.properties.Fällig.date['fullDayEvent'] = this.isFullDayEvent(this.entry.properties.Fällig.date)
    }

    getTitle(){
        let icon = this.getIcon();
        return icon + this.entry.properties.Aufgabe.title[0].plain_text;
    };

    getIcon(){
        if(this.entry.icon){
            return this.entry.icon.emoji + " ";
        } else {
            return ""; 
        }

    };
    
    getStart(addDays = 0){
        var start = null;
        var fullDayEvent = false;
        if(this.entry.properties.Start){
            var start = this.entry.properties.Start.date.start;
            fullDayEvent = this.entry.properties.Start.date.fullDayEvent;
            var startDate = new Date(start);
            if(fullDayEvent) startDate.setDate(startDate.getDate() + addDays);
        }
        return this.getDate(startDate, fullDayEvent);
    };
    
    getEnd(addDays = 0){
        var end = this.entry.properties.Fällig.date.start;
        var fullDayEvent = this.entry.properties.Fällig.date.fullDayEvent;
        var endDate = new Date(end);
        if(fullDayEvent) endDate.setDate(endDate.getDate() + addDays);
        return this.getDate(endDate, fullDayEvent);
    };
    
    getURL(){
        return this.entry.url;
    };
    
    getDate(date, fullDayEvent){
        let res = {};
        if(fullDayEvent) { // prüfen, ob Datum Uhrzeit enthält
            res = 
                {
                    'date': this.dateToString(date),
                    'timeZone': 'Europe/Berlin'
                }
        } else{
            res = 
                {
                    'dateTime': this.dateTimeToString(date),
                    'timeZone': 'Europe/Berlin'
                }
        }
        return res;
    };

    isFullDayEvent(date){
        if(date.start.includes("T")){
            return false;
        } else {
            return true;
        }
    };

    dateToString(date){
        var YYYY = date.getFullYear();
        var MM = date.getMonth() + 1;
        var DD = date.getDate();

        MM = MM < 10 ? '0' + MM : MM; 
        DD = DD < 10 ? '0' + DD : DD;

        return `${YYYY}-${MM}-${DD}`;
    };

    dateTimeToString(date){
        var YYYY = date.getFullYear();
        var MM = date.getMonth() + 1;
        var DD = date.getDate();
        var hh = date.getHours();
        var mm = date.getMinutes();
        var ss = date.getSeconds();
        var TZD = this.getTimezoneOffset(date);

        MM = MM < 10 ? '0' + MM : MM; 
        DD = DD < 10 ? '0' + DD : DD;
        hh = hh < 10 ? '0' + hh : hh;
        mm = mm < 10 ? '0' + mm : mm;
        ss = ss < 10 ? '0' + ss : ss;         

        return `${YYYY}-${MM}-${DD}T${hh}:${mm}:${ss}${TZD}`;
    };

    getTimezoneOffset(date){
        var timezone_offset_min = date.getTimezoneOffset();
        var offset_hrs = parseInt(Math.abs(timezone_offset_min)/60);
        var offset_min = Math.abs(timezone_offset_min%60);
        var timezone_standard;

        if(offset_hrs < 10) offset_hrs = '0' + offset_hrs;
        if(offset_min < 10) offset_min = '0' + offset_min;

        if(timezone_offset_min < 0) timezone_standard = `+${offset_hrs}:${offset_min}`;
        if(timezone_offset_min > 0) timezone_standard = `-${offset_hrs}:${offset_min}`;
        else if(timezone_offset_min === 0) timezone_standard = 'Z';

        return timezone_standard;
    }
}

module.exports={
    Entry:Entry
};