/**
 * Created by yevheniia on 09.06.20.
 */
var default_zoom = window.innerWidth > 800 ? 6 : 5;
var min_zoom =  window.innerWidth > 800 ? 6 : 5;
var theTable;


mapboxgl.accessToken = 'pk.eyJ1IjoiZHJpbWFjdXMxODIiLCJhIjoiWGQ5TFJuayJ9.6sQHpjf_UDLXtEsz8MnjXw';
var map = new mapboxgl.Map({
    container: 'map',
    minZoom: default_zoom,
    maxZoom: default_zoom,
    hash: false,
    tap: false,
    attributionControl: false,
    style: 'dark_matter.json',
    center: [31.5, 48.5],
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
        tiles: ["https://texty.github.io/covid_schools_map/tiles/schools/{z}/{x}/{y}.pbf"]
    });



    map.addLayer({
        "id": "schools_data",
        'type': 'fill',
        'minzoom': 4,
        'maxzoom': 10,
        'source': "schools",
        "source-layer": "schools_4326",
        // 'layout': {
        //     'line-join': 'round',
        //     'line-cap': 'round'
        //
        // },
        "paint": {
            'fill-color': {
                property: 'Odesa_prob',
                stops: [[0, '#fff'], [0.003, 'yellow'], [0.004, "orange"], [0.005, "red"]]
            },
            'fill-outline-color': 'lightgrey'

            // 'line-color': [
            //     'match',
            //     ['get', 'color'],
            //     'green', '#E6F164',
            //     'red', '#F47874',
            //     '#5B95FF'
            // ],
            //'line-width': 1
        }
    }, firstSymbolId);


    map.on('click', 'schools_data', function(e) {
        console.log(e.features[0].properties.ADM2_UA);
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
    var nav2 = new mapboxgl.NavigationControl();

    map.addControl(nav, 'top-left');
    map2.addControl(nav2, 'top-left');


});


d3.csv("data/TABLE.csv").then(function(data) {

    var tableData = data.filter(function(d) { return d.region === "м. Київ" });

    var table;

    table = d3.select('#table');

    var tableHead = table.append('thead'),
        tableBody = table.append('tbody');


    //table header
    tableHead.append('tr').selectAll('th')
        .data(["Район/місто", "Назва школи", "ЄДРПОУ", "Хворі"]).enter()
        .append('th')
        .attr("data-th",function (d) {
           return d
        })
        .text(function (d) { return d; });

    //table body
    var rows = tableBody.selectAll('tr')
        .data(tableData)
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

    rows.append('td')
        .attr("data-th", "Район/місто")
        .text(function (d) {
            return d.district_name;
        });

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


    //налаштування для таблиці - мова, порядок сортування, довжина, приховані колонки
    theTable = $('#table').DataTable({
        responsive: true,
        "order": [[0, "desc"]],
        "pageLength": 25,
        "language": {
            "url": "//cdn.datatables.net/plug-ins/9dcbecd42ad/i18n/Russian.json"
        },
        "columnDefs": [
            {
                "targets": [3],
                "visible": true,
                "searchable": true
            }
        ]
    });

    new $.fn.dataTable.Responsive( theTable, {
        details: true
    } );

    //додаємо пошук по кожній колонці (з data-table official)
    $('#table thead tr').clone(true).appendTo( '#table thead' );

    $('#table thead tr:eq(1) th:eq(0)')
        .each(function (i) {
            $(this).html( '<input type="text" placeholder="Поиск" />' );
            $( 'input', this ).on( 'keyup change', function () {
                if (theTable.column(i).search() !== this.value ) {
                    theTable
                        .column(i)
                        .search( this.value )
                        .draw();
                }
            });
        });

    $('#table thead tr:eq(1) th:eq(2), ' +
        '#table thead tr:eq(1) th:eq(3), ' +
        '#table thead tr:eq(1) th:eq(4)')
        .each(function (i) {
            $(this).html( '<input type="text" placeholder="Поиск" />' );
            $( 'input', this ).on( 'keyup change', function () {
                if (theTable.column(i+2).search() !== this.value ) {
                    theTable
                        .column(i+2)
                        .search( this.value )
                        .draw();
                }
            });
        });






    //select option  в другу колонку
    $('#table thead tr:eq(1) th:eq(0), ' +
        '#table thead tr:eq(1) th:eq(1)').each(function (i) {
        var column = this;
        var select = $('<select><option value="" selected></option></select>');
        $(this).html( select );

        $( 'select', this ).on( 'change', function () {
            var val = $.fn.dataTable.util.escapeRegex(
                $(this).val()
            );
            console.log(val);

            theTable
                .column(i)
                .search( this.value )
                .draw();
        });


        theTable.column( i ).data().unique().each( function ( d, j ) {
            select.append( '<option value="'+d+'">'+d+'</option>' )
        });


    });

    
    
    
    
});
