FROM node
WORKDIR /usr/app
COPY package.json package.json
RUN yarn install
COPY . .
CMD [ "node", "." ]