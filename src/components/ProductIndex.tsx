"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  MagnifyingGlassIcon,
  DocumentIcon,
  BeakerIcon,
} from "@heroicons/react/24/outline";

interface Product {
  id: string;
  brand: string;
  sku: string;
  productName: string;
  healthCategory?: string;
  therapeuticPlatform?: string;
  nutrientType?: string;
  format?: string;
  unitCount: number;
  manufacturer?: string;
  containsIron: boolean;
  documents: any[];
}

interface ProductIndexProps {
  onProductSelect: (sku: string) => void;
}

export default function ProductIndex({ onProductSelect }: ProductIndexProps) {
  const { data: session } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    healthCategory: "",
    brand: "",
    nutrientType: "",
    therapeuticPlatform: "",
    format: "",
    manufacturer: "",
    containsIron: "",
  });
  const [sortBy, setSortBy] = useState("productName");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      // Try debug endpoint first, then fall back to regular API
      let response = await fetch("/api/debug/products");
      if (!response.ok) {
        response = await fetch("/api/products");
      }
      const data = await response.json();
      console.log("Products data:", data); // Debug log
      setProducts(data.products || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedProducts = () => {
    let filtered = products.filter((product) => {
      // Search filter
      const matchesSearch =
        product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase());

      // Multi-filters
      const matchesHealthCategory =
        !filters.healthCategory ||
        product.healthCategory === filters.healthCategory;
      const matchesBrand = !filters.brand || product.brand === filters.brand;
      const matchesNutrientType =
        !filters.nutrientType || product.nutrientType === filters.nutrientType;
      const matchesTherapeuticPlatform =
        !filters.therapeuticPlatform ||
        product.therapeuticPlatform === filters.therapeuticPlatform;
      const matchesFormat =
        !filters.format || product.format === filters.format;
      const matchesManufacturer =
        !filters.manufacturer || product.manufacturer === filters.manufacturer;
      const matchesIron =
        !filters.containsIron ||
        (filters.containsIron === "yes"
          ? product.containsIron
          : !product.containsIron);

      return (
        matchesSearch &&
        matchesHealthCategory &&
        matchesBrand &&
        matchesNutrientType &&
        matchesTherapeuticPlatform &&
        matchesFormat &&
        matchesManufacturer &&
        matchesIron
      );
    });

    // Sorting
    filtered.sort((a, b) => {
      const aValue = a[sortBy as keyof Product] || "";
      const bValue = b[sortBy as keyof Product] || "";

      if (typeof aValue === "string" && typeof bValue === "string") {
        return aValue.localeCompare(bValue);
      }
      if (typeof aValue === "number" && typeof bValue === "number") {
        return aValue - bValue;
      }
      return 0;
    });

    return filtered;
  };

  // Get unique values for filter dropdowns
  const filterOptions = {
    healthCategory: [
      ...new Set(products.map((p) => p.healthCategory).filter(Boolean)),
    ],
    brand: [...new Set(products.map((p) => p.brand).filter(Boolean))],
    nutrientType: [
      ...new Set(products.map((p) => p.nutrientType).filter(Boolean)),
    ],
    therapeuticPlatform: [
      ...new Set(products.map((p) => p.therapeuticPlatform).filter(Boolean)),
    ],
    format: [...new Set(products.map((p) => p.format).filter(Boolean))],
    manufacturer: [
      ...new Set(products.map((p) => p.manufacturer).filter(Boolean)),
    ],
  };

  const filteredProducts = filteredAndSortedProducts();

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-700 to-blue-900 p-6">
      {/* Header Section */}
      <div className="mb-6">
        <p className="text-white">
          Manage quality documentation for all products
        </p>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products by name, SKU, or brand..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
          />
        </div>

        {/* Sort and Filters */}
        <div className="flex flex-wrap gap-3">
          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="productName">Sort by Name</option>
            <option value="sku">Sort by SKU</option>
            <option value="brand">Sort by Brand</option>
            <option value="unitCount">Sort by Unit Count</option>
          </select>

          {/* Brand Filter */}
          <select
            value={filters.brand}
            onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
            className="px-3 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="">All Brands</option>
            {filterOptions.brand.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>

          {/* Format Filter */}
          <select
            value={filters.format}
            onChange={(e) => setFilters({ ...filters, format: e.target.value })}
            className="px-3 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="">All Formats</option>
            {filterOptions.format.map((format) => (
              <option key={format} value={format}>
                {format}
              </option>
            ))}
          </select>

          {/* Manufacturer Filter */}
          <select
            value={filters.manufacturer}
            onChange={(e) =>
              setFilters({ ...filters, manufacturer: e.target.value })
            }
            className="px-3 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="">All Manufacturers</option>
            {filterOptions.manufacturer.map((manufacturer) => (
              <option key={manufacturer} value={manufacturer}>
                {manufacturer}
              </option>
            ))}
          </select>

          {/* Contains Iron Filter */}
          <select
            value={filters.containsIron}
            onChange={(e) =>
              setFilters({ ...filters, containsIron: e.target.value })
            }
            className="px-3 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="">Iron - Any</option>
            <option value="yes">Contains Iron</option>
            <option value="no">No Iron</option>
          </select>
        </div>

        {/* Advanced Filters (Second Row) */}
        <div className="flex flex-wrap gap-3">
          {/* Health Category Filter */}
          <select
            value={filters.healthCategory}
            onChange={(e) =>
              setFilters({ ...filters, healthCategory: e.target.value })
            }
            className="px-3 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="">All Categories</option>
            {filterOptions.healthCategory.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          {/* Nutrient Type Filter */}
          <select
            value={filters.nutrientType}
            onChange={(e) =>
              setFilters({ ...filters, nutrientType: e.target.value })
            }
            className="px-3 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="">All Nutrient Types</option>
            {filterOptions.nutrientType.map((nutrientType) => (
              <option key={nutrientType} value={nutrientType}>
                {nutrientType}
              </option>
            ))}
          </select>

          {/* Therapeutic Platform Filter */}
          <select
            value={filters.therapeuticPlatform}
            onChange={(e) =>
              setFilters({ ...filters, therapeuticPlatform: e.target.value })
            }
            className="px-3 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="">All Therapeutic Platforms</option>
            {filterOptions.therapeuticPlatform.map((platform) => (
              <option key={platform} value={platform}>
                {platform}
              </option>
            ))}
          </select>

          {/* Active Filters Count */}
          {Object.values(filters).some((filter) => filter !== "") && (
            <div className="flex items-center px-3 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm">
              <span className="font-medium">
                {
                  Object.values(filters).filter((filter) => filter !== "")
                    .length
                }{" "}
                active filters
              </span>
            </div>
          )}

          {/* Clear Filters Button */}
          <button
            onClick={() => {
              setFilters({
                healthCategory: "",
                brand: "",
                nutrientType: "",
                therapeuticPlatform: "",
                format: "",
                manufacturer: "",
                containsIron: "",
              });
              setSearchTerm("");
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
          >
            Clear All Filters
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <button
            key={product.id}
            onClick={() => onProductSelect(product.sku)}
            className="block bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow text-left w-full"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <BeakerIcon className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
                    {product.productName}
                  </h3>
                  <p className="text-xs text-gray-600 font-mono">
                    {product.sku}
                  </p>
                </div>
              </div>
              {product.containsIron && (
                <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded">
                  Iron
                </span>
              )}
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Brand:</span>
                <span className="font-medium text-black">{product.brand}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Format:</span>
                <span className="font-medium text-black">{product.format}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Count:</span>
                <span className="font-medium text-black">
                  {product.unitCount}
                </span>
              </div>
              {product.healthCategory && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Category:</span>
                  <span className="font-medium text-black text-xs">
                    {product.healthCategory}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center text-xs text-gray-600">
                <DocumentIcon className="h-4 w-4 mr-1" />
                {product.documents.length} documents
              </div>
              <span className="text-xs text-blue-600 font-medium">
                View Details →
              </span>
            </div>
          </button>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <BeakerIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No products found
          </h3>
          <p className="text-gray-600">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}

      <div className="mt-6 text-sm text-gray-600 text-center">
        Showing {filteredProducts.length} of {products.length} products
      </div>
    </div>
  );
}
