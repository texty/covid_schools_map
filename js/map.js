/**
 * Created by yevheniia on 09.06.20.
 */
var default_zoom = window.innerWidth > 800 ? 5 : 5;
var min_zoom =  window.innerWidth > 800 ? 5 : 5;
var theTable;


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
                        stops: [
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
                        ]
                    },
                    'fill-outline-color': 'grey'
                }
            }, firstSymbolId);

        }

        redrawUkraineMap('MAP_cleaned_infections1000');

        d3.select("#ukraine-switch-buttons").selectAll(".map_button").on("click", function() {
            let selected_layer = d3.select(this).attr("value");
            d3.select(this.parentNode).selectAll(".map_button").classed("active", false);
            d3.select(this).classed("active", true);
            map.removeLayer('schools_data');
            redrawUkraineMap(selected_layer);
        });


        map.on('click', 'schools_data', function (e) {
            console.log(e.features[0].properties);
            let clicked = e.features[0].properties.MAP_cleaned_registration_region;
            let region = e.features[0].properties.MAP_cleaned_registration_area;
            let filtered = data.filter(function(d) { return d.region === region && d.district_name === clicked });
            d3.select("#clicked_region").html(region + ", " + clicked);


            theTable.destroy();
            d3.select("#schools").selectAll("thead").remove();
            d3.select("#schools").selectAll("tbody").remove();
            drawTable(filtered);
        });



    });




    /* карта києва */
    map2.on('load', function () {

        var layers2 = map2.getStyle().layers;
        var firstSymbolId2;

        for (var i = 0; i < layers2.length; i++) {
            if (layers2[i].type === 'symbol') {
                firstSymbolId2 = layers2[i].id;
                break;
            }
        }

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
                        stops: [
                            [-1, '#f0f0f0'],
                            [0, '#ffffff'],
                            [1, '#ffeda0'],
                            [2, "#fed976"],
                            [3, "#feb24c"],
                            [5, "#fd8d3c"],
                            [8, "#fc4e2a"],
                            [12, "#e31a1c"],
                            [16, "#e31a1c"],
                            [20, "#bd0026"],
                            [23, "#800026"]
                        ]
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

        map2.on('click', 'schools_kyiv', function(e) {
            let clicked = e.features[0].properties.NAME_2;
            let region = e.features[0].properties.KYIV_registration_area;
            let filtered = data.filter(function(d) { return d.region === "м. Київ" && d.district_name === clicked + " район" });
            d3.select("#clicked_region").html(region + ", " + clicked + " район");


            theTable.destroy();
            d3.select("#schools").selectAll("thead").remove();
            d3.select("#schools").selectAll("tbody").remove();
            drawTable(filtered);
        });






   //  function sourceCallback() {
   //      if (map.getSource('elections_06') && map.isSourceLoaded('elections_06') && map.isStyleLoaded()) {
   //          d3.select("#spinner").remove();
   //      }
   //  }
   //
   //
   // map.on('sourcedata', sourceCallback);


    var nav = new mapboxgl.NavigationControl();
    // var nav2 = new mapboxgl.NavigationControl();
    //
    map.addControl(nav, 'top-left');
    // map2.addControl(nav2, 'top-left');

});





    var tableData = data.filter(function(d) { return d.region === "м. Київ" && d.district_name === "Оболонський район" });

    d3.select("#clicked_region").html("м. Київ, Оболонський район");

    drawTable(tableData);

    function drawTable(df){

        df.sort(function(a,b) {return b.pot_infections - a.pot_infections});

        var table = d3.select('#schools');

        var tableHead = table.append('thead');
        var tableBody = table.append('tbody');


        //table header
        tableHead.append('tr').selectAll('th')
            .data(["Назва школи", "ЄДРПОУ", "Хворі"]).enter()
            .append('th')
            .attr("data-th",function (d) {
                return d
            })
            .text(function (d) { return d; });


        //table body
        var rows = tableBody.selectAll('tr')
            .data(df)
            .enter()
            .append('tr')
            .attr("data", function(d){
                return d.region
            });


        //додаємо іконку-вказівник сайту, лінк для переходу і курсор-поінтер тільки якщо є сайт

        // rows.append('td')
        //     .attr("data-th", "Область")
        //     .text(function (d) {
        //         return d.region;
        //     });

        // rows.append('td')
        //     .attr("data-th", "Район/місто")
        //     .text(function (d) {
        //         return d.district_name;
        //    });

        rows.append('td')
            .attr("data-th", "Школа")
            .text(function (d) {
                return d.school_name ;
            });

        rows.append('td')
            .attr("data-th", "ЄДРПОУ")
            .text(function (d) {
                return d.edrpo;
            });

        rows.append('td')
            .attr("data-th", "Потенційна к-ть хворих")
            .text(function (d) {
                return d.pot_infections;
            });

        //theTable.destroy();

        //налаштування для таблиці - мова, порядок сортування, довжина, приховані колонки
        theTable = $('#schools').DataTable({
            responsive: true,
            "order": [[0, "desc"]],
            "pageLength": 10,
            "language": {
                "url": "//cdn.datatables.net/plug-ins/9dcbecd42ad/i18n/Russian.json"
            },
            "columnDefs": [
                {
                    "targets": [2],
                    "visible": true,
                    "searchable": true
                }
            ]
        });

        // new $.fn.dataTable.Responsive(theTable, {
        //     details: true
        // } );

        // //додаємо пошук по кожній колонці (з data-table official)
        // $('#schools thead tr').clone(true).appendTo( '#schools thead' );
        //
        // $('#schools thead tr:eq(1) th:eq(0)')
        //     .each(function (i) {
        //         $(this).html( '<input type="text" placeholder="Поиск" />' );
        //         $( 'input', this ).on( 'keyup change', function () {
        //             if (theTable.column(i).search() !== this.value ) {
        //                 theTable
        //                     .column(i)
        //                     .search( this.value )
        //                     .draw();
        //             }
        //         });
        //     });
        //
        // $('#schools thead tr:eq(1) th:eq(2), ' +
        //     '#schools thead tr:eq(1) th:eq(3), ' +
        //     '#schools thead tr:eq(1) th:eq(4)')
        //     .each(function (i) {
        //         $(this).html( '<input type="text" placeholder="Поиск" />' );
        //         $( 'input', this ).on( 'keyup change', function () {
        //             if (theTable.column(i+2).search() !== this.value ) {
        //                 theTable
        //                     .column(i+2)
        //                     .search( this.value )
        //                     .draw();
        //             }
        //         });
        //     });
        //
        //
        //
        //
        //
        //
        // //select option  в другу колонку
        // $('#schools thead tr:eq(1) th:eq(0), ' +
        //     '#schools thead tr:eq(1) th:eq(1)').each(function (i) {
        //     var column = this;
        //     var select = $('<select><option value="" selected></option></select>');
        //     $(this).html( select );
        //
        //     $( 'select', this ).on( 'change', function () {
        //         var val = $.fn.dataTable.util.escapeRegex(
        //             $(this).val()
        //         );
        //         console.log(val);
        //
        //         theTable
        //             .column(i)
        //             .search( this.value )
        //             .draw();
        //     });
        //
        //
        //     theTable.column( i ).data().unique().each( function ( d, j ) {
        //         select.append( '<option value="'+d+'">'+d+'</option>' )
        //     });


        //});


    }

    
    
    
});
