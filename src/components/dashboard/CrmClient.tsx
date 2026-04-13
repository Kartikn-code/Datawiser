'use client'

import React, { useState, useEffect } from 'react'
import { Plus, User, FileText, ArrowUpRight, ArrowDownRight, CreditCard, Sparkles, TrendingUp, History, Phone } from 'lucide-react'
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

  const balance = transactions.reduce((acc, tx) => {
    const amount = Number(tx.amount)
    if (isNaN(amount)) return acc
    if (tx.type === 'credit') return acc + amount
    if (tx.type === 'payment') return acc - amount
    return acc
  }, 0)

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
      
      {/* Sidebar - Partner Registry */}
      <div className="xl:col-span-4 flex flex-col gap-6">
        <div className="glass-panel rounded-[32px] p-8 shadow-xl overflow-hidden border-black/[0.03] relative bg-white">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-vivid-red/5 rounded-full blur-3xl"></div>
          
          <h2 className="text-xl font-heading font-black text-foreground mb-6 uppercase tracking-tighter">Onboard Partner</h2>
          <form onSubmit={handleAddCustomer} className="space-y-4 relative z-10">
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Partner Identity" 
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                required
                className="w-full bg-black/[0.02] text-foreground font-bold text-sm rounded-2xl border border-black/5 focus:border-vivid-red/30 focus:ring-0 py-4 px-5 outline-none transition-all placeholder:text-foreground/20"
              />
              <div className="flex gap-3">
                <input 
                  type="tel" 
                  placeholder="Link Protocol" 
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                  className="w-full bg-black/[0.02] text-foreground font-bold text-sm rounded-2xl border border-black/5 focus:border-vivid-red/30 focus:ring-0 py-4 px-5 outline-none transition-all placeholder:text-foreground/20"
                />
                <button 
                  type="submit" 
                  disabled={loadingList}
                  className="bg-vivid-red text-white hover:scale-105 active:scale-95 p-4 rounded-2xl flex-shrink-0 transition-all disabled:opacity-50 shadow-xl shadow-vivid-red/20"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="glass-panel rounded-[32px] border-black/[0.03] flex flex-col h-[500px] shadow-xl overflow-hidden bg-white">
            <div className="px-6 py-5 border-b border-black/[0.02] flex items-center justify-between">
                <span className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.2em]">Partner Registry</span>
                <div className="px-2 py-1 rounded bg-black/5 text-[9px] font-black text-foreground/40 uppercase tracking-widest">{customers.length} Entries</div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
            {customers.length === 0 ? (
                <div className="text-center py-20 px-10">
                    <User className="w-12 h-12 text-foreground/5 mx-auto mb-4" />
                    <p className="text-xs font-bold text-foreground/20 uppercase tracking-widest">Registry Empty</p>
                </div>
            ) : (
                <div className="space-y-2">
                {customers.map((c: any) => (
                    <button
                        key={c.id}
                        onClick={() => setSelectedCustomerId(c.id)}
                        className={`w-full text-left px-5 py-5 rounded-[24px] flex items-center gap-4 transition-all duration-500 relative overflow-hidden group isolate ${
                        selectedCustomerId === c.id 
                            ? 'bg-soft-slate border border-black/[0.05]' 
                            : 'hover:bg-black/[0.02] border border-transparent'
                        }`}
                    >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                        selectedCustomerId === c.id ? 'bg-electric-purple text-white shadow-lg shadow-electric-purple/20 scale-110' : 'bg-black/[0.03] text-foreground/20 group-hover:bg-black/5'
                        }`}>
                        <User className="w-6 h-6" />
                        </div>
                        <div className="overflow-hidden">
                        <p className={`font-black tracking-tight leading-none text-base ${selectedCustomerId === c.id ? 'text-foreground' : 'text-foreground/50'}`}>
                            {c.name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-2">
                            <Phone className="w-3 h-3 text-foreground/10" />
                            <p className={`text-[11px] font-black uppercase tracking-wider ${selectedCustomerId === c.id ? 'text-electric-purple' : 'text-foreground/10'}`}>
                                {c.phone || 'NO LINK'}
                            </p>
                        </div>
                        </div>
                    </button>
                ))}
                </div>
            )}
            </div>
        </div>
      </div>

      {/* Main Area - Partner Cockpit */}
      <div className="xl:col-span-8 space-y-8 h-full">
        {!selectedCustomer ? (
          <div className="glass-panel rounded-[40px] border-black/[0.03] h-full min-h-[600px] flex items-center justify-center text-center p-12 shadow-3xl bg-white">
            <div className="max-w-sm">
                <div className="w-32 h-32 bg-black/[0.01] border border-black/[0.02] rounded-[40px] flex items-center justify-center mx-auto mb-10">
                    <History className="w-16 h-16 text-foreground/[0.03]" />
                </div>
                <h3 className="text-3xl font-heading font-black text-foreground/20 tracking-tighter mb-4 uppercase">Registry Selection</h3>
                <p className="text-foreground/20 text-[10px] font-black uppercase tracking-[0.3em] leading-loose">Awaiting partner link initialization</p>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-right-4 duration-700 space-y-8">
            {/* Header / Stats Cockpit */}
            <div className="glass-panel rounded-[40px] p-10 border-black/[0.03] relative overflow-hidden shadow-2xl bg-white">
              <div className="absolute top-0 right-0 p-10 opacity-[0.01] pointer-events-none">
                  <TrendingUp className="w-72 h-72 text-foreground" />
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 relative z-10">
                <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-[32px] bg-gradient-to-tr from-electric-purple to-vivid-red p-1 shadow-xl">
                        <div className="w-full h-full bg-white rounded-[28px] flex items-center justify-center text-4xl font-heading font-black text-foreground">
                            {selectedCustomer.name.charAt(0).toUpperCase()}
                        </div>
                    </div>
                    <div>
                        <h2 className="text-4xl font-heading font-black text-foreground tracking-tighter mb-1 uppercase">{selectedCustomer.name}</h2>
                        <p className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em]">{selectedCustomer.phone || 'link unavailable'}</p>
                    </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                <div className="bg-soft-slate p-8 rounded-[32px] border border-black/[0.02] hover:bg-white transition-all shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                      <p className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em]">Total Value</p>
                      <TrendingUp className="w-4 h-4 text-vivid-red" />
                  </div>
                  <p className="text-4xl font-heading font-black text-foreground tracking-tighter">
                     ${transactions.filter(t => t.type === 'sale').reduce((acc, t) => {
                       const val = Number(t.amount)
                       return acc + (isNaN(val) ? 0 : val)
                     }, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className={`p-8 rounded-[32px] border transition-all ${balance > 0 ? 'bg-vivid-rose/5 border-vivid-rose/20' : 'bg-emerald-50 border-emerald-100'}`}>
                  <div className="flex items-center justify-between mb-4">
                      <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${balance > 0 ? 'text-vivid-rose' : 'text-emerald-500'}`}>Current Liability</p>
                      <CreditCard className={`w-4 h-4 ${balance > 0 ? 'text-vivid-rose' : 'text-emerald-500'}`} />
                  </div>
                  <p className={`text-4xl font-heading font-black tracking-tighter ${balance > 0 ? 'text-foreground' : 'text-emerald-600'}`}>
                    ${Math.max(0, balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>

            {/* Transaction Logic Hub */}
            <div className="glass-panel rounded-[40px] p-8 border-black/[0.03] bg-white shadow-xl">
              <h3 className="text-[11px] font-black text-foreground/20 mb-8 uppercase tracking-[0.4em]">Event Initialization</h3>
              <form onSubmit={handleAddTx} className="flex flex-col lg:flex-row gap-4">
                <select 
                  value={newTx.type} 
                  onChange={(e) => setNewTx({...newTx, type: e.target.value})}
                  className="lg:w-1/4 bg-black/[0.02] border border-black/5 text-foreground font-black text-xs rounded-2xl p-4 outline-none focus:border-vivid-red transition-all uppercase tracking-widest"
                >
                  <option value="sale">Cash Sale</option>
                  <option value="credit">Issue Credit</option>
                  <option value="payment">Collect Payment</option>
                </select>
                <div className="relative lg:w-1/4">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/20 font-black text-xs">$</span>
                    <input 
                    type="number" 
                    step="0.01"
                    placeholder="0.00" 
                    value={newTx.amount}
                    onChange={(e) => setNewTx({...newTx, amount: e.target.value})}
                    required
                    className="w-full bg-black/[0.02] border border-black/5 text-foreground font-black text-sm rounded-2xl py-4 pl-8 pr-5 outline-none focus:border-vivid-red transition-all"
                    />
                </div>
                <input 
                  type="text" 
                  placeholder="Context Description..." 
                  value={newTx.description}
                  onChange={(e) => setNewTx({...newTx, description: e.target.value})}
                  className="flex-1 bg-black/[0.02] border border-black/5 text-foreground font-black text-sm rounded-2xl p-4 outline-none focus:border-vivid-red transition-all placeholder:text-foreground/20"
                />
                <button 
                  type="submit" 
                  disabled={loadingTx}
                  className="bg-foreground text-white font-black px-10 rounded-2xl flex-shrink-0 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 text-xs uppercase tracking-widest shadow-xl shadow-black/10 h-[58px]"
                >
                  Post Registry
                </button>
              </form>
            </div>

            {/* History Feed */}
            <div className="glass-panel rounded-[40px] p-10 border-black/[0.03] bg-white shadow-2xl">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-xl font-heading font-black text-foreground tracking-tighter uppercase flex items-center gap-3">
                    <History className="w-5 h-5 text-vivid-red" />
                    Telemetric Stream
                </h3>
              </div>
              
              {transactions.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-black/[0.02] rounded-[32px]">
                    <p className="text-sm font-black text-foreground/10 uppercase tracking-[0.3em]">Stream Inactive</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map(tx => (
                    <div key={tx.id} className="group flex items-center justify-between p-6 rounded-[32px] border border-black/[0.02] hover:bg-soft-slate hover:scale-[1.01] transition-all duration-500 shadow-sm hover:shadow-md">
                      <div className="flex items-center gap-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                          tx.type === 'sale' ? 'bg-soft-slate text-vivid-red border border-black/5' :
                          tx.type === 'credit' ? 'bg-vivid-rose/5 text-vivid-rose border border-vivid-rose/10' :
                          'bg-emerald-50 text-emerald-500 border border-emerald-100'
                        }`}>
                          {tx.type === 'sale' ? <ArrowUpRight className="w-6 h-6" /> :
                           tx.type === 'credit' ? <CreditCard className="w-6 h-6" /> :
                           <ArrowDownRight className="w-6 h-6" />}
                        </div>
                        <div>
                          <p className="font-black text-foreground text-lg tracking-tight uppercase leading-none mb-2">{tx.type}</p>
                          <p className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em]">{tx.description || 'No context'} • {new Date(tx.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className={`text-2xl font-heading font-black tracking-tighter ${
                        tx.type === 'sale' ? 'text-foreground' :
                        tx.type === 'credit' ? 'text-vivid-rose' :
                        'text-emerald-500'
                      }`}>
                        {tx.type === 'payment' ? '-' : tx.type === 'credit' ? '+' : ''}${Number(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
    </div>
  )
}
