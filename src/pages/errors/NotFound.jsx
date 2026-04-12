import React from 'react'
import { Card, Col, Container, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <Container fluid className='d-flex justify-content-center align-items-center min-vh-100'>
      <Row className='w-100 justify-content-center'>
        <Col xs={11} sm={10} md={8} lg={6} xl={5}>
          <Card className=''>
            <Card.Body className='text-center p-4 p-md-5'>
              <div className='mb-4'>
                <h1 
                  className='display-1 fw-bold mb-0' 
                  style={{ 
                    fontSize: "clamp(4rem, 12vw, 8rem)", 
                    color: "var(--primary-color)",
                    lineHeight: "1"
                  }}
                >
                  404
                </h1>
              </div>
              <div className='mb-4'>
                <p className='fs-5 fs-md-4 fw-bold text-muted mb-0'>
                  Oops! The page you are looking for is not here.
                </p>
              </div>
              <div>
                <Link 
                  to="/" 
                  className='btn btn-lg custom-btn-secondary px-4 py-2'
                >
                  Go To Home
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default NotFound