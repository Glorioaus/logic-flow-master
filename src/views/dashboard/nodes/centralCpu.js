// 核心处理器
export default function registerEnd(lf) {
  lf.register('central-cpu', ({ CircleNode, CircleNodeModel, h }) => {
    class EndNode extends CircleNode {
      getIconShape() {
        const { model } = this.props
        const {
          x,
          y,
          width,
          height
        } = model
        const stroke = '#1296db'
        return h(
          'svg',
          {
            x: x - width / 2,
            y: y - height / 2,
            width: 40,
            height: 40,
            viewBox: '0 0 1024 1024'
          },
          h(
            'path',
            {
              fill: stroke,
              d: 'M277.3 789.3v-256h-88c-9.5 36.8-42.9 64-82.6 64-47.1 0-85.3-38.2-85.3-85.3s38.2-85.3 85.3-85.3c39.8 0 73.2 27.2 82.6 64h88v-256h-88c-9.5 36.8-42.9 64-82.6 64-47.1 0-85.3-38.2-85.3-85.3S59.5 128 106.7 128c39.8 0 73.2 27.2 82.6 64h88v-85.3c0-35.3 28.7-64 64-64h341.3c35.3 0 64 28.7 64 64V192h88c9.5-36.8 42.9-64 82.6-64 47.1 0 85.3 38.2 85.3 85.3s-38.2 85.3-85.3 85.3c-39.8 0-73.2-27.2-82.6-64h-88v256h88c9.5-36.8 42.9-64 82.6-64 47.1 0 85.3 38.2 85.3 85.3s-38.2 85.3-85.3 85.3c-39.8 0-73.2-27.2-82.6-64h-88v256h88c9.5-36.8 42.9-64 82.6-64 47.1 0 85.3 38.2 85.3 85.3s-38 85.5-85.2 85.5c-39.8 0-73.2-27.2-82.6-64h-88v85.3c0 35.3-28.7 64-64 64H341.3c-35.3 0-64-28.7-64-64V832h-88c-9.5 36.8-42.9 64-82.6 64-47.1 0-85.3-38.2-85.3-85.3s38.2-85.3 85.3-85.3c39.8 0 73.2 27.2 82.6 64h88zM704 345V106.7c0-11.8-9.6-21.3-21.3-21.3H341.3c-11.8 0-21.3 9.6-21.3 21.3V345c6.7-2.4 13.9-3.6 21.3-3.6h341.3c7.5-0.1 14.7 1.2 21.4 3.6z m0 334c-6.7 2.4-13.9 3.6-21.3 3.6H341.3c-7.5 0-14.7-1.3-21.3-3.6v238.3c0 11.8 9.6 21.3 21.3 21.3h341.3c11.8 0 21.3-9.6 21.3-21.3V679zM341.3 384c-11.8 0-21.3 9.6-21.3 21.3v213.3c0 11.8 9.6 21.3 21.3 21.3h341.3c11.8 0 21.3-9.6 21.3-21.3V405.3c0-11.8-9.6-21.3-21.3-21.3H341.3zM448 234.7c-11.8 0-21.3-9.6-21.3-21.3S436.2 192 448 192h128c11.8 0 21.3 9.6 21.3 21.3s-9.6 21.3-21.3 21.3H448z m0 597.3c-11.8 0-21.3-9.6-21.3-21.3 0-11.8 9.6-21.3 21.3-21.3h128c11.8 0 21.3 9.6 21.3 21.3 0 11.8-9.6 21.3-21.3 21.3H448z m0-298.7c-11.8 0-21.3-9.6-21.3-21.3 0-11.8 9.6-21.3 21.3-21.3h128c11.8 0 21.3 9.6 21.3 21.3 0 11.8-9.6 21.3-21.3 21.3H448z m469.3 21.4c23.6 0 42.7-19.1 42.7-42.7s-19.1-42.7-42.7-42.7-42.7 19.1-42.7 42.7 19.2 42.7 42.7 42.7z m0-298.7c23.6 0 42.7-19.1 42.7-42.7s-19.1-42.7-42.7-42.7-42.7 19.1-42.7 42.7 19.2 42.7 42.7 42.7zM106.7 554.7c23.6 0 42.7-19.1 42.7-42.7s-19.1-42.7-42.7-42.7S64 488.4 64 512s19.1 42.7 42.7 42.7z m0-298.7c23.6 0 42.7-19.1 42.7-42.7s-19.1-42.7-42.7-42.7S64 189.8 64 213.3 83.1 256 106.7 256z m810.6 597.3c23.6 0 42.7-19.1 42.7-42.7S940.9 768 917.3 768s-42.7 19.1-42.7 42.7 19.2 42.6 42.7 42.6z m-810.6 0c23.6 0 42.7-19.1 42.7-42.7S130.2 768 106.7 768 64 787.1 64 810.7s19.1 42.6 42.7 42.6z'
            }
          )
        )
      }
      getShape() {
        const { model } = this.props
        const {
          x,
          y,
          r,
          fill,
          stroke,
          strokeWidth
        } = model
        return h(
          'g',
          {
          },
          [
            (
              'circle',
              {
                cx: x,
                cy: y,
                r,
                fill,
                stroke,
                strokeWidth,
                fillOpacity: 0
              }
            ),
            this.getIconShape()
          ]
        )
      }
    }
    class EndModel extends CircleNodeModel {
      initNodeData(data) {
        data.text = {
          value: (data.text && data.text.value) || '通用处理器',
          x: data.x,
          y: data.y + 35
        }
        super.initNodeData(data)
        this.r = 20
      }
      // 自定义锚点样式
      getAnchorStyle() {
        const style = super.getAnchorStyle()
        style.hover.r = 8
        style.hover.fill = 'rgb(24, 125, 255)'
        style.hover.stroke = 'rgb(24, 125, 255)'
        return style
      }
      // 自定义节点outline
      getOutlineStyle() {
        const style = super.getOutlineStyle()
        style.stroke = '#88f'
        return style
      }
      // getConnectedSourceRules() {
      //   const rules = super.getConnectedSourceRules()
      //   const notAsTarget = {
      //     message: '终止节点不能作为连线的起点',
      //     validate: () => false
      //   }
      //   rules.push(notAsTarget)
      //   return rules
      // }
    }
    return {
      view: EndNode,
      model: EndModel
    }
  })
}
