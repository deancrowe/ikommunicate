# iKommunicate
Introduction to Signal K with iKommunicate

Welcome to our iKommunicate Developer's Guide (SDK) on GitHub. This guide is intended to help developers quickly get to grips with our new iKommunicate NMEA to Signal K gateway. We hope that the ever growing set of example web apps will illustrate how to use the HTTP restAPI or Web Sockets to access the Signal K data that iKommunicate collects from the various NMEA0183 and NMEA2000 equipment on a boat.

The "SDK-Deltas-WebSocket-Example-V1.html" webpage provides an introduction to opening a Web Socket to the iKommunicate and then reading the stream of Delta Messages (in JSON format) that iKommunicate creates each time it receives a new NMEA2000 PGN or NMEA0183 Sentence.

The "SDK-Depth-REST-Example-V1.html" webpage (and associated files in the "depthLibrary" folder) shows how you can poll specific data from iKommunicate using an Http REST API call. The returned JSON message is then parsed, to create a JSON object from which the Depth data is extracted. The example also shows how to display the depth data on a Javascript Gauge, in this case using the [JustGage plugin](http://justgage.com/). 

The full Developer's Guide documentation is included in the associated Wiki.

For information on Signal K the Open Source data format for the "Internet of Boats" please visit [http://signalk.org](http://signalk.org) and for more information on iKommunicate please visit [http://ikommunicate.com](http://ikommunicate.com)
