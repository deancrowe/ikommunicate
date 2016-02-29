var svgNS = "http://www.w3.org/2000/svg";
var _compassNode = null;
var _lastTrueHeadingUpdateTick = 0;
var _lastMagneticHeadingUpdateTick = 0;
var _lastHeadingVariationUpdateTick = 0;
var _lastHeadingVariation = 0;
var _lastMagneticHeading = 0;
var _lastCOGUpdateTick = 0;
var _lastPositionUpdateTick = 0;
var _lastSOGUpdateTick = 0;
var _lastWindAngleTrueUpdateTick = 0;
var _lastWindSpeedUpdateTick = 0;
var _ipaddr = "0.0.0.0"
var _mmsi = "555555555";
var _lastWebsocketDataTick = 0;
var _webSocketOpened = false;

function addCompassTicks(querySelector, compassStartY, degreeStep) {
	// Add the ticks
	var ticksGroup = _compassNode.querySelector(querySelector);
	for (degrees = 0; degrees < 360; degrees += degreeStep) {
		var tick = document.createElementNS(svgNS, "line");
		tick.setAttributeNS(null, "x1", 0);
		tick.setAttributeNS(null, "y1", compassStartY);
		tick.setAttributeNS(null, "x2", 0);
		
		if (degrees % 5 == 0) {
			if (degrees % 10 == 0) {
				tickLength = 4;
			}
			else {
				tickLength = 2.5;
			}
		}
		else {
			tickLength = 1.5;
		}
		
		tick.setAttributeNS(null, "y2", compassStartY - tickLength);
		tick.setAttributeNS(null, "stroke-width", 0.15);
		tick.setAttributeNS(null, "transform", "rotate("+degrees+")");
		
		ticksGroup.appendChild(tick);
	}	
}

function addStar(querySelector, yPosition) {
	
	var parent = _compassNode.querySelector(querySelector);
	
	var rotateIncrement = 360 / 5;
	
	for (count = 0; count < 5; ++count) {
		var p = document.createElementNS(svgNS, "polygon");
		p.setAttributeNS(null, "points", "0, 0, 0, 3, 0.75, 0.75, 0, 0");
		p.setAttributeNS(null, "stroke-width", 0.1);
		p.setAttributeNS(null, "transform", "rotate("+ (180 + (rotateIncrement * count))+")");
		parent.appendChild(p);
	
		p = document.createElementNS(svgNS, "polygon");
		p.setAttributeNS(null, "points", "0, 0, 0, 3, -0.75, 0.75, 0, 0");
		p.setAttributeNS(null, "fill", "white");
		p.setAttributeNS(null, "stroke-width", 0.1);
		p.setAttributeNS(null, "transform", "rotate("+ (180 + (rotateIncrement * count))+")");
		parent.appendChild(p);
	}
	
	parent.setAttributeNS(null, "transform", "translate(0, "+yPosition+")");
}

function addCompassPoints(querySelector, compassStartY) {
	// Add the points
	var ticksGroup = _compassNode.querySelector(querySelector);
	for (degrees = 0; degrees < 360; degrees += 2.8125) {
		var tick = document.createElementNS(svgNS, "line");
		tick.setAttributeNS(null, "x1", 0);
		tick.setAttributeNS(null, "y1", compassStartY);
		tick.setAttributeNS(null, "x2", 0);
		
		if (degrees % 5 == 0) {
			if (degrees % 10 == 0) {
				tickLength = 10;
			}
			else {
				tickLength = 5;
			}
		}
		else {
			if (degrees % 11.25 == 0) {
				tickLength = 2.0;
			}
			else if (degrees % 5.625 == 0) {
				tickLength = 1.5;
			}
			else {
				tickLength = 0.75;
			}
		}
		
		tick.setAttributeNS(null, "y2", compassStartY + tickLength);
		tick.setAttributeNS(null, "stroke-width", 0.15);
		tick.setAttributeNS(null, "transform", "rotate("+degrees+")");
		
		ticksGroup.appendChild(tick);
	}	
}

