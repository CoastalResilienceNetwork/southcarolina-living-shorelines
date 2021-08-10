var search = window.location.search;
// check for save and share data in URL
if (search) {
  let searchslice = search.slice(8);
  let so = JSON.parse(decodeURIComponent(searchslice));
  app.obj = JSON.parse(so);
} else {
  // if no save and share, use obj.json file
  fetch("obj.json")
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      app.obj = data;
    });
}

// map service URL
app.url = "https://services2.coastalresilience.org/arcgis/rest/services/South_Carolina/Living_Shorelines/MapServer";
//app.url = "https://services2.coastalresilience.org/arcgis/rest/services/Washington/Skagit_Supporting/MapServer";

// build top level controls
app.topObj = {
  introP: ``,
};

// Layer Viewer Variables
const layerViewer = {
  // show layer viewer - boolean
  show: true,
  // map service for layer viewer
  url: app.url,
  // location of layer view - sidebar or overmap
  location: "sidebar",
  // boolean for expand or collapse - only used in overmap
  expand: true,
  // layer ids to skip in layer viewer, add as integers not strings
  skipLayers: [0,1,2,3,4],
  // layer viewer title
  title: "Additional Layers",
};

// Whether to add save and share as widget over map
showSaveAndShare = true;

//buildElements();
