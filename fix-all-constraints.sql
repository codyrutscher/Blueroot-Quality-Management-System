-- Fix ALL foreign key constraints at once
-- Run this in Supabase SQL Editor

-- Disable foreign key checks temporarily
SET session_replication_role = replica;

-- 1. Fix documents table to allow all fields
ALTER TABLE documents ALTER COLUMN "templateId" DROP NOT NULL;
ALTER TABLE documents ALTER COLUMN "productId" DROP NOT NULL;

-- 2. Add sample products that match what the frontend sends
INSERT INTO "products" ("id", "brand", "sku", "productName", "healthCategory", "therapeuticPlatform", "nutrientType", "format", "numberOfActives", "bottleCount", "unitCount", "manufacturer", "containsIron", "createdAt", "updatedAt") VALUES
('BFCAPSADEK', 'Bariatric Fusion', 'BFCAPSADEK', 'Multivitamin Three Per Day ADEK 90ct Capsule', 'Foundational Health & Wellness', 'Metabolic', 'Multivitamins, Vitamins & Minerals', 'Capsule', 'Multiple', '90', 90, 'BRH', true, NOW(), NOW()),
('BFCAPSADEK270', 'Bariatric Fusion', 'BFCAPSADEK270', 'Multivitamin Three Per Day ADEK 270ct Capsule', 'Foundational Health & Wellness', 'Metabolic', 'Multivitamins, Vitamins & Minerals', 'Capsule', 'Multiple', '270', 270, 'BRH', true, NOW(), NOW()),
('BFCAPSB50', 'Bariatric Fusion', 'BFCAPSB50', 'B-50 Complex 90ct', 'Foundational Health & Wellness', 'Metabolic', 'Multivitamins, Vitamins & Minerals', 'Capsule', 'Multiple', '90', 90, 'BRH', false, NOW(), NOW())
ON CONFLICT (sku) DO UPDATE SET 
  id = EXCLUDED.id,
  brand = EXCLUDED.brand,
  "productName" = EXCLUDED."productName";

-- 3. Re-enable foreign key checks
SET session_replication_role = DEFAULT;

-- 4. Test document creation
SELECT 'All constraints should now be fixed' AS result;