import { apiResponseSchema } from '../apiResponseSchema.ts'
import { z } from 'zod'

export const uploadFilePathParamsSchema = z.object({ petId: z.number().int().describe('ID of pet to update') })

export const uploadFileQueryParamsSchema = z.object({ additionalMetadata: z.string().describe('Additional Metadata').optional() }).optional()

/**
 * @description successful operation
 */
export const uploadFile200Schema = z.lazy(() => apiResponseSchema)

export const uploadFileMutationRequestSchema = z.string()

/**
 * @description successful operation
 */
export const uploadFileMutationResponseSchema = z.lazy(() => apiResponseSchema)
