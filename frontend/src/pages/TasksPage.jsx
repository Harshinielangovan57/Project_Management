import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Spinner, Alert, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { taskService, projectService } from '../services/api';
import TaskModal from '../components/TaskModal';

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search and Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [statusFilter, priorityFilter, projectFilter]);

  const fetchProjects = async () => {
    try {
      const res = await projectService.getProjects();
      if (res.data.success) {
        setProjects(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load projects list:', err);
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (projectFilter) params.projectId = projectFilter;

      const res = await taskService.getTasks(params);
      if (res.data.success) {
        setTasks(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTasks();
  };

  const handleToggleStatus = async (task) => {
    try {
      const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
      await taskService.updateTask(task.id, { status: newStatus });
      fetchTasks();
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    try {
      setDeleting(true);
      await taskService.deleteTask(taskToDelete.id);
      setTaskToDelete(null);
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete task.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Container fluid="lg" className="py-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between pb-3 border-bottom mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">Task Manager</h2>
          <p className="text-muted mb-0">
            Monitor, prioritize, and complete your actionable deliverables
          </p>
        </div>
        <div>
          <Button
            className="btn-primary-custom d-flex align-items-center gap-2"
            onClick={() => {
              setSelectedTask(null);
              setShowModal(true);
            }}
          >
            <i className="bi bi-plus-circle"></i> New Task
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
        </Alert>
      )}

      {/* Filter Toolbar */}
      <Card className="app-card border-0 p-3 mb-4 shadow-sm">
        <Form onSubmit={handleSearchSubmit}>
          <Row className="g-2 align-items-center">
            {/* Search tasks by name */}
            <Col md={12} lg={4}>
              <div className="search-wrapper">
                <i className="bi bi-search"></i>
                <Form.Control
                  type="text"
                  placeholder="Search tasks by title..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="form-control-custom"
                />
              </div>
            </Col>

            {/* Filter by Project */}
            <Col sm={6} md={4} lg={3}>
              <Form.Select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="form-select-custom"
              >
                <option value="">All Projects</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Form.Select>
            </Col>

            {/* Filter by Status */}
            <Col sm={6} md={4} lg={2}>
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-select-custom"
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </Form.Select>
            </Col>

            {/* Filter by Priority */}
            <Col sm={6} md={2} lg={2}>
              <Form.Select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="form-select-custom"
              >
                <option value="">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </Form.Select>
            </Col>

            {/* Submit button */}
            <Col sm={6} md={2} lg={1}>
              <Button type="submit" variant="light" className="w-100 btn-secondary-custom">
                Filter
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* Task List */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted fw-semibold">Loading tasks...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="empty-state-box">
          <i className="bi bi-card-checklist empty-state-icon"></i>
          <h4 className="fw-bold mb-2">No Tasks Found</h4>
          <p className="text-muted mb-4">
            {search || statusFilter || priorityFilter || projectFilter
              ? 'No tasks matched your search or filter criteria.'
              : 'You have no tasks created yet. Click below to add your first task!'}
          </p>
          <Button
            className="btn-primary-custom"
            onClick={() => {
              setSelectedTask(null);
              setShowModal(true);
            }}
          >
            <i className="bi bi-plus-circle me-1"></i> Create Task
          </Button>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {tasks.map((task) => {
            const isDone = task.status === 'Completed';
            const priorityClass =
              task.priority === 'High'
                ? 'priority-high'
                : task.priority === 'Medium'
                ? 'priority-medium'
                : 'priority-low';

            const statusClass =
              task.status === 'Completed'
                ? 'status-completed'
                : task.status === 'In Progress'
                ? 'status-in-progress'
                : 'status-pending';

            return (
              <Card key={task.id} className="app-card border interactive-card p-3">
                <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                  <div className="d-flex align-items-start gap-3 flex-grow-1">
                    <button
                      className="btn btn-sm p-0 mt-1 border-0 bg-transparent text-success"
                      onClick={() => handleToggleStatus(task)}
                      title={isDone ? 'Mark Pending' : 'Mark as Completed'}
                    >
                      <i
                        className={`bi ${
                          isDone ? 'bi-check-circle-fill fs-4 text-success' : 'bi-circle fs-4 text-muted'
                        }`}
                      ></i>
                    </button>

                    <div className="flex-grow-1">
                      <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                        <h5 className={`fw-bold mb-0 ${isDone ? 'text-decoration-line-through text-muted' : 'text-dark'}`}>
                          {task.taskName}
                        </h5>
                        {task.project && (
                          <Link
                            to={`/projects/${task.project.id}`}
                            className="badge bg-light text-primary border text-decoration-none"
                          >
                            <i className="bi bi-folder2 me-1"></i> {task.project.name}
                          </Link>
                        )}
                      </div>

                      <p className="text-muted small mb-1">
                        {task.description || 'No additional description'}
                      </p>

                      <div className="d-flex flex-wrap align-items-center gap-3 text-muted small">
                        {task.dueDate && (
                          <span>
                            <i className="bi bi-calendar-event me-1"></i>
                            Due: {task.dueDate}
                          </span>
                        )}
                        <span>
                          <i className="bi bi-clock me-1"></i>
                          Created: {new Date(task.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-2 flex-shrink-0">
                    <span className={`priority-badge ${priorityClass}`}>{task.priority}</span>
                    <span className={`badge-status ${statusClass}`}>{task.status}</span>
                    <Button
                      variant="light"
                      size="sm"
                      className="border"
                      onClick={() => {
                        setSelectedTask(task);
                        setShowModal(true);
                      }}
                      title="Edit task"
                    >
                      <i className="bi bi-pencil"></i>
                    </Button>
                    <Button
                      variant="light"
                      size="sm"
                      className="border text-danger"
                      onClick={() => setTaskToDelete(task)}
                      title="Delete task"
                    >
                      <i className="bi bi-trash"></i>
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Task Create/Edit Modal */}
      <TaskModal
        show={showModal}
        onHide={() => setShowModal(false)}
        task={selectedTask}
        onSaved={fetchTasks}
      />

      {/* Delete Confirmation Modal */}
      <Modal show={!!taskToDelete} onHide={() => setTaskToDelete(null)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold text-danger">
            <i className="bi bi-trash3-fill me-2"></i> Delete Task
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete task <strong>"{taskToDelete?.taskName}"</strong>?
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="light" onClick={() => setTaskToDelete(null)} disabled={deleting}>
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

export default TasksPage;
