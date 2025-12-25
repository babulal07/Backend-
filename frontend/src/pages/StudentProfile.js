import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const StudentProfile = () => {
  const { user } = useAuth();

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h4>Student Profile</h4>
            </Card.Header>
            <Card.Body>
              <p>Student profile page - {user?.firstName} {user?.lastName}</p>
              <p>This page will show detailed student profile information and allow editing.</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default StudentProfile;