# 1. Aşama: Build (Derleme)
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# csproj dosyasını kopyala ve paketleri geri yükle
COPY *.csproj ./
RUN dotnet restore

# Tüm backend kodlarını kopyala ve Release modunda derle
COPY . ./
RUN dotnet publish -c Release -o /app/publish

# 2. Aşama: Runtime (Çalıştırma)
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Render'ın dinamik PORT çevre değişkenini dinle
ENV ASPNETCORE_URLS=http://+:${PORT:-8080}

EXPOSE 8080
ENTRYPOINT ["dotnet", "backend.dll"]