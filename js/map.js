// create map and layers for app
require([
  "esri/Map",
  "esri/views/MapView",
  "esri/widgets/BasemapGallery",
  "esri/widgets/Expand",
  "esri/widgets/BasemapGallery/support/PortalBasemapsSource",
  "esri/widgets/Search",
  "esri/widgets/Legend",
  "esri/layers/FeatureLayer",
  "esri/layers/MapImageLayer",
  "esri/PopupTemplate",
  "esri/tasks/QueryTask",
  "esri/tasks/support/Query",
  "esri/layers/GraphicsLayer",
  "esri/core/watchUtils",
  "esri/request",
], function (
  Map,
  MapView,
  BasemapGallery,
  Expand,
  PortalSource,
  Search,
  Legend,
  FeatureLayer,
  MapImageLayer,
  PopupTemplate,
  QueryTask,
  Query,
  GraphicsLayer,
  watchUtils,
  esriRequest
) {
  app.sc_url = "https://services2.coastalresilience.org/arcgis/rest/services/South_Carolina/Living_Shorelines/MapServer";
  // create map
  app.map = new Map({
    basemap: "hybrid",
  });

  //create map view
  app.view = new MapView({
    container: "viewDiv",
    center: [-79.5, 33],
    zoom: 8,
    map: app.map,
    // add popup window to map view for map clicks
    popup: {
      collapseEnabled: false,
      dockEnabled: true,
      dockOptions: {
        buttonEnabled: false,
        breakpoint: false,
        position: "top-center"
      }
    },
    highlightOptions: {
      color: "#0000FF",
      haloColor: "#0000ff",
      fillOpacity: 0
    }
  });

  //create basemap widget
  const allowedBasemapTitles = [
    "Imagery Hybrid",
    "Light Gray Canvas",
    "Topographic",
    "Streets",
  ];
  const source = new PortalSource({
    // filtering portal basemaps
    filterFunction: (basemap) =>
      allowedBasemapTitles.indexOf(basemap.portalItem.title) > -1,
  });
  var basemapGallery = new BasemapGallery({
    view: app.view,
    source: source,
    container: document.createElement("div"),
  });
  var bgExpand = new Expand({
    view: app.view,
    content: basemapGallery,
  });
  app.view.ui.add(bgExpand, {
    position: "top-right",
  });
  // close expand when basemap is changed
  app.map.watch(
    "basemap.title",
    function (newValue, oldValue, property, object) {
      bgExpand.collapse();
    }
  );

  //create search widget
  const searchWidget = new Search({
    view: app.view,
    locationEnabled: false,
    popupEnabled: false,
    popupOpenOnSelect: false,
    container: "ls-search-bar",
  });
  //   var srExpand = new Expand({
  //     view: app.view,
  //     content: searchWidget,
  //   });
  //   app.view.ui.add(srExpand, {
  //     position: "top-left",
  //   });

  // move zoom controls to top right
  app.view.ui.move(["zoom"], "top-right");

  // addtional layers
  app.layers = new MapImageLayer({
    url: app.url,
  });

  // living shoreline layers
  app.ls_layers = new MapImageLayer({
    url: app.sc_url,
    sublayers: [
      {
        id: 1,
        visible: false,
      },
      {
        id: 2,
        visible: false,
      },
      {
        id: 3,
        visible: false,
      }
    ],
  });
  
  //popup template for existing living shoreline sites
  const popupLivingShorelineSites = {
    title: "Existing Living Shoreline Sites",
    content: "Name: <b>{Project_Na}</b><br>Materials: <b>{Materials}</b><br><a href='{Link}' target='_blank'>More Info</a>"
  }

  const livingShorelineSites = new FeatureLayer({
    url: app.url + "/0",
    outFields: ["Project_Na","Materials","Link"],
    popupTemplate: popupLivingShorelineSites
  })
  
  // popuptemplate for line layer used by wind, boat, max, marsh, and tidal
  const popupLineLayer = {
    title: "Selected segment",
    content: "Wind Wave Energy: <b>{RWE_PopUp}</b><br>Boat Wake Energy: <b>{VSL_PopUp}</b><br>Max Fetch: <b>{FetchPopUp}</b><br>Marsh: <b>{Marsh_Pop}</b><br>Tidal Flats: <b>{TdlFlt_Pop}</b>"
  }

  const outfields = ["RWE_PopUp","VSL_PopUp","FetchPopup","Marsh_Pop","TdlFlt_Pop"];
  app.lineWaveLayer = new FeatureLayer({
    url: app.url + "/1",
    outFields: outfields,
    popupTemplate: popupLineLayer,
  })
  app.lineBoatLayer = new FeatureLayer({
    url: app.url + "/2",
    outFields: outfields,
    popupTemplate: popupLineLayer,
  })
  app.lineMaxLayer = new FeatureLayer({
    url: app.url + "/3",
    outFields: outfields,
    popupTemplate: popupLineLayer,
  })

  // shellfish permit layer
  app.shellfishLayer = new FeatureLayer({
    url: "https://services.arcgis.com/acgZYxoN5Oj8pDLa/arcgis/rest/services/Shellfish_Management_Layers_Public_View/FeatureServer/1",
    visible: false
  })

  //shoreline change rate layer
  const popupShorelineChangeRate = {
    title: "Shoreline Change Rate",
    content: "Shoreline Change Rate: <b>{Rate_PopUp}</b>"
  }
  app.shorelineChangeLayer = new FeatureLayer ({
    url: app.url + "/4",
    outFields: ["Rate_PopUp"],
    popupTemplate: popupShorelineChangeRate,
    visible: false
  })

  // graphics layer for map click graphics
  app.resultsLayer = new GraphicsLayer();
  // add layers to map
  app.map.add(app.layers);
  //app.map.add(app.ls_layers);
  app.map.add(app.shellfishLayer);
  app.map.add(app.shorelineChangeLayer);
  app.map.add(livingShorelineSites);
  app.map.add(app.resultsLayer);
  

  //   app.ls_layers.when(function () {
  //     console.log("inside");
  //     let sublayer2 = app.ls_layers.findSublayerById(parseInt(0));
  //     console.log(sublayer2);
  //     sublayer2.visible = true;
  //   });

  // create legend
  app.legend = new Legend({
    view: app.view,
    layerInfos: [
      {
        layer: livingShorelineSites,
        title: "Existing Living Shoreline Sites"
      },
      {
        layer: app.shellfishLayer,
        title: "Shellfish Permit Areas"
      },
      {
        layer: app.shorelineChangeLayer,
        title: "Shorline Change Rate"
      },
      {
        layer: app.oystersLayer,
        title: "Oysters"
      },
      {
        layer: app.lineWaveLayer,
        title: "Wind Wave Energy"
      },
      {
        layer: app.lineBoatLayer,
        title: "Boat Wake Energy"
      },
      {
        layer: app.lineMaxLayer,
        title: "Max Fetch"
      },
      {
        layer: app.layers,
        title: "",
      }
    ],
    container: document.createElement("div"),
  });
  app.lgExpand = new Expand({
    view: app.view,
    content: app.legend,
  });
  app.view.ui.add(app.lgExpand, {
    position: "bottom-right",
  });

  // add layerviewer to app
  buildLayerViewer();

  // change legend based on window size
  var x = window.matchMedia("(max-width: 700px)");
  mobilePortrait(x); // Call listener function at run time
  x.addListener(mobilePortrait); // Attach listener function on state changes

  // change legend based on window size
  var y = window.matchMedia("(orientation:landscape)");
  mobileLandscape(y); // Call listener function at run time
  y.addListener(mobileLandscape); // Attach listener function on state changes

  // listen for poup close button
  watchUtils.whenTrue(app.view.popup, "visible", function () {
    watchUtils.whenFalseOnce(app.view.popup, "visible", function () {
      app.resultsLayer.removeAll();
    });
  });

  // add any other event listeners
  eventListeners();

  // trigger click on suitability factor
  document.querySelectorAll(`#suit-factor-toggle input[value="${app.obj.suitabiltyFactorLayer}"]`)[0].click();

  // create report maps

  // wind wave map
  app.reportMapWind = new Map({
    basemap: "hybrid",
  });
  //create wind wave map view
  app.reportViewWind = new MapView({
    container: "report-map-wind-view",
    center: [-79.5, 33],
    zoom: 8,
    map: app.reportMapWind
  });
  // wind wave layer
  app.windWaveLayer = new MapImageLayer({
    url: app.sc_url,
    sublayers: [
      {
        id: 3,
        visible: true,
      },
      {
        id: 2,
        visible: true,
      },
      {
        id: 1,
        visible: true,
      }
    ],
  });
  // additional wind layers
  app.additionalWindLayers = new MapImageLayer({
    url: app.sc_url,
    sublayers: [
      {
        id: 7,
        visible: false,
      },
      {
        id: 6,
        visible: false,
      },
      {
        id: 5,
        visible: false,
      },
      {
        id: 4,
        visible: false,
      },
      {
        id: 0,
        visible: true,
      }
    ],
  });
  // shellfish permit layer
  app.shellfishLayerWind = new FeatureLayer({
    url: "https://services.arcgis.com/acgZYxoN5Oj8pDLa/arcgis/rest/services/Shellfish_Management_Layers_Public_View/FeatureServer/1",
    visible: false
  })

  // add layers to map
  app.reportMapWind.add(app.shellfishLayerWind)
  app.reportMapWind.add(app.additionalWindLayers)
  app.reportMapWind.add(app.windWaveLayer)
  // report wind legend
  let reportWindLegend = new Legend({
    view: app.reportViewWind,
    container: "report-legend-wind",
    layerInfos: [
      {
        layer: app.windWaveLayer,
        title: ""
      }
    ]
  })


  // boat wake map
  app.reportMapBoat = new Map({
    basemap: "hybrid",
  });
  //create boat wake map view
  app.reportViewBoat = new MapView({
    container: "report-map-boat-view",
    center: [-79.5, 33],
    zoom: 8,
    map: app.reportMapBoat,
    navigation: {
      gamepad: {
        enabled: false
      },
      browserTouchPanEnabled: false,
      momentumEnabled: false,
      mouseWheelZoomEnabled: false
    }
  });
  // boat wake layer
  app.boatWakeLayer = new MapImageLayer({
    url: app.sc_url,
    sublayers: [
      {
        id: 2,
        visible: true,
      }
    ],
  });
  // additional boat layers
  app.additionalBoatLayers = new MapImageLayer({
    url: app.sc_url,
    sublayers: [
      {
        id: 7,
        visible: false,
      },
      {
        id: 6,
        visible: false,
      },
      {
        id: 5,
        visible: false,
      },
      {
        id: 4,
        visible: false,
      },
      {
        id: 0,
        visible: true,
      }
    ],
  });
  // shellfish permit layer
  app.shellfishLayerBoat = new FeatureLayer({
    url: "https://services.arcgis.com/acgZYxoN5Oj8pDLa/arcgis/rest/services/Shellfish_Management_Layers_Public_View/FeatureServer/1",
    visible: false
  })
  // add layers to map
  app.reportMapBoat.add(app.shellfishLayerBoat)
  app.reportMapBoat.add(app.additionalBoatLayers)
  app.reportMapBoat.add(app.boatWakeLayer)
  // // report boat legend
  // let reportBoatLegend = new Legend({
  //   view: app.reportViewBoat,
  //   container: "report-legend-boat",
  //   layerInfos: [
  //     {
  //       layer: app.boatWakeLayer,
  //       title: ""
  //     }
  //   ]
  // })


  // max fetch map
  app.reportMapMax = new Map({
    basemap: "hybrid",
  });
  //create max fetch map view
  app.reportViewMax = new MapView({
    container: "report-map-max-view",
    center: [-79.5, 33],
    zoom: 8,
    map: app.reportMapMax,
    navigation: {
      gamepad: {
        enabled: false
      },
      browserTouchPanEnabled: false,
      momentumEnabled: false,
      mouseWheelZoomEnabled: false
    }
  });
  // max fetch layer
  app.maxFetchLayer = new MapImageLayer({
    url: app.sc_url,
    sublayers: [
      {
        id: 3,
        visible: true,
      }
    ],
  });
  // additional max layers
  app.additionalMaxLayers = new MapImageLayer({
    url: app.sc_url,
    sublayers: [
      {
        id: 7,
        visible: false,
      },
      {
        id: 6,
        visible: false,
      },
      {
        id: 5,
        visible: false,
      },
      {
        id: 4,
        visible: false,
      },
      {
        id: 0,
        visible: true,
      }
    ],
  });
  // shellfish permit layer
  app.shellfishLayerMax = new FeatureLayer({
    url: "https://services.arcgis.com/acgZYxoN5Oj8pDLa/arcgis/rest/services/Shellfish_Management_Layers_Public_View/FeatureServer/1",
    visible: false
  })
  // add layers to map
  app.reportMapMax.add(app.shellfishLayerMax)
  app.reportMapMax.add(app.additionalMaxLayers)
  app.reportMapMax.add(app.maxFetchLayer)
  // // report max legend
  // let reportMaxLegend = new Legend({
  //   view: app.reportViewMax,
  //   container: "report-legend-max",
  //   layerInfos: [
  //     {
  //       layer: app.maxFetchLayer,
  //       title: ""
  //     }
  //   ]
  // })

  //report additional layers legend
  let reportAdditionalLegend = new Legend({
    view: app.reportViewMax,
    container: "report-additional-layers-legend",
    layerInfos: [
      {
        layer: app.additionalMaxLayers,
        title: ""
      },
      {
        layer: app.shellfishLayerMax,
        title: "Shellfish Permit Areas"
      }
    ]
  })  

  watchUtils.whenTrue(app.reportViewWind, "stationary", function() {
    // Get the new center of the view only when view is stationary.
    if (app.reportViewWind.center) {
      app.reportViewBoat.goTo({
        center: app.reportViewWind.center,
        zoom: app.reportViewWind.zoom
      })
      app.reportViewMax.goTo({
        center: app.reportViewWind.center,
        zoom: app.reportViewWind.zoom
      }) 
      let lat = app.reportViewWind.center.latitude.toFixed(3);
      let long = app.reportViewWind.center.longitude.toFixed(3);
      document.getElementById("report-lat").innerHTML = lat
      document.getElementById("report-long").innerHTML = long
    }
  });

  // disable panning on two report maps
  app.reportViewBoat.on("drag", function(event){
    event.stopPropagation();
  });
  app.reportViewBoat.on("double-click", function(event){
    event.stopPropagation();
  });
  app.reportViewMax.on("drag", function(event){
    event.stopPropagation();
  });
  app.reportViewMax.on("double-click", function(event){
    event.stopPropagation();
  });

  app.reportViewWind.ui.components = ["zoom"]
  app.reportViewBoat.ui.components = [];
  app.reportViewMax.ui.components = [];

  // map click
  //mapClick();
});

