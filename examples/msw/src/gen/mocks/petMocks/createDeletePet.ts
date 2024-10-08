import type { DeletePetPathParams, DeletePetHeaderParams, DeletePet400, DeletePetMutationResponse } from '../../models/DeletePet'
import { faker } from '@faker-js/faker'

export function createDeletePetPathParams(): NonNullable<DeletePetPathParams> {
  faker.seed([220])
  return { petId: faker.number.int() }
}

export function createDeletePetHeaderParams(): NonNullable<DeletePetHeaderParams> {
  faker.seed([220])
  return { api_key: faker.string.alpha() }
}

/**
 * @description Invalid pet value
 */
export function createDeletePet400(): NonNullable<DeletePet400> {
  faker.seed([220])
  return undefined
}

export function createDeletePetMutationResponse(): NonNullable<DeletePetMutationResponse> {
  faker.seed([220])
  return undefined
}
