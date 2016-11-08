function httpGetAsync(theUrl, headers, method, data, callback) {
    var xmlHttp = new XMLHttpRequest();
    if (typeof headers === 'function') {
        callback = headers;
        headers = [];
        method = 'GET';
        data = null;
    }
    if (typeof method === 'function') {
        callback = method;
        method = 'GET';
        data = null;
    }
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open(method, theUrl, true);
    for(var name in headers) {
        xmlHttp.setRequestHeader(name, headers[name]);
    }
    xmlHttp.send(data);
}

var app = new Vue({
    el: '#azure-smarthome',
    data: {
        appliances: [],
        newDevice: {
            manufacturerName: '',
            modelName: '',
            version: '',
            friendlyName: '',
            friendlyDescription: '',
        }
    },
    methods: {
        addNewDevice: function() {
            var url = 'https://[your-website-hostname/api/smarthome?request=AddDevice&manufacturerName=' + this.newDevice.manufacturerName +
                    '&modelName=' + this.newDevice.modelName +
                    '&version=' + this.newDevice.version +
                    '&friendlyName=' + this.newDevice.friendlyName +
                    '&friendlyDescription=' + this.newDevice.friendlyDescription;
            httpGetAsync(url, function(response) {
                response = JSON.parse(response);
                this.discovery();
                this.newDevice = {
                    manufacturerName: '',
                    modelName: '',
                    version: '',
                    friendlyName: '',
                    friendlyDescription: '',
                };
            }.bind(this));
        },
        setStatus: function(applianceId, status) {
            this.appliances.forEach(function(appliance) {
                appliance.status = status;
            });
        },
        removeDevice: function(applianceId) {
            httpGetAsync('https://[your-website-hostname]/api/smarthome?request=RemoveDevice&applianceId=' + applianceId, function(response) {
                response = JSON.parse(response);
                this.discovery();
            }.bind(this));
        },
        discovery: function() {
            httpGetAsync('https://[your-website-hostname]/api/smarthome?request=Discovery', function(response) {
                response = JSON.parse(response);
                this.appliances = response.payload.discoveredAppliances;
            }.bind(this));
        },
        getStatus: function() {
            var url = 'https://[your-iot-appname].azure-devices.net/devices/[your-device-id]/messages/devicebound?api-version=2016-02-03';
            var headers = {};
            headers['Content-Type'] = 'application/json';
            headers['Authorization'] = '[SAS String]';
            httpGetAsync(url, headers, function(response) {
                if (response) {
                    response = JSON.parse(response);
                    this.setStatus(response.message.applianceId, response.message.request);
                }
                setTimeout(this.getStatus, 1500);
            }.bind(this));
        }
    }
});

app.discovery();
app.getStatus();