function addDegreeLabels(querySelector, compassStartY, interval, fontSizeSmall, fontSizeLarge) {
	// Add the degree labels every ten degrees
	var degreeLabelsGroup = _compassNode.querySelector(querySelector);
	for (degrees = 0; degrees < 360; degrees += interval) {
		var degreeLabel = document.createElementNS(svgNS, "text");
		degreeLabel.setAttributeNS(null, "x", 0);
		degreeLabel.setAttributeNS(null, "y", compassStartY - 6);
		degreeLabel.setAttributeNS(null, "text-anchor", "middle");
		degreeLabel.setAttributeNS(null, "font-size", fontSizeSmall);
		degreeLabel.setAttributeNS(null, "stroke-width", "0.01");
	
		if (degrees == 0 || degrees == 90 || degrees == 180 || degrees == 270) {
			degreeLabel.setAttributeNS(null, "font-weight", "bold");
			degreeLabel.setAttributeNS(null, "font-size", fontSizeLarge);
		}
	
		degreeLabel.setAttributeNS(null, "style", "dominant-baseline: central;");
		degreeLabel.setAttributeNS(null, "transform", "rotate("+degrees+")");
		degreeLabel.innerHTML = degrees;
	
		degreeLabelsGroup.appendChild(degreeLabel);
	}	
}

function addCardinalTicks(querySelector, compassStartY, tickLength, tickLength0) {
	var ticksGroup = _compassNode.querySelector(querySelector);
	for (degrees = 0; degrees < 360; degrees += 90) {
		var tick = document.createElementNS(svgNS, "line");
		tick.setAttributeNS(null, "x1", 0);
		tick.setAttributeNS(null, "y1", compassStartY);
		tick.setAttributeNS(null, "x2", 0);
		
		var tickLengthActual = (degrees == 0 ? tickLength0 : tickLength);
		tick.setAttributeNS(null, "y2", compassStartY - tickLengthActual);
		tick.setAttributeNS(null, "stroke-width", 0.15);
		tick.setAttributeNS(null, "transform", "rotate("+degrees+")");
		
		ticksGroup.appendChild(tick);		
	}	
}

function checkForNonrespondingGuages() {
	var nowTick = Date.now();
	var needLubber = false;
	
	if (nowTick - _lastTrueHeadingUpdateTick > 5000 &&
		nowTick - _lastHeadingVariationUpdateTick > 5000 &&
		nowTick - _lastMagneticHeadingUpdateTick > 5000) {
			
		var compass = _compassNode.querySelector("#trueCompass");
		compass.setAttributeNS(null, "stroke", "lightgray");
		compass.setAttributeNS(null, "fill", "lightgray");

		var compassText = _compassNode.querySelector("#trueLabel");
		compassText.setAttributeNS(null, "stroke", "lightgray");
		compassText.setAttributeNS(null, "fill", "lightgray");
	}
	else {
		needLubber = true;
	}
	
    if (nowTick - _lastHeadingVariationUpdateTick > 5000) {
        var variationLabel = _compassNode.querySelector("#variationLabel");
        variationLabel.setAttributeNS(null, "stroke", "lightgray");
        variationLabel.setAttributeNS(null, "fill", "lightgray");
    }

	if (nowTick - _lastMagneticHeadingUpdateTick > 5000) {
		var compass = _compassNode.querySelector("#magneticCompass");
		compass.setAttributeNS(null, "stroke", "lightgray");
		compass.setAttributeNS(null, "fill", "lightgray");
		
		var compassText = _compassNode.querySelector("#magneticLabel");
		compassText.setAttributeNS(null, "stroke", "lightgray");
		compassText.setAttributeNS(null, "fill", "lightgray");
	}
	else {
		needLubber = true;
	}
	
	if (needLubber == false) {
		var lubber = _compassNode.querySelector("#lubberLine");
		lubber.setAttributeNS(null, "stroke", "lightgray");
	}
	
	if (nowTick - _lastCOGUpdateTick > 5000) {
		var cogElement = _compassNode.querySelector("#cog");
		cog.setAttributeNS(null, "visibility", "hidden");

        var cogLabel = _compassNode.querySelector("#cogLabel");
		cogLabel.setAttributeNS(null, "stroke", "lightgray");
		cogLabel.setAttributeNS(null, "fill", "lightgray");
	}
	
	if (nowTick - _lastPositionUpdateTick > 5000) {
		var latlong = document.querySelector("#latlong");
		latlong.setAttributeNS(null, "stroke", "lightgray");
		latlong.setAttributeNS(null, "fill", "lightgray");
	}
	
	if (nowTick - _lastSOGUpdateTick > 5000) {
		var latlong = document.querySelector("#sog");
		latlong.setAttributeNS(null, "stroke", "lightgray");
		latlong.setAttributeNS(null, "fill", "lightgray");
	}
	
	if (nowTick - _lastWindAngleTrueUpdateTick > 5000) {
		_compassNode.querySelector("#windAngleTrue").setAttributeNS(null, "visibility", "hidden");
		
		var label = document.querySelector("#windAngleTrueLabel");
		label.setAttributeNS(null, "stroke", "lightgray");
		label.setAttributeNS(null, "fill", "lightgray");
	}
	
	if (nowTick - _lastWindSpeedUpdateTick > 5000) {
		var label = document.querySelector("#windSpeedLabel");
		label.setAttributeNS(null, "stroke", "lightgray");
		label.setAttributeNS(null, "fill", "lightgray");
	}
	
    setTimeout(checkForNonrespondingGuages, 1000);
}

