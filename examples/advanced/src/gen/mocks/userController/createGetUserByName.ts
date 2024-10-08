import type {
  GetUserByNamePathParams,
  GetUserByName200,
  GetUserByName400,
  GetUserByName404,
  GetUserByNameQueryResponse,
} from '../../models/ts/userController/GetUserByName'
import { createUser } from '../createUser.ts'
import { faker } from '@faker-js/faker'

export function createGetUserByNamePathParams(): NonNullable<GetUserByNamePathParams> {
  return { username: faker.string.alpha() }
}

/**
 * @description successful operation
 */
export function createGetUserByName200(): NonNullable<GetUserByName200> {
  return createUser()
}

/**
 * @description Invalid username supplied
 */
export function createGetUserByName400(): NonNullable<GetUserByName400> {
  return undefined
}

/**
 * @description User not found
 */
export function createGetUserByName404(): NonNullable<GetUserByName404> {
  return undefined
}

/**
 * @description successful operation
 */
export function createGetUserByNameQueryResponse(): NonNullable<GetUserByNameQueryResponse> {
  return createUser()
}
