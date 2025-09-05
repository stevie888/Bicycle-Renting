# Step 1: Use Node.js as base image
FROM node:20-alpine

# Step 2: Set working directory
WORKDIR /app

# Step 3: Copy package files
COPY package.json ./

# Step 4: Install dependencies
RUN npm ci

# Step 5: Copy the rest of the app
COPY . .

# Step 6: Build the Next.js app
RUN npm run build

# Step 7: Expose port
EXPOSE 3001

# Step 8: Start the app in production
CMD ["npm", "start"]
