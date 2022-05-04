FROM homeassistant/home-assistant:2022.5.0@sha256:ad8d19b92e6046f45a12c78ea766a7c6f4e0e7432c0535a54f49bdc3c33ad98c

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
