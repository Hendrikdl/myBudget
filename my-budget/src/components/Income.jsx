//Imports Statements -> Income get all income for the selected month or add and save it to MongoDB
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchIncomes,
  addIncomeMongoDB,
  updateIncomeMongoDB,
  deleteIncomeMongoDB,
  selectIncomeItems,
} from "../redux/incomeSlice";
import { selectSelectedMonth } from "../redux/uiSlice";
import { Table, Button } from "react-bootstrap";
import { BsPencilSquare, BsTrash } from "react-icons/bs";
import AddIncomeModal from "../components/AddIncomeModal";

const formatMoney = (v) =>
  new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
  }).format(Number(v || 0));

function parseMonth(value) {
  if (!value) return null;
  const [year, month] = value.split("-").map(Number);
  return {
    start: new Date(year, month - 1, 1).getTime(),
    end: new Date(year, month, 1).getTime(),
  };
}

export default function Income() {
  const dispatch = useDispatch();
  const selectedMonth = useSelector(selectSelectedMonth);
  const incomeItems = useSelector(selectIncomeItems);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    dispatch(fetchIncomes());
  }, [dispatch]);

  const monthRange = parseMonth(selectedMonth);

  const filteredIncome = useMemo(() => {
    if (!monthRange) return incomeItems;
    return incomeItems.filter((i) => {
      const ts = new Date(i.date || i.createdAt).getTime();
      return ts >= monthRange.start && ts < monthRange.end;
    });
  }, [incomeItems, monthRange]);

  const totalIncome = useMemo(
    () => filteredIncome.reduce((sum, i) => sum + Number(i.amount || 0), 0),
    [filteredIncome]
  );

  const handleSave = async (formData) => {
    const payload = {
      company: formData.company,
      category: formData.category,
      frequency: formData.frequency,
      amount: Number(formData.amount),
      date:
        formData.date ||
        (selectedMonth
          ? `${selectedMonth}-01T00:00:00.000Z`
          : new Date().toISOString()),
    };

    if (editing?._id) {
      await dispatch(
        updateIncomeMongoDB({ id: editing._id, patch: payload })
      ).unwrap();
    } else {
      await dispatch(addIncomeMongoDB(payload)).unwrap();
    }

    setModalOpen(false);
    setEditing(null);
  };

  const handleDelete = async (item) => {
    if (window.confirm("Delete this income record?")) {
      await dispatch(deleteIncomeMongoDB(item._id)).unwrap();
    }
  };

  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const minDate = firstDayOfMonth.toISOString().slice(0, 10);

  return (
    <div className="main-container">
      <div className="d-flex justify-content-between mb-3">
        <h3 className="text-color">Income</h3>
        <div>
          <strong className="me-3 text-color">
            Total: {formatMoney(totalIncome)}
          </strong>
          <Button onClick={() => setModalOpen(true)}>Add Income</Button>
        </div>
      </div>

      <Table striped bordered hover size="sm">
        <thead>
          <tr>
            <th>Company</th>
            <th>Frequency</th>
            <th>Category</th>
            <th>Amount</th>
            <th>Date</th>
            <th />
            <th />
          </tr>
        </thead>
        <tbody>
          {filteredIncome.length === 0 ? (
            <tr>
              <td colSpan={7} className="table-dark-custom text-center">
                No income records
              </td>
            </tr>
          ) : (
            filteredIncome.map((i) => (
              <tr key={i._id}>
                <td>{i.company}</td>
                <td>{i.frequency}</td>
                <td>{i.category}</td>
                <td>{formatMoney(i.amount)}</td>
                <td>{new Date(i.date).toLocaleDateString()}</td>
                <td>
                  <Button
                    size="sm"
                    onClick={() => {
                      setEditing(i);
                      setModalOpen(true);
                    }}
                  >
                    <BsPencilSquare />
                  </Button>
                </td>
                <td>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDelete(i)}
                  >
                    <BsTrash />
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      <AddIncomeModal
        show={modalOpen}
        onHide={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSave={handleSave}
        initial={editing}
        selectedMonth={selectedMonth}
      />
    </div>
  );
}
