# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Run with Docker

**Prerequisites:** Docker

1. Build the Docker image:
   `docker build -t questcraft .`
2. Run the Docker container:
   `docker run -p 8080:80 questcraft`
3. Open your browser and navigate to `http://localhost:8080`
