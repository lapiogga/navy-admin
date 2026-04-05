import { codeHandlers } from './code'
import { permissionHandlers } from './permission'
import { approvalHandlers } from './approval'
import { systemHandlers } from './system'

export const commonHandlers = [...codeHandlers, ...permissionHandlers, ...approvalHandlers, ...systemHandlers]
