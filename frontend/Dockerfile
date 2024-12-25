FROM node:20.1.0-alpine3.16

WORKDIR /4ovisionannotator/frontend

COPY . /4ovisionannotator/frontend
COPY package.json package-lock.json ./
RUN npm install

CMD ["npm", "start"]