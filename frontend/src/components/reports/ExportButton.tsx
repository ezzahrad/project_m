import React, { useState } from 'react'
import { Download, FileText, Table, File } from 'lucide-react'
import { exportSchedules, exportTeacherWorkload } from '../../services/api/reportsAPI'
import { toast } from 'react-hot-toast'

interface ExportButtonProps {
  type: 'schedules' | 'teacher_workload'
  params: any
  label?: string
}

const ExportButton: React.FC<ExportButtonProps> = ({ type, params, label }) => {
  const [exporting, setExporting] = useState(false)
  const [showFormats, setShowFormats] = useState(false)

  const formats = [
    { id: 'pdf', name: 'PDF', icon: FileText, color: 'text-error-600' },
    { id: 'excel', name: 'Excel', icon: Table, color: 'text-success-600' },
    { id: 'csv', name: 'CSV', icon: File, color: 'text-warning-600' }
  ]

  const handleExport = async (format: string) => {
    setExporting(true)
    try {
      let blob: Blob
      
      if (type === 'schedules') {
        blob = await exportSchedules({ ...params, format })
      } else {
        blob = await exportTeacherWorkload({ ...params, format })
      }

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${type}_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : format}`
      link.click()
      window.URL.revokeObjectURL(url)

      toast.success(`Export ${format.toUpperCase()} réussi`)
      setShowFormats(false)
    } catch (error) {
      toast.error('Erreur lors de l\'export')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowFormats(!showFormats)}
        disabled={exporting}
        className="btn btn-outline btn-md"
      >
        {exporting ? (
          <div className="flex items-center space-x-2">
            <div className="spinner" />
            <span>Export...</span>
          </div>
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            {label || 'Exporter'}
          </>
        )}
      </button>

      {showFormats && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[150px]">
          {formats.map((format) => (
            <button
              key={format.id}
              onClick={() => handleExport(format.id)}
              className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
            >
              <format.icon className={`w-4 h-4 ${format.color}`} />
              <span className="text-sm font-medium text-gray-900">{format.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Overlay to close dropdown */}
      {showFormats && (
        <div 
          className="fixed inset-0 z-0"
          onClick={() => setShowFormats(false)}
        />
      )}
    </div>
  )
}

export default ExportButton