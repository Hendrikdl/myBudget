//Import statements
import React, { useMemo, useEffect } from "react";
import { Dropdown } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedMonth } from "../redux/uiSlice";

//Function to get current month and add 2 more so app only shows 3 months
function buildMonths(count = 3) {
  const months = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    months.push({
      label: d.toLocaleString("default", { month: "short", year: "numeric" }),
      value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
    });
  }

  return months;
}

export default function DateDropdown() {
  const months = useMemo(() => buildMonths(3), []);
  const selectedMonth = useSelector((state) => state.ui.selectedMonth);
  const dispatch = useDispatch();

  //Initialize redux
  useEffect(() => {
    if (!selectedMonth) {
      dispatch(setSelectedMonth(months[0].value));
    }
  }, [selectedMonth, dispatch, months]);

  const handleSelect = (month) => {
    dispatch(setSelectedMonth(month.value));
  };

  const current = months.find((m) => m.value === selectedMonth) || months[0];

  return (
    <Dropdown align="end">
      <Dropdown.Toggle size="sm" variant="outline-secondary">
        📅 {current.label}
      </Dropdown.Toggle>

      <Dropdown.Menu>
        {months.map((m) => (
          <Dropdown.Item
            key={m.value}
            active={m.value === current.value}
            onClick={() => handleSelect(m)}
          >
            {m.label}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
}