function readIPADDR() {
	_ipaddr = prompt("Please enter iKommunicate IP Address", "i.e. 192.168.1.20");
	}

function readMMSI() {
    var xmlhttp = new XMLHttpRequest();
		
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {

            var json = JSON.parse(xmlhttp.responseText);
            
            _mmsi = json.self.mmsi;
		}
	}
	
	try {
		var url = "http://" + _ipaddr + "/signalk/v1/api/vessels/self";
	    xmlhttp.open("GET", url, true);
	    xmlhttp.send();
	}
	catch(err) {
		_mmsi = "555555555";
	}
}

function onCompassLoaded(compassNode) {
	_compassNode = compassNode;
	
	// True Heading Compass
	var trueCompassStartY = -35;	
	addCompassTicks("#trueDegreeTicks", trueCompassStartY, 1);
	addCardinalTicks("#trueDegreeTicks", trueCompassStartY - 9, 6, 0.5);	
	addDegreeLabels("#trueDegreeLabels", trueCompassStartY, 10, 2, 3);
	addStar("#star", trueCompassStartY - 12);
	
	// Magnetic Heading Compass
	var magneticCompassStartY = -23;
	addCompassTicks("#magneticDegreeTicks", magneticCompassStartY, 1);
	addCardinalTicks("#magneticDegreeTicks", magneticCompassStartY - 8, 3, 3);	
	addDegreeLabels("#magneticDegreeLabels", magneticCompassStartY, 30, 1.75, 2.25);
		
	// Magnetic Compass Arrow
	var zeroDegreeArrowGroup = _compassNode.querySelector("#zeroDegreeArrowGroup");
	var arrowPolygon = document.createElementNS(svgNS, "polygon");
	arrowPolygon.setAttributeNS(null, "stroke-width", "0.01");
	arrowPolygon.setAttributeNS(null, "points", "0, -34.5, 1.0, -33, 0, -33.5, -1, -33, 0, -34.5");
	zeroDegreeArrowGroup.appendChild(arrowPolygon);	
	
	// Points Compass
	var compassPointsStartY = -22;
	addCompassPoints("#magneticDegreeTicks", compassPointsStartY);

/*
	var magneticTextRect = document.createElementNS(svgNS, "rect");
	magneticTextRect.setAttributeNS(null, "x", -0.25);
	magneticTextRect.setAttributeNS(null, "y", compassPointsStartY + 3);
	magneticTextRect.setAttributeNS(null, "width", 7);
	magneticTextRect.setAttributeNS(null, "height", 2);
	magneticTextRect.setAttributeNS(null, "fill", "white");
	magneticTextRect.setAttributeNS(null, "stoke", "white");
	_compassNode.querySelector("#pointsCompass").appendChild(magneticTextRect);
*/
		
	var magneticText = document.createElementNS(svgNS, "text");
	magneticText.setAttributeNS(null, "x", 0);
	magneticText.setAttributeNS(null, "y", compassPointsStartY + 4);
	magneticText.setAttributeNS(null, "text-anchor", "middle");
	magneticText.setAttributeNS(null, "font-size", 2);
	magneticText.setAttributeNS(null, "stroke-width", 0.01);
	magneticText.setAttributeNS(null, "style", "dominant-baseline: central;");
	magneticText.innerHTML = "Magnetic";
	_compassNode.querySelector("#pointsCompass").appendChild(magneticText);

    setTimeout(checkForNonrespondingGuages, 1000);
	
	readMMSI();
}

