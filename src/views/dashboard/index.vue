<template>
  <div class="bpmn-example-container">
    <div ref="logicContainer" class="viewport" />
    <!-- 左侧流程节点 -->
    <div v-if="false" class="node-panel">
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
      <el-button @click="handleBtn('api')">模拟接口</el-button>
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
import { Control, Menu, SelectionSelect, InsertNodeInPolyline, Snapshot, Group, DndPanel } from '@logicflow/extension'
// 导入所有自定义节点
import {
  central,
  registerCpu
} from './nodes'
import MyGroup from './nodes/MyGroup'
const demoData = require('./data.json')
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
      // nodeList: [
      //   {
      //     text: '工序',
      //     type: 'my-group',
      //     class: 'node-group'
      //   },
      //   {
      //     text: '核心处理器',
      //     type: 'central-cpu',
      //     class: 'node-central'
      //   },
      //   {
      //     text: '特殊处理器',
      //     type: 'special-cpu',
      //     class: 'node-special'
      //   }
      // ],
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
        Group,
        // 拖拽面板
        DndPanel
      ],
      container: this.$refs.logicContainer,
      isSilentMode: this.isType === 'preview'
    })
    // 注册左侧可拖拽的node节点
    central(this.lf) // 通用处理器
    registerCpu(this.lf) // 前后处理器
    this.lf.register(MyGroup) // 注册--组节点
    // this.saveClosePage()
    this.setdndPanel() // 渲染面板
    this.handleRender() // 渲染logiFlow实例
  },
  methods: {
    // 面吧组件
    setdndPanel() {
      this.lf.extension.dndPanel.setPatternItems([
        {
          label: '选区',
          className: 'custom-selection',
          icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAApxJREFUWEftmM1u00AQx2eMJbjhOtwBKY7EifIG8ASUJ6Ac4xxo3sB5gqSH2kfCE8AjlCcgN6Q4UsOduO6tElYGzeaja9exvXI2oVL24jhez/zyn8zO7qDth9cAYMFixJHrHC0/a7mo+kPbD0kmiVwH5XvbD/sEcCx9FxMm3bj9airPs4JfL5DMvvRjAQFGket0M/YK/WVVKQcMJgMkWgPOEWKC5CwXEMyBQetoACGOonbzrC5gDABPl0ZuItdZhVtXiJX8pcKphaim0QNgTQE50f7vIQDtYDLgazbjdKGr+BOADT+85OvMdd7qgpLtqvg7AOZFRFnBoyD8zoau287JLkKs4k+EmOuo2Clk6qsuWBV/D2OZ0aXUNuweFKyr4sNIEpW0r6sIv6/i71BJtlJJVEqPaoiti/Fx3GmN5PeeBaHYlPxpO2KTUjS0b7cWp0aaIhjezG1+LQPKPte+Dtr+eAiAH9kxAVw+QuhVUW4Fqh2QQ2wg/pSVYVDC5FOV2o9sABAXx06im+z/RTUkefNtP+T/4Ot7zxCHc/jbKwItPbhvA7BxMT4lxC8bbMWAMJjfmudx9yWfmVOjFDDTSxEvz4neZJW+F0qCXtRxvJU32w/lA3seawxEXtRpncsPSwHZsWlgqtuQ3Jqj7K+1+leW+SRZt0gSSKZy6MRBiehzeUTSGY/84qr3ktdLKTdYbQZvUg0yr6rNvst47VksA3ENRoL3VSER4MdOARv+5ISAvlUA/I1E3qzTGu4UkMFsP+S+4vM8SKEYgicv5PsA5H4hNzrTywngh5nbFKfLVBZXkHurUzjbjccJt53Xg5Xb1NXYuYKLMN/VZ743EN5tqs97AZQX9SL1GH4vgMtkEfW5SL29AnJ9BsTTso7aP9GfT0LnGEEPAAAAAElFTkSuQmCC',
          callback: () => {
            this.lf.openSelectionSelect()
            this.lf.once('selection:selected', () => {
              this.lf.closeSelectionSelect()
            })
          }
        },
        {
          type: 'my-group',
          label: '工序',
          icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/Pg0KPCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj48c3ZnIHQ9IjE2MjA3MTM2NTI1ODUiDQogICAgY2xhc3M9Imljb24iIHZpZXdCb3g9IjAgMCAxMDI0IDEwMjQiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBwLWlkPSIzNTUzIg0KICAgIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiPg0KICAgIDxkZWZzPg0KICAgICAgICA8c3R5bGUgdHlwZT0idGV4dC9jc3MiPjwvc3R5bGU+DQogICAgPC9kZWZzPg0KICAgIDxwYXRoDQogICAgICAgIGQ9Ik03OS43NDEyMjEgNjAxLjM2MTEyN2MxMS4xNjk4OTEtMS44NjE5ODIgMTguNjE3ODE4LTcuNDQ2OTI3IDI2LjA2NDc0Ni0xMy4wMzE4NzIgNy40NDc5MjctNy40NDc5MjcgMTEuMTcwODkxLTE0Ljg5NDg1NSA5LjMwOTkwOS0yNC4yMDM3NjR2LTcuNDQ2OTI3YzAtMTQzLjM1ODYgODAuMDU3MjE4LTI3NS41NDczMDkgMjA0Ljc5OC0zNDYuMjk1NjE5IDkuMzA4OTA5LTUuNTg0OTQ1IDEzLjAzMTg3My0xMy4wMzE4NzMgMTYuNzU1ODM2LTIwLjQ3OTggMS44NjE5ODItOS4zMDg5MDkgMS44NjE5ODItMTguNjE3ODE4LTMuNzIzOTYzLTI2LjA2NDc0NS01LjU4NDk0NS05LjMwOTkwOS0xMS4xNjk4OTEtMTQuODk0ODU1LTIwLjQ3OTgtMTYuNzU1ODM2LTExLjE2OTg5MS0zLjcyMzk2NC0xOC42MTc4MTgtMS44NjE5ODItMjcuOTI2NzI4IDMuNzIyOTYzQzEzNS41OTM2NzYgMjM0LjU4NzcwOSA0NC4zNjY1NjcgMzkwLjk3ODE4MiA0NC4zNjY1NjcgNTU4LjUzOTU0NnYxNC44OTQ4NTRjMS44NjE5ODIgMTQuODk0ODU1IDE2Ljc1NjgzNiAyNy45MjY3MjcgMzUuMzc0NjU0IDI3LjkyNjcyN3ogbTYyMy43MDI5MDktMzg5LjExNjJjMTI2LjYwMjc2NCA3MC43NDkzMDkgMjA2LjY1OTk4MiAyMDIuOTM2MDE4IDIwNi42NTk5ODIgMzQ2LjI5NDYxOXY1LjU4NTk0NWMtMS44NjE5ODIgOS4zMDg5MDkgMCAxNi43NTU4MzYgNS41ODQ5NDYgMjIuMzQxNzgyIDcuNDQ3OTI3IDkuMzA4OTA5IDE0Ljg5NDg1NSAxNC44OTM4NTUgMjcuOTI3NzI3IDE0Ljg5Mzg1NGgzLjcyMjk2NGMxNi43NTY4MzYgMCAzMS42NTA2OTEtMTMuMDMxODczIDMzLjUxMjY3Mi0zMS42NDk2OTF2LTEzLjAzMjg3MmMwLTE2Ny41NjIzNjQtOTEuMjI5MTA5LTMyMy45NTM4MzYtMjQwLjE3MjY1NC00MDUuODczMDM3LTkuMzA4OTA5LTUuNTg0OTQ1LTE2Ljc1NTgzNi01LjU4NDk0NS0yNy45MjY3MjctMy43MjI5NjMtOS4zMDg5MDkgMS44NjA5ODItMTQuODkzODU1IDkuMzA4OTA5LTIyLjM0MTc4MiAxNi43NTU4MzYtNS41ODQ5NDUgOS4zMDk5MDktNy40NDY5MjcgMTguNjE3ODE4LTMuNzIyOTY0IDI2LjA2NDc0NSAzLjcyMjk2NCAxMS4xNzA4OTEgOS4zMDg5MDkgMTguNjE4ODE4IDE2Ljc1NTgzNiAyMi4zNDE3ODJ6IG0yNy45MjY3MjggNjc5LjU1NzM2NGgtOS4zMDg5MDlsLTkuMzA4OTA5IDMuNzIzOTY0Yy0xMjIuODc4OCA3MC43NDgzMDktMjg0Ljg1NTIxOCA3MC43NDgzMDktNDA3LjczNDAxOSAwbC0zLjcyMzk2My0xLjg2MTk4MmgtMTEuMTY5ODkxYy0yMC40Nzk4IDAtMzMuNTEyNjczIDE0Ljg5Mzg1NS0zMy41MTI2NzMgMzUuMzczNjU0IDAgMTMuMDMyODczIDUuNTg0OTQ1IDIyLjM0MTc4MiAxNi43NTU4MzYgMzEuNjUwNjkxIDcwLjc0OTMwOSA0MC45NTk2IDE1Mi42Njg1MDkgNjMuMzAxMzgyIDIzOC4zMTA2NzMgNjMuMzAxMzgyIDgzLjc4MTE4MiAwIDE2Ny41NjEzNjQtMjIuMzQxNzgyIDIzOC4zMDk2NzMtNjUuMTYzMzY0IDE2Ljc1NjgzNi0xMy4wMzE4NzMgMjAuNDc5OC0yMi4zNDA3ODIgMjAuNDc5OC0zMS42NDk2OS0zLjcyMjk2NC0xOC42MTg4MTgtMTguNjE3ODE4LTM1LjM3NDY1NS0zOS4wOTc2MTgtMzUuMzc0NjU1eiINCiAgICAgICAgZmlsbD0iIzEyOTZkYiIgcC1pZD0iMzU1NCI+PC9wYXRoPg0KICAgIDxwYXRoDQogICAgICAgIGQ9Ik0xMDEwLjY0MTEzIDc0MC45OTY3NjRjLTcuNDQ2OTI3LTMzLjUxMjY3My0yOS43ODk3MDktNjMuMzAxMzgyLTU5LjU3NzQxOC04MC4wNTgyMTgtMjIuMzQxNzgyLTE0Ljg5Mzg1NS00Ni41NDU1NDUtMTQuODkzODU1LTYzLjMwMTM4Mi0xNC44OTM4NTUtMzMuNTEyNjczIDAtNjMuMzAxMzgyIDEzLjAzMjg3My04Ny41MDQxNDUgMzUuMzczNjU1bC0xLjg2MTk4MiAxLjg2MTk4MS0xMDYuMTIyOTYzLTYxLjQzOTR2LTEuODYxOTgxYzcuNDQ2OTI3LTIyLjM0MDc4MiAxMS4xNzA4OTEtNDIuODIwNTgyIDExLjE3MDg5LTYxLjQzOTQgMC04OS4zNjYxMjctNjMuMzAxMzgyLTE2NS42OTkzODItMTUyLjY2ODUwOS0xODQuMzE4MjAxaC0xLjg1OTk4MlYyNDkuNDgxNTY0aDEuODU5OTgyYzUzLjk5MzQ3My0xNC44OTQ4NTUgOTEuMjI5MTA5LTY1LjE2MzM2NCA5MS4yMjkxMDktMTIyLjg3ODhDNjM4LjI4MDc2NyA1Ny43MTU0MzYgNTgyLjQyNzMxMiAwIDUxMS42NzkwMDMgMFMzODUuMDc2MjM5IDU3LjcxNTQzNiAzODUuMDc2MjM5IDEyOC40NjM3NDVjMCA1NS44NTQ0NTUgMzUuMzc0NjU1IDEwNC4yNjA5ODIgOTEuMjI5MTEgMTIyLjg3ODhoMS44NjA5ODF2MTIxLjAxNzgxOWgtMy43MjM5NjNjLTg5LjM2NjEyNyAxNi43NTU4MzYtMTUyLjY2NzUwOSA5NC45NTEwNzMtMTUyLjY2NzUwOSAxODQuMzE4MiAwIDIyLjM0MDc4MiAzLjcyMzk2NCA0Mi44MjA1ODIgMTEuMTcwODkxIDYxLjQzOTR2MS44NjA5ODJsLTEwNi4xMjE5NjQgNjEuNDM5NC0xLjg2MTk4Mi0xLjg2MDk4MmMtMjQuMjAzNzY0LTIwLjQ3OTgtNTcuNzE2NDM2LTMzLjUxMjY3My04Ny41MDUxNDUtMzMuNTEyNjczLTI2LjA2NDc0NSAwLTUwLjI2ODUwOSA5LjMwODkwOS02My4zMDEzODIgMTQuODkzODU1LTI5Ljc4ODcwOSAxNC44OTQ4NTUtNTAuMjY4NTA5IDQyLjgyMTU4Mi01Ny43MTU0MzcgNzYuMzM0MjU0cy03LjQ0NjkyNyA2OC44ODYzMjcgOS4zMDk5MSA5Ni44MTQwNTVjMTguNjE2ODE4IDQwLjk1OTYgNjEuNDM5NCA2NS4xNjIzNjQgMTA5Ljg0NDkyNyA2NS4xNjIzNjMgMjkuNzg5NzA5IDAgNTIuMTMwNDkxLTExLjE2OTg5MSA2My4zMDEzODItMTQuODkzODU0IDQ4LjQwNzUyNy0yNi4wNjU3NDUgNzIuNjEwMjkxLTgxLjkxOTIgNTcuNzE2NDM2LTEzOS42MzU2Mzd2LTEuODYxOTgxbDEwNC4yNTk5ODItNTkuNTc3NDE5IDEuODYxOTgyIDEuODYxOTgyYzM1LjM3NDY1NSA0MC45NTk2IDg5LjM2NzEyNyA2NS4xNjMzNjQgMTQxLjQ5NjYxOCA2NS4xNjMzNjQgNTUuODU0NDU1IDAgMTA2LjEyMjk2NC0yMi4zNDE3ODIgMTQzLjM1ODYtNjUuMTYzMzY0bDEuODYxOTgyLTEuODYxOTgyIDEwNC4yNjA5ODIgNTkuNTc3NDE5djEuODYxOTgxYy0xMS4xNjk4OTEgNTIuMTMwNDkxIDExLjE3MDg5MSAxMDYuMTIyOTY0IDU3LjcxNTQzNiAxMzcuNzczNjU1IDE4LjYxODgxOCAxMy4wMzI4NzMgNDguNDA3NTI3IDIwLjQ3OTggNzYuMzM0MjU0IDIwLjQ3OTggNS41ODQ5NDUgMCAxMS4xNjk4OTEgMCAxNC44OTQ4NTUtMS44NjE5ODIgMzkuMDk3NjE4LTUuNTg0OTQ1IDY4Ljg4NjMyNy0yNC4yMDM3NjQgOTEuMjI4MTA5LTU5LjU3NzQxOCAyNC4yMDI3NjQtNDAuOTU5NiAyNC4yMDI3NjQtNjcuMDI1MzQ1IDE2Ljc1NTgzNi0xMDAuNTM3MDE4eiBtLTgxNy4zMzAwMTggNDQuNjgyNTYzYy0zLjcyMzk2NCAxNC44OTQ4NTUtMTQuODk0ODU1IDI2LjA2NTc0NS0yNy45MjY3MjcgMzMuNTEyNjczLTkuMzA5OTA5IDcuNDQ2OTI3LTE2Ljc1NjgzNiA5LjMwOTkwOS0yOS43ODk3MDkgOS4zMDk5MDktMjAuNDc5OCAwLTQwLjk1OTYtMTMuMDMzODczLTUwLjI2ODUwOS0yOS43ODk3MDktNy40NDY5MjctMTMuMDMyODczLTExLjE2OTg5MS0yNy45MjY3MjctNy40NDY5MjgtNDIuODIxNTgyczEzLjAzMjg3My0yNi4wNjQ3NDUgMjcuOTI2NzI4LTM1LjM3MzY1NGM5LjMwOTkwOS01LjU4NTk0NSAxNi43NTY4MzYtOS4zMDk5MDkgMjcuOTI3NzI3LTkuMzA5OTA5IDIwLjQ3OTggMCA0MC45NTk2IDEzLjAzMjg3MyA1MC4yNjg1MDkgMjkuNzg5NzA5IDExLjE2OTg5MSAxNC44OTM4NTUgMTEuMTY5ODkxIDMxLjY0OTY5MSA5LjMwODkwOSA0NC42ODI1NjN6TTQ1Mi4xMDA1ODUgMTI4LjQ2Mzc0NWMwLTMxLjY0OTY5MSAyNi4wNjQ3NDUtNTcuNzE1NDM2IDU3LjcxNTQzNi01Ny43MTU0MzZzNTcuNzE1NDM2IDI2LjA2NTc0NSA1Ny43MTU0MzcgNTcuNzE1NDM2YzAgMzEuNjUwNjkxLTI2LjA2NDc0NSA1Ny43MTY0MzYtNTcuNzE1NDM3IDU3LjcxNjQzN1M0NTIuMTAwNTg1IDE1OC4yNTM0NTUgNDUyLjEwMDU4NSAxMjguNDYzNzQ1eiBtNTkuNTc3NDE4IDU0Ny4zNjk2NTVjLTY1LjE2MzM2NCAwLTEyMS4wMTY4MTgtNTIuMTI5NDkxLTEyMS4wMTY4MTgtMTE5LjE1NDgzNiAwLTY3LjAyNTM0NSA1My45OTE0NzMtMTE5LjE1NTgzNiAxMjEuMDE2ODE4LTExOS4xNTU4MzcgNjUuMTYyMzY0IDAgMTIxLjAxNjgxOCA1Mi4xMzA0OTEgMTIxLjAxNjgxOCAxMTkuMTU1ODM3LTEuODYxOTgyIDY1LjE2MjM2NC01My45OTI0NzMgMTE5LjE1NDgzNi0xMjEuMDE2ODE4IDExOS4xNTQ4MzZ6IG00MjYuMzUxODM3IDEyMi44Nzg4Yy0xMS4xNjk4OTEgMTguNjE3ODE4LTI3LjkyNjcyNyAyNy45MjY3MjctNDYuNTQ0NTQ2IDI3LjkyNjcyNy0xMS4xNzA4OTEgMC0yNC4yMDM3NjQtMS44NjE5ODItMzMuNTEyNjczLTkuMzA4OTA5LTEzLjAzMjg3My05LjMwODkwOS0yNC4yMDM3NjQtMjAuNDc5OC0yNy45MjY3MjctMzcuMjM1NjM2LTMuNzIzOTY0LTEzLjAzMjg3My0xLjg2MTk4Mi0yNi4wNjU3NDUgNy40NDY5MjctMzcuMjM2NjM2IDExLjE2OTg5MS0xOC42MTc4MTggMjkuNzg4NzA5LTI5Ljc4ODcwOSA0OC40MDY1MjgtMzEuNjQ5NjkxaDUuNTg1OTQ1YzExLjE2OTg5MSAwIDIyLjM0MDc4MiAxLjg2MDk4MiAzMy41MTE2NzMgMTMuMDMxODcyIDIyLjM0MTc4MiAxOC42MTc4MTggMjYuMDY1NzQ1IDQ2LjU0NTU0NSAxMy4wMzI4NzMgNzQuNDcyMjczeiINCiAgICAgICAgZmlsbD0iIzEyOTZkYiIgcC1pZD0iMzU1NSI+PC9wYXRoPg0KPC9zdmc+',
          className: 'node-group'
        },
        {
          type: 'central-cpu',
          label: '核心处理器',
          icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/Pg0KPCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj48c3ZnIHQ9IjE2ODEzNTQ5MDQ1MTkiDQogICAgY2xhc3M9Imljb24iIHZpZXdCb3g9IjAgMCAxMDI0IDEwMjQiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBwLWlkPSIyNzQzIg0KICAgIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCI+DQogICAgPHBhdGgNCiAgICAgICAgZD0iTTI3Ny4zIDc4OS4zdi0yNTZoLTg4Yy05LjUgMzYuOC00Mi45IDY0LTgyLjYgNjQtNDcuMSAwLTg1LjMtMzguMi04NS4zLTg1LjNzMzguMi04NS4zIDg1LjMtODUuM2MzOS44IDAgNzMuMiAyNy4yIDgyLjYgNjRoODh2LTI1NmgtODhjLTkuNSAzNi44LTQyLjkgNjQtODIuNiA2NC00Ny4xIDAtODUuMy0zOC4yLTg1LjMtODUuM1M1OS41IDEyOCAxMDYuNyAxMjhjMzkuOCAwIDczLjIgMjcuMiA4Mi42IDY0aDg4di04NS4zYzAtMzUuMyAyOC43LTY0IDY0LTY0aDM0MS4zYzM1LjMgMCA2NCAyOC43IDY0IDY0VjE5Mmg4OGM5LjUtMzYuOCA0Mi45LTY0IDgyLjYtNjQgNDcuMSAwIDg1LjMgMzguMiA4NS4zIDg1LjNzLTM4LjIgODUuMy04NS4zIDg1LjNjLTM5LjggMC03My4yLTI3LjItODIuNi02NGgtODh2MjU2aDg4YzkuNS0zNi44IDQyLjktNjQgODIuNi02NCA0Ny4xIDAgODUuMyAzOC4yIDg1LjMgODUuM3MtMzguMiA4NS4zLTg1LjMgODUuM2MtMzkuOCAwLTczLjItMjcuMi04Mi42LTY0aC04OHYyNTZoODhjOS41LTM2LjggNDIuOS02NCA4Mi42LTY0IDQ3LjEgMCA4NS4zIDM4LjIgODUuMyA4NS4zcy0zOCA4NS41LTg1LjIgODUuNWMtMzkuOCAwLTczLjItMjcuMi04Mi42LTY0aC04OHY4NS4zYzAgMzUuMy0yOC43IDY0LTY0IDY0SDM0MS4zYy0zNS4zIDAtNjQtMjguNy02NC02NFY4MzJoLTg4Yy05LjUgMzYuOC00Mi45IDY0LTgyLjYgNjQtNDcuMSAwLTg1LjMtMzguMi04NS4zLTg1LjNzMzguMi04NS4zIDg1LjMtODUuM2MzOS44IDAgNzMuMiAyNy4yIDgyLjYgNjRoODh6TTcwNCAzNDVWMTA2LjdjMC0xMS44LTkuNi0yMS4zLTIxLjMtMjEuM0gzNDEuM2MtMTEuOCAwLTIxLjMgOS42LTIxLjMgMjEuM1YzNDVjNi43LTIuNCAxMy45LTMuNiAyMS4zLTMuNmgzNDEuM2M3LjUtMC4xIDE0LjcgMS4yIDIxLjQgMy42eiBtMCAzMzRjLTYuNyAyLjQtMTMuOSAzLjYtMjEuMyAzLjZIMzQxLjNjLTcuNSAwLTE0LjctMS4zLTIxLjMtMy42djIzOC4zYzAgMTEuOCA5LjYgMjEuMyAyMS4zIDIxLjNoMzQxLjNjMTEuOCAwIDIxLjMtOS42IDIxLjMtMjEuM1Y2Nzl6TTM0MS4zIDM4NGMtMTEuOCAwLTIxLjMgOS42LTIxLjMgMjEuM3YyMTMuM2MwIDExLjggOS42IDIxLjMgMjEuMyAyMS4zaDM0MS4zYzExLjggMCAyMS4zLTkuNiAyMS4zLTIxLjNWNDA1LjNjMC0xMS44LTkuNi0yMS4zLTIxLjMtMjEuM0gzNDEuM3pNNDQ4IDIzNC43Yy0xMS44IDAtMjEuMy05LjYtMjEuMy0yMS4zUzQzNi4yIDE5MiA0NDggMTkyaDEyOGMxMS44IDAgMjEuMyA5LjYgMjEuMyAyMS4zcy05LjYgMjEuMy0yMS4zIDIxLjNINDQ4eiBtMCA1OTcuM2MtMTEuOCAwLTIxLjMtOS42LTIxLjMtMjEuMyAwLTExLjggOS42LTIxLjMgMjEuMy0yMS4zaDEyOGMxMS44IDAgMjEuMyA5LjYgMjEuMyAyMS4zIDAgMTEuOC05LjYgMjEuMy0yMS4zIDIxLjNINDQ4eiBtMC0yOTguN2MtMTEuOCAwLTIxLjMtOS42LTIxLjMtMjEuMyAwLTExLjggOS42LTIxLjMgMjEuMy0yMS4zaDEyOGMxMS44IDAgMjEuMyA5LjYgMjEuMyAyMS4zIDAgMTEuOC05LjYgMjEuMy0yMS4zIDIxLjNINDQ4eiBtNDY5LjMgMjEuNGMyMy42IDAgNDIuNy0xOS4xIDQyLjctNDIuN3MtMTkuMS00Mi43LTQyLjctNDIuNy00Mi43IDE5LjEtNDIuNyA0Mi43IDE5LjIgNDIuNyA0Mi43IDQyLjd6IG0wLTI5OC43YzIzLjYgMCA0Mi43LTE5LjEgNDIuNy00Mi43cy0xOS4xLTQyLjctNDIuNy00Mi43LTQyLjcgMTkuMS00Mi43IDQyLjcgMTkuMiA0Mi43IDQyLjcgNDIuN3pNMTA2LjcgNTU0LjdjMjMuNiAwIDQyLjctMTkuMSA0Mi43LTQyLjdzLTE5LjEtNDIuNy00Mi43LTQyLjdTNjQgNDg4LjQgNjQgNTEyczE5LjEgNDIuNyA0Mi43IDQyLjd6IG0wLTI5OC43YzIzLjYgMCA0Mi43LTE5LjEgNDIuNy00Mi43cy0xOS4xLTQyLjctNDIuNy00Mi43UzY0IDE4OS44IDY0IDIxMy4zIDgzLjEgMjU2IDEwNi43IDI1NnogbTgxMC42IDU5Ny4zYzIzLjYgMCA0Mi43LTE5LjEgNDIuNy00Mi43Uzk0MC45IDc2OCA5MTcuMyA3NjhzLTQyLjcgMTkuMS00Mi43IDQyLjcgMTkuMiA0Mi42IDQyLjcgNDIuNnogbS04MTAuNiAwYzIzLjYgMCA0Mi43LTE5LjEgNDIuNy00Mi43UzEzMC4yIDc2OCAxMDYuNyA3NjggNjQgNzg3LjEgNjQgODEwLjdzMTkuMSA0Mi42IDQyLjcgNDIuNnoiDQogICAgICAgIGZpbGw9IiMxMjk2ZGIiIHAtaWQ9IjI3NDQiPjwvcGF0aD4NCjwvc3ZnPg==',
          className: 'node-central',
          properties: {
            disabled: true
          }
        },
        {
          type: 'special-cpu',
          label: '特殊处理器',
          icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/Pg0KPCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj48c3ZnIHQ9IjE2ODEzNTQ4MTg4OTUiDQogICAgY2xhc3M9Imljb24iIHZpZXdCb3g9IjAgMCAxMDI0IDEwMjQiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBwLWlkPSIyMzM5Ig0KICAgIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCI+DQogICAgPHBhdGgNCiAgICAgICAgZD0iTTQyNi42NjY2NjcgODk2djg1LjMzMzMzM2E0Mi42NjY2NjcgNDIuNjY2NjY3IDAgMCAxLTg1LjMzMzMzNCAwdi04NS4zMzMzMzNIMjU2YTEyOCAxMjggMCAwIDEtMTI4LTEyOHYtMTI4SDQyLjY2NjY2N2E0Mi42NjY2NjcgNDIuNjY2NjY3IDAgMCAxIDAtODUuMzMzMzMzaDg1LjMzMzMzM3YtMTI4SDQyLjY2NjY2N2E0Mi42NjY2NjcgNDIuNjY2NjY3IDAgMSAxIDAtODUuMzMzMzM0aDg1LjMzMzMzM1YyNTZhMTI4IDEyOCAwIDAgMSAxMjgtMTI4aDg1LjMzMzMzM1Y0Mi42NjY2NjdhNDIuNjY2NjY3IDQyLjY2NjY2NyAwIDEgMSA4NS4zMzMzMzQgMHY4NS4zMzMzMzNoMTcwLjY2NjY2NlY0Mi42NjY2NjdhNDIuNjY2NjY3IDQyLjY2NjY2NyAwIDAgMSA4NS4zMzMzMzQgMHY4NS4zMzMzMzNoODUuMzMzMzMzYTEyOCAxMjggMCAwIDEgMTI4IDEyOHY4NS4zMzMzMzNoODUuMzMzMzMzYTQyLjY2NjY2NyA0Mi42NjY2NjcgMCAwIDEgMCA4NS4zMzMzMzRoLTg1LjMzMzMzM3YxMjhoODUuMzMzMzMzYTQyLjY2NjY2NyA0Mi42NjY2NjcgMCAwIDEgMCA4NS4zMzMzMzNoLTg1LjMzMzMzM3YxMjhhMTI4IDEyOCAwIDAgMS0xMjggMTI4aC04NS4zMzMzMzN2ODUuMzMzMzMzYTQyLjY2NjY2NyA0Mi42NjY2NjcgMCAwIDEtODUuMzMzMzM0IDB2LTg1LjMzMzMzM2gtMTcwLjY2NjY2NnogbTM0MS4zMzMzMzMtNjgyLjY2NjY2N0gyNTZhNDIuNjY2NjY3IDQyLjY2NjY2NyAwIDAgMC00Mi4zNjggMzcuNjc0NjY3TDIxMy4zMzMzMzMgMjU2djUxMmE0Mi42NjY2NjcgNDIuNjY2NjY3IDAgMCAwIDM3LjY3NDY2NyA0Mi4zNjhMMjU2IDgxMC42NjY2NjdoNTEyYTQyLjY2NjY2NyA0Mi42NjY2NjcgMCAwIDAgNDIuMzY4LTM3LjY3NDY2N0w4MTAuNjY2NjY3IDc2OFYyNTZhNDIuNjY2NjY3IDQyLjY2NjY2NyAwIDAgMC00Mi42NjY2NjctNDIuNjY2NjY3eiBtLTEyOCAxMjhhNDIuNjY2NjY3IDQyLjY2NjY2NyAwIDAgMSA0Mi42NjY2NjcgNDIuNjY2NjY3djI1NmE0Mi42NjY2NjcgNDIuNjY2NjY3IDAgMCAxLTQyLjY2NjY2NyA0Mi42NjY2NjdIMzg0YTQyLjY2NjY2NyA0Mi42NjY2NjcgMCAwIDEtNDIuNjY2NjY3LTQyLjY2NjY2N1YzODRhNDIuNjY2NjY3IDQyLjY2NjY2NyAwIDAgMSA0Mi42NjY2NjctNDIuNjY2NjY3aDI1NnogbS00Mi42NjY2NjcgODUuMzMzMzM0aC0xNzAuNjY2NjY2djE3MC42NjY2NjZoMTcwLjY2NjY2NnYtMTcwLjY2NjY2NnoiDQogICAgICAgIGZpbGw9IiMxMjk2ZGIiIHAtaWQ9IjIzNDAiPjwvcGF0aD4NCjwvc3ZnPg==',
          className: 'node-special'
        }
      ])
    },
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
        case 'api': {
          this.lf.render(demoData)
          break
        }
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
          this.dataVisible = true
          this.graphData = data
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
  background: url('./imgs/选区域.svg') no-repeat;
  background-size: cover;
  cursor: pointer;
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
<style lang="scss">
.lf-control {
  display: none !important;
}
.lf-dnd-shape {
  background-size: contain;
}
.vjs-tree.is-root {
      height: 500px;
    overflow: auto;
}
</style>
