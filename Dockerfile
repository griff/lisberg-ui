FROM heroku/cedar:14
# Replace shell with bash so we can source files
RUN rm /bin/sh && ln -s /bin/bash /bin/sh

# Set debconf to run non-interactively
RUN echo 'debconf debconf/frontend select Noninteractive' | debconf-set-selections

# Install base dependencies
RUN apt-get update && apt-get install -y -q --no-install-recommends \
        apt-transport-https \
        build-essential \
        ca-certificates \
        curl \
        git \
        libssl-dev \
        python \
        rsync \
        software-properties-common \
        wget \
        php5-cli \
    && rm -rf /var/lib/apt/lists/*

ENV NVM_DIR /usr/local/nvm
ENV NVM_VERSION 0.25.1
ENV NODE_VERSION 0.12.2

# Install nvm with node and npm
RUN curl https://raw.githubusercontent.com/creationix/nvm/v$NVM_VERSION/install.sh | bash \
    && source $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default

ENV NODE_PATH $NVM_DIR/versions/node/v$NODE_VERSION/lib/node_modules
ENV PATH      $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

RUN npm install -g grunt-cli
RUN curl https://bootstrap.pypa.io/get-pip.py | python

COPY package.json /app/package.json
COPY core/styleguide /app/public/styleguide
RUN mkdir -p /var/lib/gems && chown -R nobody /app /var/lib/gems /usr/local/bin /usr/local/lib/python2.7
USER nobody
ENV HOME /app

WORKDIR /app
RUN npm install
USER root
COPY . /app
RUN chown -R nobody /app
USER nobody
RUN npm run generate
CMD ["/bin/sh", "-c", "grunt serve"]
EXPOSE 9000