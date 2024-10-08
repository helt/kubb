import transformers from '@kubb/core/transformers'
import { FunctionParams, URLPath } from '@kubb/core/utils'
import { useOperation, useOperationManager } from '@kubb/plugin-oas/hooks'
import { getASTParams, getComments } from '@kubb/plugin-oas/utils'
import { pluginTsName } from '@kubb/plugin-ts'
import { pluginZodName } from '@kubb/plugin-zod'
import { File, Function, useApp } from '@kubb/react'

import { getImportNames } from '../utils.ts'
import { QueryImports } from './QueryImports.tsx'
import { QueryKey } from './QueryKey.tsx'
import { QueryOptions } from './QueryOptions.tsx'
import { SchemaType } from './SchemaType.tsx'

import { isRequired } from '@kubb/oas'
import type { ReactNode } from 'react'
import type { QueryOptions as QueryOptionsPluginOptions, Query as QueryPluginOptions } from '../types.ts'
import type { FileMeta, Infinite, PluginTanstackQuery, Suspense } from '../types.ts'

type TemplateProps = {
  /**
   * Name of the function
   */
  name: string
  /**
   * Parameters/options/props that need to be used
   */
  params: string
  /**
   * Generics that needs to be added for TypeScript
   */
  generics?: string
  /**
   * ReturnType(see async for adding Promise type)
   */
  returnType?: string
  optionsType: string
  /**
   * Options for JSdocs
   */
  JSDoc?: {
    comments: string[]
  }
  hook: {
    name: string
    generics?: string
    queryKey: string
    queryOptions: string
  }
  infinite: Infinite | false
}

function Template({ name, generics, returnType, params, JSDoc, hook, infinite, optionsType }: TemplateProps): ReactNode {
  const resolvedReturnType = `${returnType} & { queryKey: TQueryKey }`

  return (
    <File.Source name={name} isExportable isIndexable>
      <Function name={name} export generics={generics} returnType={resolvedReturnType} params={params} JSDoc={JSDoc}>
        {`
         const { query: queryOptions, client: clientOptions = {} } = options ?? {}
         const queryKey = queryOptions?.queryKey ?? ${hook.queryKey}

         const query = ${hook.name}({
          ...${hook.queryOptions} as unknown as ${optionsType},
          queryKey,
          ...queryOptions as unknown as Omit<${optionsType}, "queryKey">
        }) as ${resolvedReturnType}

        query.queryKey = queryKey as TQueryKey

        return query

         `}
      </Function>
    </File.Source>
  )
}

type FrameworkProps = TemplateProps & {
  context: {
    factory: {
      name: string
    }
    queryKey: string
  }
}

