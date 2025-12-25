import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const CourseDetails = () => {
  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h4>Course Details</h4>
            </Card.Header>
            <Card.Body>
              <p>Course details page - Show detailed information about a specific course</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CourseDetails;