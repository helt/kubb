import client from '@kubb/plugin-client/client'
import type { FindPetsByStatusQueryResponse, FindPetsByStatusQueryParams } from '../../../models/ts/petController/FindPetsByStatus.ts'
import type { ResponseConfig } from '@kubb/plugin-client/client'

/**
 * @description Multiple status values can be provided with comma separated strings
 * @summary Finds Pets by status
 * @link /pet/findByStatus
 */
export async function findPetsByStatus(
  params?: FindPetsByStatusQueryParams,
  options: Partial<Parameters<typeof client>[0]> = {},
): Promise<ResponseConfig<FindPetsByStatusQueryResponse>['data']> {
  const res = await client<FindPetsByStatusQueryResponse>({
    method: 'get',
    url: '/pet/findByStatus',
    baseURL: 'https://petstore3.swagger.io/api/v3',
    params,
    ...options,
  })
  return res.data
}
