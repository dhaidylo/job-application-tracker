# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

# Copy and restore dependencies first
COPY JobTracker.Api/*.csproj ./JobTracker.Api/
RUN dotnet restore ./JobTracker.Api/JobTracker.Api.csproj

# Copy everything and build
COPY . .
RUN dotnet publish ./JobTracker.Api/JobTracker.Api.csproj -c Release -o /out

# Runtime stage — smaller image, no SDK
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /out .

ENTRYPOINT ["dotnet", "JobTracker.Api.dll"]