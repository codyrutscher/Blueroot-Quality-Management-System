-- Add all missing templates that the frontend expects
-- Run this in Supabase SQL Editor

-- Delete existing templates to avoid conflicts
DELETE FROM templates;

-- Insert all templates with correct names and IDs
INSERT INTO "templates" ("id", "name", "description", "type", "content", "isActive", "createdBy", "createdAt", "updatedAt") VALUES
('tmpl-finished-goods', 'QA-004-02 Finished Product Specification Rev 05.docx', 'Standard finished product specification template', 'FINISHED_GOODS_SPEC', '{"productInfo":{"productName":"","sku":"","version":"1.0","effectiveDate":""},"specifications":{"appearance":"","color":"","odor":"","taste":"","physicalForm":""},"ingredients":[],"nutritionalInfo":{},"qualityTests":[],"packaging":{},"storage":{},"approvals":{}}', true, 'demo-user-id', NOW(), NOW()),

('tmpl-raw-material', 'Raw Material Spec Template.docx', 'Raw material specification template', 'RAW_MATERIAL_SPEC', '{"materialInfo":{"materialName":"","supplierName":"","lotNumber":"","receiptDate":""},"specifications":{"appearance":"","color":"","odor":"","moisture":"","purity":""},"tests":[],"storage":"","handling":"","approvals":{}}', true, 'demo-user-id', NOW(), NOW()),

('tmpl-psf', 'PSF TEMPLATE BRH.docx', 'Product Specification File template', 'PSF', '{"productSummary":{"sku":"","salesDescription":"","psfSubmittalDate":"","psfRevision":"","productType":"","brand":"","healthCategory":"","nutrientType":"","therapeuticPlatform":"","pilotRequired":"","intendedReleaseDate":""},"rawMaterials":"","blending":{"routing":""},"bulkBOM":{"items":[],"routing":""},"finishedBOM":{"items":[],"routing":""},"approvals":{}}', true, 'demo-user-id', NOW(), NOW()),

('tmpl-label-manuscript', 'Label Manuscript.docx', 'Label manuscript template', 'LABEL_MANUSCRIPT', '{"productInfo":{"productName":"","sku":"","version":""},"labelSpecs":{"dimensions":"","material":"","colors":"","finish":""},"textContent":{},"nutritionalPanel":{},"claims":[],"warnings":[],"approvals":{}}', true, 'demo-user-id', NOW(), NOW()),

('tmpl-coc-vital', 'COC - Vital Nutrients.docx', 'Certificate of Compliance - Vital Nutrients', 'COC', '{"productInfo":{"productName":"","batchNumber":"","complianceDate":""},"regulations":[],"standards":[],"certifications":[],"complianceStatement":"","approvals":{}}', true, 'demo-user-id', NOW(), NOW()),

('tmpl-coc-fairhaven', 'COC - Fairhaven Health.docx', 'Certificate of Compliance - Fairhaven Health', 'COC', '{"productInfo":{"productName":"","batchNumber":"","complianceDate":""},"regulations":[],"standards":[],"certifications":[],"complianceStatement":"","approvals":{}}', true, 'demo-user-id', NOW(), NOW()),

('tmpl-coc-bariatric', 'COC - Bariatric Fusion.docx', 'Certificate of Compliance - Bariatric Fusion', 'COC', '{"productInfo":{"productName":"","batchNumber":"","complianceDate":""},"regulations":[],"standards":[],"certifications":[],"complianceStatement":"","approvals":{}}', true, 'demo-user-id', NOW(), NOW()),

('tmpl-coa-vital', 'COA - Vital Nutrients.doc', 'Certificate of Analysis - Vital Nutrients', 'COA', '{"batchInfo":{"batchNumber":"","productName":"","testDate":"","releaseDate":""},"specifications":[],"testResults":[],"conclusion":"","testedBy":"","approvedBy":"","approvals":{}}', true, 'demo-user-id', NOW(), NOW()),

('tmpl-coa-fairhaven', 'COA - Fairhaven Health.doc', 'Certificate of Analysis - Fairhaven Health', 'COA', '{"batchInfo":{"batchNumber":"","productName":"","testDate":"","releaseDate":""},"specifications":[],"testResults":[],"conclusion":"","testedBy":"","approvedBy":"","approvals":{}}', true, 'demo-user-id', NOW(), NOW()),

('tmpl-coa-bariatric', 'COA - Bariatric Fusion.doc', 'Certificate of Analysis - Bariatric Fusion', 'COA', '{"batchInfo":{"batchNumber":"","productName":"","testDate":"","releaseDate":""},"specifications":[],"testResults":[],"conclusion":"","testedBy":"","approvedBy":"","approvals":{}}', true, 'demo-user-id', NOW(), NOW())

ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  type = EXCLUDED.type,
  content = EXCLUDED.content;