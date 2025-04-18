# Use a Node.js base image
FROM node:16

# Set the working directory in the container
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json .
RUN npm install

# Copy the project files
COPY . .

# Expose the application port
EXPOSE 3000

# Run the app
CMD ["npm", "start"]