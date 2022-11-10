
# arcgis-map

## Project setup
```
npm install
```
### mian.js 引用
```
import EsriMap from 'esri-map'
import 'esri-map/esri-map.css'
Vue.use(EsriMap)
```

### 地图加载
最外层div width、height需要设置
```
<esri-map ref="esriMap" :mapConfig="mapConfig" @loaded="loadedHandler"></esri-map>
```
### mapConfig 配置
```
mapConfig: {
        zoom: 6,
        //中心点
        center: [116.19432, 39.911222],
        //边界框的最小和最大X和Y坐标。范围用于描述地图视图的可见部分
        extent: {
          xmin: 140.3,
          xmax: 110.47,
          ymin: 60.32,
          ymax: 28.14,
          wkid: 4326,
        },
        //指定可以应用于地图视图的缩放和旋转约束
        constraints: {
          minZoom: 3,
          maxZoom: 8,
        },
        // 工具栏
        toolsbar: {
          //激活
          enabled: true,
          //放大
          zoomOut: true,
          //缩小
          zoomIn: true,
          //拖拽
          drag: true,
          //复位
          reset: true,
          //清除
          clean: true,
          //测距
          polyline: true,
          //测面
          polygon: true,
          //图例
          legend: true,
          //图层
          layers: true,
        },

        //图例
        LegendList: [
          {
            name: "测试marker点",
            url: require("@/assets/images/hd.png"),
          }
        ],

        //基本图层
        BaseMapLayers: [
          {
            id: "测试",
            title: "中国彩色版",
            layerType: "TileLayer",
            restURL:
              "https://map.geoq.cn/arcgis/rest/services/ChinaOnlineStreetWarm/MapServer",
            visible: true,
          },
        ],
        //用户图层
        CustomerLayers: [
          {
            id: "002",
            title: "中国午夜版",
            layerType: "TileLayer",
            restURL:
              "https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer",
            visible: true,
          },
        ],

        //layerType:KMLLayer ElevationLayer FeatureLayer GraphicsLayer MapImageLayer  
                    GroupLayer TileLayer WMSLayer  WMTSLayer WebTileLayer GoogleMapTileLayer TiandituWMTSLayer
      },
```
### api
#### 创建点图层
```
/**
* @param type 类型
* @param data 数据集合
* @param symbol 点样式
* @param textSymbol 标注样式
* @param visible 显示
* @param param 参数
* @param index
*/
createLayerPoint(type, data, symbol, textSymbol, visible, param, index)
```
#### 创建标注
```
/**
* @param data 数据集合
* @param symbol 标注样式
* @param visible 显示
* @param param 参数
* @param index
*/
createTextSymbol(data, symbol, visible, param, index)
```
#### 创建线图层
```
/**
* @param data 数据集合
* @param symbol 线样式
* @param textSymbol 标注样式
* @param visible 显示
* @param param 参数
* @param index
*/
createPolyline(data, symbol, textSymbol, visible, param, index)
```
#### 创建线标注图层
```
/**
* @param data 数据集合
* @param symbol 线标注样式
* @param visible 显示
* @param param 参数
* @param index
*/
createPolylineTextSymbol(data, symbol, visible, param, index)
```
#### 创建面图层
```
/**
* @param data 数据集合
* @param symbol 图层样式
* @param visible 显示
* @param param 参数
* @param index
*/
createPolygon(data, symbol, visible, param, index) 
```
####
```
//清空图层
cleanLayer(id)
```
### popup调用
```
<esri-map ref="esriMap" :mapConfig="mapConfig" @loaded="loadedHandler">
    <esri-map-popup slot="popup" :mapPoint="mapPoint" :custom="false">
        <!-- 内部内容自定义 -->
        <!-- 最外层只能有一个dom -->
        <div class="popup-class">
        <div>6666</div>
        </div>
    </esri-map-popup>
</esri-map>

//custom 是否启用自定义样式
//mapPoint 弹出popup

//调用
this.esriMap.view.on("click", (event) => {
    this.esriMap.view.hitTest(event.screenPoint).then((responses) => {
        if (
        responses.results.length > 0 &&
        responses.results[0].graphic.attributes.data
        ) {
        const data = responses.results[0].graphic.attributes;
        this.mapPoint = event.mapPoint;
        console.log("markerData", data);
        } else {
        this.mapPoint = null;
        }
    });
});
```
### 例子
```
<esri-map ref="esriMap" :mapConfig="mapConfig" @loaded="loadedHandler">
        <esri-map-popup slot="popup" :mapPoint="mapPoint" :custom="false">
          <!-- 内部内容自定义 -->
          <!-- 最外层只能有一个dom -->
          <div class="popup-class">
            <div>6666</div>
          </div>
        </esri-map-popup>
      </esri-map>
```
```
data() {
    return {
      mapPoint: null, //popup弹框点

      esriMap: {},
      mapConfig: {
        zoom: 6,
        center: [116.19432, 39.911222],
        //边界框的最小和最大X和Y坐标。范围用于描述地图视图的可见部分
        extent: {
          xmin: 140.3,
          xmax: 110.47,
          ymin: 60.32,
          ymax: 28.14,
          wkid: 4326,
        },
        //指定可以应用于地图视图的缩放和旋转约束
        constraints: {
          minZoom: 3,
          maxZoom: 8,
        },
        // 工具栏
        toolsbar: {
          //激活
          enabled: true,
          //放大
          zoomOut: true,
          //缩小
          zoomIn: true,
          //拖拽
          drag: true,
          //复位
          reset: true,
          //清除
          clean: true,
          //测距
          polyline: true,
          //测面
          polygon: true,
          //图例
          legend: true,
          //图层
          layers: true,
        },

        LegendList: [
          {
            name: "测试marker点",
            url: require("@/assets/images/hd.png"),
          },
        ],

        BaseMapLayers: [
          {
            id: "测试",
            title: "中国彩色版",
            layerType: "TileLayer",
            restURL:
              "https://map.geoq.cn/arcgis/rest/services/ChinaOnlineStreetWarm/MapServer",
            visible: true,
          },
        ],
        CustomerLayers: [
          {
            id: "002",
            title: "中国午夜版",
            layerType: "TileLayer",
            restURL:
              "https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer",
            visible: true,
          },
        ],
      },
      pointList: [
        {
          angle: 90,
          name: "哈哈",
          coors: [127, 46],
          data: {
            age: 20,
          },
        },
        {
          angle: 40,
          name: "黑河",
          coors: [128, 44],
          data: {
            age: 20,
          },
        },
      ],

      lineData: [
        {
          name: "测试线",
          coors: [
            [
              [126, 46],
              [112, 44],
            ],
            [
              [124, 46.36],
              [123, 44.42],
            ],
          ],
        },
      ],

      polygonData: [
        {
          name: "测试线",
          coors: [
            [
              [90, 44],
              [100, 46],
              [100, 44],
              [90, 44],
            ],
            [
              [113, 46.36],
              [132, 46.42],
              [120, 42.42],
              [113, 46.36],
            ],
          ],
        },
      ],

      pointStyle: {
        url: require("@/assets/images/hd.png"),
        width: 8,
        height: 10,
        xoffset: 0,
        yoffset: 0,
      },

      textSymbol: {
        type: "text", // autocasts as new TextSymbol()
        color: "black",
        text: "嫩江",
        xoffset: 16,
        yoffset: 6,
        font: {
          size: 8,
          family: "Josefin Slab",
          weight: "bold",
        },
      },

      lineTextSymbol: {
        type: "text", // autocasts as new TextSymbol()
        color: "blue",
        text: "嫩江",

        font: {
          size: 8,
          family: "Josefin Slab",
          weight: "bold",
        },
      },

      lineSymbol: {
        type: "simple-line", // autocasts as SimpleLineSymbol()
        color: [8, 193, 251],
        width: 2,
      },

      fillSymbol: {
        type: "simple-fill", // autocasts as new SimpleFillSymbol()
        color: [227, 139, 79, 0.8],
        outline: {
          // autocasts as new SimpleLineSymbol()
          color: [255, 255, 255],
          width: 1,
        },
      },
    };
  },
  methods: {
    loadedHandler(esriMap) {
      this.esriMap = esriMap;

      this.esriMap.createLayerPoint(
        "PictureMarkerSymbol",
        this.pointList,
        this.pointStyle,
        this.textSymbol,
        true,
        {
          id: "ponit-1",
          title: "测站点",
        },
        1
      );

      this.esriMap.createPolyline(
        this.lineData,
        this.lineSymbol,
        this.lineTextSymbol,
        true,
        { id: "polyline-1", title: "线" },
        6
      );

      this.esriMap.createPolygon(
        this.polygonData,
        this.fillSymbol,
        true,
        { id: "polygon-1", title: "面" },
        3
      );

      this.esriMap.view.on("click", (event) => {
        this.esriMap.view.hitTest(event.screenPoint).then((responses) => {
          if (
            responses.results.length > 0 &&
            responses.results[0].graphic.attributes.data
          ) {
            const data = responses.results[0].graphic.attributes;
            this.mapPoint = event.mapPoint;
            console.log("markerData", data);
          } else {
            this.mapPoint = null;
          }
        });
      });
      console.log("this.esriMap", this.esriMap);
    },

    test1() {
      this.esriMap.cleanLayer("id_name_text");
      this.esriMap.createLayerPoint(
        this.pointList,
        this.pointStyle,
        "PictureMarkerSymbol",
        false,
        true,
        {
          id: "id_name_text",
          title: "测站点名称样式",
        },
        1
      );
    },
  },
```


