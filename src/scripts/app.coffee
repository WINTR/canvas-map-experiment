###*
 * Map Canvas application bootstrapper
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



   # Kick off the application by instantiating
   # neccessary views

   constructor: (options) ->
      super options

      @canvasView = new CanvasView
         wageData: @wageData

      @mapView = new MapView
         $canvas: @canvasView.$el
         canvasUpdateMethod: @canvasView.update

      @addEventListeners()
      @mapView.render()



   # App-wide event listeners

   addEventListeners: ->
      @listenTo @mapView,    MapEvent.INITIALIZED,  @onMapInitialized
      @listenTo @mapView,    MapEvent.ZOOM_CHANGED, @onMapZoomChanged
      @listenTo @canvasView, MapEvent.MOVE,         @onMapMove





   # EVENT HANDLERS
   # --------------------------------------------------------------------------------


   # Handler for map initialization events

   onMapInitialized: ->
      @canvasView.render()



   # Handler for zoom change events
   # @param {Number} zoom The current map zoom

   onMapZoomChanged: (zoom) ->
      @canvasView.updateZoom zoom




# Kick off App and load external wage data

$ ->
   $.getJSON 'assets/data/wages.json', (wageData) ->
      new App
         wageData: wageData
