function mapClick(){
	require([ "esri/tasks/QueryTask", "esri/tasks/support/Query"],
	function( QueryTask, Query) {
		app.view.on("click",function(event){
			document.getElementById('report-div').style.display = "none";
		  	app.view.popup.close();
		  	// create query
		  	var queryTask = new QueryTask({
		    	url: app.url + "/1"
		  	})
		  	var query = new Query();
		  	query.returnGeometry = true;
		  	query.outFields = ["*"];
		  	query.geometry = app.view.toMap(event);
		   	query.distance = 10;
  			query.units = "meters";
		  	queryTask.execute(query)
		    	.then(function(response){
			        app.resultsLayer.removeAll();
			        if (response.features[0]){ 
						// add selected feature to map
						var features = response.features.map(function(graphic){
						  graphic.symbol = {
						     type: "simple-line",  
						     color: "blue",
						     width: "2px",
						     style: "solid"
						  }
						  return graphic;
						})
						app.resultsLayer.addMany(features);
						
						// get attributes
						let a = response.features[0].attributes;
						console.log(a)
						// document.getElementById('Project_Na').innerHTML = a.Project_Na; 
						// document.getElementById('Materials').innerHTML = a.Materials; 
						// document.getElementById("siteLink").href = a.Link;
						document.getElementById('report-div').style.display = "block";
						app.reportViewWind.goTo({
							center: app.view.center,
							zoom: app.view.zoom
						})

		        }else{
		        	
		        }
		     })
		})
	})
}