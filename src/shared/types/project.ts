export interface Task {
  id: string
  title: string
  completed: boolean
  subtasks?: Task[]
  createdAt: string
}

export interface Project {
  id: string
  title: string
  status: 'planning' | 'in-progress' | 'delivered' | 'archived'
  dropboxUrl?: string
  createdAt: string
  updatedAt: string
  tasks: Task[]
  tags?: string[]
}
