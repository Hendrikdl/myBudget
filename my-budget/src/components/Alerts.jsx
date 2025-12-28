//Imports
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectAlerts,
  selectUnreadCount,
  toggleRead,
  deleteAlert,
  addAlert,
} from "../redux/alertSlice";
import {
  selectMonthlyByMonth,
  checkToleranceAlert,
  fetchExistingMonthlyExpenses,
} from "../redux/monthlyExpenseSlice";
import { selectTolerance } from "../redux/settingsSlice";
import { selectSelectedMonth } from "../redux/uiSlice";

// Get previous month as YYYY-MM
function getPreviousMonth(monthStr) {
  if (!monthStr) return null;
  const [year, month] = monthStr.split("-").map(Number);
  let prevYear = year;
  let prevMonth = month - 1;
  if (prevMonth === 0) {
    prevMonth = 12;
    prevYear -= 1;
  }
  return `${prevYear}-${prevMonth.toString().padStart(2, "0")}`;
}

export default function Alerts() {
  const dispatch = useDispatch();

  // Redux selectors
  const alerts = useSelector(selectAlerts);
  const unreadCount = useSelector(selectUnreadCount);
  const byMonth = useSelector(selectMonthlyByMonth);
  const tolerance = useSelector(selectTolerance);
  const selectedMonth = useSelector(selectSelectedMonth);

  const previousMonth = getPreviousMonth(selectedMonth);

  //check mongodb for previous month data
  useEffect(() => {
    if (!selectedMonth) return;
    if (!byMonth?.[selectedMonth]) {
      dispatch(fetchExistingMonthlyExpenses(selectedMonth));
    }
    if (previousMonth && !byMonth?.[previousMonth]) {
      dispatch(fetchExistingMonthlyExpenses(previousMonth));
    }
  }, [selectedMonth, previousMonth, byMonth, dispatch]);

  //generate a new alert
  const existingAlertKeys = alerts.map((a) => a.id);

  const newAlerts =
    selectedMonth &&
    previousMonth &&
    byMonth?.[selectedMonth] &&
    byMonth?.[previousMonth]
      ? checkToleranceAlert(
          byMonth,
          selectedMonth,
          previousMonth,
          tolerance,
          existingAlertKeys
        ).map((alert) => ({
          ...alert,
          name: alert.name || alert.description || alert.category || "Unknown",
          month: alert.month || selectedMonth,
          read: false, // default unread
          diffPercent:
            alert.diffPercent ??
            (
              ((alert.currAmount - alert.prevAmount) / alert.prevAmount) *
              100
            ).toFixed(2),
        }))
      : [];

  //Dispatch the new alert
  useEffect(() => {
    if (newAlerts.length > 0) {
      newAlerts.forEach((alert) => dispatch(addAlert(alert)));
    }
  }, [newAlerts, dispatch]);

  const handleToggleRead = (id) => dispatch(toggleRead(id));
  const handleDelete = (id) => dispatch(deleteAlert(id));

  return (
    <div className="main-container">
      <div className="alerts-header">
        <h2>Alerts</h2>
        <div className="meta">
          <span className="badge">{unreadCount} unread</span>
        </div>
      </div>

      <div className="table-wrap">
        <table className="alerts-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Prev Amount</th>
              <th>Current Amount</th>
              <th>Diff %</th>
              <th>Month</th>
              <th>Read?</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {alerts.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", opacity: 0.7 }}>
                  No alerts
                </td>
              </tr>
            ) : (
              alerts.map((alert) => (
                <tr key={alert.id} className={!alert.read ? "unread" : ""}>
                  <td>{alert.name}</td>
                  <td>{alert.prevAmount}</td>
                  <td>{alert.currAmount}</td>
                  <td>{alert.diffPercent}%</td>
                  <td>{alert.month}</td>
                  <td>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={alert.read}
                        onChange={() => handleToggleRead(alert.id)}
                      />
                      <span>{alert.read ? "Read" : "Unread"}</span>
                    </label>
                  </td>
                  <td>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(alert.id)}
                      aria-label={`Delete alert ${alert.name}`}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
