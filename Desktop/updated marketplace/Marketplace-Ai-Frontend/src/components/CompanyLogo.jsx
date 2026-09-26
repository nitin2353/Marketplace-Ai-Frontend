import React, { Fragment } from 'react'
import { Container } from 'react-bootstrap'

const CompanyLogo = () => {
  return (
    <Fragment>
        <Container fluid className='text-center'>
          <div style={{fontFamily : "monospace"}} className='fs-1'>GAPL</div>
            {/* <img src='/logo.gif' className='company-logo-image' /> */}
            <p className='text-center'>Copyright GAPL Jajot</p>
        </Container>
    </Fragment>
  )
}

export default CompanyLogo