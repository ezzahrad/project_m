import React, { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle, Clock, Users, MapPin } from 'lucide-react'
import DataTable from '../../components/common/DataTable'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import { toast } from 'react-hot-toast'

interface Conflict {
  id: number
  schedule1_title: string
  schedule2_title?: string
  conflict_type: string
  conflict_type_display: string
  severity: string
  severity_display: string
  description: string
  is_resolved: boolean
  resolved_by_name?: string
  resolved_at?: string
  created_at: string
}

const ConflictsPage: React.FC = () => {
  const [conflicts, setConflicts] = useState<Conflict[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedConflict, setSelectedConflict] = useState<Conflict | null>(null)
  const [showResolveDialog, setShowResolveDialog] = useState(false)

  useEffect(() => {
    fetchConflicts()
  }, [])

  const fetchConflicts = async () => {
    setLoading(true)
    try {
      // Simulate API call - replace with actual API
      const mockConflicts: Conflict[] = [
        {
          id: 1,
          schedule1_title: 'Mathématiques - L1 Info',
          schedule2_title: 'Physique - L1 Info',
          conflict_type: 'ROOM_DOUBLE_BOOKING',
          conflict_type_display: 'Double réservation de salle',
          severity: 'HIGH',
          severity_display: 'Élevée',
          description: 'La salle A101 est réservée pour deux cours simultanément',
          is_resolved: false,
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          schedule1_title: 'Algorithmique - L2 Info',
          conflict_type: 'TEACHER_DOUBLE_BOOKING',
          conflict_type_display: 'Enseignant sur plusieurs créneaux',
          severity: 'CRITICAL',
          severity_display: 'Critique',
          description: 'Prof. Martin est assigné sur deux créneaux simultanés',
          is_resolved: false,
          created_at: new Date().toISOString()
        }
      ]
      setConflicts(mockConflicts)
    } catch (error) {
      toast.error('Erreur lors du chargement des conflits')
    } finally {
      setLoading(false)
    }
  }

  const handleResolveConflict = async () => {
    if (!selectedConflict) return

    try {
      // Simulate API call
      setConflicts(prev => 
        prev.map(conflict => 
          conflict.id === selectedConflict.id 
            ? { ...conflict, is_resolved: true, resolved_at: new Date().toISOString() }
            : conflict
        )
      )
      toast.success('Conflit résolu')
      setShowResolveDialog(false)
      setSelectedConflict(null)
    } catch (error) {
      toast.error('Erreur lors de la résolution')
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <AlertTriangle className="w-4 h-4 text-error-600" />
      case 'HIGH':
        return <AlertTriangle className="w-4 h-4 text-warning-600" />
      case 'MEDIUM':
        return <Clock className="w-4 h-4 text-primary-600" />
      default:
        return <CheckCircle className="w-4 h-4 text-gray-600" />
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'badge-error'
      case 'HIGH':
        return 'badge-warning'
      case 'MEDIUM':
        return 'badge-primary'
      default:
        return 'badge-gray'
    }
  }

  const getConflictTypeIcon = (type: string) => {
    switch (type) {
      case 'ROOM_DOUBLE_BOOKING':
        return <MapPin className="w-4 h-4" />
      case 'TEACHER_DOUBLE_BOOKING':
        return <Users className="w-4 h-4" />
      default:
        return <AlertTriangle className="w-4 h-4" />
    }
  }

  const columns = [
    {
      key: 'conflict_type_display',
      label: 'Type',
      render: (value: string, row: Conflict) => (
        <div className="flex items-center space-x-2">
          {getConflictTypeIcon(row.conflict_type)}
          <span>{value}</span>
        </div>
      )
    },
    {
      key: 'schedule1_title',
      label: 'Cours concerné',
      sortable: true
    },
    {
      key: 'severity_display',
      label: 'Sévérité',
      render: (value: string, row: Conflict) => (
        <span className={`badge ${getSeverityBadge(row.severity)}`}>
          {value}
        </span>
      )
    },
    {
      key: 'description',
      label: 'Description',
      render: (value: string) => (
        <span className="max-w-xs truncate">{value}</span>
      )
    },
    {
      key: 'is_resolved',
      label: 'Statut',
      render: (value: boolean) => (
        <span className={`badge ${value ? 'badge-success' : 'badge-error'}`}>
          {value ? 'Résolu' : 'En attente'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value: any, row: Conflict) => (
        <div className="flex space-x-2">
          {!row.is_resolved && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setSelectedConflict(row)
                setShowResolveDialog(true)
              }}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Résoudre
            </button>
          )}
          <button className="text-gray-600 hover:text-gray-700 text-sm font-medium">
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
          <h1 className="text-2xl font-bold text-gray-900">Conflits d'emploi du temps</h1>
          <p className="text-gray-600">Gérer et résoudre les conflits de planification</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            {conflicts.filter(c => !c.is_resolved).length} conflits non résolus
          </span>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-8 h-8 text-error-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {conflicts.filter(c => c.severity === 'CRITICAL' && !c.is_resolved).length}
              </p>
              <p className="text-sm text-gray-600">Critiques</p>
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-8 h-8 text-warning-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {conflicts.filter(c => c.severity === 'HIGH' && !c.is_resolved).length}
              </p>
              <p className="text-sm text-gray-600">Élevés</p>
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center space-x-3">
            <Clock className="w-8 h-8 text-primary-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {conflicts.filter(c => c.severity === 'MEDIUM' && !c.is_resolved).length}
              </p>
              <p className="text-sm text-gray-600">Moyens</p>
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-8 h-8 text-success-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {conflicts.filter(c => c.is_resolved).length}
              </p>
              <p className="text-sm text-gray-600">Résolus</p>
            </div>
          </div>
        </div>
      </div>

      {/* Conflicts table */}
      <DataTable
        columns={columns}
        data={conflicts}
        loading={loading}
        searchable={true}
        filterable={true}
        onRowClick={(row) => {
          // Handle row click for details
          console.log('Conflict details:', row)
        }}
      />

      {/* Resolve conflict dialog */}
      <ConfirmDialog
        isOpen={showResolveDialog}
        title="Résoudre le conflit"
        message={`Êtes-vous sûr de vouloir marquer ce conflit comme résolu ? Cette action ne peut pas être annulée.`}
        confirmText="Résoudre"
        cancelText="Annuler"
        type="warning"
        onConfirm={handleResolveConflict}
        onCancel={() => {
          setShowResolveDialog(false)
          setSelectedConflict(null)
        }}
      />
    </div>
  )
}

export default ConflictsPage