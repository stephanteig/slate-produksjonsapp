export type ShotRowType = 'shot' | 'note' | 'quote'

export type ShotSize =
  | 'ekstrem-vidvinkel'
  | 'vidvinkel'
  | 'medium-vidvinkel'
  | 'medium'
  | 'medium-naert'
  | 'naert'
  | 'ekstremt-naert'
  | 'over-shoulder'
  | 'insert'
  | string

export type CameraMovement =
  | 'statisk'
  | 'pan'
  | 'tilt'
  | 'dolly-inn'
  | 'dolly-ut'
  | 'truck'
  | 'haandholdt'
  | 'steadicam'
  | 'crane'
  | 'zoom-inn'
  | 'zoom-ut'
  | 'rack-focus'
  | string

export interface ShotRow {
  id: string
  type: ShotRowType
  text: string
  checked: boolean
  imagePath?: string
  shotSize?: ShotSize
  lens?: string
  movement?: CameraMovement
  extraNotes?: string
}

export interface ShotSection {
  id: string
  name: string
  color: string
  collapsed: boolean
  rows: ShotRow[]
}

export interface Shotlist {
  id: string
  title: string
  projectId?: string
  shootDayId?: string
  moodboardImages: string[]
  createdAt: string
  updatedAt: string
  sections: ShotSection[]
}
