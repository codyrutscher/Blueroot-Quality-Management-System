"use client";

import { useState, useEffect } from "react";
import * as XLSX from 'xlsx';

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
  // Color information for cells
  colors?: {
    [key: string]: string;
  };
}

export default function AllergensTable() {
  const [data, setData] = useState<AllergenData[]>([]);
  const [editingCell, setEditingCell] = useState<{row: number, col: string} | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [allergenFilters, setAllergenFilters] = useState<{[key: string]: string}>({});
  const [visibleColumns, setVisibleColumns] = useState<{[key: string]: boolean}>({});
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadAllergenData();
  }, []);

  // Initialize visible columns when data loads
  useEffect(() => {
    if (data.length > 0 && Object.keys(visibleColumns).length === 0) {
      const initialVisible: {[key: string]: boolean} = {};
      allergenColumns.forEach(column => {
        initialVisible[column] = true;
      });
      setVisibleColumns(initialVisible);
    }
  }, [data, visibleColumns]);

  const loadAllergenData = async () => {
    try {
      console.log('Loading allergen data...');
      
      // Try to load Excel file first (with color information)
      try {
        const excelResponse = await fetch('/Allergens.xlsx');
        if (excelResponse.ok) {
          const arrayBuffer = await excelResponse.arrayBuffer();
          const parsedData = parseExcel(arrayBuffer);
          console.log('Excel loaded with', parsedData.length, 'rows');
          setData(parsedData);
          return;
        }
      } catch (excelError) {
        console.log('Excel file not found, trying CSV...');
      }
      
      // Fallback to CSV file
      const csvResponse = await fetch('/Allergens - Sheet1.csv');
      if (!csvResponse.ok) {
        throw new Error(`HTTP error! status: ${csvResponse.status}`);
      }
      
      const csvText = await csvResponse.text();
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

  const parseExcel = (arrayBuffer: ArrayBuffer): AllergenData[] => {
    try {
      const workbook = XLSX.read(arrayBuffer, { 
        type: 'array', 
        cellStyles: true,
        cellHTML: false,
        cellFormula: false,
        cellDates: true,
        bookVBA: false,
        password: ""
      });
      
      console.log('Workbook info:', {
        SheetNames: workbook.SheetNames,
        Props: workbook.Props,
        Custprops: workbook.Custprops
      });
      
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Get the range of the worksheet
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
      
      // Extract headers from first row
      const headers: string[] = [];
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: range.s.r, c: col });
        const cell = worksheet[cellRef];
        headers.push(cell ? String(cell.v || '') : '');
      }
      
      console.log('Excel headers:', headers);
      console.log('Worksheet range:', range);
      console.log('Full worksheet object keys:', Object.keys(worksheet));
      
      // Extract data rows
      const rows: AllergenData[] = [];
      for (let row = range.s.r + 1; row <= range.e.r; row++) {
        const rowData: any = {};
        const colors: any = {};
        let hasData = false;
        
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
          const cell = worksheet[cellRef];
          const header = headers[col - range.s.c];
          
          // Get cell value
          const cellValue = cell ? String(cell.v || '') : '';
          rowData[header] = cellValue;
          
          if (cellValue && cellValue.trim()) {
            hasData = true;
          }
          
          // Debug: Log cell information for first few rows
          if (row <= range.s.r + 3) {
            console.log(`Cell ${cellRef} (${header}):`, {
              value: cellValue,
              cell: cell,
              style: cell?.s,
              fill: cell?.s?.fill,
              font: cell?.s?.font
            });
          }
          
          // Extract formatting information
          if (cell && cell.s) {
            const cellStyle = cell.s;
            
            // Check if there's a style object with pattern and colors
            if (cellStyle.style) {
              const style = cellStyle.style;
              console.log(`Style info for ${cellRef}:`, style);
              
              if (style.patternType === 'solid') {
                // Handle background color from fgColor (Excel stores solid fill color in fgColor)
                if (style.fgColor) {
                  const fgColor = style.fgColor;
                  if (fgColor.rgb) {
                    colors[`${header}_bg`] = `#${fgColor.rgb}`;
                    console.log(`Excel fgColor RGB for ${cellRef}: #${fgColor.rgb}`);
                  } else if (fgColor.indexed !== undefined) {
                    const indexedColors: { [key: number]: string } = {
                      2: '#FFFFFF', // White
                      3: '#FF0000', // Red  
                      4: '#00FF00', // Green
                      5: '#0000FF', // Blue
                      6: '#FFFF00', // Yellow
                      7: '#FF00FF', // Magenta
                      8: '#00FFFF', // Cyan
                      9: '#800000', // Maroon
                      10: '#008000', // Dark Green
                      11: '#000080', // Navy
                      12: '#808000', // Olive
                      13: '#800080', // Purple
                      14: '#008080', // Teal
                      15: '#C0C0C0', // Silver
                      16: '#808080', // Gray
                      17: '#9999FF', // Light Blue
                      18: '#993366', // Dark Pink
                      19: '#FFFFCC', // Light Yellow
                      20: '#CCFFFF', // Light Cyan
                      21: '#660066', // Dark Purple
                      22: '#FF8080', // Light Red
                      23: '#0066CC', // Medium Blue
                      24: '#CCCCFF', // Very Light Blue
                    };
                    colors[`${header}_bg`] = indexedColors[fgColor.indexed] || '#FFFFFF';
                    console.log(`Excel indexed fgColor for ${cellRef}: ${fgColor.indexed} -> ${indexedColors[fgColor.indexed]}`);
                  } else if (fgColor.theme !== undefined) {
                    // Handle theme colors
                    const themeColors: { [key: number]: string } = {
                      0: '#FFFFFF', // White
                      1: '#000000', // Black
                      2: '#E7E6E6', // Light Gray
                      3: '#44546A', // Dark Blue
                      4: '#5B9BD5', // Blue
                      5: '#70AD47', // Green
                      6: '#FFC000', // Orange
                      7: '#C55A11', // Dark Orange
                      8: '#264478', // Dark Blue
                      9: '#636363', // Gray
                    };
                    colors[`${header}_bg`] = themeColors[fgColor.theme] || '#FFFFFF';
                    console.log(`Excel theme fgColor for ${cellRef}: ${fgColor.theme} -> ${themeColors[fgColor.theme]}`);
                  }
                }
                
                // Also check bgColor
                if (style.bgColor) {
                  const bgColor = style.bgColor;
                  if (bgColor.rgb) {
                    console.log(`Excel bgColor RGB for ${cellRef}: #${bgColor.rgb}`);
                  }
                }
              }
            }
            
            // Also try the standard fill approach
            if (cellStyle.fill) {
              console.log(`Standard fill info for ${cellRef}:`, cellStyle.fill);
              
              if (cellStyle.fill.bgColor) {
                const bgColor = cellStyle.fill.bgColor;
                if (bgColor.rgb) {
                  colors[`${header}_bg`] = `#${bgColor.rgb}`;
                  console.log(`Standard RGB color for ${cellRef}: #${bgColor.rgb}`);
                }
              }
            }
            
            // Font color
            if (cellStyle.font && cellStyle.font.color) {
              const fontColor = cellStyle.font.color;
              if (fontColor.rgb) {
                colors[`${header}_font`] = `#${fontColor.rgb}`;
                console.log(`Font color for ${cellRef}: #${fontColor.rgb}`);
              }
            }
          }
        }
        
        // Only add rows that have data in Brand and SKU columns
        if (hasData && rowData[headers[0]] && rowData[headers[1]]) {
          rowData.colors = colors;
          rows.push(rowData as AllergenData);
        }
      }
      
      console.log('Parsed Excel data:', rows.length, 'rows');
      console.log('Sample row with colors:', rows[0]);
      
      return rows;
    } catch (error) {
      console.error('Error parsing Excel file:', error);
      return [];
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

  const getCellStyle = (row: AllergenData, column: string) => {
    const colors = row.colors;
    const cellValue = (row as any)[column];
    
    // If we have Excel color information, use it
    if (colors) {
      const bgColor = colors[`${column}_bg`];
      const fontColor = colors[`${column}_font`];
      
      if (bgColor || fontColor) {
        console.log(`Using Excel colors for ${column}:`, { bgColor, fontColor });
        return {
          backgroundColor: bgColor || 'transparent',
          color: fontColor || 'inherit',
        };
      }
    }
    
    // Enhanced fallback - try to match typical allergen color patterns
    if (cellValue === 'Y') {
      // Green for "Yes" (free from allergen)
      return {
        backgroundColor: '#dcfce7', // green-100
        color: '#166534', // green-800
      };
    } else if (cellValue === 'N') {
      // Red for "No" (contains allergen)  
      return {
        backgroundColor: '#fecaca', // red-100
        color: '#991b1b', // red-800
      };
    } else if (cellValue === '') {
      // Yellow/orange for unknown/not tested
      return {
        backgroundColor: '#fef3c7', // yellow-100
        color: '#92400e', // yellow-800
      };
    }
    
    // Default gray for other values
    return {
      backgroundColor: '#f3f4f6', // gray-100
      color: '#6b7280', // gray-500
    };
  };

  const getCellClassName = (row: AllergenData, column: string) => {
    const colors = row.colors;
    const cellValue = (row as any)[column];
    
    // If we have Excel colors, use minimal classes
    if (colors && (colors[`${column}_bg`] || colors[`${column}_font`])) {
      return 'cursor-pointer px-2 py-1 rounded text-center font-medium';
    }
    
    // Fallback to default color classes
    if (cellValue === 'Y') {
      return 'cursor-pointer px-2 py-1 rounded text-center font-medium bg-green-100 text-green-800';
    } else if (cellValue === 'N') {
      return 'cursor-pointer px-2 py-1 rounded text-center font-medium bg-red-100 text-red-800';
    } else {
      return 'cursor-pointer px-2 py-1 rounded text-center font-medium bg-gray-100 text-gray-500';
    }
  };

  const filteredData = data.filter(row => {
    // Text search filter
    const matchesSearch = !searchTerm || Object.values(row).some(value => 
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Allergen filters
    const matchesAllergenFilters = Object.entries(allergenFilters).every(([column, filterValue]) => {
      if (!filterValue) return true; // No filter applied
      const cellValue = (row as any)[column];
      return cellValue === filterValue;
    });
    
    return matchesSearch && matchesAllergenFilters;
  });

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

      {/* Search and Filter Controls */}
      <div className="space-y-4">
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
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              showFilters 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            🔍 Allergen Filters
          </button>
          <div className="text-sm text-gray-500">
            {filteredData.length} of {data.length} products
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Filter by Allergen Status</h3>
              <button
                onClick={() => {
                  setAllergenFilters({});
                  const allVisible: {[key: string]: boolean} = {};
                  allergenColumns.forEach(column => {
                    allVisible[column] = true;
                  });
                  setVisibleColumns(allVisible);
                }}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear All Filters
              </button>
            </div>
            
            {/* Column Visibility Controls */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Show/Hide Columns:</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {allergenColumns.map((column) => (
                  <label key={column} className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={visibleColumns[column] !== false}
                      onChange={(e) => setVisibleColumns(prev => ({
                        ...prev,
                        [column]: e.target.checked
                      }))}
                      className="rounded border-gray-300"
                    />
                    <span className="truncate" title={column}>
                      {column.replace('Free From ', '')}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Allergen Status Filters */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Filter by Status:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allergenColumns.map((column) => (
                  <div key={column} className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-600 min-w-0 flex-1 truncate" title={column}>
                      {column.replace('Free From ', '')}:
                    </label>
                    <select
                      value={allergenFilters[column] || ''}
                      onChange={(e) => setAllergenFilters(prev => ({
                        ...prev,
                        [column]: e.target.value
                      }))}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="">All</option>
                      <option value="Y">Free From (Y)</option>
                      <option value="N">Contains (N)</option>
                      <option value="">Not Specified</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Filter Buttons */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Filters:</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    const filters: {[key: string]: string} = {};
                    allergenColumns.forEach(column => {
                      filters[column] = 'Y';
                    });
                    setAllergenFilters(filters);
                  }}
                  className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-lg hover:bg-green-200"
                >
                  All Allergen-Free
                </button>
                <button
                  onClick={() => setAllergenFilters({'Free From Gluten (Wheat/Rye/Barley)': 'Y'})}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200"
                >
                  Gluten-Free Only
                </button>
                <button
                  onClick={() => setAllergenFilters({'Free From Milk (Casein)': 'Y', 'Free From Dairy (Whey)': 'Y'})}
                  className="px-3 py-1 text-sm bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200"
                >
                  Dairy-Free Only
                </button>
                <button
                  onClick={() => setAllergenFilters({'Free From Soy': 'Y'})}
                  className="px-3 py-1 text-sm bg-orange-100 text-orange-800 rounded-lg hover:bg-orange-200"
                >
                  Soy-Free Only
                </button>
              </div>
            </div>
          </div>
        )}
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
                {allergenColumns
                  .filter(column => visibleColumns[column] !== false)
                  .map((column) => (
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
                  {allergenColumns
                    .filter(column => visibleColumns[column] !== false)
                    .map((column) => (
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
                          className={getCellClassName(row, column)}
                          style={getCellStyle(row, column)}
                        >
                          {(row as unknown)[column] || '-'}
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