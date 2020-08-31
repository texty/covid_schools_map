/**
 * Created by yevheniia on 09.06.20.
 */
var default_zoom = window.innerWidth > 800 ? 5.5 : 4;
var min_zoom =  window.innerWidth > 800 ? 5 : 4;

mapboxgl.accessToken = 'pk.eyJ1IjoiZHJpbWFjdXMxODIiLCJhIjoiWGQ5TFJuayJ9.6sQHpjf_UDLXtEsz8MnjXw';
var map = new mapboxgl.Map({
    container: 'map',
    minZoom: min_zoom,
    maxZoom: 9,
    hash: false,
    tap: false,
    attributionControl: false,
    style: '../dark_matter.json',
    center: [31.5, 48.5],
    zoom: default_zoom // starting zoom
});



map.scrollZoom.disable();


map.on('load', function () {

    var layers = map.getStyle().layers;
    var firstSymbolId;

    for (var i = 0; i < layers.length; i++) {
        if (layers[i].type === 'symbol') {
            firstSymbolId = layers[i].id;
            break;
        }
    }

    //векторні тайли
    map.addSource('schools', {
        type: 'vector',
        tiles: ["https://texty.github.io/parliament_elections/tiles/lines_06/{z}/{x}/{y}.pbf"]
    });



    map.addLayer({
        "id": "election_data",
        'type': 'line',
        'minzoom': 4,
        'maxzoom': 10,
        'source': "schools",
        "source-layer": "schools_4326",
        'layout': {
            'line-join': 'round',
            'line-cap': 'round'

        },
        "paint": {

            'line-color': [
                'match',
                ['get', 'color'],
                'green', '#E6F164',
                'red', '#F47874',
                '#5B95FF'
            ],
            'line-width': 1
        }
    }, firstSymbolId);







    function sourceCallback() {
        if (map.getSource('elections_06') && map.isSourceLoaded('elections_06') && map.isStyleLoaded()) {
            d3.select("#spinner").remove();
        }
    }


   map.on('sourcedata', sourceCallback);


    var nav = new mapboxgl.NavigationControl();
    map.addControl(nav, 'top-left');


});