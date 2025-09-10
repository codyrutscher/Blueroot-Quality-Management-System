-- Supabase Database Schema for Supplier Document Management
-- Run this in your Supabase SQL Editor

-- Enable Row Level Security
ALTER TABLE IF EXISTS suppliers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS supplier_documents DISABLE ROW LEVEL SECURITY;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS supplier_documents;
DROP TABLE IF EXISTS suppliers;

-- Create suppliers table
CREATE TABLE suppliers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('supplier', 'co-man')),
    approval_status TEXT NOT NULL CHECK (approval_status IN ('approved', 'conditionally approved', 'pending', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create supplier_documents table
CREATE TABLE supplier_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    file_name TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    file_type TEXT NOT NULL,
    file_path TEXT NOT NULL, -- Path in Supabase Storage
    uploaded_by TEXT NOT NULL, -- User who uploaded (from session)
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_suppliers_name ON suppliers(name);
CREATE INDEX idx_suppliers_type ON suppliers(type);
CREATE INDEX idx_suppliers_approval_status ON suppliers(approval_status);
CREATE INDEX idx_supplier_documents_supplier_id ON supplier_documents(supplier_id);
CREATE INDEX idx_supplier_documents_uploaded_at ON supplier_documents(uploaded_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_supplier_documents_updated_at BEFORE UPDATE ON supplier_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample suppliers from CSV data
INSERT INTO suppliers (name, type, approval_status) VALUES
('ANS', 'co-man', 'approved'),
('Food Pharma', 'co-man', 'approved'),
('INW', 'co-man', 'approved'),
('Mill Haven Foods', 'co-man', 'approved'),
('MultiPack', 'co-man', 'approved'),
('Nutrastar', 'co-man', 'approved'),
('Probi', 'co-man', 'approved'),
('Spice Hut', 'co-man', 'approved'),
('Steuart Packaging', 'co-man', 'approved'),
('Vitaquest', 'co-man', 'approved'),
('AIDP, Inc.', 'supplier', 'approved'),
('Ajinomoto Health and Nutrition North America, Inc', 'supplier', 'approved'),
('Anderson Advanced Ingredients', 'supplier', 'approved'),
('B&D Nutritional Products', 'supplier', 'approved'),
('Catherych (PharmaCap)', 'supplier', 'approved'),
('Centian LLC', 'supplier', 'approved'),
('Draco Natural Products', 'supplier', 'approved'),
('Euromed USA', 'supplier', 'approved'),
('FCI Flavors', 'supplier', 'approved'),
('Fifth Nutrisupply, Inc', 'supplier', 'approved'),
('Freemen Nutra Group', 'supplier', 'approved'),
('Fuller Enterprise USA Inc', 'supplier', 'approved'),
('GNT USA, LLC', 'supplier', 'approved'),
('Hopsteiner (SS Steiner)', 'supplier', 'approved'),
('Indena USA Inc', 'supplier', 'approved'),
('LBB Specialties Holdings LLC', 'supplier', 'approved'),
('Lodia International LLC', 'supplier', 'approved'),
('Morre-Tec Co', 'supplier', 'approved'),
('NuLiv Science USA Inc.', 'supplier', 'approved'),
('Nura', 'supplier', 'approved'),
('NutriScience (XSTO)', 'supplier', 'approved'),
('Nutrisol Solutions', 'supplier', 'approved'),
('PAT Vitamins, Inc', 'supplier', 'approved'),
('Quadra', 'supplier', 'approved'),
('Sabinsa Corporation', 'supplier', 'approved'),
('Solabia/Algatech (AstaPure)', 'supplier', 'approved'),
('Stauber Performance Ingredients, Inc', 'supplier', 'approved'),
('SuanNutra, Inc.', 'supplier', 'approved'),
('Suheung America Corp.', 'supplier', 'approved'),
('Taiyo', 'supplier', 'approved'),
('VDF Future Ceuticals, Inc', 'supplier', 'approved'),
('Verb Biotics', 'supplier', 'approved'),
('Westco Chemicals, Inc.', 'supplier', 'approved'),
('Pacific Botanicals, LLC', 'supplier', 'approved'),
('Artron', 'co-man', 'conditionally approved'),
('Deerland/ADM', 'co-man', 'conditionally approved'),
('Diversified Labor Solutions', 'co-man', 'conditionally approved'),
('Iceland Direct', 'co-man', 'conditionally approved'),
('Jasper', 'co-man', 'conditionally approved'),
('JW', 'co-man', 'conditionally approved'),
('KD Nutra', 'co-man', 'conditionally approved'),
('Nutrix', 'co-man', 'conditionally approved'),
('Albion Laboratories, Inc./Balchem', 'supplier', 'conditionally approved'),
('American Laboratories, Incorporated', 'supplier', 'conditionally approved'),
('AstaReal USA', 'supplier', 'conditionally approved'),
('Best Formulations', 'supplier', 'conditionally approved'),
('Biolandes', 'supplier', 'conditionally approved'),
('Brenntag', 'supplier', 'conditionally approved'),
('CapsCanada', 'supplier', 'conditionally approved'),
('Chemi Nutra Inc.', 'supplier', 'conditionally approved'),
('CK Ingredients', 'supplier', 'conditionally approved'),
('Container and Packaging Supply', 'supplier', 'conditionally approved'),
('Creative Compounds', 'supplier', 'conditionally approved'),
('Essex Food Ingredients', 'supplier', 'conditionally approved'),
('Euronutra (Advenion Corp)', 'supplier', 'conditionally approved'),
('Fallwood Corporation', 'supplier', 'conditionally approved'),
('Givaudan Flavors Corporation', 'supplier', 'conditionally approved'),
('Glanbia Nutritionals (NA), Inc', 'supplier', 'conditionally approved'),
('IMCD US, LLC', 'supplier', 'conditionally approved'),
('Jiaherb, Incorporated', 'supplier', 'conditionally approved'),
('KERRY', 'supplier', 'conditionally approved'),
('Kyowa Hakko USA., Inc.', 'supplier', 'conditionally approved'),
('LGM Pharma', 'supplier', 'conditionally approved'),
('Lonza, Inc.', 'supplier', 'conditionally approved'),
('Martin Bauer, Inc.', 'supplier', 'conditionally approved'),
('Maypro Industries', 'supplier', 'conditionally approved'),
('O''Berk of New England', 'supplier', 'conditionally approved'),
('Package All-Alpha Packaging', 'supplier', 'conditionally approved'),
('PLT Health Solutions', 'supplier', 'conditionally approved'),
('Priority Plastics, Incorporated', 'supplier', 'conditionally approved'),
('San-Ei Gen F.F.I. (USA), Inc.', 'supplier', 'conditionally approved'),
('Soft Gel Technologies', 'supplier', 'conditionally approved'),
('Specialty Enzymes & Biotech', 'supplier', 'conditionally approved'),
('Symrise AG', 'supplier', 'conditionally approved'),
('TRICORBRAUN - ALPHA', 'supplier', 'conditionally approved'),
('TRICORBRAUN - ALPHAMED ISLIP NY', 'supplier', 'conditionally approved'),
('Uline', 'supplier', 'conditionally approved'),
('United Pharma', 'supplier', 'conditionally approved'),
('Verdure Sciences Inc', 'supplier', 'conditionally approved'),
('Virginia Dare', 'supplier', 'conditionally approved');

-- Enable Row Level Security (Optional - for production)
-- ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE supplier_documents ENABLE ROW LEVEL SECURITY;

-- Create policies (Optional - customize based on your needs)
-- CREATE POLICY "Suppliers are viewable by everyone" ON suppliers FOR SELECT USING (true);
-- CREATE POLICY "Supplier documents are viewable by everyone" ON supplier_documents FOR SELECT USING (true);
-- CREATE POLICY "Anyone can upload supplier documents" ON supplier_documents FOR INSERT WITH CHECK (true);

-- Grant permissions
GRANT ALL ON suppliers TO anon, authenticated;
GRANT ALL ON supplier_documents TO anon, authenticated;