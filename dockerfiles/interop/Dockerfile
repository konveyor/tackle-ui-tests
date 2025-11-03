FROM docker.io/cypress/included:13.13.3

# point Cypress at the /tmp/cache no matter what user account is used
# see https://on.cypress.io/caching
ENV CYPRESS_CACHE_FOLDER=/tmp/.cache/Cypress
ENV npm_config_cache=/tmp/.cache/npm

# Install curl and yq
RUN apt-get update && \
    apt-get install -y curl && \
    # Get the architecture (amd64 or arm64) and install yq
    ARCH=$(dpkg --print-architecture) && \
    curl -L "https://github.com/mikefarah/yq/releases/latest/download/yq_linux_${ARCH}" -o /usr/bin/yq && \
    chmod +x /usr/bin/yq && \
    # Clean up
    rm -rf /var/lib/apt/lists/*

RUN mkdir /tmp/tackle-ui-tests
WORKDIR /tmp/tackle-ui-tests
COPY . .
RUN npm install .
RUN cypress install

# Set required permissions for OpenShift usage
RUN chgrp -R 0 /tmp && \
    chmod -R g=u /tmp

ENTRYPOINT ["/bin/bash"]
