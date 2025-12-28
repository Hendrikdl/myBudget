//Modal for add, delete, edit, view all Income for the given month
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Modal, Form, Button } from 'react-bootstrap';


//global identifiers in an array
const FREQUENCIES = ['Weekly', 'Bi-Weekly', 'Monthly', 'Once-off'];
const TYPES = ['Income', 'Commission', 'Gifts', 'Inheritance', 'Investments'];

export default function AddIncomeModal({
  show,
  onHide,
  onSave,
  initial,
  selectedMonth,
}) {
  const [form, setForm] = useState({
    company: '',
    frequency: FREQUENCIES[0],
    category: TYPES[0],
    amount: '',
    date: '',
  });

  const [errors, setErrors] = useState({});

  // If user want to edit or view an item get detail from the MongoDB
  useEffect(() => {
    if (!show) return;

    setForm({
      company: initial?.company || '',
      frequency: initial?.frequency || FREQUENCIES[0],
      category: initial?.category || TYPES[0],
      amount: initial?.amount ?? '',
      date:
        initial?.date?.slice(0, 10) ||
        (selectedMonth ? `${selectedMonth}-01` : new Date().toISOString().slice(0, 10)),
    });

    setErrors({});
  }, [show, initial, selectedMonth]);

  //If client is adding a new Income field, validate before sending to backend
  const validate = () => {
    const nextErrors = {};

    if (!form.company.trim()) nextErrors.company = 'Company is required';
    if (!form.amount || isNaN(form.amount))
      nextErrors.amount = 'Amount must be a valid number';
    if (Number(form.amount) <= 0)
      nextErrors.amount = 'Amount must be greater than 0';
    if (!form.date) nextErrors.date = 'Date is required';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      _id: initial?._id,
      company: form.company.trim(),
      frequency: form.frequency,
      category: form.category,
      amount: Number(form.amount),
      date: form.date,
    });
  };

  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const minDate = firstDayOfMonth.toISOString().slice(0, 10);

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static">
      <Form onSubmit={handleSubmit} noValidate>
        <Modal.Header closeButton>
          <Modal.Title>{initial ? 'Edit Income' : 'Add Income'}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {/* Company */}
          <Form.Group className="mb-3">
            <Form.Label>Company</Form.Label>
            <Form.Control
              name="company"
              value={form.company}
              onChange={handleChange}
              isInvalid={!!errors.company}
              required
            />
            <Form.Control.Feedback type="invalid">
              {errors.company}
            </Form.Control.Feedback>
          </Form.Group>

          {/* Frequency */}
          <Form.Group className="mb-3">
            <Form.Label>Frequency</Form.Label>
            <Form.Select
              name="frequency"
              value={form.frequency}
              onChange={handleChange}
            >
              {FREQUENCIES.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {/* Category */}
          <Form.Group className="mb-3">
            <Form.Label>Category</Form.Label>
            <Form.Select
              name="category"
              value={form.category}
              onChange={handleChange}
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {/* Date */}
          <Form.Group className="mb-3">
            <Form.Label>Date</Form.Label>
            <Form.Control
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              isInvalid={!!errors.date}
              required
              min={minDate}
            />
            <Form.Control.Feedback type="invalid">
              {errors.date}
            </Form.Control.Feedback>
          </Form.Group>

          {/* Amount */}
          <Form.Group className="mb-3">
            <Form.Label>Amount</Form.Label>
            <Form.Control
              type="number"
              name="amount"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={handleChange}
              isInvalid={!!errors.amount}
              required
            />
            <Form.Control.Feedback type="invalid">
              {errors.amount}
            </Form.Control.Feedback>
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button type="submit">
            {initial ? 'Save Changes' : 'Add Income'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

AddIncomeModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  initial: PropTypes.object,
  selectedMonth: PropTypes.string,
};
