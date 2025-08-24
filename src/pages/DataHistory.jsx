import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import { supabase } from "../supabaseClient"; // connect Supabase
import "../assets/datahistory.css";

const isSafe = (entry) => {
  return (
    entry.ph >= 6.5 &&
    entry.ph <= 8.5 &&
    parseFloat(entry.turbidity) < 5 &&
    parseFloat(entry.temp) < 30 &&
    parseFloat(entry.tds) < 500
  );
};

const DataHistory = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const [filters, setFilters] = useState({
    status: "all",
    date: "",
    text: "",
  });

  const tableContainerRef = useRef(null);

  // 🔹 Fetch real data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      const { data: rows, error } = await supabase
       .from("dataset_history")
       .select("*")
       .order("created_at", { ascending: false });


      if (error) {
        console.error("Error fetching data:", error.message);
      } else {
        setData(rows || []);
      }
    };

    fetchData();
  }, []);

  // 🔹 Apply filters
  useEffect(() => {
    let filtered = data;

    if (filters.status !== "all") {
      filtered = filtered.filter((entry) =>
        filters.status === "safe" ? isSafe(entry) : !isSafe(entry)
      );
    }
    if (filters.date.trim() !== "") {
  filtered = filtered.filter((entry) =>
    entry.created_at.startsWith(filters.date)
  );
  }
    if (filters.text.trim() !== "") {
  filtered = filtered.filter((entry) =>
    entry.created_at.toLowerCase().includes(filters.text.toLowerCase())
  );
  }


    setFilteredData(filtered);
    setPage(1);
  }, [data, filters]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const goPrev = () => setPage((p) => Math.max(p - 1, 1));
  const goNext = () => setPage((p) => Math.min(p + 1, totalPages));

  const handleDownload = () => {
    const csv = [
      ["Time", "pH", "Turbidity", "Temperature", "TDS", "Status"],
      ...filteredData.map((row) => [
  row.created_at,
  row.ph,
  row.turbidity,
  row.temperature,
  row.tds,
  isSafe(row) ? "Safe" : "Unsafe",
]),

    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "AquaCheck_History.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="container">
      <Sidebar />
      <div className="history-content">
        {/* Header + Filters */}
        <div className="header-filters">
          <h2>Water Quality History</h2>
          <div className="filter-controls">
            <label>
              Status:
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, status: e.target.value }))
                }
              >
                <option value="all">All</option>
                <option value="safe">Safe</option>
                <option value="unsafe">Unsafe</option>
              </select>
            </label>

            <label>
              Date (YYYY or YYYY-MM-DD):
              <input
                type="text"
                placeholder="e.g. 2025 or 2025-08-10"
                value={filters.date}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    date: e.target.value.trim(),
                  }))
                }
              />
            </label>

            <label>
              Search Time:
              <input
                type="text"
                placeholder="Search timestamp..."
                value={filters.text}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    text: e.target.value.trim(),
                  }))
                }
              />
            </label>

            <button onClick={handleDownload}>⬇ Download CSV</button>
          </div>
        </div>

        {/* Scrollable Table Container */}
        <div className="table-container" ref={tableContainerRef}>
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>pH</th>
                <th>Turbidity</th>
                <th>Temperature (°C)</th>
                <th>TDS (ppm)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {currentData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">
                    No data available.
                  </td>
                </tr>
              ) : (
                currentData.map((entry, index) => (
                  <tr key={index} className={isSafe(entry) ? "safe" : "unsafe"}>
                    <td>{new Date(entry.created_at).toLocaleString()}</td>
                    <td>{entry.ph}</td>
                    <td>{entry.turbidity}</td>
                    <td>{entry.temperature}</td>
                    <td>{entry.tds}</td>
                    <td>{isSafe(entry) ? "Safe" : "Unsafe"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button onClick={goPrev} disabled={page === 1}>
              Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button onClick={goNext} disabled={page === totalPages}>
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataHistory;