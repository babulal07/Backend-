import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const StudentList = () => {
  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h4>Students (Admin)</h4>
            </Card.Header>
            <Card.Body>
              <p>Student list page - Admin view to manage all students</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default StudentList;