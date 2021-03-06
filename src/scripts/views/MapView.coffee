###*
 * MapBox map layer
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   5.7.14
###

MapConfig  = require '../config/MapConfig.coffee'
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
      @$map = $ '#map'

      @mapLayer = @mapbox.map @id, MapConfig.ID, MapConfig.MAP_OPTIONS
         .setView    MapConfig.INIT.location, MapConfig.INIT.zoom
         .addControl @mapbox.geocoderControl MapConfig.ID

      # Add a canvas overlay and pass in an update method
      L.canvasOverlay()
         .drawing @canvasUpdateMethod
         .addTo @mapLayer
         .redraw()

      TweenMax.set @$map, autoAlpha: 0

      _.defer =>
         @mapLayer.setView MapConfig.INIT.location, MapConfig.INIT.zoom + 1

         TweenMax.to @$map, .7,
            autoAlpha: 1
            delay: .5
            ease: Linear.easeNone

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
      @$leafletPane = $ ".leaflet-objects-pane"
      @$canvas.prependTo @$leafletPane
      @$canvas.css 'z-index', 5

      @trigger MapEvent.INITIALIZED




module.exports = MapView