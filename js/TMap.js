/* eslint-disable */

/**
 *初始化地图
 *
 * @export
 * @param {*} option 地图渲染配置
 * @return {*}
 */
export function initMap(option) {
  // 解决部分情况会出现地图重复加载的情况
  const parentNode = document.getElementById(option.targetContainerId);

  parentNode.style.backgroundColor = option.backgroundColor
    ? option.backgroundColor
    : "transparent";

  for (let i = 0; i < parentNode.children.length; i++) {
    if (parentNode.children[i].className === "ol-viewport") {
      parentNode.removeChild(parentNode.children[i]);
    }
  }

  //目前只支持瓦片地图源-TODO:增加其他图源加载方式
  const baseLayer = new ol.layer.Tile();

  const source = option.baseMap
    ? window.baseMapConfig[option.baseMap]
    : {
        layer: {
          source: new ol.source.OSM({ wrapX: false }),
        },
      };

  baseLayer.setSource(source.layer.source);

  const controlsMap = {
    FullScreen: new ol.control.FullScreen({
      target: option?.FullScreenElement,
    }),
    MousePosition: new ol.control.MousePosition({}),
    OverviewMap: new ol.control.OverviewMap({
      layers: [new ol.layer.Tile({ source: source.layer.source })],
    }),
    ZoomSlider: new ol.control.ZoomSlider(),
    ZoomToExtent: new ol.control.ZoomToExtent({
      extent: option.extent ? option.extent : [-180, -90, 180, 90],
    }),
    ScaleLine: new ol.control.ScaleLine(),
  };

  const controls = option.controls
    ? option.controls
        .filter((controlName) => {
          return (
            controlName !== "Zoom" &&
            controlName !== "Rotate" &&
            controlName !== "Attribution"
          );
        })
        .map((controlName) => {
          return controlsMap[controlName];
        })
    : [];

  const TMap = new ol.Map({
    // 设置地图图层
    layers: [baseLayer],
    // 设置显示地图的视图
    view: new ol.View({
      projection: option.projection ? option.projection : "EPSG:4326",
      center:
        option.centerLng & option.centerLat
          ? [option.centerLng, option.centerLat]
          : [0, 0],
      zoom: option.zoom ? option.zoom : 0, // 并且定义地图显示层级为2
      maxZoom: option.maxZoom ? option.maxZoom : 19.9,
      minZoom: option.minZoom ? option.minZoom : 0,
      extent: option?.extent,
    }),
    target: option.targetContainerId, // 让id为targetContainerId的div作为地图的容器

    // 设置地图控件
    controls: ol.control.defaults
      .defaults({
        zoom: option.controls
          ? option.controls.includes("Zoom")
            ? true
            : false
          : false,
        rotate: option.controls
          ? option.controls.includes("Rotate")
            ? true
            : false
          : false,
        attribution: option.controls
          ? option.controls.includes("Attribution")
            ? true
            : false
          : false,
      })
      .extend(controls), //基础组件

    // 设置地图操作
    interactions: ol.interaction.defaults.defaults({
      dragRotate:
        option.isAllowDragRotate !== undefined
          ? option.isAllowDragRotate
          : true,
      dragZoom:
        option.isAllowDragZoom !== undefined ? option.isAllowDragZoom : true,
      doubleClickZoom:
        option.isAllowDoubleClickZoom !== undefined
          ? option.isAllowDoubleClickZoom
          : true,
      dragPan:
        option.isAllowDragPan !== undefined ? option.isAllowDragPan : true,
      mouseWheelZoom:
        option.isAllowMouseWheelZoom !== undefined
          ? option.isAllowMouseWheelZoom
          : true,
    }),
  });

  return {
    TMap, //地图实例
    baseLayer, //底图layer
  };
}

/**
 *根据地图容器变化地图强制重新计算宽高
 *
 * @export
 * @param {*} TMap
 */
export function resizeMap(TMap) {
  TMap.updateSize();
}

/**
 *改变地图容器
 *
 * @export
 * @param {*} TMap 地图实例
 * @param {*} targetContainerId 地图容器id
 */
export function setMapContainer(TMap, targetContainerId) {
  TMap.setTarget(targetContainerId);
}

/**
 *切换底图
 *
 * @export
 * @param {*} baseLayer 地图底层layer
 * @param {*} baseMap 底图名称 详见配置
 */
export function setBaseMap(baseLayer, baseMap) {
  const source = window.baseMapConfig[baseMap];
  baseLayer.setSource(source.layer.source);
}

/**
 *获取图层数据源
 *
 * @export
 * @param {*} layer 图层
 * @return {*}
 */
export function getLayerSource(layer) {
  return layer.getSource();
}

/**
 *改变地图视图
 *
 * @export
 * @param {*} TMap 地图实例
 * @param {*} option 配置
 */
export function setMapVIew(TMap, option) {
  const view = new ol.View({
    projection: option?.projection
      ? option.projection
      : getMapView(TMap).values_.projection,
    center: option?.center ? option.center : getMapView(TMap).values_.center,
    zoom: option?.zoom ? option.zoom : getMapView(TMap).values_.zoom,
    minZoom: option?.minZoom
      ? option.minZoom
      : getMapView(TMap).values_.minZoom,
    maxZoom: option?.maxZoom
      ? option.maxZoom
      : getMapView(TMap).values_.maxZoom,
    extent: option?.extent ? option.extent : getMapView(TMap).values_.extent,
  });
  TMap.setView(view);
}

/**
 *视图zoom放大
 *
 * @export
 * @param {*} TMap
 * @return {*}
 */
export function zoomIn(TMap) {
  const zoom = TMap.getView().getZoom() + 1;
  if (zoom > TMap.getView().getMaxZoom()) {
    return;
  } else {
    animateMapView(TMap, { zoom: zoom });
  }
}

/**
 *视图zoom缩小
 *
 * @export
 * @param {*} TMap
 * @return {*}
 */
export function zoomOut(TMap) {
  const zoom = TMap.getView().getZoom() - 1;
  if (zoom < TMap.getView().getMinZoom()) {
    return;
  } else {
    animateMapView(TMap, { zoom: zoom });
  }
}

/**
 *动画改变地图视图
 *
 * @export
 * @param {*} TMap 地图实例
 * @param {*} option 配置
 */
export function animateMapView(TMap, option) {
  TMap.getView().animate({
    center: option?.center,
    zoom: option?.zoom,
    duration: option?.durationTime ? option?.durationTime : 300,
    easing: option?.easing ? ol.easing[option?.easing] : ol.easing["inAndOut"],
  });
}

/**
 *获取当前View
 *
 * @export
 * @param {*} TMap 地图实例
 * @return {*}
 */
export function getMapView(TMap) {
  return TMap.getView();
}

/**
 *获取地图边界坐标
 *
 * @export
 * @param {*} TMap
 * @return {*}
 */
export function getMapViewCoord(TMap) {
  const extent = getMapView(TMap).calculateExtent(TMap.getSize());
  const leftTop = [extent[0], extent[3]];
  const rightTop = [extent[2], extent[3]];
  const rightBottom = [extent[2], extent[1]];
  const leftBottom = [extent[0], extent[1]];
  const viewPortCoord = [leftTop, rightTop, rightBottom, leftBottom, leftTop];
  const viewPortWKT = transformCoordToWKT("polygon", viewPortCoord);
  const type = "polygon";
  return { viewPortCoord, viewPortWKT, type, extent };
}

/**
 *获取地图所有控件
 *
 * @export
 * @param {*} TMap 地图实例
 * @return {*}
 */
export function getMapControls(TMap) {
  return TMap.getControls();
}

/**
 * 移除control控件
 *
 * @export
 * @param {*} TMap 地图实例
 * @param {*} control 控件实例
 */
export function removeMapControl(TMap, control) {
  TMap.removeControl(control);
}

/**
 *添加名称为controlName的控件
 *
 * @export
 * @param {*} TMap 地图实例
 * @param {*} controlName 组件名称
 */
export function addMapControl(TMap, controlName, controlOption) {
  const controlsMap = {
    Zoom: new ol.control.Zoom(),
    Rotate: new ol.control.Rotate(),
    Attribution: new ol.control.Attribution(),
    FullScreen: new ol.control.FullScreen({
      target: controlOption?.FullScreenElement,
    }),
    MousePosition: new ol.control.MousePosition({
      target: document.getElementById(controlOption?.mousePositionContainerId),
    }),
    OverviewMap: new ol.control.OverviewMap({
      layers: [
        new ol.layer.Tile({
          source: controlOption?.overviewBaseMap
            ? window.baseMapConfig[controlOption?.overviewBaseMap].layer.source
            : new ol.source.OSM({ wrapX: false }),
        }),
      ],
    }),
    ZoomSlider: new ol.control.ZoomSlider(),
    ZoomToExtent: new ol.control.ZoomToExtent({
      extent: controlOption?.zoomToExtent
        ? controlOption.zoomToExtent
        : [-180, -90, 180, 90],
    }),
    ScaleLine: new ol.control.ScaleLine(),
  };
  TMap.addControl(controlsMap[controlName]);

  return controlsMap[controlName];
}

/**
 *添加事件监听
 *
 * @export
 * @param {*} TMap 地图实例
 * @param {*} type 事件类型 click单击 dblclick双击，双击会触发click singleclick单击，延迟250毫秒，就算双击不会触发 moveend鼠标滚动事件 pointermove鼠标移动事件 pointerdrag鼠标拖动事件 precompose地图准备渲染 postcompose地图渲染中 postrender地图渲染全部结束 change:layerGroup地图图层增删时触发 change:size地图窗口发生变化就会触发 change:target地图绑定的div发生更改时触发 change:view地图view对象发生变化触发 propertychangeMap对象中任意的property值改变时触发 viewchange当前地图view状态实时变化，不同于change:view，changeView只有setView时触发，viewchange在拖拽缩放时均触发  pointermove鼠标移动事件
 * @param {*} callBack 回调
 * @return {*}
 */
export function addMapEventListener(TMap, type, callBack) {
  if (type === "viewchange") {
    return TMap.getView().on("change", () => {
      const zoom = TMap.getView().getZoom();
      const center = TMap.getView().getCenter();
      const view = TMap.getView();
      const extent = view.calculateExtent(TMap.getSize());
      const leftTop = [extent[0], extent[3]];
      const rightTop = [extent[2], extent[3]];
      const rightBottom = [extent[2], extent[1]];
      const leftBottom = [extent[0], extent[1]];
      const viewPortCoord = [
        leftTop,
        rightTop,
        rightBottom,
        leftBottom,
        leftTop,
      ];
      const viewPortWKT = transformCoordToWKT("polygon", viewPortCoord);
      const type = "polygon";
      return callBack({
        zoom,
        center,
        view,
        viewPortCoord,
        viewPortWKT,
        type,
        extent,
      });
    });
  } else if (type === "zoomchange") {
    return TMap.getView().on("change:resolution", () => {
      const zoom = TMap.getView().getZoom();
      const center = TMap.getView().getCenter();
      const view = TMap.getView();
      const extent = view.calculateExtent(TMap.getSize());
      return callBack({ zoom, center, view, extent });
    });
  } else {
    return TMap.on(type, callBack);
  }
}

/**
 *移除事件监听
 *
 * @export
 * @param {*} TMap 地图实例
 * @param {*} type 事件类型
 * @param {*} event 事件对象（添加时返回值）
 */
export function removeMapEventListener(TMap, type, event) {
  if (type === "viewchange" || type === "zoomchange") {
    TMap.getView().un(event.type, event.listener);
  } else {
    TMap.un(event.type, event.listener);
  }
}

/**
 *根据一系列坐标点获取标准格式范围 用于fit
 *
 * @export
 * @param {*} lngLatArr
 * @return {*}
 */
export function getCoordinatesExtent(lngLatArr) {
  const coordinates = lngLatArr.map((item) => {
    return [item.lng, item.lat];
  });
  const multiPoint = new ol.geom.MultiPoint(coordinates);
  const extent = multiPoint.getExtent();
  return {
    extent: extent,
    minLng: extent[0],
    minLat: extent[1],
    maxLng: extent[2],
    maxLat: extent[3],
    geom: multiPoint,
  };
}

/**
 *地图自适应缩放
 *
 * @export
 * @param {*} TMap 地图实例
 * @param {*} geometryOrExtent 图形或缩放范围
 */
export function fitInView(TMap, geometryOrExtent, option) {
  TMap.getView().fit(geometryOrExtent, {
    duration: option?.durationTime ? option.durationTime : 300,
    size: option?.size,
    padding: option?.padding ? option.padding : [60, 60, 60, 60],
    maxZoom: option?.maxZoom,
  });
}

/**
 *添加icon类型的marker
 *
 * @export
 * @param {*} TMap 地图实例
 * @param {*} markerList 撒点数组
 * @return {*}
 */
