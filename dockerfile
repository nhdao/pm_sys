FROM node:16
EXPOSE 9000
WORKDIR /src
COPY package.json package-lock.json ./
RUN npm install 
COPY . . 
CMD ["npm", "run", "start:dev"]
