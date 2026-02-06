FROM node:16

WORKDIR /app

# Set proxy environment variables
ENV HTTP_PROXY="http://172.31.2.4:8080"
ENV HTTPS_PROXY="http://172.31.2.4:8080"
ENV NO_PROXY="localhost,127.0.0.1"

RUN echo 'Acquire::http::Proxy "http://172.31.2.4:8080";' > /etc/apt/apt.conf.d/90proxy
RUN echo 'Acquire::https::Proxy "http://172.31.2.4:8080";' >> /etc/apt/apt.conf.d/90proxy

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# RUN npm install --proxy http://172.31.2.4:8080
RUN npm install  
RUN apt-get update
RUN apt-get install sudo

RUN apt-get install -y python3 python3-pip && \
    pip3 install requests 

RUN apt-get install -y arping && \
    apt-get install -y net-tools&&\
    apt-get install -y nmap && \
    apt-get install -y psmisc && \
    apt-get install -y dsniff

USER root     
COPY final_test/requirements.txt .
RUN pip3 install -r requirements.txt

# Bundle app source
COPY . .

EXPOSE 8000

CMD [ "npm", "start" ]