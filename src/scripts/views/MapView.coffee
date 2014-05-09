###*
 * MapBox map layer
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   5.7.14
###

MapConfig  = require '../config/MapConfig.coffee'
Event      = require '../events/Event.coffee'
MapEvent   = require '../events/MapEvent.coffee'
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
      @map    = @mapbox.map



   # Renders the view by creating the Map layer and inserting the
   # canvas DOM layer into Leaflet's hiarchy

   render: ->
      @mapLayer = @mapbox.map @id, MapConfig.ID
         .setView    MapConfig.INIT.location, MapConfig.INIT.zoom
         .addControl @mapbox.geocoderControl MapConfig.ID

      # Add a canvas overlay and pass in an update method
      L.canvasOverlay()
         .drawing @canvasUpdateMethod
         .addTo @mapLayer
         .redraw()

      @insertCanvasLayer()
      @addEventListeners()




   addEventListeners: ->
      @mapLayer.on MapEvent.ZOOM_CHANGED, @onZoomChanged
      @mapLayer.on MapEvent.DRAG,         @onMapDrag






   # EVENT HANDLERS
   # --------------------------------------------------------------------------------


   # Handler for zoom change events
   # @param {Object} event

   onZoomChanged: (event) =>
      @trigger MapEvent.ZOOM_CHANGED, @mapLayer.getZoom()





   onMapDrag: (event) =>
      @trigger MapEvent.DRAG






   # PRIVATE METHODS
   # --------------------------------------------------------------------------------


   # Moves the canvas layer into the Leaflet DOM

   insertCanvasLayer: ->
      @$leafletPane = $ "#map > .leaflet-map-pane > .leaflet-objects-pane"
      @$canvas.prependTo @$leafletPane
      @$canvas.css 'z-index', 5

      @trigger MapEvent.INITIALIZED




module.exports = MapView