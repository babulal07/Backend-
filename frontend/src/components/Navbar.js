import React from 'react';
import { Navbar as BootstrapNavbar, Nav, NavDropdown, Container, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Users, BookOpen, BarChart3, UserPlus } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <BootstrapNavbar bg="white" expand="lg" fixed="top" className="border-bottom">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/dashboard" className="fw-bold">
          <BookOpen className="me-2" size={24} />
          Student Course Management
        </BootstrapNavbar.Brand>
        
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/dashboard">
              <BarChart3 className="me-1" size={16} />
              Dashboard
            </Nav.Link>
            
            <Nav.Link as={Link} to="/courses">
              <BookOpen className="me-1" size={16} />
              Courses
            </Nav.Link>

            {user?.role === 'admin' && (
              <>
                <Nav.Link as={Link} to="/students">
                  <Users className="me-1" size={16} />
                  Students
                </Nav.Link>
                
                <Nav.Link as={Link} to="/admin">
                  <BarChart3 className="me-1" size={16} />
                  Admin Panel
                </Nav.Link>
              </>
            )}
          </Nav>

          <Nav>
            {user?.role === 'admin' && (
              <Nav.Link as={Link} to="/register" className="me-2">
                <UserPlus className="me-1" size={16} />
                Add Student
              </Nav.Link>
            )}
            
            <NavDropdown
              title={
                <span>
                  <User className="me-1" size={16} />
                  {user?.firstName} {user?.lastName}
                  <Badge bg="secondary" className="ms-2">
                    {user?.role}
                  </Badge>
                </span>
              }
              id="user-nav-dropdown"
              align="end"
            >
              <NavDropdown.Item as={Link} to="/profile">
                <User className="me-2" size={16} />
                My Profile
              </NavDropdown.Item>
              
              <NavDropdown.Divider />
              
              <NavDropdown.Item onClick={handleLogout}>
                <LogOut className="me-2" size={16} />
                Logout
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;