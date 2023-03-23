const {Client} = require("@notionhq/client");
const Entries = require('./entries');

class Notion{

    constructor(key, databseId, config){
        this.notion = new Client({ auth: key });
        this.databseId = databseId;
        this.config = config; 
    }
    
    // Notion get Entries
    async getEntries(){
        const response = await this.notion.databases.query({
            database_id: this.databseId,
            filter : this.getFilter(),
            sorts:[
                {
                    property: "Fällig",
                    direction: "ascending",
                },
            ],
        });
        let entries = new Entries.Entries(response.results);
        return entries;
    };

    getTodayOneMonthAgo(){
        let date = new Date(); 
        date.setMonth(date.getMonth() - 1); 

        var dd = String(date.getDate()).padStart(2, '0');
        var mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = date.getFullYear();

        date = `${yyyy}-${mm}-${dd}`;
        return date; 
    };

    getFilter(){
        let filter = {
            and: [
                {
                    "property": "Erledigt",
                    "checkbox": {
                        "equals" : false
                    }
                },
                {
                    "property": "Kanban - Status",
                    "select": {
                        "does_not_equal" : "Done"
                    }
                }
            ]
        }
        
        if(this.config.calendar_type === "Privat"){
            filter['and'].push(this.getFilterForPrivatTasks());
        }
        else if(this.config.calendar_type === "Uni"){
            filter['and'].push(this.getFilterForUniTasks());
        } 
        else {
            console.log(`Error at getFilter --> filter not found`);
            return null; 
        }

        if(this.config.group_by === "start"){
            filter['and'].push(this.getFilterForGroupedByStart());
        }
        else if(this.config.group_by === "fällig"){
            filter['and'].push(this.getFilterForGroupedByFaellig());
        }
        else{
            console.log(`Error at getFilter --> groupBy not found`);
            return null; 
        }
        return filter; 
    }

    getFilterForPrivatTasks(){
        return {
                    "property": "Fach (Uni)",
                    "select": {
                        "is_empty" : true
                    }
                };
    };

    getFilterForUniTasks(){
        return {
                    "property": "Fach (Uni)",
                    "select": {
                        "is_not_empty" : true
                    }
                };
    };

    getFilterForGroupedByStart(){
        return {
                    "property": "Start",
                    "date":{
                        "after": this.getTodayOneMonthAgo()
                    },
                };
    };

    getFilterForGroupedByFaellig(){
        return {
                    "property": "Fällig",
                    "date":{
                        "after": this.getTodayOneMonthAgo()
                    },
                };
    }

}

module.exports={
    Notion:Notion
};