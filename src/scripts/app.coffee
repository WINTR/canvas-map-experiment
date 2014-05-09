###*
 * Map Canvas application bootstrapperr
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   5.7.14
###

MapEvent   = require './events/MapEvent.coffee'
View       = require './supers/View.coffee'
MapView    = require './views/MapView.coffee'
CanvasView = require './views/CanvasView.coffee'


class App extends View


   # MapBox map view containing all map related functionality
   # @type {L.MapBox}

   mapView: null


   # Canvas view containing all canvas related functionality
   # @type {CanvasView}

   canvasView: null


   # JSON Data of wages and lat, lng by state
   # @type {Array}

   wageData: null




   # Initialize app by creating a canvas view and a mapview

   constructor: (options) ->
      super options

      @canvasView = new CanvasView
         wageData: @wageData

      @mapView = new MapView
         $canvas: @canvasView.$el
         canvasUpdateMethod: @canvasView.update

      @addEventListeners()
      @mapView.render()





   # Add app-wide event listeners

   addEventListeners: ->
      @listenTo @mapView,    MapEvent.INITIALIZED,  @onMapInitialized
      @listenTo @mapView,    MapEvent.ZOOM_CHANGED, @onMapZoomChanged
      @listenTo @mapView,    MapEvent.DRAG,         @onMapDrag
      #$(window).on          'mousemove',            @onMouseMove





   # EVENT HANDLERS
   # --------------------------------------------------------------------------------



   # Handler for map initialization events.  Received from the MapView which
   # kicks off canvas rendering and 3.js instantiation

   onMapInitialized: ->
      @canvasView.render()





   # Handler for zoom change events
   # @param {Number} zoom The current map zoom

   onMapZoomChanged: (zoom) ->





   onMapDrag: ->
      @canvasView.onMapDrag()





   onMouseMove: (event) =>
      @canvasView.onMouseMove
         x: event.clientX
         y: event.clienY




# Kick off App and load external wage data

$ ->
   $.getJSON 'assets/data/wages.json', (wageData) ->
      new App
         wageData: wageData
