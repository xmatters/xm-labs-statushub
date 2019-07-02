var incidentName = input["Incident ID"] + " - A new issue has been detected"
// Get service ID and incident
var serviceID = null;
var found = false;
var page = 1;
do {
    var shRequest = http.request({
        'endpoint': 'StatusHub',
        'method': 'Get',
        'path': '/api/status_pages/' + input["Subdomain"] + '/services?api_key=' + input["API Key"] + '&page=' + page + '&per_page=100'
    });
    page ++;
    shResponse = shRequest.write();
    var statusJson = JSON.parse( shResponse.body );
    for ( i = 0; i < statusJson.length; i++ ) {
        if ( statusJson[i].name == input["Service Name"] ) {
            serviceID = statusJson[i].id;
            found = true;
            break;
        }
    } 
} while ( statusJson.length == 100 && !found )
if ( serviceID == null ) {
    throw "StatusHub Service not found for '" + input["Service Name"] + "'";
}
// Get data for incident
var StatusHubData = null;
found = false;
var page = 1;
do {
    var shRequest = http.request({
        'endpoint': 'StatusHub',
        'method': 'Get',
        'path': '/api/status_pages/' + input["Subdomain"] + '/services/' + serviceID + '/incidents?api_key=' + input["API Key"] + '&status=open&page=' + page + '&per_page=100'
    });
    page ++;
    shResponse = shRequest.write();
    var statusJson = JSON.parse( shResponse.body );
    for ( i = 0; i < statusJson.length; i++ ) {
        if ( statusJson[i].title.contains( incidentName ) ) {
            StatusHubData = statusJson[i];
            found = true;
        }
    } 
} while ( statusJson.length == 100 )
if( StatusHubData === null ) {
    throw "No StatusHub incident found for '" + incidentName + "'";
}
var incidentID = StatusHubData.id;
var payload = {
    "incident": {
        "title": incidentName,
        "update": {
            "body": input["Comment"],
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
    'path': '/api/status_pages/' + input["Subdomain"] + '/services/' + serviceID + '/incidents/' + incidentID + '?api_key=' + input["API Key"],
    'headers': {
        'Content-Type': 'application/json'
    }
});
shResponse = shRequest.write(payload);
