<template>
  <div class="bpmn-example-container">
    <div ref="logicContainer" class="viewport" />
    <!-- 左侧流程节点 -->
    <div class="node-panel">
      <div class="pattern-selection" @mousedown="openSelection" />
      <div style="margin-bottom: 15px; font-size: 12px">选区</div>
      <div
        v-for="item in nodeList"
        :key="item.text"
        class="node-item"
        @mousedown="$_dragNode(item)"
      >
        <div class="node-item-icon" :class="item.class">
          <div
            v-if="item.type === 'user' || item.type === 'time'"
            class="shape"
          />
        </div>
        <span class="node-label">{{ item.text }}</span>
      </div>
    </div>
    <!-- 底部下载 -->
    <div class="graph-io">
      <span id="download-img" title="下载图片" @mousedown="downloadImage">
        <i class="el-icon-picture-outline down-img" />
      </span>
    </div>
  </div>
</template>

<script>
import LogicFlow from '@logicflow/core'
// 引入整体背景的样式
import '@logicflow/core/dist/style/index.css'
// 引入 extension相关操作的样式
import '@logicflow/extension/lib/style/index.css'
import { Control, Menu, SelectionSelect, InsertNodeInPolyline, Snapshot } from '@logicflow/extension'
// 导入所有自定义节点
import {
  registerStart,
  registerEnd,
  registerTask
} from './nodes'

export default {
  data() {
    return {
      lf: null,
      config: {
        stopScrollGraph: true, // 禁止鼠标滚动移动画布
        stopZoomGraph: true, // 禁止缩放
        metaKeyMultipleSelected: true,
        // 背景网格大小
        grid: {
          size: 10,
          type: 'dot'
        },
        keyboard: {
          enabled: true
        },
        snapline: true
      },
      // 定义左侧的流程图表 注意 type的命名需要与实际js配置项里的一致
      nodeList: [
        {
          text: '开始',
          type: 'start',
          class: 'node-start'
        },
        {
          text: '矩形',
          type: 'rect',
          class: 'node-rect'
        },
        {
          type: 'end',
          text: '结束',
          class: 'node-end'
        }
      ]
    }
  },
  mounted() {
    // 初始项目注册
    this.lf = new LogicFlow({
      ...this.config,
      plugins: [
        // 右上方 控制面板
        Control,
        // 启动节点 右键鼠标菜单
        Menu,
        // 开启框选功能
        SelectionSelect,
        // 允许中间插入节点
        InsertNodeInPolyline,
        // 开启导出功能
        Snapshot
      ],
      container: this.$refs.logicContainer,
      isSilentMode: this.isType === 'preview'
    })
    // 注册左侧可拖拽的node节点
    registerStart(this.lf)
    registerTask(this.lf)
    registerEnd(this.lf)

    this.saveClosePage()
    this.lf.render()
  },
  methods: {
    saveClosePage() {
      this.lf.extension.control.addItem({
        iconClass: 'el-icon-files',
        title: '',
        text: '保存',
        onClick: (lf, ev) => {

        }
      })
      this.lf.extension.control.addItem({
        iconClass: 'el-icon-close',
        title: '',
        text: '关闭',
        onClick: (lf, ev) => {

        }
      })
    },
    // 为所有节点绑定拖拽的事件
    $_dragNode(item) {
      this.lf.dnd.startDrag({
        type: item.type
      })
    },
    // 选取
    openSelection() {
      this.lf.updateEditConfig({
        stopMoveGraph: true
      })
    },
    // 下载图片
    downloadImage() {
      this.lf.getSnapshot()
    }
  }
}

</script>

<style scoped lang="scss">
.bpmn-example-container {
  height: calc(100vh - 50px);
  position: relative;
  overflow: hidden;

  .viewport {
    height: 100%;
    overflow: hidden;
    position: relative;
  }
}

.viewport ::v-deep .el-icon-files {
      font-size: 20px;
}
.viewport ::v-deep .el-icon-close {
      font-size: 20px;
}

.node-panel {
  position: absolute;
  top: 10px;
  left: 15px;
  width: 70px;
  padding: 20px 10px;
  background-color: white;
  box-shadow: 0 0 10px 1px rgb(228, 224, 219);
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 101;
}
.node-item {
  margin-bottom: 15px;
  text-align: center;
}
.node-item-icon {
  width: 30px;
  height: 30px;
  background-size: cover;
}
.node-label {
  font-size: 12px;
  margin-top: 5px;
  user-select: none;
}
.node-start {
  background: url('./imgs/start.png') no-repeat;
  background-size: cover;
}
.node-rect {
  border: 1px solid black;
}
.node-end {
  background: url('./imgs/end.png') no-repeat;
  background-size: cover;
}

.pattern-selection {
  width: 36px;
  height: 36px;
  background: url('./imgs/选区域.png') no-repeat;
  background-size: cover;
  cursor: pointer;
  opacity: 0.99;
}

.graph-io {
  position: absolute;
  left: 10px;
  bottom: 10px;
  z-index: 9999;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
  padding: 10px;
  display: flex;
}
.graph-io {
  .down-img {
    font-size: 18px;
    color: #328cff;
  }
  span {
    margin: 0 5px;
    cursor: pointer;
  }
}
</style>
