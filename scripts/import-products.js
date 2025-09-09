require('dotenv').config();
const fs = require('fs');
const csv = require('csv-parse');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function importProducts() {
  try {
    console.log('Starting product import...');
    
    const csvData = fs.readFileSync('./BRH - QMS Data (PRODUCTS) - Sheet1.csv', 'utf-8');
    
    csv.parse(csvData, {
      columns: true,
      skip_empty_lines: true,
    }, async (err, records) => {
      if (err) {
        console.error('Error parsing CSV:', err);
        return;
      }
      
      console.log(`Found ${records.length} products to import`);
      
      for (let i = 0; i < records.length; i++) {
        const record = records[i];
        
        try {
          const product = await prisma.product.create({
            data: {
              id: `product-${record.SKU}`,
              brand: record.Brand || '',
              sku: record.SKU || '',
              productName: record['Product Name'] || '',
              healthCategory: record['Health Category'] || null,
              therapeuticPlatform: record['Therapeutic Platform'] || null,
              nutrientType: record['Nutrient Type'] || null,
              format: record.Format || null,
              numberOfActives: record['Number of Actives'] || null,
              bottleCount: record['Bottle Count/Size'] || null,
              unitCount: parseInt(record['Unit Count']) || 0,
              manufacturer: record['Mfg.'] || null,
              containsIron: record['Contains\n  Iron'] === 'yes',
            },
          });
          
          console.log(`Imported: ${product.sku} - ${product.productName}`);
        } catch (error) {
          console.error(`Error importing ${record.SKU}:`, error.message);
        }
      }
      
      console.log('Product import completed!');
      await prisma.$disconnect();
    });
    
  } catch (error) {
    console.error('Import failed:', error);
    await prisma.$disconnect();
  }
}

importProducts();