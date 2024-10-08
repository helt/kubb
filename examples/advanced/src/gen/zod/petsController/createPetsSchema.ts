import { petNotFoundSchema } from '../petNotFoundSchema.ts'
import { z } from 'zod'

export const createPetsPathParamsSchema = z.object({ uuid: z.string().describe('UUID') })

export const createPetsQueryParamsSchema = z.object({ offset: z.number().int().describe('Offset').optional() }).optional()

export const createPetsHeaderParamsSchema = z.object({ 'X-EXAMPLE': z.enum(['ONE', 'TWO', 'THREE']).describe('Header parameters') })

/**
 * @description Null response
 */
export const createPets201Schema = z.any()

/**
 * @description unexpected error
 */
export const createPetsErrorSchema = z.lazy(() => petNotFoundSchema)

export const createPetsMutationRequestSchema = z.object({ name: z.string(), tag: z.string() })

export const createPetsMutationResponseSchema = z.any()
