//Import statements
import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
export default function ExpenseModal({
  isOpen,
  onClose,
  mode = "create",
  initial = null,
  onSave,
}) {
  const readOnly = mode === "view";

  const [form, setForm] = useState({
    description: "",
    category: "",
    amount: "",
    firstPaymentDate: "",
    isRecurring: false,
    untilCancelled: false,
    expiryDate: "",
  });

  // Prefill form when modal opens
  useEffect(() => {
    if (!isOpen) return;

    setForm({
      description: initial?.description || "",
      category: initial?.category || "",
      amount: initial?.amount != null ? String(initial.amount) : "",
      firstPaymentDate: initial?.firstPaymentDate
        ? new Date(initial.firstPaymentDate).toISOString().slice(0, 10)
        : "",
      isRecurring: Boolean(initial?.isRecurring),
      untilCancelled: Boolean(initial?.untilCancelled),
      expiryDate: initial?.expiryDate
        ? new Date(initial.expiryDate).toISOString().slice(0, 10)
        : "",
    });
  }, [isOpen, initial]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (readOnly) return onClose();

    const payload = {
      description: form.description.trim(),
      category: form.category,
      amount: parseFloat(form.amount),
      firstPaymentDate: form.firstPaymentDate,
      isRecurring: form.isRecurring,
      untilCancelled: form.untilCancelled,
      expiryDate:
        form.isRecurring && !form.untilCancelled ? form.expiryDate : null,
    };

    if (onSave) {
      await onSave(payload);
    }
  };

  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const minDate = firstDayOfMonth.toISOString().slice(0, 10);

  // Determine the min for expiry date
  let expiryMinDate = form.firstPaymentDate
    ? form.firstPaymentDate
    : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        .toISOString()
        .slice(0, 10);

  return (
    <Modal show={isOpen} onHide={onClose} backdrop="static" centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>
            {mode === "create" && "Add Expense"}
            {mode === "edit" && "Edit Expense"}
            {mode === "view" && "View Expense"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group className="mb-2">
            <Form.Label>Description</Form.Label>
            <Form.Control
              name="description"
              value={form.description}
              onChange={handleChange}
              disabled={readOnly}
              required
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Category</Form.Label>
            <Form.Control
              name="category"
              value={form.category}
              onChange={handleChange}
              disabled={readOnly}
              required
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Amount</Form.Label>
            <Form.Control
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              disabled={readOnly}
              required
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>First Payment Date</Form.Label>
            <Form.Control
              type="date"
              name="firstPaymentDate"
              value={form.firstPaymentDate}
              onChange={handleChange}
              disabled={readOnly}
              min={minDate}
            />
          </Form.Group>

          <Form.Check
            className="mb-2"
            type="checkbox"
            label="Recurring"
            name="isRecurring"
            checked={form.isRecurring}
            onChange={handleChange}
            disabled={readOnly}
          />

          {form.isRecurring && (
            <>
              <Form.Check
                className="mb-2"
                type="checkbox"
                label="Until Canceled"
                name="untilCancelled"
                checked={form.untilCancelled}
                onChange={handleChange}
                disabled={readOnly}
              />

              {!form.untilCancelled && (
                <Form.Group className="mb-2">
                  <Form.Label>Expiry Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="expiryDate"
                    value={form.expiryDate}
                    onChange={handleChange}
                    disabled={readOnly}
                    min={expiryMinDate}
                  />
                </Form.Group>
              )}
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            {readOnly ? "Close" : "Cancel"}
          </Button>

          {!readOnly && (
            <Button type="submit">
              {mode === "edit" ? "Update Expense" : "Save Expense"}
            </Button>
          )}
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
