//Import statements
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSettings,
  createDebtTemplate,
  updateDebtTemplate,
  deleteDebtTemplate,
  saveTheme,
  saveTolerance,
  selectTheme,
  selectTolerance,
  selectDebtTemplates,
  selectSettingsStatus,
  selectSettingsError,
} from "../redux/settingsSlice";
import {
  Button,
  Table,
  Spinner,
  Alert,
  Card,
  Form,
  Row,
  Col,
} from "react-bootstrap";
import ExpenseModal from "../components/ExpenseModal";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

export default function Settings() {
  const dispatch = useDispatch();

  const templates = useSelector(selectDebtTemplates);
  const status = useSelector(selectSettingsStatus);
  const error = useSelector(selectSettingsError);
  const currentTheme = useSelector(selectTheme);
  const currentTolerance = useSelector(selectTolerance);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [modalMode, setModalMode] = useState("create");
  const [tolerance, setTolerance] = useState(currentTolerance || 25);

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  // Sync local state when fetched
  useEffect(() => {
    setTolerance(currentTolerance);
  }, [currentTolerance]);

  const openModal = (mode, template = null) => {
    setSelectedTemplate(template);
    setModalMode(mode);
    setModalOpen(true);
  };

  const handleSubmitTemplate = async (payload) => {
    try {
      if (modalMode === "create") {
        await dispatch(createDebtTemplate(payload)).unwrap();
      } else if (modalMode === "edit") {
        await dispatch(
          updateDebtTemplate({ templateId: selectedTemplate._id, ...payload })
        ).unwrap();
      }
      setModalOpen(false);
    } catch (err) {
      console.error("Failed to save template:", err);
      alert(err.message || "Failed to save template");
    }
  };

  return (
    <div className="main-container">
      <h3>Settings</h3>

      {status === "loading" && <Spinner animation="border" size="sm" />}
      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        {/* LEFT: Debt Templates */}
        <Col lg={9}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <strong>Debt Templates</strong>
              <Button size="sm" onClick={() => openModal("create")}>
                Add Template
              </Button>
            </Card.Header>

            <Card.Body>
              <Table striped bordered hover responsive size="sm">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>First Payment</th>
                    <th>Recurring</th>
                    <th>Expiry</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {templates.length > 0 ? (
                    templates.map((t) => (
                      <tr key={t._id}>
                        <td>{t.description}</td>
                        <td>{t.category}</td>
                        <td>R {t.amount.toFixed(2)}</td>
                        <td>{t.firstPaymentDate}</td>
                        <td>{t.isRecurring ? "Yes" : "No"}</td>
                        <td>
                          {t.isRecurring && !t.untilCancelled
                            ? t.expiryDate
                            : "—"}
                        </td>
                        <td>
                          <FaEye
                            className="me-2 cursor-pointer"
                            onClick={() => openModal("view", t)}
                          />

                          <FaEdit
                            className="me-2 cursor-pointer"
                            onClick={() => openModal("edit", t)}
                          />

                          <FaTrash
                            className="cursor-pointer text-danger"
                            onClick={() => dispatch(deleteDebtTemplate(t._id))}
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center">
                        No templates found
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        {/* RIGHT: Settings */}
        <Col lg={3}>
          {/* Tolerance Box */}
          <Card className="mb-4">
            <Card.Header>
              <strong>Alerts Tolerance</strong>
            </Card.Header>
            <Card.Body>
              <Form.Group>
                <Form.Label>Percentage Threshold</Form.Label>
                <Form.Control
                  className="table-table"
                  type="number"
                  min={0}
                  max={100}
                  value={tolerance}
                  onChange={(e) => setTolerance(Number(e.target.value))}
                />
                <Form.Text muted>
                  Alert when monthly expense changes exceed this percentage.
                </Form.Text>
              </Form.Group>
              <Button
                size="sm"
                className="mt-3"
                onClick={() => dispatch(saveTolerance(tolerance))}
              >
                Save
              </Button>
            </Card.Body>
          </Card>

          {/* Theme Box */}
          <Card>
            <Card.Header>
              <strong>Theme</strong>
            </Card.Header>
            <Card.Body>
              <Form.Check
                type="radio"
                label="Dark"
                name="theme"
                checked={currentTheme === "dark"}
                onChange={() => dispatch(saveTheme("dark"))}
              />
              <Form.Check
                type="radio"
                label="Light"
                name="theme"
                checked={currentTheme === "light"}
                onChange={() => dispatch(saveTheme("light"))}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Expense Modal */}
      <ExpenseModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedTemplate(null);
        }}
        mode={modalMode}
        initial={selectedTemplate}
        onSave={handleSubmitTemplate}
      />
    </div>
  );
}
