import { getCustomers } from '@/app/actions/crm'
import CrmClient from '@/components/dashboard/CrmClient'

export default async function CrmPage() {
  const initialCustomers = await getCustomers()

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-black/5">
        <div>
          <h1 className="text-4xl font-heading font-black tracking-tighter text-foreground">Sales <span className="text-electric-purple">Ecosystem</span></h1>
          <p className="mt-2 text-foreground/40 font-bold uppercase tracking-widest text-[10px]">High-fidelity partner management</p>
        </div>
      </div>

      <CrmClient initialCustomers={initialCustomers} />
    </div>
  )
}
