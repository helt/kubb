import type { UserArray } from '../models/UserArray'
import { createUser } from './createUser.ts'
import { faker } from '@faker-js/faker'

export function createUserArray(data: NonNullable<Partial<UserArray>> = []): NonNullable<UserArray> {
  faker.seed([220])
  return [...(faker.helpers.arrayElements([createUser()]) as any), ...data]
}
