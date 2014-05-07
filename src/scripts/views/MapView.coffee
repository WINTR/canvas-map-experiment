###*
 * MapBox map layer
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   5.7.14
###

MapConfig  = require '../config/MapConfig.coffee'
Event      = require '../events/Event.coffee'
CanvasView = require './CanvasView.coffee'
View       = require '../supers/View.coffee'


class MapView extends View


   # ID of the view
   # @type {String}

   id: 'map'


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



   # Initialize the MapLayer and kick off Canvas layer repositioning
   # @param {Object} options Default options to pass into the app

   constructor: (options) ->
      super options

      @mapbox = L.mapbox

      @mapLayer = @mapbox.map @id, MapConfig.ID
         .setView    MapConfig.INIT.location, MapConfig.INIT.zoom
         .addControl @mapbox.geocoderControl MapConfig.ID

      @insertCanvasLayer()



   insertCanvasLayer: ->
      $leafletPane = $ "#map > .leaflet-map-pane > .leaflet-objects-pane"
      $canvas      = $ '#canvas-layer'

      $canvas.prependTo $leafletPane
      $canvas.css 'z-index', 5

      @trigger Event.MAP_INITIALIZED




module.exports = MapView