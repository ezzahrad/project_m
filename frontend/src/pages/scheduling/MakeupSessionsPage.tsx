import React, { useEffect, useState } from 'react'
import { Clock, CheckCircle, XCircle, Calendar, MapPin } from 'lucide-react'
import DataTable from '../../components/common/DataTable'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import { getMakeupSessions, approveMakeupSession } from '../../services/api/schedulingAPI'
import { MakeupSession } from '../../types/scheduling'
import { toast } from 'react-hot-toast'

const MakeupSessionsPage: React.FC = () => {
  const [makeupSessions, setMakeupSessions] = useState<MakeupSession[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSession, setSelectedSession] = useState<MakeupSession | null>(null)
  const [showApprovalDialog, setShowApprovalDialog] = useState(false)
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve')

  useEffect(() => {
    fetchMakeupSessions()
  }, [])

  const fetchMakeupSessions = async () => {
    setLoading(true)
    try {
      const data = await getMakeupSessions()
      setMakeupSessions(data)
    } catch (error) {
      toast.error('Erreur lors du chargement des rattrapages')
    } finally {
      setLoading(false)
    }
  }

  const handleApproval = async () => {
    if (!selectedSession) return

    try {
      await approveMakeupSession(selectedSession.id, approvalAction)
      toast.success(`Rattrapage ${approvalAction === 'approve' ? 'approuvé' : 'rejeté'}`)
      fetchMakeupSessions()
      setShowApprovalDialog(false)
      setSelectedSession(null)
    } catch (error) {
      toast.error('Erreur lors de l\'approbation')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'badge-warning'
      case 'APPROVED':
        return 'badge-success'
      case 'REJECTED':
        return 'badge-error'
      case 'COMPLETED':
        return 'badge-gray'
      default:
        return 'badge-gray'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4 text-warning-600" />
      case 'APPROVED':
        return <CheckCircle className="w-4 h-4 text-success-600" />
      case 'REJECTED':
        return <XCircle className="w-4 h-4 text-error-600" />
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-gray-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const columns = [
    {
      key: 'original_subject',
      label: 'Matière',
      sortable: true
    },
    {
      key: 'original_teacher',
      label: 'Enseignant',
      sortable: true
    },
    {
      key: 'proposed_date',
      label: 'Date proposée',
      render: (value: string, row: MakeupSession) => (
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(value).toLocaleDateString('fr-FR')}</span>
        </div>
      )
    },
    {
      key: 'proposed_time_display',
      label: 'Créneau',
      render: (value: string) => (
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <span>{value}</span>
        </div>
      )
    },
    {
      key: 'proposed_room_name',
      label: 'Salle',
      render: (value: string) => (
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span>{value}</span>
        </div>
      )
    },
    {
      key: 'status_display',
      label: 'Statut',
      render: (value: string, row: MakeupSession) => (
        <div className="flex items-center space-x-2">
          {getStatusIcon(row.status)}
          <span className={`badge ${getStatusBadge(row.status)}`}>
            {value}
          </span>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value: any, row: MakeupSession) => (
        <div className="flex space-x-2">
          {row.status === 'PENDING' && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedSession(row)
                  setApprovalAction('approve')
                  setShowApprovalDialog(true)
                }}
                className="text-success-600 hover:text-success-700 text-sm font-medium"
              >
                Approuver
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedSession(row)
                  setApprovalAction('reject')
                  setShowApprovalDialog(true)
                }}
                className="text-error-600 hover:text-error-700 text-sm font-medium"
              >
                Rejeter
              </button>
            </>
          )}
          <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            Détails
          </button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Séances de rattrapage</h1>
          <p className="text-gray-600">Gérer les demandes de rattrapage</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center space-x-3">
            <Clock className="w-8 h-8 text-warning-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {makeupSessions.filter(s => s.status === 'PENDING').length}
              </p>
              <p className="text-sm text-gray-600">En attente</p>
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-8 h-8 text-success-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {makeupSessions.filter(s => s.status === 'APPROVED').length}
              </p>
              <p className="text-sm text-gray-600">Approuvées</p>
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center space-x-3">
            <XCircle className="w-8 h-8 text-error-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {makeupSessions.filter(s => s.status === 'REJECTED').length}
              </p>
              <p className="text-sm text-gray-600">Rejetées</p>
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-8 h-8 text-gray-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {makeupSessions.filter(s => s.status === 'COMPLETED').length}
              </p>
              <p className="text-sm text-gray-600">Terminées</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={makeupSessions}
        loading={loading}
        searchable={true}
        filterable={true}
      />

      {/* Approval dialog */}
      <ConfirmDialog
        isOpen={showApprovalDialog}
        title={`${approvalAction === 'approve' ? 'Approuver' : 'Rejeter'} le rattrapage`}
        message={`Êtes-vous sûr de vouloir ${approvalAction === 'approve' ? 'approuver' : 'rejeter'} cette demande de rattrapage ?`}
        confirmText={approvalAction === 'approve' ? 'Approuver' : 'Rejeter'}
        cancelText="Annuler"
        type={approvalAction === 'approve' ? 'info' : 'danger'}
        onConfirm={handleApproval}
        onCancel={() => {
          setShowApprovalDialog(false)
          setSelectedSession(null)
        }}
      />
    </div>
  )
}

export default MakeupSessionsPage