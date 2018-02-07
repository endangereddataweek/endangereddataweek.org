//= require ../../node_modules/jquery/dist/jquery.js
//=require ../../node_modules/leaflet/dist/leaflet-src.js
//=require ../../node_modules/leaflet.markercluster/dist/leaflet.markercluster-src.js
//=require ../../node_modules/@ryancavanaugh/dynatable/index.d.ts
//=require dlf.js
//=require map.js

(function() {
    'use strict';

    // @see https://www.dynatable.com/#json-from-ajax
    $.ajax({
        url: '/data/events_table.json',
        success: function(data) {
            $('#event_table').dynatable({
                dataset: {
                    records: data,
                    sorts: { date: 1 }
                }
            });
        }
    });

})();
