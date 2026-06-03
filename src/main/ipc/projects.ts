import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/constants'
import { listProjects, saveProject, saveProjectTasks } from '../services/vaultService'
import type { Project, Task } from '../../shared/types/project'

export function registerProjectHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.PROJECTS_LIST, () => {
    try {
      return { success: true, data: listProjects() }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  ipcMain.handle(IPC_CHANNELS.PROJECTS_SAVE, (_, project: Project) => {
    try {
      saveProject(project)
      return { success: true }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  ipcMain.handle(IPC_CHANNELS.PROJECTS_TASKS_SAVE, (_, projectId: string, tasks: Task[]) => {
    try {
      saveProjectTasks(projectId, tasks)
      return { success: true }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })
}
