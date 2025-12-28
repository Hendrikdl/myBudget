//Import Statements - Home will show all debit/credit/balance and graphs
import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { BsListCheck } from "react-icons/bs";
import { FcBullish, FcBearish, FcCurrencyExchange } from "react-icons/fc";

import BarCharts from "./BarCharts";
import LineCharts from "./LineCharts";

import { selectSelectedMonth } from "../redux/uiSlice";
import { selectIncomeItems } from "../redux/incomeSlice";
import { fetchExpenses } from "../redux/expenseSlice";
import { fetchIncomes } from "../redux/incomeSlice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import FirstTimeGuideModal from "./FirstTimeGuideModal";

//Format money - R for Rand
const formatMoney = (v) =>
  new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
  }).format(Number(v || 0));

function parseMonthValue(value) {
  if (!value) return null;
  const [year, month] = value.split("-").map(Number);
  if (!year || isNaN(month)) return null;
  return { year, monthIndex: month - 1 };
}

function monthRange({ year, monthIndex }) {
  const start = new Date(year, monthIndex, 1).getTime();
  const end = new Date(year, monthIndex + 1, 1).getTime();
  return [start, end];
}

export default function Home() {
  const selectedMonth = useSelector(selectSelectedMonth);

  //Expense totals
  const expenseTotals = useSelector(
    (state) => state.expense?.totals ?? { total: 0 }
  );

  // Income Totalss
  const incomeItems = useSelector(selectIncomeItems);

  // Alerts
  const unreadCount = useSelector((state) => state.alert?.unreadCount ?? 0);

  const monthObj = parseMonthValue(selectedMonth);

  const dispatch = useDispatch();

  // Load income and expenditure on start of the app
  useEffect(() => {
    if (!selectedMonth) return;

    dispatch(fetchExpenses());
    dispatch(fetchIncomes());
  }, [dispatch, selectedMonth]);

  //Filter income by month
  const filteredIncome = useMemo(() => {
    if (!monthObj) return incomeItems;

    const [start, end] = monthRange(monthObj);

    return incomeItems.filter((i) => {
      const ts = new Date(i.date || i.createdAt).getTime();
      return ts >= start && ts < end;
    });
  }, [incomeItems, monthObj]);

  //Set total income
  const totalIncome = useMemo(
    () => filteredIncome.reduce((sum, i) => sum + Number(i.amount || 0), 0),
    [filteredIncome]
  );

  const totalExpenses = Number(expenseTotals.total || 0);
  const balance = totalIncome - totalExpenses;

  /* ======================
     Render
  ====================== */
  return (
    <main className="main-container">
      <FirstTimeGuideModal />

      <div className="main-title">
        <h3>DASHBOARD</h3>
      </div>

      <div className="dashboard-cards">
        <div className="dashboard-card balance">
          <h3>BALANCE</h3>
          <FcCurrencyExchange className="card_icon" />
          <h1>{formatMoney(balance)}</h1>
        </div>

        <div className="dashboard-card expenses">
          <h3>EXPENSES</h3>
          <FcBearish className="card_icon" />
          <h1>{formatMoney(totalExpenses)}</h1>
        </div>

        <div className="dashboard-card savings">
          <h3>INCOME</h3>
          <FcBullish className="card_icon" />
          <h1>{formatMoney(totalIncome)}</h1>
        </div>
      </div>
      <div
        className="charts"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div style={{ flex: "1 1 400px", minWidth: "300px", height: "300px" }}>
          <BarCharts />
        </div>

        <div style={{ flex: "1 1 400px", minWidth: "300px", height: "300px" }}>
          <LineCharts />
        </div>
      </div>
    </main>
  );
}
