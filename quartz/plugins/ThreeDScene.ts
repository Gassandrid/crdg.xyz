import { QuartzTransformerPlugin } from "./types"

export const ThreeDScene: QuartzTransformerPlugin = () => {
  return {
    name: "ThreeDScene",
    markdownPlugins() {
      return [
        () => (tree: any) => {
          if (!tree.children) return

          for (const node of tree.children) {
            if (node.type === "code" && node.lang === "3D-scene") {
              const config = node.value.trim()

              node.type = "html"
              node.value = `
<div class="threejs-scene"
     data-config='${encodeURIComponent(config)}'
     style="width:100%; height:500px;">
</div>
`
            }
          }
        },
      ]
    },
  }
}