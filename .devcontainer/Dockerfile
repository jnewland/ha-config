FROM homeassistant/home-assistant:2023.4.4@sha256:68bdeab203c2693b0e8f1a79f204a71cd39f1d117561cb3600216669d1bfc00f

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