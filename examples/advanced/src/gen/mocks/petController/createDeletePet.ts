import type { DeletePetPathParams, DeletePetHeaderParams, DeletePet400, DeletePetMutationResponse } from '../../models/ts/petController/DeletePet'
import { faker } from '@faker-js/faker'

export function createDeletePetPathParams(): NonNullable<DeletePetPathParams> {
  return { petId: faker.number.int() }
}

export function createDeletePetHeaderParams(): NonNullable<DeletePetHeaderParams> {
  return { api_key: faker.string.alpha() }
}

/**
 * @description Invalid pet value
 */
export function createDeletePet400(): NonNullable<DeletePet400> {
  return undefined
}

export function createDeletePetMutationResponse(): NonNullable<DeletePetMutationResponse> {
  return undefined
}