export function addIconMarkers(TMap, markerList) {
  if (markerList.length === 0) {
    return;
  }
  const iconMarkers = markerList.map((marker) => {
    const markerFeature = new ol.Feature({
      geometry: new ol.geom.Point([marker.lng, marker.lat]),
      data: marker,
    });
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M18.364 17.364L12 23.728l-6.364-6.364a9 9 0 1 1 12.728 0zM12 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="red"/></svg>`;

    const icon = new Image();
    icon.src = marker.src
      ? marker.src
      : "data:image/svg+xml," + encodeURIComponent(svg);
    icon.onload = () => {
      const scale = marker?.showWidth / icon.width;
      const iconStyle = new ol.style.Style({
        image: new ol.style.Icon({
          src: marker?.src,
          anchor: marker?.anchor ? marker.anchor : [0.5, 0.5],
          offset: marker?.offset,
          scale: marker?.showWidth ? scale : 1,
          img: !marker.src ? (marker?.img ? marker.img : icon) : marker?.img,
          imgSize: !marker.src
            ? marker?.imgSize
              ? marker.imgSize
              : [30, 30]
            : marker?.imgSize,
        }),
      });
      markerFeature.setStyle(iconStyle);
    };
    return markerFeature;
  });

  const markerLayer = new ol.layer.Vector({
    source: new ol.source.Vector({
      features: iconMarkers,
    }),
  });

  TMap.addLayer(markerLayer);
  return markerLayer;
}

/**
 *添加覆盖物类型的marker
 *
 * @export
 * @param {*} TMap 地图实例
 * @param {*} markerList 撒点数组
 * @return {*}
 */
export function addOverLayMarkers(TMap, markerList) {
  if (markerList.length === 0) {
    return;
  }
  const overlayArr = [];
  markerList.forEach((marker) => {
    if (marker.elementHtml) {
      const markerParent = document.createElement("div");
      markerParent.innerHTML = marker.elementHtml;
      const overlay = new ol.Overlay({
        element: markerParent,
        position: [marker.lng, marker.lat],
        className: marker?.className,
        positioning: marker?.positioning ? marker.positioning : "center-center",
        offset: marker?.offset,
      });
      TMap.addOverlay(overlay);
      if (marker?.clickEvent) {
        markerParent.style.cursor = "pointer";
      }
      markerParent.onclick = marker?.clickEvent;
      overlayArr.push(overlay);
    }
  });
  return overlayArr;
}

/**
 *添加要素事件
 *
 * @export
 * @param {*} TMap 地图实例
 * @param {*} type 事件类型
 * @param {*} callBack 回调
 * @param {*} layer 指定层上的要素
 * @return {*}
 */
export function addFeatureEventListener(TMap, type, callBack, layers) {
  return TMap.on(type, (evt) => {
    const featureAndCoord = TMap.forEachFeatureAtPixel(evt.pixel, (feature) => {
      if (layers && layers.length) {
        if (feature.values_.features) {
          let features = [];
          layers.forEach((layer) => {
            features = features.concat(getFeaturesFromLayer(layer));
          });
          if (
            features.some(
              (f) => f.ol_uid === feature.values_.features[0].ol_uid
            )
          ) {
            const coord = feature.values_.geometry.flatCoordinates;
            const data = feature.values_.features
              ? feature.values_.features.map((item) => {
                  return item.values_?.data;
                })
              : feature.values_?.data;
            let targetLayer;
            layers.forEach((layer) => {
              if (
                getFeaturesFromLayer(layer).some(
                  (f) => f.ol_uid === feature.values_.features[0].ol_uid
                )
              ) {
                targetLayer = layer;
              }
            });
            return { feature, coord, data, targetLayer };
          } else {
            return undefined;
          }
        } else {
          let features = [];
          layers.forEach((layer) => {
            features = features.concat(getFeaturesFromLayer(layer));
          });
          if (features.some((f) => f.ol_uid === feature.ol_uid)) {
            const coord = feature.values_.geometry.flatCoordinates;
            const data = feature.values_.features
              ? feature.values_.features.map((item) => {
                  return item.values_?.data;
                })
              : feature.values_?.data;
            let targetLayer;
            layers.forEach((layer) => {
              if (
                getFeaturesFromLayer(layer).some(
                  (f) => f.ol_uid === feature.ol_uid
                )
              ) {
                targetLayer = layer;
              }
            });
            return { feature, coord, data, targetLayer };
          } else {
            return undefined;
          }
        }
      } else {
        const coord = feature.values_.geometry.flatCoordinates;
        const data = feature.values_.features
          ? feature.values_.features.map((item) => {
              return item.values_?.data;
            })
          : feature.values_?.data;
        return { feature, coord, data };
      }
    });
    return callBack(featureAndCoord);
  });
}

/**
 *移出要素事件
 *
 * @export
 * @param {*} TMap
 * @param {*} type
 * @param {*} event
 */
export function removeFeatureEventListener(TMap, type, event) {
  if (type === "pointerfeature") {
    TMap.un("pointermove", event.listener);
  } else {
    TMap.un(event.type, event.listener);
  }
}

/**
 *获取地图所有覆盖物
 *
 * @export
 * @param {*} TMap 地图实例
 * @return {*}
 */
export function getAllOverlays(TMap) {
  return TMap.getOverlays().getArray();
}

/**
 *获取所有layer
 *
 * @export
 * @param {*} map地图实例
 * @return {*}
 */
export function getAllLayers(TMap) {
  return TMap.getLayers().getArray();
}

/**
 *获取层上所有要素
 *
 * @export
 * @param {*} layer 层
 */
export function getFeaturesFromLayer(layer) {
  if (layer.getSource().getSource) {
    return layer.getSource().getSource().getFeatures();
  } else {
    return layer.getSource().getFeatures();
  }
}

/**
 *获取数据源上所有要素
 *
 * @export
 * @param {*} layer 层
 */
export function getFeaturesFromSource(Source) {
  if (Source.getSource) {
    return Source.getSource().getFeatures();
  } else {
    return Source.getFeatures();
  }
}

/**
 *清除覆盖物
 *
 * @export
 * @param {*} TMap 地图实例
 * @param {*} overlay 覆盖物实例
 */
export function removeOverlay(TMap, clearOverlay) {
  if (clearOverlay) {
    TMap.getOverlays()
      .getArray()
      .forEach((overlay) => {
        if (clearOverlay.ol_uid === overlay.ol_uid) {
          TMap.removeOverlay(overlay);
        }
      });
  } else {
    TMap.getOverlays().clear();
  }
}

/**
 *清除layer
 *
 * @export
 * @param {*} TMap 地图实例
 * @param {*} layer layer实例
 */
export function removeLayer(TMap, layer) {
  TMap.getLayers()
    .getArray()
    .forEach((item) => {
      if (item.ol_uid === layer.ol_uid) {
        TMap.removeLayer(item);
      }
    });
}

/**
 *清除要素
 *
 * @export
 * @param {*} layer layer实例
 * @param {*} feature 要素实例 不传 清除所有
 */
export function removeFeaturesOnLayer(layer, features) {
  if (features && features.length) {
    features.forEach((f) => {
      layer
        .getSource()
        .getFeatures()
        .forEach((feat) => {
          if (f.ol_uid === feat.ol_uid) {
            layer.getSource().removeFeature(feat);
          }
        });
    });
  } else {
    layer.getSource().clear();
  }
}

/**
 *添加气泡框
 *
 * @export
 * @param {*} map地图实例
 * @param {*} option配置项
 */
export function addPopUp(TMap, option, closeCallBack) {
  if (option?.targetId) {
    const overlay = new ol.Overlay({
      element: document.getElementById(option.targetId),
      position: [option.lng, option.lat],
      className: option?.className,
      positioning: option?.positioning ? option.positioning : "bottom-center",
      offset: option?.offset,
      insertFirst:
        option.insertFirst !== undefined ? option.insertFirst : false,
      id: option?.id,
      stopEvent: option?.stopEvent,
    });
    TMap.addOverlay(overlay);
    const element = document.getElementById(option.targetId);
    if (option.closeClassName) {
      element.querySelector("." + option.closeClassName).onclick = () => {
        removeOverlay(TMap, overlay);
        if (closeCallBack) {
          closeCallBack();
        }
      };
    }
    return overlay;
  } else {
    const element = document.createElement("div");
    element.innerHTML = option?.elementHtml
      ? option.elementHtml
      : `<div style='padding:15px 25px;background: rgba(0,0,0,0.8000);
      box-shadow: 0px 4px 8px 0px rgba(0,0,0,0.1200);color:#fff;border-radius:5px;'>${
        option?.text ? option.text : "请配置text字段展示信息"
      }
        <span style='position:absolute;width:0;height:0;border-width:8px;border-style:solid;border-color:rgba(0,0,0,0.8000) transparent transparent transparent;bottom:-14px;left:50%;transform:translateX(-50%);z-index:2;'></span>
        <span class='t-map-ol-pop-up-close' style='position:absolute;right:6px;top:2px;cursor:pointer;color:#fff'>✕</span>
        </div>`;
    const overlay = new ol.Overlay({
      element: element,
      position: [option.lng, option.lat],
      className: option?.className,
      positioning: option?.positioning ? option.positioning : "bottom-center",
      offset: option?.offset,
      insertFirst:
        option.insertFirst !== undefined ? option.insertFirst : false,
      id: option?.id,
      stopEvent: option?.stopEvent,
    });
    TMap.addOverlay(overlay);
    const ele = element.querySelector(
      option?.closeClassName
        ? "." + option.closeClassName
        : ".t-map-ol-pop-up-close"
    );
    if (ele) {
      ele.onclick = () => {
        removeOverlay(TMap, overlay);
        if (closeCallBack) {
          closeCallBack();
        }
      };
    }

    return overlay;
  }
}

/**
 *轨迹线路上图
 *
 * @export
 * @param {*} TMap
 * @param {*} option
 */
export function showStringLine(TMap, option) {
  const coordinates = option.coordinates.map((item) => {
    return [item.lng, item.lat];
  });
  const LineString = new ol.geom.LineString(coordinates);
  const lineFeature = new ol.Feature({
    geometry: LineString,
  });

  function styleFunction(feature) {
    const geometry = feature.getGeometry();
    const styles = [];
    if (option?.showArrow) {
      const svg = option.svg
        ? option.svg
        : `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${
      option?.arrowWidth ? option.arrowWidth : "30"
    }" height="${
            option?.arrowHeight ? option.arrowHeight : "30"
          }"><path fill="none" d="M0 0h24v24H0z"/><path d="M13.172 12l-4.95-4.95 1.414-1.414L16 12l-6.364 6.364-1.414-1.414z" fill="${
            option?.arrowColor
              ? option.arrowColor
              : option?.strokeColor
              ? option.strokeColor
              : "#000"
          }"/></svg>`;
      const icon = new Image();
      icon.src = "data:image/svg+xml," + encodeURIComponent(svg);

      geometry.forEachSegment(function (start, end) {
        const dx = end[0] - start[0];
        const dy = end[1] - start[1];
        const rotation = Math.atan2(dy, dx);
        styles.push(
          new ol.style.Style({
            geometry: new ol.geom.Point(end),
            image: new ol.style.Icon({
              img: icon,
              imgSize:
                option?.arrowWidth && option?.arrowHeight
                  ? [option?.arrowWidth, option?.arrowHeight]
                  : [30, 30],
              anchor: [0.5, 0.5],
              rotateWithView: true,
              rotation: -rotation,
              // scale: TMap.getView().getZoom() / 10,
            }),
          })
        );
      });
    }

    styles.push(
      new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: option?.strokeColor ? option.strokeColor : "#000",
          width: option?.strokeWidth ? option.strokeWidth : 3,
          lineDash: option?.strokeDash ? option.strokeDash : [1],
        }),
      })
    );
    return styles;
  }
  const lineLayer = new ol.layer.Vector({
    source: new ol.source.Vector({
      features: [lineFeature],
    }),
    style: styleFunction,
  });

  TMap.addLayer(lineLayer);
  TMap.renderSync(); //强制触发箭头渲染
  return lineLayer;
}

/**
 *内部箭头的轨迹线路上图
 *
 * @export
 * @param {*} TMap
 * @param {*} option
 */
