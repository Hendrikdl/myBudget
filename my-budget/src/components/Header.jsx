//Header that will show the logged in user - logout button, data dropdown and alert
//Import statements
import React, { useEffect } from "react";
import { BsFillBellFill, BsPersonCircle } from "react-icons/bs";
import { FcMenu } from "react-icons/fc";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import DateDropdown from "./DateDropdown";

import { logout } from "../redux/userSlice";
import { selectUnreadCount } from "../redux/alertSlice";
import { selectSelectedMonth } from "../redux/uiSlice";
import {
  selectMonthlyByMonth,
  fetchExistingMonthlyExpenses,
} from "../redux/monthlyExpenseSlice";

import { selectTheme, setThemeLocal, saveTheme } from "../redux/settingsSlice";

//Get previous month
function getPreviousMonth(monthStr) {
  if (!monthStr) return null;
  const [year, month] = monthStr.split("-").map(Number);
  let prevYear = year;
  let prevMonth = month - 1;
  if (prevMonth === 0) {
    prevMonth = 12;
    prevYear -= 1;
  }
  return `${prevYear}-${String(prevMonth).padStart(2, "0")}`;
}

export default function Header({ OpenSidebar }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const selectedMonth = useSelector(selectSelectedMonth);
  const previousMonth = getPreviousMonth(selectedMonth);

  const byMonth = useSelector(selectMonthlyByMonth);
  const unreadCount = useSelector(selectUnreadCount);
  const hasUnread = unreadCount > 0;

  const user = useSelector((state) => state.user.user);
  const theme = useSelector(selectTheme);

  /* ======================
     Load current + previous month
  ====================== */
  useEffect(() => {
    if (!selectedMonth) return;

    if (!byMonth?.[selectedMonth]) {
      dispatch(fetchExistingMonthlyExpenses(selectedMonth));
    }

    if (previousMonth && !byMonth?.[previousMonth]) {
      dispatch(fetchExistingMonthlyExpenses(previousMonth));
    }
  }, [selectedMonth, previousMonth, byMonth, dispatch]);

  /* ======================
     Apply theme to DOM
  ====================== */
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  /* ======================
     Handlers
  ====================== */
  const onLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    dispatch(setThemeLocal(nextTheme)); // instant UI
    dispatch(saveTheme(nextTheme)); // backend sync
  };

  /* ======================
     Render
  ====================== */
  return (
    <header className="header">
      {/* Left */}
      <div className="header-left">
        <FcMenu className="icon" onClick={OpenSidebar} />
      </div>

      {/* Right */}
      <div className="header-right">
        {/* Alerts */}
        <div className={`bell ${hasUnread ? "bell--alert" : ""}`}>
          <BsFillBellFill className="icon" />
          {hasUnread && <span className="badge">{unreadCount}</span>}
        </div>

        {/* User */}
        <BsPersonCircle className="icon" />
        {user && (
          <span className="mx-2">
            {user.firstName || user.name || ""} {user.lastName || ""}
          </span>
        )}

        {/* Month */}
        <DateDropdown className="dropdownIcon" />

        {/* Theme */}
        <button
          onClick={toggleTheme}
          className="theme-toggle"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? "🌙" : "☀️"}
        </button>

        {/* Logout */}
        <button className="btn btn-secondary" onClick={onLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}
