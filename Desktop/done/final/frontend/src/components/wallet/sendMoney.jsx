import React from 'react'
import { useState } from 'react'

const SendMoney = ({onSend}) => {

    const[receiver, setReceiver] = useState("")
    const[amount, setAmount] = useState("")


    const handleSubmit =(e)=>{
        e.preventDefault()
        onSend(Number(amount), receiver)
        setAmount("")
        setReceiver("")
    }

<<<<<<< HEAD
=======
   



>>>>>>> b0631ab8d75811578626353574088e42e50af8f2
  return (
    <form onSubmit={handleSubmit} className='mb-6'>
        <label className='block mb-2 text-gray-700 font-medium'>
            Receiver (Freelancer Email or ID)
        </label>
        <input 
        type='text'
        value={receiver}
        onChange={(e)=> setReceiver(e.target.value)}
        required placeholder='freelancer@example.com'
        className='w-full border border-gray-300 rounded-md p-2 mb-3 focus:ring-2 focus:ring-blue-500 outline-none'/>
        <label className='block mb-2 text-gray-700 font-medium'>Amount</label>
        <input 
        type='number'
        value={amount}
        onChange={(e)=>setAmount(e.target.value)}
        required placeholder='Enter Amount'
        className='w-full border border-gray-300 rounded-md p-2 mb-3 focus:ring-2 focus:ring-blue-500 outline-none'/>
        <button type='submit' className='w-full bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 transition'>
        Send Money
        </button>
    </form>
  )
}

export default SendMoney