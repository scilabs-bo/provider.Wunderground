FROM node:10.16.3

LABEL maintainer="Fabian Bäumer <fabian.baeumer@rub.de>"

# Prepare environment
RUN mkdir /usr/src/app
WORKDIR /usr/src/app
ENV PATH /usr/src/app/node_modules/.bin:$PATH

# Install dependencies
COPY package.json /usr/src/app/package.json
RUN npm install

# Copy source files and build project
COPY . /usr/src/app
RUN npm run build

# Set node environment to production
ENV NODE_ENV=production

EXPOSE 3000
USER 999:999
ENTRYPOINT [ "node", "." ]