function averageHeadings(headings) {
    var lastHeading = 0;
    var newHeading = 0;
    var totalHeadings = 0;

    for (i = 0; i < headings.length; ++i) {
        newHeading = headings[i];
        if (i == 0) {
            lastHeading = newHeading;
        }

        if ((newHeading + 180) < lastHeading) {
            newHeading += 360;
        }
        else if ((newHeading - 180) > lastHeading) {
            newHeading -= 360;
        }

        lastHeading = newHeading;
        totalHeadings += newHeading;
    }

    var averageHeading = (totalHeadings / headings.length);
    if (averageHeading < 0) {
        averageHeading = 360 - averageHeading;
    }
    averageHeading %= 360;

    return averageHeading;
}

var trueHeadings = [];
function updateTrueHeading(newHeading, inferred) {
    var updatedHeading = 0;
	if (_compassNode) {		
        if (inferred == false) {
            trueHeadings.push(newHeading % 360);
            if (trueHeadings.length > 10) {
                trueHeadings.shift();
            }

            updatedHeading = averageHeadings(trueHeadings);
        }
        else {
            updatedHeading = newHeading % 360;
        }

		var compassRotationGroup = _compassNode.querySelector("#trueCompass");
		var r = -updatedHeading;
		compassRotationGroup.setAttributeNS(null, "transform", "rotate("+r+")");	

		var labelElement = _compassNode.querySelector("#trueLabel");
		var label = ("00" + Math.round(updatedHeading)).slice (-3);
		labelElement.innerHTML = "T: "+label+"&deg;" + (inferred ? "(inferred)" : "");	
	}

    return updatedHeading;
}

var magneticHeadings = [];
function updateMagneticHeading(newHeading) {
    var updatedHeading = 0;
	if (_compassNode) {
        magneticHeadings.push(newHeading % 360);
        if (magneticHeadings.length > 10) {
            magneticHeadings.shift();
        }

        updatedHeading = averageHeadings(magneticHeadings);

		var compassRotationGroup = _compassNode.querySelector("#magneticCompass");
		var r = -updatedHeading;
		compassRotationGroup.setAttributeNS(null, "transform", "rotate("+r+")");
		
		var labelElement = _compassNode.querySelector("#magneticLabel");
		var label = ("00" + Math.round(updatedHeading)).slice (-3);
		labelElement.innerHTML = "M: "+label+"&deg;"	
	}

    return updatedHeading;
}

var cogs = [];
function updateCourseOverGround(newCourseOverGround) {
    var updatedCOG = 0;
	if (_compassNode) {
        cogs.push(newCourseOverGround % 360);
        if (cogs.length > 10) {
            cogs.shift();
        }

        updatedCOG = averageHeadings(cogs);

	    var cogElement = _compassNode.querySelector("#cog");

	    cogElement.setAttributeNS(null, "transform", "rotate("+updatedCOG+")");
	    cogElement.setAttributeNS(null, "visibility", "visible");

		var labelElement = _compassNode.querySelector("#cogLabel");
		var label = ("00" + Math.round(updatedCOG)).slice (-3);
		labelElement.innerHTML = "COG: "+label+"&deg;"	
	}

    return updatedCOG;
}

function updateHeadingVariation(newVariation) {
	var labelElement = _compassNode.querySelector("#variationLabel");
	var newVariationMod = newVariation % 360;
	var label = newVariationMod.toFixed(1);
	labelElement.innerHTML = "V: "+label+"&deg;"		
}

function updateSpeedOverGround(newSOG) {
	var element = document.querySelector("#sogText");
	element.innerHTML = newSOG.toFixed(1)+" kts"
}

var windAngleTrue = [];
function updateWindAngleTrue(newWindAngleTrue) {
	var updatedWindAngleTrue = 0;
	if (_compassNode) {
        windAngleTrue.push(newWindAngleTrue % 360);
        if (windAngleTrue.length > 10) {
            windAngleTrue.shift();
        }

        updatedWindAngleTrue = averageHeadings(windAngleTrue);
		
	    var element = _compassNode.querySelector("#windAngleTrue");

	    element.setAttributeNS(null, "transform", "rotate("+updatedWindAngleTrue+")");
	    element.setAttributeNS(null, "visibility", "visible");
	
		var labelElement = _compassNode.querySelector("#windAngleTrueLabel");
		var label = ("00" + Math.round(updatedWindAngleTrue)).slice (-3);
		labelElement.innerHTML = "Wind: "+label+"&deg;"	
		
		labelElement.setAttributeNS(null, "stroke", "black");
		labelElement.setAttributeNS(null, "fill", "black");
	}
	return updatedWindAngleTrue;
}

