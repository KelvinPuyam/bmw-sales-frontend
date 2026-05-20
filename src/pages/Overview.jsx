import { useEffect, useState, useRef } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Card from "../components/Card";

export default function Overview() {
  const { logout } = useAuth();

  const [summary, setSummary] = useState([]);
  const [models, setModels] = useState([]);
  const [filters, setFilters] = useState({ years: [] });
  const [selectedYear, setSelectedYear] = useState("");
  const [search, setSearch] = useState("");

  const cacheRef = useRef({});

  // Fetch filters once
  useEffect(() => {
    api.get("/sales/filters")
      .then((res) => setFilters(res.data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    fetchData();
  }, [selectedYear]);

  const fetchData = async () => {
    const cacheKey = `overview-${selectedYear}`;

    if (cacheRef.current[cacheKey]) {
      //console.log("FE cache hit");
      const cached = cacheRef.current[cacheKey];
      setSummary(cached.summary);
      setModels(cached.models);
      return;
    }

    try {
      const [summaryRes, modelRes] = await Promise.all([
        api.get("/sales/by-year", {
          params: { year: selectedYear || undefined },
        }),
        api.get("/sales/by-model", {
          params: { year: selectedYear || undefined },
        }),
      ]);

      cacheRef.current[cacheKey] = {
        summary: summaryRes.data,
        models: modelRes.data,
      };

      setSummary(summaryRes.data);
      setModels(modelRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Backend always returns exactly one row:
  //   - specific year selected → that year's aggregated row
  //   - no year selected ("All Years") → one row aggregated across all years (year: 0)
  const latest = summary[0] ?? null;

  const formatNumber = (num) =>
    num ? num.toLocaleString() : "-";

  // Label shown in card headers — "2024" or "All Years"
  const yearLabel = selectedYear ? selectedYear : "All Years";

  // Search filter
  const filteredModels = models.filter((m) =>
    m.model.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-screen flex bg-gray-100">
      <Sidebar logout={logout} />

      <div className="flex-1 flex flex-col">
        <Header
          title="Sales Overview"
          filters={filters}
          setSelectedYear={setSelectedYear}
        />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* KPI */}
          {latest && (
            <div className="grid grid-cols-4 gap-6">
              <Card title="Total Units" value={formatNumber(latest.total_units)} />
              <Card title="Revenue (€)" value={formatNumber(latest.total_revenue)} />
              <Card title="Avg Price (€)" value={formatNumber(latest.avg_price_eur)} />
              <Card title="BEV Share (%)" value={formatNumber(latest.avg_bev_share)} />
            </div>
          )}

          {/* Table */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">

            {/* Header Row with Search */}
            <div className="flex items-center gap-4 p-4 border-b">
              <h3 className="text-lg font-semibold">
                Model Performance
              </h3>

              <input
                type="text"
                placeholder="Search model..."
                className="border p-2 rounded-lg w-64 ml-4"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-gray-50 border-b">
                  <tr>
                    <th className="p-3">Model</th>
                    <th className="p-3">Year</th>
                    <th className="p-3">Units</th>
                    <th className="p-3">Revenue (€)</th>
                    <th className="p-3">Avg Price (€)</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredModels.length > 0 ? (
                    filteredModels.map((m, i) => (
                      <tr key={i} className="border-b hover:bg-gray-50">
                        <td className="p-3">{m.model}</td>
                        <td className="p-3">{m.year}</td>
                        <td className="p-3">{formatNumber(m.total_units)}</td>
                        <td className="p-3">{formatNumber(m.total_revenue)}</td>
                        <td className="p-3">{formatNumber(m.avg_price_eur)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="p-4 text-center text-gray-500">
                        No results
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </main>

        <Footer />
      </div>
    </div>
  );
}