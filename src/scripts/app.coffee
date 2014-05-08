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


   # Kick off the application by instantiating
   # neccessary views

   constructor: ->
      @canvasView = new CanvasView

      @mapView = new MapView
         $canvas: @canvasView.$el

      @addEventListeners()
      @mapView.render()



   # App-wide event listeners

   addEventListeners: ->
      @listenTo @mapView, MapEvent.INITIALIZED,  @onMapInitialized
      @listenTo @mapView, MapEvent.ZOOM_CHANGED, @onMapZoomChanged




   # EVENT HANDLERS
   # --------------------------------------------------------------------------------


   # Handler for map initialization events

   onMapInitialized: ->
      @canvasView.render()



   # Handler for zoom change events
   # @param {Number} zoom The current map zoom

   onMapZoomChanged: (zoom) ->
      @canvasView.updateZoom zoom



$ ->
   new App
