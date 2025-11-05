import React, { useState } from 'react'
import SendMoney from './sendMoney'
import TransactionList from './transactionList'

const WalletPage = () => {
    const [balance, setBalance] = useState(500)
    const[transactions, setTransactions] = useState("")



    const handleSendMoney = (amount,receiver)=>{
        if(amount<=0) return alert("Enter a valid Amount")
        if(amount> balance) return alert("Insufficient balance")

            const newTransaction = {
                id:Date.now(),
                receiver,
                amount,
                date:new Date().toLocaleString(),
                status:"Completed"
            }
            setBalance((prev)=>prev-amount)
            setTransactions((prev)=>[newTransaction,...prev])
    }



  return (
    <div className='min-h-screen bg-gray-100 flex flex-col items-center p-6'> 
     <div className='bg-white shadow-md rounded-lg p-6 w-full max-w-md'> 
        <h2 className='text-2xl font-bold text-gray-800 mb-4'>Wallet</h2>
        <p className='text-gray-600 mb-2'>Current Balance:</p>
        <p className='text-3xl font-semibold text-green-600 mb-6'>${balance.toFixed(2)}</p>

        <SendMoney onSend={handleSendMoney}/>
        <TransactionList transactions={transactions}/>
     </div>
    </div>
  )
}

export default WalletPage