import { authHandlers } from './auth'
import { demoHandlers } from './demo'
import { commonHandlers } from './common'

export const handlers = [...authHandlers, ...demoHandlers, ...commonHandlers]
