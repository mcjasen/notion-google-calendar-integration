FROM node:16
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
ENV TZ=Europe/Berlin
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
COPY . .
CMD ["node", "index.js" ]