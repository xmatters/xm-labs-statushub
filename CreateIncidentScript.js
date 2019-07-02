var incidentName = input["Incident ID"] + " - A new issue has been detected";
// Get service ID
// Prepare the HTTP request
var serviceID = null;
var found = false;
var page = 1;
do {
    var shRequest = http.request({
        'endpoint': 'StatusHub',
        'method': 'Get',
        'path': '/api/status_pages/' + input["Subdomain"] + '/services?api_key=' + input["API Key"] + '&page=' + page + '&per_page=100'
    });
    page += 1;
    shResponse = shRequest.write();
    console.log( 'shResponse: ' + JSON.stringify( shResponse, null, 2 ) ); 
    var statusJson = JSON.parse( shResponse.body );
    for ( i = 0; i < statusJson.length; i++ ) {
        if ( statusJson[i].name == input["Service Name"] ) {
            serviceID = statusJson[i].id;
            found = true;
            break;
        }
    } 
} while ( statusJson.length == 100 & !found )
if ( serviceID == null ) {
    console.log( 'StatusHub Service not found');
    return null;
}
// Create incident
// Prepare the HTTP request
payload = {
    "incident": {
        "title": incidentName,
        "update": {
            "body": "A new issue has been detected",
            "incident_type": "investigating",
        }
    },
    "service_status": {
        "status_name": "degraded-performance"
    }
}
var shRequest = http.request({
    'endpoint': 'StatusHub',
    'method': 'POST',
    'path': '/api/status_pages/' + input["Subdomain"] + '/services/' + serviceID + '/incidents?api_key=' + input["API Key"],
    'headers': {
        'Content-Type': 'application/json'
    }
});

shResponse = shRequest.write( payload );
console.log("Response: " + JSON.stringify(JSON.parse( shResponse.body )));

