###*
 * Canvas Layer which represents data to be displayed on the MapView
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   5.7.14
###

MapConfig  = require '../config/MapConfig.coffee'
Event      = require '../events/Event.coffee'
View       = require '../supers/View.coffee'
ThreeScene = require './ThreeScene.coffee'


class CanvasView extends View


   # ID of DOM container for canvas layer
   # @type {String}

   id: 'canvas-layer'




   # Instantiate Three.js scenes based upon number of datapoints in the JSON

   render: ->
      @scenes = (_.range 50).map (scene) ->
         scene = new ThreeScene

      # Append to dom and start ticker
      @scenes.forEach (scene) => @$el.append scene.render().$el
      @onTick()





   # Update the canvas layer whenever there is a zoom action
   # @param {HTMLDomElement} canvasOverlay
   # @param {Object} params

   update: (canvasOverlay, params) =>
      offset = @$el.offset()

      @wageData.forEach (state, index) =>
         point = canvasOverlay._map.latLngToContainerPoint [state.latitude, state.longitude]

         if @scenes and index < @wageData.length - 1
            scene = @scenes[index]

            TweenMax.to scene.$el, .6,
               x: point.x - offset.left - (MapConfig.CANVAS_SIZE * .5)
               y: point.y - offset.top - (MapConfig.CANVAS_SIZE * .5)
               ease: Expo.easeOut






   # EVENT HANDLERS
   # --------------------------------------------------------------------------------



   # Handler for THREE.js requestAnimationFrame event loop.  Updates each
   # invidividual canvas layer in scenes array

   onTick: (event) =>
      @scenes.forEach (scene) -> scene.tick()
      requestAnimationFrame @onTick




   # Render the view layer and begin THREE.js ticker
   # @public

   onUpdateZoom: (zoom) ->
      console.log zoom





module.exports = CanvasView