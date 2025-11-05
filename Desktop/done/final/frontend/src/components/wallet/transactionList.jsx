import React from 'react'

const TransactionList = ({transactions}) => {
    if(transactions.length === 0)
        return <p className='text-gray-500 text-center'>No transactions yet.....</p>

   
  return (
    <div>
        <h3 className='text-lg font-semibold mb-3'>Recent Transactions</h3>
        <ul className='space-y-2 max-h-60 overflow-y-auto'>
            {TransactionList.map((tx)=>(
                <li key={tx.id} className='border border-gray-200 rounded-md p-3 flex justify-between items-center'>
                    <div>
                        <p className='font-medium text-gray-700'>{tx.receiver}</p>
                        <p className='text-sm text-gray-500'>{tx.date}</p>
                    </div>
                    <p className='text-green-600 font-semibold'>${tx.amount}</p>
                </li>

            ))}

        </ul>
    </div>
  )
}

export default TransactionList