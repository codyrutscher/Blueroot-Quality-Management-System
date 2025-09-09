-- Fix documents table ID generation
-- Run this in Supabase SQL Editor

-- Check if the documents table has proper UUID default
ALTER TABLE documents ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Or if using CUID, ensure it has a default
-- ALTER TABLE documents ALTER COLUMN id SET DEFAULT concat('doc_', replace(gen_random_uuid()::text, '-', ''));

-- Make sure the table exists with proper constraints
CREATE TABLE IF NOT EXISTS documents (
  id text PRIMARY KEY DEFAULT concat('doc_', replace(gen_random_uuid()::text, '-', '')),
  title text NOT NULL,
  filename text NOT NULL,
  filepath text NOT NULL,
  mimetype text NOT NULL,
  size integer NOT NULL,
  content text,
  summary text,
  status text DEFAULT 'PROCESSING',
  category text DEFAULT 'GENERAL',
  tags text[] DEFAULT '{}',
  "templateId" text,
  "productId" text,
  "workflowStatus" text DEFAULT 'DRAFT',
  version integer DEFAULT 1,
  "isLatest" boolean DEFAULT true,
  "parentDocumentId" text,
  "createdAt" timestamp with time zone DEFAULT now(),
  "updatedAt" timestamp with time zone DEFAULT now(),
  "userId" text NOT NULL
);