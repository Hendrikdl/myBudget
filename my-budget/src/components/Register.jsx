// Import Statements - Register
import React, { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { FcAddDatabase, FcUnlock } from "react-icons/fc";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";

import { registerUser } from "../redux/userSlice";

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((s) => s.user);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(registerUser(form)).unwrap();
      navigate("/"); // Go to Home / Dashboard
    } catch (err) {
      console.error("Register failed:", err);
    }
  };

  return (
    <div className="login-page">
      <div className="login-background">
        <div className="floating-shape shape1" />
        <div className="floating-shape shape2" />
      </div>

      <div className="login-card">
        <div className="login-header">
          <FcAddDatabase size={50} className="login-icon" />
          <h2>Create Account</h2>
          <p>Register your account</p>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Button
            type="submit"
            className="login-btn"
            disabled={status === "loading"}
          >
            <FcUnlock className="btn-icon" />
            {status === "loading" ? "Creating account…" : "Register"}
          </Button>
        </Form>

        <p className="mt-3">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}