export function showInnerArrowLine(TMap, option) {
  const coordinates = option.coordinates.map((item) => {
    return [item.lng, item.lat];
  });
  const LineString = new ol.geom.LineString(coordinates);
  const lineFeature = new ol.Feature({
    geometry: LineString,
  });
  function styleFunction(feature, resolution) {
    const svg = option.svg
      ? option.svg
      : `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${
      option?.arrowWidth ? option.arrowWidth : "24"
    }" height="${
          option?.arrowHeight ? option.arrowHeight : "24"
        }"><path fill="none" d="M0 0h24v24H0z"/><path d="M13.172 12l-4.95-4.95 1.414-1.414L16 12l-6.364 6.364-1.414-1.414z" fill="${
          option?.arrowColor ? option.arrowColor : "#fff"
        }"/></svg>`;
    const icon = new Image();
    icon.src = "data:image/svg+xml," + encodeURIComponent(svg);
    const geometry = feature.getGeometry();
    const length = geometry.getLength(); //获取线段长度
    const arrowDistance = option?.arrowDistance ? option?.arrowDistance : 70;
    const radio = (arrowDistance * resolution) / length;
    const styles = [
      new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: option?.strokeColor ? option.strokeColor : "#337eff",
          width: option?.strokeWidth ? option.strokeWidth : 10,
        }),
      }),
    ];
    for (let i = 0; i <= 1; i += radio) {
      if (i === 0) continue;
      const arrowLocation = geometry.getCoordinateAt(i);
      geometry.forEachSegment(function (start, end) {
        if (start[0] === end[0] || start[1] === end[1]) return;
        const dx1 = end[0] - arrowLocation[0];
        const dy1 = end[1] - arrowLocation[1];
        const dx2 = arrowLocation[0] - start[0];
        const dy2 = arrowLocation[1] - start[1];
        if (dx1 !== dx2 && dy1 !== dy2) {
          if (Math.abs(10000 * dx1 * dy2 - 10000 * dx2 * dy1) < 0.001) {
            const dx = end[0] - start[0];
            const dy = end[1] - start[1];
            const rotation = Math.atan2(dy, dx);
            styles.push(
              new ol.style.Style({
                geometry: new ol.geom.Point(arrowLocation),
                image: new ol.style.Icon({
                  img: icon,
                  imgSize:
                    option?.arrowWidth && option?.arrowHeight
                      ? [option?.arrowWidth, option?.arrowHeight]
                      : [24, 24],
                  anchor: [0.5, 0.5],
                  rotateWithView: true,
                  rotation: -rotation,
                }),
              })
            );
          }
        }
      });
    }
    return styles;
  }

  const lineLayer = new ol.layer.Vector({
    source: new ol.source.Vector({
      features: [lineFeature],
    }),
    style: styleFunction,
  });

  TMap.addLayer(lineLayer);
  TMap.renderSync(); //强制触发箭头渲染
  return lineLayer;
}

/**
 *获取两点间距
 *
 * @export
 * @param {*} startCoordinate
 * @param {*} endCoordinate
 * @param {*} radius (defaults to 6371008.8)
 * @return {*}
 */
export function getDistance(startLngLat, endLngLat, radius) {
  const coord1 = [startLngLat.lng, startLngLat.lat];
  const coord2 = [endLngLat.lng, endLngLat.lat];
  const distance = ol.sphere.getDistance(coord1, coord2, radius);
  return distance;
}

/**
 *获取地理中心点
 *
 * @export
 * @param {*} coordinatesArr
 * @return {*}
 */
export function getGeoCenterFromLngLats(lngLatArr) {
  if (lngLatArr.length === 0) {
    return;
  }
  if (lngLatArr.length === 1) {
    return {
      lng: lngLatArr[0].lng,
      lng: lngLatArr[0].lat,
      center: [lngLatArr[0].lng, lngLatArr[0].lat],
    };
  }
  const { extent } = getCoordinatesExtent(lngLatArr);
  const center = ol.extent.getCenter(extent);
  return { lng: center[0], lat: center[1], center, extent };
}

/**
 *根据步长（m）分割点位数组
 *
 * @export
 * @param {*} coordinatesArr
 * @param {*} stepLength
 * @return {*}
 */
export function getSplittedCoordinates(coordinatesArr, stepLength) {
  const splittedCoordinates = [];
  for (let i = 0; i < coordinatesArr.length - 1; i++) {
    const distance = getDistance(coordinatesArr[i], coordinatesArr[i + 1]);
    const splitNumber = Math.round(distance / stepLength);
    let startLng = coordinatesArr[i].lng;
    let startLat = coordinatesArr[i].lat;
    for (let j = 0; j < splitNumber; j++) {
      const lng =
        startLng +
        ((coordinatesArr[i + 1].lng - coordinatesArr[i].lng) / splitNumber) * j;
      const lat =
        startLat +
        ((coordinatesArr[i + 1].lat - coordinatesArr[i].lat) / splitNumber) * j;
      splittedCoordinates.push({ lng, lat });
    }
  }
  splittedCoordinates.push(coordinatesArr[coordinatesArr.length - 1]);
  return splittedCoordinates;
}

/**
 *
 *通过requestAnimationFrame封装计时器
 * @export
 * @param {*} cb 回调
 * @param {*} time 时间
 */
export const animationInterval = {
  timer: null,
  start: function (callback, interval) {
    let startTime = new Date().valueOf();
    let endTime = new Date().valueOf();
    const loop = () => {
      this.timer = requestAnimationFrame(loop);
      endTime = new Date().valueOf();
      if (endTime - startTime >= interval) {
        endTime = startTime = new Date().valueOf();
        callback && callback();
      }
    };
    this.timer = requestAnimationFrame(loop);
    return this.timer;
  },
  clear: function () {
    cancelAnimationFrame(this.timer);
  },
};

/**
 *开始轨迹移动
 *
 * @export
 * @param {*} TMap
 * @param {*} marker
 * @param {*} lineOption
 */
export function startOverlayAnimationMove(TMap, marker, lineOption) {
  const markerParent = document.createElement("div");
  markerParent.innerHTML = marker.elementHtml;
  const overlay = new ol.Overlay({
    element: markerParent,
    className: marker?.className,
    positioning: marker?.positioning ? marker.positioning : "center-center",
    offset: marker?.offset,
    insertFirst: marker.insertFirst !== undefined ? marker.insertFirst : false,
  });
  TMap.addOverlay(overlay);
  const splittedCoordinates = getSplittedCoordinates(
    lineOption.coordinates,
    lineOption.stepLength
  );
  let i = 0;
  const animation = animationInterval;
  animation.start(() => {
    overlay.setPosition([
      splittedCoordinates[i].lng,
      splittedCoordinates[i].lat,
    ]);
    i++;
    if (i === splittedCoordinates.length) {
      if (lineOption?.isReplay) {
        i = 0;
      } else {
        animation.clear();
      }
    }
  }, lineOption.stepTime);
  const animationOverlay = { animation, overlay };
  return animationOverlay;
}

/**
 *清除动画（计时器及overlay）
 *
 * @export
 * @param {*} TMap
 * @param {*} animationOverlay
 */
export function clearOverlayAnimationMove(TMap, animationOverlay) {
  animationOverlay.animation.clear();
  removeOverlay(TMap, animationOverlay.overlay);
}

/**
 *开始轨迹移动动画
 *
 * @export
 * @param {*} TMap
 * @param {*} marker
 * @param {*} lineOption
 * @return {*}
 */
export function startIconAnimationMove(TMap, marker, lineOption) {
  const markerFeature = new ol.Feature({
    geometry: new ol.geom.Point([
      lineOption.coordinates[0].lng,
      lineOption.coordinates[0].lat,
    ]),
  });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32"><path fill="none" d="M0 0h24v24H0z"/><path d="M7.617 8.712l3.205-2.328A1.995 1.995 0 0 1 12.065 6a2.616 2.616 0 0 1 2.427 1.82c.186.583.356.977.51 1.182A4.992 4.992 0 0 0 19 11v2a6.986 6.986 0 0 1-5.402-2.547l-.697 3.955 2.061 1.73 2.223 6.108-1.88.684-2.04-5.604-3.39-2.845a2 2 0 0 1-.713-1.904l.509-2.885-.677.492-2.127 2.928-1.618-1.176L7.6 8.7l.017.012zM13.5 5.5a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm-2.972 13.181l-3.214 3.83-1.532-1.285 2.976-3.546.746-2.18 1.791 1.5-.767 1.681z" fill="#000"/></svg>`;

  const icon = new Image();
  icon.src = marker.src
    ? marker.src
    : "data:image/svg+xml," + encodeURIComponent(svg);
  icon.onload = () => {
    const scale = marker?.showWidth / icon.width;
    const iconStyle = new ol.style.Style({
      image: new ol.style.Icon({
        src: marker?.src,
        anchor: marker?.anchor ? marker.anchor : [0.5, 1],
        offset: marker?.offset,
        scale: marker?.showWidth ? scale : 1,
        img: !marker.src ? (marker?.img ? marker.img : icon) : marker?.img,
        imgSize: !marker.src
          ? marker?.imgSize
            ? marker.imgSize
            : [32, 32]
          : marker?.imgSize,
      }),
    });
    markerFeature.setStyle(iconStyle);
  };
  const markerLayer = new ol.layer.Vector({
    source: new ol.source.Vector({
      features: [markerFeature],
    }),
  });

  TMap.addLayer(markerLayer);

  const splittedCoordinates = getSplittedCoordinates(
    lineOption.coordinates,
    lineOption.stepLength
  );
  let i = 0;
  const animation = animationInterval;
  animation.start(() => {
    markerFeature.setGeometry(
      new ol.geom.Point([
        splittedCoordinates[i].lng,
        splittedCoordinates[i].lat,
      ])
    );
    i++;
    if (i === splittedCoordinates.length) {
      if (lineOption?.isReplay) {
        i = 0;
      } else {
        animation.clear();
      }
    }
  }, lineOption.stepTime);
  const animationIcon = { animation: animation, layer: markerLayer };
  return animationIcon;
}

/**
 *清除动画（计时器及icon layer）
 *
 * @export
 * @param {*} TMap
 * @param {*} animationLayer
 */
export function clearIconAnimationMove(TMap, animationIcon) {
  animationIcon.animation.clear();
  removeLayer(TMap, animationIcon.layer);
}

/**
 *添加自动聚合图层
 *
 * @export
 * @param {*} TMap
 * @param {*} clusterOption
 */
export function addClusterLayer(TMap, clusterOption) {
  const clusterSource = new ol.source.Vector();
  const clusterLayer = new ol.layer.Vector({
    source: new ol.source.Cluster({
      source: clusterSource,
      distance: clusterOption.distance ? clusterOption.distance : 48,
    }),
    style: function (feature) {
      const featureNum = feature.get("features").length;
      if (featureNum === 1) {
        const marker = feature.get("features")[0].values_.data;
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48"><path fill="none" d="M0 0h24v24H0z"/><path d="M18.364 17.364L12 23.728l-6.364-6.364a9 9 0 1 1 12.728 0zM12 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="red"/></svg>`;
        const icon = new Image();
        icon.src = marker.src
          ? marker.src
          : "data:image/svg+xml," + encodeURIComponent(svg);
        const showText = marker.showText === undefined ? true : marker.showText;
        const style = new ol.style.Style({
          image: new ol.style.Icon({
            src: marker?.src,
            anchor: marker?.anchor ? marker.anchor : [0.5, 0.5],
            offset: marker?.offset,
            scale: marker?.scale ? marker.scale : 1,
            img: !marker.src ? (marker?.img ? marker.img : icon) : marker?.img,
            imgSize: !marker.src
              ? marker?.imgSize
                ? marker.imgSize
                : [48, 48]
              : marker?.imgSize,
          }),
          text: new ol.style.Text({
            font: marker?.font ? marker.font : "normal 13px sans-serif",
            textAlign: marker?.textAlign ? marker.textAlign : "center",
            textBaseline: "middle",
            offsetY: marker?.offsetY ? marker.offsetY : 0,
            offsetX: marker?.offsetX ? marker.offsetX : 0,
            fill: new ol.style.Fill({
              color: marker?.textColor ? marker.textColor : "#000",
            }),
            padding: marker?.padding ? marker.padding : [5, 5, 5, 5],
            text: showText ? `${marker?.text ? marker.text : ""}` : "",
          }),
        });
        return style;
      } else {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48"><path fill="none" d="M0 0h24v24H0z"/><path d="M17.657 15.657L12 21.314l-5.657-5.657a8 8 0 1 1 11.314 0zM5 22h14v2H5v-2z" fill="rgba(255,53,32,1)"/></svg>`;
        const icon = new Image();
        icon.src = clusterOption.src
          ? clusterOption.src
          : "data:image/svg+xml," + encodeURIComponent(svg);
        const showNum =
          clusterOption.showNum === undefined ? true : clusterOption.showNum;
        const style = new ol.style.Style({
          image: new ol.style.Icon({
            src: clusterOption?.src,
            anchor: clusterOption?.anchor ? clusterOption.anchor : [0.5, 0.5],
            offset: clusterOption?.offset,
            scale: clusterOption?.scale ? clusterOption.scale : 1,
            img: !clusterOption.src
              ? clusterOption?.img
                ? clusterOption.img
                : icon
              : clusterOption?.img,
            imgSize: !clusterOption.src
              ? clusterOption?.imgSize
                ? clusterOption.imgSize
                : [48, 48]
              : clusterOption?.imgSize,
          }),
          text: new ol.style.Text({
            text: showNum ? featureNum.toString() : "",
            fill: new ol.style.Fill({
              color: clusterOption?.textColor
                ? clusterOption.textColor
                : "#000",
            }),
            font: clusterOption?.font
              ? clusterOption.font
              : "normal 13px sans-serif",
            justify: clusterOption?.justify,
            textAlign: clusterOption?.textAlign,
            offsetX: clusterOption?.offsetX,
            offsetY: clusterOption?.offsetY,
          }),
        });

        return style;
      }
    },
  });
  TMap.addLayer(clusterLayer);
  return { clusterLayer, clusterSource };
}

