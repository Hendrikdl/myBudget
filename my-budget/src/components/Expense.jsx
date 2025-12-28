//Import Statements
import React, { useEffect, useMemo, useState, useRef } from "react";
import { Table, Form } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchExpenses,
  updateExpenseMongoDB,
  selectExpenseItems,
} from "../redux/expenseSlice";
import { selectSelectedMonth } from "../redux/uiSlice";
import { debounce } from "lodash";

//Format currency
const formatMoney = (v) =>
  new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
  }).format(Number(v || 0));

//Table that can be re-used
function ExpenseTable({
  title,
  items,
  draftAmounts,
  onChangeAmount,
  onToggleInclude,
}) {
  if (!items.length) return null;

  const subtotal = items.reduce(
    (sum, e) =>
      e.included ? sum + Number(e.amountOverride ?? e.amount ?? 0) : sum,
    0
  );

  return (
    <>
      <h5 className="section-title mt-4">{title}</h5>
      <p>
        Unchecked items are skipped for this month but kept for tracking
        purposes.
      </p>
      <Table size="sm" className="table-table">
        <thead className="">
          <tr>
            <th>Include</th>
            <th>Description</th>
            <th>Amount</th>
            <th>Date</th>
          </tr>
        </thead>

        <tbody>
          {items.map((e) => (
            <tr key={e._id}>
              <td>
                <Form.Check
                  type="checkbox"
                  checked={e.included}
                  onChange={(evt) => onToggleInclude(e._id, evt.target.checked)}
                />
              </td>

              <td>{e.description}</td>

              <td>
                <Form.Control
                  type="number"
                  size="sm"
                  disabled={!e.included}
                  value={draftAmounts[e._id] ?? e.amountOverride ?? e.amount}
                  onChange={(evt) => onChangeAmount(e._id, evt.target.value)}
                />
              </td>

              <td>
                {e.expiryDate
                  ? new Date(e.expiryDate).toLocaleDateString()
                  : e.firstPaymentDate
                  ? new Date(e.firstPaymentDate).toLocaleDateString()
                  : "-"}
              </td>
            </tr>
          ))}
        </tbody>

        <tfoot>
          <tr>
            <td colSpan={4} className="text-end section-subtotal">
              Subtotal: {formatMoney(subtotal)}
            </td>
          </tr>
        </tfoot>
      </Table>
    </>
  );
}

/* =========================
   Main page
   ========================= */
export default function Expense() {
  const dispatch = useDispatch();
  const expenseItems = useSelector(selectExpenseItems);
  const selectedMonth = useSelector(selectSelectedMonth);
  const totals = useSelector((state) => state.expense.totals);
  const monthlyId = useSelector((state) => state.expense.monthlyId);

  // Local draft state (for smooth typing)
  const [draftAmounts, setDraftAmounts] = useState({});

  const handleToggleInclude = (templateId, included) => {
    if (!monthlyId) return;

    debouncedSave({
      monthlyId,
      templateId,
      data: { included },
    });
  };

  /* =========================
     Fetch on month change
     ========================= */
  useEffect(() => {
    if (selectedMonth) {
      dispatch(fetchExpenses());
    }
  }, [dispatch, selectedMonth]);

  /* =========================
     Debounced backend save
     ========================= */
  const debouncedSave = useRef(
    debounce((payload) => {
      dispatch(updateExpenseMongoDB(payload));
    }, 1000)
  ).current;

  /* =========================
     Clear drafts after sync
     ========================= */
  useEffect(() => {
    setDraftAmounts({});
  }, [expenseItems]);

  /* =========================
     Handlers
     ========================= */
  const handleChangeAmount = (templateId, value) => {
    if (!monthlyId) return;

    setDraftAmounts((prev) => ({
      ...prev,
      [templateId]: value,
    }));

    debouncedSave({
      monthlyId,
      templateId,
      data: {
        amountOverride: value === "" ? null : Number(value),
      },
    });
  };

  /* =========================
     Grouping
     ========================= */
  const onceOffExpenses = expenseItems.filter((e) => !e.isRecurring);

  const recurringWithExpiry = expenseItems.filter(
    (e) => e.isRecurring && e.expiryDate
  );

  const recurringUntilCancelled = expenseItems.filter(
    (e) => e.isRecurring && !e.expiryDate
  );

  // ===== Check if there is any data =====
  const hasExpenses =
    onceOffExpenses.length > 0 ||
    recurringWithExpiry.length > 0 ||
    recurringUntilCancelled.length > 0;

  return (
    <div className="main-container">
      <div className="d-flex justify-content-between mb-3">
        <h3>Expenses</h3>
        <strong className="fs-5">Total: {formatMoney(totals.total)}</strong>
      </div>

      {!hasExpenses && (
        <div style={{ padding: "1rem", borderRadius: "6px" }}>
          <p>
            No expense data found for the selected month. Please make sure you
            have selected the correct month at the top.
          </p>
          <p>
            If the month is correct but still no data, it means no debt
            templates have been loaded. Kindly go to the{" "}
            <strong>Settings</strong> tab and load a template first.
          </p>
        </div>
      )}

      {hasExpenses && (
        <>
          <ExpenseTable
            title="Once-off Expenses"
            items={onceOffExpenses}
            draftAmounts={draftAmounts}
            onChangeAmount={handleChangeAmount}
            onToggleInclude={handleToggleInclude}
          />

          <ExpenseTable
            title="Recurring Expenses (With Expiry)"
            items={recurringWithExpiry}
            draftAmounts={draftAmounts}
            onChangeAmount={handleChangeAmount}
            onToggleInclude={handleToggleInclude}
          />

          <ExpenseTable
            title="Recurring Expenses (Until Cancelled)"
            items={recurringUntilCancelled}
            draftAmounts={draftAmounts}
            onChangeAmount={handleChangeAmount}
            onToggleInclude={handleToggleInclude}
          />
        </>
      )}
    </div>
  );
}
