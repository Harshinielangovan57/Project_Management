import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert, ProgressBar, Badge, Form, Modal } from 'react-bootstrap';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { projectService, taskService } from '../services/api';
import ProjectModal from '../components/ProjectModal';
import TaskModal from '../components/TaskModal';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Task filters within project
  const [taskSearch, setTaskSearch] = useState('');
  const [taskStatusFilter, setTaskStatusFilter] = useState('');
  const [taskPriorityFilter, setTaskPriorityFilter] = useState('');

  // Modals
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Delete Task confirmation
  const [taskToDelete, setTaskToDelete] = useState(null);

  useEffect(() => {
    loadProjectDetails();
  }, [id]);

  const loadProjectDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await projectService.getProjectById(id);
      if (res.data.success) {
        setProject(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching project:', err);
      setError('Could not load project details. It may not exist or you do not have permission.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTaskStatus = async (task) => {
    try {
      const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
      await taskService.updateTask(task.id, { status: newStatus });
      loadProjectDetails();
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    try {
      await taskService.deleteTask(taskToDelete.id);
      setTaskToDelete(null);
      loadProjectDetails();
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2 text-muted fw-semibold">Loading project details...</p>
      </Container>
    );
  }

  if (error || !project) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="p-4">
          <h5><i className="bi bi-exclamation-triangle-fill me-2"></i> Error</h5>
          <p>{error || 'Project not found'}</p>
          <Button variant="outline-danger" onClick={() => navigate('/projects')}>
            Back to Projects
          </Button>
        </Alert>
      </Container>
    );
  }

  // Filter tasks in-memory for this project
  const filteredTasks = (project.tasks || []).filter((task) => {
    const matchesSearch = taskSearch
      ? task.taskName.toLowerCase().includes(taskSearch.toLowerCase())
      : true;
    const matchesStatus = taskStatusFilter ? task.status === taskStatusFilter : true;
    const matchesPriority = taskPriorityFilter ? task.priority === taskPriorityFilter : true;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const statusClass =
    project.status === 'Completed'
      ? 'status-completed'
      : project.status === 'In Progress'
      ? 'status-in-progress'
      : 'status-not-started';

  return (
    <Container fluid="lg" className="py-4">
      {/* Breadcrumb / Back Link */}
      <div className="mb-3">
        <Link to="/projects" className="text-decoration-none small fw-semibold text-muted">
          <i className="bi bi-arrow-left me-1"></i> Back to Projects
        </Link>
      </div>

      {/* Project Header Card */}
      <Card className="app-card border-0 p-4 mb-4 shadow-sm">
        <div className="d-flex flex-column flex-md-row align-items-md-start justify-content-between gap-3 mb-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className={`badge-status ${statusClass}`}>{project.status}</span>
              <span className="text-muted small">
                <i className="bi bi-clock-history me-1"></i>
                Created {new Date(project.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h2 className="fw-bold mb-2">{project.name}</h2>
            <p className="text-muted mb-0" style={{ maxWidth: '800px', fontSize: '1rem' }}>
              {project.description || 'No description provided.'}
            </p>
          </div>

          <div className="d-flex gap-2 flex-shrink-0">
            <Button
              variant="light"
              className="btn-secondary-custom d-flex align-items-center gap-2"
              onClick={() => setShowEditProjectModal(true)}
            >
              <i className="bi bi-pencil"></i> Edit Project
            </Button>
            <Button
              className="btn-primary-custom d-flex align-items-center gap-2"
              onClick={() => {
                setSelectedTask(null);
                setShowTaskModal(true);
              }}
            >
              <i className="bi bi-plus-lg"></i> Add Task
            </Button>
          </div>
        </div>

        {/* Project Meta and Progress */}
        <Row className="g-3 pt-3 border-top mt-2 align-items-center">
          <Col md={4} className="d-flex gap-4">
            <div>
              <div className="text-muted small">START DATE</div>
              <div className="fw-semibold">{project.startDate || 'Not set'}</div>
            </div>
            <div>
              <div className="text-muted small">END DATE</div>
              <div className="fw-semibold">{project.endDate || 'Not set'}</div>
            </div>
          </Col>
          <Col md={8}>
            <div className="d-flex justify-content-between small text-muted mb-1">
              <span>Overall Completion</span>
              <span className="fw-bold text-dark">
                {project.completedTasks} of {project.totalTasks} Tasks Completed ({project.progressPercent}%)
              </span>
            </div>
            <ProgressBar
              now={project.progressPercent}
              variant={project.progressPercent === 100 ? 'success' : 'primary'}
              style={{ height: '8px', borderRadius: '8px' }}
            />
          </Col>
        </Row>
      </Card>

      {/* Project Tasks Section */}
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between mb-3 gap-2">
        <h4 className="fw-bold mb-0">Project Tasks ({project.tasks?.length || 0})</h4>
      </div>

      {/* Task Filters */}
      <Card className="app-card border-0 p-3 mb-4 shadow-sm">
        <Row className="g-2 align-items-center">
          <Col md={6}>
            <div className="search-wrapper">
              <i className="bi bi-search"></i>
              <Form.Control
                type="text"
                placeholder="Search tasks in this project..."
                value={taskSearch}
                onChange={(e) => setTaskSearch(e.target.value)}
                className="form-control-custom"
              />
            </div>
          </Col>
          <Col sm={6} md={3}>
            <Form.Select
              value={taskStatusFilter}
              onChange={(e) => setTaskStatusFilter(e.target.value)}
              className="form-select-custom"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </Form.Select>
          </Col>
          <Col sm={6} md={3}>
            <Form.Select
              value={taskPriorityFilter}
              onChange={(e) => setTaskPriorityFilter(e.target.value)}
              className="form-select-custom"
            >
              <option value="">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </Form.Select>
          </Col>
        </Row>
      </Card>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <div className="empty-state-box">
          <i className="bi bi-check2-all empty-state-icon"></i>
          <h5 className="fw-bold mb-2">No Tasks Found</h5>
          <p className="text-muted mb-3">
            {taskSearch || taskStatusFilter || taskPriorityFilter
              ? 'No tasks match your filter criteria.'
              : 'This project does not have any tasks yet. Create your first task to start organizing!'}
          </p>
          <Button
            className="btn-primary-custom"
            onClick={() => {
              setSelectedTask(null);
              setShowTaskModal(true);
            }}
          >
            <i className="bi bi-plus-lg me-1"></i> Add Task
          </Button>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {filteredTasks.map((task) => {
            const isDone = task.status === 'Completed';
            const priorityClass =
              task.priority === 'High'
                ? 'priority-high'
                : task.priority === 'Medium'
                ? 'priority-medium'
                : 'priority-low';

            const statusBadgeClass =
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
                      onClick={() => handleToggleTaskStatus(task)}
                      title={isDone ? 'Mark In Progress' : 'Mark Completed'}
                    >
                      <i className={`bi ${isDone ? 'bi-check-circle-fill fs-4 text-success' : 'bi-circle fs-4 text-muted'}`}></i>
                    </button>
                    <div>
                      <h6 className={`fw-bold mb-1 ${isDone ? 'text-decoration-line-through text-muted' : 'text-dark'}`}>
                        {task.taskName}
                      </h6>
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
                    <span className={`badge-status ${statusBadgeClass}`}>{task.status}</span>
                    <Button
                      variant="light"
                      size="sm"
                      className="border"
                      onClick={() => {
                        setSelectedTask(task);
                        setShowTaskModal(true);
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

      {/* Edit Project Modal */}
      <ProjectModal
        show={showEditProjectModal}
        onHide={() => setShowEditProjectModal(false)}
        project={project}
        onSaved={loadProjectDetails}
      />

      {/* Add / Edit Task Modal */}
      <TaskModal
        show={showTaskModal}
        onHide={() => setShowTaskModal(false)}
        task={selectedTask}
        defaultProjectId={project.id}
        onSaved={loadProjectDetails}
      />

      {/* Delete Task Modal */}
      <Modal show={!!taskToDelete} onHide={() => setTaskToDelete(null)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold text-danger">
            <i className="bi bi-trash3-fill me-2"></i> Delete Task
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete <strong>"{taskToDelete?.taskName}"</strong>?
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="light" onClick={() => setTaskToDelete(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteTask}>
            Delete Task
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ProjectDetailPage;
