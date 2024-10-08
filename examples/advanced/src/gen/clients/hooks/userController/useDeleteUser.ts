import client from '../../../../tanstack-query-client.ts'
import type { DeleteUserMutationResponse, DeleteUserPathParams, DeleteUser400, DeleteUser404 } from '../../../models/ts/userController/DeleteUser.ts'
import type { UseMutationOptions } from '@tanstack/react-query'
import { useMutation } from '@tanstack/react-query'

type DeleteUserClient = typeof client<DeleteUserMutationResponse, DeleteUser400 | DeleteUser404, never>

type DeleteUser = {
  data: DeleteUserMutationResponse
  error: DeleteUser400 | DeleteUser404
  request: never
  pathParams: DeleteUserPathParams
  queryParams: never
  headerParams: never
  response: Awaited<ReturnType<DeleteUserClient>>
  client: {
    parameters: Partial<Parameters<DeleteUserClient>[0]>
    return: Awaited<ReturnType<DeleteUserClient>>
  }
}

/**
 * @description This can only be done by the logged in user.
 * @summary Delete user
 * @link /user/:username
 */
export function useDeleteUser(
  username: DeleteUserPathParams['username'],
  options: {
    mutation?: UseMutationOptions<DeleteUser['response'], DeleteUser['error'], DeleteUser['request']>
    client?: DeleteUser['client']['parameters']
  } = {},
) {
  const { mutation: mutationOptions, client: clientOptions = {} } = options ?? {}
  return useMutation({
    mutationFn: async () => {
      const res = await client<DeleteUser['data'], DeleteUser['error'], DeleteUser['request']>({
        method: 'delete',
        url: `/user/${username}`,
        ...clientOptions,
      })
      return res
    },
    ...mutationOptions,
  })
}
