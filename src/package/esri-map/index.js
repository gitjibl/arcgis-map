
import { loadModules } from "esri-loader";
function measurePolyline(that) {
    let _this = that;
    loadModules([
        "esri/views/2d/draw/Draw",
        "esri/geometry/geometryEngine",
        "esri/geometry/Polyline",
        "esri/layers/GraphicsLayer",
        "esri/Graphic",
        "dojo/domReady!",
    ]).then(
        ([Draw, GeometryEngine, Polyline, GraphicsLayer, Graphic]) => {
            let lineLayer = _this.map.findLayerById("lineLayer");
            if (!lineLayer) {
                lineLayer = new GraphicsLayer({
                    id: "lineLayer",
                }); //绘制线图层
            }
            _this.map.layers.add(lineLayer);
            let draw = new Draw({
                //在view里创建draw
                view: _this.view,
            });
            let action = draw.create("polyline"); //创建画线实例
            _this.view.focus();
            action.on(
                [
                    "vertex-add",
                    "vertex-remove",
                    "cursor-update",
                    "redo",
                    "undo",
                    "draw-complete",
                ],
                createPolyline
            );

            function createPolyline(event) {
                var vertices = event.vertices;
                var symbol = {
                    type: "simple-marker",
                    color: [255, 255, 255],
                    size: 4,
                    outline: {
                        color: [255, 0, 0],
                        width: 1.5, // points
                    },
                };

                lineLayer.removeAll();
                var graphics = new Graphic({
                    geometry: new Polyline({
                        paths: vertices,
                        spatialReference: _this.view.spatialReference,
                    }),

                    symbol: {
                        type: "simple-line", // autocasts as new SimpleFillSymbol
                        color: [255, 116, 3],
                        width: 2,
                        cap: "round",
                        join: "round",
                    },
                });

                lineLayer.add(graphics);

                var firstTextSymbol = {
                    type: "text",
                    color: "blue",
                    haloColor: "black",
                    haloSize: "10px",
                    text: "0.00千米",
                    xoffset: "10px",
                    yoffset: "10px",
                    font: {
                        size: 12,
                        family: "sans-serif",
                        weight: "bold",
                    },
                };

                var firstPoint = {
                    type: "point",
                    x: vertices[0][0],
                    y: vertices[0][1],
                    spatialReference: _this.view.spatialReference, //和底图相同的坐标系
                };
                var firstTextGraphics = new Graphic({
                    geometry: firstPoint,
                    symbol: firstTextSymbol,
                });
                var firstGraphics = new Graphic({
                    geometry: firstPoint,
                    symbol: symbol,
                });

                lineLayer.addMany([firstTextGraphics, firstGraphics]);

                let linePath = []; //线段坐标集合
                let pointStart = []; //起点
                pointStart.push(vertices[0][0]);
                pointStart.push(vertices[0][1]);
                linePath.push(pointStart);

                for (let i = 1; i < vertices.length; i++) {
                    var point = {
                        type: "point",
                        x: vertices[i][0],
                        y: vertices[i][1],
                        spatialReference: _this.view.spatialReference, //和底图相同的坐标系
                    };

                    let xy = []; //鼠标当前经纬度
                    xy.push(vertices[i][0]);
                    xy.push(vertices[i][1]);
                    linePath.push(xy);

                    var line = new Polyline({
                        hasZ: false,
                        hasM: true,
                        paths: linePath,
                        spatialReference: _this.view.spatialReference,
                    });

                    let length = GeometryEngine.geodesicLength(line, "meters");
                    let lengthText = lengthFormat(length); //单位转换
                    var textSymbol = {
                        type: "text",
                        color: "blue",
                        haloColor: "black",
                        haloSize: "5px",
                        text: lengthText,
                        xoffset: "20px",
                        yoffset: "20px",
                        font: {
                            size: 12,
                            family: "sans-serif",
                            weight: "bold",
                        },
                    };

                    var textGraphics = new Graphic({
                        geometry: point,
                        symbol: textSymbol,
                    });

                    var Graphics = new Graphic({
                        geometry: point,
                        symbol: symbol,
                    });
                    //将标注和鼠标位置添加到地图
                    lineLayer.addMany([textGraphics, Graphics]);
                }

                //长度单位转换
                function lengthFormat(length) {
                    let lengthText;
                    if (length < 2000) {
                        length = length.toFixed(2);
                        return (lengthText = length + "米");
                    } else {
                        length = (length / 1000).toFixed(2);
                        return (lengthText = length + "千米");
                    }
                }
            }
        }
    );
}

