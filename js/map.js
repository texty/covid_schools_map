/**
 * Created by yevheniia on 09.06.20.
 */
var default_zoom_u = window.innerWidth > 800 ? 5 : 4;
var default_zoom_k = window.innerWidth > 800 ? 9 : 8;

var stops_values = [
    [-3, 'white'],
    [-1, '#d3d3d3'],
    [0, '#ffffff'],
    [1, '#ffffb2'],
    [2, '#fed976'],
    [3, "#feb24c"],
    [6, "#fd8d3c"],
    [8, "#f03b20"],
    [10, "#bd0026"]
];

mapboxgl.accessToken = 'pk.eyJ1IjoiZHJpbWFjdXMxODIiLCJhIjoiWGQ5TFJuayJ9.6sQHpjf_UDLXtEsz8MnjXw';

var map = new mapboxgl.Map({
    container: 'map',
    minZoom: default_zoom_u,
    maxZoom: default_zoom_u + 2,
    hash: false,
    tap: false,
    attributionControl: false,
    style: 'https://raw.githubusercontent.com/texty/covid_schools_map/master/dark_matter.json',
    center: [31.5, 48.5],
    zoom: default_zoom_u // starting zoom
});


var map2 = new mapboxgl.Map({
    container: 'map2',
    minZoom: default_zoom_k,
    maxZoom: default_zoom_k,
    hash: false,
    tap: false,
    attributionControl: false,
    style: 'https://raw.githubusercontent.com/texty/covid_schools_map/master/dark_matter.json',
    center: [30.5, 50.4],
    zoom: default_zoom_k // starting zoom
});

map.scrollZoom.disable();
map2.scrollZoom.disable();


