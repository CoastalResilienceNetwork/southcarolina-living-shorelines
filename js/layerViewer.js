function buildLayerViewer(){
	if (layerViewer.show){
		// build the layer viewer TOC
		require(["esri/request"], 
		function(esriRequest) {
			esriRequest(layerViewer.url + "/layers?f=pjson", {responseType: "json"}).then(function(response){
		      	// The requested data
		      	let layerJson = response.data;
		      	// Find the top level headers and layers
		      	let topGroup = [];
		   		let opacityClass = "";
		      	if (layerViewer.location == "sidebar"){
		      		document.querySelector("#sidebar-wrap").insertAdjacentHTML("beforeend",`
			      		<div class="layer-viewer-overmap-label">${layerViewer.title}</div>
			      		<div id="layer-viewer-wrap" class="layer-viewer-wrap"></div>
		      		`);
		      		opacityClass = "opacity-flex";
		      	}
		      	if (layerViewer.location == "overmap"){
		      		document.querySelector("#viewDiv").insertAdjacentHTML("beforeend",`
		      			<div id="overmap-wrap">
		      				<div id="overmap-toggle" class="esri-expand__panel">
	      						<div id="overmap-toggle-button" title="Collapse" role="button" tabindex="0" class="esri-widget--button">
	      							<span aria-hidden="true" class="esri-collapse__icon esri-icon-collection"></span>
		      						<span class="esri-icon-font-fallback-text">Expand</span>
	      						</div>
		      				</div>
		      				<div id="layer-viewer-overmap-wrap" style="display:none;">
			      				<div class="layer-viewer-overmap-label">${layerViewer.title}</div>
		      					<div id="layer-viewer-wrap" class="layer-viewer-wrap layer-viewer-overmap">
		      					</div>
		      				</div>  					
		      			</div>
		      		`)
		      		document.querySelector("#overmap-toggle").addEventListener('click', ((tb) => {
		      			if ( tb.target.classList.contains('esri-icon-collapse') ) {
		      				document.getElementById("overmap-toggle-button").innerHTML = `
		      					<span aria-hidden="true" class="esri-collapse__icon esri-icon-collection"></span>
		      					<span class="esri-icon-font-fallback-text">Expand</span>
		      				`
		      				document.getElementById("overmap-toggle-button").title = "Supporting Layers";
		      				document.getElementById("layer-viewer-overmap-wrap").style.display = "none";
		      			}
		      			if ( tb.target.classList.contains('esri-icon-collection') ) {
		      				document.getElementById("overmap-toggle-button").innerHTML = `
		      					<span aria-hidden="true" class="esri-collapse__icon esri-expand__icon--expanded esri-icon-collapse"></span>
	      						<span class="esri-icon-font-fallback-text">Collapse</span>
		      				`
		      				document.getElementById("layer-viewer-overmap-wrap").style.display = "block";
		      				document.getElementById("overmap-toggle-button").title = "Collapse";
		      			}
		      		}))
		      		opacityClass = "opacity-stacked";
		      	}
		      	
		      	layerJson.layers.push(
		      		{
		      			name: "Shellfish Permit Areas",
		      			id: 99
		      		}
		      	)
		      	layerJson.layers.unshift(
		      		{
		      			name: "Shoreline Change Rate",
		      			id: 98
		      		}
		      	)
		      	
		      	layerJson.layers.forEach((l) => {
		      		// add layer to layer viewer if it's id is not present in the skip array
		      		if (layerViewer.skipLayers.indexOf(l.id) == -1){
			        	// Group Layers with no parents
			         	if (l.type == "Group Layer" && !l.parentLayer){
			            	topGroup.push(l)
			            	document.querySelector("#layer-viewer-wrap").insertAdjacentHTML("beforeend", `
			               		<div>
			                  		<div class="layer-viewer-row top-group-title group-title" id="group-title-${l.id}"><i class="fas fa-caret-right"></i><i class="fas fa-caret-down" style="display:none;"></i><span class="top-group-label">${l.name}</span></div>
			                  		<div id="layerGroup-${l.id}" class="group-${l.id} group-wrap"></div>
			               		</div>
			            	`)
			         	}
			         	// Feature/Raster Layers with no parents
						if (l.type != "Group Layer" && !l.parentLayer){
							document.querySelector("#layer-viewer-wrap").insertAdjacentHTML("beforeend",`
								<div class="flex1 layer-viewer-row" style="position:relative;">
						    		<label class="form-component" for="sup_cb_-_${l.id}">
						        		<input type="checkbox" class="sup_cb" id="sup_cb_-_${l.id}" name="sup_cb${l.id}" value="${l.id}"><span class="check"></span>
						        		<span class="form-text under">${l.name}</span>
						      		</label>
						      		<a id="lvi-${l.id}" class="layer-viewer-info">...</a>
						      		<div class="info-dropdown">
						      			<div class="opacity-slidecontainer">
						      				<div class="opacity-header" style="flex:1; min-width: 150px;" id="opacity-title-${l.id}"></div>
						      				<div class="${opacityClass}">
						      					<div class="opacity-header opacity-slide-header">Opacity:</div>
		  										<input type="range" min="0" max="1" step=".1" value=".7" class="opacity-slider" id="oslider-${l.id}">
											</div>
										</div>
						   				<div class="description-wrap" id="desc-wrap-${l.id}">
						   					<span class="opacity-header">Description:</span> <span id="layer-desc-${l.id}"></span>
						   				</div>
						   			</div>
						   		</div>
							`)
			         	}
			         	// Group Layers with Group Layers for parents
			         	if (l.type == "Group Layer" && l.parentLayer){
			         		if ( document.querySelector(`#layerGroup-${l.parentLayer.id}`) ){
			         			document.querySelector(`#layerGroup-${l.parentLayer.id}`).insertAdjacentHTML("beforeend", `
		                     		<div class="group-indent">
		                     			<div class="layer-viewer-row top-group-title group-title" id="group-title-${l.id}"><i class="fas fa-caret-right"></i><i class="fas fa-caret-down" style="display:none;"></i><span class="group-label">${l.name}</span></div>
			                  			<div id="layerGroup-${l.id}" class="group-${l.id} group-wrap"></div>
		                     		</div>
		                  		`);
			         		}
			         	}
			         	// Feature/Raster Layers with no parents
			         	if (l.type != "Group Layer" && l.parentLayer){
			         		document.querySelector(`#layerGroup-${l.parentLayer.id}`).insertAdjacentHTML("beforeend", `
		                 		<div class="flex1 group-indent layer-viewer-row" style="position:relative;">
		                   			<label class="form-component" for="sup_cb_-_${l.id}">
		                      			<input type="checkbox" class="sup_cb" id="sup_cb_-_${l.id}" name="sup_cb${l.id}" value="${l.id}"><span class="check"></span>
		                      			<span class="form-text under">${l.name}</span>
		                   			</label>
		                   			
						      		<a id="lvi-${l.id}" class="layer-viewer-info">...</a>
						      		<div class="info-dropdown">
						      			<div class="opacity-slidecontainer">
						      				<div class="opacity-header" style="flex:1; min-width: 150px;" id="opacity-title-${l.id}"></div>
						      				<div class="${opacityClass}">
						      					<div class="opacity-header opacity-slide-header">Opacity:</div>
		  										<input type="range" min="0" max="1" step=".1" value=".7" class="opacity-slider" id="oslider-${l.id}">
											</div>
										</div>
						   				<div class="description-wrap" id="desc-wrap-${l.id}">
						   					<span class="opacity-header">Description:</span> <span id="layer-desc-${l.id}"></span>
						   				</div>
						   			</div>
		                		</div>
		               		`);
			         	}
			         }
		      	})
				// Turn on all Group Layers so child layers show up when clicked
				app.layers.when(function() {
					layerJson.layers.forEach((l) => {
						if (l.id < 90){
							var sublayer = app.layers.findSublayerById(l.id);
							if (l.type == "Group Layer"){
				 	 		    sublayer.visible = true;
				 	 		}else {
				 	 			sublayer.visible = false;
				 	 		}
				 	 	}
					})
				})
				// Checkboxes for supporting layer visibility
				document.querySelectorAll("#layer-viewer-wrap .sup_cb").forEach(cb => cb.addEventListener('click', (() => {
					if (cb.value < 90){
						let sublayer = app.layers.findSublayerById(parseInt(cb.value));
						sublayer.visible = cb.checked;
					}else{	
						if (cb.value == 99){
							app.shellfishLayer.visible = cb.checked;
						}
						if (cb.value == 98){
							app.shorelineChangeLayer.visible = cb.checked;
						}
					}	
				})));
				// Open and close Group Layers
				document.querySelectorAll(".group-title").forEach(gr => gr.addEventListener('click', (() => {
					if ( gr.parentNode.querySelector(".fa-caret-down").style.display == "none" ){
						gr.parentNode.querySelector(".group-wrap").style.display = "block";
						gr.parentNode.querySelector(".fa-caret-down").style.display = "inline-block";
						gr.parentNode.querySelector(".fa-caret-right").style.display = "none";
					}else{
						gr.parentNode.querySelector(".group-wrap").style.display = "none";
						gr.parentNode.querySelector(".fa-caret-down").style.display = "none";
						gr.parentNode.querySelector(".fa-caret-right").style.display = "inline-block";
					}
				})));
				// Layer viewer info click
				document.querySelectorAll(".layer-viewer-info").forEach(info => info.addEventListener('click', (() => {
					let id = info.id.split("-").pop();
					if ( id < 90){
						esriRequest(app.url + "/" + id + "?f=pjson", {responseType: "json"}).then(function(li){
							let des = li.data.description;
							if (des.length == 0){
								des = "None provided";
							}
							let sublayer = app.layers.findSublayerById(parseInt(id));
							let op = sublayer.opacity;
							document.getElementById(`oslider-${id}`).value = op;
							document.querySelector(`#layer-desc-${id}`).innerHTML = des;
							document.querySelector(`#opacity-title-${id}`).innerHTML = li.data.name;
							let h = document.querySelector(`#opacity-title-${id}`).offsetHeight + 11
							document.getElementById(`desc-wrap-${id}`).style.marginTop = h + "px";
						})
					}else{
						if (id == 99){
							let op = app.shellfishLayer.opacity;
							document.getElementById(`oslider-${id}`).value = op;
							document.querySelector(`#layer-desc-${id}`).innerHTML = `Turn on this layer to view shellfish management areas and recreational harvest classifications in the vicinity of your site. This data is sourced from the South Carolina Department of Natural Resources (SC DNR), Office of Fisheries Management. For more information visit the <a href="https://www.dnr.sc.gov/marine/shellfish/shellfishmaps.html" target="_blank">SC DNR Marine Department’s Recreational Shellfish Maps website</a>. `;
							document.querySelector(`#opacity-title-${id}`).innerHTML = "Shellfish Permit Areas";
							let h = document.querySelector(`#opacity-title-${id}`).offsetHeight + 31
							document.getElementById(`desc-wrap-${id}`).style.marginTop = h + "px";
						}
						if (id == 98){
							let op = app.shorelineChangeLayer.opacity;
							document.getElementById(`oslider-${id}`).value = op;
							document.querySelector(`#layer-desc-${id}`).innerHTML = `Assessing shoreline change rate at a given site can also be informative when considering a living shoreline. Turn on the AMBUR Shoreline Change data layer to view estuarine shoreline transects and associated shoreline change rates. This data is sourced from the South Carolina Department of Health and Environmental Control, Office of Ocean and Coastal Resource Management (DHEC OCRM). The shoreline change data was created using an open-source geospatial tool called AMBUR (Analyzing Moving Boundaries Using R). The shoreline change analysis used three time steps: 1800s, 1930s, and 2000s (with data ranging from 1849-2015). View the full <a href="https://gis.dhec.sc.gov/hva/" target="_blank">Coastal Hazard Vulnerability Assessment</a> for more detail.`;
							document.querySelector(`#opacity-title-${id}`).innerHTML = "Shoreline Change Rate";
							let h = document.querySelector(`#opacity-title-${id}`).offsetHeight + 31
							document.getElementById(`desc-wrap-${id}`).style.marginTop = h + "px";
						}
					}
					info.parentNode.querySelector(".info-dropdown").style.display = "block";
				})));
				// hide info popup when mouse leaves
				document.querySelectorAll(".info-dropdown").forEach(row => row.addEventListener('mouseleave', (() => {
					document.querySelectorAll(".info-dropdown").forEach((info) => {
						info.style.display = "none";
					})
				})));

				// opacity slider
				document.querySelectorAll(".opacity-slider").forEach(slider => slider.addEventListener('mouseup', (() => {
					let op = slider.value
					let id = slider.id.split("-").pop();
					if (id == 99){
						app.shellfishLayer.opacity = op;
					}else if (id == 98){
						app.shorelineChangeLayer.opacity = op;
					}else{
						let nid = slider.id.split("-").pop();
						let sublayer = app.layers.findSublayerById(parseInt(id));
						sublayer.opacity = op;
					}
				})));

				// trigger control clicks from app.obj
		   		buildFromState();		
	   		});
		})
	}
}