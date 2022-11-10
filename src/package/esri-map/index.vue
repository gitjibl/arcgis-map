<!--
 * @Descripttion: 
 * @Author: jibl
 * @Date: 2022-11-03 15:17:43
 * @LastEditors: jibl
 * @LastEditTime: 2022-11-10 12:00:23
-->
<!--  -->
<template>
  <div :id="'esriMap' + mapId" class="esri-map">
    <div v-if="$slots.popup">
      <slot name="popup"></slot>
    </div>

    <div class="toolsbarControl" v-show="mapConfig.toolsbar.enabled">
      <!-- <div class="tools" v-on:click="toolsClick"></div> -->

      <!-- <el-collapse-transition> -->
      <div v-if="collapse" class="toolsbarDiv">
        <ul>
          <li v-on:click="zoomOutClick" v-show="mapConfig.toolsbar.zoomOut">
            <el-tooltip content="放大" placement="left" effect="light">
              <div id="zoomOut" />
            </el-tooltip>
          </li>

          <li v-on:click="zoomInClick" v-show="mapConfig.toolsbar.zoomIn">
            <el-tooltip content="缩小" placement="left" effect="light">
              <div id="zoomIn" />
            </el-tooltip>
          </li>

          <li v-on:click="dragClick" v-show="mapConfig.toolsbar.drag">
            <el-tooltip content="拖拽" placement="left" effect="light">
              <div id="drag" />
            </el-tooltip>
          </li>

          <li v-on:click="resetClick" v-show="mapConfig.toolsbar.reset">
            <el-tooltip content="复位" placement="left" effect="light">
              <div id="reset" />
            </el-tooltip>
          </li>

          <li v-on:click="cleanClick" v-show="mapConfig.toolsbar.clean">
            <el-tooltip content="清除" placement="left" effect="light">
              <div id="clean" />
            </el-tooltip>
          </li>

          <li v-on:click="measurePolyline" v-show="mapConfig.toolsbar.polyline">
            <el-tooltip content="测距" placement="left" effect="light">
              <div id="polyline" />
            </el-tooltip>
          </li>

          <li v-on:click="measurePolygon" v-show="mapConfig.toolsbar.polygon">
            <el-tooltip content="测面" placement="left" effect="light">
              <div id="polygon" />
            </el-tooltip>
          </li>

          <li
            v-on:click="legendClick"
            v-popover:legendPopover
            v-show="mapConfig.toolsbar.legend"
          >
            <el-tooltip content="图例" placement="left" effect="light">
              <div id="legend" />
            </el-tooltip>
          </li>

          <li
            v-on:click="layersClick"
            v-popover:layersPopover
            v-show="mapConfig.toolsbar.layers"
          >
            <el-tooltip content="图层" placement="left" effect="light">
              <div id="layers" />
            </el-tooltip>
          </li>
        </ul>
      </div>
      <!-- </el-collapse-transition> -->

      <el-popover
        ref="legendPopover"
        placement="left"
        title="图例"
        width="200"
        trigger="manual"
        v-model="openLegend"
      >
        <ul :key="index" v-for="(item, index) in mapConfig.LegendList">
          <li>
            <img
              :src="item.url"
              style="
                float: left;
                margin-left: 10px;
                margin-right: 10px;
                width: 18px;
                height:18px
              "
            />
            {{ item.name }}
          </li>
        </ul>
      </el-popover>

      <el-popover
        ref="layersPopover"
        placement="left"
        title="图层"
        width="200"
        trigger="manual"
        v-model="openLayers"
      >
        <el-divider content-position="left">基本图层</el-divider>
        <el-checkbox-group v-model="basevVsibleLayersArr">
          <div
            :key="base.id"
            v-for="base in mapConfig.BaseMapLayers"
            style="margin-left: 10px"
          >
            <el-checkbox :label="base.id" @change="layerChange(base.id)">{{
              base.title
            }}</el-checkbox>
          </div>
        </el-checkbox-group>
        <el-divider content-position="left">用户图层</el-divider>
        <el-checkbox-group v-model="customVisibleLayersArr">
          <div
            :key="custom.id"
            v-for="custom in mapConfig.CustomerLayers"
            style="margin-left: 10px"
          >
            <el-checkbox :label="custom.id" @change="layerChange(custom.id)">{{
              custom.title
            }}</el-checkbox>
          </div>
        </el-checkbox-group>
      </el-popover>
    </div>
  </div>
</template>

