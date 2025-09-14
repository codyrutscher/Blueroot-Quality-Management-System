"use client";

import { useState, useEffect } from "react";

interface Label {
  id: string;
  filename: string;
  company: string;
  productSku?: string;
  filePath: string;
  uploadDate: string;
}

export default function Labels() {
  const [labels, setLabels] = useState<Label[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [companies, setCompanies] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchLabels();
  }, []);

  const fetchLabels = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/labels");
      if (response.ok) {
        const data = await response.json();
        setLabels(data.labels || []);

        // Extract unique companies
        const uniqueCompanies = [
          ...new Set(data.labels?.map((label: Label) => label.company) || []),
        ] as string[];
        setCompanies(uniqueCompanies.sort());
      }
    } catch (error) {
      console.error("Error fetching labels:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLabels = labels.filter((label) => {
    const matchesCompany =
      !selectedCompany || label.company === selectedCompany;
    const matchesSearch =
      !searchTerm ||
      label.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      label.productSku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      label.company.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCompany && matchesSearch;
  });

  const handleDownload = async (label: Label) => {
    try {
      const response = await fetch(
        `/api/labels/download?path=${encodeURIComponent(label.filePath)}`
      );
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = label.filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Error downloading label:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg text-gray-600">Loading labels...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">Manage and download product labels</p>
        <div className="text-sm text-gray-500">
          {filteredLabels.length} labels found
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search labels by filename, SKU, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="sm:w-64">
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Companies</option>
              {companies.map((company) => (
                <option key={company} value={company}>
                  {company}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Labels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredLabels.map((label) => (
          <div
            key={label.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3
                  className="text-sm font-semibold text-gray-900 truncate"
                  title={label.filename}
                >
                  {label.filename}
                </h3>
                <p className="text-xs text-blue-600 font-medium mt-1">
                  {label.company}
                </p>
                {label.productSku && (
                  <p className="text-xs text-gray-500 mt-1">
                    SKU: {label.productSku}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">
                {new Date(label.uploadDate).toLocaleDateString()}
              </span>
              <button
                onClick={() => handleDownload(label)}
                className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Download
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredLabels.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏷️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No labels found
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || selectedCompany
              ? "Try adjusting your search criteria."
              : "Ready to start fresh! No labels have been uploaded yet."}
          </p>
          <p className="text-sm text-blue-600 mb-2">
            Upload label files through the Document Upload section and select "Labels&quot; as the destination.
          </p>
          <p className="text-xs text-gray-400">
            Labels will be organized and searchable once uploaded.
          </p>
        </div>
      )}
    </div>
  );
}
