import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validated, setValidated] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await login(email, password);
      if (res.success) {
        navigate('/');
      } else {
        setError(res.message || 'Login failed. Please verify your credentials.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login error. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '90vh' }}>
      <div className="w-100" style={{ maxWidth: '440px' }}>
        <div className="text-center mb-4">
          <div className="brand-badge fs-2 mb-2 p-3 rounded-4 shadow-sm">
            <i className="bi bi-kanban-fill"></i>
          </div>
          <h2 className="fw-bold mt-2 mb-1">Welcome Back</h2>
          <p className="text-muted">Sign in to manage your projects and tasks</p>
        </div>

        <Card className="app-card border-0 shadow-lg p-3 p-sm-4">
          <Card.Body>
            {error && (
              <Alert variant="danger" dismissible onClose={() => setError(null)} className="py-2 small">
                <i className="bi bi-exclamation-circle-fill me-2"></i> {error}
              </Alert>
            )}

            <Form noValidate validated={validated} onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="loginEmail">
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
                  Please provide a valid email.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-4" controlId="loginPassword">
                <Form.Label className="fw-semibold small text-muted">PASSWORD</Form.Label>
                <div className="search-wrapper">
                  <i className="bi bi-lock"></i>
                  <Form.Control
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="form-control-custom"
                  />
                </div>
                <Form.Control.Feedback type="invalid">
                  Please enter your password.
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
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </Form>
          </Card.Body>
        </Card>

        <div className="text-center mt-4 text-muted small">
          Don't have an account?{' '}
          <Link to="/register" className="fw-semibold text-decoration-none" style={{ color: 'var(--primary-color)' }}>
            Create an Account
          </Link>
        </div>
      </div>
    </Container>
  );
};

export default LoginPage;