function clearGraphics() {
  app.map.layers.removeAll();
}

app.displayLayer = (index) => {
  // console.log(app.ls_layers.allSublayers);
  // console.log(index, parseInt(index));
  // console.log(app.ls_layers.findSublayerById(parseInt(index)));
  let lyr = app.ls_layers.findSublayerById(parseInt(index));
  lyr.visible = true;
};
app.removeLayer = (index) => {
  let lyr = app.ls_layers.findSublayerById(parseInt(index));
  lyr.visible = false;
};

function mobilePortrait(x) {
  if (x.matches) {
    app.lgExpand.collapse();
    app.mobile = true;
    if (document.querySelector(`#side-nav`).clientWidth == 0) {
      document
        .querySelector(`#side-nav`)
        .classList.toggle("hide-side-nav-width");
      document.querySelectorAll(`#map-toggle span`).forEach((span) => {
        span.classList.toggle("hide");
      });
    }
  } else {
    app.lgExpand.expand();
    app.mobile = false;
  }
}
function mobileLandscape(y) {
  if (y.matches) {
    if (document.querySelector(`#side-nav`).clientHeight == 0) {
      document
        .querySelector(`#side-nav`)
        .classList.toggle("hide-side-nav-height");
      document.querySelectorAll(`#map-toggle span`).forEach((span) => {
        span.classList.toggle("hide");
      });
    }
  }
}
