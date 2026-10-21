
FROM mcr.microsoft.com/dotnet/sdk:10.0

WORKDIR /src

COPY . .

RUN dotnet restore GestionCurricular.sln

EXPOSE 8080

ENTRYPOINT ["dotnet", "run", "--project", "src/GestionCurricular.Api/GestionCurricular.Api.csproj", "--urls", "http://0.0.0.0:8080", "--no-launch-profile"]