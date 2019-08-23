FROM node:8-alpine
COPY . /app
ENV NODE_ENV=production
WORKDIR /app
# RUN npm install
CMD [ "node", "." ]