const defaultTemplates = {
  get react() {
    return function (props: FrameworkProps): ReactNode {
      return <Template {...props} />
    }
  },
  get solid() {
    return function ({ name, generics, returnType, params, JSDoc, hook, optionsType }: FrameworkProps): ReactNode {
      const resolvedReturnType = `${returnType} & { queryKey: TQueryKey }`

      return (
        <File.Source name={name} isExportable isIndexable>
          <Function name={name} export generics={generics} returnType={resolvedReturnType} params={params} JSDoc={JSDoc}>
            {`
         const { query: queryOptions, client: clientOptions = {} } = options ?? {}
         const queryKey = queryOptions?.queryKey ?? ${hook.queryKey}

         const query = ${hook.name}(() => ({
          ...${hook.queryOptions} as unknown as ${optionsType},
          queryKey,
          initialData: undefined,
          ...queryOptions as unknown as Omit<${optionsType}, "queryKey">
        })) as ${resolvedReturnType}

        query.queryKey = queryKey as TQueryKey

        return query

         `}
          </Function>
        </File.Source>
      )
    }
  },
  get svelte() {
    return function (props: FrameworkProps): ReactNode {
      return <Template {...props} />
    }
  },
  get vue() {
    return function ({ context, hook, ...rest }: FrameworkProps): ReactNode {
      const { factory, queryKey } = context

      const {
        pluginManager,
        plugin: {
          key: pluginKey,
          options: { pathParamsType },
        },
      } = useApp<PluginTanstackQuery>()
      const operation = useOperation()
      const { getSchemas } = useOperationManager()

      const importNames = getImportNames()

      const queryOptions = pluginManager.resolveName({
        name: `${factory.name}QueryOptions`,
        pluginKey,
      })

      const hookName = rest.infinite ? importNames.queryInfinite.vue.hookName : importNames.query.vue.hookName
      const resultType = rest.infinite ? importNames.queryInfinite.vue.resultType : importNames.query.vue.resultType
      const optionsType = rest.infinite ? importNames.queryInfinite.vue.optionsType : importNames.query.vue.optionsType

      const schemas = getSchemas(operation, { pluginKey: [pluginTsName], type: 'type' })
      const params = new FunctionParams()
      const queryParams = new FunctionParams()
      const queryKeyParams = new FunctionParams()
      const client = {
        withQueryParams: !!schemas.queryParams?.name,
        withData: !!schemas.request?.name,
        withPathParams: !!schemas.pathParams?.name,
        withHeaders: !!schemas.headerParams?.name,
      }

      const resultGenerics = ['TData', `${factory.name}['error']`]

      // only needed for the options to override the useQuery options/params
      const queryOptionsOverrideGenerics = [`${factory.name}['response']`, `${factory.name}['error']`, 'TData', 'TQueryKey']
      const queryOptionsGenerics = ['TData', 'TQueryData']

      params.add([
        ...(pathParamsType === 'object'
          ? [
              getASTParams(schemas.pathParams, {
                typed: true,
                override: (item) => ({
                  ...item,
                  name: item.name ? `ref${transformers.pascalCase(item.name)}` : undefined,
                }),
              }),
            ]
          : getASTParams(schemas.pathParams, {
              typed: true,
              override: (item) => ({
                ...item,
                name: item.name ? `ref${transformers.pascalCase(item.name)}` : undefined,
              }),
            })),
        {
          name: 'refParams',
          type: `MaybeRef<${schemas.queryParams?.name}>`,
          enabled: client.withQueryParams,
          required: isRequired(schemas.queryParams?.schema),
        },
        {
          name: 'refHeaders',
          type: `MaybeRef<${schemas.headerParams?.name}>`,
          enabled: client.withHeaders,
          required: isRequired(schemas.headerParams?.schema),
        },
        {
          name: 'refData',
          type: `MaybeRef<${schemas.request?.name}>`,
          enabled: client.withData,
          required: isRequired(schemas.request?.schema),
        },
        {
          name: 'options',
          type: `{
              query?: Partial<${optionsType}<${queryOptionsOverrideGenerics.join(', ')}>>,
              client?: ${factory.name}['client']['parameters']
          }`,
          default: '{}',
        },
      ])

      queryParams.add([
        ...getASTParams(schemas.pathParams, {
          typed: false,
          override: (item) => ({
            ...item,
            name: item.name ? `ref${transformers.pascalCase(item.name)}` : undefined,
          }),
        }),
        {
          name: 'refParams',
          enabled: client.withQueryParams,
          required: isRequired(schemas.queryParams?.schema),
        },
        {
          name: 'refHeaders',
          enabled: client.withHeaders,
          required: isRequired(schemas.headerParams?.schema),
        },
        {
          name: 'clientOptions',
          required: false,
        },
      ])

      queryKeyParams.add([
        ...(pathParamsType === 'object'
          ? [
              getASTParams(schemas.pathParams, {
                override: (item) => ({
                  ...item,
                  name: item.name ? `ref${transformers.pascalCase(item.name)}` : undefined,
                }),
              }),
            ]
          : getASTParams(schemas.pathParams, {
              override: (item) => ({
                ...item,
                name: item.name ? `ref${transformers.pascalCase(item.name)}` : undefined,
              }),
            })),
        {
          name: 'refParams',
          enabled: client.withQueryParams,
          required: isRequired(schemas.queryParams?.schema),
        },
        {
          name: 'refData',
          enabled: client.withData,
          required: isRequired(schemas.request?.schema),
        },
      ])

      const queryOptionsFunc = `${queryOptions}(${queryParams.toString()})`
      const resolvedReturnType = `${resultType}<${resultGenerics.join(', ')}> & { queryKey: TQueryKey }`
      const hookQueryKey = `${queryKey}(${queryKeyParams.toString()})`

      return (
        <File.Source name={rest.name} isExportable isIndexable>
          <Function
            name={rest.name}
            export
            generics={rest.generics}
            returnType={`${resultType}<${resultGenerics.join(', ')}>`}
            params={params.toString()}
            JSDoc={rest.JSDoc}
          >
            {`
         const { query: queryOptions, client: clientOptions = {} } = options ?? {}
         const queryKey = queryOptions?.queryKey ?? ${hookQueryKey}

         const query = ${hookName}({
          ...${queryOptionsFunc} as unknown as ${optionsType},
          queryKey,
          ...queryOptions as unknown as Omit<${optionsType}, "queryKey">
        }) as ${resolvedReturnType}

        query.queryKey = queryKey as TQueryKey

        return query

         `}
          </Function>
        </File.Source>
      )
    }
  },
} as const

