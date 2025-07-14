FROM python:3.9-slim

# Set working directory in the container
WORKDIR /app

# Copy application files to the container
COPY . .

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
CMD ["python", "-m", "http.server", "8000"]
