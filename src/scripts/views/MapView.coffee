###*
 * MapBox map layer
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   5.7.14
###

MapConfig = require '../config/MapConfig.coffee'


class MapView


   # Proxy L.mapbox namespace for easy access
   # @type {L.mapbox}

   mapbox: null


   # MapBox map layer
   # @type {L.Map}

   mapLayer: null


   # Ref to the Leaflet layer to insert map before
   # @type {$}

   $leafletPane: null


   # Ref to the canvas DOM element
   # @type {L.Map}

   $canvas: null



   constructor: (options) ->
      @mapbox = L.mapbox

      @mapLayer = @mapbox.map 'map', MapConfig.ID
         .setView    MapConfig.INIT.location, MapConfig.INIT.zoom
         .addControl @mapbox.geocoderControl MapConfig.ID

      @insertCanvasLayer()



   insertCanvasLayer: ->
      $leafletPane = $ "#map > .leaflet-map-pane > .leaflet-objects-pane"
      $canvas      = $ '#canvas-layer'

      $canvas.prependTo $leafletPane
      $canvas.css 'z-index', 5


module.exports = MapView