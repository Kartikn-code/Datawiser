'use client'

import { useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteDataset } from '@/app/actions/dataset'
import { useRouter } from 'next/navigation'

export default function DeleteDatasetButton({ datasetId }: { datasetId: string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this dataset entirely? This action cannot be undone.")) {
      setIsDeleting(true)
      const res = await deleteDataset(datasetId)
      if (res.error) {
        alert("Failed to delete: " + res.error)
        setIsDeleting(false)
      } else {
        router.push('/dashboard')
      }
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed print:hidden"
      title="Delete Dataset"
    >
      {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
      <span>Delete</span>
    </button>
  )
}
