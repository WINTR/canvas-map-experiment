###*
 * Canvas Layer which represents data to be displayed on the MapView
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   5.7.14
###

MapConfig  = require '../config/MapConfig.coffee'
View       = require '../supers/View.coffee'
ThreeScene = require './ThreeScene.coffee'


class CanvasView extends View


   # ID of DOM container for canvas layer
   # @type {String}

   id: 'canvas-layer'



   # Instantiate Three.js scenes based upon number of datapoints in the JSON

   render: ->

      # Create scenes
      @scenes = (_.range @wageData.length).map (scene, index) =>
         scene = new ThreeScene
            index: index
            wage: @wageData[index]

      # Append to dom and start ticker
      @scenes.forEach (scene) =>
         @$el.append scene.render().$el

      # Wait for appending and then sort / render
      _.defer =>

         sorted = _.sortBy @scenes, (a, b) ->
            return a.$el.position().top

         sorted.forEach (scene, index) ->
            scene.$el.css 'z-index', index

         @onTick()





   # Update the canvas layer whenever there is a zoom action
   # @param {HTMLDomElement} canvasOverlay
   # @param {Object} params

   update: (canvasOverlay, params) =>
      {left, top} = @$el.offset()

      @wageData.forEach (state, index) =>
         {x, y} = canvasOverlay._map.latLngToContainerPoint [state.latitude, state.longitude]

         if @scenes and index < @wageData.length
            scene  = @scenes[index]
            $el    = scene.$el
            $stat = scene.$stat

            x = x - left - (MapConfig.CANVAS_SIZE * .5)
            y = y - top  - (MapConfig.CANVAS_SIZE * .5)

            TweenMax.to $el,   .6, x: x, y: y, ease: Expo.easeOut
            TweenMax.to $stat, .6, x: x, y: y, ease: Expo.easeOut if $stat?.length





   updateCameraAngle: =>
      @scenes.forEach (scene, index) =>
         scene  = @scenes[index]
         offset = scene.$el.offset()

         # Compute the distance to the center of the window.  Used to create
         # sway multiples for perspective camera angle

         dist =
            x: ((window.innerWidth  * .5) - (offset.left + (MapConfig.CANVAS_SIZE * .5))) * .01
            y: ((window.innerHeight * .5) - (offset.top  + (MapConfig.CANVAS_SIZE * .5))) * .01

         scene.updateCameraAngle( dist.x, -dist.y )





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





   onMapDrag: ->
      @updateCameraAngle()
      @scenes.forEach (scene) -> scene.tick()










module.exports = CanvasView