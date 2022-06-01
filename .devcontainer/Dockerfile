FROM homeassistant/home-assistant:2022.6.0@sha256:fed8ce51af3e4b4d82fe5f19d19e7b4c1bfbccedc56f5448826d02aadbdaf61e

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
