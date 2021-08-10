// add save and share button
if (showSaveAndShare) {
  document.querySelector("#viewDiv").insertAdjacentHTML(
    "beforeend",
    `
		<div id="saveshare-wrap">
			<div class="esri-expand__panel">
				<div id="saveAndShare" title="Save and Share" role="button" tabindex="0" class="esri-widget--button">
					<span aria-hidden="true" class="esri-collapse__icon esri-expand__icon--expanded esri-icon-share"></span>
					<span class="esri-icon-font-fallback-text">Save and Share</span>
				</div>
			</div>					
		</div>
	`
  );
}
// save and share click
document.querySelector(`#sands-btn`).addEventListener("click", () => {
  createURL();
});
function createURL() {
  updateObject();
  // convert app.obj to json
  let myjson = JSON.stringify(app.obj);
  // encode JSON as URI
  let uri = encodeURIComponent(JSON.stringify(myjson));

  var apiKey = "48598fa6dd3e4237b18dd6344b77a049";
  var requestHeaders = {
    "Content-Type": "application/json",
    apikey: apiKey,
  };

  var linkRequest = {
    destination: "https://maps.coastalresilience.org/southcarolina/living-shorelines/?search=" + uri,
  };
  shortUrl = "";
  $.ajax({
    url: "https://api.rebrandly.com/v1/links",
    type: "post",
    data: JSON.stringify(linkRequest),
    headers: requestHeaders,
    dataType: "json",
    success: function (result) {
      shortUrl =
        result.shortUrl.indexOf("http") == -1
          ? "https://" + result.shortUrl
          : result.shortUrl;
      console.log(shortUrl);
      openSaveAndSharePopup(shortUrl);
    },
    error: function (error) {
      shortUrl = linkRequest.destination;
      console.log(shortUrl);
      openSaveAndSharePopup(shortUrl);
    },
  });
}
function openSaveAndSharePopup(shortUrl) {
  app.view.popup.close();
  let div = document.createElement("div");
  div.setAttribute("id", "saveAndSharePopup");
  div.className = "saveAndSharePopup";
  div.classList.add("esri-popup--shadow");
  div.innerHTML = `
		<div class="saveAndShareHeaderWrap">
			<h2 class="saveAndShareHeader">Save and Share</h2>
			<div class="esri-popup__header-buttons">
				<div role="button" tabindex="0" class="esri-popup__button" aria-label="Close" title="Close">
					<span onclick="closeSaveAndSharePopup()" aria-hidden="true" class="esri-popup__icon esri-icon-close">
					</span>
				</div>
			</div>
		</div>
		<div style="margin: 0 10px;">
			<div style="margin-left:4px;">Permalink <span id="copiedText">copied!</span></div>
			<input type="text" id="saveAndShareLink" value="${shortUrl}">
			<button id="saveAndShareButton" class="button button-default" onclick="copySaveAndShareLink()">Copy to Clipboard</button>
		</div>
	`;
  let mapDiv = document.getElementById("map-div");
  mapDiv.appendChild(div);
}
function copySaveAndShareLink() {
  var copyText = document.getElementById("saveAndShareLink");
  copyText.select();
  copyText.setSelectionRange(0, 99999);
  document.execCommand("copy");
  document.getElementById("copiedText").style.display = "inline-block";
}
function closeSaveAndSharePopup() {
  document.getElementById("saveAndSharePopup").remove();
  $(`.dlssre`).prop("disabled", false);
}
//this will vary for each app
function updateObject() {
  // Get ids of checked inputs in layer viewer
  app.obj.visibleLayersIds = [];
  document.querySelectorAll("#layer-viewer-wrap .sup_cb").forEach((v) => {
    if (v.checked == true) {
      let num = v.id.split("_-_").pop();
      let opacity = 1;
      if (num == 99){
        opacity = app.shellfishLayer.opacity;
      }else{
        let num1 = v.id.split("_-_").pop();
        let sublayer = app.layers.findSublayerById(parseInt(num1));
        opacity = sublayer.opacity;
      }
      app.obj.visibleLayersIds.push({
        id: v.id,
        opacity: opacity,
        layerId: num,
      });
    }
  });
  // Get ids of open groups layers
  document.querySelectorAll("#layer-viewer-wrap .group-title").forEach((g) => {
    if (g.querySelector(".fa-caret-down").style.display != "none") {
      app.obj.openGroupLayersIds.push(g.id);
    }
  });
  // find select energy condition
  app.obj.suitabiltyFactorLayer = document.querySelectorAll('input[name="suitFact"]:checked')[0].value;

  // center and zoom level
  app.obj.extent = app.view.extent;

  // tigger build from state
  app.obj.stateSet = "yes";
}

// Save and Share Handler
function buildFromState() {
  if (app.obj.stateSet == "yes") {
    // open group layers with visible layers inside
    app.obj.openGroupLayersIds.forEach((g) => {
      let gl = document.getElementById(g);
      gl.querySelector(".fa-caret-right").click();
    });
    // turn on layers in layer viewer
    app.obj.visibleLayersIds.forEach((v) => {
      app.layers.when(function () {
        document.getElementById(v.id).click();
        if (v.layerId == 99){
          app.shellfishLayer.opacity = v.opacity;
        }else{ 
          let sublayer = app.layers.findSublayerById(parseInt(v.layerId));
          sublayer.opacity = v.opacity;
        }
      });
    });
    //extent
    require([
      "esri/geometry/Extent",
      "esri/geometry/SpatialReference",
    ], function (Extent, SpatialReference) {
      app.view.when(function () {
        app.view.extent = new Extent(app.obj.extent);
      });
    });
    app.obj.stateSet = "no";
  } else {

    // //zoom to layer
    // app.layers.when(function () {
    //   app.view.goTo(app.layers.fullExtent).catch(function (error) {
    //     if (error.name != "AbortError") {
    //       console.error(error);
    //     }
    //   });
    // });
  }
}
