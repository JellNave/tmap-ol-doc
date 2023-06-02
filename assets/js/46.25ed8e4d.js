(window.webpackJsonp=window.webpackJsonp||[]).push([[46],{334:function(t,e,a){"use strict";a.r(e);var v=a(7),_=Object(v.a)({},(function(){var t=this,e=t._self._c;return e("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[e("h1",{attrs:{id:"api-setmapview"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#api-setmapview"}},[t._v("#")]),t._v(" API / setMapView")]),t._v(" "),e("h2",{attrs:{id:"类型"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#类型"}},[t._v("#")]),t._v(" 类型")]),t._v(" "),e("p",[t._v("("),e("code",[t._v("TMap")]),t._v(":"),e("RouterLink",{attrs:{to:"/pages/TMap/API/setMapView.html#tmap"}},[t._v("TMap")]),t._v(","),e("code",[t._v("option")]),t._v(":"),e("RouterLink",{attrs:{to:"/pages/TMap/API/setMapView.html#option"}},[t._v("option")]),t._v(" )=>"),e("code",[t._v("void")])],1),t._v(" "),e("p",[t._v("(地图实例化对象，视图配置项)=>无返回值")]),t._v(" "),e("h2",{attrs:{id:"描述"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#描述"}},[t._v("#")]),t._v(" 描述")]),t._v(" "),e("p",[t._v("改变当前视图相关配置中的一项或多项，比如中心位置，缩放等，（无动画效果，强制改变）")]),t._v(" "),e("h2",{attrs:{id:"参数"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#参数"}},[t._v("#")]),t._v(" 参数")]),t._v(" "),e("h3",{attrs:{id:"tmap"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#tmap"}},[t._v("#")]),t._v(" "),e("code",[t._v("TMap")])]),t._v(" "),e("ul",[e("li",[t._v("类型："),e("code",[t._v("Object")])]),t._v(" "),e("li",[t._v("描述：地图实例对象（初始化地图返回值之一）")]),t._v(" "),e("li",[t._v("是否必须：是")]),t._v(" "),e("li",[t._v("详细属性：Map对象，详细请参照"),e("a",{attrs:{href:"/tmap-ol-doc/pages/OL/base/Map"}},[t._v("ol/Map")])])]),t._v(" "),e("h3",{attrs:{id:"option"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#option"}},[t._v("#")]),t._v(" "),e("code",[t._v("option")])]),t._v(" "),e("ul",[e("li",[t._v("类型："),e("code",[t._v("Object")])]),t._v(" "),e("li",[t._v("描述：视图相关配置项，不传保持原样")]),t._v(" "),e("li",[t._v("是否必须：否")]),t._v(" "),e("li",[t._v("详细属性："),e("code",[t._v("Object")]),t._v("包含以下属性\n"),e("table",[e("thead",[e("tr",[e("th",{staticStyle:{"text-align":"left"}},[t._v("属性名")]),t._v(" "),e("th",{staticStyle:{"text-align":"left"}},[t._v("是否必须")]),t._v(" "),e("th",{staticStyle:{"text-align":"left"}},[t._v("类型")]),t._v(" "),e("th",{staticStyle:{"text-align":"left"}},[t._v("默认值")]),t._v(" "),e("th",{staticStyle:{"text-align":"left"}},[t._v("描述")])])]),t._v(" "),e("tbody",[e("tr",[e("td",{staticStyle:{"text-align":"left"}},[e("code",[t._v("projection")])]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("否")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[e("code",[t._v("string")])]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("当前View对象projection值")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("地图使用的投影坐标系，可选"),e("code",[t._v("EPSG:4326")]),t._v(","),e("code",[t._v("EPSG:3857")])])]),t._v(" "),e("tr",[e("td",{staticStyle:{"text-align":"left"}},[e("code",[t._v("center")])]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("否")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[e("code",[t._v("Array.<number>")])]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("当前View对象center值")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("地图中心点经纬度（遵循"),e("code",[t._v("EPSG:4326")]),t._v(" "),e("code",[t._v("coord")]),t._v("数据格式）"),e("code",[t._v("[centerLng,centerLat]")])])]),t._v(" "),e("tr",[e("td",{staticStyle:{"text-align":"left"}},[e("code",[t._v("zoom")])]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("否")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[e("code",[t._v("number")])]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("当前"),e("code",[t._v("View")]),t._v("对象"),e("code",[t._v("zoom")]),t._v("值")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("地图初始化视图缩放值")])]),t._v(" "),e("tr",[e("td",{staticStyle:{"text-align":"left"}},[e("code",[t._v("maxZoom")])]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("否")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[e("code",[t._v("number")])]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("当前"),e("code",[t._v("View")]),t._v("对象"),e("code",[t._v("maxZoom")]),t._v("值")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("地图最大缩放层级")])]),t._v(" "),e("tr",[e("td",{staticStyle:{"text-align":"left"}},[e("code",[t._v("minZoom")])]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("否")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[e("code",[t._v("number")])]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("当前"),e("code",[t._v("View")]),t._v("对象"),e("code",[t._v("minZoom")]),t._v("值")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("地图最小缩放层级")])]),t._v(" "),e("tr",[e("td",{staticStyle:{"text-align":"left"}},[e("code",[t._v("extent")])]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("否")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[e("code",[t._v("Array.<number>")])]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("当前"),e("code",[t._v("View")]),t._v("对象"),e("code",[t._v("extent")]),t._v("值")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("限制地图可见范围，数组"),e("code",[t._v("[minx, miny, maxx, maxy]")]),t._v("中四个值依次为X方向最小值，y方向最小值，x方向最大值，y方向最大值，通俗理解就是经纬度的最值")])])])])])]),t._v(" "),e("h2",{attrs:{id:"返回值"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#返回值"}},[t._v("#")]),t._v(" 返回值")]),t._v(" "),e("h3",{attrs:{id:"void"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#void"}},[t._v("#")]),t._v(" "),e("code",[t._v("void")])])])}),[],!1,null,null,null);e.default=_.exports}}]);