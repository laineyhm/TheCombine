# Docker multi-stage build using bitnami/dotnet-sdk:6.0.408-debian-11-r4
FROM bitnami/dotnet-sdk@sha256:e64af4633cb93880622dbbb47a4503c10f16b7399eebdb451546c342b6b5f054 AS builder
WORKDIR /app

# Copy csproj and restore (fetch dependencies) as distinct layers.
COPY *.csproj ./
RUN dotnet restore

# Copy everything else and build.
COPY . ./
RUN dotnet publish -c Release -o build

# Build runtime image.  Using bitnami/aspnet-core:6.0.16-debian-11-r4
FROM bitnami/aspnet-core@sha256:d57dda30d7605a52fcb885ac938fe52fa301e845d19cb946ba14a6d886bdb614

ENV ASPNETCORE_URLS=http://+:5000
ENV COMBINE_IS_IN_CONTAINER=1
ENV ASPNETCORE_ENVIRONMENT=Production
ENV DOTNET_PRINT_TELEMETRY_MESSAGE=false

# Set the home directory to the app user's home.
ENV HOME=/home/app
ENV APP_HOME=${HOME}/backend
ENV APP_FILES=${HOME}/.CombineFiles

# Install system dependencies.
RUN apt-get update \
  && apt-get install -y \
  # icu.net dependency: libdl.so
  libc6-dev \
  && rm -rf /var/lib/apt/lists/*

# Create the home directory for the new app user.
RUN mkdir -p $HOME

# Create an app user so the program doesn't run as root.
RUN groupadd -r app && \
  useradd -r -g app -d $HOME -s /sbin/nologin -c "Docker image user" app

## Set up application install directory.
RUN mkdir $APP_HOME && \
  mkdir $APP_FILES && \
  # Give access to the entire home folder so the backend can create files and folders there.
  chown -R app:app $HOME
WORKDIR $APP_HOME

# Copy in the build application.
COPY --chown=app:app launch.sh ./
COPY --chown=app:app --from=builder /app/build ./

# Change to the app user.
USER app

ENTRYPOINT ["./launch.sh"]
