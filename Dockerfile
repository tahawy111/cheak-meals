FROM node:20.18

# Install necessary dependencies
RUN apt-get update && apt-get install -y \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxrandr2 \
    libxi6 \
    libatk1.0-0 \
    libcups2 \
    libpangocairo-1.0-0 \
    libxdamage1 \
    libgbm1 \
    libasound2 \
    libatspi2.0-0 \
    libgtk-3-0 \
    fonts-liberation \
    libfontconfig1 \
    --no-install-recommends && \
    apt-get clean && rm -rf /var/lib/apt/lists/*



WORKDIR /app


COPY package.json .

RUN npm install
COPY src /app/src
COPY . .

CMD [ "npm", "start" ]