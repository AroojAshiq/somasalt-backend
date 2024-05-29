FROM node:16.16.0-slim

WORKDIR /app

COPY . .

WORKDIR /app/
RUN npm install yarn
RUN yarn install

EXPOSE 8000

CMD ["yarn","start"]