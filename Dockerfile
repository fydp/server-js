FROM ubuntu:14.04

# Replace shell with bash so we can source files
RUN rm /bin/sh && ln -s /bin/bash /bin/sh

#Install base dependencies
RUN apt-get update
RUN apt-get install -y -q --no-install-recommends \ 
        git \
        ca-certificates \
        curl \
        wget \
        npm \
    && rm -rf /var/lib/apt/lists/*

ENV NVM_DIR /usr/local/nvm
ENV NODE_VERSION 4.1.1

# Install nvm with node and npm
RUN curl -o- -k https://raw.githubusercontent.com/creationix/nvm/v0.28.0/install.sh | bash \
    && source $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default

ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH      $NVM_DIR/v$NODE_VERSION/bin:$PATH

ADD . /src
RUN cd /src; npm install

EXPOSE 3000

CMD cd /src && npm start
