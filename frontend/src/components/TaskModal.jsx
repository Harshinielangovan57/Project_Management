import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { taskService, projectService } from '../services/api';

const TaskModal = ({ show, onHide, task, defaultProjectId, onSaved }) => {
  const isEdit = !!task;

  const [formData, setFormData] = useState({
    taskName: '',
    description: '',
    priority: 'Medium',
    status: 'Pending',
    dueDate: '',
    projectId: defaultProjectId || ''
  });

  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (show) {
      fetchProjects();
    }
  }, [show]);

  const fetchProjects = async () => {
    try {
      setLoadingProjects(true);
      const res = await projectService.getProjects();
      if (res.data.success) {
        setProjects(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load projects list for task modal:', err);
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    if (task) {
      setFormData({
        taskName: task.taskName || '',
        description: task.description || '',
        priority: task.priority || 'Medium',
        status: task.status || 'Pending',
        dueDate: task.dueDate ? task.dueDate.substring(0, 10) : '',
        projectId: task.projectId || defaultProjectId || ''
      });
    } else {
      setFormData({
        taskName: '',
        description: '',
        priority: 'Medium',
        status: 'Pending',
        dueDate: '',
        projectId: defaultProjectId || (projects.length > 0 ? projects[0].id : '')
      });
    }
    setValidated(false);
    setError(null);
  }, [task, show, defaultProjectId, projects.length]);

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

    if (!formData.projectId) {
      setError('Please select a project for this task.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isEdit) {
        await taskService.updateTask(task.id, formData);
      } else {
        await taskService.createTask(formData);
      }
      onSaved();
      onHide();
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to save task. Please try again.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static" size="lg">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold fs-4">
          <i className={`bi ${isEdit ? 'bi-pencil-square text-warning' : 'bi-plus-circle text-primary'} me-2`}></i>
          {isEdit ? 'Edit Task' : 'Create New Task'}
        </Modal.Title>
      </Modal.Header>

      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Body className="pt-3">
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
            </Alert>
          )}

          <Form.Group className="mb-3" controlId="taskProjectSelect">
            <Form.Label className="fw-semibold">
              Assigned Project <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              name="projectId"
              value={formData.projectId}
              onChange={handleChange}
              required
              className="form-select-custom"
              disabled={loadingProjects || !!defaultProjectId}
            >
              <option value="">-- Select a project --</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.status})
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              Please choose a parent project.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="taskName">
            <Form.Label className="fw-semibold">Task Title <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              name="taskName"
              value={formData.taskName}
              onChange={handleChange}
              placeholder="e.g. Design responsive landing page mockup"
              required
              minLength={2}
              maxLength={200}
              className="form-control-custom"
            />
            <Form.Control.Feedback type="invalid">
              Please provide a task name (2-200 characters).
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="taskDescription">
            <Form.Label className="fw-semibold">Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide actionable details, acceptance criteria, or dependencies..."
              className="form-control-custom"
            />
          </Form.Group>

          <Row>
            <Col md={4} className="mb-3">
              <Form.Group controlId="taskPriority">
                <Form.Label className="fw-semibold">Priority</Form.Label>
                <Form.Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="form-select-custom"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={4} className="mb-3">
              <Form.Group controlId="taskStatus">
                <Form.Label className="fw-semibold">Status</Form.Label>
                <Form.Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="form-select-custom"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={4} className="mb-3">
              <Form.Group controlId="taskDueDate">
                <Form.Label className="fw-semibold">Due Date</Form.Label>
                <Form.Control
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
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
                <i className="bi bi-check-lg me-1"></i> {isEdit ? 'Save Changes' : 'Create Task'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default TaskModal;
