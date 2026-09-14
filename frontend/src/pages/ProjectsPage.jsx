import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Spinner, Alert, ProgressBar, Badge, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { projectService } from '../services/api';
import ProjectModal from '../components/ProjectModal';

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals state
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  // Delete confirmation
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [statusFilter]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter) params.status = statusFilter;

      const res = await projectService.getProjects(params);
      if (res.data.success) {
        setProjects(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProjects();
  };

  const handleOpenCreateModal = () => {
    setSelectedProject(null);
    setShowModal(true);
  };

  const handleOpenEditModal = (proj, e) => {
    e.stopPropagation();
    setSelectedProject(proj);
    setShowModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    try {
      setDeleting(true);
      await projectService.deleteProject(projectToDelete.id);
      setProjectToDelete(null);
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete project.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Container fluid="lg" className="py-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between pb-3 border-bottom mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">Projects Directory</h2>
          <p className="text-muted mb-0">
            Create, track, and manage all your active and upcoming initiatives
          </p>
        </div>
        <div>
          <Button className="btn-primary-custom d-flex align-items-center gap-2" onClick={handleOpenCreateModal}>
            <i className="bi bi-folder-plus"></i> New Project
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
        </Alert>
      )}

      {/* Filter and Search Bar */}
      <Card className="app-card border-0 p-3 mb-4 shadow-sm">
        <Form onSubmit={handleSearchSubmit}>
          <Row className="g-3 align-items-center">
            <Col md={7} lg={8}>
              <div className="search-wrapper">
                <i className="bi bi-search"></i>
                <Form.Control
                  type="text"
                  placeholder="Search projects by name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="form-control-custom"
                />
              </div>
            </Col>
            <Col sm={8} md={3} lg={3}>
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-select-custom"
              >
                <option value="">All Statuses</option>
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </Form.Select>
            </Col>
            <Col sm={4} md={2} lg={1}>
              <Button type="submit" variant="light" className="w-100 btn-secondary-custom">
                Filter
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* Projects Grid */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted fw-semibold">Loading projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="empty-state-box">
          <i className="bi bi-folder2-open empty-state-icon"></i>
          <h4 className="fw-bold mb-2">No Projects Found</h4>
          <p className="text-muted mb-4">
            {search || statusFilter
              ? 'No projects match your current filters. Try changing your search query.'
              : 'You haven’t created any projects yet. Create your first project to organize tasks!'}
          </p>
          <Button className="btn-primary-custom" onClick={handleOpenCreateModal}>
            <i className="bi bi-folder-plus me-1"></i> Create Project
          </Button>
        </div>
      ) : (
        <Row className="g-4">
          {projects.map((project) => {
            const statusClass =
              project.status === 'Completed'
                ? 'status-completed'
                : project.status === 'In Progress'
                ? 'status-in-progress'
                : 'status-not-started';

            return (
              <Col key={project.id} md={6} lg={4}>
                <Card className="app-card interactive-card h-100 d-flex flex-column border">
                  <Card.Body className="d-flex flex-column p-4">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span className={`badge-status ${statusClass}`}>
                        <i className="bi bi-circle-fill" style={{ fontSize: '0.45rem' }}></i>
                        {project.status}
                      </span>
                      <div className="dropdown">
                        <button
                          className="btn btn-sm btn-light border-0 py-0 px-2 text-muted"
                          type="button"
                          data-bs-toggle="dropdown"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <i className="bi bi-three-dots-vertical"></i>
                        </button>
                        <div className="d-flex gap-1">
                          <Button
                            variant="light"
                            size="sm"
                            className="p-1 text-primary border-0"
                            title="Edit project"
                            onClick={(e) => handleOpenEditModal(project, e)}
                          >
                            <i className="bi bi-pencil"></i>
                          </Button>
                          <Button
                            variant="light"
                            size="sm"
                            className="p-1 text-danger border-0"
                            title="Delete project"
                            onClick={(e) => {
                              e.stopPropagation();
                              setProjectToDelete(project);
                            }}
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </div>
                      </div>
                    </div>

                    <h5 className="fw-bold mb-2">
                      <Link
                        to={`/projects/${project.id}`}
                        className="text-dark text-decoration-none hover-primary"
                      >
                        {project.name}
                      </Link>
                    </h5>

                    <p className="text-muted small mb-4 flex-grow-1" style={{ minHeight: '40px' }}>
                      {project.description
                        ? project.description.length > 120
                          ? `${project.description.substring(0, 120)}...`
                          : project.description
                        : 'No description provided.'}
                    </p>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="d-flex justify-content-between small text-muted mb-1">
                        <span>Task Progress</span>
                        <span className="fw-semibold text-dark">
                          {project.completedTasks} / {project.totalTasks} ({project.progressPercent}%)
                        </span>
                      </div>
                      <div className="progress-custom">
                        <div
                          className="progress-custom-bar"
                          style={{ width: `${project.progressPercent}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Footer Dates */}
                    <div className="pt-3 border-top d-flex justify-content-between align-items-center text-muted small">
                      <span>
                        <i className="bi bi-calendar3 me-1"></i>
                        {project.endDate ? `Due ${project.endDate}` : 'No deadline'}
                      </span>
                      <Link
                        to={`/projects/${project.id}`}
                        className="fw-semibold text-decoration-none"
                        style={{ color: 'var(--primary-color)' }}
                      >
                        Details <i className="bi bi-arrow-right"></i>
                      </Link>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* Project Create/Edit Modal */}
      <ProjectModal
        show={showModal}
        onHide={() => setShowModal(false)}
        project={selectedProject}
        onSaved={fetchProjects}
      />

      {/* Delete Confirmation Modal */}
      <Modal show={!!projectToDelete} onHide={() => setProjectToDelete(null)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold text-danger">
            <i className="bi bi-trash3-fill me-2"></i> Delete Project
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the project <strong>"{projectToDelete?.name}"</strong>?
          <p className="text-danger small mt-2 mb-0">
            <i className="bi bi-exclamation-triangle me-1"></i>
            This will permanently remove the project and all tasks associated with it. This action cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="light" onClick={() => setProjectToDelete(null)} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Confirm Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ProjectsPage;
