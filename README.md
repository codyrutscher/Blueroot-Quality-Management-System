# Manufacturing Portal - AI-Powered Document Management

A Next.js application that provides AI-powered document management for manufacturing companies, featuring RAG (Retrieval-Augmented Generation) capabilities for intelligent document search and analysis.

## Features

- **AI-Powered Search**: Semantic search across manufacturing documents using OpenAI embeddings
- **Intelligent Chat**: Ask questions about your documents and get AI-generated responses
- **Document Upload**: Support for PDF, DOCX, and TXT files with automatic text extraction
- **Employee Authentication**: Secure login system for internal use
- **Document Categories**: Organize documents by type (Quality Manual, Procedures, Specifications, etc.)
- **Real-time Processing**: Documents are automatically processed and indexed for search

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: PostgreSQL with Prisma ORM
- **Vector Store**: Pinecone for embeddings storage
- **AI/ML**: OpenAI GPT-4 and text-embedding-ada-002
- **Authentication**: NextAuth.js
- **File Processing**: PDF-parse, Mammoth (for DOCX)

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Pinecone account
- OpenAI API key

## Environment Setup

1. Copy the environment example:
```bash
cp .env.example .env
```

2. Fill in your environment variables in `.env`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/intellect_clone?schema=public"
OPENAI_API_KEY="your-openai-api-key"
PINECONE_API_KEY="your-pinecone-api-key"
PINECONE_ENVIRONMENT="your-pinecone-environment"
PINECONE_INDEX_NAME="manufacturing-docs"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
JWT_SECRET="your-jwt-secret"
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

3. Create a Pinecone index:
   - Go to [Pinecone Console](https://app.pinecone.io/)
   - Create a new index named "manufacturing-docs"
   - Use dimensions: 1536 (for OpenAI embeddings)
   - Use cosine similarity

4. Seed the database with a demo user (optional):
```bash
npx prisma db seed
```

## Running the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Usage

### Login
- Use the demo credentials provided on the login page
- Or create your own user in the database

### Document Upload
1. Navigate to the "Upload Documents" tab
2. Drag and drop or select PDF, DOCX, or TXT files
3. Documents are automatically processed and indexed for AI search

### AI Search
1. Use the "AI Search" tab for semantic document search
2. Switch between "Document Search" and "AI Chat" modes
3. Ask questions about your manufacturing processes, procedures, and documentation

### Document Management
- View all uploaded documents in the "My Documents" tab
- Monitor processing status and document categories
- See file metadata and upload information

## API Endpoints

- `POST /api/documents/upload` - Upload and process documents
- `GET /api/documents` - List user documents
- `POST /api/search` - Search documents and generate AI responses
- `POST /api/auth/[...nextauth]` - Authentication endpoints

## Database Schema

The application uses the following main models:
- **User**: Employee information and roles
- **Document**: Uploaded file metadata and content
- **DocumentEmbedding**: Vector embeddings for search
- **SearchHistory**: Query logging and analytics

## Deployment

1. Set up a production PostgreSQL database
2. Configure Pinecone for production use
3. Set production environment variables
4. Deploy to your preferred platform (Vercel, AWS, etc.)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please contact your development team or create an issue in the repository.
