import React from 'react';
import { Navbar, Container, Nav, Dropdown, Button } from 'react-bootstrap';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Navbar expand="lg" className="custom-navbar sticky-top shadow-sm py-2">
      <Container fluid="lg">
        <Navbar.Brand as={NavLink} to="/" className="d-flex align-items-center gap-2 fw-bold text-dark text-decoration-none">
          <div className="brand-badge shadow-sm">
            <i className="bi bi-kanban-fill"></i>
          </div>
          <span style={{ fontSize: '1.25rem', letterSpacing: '-0.03em' }}>
            Plan<span style={{ color: 'var(--primary-color)' }}>Pulse</span>
          </span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-navbar-nav" className="border-0 shadow-none">
          <i className="bi bi-list fs-4"></i>
        </Navbar.Toggle>

        <Navbar.Collapse id="main-navbar-nav">
          <Nav className="me-auto ms-lg-4 gap-1">
            <Nav.Link
              as={NavLink}
              to="/"
              end
              className={`nav-link-custom ${location.pathname === '/' ? 'active' : ''}`}
            >
              <i className="bi bi-grid-1x2-fill me-1"></i> Dashboard
            </Nav.Link>
            <Nav.Link
              as={NavLink}
              to="/projects"
              className={`nav-link-custom ${location.pathname.startsWith('/projects') ? 'active' : ''}`}
            >
              <i className="bi bi-folder-fill me-1"></i> Projects
            </Nav.Link>
            <Nav.Link
              as={NavLink}
              to="/tasks"
              className={`nav-link-custom ${location.pathname.startsWith('/tasks') ? 'active' : ''}`}
            >
              <i className="bi bi-check2-square me-1"></i> Tasks
            </Nav.Link>
          </Nav>

          <div className="d-flex align-items-center gap-3 mt-3 mt-lg-0">
            <Dropdown align="end">
              <Dropdown.Toggle
                as="div"
                className="d-flex align-items-center gap-2 py-1 px-2 rounded-pill bg-light border cursor-pointer"
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
                  style={{
                    width: 32,
                    height: 32,
                    background: 'linear-gradient(135deg, #4f46e5 0%, #0ea5e9 100%)',
                    fontSize: '0.85rem'
                  }}
                >
                  {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="text-start me-1 d-none d-sm-block">
                  <div className="fw-semibold text-dark small leading-tight" style={{ fontSize: '0.85rem' }}>
                    {user?.fullName || 'User'}
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                    {user?.email || ''}
                  </div>
                </div>
                <i className="bi bi-chevron-down text-muted small ms-1"></i>
              </Dropdown.Toggle>

              <Dropdown.Menu className="shadow-lg border-0 rounded-3 mt-2 p-2">
                <div className="px-3 py-2 border-bottom mb-2">
                  <div className="fw-bold">{user?.fullName}</div>
                  <small className="text-muted">{user?.email}</small>
                </div>
                <Dropdown.Item as={NavLink} to="/" className="rounded-2 py-2">
                  <i className="bi bi-speedometer2 me-2 text-primary"></i> Dashboard Overview
                </Dropdown.Item>
                <Dropdown.Item as={NavLink} to="/projects" className="rounded-2 py-2">
                  <i className="bi bi-briefcase me-2 text-info"></i> Manage Projects
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item
                  onClick={handleLogout}
                  className="rounded-2 py-2 text-danger fw-semibold"
                >
                  <i className="bi bi-box-arrow-right me-2"></i> Log Out
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
