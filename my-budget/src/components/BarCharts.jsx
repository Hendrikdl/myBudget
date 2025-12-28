//BarChart - get data from mongoDB and global states
import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectSelectedMonth } from "../redux/uiSlice";
import { selectIncomeItems } from "../redux/incomeSlice";
import { fetchMonthlyExpenses } from "../redux/expenseSlice";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

//format currency
const formatMoney = (v) =>
  new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
  }).format(Number(v || 0));

const parseMonth = (value) => {
  if (!value) return null;
  const [y, m] = value.split("-").map(Number);
  if (!y || !m) return null;
  return new Date(y, m - 1, 1);
};

const monthKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

export default function BarCharts() {
  const dispatch = useDispatch();

  const selectedMonth = useSelector(selectSelectedMonth);
  const incomeItems = useSelector(selectIncomeItems);
  const expenseByMonth = useSelector((state) => state.expense.byMonth || {});

  //Get last 6 months data
  const months = useMemo(() => {
    const base = parseMonth(selectedMonth);
    if (!base) return [];

    return Array.from(
      { length: 6 },
      (_, i) => new Date(base.getFullYear(), base.getMonth() - (5 - i), 1)
    );
  }, [selectedMonth]);

  //Fetch last 6 months expenses
  useEffect(() => {
    if (!months.length) return;

    months.forEach((d) => {
      dispatch(fetchMonthlyExpenses(monthKey(d)));
    });
  }, [dispatch, months]);

  //add the data to the chart
  const data = useMemo(() => {
    if (!months.length) return [];

    return months.map((d) => {
      const key = monthKey(d);

      const income = incomeItems.reduce((sum, i) => {
        const date = i.date || i.createdAt;
        if (!date) return sum;

        const k = monthKey(new Date(date));
        return k === key ? sum + Number(i.amount || 0) : sum;
      }, 0);

      const expenses = expenseByMonth[key]?.totals?.total ?? 0;

      return {
        month: d.toLocaleString("en-ZA", {
          month: "short",
          year: "numeric",
        }),
        Income: income,
        Expenditure: expenses,
      };
    });
  }, [months, incomeItems, expenseByMonth]);

  //Show the chart
  return (
    <div style={{ padding: 16, borderRadius: 12 }}>
      <h3 style={{ marginBottom: 8 }}>Income vs Expenditure (last 6 months)</h3>

      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={formatMoney} />
          <Legend />

          <Bar dataKey="Income" fill="#16a34a" radius={[6, 6, 0, 0]} />
          <Bar dataKey="Expenditure" fill="#dc2626" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