/**
 *添加基于类型自动聚合图层（聚合图标src由addMarkersToClusterSource中markers的clusterSrc决定）
 *
 * @export
 * @param {*} TMap
 * @param {*} clusterOption
 */
export function addClusterLayerByClusterSrc(TMap, clusterOption) {
  const clusterSource = new ol.source.Vector();
  const clusterLayer = new ol.layer.Vector({
    source: new ol.source.Cluster({
      source: clusterSource,
      distance: clusterOption.distance ? clusterOption.distance : 48,
    }),
    style: function (feature) {
      const featureNum = feature.get("features").length;
      if (featureNum === 1) {
        const marker = feature.get("features")[0].values_.data;
        const showText = marker.showText === undefined ? true : marker.showText;
        const style = new ol.style.Style({
          image: new ol.style.Icon({
            src: marker?.src,
            anchor: marker?.anchor ? marker.anchor : [0.5, 0.5],
            offset: marker?.offset,
            scale: marker?.scale ? marker.scale : 1,
          }),
          text: new ol.style.Text({
            font: marker?.font ? marker.font : "normal 13px sans-serif",
            textAlign: marker?.textAlign ? marker.textAlign : "center",
            textBaseline: "middle",
            offsetY: marker?.offsetY ? marker.offsetY : 0,
            offsetX: marker?.offsetX ? marker.offsetX : 0,
            fill: new ol.style.Fill({
              color: marker?.textColor ? marker.textColor : "#000",
            }),
            padding: marker?.padding ? marker.padding : [5, 5, 5, 5],
            text: showText ? `${marker?.text ? marker.text : ""}` : "",
          }),
        });
        return style;
      } else {
        const showNum =
          clusterOption.showNum === undefined ? true : clusterOption.showNum;
        const style = new ol.style.Style({
          image: new ol.style.Icon({
            src: feature.get("features")[0].values_.data.clusterSrc,
            anchor: clusterOption?.anchor ? clusterOption.anchor : [0.5, 0.5],
            offset: clusterOption?.offset,
            scale: clusterOption?.scale ? clusterOption.scale : 1,
          }),
          text: new ol.style.Text({
            text: showNum ? featureNum.toString() : "",
            fill: new ol.style.Fill({
              color: feature.get("features")[0].values_.data.clusterTextColor
                ? feature.get("features")[0].values_.data.clusterTextColor
                : "#000",
            }),
            font: clusterOption?.font
              ? clusterOption.font
              : "normal 13px sans-serif",
            justify: clusterOption?.justify,
            textAlign: clusterOption?.textAlign,
            offsetX: clusterOption?.offsetX,
            offsetY: clusterOption?.offsetY,
          }),
        });
        return style;
      }
    },
  });
  TMap.addLayer(clusterLayer);
  return { clusterLayer, clusterSource };
}

/**
 *添加只有文字聚合的图层
 *
 * @export
 * @param {*} TMap
 * @param {*} clusterOption
 * @return {*}
 */
export function addOnlyTextClusterLayer(TMap, clusterOption) {
  const textClusterSource = new ol.source.Vector();
  const textClusterLayer = new ol.layer.Vector({
    source: new ol.source.Cluster({
      source: textClusterSource,
      distance: clusterOption.distance ? clusterOption.distance : 48,
    }),
    style: function (feature) {
      const featureNum = feature.get("features").length;
      if (featureNum === 1) {
        const marker = feature.get("features")[0].values_.data;
        const showText = marker.showText === undefined ? true : marker.showText;
        const style = new ol.style.Style({
          text: new ol.style.Text({
            font: marker?.font ? marker.font : "normal 13px sans-serif",
            textAlign: marker?.textAlign ? marker.textAlign : "center",
            textBaseline: "middle",
            offsetY: marker?.offsetY ? marker.offsetY : -45,
            offsetX: marker?.offsetX ? marker.offsetX : 0,
            backgroundFill: new ol.style.Fill({
              color: marker?.textBackground ? marker.textBackground : "#fff",
            }),
            backgroundStroke: new ol.style.Stroke({
              color: marker?.borderColor ? marker.borderColor : "#fff",
              width: marker?.borderWidth ? marker.borderWidth : 7,
            }),
            fill: new ol.style.Fill({
              color: marker?.textColor ? marker.textColor : "#337EFF",
            }),
            padding: marker?.padding ? marker.padding : [5, 5, 5, 5],
            text: showText ? `${marker?.text ? marker.text : ""}` : "",
          }),
        });
        return style;
      } else {
        const showText =
          clusterOption.showText === undefined ? true : clusterOption.showText;
        const style = new ol.style.Style({
          text: new ol.style.Text({
            font: clusterOption?.font
              ? clusterOption.font
              : "normal 13px sans-serif",
            textAlign: clusterOption?.textAlign
              ? clusterOption.textAlign
              : "center",
            textBaseline: "middle",
            offsetY: clusterOption?.offsetY ? clusterOption.offsetY : -45,
            offsetX: clusterOption?.offsetX ? clusterOption.offsetX : 0,
            backgroundFill: new ol.style.Fill({
              color: clusterOption?.textBackground
                ? clusterOption.textBackground
                : "#fff",
            }),
            backgroundStroke: new ol.style.Stroke({
              color: clusterOption?.borderColor
                ? clusterOption.borderColor
                : "#fff",
              width: clusterOption?.borderWidth ? clusterOption.borderWidth : 7,
            }),
            fill: new ol.style.Fill({
              color: clusterOption?.textColor
                ? clusterOption.textColor
                : "#337EFF",
            }),
            padding: clusterOption?.padding ? marker.padding : [5, 5, 5, 5],
            text: showText
              ? [
                  feature.get("features")[0].values_.data.text + ",",
                  "normal 13px sans-serif",
                  "...+" + (featureNum - 1),
                  "bold 12px sans-serif",
                ]
              : "",
          }),
        });
        return style;
      }
    },
  });
  TMap.addLayer(textClusterLayer);
  return { textClusterLayer, textClusterSource };
}

/**
 *往聚合图层源添加点位
 *
 * @export
 * @param {*} clusterSource
 * @param {*} markers
 */
export function addMarkersToClusterSource(clusterSource, markers) {
  const features = markers.map((point) => {
    const feature = new ol.Feature({
      geometry: new ol.geom.Point([Number(point.lng), Number(point.lat)]),
      data: point,
    });
    return feature;
  });
  clusterSource.addFeatures(features);
  return features;
}

/**
 *清除层源上的要素
 *
 * @export
 * @param {*} source
 * @param {*} features
 */
export function removeFeaturesOnSource(source, features) {
  if (features && features.length) {
    features.forEach((f) => {
      source.getFeatures().forEach((feat) => {
        if (f.ol_uid === feat.ol_uid) {
          source.removeFeature(feat);
        }
      });
    });
  } else {
    source.clear();
  }
}

/**
 *改变聚合点及标记点的样式
 *
 * @export
 * @param {*} feature
 * @param {*} marker
 * @param {*} clusterOption
 */
export function setMarkerStyle(feature, marker, clusterOption) {
  const type = feature.values_.features.length === 1 ? "feature" : "cluster";
  if (type === "feature") {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48"><path fill="none" d="M0 0h24v24H0z"/><path d="M18.364 17.364L12 23.728l-6.364-6.364a9 9 0 1 1 12.728 0zM12 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="red"/></svg>`;
    const icon = new Image();
    icon.src = marker.src
      ? marker.src
      : "data:image/svg+xml," + encodeURIComponent(svg);
    const showText = marker.showText === undefined ? true : marker.showText;
    const style = new ol.style.Style({
      image: new ol.style.Icon({
        src: marker?.src,
        anchor: marker?.anchor ? marker.anchor : [0.5, 0.5],
        offset: marker?.offset,
        scale: marker?.scale ? marker.scale : 1,
        img: !marker.src ? (marker?.img ? marker.img : icon) : marker?.img,
        imgSize: !marker.src
          ? marker?.imgSize
            ? marker.imgSize
            : [48, 48]
          : marker?.imgSize,
      }),
      text: new ol.style.Text({
        font: marker?.font ? marker.font : "normal 13px sans-serif",
        textAlign: marker?.textAlign ? marker.textAlign : "center",
        textBaseline: "middle",
        offsetY: marker?.offsetY ? marker.offsetY : 0,
        offsetX: marker?.offsetX ? marker.offsetX : 0,
        fill: new ol.style.Fill({
          color: marker?.textColor ? marker.textColor : "#000",
        }),
        padding: marker?.padding ? marker.padding : [5, 5, 5, 5],
        text: showText ? `${marker?.text ? marker.text : ""}` : "",
      }),
    });
    feature.setStyle(style);
  } else if (type === "cluster") {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48"><path fill="none" d="M0 0h24v24H0z"/><path d="M17.657 15.657L12 21.314l-5.657-5.657a8 8 0 1 1 11.314 0zM5 22h14v2H5v-2z" fill="rgba(255,53,32,1)"/></svg>`;
    const icon = new Image();
    icon.src = clusterOption.src
      ? clusterOption.src
      : "data:image/svg+xml," + encodeURIComponent(svg);
    const showNum =
      clusterOption.showNum === undefined ? true : clusterOption.showNum;
    const style = new ol.style.Style({
      image: new ol.style.Icon({
        src: clusterOption?.src,
        anchor: clusterOption?.anchor ? clusterOption.anchor : [0.5, 0.5],
        offset: clusterOption?.offset,
        scale: clusterOption?.scale ? clusterOption.scale : 1,
        img: !clusterOption.src
          ? clusterOption?.img
            ? clusterOption.img
            : icon
          : clusterOption?.img,
        imgSize: !clusterOption.src
          ? clusterOption?.imgSize
            ? clusterOption.imgSize
            : [48, 48]
          : clusterOption?.imgSize,
      }),
      text: new ol.style.Text({
        text: showNum ? feature.values_.features.length.toString() : "",
        fill: new ol.style.Fill({
          color: clusterOption?.textColor ? clusterOption.textColor : "#000",
        }),
        font: clusterOption?.font
          ? clusterOption.font
          : "normal 13px sans-serif",
        justify: clusterOption?.justify,
        textAlign: clusterOption?.textAlign,
        offsetX: clusterOption?.offsetX,
        offsetY: clusterOption?.offsetY,
      }),
    });
    feature.setStyle(style);
  }
}

/**
 *设置聚合文字样式
 *
 * @export
 * @param {*} feature
 * @param {*} marker
 * @param {*} clusterOption
 */
export function setTextStyle(feature, marker, clusterOption) {
  const type = feature.values_.features.length === 1 ? "feature" : "cluster";
  if (type === "feature") {
    const showText = marker.showText === undefined ? true : marker.showText;
    const style = new ol.style.Style({
      text: new ol.style.Text({
        font: marker?.font ? marker.font : "normal 13px sans-serif",
        textAlign: marker?.textAlign ? marker.textAlign : "center",
        textBaseline: "middle",
        offsetY: marker?.offsetY ? marker.offsetY : -45,
        offsetX: marker?.offsetX ? marker.offsetX : 0,
        backgroundFill: new ol.style.Fill({
          color: marker?.textBackground ? marker.textBackground : "#fff",
        }),
        backgroundStroke: new ol.style.Stroke({
          color: marker?.borderColor ? marker.borderColor : "#fff",
          width: marker?.borderWidth ? marker.borderWidth : 7,
        }),
        fill: new ol.style.Fill({
          color: marker?.textColor ? marker.textColor : "#337EFF",
        }),
        padding: marker?.padding ? marker.padding : [5, 5, 5, 5],
        text: showText ? `${marker?.text ? marker.text : ""}` : "",
      }),
    });
    feature.setStyle(style);
  } else if (type === "cluster") {
    const showText =
      clusterOption.showText === undefined ? true : clusterOption.showText;
    const style = new ol.style.Style({
      text: new ol.style.Text({
        font: clusterOption?.font
          ? clusterOption.font
          : "normal 13px sans-serif",
        textAlign: clusterOption?.textAlign
          ? clusterOption.textAlign
          : "center",
        textBaseline: "middle",
        offsetY: clusterOption?.offsetY ? clusterOption.offsetY : -45,
        offsetX: clusterOption?.offsetX ? clusterOption.offsetX : 0,
        backgroundFill: new ol.style.Fill({
          color: clusterOption?.textBackground
            ? clusterOption.textBackground
            : "#fff",
        }),
        backgroundStroke: new ol.style.Stroke({
          color: clusterOption?.borderColor
            ? clusterOption.borderColor
            : "#fff",
          width: clusterOption?.borderWidth ? clusterOption.borderWidth : 7,
        }),
        fill: new ol.style.Fill({
          color: clusterOption?.textColor ? clusterOption.textColor : "#337EFF",
        }),
        padding: clusterOption?.padding ? marker.padding : [5, 5, 5, 5],
        text: showText
          ? [
              feature.get("features")[0].values_.data.text + ",",
              "normal 13px sans-serif",
              "...+" + (feature.values_.features.length - 1),
              "bold 12px sans-serif",
            ]
          : "",
      }),
    });
    feature.setStyle(style);
  }
}
/**
 *坐标数组转为WKT (仅支持POINT LINE POLYGON)
 *
 * @export
 * @param {*} type
 * @param {*} coordinates
 * @return {*}
 */
