$(function(){
  var app = {
    center: [-2.0, 18.1],
    zoom: 9,
    deforestationPointsUrl: 'https://a.tiles.mapbox.com/v4/crowdcover.m42g55ag/features.json?access_token=pk.eyJ1IjoiY3Jvd2Rjb3ZlciIsImEiOiI3akYtNERRIn0.uwBAdtR6Zk60Bp3vTKj-kg',

    init: function(){
      mapboxgl.accessToken = 'pk.eyJ1IjoiY3Jvd2Rjb3ZlciIsImEiOiI3akYtNERRIn0.uwBAdtR6Zk60Bp3vTKj-kg';
      
      this.map = new mapboxgl.Map({
        container: 'map', // container id
        style: 'https://www.mapbox.com/mapbox-gl-styles/styles/outdoors-v7.json', //stylesheet location
        center: app.center, // starting position
        zoom: app.zoom, // starting zoom
        // hash: true
      });

      this.map.addControl(new mapboxgl.Navigation({position: 'topleft'}));

      app.loadData(function(data){
        app.renderData(data);
        app.populateSidebar(data);
      });

      app.map.on('click', app.mapClick);

      $('#sidebar').on('click', '.points-item', app.itemClick);

    },

    mapClick: function(e){
      app.mapClickPoint = e.point;
      app.map.featuresAt(e.point, {radius: 20}, function(err, features){
        if(err) throw err;

        var featureIds = features.map(function(f){
          return f.properties.id
        });

        $('.points-item').each(function(idx, el){
          var $el = $(el);
          if($el.hasClass('shown') && featureIds.indexOf(el.id) === -1){
            // if sidebarItem is shown and was not a clicked feature, hide it
            $el.removeClass('shown');
            var latlng = new mapboxgl.LatLng(app.center[0], app.center[1])
            app.map.easeTo(latlng, app.zoom);
          }else if(! $el.hasClass('shown') && featureIds.indexOf(el.id) > -1){
            // else, if sidebarItem is not shown and was a clicked feature, show it
            $el.addClass('shown');
            var latLng = app.map.unproject(app.mapClickPoint);
            app.map.easeTo(latLng, 13);
          }
        });
      });
    },

    itemClick: function(e){
      var $this = $(this);
      $this.addClass('shown');
    },

    loadData: function(callback){
      $.getJSON(app.deforestationPointsUrl, function(data){
        app.map.on('load', function(){
          console.log('load');
          callback(data);
        }); 
      });
    },

    renderData: function(geojson){
      app.pointsGL = new mapboxgl.GeoJSONSource({
        data: geojson
      });
      app.map.addSource('deforestation-points', app.pointsGL);

      app.pointsLayer = app.map.addLayer({
        "id": "deforestation-points",
        "type": "symbol",
        "source": "deforestation-points",
        "interactive": true,
        "layout": {
          "icon-image": "logging-12",
          "text-field": "{Village}",
          "text-font": "Open Sans Semibold, Arial Unicode MS Bold",
          "text-offset": [0, 0.6],
          "text-anchor": "top"
        },
        "paint": {
          "text-size": 14,
          "text-color": '#524A3C',
          "text-halo-color": 'rgba(255,255,255,1)',
          "text-halo-width": 1,
        }
      });
    },

    populateSidebar: function(geojson){
      $.each(geojson.features, function(idx, feature){
        var properties = feature.properties,
            pointItem = $(['<div class="points-item keyline-bottom pas">',
                             '<h3 class="quiet">', properties['Village'], '</h3>',
                             '<div class="image-container">',
                               '<img class="mts" src="', properties.photo_url ,'" />',
                             '</div>',
                           '</div>'].join(''));

        pointItem.attr('id', properties['id']);
        $('.points-container').append(pointItem);
      })
    }

  };

  window.app = app;
  app.init();

});
