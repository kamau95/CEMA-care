#Use the official Node.js image from the Docker Hub
FROM node:23-slim

#the current working directory in the docker container
WORKDIR /app

# Copy root package.json and lock file
COPY package*.json ./

#Install dependencies
RUN npm install

#copying server source code
COPY server/ .

#expose port 3000
EXPOSE 3000

#start your app
CMD ["node", "app.js"]
