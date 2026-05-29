import api from "../api/axios";

export const getFilters = async () => {
  const res = await api.get("/sales/filters");
  return res.data;
};

export const getSalesByYear = async (year) => {
  const res = await api.get("/sales/by-year", {
    params: { year: year || undefined },
  });
  return res.data;
};

export const getSalesByModel = async (year) => {
  const res = await api.get("/sales/by-model", {
    params: { year: year || undefined },
  });
  return res.data;
};

// Formatters
export const formatNumber = (num) =>
  num ? num.toLocaleString() : "-";

export const formatEuro = (num) => {
  if (num >= 1_000_000_000) return "€" + (num / 1_000_000_000).toFixed(1) + "B";
  if (num >= 1_000_000) return "€" + (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return "€" + (num / 1_000).toFixed(1) + "K";
  return "€" + num;
};

export const formatUnits = (num) => {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num;
};

// Aggregates raw model data into yearly totals
export const aggregateByYear = (data) =>
  Object.values(
    data.reduce((acc, curr) => {
      if (!acc[curr.year]) {
        acc[curr.year] = { year: curr.year, revenue: 0, units: 0 };
      }
      acc[curr.year].revenue += curr.total_revenue;
      acc[curr.year].units += curr.total_units;
      return acc;
    }, {})
  );

// Aggregates raw model data into pie-ready model distribution
export const aggregateByModel = (data) =>
  Object.values(
    data.reduce((acc, curr) => {
      if (!acc[curr.model]) {
        acc[curr.model] = { name: curr.model, value: 0 };
      }
      acc[curr.model].value += curr.total_units;
      return acc;
    }, {})
  );
