import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import WikiEditor from "./quartz/components/WikiEditor"
import { PageTypeDispatcher } from "./quartz/plugins/pageTypes"

const config = await loadQuartzConfig()
const loadedLayout = await loadQuartzLayout()
const contentLayout = loadedLayout.byPageType.content ?? {}
loadedLayout.byPageType.content = {
  ...contentLayout,
  beforeBody: [...(contentLayout.beforeBody ?? loadedLayout.defaults.beforeBody ?? []), WikiEditor()],
}

config.plugins.emitters = config.plugins.emitters.filter(
  (plugin) => plugin.name !== "PageTypeDispatcher",
)
config.plugins.emitters.push(
  PageTypeDispatcher({
    defaults: loadedLayout.defaults,
    byPageType: loadedLayout.byPageType,
  }),
)

export default config
export const layout = loadedLayout
