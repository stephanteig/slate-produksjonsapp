import React, { useState } from 'react'
import type { Task } from '../../../shared/types/project'

interface TaskItemProps {
  task: Task
  depth?: number
  onToggle: (taskId: string, subtaskId?: string) => void
  onDelete: (taskId: string, subtaskId?: string) => void
  onAddSubtask: (parentId: string, title: string) => void
}

export function TaskItem({ task, depth = 0, onToggle, onDelete, onAddSubtask }: TaskItemProps) {
  const [addingSub, setAddingSub] = useState(false)
  const [subTitle, setSubTitle] = useState('')

  function handleAddSub() {
    if (!subTitle.trim()) return
    onAddSubtask(task.id, subTitle.trim())
    setSubTitle('')
    setAddingSub(false)
  }

  return (
    <li>
      <div
        className={[
          'group flex items-center gap-2 rounded px-2 py-1.5 transition-colors hover:bg-[var(--color-border)]',
          depth > 0 ? 'ml-5' : '',
        ].join(' ')}
      >
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(depth === 0 ? task.id : '', depth > 0 ? task.id : undefined)}
          className="h-4 w-4 cursor-pointer rounded border accent-[var(--color-accent)]"
          style={{ accentColor: 'var(--color-accent)' }}
        />
        <span
          className={[
            'flex-1 text-sm',
            task.completed ? 'line-through' : '',
          ].join(' ')}
          style={{
            color: task.completed ? 'var(--color-text-muted)' : 'var(--color-text)',
          }}
        >
          {task.title}
        </span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
          {depth === 0 && (
            <button
              onClick={() => setAddingSub((v) => !v)}
              className="rounded p-0.5 text-xs hover:bg-[var(--color-border)]"
              style={{ color: 'var(--color-text-muted)' }}
              title="Legg til deloppgave"
            >
              +
            </button>
          )}
          <button
            onClick={() => onDelete(depth === 0 ? task.id : '', depth > 0 ? task.id : undefined)}
            className="rounded p-0.5 text-xs hover:bg-[var(--color-border)]"
            style={{ color: 'var(--color-text-muted)' }}
            title="Slett"
          >
            ×
          </button>
        </div>
      </div>

      {(task.subtasks ?? []).map((sub) => (
        <TaskItem
          key={sub.id}
          task={sub}
          depth={1}
          onToggle={(_, subId) => onToggle(task.id, subId || sub.id)}
          onDelete={(_, subId) => onDelete(task.id, subId || sub.id)}
          onAddSubtask={onAddSubtask}
        />
      ))}

      {addingSub && (
        <div className="ml-7 mt-1 flex items-center gap-2 px-2">
          <input
            autoFocus
            value={subTitle}
            onChange={(e) => setSubTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddSub()
              if (e.key === 'Escape') { setAddingSub(false); setSubTitle('') }
            }}
            placeholder="Ny deloppgave…"
            className="input-base flex-1 text-sm"
          />
          <button onClick={handleAddSub} className="btn-primary text-xs py-1 px-2">
            Legg til
          </button>
        </div>
      )}
    </li>
  )
}
