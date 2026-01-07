# HTML to PDF Signer Frontend

This is the frontend component of the HTML to PDF Signer Fastify REST API project. It provides a user interface for uploading HTML content, converting it to PDF, and digitally signing the generated PDFs through the backend API.

## Features

- Upload HTML content (as base64-encoded string or file)
- Convert HTML to PDF via backend API
- Digitally sign PDFs asynchronously
- Display job status and download signed PDFs
- Error handling for invalid inputs and API failures

## Architecture

### Overview
The frontend is a web application built with [React/Vue/Angular – specify based on your stack]. It communicates with the backend REST API to enqueue jobs and retrieve results.

### Components
- **Upload Form**: Allows users to input or upload HTML data.
- **Job Status Display**: Shows the progress of PDF generation and signing.
- **Download Section**: Provides links to download completed signed PDFs.
- **API Client**: Handles HTTP requests to the backend endpoints.

### Data Flow
1. User submits HTML content via the form.
2. Frontend sends a POST request to the backend's `/enqueue-sign` endpoint.
3. Backend enqueues the job and returns a jobId.
4. Frontend polls for job status or allows user to check manually.
5. Once complete, user can download the signed PDF.

### Technologies
- [React/Vue/Angular] for the UI framework
- Axios or Fetch for API calls
- HTML5 File API for uploads
- CSS/Bootstrap for styling

## Installation

1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Configure the backend API URL in environment variables (e.g., `REACT_APP_API_URL=http://localhost:3000`)
4. Run the development server: `npm start`

## Usage

- Open the app in a browser.
- Upload or paste HTML content.
- Submit to start the conversion and signing process.
- Monitor job status and download the result.

## Testing

Run tests with: `npm test`

## Contributing

Please follow standard practices for code quality and submit pull requests for review.