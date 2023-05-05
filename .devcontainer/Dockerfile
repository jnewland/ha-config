FROM homeassistant/home-assistant:2023.5.1@sha256:fc2d1d28f9e1ae317b50f293ce36dd37e36a0302c7a5adf7e8500f137ff0f93e

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