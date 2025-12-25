import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const CourseList = () => {
  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h4>Courses</h4>
            </Card.Header>
            <Card.Body>
              <p>Course list page - Display all available courses</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CourseList;