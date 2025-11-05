import React from 'react'
import "../payment/PaymentSuccess.css"
import { useLocation } from 'react-router-dom'



const PaymentSuccess = () => {
     const query = new URLSearchParams(useLocation().search)

     const reference = query.get("reference")

  return (
    <div className='payment-success-container'>
        <div className='payment-success-card '>
            <h1 className='payment-success-title'>Payment Successful</h1>
            <p className='payment-success-message'>Successful ! Thank you for your payment</p>

            {
                reference && <p className='payment-success-reference'>
                    <strong>Reference Id:{reference}</strong>
                </p>
            }

        </div>


    </div>
  )
}

export default PaymentSuccess