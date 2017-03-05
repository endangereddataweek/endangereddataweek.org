(function() {
    // 'use strict';

    var CartoDB_Positron = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
            subdomains: 'abcd',
            maxZoom: 19
        }),
        Thunderforest_Landscape = L.tileLayer('https://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png?apikey=ed8a8c98442949588501489e7f836831', {
            attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        });

    var map = L.map('map', {
        center: [39.73, -104.99],
        zoom: 4,
        layers: [CartoDB_Positron, Thunderforest_Landscape]
    });

    var baseMaps = {
        "Landscape": Thunderforest_Landscape,
        "Positron": CartoDB_Positron
    };

    L.control.layers(baseMaps).addTo(map);

    function onEachFeature(feature, layer) {
        var popupContent = '';
        if (feature.properties && feature.properties.popupContent) {
            popupContent += feature.properties.popupContent;
        }

        layer.bindPopup(popupContent);
    }

    var events = {
      "type": "FeatureCollection",
      "features": [

        {
          "geometry": {
            "type": "Point",
            "coordinates": [42.7276362, 42.7276362]
          },
          "type": "Feature",
          "properties": {
            "popupContent": "<h2>Building a Scholarly Presence with Humanities Commons</h2><p><strong>Institution:</strong> Michigan State University</p><p><strong>Location:</strong> Linton Hall 120</p><p><strong>Date</strong>2017-04-21 at 12:30:00 PM</p><p><strong>Contact:</strong>Kristen Mapes</p>"
          },
          "id":  2
        },

      ]
    };
    
    L.geoJson([events], {
        style: function(feature) {
            return feature.properties && feature.properties.style;
        },
        onEachFeature: onEachFeature,
        pointToLayer: function(feature, latlng) {
            return L.marker(latlng);
        }
    }).addTo(map);
})();
