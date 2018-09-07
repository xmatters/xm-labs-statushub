var StatusHub = require( 'StatusHub' );

var callback = JSON.parse(request.body);

//fill in eventProperties object
if (callback.eventProperties && Array.isArray(callback.eventProperties)) {
    var eventProperties = callback.eventProperties;
    callback.eventProperties = {};

    for (var i = 0; i < eventProperties.length; i++) {
        var eventProperty = eventProperties[i];
        var key = Object.keys(eventProperty)[0];
        callback.eventProperties[key] = eventProperty[key];
    }
}

//update StatusHub incident with new message
StatusHub.updateStatusHubIncident( "message", callback.eventProperties.number, constants["StatusHub Service Name"], callback.comment );