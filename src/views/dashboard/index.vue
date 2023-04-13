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
        <div class="node-item-icon" :class="item.class" />
        <span class="node-label">{{ item.text }}</span>
      </div>
    </div>

    <!-- 工具按钮 -->
    <el-button-group class="btnRadio">
      <el-button @click="handleBtn('large')">放大</el-button>
      <el-button @click="handleBtn('small')">缩小</el-button>
      <el-button @click="handleBtn('reset')">大小适应</el-button>
      <el-button @click="handleBtn('resetTranslate')">定位还原</el-button>
      <el-button :disabled="!undoState" @click="handleBtn('undo')">上一步(ctrl+z)</el-button>
      <el-button :disabled="!redoState" @click="handleBtn('redo')">下一步(ctrl+y)</el-button>
      <el-button @click="handleBtn('img')">保存为图片</el-button>
      <el-button @click="handleBtn('data')">保存为数据</el-button>
    </el-button-group>

    <!-- 底部下载 -->
    <!-- <div class="graph-io">
      <span id="download-img" title="下载图片" @mousedown="downloadImage">
        <i class="el-icon-picture-outline down-img" />
      </span>
    </div> -->
    <!-- 数据查看面板 -->
    <el-dialog
      title="数据"
      :visible.sync="dataVisible"
      width="50%"
    >
      <vue-json-pretty :path="'res'" :data="graphData" />
    </el-dialog>
  </div>
</template>

<script>
import VueJsonPretty from 'vue-json-pretty'
import 'vue-json-pretty/lib/styles.css'
import LogicFlow from '@logicflow/core'
// 引入整体背景的样式
import '@logicflow/core/dist/style/index.css'
// 引入 extension相关操作的样式
import '@logicflow/extension/lib/style/index.css'
import { Control, Menu, SelectionSelect, InsertNodeInPolyline, Snapshot, Group } from '@logicflow/extension'
// 导入所有自定义节点
import {
  central,
  registerCpu
} from './nodes'
import MyGroup from './nodes/MyGroup'
export default {
  components: {
    VueJsonPretty // JSON 数据展示
  },
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
          text: '工序',
          type: 'my-group',
          class: 'node-group'
        },
        {
          text: '核心处理器',
          type: 'central-cpu',
          class: 'node-central'
        },
        {
          text: '特殊处理器',
          type: 'special-cpu',
          class: 'node-special'
        }
      ],
      dataVisible: false, // 数据显示与否
      graphData: {}, // 画布的数据
      undoState: false, // 上一步
      redoState: false // 下一步
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
        Snapshot,
        // 组
        Group
      ],
      container: this.$refs.logicContainer,
      isSilentMode: this.isType === 'preview'
    })
    // 注册左侧可拖拽的node节点
    central(this.lf) // 通用处理器
    registerCpu(this.lf) // 前后处理器
    this.lf.register(MyGroup) // 注册--组节点
    // this.saveClosePage()
    this.handleRender() // 渲染logiFlow实例
  },
  methods: {
    // 渲染logiFlow实例
    handleRender() {
      this.lf.render()
      this.LfEvent()
    },
    // 绘制区域节点事件
    LfEvent() {
      // 节点点击打开右侧属性配置栏
      this.lf.on('node:click', ({ data }) => {
        console.log('node:click<<<<<<<<<<<<<<<', data)
        // 储存选择的节点dom
        this.clickNode = data
        this.nodeForm = { text: '' }
        this.visible = true
      })

      // 上一步、下一步按钮状态
      this.lf.on('history:change', ({ data: { undoAble, redoAble }}) => {
        this.undoState = undoAble
        this.redoState = redoAble
      })
    },
    // 为所有节点绑定拖拽的事件
    $_dragNode(item) {
      this.lf.dnd.startDrag({
        type: item.type,
        properties: {
          name: item.class
        }
      })
    },
    // 控制按钮
    handleBtn(btn) {
      switch (btn) {
        case 'large': {
          this.lf.zoom(true)
          break
        }
        case 'small': {
          this.lf.zoom(false)
          break
        }
        case 'reset': {
          this.lf.resetZoom()
          break
        }
        case 'resetTranslate': {
          this.lf.resetTranslate()
          break
        }
        case 'undo': {
          this.lf.undo()
          break
        }
        case 'redo': {
          this.lf.redo()
          break
        }
        case 'img': {
          this.lf.getSnapshot()
          break
        }
        case 'data': {
          const data = this.lf.getGraphData()
          console.log('data>>>>>>>>>>>>>>>>>>', data)
          break
        }
      }
    },
    // 选取
    openSelection() {
      this.lf.updateEditConfig({
        stopMoveGraph: true
      })
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
.node-central {
  background: url('./imgs/coreProcessor.svg') no-repeat;
  background-size: cover;
}
// 工序节点
.node-group {
  background: url('./imgs/jiedian.svg') no-repeat;
  background-size: cover;
}
.node-special {
  background: url('./imgs/cpu.svg') no-repeat;
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

// 图片下周
.graph-io {
  position: absolute;
  left: 10px;
  bottom: 10px;
  z-index: 9999;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
  padding: 10px;
  display: flex;
  .down-img {
    font-size: 18px;
    color: #328cff;
  }
  span {
    margin: 0 5px;
    cursor: pointer;
  }
}
// 工具按钮
.btnRadio {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  z-index: 200;
}
</style>
