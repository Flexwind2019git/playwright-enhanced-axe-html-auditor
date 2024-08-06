FROM mcr.microsoft.com/playwright:v1.45.1-jammy

# Install dependencies
# RUN apt-get update && apt-get install -y \
#  build-essential \
#  libnss3-dev \
#  libx11-dev \
#  fonts-liberation

# Install Playwright and axe
# RUN npm install @axe-core/playwright axe-html-reporter
COPY node_modules /app/node_modules
COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json   
# Copy user.json
# COPY user.json /app/user.json

# Copy script
COPY enhanceHtmlReport.js /app/enhanceHtmlReport.js
COPY script.js /app/script.js

# Working directory
WORKDIR /app
RUN mkdir /app/reports

# Entrypoint
ENTRYPOINT ["node", "script.js"]
