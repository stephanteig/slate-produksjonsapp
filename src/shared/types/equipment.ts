export type EquipmentStatus = 'available' | 'on-loan' | 'in-service' | 'retired'

export interface Owner {
  id: string
  name: string
}

export interface Equipment {
  id: string
  name: string
  category: string
  ownerId: string
  serialNumber?: string
  purchasePrice?: number
  status: EquipmentStatus
  notes?: string
  createdAt: string
}

export interface Loan {
  id: string
  equipmentId: string
  loanedTo: string
  startDate: string
  endDate: string
  returned: boolean
  projectId?: string
  notes?: string
}
