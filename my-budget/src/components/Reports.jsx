// Import Statements
import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchMonthlyExpenses } from "../redux/expenseSlice";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { selectSelectedMonth } from "../redux/uiSlice";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// ----------------- Helpers -----------------
const formatMoney = (v) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(
    v
  );

const monthKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

const generateLast12Months = (selectedMonth) => {
  if (!selectedMonth) return [];
  const [year, month] = selectedMonth.split("-").map(Number);
  const endDate = new Date(year, month - 1, 1);
  return Array.from(
    { length: 12 },
    (_, i) => new Date(endDate.getFullYear(), endDate.getMonth() - (11 - i), 1)
  );
};

// Color palette for multiple debts
const COLORS = [
  "#dc2626",
  "#2563eb",
  "#16a34a",
  "#f59e0b",
  "#9333ea",
  "#0ea5e9",
];

export default function Reports() {
  const dispatch = useDispatch();
  const selectedMonth = useSelector(selectSelectedMonth);
  const [selectedDebt, setSelectedDebt] = useState("");
  const [chartType, setChartType] = useState("line");

  const months = useMemo(
    () => generateLast12Months(selectedMonth),
    [selectedMonth]
  );

  // Fetch monthly expenses for last 12 months
  useEffect(() => {
    months.forEach((m) => dispatch(fetchMonthlyExpenses(monthKey(m))));
  }, [dispatch, months]);

  // Get expenses from Redux
  const expensesByMonthObject = useSelector((state) => state.expense.byMonth);

  // Transform into array for last 12 months
  const expensesByMonth = useMemo(() => {
    return months.map((m) => {
      const monthStr = monthKey(m);
      return expensesByMonthObject[monthStr]?.items || [];
    });
  }, [expensesByMonthObject, months]);

  // Unique debt descriptions
  const debtDescriptions = useMemo(() => {
    const allItems = expensesByMonth.flat();
    return Array.from(new Set(allItems.map((i) => i.description)));
  }, [expensesByMonth]);

  //Pie data
  const pieData = useMemo(() => {
    if (selectedDebt !== "ALL") return [];

    const totals = {};

    expensesByMonth.flat().forEach((item) => {
      const value = Number(item.amountOverride ?? item.amount ?? 0);
      if (value > 0) {
        totals[item.description] = (totals[item.description] || 0) + value;
      }
    });

    return Object.entries(totals).map(([name, value]) => ({
      name,
      value,
    }));
  }, [selectedDebt, expensesByMonth]);

  // Chart data
  const chartData = useMemo(() => {
    if (!selectedDebt) return [];

    if (selectedDebt === "ALL") {
      return months.map((m, idx) => {
        const dataPoint = {
          month: m.toLocaleString("en-ZA", { month: "short", year: "numeric" }),
        };
        expensesByMonth[idx].forEach((item) => {
          dataPoint[item.description] = Number(
            item.amountOverride ?? item.amount ?? 0
          );
        });
        return dataPoint;
      });
    }

    return months.map((m, idx) => {
      const item = expensesByMonth[idx].find(
        (i) => i.description === selectedDebt
      );
      return {
        month: m.toLocaleString("en-ZA", { month: "short", year: "numeric" }),
        amount: Number(item?.amountOverride ?? item?.amount ?? 0),
      };
    });
  }, [selectedDebt, expensesByMonth, months]);

  // Download PDF
  const downloadPDF = async () => {
    const input = document.getElementById("report-container");
    if (!input) return;

    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "a4",
    });

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`report-${selectedDebt || "all"}-${selectedMonth}.pdf`);
  };

  return (
    <main className="main-container">
      <div className="main-title">
        <h3>REPORTS</h3>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label style={{ marginRight: "1rem" }}>Select Debt:</label>
        <select
          className="dark-mode-select"
          value={selectedDebt}
          onChange={(e) => setSelectedDebt(e.target.value)}
        >
          <option value="">-- Select --</option>
          {debtDescriptions.length > 1 && (
            <option value="ALL">-- All --</option>
          )}
          {debtDescriptions.map((desc) => (
            <option key={desc} value={desc}>
              {desc}
            </option>
          ))}
        </select>

        {selectedDebt === "ALL" && (
          <select
            style={{
              marginLeft: "1rem",
              padding: "0.5rem",
              borderRadius: "6px",
              backgroundColor: "#1d2634",
              color: "white",
              border: "1px solid #333",
            }}
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
          >
            <option value="line">Line Chart</option>
            <option value="pie">Pie Chart</option>
          </select>
        )}

        <button
          onClick={downloadPDF}
          style={{
            marginLeft: "1rem",
            padding: "0.5rem 1rem",
            backgroundColor: "#dc2626",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Download PDF
        </button>
      </div>

      {/* Report Container */}
      <div
        id="report-container"
        style={{ width: "100%", minHeight: 500, padding: "1rem" }}
      >
        {/* Chart */}
        {selectedDebt && chartData.length > 0 && (
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              {selectedDebt === "ALL" && chartType === "pie" ? (
                <PieChart>
                  <Tooltip formatter={(v) => formatMoney(v)} />
                  <Legend />
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {pieData.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              ) : (
                <LineChart data={chartData}>
                  <XAxis dataKey="month" tick={{ fill: "#d1d5db" }} />
                  <YAxis tick={{ fill: "#d1d5db" }} />
                  <Tooltip formatter={(v) => formatMoney(v)} />
                  <Legend />
                  {selectedDebt === "ALL" ? (
                    debtDescriptions.map((desc, idx) => (
                      <Line
                        key={desc}
                        type="monotone"
                        dataKey={desc}
                        stroke={COLORS[idx % COLORS.length]}
                        strokeWidth={2}
                      />
                    ))
                  ) : (
                    <Line dataKey="amount" stroke="#dc2626" strokeWidth={2} />
                  )}
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        )}

        {/* Table */}
        {selectedDebt && chartData.length > 0 && (
          <div style={{ marginTop: "1rem" }}>
            <h4>Monthly Amounts</h4>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                color: "white",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      borderBottom: "1px solid #999",
                      padding: "0.5rem",
                    }}
                  >
                    Month
                  </th>
                  <th
                    style={{
                      borderBottom: "1px solid #999",
                      padding: "0.5rem",
                    }}
                  >
                    Date
                  </th>
                  {selectedDebt === "ALL" ? (
                    debtDescriptions.map((desc) => (
                      <th
                        key={desc}
                        style={{
                          borderBottom: "1px solid #999",
                          padding: "0.5rem",
                        }}
                      >
                        {desc}
                      </th>
                    ))
                  ) : (
                    <th
                      style={{
                        borderBottom: "1px solid #999",
                        padding: "0.5rem",
                      }}
                    >
                      {selectedDebt}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {months.map((m, idx) => {
                  // ---- Determine if this row should be shown ----
                  if (selectedDebt === "ALL") {
                    const hasAnyValue = debtDescriptions.some((desc) => {
                      const item = expensesByMonth[idx].find(
                        (i) => i.description === desc
                      );
                      const value = Number(
                        item?.amountOverride ?? item?.amount ?? 0
                      );
                      return value > 0;
                    });
                    if (!hasAnyValue) return null;
                  } else {
                    const item = expensesByMonth[idx].find(
                      (i) => i.description === selectedDebt
                    );
                    const value = Number(
                      item?.amountOverride ?? item?.amount ?? 0
                    );
                    if (value <= 0) return null;
                  }

                  // ---- Render row ----
                  return (
                    <tr key={idx} style={{ textAlign: "center" }}>
                      <td
                        style={{
                          borderBottom: "1px solid #555",
                          padding: "0.5rem",
                        }}
                      >
                        {m.toLocaleString("en-ZA", {
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid #555",
                          padding: "0.5rem",
                        }}
                      >
                        {m.toISOString().split("T")[0]}
                      </td>

                      {selectedDebt === "ALL" ? (
                        debtDescriptions.map((desc) => {
                          const item = expensesByMonth[idx].find(
                            (i) => i.description === desc
                          );
                          const value = Number(
                            item?.amountOverride ?? item?.amount ?? 0
                          );
                          return (
                            <td
                              key={desc}
                              style={{
                                borderBottom: "1px solid #555",
                                padding: "0.5rem",
                              }}
                            >
                              {value > 0 ? formatMoney(value) : ""}
                            </td>
                          );
                        })
                      ) : (
                        <td
                          style={{
                            borderBottom: "1px solid #555",
                            padding: "0.5rem",
                          }}
                        >
                          {formatMoney(
                            expensesByMonth[idx].find(
                              (i) => i.description === selectedDebt
                            )?.amountOverride ??
                              expensesByMonth[idx].find(
                                (i) => i.description === selectedDebt
                              )?.amount ??
                              0
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
