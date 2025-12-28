// Import Statements
import React, { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { FcLock, FcUnlock } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../redux/userSlice";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((s) => s.user);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(loginUser(form)).unwrap();
      navigate("/"); // ✅ go to dashboard
    } catch (err) {
      console.error("Login failed:", err);
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
          <FcUnlock size={50} className="login-icon" />
          <h2>Welcome Back</h2>
          <p>Sign in to your account</p>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
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
            <FcLock className="btn-icon" />
            {status === "loading" ? "Signing in…" : "Login"}
          </Button>
        </Form>

        <p className="mt-3">
          Don’t have an account? <Link to="/register">Click here</Link>
        </p>
      </div>
    </div>
  );
}
