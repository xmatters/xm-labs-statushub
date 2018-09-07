/*
 * StatusHub Shared Library
 *
 *  This shared library is for interacting with StatusHub.io to create, update and resolve Incidents from xMatters notifications. 
 * 
 *  Exposed methods:
 *    createStatusHubIncident - Creates a new StatusHub Incident
 *       serviceID - String - Unique identifier for the service
 *       payload - Object - The payload to create the incident
 *       callback - Object - callback object for accessing xMatters parameters if desired
 *
 *    updateStatusHubIncident - Updates an existing StatusHub Incident
 *       update - String - One of "message" or "status". "message" will update the Incident with a new message body, 
 *                "status" will change the status of the Incident to "investigating", "identified", or "resolved".
 *       incidentName - String - Name of the Incident to update
 *       serviceID - String - Unique identifier of the service containing the incident
 *       value - String - If `update` is "message", this is the message to update the incident with; if `update` is "status",
 *                        this is the new status of the incident. 
 *       callback - Object - callback object for accessing xMatters parameters if desired
 *
 *    getStatusHubIncident    - Get an existing StatusHub Incident, or null if an Incident with the `incidentNumber` does not exist.
 *       incidentName - String - Name of the Incident to get
 *       serviceID - String - Unique identifier of the service to find the incident under
 *
 *  Usage:
 *  
    // Import the StatusHub shared library. Note this assumes the name of the Shared Library is `StatusHub`.
    var StatusHub = require( 'StatusHub' );
    // If the user responded with 'create StatusHub.io incident', then create a new StatusHub Incident using the
    // callback.eventProperties.number value as the Incident Number and add a message of "A new issue has been detected."
    if( callback.response.toLowerCase() == 'create StatusHub.io incident' ) {
        var StatusHubData = StatusHub.createStatusHubIncident( callback.eventProperties.number, "A new issue has been detected.");
    }
 *
 */


exports.createStatusHubIncident = function( serviceName, payload, callback ) {
    // Get service ID
    var serviceID = this.getStatusHubService( serviceName );
    if ( serviceID == null ) {
        console.log( 'StatusHub Service not found');
        return null;
    }   
    // Prepare the HTTP request
    var shRequest = http.request({
        'endpoint': 'StatusHub',
        'method': 'POST',
        'path': '/api/status_pages/' + constants["StatusHub Subdomain"] + '/services/' + serviceID + '/incidents?api_key=' + constants["StatusHub API Key"],
        'headers': {
            'Content-Type': 'application/json'
                 }
    });
    
    shResponse = shRequest.write( payload );
    console.log( 'CreateStatusHub Response: ' + shResponse.body );
    return JSON.parse( shResponse.body );
}

////////////////////////////////////////////////////
//
//Update StatusHub.io incident
//
////////////////////////////////////////////////////
exports.updateStatusHubIncident = function( update, incidentName, serviceName, value, callback ){

    console.log( "**** Update StatusHub.io for '" + incidentName + "', with body:\n" + value );
    // Get service ID and incident
    var serviceID = this.getStatusHubService( serviceName );
    if ( serviceID == null ) {
        console.log( 'StatusHub Service not found' );
        return null;
    }
    var StatusHubData = this.getStatusHubIncident( incidentName, serviceID );
    if( StatusHubData === null ) {
      console.log( 'No StatusHub found. Returning.' );
      return;
    }
    var incidentID = StatusHubData.id;
    console.log( "******** StatusHub Incident Data:\n" + JSON.stringify(StatusHubData) );
    var payload = {
        "incident": {
            "update": {
                "body": StatusHubData.incident_updates[0].body,
                "incident_type": StatusHubData.incident_updates[0].incident_type
            }
        },
        "service_status": {
            "status_name": "degraded-performance"
        }
    };

    // Prepare the HTTP request
    var shRequest = http.request({
        'endpoint': 'StatusHub',
        'method': 'PUT',
        'path': '/api/status_pages/' + constants["StatusHub Subdomain"] + '/services/' + serviceID + '/incidents/' + incidentID + '?api_key=' + constants["StatusHub API Key"],
        'headers': {
            'Content-Type': 'application/json'
        }
    });
    
    if ( update == "message" )
        payload.incident.update.body = value;
    else if ( update == "status" ) {
        payload.incident.update.incident_type = value;
        if ( value == "resolved" ) {
            payload.incident.update.body = "Resolved by " + callback.recipient;
            payload.service_status.status_name = "up";
        }
    }
    console.log( "payload: " + payload );
    shResponse = shRequest.write(payload);
    console.log(JSON.stringify(shResponse)); 
}



////////////////////////////////////////////////////
//
//Get StatusHub.io incident
//
////////////////////////////////////////////////////
exports.getStatusHubIncident = function( incidentName, serviceID ){

    console.log("**** Get StatusHub.io for '" + incidentName );
    // Prepare the HTTP request
    var page = 1;
    do {
        var shRequest = http.request({
            'endpoint': 'StatusHub',
            'method': 'Get',
            'path': '/api/status_pages/' + constants["StatusHub Subdomain"] + '/services/' + serviceID + '/incidents?api_key=' + constants["StatusHub API Key"] + '&status=open&page=' + page++ + '&per_page=100',
            'headers': {
                'Content-Type': 'application/json'
            }
            
        });
    
        shResponse = shRequest.write();
        console.log( 'shResponse: ' + JSON.stringify( shResponse, null, 2 ) ); 
        var statusJson = JSON.parse( shResponse.body );
        for ( i = 0; i < statusJson.length; i++ ) {
            if ( statusJson[i].title.contains( incidentName ) ) {
                
                Id = statusJson[i].id;
                console.log("*********" + incidentName + Id );
                return statusJson[i];
            }
        } 
    } while ( statusJson.length == 100 )
    
    // If it gets here, none found
    return null;
}

exports.getStatusHubService = function( serviceName ) {
    
    console.log("**** Get StatusHub.io Service ID for '" + serviceName );
    // Prepare the HTTP request
    var page = 1;
    do {
        var shRequest = http.request({
            'endpoint': 'StatusHub',
            'method': 'Get',
            'path': '/api/status_pages/' + constants["StatusHub Subdomain"] + '/services?api_key=' + constants["StatusHub API Key"] + 'page=' + page++ + '&per_page=100',
            'headers': {
                'Content-Type': 'application/json'
            }
            
        });
    
        shResponse = shRequest.write();
        console.log( 'shResponse: ' + JSON.stringify( shResponse, null, 2 ) ); 
        var statusJson = JSON.parse( shResponse.body );
        for ( i = 0; i < statusJson.length; i++ ) {
            if ( statusJson[i].name == serviceName ) {
                return statusJson[i].id;
            }
        } 
    } while ( statusJson.length == 100 )
    
    // If it gets here, none found
    return null;
}