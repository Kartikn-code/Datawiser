import { getCustomers } from '@/app/actions/crm'
import CrmClient from '@/components/dashboard/CrmClient'

export default async function CrmPage() {
  const initialCustomers = await getCustomers()

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Local CRM Lite</h1>
        <p className="mt-1 text-gray-500">Manage your business customers, track manual sales, and monitor credit all in one place.</p>
      </div>

      <CrmClient initialCustomers={initialCustomers} />
    </div>
  )
}
