<template>
  <div class="poster-container">
    <el-tabs v-model="tabLeft" class="poster-layer">
      <el-tab-pane label="图层" name="layer">
        <draggable v-model="posterForm.items" handle=".el-icon-rank">
          <transition-group>
            <div
              class="poster-layer-item"
              :class="{ active: item.active }"
              v-for="(item, i) in posterForm.items"
              :key="item.uuid"
              @click="activeItem(item)"
            >
              <div class="layer-name">
                <i :class="['iconfont', `icon-${item.t}`]"></i>
                <span>{{ item.name }}</span>
              </div>
              <div class="layer-btns">
                <i class="el-icon-rank"></i>
                <i class="el-icon-delete-solid" @click.stop="delItem(i)"></i>
              </div>
            </div>
          </transition-group>
        </draggable>
        <el-empty
          v-show="!posterForm.items.length"
          description="暂无图层"
          :image-size="100"
        />
      </el-tab-pane>
    </el-tabs>
    <div class="poster-main">
      <div class="poster-tool">
        <div
          class="tool-item"
          v-for="(item, i) in toolList"
          :key="i"
          @click="addItem(item)"
        >
          <el-tooltip effect="dark" :content="item.text" placement="bottom">
            <i :class="['iconfont', item.icon]"></i>
          </el-tooltip>
        </div>
        <div class="tool-item" @click="preview">
          <el-tooltip effect="dark" content="预览" placement="bottom">
            <i class="iconfont icon-preview"></i>
          </el-tooltip>
        </div>
        <div class="tool-item" @click="download">
          <el-tooltip effect="dark" content="下载" placement="bottom">
            <i class="iconfont icon-download"></i>
          </el-tooltip>
        </div>
        <div class="tool-item">
          <i class="el-icon-minus" @click="scaleChange(-0.05)"></i>
          <p class="scale">{{ (posterForm.scale * 100).toFixed(0) }}%</p>
          <i class="el-icon-plus" @click="scaleChange(0.05)"></i>
        </div>
      </div>

      <div class="main" ref="main">
        <div class="canvas" id="canvas" :style="canvasStyle">
          <img
            v-if="posterForm.bgUrl"
            class="bg-img"
            :src="posterForm.bgUrl"
            crossorigin="anonymous"
          />
          <vdr
            class="layer-item"
            v-for="item in [...posterForm.items].reverse()"
            :key="`${item.uuid}${posterForm.scale}`"
            parent
            :parent-width="posterForm.width * posterForm.scale"
            :parent-height="posterForm.height * posterForm.scale"
            :w="item.w * posterForm.scale"
            :h="item.h * posterForm.scale"
            :x="item.x * posterForm.scale"
            :y="item.y * posterForm.scale"
            :min-width="10"
            :min-height="10"
            @activated="activeItem(item)"
            @resizing="
              (x, y, width, height) => resize(item, x, y, width, height)
            "
            @dragging="(x, y) => drag(item, x, y)"
          >
            <p
              v-if="['text'].includes(item.t)"
              class="canvas-text"
              :style="textStyle(item)"
            >
              {{ item.v }}
            </p>
            <div
              v-if="item.t === 'qrcode'"
              class="canvas-qrcode"
              :ref="item.uuid"
            />
            <template v-if="['image', 'logo'].includes(item.t)">
              <img class="canvas-image" :src="item.v" crossorigin="anonymous" />
            </template>
            <img
              v-if="item.t === 'avatar'"
              class="canvas-avatar"
              :src="item.v"
              crossorigin="anonymous"
            />
          </vdr>
        </div>
      </div>
    </div>
    <el-tabs v-model="tabRight" class="poster-setting">
      <el-tab-pane label="属性设置" name="attr">
        <el-form :model="attrForm" size="mini" label-width="80px">
          <el-divider content-position="left">位置大小</el-divider>
          <el-form-item label="x">
            <el-input-number
              v-model="attrForm.x"
              controls-position="right"
              size="mini"
            ></el-input-number>
          </el-form-item>
          <el-form-item label="y">
            <el-input-number
              v-model="attrForm.y"
              controls-position="right"
              size="mini"
            ></el-input-number>
          </el-form-item>
          <el-form-item label="宽度">
            <el-input-number
              v-model="attrForm.w"
              controls-position="right"
              size="mini"
            ></el-input-number>
          </el-form-item>
          <el-form-item label="高度">
            <el-input-number
              v-model="attrForm.h"
              controls-position="right"
              size="mini"
            ></el-input-number>
          </el-form-item>
          <template v-if="['text','qrcode'].includes(attrForm.t)">
            <el-divider content-position="left">颜色</el-divider>
            <el-form-item label="颜色">
              <el-color-picker
                v-model="attrForm.c"
                @change="updateqrCode"
              ></el-color-picker>
            </el-form-item>
          </template>

          <template v-if="['text'].includes(attrForm.t)">
            <el-divider content-position="left">字体</el-divider>
            <el-form-item label="大小">
              <el-slider v-model="attrForm.s" :min="12"></el-slider>
            </el-form-item>
          </template>

          <template v-if="['image', 'avatar'].includes(attrForm.t)">
            <el-divider content-position="left">图片</el-divider>
            <el-form-item label="图片">
              <el-upload
                class="upload-btn"
                action="/"
                accept="image/*"
                :show-file-list="false"
                :http-request="uploadImage"
              >
                <el-button size="mini" type="primary">上传</el-button>
              </el-upload>
              <el-button size="mini" type="primary" @click="attrForm.v = ''"
                >删除</el-button
              >
            </el-form-item>
          </template>

          <el-divider content-position="left">参数</el-divider>
          <el-form-item label="名称">
            <el-input v-model="attrForm.name"></el-input>
          </el-form-item>
          <el-form-item label="静态参数">
            <el-input
              v-model="attrForm.v"
              @input="updateqrCode"
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 4 }"
            ></el-input>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="海报设置" name="poster">
        <el-form :model="posterForm" size="mini" label-width="60px">
          <el-divider content-position="left">基本信息</el-divider>
          <el-form-item label="名称">
            <el-input v-model="posterForm.name"></el-input>
          </el-form-item>
          <el-form-item label="格式">
            <el-radio-group v-model="posterForm.type">
              <el-radio label="png"></el-radio>
              <el-radio label="jpg"></el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="质量" v-if="posterForm.type === 'jpg'">
            <el-slider v-model="posterForm.quality" :min="30"></el-slider>
          </el-form-item>

          <el-divider content-position="left">海报尺寸</el-divider>
          <el-form-item>
            <el-dropdown @command="sizeChange">
              <el-button type="primary" size="mini">
                常用尺寸<i class="el-icon-arrow-down el-icon--right"></i>
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item
                  v-for="(size, i) in sizeList"
                  :key="i"
                  :command="size"
                  >{{ size.w }}×{{ size.h }}</el-dropdown-item
                >
              </el-dropdown-menu>
            </el-dropdown>
          </el-form-item>

          <el-form-item label="宽度">
            <el-input-number
              v-model="posterForm.width"
              controls-position="right"
              size="mini"
              :min="100"
            ></el-input-number>
          </el-form-item>
          <el-form-item label="高度">
            <el-input-number
              v-model="posterForm.height"
              controls-position="right"
              size="mini"
              :min="100"
            ></el-input-number>
          </el-form-item>

          <el-divider content-position="left">背景</el-divider>
          <el-form-item label="背景色">
            <el-color-picker v-model="posterForm.bgc"></el-color-picker>
          </el-form-item>
          <el-form-item label="背景图">
            <el-upload
              class="upload-btn"
              action="/"
              accept="image/*"
              :show-file-list="false"
              :http-request="uploadBgUrl"
            >
              <el-button size="mini" type="primary">上传</el-button>
            </el-upload>
            <el-button size="mini" type="primary" @click="posterForm.bgUrl = ''"
              >删除背景图</el-button
            >
          </el-form-item>
          <el-form-item label="背景图地址">
            <el-input
              v-model="posterForm.bgUrl"
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 4 }"
            ></el-input>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>

    <el-image
      ref="imgPreview"
      class="img-preview"
      :src="imgPreviewUrl"
      :preview-src-list="[imgPreviewUrl]"
    >
    </el-image>
  </div>