<script>
import { loadModules } from "esri-loader";
import { measurePolyline, measurePolygon } from "./index";
let index = 0;
export default {
  name: "EsriMap",
  data() {
    return {
      mapId: index++,
      // 地图类
      map: {},
      // 地图视图
      view: {},
      // 工具栏展开
      collapse: true,
      // 加载完成
      hasLoaded: false,
      //点击样式
      backgroundColorTools: {
        //拖拽
        drag: true,
      },
      //图例
      openLegend: false,
      //图层
      openLayers: false,
      //基本图层
      basevVsibleLayersArr: [],
      //用户图层
      customVisibleLayersArr: [],
    };
  },
  created() {},
  props: {
    mapConfig: {
      type: Object,
      required: true,
    },
    esriOptions: {
      type: Object,
      default: () => {
        return {
          url: "https://js.arcgis.com/4.6/",
          css: "https://js.arcgis.com/4.6/esri/css/main.css",
        };
      },
    },
    onLoaded: {
      type: Function,
    },
  },
  mounted() {
    document.getElementById("drag").style.backgroundColor =
      "rgb(132, 186, 236)";
    this.initMap();
    this.mapConfig.CustomerLayers.forEach((item) => {
      if (item.visible) {
        this.customVisibleLayersArr.push(item.id);
      }
    });
    this.mapConfig.BaseMapLayers.forEach((item) => {
      if (item.visible) {
        this.baseVisibleLayersArr.push(item.id);
      }
    });
  },
  watch: {
    backgroundColorTools: {
      handler(now, old) {
        let drag = document.getElementById("drag");
        if (drag) {
          if (now.drag) {
            drag.style.backgroundColor = "rgb(132, 186, 236)";
          } else {
            drag.style.backgroundColor = "#fff";
          }
        }
      },
      immediate: true,
      deep: true,
    },
  },
  components: {},
  methods: {
    initMap() {
      let _this = this;
      loadModules(
        [
          "dojo/_base/lang",
          "dojo/_base/url",
          "dojo/string",
          "esri/config",
          "esri/request",
          "esri/Map",
          "esri/Basemap",
          "esri/Ground",
          "esri/Color",
          "esri/core/urlUtils",
          "esri/geometry/Point",
          "esri/geometry/Extent",
          "esri/geometry/SpatialReference",
          "esri/views/MapView",
          "esri/views/SceneView",
          "esri/layers/ElevationLayer",
          "esri/layers/GraphicsLayer",
          "esri/layers/FeatureLayer",
          "esri/layers/SceneLayer",
          "esri/layers/TileLayer",
          "esri/layers/WMSLayer",
          "esri/layers/WMTSLayer",
          "esri/layers/WebTileLayer",
          "esri/layers/BaseTileLayer",
          "esri/layers/MapImageLayer",
          "esri/layers/GroupLayer",
          "esri/layers/support/TileInfo",
          "esri/layers/support/LOD",
          "esri/layers/KMLLayer",
          "esri/widgets/Print",
          "esri/core/JSONSupport",
          "dojo/domReady!",
        ],
        this.esriOptions
      ).then(
        ([
          lang,
          url,
          string,
          esriConfig,
          esriRequest,
          Map,
          Basemap,
          Ground,
          Color,
          urlUtils,
          Point,
          Extent,
          SpatialReference,
          MapView,
          SceneView,
          ElevationLayer,
          GraphicsLayer,
          FeatureLayer,
          SceneLayer,
          TileLayer,
          WMSLayer,
          WMTSLayer,
          WebTileLayer,
          BaseTileLayer,
          MapImageLayer,
          GroupLayer,
          TileInfo,
          LOD,
          KMLLayer,
          Print,
          JSONSupport,
        ]) => {
          let map = new Map();

          let mapConfig = _this.mapConfig;
          var view = new MapView({
            container: "esriMap" + this.mapId,
            map: map,
            zoom: mapConfig.zoom,
            //边界框的最小和最大X和Y坐标。范围用于描述地图视图的可见部分
            extent: new Extent({
              xmin: mapConfig.extent.xmin,
              xmax: mapConfig.extent.xmax,
              ymin: mapConfig.extent.ymin,
              ymax: mapConfig.extent.ymax,
              spatialReference: new SpatialReference({
                wkid: mapConfig.extent.wkid,
              }),
            }),
            //指定可以应用于地图视图的缩放和旋转约束
            constraints: mapConfig.constraints,
            center: mapConfig.center,
          });

          // var TileLayer = TileLayer({
          //   url: "https://map.geoq.cn/arcgis/rest/services/ChinaOnlineStreetWarm/MapServer",
          //   id: "6666",
          // });

          // map.layers.add(TileLayer);
          this.map = map;
          this.view = view;
          initBaseMap();
          initCustomerLayers();
          this.hasLoaded = true;
          //隐藏放大缩小
          setTimeout(function () {
            let ui = document.querySelector(".esri-ui");
            if (ui != null) {
              ui.style.display = "none";
            }
          }, 0);

          //拖拽
          this.view.on("drag", (event) => {
            if (!this.backgroundColorTools.drag) {
              event.stopPropagation();
            }
          });

          //地图加载完成
          this.$emit("loaded", _this);

          /**
           * 初始化基本图层
           */
          function initBaseMap() {
            const config = _this.mapConfig;
            var baseLayerArray = [];
            if (!!config.BaseMapLayers && config.BaseMapLayers.length > 0) {
              for (var i = 0; i < config.BaseMapLayers.length; i++) {
                var baselayer = config.BaseMapLayers[i];
                var layer = createLayer(baselayer);
                if (!!layer) {
                  baseLayerArray.push(layer);
                }
              }
            }
            _this.map.addMany(baseLayerArray);
          }

          /**
           * 初始化用户图层
           */
          function initCustomerLayers() {
            const config = _this.mapConfig;
            var customerLayersArray = [];
            if (!!config.CustomerLayers && config.CustomerLayers.length > 0) {
              for (var i = 0; i < config.CustomerLayers.length; i++) {
                var customerLayer = config.CustomerLayers[i];
                var layer = createLayer(customerLayer);
                if (!!layer) {
                  customerLayersArray.push(layer);
                }
              }
            }
            _this.map.addMany(customerLayersArray);
          }

          /**
           * 创建图层
           * @param param 图层配置信息
           */
          function createLayer(param) {
            var layer = null;
            switch (param.layerType) {
              case "KMLLayer":
                layer = new KMLLayer({
                  id: param.id,
                  title: param.title,
                  url: param.restURL,
                  visible: param.visible,
                  ...param.options,
                });
                break;
              case "ElevationLayer":
                layer = new ElevationLayer({
                  id: param.id,
                  title: param.title,
                  url: param.restURL,
                  visible: param.visible,
                  ...param.options,
                });
                break;
              case "FeatureLayer":
                layer = new FeatureLayer({
                  id: param.id,
                  title: param.title,
                  url: param.restURL,
                  visible: param.visible,
                  ...param.options,
                });
                break;
              case "GraphicsLayer":
                layer = new GraphicsLayer({
                  id: param.id,
                  title: param.title,
                  url: param.restURL,
                  visible: param.visible,
                  ...param.options,
                });
                break;
              case "MapImageLayer":
                layer = new MapImageLayer({
                  id: param.id,
                  title: param.title,
                  url: param.restURL,
                  visible: param.visible,
                  ...param.options,
                });
                break;
              case "GroupLayer":
                if (param.subLayers && param.subLayers.length > 0) {
                  layer = new GroupLayer({
                    visibilityMode: "independent",
                  });
                  param.subLayers.forEach((paramElement) => {
                    layer.add(createLayer(paramElement));
                  });
                }
                break;
              case "SceneLayer":
                layer = new SceneLayer({
                  id: param.id,
                  title: param.title,
                  url: param.restURL,
                  visible: param.visible,
                  ...param.options,
                });
                break;
              case "TileLayer":
                layer = new TileLayer({
                  id: param.id,
                  title: param.title,
                  url: param.restURL,
                  visible: param.visible,
                  ...param.options,
                });
                break;
              case "WMSLayer":
                layer = new WMSLayer({
                  id: param.id,
                  title: param.title,
                  url: param.restURL,
                  visible: param.visible,
                  ...param.options,
                });
                break;
              case "WMTSLayer":
                layer = new WMTSLayer({
                  id: param.id,
                  title: param.title,
                  url: param.restURL,
                  visible: param.visible,
                  ...param.options,
                });
                break;
              case "WebTileLayer":
                layer = new WebTileLayer({
                  id: param.id,
                  title: param.title,
                  urlTemplate: param.restURL,
                  visible: param.visible,
                  ...param.options,
                });
                break;
              case "GoogleMapTileLayer":
                createGoogleMapTileLayer(
                  esriConfig,
                  esriRequest,
                  Color,
                  BaseTileLayer,
                  function (GoogleMapLayer) {
                    layer = new GoogleMapLayer({
                      id: param.id,
                      title: param.title,
                      urlTemplate: param.restURL,
                      visible: param.visible,
                      ...param.options,
                    });
                  }
                );

                break;
              case "TiandituWMTSLayer":
                createTiandituWMTSLayer(
                  esriConfig,
                  lang,
                  url,
                  string,
                  Extent,
                  TileInfo,
                  LOD,
                  SpatialReference,
                  Point,
                  WebTileLayer,
                  BaseTileLayer,
                  Color,
                  esriRequest,
                  urlUtils,
                  JSONSupport,
                  function (TianDiTuLayer) {
                    layer = new TianDiTuLayer({
                      id: param.id,
                      title: param.title,
                      visible: param.visible,
                      urlTemplate: param.restURL,
                      copyright: "",
                    });
                  }
                );
                break;
            }
            return layer;
          }

          function createGoogleMapTileLayer(
            esriConfig,
            esriRequest,
            Color,
            BaseTileLayer,
            callback
          ) {
            if (!esriConfig.request.corsEnabledServers["www.google.cn"]) {
              esriConfig.request.corsEnabledServers.push("www.google.cn");
            }

            var googleMap = BaseTileLayer.createSubclass({
              properties: {
                urlTemplate:
                  "http://{subDomain}.tianditu.com/img_c/wmts?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile&LAYER=img&STYLE=default&FORMAT=tiles&TILEMATRIXSET=c&TILEMATRIX={level}&TILEROW={row}&TILECOL={col}",
                tint: {
                  value: null,
                  type: Color,
                },
              },

              // generate the tile url for a given level, row and column
              getTileUrl: function (level, row, col) {
                return this.urlTemplate
                  .replace("{z}", level)
                  .replace("{x}", col)
                  .replace("{y}", row);
              },

              // This method fetches tiles for the specified level and size.
              // Override this method to process the data returned from the server.
              fetchTile: function (level, row, col) {
                // call getTileUrl() method to construct the URL to tiles
                // for a given level, row and col provided by the LayerView
                var url = this.getTileUrl(level, row, col);

                // request for tiles based on the generated url
                // set allowImageDataAccess to true to allow
                // cross-domain access to create WebGL textures for 3D.
                return esriRequest(url, {
                  responseType: "image",
                  allowImageDataAccess: true,
                }).then(
                  function (response) {
                    // when esri request resolves successfully
                    // get the image from the response
                    var image = response.data;
                    var width = this.tileInfo.size[0];
                    var height = this.tileInfo.size[0];

                    // create a canvas with 2D rendering context
                    var canvas = document.createElement("canvas");
                    var context = canvas.getContext("2d");
                    canvas.width = width;
                    canvas.height = height;

                    // Draw the blended image onto the canvas.
                    context.drawImage(image, 0, 0, width, height);

                    return canvas;
                  }.bind(this)
                );
              },
            });

            //回调构造GoogleMapLayer
            if (typeof callback === "function") {
              callback(googleMap);
            }
          }

          function createTiandituWMTSLayer(
            esriConfig,
            lang,
            url,
            string,
            Extent,
            TileInfo,
            LOD,
            SpatialReference,
            Point,
            WebTileLayer,
            BaseTileLayer,
            Color,
            esriRequest,
            urlUtils,
            JSONSupport,
            callback
          ) {
            // Create ogc.WMTSLayer custom layer
            var tianditu = WebTileLayer.createSubclass([JSONSupport], {
              declaredClass: "TiandituWMTSLayer",
              normalizeCtorArgs: function (b, c) {
                return "string" === typeof b
                  ? lang.mixin({ urlTemplate: b }, c || {})
                  : b;
              },
              getDefaults: function (b) {
                var sp = new SpatialReference({
                  wkid: mapConfig.extent.wkid,
                });
                var c = new Extent(-180, -90, 180, 90, sp);
                return lang.mixin({
                  fullExtent: c,
                  tileInfo: new TileInfo({
                    rows: 256,
                    cols: 256,
                    dpi: 90.71428571428571,
                    format: "PNG8",
                    compressionQuality: 0,
                    origin: new Point({ x: -180, y: 90, spatialReference: sp }),
                    spatialReference: sp,
                    lods: [
                      {
                        level: 1,
                        levelValue: 1,
                        resolution: 0.7039130078555585,
                        scale: 2.95828763796e8,
                      },
                      {
                        level: 2,
                        levelValue: 2,
                        resolution: 0.35156249999999994,
                        scale: 1.47914381898e8,
                      },
                      {
                        level: 3,
                        levelValue: 3,
                        resolution: 0.17578124999999997,
                        scale: 7.39571909489e7,
                      },
                      {
                        level: 4,
                        levelValue: 4,
                        resolution: 0.08789062500000014,
                        scale: 3.69785954745e7,
                      },
                      {
                        level: 5,
                        levelValue: 5,
                        resolution: 0.04394531250000007,
                        scale: 1.84892977372e7,
                      },
                      {
                        level: 6,
                        levelValue: 6,
                        resolution: 0.021972656250000007,
                        scale: 9244648.86862,
                      },
                      {
                        level: 7,
                        levelValue: 7,
                        resolution: 0.01098632812500002,
                        scale: 4622324.43431,
                      },
                      {
                        level: 8,
                        levelValue: 8,
                        resolution: 0.00549316406250001,
                        scale: 2311162.21716,
                      },
                      {
                        level: 9,
                        levelValue: 9,
                        resolution: 0.0027465820312500017,
                        scale: 1155581.10858,
                      },
                      {
                        level: 10,
                        levelValue: 10,
                        resolution: 0.0013732910156250009,
                        scale: 577790.554289,
                      },
                      {
                        level: 11,
                        levelValue: 11,
                        resolution: 0.000686645507812499,
                        scale: 288895.277144,
                      },
                      {
                        level: 12,
                        levelValue: 12,
                        resolution: 0.0003433227539062495,
                        scale: 144447.638572,
                      },
                      {
                        level: 13,
                        levelValue: 13,
                        resolution: 0.00017166137695312503,
                        scale: 72223.819286,
                      },
                      {
                        level: 14,
                        levelValue: 14,
                        resolution: 0.00008583068847656251,
                        scale: 36111.909643,
                      },
                      {
                        level: 15,
                        levelValue: 15,
                        resolution: 0.000042915344238281406,
                        scale: 18055.954822,
                      },
                      {
                        level: 16,
                        levelValue: 16,
                        resolution: 0.000021457672119140645,
                        scale: 9027.977411,
                      },
                      {
                        level: 17,
                        levelValue: 17,
                        resolution: 0.000010728836059570307,
                        scale: 4513.9887055,
                      },
                      {
                        level: 18,
                        levelValue: 18,
                        resolution: 0.000005364418029785169,
                        scale: 2256.99435275,
                      },
                    ],
                  }),
                });
              },
              properties: {
                copyright: "",
                legendEnabled: {
                  json: {
                    readFrom: ["showLegend"],
                    read: function (b, c) {
                      return null != c.showLegend ? c.showLegend : !0;
                    },
                  },
                },
                levelValues: {
                  dependsOn: ["tileInfo"],
                  get: function () {
                    var b = [];
                    if (!this.tileInfo) return null;
                    this.tileInfo.lods.forEach(function (c) {
                      b[c.level] = c.levelValue || c.level;
                    }, this);
                    return b;
                  },
                },
                popupEnabled: {
                  json: {
                    readFrom: ["disablePopup"],
                    read: function (b, c) {
                      return null != c.disablePopup ? !c.disablePopup : !0;
                    },
                  },
                },
                spatialReference: new SpatialReference({
                  wkid: mapConfig.extent.wkid,
                }),
                subDomains: null,
                tileServers: {
                  value: null,
                  dependsOn: ["urlTemplate", "subDomains", "urlPath"],

                  get: function () {
                    var b = new url(this.urlTemplate),
                      c = b.scheme ? b.scheme + "://" : "//",
                      a = c + b.authority + "/",
                      e = this.subDomains,
                      d,
                      f = [];
                    -1 === b.authority.indexOf("{subDomain}") && f.push(a);
                    // e && (0 < e.length && 1 < b.authority.split(".").length) && e.forEach(function (a, e) {
                    //     -1 < b.authority.indexOf("{subDomain}") && (d = c + b.authority.replace(/\{subDomain\}/gi, a) + "/");
                    //     f.push(d)
                    // }, this);
                    // return f = f.map(function (b) {
                    //     "/" !== b.charAt(b.length - 1) && (b +=
                    //         "/");
                    //     return b
                    // })

                    return f;
                  },
                },
                urlPath: {
                  dependsOn: ["urlTemplate"],
                  get: function () {
                    if (!this.urlTemplate) return null;
                    var b = this.urlTemplate,
                      a = new url(b);
                    return b.substring(
                      ((a.scheme ? a.scheme + "://" : "//") + a.authority + "/")
                        .length
                    );
                  },
                },
                urlTemplate: null,
              },
              getTileUrl: function (b, a, d) {
                b = this.levelValues[b];
                var e =
                    this.tileServers[a % this.tileServers.length] +
                    string.substitute(this.urlPath, {
                      level: b,
                      col: d,
                      row: a,
                    }),
                  e = e
                    .replace(/\{level\}/gi, b)
                    .replace(/\{row\}/gi, a)
                    .replace(/\{col\}/gi, d);
                return urlUtils.addProxy(e);
              },
            });

            if (typeof callback === "function") {
              callback(tianditu);
            }
          }
        }
      );
    },

    /**
     * @param type 类型
     * @param data 数据集合
     * @param symbol 点样式
     * @param textSymbol 标注样式
     * @param visible 显示
     * @param param 参数
     * @param index
     */
    createLayerPoint(type, data, symbol, textSymbol, visible, param, index) {
      loadModules([
        "esri/layers/GraphicsLayer",
        "esri/Graphic",
        "esri/geometry/Point",
        "esri/symbols/TextSymbol",
        "esri/symbols/PictureMarkerSymbol",
        "esri/symbols/SimpleMarkerSymbol",
        "esri/Color",
        "esri/symbols/SimpleLineSymbol",
        "dojo/domReady!",
      ]).then(
        ([
          GraphicsLayer,
          Graphic,
          Point,
          TextSymbol,
          PictureMarkerSymbol,
          SimpleMarkerSymbol,
          SimpleLineSymbol,
          Color,
        ]) => {
          let layer = this.map.findLayerById(param.id);
          if (layer == undefined) {
            layer = new GraphicsLayer({
              id: param.id,
              title: param.title,
            });
          }
          if (this.isEmpty(index)) {
            this.map.add(layer);
          } else {
            this.map.add(layer, index);
          }
          layer.visible = visible;
          data.forEach((ele) => {
            let point = new Point({
              x: Number(ele.coors[0]),
              y: Number(ele.coors[1]),
            });
            let pointSymbol;
            if (!this.isEmpty(ele.angle)) {
              symbol["angle"] = Number(ele.angle);
            }
            if (type === "PictureMarkerSymbol") {
              pointSymbol = new PictureMarkerSymbol({ ...symbol });
            } else if (type === "SimpleMarkerSymbol") {
              pointSymbol = new SimpleMarkerSymbol({ ...symbol });
            }
            let graphic = new Graphic({
              geometry: point,
              symbol: pointSymbol,
              attributes: ele,
            });
            layer.add(graphic);
            if (textSymbol) {
              this.createTextSymbol(data, textSymbol, true, param);
            }
          });
        }
      );
    },

    /**
     * @param data 数据集合
     * @param symbol 标注样式
     * @param visible 显示
     * @param param 参数
     * @param index
     */
    createTextSymbol(data, symbol, visible, param, index) {
      loadModules([
        "esri/layers/GraphicsLayer",
        "esri/Graphic",
        "esri/geometry/Point",
        "esri/symbols/TextSymbol",
        "esri/symbols/PictureMarkerSymbol",
        "esri/symbols/SimpleMarkerSymbol",
        "esri/Color",
        "esri/symbols/SimpleLineSymbol",
        "dojo/domReady!",
      ]).then(
        ([
          GraphicsLayer,
          Graphic,
          Point,
          TextSymbol,
          PictureMarkerSymbol,
          SimpleMarkerSymbol,
          SimpleLineSymbol,
          Color,
        ]) => {
          let layer = this.map.findLayerById(param.id);
          if (layer == undefined) {
            layer = new GraphicsLayer({
              id: param.id,
              title: param.title,
            });
          }
          if (this.isEmpty(index)) {
            this.map.add(layer);
          } else {
            this.map.add(layer, index);
          }
          layer.visible = visible;
          data.forEach((ele) => {
            let point = new Point({
              x: Number(ele.coors[0]),
              y: Number(ele.coors[1]),
            });
            symbol["text"] = ele.name;
            let textSymbol = new TextSymbol({ ...symbol });
            let graphic = new Graphic({
              geometry: point,
              symbol: textSymbol,
            });
            layer.add(graphic);
          });
        }
      );
    },

    /**
     * @param data 数据集合
     * @param symbol 线样式
     * @param textSymbol 标注样式
     * @param visible 显示
     * @param param 参数
     * @param index
     */
    createPolyline(data, symbol, textSymbol, visible, param, index) {
      loadModules([
        "esri/layers/GraphicsLayer",
        "esri/Graphic",
        "esri/geometry/Polyline",
        "esri/symbols/SimpleLineSymbol",
        "esri/Color",
        "esri/symbols/TextSymbol",
        "esri/geometry/Point",
        "esri/geometry/SpatialReference",
        "dojo/domReady!",
      ]).then(
        ([
          GraphicsLayer,
          Graphic,
          Polyline,
          SimpleLineSymbol,
          Color,
          TextSymbol,
          Point,
          SpatialReference,
        ]) => {
          let layer = this.map.findLayerById(param.id);
          if (layer == undefined) {
            layer = new GraphicsLayer({
              id: param.id,
              title: param.title,
            });
          }
          if (this.isEmpty(index)) {
            this.map.add(layer);
          } else {
            this.map.add(layer, index);
          }
          layer.visible = visible;
          data.forEach((ele) => {
            let polyline, lineSymbol;
            // 创建线
            polyline = new Polyline({
              spatialReference: new SpatialReference({
                wkid: this.mapConfig.extent.wkid,
              }),
            });
            // 样式
            lineSymbol = new SimpleLineSymbol({
              ...symbol,
            });

            // let paths = [
            //   [
            //     // first path
            //     [-97.06138, 32.837, 5],
            //     [-97.06133, 32.836, 6],
            //     [-97.06124, 32.834, 7],
            //   ],
            //   [
            //     // second path
            //     [-97.06326, 32.759],
            //     [-97.06298, 32.755],
            //   ],
            // ];

            ele.coors.forEach((e) => {
              polyline.addPath(e);
            });

            let graphic = new Graphic({
              geometry: polyline,
              symbol: lineSymbol,
              attributes: [],
            });
            layer.add(graphic);
          });

          if (textSymbol) {
            this.createPolylineTextSymbol(data, textSymbol, true, param);
          }
        }
      );
    },

    /**
     * @param data 数据集合
     * @param symbol 线标注样式
     * @param visible 显示
     * @param param 参数
     * @param index
     */
    createPolylineTextSymbol(data, symbol, visible, param, index) {
      loadModules([
        "esri/Graphic",
        "esri/geometry/Polyline",
        "esri/symbols/SimpleLineSymbol",
        "esri/Color",
        "esri/symbols/TextSymbol",
        "esri/geometry/Point",
        "esri/geometry/SpatialReference",
        "dojo/domReady!",
      ]).then(
        ([
          Graphic,
          Polyline,
          SimpleLineSymbol,
          Color,
          TextSymbol,
          Point,
          SpatialReference,
        ]) => {
          let layer = this.map.findLayerById(param.id);
          if (layer == undefined) {
            layer = new GraphicsLayer({
              id: param.id,
              title: param.title,
            });
          }
          if (this.isEmpty(index)) {
            this.map.add(layer);
          } else {
            this.map.add(layer, index);
          }
          layer.visible = visible;
          data.forEach((ele) => {
            let polyline;
            // 创建线
            polyline = new Polyline({
              spatialReference: new SpatialReference({
                wkid: this.mapConfig.extent.wkid,
              }),
            });
            ele.coors.forEach((e) => {
              polyline.addPath(e);
            });

            // 标注样式
            symbol["text"] = ele.name;
            let textSymbol = new TextSymbol({ ...symbol });

            for (let i = 0; i < polyline.paths.length; i++) {
              //获得点坐标
              let index = 0;
              let point = new Point({
                x: polyline.paths[i][index][0],
                y: polyline.paths[i][index][1],
              });

              //创建文字标注
              let graphic = new Graphic({
                geometry: point,
                symbol: textSymbol,
              });
              //把文字标注添加到刚才创建的图层上
              layer.add(graphic);
            }
          });
        }
      );
    },

    /**
     * @param data 数据集合
     * @param symbol 图层样式
     * @param visible 显示
     * @param param 参数
     * @param index
     */
    createPolygon(data, symbol, visible, param, index) {
      loadModules([
        "esri/layers/GraphicsLayer",
        "esri/Graphic",
        "esri/geometry/Polygon",
        "esri/symbols/SimpleFillSymbol",
        "esri/Color",
        "esri/symbols/TextSymbol",
        "esri/geometry/Point",
        "esri/geometry/SpatialReference",
        "dojo/domReady!",
      ]).then(
        ([
          GraphicsLayer,
          Graphic,
          Polygon,
          SimpleFillSymbol,
          Color,
          TextSymbol,
          Point,
          SpatialReference,
        ]) => {
          let layer = this.map.findLayerById(param.id);
          if (layer == undefined) {
            layer = new GraphicsLayer({
              id: param.id,
              title: param.title,
            });
          }
          if (this.isEmpty(index)) {
            this.map.add(layer);
          } else {
            this.map.add(layer, index);
          }
          layer.visible = visible;

          data.forEach((ele) => {
            let polygon, fillSymbol;
            polygon = new Polygon({
              spatialReference: new SpatialReference({
                wkid: this.mapConfig.extent.wkid,
              }),
            });
            fillSymbol = new SimpleFillSymbol({ ...symbol });

            // rings: [
            //             [-64.78, 32.3],
            //             [-66.07, 18.45],
            //             [-80.21, 25.78],
            //             [-64.78, 32.3]
            //           ]

            ele.coors.forEach((e) => {
              polygon.addRing(e);
            });

            let graphic = new Graphic({
              geometry: polygon,
              symbol: fillSymbol,
              attributes: [],
            });
            layer.add(graphic);
          });
        }
      );
    },

    // toolsClick() {
    //   this.openLegend = false;
    //   this.openLayers = false;
    //   this.collapse = !this.collapse;
    // },

    /**
     * 添加popup的标注
     */
    addPopupPoint(mapPoint) {
      loadModules([
        "esri/layers/GraphicsLayer",
        "esri/Graphic",
        "esri/geometry/Point",
        "esri/symbols/TextSymbol",
        "esri/symbols/PictureMarkerSymbol",
        "esri/symbols/SimpleMarkerSymbol",
        "esri/symbols/SimpleLineSymbol",
        "dojo/domReady!",
      ]).then(
        ([
          GraphicsLayer,
          Graphic,
          Point,
          TextSymbol,
          PictureMarkerSymbol,
          SimpleMarkerSymbol,
          SimpleLineSymbol,
        ]) => {
          let layer = this.map.findLayerById("esri-popup");
          if (layer == undefined) {
            layer = new GraphicsLayer({
              id: "esri-popup",
              title: "esri-popup弹窗",
            });
          }
          this.map.add(layer, 1000);
          this.cleanLayer("esri-popup");
          if (!mapPoint) {
            return;
          }
          let pointSymbol = new SimpleMarkerSymbol({
            symbolStyle: "circle",
            width: 8,
            symbolLineStyle: "",
            symbolLineColor: "red",
            symbolLineWidth: 4,
            color: "red",
          });

          let point = new Point({
            x: Number(mapPoint.longitude),
            y: Number(mapPoint.latitude),
          });

          let graphic = new Graphic({
            geometry: point,
            symbol: pointSymbol,
          });
          layer.add(graphic);
        }
      );
    },

    /**
     * 测距
     */
    measurePolyline() {
      measurePolyline(this);
    },

    /**
     * 测面
     */
    measurePolygon() {
      measurePolygon(this);
    },

    /**
     * 放大
     */
    zoomOutClick() {
      this.view.zoom++;
    },

    /**
     * 缩小
     */
    zoomInClick() {
      this.view.zoom--;
    },
    /**
     * 拖拽
     */
    dragClick() {
      this.backgroundColorTools.drag = !this.backgroundColorTools.drag;
    },
    /**
     * 复位
     */
    resetClick() {
      let mapConfig = this.mapConfig;
      loadModules([
        "esri/geometry/Extent",
        "esri/geometry/SpatialReference",
        "dojo/domReady!",
      ]).then(([Extent, SpatialReference]) => {
        var ext = new Extent({
          xmin: mapConfig.extent.xmin,
          xmax: mapConfig.extent.xmax,
          ymin: mapConfig.extent.ymin,
          ymax: mapConfig.extent.ymax,
          spatialReference: new SpatialReference({
            wkid: mapConfig.extent.wkid,
          }),
        });
        this.view.extent = ext;
        this.view.constraints = mapConfig.constraints;
        this.view.center = mapConfig.center;
      });
    },
    /**
     * 图例
     */
    legendClick() {
      this.openLegend = !this.openLegend;
      if (this.openLegend) {
        this.openLayers = !this.openLegend;
      }
    },
    /**
     * 图层
     */
    layersClick() {
      this.openLayers = !this.openLayers;
      if (this.openLayers) {
        this.openLegend = !this.openLayers;
      }
    },

    /**
     * 图层改变
     */
    layerChange(id) {
      var layer = this.map.findLayerById(id);
      if (layer) {
        layer.visible = !layer.visible;
      }
    },

    /**
     * 清空图层
     */
    cleanClick() {
      setTimeout(() => {
        this.cleanLayer("lineLayer");
        this.cleanLayer("polygonLayer");
      }, 10);
    },
    isEmpty(obj) {
      if (obj == null || obj == undefined || obj == "") {
        return true;
      } else {
        return false;
      }
    },
    //清空图层
    cleanLayer(id) {
      let layer = this.map.findLayerById(id);
      if (layer && layer.removeAll != undefined) {
        //清空图层
        layer.removeAll();
      }
    },
  },
};
</script>
<style lang="scss" scoped>
/* @import url(); 引入css类 */
.esri-map {
  position: relative;
  width: 100%;
  height: 100%;
}
// .tools {
//   width: 44px;
//   height: 44px;
//   position: absolute;
//   right: 12px;
//   top: 40px;
//   background-repeat: no-repeat;
//   background-size: 100% 100%;
//   -moz-background-size: 100% 100%;
//   background-image: url("./styles/svg/tools.svg");
//   border-radius: 25px;

