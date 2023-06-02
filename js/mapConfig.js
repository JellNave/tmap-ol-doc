/*eslint-disable*/
window.baseMapConfig = {
  //矢量地图
  vector: {
    //必须 此处键名即为initMap时的baseMap值（string） eg： baseMap: "vector",
    type: "vector", //非必须
    label: "矢量地图", //非必须
    layer: {
      layerType: "XYZ", //非必须
      source: new ol.source.XYZ({
        // url: "http://rt0.map.gtimg.com/realtimerender?z={z}&x={x}&y={-y}&type=vector&style=0", //腾讯矢量
        url: "http://wprd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scl=1&style=7&x={x}&y={y}&z={z}", //高德矢量（白底非矢量） （无缺失且加载速度快 scl1含标注2不含标注）
        // url: "http://wprd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=8&x={x}&y={y}&z={z}", //高德矢量 （真实矢量路网地图）
        // url: "https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineCommunity/MapServer/tile/{z}/{y}/{x}",//arc矢量
        wrapX: false, //是否在X轴方法repeat渲染底图
        //底图颜色
        crossOrigin: "anonymous", //允许跨域请求地图资源
        tileLoadFunction: function (imageTile, src) {
          //瓦片加载函数，用于底色修改
          const img = new Image();
          img.crossOrigin = "";
          img.onload = function () {
            const canvas = document.createElement("canvas");
            const w = img.width;
            const h = img.height;
            canvas.width = w;
            canvas.height = h;
            const context = canvas.getContext("2d");
            context.drawImage(img, 0, 0, w, h, 0, 0, w, h);
            const imageData = context.getImageData(0, 0, w, h);
            for (i = 0; i < imageData.height; i++) {
              for (j = 0; j < imageData.width; j++) {
                const x = i * 4 * imageData.width + j * 4;
                const r = imageData.data[x];
                const g = imageData.data[x + 1];
                const b = imageData.data[x + 2];
                // 高德底图校色
                //校色需要自行通过取色器获取到瓦片本身颜色，在通过if else判断改成你想要的颜色
                if (
                  (r === 252 && g === 249 && b === 242) ||
                  (r === 233 && g === 231 && b === 226) ||
                  (r === 238 && g === 237 && b === 232) ||
                  (r === 238 && g === 237 && b === 231) ||
                  (r === 255 && g === 255 && b === 255)
                ) {
                  imageData.data[x] = 239;
									imageData.data[x + 1] = 243;
									imageData.data[x + 2] = 250;
                } else if (r === 255 && g === 164 && b === 92) {
                  imageData.data[x] = 248;
                  imageData.data[x + 1] = 211;
                  imageData.data[x + 2] = 146;
                }
              }
            }
            context.putImageData(imageData, 0, 0);
            imageTile.getImage().src = canvas.toDataURL("image/png");
          };
          img.src = src;
        },
      }),
    },
  },
  //影像地图
  image: {
    type: "image",
    label: "影像地图",
    layer: {
      layerType: "XYZ",
      source: new ol.source.XYZ({
        // url: "http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",//arc影像
        url: "https://webst01.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}", //高德影像
        wrapX: false,
        crossOrigin: "anonymous",
      }),
    },
  },
  //夜景地图
  dark: {
    type: "dark",
    label: "夜景地图",
    layer: {
      layerType: "XYZ",
      source: new ol.source.XYZ({
        url: "http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}", //ArcGis 深色底图
        wrapX: false,
        //底图颜色
        // crossOrigin: "anonymous",
      }),
    },
  },
  //若需扩充相关配置，在这里添加
};