function measurePolygon(that) {
    let _this = that;
    loadModules([
        "esri/views/2d/draw/Draw",
        "esri/geometry/geometryEngine",
        "esri/geometry/Polygon",
        "esri/layers/GraphicsLayer",
        "esri/Graphic",
        "dojo/domReady!",
    ]).then(([Draw, GeometryEngine, Polygon, GraphicsLayer, Graphic]) => {
        let polygonLayer = _this.map.findLayerById("polygonLayer"); //绘制面图层
        if (!polygonLayer) {
            polygonLayer = new GraphicsLayer({
                id: "polygonLayer",
            }); //绘制线图层
        }

        //画面按钮事件
        let draw = new Draw({
            //在view里创建draw
            view: _this.view,
        });
        let action = draw.create("polygon"); //创建画线实例
        _this.view.focus();
        action.on(
            [
                "vertex-add", // when a vertex is added  鼠标单击
                "vertex-remove", // when a vertex is removed 移除
                "cursor-update", // when the pointer moves 鼠标移动
                "draw-complete", // when the drawing is completed 鼠标双击
            ],
            function (evt) {
                createPolygon(evt.vertices);
            }
        );
        // };

        //画面和测量面积
        function createPolygon(vertices) {
            polygonLayer.removeAll();
            let symbol = {
                //点样式
                type: "simple-marker",
                color: [255, 255, 255],
                size: 4,
                outline: {
                    color: [255, 0, 0],
                    width: 1.5, // points
                },
            };
            let fillSymbol = {
                //面样式
                type: "simple-fill", // autocasts as new SimpleFillSymbol()
                color: [3, 255, 240, 0.1],
                outline: {
                    // autocasts as new SimpleLineSymbol()
                    color: [255, 116, 3],
                    width: 2,
                },
            };

            let polygon = new Polygon({
                rings: vertices,
                spatialReference: _this.view.spatialReference,
            });

            let polygonGraphics = new Graphic({
                geometry: polygon,
                symbol: fillSymbol,
            });
            polygonLayer.add(polygonGraphics);
            let area = GeometryEngine.geodesicArea(polygon, "square-meters");
            let areaText = areaFormat(area);
            let center = polygon.centroid;
            let pointCenter = {
                type: "point",
                longitude: center.longitude,
                latitude: center.latitude,
            };
            let textSymbol = {
                //面积标注
                type: "text",
                color: "blue",
                haloColor: "black",
                haloSize: "2px",
                text: areaText,
                font: {
                    size: 12,
                    family: "sans-serif",
                    weight: "bold",
                },
            };
            let textGraphics = new Graphic({
                //标注为面中心位置
                geometry: pointCenter,
                symbol: textSymbol,
            });
            polygonLayer.add(textGraphics);

            for (let i = 0; i < vertices.length; i++) {
                let point = {
                    type: "point",
                    x: vertices[i][0],
                    y: vertices[i][1],
                    spatialReference: _this.view.spatialReference,
                };

                let pointGraphics = new Graphic({
                    geometry: point,
                    symbol: symbol,
                });
                polygonLayer.add(pointGraphics);
            }
            _this.map.layers.add(polygonLayer);
        }

        //面积单位转换
        function areaFormat(area) {
            let areaText;
            if (area < 2000) {
                area = area.toFixed(2);
                return (areaText = area + "平方米");
            } else {
                area = (area / 10000).toFixed(2);
                return (areaText = area + "平方千米");
            }
        }
    });
}



export {
    measurePolyline, measurePolygon
}