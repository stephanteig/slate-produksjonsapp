import React, { useState } from 'react'
import type { Task } from '../../../shared/types/project'
import { TaskItem } from './TaskItem'
import { generateId } from '../../utils/markdownUtils'

interface TaskListProps {
  tasks: Task[]
  onChange: (tasks: Task[]) => void
}

export function TaskList({ tasks, onChange }: TaskListProps) {
  const [newTitle, setNewTitle] = useState('')

  function handleToggle(taskId: string, subtaskId?: string) {
    const updated = tasks.map((t) => {
      if (subtaskId && t.id === taskId) {
        return {
          ...t,
          subtasks: (t.subtasks ?? []).map((s) =>
            s.id === subtaskId ? { ...s, completed: !s.completed } : s
          ),
        }
      }
      if (!subtaskId && t.id === taskId) {
        return { ...t, completed: !t.completed }
      }
      return t
    })
    onChange(updated)
  }

  function handleDelete(taskId: string, subtaskId?: string) {
    if (subtaskId) {
      const updated = tasks.map((t) =>
        t.id === taskId
          ? { ...t, subtasks: (t.subtasks ?? []).filter((s) => s.id !== subtaskId) }
          : t
      )
      onChange(updated)
    } else {
      onChange(tasks.filter((t) => t.id !== taskId))
    }
  }

  function handleAddSubtask(parentId: string, title: string) {
    const updated = tasks.map((t) =>
      t.id === parentId
        ? {
            ...t,
            subtasks: [
              ...(t.subtasks ?? []),
              { id: generateId(), title, completed: false, createdAt: new Date().toISOString() },
            ],
          }
        : t
    )
    onChange(updated)
  }

  function handleAdd() {
    if (!newTitle.trim()) return
    const task: Task = {
      id: generateId(),
      title: newTitle.trim(),
      completed: false,
      subtasks: [],
      createdAt: new Date().toISOString(),
    }
    onChange([...tasks, task])
    setNewTitle('')
  }

  return (
    <div>
      <ul className="space-y-0.5">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onAddSubtask={handleAddSubtask}
          />
        ))}
      </ul>

      <div className="mt-3 flex items-center gap-2">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Ny oppgave…"
          className="input-base flex-1 text-sm"
        />
        <button onClick={handleAdd} disabled={!newTitle.trim()} className="btn-primary text-xs">
          Legg til
        </button>
      </div>
    </div>
  )
}
