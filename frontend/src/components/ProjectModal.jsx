import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { projectService } from '../services/api';

const ProjectModal = ({ show, onHide, project, onSaved }) => {
  const isEdit = !!project;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'Not Started',
    startDate: '',
    endDate: ''
  });

  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        status: project.status || 'Not Started',
        startDate: project.startDate ? project.startDate.substring(0, 10) : '',
        endDate: project.endDate ? project.endDate.substring(0, 10) : ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        status: 'Not Started',
        startDate: new Date().toISOString().substring(0, 10),
        endDate: ''
      });
    }
    setValidated(false);
    setError(null);
  }, [project, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      setError('End date cannot be earlier than start date.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isEdit) {
        await projectService.updateProject(project.id, formData);
      } else {
        await projectService.createProject(formData);
      }
      onSaved();
      onHide();
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to save project. Please check the inputs.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static" size="lg">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold fs-4">
          <i className={`bi ${isEdit ? 'bi-pencil-square text-warning' : 'bi-folder-plus text-primary'} me-2`}></i>
          {isEdit ? 'Edit Project' : 'Create New Project'}
        </Modal.Title>
      </Modal.Header>

      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Body className="pt-3">
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
            </Alert>
          )}

          <Form.Group className="mb-3" controlId="projectName">
            <Form.Label className="fw-semibold">Project Name <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Website Redesign & Brand Refresh"
              required
              minLength={2}
              maxLength={200}
              className="form-control-custom"
            />
            <Form.Control.Feedback type="invalid">
              Please provide a valid project name (2-200 characters).
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="projectDescription">
            <Form.Label className="fw-semibold">Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Detailed description of the project goals, scope, and objectives..."
              className="form-control-custom"
            />
          </Form.Group>

          <Row>
            <Col md={4} className="mb-3">
              <Form.Group controlId="projectStatus">
                <Form.Label className="fw-semibold">Status</Form.Label>
                <Form.Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="form-select-custom"
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={4} className="mb-3">
              <Form.Group controlId="projectStartDate">
                <Form.Label className="fw-semibold">Start Date</Form.Label>
                <Form.Control
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="form-control-custom"
                />
              </Form.Group>
            </Col>

            <Col md={4} className="mb-3">
              <Form.Group controlId="projectEndDate">
                <Form.Label className="fw-semibold">End Date</Form.Label>
                <Form.Control
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="form-control-custom"
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer className="border-0 pt-0">
          <Button variant="secondary" onClick={onHide} disabled={loading} className="btn-secondary-custom">
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="btn-primary-custom">
            {loading ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                Saving...
              </>
            ) : (
              <>
                <i className="bi bi-check-lg me-1"></i> {isEdit ? 'Save Changes' : 'Create Project'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ProjectModal;
