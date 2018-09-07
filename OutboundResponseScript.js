var StatusHub = require( 'StatusHub' );

var callback = JSON.parse(request.body);
console.log('Executing outbound integration for xMatters event ID: ' + callback.eventIdentifier + '. Response: ' + callback.response.toLowerCase() );

// Convert list of event properties to an eventProperties object
if (callback.eventProperties && Array.isArray(callback.eventProperties)) {
    var eventProperties = callback.eventProperties;
    callback.eventProperties = {};

    for (var i = 0; i < eventProperties.length; i++) {
        var eventProperty = eventProperties[i];
        var key = Object.keys(eventProperty)[0];
        callback.eventProperties[key] = eventProperty[key];
    }
}
console.log( "callback.eventProperties:" + callback.eventProperties);
if( callback.response.toLowerCase() == 'create statushub incident' ) {
    // By defaut this script is configured to use the xMatters Event Identifier as the StatusHub Name when creating the StatusHub Incident.
    // If you want to use the ServiceNow Incident ID then you can replace the active statusHubData entry with the one below.
    // Note: you will also need to make the same change for the Update and Resolve entries within this script.
    payload = {
        "incident": {
            "title": callback.eventIdentifier + " - A new issue has been detected",
            "update": {
                "body": "A new issue has been detected",
                "incident_type": "investigating",
            }
        },
        "service_status": {
            "status_name": "degraded-performance"
        }
    }
    var statusHubData = StatusHub.createStatusHubIncident( constants["StatusHub Service Name"], payload, callback );

    console.log( 'StatusHub data: ' + JSON.stringify( statusHubData ) );

    // If it is desired to send a link to the StatusHub Incident back to anywhere (such as a ticketing system), then add the code here.
    // Note that the format of msg might need to be updated depending on what the target system supports. (markdown, html, plain text, etc)
}

else if( callback.response.toLowerCase() == 'set status of statushub incident to "investigating"' ) {
    StatusHub.updateStatusHubIncident( "status", callback.eventIdentifier, constants["StatusHub Service Name"], "investigating", callback );
}

else if( callback.response.toLowerCase() == 'set status of statushub incident to "identified"' ) {
    StatusHub.updateStatusHubIncident( "status", callback.eventIdentifier, constants["StatusHub Service Name"], "identified", callback );
}

else if( callback.response.toLowerCase() == 'resolve statushub incident' ) {
    StatusHub.updateStatusHubIncident( "status", callback.eventIdentifier, constants["StatusHub Service Name"], "resolved", callback );
}
