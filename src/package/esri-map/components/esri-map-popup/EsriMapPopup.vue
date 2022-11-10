<!-- 此组件依赖于esrimap组件 -->
<template>
  <div :style="{ display: visible ? 'block' : 'none' }">
    <slot />
  </div>
</template>

<script>
export default {
  name: "EsriMapPopup",
  props: {
    mapPoint: {
      type: Object,
      default: null,
    },
    custom: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      esriMap: {},
      visible: false,
    };
  },
  watch: {
    mapPoint(newVal, oldVal) {
      if (JSON.stringify(newVal) === "{}" || newVal === null) {
        this.hide();
      } else {
        this.show();
      }
    },
    custom(newVal, oldVal) {
      if (newVal === true) {
        if (this.$parent.$el.className.indexOf(" my_custom-popup") > 0) {
        } else {
          this.$parent.$el.className += " my_custom-popup";
        }
      } else {
        this.$parent.$el.className = this.$parent.$el.className.replace(
          " my_custom-popup",
          ""
        );
      }
    },
  },
  methods: {
    initPopup(map) {
      this.$nextTick(() => {
        // 获取map
        this.map = map.map;
        // 获取view
        this.view = map.view;
        //获取父组件的this
        this.esriMap = map;
        // 隐藏默认动作
        this.view.popup.actions = [];
        if (this.noMapPoint) {
          // 坐标值判断，无值隐藏
          this.hide();
        } else {
          // 坐标值判断，有值隐藏
          this.show();
        }
      });
    },
    noMapPoint() {
      return JSON.stringify(this.mapPoint) === "{}" || this.mapPoint === null;
    },
    show() {
      this.view.popup.location = this.mapPoint;
      this.view.popup.content = this.$el;
      this.view.popup.visible = true;
      this.esriMap.addPopupPoint(this.mapPoint);
      this.visible = true;
    },
    hide() {
      // 将组件元素添加至popup
      this.view.popup.visible = false;
      this.esriMap.addPopupPoint();
      this.visible = false;
    },
  },
  mounted() {
    if (this.$parent.$options.name !== "EsriMap") {
      // 验证是否为EsriMap子组件
      console.error(`${this.$options.name}应作为EsriMap的子组件`);
    } else {
      // 添加my_custom-popup类名，移除系统popup样式
      if (this.custom === true) {
        this.$parent.$el.className += " my_custom-popup";
      }
      if (this.$parent.hasLoaded) {
        // 已加载完毕则直接初始化
        this.initPopup(this.$parent);
      } else {
        // 否则监听加载完成事件
        this.$parent.$on("loaded", this.initPopup);
      }
    }
  },
};
</script>
<style>
.my_custom-popup .esri-popup__main-container {
  width: auto !important;
  height: auto !important;
  max-height: none !important;
}
.my_custom-popup .esri-popup__header {
  display: none !important;
}
.my_custom-popup .esri-popup__content {
  overflow: hidden;
  padding: 0;
  margin: 0;
}
.my_custom-popup .esri-popup__main-container {
  background: transparent;
}
.my_custom-popup .esri-popup--shadow {
  box-shadow: none;
}
</style>
