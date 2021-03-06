	/*
	// Testplatform for some 2D experiments
	// currently very underdeveloped, its just for fun   
	//
	//
	*/

jQuery(document).ready(function($){
	if ($("#my2djumper").length) {
		var my2djumper = new function() {
						
			// 1. System objects, only one instance
			// ---------------------------------------------------------------
			
			// The 2D-Space
			function GameSpace() {
				this.id = "gamespace";
				this.children = {};
				
				// Central function to add objects to the gamespace.
				// Param1 is the object type that is to be added
				// Param2 determines if the object should be a a child of an already existing object (both programmatically as well as in the view)
				// Param3 is an array containing all parameters for the new object
				// Param 4 is an optional class that should be added to the new object
				this.add = function(objectType, parent, paramsArray, newClass) {
					var newClass = newClass || "";
					
					if (parent == "none" || parent == "gamespace") { 				// Draw directly into gamespace
						this.children[paramsArray[0]] = new objectType(...paramsArray);
						this.children[paramsArray[0]].parent = this;
						this.children[paramsArray[0]].draw(this.id, newClass);
						this.children[paramsArray[0]].initChildren();
					} else {																								// Draw into another object
						this.loopAllObjects(function(object) {
							if (object.id == parent) {
								object.children[paramsArray[0]] = new objectType(...paramsArray);
								object.children[paramsArray[0]].parent = object;
								object.children[paramsArray[0]].draw(parent, newClass);
								object.children[paramsArray[0]].initChildren();
							}
						});
					}
				}
				
				this.loopAllObjects = function (callback) {
					var eachRecursive = function (obj) {
						for (var k in obj.children) {
							if (obj.children[k] instanceof GameObject) {
		            callback(obj.children[k]);
		            eachRecursive(obj.children[k]);
			        }
						}
					}
					eachRecursive(this);
				}
			}
					
			// Main Loop
			function Engine () {
				this.active = true;
				var that = this;
				this.startMainLoop = function() {	
					that.active = true;
					that.mainLoop();
				}
				this.toggleMainLoop = function() {
					if (that.active) { 
						that.active = false; 
					} else {
						that.active = true; 
						that.startMainLoop();
					}
				}			
				// Main Loop function
				this.mainLoop = function() {
					if (physics) {
						ui.update();
						physics.simulate();
						logic.check();
					}
					
					setTimeout(function() {
						if (that.active) {
							that.mainLoop();						
						}
					}, 16); // 60 fps
				}
			}
			
			// Controls all physics-related stuff
			function Physics () {
				var that = this;
				
				// Main function - What physical effects need to be calculated for every object in every frame
				// These functions successively alter the vector of each object to account for every effect
				// The object.move function at the end finally paints the new position
				this.simulate = function () {					
					
					gs.loopAllObjects(function(obj) {
						physics.addGravity(obj, 1.3);					// Add gravity				
				    physics.collisionCorrection(obj);			// Stop objects from passing through each other (note: also manually places objects before final .move() to edge at collision, as only changing the vector would leave a gap)
				    obj.move(obj.vector, true);						// Move every object in the gamespace according to its momentum
					});				  			
				}
				
				// Applies a force to the object, changing its momentum/direction
				this.applyForce = function (object, forceVector) {
					if (forceVector[0] != 0 || forceVector[1] != 0) {
						
						// Calculate new player vector
						var newVector = [object.vector[0] + forceVector[0], object.vector[1] + forceVector[1]];
						var newVectorSpeed = Math.sqrt(Math.pow(newVector[0], 2) + Math.pow(newVector[1], 2));

						// If faster than maxSpeed, trim to fit maxspeed
						if (object.maxSpeed != 0) {
							if (object.maxSpeed && newVectorSpeed > object.maxSpeed) { 
								newVector = this.changeVectorSpeed(newVector, object.maxSpeed);	
							}
						}

						object.vector = newVector;
					}
				}
				
				// Slows the object speed down by param decelleration (to a standstill)
				this.slow = function (object, decelleration) {
					if (!(object.vector[0] == 0 && object.vector[1] == 0)) {
					
						var objVectorSpeed = Math.sqrt(Math.pow(object.vector[0], 2) + Math.pow(object.vector[1], 2)); 
						var newSpeed = objVectorSpeed - decelleration; // Slow down
							
						var newVector = [];
						
						if (newSpeed < 0) {
							newVector = [0, 0];
						} else {
							newVector = this.changeVectorSpeed(object.vector, newSpeed);	
						}
						
						object.vector = newVector;
					}
				}
				
				// Recalculates a vector with a new speed while keeping its direction
				this.changeVectorSpeed = function (vector, speed) {
					var vX = vector[0];
							vY = vector[1];
							newVector = [];
					
					var sum = Math.pow(vX, 2) + Math.pow(vY, 2);
					var xPercent = Math.pow(vX,2) / sum;
					var yPercent = Math.pow(vY,2) / sum;
					
					newVector[0] = Math.sqrt(Math.pow(speed, 2) * xPercent) * Math.sign(vX);
					newVector[1] = Math.sqrt(Math.pow(speed, 2) * yPercent) * Math.sign(vY);	
					
					return newVector;
				}
				
				// Applies gravitational effect to objects that allow it
				this.addGravity = function (obj, g) {
					if (obj.gravity) {
						this.applyForce(obj, [0, g]);
					}
				}
				
				this.collisionCorrection = function (movingObj) {
				// Checks if an object collides with any other and stops it, corrects movement vector
					if (movingObj.collision && !(movingObj.vector[0] == 0 && movingObj.vector[1] == 0)) {
						
						var objectList = utility.gamespace.findObjectsInMovementRadius(movingObj); // Optimization. Only check objects within range of movingObj.vector
						var collision = physics.collisionDetection(movingObj, objectList);
						
						// If collision, cancel all forward momentum, but keep side momentum
						if (collision[0]) {	
							movingObj.placeAt(collision[1][0], collision[1][1]);
							if (collision[4] == "left" || collision[4] == "right") {
								movingObj.vector = [0, movingObj.vector[1]];
							} else {
								movingObj.vector = [movingObj.vector[0], 0];
							}
							this.collisionCorrection(movingObj); // Again to see if new vector now collides with something else	
						}
					}
				}
				
				this.collisionDetection = function (movingObj, objectList) {
				// Pre-emtptive collision detection based on intersecting vectors from linear algebra
				// Applies the movement vector of a moving object to every corner and checks if a side from another object is crossed 
				
					var x = utility.gamespace.getObjectivePosition(movingObj)[0];
					var y = utility.gamespace.getObjectivePosition(movingObj)[1];
					var mCorners = [[x, y], [x + movingObj.width, y], [x + movingObj.width, y + movingObj.height], [x, y + movingObj.height]];		// Top-Left, Top-Right, Bottom-Right, Bottom-Left
					var result = false, 									// Whether there's been a collision
							collisionPoint = [],							// Coordinates of nearest collision
							collisionPosition = [],						// Coordinates of movObj at collision
							collidingObj = "",								// What object is hit
							collisionCorner = "",							// Which corner hit
							collisionSide = "",								// What side is hit
							collisionDistance = 0;						// To compare which corner hits first
					
					// Loop throuh every candidate for a collision
					for (obj of objectList) {
						var objX = utility.gamespace.getObjectivePosition(obj)[0];
						var objY = utility.gamespace.getObjectivePosition(obj)[1];						
						var objCorners = [[objX, objY], [objX + obj.width, objY], [objX + obj.width, objY + obj.height], [objX, objY + obj.height]];
						
						// Loop through every cornerVector-side-combination (16 total per object checked)
						for (var i = 0; i < mCorners.length; i++) {
							for (var j = 0; j < objCorners.length; j++) {
								var mCorner1 = mCorners[i];
								var mCorner2 = [mCorners[i][0] + movingObj.vector[0], mCorners[i][1] + movingObj.vector[1]] // Corner + movement vector
								
								var objCorner1 = objCorners[j];
								var objCorner2 = (j == objCorners.length-1) ? objCorners[0] : objCorners[j+1];	// Take next corner in row
								
								// Find intersecting point between lines
								var intersection = utility.geo.findLinesIntersection(mCorner1, mCorner2, objCorner1, objCorner2),
										check1 = [false],
										check2 = [false],
										check3 = [false];
								
								if (intersection.length > 0) {	// If not parallel
									check1 = utility.geo.isPointOnSegment(mCorner1, mCorner2, intersection); 			// Point not just on infinitely long line, but also on segment?
									check2 = utility.geo.isPointOnSegment(objCorner1, objCorner2, intersection);
								}
								
								// Check for extra case: No corner hits, only side
								// If corner of movingObj "passes" object, check if other corner parallel to obj-side also passes on the other side. If so, only side will hit obj
								if (check1[0] && !check2[0]) {									 	
									var iPlusTwo = (i+2 <= 3) ? i+2 : i-2;		// Check opposing walls
									if (iPlusTwo == j) {
										var jPlusOne = (j+1 <= 3) ? j+1 : j-3;
												oStart = objCorners[jPlusOne];		// oStart and oEnd switched around as opposing walls always have opposing coordinates (top left, top right, bottom right, bottom left)
												oEnd = objCorners[j];							// This way, impact1 and oStart as well as impact2 and oEnd correspond to each other
												impact1 = intersection;						// impact1 & impact2 are where relevant corners "hit" the line of an object side
												impact2 = [];
												
										if (i == 0) {
											impact2 = [impact1[0] + movingObj.width, impact1[1]];
										} else if (i == 1) {
											impact2 = [impact1[0], impact1[1] + movingObj.height];
										} else if (i == 2) {
											impact2 = [impact1[0] - movingObj.width, impact1[1]];
										} else if (i == 3) {
											impact2 = [impact1[0], impact1[1] - movingObj.height];
										}
										
										var result1 = utility.geo.isPointOnSegment(oStart, oEnd, impact1);
												result2 = utility.geo.isPointOnSegment(oStart, oEnd, impact2);
												
										if ((result1[1] < 0 && result2[1] > 1) || (result1[1] > 1 && result2[1] < 0)) { // If one corner misses the object on one side and the other corner on the other side -> hit with side
											check3[0] = true;
										}
									}  
								}
								
								// DING DING DING!
								// If collision point is on both segments, or hit with side == Collision within next frame!
								if ((check1[0] && check2[0]) || check3[0]) {
									var colVector = [intersection[0]-mCorner1[0], intersection[1]-mCorner1[1]];
									var colDistance = Math.sqrt(Math.pow(colVector[0],2) + Math.pow(colVector[1],2));
									
									// Take the nearest collision
									if (colDistance < collisionDistance || collisionDistance == 0) {
										var current = {};
										current.collision = true;
										current.collisionDistance = colDistance;
										current.collisionPoint = intersection;
										current.collidingObj = obj.id;
										var offset = 0.1; 		// Intentionally put a minimal space between movingObj and obj to prevent errors
										
										if (i == 0) { 
											current.collisionCorner = "top left";
											current.collisionPosition = intersection;
										} else if (i == 1) {
											current.collisionCorner = "top right";
											current.collisionPosition = [intersection[0] - movingObj.width, intersection[1]];
										}	else if (i == 2) {
											current.collisionCorner = "bottom right";
											current.collisionPosition = [intersection[0] - movingObj.width, intersection[1] - movingObj.height];
										} else if (i == 3) {
											current.collisionCorner = "bottom left";
											current.collisionPosition = [intersection[0], intersection[1] - movingObj.height];
										}	
										if (j == 0) {
											current.collisionSide = "top";
											current.collisionPosition[1] -= offset;
										} else if (j == 1) {
											current.collisionSide = "right";
											current.collisionPosition[0] += offset;
										} else if (j == 2) {
											current.collisionSide = "bottom";
											current.collisionPosition[1] += offset;
										} else if (j == 3) {
											current.collisionSide = "left";
											current.collisionPosition[0] -= offset;
										}
										
										// Save collision. Only record "jumpThrough"-collision when falling on top side
										if (!obj.jumpThrough || (obj.jumpThrough && movingObj.vector[1] > 0 && current.collisionSide == "top" && (current.collisionCorner == "bottom left" || current.collisionCorner == "bottom right"))) {
											result = current.collision;
											collisionDistance = current.collisionDistance;
											collisionPoint = current.collisionPoint;
											collisionPosition = current.collisionPosition;
											collidingObj = current.collidingObj;
											collisionCorner = current.collisionCorner;
											collisionSide = current.collisionSide;
										} 
									}										
								}
							}
						}						
					}
					return [result, collisionPosition, collidingObj, collisionCorner, collisionSide];
				}
			}
			
			
			// Several utility functions that have no real place elsewhere
			function Utility () {
				
				this.geo = {};
				this.gamespace = {};
				this.math = {};
				
				this.geo.isPointOnSegment = function (segmentStart, segmentEnd, targetPoint) {
				// This function is only meant for points that are already confirmed to be on a line, and need further confirmation to be on a segment of that line (only tests x-coordinate for performance)
				// Refer to: http://rechen-fuchs.de/lagebeziehung-punkt-strecke/
				// You set up a line equation s*r + t, where r=0 is segmentStart and r=1 is segmentEnd, then equate with point and see if r is between 0 and 1
					var sStart = [utility.math.truncate(segmentStart[0]), utility.math.truncate(segmentStart[1])];
					var sEnd = [utility.math.truncate(segmentEnd[0]), utility.math.truncate(segmentEnd[1])];
					var point = [utility.math.truncate(targetPoint[0]), utility.math.truncate(targetPoint[1])];
					
					// Calculate distance of intersection to line. If not 0 -> besides line. This can be used to give a bit of tolerance (or not) for rounding errors
					// var distance = this.distancePointToLine(sStart, sEnd, point);			
					
					var s = sEnd[0] - sStart[0];
					var t = sStart[0];
					var result = 0;
					
					if (s != 0) {
						if (Math.sign(t)) {
							t = point[0] - t; 
						} else {
							t = point[0] + t;
						}
					} else {
						s = sEnd[1] - sStart[1];
						t = sStart[1];
						if (Math.sign(t)) {
							t = point[1] - t; 
						} else {
							t = point[1] + t;
						}
					}
					
					result = t/s;
					
					if (result >= 0 && result <= 1) {
						return [true, result];
					} else {
						return [false, result];
					}	
				}				
				
				this.geo.findLinesIntersection = function (point1, point2, point3, point4) {
					// Technique from: https://www.c-plusplus.net/forum/258648-full
					// Basically, you put the two lines in 3D at z=1, calculate their layers with the origin point, calculate the intersection line of those two layers, 
					// and look where that intersection line points at z=1. Thats the 2D intersection point of the lines.
					
					var p1 = [point1[0],point1[1], 1];
					var p2 = [point2[0],point2[1], 1];
					var p3 = [point3[0],point3[1], 1];
					var p4 = [point4[0],point4[1], 1];
					
					var line1 = this.scalar(p1, p2);
					var line2 = this.scalar(p3, p4);
					var intersection = this.scalar(line1, line2);
					
					// Parallel lines
					if (intersection[2] == 0) {
						return [];
					}
					
					// z no longer 1. Scale numbers back to when z = 1
					var finalPoint = [];
					finalPoint[0] = intersection[0] / intersection[2];
					finalPoint[1] = intersection[1] / intersection[2];
					
					return finalPoint;
				}
				
				this.geo.distancePointToLine = function (line1, line2, point1) {
				// Returns the distance of a point to a line
				// Refer to: http://www.mathematik-oberstufe.de/vektoren/a/abstand-punkt-gerade-formel.html
					var lineStart = [line1[0], line1[1], 1];
					var lineEnd = [line2[0], line2[1], 1];
					var point = [point1[0], point1[1], 1];
					
					var startToPoint = [point[0]-lineStart[0], point[1]-lineStart[1], point[2]-lineStart[2]];
					var startToEnd = [lineEnd[0]-lineStart[0], lineEnd[1]-lineStart[1], lineEnd[2]-lineStart[2]];
					var scalarResult = this.scalar(startToPoint, startToEnd);
					
					var distance = Math.sqrt(Math.pow(scalarResult[0],2) + Math.pow(scalarResult[1],2) + Math.pow(scalarResult[2],2)) / Math.sqrt(Math.pow(startToEnd[0],2) + Math.pow(startToEnd[1],2) + Math.pow(startToEnd[2],2));
					
					return distance;
				}
				
				this.geo.scalar = function (v1, v2) {
					var newVector = [];
					
					newVector[0] = v1[1] * v2[2] - v1[2] * v2[1];
					newVector[1] = v1[2] * v2[0] - v1[0] * v2[2];
					newVector[2] = v1[0] * v2[1] - v1[1] * v2[0];
					
					return newVector;
				}
				
				this.gamespace.getObjectivePosition = function (obj) {
				// Returns objective "gamespace" position of nested objects (regardless of relative positioning)
					result = [obj.xPos, obj.yPos];
					
					var objContainer = obj.parent;
					while (objContainer.id != "gamespace") {
						result[0] += objContainer.xPos;
						result[1] += objContainer.yPos;
						objContainer = objContainer.parent;
					}
					return result;
				}
				
				this.gamespace.findObjectsInMovementRadius = function (movingObj) {
				// Returns array of objects that are in circular reach of movingObj.vector
				// Take middle point of objects, measure distance to movingObj (add cornerDistance from middle for tolerance), compare to speed of movingObj
				// and determine which ones could be hit within next frame
					var foundObjects = [];
							originPoint = [this.getObjectivePosition(movingObj)[0] + movingObj.width/2, this.getObjectivePosition(movingObj)[1] + movingObj.height/2];
							movCornerDistance = Math.sqrt(Math.pow(movingObj.width/2, 2) + Math.pow(movingObj.height/2, 2));
							reach = Math.sqrt(Math.pow(movingObj.vector[0], 2) + Math.pow(movingObj.vector[1], 2)) + movCornerDistance;
					
					gs.loopAllObjects(function(obj) {
						if (obj.id !== movingObj.id && obj.collision) {
							var objMiddle = [utility.gamespace.getObjectivePosition(obj)[0] + obj.width/2, utility.gamespace.getObjectivePosition(obj)[1] + obj.height/2];
							var objcornerDistance = Math.sqrt(Math.pow(obj.width/2, 2) + Math.pow(obj.height/2, 2));
							
							var distanceVector = [objMiddle[0] - originPoint[0], objMiddle[1] - originPoint[1]];
							var distance = Math.sqrt(Math.pow(distanceVector[0], 2) + Math.pow(distanceVector[1], 2)) - objcornerDistance ;
							
							if (distance <= reach) {
								foundObjects.push(obj);
							}
						}
					});
					return foundObjects;
				}
				
				this.math.truncate = function (number) {
				// Returns truncated number with max. 5 decimals (not rounded)
					var num = number;
					if (number < 0) {
						num = Math.abs(number);
					}
					
					var result = Math.floor(num*100000)/100000;
					
					if (number < 0) {
						result *= -1;
					}
					
					return result;
				}
			}
			
			// User-Input
			function UI () {
				var that = this;	
				
				this.update = function() {
					this.camera.update();
					this.evalKeyInput();
				}
				
				// All pressed keys are dynamically stored in object
				var activeKeys = {};
				$(document).keydown(function (e) {
				    activeKeys[e.which] = true;
				    keyChanged();
				});
				$(document).keyup(function (e) {
				    delete activeKeys[e.which];
				    keyChanged();
				});
				
				var queue = {};
				queue.jump = false;
				
				var keyChanged = function () {
					
					if (activeKeys[68]) { // Right
						gs.children.player.controlDirection = [gs.children.player.speed, 0];
					}
					if (activeKeys[65]) { // Left
						gs.children.player.controlDirection = [-gs.children.player.speed, 0];
					}
					if (activeKeys[87]) { // Up
						gs.children.player.controlDirection = [0, -gs.children.player.speed];
					}
					if (activeKeys[83]) { // Down
						gs.children.player.controlDirection = [0, gs.children.player.speed];
					}
					// Satz des Pythagoras, Seiten sind nicht genau 1/2 speed
					var cathetus = Math.sqrt(Math.pow(gs.children.player.speed, 2) / 2);
					if (activeKeys[68] &&activeKeys[87]) { // Right-up
						gs.children.player.controlDirection = [cathetus, -cathetus];
					}
					if (activeKeys[68] && activeKeys[83]) { // Right-down
						gs.children.player.controlDirection = [cathetus, cathetus];
					}
					if (activeKeys[65] && activeKeys[87]) { // Left-up
						gs.children.player.controlDirection = [-cathetus, -cathetus];
					}
					if (activeKeys[65] && activeKeys[83]) { // Left-down
						gs.children.player.controlDirection = [-cathetus, cathetus];
					}
					if ($.isEmptyObject(activeKeys)) {
						gs.children.player.controlDirection = [0,0];
					}
					
					if (activeKeys[32]) { // Space 
						queue.jump = true;
					}
					
					if (activeKeys[80]) { // P
						engine.toggleMainLoop();
					}
				}				
				
				// Player controls, called in main loop
				this.evalKeyInput = function () {
					if (gs.children.player) { // Player controls
						// Acceleration 
						if (gs.children.player.onGround) {
							physics.applyForce(gs.children.player, [gs.children.player.controlDirection[0], gs.children.player.controlDirection[1]]);
						} else {	// Acceleration reduced when in air
							physics.applyForce(gs.children.player, [gs.children.player.controlDirection[0]/2, gs.children.player.controlDirection[1]/2]);
						}
						// Ground friction
						if (gs.children.player.onGround && gs.children.player.controlDirection[0] == 0 && gs.children.player.controlDirection[1] == 0) {
							physics.slow(gs.children.player, 0.4);
						} else if (gs.children.player.onGround) { // Friction reduced when moving
							physics.slow(gs.children.player, 0.1);
						}
						// Jump
						if (queue.jump) {
							queue.jump = false;
							gs.children.player.jump(); // Note: Player tends not jump as high moving fast as he does standing b/c of maxSpeed 
						}
						
					}
				}	
				
				// Camera object for player
				this.camera = new function () {
					var trackedObject = "none";
					var cameraWidth = $("#camera").width();
					var cameraHeight = $("#camera").height();
					var xCorrect = 0; 
					var yCorrect = 0;
					
					
					this.initialize = function (tObject) {
						trackedObject = tObject;	
						xCorrect = cameraWidth/2 - trackedObject.width/2;
						yCorrect = cameraHeight/2 - trackedObject.height/2 + 100; // Extra value at the end to adjust player position on the screen, somewhat lower than middle
					}
					
					this.update = function() {
						if (trackedObject != "none") {							
							$("#camera #gamespace").css("top", (parseInt($("#" + trackedObject.id).css("top"))*-1) + yCorrect );
							$("#camera #gamespace").css("left", (parseInt($("#" + trackedObject.id).css("left"))*-1) + xCorrect );
						}	
					}
				}				
			}
			
			function GameLogic() {
				
				this.check = function () {
					if (gs.children.player) {
						if (Math.abs(gs.children.player.yPos) > gs.children.tower.currentHeight-200) {
							gs.children.tower.addSegment();
						}
					}
				}			
			}
			
			// 2. Objects to put in the gamespace
			// ---------------------------------------------------------------
			
			// The most general class of an object existing in the gamespace
			function GameObject(id, x, y, width, height, color) {
				this.id = id;
				this.xPos = x;
				this.yPos = y;
				this.width = width;
				this.height = height;
				this.color = color;
				this.vector = [0, 0];
				this.gravity = false;
				this.parent = {};
				this.children = {};
			}
			
			// Draws the object into the html markup
			GameObject.prototype.draw = function(destination, newClass) {
				$("#" + destination).append("<div id="+ this.id +" class='object'></div>") 
				if (newClass != "") {
					$("#" + this.id).addClass(newClass);
				}
				$("#" + this.id).css("left", this.xPos);
				$("#" + this.id).css("top", this.yPos);
				$("#" + this.id).width(this.width);
				$("#" + this.id).height(this.height);
				$("#" + this.id).css("background-color", this.color);
			}
			
			// Initializes children objects. Place gs.add-functions here
			GameObject.prototype.initChildren = function () {
			}
			
			// Teleports object to position x, y
			GameObject.prototype.placeAt = function(x, y) {
				this.xPos = x;
				this.yPos = y;
				
				$("#" + this.id).css("left", x);
				$("#" + this.id).css("top", y);
			}
			// Moves object by vector x, y.
			GameObject.prototype.move = function(vector) {
				if (!(vector[0] == 0 && vector[1] == 0)) {							
					
					this.vector = vector;
					this.xPos = this.xPos + vector[0];
					this.yPos = this.yPos + vector[1];
						
					$("#" + this.id).css("left", this.xPos);
					$("#" + this.id).css("top", this.yPos);
				}
			}
			
			// Subclass of GameObject. Describes an inanimate object in the game
			function Rectangle(id, x, y, width, height, color, collision, jumpThrough) {
				GameObject.call(this, id, x, y, width, height, color);
				
				if (collision == undefined || collision == true) {
					this.collision = true;
				} else {
					this.collision = false;
				}
				
				if (jumpThrough == undefined || jumpThrough == false) {
					this.jumpThrough = false;
				} else {
					this.jumpThrough = true;
				}

			}
			Rectangle.prototype = new GameObject();
			Rectangle.prototype.constructor = Rectangle;
			
			// Subclass of GameObject. Describes the player
			function Player (id, x, y) {
				GameObject.call(this, id, x, y);
				this.width = 50;
				this.height = 50;
				this.color = "red";
				this.gravity = true;
				this.collision = true;
				this.onGround = false;
				this.controlDirection = [0, 0];		
				this.speed = 0.5;	
				this.maxSpeed = 0;	
				
			}
			Player.prototype = new GameObject();
			Player.prototype.constructor = Player;
			
			Player.prototype.move = function(vector) {
				if (!(vector[0] == 0 && vector[1] == 0)) {							
					
					this.vector = vector;
					this.xPos = this.xPos + vector[0];
					this.yPos = this.yPos + vector[1];
						
					$("#" + this.id).css("left", this.xPos);
					$("#" + this.id).css("top", this.yPos);					
				}
				// Is player on ground?
				if (vector[1] != 0) {
					this.onGround = false;
				} else {
					this.onGround = true;
				}
			}
			
			Player.prototype.jump = function() {
				if (this.onGround) {
					physics.applyForce(this, [0, -25]);
				}
			}
			
			// Subclass of GameObject. Describes the tower background
			function Tower (id, x, y, width, height) {
				GameObject.call(this, id, x, y, width, height);
				this.color = "beige";
				this.collision = false;	
				this.currentHeight = 0;
				this.segmentHeight = 1500;
				this.segmentCount = 1;
				this.platformDistance = 150;
				this.platformWidth = 400;
				this.platformCount = 0;
			}
			Tower.prototype = new GameObject();
			Tower.prototype.constructor = Tower;
			
			Tower.prototype.initChildren = function () {				
				// Add ground and first segment
				gs.add(Rectangle, "tower", ["ground", 0, this.height, this.width, 50, "gray"]);
				this.addSegment();
			}
			
			Tower.prototype.addSegment = function() {	
				var segmentName = "towerSegment_" + this.segmentCount++;
				gs.add(Rectangle, "tower", [segmentName, 0, -this.currentHeight-this.segmentHeight, this.width, this.segmentHeight, "white", false], "towerSegment");
				gs.add(Rectangle, segmentName, [segmentName + "_leftWall", 0, 0, 50, this.segmentHeight, "gray"], "towerLeftWall");
				gs.add(Rectangle, segmentName, [segmentName + "_rightWall", this.width-50, 0, 50, this.segmentHeight, "gray"], "towerRightWall");
				this.currentHeight += this.segmentHeight;
				this.fillWithPlatforms(segmentName);
			}
			
			Tower.prototype.fillWithPlatforms = function(segmentName) {
				var platformHeight = this.segmentHeight - this.platformDistance;
				
				while (platformHeight >= 0) {
					var xPosition = Math.floor(Math.random()*(this.width - this.platformWidth - 100)) + 50; // -100 + 50 b/c of 50px wall thickness
					gs.add(Rectangle, segmentName, ["platform_" + this.platformCount++, xPosition, platformHeight, 400, 30, "orange", true, true], "platform");
					platformHeight -= this.platformDistance;
				}
			}
			
			
			// 3. Executing functions
			// ---------------------------------------------------------------
			var gs = new GameSpace();
			var engine = new Engine();
			var physics = new Physics();
			var utility = new Utility();
			var ui = new UI();
			var logic = new GameLogic();
			engine.startMainLoop();
			
			gs.add(Tower, "none", ["tower", 0, 0, 1200, 0]);		
			gs.add(Player, "none", ["player", 600, -850]);
			
			ui.camera.initialize(gs.children.player);
			
			console.log(gs);
		}
	}
});