//   &:hover {
//     background-color: rgb(193, 221, 247);
//   }
// }
.toolsbarControl {
  position: absolute;
  top: 20px;
  right: 12px;
  height: 600px;
}

.toolsbarDiv {
  position: absolute;
  right: 20px;
  li {
    div {
      border: 1px solid rgb(146, 172, 211);
      margin-bottom: 5px;
      width: 30px;
      height: 30px;
      position: relative;
      background-repeat: no-repeat;
      background-size: 100% 100%;
      background-color: #fff;
    }
  }

  ul li {
    padding-top: 3px;
    cursor: pointer;
    display: block;
  }
}
#zoomOut {
  background-image: url("./styles/svg/+.svg");
  &:hover {
    background-image: url("./styles/svg/+-高亮.svg");
  }
}
#zoomIn {
  background-image: url("./styles/svg/-.svg");
  &:hover {
    background-image: url("./styles/svg/--高亮.svg");
  }
}
#drag {
  background-image: url("./styles/svg/拖拽.svg");
  &:hover {
    background-image: url("./styles/svg/拖拽-高亮.svg");
  }
}

#reset {
  background-image: url("./styles/svg/复位.svg");
  &:hover {
    background-image: url("./styles/svg/复位-高亮.svg");
  }
}
#clean {
  background-image: url("./styles/svg/清除.svg");
  &:hover {
    background-image: url("./styles/svg/清除-高亮.svg");
  }
}

#polyline {
  background-image: url("./styles/svg/测距.svg");
  &:hover {
    background-image: url("./styles/svg/测距-高亮.svg");
  }
}

#polygon {
  background-image: url("./styles/svg/测面.svg");
  &:hover {
    background-image: url("./styles/svg/测面-高亮.svg");
  }
}

#legend {
  background-image: url("./styles/svg/图例.svg");
  &:hover {
    background-image: url("./styles/svg/图例-高亮.svg");
  }
}

#layers {
  background-image: url("./styles/svg/图层.svg");
  &:hover {
    background-image: url("./styles/svg/图层-高亮.svg");
  }
}

.legendList {
  position: relative;
  width: 100px;
  height: 100px;
  right: 100px;
  top: 90px;
  background-color: #fff;
}

.el-divider--horizontal {
  display: block;
  height: 1px;
  width: 100%;
  margin: 20px 0;
}
</style>