var windSpeedTrues = [];
function updateWindSpeed(newWindSpeed) {
	var updatedWindSpeed = 0;
	if (_compassNode) {
        windSpeedTrues.push(newWindSpeed);
        if (windSpeedTrues.length > 10) {
            windSpeedTrues.shift();
        }

        var sum = 0;
        for (i = 0; i < windSpeedTrues.length; ++i) {
            sum += windSpeedTrues[i];
        }

        updatedWindSpeed = sum / windSpeedTrues.length;

		var labelElement = _compassNode.querySelector("#windSpeedLabel");
		var label = updatedWindSpeed.toFixed(1);
		labelElement.innerHTML = "Wind Speed: "+label+" kts"	
		
		labelElement.setAttributeNS(null, "stroke", "black");
		labelElement.setAttributeNS(null, "fill", "black");
	}
	return updatedWindSpeed;
}

var _webSocket = null;
verifyWebsocket();

function verifyWebsocket() {
    var timeoutValue = 10000;
    if (_webSocket == null) {
        openWebsocket();
    }
    else {
        var now = Date.now();

        if (_webSocketOpened && (now - _lastWebsocketDataTick) > 10000) {
            _webSocket.close();
            _webSocket = null;
            timeoutValue = 100;
        }
    }

    setTimeout(verifyWebsocket, timeoutValue);
}

function degreesToString(input, decimalPlaces) {

	var degrees = ~~input;
	var minutes = ~~((input - degrees) * 60);
	var seconds = ((input - degrees - (minutes/60)) * 3600).toFixed(2);
	
	degrees = ("000" + degrees).slice(-decimalPlaces);
	
	minutes = ("00" + minutes).slice(-2);
	if (seconds < 10)
	{
		seconds = "0" + seconds;
	}
	
	return degrees+"&deg;"+minutes+"'"+seconds+"\"";
}

