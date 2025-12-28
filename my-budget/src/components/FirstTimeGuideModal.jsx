//Modal that will pop up if user registers first time or visit home.  Can set to cancel
import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";

export default function FirstTimeGuideModal() {
  const [show, setShow] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    const hidden = localStorage.getItem("hideBudgetGuide");
    if (!hidden) setShow(true);
  }, []);

  const handleClose = () => {
    if (dontShowAgain) localStorage.setItem("hideBudgetGuide", "true");
    setShow(false);
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      size="lg" // Desktop-friendly width
      fullscreen="sm-down" // Fullscreen on mobile
      scrollable // Enables internal scroll
      backdropClassName="modal-backdrop-dark"
      contentClassName="dark-modal"
    >
      <Modal.Header
        closeButton
        style={{ backgroundColor: "#1d2634", color: "white" }}
      >
        <Modal.Title style={{ backgroundColor: "#1d2634", color: "white" }}>
          Welcome to the Budget System
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ backgroundColor: "#1d2634", color: "white" }}>
        <ol className="guide-list">
          <li>Set your monthly income on the Income page.</li>
          <li>Add recurring and one-off expenses on the Settings page.</li>
          <li>Adjust or manage your monthly budget on the Expense page.</li>
          <li>
            Monthly debt is automatically included based on your templates.
          </li>
          <li>Select the budget month using the date dropdown (top right).</li>
          <li>View your balance and summary charts on the Dashboard.</li>
          <li>Analyze income vs expenses using the charts.</li>
          <li>You can update any entry at any time.</li>
          <li>Remove debt templates in Settings if no longer needed.</li>
          <li>Switch light/dark mode in Settings or from the header.</li>
          <li>Set your spending threshold in Settings.</li>
          <li>Threshold changes are tracked monthly in Alerts.</li>
        </ol>

        <Form.Check
          type="checkbox"
          label="Do not show this guide again"
          checked={dontShowAgain}
          onChange={(e) => setDontShowAgain(e.target.checked)}
          className="mt-3"
        />
      </Modal.Body>

      <Modal.Footer style={{ backgroundColor: "#1d2634", color: "white" }}>
        <Button variant="secondary" onClick={handleClose}>
          Got it!
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
