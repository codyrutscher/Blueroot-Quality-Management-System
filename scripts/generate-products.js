const fs = require('fs');
const csv = require('csv-parse');

// Read and convert CSV to products array
const csvData = fs.readFileSync('./BRH - QMS Data (PRODUCTS) - Sheet1.csv', 'utf-8');

csv.parse(csvData, {
  columns: true,
  skip_empty_lines: true,
}, (err, records) => {
  if (err) {
    console.error('Error parsing CSV:', err);
    return;
  }

  const products = records.map((record, index) => ({
    id: `prod-${record.SKU}`,
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
    documents: []
  }));

  // Write to file
  const output = `// Auto-generated from CSV
export const allProducts = ${JSON.stringify(products, null, 2)};

export default allProducts;
`;

  fs.writeFileSync('./src/data/products.ts', output);
  console.log(`Generated ${products.length} products`);
});