declare module '*.vue' {
  import { ComponentOptions } from 'vue'
  const componentOptions: ComponentOptions
  export default componentOptions
}

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    showGlobalControls?: boolean
    showRouteLoading?: boolean
    title?: string
  }
}

export {}
