/**
 * Created by yevheniia on 09.06.20.
 */
var default_zoom_u = window.innerWidth > 800 ? 5 : 4;
var default_zoom_k = window.innerWidth > 800 ? 9 : 8;

var stops_values = [
    [-3, 'white'],
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
    minZoom: default_zoom_u,
    maxZoom: default_zoom_u + 2,
    hash: false,
    tap: false,
    attributionControl: false,
    style: 'dark_matter.json',
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
    style: 'dark_matter.json',
    center: [30.5, 50.4],
    zoom: default_zoom_k // starting zoom
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
        return { "Район": d.district_name,  "Школа": d.school_name, "ЄДРПОУ": d.edrpo,  "Потенційна к-ть": d.pot_infections };
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
            { data : "Район"},
            { data: "Школа" },
            { data: "ЄДРПОУ" },
            { data: "Потенційна к-ть" }

        ]
    });


    //додаємо дані в таблицю
    datatable.rows.add(initData).draw();

    // new $.fn.dataTable.Responsive( datatable, {
    //     details: true
    // } );



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

    // select option  в другу колонку
    $('#schools thead tr:eq(1) th:eq(3)').each(function (i) {
        var column = this;
        var select = $('<select style="width:100%"><option value="" selected>Обрати</option></select>');
        $(this).html( select );
        $( 'select', this ).on( 'change', function () {
            var val = $.fn.dataTable.util.escapeRegex(
                $(this).val()
            );
            datatable.column(3)
                .search( this.value )
                .draw();
        });
        datatable.column(3).data().unique().each( function ( d) {
            select.append('<option value="'+d+'">'+d+'</option>')
        });
    });


    $('#schools thead tr:eq(1) th:eq(1)')
        .each(function () {
            $(this).html( '<input type="text" placeholder="Пошук" />' );
            $( 'input', this ).on( 'keyup change', function () {
                if (datatable.column(1).search() !== this.value ) {
                    datatable
                        .column(1)
                        .search( this.value )
                        .draw();
                }
            });
        });

    $('#schools thead tr:eq(1) th:eq(2)')
        .each(function () {
            $(this).html( '<input type="text" placeholder="Пошук" />' );
            $( 'input', this ).on( 'keyup change', function () {
                if (datatable.column(2).search() !== this.value ) {
                    datatable
                        .column(2)
                        .search( this.value )
                        .draw();
                }
            });
    });




   /*---  змінюємо таблицю по селекту ---*/
   d3.select("#region-to-show").on("change", function(){
       let seletedArea = d3.select(this).node().value;
       var filtered = data
           .filter(function(d) { return d.region === seletedArea  })
           .map(function(d){
               return {
                   "Район": d.district_name,
                   "Школа": d.school_name,
                   "ЄДРПОУ": d.edrpo,
                   "Потенційна к-ть": d.pot_infections
               };
           });
       datatable.clear();
       datatable.rows.add(filtered).draw();
   });


    [-3, 'white'],
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

    var w = 250, h = 50;

    var key = d3.select("#legend1")
        .append("svg")
        .attr("width", w + 100)
        .attr("height", h);

    var legend = key.append("defs")
        .append("svg:linearGradient")
        .attr("id", "gradient")
        .attr("x1", "0%")
        .attr("y1", "100%")
        .attr("x2", "100%")
        .attr("y2", "100%")
        .attr("spreadMethod", "pad");

    legend.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#ffffcc")
        .attr("stop-opacity", 1);

    legend.append("stop")
        .attr("offset", "10%")
        .attr("stop-color", "#ffeda0")
        .attr("stop-opacity", 1);

    legend.append("stop")
        .attr("offset", "20%")
        .attr("stop-color", "#fed976")
        .attr("stop-opacity", 1);

    legend.append("stop")
        .attr("offset", "30%")
        .attr("stop-color", "#feb24c")
        .attr("stop-opacity", 1);

    legend.append("stop")
        .attr("offset", "40%")
        .attr("stop-color", "#fd8d3c")
        .attr("stop-opacity", 1);

    legend.append("stop")
        .attr("offset", "50%")
        .attr("stop-color", "#fc4e2a")
        .attr("stop-opacity", 1);


    legend.append("stop")
        .attr("offset", "60%")
        .attr("stop-color", "#e31a1c")
        .attr("stop-opacity", 1);

    legend.append("stop")
        .attr("offset", "70%")
        .attr("stop-color", "#bd0026")
        .attr("stop-opacity", 1);

    legend.append("stop")
        .attr("offset", "80%")
        .attr("stop-color", "#800026")
        .attr("stop-opacity", 1);




    key.append("rect")
        .attr("width", w)
        .attr("height", h - 30)
        .style("fill", "url(#gradient)")
        .attr("transform", "translate(10,10)");

    var y = d3.scaleLinear()
        .range([w, 0])
        .domain([30, 0]);

    var yAxis = d3.axisBottom()
        .scale(y)
        .ticks(5);

    key.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(10,30)")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("axis title");



    
});
