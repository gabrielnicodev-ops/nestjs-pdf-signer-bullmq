# 🖋️ PDF Digital Signer (Monorepo)

An enterprise-grade solution for digital PDF signing using an asynchronous architecture.

## 🏗️ Architecture & Decisions
- **NestJS (Backend):** Selected for its robust dependency injection and modularity.
- **BullMQ + Redis (Upstash):** Implementation of an asynchronous task queue. This ensures the API remains responsive even during heavy PDF processing or high-latency digital signing operations.
- **Vite (Frontend):** Fast, modern developer experience for the client-side.
- **Digital Signing:** Uses `pdf-lib` for document manipulation and `node-signpdf` for PKCS#7 signature injection.

## 🛠️ Tech Stack
- **Backend:** Node.js, NestJS, BullMQ, TypeScript.
- **Infrastructure:** Redis (Cloud via Upstash), TLS/SSL Connectivity.
- **Security:** RSA 4096-bit self-signed certificates for testing.

## 🚦 Getting Started
1. **Clone the repo:** `git clone ...`
2. **Backend Setup:** - `cd backend && npm install`
   - Configure `.env` with your `REDIS_URL`.
   - Run `npm run keys:generate` to create local certificates.
3. **Frontend Setup:**
   - `cd frontend && npm install`
4. **Run:** `npm run start:dev` (in both directories).