type Props = {
  factory: {
    name: string
  }
  resultType: string
  hookName: string
  optionsType: string
  infinite: Infinite | false
  query: QueryPluginOptions | false
  queryOptions: QueryOptionsPluginOptions | false
  suspense: Suspense | false
  /**
   * This will make it possible to override the default behaviour.
   */
  Template?: React.ComponentType<FrameworkProps>
  /**
   * This will make it possible to override the default behaviour.
   */
  QueryKeyTemplate?: React.ComponentType<React.ComponentProps<typeof QueryKey.templates.react>>
  /**
   * This will make it possible to override the default behaviour.
   */
  QueryOptionsTemplate?: React.ComponentType<React.ComponentProps<typeof QueryOptions.templates.react>>
}

export function Query({
  factory,
  optionsType,
  hookName,
  resultType,
  Template = defaultTemplates.react,
  QueryKeyTemplate = QueryKey.templates.react,
  QueryOptionsTemplate = QueryOptions.templates.react,
  ...props
}: Props): ReactNode {
  const {
    pluginManager,
    plugin: {
      key: pluginKey,
      options: { dataReturnType, pathParamsType },
    },
  } = useApp<PluginTanstackQuery>()

  const operation = useOperation()
  const { getSchemas, getName } = useOperationManager()

  const schemas = getSchemas(operation, { pluginKey: [pluginTsName], type: 'type' })
  const name = getName(operation, { type: 'function' })

  const queryKey = pluginManager.resolveName({
    name: [factory.name, props.infinite ? 'Infinite' : undefined, props.suspense ? 'Suspense' : undefined, 'QueryKey'].filter(Boolean).join(''),
    pluginKey,
  })
  const queryKeyType = pluginManager.resolveName({
    name: [factory.name, props.infinite ? 'Infinite' : undefined, props.suspense ? 'Suspense' : undefined, 'QueryKey'].filter(Boolean).join(''),
    type: 'type',
    pluginKey,
  })
  const queryOptions = pluginManager.resolveName({
    name: [factory.name, props.infinite ? 'Infinite' : undefined, props.suspense ? 'Suspense' : undefined, 'QueryOptions'].filter(Boolean).join(''),
    pluginKey,
  })

  const generics = new FunctionParams()
  const params = new FunctionParams()
  const queryParams = new FunctionParams()
  const queryKeyParams = new FunctionParams()
  //TODO operationManager.getCleitn
  const client = {
    method: operation.method,
    path: new URLPath(operation.path),
    withQueryParams: !!schemas.queryParams?.name,
    withData: !!schemas.request?.name,
    withPathParams: !!schemas.pathParams?.name,
    withHeaders: !!schemas.headerParams?.name,
  }

  generics.add([
    {
      type: 'TData',
      default: props.infinite ? `InfiniteData<${factory.name}["response"]>` : `${factory.name}["response"]`,
    },
    props.suspense ? undefined : { type: 'TQueryData', default: `${factory.name}["response"]` },
    { type: 'TQueryKey extends QueryKey', default: queryKeyType },
  ])

  const resultGenerics = ['TData', `${factory.name}['error']`]
  // only needed for the options to override the useQuery options/params
  // suspense is having 4 generics instead of 5, TQueryData is not needed because data will always be defined
  const queryOptionsOverrideGenerics = props.suspense
    ? [`${factory.name}['response']`, `${factory.name}['error']`, 'TData', 'TQueryKey']
    : [`${factory.name}['response']`, `${factory.name}['error']`, 'TData', 'TQueryData', 'TQueryKey']

  const queryOptionsGenerics = props.suspense ? ['TData'] : ['TData', 'TQueryData']

  params.add([
    ...(pathParamsType === 'object' ? [getASTParams(schemas.pathParams, { typed: true })] : getASTParams(schemas.pathParams, { typed: true })),
    {
      name: 'params',
      type: `${factory.name}['queryParams']`,
      enabled: client.withQueryParams,
      required: isRequired(schemas.queryParams?.schema),
    },
    {
      name: 'headers',
      type: `${factory.name}['headerParams']`,
      enabled: client.withHeaders,
      required: isRequired(schemas.headerParams?.schema),
    },
    {
      name: 'data',
      type: `${factory.name}['request']`,
      enabled: client.withData,
      required: isRequired(schemas.request?.schema),
    },
    {
      name: 'options',
      type: `{
    query?: Partial<${optionsType}<${queryOptionsOverrideGenerics.join(', ')}>>,
    client?: ${factory.name}['client']['parameters']
}`,
      default: '{}',
    },
  ])

  queryParams.add([
    ...(pathParamsType === 'object' ? [getASTParams(schemas.pathParams)] : getASTParams(schemas.pathParams)),
    {
      name: 'params',
      enabled: client.withQueryParams,
      required: isRequired(schemas.queryParams?.schema),
    },
    {
      name: 'headers',
      enabled: client.withHeaders,
      required: isRequired(schemas.headerParams?.schema),
    },
    {
      name: 'data',
      enabled: client.withData,
      required: isRequired(schemas.request?.schema),
    },
    {
      name: 'clientOptions',
      required: false,
    },
  ])

  queryKeyParams.add([
    ...(pathParamsType === 'object' ? [getASTParams(schemas.pathParams)] : getASTParams(schemas.pathParams)),
    {
      name: 'params',
      enabled: client.withQueryParams,
      required: isRequired(schemas.queryParams?.schema),
    },
    {
      name: 'data',
      enabled: client.withData,
      required: isRequired(schemas.request?.schema),
    },
  ])

  const hook = {
    name: hookName,
    generics: ['any', `${factory.name}['error']`, 'TData', 'any'].join(', '),
    queryOptions: `${queryOptions}(${queryParams.toString()})`,
    queryKey: `${queryKey}(${queryKeyParams.toString()})`,
  }

  return (
    <>
      <QueryKey
        keysFn={props.query ? props.query.queryKey : (keys: unknown[]) => keys}
        Template={QueryKeyTemplate}
        factory={factory}
        name={queryKey}
        typeName={queryKeyType}
      />

      {props.queryOptions && (
        <QueryOptions
          Template={QueryOptionsTemplate}
          factory={factory}
          resultType={optionsType}
          dataReturnType={dataReturnType}
          infinite={props.infinite}
          suspense={props.suspense}
        />
      )}

      {props.query && (
        <Template
          name={[name, props.infinite ? 'Infinite' : undefined, props.suspense ? 'Suspense' : undefined].filter(Boolean).join('')}
          generics={generics.toString()}
          JSDoc={{ comments: getComments(operation) }}
          params={params.toString()}
          returnType={`${resultType}<${resultGenerics.join(', ')}>`}
          hook={hook}
          infinite={props.infinite}
          optionsType={optionsType}
          context={{
            factory,
            queryKey,
          }}
        />
      )}
    </>
  )
}

