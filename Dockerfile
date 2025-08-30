#This comman below uses node.js with yarn, nextjs is built on this node.js
FROM node:20-alpine 

#Setting working directory,i am using /usr/src/app because this is the source code of the app.
#And to avoi cluttering of root directory.
WORKDIR /usr/src/app

# Copying dependency files first
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copying all source code including build/contracts
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Starting the app in dev mode (for production,I will use yarn build && yarn start)
CMD ["yarn", "dev"]




