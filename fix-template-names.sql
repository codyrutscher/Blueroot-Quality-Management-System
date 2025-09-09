-- Fix template names to match DocxEditor expectations
-- Run this in Supabase SQL Editor

UPDATE templates SET name = 'QA-004-02 Finished Product Specification Rev 05.docx' WHERE id = 'tmpl-finished-goods';
UPDATE templates SET name = 'Raw Material Spec Template.docx' WHERE id = 'tmpl-raw-material';
UPDATE templates SET name = 'PSF TEMPLATE BRH.docx' WHERE id = 'tmpl-psf';
UPDATE templates SET name = 'Label Manuscript.docx' WHERE id = 'tmpl-label-manuscript';
UPDATE templates SET name = 'COA - Vital Nutrients.doc' WHERE id = 'tmpl-coa';
UPDATE templates SET name = 'COC - Vital Nutrients.docx' WHERE id = 'tmpl-coc';

-- Add missing COC and COA templates
INSERT INTO "templates" ("id", "name", "description", "type", "content", "isActive", "createdBy", "createdAt", "updatedAt") VALUES
('tmpl-coc-fairhaven', 'COC - Fairhaven Health.docx', 'Certificate of Compliance - Fairhaven Health', 'COC', '{"productInfo":{"productName":"","batchNumber":"","complianceDate":""},"regulations":[],"standards":[],"certifications":[],"complianceStatement":"","approvals":{"qualityManager":"","regulatoryAffairs":"","authorizedSignatory":"","finalApproval":""}}', true, 'demo-user-id', NOW(), NOW()),
('tmpl-coc-bariatric', 'COC - Bariatric Fusion.docx', 'Certificate of Compliance - Bariatric Fusion', 'COC', '{"productInfo":{"productName":"","batchNumber":"","complianceDate":""},"regulations":[],"standards":[],"certifications":[],"complianceStatement":"","approvals":{"qualityManager":"","regulatoryAffairs":"","authorizedSignatory":"","finalApproval":""}}', true, 'demo-user-id', NOW(), NOW()),
('tmpl-coa-fairhaven', 'COA - Fairhaven Health.doc', 'Certificate of Analysis - Fairhaven Health', 'COA', '{"batchInfo":{"batchNumber":"","productName":"","testDate":"","releaseDate":""},"specifications":[],"testResults":[],"conclusion":"","testedBy":"","approvedBy":"","approvals":{"analyst":"","supervisor":"","qualityManager":"","finalApproval":""}}', true, 'demo-user-id', NOW(), NOW()),
('tmpl-coa-bariatric', 'COA - Bariatric Fusion.doc', 'Certificate of Analysis - Bariatric Fusion', 'COA', '{"batchInfo":{"batchNumber":"","productName":"","testDate":"","releaseDate":""},"specifications":[],"testResults":[],"conclusion":"","testedBy":"","approvedBy":"","approvals":{"analyst":"","supervisor":"","qualityManager":"","finalApproval":""}}', true, 'demo-user-id', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;