export function transformCoordToWKT(type, coordinates) {
  switch (type) {
    case "polygon":
      const polygon = new ol.geom.Polygon([coordinates]);
      const polygonWKT = new ol.format.WKT().writeGeometry(polygon, {
        decimals: 6,
      });
      return polygonWKT;
    case "point":
      const point = new ol.geom.Point(coordinates);
      const pointWKT = new ol.format.WKT().writeGeometry(point, {
        decimals: 6,
      });
      return pointWKT;
    case "line":
      const LineString = new ol.geom.LineString(coordinates);
      const lineWKT = new ol.format.WKT().writeGeometry(LineString, {
        decimals: 6,
      });
      return lineWKT;
  }
}

/**
 *WKT字符串转为坐标数组，输出格式为[lng,lat] (仅支持POINT LINE POLYGON)
 *
 * @export
 * @param {*} WKT
 * @param {*} type
 * @return {*}
 */
export function transformWKTToCoord(WKT, type) {
  const WKTType = type
    ? type
    : WKT.includes("POINT")
    ? "point"
    : WKT.includes("POLYGON")
    ? "polygon"
    : "line";
  switch (WKTType) {
    case "polygon":
      const polygonFeature = new ol.format.WKT().readFeature(WKT);
      return polygonFeature.getGeometry().getCoordinates()[0];
    case "point":
      const pointFeature = new ol.format.WKT().readFeature(WKT);
      return pointFeature.getGeometry().getCoordinates();
    case "line":
      const lineFeature = new ol.format.WKT().readFeature(WKT);
      return lineFeature.getGeometry().getCoordinates();
  }
}

/**
 *WKT字符串转为geojson，输出格式为geojson (仅支持POINT LINE POLYGON)
 *
 * @export
 * @param {*} WKT
 * @param {*} type feature 和 geometry
 * @return {*}
 */
export function transformWKTToGeojson(WKT, type) {
  if (type && type === "feature") {
    const feature = new ol.format.WKT().readFeature(WKT);
    return new ol.format.GeoJSON().writeFeature(feature);
  } else if (type && type === "geometry") {
    const geometry = new ol.format.WKT().readGeometry(WKT);
    return new ol.format.GeoJSON().writeGeometry(geometry);
  } else {
    const features = new ol.format.WKT().readFeatures(WKT);
    return new ol.format.GeoJSON().writeFeatures(features);
  }
}

/**
 *WKT字符串集合转为单个geojson（featureCollection），输出格式为geojson (仅支持POINT LINE POLYGON)
 *
 * @export
 * @param {*} WKTArray
 * @return {*}
 */
export function transformWKTArrayToGeojson(WKTArray) {
  const features = WKTArray.map((item) => {
    return new ol.format.WKT().readFeature(item);
  });
  return new ol.format.GeoJSON().writeFeatures(features);
}

/**
 *geojson转为WKT字符串，输出格式为WKT标准格式
 *
 * @export
 * @param {*} GeoJSON
 * @param {*} type
 * @return {*}
 */
export function transformGeojsonToWKT(GeoJSON, type) {
  if (type && type === "feature") {
    const feature = new ol.format.GeoJSON().readFeature(GeoJSON);
    return new ol.format.WKT().writeFeature(feature);
  } else if (type && type === "geometry") {
    const geometry = new ol.format.GeoJSON().readGeometry(GeoJSON);
    return new ol.format.WKT().writeGeometry(geometry);
  } else {
    const features = new ol.format.GeoJSON().readFeatures(GeoJSON);
    return new ol.format.WKT().writeFeatures(features);
  }
}

/**
 *获取WKT要素地理信息
 *
 * @export
 * @param {*} WKT
 * @return {*}
 */
export function getGeoInfoFromWKT(WKT) {
  const geometry = new ol.format.WKT().readGeometry(WKT);
  const extent = geometry.getExtent();
  const center = ol.extent.getCenter(extent);
  return { extent, center };
}

/**
 *获取WKT要素集合的extent和中心
 *
 * @export
 * @param {*} WKTArray
 * @return {*}
 */
export function getGeoInfoFromWKTArray(WKTArray) {
  const geometries = WKTArray.map((item) => {
    return new ol.format.WKT().readFeature(item).getGeometry();
  });
  const geomCollection = new ol.geom.GeometryCollection(geometries);
  const extent = geomCollection.getExtent();
  const center = ol.extent.getCenter(extent);
  return { extent, center };
}

/**
 *添加绘图层
 *
 * @export
 * @param {*} TMap
 * @param {*} drawOption
 * @param {*} callBack
 * @return {*}
 */
export function addDrawLayer(TMap, drawOption, callBack) {
  const drawSource = new ol.source.Vector({});

  drawSource.on("change", (e) => {
    const arr = drawSource.getFeatures().map((item) => {
      if (item.getGeometry().getRadius) {
        const center = item.getGeometry().getCenter();
        const radius = item.getGeometry().getRadius();
        const metersRadius = (radius * getMetersPerUnit(TMap)).toFixed(6);
        const WKT = transformCoordToWKT("point", center);
        const type = "circle";
        const extent = item.getGeometry().getExtent();
        return {
          center,
          radius,
          metersRadius,
          WKT,
          type,
          extent,
        };
      } else {
        const WKT = new ol.format.WKT().writeGeometry(item.getGeometry(), {
          decimals: 6,
        });
        const coord = transformWKTToCoord(WKT);
        const type = WKT.includes("POINT")
          ? "point"
          : WKT.includes("POLYGON")
          ? "polygon"
          : "line";
        const extent = item.getGeometry().getExtent();
        const center = ol.extent.getCenter(extent);
        return {
          WKT,
          coord,
          type,
          extent,
          center,
        };
      }
    });
    const features = drawSource.getFeatures();
    if (callBack) {
      callBack(arr, e, features);
    }
  });
  const drawLayer = new ol.layer.Vector({
    source: drawSource,
    style: new ol.style.Style({
      image: new ol.style.Circle({
        stroke: new ol.style.Stroke({
          color: drawOption?.strokeColor
            ? drawOption.strokeColor
            : "rgb(245, 34, 45)",
          width: drawOption?.strokeWidth ? drawOption?.strokeWidth : 1,
        }),
        fill: new ol.style.Fill({
          color: drawOption?.fillColor
            ? drawOption.fillColor
            : "rgba(245, 34, 45, 0.24)",
        }),
        radius: drawOption?.pointRadius ? drawOption.pointRadius : 2,
      }),
      stroke: new ol.style.Stroke({
        color: drawOption?.strokeColor
          ? drawOption.strokeColor
          : "rgb(245, 34, 45)",
        width: drawOption?.strokeWidth ? drawOption?.strokeWidth : 1,
      }),
      fill: new ol.style.Fill({
        color: drawOption?.fillColor
          ? drawOption.fillColor
          : "rgba(245, 34, 45, 0.24)",
      }),
    }),
  });
  TMap.addLayer(drawLayer);
  return { drawSource, drawLayer };
}

/**
 *
 *
 * @export
 * @param {*} TMap
 * @param {*} drawLayer
 * @param {*} selectOption
 * @param {*} selectedCallBack
 */
export function addLayerSelect(
  TMap,
  drawLayer,
  selectOption,
  selectedCallBack
) {
  const normalStyle = new ol.style.Style({
    image: new ol.style.Circle({
      stroke: new ol.style.Stroke({
        color: selectOption?.strokeColor
          ? selectOption.strokeColor
          : "rgb(51, 126, 255)",
        width: selectOption?.strokeWidth ? selectOption?.strokeWidth : 1,
        lineDash: selectOption?.lineDash
          ? selectOption?.lineDash
          : [3, 3, 3, 3],
      }),
      fill: new ol.style.Fill({
        color: selectOption?.fillColor
          ? selectOption.fillColor
          : "rgba(51, 126, 255,0.24)",
      }),
      radius: selectOption?.pointRadius ? selectOption.pointRadius : 2,
    }),
    stroke: new ol.style.Stroke({
      color: selectOption?.strokeColor
        ? selectOption.strokeColor
        : "rgb(51, 126, 255)",
      width: selectOption?.strokeWidth ? selectOption?.strokeWidth : 1,
      lineDash: selectOption?.lineDash ? selectOption?.lineDash : [0],
    }),
    fill: new ol.style.Fill({
      color: selectOption?.fillColor
        ? selectOption.fillColor
        : "rgba(51, 126, 255,0.24)",
    }),
  });

  const select = new ol.interaction.Select({
    style: normalStyle,
    filter: (feature, layer) => {
      if (layer && layer.ol_uid === drawLayer.ol_uid) {
        return true;
      } else {
        return false;
      }
    },
  });
  TMap.addInteraction(select);
  select.on("select", (e) => {
    const selected = e.selected.map((item) => {
      if (item.getGeometry().getRadius) {
        const center = item.getGeometry().getCenter();
        const radius = item.getGeometry().getRadius();
        const metersRadius = (radius * getMetersPerUnit(TMap)).toFixed(6);
        const WKT = transformCoordToWKT("point", center);
        const type = "circle";
        const extent = item.getGeometry().getExtent();
        return {
          center,
          radius,
          metersRadius,
          WKT,
          type,
          extent,
        };
      } else {
        const WKT = new ol.format.WKT().writeGeometry(item.getGeometry(), {
          decimals: 6,
        });
        const coord = transformWKTToCoord(WKT);
        const type = WKT.includes("POINT")
          ? "point"
          : WKT.includes("POLYGON")
          ? "polygon"
          : "line";
        const extent = item.getGeometry().getExtent();
        const center = ol.extent.getCenter(extent);
        return {
          WKT,
          coord,
          type,
          extent,
          center,
        };
      }
    });
    if (selectedCallBack) {
      selectedCallBack(selected, e);
    }
  });

  return select;
}

/**
 *开始绘制
 *
 * @export
 * @param {*} TMap
 * @param {*} type point line polygon circle
 * @param {*} drawSource 创建的层source
 * @param {*} callBack 绘制完成回调
 * @return {*}
 */
