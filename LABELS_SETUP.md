# Labels Setup Guide

This guide explains how to set up the labels system using Supabase storage.

## Prerequisites

1. Supabase project with storage enabled
2. Environment variables configured:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

## Setup Steps

### 1. Create the Labels Table

Run the SQL commands in `supabase-labels-schema.sql` in your Supabase SQL editor:

```sql
-- This will create the labels table and necessary indexes
```

### 2. Upload Existing Labels

If you have existing labels in the `templates/LABEL PRINTER PROOFS` directory, run:

```bash
npm run upload-labels
```

This will:
- Upload all PDF files to Supabase storage under the `documents/labels/` path
- Create database records for each label with metadata
- Extract product SKUs from filenames where possible

### 3. Verify Setup

1. Check Supabase storage bucket `documents` for uploaded files
2. Check the `labels` table for records
3. Test the Labels section in the application

## File Organization

Labels are organized in Supabase storage as:
```
documents/
  labels/
    {company}/
      {filename}.pdf
```

## Database Schema

The `labels` table contains:
- `id`: UUID primary key
- `filename`: Original filename
- `company`: Company name (extracted from folder structure)
- `product_sku`: Product SKU (extracted from filename)
- `storage_path`: Path in Supabase storage
- `file_size`: File size in bytes
- `uploaded_at`: Original file modification date
- `created_at`: Record creation timestamp

## API Endpoints

- `GET /api/labels` - List all labels
- `GET /api/labels/download?path={storage_path}` - Download a label
- `GET /api/products/{sku}/labels` - Get labels for a specific product

## Features

- Labels are automatically linked to products based on SKU matching
- Most recent label for each product is highlighted
- Labels can be downloaded directly from the interface
- Full-text search across filenames and companies
- Filter by company