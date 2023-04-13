// 组---工序节点
import { GroupNode } from '@logicflow/extension'

class MyGroup extends GroupNode.view {}

class MyGroupModel extends GroupNode.model {
  initNodeData(data) {
    super.initNodeData(data)
    this.isRestrict = true // 子节点是否被禁止通过拖拽移出分组。 默认false，允许拖拽移除分组。
    this.resizable = true // 分组节点是否允许调整大小。
    this.foldable = true // 分组节点是否允许折叠
    this.width = 300
    this.height = 180
  }
  getNodeStyle() {
    const style = super.getNodeStyle()
    style.stroke = '#AEAFAE'
    style.strokeWidth = 1
    return style
  }
}

export default {
  type: 'my-group',
  model: MyGroupModel,
  view: MyGroup
}
