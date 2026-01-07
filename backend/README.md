# HTML to PDF Signer Fastify REST API - Backend

This is the backend component of the HTML to PDF Signer Fastify REST API project. It provides a RESTful API for converting HTML content to PDF and digitally signing the generated PDFs using asynchronous job processing with BullMQ and Redis.

## Features

- Convert HTML to PDF
- Digitally sign PDFs
- Asynchronous job processing with BullMQ
- RESTful API built with Fastify (Note: The provided test file uses NestJS, but the project is described as Fastify-based; please verify framework consistency)
- Error handling for invalid inputs and system failures

## Architecture

### Overview
The backend is structured as a microservice architecture using Node.js with Fastify for the web framework. It leverages BullMQ for job queuing to handle PDF generation and signing asynchronously, ensuring scalability and non-blocking operations.

### Components
- **API Layer**: Handles incoming HTTP requests via Fastify routes. Validates input data (e.g., base64-encoded HTML or PDF).
- **Service Layer**: Contains business logic, such as the SignerService for enqueuing sign jobs.
- **Queue Layer**: Uses BullMQ with Redis to manage background jobs for PDF processing.
- **Worker Layer**: Processes queued jobs, performing HTML to PDF conversion and digital signing.

### Data Flow
1. Client sends a POST request with HTML content (base64-encoded) to `/sign` endpoint.
2. API validates the input and enqueues a job in BullMQ.
3. Worker picks up the job, converts HTML to PDF, applies digital signature, and stores the result.
4. Client can poll for job status or retrieve the signed PDF via another endpoint.

### Technologies
- Node.js
- Fastify
- BullMQ
- Redis
- PDF libraries (e.g., Puppeteer for HTML to PDF, pdf-lib for signing)

## Installation

1. Clone the repository.
2. Navigate to the backend directory: `cd backend`
3. Install dependencies: `npm install`
4. Set up Redis server.
5. Configure environment variables (e.g., Redis connection, signing certificates).
6. Run the application: `npm start`

## API Endpoints

- `POST /enqueue-sign`: Enqueue a PDF signing job. Body: `{ "data": "base64-encoded-pdf" }`. Returns: `{ "jobId": "123", "status": "queued" }`

## Testing

Run tests with: `npm test`

The test suite includes unit tests for the SignerService, covering job enqueuing, validation, and error handling.

## Contributing

Please follow standard practices for code quality and submit pull requests for review.