export const MODULE_IDS = [
  '~pages',
  '~react-pages',
  '~solid-pages',
  'pages-generated',
  'virtual:generated-pages',
  'virtual:generated-pages-react',
]

export const MODULE_ID_VIRTUAL = 'virtual:unplugin-convention-routes/generated-pages'
export const ROUTE_BLOCK_ID_VIRTUAL = 'virtual:unplugin-convention-routes/route-block'
export const ROUTE_IMPORT_NAME = '__pages_import_$1__'

export const routeBlockQueryRE = /\?vue&type=route/

export const dynamicRouteRE = /^\[(.+)\]$/
export const cacheAllRouteRE = /^\[\.{3}(.*)\]$/
export const replaceDynamicRouteRE = /^\[(?:\.{3})?(.*)\]$/

export const nuxtDynamicRouteRE = /^_(.*)$/
export const nuxtCacheAllRouteRE = /^_$/

export const countSlashRE = /\//g

export const replaceIndexRE = /\/?index$/
