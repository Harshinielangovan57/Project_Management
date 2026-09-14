import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validated, setValidated] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await register(fullName, email, password);
      if (res.success) {
        navigate('/');
      } else {
        setError(res.message || 'Registration failed. Please check your details.');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Registration failed.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center py-5" style={{ minHeight: '90vh' }}>
      <div className="w-100" style={{ maxWidth: '480px' }}>
        <div className="text-center mb-4">
          <div className="brand-badge fs-2 mb-2 p-3 rounded-4 shadow-sm">
            <i className="bi bi-kanban-fill"></i>
          </div>
          <h2 className="fw-bold mt-2 mb-1">Create an Account</h2>
          <p className="text-muted">Start organizing and delivering projects on time</p>
        </div>

        <Card className="app-card border-0 shadow-lg p-3 p-sm-4">
          <Card.Body>
            {error && (
              <Alert variant="danger" dismissible onClose={() => setError(null)} className="py-2 small">
                <i className="bi bi-exclamation-circle-fill me-2"></i> {error}
              </Alert>
            )}

            <Form noValidate validated={validated} onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="regFullName">
                <Form.Label className="fw-semibold small text-muted">FULL NAME</Form.Label>
                <div className="search-wrapper">
                  <i className="bi bi-person"></i>
                  <Form.Control
                    type="text"
                    placeholder="Jane Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    minLength={2}
                    className="form-control-custom"
                  />
                </div>
                <Form.Control.Feedback type="invalid">
                  Please provide your name (at least 2 characters).
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="regEmail">
                <Form.Label className="fw-semibold small text-muted">EMAIL ADDRESS</Form.Label>
                <div className="search-wrapper">
                  <i className="bi bi-envelope"></i>
                  <Form.Control
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="form-control-custom"
                  />
                </div>
                <Form.Control.Feedback type="invalid">
                  Please provide a valid email address.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="regPassword">
                <Form.Label className="fw-semibold small text-muted">PASSWORD</Form.Label>
                <div className="search-wrapper">
                  <i className="bi bi-lock"></i>
                  <Form.Control
                    type="password"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="form-control-custom"
                  />
                </div>
                <Form.Control.Feedback type="invalid">
                  Password must be at least 6 characters.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-4" controlId="regConfirmPassword">
                <Form.Label className="fw-semibold small text-muted">CONFIRM PASSWORD</Form.Label>
                <div className="search-wrapper">
                  <i className="bi bi-lock-fill"></i>
                  <Form.Control
                    type="password"
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="form-control-custom"
                  />
                </div>
                <Form.Control.Feedback type="invalid">
                  Please confirm your password.
                </Form.Control.Feedback>
              </Form.Group>

              <Button
                type="submit"
                disabled={loading}
                className="w-100 btn-primary-custom py-2 fw-semibold"
              >
                {loading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                    Creating account...
                  </>
                ) : (
                  'Register & Get Started'
                )}
              </Button>
            </Form>
          </Card.Body>
        </Card>

        <div className="text-center mt-4 text-muted small">
          Already have an account?{' '}
          <Link to="/login" className="fw-semibold text-decoration-none" style={{ color: 'var(--primary-color)' }}>
            Sign In Here
          </Link>
        </div>
      </div>
    </Container>
  );
};

export default RegisterPage;
