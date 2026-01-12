FROM node:20-alpine

# Instalamos dependencias necesarias para manipular PDFs si es necesario
# (Algunas librerías de firma requieren paquetes de sistema)
RUN apk add --no-network --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Por defecto corre la app, pero el compose puede sobrescribir esto para el worker
CMD ["npm", "start"]