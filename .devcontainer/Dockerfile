FROM homeassistant/home-assistant:2022.5.1@sha256:2af54889c24df8315629a03a35ee45159a4c7cc70386d6295305ece2c2d87968

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