function openWebsocket() {
    var socketURI;
    if (window.location.hostname) {
	    readIPADDR();
		socketURI = "ws://" + _ipaddr + "/signalk/v1/stream";
    }
    else {
	    readIPADDR();
		socketURI = "ws://" + _ipaddr + "/signalk/v1/stream";
    }

    try {
        _webSocketOpened = false;
        _webSocket = new WebSocket(socketURI);
    }
    catch(err) {
        _webSocket = null;
    }

    _webSocket.onopen = function(event) {
	    // send our context message
        _webSocketOpened = true;
	    _webSocket.send("{\"context\":\"vessels.self\",\"subscribe\":[{\"path\":\"*\"}]}");
    }

    _webSocket.onmessage = function(event) {

        _lastWebsocketDataTick = Date.now();

	    var msg = JSON.parse(event.data);	

	    if (msg.context == "vessels."+_mmsi) {
		    // Look for heading updates
		    for (var updateIndex = 0; updateIndex < msg.updates.length; ++updateIndex) {
			    var update = msg.updates[updateIndex];
			    for (var valueIndex = 0; valueIndex < update.values.length; ++valueIndex) {
				    var value = update.values[valueIndex];
				    if (value.path == "navigation.headingMagnetic") {
					    var newHeading = updateMagneticHeading(value.value * (180.0/3.14159));
					    _lastMagneticHeadingUpdateTick = Date.now();
					    _lastMagneticHeading = newHeading;
					
					    var compass = _compassNode.querySelector("#magneticCompass");
					    compass.setAttributeNS(null, "stroke", "black");
					    compass.setAttributeNS(null, "fill", "black");

					    var compassLabel = _compassNode.querySelector("#magneticLabel");
					    compassLabel.setAttributeNS(null, "stroke", "black");
					    compassLabel.setAttributeNS(null, "fill", "black");

					    var lubber = _compassNode.querySelector("#lubberLine");
					    lubber.setAttributeNS(null, "stroke", "red");
				    }
				    else if (value.path == "navigation.headingTrue") {
					    updateTrueHeading(value.value * (180.0/3.14159), false);
					    _lastTrueHeadingUpdateTick = Date.now();

					    var compass = _compassNode.querySelector("#trueCompass");
					    compass.setAttributeNS(null, "stroke", "black");
					    compass.setAttributeNS(null, "fill", "black");

					    var compassLabel = _compassNode.querySelector("#trueLabel");
					    compassLabel.setAttributeNS(null, "stroke", "black");
					    compassLabel.setAttributeNS(null, "fill", "black");
					
					    var lubber = _compassNode.querySelector("#lubberLine");
					    lubber.setAttributeNS(null, "stroke", "red");
				    }
				    else if (value.path == "navigation.headingVariation") {
					    var newHeadingVariation = value.value * (180.0/3.14159);
						updateHeadingVariation(newHeadingVariation);
						
					    var compassLabel = _compassNode.querySelector("#variationLabel");
					    compassLabel.setAttributeNS(null, "stroke", "black");
					    compassLabel.setAttributeNS(null, "fill", "black");
						
					    _lastHeadingVariation = value.value * (180.0/3.14159);
					    _lastHeadingVariationUpdateTick = Date.now();
				    }
				    else if (value.path == "navigation.courseOverGroundTrue") {						
						updateCourseOverGround(value.value * (180.0/3.14159));
						
					    var label = _compassNode.querySelector("#cogLabel");
					    label.setAttributeNS(null, "stroke", "black");
					    label.setAttributeNS(null, "fill", "black");
					
					    _lastCOGUpdateTick = Date.now();
				    }
					else if (value.path == "navigation.speedOverGround") {
						// Values are given in m/s - UI takes knots
						updateSpeedOverGround(value.value * 0.5144445747704);

					    var label = document.querySelector("#sog");
					    label.setAttributeNS(null, "stroke", "black");
					    label.setAttributeNS(null, "fill", "black");
					
					    _lastSOGUpdateTick = Date.now();
					}
					else if (value.path == "navigation.position") {
						var latString = degreesToString(Math.abs(value.value.latitude), 2);
						if (value.value.latitude > 0) {
							latString += " N"
						}
						else {
							latString += " S"
						}
						
					    var label = document.querySelector("#latitudeText");
						label.innerHTML = "&nbsp;" + latString;						

						var longString = degreesToString(Math.abs(value.value.longitude), 3);
						if (value.value.longitude > 0) {
							longString += " E"
						}
						else {
							longString += " W"
						}
						
					    label = document.querySelector("#longitudeText");
						label.innerHTML = longString;		
						
						var latlong = document.querySelector("#latlong");
						latlong.setAttributeNS(null, "stroke", "black");
						latlong.setAttributeNS(null, "fill", "black");
						
						_lastPositionUpdateTick = Date.now();				
					}
					else if (value.path == "environment.wind.angleTrue") {
						updateWindAngleTrue(value.value * (180.0/3.14159));
						_lastWindAngleTrueUpdateTick = Date.now();
					}
					else if (value.path == "environment.wind.speedTrue") {
						// Values are given in m/s - UI takes knots
						updateWindSpeed(value.value * 0.5144445747704);
						_lastWindSpeedUpdateTick = Date.now();
					}
				
				    // See if we need to use magneticHeading+headingVariation if 
				    // the last true heading update was too long ago.
				    var now = Date.now();
				    if (now - _lastTrueHeadingUpdateTick > 5000 &&
					    now - _lastHeadingVariationUpdateTick < 5000 &&
					    now - _lastMagneticHeadingUpdateTick < 5000) {
				
					    var newHeading = _lastMagneticHeading + _lastHeadingVariation;	

					    updateTrueHeading(newHeading, true);
					
					    var compass = _compassNode.querySelector("#trueCompass");
					    compass.setAttributeNS(null, "stroke", "black");
					    compass.setAttributeNS(null, "fill", "black");
						
					    var compassLabel = _compassNode.querySelector("#trueLabel");
					    compassLabel.setAttributeNS(null, "stroke", "black");
					    compassLabel.setAttributeNS(null, "fill", "black");
				    }
			    }
		    }
	    }
    }

    _webSocket.onclose = function(event) {

    }
}

