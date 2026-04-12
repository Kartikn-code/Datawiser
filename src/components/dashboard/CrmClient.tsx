'use client'

import { useState, useEffect } from 'react'
import { Plus, User, FileText, ArrowUpRight, ArrowDownRight, CreditCard, RotateCcw } from 'lucide-react'
import { addCustomer, getCustomerTransactions, addTransaction } from '@/app/actions/crm'
import { useRouter } from 'next/navigation'

export default function CrmClient({ initialCustomers }: { initialCustomers: any[] }) {
  const [customers, setCustomers] = useState(initialCustomers || [])
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<any[]>([])

  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '' })
  const [newTx, setNewTx] = useState({ amount: '', type: 'sale', description: '' })
  
  const [loadingList, setLoadingList] = useState(false)
  const [loadingTx, setLoadingTx] = useState(false)
  const router = useRouter()

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId)

  useEffect(() => {
    async function loadTransactions() {
      if (selectedCustomerId) {
        setLoadingTx(true)
        const txs = await getCustomerTransactions(selectedCustomerId)
        setTransactions(txs)
        setLoadingTx(false)
      } else {
        setTransactions([])
      }
    }
    loadTransactions()
  }, [selectedCustomerId])

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCustomer.name) return
    
    setLoadingList(true)
    const res = await addCustomer(newCustomer.name, newCustomer.phone)
    if (res.success && res.data) {
      setCustomers([res.data[0], ...customers])
      setNewCustomer({ name: '', phone: '' })
      setSelectedCustomerId(res.data[0].id)
    }
    setLoadingList(false)
  }

  const handleAddTx = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCustomerId || !newTx.amount || isNaN(Number(newTx.amount))) return

    setLoadingTx(true)
    const res = await addTransaction(selectedCustomerId, Number(newTx.amount), newTx.type as any, newTx.description)
    if (res.success && res.data) {
      setTransactions([res.data[0], ...transactions])
      setNewTx({ amount: '', type: 'sale', description: '' })
    }
    setLoadingTx(false)
  }

  // Calculate balance
  const balance = transactions.reduce((acc, tx) => {
    const amount = Number(tx.amount)
    if (isNaN(amount)) return acc
    if (tx.type === 'credit') return acc + amount
    if (tx.type === 'payment') return acc - amount
    return acc
  }, 0)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Sidebar - Customer List */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[700px]">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="font-bold text-gray-900 mb-4">Add Customer</h2>
          <form onSubmit={handleAddCustomer} className="flex flex-col gap-3">
            <input 
              type="text" 
              placeholder="Full Name" 
              value={newCustomer.name}
              onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
              required
              className="w-full text-sm rounded-xl border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 px-3 border outline-none"
            />
            <div className="flex gap-2">
              <input 
                type="tel" 
                placeholder="Phone (optional)" 
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                className="w-full text-sm rounded-xl border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3 border outline-none"
              />
              <button 
                type="submit" 
                disabled={loadingList}
                className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-xl flex-shrink-0 transition-colors disabled:opacity-50"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {customers.length === 0 ? (
            <div className="text-center p-8 text-gray-400 text-sm">
              No customers found. Add one above.
            </div>
          ) : (
            <ul className="space-y-1">
              {customers.map((c: any) => (
                <li key={c.id}>
                  <button
                    onClick={() => setSelectedCustomerId(c.id)}
                    className={`w-full text-left px-4 py-3 rounded-2xl flex items-center gap-3 transition-colors ${
                      selectedCustomerId === c.id ? 'bg-indigo-50 border border-indigo-100' : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      selectedCustomerId === c.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      <User className="w-5 h-5" />
                    </div>
                    <div className="overflow-hidden">
                      <p className={`font-semibold truncate leading-tight ${selectedCustomerId === c.id ? 'text-indigo-900' : 'text-gray-900'}`}>
                        {c.name}
                      </p>
                      <p className={`text-xs truncate mt-0.5 ${selectedCustomerId === c.id ? 'text-indigo-500' : 'text-gray-500'}`}>
                        {c.phone || 'No phone'}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Main Area - Customer Details & Transactions */}
      <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col h-[700px]">
        {!selectedCustomer ? (
          <div className="flex-1 flex items-center justify-center text-center p-8">
            <div>
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">No Customer Selected</h3>
              <p className="text-gray-500 mt-2 max-w-sm mx-auto">Select a customer from the left sidebar to view defaults, add sales, or manage credits.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header / Stats */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center text-2xl shadow-md">
                  {selectedCustomer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedCustomer.name}</h2>
                  <p className="text-sm text-gray-500">{selectedCustomer.phone || 'No contact provided'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Total Sales</p>
                  <p className="text-2xl font-bold text-gray-900">
                     ${transactions.filter(t => t.type === 'sale').reduce((acc, t) => {
                       const val = Number(t.amount)
                       return acc + (isNaN(val) ? 0 : val)
                     }, 0).toFixed(2)}
                  </p>
                </div>
                <div className={`p-4 rounded-2xl border ${balance > 0 ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
                  <p className={`text-xs font-medium mb-1 uppercase tracking-wider ${balance > 0 ? 'text-red-500' : 'text-emerald-500'}`}>Pending Credit Debt</p>
                  <p className={`text-2xl font-bold ${balance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    ${Math.max(0, balance).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Transaction Form */}
            <div className="p-6 bg-gray-50/50 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Add Transaction</h3>
              <form onSubmit={handleAddTx} className="flex gap-3">
                <select 
                  value={newTx.type} 
                  onChange={(e) => setNewTx({...newTx, type: e.target.value})}
                  className="w-1/4 text-sm rounded-xl border-gray-200 border px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
                >
                  <option value="sale">Cash Sale</option>
                  <option value="credit">Give Credit/Loan</option>
                  <option value="payment">Receive Payment</option>
                </select>
                <input 
                  type="number" 
                  step="0.01"
                  placeholder="Amount" 
                  value={newTx.amount}
                  onChange={(e) => setNewTx({...newTx, amount: e.target.value})}
                  required
                  className="w-1/4 text-sm rounded-xl border-gray-200 border px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
                />
                <input 
                  type="text" 
                  placeholder="Description (e.g. Products bought)" 
                  value={newTx.description}
                  onChange={(e) => setNewTx({...newTx, description: e.target.value})}
                  className="flex-1 text-sm rounded-xl border-gray-200 border px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
                />
                <button 
                  type="submit" 
                  disabled={loadingTx}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 rounded-xl flex-shrink-0 transition-colors disabled:opacity-50 text-sm"
                >
                  Record
                </button>
              </form>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-6">
              <h3 className="font-bold text-gray-900 mb-4">History</h3>
              {transactions.length === 0 ? (
                <p className="text-gray-400 text-sm">No transactions yet recorded for this customer.</p>
              ) : (
                <div className="space-y-3">
                  {transactions.map(tx => (
                    <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          tx.type === 'sale' ? 'bg-indigo-100 text-indigo-600' :
                          tx.type === 'credit' ? 'bg-red-100 text-red-600' :
                          'bg-emerald-100 text-emerald-600'
                        }`}>
                          {tx.type === 'sale' ? <ArrowUpRight className="w-5 h-5" /> :
                           tx.type === 'credit' ? <CreditCard className="w-5 h-5" /> :
                           <ArrowDownRight className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 capitalize">{tx.type}</p>
                          <p className="text-xs text-gray-500">{tx.description || 'No description'} • {new Date(tx.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className={`font-bold ${
                        tx.type === 'sale' ? 'text-gray-900' :
                        tx.type === 'credit' ? 'text-red-600' :
                        'text-emerald-600'
                      }`}>
                        {tx.type === 'payment' ? '-' : tx.type === 'credit' ? '+' : ''}${Number(tx.amount).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
      
    </div>
  )
}
