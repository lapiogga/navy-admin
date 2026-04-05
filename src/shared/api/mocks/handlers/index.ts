import { authHandlers } from './auth'
import { demoHandlers } from './demo'
import { commonHandlers } from './common'
import { announcementHandlers } from './announcements'
import { sys04Handlers } from './sys04'
import { sys05Handlers } from './sys05'
import { sys11Handlers } from './sys11'
import { sys14Handlers } from './sys14'

export const handlers = [...authHandlers, ...demoHandlers, ...commonHandlers, ...announcementHandlers, ...sys04Handlers, ...sys05Handlers, ...sys11Handlers, ...sys14Handlers]
