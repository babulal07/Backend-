import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Badge } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { coursesAPI, studentsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  TrendingUp,
  Calendar,
  Award,
  User,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    courses: [],
    studentProfile: null,
    statistics: null,
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        if (user?.role === 'admin') {
          // Load admin dashboard data
          const [coursesResponse, statisticsResponse] = await Promise.all([
            coursesAPI.getAll(),
            coursesAPI.getStatistics(),
          ]);

          setDashboardData({
            courses: coursesResponse.data.data.courses,
            statistics: statisticsResponse.data.data,
          });
        } else if (user?.role === 'student') {
          // Load student dashboard data
          const [coursesResponse, profileResponse] = await Promise.all([
            coursesAPI.getAll({ limit: 5 }),
            studentsAPI.getById(user.studentId),
          ]);

          setDashboardData({
            courses: coursesResponse.data.data.courses,
            studentProfile: profileResponse.data.data,
          });
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadDashboardData();
    }
  }, [user]);

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  if (user?.role === 'admin') {
    return <AdminDashboardView data={dashboardData} user={user} />;
  } else {
    return <StudentDashboardView data={dashboardData} user={user} />;
  }
};

// Admin Dashboard View
const AdminDashboardView = ({ data, user }) => {
  const { statistics, courses } = data;

  return (
    <Container fluid className="py-4 fade-in">
      <Row className="mb-4">
        <Col>
          <h1 className="h3 mb-3">
            Welcome back, {user.firstName}! 👋
          </h1>
          <p className="text-muted">Here's what's happening in your system today.</p>
        </Col>
      </Row>

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={3} sm={6} className="mb-3">
          <div className="stat-card">
            <div className="d-flex align-items-center">
              <div className="me-3">
                <Users size={32} className="text-primary" />
              </div>
              <div>
                <h3>{statistics?.length || 0}</h3>
                <p>Total Courses</p>
              </div>
            </div>
          </div>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <div className="stat-card">
            <div className="d-flex align-items-center">
              <div className="me-3">
                <GraduationCap size={32} className="text-success" />
              </div>
              <div>
                <h3>
                  {statistics?.reduce((total, course) => total + course.activeStudents, 0) || 0}
                </h3>
                <p>Active Students</p>
              </div>
            </div>
          </div>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <div className="stat-card">
            <div className="d-flex align-items-center">
              <div className="me-3">
                <Award size={32} className="text-info" />
              </div>
              <div>
                <h3>
                  {statistics?.reduce((total, course) => total + course.graduatedStudents, 0) || 0}
                </h3>
                <p>Graduates</p>
              </div>
            </div>
          </div>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <div className="stat-card">
            <div className="d-flex align-items-center">
              <div className="me-3">
                <TrendingUp size={32} className="text-warning" />
              </div>
              <div>
                <h3>
                  {statistics?.length > 0 
                    ? (statistics.reduce((sum, course) => sum + parseFloat(course.averageGpa), 0) / statistics.length).toFixed(2)
                    : '0.00'
                  }
                </h3>
                <p>Average GPA</p>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {/* Course Statistics */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <BookOpen className="me-2" size={18} />
                Course Statistics
              </h5>
            </Card.Header>
            <Card.Body>
              {statistics && statistics.length > 0 ? (
                <Row>
                  {statistics.slice(0, 6).map((course, index) => (
                    <Col md={6} lg={4} key={course.id} className="mb-3">
                      <Card className="h-100 border-0 bg-light">
                        <Card.Body>
                          <h6 className="card-title">{course.name}</h6>
                          <p className="text-muted small mb-2">{course.code}</p>
                          <div className="d-flex justify-content-between mb-2">
                            <small>Students:</small>
                            <Badge bg="primary">{course.enrolledStudents}</Badge>
                          </div>
                          <div className="d-flex justify-content-between mb-2">
                            <small>Utilization:</small>
                            <Badge bg="success">{course.utilizationRate}</Badge>
                          </div>
                          <div className="d-flex justify-content-between">
                            <small>Avg GPA:</small>
                            <Badge bg="info">{course.averageGpa}</Badge>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : (
                <Alert variant="info">
                  No course statistics available yet.
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

// Student Dashboard View
const StudentDashboardView = ({ data, user }) => {
  const { courses, studentProfile } = data;

  return (
    <Container fluid className="py-4 fade-in">
      <Row className="mb-4">
        <Col>
          <h1 className="h3 mb-3">
            Welcome back, {user.firstName}! 📚
          </h1>
          <p className="text-muted">Manage your academic journey and course information.</p>
        </Col>
      </Row>

      <Row className="mb-4">
        {/* Student Profile Card */}
        <Col lg={8} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <User className="me-2" size={18} />
                Your Profile
              </h5>
            </Card.Header>
            <Card.Body>
              {studentProfile ? (
                <Row>
                  <Col md={6}>
                    <div className="mb-3">
                      <strong>Student Number:</strong>
                      <div>{studentProfile.studentNumber}</div>
                    </div>
                    <div className="mb-3">
                      <strong>
                        <Mail className="me-1" size={14} />
                        Email:
                      </strong>
                      <div>{studentProfile.email}</div>
                    </div>
                    <div className="mb-3">
                      <strong>Status:</strong>
                      <div>
                        <Badge bg={`status-${studentProfile.status}`}>
                          {studentProfile.status}
                        </Badge>
                      </div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-3">
                      <strong>GPA:</strong>
                      <div className="h5 text-primary">{studentProfile.gpa || 'N/A'}</div>
                    </div>
                    <div className="mb-3">
                      <strong>
                        <Calendar className="me-1" size={14} />
                        Enrollment Date:
                      </strong>
                      <div>{new Date(studentProfile.enrollmentDate).toLocaleDateString()}</div>
                    </div>
                    {studentProfile.phone && (
                      <div className="mb-3">
                        <strong>
                          <Phone className="me-1" size={14} />
                          Phone:
                        </strong>
                        <div>{studentProfile.phone}</div>
                      </div>
                    )}
                  </Col>
                </Row>
              ) : (
                <Alert variant="info">
                  Profile information is loading...
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Current Course Card */}
        <Col lg={4} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <BookOpen className="me-2" size={18} />
                Current Course
              </h5>
            </Card.Header>
            <Card.Body>
              {studentProfile?.course ? (
                <div>
                  <h6 className="card-title">{studentProfile.course.name}</h6>
                  <p className="text-muted mb-2">
                    Code: {studentProfile.course.code}
                  </p>
                  <p className="text-muted mb-2">
                    Duration: {studentProfile.course.duration} weeks
                  </p>
                  <Badge bg="success">Enrolled</Badge>
                </div>
              ) : (
                <Alert variant="warning" className="mb-0">
                  You are not currently enrolled in any course.
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Available Courses */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <BookOpen className="me-2" size={18} />
                Available Courses
              </h5>
            </Card.Header>
            <Card.Body>
              {courses && courses.length > 0 ? (
                <Row>
                  {courses.slice(0, 6).map((course) => (
                    <Col md={6} lg={4} key={course.id} className="mb-3">
                      <Card className="h-100 border-0 bg-light">
                        <Card.Body>
                          <h6 className="card-title">{course.name}</h6>
                          <p className="text-muted small mb-2">{course.code}</p>
                          <p className="text-muted small mb-2">
                            Duration: {course.duration} weeks
                          </p>
                          <div className="d-flex justify-content-between">
                            <small>Available Slots:</small>
                            <Badge bg={course.availableSlots > 0 ? 'success' : 'danger'}>
                              {course.availableSlots}
                            </Badge>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : (
                <Alert variant="info">
                  No courses available at the moment.
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;