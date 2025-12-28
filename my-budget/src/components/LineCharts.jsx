// Import Statements - loaded on Home Screen
import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectSelectedMonth } from "../redux/uiSlice";
import { selectIncomeItems } from "../redux/incomeSlice";
import { fetchMonthlyExpenses } from "../redux/expenseSlice";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function parseMonth(value) {
  if (!value) return null;
  const [y, m] = value.split("-").map(Number);
  return new Date(y, m - 1, 1);
}

function monthKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function LineCharts() {
  const dispatch = useDispatch();
  const selectedMonth = useSelector(selectSelectedMonth);
  const incomeItems = useSelector(selectIncomeItems);
  const expensesByMonth = useSelector((s) => s.expense.byMonth);

  const months = useMemo(() => {
    const base = parseMonth(selectedMonth);
    if (!base) return [];

    return Array.from(
      { length: 6 },
      (_, i) => new Date(base.getFullYear(), base.getMonth() - (5 - i), 1)
    );
  }, [selectedMonth]);

  useEffect(() => {
    months.forEach((d) => dispatch(fetchMonthlyExpenses(monthKey(d))));
  }, [dispatch, months]);

  const data = useMemo(() => {
    return months.map((d) => {
      const key = monthKey(d);

      return {
        month: d.toLocaleString("en-ZA", {
          month: "short",
          year: "numeric",
        }),
        Income: incomeItems.reduce(
          (s, i) =>
            monthKey(new Date(i.date || i.createdAt)) === key
              ? s + Number(i.amount || 0)
              : s,
          0
        ),
        Expenses: expensesByMonth[key]?.totals?.total ?? 0,
      };
    });
  }, [months, incomeItems, expensesByMonth]);

  if (!selectedMonth) return null;

  return (
    <div style={{ padding: 16, borderRadius: 12 }}>
      <h3 style={{ marginBottom: 8 }}>Income vs Expenses (Last 6 Months)</h3>

      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="Income"
            stroke="#16a34a"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="Expenses"
            stroke="#dc2626"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
