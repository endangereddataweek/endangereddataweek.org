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
