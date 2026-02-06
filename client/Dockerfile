FROM node:16

WORKDIR /app

# Set proxy environment variables
ENV HTTP_PROXY="http://172.31.2.4:8080"
ENV HTTPS_PROXY="http://172.31.2.4:8080"
ENV NO_PROXY="localhost,127.0.0.1"

RUN echo 'Acquire::http::Proxy "http://172.31.2.4:8080";' > /etc/apt/apt.conf.d/90proxy
RUN echo 'Acquire::https::Proxy "http://172.31.2.4:8080";' >> /etc/apt/apt.conf.d/90proxy
COPY package*.json ./

# RUN npm install --proxy http://172.31.2.4:8080 
RUN npm install
RUN mkdir -p node_modules/.cache && chmod -R 777 node_modules/.cache
RUN apt-get update
RUN apt-get install sudo
USER root
COPY . .

EXPOSE 3000

CMD [ "npm", "start" ]
