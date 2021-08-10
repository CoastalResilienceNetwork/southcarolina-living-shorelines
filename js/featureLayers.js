require(["esri/layers/FeatureLayer"], function (FeatureLayer) {
  app.existing_ls_sites = new FeatureLayer({
    url: app.sc_url + "/0",
  });
  app.rwe = new FeatureLayer({
    url: app.sc_url + "/1",
  });
  app.boat_wake = new FeatureLayer({
    url: app.sc_url + "/2",
  });
  app.max_fetch = new FeatureLayer({
    url: app.sc_url + "/3",
  });
  app.shore_change = new FeatureLayer({
    url: app.sc_url + "/4",
  });
  app.coast_baseline = new FeatureLayer({
    url: app.sc_url + "/5",
  });
  app.salinity = new FeatureLayer({
    url: app.sc_url + "/6",
  });
  app.soil_type = new FeatureLayer({
    url: app.sc_url + "/7",
  });
});
