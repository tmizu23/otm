var dataSet1 = {
        0: null,1: null,2: null,3: null,4: null,
        5: {dataId: "BLANK"},
        6: {dataId: "BLANK"},
        7: {dataId: "BLANK"},
        8: {dataId: "BLANK"},
        9: {dataId: "BLANK"},
        10: {dataId: "BLANK"},
        11: {dataId: "BLANK"},
        12: {dataId: "BAFD200K2"},
        13: {dataId: "BAFD200K2"},
        14: {dataId: "BAFD200K2"},
        15: {dataId: "DJBMM"},
        16: {dataId: "DJBMM"},
        17: {dataId: "DJBMM"}
    };

cjp_layer = new webtis.Layer.BaseMap("電子国土", {
    dataSet: dataSet1,
    transitionEffect: 'resize'
});

var map = new OpenLayers.Map('map', {
    layers:[cjp_layer],
    center:new OpenLayers.LonLat(141.46, 39.6).transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913")),
    zoom:7,
    controls: [    
        new OpenLayers.Control.TouchNavigation({
            dragPanOptions: {
             enableKinetic: true
            }
        }),
        new OpenLayers.Control.Navigation(),
	new OpenLayers.Control.Attribution(),
	new OpenLayers.Control.LayerSwitcher(),
	//new OpenLayers.Control.Permalink()
	],
    projection: new OpenLayers.Projection("EPSG:900913"), //明示しないとTMSが表示されない!
});


otm_layer = new OpenLayers.Layer.XYZ("otm","http://www.ecoris.co.jp/map/otm/data/${z}/${x}/${y}.txt", {
    isBaseLayer: false,
    opacity: 0.8,
    attribution: "地図タイル工法協会",
    tileClass: otm.Tile.OpenTileMap,
});
map.addLayer(otm_layer);

///////////////////////////////////////////////////////////////////////


