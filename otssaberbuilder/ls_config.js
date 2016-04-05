// Unofficial OTS Saber Configurator 1.1.1
// by 2016 Marvin Tobisch
// facebook.com/marvin.tobisch
	
// This tool lets you configure a LED saber from Ken Hampton's OTS lightsaber product line. Current features:
// - Mix and match any saber parts in whatever order
// - Modding the build on the fly
// - Zoom and Drag options, including mobile pinch
// - Ability to save and load builds
// - Builds directly saved in URL
// - Random lightsaber function
// - Change background function
// - Saber parts printed
// - Info about part count
	
// The following is still planned:
// - Add info about saber length and cost
// - Perhaps add TCSS parts
	
// Note that this project is in no way officially associated with HHCLS or Ken Hampton and is a pure fan project to practice my web development skills. 
// I hope you have as much fan using this app as I had building it.
// May the force be with you! 

jQuery(document).ready(function($){
	if ($("#ls_config").length) {
		var ls_config = new function() {
			
			// Create Initializer object 
			// -------------------------------------------------------------------------------------------------------------------------
			function Initializer () {
				// Initialize list with all possible parts
				var preloadAssets = (function() {
					$("#ls_preload_assets").append("<img id='ls_preload_img_loadicon' src='assets/loadicon.gif'>");
					$("#ls_preload_assets").append("<img id='ls_preload_img_background1' src='assets/backgrounds/blueprint.jpg'>");
					$("#ls_preload_assets").append("<img id='ls_preload_img_background2' src='assets/backgrounds/carbon_fibre.png'>");
					$("#ls_preload_assets").append("<img id='ls_preload_img_background3' src='assets/backgrounds/wood.png'>");
				})();
				
				this.allParts = (function () {
			  	var json_data = null;
			    
			    // Load partslist.json
			    $.ajax({
		        'async': false, // Synchron oder asynchron laden?
		        'global': false,
		        'url': "partslist.json",
		        'dataType': "json",
		        'beforeSend': function(xhr){ // sonst gibt's Console-Fehler
							if (xhr.overrideMimeType)
						  	{
						      xhr.overrideMimeType("application/json");
						    }
						  },
		        'success': function (data) {
		            json_data = data;
		        }
	   			});
	   			
	   			// Loop through all parts and create preload markup
	   			for (var current_part in json_data) { 
	   				if (json_data.hasOwnProperty(current_part)) {
		   				$("#ls_preload_parts").append("<img class='ls_preload_img_" + json_data[current_part].partName + " ls_part' src='" + json_data[current_part].img_url + json_data[current_part].colors[0] +".png'>");
		   				if (json_data[current_part].colors.length > 1) {
		   					for (var index = 1; index < json_data[current_part].colors.length; index++) {
		   						$("#ls_preload_parts").append("<img class='ls_preload_img_" + json_data[current_part].partName + "_" + json_data[current_part].colors[index] + "' src='" + json_data[current_part].img_url + json_data[current_part].colors[index] +".png'>");
		   					}
		   				}	
						}
	   			}
	   			// Go through each preload img, read partname from class, access part in json object, add native (not browser) width as object property
	 				$("#ls_preload_parts .ls_part").each(function() {
	 					$(this).on("load", function() {
				    	var part = json_data[$(this).attr("class").replace("ls_preload_img_", "").replace(" ls_part","")] // Get part name and access it in list
				    	var tempImage = new Image(); // Create hidden image object to read real width from
							tempImage.src = part.img_url + part.colors[0] + ".png";
							part.partWidth = tempImage.width; // Assign real width
							tempImage = null;
						}).each(function() {
			  			if(this.complete) $(this).load();
						});	
					});	
	    	
	    		return json_data;
				})(); 
				
				this.allMods = (function () {
			  	var json_data = null;
			    
			    // Load partslist.json
			    $.ajax({
		        'async': false, // Synchron oder asynchron laden?
		        'global': false,
		        'url': "modslist.json",
		        'dataType': "json",
		        'beforeSend': function(xhr){ // sonst gibt's Console-Fehler
							if (xhr.overrideMimeType)
						  	{
						      xhr.overrideMimeType("application/json");
						    }
						  },
		        'success': function (data) {
		            json_data = data;
		        }
	   			});
	   			
	   			// Loop through all parts and create preload markup
	   			for (var current_mod in json_data) { 
	   				if (json_data.hasOwnProperty(current_mod)) {
		   				$("#ls_preload_mods").append("<img class='ls_preload_img_" + json_data[current_mod].modName + "_" + json_data[current_mod].colors[0] + " ls_mod' src='" + json_data[current_mod].img_url + json_data[current_mod].colors[0] + ".png'>");		
							if (json_data[current_mod].colors.length > 1) {
		   					for (var index = 1; index < json_data[current_mod].colors.length; index++) {
		   						$("#ls_preload_mods").append("<img class='ls_preload_img_" + json_data[current_mod].modName + "_" + json_data[current_mod].colors[index] + "' src='" + json_data[current_mod].img_url + json_data[current_mod].colors[index] +".png'>");
		   					}
		   				}
						}
	   			}	
	    	
	    		return json_data;
				})();	
				
				this.colors = {
					blue: "#047CB6",
					red: "#D40F0F",
					green: "#00C33E",
					yellow: "#F9B000",
					amber: "#F95800",
					cyan: "#00DFFF",
					violet: "#F22ECC",
					white: "#FFFFFF",
					black: "#242424",
					silver: "#CCCCCC",
					brass: "#F0C03C",
					chrome: "#9E9E9E",
					chrome_black: "#4D4D4D",
					gold: "FF9D00"
				}	
				
				this.backgrounds = [
					"blueprint.jpg", 
					"carbon_fibre.png",
					"wood.png"		
				];
				
				var loadBackground = (function () {
					$("#ls_canvas").append("<div id='ls_background_cover'></div>");
					$("#ls_preload_img_background1").one("load", function() {
						console.log("Background loaded!");
		  			$("#ls_config").css("background-image", "url('assets/backgrounds/blueprint.jpg')");
		  			setTimeout(function() {
		  				$("#ls_background_cover").css("opacity","0");
		  			}, 50);
		  			setTimeout(function() {
		  				$("#ls_background_cover").remove();
		  			}, 1000);
					}).each(function() {
		  			if(this.complete) $(this).load();
					});
				})();
				
				var loadingScreen = (function() {
					$("#ls_config").append("<div id='ls_loadingscreen'><div id=ls_loadingscreen_panel><div id='ls_loadingscreen_icon'></div><h1 id='ls_loadingscreen_text'>Loading assets...</h1></div></div>");
					
					$(window).on("load", function() {
						console.log("Assets loaded!");
						$("#ls_preload_container").remove();
		  			$("#ls_loadingscreen").remove();
		  			if (ui.build.getUrlBuildId() !== "") {
			  			ui.build.resetBuild();
							ui.build.loadBuild(ui.build.getBuildObjectFromId(ui.build.getUrlBuildId()));
						}
					}).each(function() {
		  			if(this.complete) $(this).load();
					});
				})();

			}
			
			Initializer.prototype.centerBuildContainer = function() {
				var canvasHeight = $("#ls_canvas").height();
				var buildContainerHeight = $("#ls_build_container").height();
				$("#ls_build_container").css("top", canvasHeight/2 - buildContainerHeight/2);
				$("#ls_build_container").css("left", "50%");
				$("#ls_build_container").css("right", "50%");
			}
			
			// Create lightsaber object
			// -------------------------------------------------------------------------------------------------------------------------
			function Current_lightsaber () {
				this.currentBuild = []; // All parts (as objects) ordered in an array
				this.partCount = 0;
				this.leftConnector; // Leftmost connector
				this.rightConnector; // Rightmost connector
				this.idGenerator = 0; // ID-Increments for parts in build
			}
			
			Current_lightsaber.prototype.getNewId = function() {
				this.idGenerator++;
				return this.idGenerator;	
			}
			
			Current_lightsaber.prototype.addPart = function (newPart, side) {
				
				newPart.id = "ls_part_" + current_lightsaber.getNewId();
				if (newPart.mod != "none") { newPart.mod.id = "ls_mod_" + current_lightsaber.getNewId(); }
				
				if (this.partCount == 0) {
					this.currentBuild.push(newPart);
					this.leftConnector = newPart.leftConnector;
					this.rightConnector = newPart.rightConnector;
					painter.addImage(newPart, "back");					
				}
				else {
					if (side === "back") {
						this.currentBuild.push(newPart);
						if (!newPart.slip) { // Don't change connector if part just slips over
							this.rightConnector = newPart.rightConnector;	
						}
						if (this.currentBuild.length == 2 && this.currentBuild[0].slip) { // If only part before is slip part, set leftConnector as well
							this.leftConnector = newPart.leftConnector;
						}
						painter.addImage(newPart, "back");
					}
					if (side === "front") {
					  this.currentBuild.unshift(newPart);
					  if (!newPart.slip) {
							this.leftConnector = newPart.leftConnector;	
						}
						if (this.currentBuild.length == 2 && this.currentBuild[this.currentBuild.length-1].slip) {
							this.rightConnector = newPart.rightConnector;
						}
					  painter.addImage(newPart, "front");	 
					}
				}
				this.partCount++;
			}
			
			Current_lightsaber.prototype.removePart = function (side) {
				if (current_lightsaber.currentBuild.length == 0) {
					return;
				}
				
				if (this.partCount == 0) {
					return;
				}
				this.partCount--;
				
				if (side === "back") {
					painter.removeImage(this.currentBuild[this.currentBuild.length-1], "back");			
					this.currentBuild.pop();
					if (this.currentBuild.length == 0) {
						this.rightConnector = null;
						this.leftConnector = null; 
					}
					if (this.currentBuild.length == 1) {
						this.rightConnector = this.currentBuild[0].rightConnector;
						this.leftConnector = this.currentBuild[0].leftConnector;
					}
					if (this.currentBuild.length > 1) {
						if (!this.currentBuild[this.currentBuild.length-1].slip) {
							this.rightConnector = this.currentBuild[this.currentBuild.length-1].rightConnector;
						} else {
							this.rightConnector = this.currentBuild[this.currentBuild.length-2].rightConnector;
						}						
					}
				}
				if (side === "front") {
					painter.removeImage(this.currentBuild[0], "front");
					this.currentBuild.shift();
					if (this.currentBuild.length == 0) {
						this.rightConnector = null;
						this.leftConnector = null; 
					}
					if (this.currentBuild.length == 1) {
						this.rightConnector = this.currentBuild[0].rightConnector;
						this.leftConnector = this.currentBuild[0].leftConnector;
					}
					if (this.currentBuild.length > 1) {
						if (!this.currentBuild[0].slip) {
							this.leftConnector = this.currentBuild[0].leftConnector;
						} else {
							this.leftConnector = this.currentBuild[1].leftConnector;
						}						
					}
				}
			}
			
			Current_lightsaber.prototype.acceptConfig = function (partId, swapPart) {
			// Save swapPart at partID in build, replacing old part
				
				var oldPart;
				for (index = 0; index < this.currentBuild.length; index++) {
					if (this.currentBuild[index].id === partId) {
						oldPart = this.currentBuild[index];
						this.currentBuild[index] = swapPart;
						if (index == 0) {
							if (!this.currentBuild[index].slip || this.currentBuild.length == 1) { // If slip part, only take connector if only part on screen
								this.leftConnector = this.currentBuild[index].leftConnector;
							} else {
								this.leftConnector = this.currentBuild[index+1].leftConnector;
							}
						}
						if (index == this.currentBuild.length-1) {
							if (!this.currentBuild[index].slip || this.currentBuild.length == 1) {
								this.rightConnector = this.currentBuild[index].rightConnector;
							} else {
								this.rightConnector = this.currentBuild[index-1].rightConnector;
							}
						}
						painter.mod.closeConfig(swapPart, oldPart);
					}
				}
			}
			
			Current_lightsaber.prototype.getPartCount = function () {
				return this.partCount;
			}
			
			Current_lightsaber.prototype.getBuild = function () {
				console.log(this.currentBuild);
			}		
			
			Current_lightsaber.prototype.findIndex = function (partId) {
				var partIndex = -1;
				for (var index = 0; index < current_lightsaber.currentBuild.length; index++) {
					if (current_lightsaber.currentBuild[index].id === partId) {
						partIndex = index;
					}
				}
				return partIndex;
			}
			
			Current_lightsaber.prototype.findQualifiedParts = function (leftConnector, rightConnector) {
			 	var qualifiedParts = [];
				
				if (!(leftConnector == null || rightConnector == null)) {
					var leftSaberConnector = leftConnector;
					var rightSaberConnector = rightConnector;
					
					// Loop through every part available
					for (var current_part in ini.allParts) {
						if (ini.allParts.hasOwnProperty(current_part)) {
							var leftPartConnector = ini.allParts[current_part].leftConnector;
							var rightPartConnector = ini.allParts[current_part].rightConnector;
							var normalConnect = false;
							var leftOK = false;
							var rightOK = false;						
							
							// Test with normal orientation
							if (!(leftSaberConnector === "none")) {
								for (var leftsaber_index = 0; leftsaber_index < leftSaberConnector.length; leftsaber_index++) { 	// Cycle through all possible 
									for (var leftpart_index = 0; leftpart_index < leftPartConnector.length; leftpart_index++) { 		// combinations of connectors
										if (leftSaberConnector[leftsaber_index][1] == leftPartConnector[leftpart_index][1]) { 				// Have same connector on left side?
			 								if (((leftSaberConnector[leftsaber_index][0] == "male") && (leftPartConnector[leftpart_index][0] == "female")) || ((leftSaberConnector[leftsaber_index][0] == "female") && (leftPartConnector[leftpart_index][0] == "male"))) { // Test for male-female/female-male
			 									// Left Connection found!
			 									leftOK = true;
			 									
			 								}
			 							}
									}	
								}
							} else {
								leftOK = true;
							}	 
		 					if (!(rightSaberConnector === "none")) {
								for (var rightsaber_index = 0; rightsaber_index < rightSaberConnector.length; rightsaber_index++) { 	// Cycle through all possible 
									for (var rightpart_index = 0; rightpart_index < rightPartConnector.length; rightpart_index++) { 		// combinations of connectors
										if (rightSaberConnector[rightsaber_index][1] == rightPartConnector[rightpart_index][1]) { 				// Have same connector on left side?
			 								if (((rightSaberConnector[rightsaber_index][0] == "male") && (rightPartConnector[rightpart_index][0] == "female")) || ((rightSaberConnector[rightsaber_index][0] == "female") && (rightPartConnector[rightpart_index][0] == "male"))) { // Test for male-female/female-male
			 									// Left Connection found!
			 									rightOK = true;
			 								}
			 							}
									}	
								}
							} else {
								rightOK = true;
							} 
							if (leftOK && rightOK) {
								var qualifiedPart = jQuery.extend({}, ini.allParts[current_part]);
								qualifiedPart.flip = false;
								normalConnect = true;
								qualifiedParts.push(qualifiedPart);
							}
	
			
							// Test with reverse orientation
							if (normalConnect == false) {
								var reverseLeftOK = false;
								var reverseRightOK = false;
								if (!(leftSaberConnector === "none")) {
									for (var leftsaber_index = 0; leftsaber_index < leftSaberConnector.length; leftsaber_index++) { 	// Cycle through all possible 
										for (var rightpart_index = 0; rightpart_index < rightPartConnector.length; rightpart_index++) { 		// combinations of connectors
											if (leftSaberConnector[leftsaber_index][1] == rightPartConnector[rightpart_index][1]) { 							// Have same connector on left side?
				 								if (((leftSaberConnector[leftsaber_index][0] == "male") && (rightPartConnector[rightpart_index][0] == "female")) || ((leftSaberConnector[leftsaber_index][0] == "female") && (rightPartConnector[rightpart_index][0] == "male"))) { // Test for male-female/female-male
				 									// Left Connection found!
				 									reverseLeftOK = true;			
				 								}
				 							}
										}	
									}
								} else {
									reverseLeftOK = true;
								}	 
			 					if (!(rightSaberConnector === "none")) {
									for (var rightsaber_index = 0; rightsaber_index < rightSaberConnector.length; rightsaber_index++) { 	// Cycle through all possible 
										for (var leftpart_index = 0; leftpart_index < leftPartConnector.length; leftpart_index++) { 		// combinations of connectors
											if (rightSaberConnector[rightsaber_index][1] == leftPartConnector[leftpart_index][1]) { 							// Have same connector on left side?
				 								if (((rightSaberConnector[rightsaber_index][0] == "male") && (leftPartConnector[leftpart_index][0] == "female")) || ((rightSaberConnector[rightsaber_index][0] == "female") && (leftPartConnector[leftpart_index][0] == "male"))) { // Test for male-female/female-male
				 									// Left Connection found!
				 									reverseRightOK = true;
				 								}
				 							}
										}	
									}
								} else {
									reverseRightOK = true;
								}
								if (reverseLeftOK && reverseRightOK) {
									var qualifiedPart = jQuery.extend({}, ini.allParts[current_part]);
									qualifiedPart.flip = true;
									qualifiedParts.push(qualifiedPart);
								}
							}
						}	
		 			}
	 			}
	 			else { // If this is the first part, just choose from chassis parts
		 			for (var current_part in ini.allParts) {
   					if (ini.allParts.hasOwnProperty(current_part)) {
   						if (ini.allParts[current_part].partType === "chassis") {
   							qualifiedParts.push(ini.allParts[current_part]);
   						}
   					}
   				}
		 		}
		 		
		 		for (var index = 0; index < qualifiedParts.length; index++) {
		 			if (qualifiedParts[index].partType === "chassis" ) { // Add basic mod to chassis parts
 						qualifiedParts[index].mod = current_lightsaber.findQualifiedMods(qualifiedParts[index].partName)[0];
 						qualifiedParts[index].mod.activeColor = 0;
 						qualifiedParts[index].mod.id = "ls_mod_" + current_lightsaber.getNewId();
					} 
		 		}
		 		
		 			 			
	 			return qualifiedParts;
			}
			
			Current_lightsaber.prototype.findQualifiedMods = function (partName) {
				var mods_array = [];				
				for (var current_mod in ini.allMods) {
					if (ini.allMods.hasOwnProperty(current_mod)) {
						for (var index = 0; index < ini.allMods[current_mod].parts.length; index++) {
							if (ini.allMods[current_mod].parts[index] === partName) {
								mods_array.push(ini.allMods[current_mod]);
							}
						}
					}
				}
				if (partName != "chassis_standard" && partName != "chassis_crystal") {
					mods_array.unshift({
						"modName": "no_mod",
						"prettyName": "No Mod",
						"modType": "none",
						"img_url": "assets/cross",
						"colors": [""],
						"parts": []
					});
				}
				return mods_array;
			}
			
			
			// Create Painter object
			// -------------------------------------------------------------------------------------------------------------------------
			function Painter () {
				if ($("#ls_build_container").length) {
					this.buildContainer = $("#ls_build_container");
					this.startPosition = 0; // Absolute Pos of the left connecting point for adding parts (protruding part clips cut out)
					this.endPosition = 0; // Absolute Pos of the right connecting point for adding parts (protruding part clips cut out)
					this.transition = "all 1s ease"; // CSS Transition value for all animations
					this.slideOffset = 500; // Starting distance for images to fly in with animation
					this.zoomSpamCooldown = false;
				}
			}
			
			Painter.prototype.addImage = function (part, side) {				
				if (current_lightsaber.partCount == 0) {
			
					// Center image and build container 
					var leftPos = Math.round((part.partWidth*ui.getZoom() / 2)*-1); // Part horizontal
					var canvasHeight = $("#ls_canvas").height(); // Build container vertical
					var buildContainerHeight = $("#ls_build_container").height();
					$("#ls_build_container").css("top", canvasHeight/2 - buildContainerHeight/2);

					// Paint part
					this.buildContainer.append("<div id='" + part.id + "' class='ls_part ls_type_" + part.partType + " ls_partname_" + part.partName + "' style='left:" + leftPos + ";'><div class='ls_imgcontainer ls_imgcontainer_"+  part.partName +" ls_config_active' style='top: 0px;'><img class='ls_img ls_img_"+ part.partName +"' src='" + part.img_url + part.colors[part.activeColor] + ".png'></div></div>");	
					$("#ls_build_container > div").last().width(part.partWidth*ui.getZoom()); // Manually set width, b/c child elements are all absolute
					$("#ls_build_container > div").last().find(".ls_imgcontainer").width(part.partWidth*ui.getZoom());
					this.animateAddImage(part, "");
					this.startPosition = parseInt($("#ls_build_container > div").first().css("left")) + (ui.getZoom() * part.leftClip); // Recalculate both, because the first element needs to establish them
					this.endPosition = parseInt($("#ls_build_container > div").last().css("left")) + $("#ls_build_container img").last().width() - (ui.getZoom() * part.rightClip);
					//Paint mod
					if (part.mod !== "none") {
						$("#ls_build_container > div").last().find(".ls_imgcontainer").append("<img id='" + part.mod.id + "' class='ls_mod ls_mod_"+ part.mod.modName + (part.flip ? " ls_flip" : "") +"'src='" + part.mod.img_url + part.mod.colors[part.mod.activeColor] + ".png' >");		
					}
					// Click Listener
					$("#ls_build_container > div").last().on("dblclick doubletap", function() {
						ui.mod.startConfig($(this).attr("id"));
					});
				}
				else {
					if (side === "back") {
						// Paint part		
						this.buildContainer.append("<div id='" + part.id + "' class='ls_part ls_type_" + part.partType + " ls_partname_" + part.partName + "'><div class='ls_imgcontainer ls_imgcontainer_"+  part.partName +" ls_config_active' style='top: 0px;'><img class='ls_img ls_img_"+ part.partName + (part.flip ? " ls_flip" : "") + "' src='" + part.img_url + part.colors[part.activeColor] + ".png'></div></div>");	
						$("#ls_build_container > div").last().width(part.partWidth*ui.getZoom()); // Manually set width, b/c child elements are all absolute
						$("#ls_build_container > div").last().find(".ls_imgcontainer").width(part.partWidth*ui.getZoom());
						this.animateAddImage(part, "back");
						this.endPosition += part.partWidth*ui.getZoom() - ((part.rightClip*ui.getZoom()) + (part.leftClip*ui.getZoom())); // Subtract both clips from part width
						// Paint mod
						if (part.mod !== "none") {
							$("#ls_build_container > div").last().find(".ls_imgcontainer").append("<img id='" + part.mod.id + "' class='ls_mod ls_mod_"+ part.mod.modName + (part.flip ? " ls_flip" : "") +"'src='" + part.mod.img_url + part.mod.colors[part.mod.activeColor] + ".png' >");		
						}
						// Click Listener
						$("#ls_build_container > div").last().on("dblclick doubletap", function() {
						ui.mod.startConfig($(this).attr("id"));
					});
					}

					if (side == "front") {
						// Paint part			
						this.buildContainer.prepend("<div id='" + part.id + "' class='ls_part ls_type_" + part.partType + " ls_partname_" + part.partName + "'><div class='ls_imgcontainer ls_imgcontainer_"+  part.partName +" ls_config_active' style='top: 0px;'><img class='ls_img ls_img_"+ part.partName + (part.flip ? " ls_flip" : "") + "' src='" + part.img_url + part.colors[part.activeColor] + ".png'></div></div>");	
						$("#ls_build_container > div").first().width(part.partWidth*ui.getZoom()); // Manually set width, b/c child elements are all absolute
						$("#ls_build_container > div").first().find(".ls_imgcontainer").width(part.partWidth*ui.getZoom());
						this.animateAddImage(part, "front");
						this.startPosition -= part.partWidth*ui.getZoom() - ((part.rightClip*ui.getZoom()) + (part.leftClip*ui.getZoom()));
						// Paint mod
						if (part.mod !== "none") {
							$("#ls_build_container > div").first().find(".ls_imgcontainer").append("<img id='" + part.mod.id + "' class='ls_mod ls_mod_"+ part.mod.modName + (part.flip ? " ls_flip" : "") + "'src='" + part.mod.img_url + part.mod.colors[part.mod.activeColor] + ".png' >");		
						}
						// Click Listener
						$("#ls_build_container > div").first().on("dblclick doubletap", function() {
						ui.mod.startConfig($(this).attr("id"));
					});
					}
				}				
				// Position mod
				if (part.modAttachment == "left") {
					$("#" + part.mod.id).css("left", part.modOffset*ui.getZoom());
				}
				if (part.modAttachment == "right") {
					$("#" + part.mod.id).css("right", part.modOffset*ui.getZoom());
				}	
			}
			
			Painter.prototype.removeImage = function (part, side) {		
				// Remove animations
				// Move last part down out of screen
				if (current_lightsaber.currentBuild.length == 1) {
					var distanceToBottom = $(window).height() - painter.buildContainer.find("#" + part.id).offset().top; // Get distance to bottom of screen
					
					painter.buildContainer.find("#" + part.id).css("transition", painter.transition);
					painter.buildContainer.find("#" + part.id).css("top", distanceToBottom);
					setTimeout(function() {
						ini.centerBuildContainer();
					}, painter.transition.split(" ")[1].slice(0,-1)*1000); // Wait transition delay */	
				}
				// Move other parts left and right and fade them out
				else {	
					if (side === "front") {
						painter.buildContainer.find("#" + part.id).css("transition", painter.transition);
						painter.buildContainer.find("#" + part.id).css("left", "-=500");
					}
					if (side === "back") {
						painter.buildContainer.find("#" + part.id).css("transition", painter.transition);
						painter.buildContainer.find("#" + part.id).css("left", "+=500");
					}
					painter.buildContainer.find("#" + part.id).find("img").css("transition", painter.transition);
					painter.buildContainer.find("#" + part.id).find("img").css("opacity", 0);		
				}
				
				// Reset start- and endPositions
				if (side === "back") {
					this.endPosition -= part.partWidth*ui.getZoom() - ((ui.getZoom() * part.rightClip) + (ui.getZoom() * part.leftClip));	// Subtract Clips from Part Width again
				} else {
					this.startPosition += part.partWidth*ui.getZoom() - ((ui.getZoom() * part.rightClip) + (ui.getZoom() * part.leftClip));	
				}
				
				// And lastly, remove part from html completely
				setTimeout(function() {
					painter.buildContainer.find("#" + part.id).remove();			
				}, painter.transition.split(" ")[1].slice(0,-1)*1000); // Wait transition delay */
			}
			
			Painter.prototype.animateAddImage = function (part, side) {
				if (current_lightsaber.currentBuild.length == 1) { // First part
					var initialPos = (painter.buildContainer.find("#" + part.id).offset().top + painter.buildContainer.find("#" + part.id).height())*-1; // Get distance to top of screen + part-height
					var finalPos = 0;
					
					// Animation
					$("#ls_build_container > div").first().css("top", initialPos);
					$("#ls_build_container > div").first().css("transition", this.transition);
					setTimeout(function(){ // Some timeout needed. If instant, browser will just take last left css value in row to save work. Stupid.
						$("#ls_build_container > div").first().css("top", finalPos); 			
					}, 30);
				}
				
				if (side === "back") {
					// Get right image edge to determine even starting distances regardless of clippings
					var rightImageEdge = -50000;
					$("#ls_build_container > div:not(:last-of-type)").each(function() { // Not last div, because that's the part currently being positioned
						var test_int = parseInt($(this).css("left")) + $(this).width();
						if ( test_int > rightImageEdge) {
							rightImageEdge = test_int;
						}
					});
					
					var initialPos = rightImageEdge + (500*ui.getZoom());
					var finalPos = this.endPosition - (part.leftClip * ui.getZoom());
					
					// Animation
					$("#ls_build_container > div").last().css("left", initialPos);
					$("#ls_build_container > div").last().css("top", 0);
					$("#ls_build_container > div").last().css("transition", this.transition);
					setTimeout(function(){ // Some timeout needed. If instant, browser will just take last left css value in row to save work. Stupid.
						$("#ls_build_container > div").last().css("left", finalPos); 			
					}, 30);
				}
				
				if (side === "front") {
					// Get left image edge to determine even starting distances regardless of clippings
					var leftImageEdge = 50000;
					$("#ls_build_container > div:not(:first-of-type)").each(function() {
						var test_int = parseInt($(this).css("left"));
						if ( test_int < leftImageEdge) {
							leftImageEdge = test_int;
						}
					});
					
					var initialPos = leftImageEdge - part.partWidth*ui.getZoom() - (500*ui.getZoom());
					var finalPos = this.startPosition - part.partWidth*ui.getZoom() + (part.rightClip * ui.getZoom());
					
					// Animation
					$("#ls_build_container > div").first().css("left", initialPos);
					$("#ls_build_container > div").first().css("top", 0);
					$("#ls_build_container > div").first().css("transition", this.transition);
					setTimeout(function(){ // Some timeout needed. If instant, browser will just take last left css value in row to save work. Stupid.
						$("#ls_build_container > div").first().css("left", finalPos); 
					}, 30);
				}
			}
			
			Painter.prototype.animateRemoveImage = function (side) {
				
			}
			
			Painter.prototype.changeZoom = function (direction) {
			// Change zoom level. Recalculate all element positions as well as startPosition and endPosition.
				// If at max or min zoom, do nothing
				
				if ((direction === "in" && ui.currentZoom == 20) || (direction === "out" && ui.currentZoom == 2)) {
					return;
				}	
				
				$(".ls_part").css("transition","");
				$(".ls_imgcontainer").css("transition", "");
				
				// Is part being modded right now? If so, close config (start again after zoom).
				var partInConfig = "none";
				if (ui.mod.moddingInProgress && ui.mod.partInConfig !== "none") {
					partInConfig = ui.mod.partInConfig;
					ui.mod.acceptConfig(partInConfig);
				}
				// Determine visual edges before zoom
				var leftmostVisualPart = current_lightsaber.currentBuild[0];
				if (current_lightsaber.currentBuild.length > 1) {								// If chassis flipped and has foregrip attached, take chassis as leftmost part instead of foregrip for correct zoom centering
					if (current_lightsaber.currentBuild[1].partType === "chassis" && current_lightsaber.currentBuild[1].flip == true) {
						leftmostVisualPart = current_lightsaber.currentBuild[1];
					}
				}
				
				var oldLeftmostClip = leftmostVisualPart.leftClip*ui.getZoom();
				var oldEdges = this.calculateImageEdges();
				if (current_lightsaber.currentBuild.length > 1) {
					if (current_lightsaber.currentBuild[0].partType === "blade") {
						oldEdges[0] = oldEdges[0] + current_lightsaber.currentBuild[0].partWidth*ui.getZoom() - current_lightsaber.currentBuild[1].leftClip*ui.getZoom();
					}
					if (current_lightsaber.currentBuild[current_lightsaber.currentBuild.length-1].partType === "blade") {
						oldEdges[1] = oldEdges[1] - current_lightsaber.currentBuild[current_lightsaber.currentBuild.length-1].partWidth*ui.getZoom() + current_lightsaber.currentBuild[current_lightsaber.currentBuild.length-2].rightClip*ui.getZoom();
					}
				}
				
				// Set new zoom levels
				var current_height = parseInt($("#ls_build_container").css("height"));			
				if (direction === "in") {
					if (ui.currentZoom < 20) {
						ui.currentZoom += 1;
						current_height += 25;
						$("#ls_build_container").css("height",current_height);
					}					
				}
				if (direction === "out") {
					if (ui.currentZoom > 2) {
						ui.currentZoom -= 1;
						current_height -= 25;
						$("#ls_build_container").css("height",current_height);
					} 
				}
				
				// Recalculate width of parts
				for (var index = 0; index < current_lightsaber.currentBuild.length; index++) {
					$("#" + current_lightsaber.currentBuild[index].id).width(current_lightsaber.currentBuild[index].partWidth*ui.getZoom()); 
					$("#" + current_lightsaber.currentBuild[index].id + " .ls_imgcontainer").width(current_lightsaber.currentBuild[index].partWidth*ui.getZoom()); 
				}
											
				// Reposition build parts
				leftClipDifference = leftmostVisualPart.leftClip*ui.getZoom() - oldLeftmostClip; 	// To fix left starting point with leftClip. Otherwise slight shift with each zoom.
				var loopPartPosition = this.startPosition + leftClipDifference;																		// Left starting point for repaint, gets updated for each part in row
				for (var index = 0; index < current_lightsaber.currentBuild.length; index++) { 										// Go through build parts, reposition each, calculate position for next part, repeat
					loopPartPosition -= current_lightsaber.currentBuild[index].leftClip*ui.getZoom(); 							// Subtract left clip
					$("#" + current_lightsaber.currentBuild[index].id).css("left", loopPartPosition);
					// Reposition mods
					if (current_lightsaber.currentBuild[index].modAttachment == "left") {
						$("#" + current_lightsaber.currentBuild[index].id).find(".ls_mod").css("left", current_lightsaber.currentBuild[index].modOffset*ui.getZoom());
					}
					if (current_lightsaber.currentBuild[index].modAttachment == "right") {
						$("#" + current_lightsaber.currentBuild[index].id).find(".ls_mod").css("right", current_lightsaber.currentBuild[index].modOffset*ui.getZoom());
					}			
					loopPartPosition += current_lightsaber.currentBuild[index].partWidth*ui.getZoom() - current_lightsaber.currentBuild[index].rightClip*ui.getZoom(); // Add part width and subtract right clip
				}
				this.startPosition = this.startPosition + leftClipDifference;
				this.endPosition = loopPartPosition;
				
				// Bonus: Position centering saber more neatly in the middle 
				// Vertically 	
				if (direction === "in") {
					$("#ls_build_container").css("top", "-=12.5");
				}
				if (direction === "out") {
					$("#ls_build_container").css("top", "+=12.5");
				} 
				
				//Horizontally
				var newEdges = this.calculateImageEdges();
				if (current_lightsaber.currentBuild.length > 1) { 																								// Disregard blades when centering, always center on hilt
					if (current_lightsaber.currentBuild[0].partType === "blade") {
						newEdges[0] = newEdges[0] + current_lightsaber.currentBuild[0].partWidth*ui.getZoom() - current_lightsaber.currentBuild[1].leftClip*ui.getZoom();
					}
					if (current_lightsaber.currentBuild[current_lightsaber.currentBuild.length-1].partType === "blade") {
						newEdges[1] = newEdges[1] - current_lightsaber.currentBuild[current_lightsaber.currentBuild.length-1].partWidth*ui.getZoom() + current_lightsaber.currentBuild[current_lightsaber.currentBuild.length-2].rightClip*ui.getZoom();
					}
				}
				zoomOffset = (Math.abs(newEdges[0] - oldEdges[0]) + Math.abs(newEdges[1] - oldEdges[1]))/2; 			// Width difference between old and new image sizes/2
				if (direction === "in") {
					$("#ls_build_container").css("left", "-=" + zoomOffset);
				}
				if (direction === "out") {
					$("#ls_build_container").css("left", "+=" + zoomOffset);
				}
				
				// Restart config if part was being modded
				if (partInConfig !== "none") {
					ui.mod.startConfig(partInConfig);
					$(".ls_part").css("transition", "none");
					$("#config_panel").css("transition", "none");
				}
			}
			
			Painter.prototype.calculateImageEdges = function() {
			// Get visible edges of saber in canvas (including clips)
			
				var rightImageEdge = -50000;
				var leftImageEdge = 50000;
				$("#ls_build_container .ls_part").each(function() {
					var right_test = parseFloat($(this).attr("style").match(/left:\s*(.*?)px;/)[1]) + parseFloat($(this).attr("style").match(/width:\s*(.*?)px;/)[1]);
					var left_test  = parseFloat($(this).attr("style").match(/left:\s*(.*?)px;/)[1]);
					
					if (right_test > rightImageEdge) {
						rightImageEdge = right_test;
					}
					if ( left_test < leftImageEdge) {
						leftImageEdge = left_test;
					}
				});
				return [leftImageEdge, rightImageEdge];
			}
			
			// Subclass for modding the build
			//-------------------------------------------------------
			function Painter_Mod () {			
				this.verticalDistance = -400;
				this.leftDistance = 300;
				this.rightDistance = 300;
				this.leftClip;
				this.rightClip;
			}
			
			Painter_Mod.prototype.startConfig = function (part_id, switchParts) {
				// Function to initate changing a part in the build. Space adjescent parts away, bring up selection from switchParts						
				$("#ls_modbutton").hide();
				
				// First step: Visually seperate parts at equal distances
				var loop_position = "left";
				var prevPartsEdge = -50000; // Previous parts, rightmost visual edge
				var nextPartsEdge = 50000; // Next parts, leftmost visual edge
				
				// Determine rightmost edge of all previous parts and the leftmost edge of all following parts (relative to part to mod)
				for (var index = 0; index < current_lightsaber.currentBuild.length; index++) { 
					if (current_lightsaber.currentBuild[index].id !== part_id) {
						if (loop_position === "left") {
							var partEndTest = parseInt($("#" + current_lightsaber.currentBuild[index].id).attr("style").match(/left:\s*(.*?)px;/)[1]) + current_lightsaber.currentBuild[index].partWidth*ui.getZoom(); // Get right visual end of part
							if (partEndTest > prevPartsEdge) {
								 prevPartsEdge = partEndTest;		// New rightmost edge found!
							}
						}
						if (loop_position === "right") {
							var partEndTest = parseInt($("#" + current_lightsaber.currentBuild[index].id).attr("style").match(/left:\s*(.*?)px;/)[1]); // Get left visual end of part
							if (partEndTest < nextPartsEdge) {
								 nextPartsEdge = partEndTest;		// New leftmost edge found!
							}
						}
					} else { // Change direction when at part to mod
						loop_position = "right";
					}
				}
				
				// Calculate how far the edges reach into part to mod
				var partToMod = $("#" + part_id); 
				if (prevPartsEdge > parseInt(partToMod.attr("style").match(/left:\s*(.*?)px;/)[1])) {
					this.leftClip = prevPartsEdge - parseInt(partToMod.attr("style").match(/left:\s*(.*?)px;/)[1]);
				}
				if (nextPartsEdge < parseInt(partToMod.attr("style").match(/left:\s*(.*?)px;/)[1]) + parseFloat(partToMod.attr("style").match(/width:\s*(.*?)px;/)[1])) {
					this.rightClip = parseInt(partToMod.attr("style").match(/left:\s*(.*?)px;/)[1]) + parseFloat(partToMod.attr("style").match(/width:\s*(.*?)px;/)[1]) - nextPartsEdge;
				}
				
				// Seperate previous and next parts with clips in mind
				var buildPosition = "left";
				var clipOffset = this.leftClip;
				var distance = this.leftDistance*ui.getZoom();
				
				for (var index = 0; index < current_lightsaber.currentBuild.length; index++) {
					if (current_lightsaber.currentBuild[index].id !== part_id) {
						var partPos = parseInt($("#" + current_lightsaber.currentBuild[index].id).attr("style").match(/left:\s*(.*?)px;/)[1]);
						if (buildPosition === "left") {
							$("#" + current_lightsaber.currentBuild[index].id).css("left", partPos - (distance + clipOffset)); 
						}
						if (buildPosition === "right") {
							$("#" + current_lightsaber.currentBuild[index].id).css("left", partPos + (distance + clipOffset)); 
						}
						$("#" + current_lightsaber.currentBuild[index].id).css("transition", painter.transition);
					} else {
						buildPosition = "right";
						clipOffset = this.rightClip;
						distance = this.rightDistance*ui.getZoom();
					}
				}
				
				// Second step: Display switch parts above and below part to mod
				var partsAbove = 0;
				var part;
				for (var index = 0; index < current_lightsaber.currentBuild.length; index++) {
					if (current_lightsaber.currentBuild[index].id === part_id) {
						part = current_lightsaber.currentBuild[index];
					}
				}
				
				$("#" + part_id + " .ls_imgcontainer").not(".ls_config_active").remove(); // Before beginning, remove all possibly remaining switch parts, just to make sure everything is clean
				
				var loop_pos = "before"; 
				for (var index = 0; index < switchParts.length; index++) { // Create switch parts
					if (switchParts[index].partName !== part.partName) {
						if (loop_pos === "before")  {
							$("#" + part_id + " .ls_imgcontainer_" + part.partName).before("<div class='ls_imgcontainer ls_imgcontainer_"+ switchParts[index].partName +"'><img class='ls_img ls_img_"+ switchParts[index].partName +"' src='"+ switchParts[index].img_url + switchParts[index].colors[0] +".png'></div>");
							$("#" + part_id + " .ls_imgcontainer_" + switchParts[index].partName).width(switchParts[index].partWidth*ui.getZoom());
							$("#" + part_id + " .ls_imgcontainer_" + switchParts[index].partName).css("top","-1000px");
							$("#" + part_id + " .ls_imgcontainer_" + switchParts[index].partName).find("img").addClass(switchParts[index].flip ? " ls_flip" : "");
	
							partsAbove++;
						}
						if (loop_pos === "after") {
							$("#" + part_id).append("<div class='ls_imgcontainer ls_imgcontainer_"+ switchParts[index].partName +"'><img class='ls_img ls_img_"+ switchParts[index].partName +"' src='"+ switchParts[index].img_url + switchParts[index].colors[0] +".png'></div>");
							$("#" + part_id + " .ls_imgcontainer_" + switchParts[index].partName).width(switchParts[index].partWidth*ui.getZoom());
							$("#" + part_id + " > div").last().css("top","1000px");
							$("#" + part_id + " .ls_imgcontainer_" + switchParts[index].partName).find("img").addClass(switchParts[index].flip ? " ls_flip" : "");
						}
					} else {
						loop_pos = "after";
					}
					// Add mods
					if (switchParts[index].mod != undefined && switchParts[index].mod !== "none" && switchParts[index].partName !== part.partName) { // Für Chassis-Basis-Mod. Wird schon bei findQualifiedParts() hinzugefügt.
						$("#" + part_id + " .ls_imgcontainer_" + switchParts[index].partName).append("<img id='" + switchParts[index].mod.id + "' class='ls_mod ls_mod_"+ switchParts[index].mod.modName + (switchParts[index].flip ? " ls_flip" : "") +"'src='" + switchParts[index].mod.img_url + switchParts[index].mod.colors[switchParts[index].mod.activeColor] + ".png' >");		
						// Position mod
						if (switchParts[index].modAttachment == "left") {
							$("#" + switchParts[index].mod.id).css("left", switchParts[index].modOffset*ui.getZoom());
							$("#" + switchParts[index].mod.id).css("right", "auto");
						}
						if (switchParts[index].modAttachment == "right") {
							$("#" + switchParts[index].mod.id).css("right", switchParts[index].modOffset*ui.getZoom());
							$("#" + switchParts[index].mod.id).css("left", "auto");
						}
					}
				}
				
				$("#" + part_id).unbind(); // Unbind open config doubleclick
				
				$("#" + part_id + " .ls_imgcontainer").on("dblclick doubletap", function() { // Activate close config doubleclick (on active part)
					if ($(this).hasClass("ls_config_active")) {
						if (!ui.mod.startModCooldown) {
							ui.mod.acceptConfig(part_id);
						}
					}
				});
				$("#" + part_id + " .ls_imgcontainer").not(".ls_config_active").addClass("ls_config_lowerCard"); 

				// Animate parts swooping in
				setTimeout(function() { 
					var distance = painter.mod.verticalDistance*ui.getZoom();	
					$("#" + part_id + " > div").each(function() {
						if ($(this).attr("id") !== "config_panel") {
							$(this).css("transition", painter.transition);
							if (parseInt($(this).css("top")) < 0 || parseInt($(this).css("top")) > 0) {
								$(this).css("top", distance*partsAbove);
								partsAbove--;
							} else {
								partsAbove--;
							}
						}
					});
				},50);
				
				// Third step: Create config panel
				$("#" + part_id).prepend("<div id='config_panel'><div id='config_buttons_vertical'><a id='config_button_up' class='config_global_upArrow config_button_topDown' href='#'></a><a id='config_button_down' class=' config_global_downArrow config_button_topDown' href='#'></a></div></div>");
				$("#config_buttons_vertical .config_button_topDown").width(120*ui.getZoom());
				$("#config_buttons_vertical .config_button_topDown").css("left", ($("#config_button_up").width()/2)*-1 );
				$("#config_buttons_vertical").height(500*ui.getZoom());	
				var h_distance = 200*ui.getZoom();
				$("#config_panel").append("<div id='config_buttons_horizontal'><a id='config_button_left' class='config_global_leftArrow config_button_leftRight' href='#'></a><a id='config_button_leftPlus' class='config_button_leftRight config_global_leftPlus' href='#'></a><a id='config_button_rightPlus' class='config_button_leftRight config_global_rightPlus' href='#'></a><a id='config_button_right' class='config_global_rightArrow config_button_leftRight' href='#'></a></div>");	
				$("#config_button_leftPlus").hide();
				$("#config_button_rightPlus").hide();
				$("#config_buttons_horizontal .config_button_leftRight").height(120*ui.getZoom());
				$("#config_buttons_horizontal").css("left", parseFloat($("#" + part_id).attr("style").match(/width:\s*(.*?)px;/)[1])/2*-1 - h_distance);  // Subtract 1/2 width + h_distance
				$("#config_buttons_horizontal").css("width", parseFloat($("#" + part_id).attr("style").match(/width:\s*(.*?)px;/)[1]) + h_distance*2 ); // Width + 2*h_distance
				$("#config_buttons_horizontal .config_button_leftRight").css("top", ($("#config_button_left").height()/2)*-1 );
				$("#config_panel").css("opacity","1");
			}
						
			Painter_Mod.prototype.switchPart = function (direction, part_id) {
				var transition_scroll = "all 0.5s ease";
				var previousWidth = $("#"+ part_id +" .ls_config_active .ls_img").width();
				
				// Move parts up or down
				if (direction === "up") {
					if (!($("#" + part_id + " .ls_imgcontainer:first").hasClass("ls_config_active"))) { // Only proceed if active part isn't top of the list already
						$("#" + part_id + " .ls_imgcontainer").each(function() {
							$(this).css("transition", transition_scroll);
							var current_pos = parseInt($(this).attr("style").match(/top:\s*(.*?)px;/)[1]);
							current_pos += Math.abs(painter.mod.verticalDistance*ui.getZoom());
							$(this).css("top", current_pos);
						});
						$("#" + part_id + " .ls_config_active").removeClass("ls_config_active").prev(".ls_imgcontainer").addClass("ls_config_active");
						$("#" + part_id + " .ls_imgcontainer").removeClass("ls_config_lowerCard").not(".ls_config_active").addClass("ls_config_lowerCard");
					}
				}
				if (direction === "down") {
					if (!($("#" + part_id + " .ls_imgcontainer:last").hasClass("ls_config_active"))) {
						$("#" + part_id + " .ls_imgcontainer").each(function() {
							$(this).css("transition", transition_scroll);
							var current_pos = parseInt($(this).attr("style").match(/top:\s*(.*?)px;/)[1]);
							current_pos -= Math.abs(painter.mod.verticalDistance*ui.getZoom());
							$(this).css("top", current_pos);
						});
						$("#" + part_id + " .ls_config_active").removeClass("ls_config_active").next(".ls_imgcontainer").addClass("ls_config_active");
						$("#" + part_id + " .ls_imgcontainer").removeClass("ls_config_lowerCard").not(".ls_config_active").addClass("ls_config_lowerCard");
					}
				}
				
				// Distance following parts according to active part width
				$("#" + part_id).width($("#" + part_id + " .ls_config_active .ls_img").width()); // Set new width for overall container
				var widthDifference =  $("#" + part_id + " .ls_config_active .ls_img").width() - previousWidth;
				$("#"+ part_id).nextAll().css({	"transition": transition_scroll,
																				"left": "+=" + widthDifference});
				
				$("#config_buttons_horizontal").css("left", ($("#" + part_id + " .ls_config_active .ls_img").width()/2)*-1 - 200*ui.getZoom());
				$("#config_buttons_horizontal").width( $("#" + part_id + " .ls_config_active .ls_img").width() + 200*ui.getZoom()*2 );
			}
			
			Painter_Mod.prototype.flipPart = function (activePart) {
				if ($("#" + activePart.id + " .ls_config_active img").hasClass("ls_flip")) {
					$("#" + activePart.id + " .ls_config_active img").removeClass("ls_flip");
				} else {
					$("#" + activePart.id + " .ls_config_active img").addClass("ls_flip");
				}
				
				if ($("#" + activePart.id + " .ls_config_active").has(".ls_mod").length != 0) {
					var leftPos;
					var rightPos;
					
					if (activePart.modAttachment === "left") {
						leftPos = "";
						rightPos = activePart.modOffset*ui.getZoom();
					}
					if (activePart.modAttachment === "right") {
						leftPos = activePart.modOffset*ui.getZoom();
						rightPos = "";
					}
					$("#" + activePart.id + " .ls_mod").css({ "left": leftPos,
																										"right": rightPos
					});
				}
			}
			
			Painter_Mod.prototype.cycleMods = function (activePart, nextMod) {
				if (activePart.mod !== "none") {
					$("#" + activePart.id + " .ls_config_active .ls_mod").remove();
				}
				if (nextMod.modName !== "no_mod") {
					$("#" + activePart.id + " .ls_config_active").append("<img id='ls_mod_" + current_lightsaber.getNewId() + "' class='ls_mod ls_mod_"+ nextMod.modName + (activePart.flip ? " ls_flip" : "") +"'src='" + nextMod.img_url + nextMod.colors[0] +".png' >");
					
					if (activePart.modAttachment == "left") {
						$("#" + activePart.id + " .ls_mod").css("left", activePart.modOffset*ui.getZoom());
					}
					if (activePart.modAttachment == "right") {
						$("#" + activePart.id + " .ls_mod").css("right", activePart.modOffset*ui.getZoom());
					}
				}
			}
			
			Painter_Mod.prototype.closeConfig = function (swapPart, oldPart) {
				// Close config ui
				$("#config_panel").remove();
				setTimeout(function() { // Wait a bit, then if config is definitely closed, remove config container. Helps prevent flickering on quick close/open of config
					if (!ui.mod.moddingInProgress) {
						$("#ls_modbutton").show();
						$("#ls_config_container").remove();
					}
				}, 50);
				
				// Move switch parts up and down to remove them
				var topPos = -1000;
				$("#" + swapPart.id + " div").each(function() {
					if(!($(this).hasClass("ls_config_active"))) {
						$(this).css("transition", painter.transition);
						$(this).css("top", topPos);
					}
					else {
						topPos = 1000;
					}
				});
				
				// Adjust startPosition for new part. Makes sure parts with left clips (e.g. shrouds, flip chassis) don't move if left clip different. The rest of build flows around fixed selected part.
				painter.startPosition += (swapPart.leftClip - oldPart.leftClip)*ui.getZoom(); 

				// Reposition build parts
				$(".ls_part").css("transition", painter.transition);
				var loopPartPosition = painter.startPosition; 																			// Left starting point for repaint, gets updated for each part in row
				for (var index = 0; index < current_lightsaber.currentBuild.length; index++) { 			// Go through build parts, reposition each, calculate position for next part, repeat		
					loopPartPosition -= current_lightsaber.currentBuild[index].leftClip*ui.getZoom(); // Subtract left clip
					$("#" + current_lightsaber.currentBuild[index].id).css("left", loopPartPosition);		
					loopPartPosition += current_lightsaber.currentBuild[index].partWidth*ui.getZoom() - current_lightsaber.currentBuild[index].rightClip*ui.getZoom(); // Add part width and subtract right clip
				}
				painter.endPosition = loopPartPosition;
				
				ui.disableButtons(false);
				$("#" + swapPart.id + " .ls_imgcontainer").unbind();
				$("#" + swapPart.id).removeClass().addClass("ls_part ls_type_"+ swapPart.partType +" ls_partname_"+ swapPart.partName);
				
				setTimeout(function() { // Remove switch parts after they've hovered offscreen
					if (!(ui.mod.moddingInProgress == true && ui.mod.partInConfig == swapPart.id)) { 				// Don't do the following when a quick user changed the part but came back again before timeout started
						$("#" + swapPart.id + " .ls_imgcontainer").not(".ls_config_active").remove();				 	// Remove all imgcontainers (don't do, b/c otherwise new ones will be deleted with the old ones)
						$("#" + swapPart.id).on("dblclick doubletap", function() {														// Make dblclick open config (don't do, b/c this will "overwrite" newly registered close config dblclick otherwise)
							ui.mod.startConfig($(this).attr("id"));
						});	
					}		
				}, painter.transition.split(" ")[1].slice(0,-1)*1000);
				
			}
			
			// Subclass for managing saving and loading builds
			//-------------------------------------------------------
			function Painter_Build () {			
			}
			
			Painter_Build.prototype.resetBuild = function (transition, setHistory) {
				if (current_lightsaber.currentBuild && current_lightsaber.currentBuild.length > 0) {
					var buildNumber = ui.build.getBuildNumber();
					// Delete all ids from old build to make them available for new build asap
					$("#ls_build_container").attr("id", "ls_build_container_old_" + buildNumber);
					$("#ls_build_container_old_"+ buildNumber +" .ls_part").attr("id", "");
					$("#ls_build_container_old_"+ buildNumber + " .ls_mod").attr("id", "");
					
					// Move old build out of window and remove
					var distanceToBottom = $(window).height() - $("#ls_build_container_old_"+ buildNumber).offset().top; // Get distance to bottom of screen
					$("#ls_build_container_old_"+ buildNumber).css("transition", transition);
					$("#ls_build_container_old_"+ buildNumber).css("top", "+=" + distanceToBottom);
					if (setHistory != false) { // No animations on browser back/forward
						setTimeout(function() {
							$("#ls_build_container_old_"+ buildNumber).remove();
						},transition.split(" ")[1].slice(0,-1)*1000);
					} else {
						$("#ls_build_container_old_"+ buildNumber).remove();
					}
					
					
					// Create new build container 
					$("#ls_paint_container").append("<div id='ls_build_container' class='ls_canvas_container'></div>");
					painter.buildContainer = $("#ls_build_container");
					$("#ls_build_container").height(ui.currentZoom*25);
					painter.startPositon = 0;
					painter.endPosition = 0;
					$('#ls_paint_container #ls_build_container').draggable({
						handle: ".ls_imgcontainer" // Only drag on this element. Fixes mobile problem where the arrows couldn't be clicked b/c they were also draggable
					}); 
					
					// Place build container to center
					var canvasHeight = $("#ls_canvas").height();
					var buildContainerHeight = $("#ls_build_container").height();
					$("#ls_build_container").css("top", canvasHeight/2 - buildContainerHeight/2);
					$("#ls_build_container").css("left", "50%");
					$("#ls_build_container").css("right", "50%");
				}
			}
			
			Painter_Build.prototype.paintBuild = function (transition, build, setHistory) {
				
				// Get final positions of parts
				var posArray = [];
				var loopPartPosition = 0 + build[0].leftClip*ui.getZoom();							// Left starting point for repaint, gets updated for each part in row
				for (var index = 0; index < build.length; index++) { 										// Go through build parts, reposition each, calculate position for next part, repeat
					loopPartPosition -= build[index].leftClip*ui.getZoom(); 							// Subtract left clip
					posArray.push(loopPartPosition);	
					loopPartPosition += build[index].partWidth*ui.getZoom() - build[index].rightClip*ui.getZoom(); // Add part width and subtract right clip
				}
				painter.startPosition = 0 + build[0].leftClip*ui.getZoom();
				painter.endPosition = loopPartPosition;
				
				// Center build container for new build
				var rightImageEdge = -50000;
				var leftImageEdge = 50000;
				for (var index = 0; index < build.length; index++) {
					var right_test = posArray[index] + build[index].partWidth*ui.getZoom();
					var left_test  = posArray[index];	
					
					if (right_test > rightImageEdge) {
						rightImageEdge = right_test;
					}
					if ( left_test < leftImageEdge) {
						leftImageEdge = left_test;
					}
				}
				var visualLength = rightImageEdge - leftImageEdge;
				var bladeCompensator = 0;	// Don't count blade when centering
				if (build[0].partType == "blade") {
					if (build.length > 1) {
						bladeCompensator += (build[0].partWidth*ui.getZoom() - build[1].leftClip*ui.getZoom())/2;
					} else {
						bladeCompensator += build[0].partWidth*ui.getZoom()/2;
					}
				}
				if (build[build.length-1].partType == "blade") {
					if (build.length > 1) {
						bladeCompensator -= (build[build.length-1].partWidth*ui.getZoom() - build[build.length-2].rightClip*ui.getZoom())/2;
					} else {
						bladeCompensator -= build[build.length-1].partWidth*ui.getZoom()/2;
					}
				}	
				$("#ls_build_container").css("left","-=" + (visualLength/2 + bladeCompensator)); // Center horizontally
				var canvasHeight = $("#ls_canvas").height(); 
				var buildContainerHeight = $("#ls_build_container").height();
				$("#ls_build_container").css("top", canvasHeight/2 - buildContainerHeight/2); // Center vertically as well for good measure
				
				
				// Find out if chassis or connector can be dropped from top
				chassisCount = 0;
				splitPoint = -1;
				for (var index = 0; index < build.length; index++) {
					if (build[index].partType == "chassis") {
						chassisCount++;
					}
				}
				if (chassisCount == 0) {
					splitPoint = Math.round((build.length-1)/2)
				}
				if (chassisCount == 1) { // Take chassis as split point
					for (var index = 0; index < build.length; index++) {
						if (build[index].partType == "chassis") {
							splitPoint = index;
						}
					}
				}
				if (chassisCount == 2) { // Take first connector
					for (var index = 0; index < build.length; index++) {
						if (build[index].partType == "connector") {
							splitPoint = index;
							break;
						}
					}
				}
				
				// Paint parts
				for (var index = 0; index < build.length; index++) {		
					// Paint part
					$("#ls_build_container").append("<div id='" + build[index].id + "' class='ls_part ls_type_" + build[index].partType + " ls_partname_" + build[index].partName + "'><div class='ls_imgcontainer ls_imgcontainer_"+ build[index].partName +" ls_config_active' style='top: 0px;'><img class='ls_img ls_img_"+ build[index].partName + (build[index].flip ? " ls_flip" : "") + "' src='" + build[index].img_url + build[index].colors[build[index].activeColor] + ".png'></div></div>");	
					$("#ls_build_container > div").last().width(build[index].partWidth*ui.getZoom()); // Manually set width, b/c child elements are all absolute
					$("#ls_build_container > div").last().find(".ls_imgcontainer").width(build[index].partWidth*ui.getZoom());
						// Paint mod
					if (build[index].mod !== "none") {
						$("#ls_build_container > div").last().find(".ls_imgcontainer").append("<img id='" + build[index].mod.id + "' class='ls_mod ls_mod_"+ build[index].mod.modName + (build[index].flip ? " ls_flip" : "") +"'src='" + build[index].mod.img_url + build[index].mod.colors[build[index].mod.activeColor] + ".png' >");		

						// Position mod
						if (build[index].modAttachment == "left") {
							$("#" + build[index].mod.id).css("left", build[index].modOffset*ui.getZoom());
							$("#" + build[index].mod.id).css("right", "auto");
						}
						if (build[index].modAttachment == "right") {
							$("#" + build[index].mod.id).css("right", build[index].modOffset*ui.getZoom());
							$("#" + build[index].mod.id).css("left", "auto");
						}
					}
					// Click Listener
					$("#ls_build_container > div").last().on('dblclick doubletap',function(event){
						ui.mod.startConfig($(this).attr("id"));
					});
					
					// Position part
					if (index < splitPoint) {
						var leftOffset = posArray[index] - build[index].partWidth*ui.getZoom() - window.innerWidth;
						$("#ls_build_container > div").last().css("left", leftOffset);
					}
					if (index == splitPoint) {
						if (chassisCount > 0) { 
							var topPos = ($("#ls_build_container > div").last().offset().top + $("#ls_build_container > div").last().height())*-1; // Get distance to top of screen + part-height
							$("#ls_build_container > div").last().css("top", topPos);
							$("#ls_build_container > div").last().css("left", posArray[index]);
						} else { // If there's no chassis, move in from right
							var rightOffset = posArray[index] + window.innerWidth;
							$("#ls_build_container > div").last().css("left", rightOffset);
						}
					}
					if (index > splitPoint) {
						var rightOffset = posArray[index] + window.innerWidth;
						$("#ls_build_container > div").last().css("left", rightOffset);
					}
				}

				// Animate parts to move into middle
				if (setHistory != false) { // No animations on browser history change
					setTimeout(function() {
						var tElement = transition.split(" ")[0];
						var tDuration = transition.split(" ")[1];
						var tType = transition.split(" ")[2];
	
						// Set transitions
						$("#" + build[splitPoint].id).css("transition", tElement + " " + tDuration.slice(0,-1)*0.8 + "s " + tType);
						
						var leftDelay = 0.4;
						for (var index = splitPoint-1; index >= 0; index--) {
							$("#" + build[index].id).css("transition", tElement + " " + tDuration + " " + tType + " " + leftDelay + "s");
							leftDelay += 0.15;
						}
						var rightDelay = 0.4;
						for (var index = splitPoint+1; index < build.length; index++) {
							$("#" + build[index].id).css("transition", tElement + " " + tDuration + " " + tType + " " + rightDelay + "s");
							rightDelay += 0.15;
						}
						
						// Final positions
						for (var index = 0; index < build.length; index++) {
							$("#" + build[index].id).css("left", posArray[index]);
							$("#" + build[index].id).css("top", 0);
						}
					}, 50);
				} else {
					// Final positions without animations
					for (var index = 0; index < build.length; index++) {
						$("#" + build[index].id).css("left", posArray[index]);
						$("#" + build[index].id).css("top", 0);
					}
				}
			}
			
			// Create Interface Object
			// -------------------------------------------------------------------------------------------------------------------------
			function User_Interface () {
				this.buttons = { 
					buttonleft_plus  : $("#ls_buttonleft_plus"),
					buttonleft_minus : $("#ls_buttonleft_minus"),
					buttonright_plus : $("#ls_buttonright_plus"),
					buttonright_minus: $("#ls_buttonright_minus"),
					buttonmod				 : $("#ls_modbutton_center"),
					buttonSafeMode	 : $("#ls_safeModeDisplay"),
					buttonGetParts   : $("#ls_getParts_container"),
					buttonInfo			 : $("#ls_menubutton_info"),
					buttonBackground : $("#ls_menubutton_background"),
					buttonWebsite 	 : $("#ls_menubutton_website"),
					buttonBuildMenuD : $("#ls_buildMenuDesktop"),
					buttonBuildMenuM : $("#ls_buildMenuMobile"),
					buttonMobileMenu : $("#ls_mobile_menu")
				}
				this.safeMode = true;
				this.currentZoom = 12;
				this.currentBackground = 0;
				this.zoomPinchScale = 1;
				this.warnedAboutRandomize = false;
				
				var setInitialZoom = (function(that) {
					if  ($(window).width() <= 1200 ) {
						that.currentZoom = 10;
						$("#ls_build_container").height(250);
					}
					if  ($(window).width() <= 900 ) {
						that.currentZoom = 8;
						$("#ls_build_container").height(200);
					}
					if  ($(window).width() <= 650 ) {
						that.currentZoom = 6;
						$("#ls_build_container").height(150);
					}
					if  ($(window).width() <= 500 ) {
						that.currentZoom = 4;
						$("#ls_build_container").height(100);
					}

				})(this);

				this.buttons.buttonleft_plus.on("click", function(e) {
					e.preventDefault();
					if (current_lightsaber.leftConnector !== "none") { // Left connector available
						var b = current_lightsaber.currentBuild;
						if (b.length > 1) { 
							if (!((b.length > 1 && (b[0].partType == "shroud" && (b[1].partType == "foregrip" || b[1].partType == "pommel" || b[1].partType == "connector"))) ||  // If shroud attached to silly part (foregrip, pommel, connector), don't allow to add blade (no chassis thus no blade holder)
									(b.length > 2 && (b[0].partType == "shroud" && b[1].slip && (b[2].partType == "foregrip" || b[2].partType == "pommel" || b[2].partType == "connector"))))) {
								ui.select.showPartSelection("front");
							}
						} else {
							ui.select.showPartSelection("front");
						}
					}
				});
				this.buttons.buttonright_plus.on("click", function(e) {
					e.preventDefault();
					if (current_lightsaber.rightConnector !== "none") { // Left connector available
						var b = current_lightsaber.currentBuild;
						if (current_lightsaber.currentBuild.length > 1) { 
							if (!((b.length > 1 && (b[b.length-1].partType == "shroud" && (b[b.length-2].partType == "foregrip" || b[b.length-2].partType == "pommel" || b[b.length-2].partType == "connector"))) ||  // If shroud attached to silly part (foregrip, pommel, connector), don't allow to add blade (no chassis thus no blade holder)
									  (b.length > 2 && (b[b.length-1].partType == "shroud" && b[b.length-2].slip && (b[b.length-3].partType == "foregrip" || b[b.length-3].partType == "pommel" || b[b.length-3].partType == "connector"))))) {
								ui.select.showPartSelection("back");
							}
						} else {
							ui.select.showPartSelection("back");
						}
					}			
				});
				this.buttons.buttonleft_minus.on("click", function(e) {
					e.preventDefault();
					current_lightsaber.removePart("front");
					ui.onBuildChange();
				});
				this.buttons.buttonright_minus.on("click", function(e) {
					e.preventDefault();
					current_lightsaber.removePart("back");
					ui.onBuildChange();
				});
				this.buttons.buttonmod.on("click", function(e) {
					e.preventDefault();
					if (ui.mod.partInConfig !== "none" && $("#" + ui.mod.partInConfig).length) {
						ui.mod.startConfig(ui.mod.partInConfig);
						return;
					}
					if (current_lightsaber.currentBuild.length > 0) {
						var chassisCheck = false;
						for (var index = 0; index < current_lightsaber.currentBuild.length; index++) {
							if (current_lightsaber.currentBuild[index].partType === "chassis") {
								chassisCheck = true;
								ui.mod.startConfig(current_lightsaber.currentBuild[index].id);
								break;
							}
						}
						if (chassisCheck == false) {
							ui.mod.startConfig(current_lightsaber.currentBuild[current_lightsaber.currentBuild.length-1].id);
						}
					}
				});	
				this.buttons.buttonSafeMode.on("click", function(e) {
					e.preventDefault();
					ui.toggleSafeMode();
				});
				this.buttons.buttonGetParts.on("click", function(e) {
					ui.createWindowDialogue("partlist");
				});
				this.buttons.buttonInfo.on("click", function(e) {
					ui.createWindowDialogue("info");
				});
				this.buttons.buttonBackground.on("click", function(e) {
					ui.changeBackground();
					// ui.build.resetBuild();
					// ui.build.loadBuild(ui.build.getBuildObjectFromId(ui.build.getUrlBuildId()));
				});
				this.buttons.buttonWebsite.on("click", function(e) {
					window.open("http://www.kickstarter.com/projects/1023202441/ots-sabers-endless-customization-in-the-palm-of-yo/");
				});
				this.buttons.buttonBuildMenuD.on("click", function(e) {
					ui.openBuildMenu("desktop");
				});
				this.buttons.buttonBuildMenuM.on("click", function(e) {
					ui.openBuildMenu("mobile");
				});
				this.buttons.buttonMobileMenu.on("click", function(e) {
					ui.openMobileMenu();
				});
			}
			
			User_Interface.prototype.getZoom = function() {
				return (1 / 20) * this.currentZoom;
			}	
			
			User_Interface.prototype.onBuildChange = function(setHistory) {
				current_lightsaber.getBuild();			// Print build into console
				ui.build.setUrlBuildId(setHistory); // Update url build string
				ui.isConfigButtonAvailable() 				// Check if config button clickable
				ui.updateInfoWindow();          		// Update info window details
			}
			
			User_Interface.prototype.disableButtons = function(state) {
				if (state == true || state == null) {
					$("#ls_buttons").css("pointer-events","none");
				}
				if (state == false) {
					$("#ls_buttons").css("pointer-events","auto");
				}
			}			
			
			User_Interface.prototype.isConfigButtonAvailable = function () {
				if (current_lightsaber.currentBuild.length > 0) {
					$("#ls_modbutton_center").css("color", "black");
					$("#ls_modbutton_center").css("pointer-events", "auto");
				} else {
					$("#ls_modbutton_center").css("color", "#777");
					$("#ls_modbutton_center").css("pointer-events", "none");
				}
			}
			
			User_Interface.prototype.updateInfoWindow = function () {
				var partCount = current_lightsaber.getPartCount();
				$(".ls_partsCount_field").text(partCount);
			}
			
			User_Interface.prototype.toggleSafeMode = function () {
				if (ui.safeMode == true) {
					ui.safeMode = false;
					$("#ls_safeModeDisplay_icon").css("color", "red");
					$("#ls_safeModeDisplay_icon").text("Off");
					ui.createWindowDialogue("safeModeWarning");
				} else {
					ui.safeMode = true;
					$("#ls_safeModeDisplay_icon").css("color", "orange");
					$("#ls_safeModeDisplay_icon").text("On");
				}
			}
			
			User_Interface.prototype.changeBackground = function () {
				this.currentBackground++;
				if (this.currentBackground == ini.backgrounds.length) {
					this.currentBackground = 0;
				}
				$("#ls_config").css("background-image", "url('assets/backgrounds/"+ ini.backgrounds[this.currentBackground] +"')");
				
				// Blueprint looks better with 100% size
				if (this.currentBackground == 0) {
					$("#ls_config").css("background-size", "100%");
				} else {
					$("#ls_config").css("background-size", "auto");
				}
			}
			
			User_Interface.prototype.filterQualifiedParts = function (qualifiedParts, side, part_id, buildToCheck) {
			// Several common filters to be applied to qualifiedParts for adding a part or switching a part
			// Param "side" means part is about to be added, part_id means existing part is replaced. Only pass one or the other. Write handlers for both.
			// buildToCheck optional parameter to replace currentLightsaber.currentBuild with custom build (as in generate random lightsaber). Use only with side parameter! (code for part_id not working yet)
			
				// Set standard build to check
				var testBuild;
				if (buildToCheck) {
					testBuild = buildToCheck;
				} else {
					testBuild = current_lightsaber.currentBuild;
				}
			
				// 1. Flip parts inuitively: Flip foregrip and reargrip when beyond connector. Tests correct with normal orientation, as it can be attached that way, but is not what you want normally.
	 			var buildPosition = "";
	 			if (side !== "" && testBuild.length > 0) {
	 				if (side === "back") {
	 					buildPosition = testBuild.length-1;
	 					buildPosition++;
	 				}	
	 			}
	 			if (part_id !== "") {
	 				buildPosition = current_lightsaber.findIndex(part_id);
	 			}
	 			if (buildPosition !== "") {
	 				for (var index = 0; index < testBuild.length; index++) {
	 					if (testBuild[index].partType === "connector") {
	 						if (buildPosition > index) {
	 							for (var deepIndex = 0; deepIndex < qualifiedParts.length; deepIndex++) {
				 					if (qualifiedParts[deepIndex].partType === "foregrip" || qualifiedParts[deepIndex].partType === "reargrip") {
				 						qualifiedParts[deepIndex].flip = true;
				 					}
				 				}
	 						} 	
	 					}
	 				}
	 			}
	 			// Also flip foregrip when right of reargrip
	 			if (side !== "" && testBuild.length > 0) {
	 				if (side === "back") {
	 					if (testBuild[testBuild.length-1].partType === "reargrip" || (testBuild.length > 1 && testBuild[testBuild.length-1].slip && testBuild[testBuild.length-2].partType === "reargrip")) {
	 						for (var index = 0; index < qualifiedParts.length; index++) {
	 							if (qualifiedParts[index].partType === "foregrip") {
	 								qualifiedParts[index].flip = true;
	 							}
	 						}
	 					}
	 				}
	 			}
	 			if (part_id !== "") {
	 				var partPos = current_lightsaber.findIndex(part_id);
	 				if (partPos > 0) {
	 					if (testBuild[partPos-1].partType == "reargrip" || (partPos > 1 && testBuild[partPos-1].slip && testBuild[partPos-2].partType === "reargrip")) {
	 						for (var index = 0; index < qualifiedParts.length; index++) {
	 							if (qualifiedParts[index].partType === "foregrip") {
	 								qualifiedParts[index].flip = true;
	 							}
	 						}
	 					}	 				
	 				}
	 			}

				// 2. Only allow second chassis if there's a connector, otherwise too short
				var deleteIndexes = [];
				for (var index = 0; index < qualifiedParts.length; index++) {	// Go through qualified parts
					if (qualifiedParts[index].partType == "chassis") { // Only real chassis interests here
						for (var partindex = 0; partindex < testBuild.length; partindex++) { // Go through build parts
							if (testBuild[partindex].partType === "chassis") { // If build has a chassis
								if (testBuild[partindex].id !== part_id) { // Disregard build chassis if that is the part in config. To allow switchparts to have the other chassises.
									var hasConnectorPart = false; 
									for (var partindex2 = 0; partindex2 < testBuild.length; partindex2++) { // Go through parts again
										if (testBuild[partindex2].partType === "connector") { // See if there's also a connector
											hasConnectorPart = true;
										}
									}
									if (hasConnectorPart == false) { // If no connecetor found, second chassis not allowed, because build very likely too short
										deleteIndexes.push(index);
									}
								}
							}
						}
					}
				}
				var deleteCount = 0;
				for (var index = 0; index < deleteIndexes.length; index++) {
					qualifiedParts.splice(deleteIndexes[index] - deleteCount, 1);
					deleteCount++;
				}
				
				// 3. If there is a blade, don't allow Foregrip, Pommel or Connector attachment to shroud
				// Other way around (disallow blade when foregrip, pommel or connector at shroud) handled in plus listeners
				if (side !== "" && testBuild.length > 0) {
					if (side === "front") {
						if ((testBuild.length == 2 && testBuild[0].partType == "shroud" && testBuild[1].partType == "blade") ||
								(testBuild.length == 3 && testBuild[0].slip && testBuild[1].partType == "shroud"  && testBuild[2].partType == "blade")) {
							for (var index = 0; index < qualifiedParts.length; index++) {
								if (qualifiedParts[index].partType === "foregrip" || qualifiedParts[index].partType === "pommel" || qualifiedParts[index].partType === "connector") {
									qualifiedParts.splice(index, 1);
									index--;
								}
							}
						}
					}
					if (side === "back") {
						if ((testBuild.length == 2 && testBuild[0].partType == "blade" && testBuild[1].partType == "shroud") ||
								(testBuild.length == 3 && testBuild[0].partType == "blade" && testBuild[1].partType == "shroud"  && testBuild[2].slip)) {
							for (var index = 0; index < qualifiedParts.length; index++) {
								if (qualifiedParts[index].partType === "foregrip" || qualifiedParts[index].partType === "pommel" || qualifiedParts[index].partType === "connector") {
									qualifiedParts.splice(index, 1);
									index--;
								}
							}
						}
					}
				}
				if (part_id !== "") {
					if ((testBuild.length == 3 && ((testBuild[0].id === part_id && testBuild[1].partType === "shroud" && testBuild[2].partType === "blade") ||
																				 (testBuild[0].partType === "blade" && testBuild[1].partType === "shroud" && testBuild[2].id === part_id))) ||
							(testBuild.length == 4 && ((testBuild[0].id === part_id && testBuild[1].slip && testBuild[2].partType === "shroud" && testBuild[3].partType === "blade") || 
							 														testBuild[0].partType === "blade" && testBuild[1].partType === "shroud" && testBuild[2].slip && testBuild[3].id === part_id))) {	
						for (var index = 0; index < qualifiedParts.length; index++) {
							if (qualifiedParts[index].partType === "foregrip" || qualifiedParts[index].partType === "pommel" || qualifiedParts[index].partType === "connector") {
								qualifiedParts.splice(index, 1);
								index--;
							}
						}			 	
					}
				}


				// 4. Safe mode: Filters to block silly part attachment to ensure only well-formed sabers can be built 
				if (ui.safeMode) {
					// 4.1 Shroud: No foregrip, pommel or connector attachment
					if (side !== "" && testBuild.length > 0) {
						if (side === "front") {
							if (testBuild[0].partType === "shroud" || (testBuild.length > 1 && testBuild[0].slip && testBuild[1].partType === "shroud" )) {
								for (var index = 0; index < qualifiedParts.length; index++) {
									if (qualifiedParts[index].partType === "foregrip" || qualifiedParts[index].partType === "pommel" || qualifiedParts[index].partType === "connector") {
										qualifiedParts.splice(index, 1);
										index--;
									}
								}
							}
						} 
						if (side === "back") {
							if (testBuild[testBuild.length-1].partType === "shroud" || (testBuild.length > 1 && testBuild[testBuild.length-1].slip && testBuild[testBuild.length-2].partType === "shroud" )) {
								for (var index = 0; index < qualifiedParts.length; index++) {
									if (qualifiedParts[index].partType === "foregrip" || qualifiedParts[index].partType === "pommel" || qualifiedParts[index].partType === "connector") {
										qualifiedParts.splice(index, 1);
										index--;
									}
								}
							}
						}
					}
					if (part_id !== "") {
						var partIndex = current_lightsaber.findIndex(part_id);
						var shroudFound = false;
						if ((testBuild[partIndex-1] && testBuild[partIndex-1].partType === "shroud")	|| 
							  (testBuild[partIndex-2] && testBuild[partIndex-2].partType === "shroud" && testBuild[partIndex-1].slip)) {
							shroudFound = true;
						}
						if ((testBuild[partIndex+1] && testBuild[partIndex+1].partType === "shroud") ||
							  (testBuild[partIndex+2] && testBuild[partIndex+2].partType === "shroud" && testBuild[partIndex+1].slip))	{
							shroudFound = true;
						}
						if (shroudFound) {
							for (var index = 0; index < qualifiedParts.length; index++) {
								if (qualifiedParts[index].partType === "foregrip" || qualifiedParts[index].partType === "pommel" || qualifiedParts[index].partType === "connector") {
									qualifiedParts.splice(index, 1);
									index--;
								}
							}
						}
					}
					
					// 4.2 Foregrip: No shroud on either side, no reargrip on front side
					if (side !== "" && testBuild.length > 0) {
						if (side === "front") {
							if (testBuild[0].partType === "foregrip" || (testBuild.length > 1 && testBuild[0].slip && testBuild[1].partType === "foregrip")) {
								for (var index = 0; index < qualifiedParts.length; index++) {
									if (qualifiedParts[index].partType === "shroud") {
										qualifiedParts.splice(index, 1);
										index--;
									}
								}
								for (var index = 0; index < qualifiedParts.length; index++) {
									if ((!testBuild[0].slip && testBuild[0].leftConnector.length > 1) || 
											 (testBuild.length > 1 && testBuild[0].slip && testBuild[1].leftConnector.length > 1)) { // == front side of foregrip
										if (qualifiedParts[index].partType === "reargrip") {
											qualifiedParts.splice(index, 1);
											index--;
										}
									}
								}
							}
						}
						if (side === "back") {
							if (testBuild[testBuild.length-1].partType === "foregrip" || (testBuild.length > 1 && testBuild[testBuild.length-1].slip && testBuild[testBuild.length-2].partType === "foregrip")) {
								for (var index = 0; index < qualifiedParts.length; index++) {
									if (qualifiedParts[index].partType === "shroud") {
										qualifiedParts.splice(index, 1);
										index--;
									}
								}
								for (var index = 0; index < qualifiedParts.length; index++) {
									if ((!testBuild[testBuild.length-1].slip && testBuild[testBuild.length-1].rightConnector.length > 1) || 
										   (testBuild.length > 1 && testBuild[testBuild.length-1].slip && testBuild[testBuild.length-2].rightConnector.length > 1)) {
										if (qualifiedParts[index].partType === "reargrip") {
											qualifiedParts.splice(index, 1);
											index--;
										}	
									}
								}
							}
						}
					}
					if (part_id !== "") {
						var partIndex = current_lightsaber.findIndex(part_id);
						var foregripFound = false;
						var reargripForbidden = false;
						if ((testBuild[partIndex-1] && testBuild[partIndex-1].partType === "foregrip")	|| 
							 	(testBuild[partIndex-2] && testBuild[partIndex-2].partType === "foregrip" && testBuild[partIndex-1].slip)) {
							foregripFound = true;
							if ((testBuild[partIndex-1].rightConnector.length > 1 && !testBuild[partIndex-1].slip) ||
									(testBuild[partIndex-2] && testBuild[partIndex-2].rightConnector.length > 1)) {
								reargripForbidden = true;
							}
						}
						if ((testBuild[partIndex+1] && testBuild[partIndex+1].partType === "foregrip") ||
							 	(testBuild[partIndex+2] && testBuild[partIndex+2].partType === "foregrip" && testBuild[partIndex+1].slip))	{
							foregripFound = true;
							if ((testBuild[partIndex+1].leftConnector.length > 1 && !testBuild[partIndex+1].slip) ||
									(testBuild[partIndex+2] && testBuild[partIndex+2].leftConnector.length > 1)) {
								reargripForbidden = true;
							}
						}
						if (foregripFound) {
							for (var index = 0; index < qualifiedParts.length; index++) {
								if (qualifiedParts[index].partType === "shroud") {
									qualifiedParts.splice(index, 1);
									index--;
								}
							}
						}
						if (reargripForbidden) {
							for (var index = 0; index < qualifiedParts.length; index++) {
								if (qualifiedParts[index].partType === "reargrip") {
									qualifiedParts.splice(index, 1);
									index--;
								}
							}
						}	
					}
					// 4.3 Reagrip: No foregrip or pommel if other side has foregrip or pommel
					var foregripForbidden = false;
					var pommelForbidden = false;
					
					if (side !== "" && testBuild.length > 1) {
						if (side === "front") {
							if ((testBuild[0].partType === "reargrip" && testBuild[1].partType === "foregrip") || 
									(testBuild.length > 2 && testBuild[0].slip && testBuild[1].partType === "reargrip" && testBuild[2].partType === "foregrip") ||
									(testBuild.length > 2 && testBuild[0].partType === "reargrip" && testBuild[1].slip && testBuild[2].partType === "foregrip")) { // Slip part can appear in two combinations
								foregripForbidden = true;
							}
							if ((testBuild[0].partType === "reargrip" && testBuild[1].partType === "pommel") ||
									(testBuild.length > 2 && testBuild[0].slip && testBuild[1].partType === "reargrip" && testBuild[2].partType === "pommel") ||
									(testBuild.length > 2 && testBuild[0].partType === "reargrip" && testBuild[1].slip && testBuild[2].partType === "pommel")) {
								pommelForbidden = true;
							}
						}
						if (side === "back") {
							if ((testBuild[testBuild.length-1].partType === "reargrip" && testBuild[testBuild.length-2].partType === "foregrip")  ||
							    (testBuild.length > 2 && testBuild[testBuild.length-1].slip && testBuild[testBuild.length-2].partType === "reargrip"  && testBuild[testBuild.length-3].partType === "foregrip") ||
							    (testBuild.length > 2 && testBuild[testBuild.length-1].partType === "reargrip"  && testBuild[testBuild.length-2].slip && testBuild[testBuild.length-3].partType === "foregrip")) {
								foregripForbidden = true;
							}
							if ((testBuild[testBuild.length-1].partType === "reargrip" && testBuild[testBuild.length-2].partType === "pommel") || 
									(testBuild.length > 2 && testBuild[testBuild.length-1].slip && testBuild[testBuild.length-2].partType === "reargrip"  && testBuild[testBuild.length-3].partType === "pommel") ||
									(testBuild.length > 2 && testBuild[testBuild.length-1].partType === "reargrip" && testBuild[testBuild.length-2].slip && testBuild[testBuild.length-3].partType === "pommel")) {
								pommelForbidden = true;
							}
						}						
					}
					if (part_id !== "") {
						var partIndex = current_lightsaber.findIndex(part_id);
						// Left side
						if ((testBuild[partIndex-2] && testBuild[partIndex-1].partType === "reargrip" && testBuild[partIndex-2].partType === "foregrip") ||
								(testBuild[partIndex-3] && testBuild[partIndex-1].slip && testBuild[partIndex-2].partType === "reargrip" && testBuild[partIndex-3].partType === "foregrip") || 
								(testBuild[partIndex-3] && testBuild[partIndex-1].partType === "reargrip" && testBuild[partIndex-2].slip && testBuild[partIndex-3].partType === "foregrip")) {
							foregripForbidden = true;
						}
						if ((testBuild[partIndex-2] && testBuild[partIndex-1].partType === "reargrip" && testBuild[partIndex-2].partType === "pommel") ||
								(testBuild[partIndex-3] && testBuild[partIndex-1].slip && testBuild[partIndex-2].partType === "reargrip" && testBuild[partIndex-3].partType === "pommel") || 
								(testBuild[partIndex-3] && testBuild[partIndex-1].partType === "reargrip" && testBuild[partIndex-2].slip && testBuild[partIndex-3].partType === "pommel")) {
							pommelForbidden = true;
						}
						// Right side
						if ((testBuild[partIndex+2] && testBuild[partIndex+1].partType === "reargrip" && testBuild[partIndex+2].partType === "foregrip") ||
								(testBuild[partIndex+3] && testBuild[partIndex+1].slip && testBuild[partIndex+2].partType === "reargrip" && testBuild[partIndex+3].partType === "foregrip") || 
								(testBuild[partIndex+3] && testBuild[partIndex+1].partType === "reargrip" && testBuild[partIndex+2].slip && testBuild[partIndex+3].partType === "foregrip")) {
							foregripForbidden = true;
						}
						if ((testBuild[partIndex+2] && testBuild[partIndex+1].partType === "reargrip" && testBuild[partIndex+2].partType === "pommel") ||
								(testBuild[partIndex+3] && testBuild[partIndex+1].slip && testBuild[partIndex+2].partType === "reargrip" && testBuild[partIndex+3].partType === "pommel") || 
								(testBuild[partIndex+3] && testBuild[partIndex+1].partType === "reargrip" && testBuild[partIndex+2].slip && testBuild[partIndex+3].partType === "pommel")) {
							pommelForbidden = true;
						}
					}
					if (foregripForbidden) {
						for (var index = 0; index < qualifiedParts.length; index++) {
							if (qualifiedParts[index].partType === "foregrip") {
								qualifiedParts.splice(index, 1);
								index--;
							}
						}
					}
					if (pommelForbidden) {
						for (var index = 0; index < qualifiedParts.length; index++) {
							if (qualifiedParts[index].partType === "pommel") {
								qualifiedParts.splice(index, 1);
								index--;
							}
						}
					}	
					
					// 4.4 Connector: No shroud attachment	
					var connectorFound = false;
					if (side !== "" && testBuild.length > 0) {
						if (side === "front") {
							if ((testBuild[0].partType === "connector") || (testBuild.length > 1 && testBuild[0].slip && testBuild[1].partType === "connector")) {
								connectorFound = true;
							}
						} 
						if (side === "back") {
							if ((testBuild[testBuild.length-1].partType === "connector") || (testBuild.length > 1 && testBuild[testBuild.length-1].slip && testBuild[testBuild.length-2].partType === "connector")) {
								connectorFound = true;
							}
						}
					}
					if (part_id !== "") {
						var partIndex = current_lightsaber.findIndex(part_id);
						if ((testBuild[partIndex-1] && testBuild[partIndex-1].partType === "connector") || 
								(testBuild[partIndex-2] && testBuild[partIndex-1].slip && testBuild[partIndex-2].partType === "connector"))	{
							connectorFound = true;
						}
						if ((testBuild[partIndex+1] && testBuild[partIndex+1].partType === "connector") || 
								(testBuild[partIndex+2] && testBuild[partIndex+1].slip && testBuild[partIndex+2].partType === "connector"))	{
							connectorFound = true;
						}
					}
					if (connectorFound) {
						for (var index = 0; index < qualifiedParts.length; index++) {
							if (qualifiedParts[index].partType === "shroud") {
								qualifiedParts.splice(index, 1);
								index--;
							}
						}
					}
				} // end safemode
				
				// 5. Slip pieces
				// 5.1 Only allow one extra slip piece per build (for now). Logic not meant to handle two in a row or resulting clip errors
				var slipCount = 0;
				for (var index = 0; index < testBuild.length; index++) {
					if (testBuild[index].slip) {
						slipCount++;
					}
				}
				if (slipCount > 0) {
					for (var index = 0; index < qualifiedParts.length; index++) {
						if (qualifiedParts[index].slip) {
							qualifiedParts.splice(index, 1);
							index--;
						}
					}
				}
				
				// 5.2 Only allow slip pieces as a switch part on edges of saber
				if (part_id !== "") {
					var partIndex = current_lightsaber.findIndex(part_id);
					if (partIndex != 0 && partIndex != current_lightsaber.currentBuild.length-1) {
						for (var index = 0; index < qualifiedParts.length; index++) {
							if (qualifiedParts[index].slip) {
								qualifiedParts.splice(index, 1);
								index--;
							}
						}
					}
				}
				
				return qualifiedParts;
			}
			
			User_Interface.prototype.createWindowDialogue = function (type) {
										
				$("#ls_config").append("<div id='ls_dialogueBackground'><div id='ls_dialogue_panel'></div></div>");
				$("#ls_dialogue_panel").append("<div id='ls_dialogue_title'></div>");
				$("#ls_dialogue_panel").append("<div id='ls_dialogue_content'></div>");
				$("#ls_dialogue_panel").append("<div id='ls_dialogue_button'>Accept</div>");						
				$("#ls_dialogue_button").on("click", function() {
					$("#ls_dialogueBackground").remove();
				});
				
				if (type == "info") {
					$("#ls_dialogue_title").text("General info");
					$("#ls_dialogue_content").append("<div id='ls_dialogue_textcontainer'></div>");
					$("#ls_dialogue_textcontainer").append("<div class='ls_dialogue_text'>The Unofficial OTS Saber Configurator allows you to build the saber of your dreams from parts of the HCCLS OTS line.</div>");
					$("#ls_dialogue_textcontainer").append("<div class='ls_dialogue_text'>Please note that this is a pure fan project and is in no way directly associated with Ken Hampton or HHCLS.</div>");
					$("#ls_dialogue_textcontainer").append("<div class='ls_dialogue_text'>Also note that while all parts have been hand-drawn with utmost care, there may be some small inaccuracies in size as the official dimensions are not yet publicly available.</div>");
					$("#ls_dialogue_textcontainer").append("<div class='ls_dialogue_text'>If you are ready to get started, click on any of the Plus-Symbols to add a chassis.</div>");
					$("#ls_dialogue_textcontainer").append("<div class='ls_dialogue_text'>Happy building!</div>");
				}
				if (type == "getParts") {
					$("#ls_dialogue_title").text("Part list");
					
					if(current_lightsaber.currentBuild.length == 0) {
						$("#ls_dialogue_content").append("<div id='ls_dialogue_textcontainer'></div>");
						$("#ls_dialogue_textcontainer").append("<div class='ls_dialogue_text'>You have not selected any parts yet!</div>");
						$("#ls_dialogue_textcontainer").append("<div class='ls_dialogue_text'>To start building, click on any of the Plus-symbols at the bottom of the screen.</div>");
					}	else {
						$("#ls_dialogue_content").append("<div id='ls_dialogue_partslist'></div>");
						for (var index = 0; index < current_lightsaber.currentBuild.length; index++) {
							$("#ls_dialogue_partslist").append("<div class='ls_dialogue_partslist_item'><div class='ls_dialogue_partslist_part'>"+ current_lightsaber.currentBuild[index].prettyName +"</div></div>");
							if (current_lightsaber.currentBuild[index].mod !== "none") {
								$(".ls_dialogue_partslist_item").last().append("<div class='ls_dialogue_partslist_mod'>"+ current_lightsaber.currentBuild[index].mod.prettyName +"</div>");
							}
							if (current_lightsaber.currentBuild[index].partName == "blade_ripper") {
								$(".ls_dialogue_partslist_item").last().append("<div class='ls_dialogue_partslist_mod'>In-hilt Cree Module</div>");
							}
						}
					}				
				}		
				if (type == "safeModeWarning") {
					$("#ls_dialogue_title").text("Warning");
					$("#ls_dialogue_content").append("<div id='ls_dialogue_textcontainer'></div>");
					$("#ls_dialogue_textcontainer").append("<div class='ls_dialogue_text'>By disabling safe mode, all possible part attachments of the OTS saber line are unlocked.</div>");
					$("#ls_dialogue_textcontainer").append("<div class='ls_dialogue_text'>This includes things like connecting shrouds directly to pommels, not having a chassis, etc. It's really quite silly.</div>");
					$("#ls_dialogue_textcontainer").append("<div class='ls_dialogue_text'>Normally, safe mode guarantees that only viable and well-functioning sabers can be built. Without this feature, the results can be nonsensical.</div>");
					$("#ls_dialogue_textcontainer").append("<div class='ls_dialogue_text'>Make sure to know what you're doing and continue at your own risk!</div>");
				}
				if (type == "save") {
					$("#ls_dialogue_title").text("Save Build");
					$("#ls_dialogue_panel").height(200);
					
					if (current_lightsaber.currentBuild.length > 0) { // Are there parts?
						$("#ls_dialogue_content").append("<div id='ls_dialogue_textcontainer'></div>");
						$("#ls_dialogue_textcontainer").append("<div class='ls_dialogue_text'>To save your saber, just give it a fancy name and click on 'Save'!'</div>");
						$("#ls_dialogue_textcontainer").css("text-align", "center");
						$(".ls_dialogue_text").css("margin","5px 0px 10px 0px");
						$("#ls_dialogue_textcontainer").append('<form id="ls_save_form"><label><h2>Name:</h2><input id="ls_save_buildName"></label></form>');
						$("#ls_dialogue_button").text("Save");
						
						// Add an abort button
						$("#ls_dialogue_title").append("<div id='ls_dialogue_abort'>X</div>");
						$("#ls_dialogue_abort").on("click", function() {
							$("#ls_dialogueBackground").remove();
						});
						
						// Things concerning the Save-button
						$("#ls_save_form").submit(function() { return false; }); // Don't reload page on Enter
						$("#ls_save_form").keyup(function(event){								 // Activate button on Enter instead
						    if(event.keyCode == 13){
						        $("#ls_dialogue_button").click();
						    }
						});
						$("#ls_save_buildName").on('change keydown paste input', function() {  // If name changes, check if saber already exists. Change button text to warn user.			
							console.log(($("#ls_save_buildName").val().replace(" ","_")));
							if (isCookie($("#ls_save_buildName").val().replace(" ","_"))) {
								$("#ls_dialogue_button").text("Overwrite");
							} else {
								$("#ls_dialogue_button").text("Save");
							}
						});
						
						$("#ls_dialogue_button").unbind();
						$("#ls_dialogue_button").on("click", function () {
							ui.build.saveBuildCookie($("#ls_save_buildName").val());
							$("#ls_dialogueBackground").remove();
						});
					} else { // No parts yet
						$("#ls_dialogue_content").append("<div id='ls_dialogue_textcontainer'></div>");
						$("#ls_dialogue_textcontainer").append("<div class='ls_dialogue_text'>Nothing to save yet!</div>");
						$("#ls_dialogue_textcontainer").append("<div class='ls_dialogue_text'>To add parts, click on any of the Plus-symbols at the bottom of the screen.'</div>");
						$(".ls_dialogue_text").css("margin","10px 0px 10px 0px");
					}
				}
				if (type == "load") {
					$("#ls_dialogue_title").text("Load Build");
					$("#ls_dialogue_content").append("<div id='ls_dialogue_textcontainer'></div>");
						$("#ls_dialogue_textcontainer").append("<div class='ls_dialogue_text'>Select a saved build and click load!</div>");
						$("#ls_dialogue_textcontainer").append("<div id='ls_dialogue_load_list'></div>");
						$("#ls_dialogue_textcontainer").css("height", "100%");
						$(".ls_dialogue_text").css("height", "40px");
						$(".ls_dialogue_text").css("margin", "0px");
						$(".ls_dialogue_text").css("padding", "10px 0px 0px");
						$("#ls_dialogue_button").text("Load");
					
					// Add an abort button
					$("#ls_dialogue_title").append("<div id='ls_dialogue_abort'>X</div>");
					$("#ls_dialogue_abort").on("click", function() {
						$("#ls_dialogueBackground").remove();
					});
					
					// Fill with saved builds
					var allCookies = document.cookie.split('; ');
					for (var index = 0; index < allCookies.length; index++) {
						if (allCookies[index].indexOf("build") > 0) {
							var buildName = allCookies[index].split("/")[0].replace("=build","").replace("_", " ");
							var buildID = allCookies[index].split("/")[1];
							var buildDate = allCookies[index].split("/")[2];
							var buildParts = allCookies[index].split("/")[3];
							var buildPrice = allCookies[index].split("/")[4];

							$("#ls_dialogue_load_list").append("<div class='ls_dialogue_load_item'></div>");
							$("#ls_dialogue_load_list > div").last().append("<h2 class='ls_dialogue_load_item_title'>"+ buildName +"</h2>");
							$("#ls_dialogue_load_list > div").last().append("<p class='ls_dialogue_load_item_stats'>"+ buildDate +"&nbsp&nbsp|&nbsp&nbspParts: " + buildParts + "&nbsp&nbsp|&nbsp&nbspPrice: " + buildPrice +"</p>"); 
							$("#ls_dialogue_load_list > div").last().append("<div class='ls_dialogue_load_item_delete'>X</div>");
							$("#ls_dialogue_load_list > div").last().append("<div class='ls_dialogue_load_item_buildID'>"+ buildID +"</div>");
							
							$("#ls_dialogue_load_list > div").last().on("click", function () {
								$(".ls_dialogue_load_item_active").removeClass("ls_dialogue_load_item_active");
								$(this).addClass("ls_dialogue_load_item_active");
							});
						}
					}
					// Add pretty scrollbar
					if (!ui.isInternetExplorer()) {
						$("#ls_dialogue_load_list").mCustomScrollbar({ 
							scrollInertia: 500,
							mouseWheel:{ deltaFactor: 200 }
						});
					}
					
					// Buttonlistener for Load- und Delete-Button
					$("#ls_dialogue_button").unbind();
					$("#ls_dialogue_button").on("click", function () {
						if ($(".ls_dialogue_load_item_active")[0]) {
							var buildID = $(".ls_dialogue_load_item_active").find(".ls_dialogue_load_item_buildID").text();
							ui.build.resetBuild();
							ui.build.loadBuild(ui.build.getBuildObjectFromId(buildID));
							$("#ls_dialogueBackground").remove();	
						}
					});
					
					$(".ls_dialogue_load_item_delete").unbind();
					$(".ls_dialogue_load_item_delete").on("click", function() {
						var cookieName =  $(this).siblings(".ls_dialogue_load_item_title").text();
						ui.createConfirmDialogue("loadListDeleteBuild", cookieName);
					});	
				}
					
				// Add pretty scrollbar
				if (!ui.isInternetExplorer()) {
					$("#ls_dialogue_content").mCustomScrollbar({ 
						scrollInertia: 500,
						mouseWheel:{ deltaFactor: 200 }
					});
				}
			}
			
			User_Interface.prototype.createConfirmDialogue = function (type, param) {
				$("#ls_config").append("<div id='ls_warning_background'><div id='ls_warning_stripes'><div id='ls_warning_panel'></div></div><div>");
				$("#ls_warning_panel").append("<div id='ls_warning_title'>Warning</div>");
				$("#ls_warning_panel").append("<div id='ls_warning_content'></div>");
				$("#ls_warning_panel").append("<div id='ls_warning_buttonpanel'></div>");
				$("#ls_warning_buttonpanel").append("<div id='ls_warning_confirm'>Confirm</div>");	
				$("#ls_warning_buttonpanel").append("<div id='ls_warning_cancel'>Cancel</div>");							
				$("#ls_warning_cancel").on("click", function() {
					$("#ls_warning_background").remove();
				});
				
				if (type == "loadListDeleteBuild") {
					$("#ls_warning_content").append("Are you sure that you want to delete <span>"+ param +"</span>?");
					$("#ls_warning_confirm").on("click", function() {
						ui.build.deleteBuildCookie(param);
						$("#ls_dialogueBackground").remove();	
						$("#ls_warning_background").remove();	
						ui.createWindowDialogue("load");
					});
				}
				if (type == "random") {
					$("#ls_warning_content").append("This will replace your current build with a randomly generated one. Do you want to proceed?");
					$("#ls_warning_content").css("padding","8px 15px 0px 15px");
					$("#ls_warning_confirm").on("click", function() {
						ui.warnedAboutRandomize = true;
						ui.build.randomizeBuild();
						$("#ls_warning_background").remove();
					});
				}
			}
			
			User_Interface.prototype.openBuildMenu = function (origin) {
				if (origin == "desktop") {
					$("#ls_menubar").append("<div id='ls_buildMenu'></div>");
					$("#ls_buildMenuDesktop").addClass("ls_buildMenuDesktop_active");
					$("#ls_buildMenuDesktop").unbind();
					$("#ls_buildMenuDesktop, #ls_buildMenu").on("click", function() {						
						$("#ls_buildMenuDesktop").removeClass("ls_buildMenuDesktop_active");
						$("#ls_buildMenu").remove();
						$("#ls_buildMenuDesktop").unbind();
						$("#ls_buildMenuDesktop").on("click", function() {
							ui.openBuildMenu("desktop");
						})
					});
				}
				if (origin == "mobile") {
					$("#ls_buildMenuMobile").append("<div id='ls_buildMenu'></div>");
					$("#ls_buildMenuMobile").addClass("ls_buildMenuMobile_active");
					$("#ls_buildMenuMobile").unbind();
					$("#ls_buildMenuMobile").on("click", function() {
						$("#ls_buildMenuMobile").removeClass("ls_buildMenuMobile_active");
						$("#ls_buildMenu").remove();
						$("#ls_buildMenuMobile").unbind();
						$("#ls_buildMenuMobile").on("click", function() {
							ui.openBuildMenu("mobile");
						})
					});
				}
				$("#ls_buildMenu").append('<div id="ls_buildMenuMobile_parts" class="ls_partsInfo ls_buildMenuGlobal_item ls_buildMenu_infoItem">Parts: <div class="ls_partsCount_field ls_buildMenu_field"></div></div>');
				$("#ls_buildMenu").append('<div id="ls_buildMenuMobile_length" class="ls_lengthInfo ls_buildMenuGlobal_item ls_buildMenu_infoItem">Length: <div class="ls_buildLength_field ls_buildMenu_field">NYA</div></div>');
				$("#ls_buildMenu").append('<div id="ls_buildMenuMobile_price" class="ls_priceInfo ls_buildMenuGlobal_item ls_buildMenu_infoItem">Price: <div class="ls_buildPrice_field ls_buildMenu_field">NYA</div></div>');
				$("#ls_buildMenu").append('<div id="ls_buildMenuMobile_getParts" class="ls_buildMenuGlobal_item">Get Parts</div>');
				$("#ls_buildMenu").append('<div id="ls_buildMenuMobile_saveBuild" class="ls_buildMenuGlobal_item">Save Build...</div>');
				$("#ls_buildMenu").append('<div id="ls_buildMenuMobile_loadBuild" class="ls_buildMenuGlobal_item">Load Build...</div>');
				$("#ls_buildMenu").append('<div id="ls_buildMenuMobile_randomBuild" class="ls_buildMenuGlobal_item">Random build...</div>');
				
				
				$("#ls_buildMenuMobile_parts .ls_partsCount_field").text(current_lightsaber.partCount);
				
				// Click listeners
				$("#ls_buildMenuMobile_getParts").on("click", function() {
					ui.createWindowDialogue("getParts");
				});
				$("#ls_buildMenuMobile_saveBuild").on("click", function() {
					ui.createWindowDialogue("save");
				});
				$("#ls_buildMenuMobile_loadBuild").on("click", function() {
					if (ui.mod.moddingInProgress) { return; }
					ui.createWindowDialogue("load");
				});
				$("#ls_buildMenuMobile_randomBuild").on("click", function() {
					if (ui.mod.moddingInProgress) { return; }
					if(ui.build.randomizeActive) {
						$("#ls_randomizeUi_center").unbind();
						$("#ls_randomizeUi_close").unbind();
						$("#ls_randomizeUi").hide();
						$("#ls_modbutton").show();
						$("#ls_randomizeUi_center").css("background-color", "#404040");
						ui.build.randomizeActive = false;
					} else {
						ui.build.showRandomizeUi();
					}
				});
			}
			
			User_Interface.prototype.openMobileMenu = function () {
				$("#ls_mobile_menu").unbind();
				$("#ls_mobile_menu").on("click", function() {
					$("#ls_mobile_menu").removeClass("ls_mobile_menu_open");
					$("#ls_mobile_menu_list").remove();
					$("#ls_mobile_menu").on("click", function() {
						ui.openMobileMenu();
					})
				});
				
				$("#ls_mobile_menu").append("<div id='ls_mobile_menu_list'></div>");
					$("#ls_mobile_menu_list").append("<div id='ls_mobile_menu_info' class='ls_mobile_menu_item'>Info</div>");
						$("#ls_mobile_menu_info").on("click", function () {
							ui.createWindowDialogue("info");
						});
					$("#ls_mobile_menu_list").append("<div id='ls_mobile_menu_safeMode' class='ls_mobile_menu_item'>Safe Mode <div id='ls_mobile_menu_safeMode_status'>On</div></div>");
						if (!ui.safeMode) {
							$("#ls_mobile_menu_safeMode_status").css("color","red");
							$("#ls_mobile_menu_safeMode_status").text("Off");
						}
						$("#ls_mobile_menu_safeMode").on("click", function () {
							ui.toggleSafeMode();
						});
					$("#ls_mobile_menu_list").append("<div id='ls_mobile_menu_background' class='ls_mobile_menu_item'>Background</div>");
						$("#ls_mobile_menu_background").on("click", function () {
							ui.changeBackground();
							// ui.build.resetBuild();
							// ui.build.loadBuild(ui.build.getBuildObjectFromId(ui.build.getUrlBuildId()));
						});
					$("#ls_mobile_menu_list").append("<div id='ls_mobile_menu_website' class='ls_mobile_menu_item'>Visit the Kickstarter</div>");
						$("#ls_mobile_menu_website").on("click", function () {
							window.open("http://www.kickstarter.com/projects/1023202441/ots-sabers-endless-customization-in-the-palm-of-yo/");
						});
			
				$("#ls_mobile_menu").addClass("ls_mobile_menu_open");
			
					
			}
			
			User_Interface.prototype.isInternetExplorer = function () {
			  var uAgent = window.navigator.userAgent;
			  if (uAgent.indexOf("MSIE") > 0) {
			  	return true;
			  }
			  if (uAgent.indexOf("Trident") > 0) {
			  	return true;
			  }
			  if (uAgent.indexOf("Edge") > 0) {
			  	return true;
			  }
			  return false;
			}
			
			// Various UI control listeners
			
			// 1. Add doubletap functionality to Jquery	
		  $.event.special.doubletap = {
		    bindType: 'touchend',
		    delegateType: 'touchend',
		
		    handle: function(event) {
		      var handleObj   = event.handleObj,
		          targetData  = jQuery.data(event.target),
		          now         = new Date().getTime(),
		          delta       = targetData.lastTouch ? now - targetData.lastTouch : 0,
		          delay       = delay == null ? 300 : delay;
		
		      if (delta < delay && delta > 30) {
		        targetData.lastTouch = null;
		        event.type = handleObj.origType;
		        ['clientX', 'clientY', 'pageX', 'pageY'].forEach(function(property) {
		          event[property] = event.originalEvent.changedTouches[0][property];
		        })
		
		        // let jQuery handle the triggering of "doubletap" event handlers
		        handleObj.handler.apply(this, arguments);
		      } else {
		        targetData.lastTouch = now;
		      }
		    }
		  };
			
			// 2. Drag lightsaber with mouse. Use JQuery UI implementation.
			$('#ls_paint_container #ls_build_container').draggable({ 
				handle: ".ls_imgcontainer" // Only drag on this element. Fixes mobile problem where the arrows couldn't be clicked b/c they were also draggable
			});
				// Old manual implementation
				/*
				function handle_mousedown(e){
					e.preventDefault();
			    window.my_dragging = {};
			    my_dragging.pageX0 = e.pageX;
			    my_dragging.pageY0 = e.pageY;
			    my_dragging.elem = $("#ls_build_container");
			    
			    function handle_dragging(e){
	
			        $(my_dragging.elem).css({
			        	"left": "+=" + (e.pageX - my_dragging.pageX0),
			        	"top": "+=" + (e.pageY - my_dragging.pageY0),
			        	"right": "4000px"
			        });
			        my_dragging.pageX0 = e.pageX;
			        my_dragging.pageY0 = e.pageY;
			    }
			    function handle_mouseup(e){
			        $('body')
			        .off('mousemove', handle_dragging)
			        .off('mouseup', handle_mouseup);
			    }
			    $('body')
			    .on('mouseup', handle_mouseup)
			    .on('mousemove', handle_dragging);
				}
				$('#ls_paint_container').mousedown(handle_mousedown); // Disable own implementation
				*/
			
			// 3. Listen for mousewheel event, uses jquery mousewheel plugin
			$("#ls_paint_container").bind('mousewheel', function(e){
				if (e.deltaY > 0) { // up
			        painter.changeZoom("in");
				}
				else { // down
			      painter.changeZoom("out");
			  }
			});
			
			// 4. Zoom on pinch for mobile, using hammer.js
	    var hammertime = new Hammer(document.getElementById('ls_paint_container'));
	    hammertime.get('pinch').set({ enable: true });
	   	hammertime.on("pinch", function(event) {
	
        if (event.scale > ui.zoomPinchScale + 0.1) { // up
		    	painter.changeZoom("in");
		    	ui.zoomPinchScale = event.scale;
				} 
				if (event.scale < ui.zoomPinchScale - 0.05) { // down
			  	painter.changeZoom("out");
			  	ui.zoomPinchScale = event.scale;
			  }
			  if (event.scale.isFinal) {
			  	ui.zoomPinchScale = 1;
			  }
	    });			
			
			// Subclass for selecting parts
			// ------------------------------------------------------
			function User_Interface_Selection () {
				this.selectionActive = false;
				this.side = null;
				this.qualifiedParts = null;
				this.selectedPart;
			}
			
			// Functions for selecting a part
			User_Interface_Selection.prototype.showPartSelection = function (side) {
				this.selectionActive = true;
				ui.disableButtons();
				$("#ls_modbutton").hide();
				this.side = side;
				
				// Create selection panel
				$("#ls_ui_container").append('<div id="ls_select_container"></div>');
					$("#ls_select_container").append('<div id="ls_select_menu"></div>');
						$("#ls_select_menu").append('<div id="ls_select_menu_topcat"></div>');
							$("#ls_select_menu_topcat").append('<h1 id="ls_select_menu_topcat_title">Available Parts</h1>');
							$("#ls_select_menu_topcat").append('<div class="ls_select_exit">X</div>');
						$("#ls_select_menu").append('<div id="ls_select_menu_subcat"></div>');
							$("#ls_select_menu_subcat").append('<div id="ls_select_menu_subcat_arrow"></div>');
					$("#ls_select_container").append('<div id="ls_select_inspectMenu"></div>');
						$("#ls_select_inspectMenu").append('<div id="ls_select_inspect_backButton"><</div>');
						$("#ls_select_inspectMenu").append('<div id="ls_select_inspectMenubar"><h1></h1></div>');
							$("#ls_select_inspectMenubar").append('<div class="ls_select_exit">X</div>');
					$("#ls_select_container").append('<div id="ls_select_selection"></div>'); 
					$("#ls_select_container").append('<div id="ls_select_inspectSelection"></div>');
						$("#ls_select_inspectSelection").append('<div id="ls_select_inspect_leftPanel"></div>');
							$("#ls_select_inspect_leftPanel").append('<div id="ls_select_inspect_pictureContainer"></div>');
								$("#ls_select_inspect_pictureContainer").append('<div id="ls_select_inspect_pictureInnerContainer"></div>');
							$("#ls_select_inspect_leftPanel").append('<div id="ls_select_inspect_colorContainer"></div>');
								$("#ls_select_inspect_colorContainer").append('<div id="ls_select_inspect_colorContainer_title">Color</div>');
								$("#ls_select_inspect_colorContainer").append('<div id="ls_select_inspect_colorInnerContainer"></div>');
							$("#ls_select_inspect_leftPanel").append('<div id="ls_select_inspect_description"></div>');
								$("#ls_select_inspect_description").append("<div id='ls_select_inspect_description_title'>Info</div>");
								$("#ls_select_inspect_description").append("<div id='ls_select_inspect_description_content'></div>");
						$("#ls_select_inspectSelection").append('<div id="ls_select_inspect_rightPanel"></div>');
							$("#ls_select_inspect_rightPanel").append('<div id="ls_select_inspect_modContainer"><div id="ls_select_inspect_modContainer_title">Mod Select</div></div>');
								$("#ls_select_inspect_modContainer").append('<div id="ls_select_inspect_modInnerContainer"></div>');
							$("#ls_select_inspect_rightPanel").append('<div id="ls_select_inspect_modColorContainer"></div>');
								$("#ls_select_inspect_modColorContainer").append('<div id="ls_select_inspect_modColorContainer_title">Mod color</div>');
								$("#ls_select_inspect_modColorContainer").append('<div id="ls_select_inspect_modColorInnerContainer"></div>');
							$("#ls_select_inspect_rightPanel").append('<div id="ls_select_inspect_ok"></div>');
								$("#ls_select_inspect_ok").append("<div id='ls_select_inspect_ok_button'></div>");
									$("#ls_select_inspect_ok_button").append("<div id='ls_select_inspect_ok_button_edge' class='ls_select_inspect_ok_button_class'></div>");
									$("#ls_select_inspect_ok_button").append("<div id='ls_select_inspect_ok_button_content' class='ls_select_inspect_ok_button_class'><h1>+ Add to build</h1></div>");
									
				$(".ls_select_exit").on("click", function() {
					ui.select.closePartSelection();
				});	

				
				// Find qualified parts
				if (this.side === "front") {
				 	this.qualifiedParts = current_lightsaber.findQualifiedParts("none", current_lightsaber.leftConnector);
				} else {
					this.qualifiedParts = current_lightsaber.findQualifiedParts(current_lightsaber.rightConnector, "none");
				}
				this.qualifiedParts = ui.filterQualifiedParts(this.qualifiedParts, side, "");
				
				// Add category selection
				var primaryCategories = ui.select.findPrimaryCategories();
				if (primaryCategories.length > 1) { // All-Category only when there's more than one
					$("#ls_select_menu_topcat").append('<div id="ls_select_menu_topcat_all" class="ls_select_menu_topcat_item">All ('+ this.qualifiedParts.length +')</div>');
					$("#ls_select_menu_topcat_all").on("click", function() {
						$("#ls_select_menu_topcat .ls_select_menu_active").removeClass("ls_select_menu_active");
						$(this).addClass("ls_select_menu_active");
						ui.select.updateSecondaryCategories();
						ui.select.fillWithParts("", "");
					});
				}	
				for (var catIndex = 0; catIndex < primaryCategories.length; catIndex++) {
					$("#ls_select_menu_topcat").append('<div id="ls_select_menu_topcat_' + primaryCategories[catIndex][0] + '" class="ls_select_menu_topcat_item">'+ primaryCategories[catIndex][0][0].toUpperCase() + primaryCategories[catIndex][0].slice(1) + " (" + primaryCategories[catIndex][1] + ')</div>');
					$(".ls_select_menu_topcat_item").last().on("click", function() { 
						$("#ls_select_menu_topcat .ls_select_menu_active").removeClass("ls_select_menu_active");
						$(this).addClass("ls_select_menu_active");
						var categoryName = $(this).attr("id").replace("ls_select_menu_topcat_", "");
						ui.select.updateSecondaryCategories();
						ui.select.fillWithParts(categoryName, "");
					});
				}
				// For first start
				$(".ls_select_menu_topcat_item").first().addClass("ls_select_menu_active");
				ui.select.updateSecondaryCategories();
				ui.select.fillWithParts("", "");
			}
			
			User_Interface_Selection.prototype.findPrimaryCategories = function () {
			// Returns array[x][2], with all categories listed. 
			// First subvalue for name, second subvalue for amount of parts in that category 
				var categoryArray = [];
				for (var index = 0; index < ui.select.qualifiedParts.length; index++) {
					var alreadyInArray = false;
					for (var index2 = 0; index2 < categoryArray.length; index2++) {
						if (ui.select.qualifiedParts[index].partType === categoryArray[index2][0]) {
							alreadyInArray = true;
							categoryArray[index2][1]++;
						}
					}
					if (!alreadyInArray) {
						categoryArray.push([ui.select.qualifiedParts[index].partType, 1]);
					}
				}
				return categoryArray;
			}
			
			User_Interface_Selection.prototype.findSecondaryCategories = function (primaryCategory) {
			// Returns array[x][2], with all categories listed. 
			// First subvalue for name, second subvalue for amount of parts in that category 
				var categoryArray = [];
				for (var index = 0; index < ui.select.qualifiedParts.length; index++) {
					if (ui.select.qualifiedParts[index].partType == primaryCategory) {
						var alreadyInArray = false;
						for (var index2 = 0; index2 < categoryArray.length; index2++) {
							if (ui.select.qualifiedParts[index].subCat === categoryArray[index2][0]) {
								alreadyInArray = true;
								categoryArray[index2][1]++;
							}
						}
						if (!alreadyInArray) {
							categoryArray.push([ui.select.qualifiedParts[index].subCat, 1]);
						}
					}
				}
				return categoryArray;
			}
			
			User_Interface_Selection.prototype.updateSecondaryCategories = function () {
			// Add secondary category selection
				$(".ls_select_menu_subcat_item").remove();
				
				var primaryCategory = $("#ls_select_menu_topcat .ls_select_menu_active").attr("id").replace("ls_select_menu_topcat_", "");
				if (primaryCategory !== "all") {
					var secondaryCategories = ui.select.findSecondaryCategories(primaryCategory);
					for (var index = 0; index < secondaryCategories.length; index++) {
						$("#ls_select_menu_subcat").append('<div id="ls_select_menu_subcat_' + secondaryCategories[index][0] + '" class="ls_select_menu_subcat_item">'+ secondaryCategories[index][0][0].toUpperCase() + secondaryCategories[index][0].slice(1) + " (" + secondaryCategories[index][1] + ')</div>');
						$(".ls_select_menu_subcat_item").last().on("click", function() { 
							$("#ls_select_menu_subcat .ls_select_menu_active").removeClass("ls_select_menu_active");
							$(this).addClass("ls_select_menu_active");
							var topCategory = $("#ls_select_menu_topcat .ls_select_menu_active").attr("id").replace("ls_select_menu_topcat_", "");
							var subCategory = $(this).attr("id").replace("ls_select_menu_subcat_", "");
							ui.select.fillWithParts(topCategory, subCategory);
						});
					}
				}
			}
			
			User_Interface_Selection.prototype.fillWithParts = function (topcat, subcat) {
				$("#ls_select_selection").remove();
				$("#ls_select_container").append('<div id="ls_select_selection"></div>'); 
				var selectParts = ui.select.qualifiedParts.slice(0); // Clone array to avoid passing by reference
				// Category filter
				if (topcat !== "") {
					var deleteIndexes = [];
					for (var index = 0; index < selectParts.length; index++) {
						if (selectParts[index].partType !== topcat) {
							deleteIndexes.push(index);
						}
					}
					var deleteOffset = 0;
					for (var index = 0; index < deleteIndexes.length; index++) {
						selectParts.splice(deleteIndexes[index]-deleteOffset, 1);
						deleteOffset++;
					}
				}
				
				// Subcategory filter
				if (topcat !== "" && subcat !== "") {
					var subdeleteIndexes = [];
					for (var index = 0; index < selectParts.length; index++) {
						if (selectParts[index].subCat !== subcat) {
							subdeleteIndexes.push(index);
						}
					}
					var subdeleteOffset = 0;
					for (var index = 0; index < subdeleteIndexes.length; index++) {
						selectParts.splice(subdeleteIndexes[index]-subdeleteOffset, 1);
						subdeleteOffset++;
					}
				}
				
				// Create selection items
				for (var index = 0; index < selectParts.length; index++) {							
					$("#ls_select_selection").append("<div class='ls_select_itemcontainer'><img class='ls_select_img' src='" + selectParts[index].img_url + selectParts[index].colors[0] + ".png'><h2 class='ls_select_item_title'>" + selectParts[index].prettyName +"</h2></div>");
					$("#ls_select_selection div").last().attr("id", "ls_select_" + selectParts[index].partName);
					$("#ls_select_selection div").last().addClass("ls_type_" + selectParts[index].partType);
					$("#ls_select_selection div").last().find("img").addClass((selectParts[index].flip ? "ls_flip" : ""));
					
					// Buttonlisteners
					$("#ls_select_selection div").last().on("click", function() {		
						ui.select.selectedPart = jQuery.extend({}, ini.allParts[$(this).attr("id").replace("ls_select_","")]); // Clone part objects, otherwise all references. This way, you can assign individual IDs etc. to parts that occur twice 
						
						// If part flipped, swap all relevant properties with each other
						if ($(this).find("img").attr("class").indexOf("ls_flip") > -1) {
							ui.select.selectedPart.flip = true;
							var temp_var;
							temp_var = ui.select.selectedPart.leftConnector; ui.select.selectedPart.leftConnector = ui.select.selectedPart.rightConnector; ui.select.selectedPart.rightConnector = temp_var;
							temp_var = ui.select.selectedPart.leftClip; ui.select.selectedPart.leftClip = ui.select.selectedPart.rightClip; ui.select.selectedPart.rightClip = temp_var;
							if (ui.select.selectedPart.modAttachment !== "none") {
								if (ui.select.selectedPart.modAttachment === "left") {
									ui.select.selectedPart.modAttachment = "right";
								} else {
									ui.select.selectedPart.modAttachment = "left";
								}
							}
						} else {
							ui.select.selectedPart.flip = false;
						}
						ui.select.showPartInspect();
					});
				}
				// Add pretty scrollbar if item amount exceeds height				
				if (!ui.isInternetExplorer()) {
					$("#ls_select_selection").mCustomScrollbar({ 
						scrollInertia: 500,
						mouseWheel:{ deltaFactor: 200 }
					});
				}
			}
			
			User_Interface_Selection.prototype.closePartSelection = function() {
				$("#ls_select_container").remove();				// Hide selection window
			 	$("#ls_modbutton").show();
		 		ui.select.reset();
		 		ui.disableButtons(false); // Reactivate side buttons	
			}
			
			// Functions for inspecting a selected part			
			User_Interface_Selection.prototype.showPartInspect = function () {
				$("#ls_select_menu").hide();
				$("#ls_select_inspectMenu").show();
				$("#ls_select_selection").hide();
				$("#ls_select_inspectSelection").show();
				
				// Add title
				$("#ls_select_inspectMenubar h1").text(ui.select.selectedPart.prettyName);
				$("#ls_select_inspect_backButton").on("click", function() {
					ui.select.abortInspect();
				})
				
				// Add Colors
				if (ui.select.selectedPart.colors[0] === "none") {
					$("#ls_select_inspect_colorInnerContainer").append("<div id='ls_select_inspect_partColor_none' class='ls_select_inspect_colorItem'>None</div>");
				} else {
					for (var index = 0; index < ui.select.selectedPart.colors.length; index++) {
						$("#ls_select_inspect_colorInnerContainer").append("<div id='ls_select_inspect_partColor_"+ ui.select.selectedPart.colors[index] +"' class='ls_select_inspect_colorItem ls_select_inspect_color_"+ ui.select.selectedPart.colors[index] +"'></div>");
						$(".ls_select_inspect_color_" + ui.select.selectedPart.colors[index]).css("background-color", ini.colors[ui.select.selectedPart.colors[index]]);
					}
					$('#ls_select_inspect_ColorInnerContainer .ls_select_inspect_colorItem').on("click", function() {
						$(this).addClass("ls_select_inspect_selected").siblings().removeClass("ls_select_inspect_selected");
						ui.select.inspectUpdatePreview();
					});
				}
				$('#ls_select_inspect_ColorInnerContainer .ls_select_inspect_colorItem').first().addClass("ls_select_inspect_selected");
				
				// Add description
				$("#ls_select_inspect_description_content").text(ui.select.selectedPart.info);
				
				// Add mod selection
				var mods_array = current_lightsaber.findQualifiedMods(ui.select.selectedPart.partName);
				for (var index = 0; index < mods_array.length; index++) {
					$("#ls_select_inspect_modInnerContainer").append("<div class='ls_select_itemcontainer'><img class='ls_select_img' id='ls_select_inspect_mod_"+ mods_array[index].modName +"' src='" + mods_array[index].img_url + mods_array[index].colors[0] + ".png'><h2 class='ls_select_item_title'>" + mods_array[index].prettyName +"</h2></div>");
					if (ui.select.selectedPart.flip) {
						$("#ls_select_inspect_modInnerContainer div").last().find("img").addClass("ls_flip");
					}
				}
				// Add pretty scrollbar if item amount exceeds height
				if (!ui.isInternetExplorer()) {
					$("#ls_select_inspect_modInnerContainer").mCustomScrollbar({ 
						scrollInertia: 500,
						mouseWheel:{ deltaFactor: 200 }
					});
				}
				$('#ls_select_inspect_modInnerContainer .ls_select_itemcontainer').first().addClass("ls_select_inspect_selected");
				$('#ls_select_inspect_modInnerContainer .ls_select_itemcontainer').on("click", function() {
					$(this).addClass("ls_select_inspect_selected").siblings().removeClass("ls_select_inspect_selected");
					ui.select.inspectUpdateModColors();
					ui.select.inspectUpdatePreview();
				});
				$('#ls_select_inspect_modInnerContainer .ls_select_itemcontainer').hover(function() {
			  	$(this).siblings().css("background-color", "transparent");
			  }, function() {
			  	$(this).siblings().css("background-color", "");
			  });
					
				// Add mod colors
				ui.select.inspectUpdateModColors();
				
				// Add OK-Button
				$(".ls_select_inspect_ok_button_class").on("click", function() {
					ui.select.acceptInspect();
				});
				
				// Last step: Create preview image
				ui.select.inspectUpdatePreview();
			}
			
			User_Interface_Selection.prototype.inspectUpdateModColors = function() {
				$("#ls_select_inspect_modColorInnerContainer").empty();
				
				var modName = $("#ls_select_inspect_modInnerContainer").find(".ls_select_inspect_selected").find("img").attr("id").replace("ls_select_inspect_mod_", "");
				var colors = [];
				if (!(modName === "no_mod")) {			
					for (var current_mod in ini.allMods) {
						if (ini.allMods.hasOwnProperty(current_mod)) {
							if (ini.allMods[current_mod].modName == modName) {
								colors = ini.allMods[current_mod].colors;
							}
						}
					}
				} else {
					colors = ["none"];
				}
				
				if (colors[0] == "none") {
					$("#ls_select_inspect_modColorInnerContainer").append("<div id='ls_select_inspect_modColor_none' class='ls_select_inspect_colorItem'>None</div>");
				} else {
					for (var index = 0; index < colors.length; index++) {
						$("#ls_select_inspect_modColorInnerContainer").append("<div id='ls_select_inspect_modColor_"+ colors[index] +"' class='ls_select_inspect_colorItem ls_select_inspect_color_"+ colors[index] +"'></div>");
						$(".ls_select_inspect_color_" + colors[index]).css("background-color", ini.colors[colors[index]]);
					}
				}
				$('#ls_select_inspect_modColorInnerContainer .ls_select_inspect_colorItem').on("click", function() {
					$(this).addClass("ls_select_inspect_selected").siblings().removeClass("ls_select_inspect_selected");
					ui.select.inspectUpdatePreview();
				});
				$('#ls_select_inspect_modColorInnerContainer .ls_select_inspect_colorItem').first().addClass("ls_select_inspect_selected");
			}
			
			User_Interface_Selection.prototype.inspectUpdatePreview = function () {
			// Function to update image preview after color, mod or mod-color has changed
				$("#ls_select_inspect_pictureInnerContainer").empty();
				
				// Find current settings
				var partColorIndex;
				var mod;
				var modColorIndex;
				
					var partColor = $("#ls_select_inspect_colorInnerContainer").find(".ls_select_inspect_selected").attr("id").replace("ls_select_inspect_partColor_", "");
					for (var index = 0; index < ui.select.selectedPart.colors.length; index++) {
						if (ui.select.selectedPart.colors[index] == partColor) {
							partColorIndex = index;
						}
					}

				var modName = $("#ls_select_inspect_modInnerContainer").find(".ls_select_inspect_selected").find("img").attr("id").replace("ls_select_inspect_mod_", "");
				if (modName !== "no_mod") {
					mod = jQuery.extend({}, ini.allMods[modName]);	
					var modColor = $("#ls_select_inspect_modColorInnerContainer").find(".ls_select_inspect_selected").attr("id").replace("ls_select_inspect_modColor_", "");
					for (var index = 0; index < mod.colors.length; index++) {
						if (mod.colors[index] == modColor) {
							modColorIndex = index;
						}
					}
				} else {
					mod = "none";
				}
				
				// Paint preview
				$("#ls_select_inspect_pictureInnerContainer").append("<img id='ls_select_inspect_image' src='"+ ui.select.selectedPart.img_url + ui.select.selectedPart.colors[partColorIndex] +".png'>");
				$("#ls_select_inspect_pictureInnerContainer").width(ui.select.selectedPart.partWidth * ($("#ls_select_inspect_pictureContainer").height() / 500));
				
				if (ui.select.selectedPart.flip) {
					$("#ls_select_inspect_image").addClass("ls_flip");
				}
				
				if (mod !== "none") {				
					$("#ls_select_inspect_pictureInnerContainer").append("<img id='ls_select_inspect_image_mod' src='"+ mod.img_url + mod.colors[modColorIndex] +".png'>");					
					var zoomMulti = $("#ls_select_inspect_pictureInnerContainer").width() / ui.select.selectedPart.partWidth; // Relative multiplier to calculate size difference
					modHeight = 500 * zoomMulti;
					modOffset = ui.select.selectedPart.modOffset * zoomMulti;
					$("#ls_select_inspect_image_mod").height(modHeight); // In case part longer than container and part height reduced to fit. Reduce mod height also to make it fit again.
					if (ui.select.selectedPart.modAttachment == "left") {
						$("#ls_select_inspect_image_mod").css("left", modOffset);
					} 
					if (ui.select.selectedPart.modAttachment == "right") {
						$("#ls_select_inspect_image_mod").css("right", modOffset);
					}
					if (ui.select.selectedPart.flip) {
						$("#ls_select_inspect_image_mod").addClass("ls_flip");
					}
				}				
			}
			
			User_Interface_Selection.prototype.acceptInspect = function() {
				
				// Get settings for selected part
				var partColor = $("#ls_select_inspect_colorInnerContainer").find(".ls_select_inspect_selected").attr("id").replace("ls_select_inspect_partColor_", "");
				for (var index = 0; index < ui.select.selectedPart.colors.length; index++) {
					if (ui.select.selectedPart.colors[index] == partColor) {
						ui.select.selectedPart.activeColor = index;
					}
				}

				var mod = "none";
				var modName = $("#ls_select_inspect_modInnerContainer").find(".ls_select_inspect_selected").find("img").attr("id").replace("ls_select_inspect_mod_", "");
				if (modName !== "no_mod") {
					mod = jQuery.extend({}, ini.allMods[modName]);	
					var modColor = $("#ls_select_inspect_modColorInnerContainer").find(".ls_select_inspect_selected").attr("id").replace("ls_select_inspect_modColor_", "");
					for (var index = 0; index < mod.colors.length; index++) {
						if (mod.colors[index] == modColor) {
							mod.activeColor = index;
						}
					}
				}
				ui.select.selectedPart.mod = mod;	
				
				// Close selection and hand over part
				$("#ls_select_container").remove();				// Hide selection window
			 	$("#ls_modbutton").show();
				current_lightsaber.addPart(ui.select.selectedPart, ui.select.side);
		 		ui.select.reset();
		 		ui.disableButtons(false); // Reactivate side buttons	
		 		ui.onBuildChange();
			}
			
			User_Interface_Selection.prototype.abortInspect = function() {
				$("#ls_select_inspectMenu").hide();
				$("#ls_select_menu").show();
				$("#ls_select_inspectSelection").hide();
				$("#ls_select_selection").show();
				
				$("#ls_select_inspect_pictureInnerContainer").empty();
				$("#ls_select_inspect_colorInnerContainer").empty();
				$("#ls_select_inspect_modInnerContainer").empty();
				
				$("#ls_select_inspect_backButton").unbind();
				$(".ls_select_inspect_ok_button_class").unbind();
				
				ui.select.selectedPart = null;
			}
						
			User_Interface_Selection.prototype.reset = function () {
				this.selectionActive = false;
				this.side = null;
				this.qualifiedParts = null;
				this.selectedPart = null;
			}
				
			
			// Subclass for modding the build
			// ------------------------------------------------------
			function User_Interface_Mod () {
				this.moddingInProgress = false;
				this.partInConfig = "none";
				this.startModCooldown = false; 
			}
			
			User_Interface_Mod.prototype.startConfig = function (part_id) {
				// Preliminary checks
				if (ui.select.selectionActive) { return; }	// Not allowed
				if (ui.build.randomizeActive) { 						// Deactivate randomize
					$("#ls_randomizeUi_center").unbind();
					$("#ls_randomizeUi_close").unbind();
					$("#ls_randomizeUi").hide();
					$("#ls_modbutton").show();
					$("#ls_randomizeUi_center").css("background-color", "#404040");
					ui.build.randomizeActive = false;
				}
				
				ui.mod.isConfigFinished();
				ui.mod.moddingInProgress = true;
				ui.mod.partInConfig = part_id;
				
				// Set cooldown: Weird bug, mobile listens to both dblclick and doubletap on first load of build, but only to doubletap in the following builds. Don't know why.
				// This is to prevent startConfig and closeConfig to happen immediately after each other with one doubletap/click. 
				// Cooldown looked for in new listener of painter.startConfig().
				if (!ui.mod.startModCooldown) {
					ui.mod.startModCooldown = true;
					setTimeout(function() {
						ui.mod.startModCooldown = false;
					}, 50);
				}
				
				// Find switch parts
				partIndex = current_lightsaber.findIndex(part_id);
				var leftSaberConnector = "none";
				var rightSaberConnector = "none";
				if (partIndex-1 in current_lightsaber.currentBuild) {
					leftSaberConnector = current_lightsaber.currentBuild[partIndex-1].rightConnector;
					if (partIndex-2 in current_lightsaber.currentBuild && current_lightsaber.currentBuild[partIndex-1].slip) { // If left part slip, skip to next part
						leftSaberConnector = current_lightsaber.currentBuild[partIndex-2].rightConnector;
					}
				}
				if (partIndex+1 in current_lightsaber.currentBuild) {
					rightSaberConnector = current_lightsaber.currentBuild[partIndex+1].leftConnector;
					if (partIndex+2 in current_lightsaber.currentBuild && current_lightsaber.currentBuild[partIndex+1].slip) {
						rightSaberConnector = current_lightsaber.currentBuild[partIndex+2].leftConnector;
					}
				}
				var qualifiedParts = current_lightsaber.findQualifiedParts(leftSaberConnector, rightSaberConnector);
				qualifiedParts = ui.filterQualifiedParts(qualifiedParts, "", part_id);
				
				// Start config
				painter.mod.startConfig(part_id, qualifiedParts);
				ui.mod.showConfigPanel(part_id);
				ui.disableButtons(true);
			}
			
			User_Interface_Mod.prototype.isConfigFinished = function () {
				if (ui.mod.moddingInProgress == true) {
					this.acceptConfig(ui.mod.partInConfig);
				}
			}
			
			User_Interface_Mod.prototype.showConfigPanel = function (part_id) {
				if (!$("#ls_config_container").length) { // In case config_container is still there. Waits a moment to remove itself after config closes. Helps with flickering.
					$("#ls_ui_container").append("<div id='ls_config_container'><div id='ls_config_container_leftEdge'><div></div></div><div id='ls_config_innerContainer'><div id='ls_config_container_left'></div><div id='ls_config_container_center'></div><div id='ls_config_container_right'></div></div><div id='ls_config_container_rightEdge'><div></div></div></div>");
					// Center content
					$("#ls_config_container_center").append("<div id='ls_config_partName'></div>"); // Title
						$("#ls_config_partName").append("<div id='ls_config_partName_h_arrows'></div>");
							$("#ls_config_partName_h_arrows").append("<div id='ls_config_container_leftArrow' class='config_global_leftArrow ls_config_panel_directional ls_config_panel_hover'><</div>");
							$("#ls_config_partName_h_arrows").append("<div id='ls_config_container_leftPlus' class='config_global_leftPlus ls_config_panel_directional ls_config_panel_hover'>+</div>");
							$("#ls_config_partName_h_arrows").append("<div id='ls_config_container_rightArrow' class='config_global_rightArrow ls_config_panel_directional ls_config_panel_hover'>></div>");
							$("#ls_config_partName_h_arrows").append("<div id='ls_config_container_rightPlus' class='config_global_rightPlus ls_config_panel_directional ls_config_panel_hover'>+</div>");
						$("#ls_config_partName").append("<h2 id='ls_config_partName_field'></h2>"); // Part-Name
						$("#ls_config_partName").append("<div id='ls_config_partName_ok' class='ls_config_panel_hover'>OK</div>"); // OK-Button
						$("#ls_config_partName").append("<div id='ls_config_partName_v_arrows'></div>");
							$("#ls_config_partName_v_arrows").append("<div id='ls_config_container_upArrow' class='config_global_upArrow ls_config_panel_directional ls_config_panel_hover'><div>&#8963</div></div>");
							$("#ls_config_partName_v_arrows").append("<div id='ls_config_container_downArrow' class='config_global_downArrow ls_config_panel_directional ls_config_panel_hover'><div>&#8964<div></div>");
					$("#ls_config_container_center").append("<div id='ls_config_partInfo'><h3>Info:</h3><p id='ls_config_partInfo_field'></p></div></div>"); // Description	
					$("#ls_config_container_center").append("<div id='ls_config_delete'>Remove</div>");
					// Left content
					$("#ls_config_container_left").append("<div id='ls_config_button_flip' class='ls_config_panel_button ls_config_panel_hover'><img src='assets/flip.png'><p>Flip</p></div>"); // Flip-Button
					$("#ls_config_container_left").append("<div id='ls_config_button_color' class='ls_config_panel_button ls_config_panel_colorButton ls_config_panel_hover'><img src='assets/coloricon.png'><p>Color</p></div>");
						$("#ls_config_button_color").append("<div id='ls_config_button_color_field'></div>");
					// Right content
					$("#ls_config_container_right").append("<div id='ls_config_modInfo' class='ls_config_panel_button ls_config_info ls_config_panel_hover'><h3>Mod:</h3><p id='ls_config_modInfo_field'></p></div></div>"); // Mod-Info
					$("#ls_config_container_right").append("<div id='ls_config_button_modColor' class='ls_config_panel_button ls_config_panel_colorButton ls_config_panel_hover'><img src='assets/coloricon.png'><p>Mod color</p></div>");
						$("#ls_config_button_modColor").append("<div id='ls_config_button_modColor_field'></div>");
				}
				ui.mod.updateConfigPanel(part_id);
			}	
				
			User_Interface_Mod.prototype.updateConfigPanel = function (part_id) {
				var activePart = ui.mod.fetchActivePart(part_id);	
				var partInBuildIndex = current_lightsaber.findIndex(part_id);
				
				// Update all button listeners
				ui.mod.registerButtonListeners(part_id);
				
				// At leftmost or rightmost edge? Show Add-Button if possible
				// Also make sure blade can't be added after foregrip, pommel or connector attached directly to shroud (no chassis)
				$(".config_global_leftArrow").show();
				$(".config_global_rightArrow").show();
				$(".config_global_leftPlus").hide();
				$(".config_global_rightPlus").hide();
				if (partInBuildIndex == 0) {
					$(".config_global_leftArrow").hide();
					if (activePart.leftConnector !== "none") {							
						var b = current_lightsaber.currentBuild; 
						if (!((b.length > 1 && (activePart.partType == "shroud" && (b[1].partType == "foregrip" || b[1].partType == "pommel" || b[1].partType == "connector"))) ||  // If shroud attached to silly part (foregrip, pommel, connector), don't allow to add blade (no chassis thus no blade holder)
									(b.length > 2 && (activePart.partType == "shroud" && b[1].slip && (b[2].partType == "foregrip" || b[2].partType == "pommel" || b[2].partType == "connector"))))) {
							$(".config_global_leftPlus").show();
						}
					} 				
				}
				if (partInBuildIndex == current_lightsaber.currentBuild.length-1) {
					$(".config_global_rightArrow").hide();
					if (activePart.rightConnector !== "none") {
						var b = current_lightsaber.currentBuild;
						if (!((b.length > 1 && (activePart.partType == "shroud" && (b[b.length-2].partType == "foregrip" || b[b.length-2].partType == "pommel" || b[b.length-2].partType == "connector"))) ||  // If shroud attached to silly part (foregrip, pommel, connector), don't allow to add blade (no chassis thus no blade holder)
								  (b.length > 2 && (activePart.partType == "shroud" && b[b.length-2].slip && (b[b.length-3].partType == "foregrip" || b[b.length-3].partType == "pommel" || b[b.length-3].partType == "connector"))))) {
							$(".config_global_rightPlus").show();
						}
					}
				}
				// Switch part at top or bottom? Hide arrows
				$(".config_global_upArrow").show();
				$(".config_global_downArrow").show();
				if ($("#" + part_id + " .ls_imgcontainer:first").hasClass("ls_config_active")) {
					$(".config_global_upArrow").hide();
				}
				if ($("#" + part_id + " .ls_imgcontainer:last").hasClass("ls_config_active")) {
					$(".config_global_downArrow").hide();
				}
				
				// Enter part data in info fields		
				$("#ls_config_container #ls_config_partName_field").text(activePart.prettyName); 																									// Title
				$("#ls_config_container #ls_config_partInfo_field").text(activePart.info);     																										// Description		
				 																										
				// Part flippable?
				var foregripFlip = false; // Without safe mode, foregrip flip often possible even if not the only part
				if (!ui.safeMode && activePart.partType == "foregrip") {
					foregripFlip = true;
					if (current_lightsaber.currentBuild[partInBuildIndex-1]) {
						if (current_lightsaber.currentBuild[partInBuildIndex-1].partType === "chassis") {
							foregripFlip = false;
						}
					}
					if (current_lightsaber.currentBuild[partInBuildIndex+1]) {
						if (current_lightsaber.currentBuild[partInBuildIndex+1].partType === "chassis") {
							foregripFlip = false;
						}
					}
				}
				
				if (activePart.leftConnector.toString() === activePart.rightConnector.toString() ||	current_lightsaber.currentBuild.length == 1 || foregripFlip) {
					$("#ls_config_button_flip").find("img").attr("src", 'assets/flip.png');
					$("#ls_config_button_flip").css("pointer-events", "auto");
				} else {
					$("#ls_config_button_flip").find("img").attr("src", 'assets/cross-white.png');
					$("#ls_config_button_flip").css("pointer-events", "none");
				}
				
				// Set update part color
				var partColor = activePart.colors[activePart.activeColor];
				if (partColor !== "none") {					
					$("#ls_config_button_color").find("p").text("Color (" + activePart.colors.length + ")");
					
					colorHex = ini.colors[partColor];
					$("#ls_config_button_color_field").css("background", "");
					$("#ls_config_button_color_field").css("background-color", colorHex);
				} else {
					$("#ls_config_button_color").find("p").text("Color");		
					$("#ls_config_button_color_field").css("background-color", "");
					$("#ls_config_button_color_field").css("background", "transparent repeating-linear-gradient(45deg, rgb(221, 221, 221), rgb(221, 221, 221) 10px, rgb(85, 85, 85) 0px, rgb(85, 85, 85) 22px) repeat scroll 0% 0%");
				}
				
				// Mod-Button				
				if (activePart.modAttachment !== "none") {
					mods_array = current_lightsaber.findQualifiedMods(activePart.partName)
					$("#ls_config_modInfo h3").text("Mods (" + (mods_array.length-1) + "):");
					$("#ls_config_modInfo p").css("color", "orange");
				} else {
					$("#ls_config_modInfo h3").text("Mods:"); 
					$("#ls_config_modInfo p").css("color", "white");
				}
				if (activePart.mod.prettyName) {																								
					$("#ls_config_container #ls_config_modInfo_field").text(activePart.mod.prettyName);	
				} else {
					$("#ls_config_container #ls_config_modInfo_field").text(activePart.mod); // None	
				}
				
				// Mod-Color-Button
				if (activePart.modAttachment !== "none" && activePart.mod.colors) { 							// Is mod capable and has mod installed
					modColor = activePart.mod.colors[activePart.mod.activeColor];
					if (modColor !== "none") { 								
						$("#ls_config_button_modColor").find("p").text("Color (" + activePart.mod.colors.length + ")");
																									// Installed mod has proper color
						modColorHex = ini.colors[modColor];
						$("#ls_config_button_modColor_field").css("background", "");
						$("#ls_config_button_modColor_field").css("background-color", modColorHex);
					} else {
						$("#ls_config_button_modColor").find("p").text("Color");
						$("#ls_config_button_modColor_field").css("background-color", "");
						$("#ls_config_button_modColor_field").css("background", "transparent repeating-linear-gradient(45deg, rgb(221, 221, 221), rgb(221, 221, 221) 10px, rgb(85, 85, 85) 0px, rgb(85, 85, 85) 22px) repeat scroll 0% 0%");
					}	
				} else {
					$("#ls_config_button_modColor").find("p").text("Color");
					$("#ls_config_button_modColor_field").css("background-color", "");
					$("#ls_config_button_modColor_field").css("background", "transparent repeating-linear-gradient(45deg, rgb(221, 221, 221), rgb(221, 221, 221) 10px, rgb(85, 85, 85) 0px, rgb(85, 85, 85) 22px) repeat scroll 0% 0%");
				}
				
				// Delete-Button
				if (partInBuildIndex == 0 || partInBuildIndex == current_lightsaber.currentBuild.length-1 || activePart.slip) {
					$("#ls_config_delete").show();		
				} else {
					$("#ls_config_delete").hide();
				}
			}
			
			User_Interface_Mod.prototype.registerButtonListeners = function (part_id) {
				// Arrows und Plusses
				$(".config_global_upArrow").unbind();
				$(".config_global_upArrow").on("click", function(e) {
					e.preventDefault();
					painter.mod.switchPart("up", part_id);
					ui.mod.updateConfigPanel(part_id);
				});
				$(".config_global_downArrow").unbind();
				$(".config_global_downArrow").on("click", function(e) {
					e.preventDefault();
					painter.mod.switchPart("down", part_id);
					ui.mod.updateConfigPanel(part_id);
				});
				$(".config_global_leftArrow").unbind();
				$(".config_global_leftArrow").on("click", function(e) {
					e.preventDefault();
					ui.mod.startConfig(current_lightsaber.currentBuild[current_lightsaber.findIndex(part_id)-1].id);
				});
				$(".config_global_rightArrow").unbind();
				$(".config_global_rightArrow").on("click", function(e) {
					e.preventDefault();
					ui.mod.startConfig(current_lightsaber.currentBuild[current_lightsaber.findIndex(part_id)+1].id);
				});
				$(".config_global_leftPlus").unbind();
				$(".config_global_leftPlus").on("click", function(e) {
					e.preventDefault();
					ui.mod.acceptConfig(part_id);
					var partsArray = current_lightsaber.findQualifiedParts("none", current_lightsaber.leftConnector);
					partsArray = ui.filterQualifiedParts(partsArray, "front", "");
					var nextBestPart = partsArray[Math.floor(partsArray.length / 2)];
					nextBestPart.activeColor = 0;
					nextBestPart.mod = "none";
					current_lightsaber.addPart(nextBestPart, "front");
					setTimeout(function() { // Wait a short while for animateAddImage() to set finalPos of part, otherwise config part distance off
						ui.mod.startConfig(current_lightsaber.currentBuild[0].id);
					}, 35);
				});
				$(".config_global_rightPlus").unbind();
				$(".config_global_rightPlus").on("click", function(e) {
					e.preventDefault();
					ui.mod.acceptConfig(part_id);
					var partsArray = current_lightsaber.findQualifiedParts(current_lightsaber.rightConnector, "none");
					partsArray = ui.filterQualifiedParts(partsArray, "back", "");
					var nextBestPart = partsArray[Math.floor(partsArray.length / 2)];
					nextBestPart.activeColor = 0;
					nextBestPart.mod = "none";
					current_lightsaber.addPart(nextBestPart, "back");
					setTimeout(function() {
						ui.mod.startConfig(current_lightsaber.currentBuild[current_lightsaber.currentBuild.length-1].id);
					}, 35);
				});
							
				// Config container	
				$("#ls_config_partName_ok").unbind();
				$("#ls_config_partName_ok").on("click", function (e) {
					e.preventDefault();
					ui.mod.acceptConfig(part_id);
				});
				$("#ls_config_button_flip").unbind();
				$("#ls_config_button_flip").on("click", function (e) {
					e.preventDefault();
					ui.mod.flipPart(part_id);
					ui.mod.updateConfigPanel(part_id);
				});	
				$("#ls_config_button_color").unbind();
				$("#ls_config_button_color").on("click", function (e) {
					e.preventDefault();
					ui.mod.cycleColors(part_id);
					ui.mod.updateConfigPanel(part_id);
				});	
				$("#ls_config_modInfo").unbind();
				$("#ls_config_modInfo").on("click", function (e) {
					e.preventDefault();
					ui.mod.cycleMods(part_id);
					ui.mod.updateConfigPanel(part_id);
				});	
				$("#ls_config_button_modColor").unbind();
				$("#ls_config_button_modColor").on("click", function (e) {
					e.preventDefault();
					ui.mod.cycleModColors(part_id);
					ui.mod.updateConfigPanel(part_id);
				});	
				$("#ls_config_delete").unbind();
				$("#ls_config_delete").on("click", function (e) {
					e.preventDefault();
					ui.mod.deletePart(part_id);
				});	
			}
			
			User_Interface_Mod.prototype.fetchActivePart = function (part_id) {
				var swapPartName = $("#" + part_id + " .ls_config_active").attr("class").match(/ls_imgcontainer_(.*?)\b/)[1];
				var swapPart = jQuery.extend({}, ini.allParts[swapPartName]); // Fetch new part
				swapPart.id = part_id; // Assign old part id
				
				// Get color
				var partColor = $("#" + part_id + " .ls_config_active").find(".ls_img").attr("src").match(new RegExp(swapPartName + "_(.*?).png"))[1];
				for (var index = 0; index < swapPart.colors.length; index++) {
					if (swapPart.colors[index] == partColor) {
						swapPart.activeColor = index;
					}
				}
				
				// Is flipped?
				if ($("#" + part_id + " .ls_config_active .ls_img").hasClass("ls_flip")) {
					swapPart.flip = true;
					var temp_var;
					temp_var = swapPart.leftConnector; swapPart.leftConnector = swapPart.rightConnector; swapPart.rightConnector = temp_var;
					temp_var = swapPart.leftClip; swapPart.leftClip = swapPart.rightClip; swapPart.rightClip = temp_var;
					if (swapPart.modAttachment !== "none") {
						if (swapPart.modAttachment === "left") {
							swapPart.modAttachment = "right";
						} else {
							swapPart.modAttachment = "left";
						}
					}
				} else {
					swapPart.flip = false;
				}
				
				// Has mod?
				if ($("#" + part_id + " .ls_config_active").has(".ls_mod").length != 0 ) { 
					var modName = $("#" + part_id + " .ls_config_active .ls_mod").attr("class").match(/ls_mod_(.*?)\b/)[1];
					var swapMod = jQuery.extend({}, ini.allMods[modName]);

					// Get mod color
					var modColor = $("#" + part_id + " .ls_config_active").find(".ls_mod").attr("src").match(new RegExp(modName + "_(.*?).png"))[1];
					for (var index = 0; index < swapMod.colors.length; index++) {
						if (swapMod.colors[index] == modColor) {
							swapMod.activeColor = index;
						}
					}
					swapPart.mod = swapMod;	
				} else {
					swapPart.mod = "none";
				}
				return swapPart;
			}
			
			User_Interface_Mod.prototype.flipPart = function (part_id) {
				var activePart = ui.mod.fetchActivePart(part_id);
				painter.mod.flipPart(activePart);
			}
			
			User_Interface_Mod.prototype.cycleColors = function (part_id) {
				var activePart = ui.mod.fetchActivePart(part_id);
				
				var colorIndex = activePart.activeColor;
				colorIndex++;
				if (colorIndex == activePart.colors.length) {
					colorIndex = 0;
				}
				$("#" + part_id + " .ls_config_active .ls_img").attr("src", activePart.img_url + activePart.colors[colorIndex] + ".png");
			}
			
			User_Interface_Mod.prototype.cycleMods = function (part_id) {
				// Find qualified mods
				var activePart = ui.mod.fetchActivePart(part_id);
				mods_array = current_lightsaber.findQualifiedMods(activePart.partName);
				
				// Find next mod in order
				if ($("#" + part_id + " .ls_config_active").has(".ls_mod").length != 0) { // Does part have mod?
					var modName = $("#" + part_id + " .ls_config_active .ls_mod").attr("class").match(/ls_mod_(.*?)\b/)[1];
				} else {
					var modName = "no_mod";
				}
				var modIndex;
				for (var index = 0; index < mods_array.length; index++) {
					if (mods_array[index].modName === modName) {
						modIndex = index;
					}
				}
				modIndex += 1;
				if (modIndex == mods_array.length) {
					modIndex = 0;
				}
				var nextMod = mods_array[modIndex];
				
				painter.mod.cycleMods(activePart, nextMod);
			}
			
			User_Interface_Mod.prototype.cycleModColors = function (part_id) {
				var activePart = ui.mod.fetchActivePart(part_id);
				
				if (activePart.mod.colors) {
					var modColorIndex = activePart.mod.activeColor;
					modColorIndex++;
					if (modColorIndex == activePart.mod.colors.length) {
						modColorIndex = 0;
					}
					$("#" + part_id + " .ls_config_active .ls_mod").attr("src", activePart.mod.img_url + activePart.mod.colors[modColorIndex] + ".png");
				}
			}
			
			User_Interface_Mod.prototype.deletePart = function (part_id) {
				ui.mod.acceptConfig(part_id);
				var partIndex = current_lightsaber.findIndex(part_id);
				if (current_lightsaber.currentBuild[partIndex].slip) {
					var newBuild = current_lightsaber.currentBuild;
					newBuild.splice(partIndex, 1);
					var tempIdCount = current_lightsaber.idGenerator; // ID generator count should not reset to 0, otherwise multiple identical part_ids when adding something hereafter
					ui.build.resetBuild(false);
					current_lightsaber.idGenerator = tempIdCount;
					ui.build.loadBuild(newBuild, false);
					if (current_lightsaber.currentBuild.length > 0) {
						if (current_lightsaber.currentBuild[partIndex-1]) {
							ui.mod.startConfig(current_lightsaber.currentBuild[partIndex-1].id);
						} else {
							ui.mod.startConfig(current_lightsaber.currentBuild[partIndex+1].id);
						}
					}
				} else {
					if (partIndex == 0) {
						current_lightsaber.removePart("front");
						if (current_lightsaber.currentBuild.length > 0) {
							ui.mod.startConfig(current_lightsaber.currentBuild[0].id);
						}
					} else { // Additional else here, b/c currentBuild changes after first delete and might then wrongly qualifiy for second
						if (partIndex == current_lightsaber.currentBuild.length-1) {
							current_lightsaber.removePart("back");
							ui.mod.startConfig(current_lightsaber.currentBuild[current_lightsaber.currentBuild.length-1].id);
						}	
					}
				}
				ui.onBuildChange();
			}
			
			User_Interface_Mod.prototype.acceptConfig = function (part_id) {
				// Get new Part and give to lightsaber object
				this.moddingInProgress = false;
				swapPart = ui.mod.fetchActivePart(part_id);
				current_lightsaber.acceptConfig(part_id, swapPart);
				ui.onBuildChange();
			}
			
			
			// Subclass for saving and loading builds
			// ------------------------------------------------------
			function User_Interface_Build () {
				this.buildNumber = 0;
				this.currentBuildID = "";
				this.randomizeActive = false;
			}
			
			User_Interface_Build.prototype.getBuildNumber = function () {
				this.buildNumber++;
				return this.buildNumber;
			}
			
			User_Interface_Build.prototype.generateBuildId = function () {
				var buildID = "";
				var build = current_lightsaber.currentBuild;
				if (build.length > 0) {
					for (var index = 0; index < build.length; index++) {
						if (index != 0) {
							buildID = buildID + "+";
						}
						buildID += (build[index].flip ? "'" : "");
						buildID += build[index].partID; // Add part id
						buildID += "." + build[index].activeColor;
						if (build[index].mod !== "none") {
							buildID += build[index].mod.modID;
							buildID += "." + build[index].mod.activeColor;
						}
					}
				}
				return buildID;
			}
			
			User_Interface_Build.prototype.getUrlBuildId = function () {
				var rawUrlParams = decodeURIComponent(window.location.search.substring(1)).split("&"); // window.location == url. search not function but property of location that holds get params
				var build = rawUrlParams[0];
				build = build.replace("build=", "");
				return build;
			}
			
			User_Interface_Build.prototype.setUrlBuildId = function (setHistory) {
				buildID = ui.build.generateBuildId();
				
				if (buildID === this.currentBuildID) { // No need to update, keeps browser history clean
					return;
				}
				this.currentBuildID = buildID;
				
				if (buildID !== "") {
					var buildIDtemp = buildID;
					buildID = "?build=" + buildIDtemp;					
				}
				
				// Pushing url via history is an easy way to change url params without reloading
				if(setHistory != false) {
					if (history.pushState) {
				    var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + buildID;
				    window.history.pushState({path:newurl},'',newurl);
					}
				}
			}
			
			// Functions to create/delete builds
			User_Interface_Build.prototype.getBuildObjectFromId = function (id) {
				if (id == "") { return; }
				
				var build = [];
				var buildIdArray = id.split("+");
				for (var index = 0; index < buildIdArray.length; index++) {
					var partObject;
					var sFlip = "", sID = "", sColor = "", sMod = "", sModColor = "";
					
					// Decode id from url
					sFlip = (/\'/.test(buildIdArray[index]) ? buildIdArray[index].match(/(\')/)[1] : "");
						buildIdArray[index] = buildIdArray[index].substring(sFlip.length);
					sID = (/(.*?)\./.test(buildIdArray[index]) ? buildIdArray[index].match(/(.*?)\./)[1] : "");
						buildIdArray[index] = buildIdArray[index].substring(sID.length);
					sColor = (/\.(.+?)m*/.test(buildIdArray[index]) ? buildIdArray[index].match(/\.(.+?)m*/)[1] : "");
						buildIdArray[index] = buildIdArray[index].substring(sColor.length+1);
					if (buildIdArray[index].length > 0) { // If has mod
						sMod = (/(m.+?)\./.test(buildIdArray[index]) ? buildIdArray[index].match(/(m.+?)\./)[1] : "");
							buildIdArray[index] = buildIdArray[index].substring(sMod.length);
						sModColor = (/\.(.*)/.test(buildIdArray[index]) ? buildIdArray[index].match(/\.(.*)/)[1] : "");
							buildIdArray[index] = buildIdArray[index].substring(sModColor.length+1);
					}
					
					// Create part object
					for (var part in ini.allParts) {  															// Get part
						if (ini.allParts.hasOwnProperty(part)) {	
							if (ini.allParts[part].partID == sID) {
								partObject = jQuery.extend({}, ini.allParts[part]);
							}				
						}
					}
					partObject.id = "ls_part_" + current_lightsaber.getNewId();			// Assign new id				
					partObject.activeColor = parseInt(sColor);											// Assign color				
					
					if (sFlip !== "") {																							// If flipped, swap properties
						partObject.flip = true;
						var temp_var;
						temp_var = partObject.leftConnector; partObject.leftConnector = partObject.rightConnector; partObject.rightConnector = temp_var;
						temp_var = partObject.leftClip; partObject.leftClip = partObject.rightClip; partObject.rightClip = temp_var;
						if (partObject.modAttachment !== "none") {
							if (partObject.modAttachment === "left") {
								partObject.modAttachment = "right";
							} else {
								partObject.modAttachment = "left";
							}
						}
					} else {
						partObject.flip = false;
					}
				
					if (sMod !== "") {																							// Has mod?
						for (var mod in ini.allMods) {
							if (ini.allMods.hasOwnProperty(mod)) {	
								if (ini.allMods[mod].modID == sMod) {
									partObject.mod = jQuery.extend({}, ini.allMods[mod]);
								}
							}
						}
						partObject.mod.id = "ls_mod_" + current_lightsaber.getNewId(); 	// Assign new mod id
						partObject.mod.activeColor = parseInt(sModColor);								// Assign mod color
					} else {
						partObject.mod = "none";
					}
					
					// Push part object into build array
					build.push(partObject);
				}
				return build;
			}	
			
			User_Interface_Build.prototype.resetBuild = function (setHistory) {
				painter.build.resetBuild(painter.transition, setHistory);
				current_lightsaber.leftConnector = null;
				current_lightsaber.rightConnector = null;
				current_lightsaber.currentBuild = [];
				current_lightsaber.partCount = 0;
				current_lightsaber.idGenerator = 0;
			}
			
			User_Interface_Build.prototype.loadBuild = function (build, setHistory) {
				if (build) {
					current_lightsaber.currentBuild = build;
					current_lightsaber.partCount = build.length;
					current_lightsaber.leftConnector = build[0].leftConnector;
					current_lightsaber.rightConnector = build[build.length-1].rightConnector;
					if (build.length > 1 && build[0].slip) {
						current_lightsaber.leftConnector = build[1].leftConnector;
					}
					if (build.length > 1 && build[build.length-1].slip) {
						current_lightsaber.rightConnector = build[build.length-2].rightConnector;
					}
					painter.build.paintBuild(painter.transition, build, setHistory);
					ui.onBuildChange(setHistory);
				}
			}
			
			User_Interface_Build.prototype.randomizeBuild = function () {
				var preparedBuild = [];
				var buildColor_blade = -1; 	// var to ensure uniform blade and crystal colors
				var chassisCount = 0; 			// var to count chassis to determine doublesaber
				var accentColor = -1;
				
				// Reset
				ui.build.resetBuild();
				
				// Temporarily enable safe mode to ensure random saber makes sense
				var safeModeSetting = ui.safeMode;
				ui.safeMode = true;
				
				// Predetermine part colors
				var setPartColors = []; 						// Array to choose limited amount of part colors, to prevent rainbow sabers
				var availablePartColors;
				for (var current_part in ini.allParts) {
					if (ini.allParts.hasOwnProperty(current_part)) {
						if (ini.allParts[current_part].partType == "reargrip")	{ // reargrip as an example piece
							availablePartColors = ini.allParts[current_part].colors;
						}
					}
				}
				for (var index = 0; index < 2; index++) {
					var chanceModifier = Math.floor(Math.random()*3);
					if (chanceModifier == 2 ) {
						chanceModifier = Math.floor(Math.random()*(availablePartColors.length - 2) + 2);
					}
					setPartColors.push(chanceModifier);
					setPartColors.push(chanceModifier);
				}
				 
				// 1. Always get blade as starting point
				var blades = current_lightsaber.findQualifiedParts("none", [["female", "blade"]]);
				var randomBlade = blades[Math.floor(Math.random()*blades.length)];
				randomBlade.id = "ls_part_" + current_lightsaber.getNewId();
				randomBlade.activeColor = Math.floor(Math.random()*randomBlade.colors.length);
				buildColor_blade = randomBlade.activeColor;
				randomBlade.mod = "none";
				preparedBuild.push(randomBlade);
				
				// 2. Get all the other parts until rightConnector == none
				while (preparedBuild[preparedBuild.length-1].rightConnector !== "none") {
					var rightConnector;
					if (!preparedBuild[preparedBuild.length-1].slip) {
						rightConnector = preparedBuild[preparedBuild.length-1].rightConnector;
					} else {
						rightConnector = preparedBuild[preparedBuild.length-2].rightConnector;
					}
					var nextParts = current_lightsaber.findQualifiedParts(rightConnector, "none");
					nextParts = ui.filterQualifiedParts(nextParts, "back", "", preparedBuild);
					var randomPart = nextParts[Math.floor(Math.random()*nextParts.length)];
					randomPart.id = "ls_part_" + current_lightsaber.getNewId();
					
					// Set part color
					if (randomPart.colors.length == availablePartColors.length) { // If this is standard piece 
						randomPart.activeColor = setPartColors[Math.floor(Math.random()*setPartColors.length)];
					} else {
						randomPart.activeColor = Math.floor(Math.random()*randomPart.colors.length);
					}
					
					// Flipped?
					if (randomPart.flip) {
						var temp_var;
						temp_var = randomPart.leftConnector; randomPart.leftConnector = randomPart.rightConnector; randomPart.rightConnector = temp_var;
						temp_var = randomPart.leftClip; randomPart.leftClip = randomPart.rightClip; randomPart.rightClip = temp_var;
						if (randomPart.modAttachment !== "none") {
							if (randomPart.modAttachment === "left") {
								randomPart.modAttachment = "right";
							} else {
								randomPart.modAttachment = "left";
							}
						}
					}
					
					// Add mod and mod color
					var mods = current_lightsaber.findQualifiedMods(randomPart.partName);
					if (mods.length > 1) {
						var randomMod = mods[Math.floor(Math.random()*mods.length)];
						if (randomMod.modName != "no_mod") {
							randomMod.id = "ls_mod_" + current_lightsaber.getNewId();
							
							// Set mod color
							if (randomMod.modType == "hiltcap") {
								randomMod.activeColor = setPartColors[Math.floor(Math.random()*setPartColors.length)];
							} else {
								if (randomMod.modType == "accent") {
									if (accentColor < 0) {
										accentColor = Math.floor(Math.random()*randomMod.colors.length);
									}
									randomMod.activeColor = accentColor;
								} else {
									randomMod.activeColor = 0;
								}
							}
							
							randomPart.mod = randomMod;
						} else {
							randomPart.mod = "none";
						}
					} else {
						randomPart.mod = "none";
					}
					
					// Extra filters for individual parts
					if (randomPart.partName == "chassis_crystal" || randomPart.partType == "blade") { // Unify blade and crystal colors
						randomPart.activeColor = buildColor_blade;
					}
					if (randomPart.partType == "emitter" && randomPart.partName !== "emitter_standard") {
						randomPart.mod = mods[Math.floor(Math.random()*(mods.length - 1) + 1)];
						randomPart.mod.id = "ls_mod_" + current_lightsaber.getNewId();
						randomPart.mod.activeColor = setPartColors[Math.floor(Math.random()*setPartColors.length)];
					}
					if (randomPart.partType == "chassis") {
						chassisCount++;
						randomPart.mod = mods[2];
						randomPart.mod.id = "ls_mod_" + current_lightsaber.getNewId();
						randomPart.mod.activeColor = setPartColors[Math.floor(Math.random()*setPartColors.length)];
					}
					if (randomPart.slip) {
						randomPart.mod = mods[Math.floor(Math.random()*(mods.length - 1) + 1)];
						randomPart.mod.id = "ls_mod_" + current_lightsaber.getNewId();
						randomPart.mod.activeColor = 0;
					}
					
					// Push part in to build array
					preparedBuild.push(randomPart);
				}
				
				// 3. Extra filters for final build	
				// Make both sides of doublesaber are identical
				if (chassisCount > 1) {
					var reverseArray = [];
					// Delete everything on right side
					for (var index = preparedBuild.length-1; index >= 0; index--) {
						if (preparedBuild[index].partType !== "connector") {
							preparedBuild.splice(index, 1);
						} else {
							break;
						}
					}
					// Load left side into array in reverse part order
					for (var index = preparedBuild.length-2; index >= 0; index--) {
						if (!preparedBuild[index].slip) {
							var this_part = jQuery.extend({}, preparedBuild[index]);
							if (this_part.mod != "none") {
								this_part.mod = jQuery.extend({}, preparedBuild[index].mod);
							}
													
							// Correct IDs
							this_part.id = "ls_part_" + current_lightsaber.getNewId();
							if (this_part.mod != "none") {
								this_part.mod.id = "ls_mod_" + current_lightsaber.getNewId();
							}
							
							// Flip part
							if (this_part.flip == true) {
								this_part.flip = false;
							} else {
								this_part.flip = true;
							}
							var temp_var;
							temp_var = this_part.leftConnector; this_part.leftConnector = this_part.rightConnector; this_part.rightConnector = temp_var;
							temp_var = this_part.leftClip; this_part.leftClip = this_part.rightClip; this_part.rightClip = temp_var;
							if (this_part.modAttachment !== "none") {
								if (this_part.modAttachment === "left") {
									this_part.modAttachment = "right";
								} else {
									this_part.modAttachment = "left";
								}
							}
							// Push into array
							reverseArray.push(this_part);
						}
					}

					for (var index = 0; index < reverseArray.length; index++) {
						preparedBuild.push(reverseArray[index]);
					}
				}				
				
				ui.safeMode = safeModeSetting;
				ui.build.loadBuild(preparedBuild);
			}
			
			// Functions to handle ui save/load buttons
			User_Interface_Build.prototype.saveBuildCookie = function (buildName) {		
	  		
	  		// Make buildName cookie-safe
	  		var safeBuildName = buildName.replace(" ", "_");
	  		
	  		// Get date
	  		var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
				var date = new Date();
				var day = date.getDate();
				var monthIndex = date.getMonth();
				var year = date.getFullYear();
				
				// Prepare cookie
				var seperator = "/";
				var identifier = "build"
				var buildID = ui.build.getUrlBuildId();
				var dateString = day + ". " + monthNames[monthIndex] + " " + year;
				var partCount = current_lightsaber.currentBuild.length;
				var price = "NYA";
				cookieValue = identifier + seperator + buildID + seperator + dateString + seperator + partCount + seperator + price;
				setCookie(safeBuildName, cookieValue, 1825);
			}
			
			User_Interface_Build.prototype.deleteBuildCookie = function (buildName) {
				cookieName = buildName.replace(" ", "_");
				deleteCookie(cookieName);
			}
			// Note: loadBuildCookie is handled entirely in the load dialogue window, as it's fairly intertwined with the ui
			
			User_Interface_Build.prototype.showRandomizeUi = function () {
				var quips = ["Another one!", "Hit me!", "Skadoosh!", "Lucky draw!", "Go wild!", "Again!", "All in!", "Go nuts!", "Happy yet?", 
										 "Ready for more?", "Reroll!", "Dice it!", "Lady Luck!", "Fat chance!", "Free ride!", "Murphy's law!", "Strike gold!",
										 "Push it!", "Sitting pretty?", "I am your father!", "Woo!", "Use the force!"];
				$("#ls_randomizeUi").show();
				$("#ls_modbutton").hide();
				this.randomizeActive = true;
				
				$("#ls_randomizeUi_center").css("background-color", "orange");
					
				$("#ls_randomizeUi_center").on("click", function () {
					if (ui.warnedAboutRandomize) {
						ui.build.randomizeBuild();
						$("#ls_randomizeUi_text p").text(quips[Math.floor(Math.random()*quips.length)]);
					} else {
						ui.createConfirmDialogue("random");
					}
				});		
				$("#ls_randomizeUi_close").on("click", function () {
					$("#ls_randomizeUi_center").unbind();
					$("#ls_randomizeUi_close").unbind();
					$("#ls_randomizeUi").hide();
					$("#ls_modbutton").show();
					$("#ls_randomizeUi_center").css("background-color", "#404040");
					ui.build.randomizeActive = false;
				});		
			}
			
			
			// Catch "back" and "forward" events in the browser and automatically match build to url
			window.onpopstate = function(event) {
			  ui.build.resetBuild(false);
				ui.build.loadBuild(ui.build.getBuildObjectFromId(ui.build.getUrlBuildId()), false);
			};
				
			// Execute
			// -------------------------------------------------------------------------------------------------------------------------
			var ini = new Initializer();
			var current_lightsaber = new Current_lightsaber();
			var painter = new Painter();
				painter.mod = new Painter_Mod();
				painter.build = new Painter_Build();
			var ui = new User_Interface();
				ui.select = new User_Interface_Selection();
				ui.mod = new User_Interface_Mod();
				ui.build = new User_Interface_Build();
		}
	}
});