import { authHandlers } from './auth'
import { demoHandlers } from './demo'
export const handlers = [...authHandlers, ...demoHandlers]
