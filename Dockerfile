FROM node:20-alpine

WORKDIR /usr/src/app

# Copy dependency files first
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy the rest of the source code
COPY . .

# Build the Next.js app
RUN yarn build

# Cloud Run will set PORT=8080
ENV PORT=8080

# Expose the port Cloud Run expects
EXPOSE 8080

# Start the app in production mode
CMD ["yarn", "start"]