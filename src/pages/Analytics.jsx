import { useEffect, useState } from "react";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";

import {
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer
} from "recharts";

export default function Analytics() {
  const { logout } = useAuth();

  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({ years: [] });
  const [selectedYear, setSelectedYear] = useState("");

  useEffect(() => {
    fetchData();
    fetchFilters();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get("/sales/by-model");
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFilters = async () => {
    try {
      const res = await api.get("/sales/filters/");
      setFilters(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Formatters
  const formatEuro = (num) => {
    if (num >= 1_000_000_000) return "€" + (num / 1_000_000_000).toFixed(1) + "B";
    if (num >= 1_000_000) return "€" + (num / 1_000_000).toFixed(1) + "M";
    if (num >= 1_000) return "€" + (num / 1_000).toFixed(1) + "K";
    return "€" + num;
  };

  const formatUnits = (num) => {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
    return num;
  };

  // ALL CHARTS use FULL DATA (no filter)
  const yearly = Object.values(
    data.reduce((acc, curr) => {
      if (!acc[curr.year]) {
        acc[curr.year] = { year: curr.year, revenue: 0, units: 0 };
      }
      acc[curr.year].revenue += curr.total_revenue;
      acc[curr.year].units += curr.total_units;
      return acc;
    }, {})
  );

  // ONLY PIE uses filtered data
  const pieData = selectedYear
    ? data.filter((d) => d.year === Number(selectedYear))
    : data;

  const modelDist = Object.values(
    pieData.reduce((acc, curr) => {
      if (!acc[curr.model]) {
        acc[curr.model] = { name: curr.model, value: 0 };
      }
      acc[curr.model].value += curr.total_units;
      return acc;
    }, {})
  );

  // 10 colors
  const COLORS = [
    "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
    "#06b6d4", "#84cc16", "#f97316", "#ec4899", "#6366f1"
  ];

  return (
    <div className="h-screen flex bg-gray-100">
      <Sidebar logout={logout} />

      <div className="flex-1 flex flex-col">
        <Header title="Sales Analytics" />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-6">

            {/* Revenue Trend */}
            <div className="bg-white p-4 rounded-2xl shadow-sm">
              <h2 className="mb-2 font-semibold text-center">Revenue Trend</h2>
              <div className="w-full h-64">
                <ResponsiveContainer>
                  <LineChart data={yearly} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={formatEuro} />
                    <Tooltip formatter={(value) => formatEuro(value)} />
                    <Line dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Units Trend */}
            <div className="bg-white p-4 rounded-2xl shadow-sm">
              <h2 className="mb-2 font-semibold text-center">Units Trend</h2>
              <div className="w-full h-64">
                <ResponsiveContainer>
                  <BarChart data={yearly} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={formatUnits} />
                    <Tooltip formatter={(value) => formatUnits(value)} />
                    <Bar dataKey="units" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Model Distribution (FILTER ONLY HERE) */}
            <div className="bg-white p-4 rounded-2xl shadow-sm">
              
              {/* Title + Dropdown Row */}
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold">Model Distribution</h2>

                <select
                  className="border rounded-lg px-3 py-1 text-sm"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  <option value="">All</option>
                  {filters.years.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div className="w-full h-72">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={modelDist}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={90}
                      cx="50%"
                      cy="50%"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {modelDist.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>

                    <Tooltip formatter={(value) => formatUnits(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Revenue vs Units */}
            <div className="bg-white p-4 rounded-2xl shadow-sm">
              <h2 className="mb-2 font-semibold text-center">Revenue vs Units</h2>
              <div className="w-full h-64">
                <ResponsiveContainer>
                  <LineChart data={yearly} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={formatEuro} />
                    <Tooltip formatter={(value) => formatEuro(value)} />
                    <Line dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
                    <Line dataKey="units" stroke="#ef4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}