export function beginDraw(TMap, type, drawSource, callBack) {
  TMap.getTargetElement().style.cursor = "none";
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48"><path fill="none" d="M0 0h24v24H0z"/><path d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z" fill="rgba(0,0,0,1)"/></svg>';
  const icon = new Image();
  icon.src = "data:image/svg+xml," + encodeURIComponent(svg);
  const style = new ol.style.Style({
    image: new ol.style.Icon({
      anchor: [0.5, 0.5],
      scale: 1,
      img: icon,
      imgSize: [48, 48],
    }),
    stroke: new ol.style.Stroke({
      color: "rgb(0, 153, 255)",
      width: 2,
    }),
    fill: new ol.style.Fill({
      color: "rgba(0, 153, 255,0.3)",
    }),
  });
  const textStyle = new ol.style.Style({
    text: new ol.style.Text({
      placement: "point",
      font: "normal 13px sans-serif",
      textAlign: "center",
      textBaseline: "middle",
      offsetY: -45,
      offsetX: 0,
      backgroundFill: new ol.style.Fill({
        color: "rgba(255,255,255,0.5)",
      }),
      fill: new ol.style.Fill({
        color: "rgba(0,0,0,0.5)",
      }),
      padding: [5, 5, 5, 5],
      text:
        type === "point"
          ? "点击地图完成绘制，按esc键取消"
          : type === "circle"
          ? "点击地图并拖动绘制圆形，再次点击结束绘制，按esc键取消"
          : "点击地图开始绘制，再次点击更改方向，点击两次结束绘制，按esc键取消",
    }),
  });
  const textFeature = new ol.Feature();
  textFeature.setStyle(textStyle);
  const textLayer = new ol.layer.Vector({
    source: new ol.source.Vector({
      features: [textFeature],
    }),
  });
  TMap.addLayer(textLayer);
  const event = addMapEventListener(TMap, "pointermove", (e) => {
    const geom = new ol.geom.Point(e.coordinate);
    textFeature.setGeometry(geom);
  });

  const snap = new ol.interaction.Snap({
    source: drawSource,
  });
  switch (type) {
    case "point":
      const pointDraw = new ol.interaction.Draw({
        type: "Point",
        source: drawSource,
        style: style,
      });
      TMap.addInteraction(pointDraw);
      TMap.addInteraction(snap);
      const keyPointEvent = (e) => {
        if (e && e.keyCode === 27) {
          removeDraw(TMap, {
            draw: pointDraw,
            textLayer: textLayer,
            pointerEvent: event,
            keyEvent: keyPointEvent,
            snap: snap,
          });
        }
      };
      document.addEventListener("keyup", keyPointEvent);
      pointDraw.on("drawend", (e) => {
        removeDraw(TMap, {
          draw: pointDraw,
          textLayer: textLayer,
          pointerEvent: event,
          keyEvent: keyPointEvent,
          snap: snap,
        });
        const WKT = new ol.format.WKT().writeFeature(e.feature, {
          decimals: 6,
        });
        callBack({ e, WKT, type });
      });
      return {
        draw: pointDraw,
        textLayer: textLayer,
        pointerEvent: event,
        keyEvent: keyPointEvent,
        snap: snap,
      };
    case "line":
      const lineDraw = new ol.interaction.Draw({
        type: "LineString",
        source: drawSource,
        style: style,
      });
      TMap.addInteraction(lineDraw);
      TMap.addInteraction(snap);
      const keyLineEvent = (e) => {
        if (e && e.keyCode === 27) {
          removeDraw(TMap, {
            draw: pointDraw,
            textLayer: textLayer,
            pointerEvent: event,
            keyEvent: keyPointEvent,
            snap: snap,
          });
        }
      };
      document.addEventListener("keyup", keyLineEvent);
      lineDraw.on("drawend", (e) => {
        removeDraw(TMap, {
          draw: lineDraw,
          textLayer: textLayer,
          pointerEvent: event,
          keyEvent: keyLineEvent,
          snap: snap,
        });
        const WKT = new ol.format.WKT().writeFeature(e.feature, {
          decimals: 6,
        });
        callBack({ e, WKT, type });
      });
      return {
        draw: lineDraw,
        textLayer: textLayer,
        pointerEvent: event,
        keyEvent: keyLineEvent,
        snap: snap,
      };
    case "polygon":
      const polygonDraw = new ol.interaction.Draw({
        type: "Polygon",
        source: drawSource,
        style: style,
      });
      TMap.addInteraction(polygonDraw);
      TMap.addInteraction(snap);
      const keyPolygonEvent = (e) => {
        if (e && e.keyCode === 27) {
          removeDraw(TMap, {
            draw: polygonDraw,
            textLayer: textLayer,
            pointerEvent: event,
            keyEvent: keyPolygonEvent,
            snap: snap,
          });
        }
      };
      document.addEventListener("keyup", keyPolygonEvent);
      polygonDraw.on("drawend", (e) => {
        removeDraw(TMap, {
          draw: polygonDraw,
          textLayer: textLayer,
          pointerEvent: event,
          keyEvent: keyPolygonEvent,
          snap: snap,
        });
        const WKT = new ol.format.WKT().writeFeature(e.feature, {
          decimals: 6,
        });
        callBack({ e, WKT, type });
      });
      return {
        draw: polygonDraw,
        textLayer: textLayer,
        pointerEvent: event,
        keyEvent: keyPolygonEvent,
        snap: snap,
      };
    case "circle":
      const circleDraw = new ol.interaction.Draw({
        type: "Circle",
        source: drawSource,
        style: style,
      });
      TMap.addInteraction(circleDraw);
      TMap.addInteraction(snap);
      const keyCircleEvent = (e) => {
        if (e && e.keyCode === 27) {
          removeDraw(TMap, {
            draw: circleDraw,
            textLayer: textLayer,
            pointerEvent: event,
            keyEvent: keyCircleEvent,
            snap: snap,
          });
        }
      };
      document.addEventListener("keyup", keyCircleEvent);
      circleDraw.on("drawend", (e) => {
        removeDraw(TMap, {
          draw: circleDraw,
          textLayer: textLayer,
          pointerEvent: event,
          keyEvent: keyCircleEvent,
          snap: snap,
        });
        const center = e.feature.getGeometry().getCenter();
        const radius = e.feature.getGeometry().getRadius();
        const metersRadius = (radius * getMetersPerUnit(TMap)).toFixed(6);
        const WKT = transformCoordToWKT("point", center);
        callBack({ e, WKT, type, center, radius, metersRadius });
      });
      return {
        draw: circleDraw,
        textLayer: textLayer,
        pointerEvent: event,
        keyEvent: keyCircleEvent,
        snap: snap,
      };
  }
}

/**
 *移除地图交互
 *
 * @export
 * @param {*} TMap
 * @param {*} interaction
 */
export function removeInteraction(TMap, interaction) {
  TMap.getInteractions().array_.forEach((item) => {
    if (item.ol_uid === interaction.ol_uid) {
      TMap.removeInteraction(item);
    }
  });
}

/**
 *移除绘制功能 包括绘图交互，事件监听以及笔触文字层 参数为开始绘制的返回值
 *
 * @export
 * @param {*} TMap
 * @param {*} draw
 */
export function removeDraw(TMap, draw) {
  removeInteraction(TMap, draw.draw);
  removeInteraction(TMap, draw.snap);
  document.removeEventListener("keyup", draw.keyEvent);
  removeMapEventListener(TMap, "pointermove", draw.pointerEvent);
  removeLayer(TMap, draw.textLayer);
  TMap.getTargetElement().style.cursor = "";
}

/**
 *获取每当前投影单位的米长
 *
 * @export
 * @param {*} TMap
 * @return {*}
 */
export function getMetersPerUnit(TMap) {
  const metersPerUnit = TMap.getView().getProjection().getMetersPerUnit();
  return metersPerUnit;
}

/**
 *开始编辑模式
 *
 * @export
 * @param {*} TMap
 * @param {*} drawLayer
 * @param {*} selectOption 选中配置
 * @param {*} selectedCallBack 选中回调
 * @return {*}
 */
