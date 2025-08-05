import React, { useMemo, useState, useEffect } from "react";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";

function LeadsTable({ data = [], fileName = "leads.xlsx" }) {
  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);
  const [from, setFrom] = useState(""); // yyyy-mm-dd
  const [to, setTo] = useState("");     // yyyy-mm-dd

  // Whenever filters change, reset to page 1
  useEffect(() => {
    setPage(1);
  }, [from, to]);

  const filteredData = useMemo(() => {
    if (!data?.length) return [];

    const fromDate = from ? new Date(from) : null;
    const toDate = to ? new Date(new Date(to).setHours(23, 59, 59, 999)) : null;

    return data.filter((d) => {
      const created = new Date(d.createdAt);
      if (fromDate && created < fromDate) return false;
      if (toDate && created > toDate) return false;
      return true;
    });
  }, [data, from, to]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
  const pageData = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredData.slice(start, start + PAGE_SIZE);
  }, [filteredData, page]);

  const handleDownload = () => {
    const rows = filteredData.map((d) => ({
      ID: d.id,
      Username: d.username,
      Email: d.email,
      Phone: d.phone,
      "Book ID": d.book?.id,
      "Book Title": d.book?.title,
      "Created At": new Date(d.createdAt).toLocaleString(),
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leads");
    XLSX.writeFile(wb, fileName);
  };

  if (!data || data.length === 0) return null;

  return (
    <div className="w-full bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-950">
          Downloads
        </h2>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          {/* Date filters */}
          <div className="flex items-center gap-2">
          <label className="text-xs text-gray-600">From</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="border border-gray-300 rounded-lg cursor-pointer px-2 py-1 text-xs sm:text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-600">To</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="border border-gray-300 rounded-lg cursor-pointer px-2 py-1 text-xs sm:text-sm"
            />
          </div>

          <button
            onClick={() => {
              setFrom("");
              setTo("");
            }}
            className="text-xs sm:text-sm underline text-gray-600 cursor-pointer"
          >
            Reset
          </button>

          <button
            onClick={handleDownload}
            className="inline-flex items-center justify-center gap-2 rounded-lg cursor-pointer bg-gradient-to-r from-[#9859fe] to-[#602fea] hover:from-[#602fea] hover:to-[#9859fe] px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-md hover:opacity-90 active:scale-95 transition"
            aria-label="Download Excel"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Download Excel</span>
          </button>
        </div>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs sm:text-sm text-gray-600">
        <span>Total: {data.length}</span>
        <span>Page {page} of {totalPages}</span>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-inner">
        <table className="min-w-full text-xs sm:text-sm">
          <thead className="bg-gray-100 text-gray-700 uppercase tracking-wide">
            <tr>
              {["#", "Username", "Email", "Phone", "Book Title", "Image", "Created At"].map((head) => (
                <th key={head} className="px-2 sm:px-4 py-3 text-left font-medium">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-900">
            {pageData.map((d, idx) => (
              <tr key={d.id} className="hover:bg-gray-50 transition">
                <td className="px-2 sm:px-4 py-3 font-medium text-gray-600">
                  {(page - 1) * PAGE_SIZE + idx + 1}
                </td>
                <td className="px-2 sm:px-4 py-3">{d.username}</td>
                <td className="px-2 sm:px-4 py-3">{d.email}</td>
                <td className="px-2 sm:px-4 py-3">{d.phone}</td>
                <td className="px-2 sm:px-4 py-3 font-medium">{d.book?.title}</td>
                <td className="px-2 sm:px-4 py-3">
                  <img
                    src={`http://localhost:3000/uploads/${d.book?.image}`}
                    alt={d.book?.title || "Book Image"}
                    className="w-8 h-8 sm:w-12 sm:h-12 rounded-md shadow object-cover border border-gray-200"
                  />
                </td>
                <td className="px-2 sm:px-4 py-3 text-gray-500 text-[10px] sm:text-xs">
                  {new Date(d.created_at).toLocaleString()}
                </td>
              </tr>
            ))}

            {pageData.length === 0 && (
              <tr>
                <td colSpan={7} className="px-2 sm:px-4 py-6 text-center text-gray-500">
                  No results found for the selected date range.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="px-3 py-1 text-xs sm:text-sm rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Prev
        </button>

        <div className="flex items-center gap-2 text-xs sm:text-sm">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-md border text-center ${
                p === page
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          className="px-3 py-1 text-xs sm:text-sm rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default LeadsTable;