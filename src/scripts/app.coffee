###*
 * Map Canvas application bootstrapper
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   5.7.14
###

Event      = require './events/Event.coffee'
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
      @listenTo @mapView, Event.MAP_INITIALIZED, @onMapInitialized




   # EVENT HANDLERS
   # --------------------------------------------------------------------------------


   # Handler for map initialization events

   onMapInitialized: ->
      @canvasView.render()



$ ->
   new App
