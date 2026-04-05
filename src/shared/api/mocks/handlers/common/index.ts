import { codeHandlers } from './code'
import { permissionHandlers } from './permission'

export const commonHandlers = [...codeHandlers, ...permissionHandlers]
