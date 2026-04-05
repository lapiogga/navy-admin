import { authHandlers } from './auth'
import { demoHandlers } from './demo'
import { commonHandlers } from './common'
import { announcementHandlers } from './announcements'

export const handlers = [...authHandlers, ...demoHandlers, ...commonHandlers, ...announcementHandlers]
