import { useCallback } from 'react'
import { useAppStore } from '../store/appStore'
import type { Project, Task } from '../../shared/types/project'

export function useProjects() {
  const { state, dispatch } = useAppStore()

  const refresh = useCallback(async () => {
    const result = await window.electronAPI.listProjects()
    if (result.success) {
      dispatch({ type: 'SET_PROJECTS', projects: result.data })
    }
  }, [dispatch])

  const saveProject = useCallback(
    async (project: Project): Promise<{ success: boolean; error?: string }> => {
      const result = await window.electronAPI.saveProject(project)
      if (result.success) await refresh()
      return result
    },
    [refresh]
  )

  const saveTasks = useCallback(
    async (projectId: string, tasks: Task[]): Promise<{ success: boolean; error?: string }> => {
      const result = await window.electronAPI.saveProjectTasks(projectId, tasks)
      if (result.success) await refresh()
      return result
    },
    [refresh]
  )

  return { projects: state.projects, refresh, saveProject, saveTasks }
}