/* Old functions that are no longer needed: 
-------------------------------------------------------------------------------------------------------------------------------------------------------------------


// Priori collision prevention. Stops object from going through other objects and corrects vector (sidewards momentum preserved).
// Param passThrough to determine, if player should be able to jump through platforms from below

this.collisionCorrectionOLD = function (movingObj) {
	if (movingObj.collision && !(movingObj.vector[0] == 0 && movingObj.vector[1] == 0)) {
		var newXPos = movingObj.xPos + movingObj.vector[0];
		var newYPos = movingObj.yPos + movingObj.vector[1];
		var testVector = movingObj.vector;
		
		physics.collisionDetectionNEW(movingObj);
		
		var collision = physics.collisionDetectionOLD(movingObj, newXPos, newYPos, true);
		var side = collision[1];
		
		// Finding out the crash coords: If new Coords within other object, recursively shorten movement vector by speedDecrement until it fits just so
		while (collision[0]) {
			var speed = Math.sqrt(Math.pow(testVector[0],2) + Math.pow(testVector[1],2));
			var speedDecrement = 0.5;
			var slowerSpeed = speed - speedDecrement;
			if (slowerSpeed < 0) {
				slowerSpeed = 0;
			}

			testVector = physics.changeVectorSpeed(testVector, slowerSpeed);	

			newXPos = movingObj.xPos + testVector[0];
			newYPos = movingObj.yPos + testVector[1];
			
			side = collision[1]; // Gets updated every time. Last value most accurate as its closest to the border that was hit.
			collision = physics.collisionDetectionOLD(movingObj, newXPos, newYPos, true);
		}
		
		// If collision, cancel all forward momentum, but keep side momentum
		if (side != "none") {
			movingObj.placeAt(newXPos, newYPos);
			if (side == "left" || side == "right") {
				movingObj.vector = [0, movingObj.vector[1]];
			} else {
				movingObj.vector = [movingObj.vector[0], 0];
			}
			this.collisionCorrectionOLD(movingObj); // Do another check to see if the new vector interferes with a second object sideways (in a corner)
		}
	}
}

// Utility: Checks if an object overlaps with any other object, params newX, newY, checkSide optional
// Returns bool collision and the side the intruding object has most likely hit
this.collisionDetectionOLD = function (movingObj, newX, newY, checkSide) {
	var checkSide = checkSide || false;
	var x = newX || movingObj.xPos;
	var y = newY || movingObj.yPos;
	var result = [false, "none"]; // [collision, side]
	
	// Get objective position in gamespace
	var container = movingObj.parent;
	while (container.id != "gamespace") {
		x += container.xPos;
		y += container.yPos;
		container = container.parent;
	}
	
	var mLeft = x;
			mRight = x + movingObj.width;
			mTop = y;
			mBottom = y + movingObj.height;
	
	gs.loopAllObjects(function(obj) {
		if (obj.collision && obj.id != movingObj.id) {
			
			var objX = obj.xPos;
			var objY = obj.yPos;
			
			// Get objective position in gamespace
			var objContainer = obj.parent;
			while (objContainer.id != "gamespace") {
				objX += objContainer.xPos;
				objY += objContainer.yPos;
				objContainer = objContainer.parent;
			}
			
			var objLeft = objX;
					objRight = objX + obj.width;
					objTop = objY;
					objBottom = objY + obj.height;
							
			if (!((mRight <= objLeft && mLeft <= objLeft) || (mLeft >= objRight && mRight >= objRight))) {
				if (!((mTop <= objTop && mBottom <= objTop) || (mTop >= objBottom && mBottom >= objBottom))) {
					
					// Collision detected!
					result[0] = true;	
					
					if (checkSide) {
						// Now to find out which side was hit
						var cornersInObject = [];
								attackPoint = [];
								heights = [];
								result[1] = "left";
						
						// Which corners from movObj are in obj?										
						if (mLeft > objLeft && mLeft < objRight && mTop > objTop && mTop < objBottom)
							cornersInObject.push([mLeft, mTop]); // Top-Left Corner
						if (mRight > objLeft && mRight < objRight && mTop > objTop && mTop < objBottom)
							cornersInObject.push([mRight, mTop]); // Top-Right Corner
						if (mLeft > objLeft && mLeft < objRight && mBottom > objTop && mBottom < objBottom)
							cornersInObject.push([mLeft, mBottom]); // Bottom-Left Corner
						if (mRight > objLeft && mRight < objRight && mBottom > objTop && mBottom < objBottom)
							cornersInObject.push([mRight, mBottom]); // Bottom-Right Corner
							
							 // No Corners - movingObj has only touched with side. Take corners from passive Object instead 
							if (cornersInObject.length == 0) {
								if (objLeft > mLeft && objLeft < mRight && objTop > mTop && objTop < mBottom)
									cornersInObject.push([objLeft, objTop]); // Top-Left Corner
								if (objRight > mLeft && objRight < mRight && objTop > mTop && objTop < mBottom)
									cornersInObject.push([objRight, objTop]); // Top-Right Corner
								if (objLeft > mLeft && objLeft < mRight && objBottom > mTop && objBottom < mBottom)
									cornersInObject.push([objLeft, objBottom]); // Bottom-Left Corner
								if (objRight > mLeft && objRight < mRight && objBottom > mTop && objBottom < mBottom)
									cornersInObject.push([objRight, objBottom]); // Bottom-Right Corner	
							}

						// If two corners, take middle point
						if (cornersInObject.length > 1) {
							attackPoint[0] = (cornersInObject[0][0] + cornersInObject[1][0]) / 2;
							attackPoint[1] = (cornersInObject[0][1] + cornersInObject[1][1]) / 2;
						} else if (cornersInObject.length == 1) {
							attackPoint = cornersInObject[0];
						} else if (cornersInObject.length == 0) { // No corners in either object -> both objects touching only with sides (like a cross). Just take center of movingObj at that point
							attackPoint = [mLeft + ((mRight-mLeft)/2), mTop + ((mBottom-mTop)/2)];
						}
						
						// Distance from corner/middlepoint to border
						heights[0] = Math.abs(attackPoint[0] - objLeft);		// Left
						heights[1] = Math.abs(attackPoint[0] - objRight);		// Right
						heights[2] = Math.abs(attackPoint[1] - objTop);			// Top	
						heights[3] = Math.abs(attackPoint[1] - objBottom); 	// Bottom
						
						// Smallest height/distance wins. Corresponding side most likely side to be hit
						// Accuracy not 100%. Depends on tick rate. 
						if (heights[1] < heights[0]) {
							result[1] = "right";
							heights[0] = heights[1];
						}
						if (heights[2] < heights[0]) {
							result[1] = "top";
							heights[0] = heights[2];
						}
						if (heights[3] < heights[0]) {
							result[1] = "bottom";
						}
					}
														
					// If obj.jumpThrough, ignore all collisions that are not coming from top
					// Extra check to confirm that "top"-collision was indeed triggered by movingObj falling through objTop, not just by being near objTop (and inside obj)
					if (obj.jumpThrough && newX && newY) {
						if (!(result[1] == "top" && ((mBottom - movingObj.vector[1]) <= objTop) && (mBottom > objTop))) {
							result = [false, "none"];
						}
					}									
				}
	    }
  	}
	});
	return result;
}

*/