type FileProps = {
  /**
   * This will make it possible to override the default behaviour.
   */
  templates?: {
    query: typeof defaultTemplates
    queryKey: typeof QueryKey.templates
    queryOptions: typeof QueryOptions.templates
    queryImports: typeof QueryImports.templates
  }
}

Query.File = function ({ templates }: FileProps): ReactNode {
  const {
    pluginManager,
    plugin: {
      options: {
        client: { importPath },
        framework,
        infinite,
        suspense,
        query,
        queryOptions,
        parser,
        extName,
      },
    },
  } = useApp<PluginTanstackQuery>()

  const { getSchemas, getFile, getName } = useOperationManager()
  const operation = useOperation()

  const schemas = getSchemas(operation, { pluginKey: [pluginTsName], type: 'type' })
  const zodSchemas = getSchemas(operation, { pluginKey: [pluginZodName], type: 'function' })
  const file = getFile(operation)
  const fileType = getFile(operation, { pluginKey: [pluginTsName] })
  const fileZodSchemas = getFile(operation, {
    pluginKey: [pluginZodName],
  })

  const factoryName = getName(operation, { type: 'type' })

  const importNames = getImportNames()
  const Template = templates?.query[framework] || defaultTemplates[framework]
  const QueryOptionsTemplate = templates?.queryOptions[framework] || QueryOptions.templates[framework]
  const QueryKeyTemplate = templates?.queryKey[framework] || QueryKey.templates[framework]
  const Import = templates?.queryImports[framework] || QueryImports.templates[framework]

  const factory = {
    name: factoryName,
  }

  return (
    <File<FileMeta> baseName={file.baseName} path={file.path} meta={file.meta}>
      {parser === 'zod' && <File.Import name={[zodSchemas.response?.name]} root={file.path} path={fileZodSchemas.path} />}
      <File.Import name={'client'} path={importPath} />
      <File.Import name={['ResponseConfig']} path={importPath} isTypeOnly />
      <File.Import
        name={[
          schemas.request?.name,
          schemas.response.name,
          schemas.pathParams?.name,
          schemas.queryParams?.name,
          schemas.headerParams?.name,
          ...(schemas.errors?.map((error) => error.name) || []),
        ].filter(Boolean)}
        root={file.path}
        path={fileType.path}
        isTypeOnly
      />

      <QueryImports hookPath={typeof query !== 'boolean' ? query.importPath : undefined} Template={Import} isInfinite={false} isSuspense={false} />
      {!!infinite && (
        <QueryImports hookPath={typeof query !== 'boolean' ? query.importPath : undefined} Template={Import} isInfinite={true} isSuspense={false} />
      )}
      {!!suspense && framework === 'react' && (
        <QueryImports hookPath={typeof query !== 'boolean' ? query.importPath : undefined} Template={Import} isInfinite={false} isSuspense={true} />
      )}
      <SchemaType factory={factory} />
      <Query
        factory={factory}
        Template={Template}
        QueryKeyTemplate={QueryKeyTemplate}
        QueryOptionsTemplate={QueryOptionsTemplate}
        infinite={false}
        suspense={false}
        query={query}
        queryOptions={queryOptions}
        hookName={importNames.query[framework].hookName}
        resultType={importNames.query[framework].resultType}
        optionsType={importNames.query[framework].optionsType}
      />
      {!!infinite && (
        <Query
          factory={factory}
          Template={Template}
          QueryKeyTemplate={QueryKeyTemplate}
          QueryOptionsTemplate={QueryOptionsTemplate}
          infinite={infinite}
          suspense={false}
          query={query}
          queryOptions={queryOptions}
          hookName={importNames.queryInfinite[framework].hookName}
          resultType={importNames.queryInfinite[framework].resultType}
          optionsType={importNames.queryInfinite[framework].optionsType}
        />
      )}
      {!!suspense && framework === 'react' && (
        <Query
          factory={factory}
          Template={Template}
          QueryKeyTemplate={QueryKeyTemplate}
          QueryOptionsTemplate={QueryOptionsTemplate}
          infinite={false}
          suspense={suspense}
          query={query}
          queryOptions={queryOptions}
          hookName={importNames.querySuspense[framework].hookName}
          resultType={importNames.querySuspense[framework].resultType}
          optionsType={importNames.querySuspense[framework].optionsType}
        />
      )}
    </File>
  )
}

Query.templates = defaultTemplates
