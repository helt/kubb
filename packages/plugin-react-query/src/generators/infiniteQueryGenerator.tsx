import transformers from '@kubb/core/transformers'
import { pluginClientName } from '@kubb/plugin-client'
import { Client } from '@kubb/plugin-client/components'
import { createReactGenerator } from '@kubb/plugin-oas'
import { useOperationManager } from '@kubb/plugin-oas/hooks'
import { pluginTsName } from '@kubb/plugin-ts'
import { pluginZodName } from '@kubb/plugin-zod'
import { File, useApp } from '@kubb/react'
import { InfiniteQuery, InfiniteQueryOptions, Query, QueryKey, QueryOptions } from '../components'
import type { PluginReactQuery } from '../types'

export const infiniteQueryGenerator = createReactGenerator<PluginReactQuery>({
  name: 'react-infinite-query',
  Operation({ options, operation }) {
    const {
      plugin: { output },
    } = useApp<PluginReactQuery>()
    const { getSchemas, getName, getFile } = useOperationManager()
    const isQuery = typeof options.query === 'boolean' ? options.query : !!options.query.methods?.some((method) => operation.method === method)
    const isInfinite = isQuery && !!options.infinite

    const query = {
      name: getName(operation, { type: 'function', prefix: 'use', suffix: 'infinite' }),
      typeName: getName(operation, { type: 'type' }),
      file: getFile(operation, { prefix: 'use', suffix: 'infinite' }),
    }

    const client = {
      name: getName(operation, { type: 'function', pluginKey: [pluginClientName] }),
    }

    const queryOptions = {
      name: transformers.camelCase(`${operation.getOperationId()} InfiniteQueryOptions`),
    }

    const queryKey = {
      name: transformers.camelCase(`${operation.getOperationId()} InfiniteQueryKey`),
      typeName: transformers.pascalCase(`${operation.getOperationId()} InfiniteQueryKey`),
    }

    const type = {
      file: getFile(operation, { pluginKey: [pluginTsName] }),
      //todo remove type?
      schemas: getSchemas(operation, { pluginKey: [pluginTsName], type: 'type' }),
    }

    const zod = {
      file: getFile(operation, { pluginKey: [pluginZodName] }),
      schemas: getSchemas(operation, { pluginKey: [pluginZodName], type: 'function' }),
    }

    if (!isQuery || !isInfinite || typeof options.query === 'boolean' || typeof options.infinite === 'boolean') {
      return null
    }

    return (
      <File baseName={query.file.baseName} path={query.file.path} meta={query.file.meta}>
        {options.parser === 'zod' && <File.Import extName={output?.extName} name={[zod.schemas.response.name]} root={query.file.path} path={zod.file.path} />}
        <File.Import name={['useInfiniteQuery', 'infiniteQueryOptions']} path={options.query.importPath} />
        <File.Import name={['QueryKey', 'WithRequired']} path={options.query.importPath} isTypeOnly />
        <File.Import name={['InfiniteQueryObserverOptions', 'UseInfiniteQueryResult']} path={options.query.importPath} isTypeOnly />
        <File.Import name={'client'} path={options.client.importPath} />
        <File.Import name={['RequestConfig']} path={options.client.importPath} isTypeOnly />
        {options.client.dataReturnType === 'full' && <File.Import name={['ResponseConfig']} path={options.client.importPath} isTypeOnly />}
        <File.Import
          extName={output?.extName}
          name={[
            type.schemas.request?.name,
            type.schemas.response.name,
            type.schemas.pathParams?.name,
            type.schemas.queryParams?.name,
            type.schemas.headerParams?.name,
            ...(type.schemas.statusCodes?.map((item) => item.name) || []),
          ].filter(Boolean)}
          root={query.file.path}
          path={type.file.path}
          isTypeOnly
        />

        <QueryKey
          name={queryKey.name}
          typeName={queryKey.typeName}
          operation={operation}
          pathParamsType={options.pathParamsType}
          typeSchemas={type.schemas}
          keysFn={options.query.key}
        />
        <Client
          name={client.name}
          isExportable={false}
          isIndexable={false}
          baseURL={options.baseURL}
          operation={operation}
          typeSchemas={type.schemas}
          zodSchemas={zod.schemas}
          dataReturnType={options.client.dataReturnType}
          pathParamsType={options.pathParamsType}
          parser={options.parser}
        />
        <InfiniteQueryOptions
          name={queryOptions.name}
          clientName={client.name}
          queryKeyName={queryKey.name}
          typeSchemas={type.schemas}
          pathParamsType={options.pathParamsType}
          dataReturnType={options.client.dataReturnType}
          cursorParam={options.infinite.cursorParam}
          initialPageParam={options.infinite.initialPageParam}
          queryParam={options.infinite.queryParam}
        />
        <InfiniteQuery
          name={query.name}
          queryOptionsName={queryOptions.name}
          typeSchemas={type.schemas}
          pathParamsType={options.pathParamsType}
          operation={operation}
          dataReturnType={options.client.dataReturnType}
          queryKeyName={queryKey.name}
          queryKeyTypeName={queryKey.typeName}
        />
      </File>
    )
  },
})