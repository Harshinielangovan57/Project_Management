import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert, ProgressBar, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { dashboardService, taskService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ProjectModal from '../components/ProjectModal';
import TaskModal from '../components/TaskModal';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await dashboardService.getStats();
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Unable to load dashboard metrics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTaskStatus = async (task) => {
    try {
      const newStatus = task.status === 'Completed' ? 'In Progress' : 'Completed';
      await taskService.updateTask(task.id, { status: newStatus });
      loadDashboardStats();
    } catch (err) {
      console.error('Error toggling task status:', err);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
        <p className="mt-3 text-muted fw-semibold">Loading dashboard metrics...</p>
      </Container>
    );
  }

  return (
    <Container fluid="lg" className="py-4">
      {/* Header Banner */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between pb-4 border-bottom mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">
            Welcome back, {user?.fullName?.split(' ')[0] || 'there'} 👋
          </h2>
          <p className="text-muted mb-0">
            Here is your live project progress and task summary
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button
            variant="light"
            className="btn-secondary-custom d-flex align-items-center gap-2"
            onClick={() => setShowTaskModal(true)}
          >
            <i className="bi bi-plus-circle-fill text-info"></i> New Task
          </Button>
          <Button
            className="btn-primary-custom d-flex align-items-center gap-2"
            onClick={() => setShowProjectModal(true)}
          >
            <i className="bi bi-folder-plus"></i> New Project
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
        </Alert>
      )}

      {/* 5 Core Metric Cards as required in specification */}
      <Row className="g-3 mb-4">
        {/* 1. Total Projects */}
        <Col xs={12} sm={6} lg={4} xl={2}>
          <div className="metric-card h-100">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="metric-title">TOTAL PROJECTS</span>
              <div className="metric-icon-box" style={{ background: '#eef2ff', color: '#4f46e5' }}>
                <i className="bi bi-folder2-open"></i>
              </div>
            </div>
            <div className="metric-number">{stats?.totalProjects || 0}</div>
            <div className="text-muted small mt-2">Active workspace</div>
          </div>
        </Col>

        {/* 2. Total Tasks */}
        <Col xs={12} sm={6} lg={4} xl={2}>
          <div className="metric-card h-100">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="metric-title">TOTAL TASKS</span>
              <div className="metric-icon-box" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                <i className="bi bi-list-task"></i>
              </div>
            </div>
            <div className="metric-number">{stats?.totalTasks || 0}</div>
            <div className="text-muted small mt-2">Across all projects</div>
          </div>
        </Col>

        {/* 3. Completed Tasks */}
        <Col xs={12} sm={6} lg={4} xl={2}>
          <div className="metric-card h-100">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="metric-title">COMPLETED TASKS</span>
              <div className="metric-icon-box" style={{ background: '#dcfce7', color: '#15803d' }}>
                <i className="bi bi-check-circle-fill"></i>
              </div>
            </div>
            <div className="metric-number text-success">{stats?.completedTasks || 0}</div>
            <div className="text-muted small mt-2">
              {stats?.totalTasks > 0 ? `${Math.round((stats.completedTasks / stats.totalTasks) * 100)}% done` : 'No tasks'}
            </div>
          </div>
        </Col>

        {/* 4. Pending Tasks */}
        <Col xs={12} sm={6} lg={4} xl={3}>
          <div className="metric-card h-100">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="metric-title">PENDING TASKS</span>
              <div className="metric-icon-box" style={{ background: '#fef3c7', color: '#d97706' }}>
                <i className="bi bi-hourglass-split"></i>
              </div>
            </div>
            <div className="metric-number text-warning">{stats?.pendingTasks || 0}</div>
            <div className="text-muted small mt-2">Awaiting completion</div>
          </div>
        </Col>

        {/* 5. Projects In Progress */}
        <Col xs={12} sm={6} lg={4} xl={3}>
          <div className="metric-card h-100">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="metric-title">PROJECTS IN PROGRESS</span>
              <div className="metric-icon-box" style={{ background: '#e0f2fe', color: '#0284c7' }}>
                <i className="bi bi-arrow-repeat"></i>
              </div>
            </div>
            <div className="metric-number text-primary">{stats?.inProgressProjects || 0}</div>
            <div className="text-muted small mt-2">Currently underway</div>
          </div>
        </Col>
      </Row>

      {/* Progress & Priority Breakdown Cards */}
      <Row className="g-4 mb-4">
        <Col lg={7}>
          <Card className="app-card h-100 p-3">
            <Card.Body>
              <h5 className="fw-bold mb-3 d-flex align-items-center justify-content-between">
                <span>Task Delivery Velocity</span>
                <span className="badge bg-light text-primary border">
                  {stats?.taskCompletionRate || 0}% Completion
                </span>
              </h5>
              <ProgressBar
                now={stats?.taskCompletionRate || 0}
                variant="primary"
                className="mb-4"
                style={{ height: '10px', borderRadius: '10px' }}
              />

              <div className="row text-center pt-2">
                <div className="col-4 border-end">
                  <div className="text-muted small fw-semibold">PENDING</div>
                  <div className="fs-4 fw-bold text-warning">{stats?.pendingTasks || 0}</div>
                </div>
                <div className="col-4 border-end">
                  <div className="text-muted small fw-semibold">IN PROGRESS</div>
                  <div className="fs-4 fw-bold text-info">{stats?.inProgressTasks || 0}</div>
                </div>
                <div className="col-4">
                  <div className="text-muted small fw-semibold">COMPLETED</div>
                  <div className="fs-4 fw-bold text-success">{stats?.completedTasks || 0}</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={5}>
          <Card className="app-card h-100 p-3">
            <Card.Body>
              <h5 className="fw-bold mb-3">Task Priority Breakdown</h5>
              <div className="d-flex flex-column gap-3">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="d-flex align-items-center gap-2">
                    <span className="priority-badge priority-high">High Priority</span>
                  </span>
                  <span className="fw-bold fs-5">{stats?.highPriorityTasks || 0}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="d-flex align-items-center gap-2">
                    <span className="priority-badge priority-medium">Medium Priority</span>
                  </span>
                  <span className="fw-bold fs-5">{stats?.mediumPriorityTasks || 0}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="d-flex align-items-center gap-2">
                    <span className="priority-badge priority-low">Low Priority</span>
                  </span>
                  <span className="fw-bold fs-5">{stats?.lowPriorityTasks || 0}</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Projects and Tasks */}
      <Row className="g-4">
        {/* Recent Projects */}
        <Col lg={6}>
          <Card className="app-card h-100 p-3">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">Recent Projects</h5>
                <Link to="/projects" className="small fw-semibold text-decoration-none" style={{ color: 'var(--primary-color)' }}>
                  View All ({stats?.totalProjects || 0}) <i className="bi bi-arrow-right"></i>
                </Link>
              </div>

              {(!stats?.recentProjects || stats.recentProjects.length === 0) ? (
                <div className="text-center py-4 text-muted">
                  <i className="bi bi-folder-x fs-1 d-block mb-2 text-secondary"></i>
                  No projects yet. Create your first project to get started!
                </div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {stats.recentProjects.map((p) => {
                    const statusClass =
                      p.status === 'Completed'
                        ? 'status-completed'
                        : p.status === 'In Progress'
                        ? 'status-in-progress'
                        : 'status-not-started';

                    return (
                      <div
                        key={p.id}
                        className="d-flex align-items-center justify-content-between p-3 rounded-3 border interactive-card bg-white"
                      >
                        <div className="me-2 text-truncate">
                          <Link to={`/projects/${p.id}`} className="fw-bold text-dark text-decoration-none">
                            {p.name}
                          </Link>
                          <div className="text-muted small text-truncate" style={{ maxWidth: '280px' }}>
                            {p.description || 'No description provided'}
                          </div>
                        </div>
                        <div className="d-flex align-items-center gap-2 flex-shrink-0">
                          <span className={`badge-status ${statusClass}`}>{p.status}</span>
                          <Link to={`/projects/${p.id}`} className="btn btn-sm btn-light border">
                            <i className="bi bi-chevron-right"></i>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Recent Tasks */}
        <Col lg={6}>
          <Card className="app-card h-100 p-3">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">Recent Tasks</h5>
                <Link to="/tasks" className="small fw-semibold text-decoration-none" style={{ color: 'var(--primary-color)' }}>
                  View All ({stats?.totalTasks || 0}) <i className="bi bi-arrow-right"></i>
                </Link>
              </div>

              {(!stats?.recentTasks || stats.recentTasks.length === 0) ? (
                <div className="text-center py-4 text-muted">
                  <i className="bi bi-card-checklist fs-1 d-block mb-2 text-secondary"></i>
                  No tasks created yet. Click "+ New Task" to add your first item.
                </div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {stats.recentTasks.map((t) => {
                    const isDone = t.status === 'Completed';
                    const priorityClass =
                      t.priority === 'High'
                        ? 'priority-high'
                        : t.priority === 'Medium'
                        ? 'priority-medium'
                        : 'priority-low';

                    return (
                      <div
                        key={t.id}
                        className="d-flex align-items-center justify-content-between p-3 rounded-3 border interactive-card bg-white"
                      >
                        <div className="d-flex align-items-center gap-3 text-truncate me-2">
                          <button
                            className="btn btn-sm p-0 text-success border-0 bg-transparent"
                            title={isDone ? 'Mark as In Progress' : 'Mark as Completed'}
                            onClick={() => handleToggleTaskStatus(t)}
                          >
                            <i className={`bi ${isDone ? 'bi-check-circle-fill fs-5 text-success' : 'bi-circle fs-5 text-muted'}`}></i>
                          </button>
                          <div className="text-truncate">
                            <div className={`fw-semibold small ${isDone ? 'text-decoration-line-through text-muted' : 'text-dark'}`}>
                              {t.taskName}
                            </div>
                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                              <i className="bi bi-folder2 me-1"></i>
                              {t.project?.name || 'Project'}
                              {t.dueDate && ` • Due ${t.dueDate}`}
                            </div>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <span className={`priority-badge ${priorityClass}`}>{t.priority}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modals */}
      <ProjectModal
        show={showProjectModal}
        onHide={() => setShowProjectModal(false)}
        onSaved={loadDashboardStats}
      />

      <TaskModal
        show={showTaskModal}
        onHide={() => setShowTaskModal(false)}
        onSaved={loadDashboardStats}
      />
    </Container>
  );
};

export default DashboardPage;
