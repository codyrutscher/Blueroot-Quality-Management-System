# Supabase Setup Instructions

This guide will help you set up Supabase for real file storage and multi-user collaboration.

## 1. Create a Supabase Project

1. **Go to [supabase.com](https://supabase.com)** and sign up/login
2. **Click "New Project"**
3. **Choose your organization** (or create one)
4. **Fill in project details:**
   - Name: `BlueRoot QMS` (or whatever you prefer)
   - Database Password: Generate a strong password (save it!)
   - Region: Choose closest to your location
5. **Click "Create new project"**
6. **Wait for setup** (takes 1-2 minutes)

## 2. Get Your Project Credentials

1. **Go to Settings → API** in your Supabase dashboard
2. **Copy these values:**
   - `Project URL` (looks like: `https://abcdefgh.supabase.co`)
   - `anon public key` (looks like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## 3. Set Up Environment Variables

1. **Create `.env.local` file** in your project root:
   ```bash
   cp .env.local.example .env.local
   ```

2. **Edit `.env.local`** and add your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## 4. Set Up Database Schema

1. **Go to SQL Editor** in your Supabase dashboard
2. **Copy the contents** of `supabase-schema.sql`
3. **Paste into SQL Editor** and click "Run"
4. **Verify tables created:** Go to Table Editor, you should see:
   - `suppliers` table with all your supplier data
   - `supplier_documents` table (empty for now)

## 5. Set Up Storage Bucket

1. **Go to Storage** in your Supabase dashboard
2. **Click "New Bucket"**
3. **Create bucket:**
   - Name: `supplier-documents`
   - Public: `false` (for security)
   - File size limit: `50MB` (or your preference)
4. **Click "Create Bucket"**

## 6. Configure Storage Policies (Optional)

For basic functionality, you can start without policies. For production, add these policies:

```sql
-- Allow anyone to upload files
CREATE POLICY "Anyone can upload supplier documents" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'supplier-documents');

-- Allow anyone to download files
CREATE POLICY "Anyone can download supplier documents" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'supplier-documents');
```

## 7. Test the Setup

1. **Restart your dev server:**
   ```bash
   npm run dev
   ```

2. **Check the console** for any connection errors
3. **Go to Suppliers page** - should load from Supabase
4. **Upload a document** - should store in Supabase Storage
5. **Download the document** - should retrieve from Supabase

## 8. Verify Everything Works

### Suppliers Loading:
- ✅ Suppliers should load from Supabase database
- ✅ CSV fallback should work if Supabase is down
- ✅ Search and filtering should work

### Document Upload:
- ✅ Files should upload to Supabase Storage
- ✅ Metadata should save to `supplier_documents` table
- ✅ Should show file size limits (50MB)

### Document Download:
- ✅ Should download actual files from Supabase
- ✅ Should preserve original file names and types
- ✅ Should work across different browsers/devices

### Multi-User:
- ✅ Documents uploaded by one user should be visible to others
- ✅ Real-time updates when new documents are added
- ✅ Persistent storage across browser sessions

## Troubleshooting

### Connection Issues:
- Check `.env.local` has correct URL and key
- Verify Supabase project is active
- Check browser console for error messages

### Upload Issues:
- Verify storage bucket exists and is named `supplier-documents`
- Check file size limits
- Ensure storage policies allow uploads

### Database Issues:
- Run the SQL schema again if tables are missing
- Check Table Editor to verify data exists
- Look at database logs in Supabase dashboard

## Production Considerations

For production deployment:

1. **Enable Row Level Security** (RLS)
2. **Add user authentication** 
3. **Set up proper storage policies**
4. **Configure CORS** for your domain
5. **Monitor usage** and upgrade plan if needed

## Support

- **Supabase Docs:** https://supabase.com/docs
- **Discord Community:** https://discord.supabase.com
- **GitHub Issues:** https://github.com/supabase/supabase/issues

Your supplier document management system is now powered by Supabase! 🚀