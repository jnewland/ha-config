FROM homeassistant/home-assistant:2022.6.3@sha256:780361e43c9f1321826070e937d8b8d1eea8857a56db3114651de7c8e9f57de5

RUN apk update && apk add --no-cache --update -q \
  musl libgcc libstdc++ shadow sudo colordiff git-diff-highlight git make sudo ca-certificates vim curl tzdata htop

ARG USER_UID=1000
ARG USER_GID=$USER_UID
ARG USERNAME=vscode
RUN groupadd --gid $USER_GID $USERNAME && \
  useradd -s /bin/bash --uid $USER_UID --gid $USERNAME -m $USERNAME && \
  mkdir -p /etc/sudoers.d && \
  echo $USERNAME ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/$USERNAME && \
  chmod 0440 /etc/sudoers.d/$USERNAME
