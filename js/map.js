/**
 * Created by yevheniia on 09.06.20.
 */
var default_zoom = window.innerWidth > 800 ? 5 : 5;

var stops_values = [
    [-1, 'grey'],
    [0, '#ffffcc'],
    [1, '#ffeda0'],
    [2, "#fed976"],
    [3, "#feb24c"],
    [5, "#fd8d3c"],
    [8, "#fc4e2a"],
    [12, "#e31a1c"],
    [16, "#e31a1c"],
    [20, "#bd0026"],
    [23, "#800026"]
];

mapboxgl.accessToken = 'pk.eyJ1IjoiZHJpbWFjdXMxODIiLCJhIjoiWGQ5TFJuayJ9.6sQHpjf_UDLXtEsz8MnjXw';
var map = new mapboxgl.Map({
    container: 'map',
    minZoom: default_zoom,
    maxZoom: default_zoom + 2,
    hash: false,
    tap: false,
    attributionControl: false,
    style: 'dark_matter.json',
    center: [31.5, 49.5],
    zoom: default_zoom // starting zoom
});


var map2 = new mapboxgl.Map({
    container: 'map2',
    minZoom: 8,
    maxZoom: 9,
    hash: false,
    tap: false,
    attributionControl: false,
    style: 'dark_matter.json',
    center: [30.5, 50.5],
    zoom: 9 // starting zoom
});

map.scrollZoom.disable();
map2.scrollZoom.disable();

d3.csv("data/TABLE.csv").then(function(data) {

    data.forEach(function(d){
        d.pot_infections = +d.pot_infections;
    });


    /* ------- карта України ------- */
    map.on('load', function () {

        //векторні тайли
        map.addSource('schools', {
            type: 'vector',
            tiles: ["https://texty.github.io/covid_schools_map/tiles/schools_covid/{z}/{x}/{y}.pbf"]
        });


        function redrawUkraineMap(choropleth_column) {
            map.addLayer({
                "id": "schools_data",
                'type': 'fill',
                'minzoom': 4,
                'maxzoom': 10,
                'source': "schools",
                "source-layer": "schools_covid_4326",
                "paint": {
                    'fill-color': {
                        property: choropleth_column,
                        stops: stops_values
                    },
                    'fill-outline-color': 'grey'
                }
            });
        }

        redrawUkraineMap('MAP_cleaned_infections1000');

        /* перемикаємо шари  карти */
        d3.select("#ukraine-switch-buttons").selectAll(".map_button").on("click", function() {
            let selected_layer = d3.select(this).attr("value");
            d3.select(this.parentNode).selectAll(".map_button").classed("active", false);
            d3.select(this).classed("active", true);
            map.removeLayer('schools_data');
            redrawUkraineMap(selected_layer);
        });


        var nav = new mapboxgl.NavigationControl();
        map.addControl(nav, 'top-left');

    }); //end of Ukraine map




    /* --- карта києва --- */
    map2.on('load', function () {

        //векторні тайли
        map2.addSource('kyiv', {
            type: 'vector',
            tiles: ["https://texty.github.io/covid_schools_map/tiles/schools_kyiv/{z}/{x}/{y}.pbf"]
        });


        function redrawKyivMap(choropleth_column) {
            map2.addLayer({
                "id": "schools_kyiv",
                'type': 'fill',
                'minzoom': 4,
                'maxzoom': 10,
                'source': "kyiv",
                "source-layer": "schools_kyiv_4326",
                "paint": {
                    'fill-color': {
                        property: choropleth_column,
                        stops: stops_values
                    },
                    'fill-outline-color': 'grey'
                }
            });
        }


        redrawKyivMap('KYIV_infections1000');


        d3.select("#kyiv-switch-buttons").selectAll(".map_button").on("click", function() {
            let selected_layer = d3.select(this).attr("value");
            d3.select(this.parentNode).selectAll(".map_button").classed("active", false);
            d3.select(this).classed("active", true);
            map2.removeLayer('schools_kyiv');
            redrawKyivMap(selected_layer);
        });

        //  function sourceCallback() {
        //      if (map.getSource('elections_06') && map.isSourceLoaded('elections_06') && map.isStyleLoaded()) {
        //          d3.select("#spinner").remove();
        //      }
        //  }        //
        //
        // map.on('sourcedata', sourceCallback);

    });


    var tableData = data.filter(function(d) { return d.region === "м. Київ"});

    let initData = tableData.map(function(d){
        return { "district": d.district_name,  "name": d.school_name, "id": d.edrpo,  "infected": d.pot_infections };
    });


    var datatable = $('#schools').DataTable({
        pageLength: 10,
        order: [[3, "desc"]],
        responsive: true,
        language: {
             "url": "//cdn.datatables.net/plug-ins/1.10.21/i18n/Ukrainian.json"
        },
        data: data.aaData,
        columns: [
            { data : "district"},
            { data: "name" },
            { data: "id" },
            { data: "infected" }

        ]
    });

    //додаємо дані в таблицю
    datatable.rows.add(initData).draw();
    

    $('#schools thead tr').clone(true).appendTo( '#schools thead' );

    // select option  в другу колонку
    $('#schools thead tr:eq(1) th:eq(0)').each(function (i) {
        var column = this;
        var select = $('<select style="width:100%"><option value="" selected>Оберіть район</option></select>');
        $(this).html( select );
        $( 'select', this ).on( 'change', function () {
            var val = $.fn.dataTable.util.escapeRegex(
                $(this).val()
            );
            datatable.column(i)
                .search( this.value )
                .draw();
        });
        datatable.column(i).data().unique().each( function ( d) {
            select.append('<option value="'+d+'">'+d+'</option>')
        });
    }); //end of select option





   /*---  змінюємо таблицю по селекту ---*/
   d3.select("#region-to-show").on("change", function(){
       let seletedArea = d3.select(this).node().value;
       var filtered = data
           .filter(function(d) { return d.region === seletedArea  })
           .map(function(d){
               return {
                   "district": d.district_name,
                   "name": d.school_name,
                   "id": d.edrpo,
                   "infected": d.pot_infections
               };
           });
       datatable.clear();
       datatable.rows.add(filtered).draw();
   });
    
    
});
