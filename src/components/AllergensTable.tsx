"use client";

import { useState, useEffect } from "react";

interface AllergenData {
  Brand: string;
  SKU: string;
  "Product Name": string;
  "Free From Gluten (Wheat/Rye/Barley)": string;
  "Free From Milk (Casein)": string;
  "Free From Dairy (Whey)": string;
  "Free From Soy": string;
  "Free From Egg Protein": string;
  "Free From Corn": string;
  "Free From Peanuts": string;
  "Free From Tree Nuts": string;
  "Free From Shellfish": string;
  "Free From Sesame": string;
  "Free From Fish": string;
  NOTES: string;
}

export default function AllergensTable() {
  const [data, setData] = useState<AllergenData[]>([]);
  const [editingCell, setEditingCell] = useState<{row: number, col: string} | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllergenData();
  }, []);

  const loadAllergenData = async () => {
    try {
      console.log('Loading allergen data...');
      const response = await fetch('/Allergens - Sheet1.csv');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const csvText = await response.text();
      console.log('CSV loaded, length:', csvText.length);
      
      const parsedData = parseCSV(csvText);
      console.log('Parsed data:', parsedData.length, 'rows');
      
      setData(parsedData);
    } catch (error) {
      console.error('Error loading allergen data:', error);
      // Fallback to empty data
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const parseCSV = (csvText: string): AllergenData[] => {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    return lines.slice(1)
      .filter(line => line.trim() && !line.startsWith(',,,,'))
      .map(line => {
        const values = parseCSVLine(line);
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row as AllergenData;
      })
      .filter(row => row.Brand && row.SKU); // Filter out empty rows
  };

  const parseCSVLine = (line: string): string[] => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  };

  const handleCellEdit = (rowIndex: number, column: string, value: string) => {
    const newData = [...data];
    (newData[rowIndex] as any)[column] = value;
    setData(newData);
  };

  const handleCellClick = (rowIndex: number, column: string) => {
    setEditingCell({ row: rowIndex, col: column });
  };

  const handleCellBlur = () => {
    setEditingCell(null);
  };

  const filteredData = data.filter(row => 
    Object.values(row).some(value => 
      value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const allergenColumns = [
    "Free From Gluten (Wheat/Rye/Barley)",
    "Free From Milk (Casein)",
    "Free From Dairy (Whey)",
    "Free From Soy",
    "Free From Egg Protein",
    "Free From Corn",
    "Free From Peanuts",
    "Free From Tree Nuts",
    "Free From Shellfish",
    "Free From Sesame",
    "Free From Fish"
  ];

  const saveData = async () => {
    try {
      // In a real app, this would save to a database
      console.log('Saving allergen data:', data);
      alert('Allergen data saved successfully!');
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Error saving data');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg text-gray-600">Loading allergen data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex items-center justify-between">
        <p className="text-white">Manage allergen information for all products</p>
        <button
          onClick={saveData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Save Changes
        </button>
      </div>

      {/* Color Code Legend - Option 1: HTML/CSS Version */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Color Code Legend</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 border-2 border-green-200 rounded flex items-center justify-center">
              <span className="text-green-800 font-bold text-sm">Y</span>
            </div>
            <div>
              <div className="font-medium text-gray-900">Free From Allergen</div>
              <div className="text-sm text-gray-600">Product does not contain this allergen</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-100 border-2 border-red-200 rounded flex items-center justify-center">
              <span className="text-red-800 font-bold text-sm">N</span>
            </div>
            <div>
              <div className="font-medium text-gray-900">Contains Allergen</div>
              <div className="text-sm text-gray-600">Product contains this allergen</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-100 border-2 border-gray-200 rounded flex items-center justify-center">
              <span className="text-gray-500 font-bold text-sm">-</span>
            </div>
            <div>
              <div className="font-medium text-gray-900">Not Specified</div>
              <div className="text-sm text-gray-600">Allergen status not determined</div>
            </div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-start space-x-2">
            <div className="text-blue-600 mt-0.5">ℹ️</div>
            <div className="text-sm text-blue-800">
              <strong>Instructions:</strong> Click on any allergen cell to change its status. Use the dropdown to select Y (free from), N (contains), or leave blank for unspecified.
            </div>
          </div>
        </div>
      </div>

      {/* Color Code Legend - Option 2: Original Image (uncomment to use) */}
      {/* 
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Color Code Legend</h3>
        <img 
          src="/templates/colorcode.png" 
          alt="Allergen Color Code Legend" 
          className="max-w-full h-auto rounded-lg shadow-sm"
        />
      </div>
      */}

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search products, brands, or SKUs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="text-sm text-gray-500">
          {filteredData.length} of {data.length} products
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="sticky left-0 bg-gray-50 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                  Brand
                </th>
                <th className="sticky left-20 bg-gray-50 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                  SKU
                </th>
                <th className="sticky left-40 bg-gray-50 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                  Product Name
                </th>
                {allergenColumns.map((column) => (
                  <th key={column} className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 min-w-24">
                    {column.replace('Free From ', '')}
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((row, rowIndex) => (
                <tr key={`${row.Brand}-${row.SKU}-${rowIndex}`} className="hover:bg-gray-50">
                  <td className="sticky left-0 bg-white px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200">
                    {row.Brand}
                  </td>
                  <td className="sticky left-20 bg-white px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                    {row.SKU}
                  </td>
                  <td className="sticky left-40 bg-white px-4 py-3 text-sm text-gray-900 border-r border-gray-200 max-w-xs">
                    <div className="truncate" title={row["Product Name"]}>
                      {row["Product Name"]}
                    </div>
                  </td>
                  {allergenColumns.map((column) => (
                    <td key={column} className="px-3 py-3 text-center border-r border-gray-200">
                      {editingCell?.row === rowIndex && editingCell?.col === column ? (
                        <select
                          value={(row as any)[column]}
                          onChange={(e) => handleCellEdit(rowIndex, column, e.target.value)}
                          onBlur={handleCellBlur}
                          autoFocus
                          className="w-full text-center border-0 focus:ring-2 focus:ring-blue-500 rounded"
                        >
                          <option value="">-</option>
                          <option value="Y">Y</option>
                          <option value="N">N</option>
                        </select>
                      ) : (
                        <div
                          onClick={() => handleCellClick(rowIndex, column)}
                          className={`cursor-pointer px-2 py-1 rounded text-center font-medium ${
                            (row as any)[column] === 'Y' 
                              ? 'bg-green-100 text-green-800' 
                              : (row as any)[column] === 'N'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {(row as any)[column] || '-'}
                        </div>
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-sm text-gray-900 max-w-xs">
                    {editingCell?.row === rowIndex && editingCell?.col === 'NOTES' ? (
                      <input
                        type="text"
                        value={row.NOTES}
                        onChange={(e) => handleCellEdit(rowIndex, 'NOTES', e.target.value)}
                        onBlur={handleCellBlur}
                        autoFocus
                        className="w-full border-0 focus:ring-2 focus:ring-blue-500 rounded"
                      />
                    ) : (
                      <div
                        onClick={() => handleCellClick(rowIndex, 'NOTES')}
                        className="cursor-pointer truncate"
                        title={row.NOTES}
                      >
                        {row.NOTES || 'Click to add notes...'}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredData.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No products found matching your search criteria.
        </div>
      )}
    </div>
  );
}