FROM homeassistant/home-assistant:2022.7.0@sha256:586c25ec256bc3a7572ec1451d0cf4bdb76ce844a3cc5d5acdf9d019cbd7e243

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
