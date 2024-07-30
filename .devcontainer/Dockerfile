FROM homeassistant/home-assistant:2024.7.4@sha256:82c37d50571cd163fc762fdd4ff5f564044af07931e7844f01c8c196dc735a0d

ARG ENABLE_NONROOT_DOCKER="true"
ARG INSTALL_ZSH="true"
ARG USERNAME="vscode"
ARG USER_UID=1000
ARG USER_GID=$USER_UID
COPY library-scripts/*.sh /tmp/library-scripts/
RUN apk update && ash /tmp/library-scripts/common-alpine.sh "${INSTALL_ZSH}" "${USERNAME}" "${USER_UID}" "${USER_GID}" \
    && /bin/bash /tmp/library-scripts/docker-alpine.sh "${ENABLE_NONROOT_DOCKER}" "/var/run/docker-host.sock" "/var/run/docker.sock" "${USERNAME}" \
    && rm -rf /tmp/library-scripts

RUN apk update && apk add --no-cache --update -q \
  musl \
  libgcc \
  libstdc++ \
  shadow \
  sudo \
  colordiff \
  git-diff-highlight \
  git \
  make \
  sudo \
  ca-certificates \
  vim \
  curl \
  tzdata \
  htop \
  ;

ENTRYPOINT [ "/usr/local/share/docker-init.sh" ]
CMD [ "sleep", "infinity" ]