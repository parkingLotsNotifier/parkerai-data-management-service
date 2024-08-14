# Use an official Node.js runtime as a parent image
FROM node:16

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Create a non-root user
RUN useradd -m nodeuser

# Copy the rest of the application code
COPY . .

# Change ownership of the working directory to the non-root user
RUN chown -R nodeuser:nodeuser /usr/src/app

# Switch to non-root user
USER nodeuser

# Expose the port the app runs on
EXPOSE 3003

# Command to run the application
CMD ["node", "dataManagementService.js"]