export function beginEditMode(
  TMap,
  drawLayer,
  selectOption,
  selectedCallBack,
  editCallBack,
  deleteCallBack,
  modifyCallBack
) {
  const textStyle = new ol.style.Style({
    text: new ol.style.Text({
      placement: "point",
      font: "normal 13px sans-serif",
      textAlign: "center",
      textBaseline: "middle",
      offsetY: -45,
      offsetX: 0,
      backgroundFill: new ol.style.Fill({
        color: "rgba(255,255,255,0.5)",
      }),
      fill: new ol.style.Fill({
        color: "rgba(0,0,0,0.5)",
      }),
      padding: [5, 5, 5, 5],
      text: "拖动区域边界或圆心进行调整，按ESC或鼠标单击空白退出",
    }),
  });
  const textFeature = new ol.Feature();
  textFeature.setStyle(textStyle);
  const textLayer = new ol.layer.Vector({
    source: new ol.source.Vector({
      features: [textFeature],
    }),
  });

  const normalStyle = new ol.style.Style({
    image: new ol.style.Circle({
      stroke: new ol.style.Stroke({
        color: selectOption?.strokeColor
          ? selectOption.strokeColor
          : "rgb(51, 126, 255)",
        width: selectOption?.strokeWidth ? selectOption?.strokeWidth : 1,
        lineDash: selectOption?.lineDash
          ? selectOption?.lineDash
          : [3, 3, 3, 3],
      }),
      fill: new ol.style.Fill({
        color: selectOption?.fillColor
          ? selectOption.fillColor
          : "rgba(51, 126, 255,0.3)",
      }),
      radius: selectOption?.pointRadius ? selectOption.pointRadius : 2,
    }),
    stroke: new ol.style.Stroke({
      color: selectOption?.strokeColor
        ? selectOption.strokeColor
        : "rgb(51, 126, 255)",
      width: selectOption?.strokeWidth ? selectOption?.strokeWidth : 1,
      lineDash: selectOption?.lineDash
        ? selectOption?.lineDash
        : [10, 10, 10, 10],
    }),
    fill: new ol.style.Fill({
      color: selectOption?.fillColor
        ? selectOption.fillColor
        : "rgba(51, 126, 255,0.3)",
    }),
  });

  const select = new ol.interaction.Select({
    style: normalStyle,
    filter: (feature, layer) => {
      if (layer && layer.ol_uid === drawLayer.ol_uid) {
        return true;
      } else {
        return false;
      }
    },
  });
  TMap.addInteraction(select);
  let overlay = [];
  let modify;
  let snap;
  let mouseEvent;
  let keyPointEvent;
  select.on("select", (e) => {
    const selected = e.selected.map((item) => {
      if (item.getGeometry().getRadius) {
        const center = item.getGeometry().getCenter();
        const radius = item.getGeometry().getRadius();
        const metersRadius = (radius * getMetersPerUnit(TMap)).toFixed(6);
        const WKT = transformCoordToWKT("point", center);
        const type = "circle";
        const extent = item.getGeometry().getExtent();
        return {
          center,
          radius,
          metersRadius,
          WKT,
          type,
          extent,
        };
      } else {
        const WKT = new ol.format.WKT().writeGeometry(item.getGeometry(), {
          decimals: 6,
        });
        const coord = transformWKTToCoord(WKT);
        const type = WKT.includes("POINT")
          ? "point"
          : WKT.includes("POLYGON")
          ? "polygon"
          : "line";
        const extent = item.getGeometry().getExtent();
        const center = ol.extent.getCenter(extent);
        return {
          WKT,
          coord,
          type,
          extent,
          center,
        };
      }
    });
    if (e.selected.length > 0) {
      endEditMode(
        TMap,
        undefined,
        {
          modify,
          snap,
          mouseEvent,
          keyPointEvent,
          textLayer,
        },
        { overlay }
      );
      overlay = addOverLayMarkers(TMap, [
        {
          elementHtml: `<div style="color:#000000;width:32px;height:32px;background:#FFFFFF;box-shadow:0px 2px 4px 0px rgba(0,0,0,0.12);border-radius:4px;padding:8px;" class="t-map-ol-operation-box">
													<div class="t-map-ol-tooltip-box" style="padding:6px 8px;background-color:#000000bf;border-radius:2px;box-shadow:0 3px 6px -4px #0000001f, 0 6px 16px #00000014, 0 9px 28px 8px #0000000d;position:absolute;top:-45px;left:-18px;color:#ffffff;font-size:12px;word-break:keep-all;display:none;">
														清除区域
														<span style='position:absolute;width:0;height:0;border-width:4px;border-style:solid;border-color:#000000bf transparent transparent transparent;bottom:-8px;left:50%;transform:translateX(-50%);'></span>
													</div>
													<svg width="16px" height="16px" viewBox="0 0 16 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
														<g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
															<g transform="translate(-1695.000000, -222.000000)">
																<g transform="translate(88.000000, 112.000000)">
																	<g transform="translate(1599.000000, 103.000000)">
																		<g transform="translate(16.000005, 14.999511) rotate(-90.000000) translate(-16.000005, -14.999511) translate(8.000004, 6.999511)">
																			<rect x="2.3879669e-06" y="0" width="16" height="16"></rect>
																			<path d="M15.3844978,2.46100404 L12.4644987,2.46100404 C12.0234988,2.46100404 11.6314989,2.17900412 11.4914989,1.76100425 L11.232499,0.982004485 C11.0379014,0.395112063 10.4888119,-0.000780611762 9.87049944,2.3828976e-06 L6.13050055,2.3828976e-06 C5.51145357,-0.00112224379 4.96187132,0.395932781 4.76850096,0.984004489 L4.50850104,1.76200425 C4.36850108,2.18000412 3.9765012,2.46200404 3.53550132,2.46200404 L0.615502204,2.46200404 C0.275571042,2.46200404 2.3879669e-06,2.73757269 2.3879669e-06,3.07750386 C2.3879669e-06,3.41743502 0.275571042,3.69300367 0.615502204,3.69300367 L1.68250188,3.69300367 L2.31150169,13.1270009 C2.42272313,14.7417303 3.76295053,15.9959561 5.38150077,16.0000024 L10.6214992,16.0000024 C12.2395233,15.9960666 13.5797759,14.7430985 13.6924983,13.1290009 L14.3184981,3.69200367 L15.3844978,3.69200367 C15.724429,3.69200367 16.0000024,3.41643502 16.0000024,3.07650385 C16.0000024,2.73657269 15.724429,2.46100404 15.3844978,2.46100404 Z M5.93450062,1.37100437 C5.96389016,1.28600738 6.04457811,1.22952582 6.13450056,1.23100441 L9.87449943,1.23100441 C9.96249941,1.23100441 10.0404994,1.28700439 10.0694994,1.37000437 L10.3284993,2.14900413 C10.3644993,2.2560041 10.4084993,2.36000407 10.4604993,2.46100404 L5.54750072,2.46100404 C5.59950071,2.36100407 5.64350069,2.2560041 5.67950068,2.14800413 L5.93450062,1.37100437 L5.93450062,1.37100437 Z M12.4624987,13.0440009 C12.3958401,14.0127482 11.5915353,14.7650919 10.6204992,14.7670004 L5.38050077,14.7670004 C4.40946464,14.7650919 3.6051599,14.0127482 3.53850133,13.0440009 L2.91250151,3.69200367 L3.53450133,3.69200367 C3.62150131,3.69000367 3.70850128,3.68300367 3.79450125,3.67100369 C3.82750124,3.68100368 3.86050122,3.68800368 3.89450122,3.69200367 L12.0944988,3.69200367 C12.1283686,3.68785994 12.1618232,3.68083448 12.1944987,3.67100369 C12.2804987,3.68300368 12.3674987,3.69000368 12.4544987,3.69200367 L13.0774985,3.69200367 L12.4624987,13.0440009 Z M10.2564993,7.17800264 L10.2564993,11.2780014 C10.2431837,11.6082872 9.97155361,11.8691871 9.6409995,11.8691871 C9.3104454,11.8691871 9.0388153,11.6082872 9.02549969,11.2780014 L9.02549969,7.17800264 C9.0388153,6.84771684 9.3104454,6.58681697 9.6409995,6.58681697 C9.97155361,6.58681697 10.2431837,6.84771684 10.2564993,7.17800264 Z M6.9745003,7.17800264 L6.9745003,11.2780014 C6.96118468,11.6082872 6.68955459,11.8691871 6.35900048,11.8691871 C6.02844638,11.8691871 5.75681628,11.6082872 5.74350067,11.2780014 L5.74350067,7.17800264 C5.75681628,6.84771684 6.02844638,6.58681697 6.35900048,6.58681697 C6.68955459,6.58681697 6.96118468,6.84771684 6.9745003,7.17800264 L6.9745003,7.17800264 Z" fill="currentColor" fill-rule="nonzero" transform="translate(8.000000, 8.000000) rotate(-270.000000) translate(-8.000000, -8.000000) "></path>
																		</g>
																	</g>
																</g>
												    	</g>
											     	</g>
													</svg>
												</ div>`,
          lng: e.selected[0].values_.geometry.extent_[2],
          lat: e.selected[0].values_.geometry.extent_[3],
          positioning: "bottom-left",
          offset: [45, 20],
          clickEvent: () => {
            endEditMode(
              TMap,
              undefined,
              {
                modify,
                snap,
                mouseEvent,
                keyPointEvent,
                textLayer,
              },
              { overlay }
            );
            removeFeaturesOnLayer(drawLayer, e.selected);
            deleteCallBack && deleteCallBack(e.selected);
          },
        },
        {
          elementHtml: `<div style="color:#000000;width:32px;height:32px;background:#FFFFFF;box-shadow:0px 2px 4px 0px rgba(0,0,0,0.12);border-radius:4px;padding:8px;position:relative;" class="t-map-ol-operation-box">
													<div class="t-map-ol-tooltip-box" style="padding:6px 8px;background-color:#000000bf;border-radius:2px;box-shadow:0 3px 6px -4px #0000001f, 0 6px 16px #00000014, 0 9px 28px 8px #0000000d;position:absolute;top:-45px;left:-18px;color:#ffffff;font-size:12px;word-break:keep-all;display:none;">
														编辑区域
														<span style='position:absolute;width:0;height:0;border-width:4px;border-style:solid;border-color:#000000bf transparent transparent transparent;bottom:-8px;left:50%;transform:translateX(-50%);'></span>
													</div>
													<svg width="16px" height="16px" viewBox="0 0 16 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
														<g  stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
															<g  transform="translate(-1655.000000, -223.000000)">
																<g  transform="translate(88.000000, 112.000000)">
																	<g transform="translate(1559.000000, 103.000000)">
																		<g  transform="translate(8.000000, 8.000000)">
																			<rect transform="translate(8.000000, 8.000000) rotate(-90.000000) translate(-8.000000, -8.000000) " x="0" y="0" width="16" height="16"></rect>
																			<path d="M7.21780535,1 C7.64700876,1 7.99491203,1.34802225 7.99491203,1.77722567 C7.99491203,2.20642909 7.64700876,2.55438562 7.21780535,2.55445133 L2.55445133,2.55445133 L2.55445133,13.4356107 L13.4356107,13.4356107 L13.4356107,8.7722567 L13.4410513,8.68132129 C13.4896208,8.27297442 13.8478674,7.97312932 14.2583858,7.99722899 C14.6689042,8.02132867 14.9896059,8.36103175 14.990062,8.7722567 L14.990062,13.4356107 C14.990062,13.8478768 14.82629,14.2432576 14.5347738,14.5347738 C14.2432576,14.82629 13.8478768,14.990062 13.4356107,14.990062 L2.55445133,14.990062 C1.69595157,14.990062 1,14.2941105 1,13.4356107 L1,2.55445133 C1,1.69595157 1.69595157,1 2.55445133,1 L7.21780535,1 Z M14.7724389,1.22772712 C15.0758537,1.53123363 15.0758537,2.02321771 14.7724389,2.32672422 L7.6281805,9.4717598 C7.32321351,9.76630642 6.83845353,9.76209383 6.53865145,9.46229175 C6.23884937,9.16248966 6.2346368,8.67772969 6.52918342,8.3727627 L13.6734418,1.22850435 C13.9769483,0.925089495 14.4689323,0.925089495 14.7724389,1.22850435 L14.7724389,1.22772712 Z" fill="currentColor" ></path>
																		</g>
																	</g>
																</g>
															</g>
														</g>
													</svg>
												</ div>`,
          lng: e.selected[0].values_.geometry.extent_[2],
          lat: e.selected[0].values_.geometry.extent_[3],
          positioning: "bottom-left",
          offset: [5, 20],
          clickEvent: () => {
            if (
              TMap.getLayers()
                .getArray()
                .some((item) => item.ol_uid === textLayer.ol_uid)
            ) {
              return;
            }
            modify = new ol.interaction.Modify({
              features: select.getFeatures(),
            });
            TMap.addInteraction(modify);
            modify.on("modifyend", (ev) => {
              overlay[0].setPosition([
                ev.features.array_[0].getGeometry().extent_[2],
                ev.features.array_[0].getGeometry().extent_[3],
              ]);
              overlay[1].setPosition([
                ev.features.array_[0].getGeometry().extent_[2],
                ev.features.array_[0].getGeometry().extent_[3],
              ]);
              const geo = ev.features.array_[0].getGeometry();
              let modified;
              if (geo.getRadius) {
                const center = geo.getCenter();
                const radius = geo.getRadius();
                const metersRadius = (radius * getMetersPerUnit(TMap)).toFixed(
                  6
                );
                const WKT = transformCoordToWKT("point", center);
                const type = "circle";
                const extent = geo.getExtent();
                modified = {
                  WKT,
                  metersRadius,
                  radius,
                  type,
                  extent,
                  center,
                };
              } else {
                const WKT = new ol.format.WKT().writeGeometry(geo, {
                  decimals: 6,
                });
                const coord = transformWKTToCoord(WKT);
                const type = WKT.includes("POINT")
                  ? "point"
                  : WKT.includes("POLYGON")
                  ? "polygon"
                  : "line";
                const extent = geo.getExtent();
                const center = ol.extent.getCenter(extent);
                modified = {
                  WKT,
                  coord,
                  type,
                  extent,
                  center,
                };
              }
              modifyCallBack && modifyCallBack({ geo, modified });
            });
            snap = new ol.interaction.Snap({
              features: select.getFeatures(),
            });
            TMap.addInteraction(snap);
            TMap.addLayer(textLayer);

            mouseEvent = addMapEventListener(TMap, "pointermove", (e) => {
              const geom = new ol.geom.Point(e.coordinate);
              textFeature.setGeometry(geom);
            });
            keyPointEvent = (e) => {
              if (e && e.keyCode === 27) {
                endEditMode(
                  TMap,
                  undefined,
                  {
                    modify,
                    snap,
                    mouseEvent,
                    keyPointEvent,
                    textLayer,
                  },
                  undefined
                );
              }
            };
            document.addEventListener("keyup", keyPointEvent);
            editCallBack &&
              editCallBack({
                modify,
                snap,
                mouseEvent,
                keyPointEvent,
                textLayer,
              });
          },
        },
      ]);

      overlay.forEach((overlayItem) => {
        const ele = overlayItem
          .getElement()
          .querySelector(".t-map-ol-operation-box");
        ele.onmouseover = () => {
          ele.style.color = "#337eff";
          ele.querySelector(".t-map-ol-tooltip-box").style.display = "block";
        };
        ele.onmouseout = () => {
          ele.style.color = "#000000";
          ele.querySelector(".t-map-ol-tooltip-box").style.display = "none";
        };
      });
    } else {
      endEditMode(
        TMap,
        undefined,
        {
          modify,
          snap,
          mouseEvent,
          keyPointEvent,
          textLayer,
        },
        { overlay }
      );
    }
    if (selectedCallBack) {
      selectedCallBack(
        e,
        {
          overlay,
        },
        selected
      );
    }
  });

  return { select };
}

/**
 *退出编辑模式
 *
 * @export
 * @param {*} TMap
 * @param {*} edit beginEditMode返回值
 * @param {*} overlay  beginEditMode 第四个参数回调函数第二返回值
 */
export function endEditMode(TMap, interaction, edit, select) {
  if (edit && edit.snap) {
    document.removeEventListener("keyup", edit.keyPointEvent);
    removeMapEventListener(TMap, "pointermove", edit.mouseEvent);
    removeInteraction(TMap, edit.snap);
    removeInteraction(TMap, edit.modify);
    removeLayer(TMap, edit.textLayer);
  }
  if (select && select.overlay.length) {
    removeOverlay(TMap, select.overlay[0]);
    removeOverlay(TMap, select.overlay[1]);
  }
  if (interaction && interaction.select) {
    removeInteraction(TMap, interaction.select);
  }
}

/**
 *WKT区域上图
 *
 * @export
 * @param {*} drawSource
 * @param {*} WKT
 * @param {*} radius
 */
export function addWKTGeoOnSource(drawSource, WKT, radius, drawOption) {
  const style = new ol.style.Style({
    image: new ol.style.Circle({
      stroke: new ol.style.Stroke({
        color: drawOption?.strokeColor
          ? drawOption.strokeColor
          : "rgb(245, 34, 45)",
        width: drawOption?.strokeWidth ? drawOption?.strokeWidth : 1,
      }),
      fill: new ol.style.Fill({
        color: drawOption?.fillColor
          ? drawOption.fillColor
          : "rgba(245, 34, 45, 0.24)",
      }),
      radius: drawOption?.pointRadius ? drawOption.pointRadius : 2,
    }),
    stroke: new ol.style.Stroke({
      color: drawOption?.strokeColor
        ? drawOption.strokeColor
        : "rgb(245, 34, 45)",
      width: drawOption?.strokeWidth ? drawOption?.strokeWidth : 1,
    }),
    fill: new ol.style.Fill({
      color: drawOption?.fillColor
        ? drawOption.fillColor
        : "rgba(245, 34, 45, 0.24)",
    }),
  });
  if (radius) {
    const center = transformWKTToCoord(WKT, "point");
    const circleFeature = new ol.Feature({
      geometry: new ol.geom.Circle(center, radius),
    });
    circleFeature.setStyle(style);
    drawSource.addFeature(circleFeature);
    return circleFeature;
  } else {
    const feature = new ol.format.WKT().readFeature(WKT);
    feature.setStyle(style);
    drawSource.addFeature(feature);
    return feature;
  }
}

/**
 *geoJson区域上图
 *
 * @export
 * @param {*} drawSource
 * @param {*} GeoJson
 */
export function addJsonGeoOnSource(drawSource, GeoJson, drawOption) {
  const style = new ol.style.Style({
    image: new ol.style.Circle({
      stroke: new ol.style.Stroke({
        color: drawOption?.strokeColor
          ? drawOption.strokeColor
          : "rgb(245, 34, 45)",
        width: drawOption?.strokeWidth ? drawOption?.strokeWidth : 1,
      }),
      fill: new ol.style.Fill({
        color: drawOption?.fillColor
          ? drawOption.fillColor
          : "rgba(245, 34, 45, 0.24)",
      }),
      radius: drawOption?.pointRadius ? drawOption.pointRadius : 2,
    }),
    stroke: new ol.style.Stroke({
      color: drawOption?.strokeColor
        ? drawOption.strokeColor
        : "rgb(245, 34, 45)",
      width: drawOption?.strokeWidth ? drawOption?.strokeWidth : 1,
    }),
    fill: new ol.style.Fill({
      color: drawOption?.fillColor
        ? drawOption.fillColor
        : "rgba(245, 34, 45, 0.24)",
    }),
  });
  const feature = new ol.format.GeoJson().readFeature(GeoJson);
  feature.setStyle(style);
  drawSource.addFeature(feature);
  return feature;
}

/**
 *coord区域上图
 *
 * @export
 * @param {*} drawSource
 * @param {*} coord
 * @param {*} radius
 */
