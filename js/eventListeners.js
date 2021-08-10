function eventListeners() {}

// const lsPillWrap = document.querySelector(".ls_suit_fact_btns");
// const lsPillBtns = document.querySelectorAll(".ls-pill-button");

// // on pill button click
// lsPillWrap.addEventListener("click", (e) => {
//   if (e.target.classList[0] === "ls-pill-button") {
//     app.removeLayer(1);
//     app.removeLayer(2);
//     app.removeLayer(3);
//     lsPillBtns.forEach((el) => {
//       el.style.opacity = 0.6;
//     });
//     e.target.style.opacity = 1;
//     console.log(e.target.dataset.value);
//     app.displayLayer(e.target.dataset.value);
//   }
// });

// document.querySelectorAll(".ls-add-layers-cbs input").forEach((cb) =>
//   cb.addEventListener("click", () => {
//     if (cb.checked) {
//       app.displayLayer(cb.value);
//     } else {
//       app.removeLayer(cb.value);
//     }
//   })
// );

// toggle buttons for suitability factors
document.querySelectorAll("#suit-factor-toggle input").forEach((tbs) =>
  tbs.addEventListener("click", (tb) => {
    app.view.popup.close();
    document.querySelectorAll("#suit-factor-toggle input").forEach((tb) => {
      if (tb.checked){
        app.map.add(app[tb.value],1)
      }else{
        app.map.remove(app[tb.value])
      }
    })
  })
);


// show more or less of intro text
document.querySelectorAll(".intro-click").forEach((ai) =>
  ai.addEventListener('click', () => {
    document.querySelectorAll(".app-intro-text span").forEach((span) => {
      span.style.display = span.style.display == "none" ? "inline" : "none";
    })
  })
);

// methods and summary clicks
document.querySelector("#methods-btn").addEventListener('click', () => {
  window.open("https://tnc.box.com/s/zstsyx3kvk89hkmwoufcf1sx0af4wcw2")
})
document.querySelector("#summary-btn").addEventListener('click', () => {
  window.open("https://tnc.box.com/s/q4cx9m37ni76gphkyyo78k1bvxre5565")
})

// show report click
document.querySelector("#report-btn").addEventListener('click', () => {
  // hide map and controls and show report window
  document.getElementById('content-wrap').style.display = "none";
  document.getElementById('report-div').style.display = "block";
  // zoom to main maps.extent
  app.reportViewWind.goTo({
    center: app.view.center,
    zoom: app.view.zoom
  })
  // turn on visible layers in 
  document.querySelectorAll("#layer-viewer-wrap .sup_cb").forEach((v) => {
    if (v.checked == true) {
      let num = v.id.split("_-_").pop();
      let opacity = 1;
      if (num == 99){
        opacity = app.shellfishLayer.opacity;
        app.shellfishLayerWind.opacity = opacity;
        app.shellfishLayerWind.visible = true;
        app.shellfishLayerBoat.opacity = opacity;
        app.shellfishLayerBoat.visible = true;
        app.shellfishLayerMax.opacity = opacity;
        app.shellfishLayerMax.visible = true;
        // update css
        document.getElementById("report-additional-layers-legend").firstChild.style.display = "flex";
      }else{
        let num1 = v.id.split("_-_").pop();
        let sublayer = app.layers.findSublayerById(parseInt(num1));
        opacity = sublayer.opacity;
        let windlayer = app.additionalWindLayers.findSublayerById(parseInt(num1));
        windlayer.opacity = opacity;
        windlayer.visible = true;
        let boatlayer = app.additionalBoatLayers.findSublayerById(parseInt(num1));
        boatlayer.opacity = opacity;
        boatlayer.visible = true;
        let maxlayer = app.additionalMaxLayers.findSublayerById(parseInt(num1));
        maxlayer.opacity = opacity;
        maxlayer.visible = true;
      }
    }
  });
})
// print report
document.querySelector("#print-report-btn").addEventListener('click', () => {
  
  window.print();
})

// hide report div
document.querySelector("#close-report-btn").addEventListener('click', () => {
  document.getElementById('content-wrap').style.display = "block";
  document.getElementById('report-div').style.display = "none";
})


// handle overlay logic
let ls_info_overlay = document.querySelector(".ls-info-overlay");
ls_info_overlay.addEventListener("click", (evt) => {
  if (evt.target.classList[0] === "ls-info-overlay") {
    ls_info_overlay.style.display = "none";
  }
});

let ls_open_btn = document.querySelector(".ls-info-open");
ls_open_btn.addEventListener("click", () => {
  ls_info_overlay.style.display = "block";
});

let ls_close_btn = document.querySelector(".ls-info-close");
ls_close_btn.addEventListener("click", () => {
  ls_info_overlay.style.display = "none";
});
