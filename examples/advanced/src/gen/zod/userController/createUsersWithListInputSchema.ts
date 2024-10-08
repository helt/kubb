import { userSchema } from '../userSchema.ts'
import { z } from 'zod'

/**
 * @description Successful operation
 */
export const createUsersWithListInput200Schema = z.lazy(() => userSchema)

/**
 * @description successful operation
 */
export const createUsersWithListInputErrorSchema = z.any()

export const createUsersWithListInputMutationRequestSchema = z.array(z.lazy(() => userSchema))

/**
 * @description Successful operation
 */
export const createUsersWithListInputMutationResponseSchema = z.lazy(() => userSchema)