</template>
<script>
import html2canvas from 'html2canvas'
import QRCode from 'qrcodejs2'
import draggable from 'vuedraggable'
import vdr from 'vue-draggable-resizable-gorkys'
import 'vue-draggable-resizable-gorkys/dist/VueDraggableResizable.css'
import { getConfig } from './config'
export default {
  components: {
    draggable,
    vdr,
  },
  computed: {
    canvasStyle() {
      let { width, height, scale, bgc } = this.posterForm
      let { left, top } = this.position
      return {
        width: `${width * scale}px`,
        height: `${height * scale}px`,
        'background-color': bgc || '#fff',
        transform: `translate(${left}px, ${top}px)`,
      }
    },
    textStyle() {
      return (item) => {
        let { scale } = this.posterForm
        let { c, s } = item
        return {
          'font-size': `${s * scale}px`,
          color: c || 'inherit',
        }
      }
    },
  },
  data() {
    return {
      tabLeft: 'layer',
      position: {
        left: 0,
        top: 0,
      },
      toolList: [
        { icon: 'icon-text', text: '文本', type: 'text' },
        { icon: 'icon-qrcode', text: '二维码', type: 'qrcode' },
        { icon: 'icon-avatar', text: '头像', type: 'avatar' },
        { icon: 'icon-image', text: '图片', type: 'image' },
      ],

      tabRight: 'poster',
      attrForm: {},
      posterForm: {
        name: '未命名',
        type: 'jpg',
        quality: 80,
        width: 640,
        height: 1008,
        scale: 1,
        bgc: null,
        bgUrl: null,
        items: [],
      },
      sizeList: [
        { w: 640, h: 1008 },
        { w: 720, h: 1280 },
      ],
      imgPreviewUrl: '',
    }
  },
  created() {},
  mounted() {
    let el = this.$refs.main
    el.onmousedown = ({ clientX, clientY, path }) => {
      let parentClass = path.map((e) => e.className).filter((e) => e)
      if (!parentClass.some((e) => e.includes('layer-item'))) {
        let { left, top } = this.position
        document.onmousemove = (e) => {
          this.position = {
            left: e.clientX - clientX + left,
            top: e.clientY - clientY + top,
          }
        }
      }
      document.onmouseup = () => {
        document.onmousemove = document.onmouseup = null
      }
    }
    el.onmousewheel = ({ deltaY }) => {
      this.position.top -= deltaY
    }
  },
  methods: {
    async addItem(item) {
      let config = getConfig(item.type)
      let _item = { ...config, active: true }
      this.posterForm.items.map((e) => (e.active = false))
      this.posterForm.items.unshift(_item)
      this.attrForm = _item
      this.tabRight = 'attr'
      if (item.type === 'qrcode') {
        this.getQrcode(_item)
      }
    },
    async preview() {
      let url = await this.getImgUrl()
      this.imgPreviewUrl = url
      setTimeout(() => {
        this.$refs.imgPreview.$el
          .getElementsByClassName('el-image__preview')[0]
          .click()
      }, 10)
    },
    async download() {
      let url = await this.getImgUrl()
      let link = document.createElement('a')
      link.href = url
      link.download = `${this.posterForm.name}.${this.posterForm.type}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
    delItem(i) {
      this.posterForm.items.splice(i, 1)
      this.attrForm = {}
      this.tabRight = 'poster'
    },
    activeItem(item) {
      this.tabRight = 'attr'
      this.posterForm.items.map((e) => (e.active = false))
      item.active = true
      this.attrForm = item
    },
    resize(item, x, y, width, height) {
      let { scale } = this.posterForm
      item.w = this.numInt(width / scale)
      item.h = this.numInt(height / scale)
      item.y = this.numInt(x / scale)
      item.x = this.numInt(y / scale)
    },
    drag(item, x, y) {
      let { scale } = this.posterForm
      item.y = this.numInt(y / scale)
      item.x = this.numInt(x / scale)
    },
    numInt(val, n = 0) {
      return parseInt(val.toFixed(n))
    },
    getQrcode(item) {
      this.$nextTick(() => {
        new QRCode(this.$refs[item.uuid][0], {
          text: item.v,
          width: item.w,
          height: item.h,
          colorDark: item.c,
          colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.H,
        })
      })
    },
    updateqrCode() {
      let { t, uuid, c, v, w, h } = this.attrForm
      if (t === 'qrcode') {
        this.$refs[uuid][0].innerHTML = ''
        this.getQrcode({ uuid, c, v, w, h })
      }
    },
    sizeChange(size) {
      this.posterForm.width = size.w
      this.posterForm.height = size.h
    },
    scaleChange(val) {
      let { scale } = this.posterForm
      if ((val > 0 && scale < 2) || (val < 0 && scale > 0.25)) {
        scale = +(scale + val).toFixed(2)
      }
      this.posterForm.scale = scale
    },
    upload(file) {
      // return window.URL.createObjectURL(file)
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => resolve(reader.result)
        reader.onerror = () => resolve('')
      })
    },
    async uploadImage({ file }) {
      let url = await this.upload(file)
      if (url) {
        this.attrForm.v = url
      }
    },
    async uploadBgUrl({ file }) {
      let url = await this.upload(file)
      if (url) {
        this.posterForm.bgUrl = url
      }
    },
    getImgUrl() {
      return new Promise((resolve) => {
        console.log('开始获取海报图片URL')
        let dom = document.getElementById('canvas')
        let y =
          window.pageYOffset ||
          document.documentElement.scrollTop ||
          document.body.scrollTop ||
          0
        document.body.style.position = 'fixed'
        document.body.style.top = `-${y}px`
        console.log(dom)
        html2canvas(dom, {
          allowTaint: true,
          useCORS: true,
        })
          .then((canvas) => {
            console.log('转化成功')
            console.log(canvas)
            let { type, quality } = this.posterForm
            let dataURL =
              type === 'png'
                ? canvas.toDataURL(`image/png`)
                : canvas.toDataURL(`image/jpeg`, quality / 100)
            console.log(dataURL)
            resolve(dataURL)
          })
          .catch(() => {
            console.log('转化失败')
            resolve(null)
          })
        document.body.style.position = ''
        document.body.style.top = ``
        window.scrollTo(0, y)
      })
    },
  },
}
</script>