Promise.all([
    d3.csv("https://raw.githubusercontent.com/texty/covid_schools_map/master/data/TABLE.csv"),
    d3.csv("https://raw.githubusercontent.com/texty/covid_schools_map/master/data/smallTable.csv")
]).then(function(data) {

    data[0].forEach(function(d){
        d.pot_infections = +d.pot_infections;
    });

    var layers = map.getStyle().layers;
    var firstSymbolId;

    for (var i = 0; i < layers.length; i++) {
        if (layers[i].type === 'symbol') {
            firstSymbolId = layers[i].id;
            break;
        }
    }


    /* ------- карта України ------- */
    map.on('load', function () {

        //векторні тайли
        map.addSource('schools', {
            type: 'vector',
            tiles: ["https://texty.github.io/covid_schools_map/tiles/schools_ukraine/{z}/{x}/{y}.pbf"]
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


                    'fill-outline-color': [
                        'case',
                        ['boolean', ['feature-state', 'hover'], false],
                        "grey",
                        "lightgrey"
                    ]
                }
            }, firstSymbolId);
        }

        map.on('click', 'schools_data', function(e) {
           map.getCanvas().style.cursor = 'pointer';
           new mapboxgl.Popup()
                .setLngLat(e.lngLat)
                .setHTML(e.features[0].properties.MAP_cleaned_registration_region)
                .addTo(map);
        });

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
                    'fill-outline-color': '#d3d3d3'
                }
            });
        }

        map2.on('click', 'schools_kyiv', function(e) {
            map.getCanvas().style.cursor = 'pointer';
            new mapboxgl.Popup()
                .setLngLat(e.lngLat)
                .setHTML(e.features[0].properties.NAME_2)
                .addTo(map2);
        });


        redrawKyivMap('KYIV_infections1000');


        d3.select("#kyiv-switch-buttons").selectAll(".map_button").on("click", function() {
            let selected_layer = d3.select(this).attr("value");
            d3.select(this.parentNode).selectAll(".map_button").classed("active", false);
            d3.select(this).classed("active", true);
            map2.removeLayer('schools_kyiv');
            redrawKyivMap(selected_layer);
        });

         function sourceCallback() {
             if (map.getSource('schools') && map.isSourceLoaded('schools') && map.isStyleLoaded()) {
                 d3.select("#spinner").remove();
             }
         }        //

        map.on('sourcedata', sourceCallback);

    });



    var smalltable = $('#example').DataTable({
        paging: false,
        searching: false,
        order: [[2, "desc"]],
        responsive: true,
        language: {
            "url": "//cdn.datatables.net/plug-ins/1.10.21/i18n/Ukrainian.json"
        },
        data: data.aaData,
        columns: [
            { data: "Населений пункт"},
            { data: "Назва школи" },
            { data: "Розмір школи" },
            { data: "Потенційна кількість інфікованих" }
           

        ]
    });

    smalltable.rows.add(data[1]).draw();


    var initData = data[0]
        .filter(function(d) { return d.region === "м. Київ"})
        .map(function(d){
            return {
                "Район": d.district_name,
                "Назва школи": d.school_name,
                "Розмір школи": d.tot_people + " oc.",
                "Потенційна кількість інфікованих": d.pot_infections + " oc."
              
                
            };
        });

    var datatable = $('#schools').DataTable({
        pageLength: 10,
        order: [[3, "desc"]],
        responsive: true,
        sortable: true,
        language: {
             "url": "//cdn.datatables.net/plug-ins/1.10.21/i18n/Ukrainian.json"
        },
        data: data.aaData,
        columns: [
            { data: "Район"},
            { data: "Назва школи" },
            { data: "Потенційна кількість інфікованих" },
            { data: "Розмір школи" }
           

        ]
    });

    //додаємо дані в таблицю
    datatable.rows.add(initData).draw();

    $('#schools thead tr').clone(true).appendTo( '#schools thead' );

    // select option  в другу колонку
    $('#schools thead tr:eq(1) th:eq(0)').each(function (i) {
        var column = this;
        var select = $('<select style="width:100%"><option value="" selected>Обрати</option></select>');
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
    });


    $('#schools thead tr:eq(1) th:eq(1)')
        // '#schools thead tr:eq(1) th:eq(2), ' +
        // '#schools thead tr:eq(1) th:eq(3)')
        .each(function (i) {
            $(this).html( '<input type="text" placeholder="Пошук" />' );
            $( 'input', this ).on( 'keyup change', function () {
                if (datatable.column(i + 1).search() !== this.value ) {
                    datatable
                        .column(i + 1)
                        .search( this.value )
                        .draw();
                }
            });
        });


$('#schools thead tr:eq(1) th:eq(2), ' +
    '#schools thead tr:eq(1) th:eq(3)').each(function(){
        d3.select(this).html("")
    });

   /*---  змінюємо таблицю по селекту ---*/
   d3.select("#region-to-show").on("change", function(){
       let seletedArea = d3.select(this).node().value;
       var filtered = data[0]
           .filter(function(d) { return d.region === seletedArea  })
           .map(function(d){
               return {
                   "Район": d.district_name,
                   "Назва школи": d.school_name,
                   "Розмір школи": d.tot_people + " oc.",
                   "Потенційна кількість інфікованих": d.pot_infections + " oc."                   
               };
           });
       datatable.clear();
       datatable.rows.add(filtered).draw();

       // select option  в другу колонку
       $('#schools thead tr:eq(1) th:eq(0)').each(function (i) {
           var column = this;
           var select = $('<select style="width:100%"><option value="" selected>Обрати</option></select>');
           $(this).html( select );
           $( 'select', this ).on( 'change', function () {
               var val = $.fn.dataTable.util.escapeRegex(
                   $(this).val()
               );
               datatable.column(i)
                   .search( this.value )
                   .draw();
           });
           datatable.column(i).data().unique().sort(function(a,b){ return d3.ascending(a, b) }).each( function (d) {
               select.append('<option value="'+d+'">'+d+'</option>')
           });
       });
   });
    
});