export function addCoordGeoOnSource(
  drawSource,
  type,
  coord,
  radius,
  drawOption
) {
  const style = new ol.style.Style({
    image: new ol.style.Circle({
      stroke: new ol.style.Stroke({
        color: drawOption?.strokeColor
          ? drawOption.strokeColor
          : "rgb(245, 34, 45)",
        width: drawOption?.strokeWidth ? drawOption?.strokeWidth : 1,
      }),
      fill: new ol.style.Fill({
        color: drawOption?.fillColor
          ? drawOption.fillColor
          : "rgba(245, 34, 45, 0.24)",
      }),
      radius: drawOption?.pointRadius ? drawOption.pointRadius : 2,
    }),
    stroke: new ol.style.Stroke({
      color: drawOption?.strokeColor
        ? drawOption.strokeColor
        : "rgb(245, 34, 45)",
      width: drawOption?.strokeWidth ? drawOption?.strokeWidth : 1,
    }),
    fill: new ol.style.Fill({
      color: drawOption?.fillColor
        ? drawOption.fillColor
        : "rgba(245, 34, 45, 0.24)",
    }),
  });
  switch (type) {
    case "circle":
      const circleFeature = new ol.Feature({
        geometry: new ol.geom.Circle(coord, radius),
      });
      circleFeature.setStyle(style);
      drawSource.addFeature(circleFeature);
      return circleFeature;
    case "point":
      const pointFeature = new ol.Feature({
        geometry: new ol.geom.Point(coord),
      });
      pointFeature.setStyle(style);
      drawSource.addFeature(pointFeature);
      return pointFeature;
    case "polygon":
      const polygonFeature = new ol.Feature({
        geometry: new ol.geom.Polygon([coord]),
      });
      polygonFeature.setStyle(style);
      drawSource.addFeature(polygonFeature);
      return LineFeature;
    case "line":
      const LineFeature = new ol.Feature({
        geometry: new ol.geom.LineString(coord),
      });
      LineFeature.setStyle(style);
      drawSource.addFeature(LineFeature);
      return LineFeature;
  }
}

/**
 *点击撒点（支持回显）
 *
 * @export
 * @param {*} TMap
 * @param {*} markerOption
 * @param {*} callBack
 * @return {*}
 */
export function clickToSetMarker(TMap, markerOption, callBack) {
  const markerParent = document.createElement("div");
  if (markerOption?.src) {
    markerParent.innerHTML = `<img src=${markerOption?.src} width='${
      markerOption?.width ? markerOption.width : "32px"
    }' height='${markerOption?.height ? markerOption.height : "32px"}'/>`;
  } else {
    markerParent.innerHTML = markerOption?.svg
      ? markerOption.svg
      : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32"><path fill="none" d="M0 0h24v24H0z"/><path d="M18.364 17.364L12 23.728l-6.364-6.364a9 9 0 1 1 12.728 0zM12 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="rgba(254,33,8,1)"/></svg>';
  }
  const overlay = new ol.Overlay({
    position: markerOption?.startPosition,
    element: markerParent,
    positioning: markerOption?.positioning
      ? markerOption.positioning
      : "center-center",
    offset: markerOption?.offset,
  });
  TMap.addOverlay(overlay);
  if (markerOption?.startPosition) {
    animateMapView(TMap, { center: markerOption?.startPosition, zoom: 16 });
  }
  const allowClick =
    markerOption?.allowClick === undefined ? true : markerOption.allowClick;
  const event = allowClick
    ? addMapEventListener(TMap, "singleclick", (e) => {
        const coord = e.coordinate;
        const pixel = e.pixel;

        const featureAndCoord = TMap.forEachFeatureAtPixel(
          e.pixel,
          (feature) => {
            const coord = feature.values_.geometry.flatCoordinates;

            const data = feature.values_.features
              ? feature.values_.features.map((item) => {
                  return item.values_?.data;
                })
              : feature.values_?.data;

            return { feature, coord, data };
          }
        );
        if (!featureAndCoord) {
          overlay.setPosition(e.coordinate);
          if (callBack) {
            callBack({ coord, pixel, featureAndCoord }, e);
          }
        } else {
          overlay.setPosition(undefined);
          if (callBack) {
            callBack({ coord, pixel, featureAndCoord }, e);
          }
        }
      })
    : undefined;

  return { event, overlay };
}

/**
 *清除撒点功能
 *
 * @export
 * @param {*} TMap
 * @param {*} marker
 */
export function removeClickToSetMarker(TMap, marker) {
  if (marker.event) {
    removeMapEventListener(TMap, "singleclick", marker.event);
  }
  if (marker.overlay) {
    removeOverlay(TMap, marker.overlay);
  }
}

/**
 *新增支持内部文字的marker（canvas类型）
 *
 * @export
 * @param {*} TMap
 * @param {*} points
 * @return {*}
 */
export function addTextMarkers(TMap, points) {
  const markers = points.map((point) => {
    const style = new ol.style.Style({
      image: new ol.style.Icon({
        src: point?.src,
        anchor: point?.anchor ? point.anchor : [0.5, 0.5],
        offset: point?.offset,
        scale: point?.scale ? point.scale : 1,
      }),
      text: new ol.style.Text({
        text: point?.text,
        fill: new ol.style.Fill({
          color: point?.textColor ? point.textColor : "#000",
        }),
        font: point?.font ? point.font : "normal 12px sans-serif",
        justify: point?.justify,
        textAlign: point?.textAlign,
        offsetX: point?.offsetX,
        offsetY: point?.offsetY,
      }),
    });
    const markerFeature = new ol.Feature({
      geometry: new ol.geom.Point([point.lng, point.lat]),
      data: point,
    });
    markerFeature.setStyle(style);

    return markerFeature;
  });

  const markerLayer = new ol.layer.Vector({
    source: new ol.source.Vector({
      features: markers,
    }),
  });
  TMap.addLayer(markerLayer);

  return { markerLayer, markers };
}

/**
 *改变marker样式
 *
 * @export
 * @param {*} feature
 * @param {*} point
 */
export function setPointFeatureStyle(feature, point) {
  const style = new ol.style.Style({
    image: new ol.style.Icon({
      src: point?.src ? point.src : feature.getStyle().getImage().getSrc(),
      anchor: point?.anchor
        ? point.anchor
        : feature.getStyle().getImage().anchor_,
      offset: point?.offset
        ? point.offset
        : feature.getStyle().getImage().offset_,
      scale: point?.scale ? point.scale : feature.getStyle().getImage().scale_,
    }),
    text: new ol.style.Text({
      text: point?.text ? point.text : feature.getStyle().getText().text_,
      fill: new ol.style.Fill({
        color: point?.textColor
          ? point.textColor
          : feature.getStyle().getText().fill_.color_,
      }),
      font: point?.font ? point.font : feature.getStyle().getText().font_,
      justify: point?.justify
        ? point?.justify
        : feature.getStyle().getText().justify_,
      textAlign: point?.textAlign
        ? point.textAlign
        : feature.getStyle().getText().textAlign_,
      offsetX: point?.offsetX
        ? point.offsetX
        : feature.getStyle().getText().offsetX_,
      offsetY: point?.offsetY
        ? point.offsetY
        : feature.getStyle().getText().offsetY_,
    }),
  });
  feature.setStyle(style);
}

/**
 *根据feature数组或geometry数组缩放
 *
 * @export
 * @param {*} TMap
 * @param {*} featuresOrGeometries
 * @param {*} option
 */
export function fitInFeaturesOrGeometries(TMap, featuresOrGeometries, option) {
  if (featuresOrGeometries.length === 0) {
    return;
  }
  if (featuresOrGeometries[0].getGeometry) {
    const geometries = featuresOrGeometries.map((f) => {
      return f.getGeometry();
    });
    const geomCollection = new ol.geom.GeometryCollection(geometries);
    const extent = geomCollection.getExtent();
    fitInView(TMap, extent, option);
  } else {
    const geomCollection = new ol.geom.GeometryCollection(featuresOrGeometries);
    const extent = geomCollection.getExtent();
    fitInView(TMap, extent, option);
  }
}

/**
 *获取要素的extent和中心
 *
 * @export
 * @param {*} feature
 * @return {*}
 */
export function getExtentAndCenterFromFeatOrGeo(featureOrGeometry) {
  if (featureOrGeometry.getGeometry) {
    const extent = featureOrGeometry.getGeometry().getExtent();
    const center = ol.extent.getCenter(extent);
    return { extent, center };
  } else {
    const extent = featureOrGeometry.getExtent();
    const center = ol.extent.getCenter(extent);
    return { extent, center };
  }
}

/**
 *获取多个要素集合的extent和中心
 *
 * @export
 * @param {*} feature
 * @return {*}
 */
export function getExtentAndCenterFromFeatsOrGeos(featuresOrGeometries) {
  if (featuresOrGeometries.length === 0) {
    return;
  }
  if (featuresOrGeometries[0].getGeometry) {
    const geometries = featuresOrGeometries.map((f) => {
      return f.getGeometry();
    });
    const geomCollection = new ol.geom.GeometryCollection(geometries);
    const extent = geomCollection.getExtent();
    const center = ol.extent.getCenter(extent);
    return { extent, center };
  } else {
    const geomCollection = new ol.geom.GeometryCollection(featuresOrGeometries);
    const extent = geomCollection.getExtent();
    const center = ol.extent.getCenter(extent);
    return { extent, center };
  }
}

/**
 *添加矢量图层
 *
 * @export
 * @param {*} TMap
 * @return {*}
 */
export function addVectorLayer(TMap) {
  const vectorSource = new ol.source.Vector({});
  const vectorLayer = new ol.layer.Vector({
    source: vectorSource,
  });
  TMap.addLayer(vectorLayer);
  return { vectorLayer, vectorSource };
}

/**
 *添加文字上图
 *
 * @export
 * @param {*} source
 * @param {*} texts
 */
export function addTextOnSource(Source, text) {
  const textFeature = new ol.Feature({
    geometry: new ol.geom.Point([text.lng, text.lat]),
    data: text,
  });
  const style = new ol.style.Style({
    text: new ol.style.Text({
      font: text?.font ? text.font : "normal 13px sans-serif",
      textAlign: text?.textAlign ? text.textAlign : "center",
      textBaseline: "middle",
      offsetY: text?.offsetY ? text.offsetY : 0,
      offsetX: text?.offsetX ? text.offsetX : 0,
      fill: new ol.style.Fill({
        color: text?.textColor ? text.textColor : "#000",
      }),
      padding: text?.padding ? text.padding : [5, 5, 5, 5],
      backgroundFill: new ol.style.Fill({
        color: text?.textBackground ? text.textBackground : "transparent",
      }),
      backgroundStroke: new ol.style.Stroke({
        color: text?.borderColor ? text.borderColor : "transparent",
        width: text?.borderWidth ? text.borderWidth : 0,
        lineDash: text?.borderDash,
      }),
      text: text?.text ? text.text : "",
    }),
  });
  textFeature.setStyle(style);

  Source.addFeature(textFeature);

  return textFeature;
}

/**
 *添加热力图层
 *
 * @export
 * @param {*} TMap
 * @param {*} option
 * @return {*}
 */
export function addHeatLayer(TMap, option) {
  const isWithZoom =
    option?.isWithZoom === undefined ? true : option?.isWithZoom;
  const heatSource = new ol.source.Vector();
  const zoom = TMap.getView().getZoom();
  const radius = !isWithZoom
    ? option?.radius
      ? option.radius
      : 8
    : Math.pow(2, zoom) * 0.002;
  const opacity = !isWithZoom
    ? option?.opacity
      ? option.opacity
      : 1
    : 1 - (zoom * 2) / 100;
  const heatLayer = new ol.layer.Heatmap({
    source: heatSource,
    weight: (feat) => {
      return feat.get("weight");
    },
    blur: option?.blur ? option.blur : 25,
    radius: radius,
    opacity: opacity,
    gradient: option?.colorGradient,
  });
  TMap.addLayer(heatLayer);
  let zoomEvent;
  if (isWithZoom) {
    zoomEvent = addMapEventListener(TMap, "zoomchange", (e) => {
      heatLayer.setRadius(Math.pow(2, e.zoom) * 0.002);
      heatLayer.setOpacity(1 - (e.zoom * 2) / 100);
    });
  } else {
    zoomEvent = undefined;
  }
  return { heatLayer, heatSource, zoomEvent };
}

/**
 *向热力图源添加热力数据点位
 *
 * @export
 * @param {*} heatSource
 * @param {*} heatData
 */
export function addHeatMarkersToHeatSource(heatSource, heatData) {
  const maxWeight =
    heatData && heatData.length && heatData[0].weight
      ? [...heatData].sort((a, b) => b.weight - a.weight)[0].weight
        ? [...heatData].sort((a, b) => b.weight - a.weight)[0].weight
        : 1
      : 1;
  const features = heatData.map((point) => {
    const feature = new ol.Feature({
      geometry: new ol.geom.Point([point.lng, point.lat]),
      weight: maxWeight === 1 ? 1 : point.weight / maxWeight,
      data: point,
    });
    return feature;
  });
  heatSource.addFeatures(features);
  return features;
}
