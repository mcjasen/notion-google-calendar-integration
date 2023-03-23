require('dotenv').config();
const Notion = require('./classes/notionAPI');
const Calendar = require('./classes/googleCalendarAPI');
const { config } = require('dotenv');

const intervalTime = process.env.TIME_TO_WAIT_TO_START_SYNC;

const modus = "PROD"; 
// const modus = "TEST"; 

setInterval(function(){
    
    const calendarCredentials = JSON.parse(process.env.CREDENTIALS);
    const notionKey = process.env.NOTION_KEY;

    const values = JSON.parse(process.env.VALUES)[modus];
    const calendarIds = values.CALENDAR_IDs;
    const notionDatabaseId = values.NOTION_DATABASE_ID;
    const configs = values.CONFIGS;

    configs.forEach(config => {
        const notion = new Notion.Notion(notionKey, notionDatabaseId, config);
        notion.getEntries()
        .then(entries =>{
            const calendar = new Calendar.Calendar(calendarCredentials, config, entries, calendarIds);
            calendar.insertEvents();
        });
    })
},intervalTime);