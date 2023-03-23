# notion-google-calendar-integration
Synchronization of Notion task with Google Calendar


JavaScript script that synchronizes [notion](https://www.notion.so/) tasks with Google Calendar. The script can be executed with [Node.js](https://nodejs.org/en) and can be deployed in a [Docker](https://www.docker.com/) container.

## Project setup
```
docker build -t image .
docker run -it image
```

To get access to your notion database, create a secret at the official [notion API website](https://developers.notion.com/). Specify your database ID and the secret in the *.env* file. Besides, you need access to a Google Calendar, with which the Notion tasks are synchronized. To do this, you need to [create a service account](https://neal.codes/blog/google-calendar-api-on-g-suite/). Then you need to specify the JSON key in the *.env* file. 