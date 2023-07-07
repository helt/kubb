import { defineConfig } from 'vitepress'

import { version } from '../../packages/core/package.json'

const ogImage = 'https://kubb.dev/og.png'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: 'en-UK',
  title: 'Kubb',
  description: 'OpenAPI generated clients',
  head: [
    ['meta', { property: 'og:title', content: 'Kubb: OpenAPI generated clients' }],
    ['meta', { property: 'og:image', content: ogImage }],
    ['meta', { name: 'twitter:image', content: ogImage }],
    ['meta', { name: 'theme-color', content: '#DBCAFF' }],
    ['meta', { property: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { property: 'twitter:site:domain', content: 'kubb.dev' }],
    ['meta', { property: 'twitter:site:url', content: 'https://kubb.dev' }],
    ['link', { rel: 'icon', href: '/logo.png', type: 'image/png' }],
    ['link', { rel: 'mask-icon', href: '/logo.png', color: '#ffffff' }],
  ],
  srcDir: './src',
  cleanUrls: true,
  ignoreDeadLinks: true,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: {
      src: '/logo.png',
    },
    search: {
      provider: 'local',
    },
    nav: [
      { text: 'Introduction', link: '/introduction' },
      { text: 'Guides', link: '/guides/basic-usage' },
      { text: 'Plugins', link: '/plugins/introduction' },
      { text: 'Examples', link: '/examples/typescript' },
      { text: 'Playground', link: '/playground' },
      {
        text: `v${version}`,
        items: [
          {
            text: 'Releases',
            link: 'https://github.com/kubb-project/kubb/releases',
          },
          {
            text: 'Contributing',
            link: '/contributing',
          },
          {
            text: 'About Kubb',
            link: '/about',
          },
        ],
      },
    ],
    editLink: {
      pattern: 'https://github.com/kubb-project/kubb/edit/main/docs/src/:path',
    },
    sidebar: [
      {
        text: 'Getting Started',
        items: [
          {
            text: 'Introduction',
            link: '/introduction',
          },
          {
            text: 'Quick start',
            link: '/quick-start',
          },
        ],
      },
      {
        text: 'Configuration',
        items: [
          {
            text: 'kubb.config.js',
            link: '/configuration/configure',
          },
          {
            text: 'Options',
            link: '/configuration/options',
          },
        ],
      },
      {
        text: 'Usage Guides',
        collapsed: false,
        items: [
          {
            text: 'Basic Usage',
            link: '/guides/basic-usage',
          },
        ],
      },
      {
        text: 'Plugins',
        collapsed: false,
        items: [
          {
            text: 'Introduction',
            link: '/plugins/introduction',
          },
          {
            text: 'Template',
            link: '/plugins/template',
          },
          {
            text: '@kubb/core',
            link: '/plugins/core/',
            items: [
              {
                text: 'globals.d.ts',
                link: '/plugins/core/globals',
              },
            ],
          },
          {
            text: '@kubb/cli',
            link: '/plugins/cli',
          },
          {
            text: '@kubb/ts-codegen',
            link: '/plugins/ts-codegen',
          },
          {
            text: 'swagger',
            collapsed: true,
            items: [
              { text: '@kubb/swagger', link: '/plugins/swagger' },
              {
                text: '@kubb/swagger-client',
                link: '/plugins/swagger-client/',
                items: [
                  {
                    text: 'globals.d.ts',
                    link: '/plugins/swagger-client/globals',
                  },
                  {
                    text: 'client',
                    link: '/plugins/swagger-client/client',
                  },
                ],
              },
              {
                text: '@kubb/swagger-ts',
                link: '/plugins/swagger-ts',
              },
              {
                text: '@kubb/swagger-zod',
                link: '/plugins/swagger-zod',
              },
              {
                text: '@kubb/swagger-zodios',
                link: '/plugins/swagger-zodios',
              },
              {
                text: '@kubb/swagger-tanstack-query',
                link: '/plugins/swagger-tanstack-query',
              },
              {
                text: '@kubb/swagger-swr',
                link: '/plugins/swagger-swr',
              },
              {
                text: '@kubb/swagger-faker',
                link: '/plugins/swagger-faker',
              },
              {
                text: '@kubb/swagger-form',
                link: '/plugins/swagger-form',
              },
            ],
          },
        ],
      },
      {
        text: 'API',
        collapsed: false,
        items: [
          {
            text: 'FileManager',
            link: '/reference/fileManager',
          },
          {
            text: 'PluginManager',
            link: '/reference/pluginManager',
          },
        ],
      },
      {
        text: 'Examples(PetStore)',
        collapsed: false,
        items: [
          {
            text: 'TypeScript',
            link: '/examples/typescript',
          },
          {
            text: 'Tanstack-Query',
            items: [
              {
                text: 'React-Query',
                link: '/examples/tanstack-query/react-query',
              },
              {
                text: 'Vue-Query',
                link: '/examples/tanstack-query/vue-query',
              },
              {
                text: 'Svelte-Query',
                link: '/examples/tanstack-query/svelte-query',
              },
              {
                text: 'Solid-Query',
                link: '/examples/tanstack-query/solid-query',
              },
            ],
          },
          {
            text: 'SWR-Query',
            link: '/examples/swr',
          },
          {
            text: 'Zod',
            link: '/examples/zod',
          },
          {
            text: 'Faker',
            link: '/examples/faker',
          },
          {
            text: 'Form',
            items: [
              {
                text: 'Data-driven-forms',
                link: '/examples/data-driven-forms',
              },
              {
                text: 'React-hook-form',
                link: '/examples/react-hook-form',
              },
            ],
          },
          {
            text: 'Simple',
            link: '/examples/simple',
          },
          {
            text: 'Advanced',
            link: '/examples/advanced',
          },
        ],
      },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/kubb-project/kubb' },
      { icon: 'discord', link: 'https://discord.gg/shfBFeczrm' },
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2022-present Stijn Van Hulle',
    },
    // algolia: {
    //   appId: "",
    //   apiKey: "",
    //   indexName: "",
    // },
  },
})
