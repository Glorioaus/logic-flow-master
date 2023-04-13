// 前后-处理器
export default function registerFamen(lf) {
  lf.register('special-cpu', ({ CircleNode, CircleNodeModel, h }) => {
    class EndNode extends CircleNode {
      getIconShape() {
        const { model } = this.props
        const {
          x,
          y,
          width,
          height
        } = model
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
              fill: '#1296db',
              d: 'M426.666667 896v85.333333a42.666667 42.666667 0 0 1-85.333334 0v-85.333333H256a128 128 0 0 1-128-128v-128H42.666667a42.666667 42.666667 0 0 1 0-85.333333h85.333333v-128H42.666667a42.666667 42.666667 0 1 1 0-85.333334h85.333333V256a128 128 0 0 1 128-128h85.333333V42.666667a42.666667 42.666667 0 1 1 85.333334 0v85.333333h170.666666V42.666667a42.666667 42.666667 0 0 1 85.333334 0v85.333333h85.333333a128 128 0 0 1 128 128v85.333333h85.333333a42.666667 42.666667 0 0 1 0 85.333334h-85.333333v128h85.333333a42.666667 42.666667 0 0 1 0 85.333333h-85.333333v128a128 128 0 0 1-128 128h-85.333333v85.333333a42.666667 42.666667 0 0 1-85.333334 0v-85.333333h-170.666666z m341.333333-682.666667H256a42.666667 42.666667 0 0 0-42.368 37.674667L213.333333 256v512a42.666667 42.666667 0 0 0 37.674667 42.368L256 810.666667h512a42.666667 42.666667 0 0 0 42.368-37.674667L810.666667 768V256a42.666667 42.666667 0 0 0-42.666667-42.666667z m-128 128a42.666667 42.666667 0 0 1 42.666667 42.666667v256a42.666667 42.666667 0 0 1-42.666667 42.666667H384a42.666667 42.666667 0 0 1-42.666667-42.666667V384a42.666667 42.666667 0 0 1 42.666667-42.666667h256z m-42.666667 85.333334h-170.666666v170.666666h170.666666v-170.666666z'
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
            h(
              'circle',
              {
                cx: x,
                cy: y,
                r,
                fill,
                stroke,
                strokeWidth
              }
            ),
            this.getIconShape()
          ]
        )
      }
    }
    class EndModel extends CircleNodeModel {
      constructor(data, graphModel) {
        data.text = {
          value: (data.text && data.text.value) || '核心处理器',
          x: data.x,
          y: data.y + 35
        }
        super(data, graphModel)
      }
    }
    return {
      view: EndNode,
      model: EndModel
    }
  })
}
