###*
 * Canvas Layer which represents data to be displayed on the MapView
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   5.7.14
###

Event = require '../events/Event.coffee'
View  = require '../supers/View.coffee'


class CanvasView extends View


   id: 'canvas-layer'


   constructor: (options) ->
      super options

      cameraAttributes =
         angle: 45
         aspect: @$el.width() / @$el.height()
         near: .1
         far: 1000

      @scene    = new THREE.Scene
      @camera   = new THREE.PerspectiveCamera cameraAttributes.angle, cameraAttributes.aspect, cameraAttributes.near, cameraAttributes.far
      @renderer = new THREE.WebGLRenderer alpha: true
      @renderer.setClearColor 0x000000, 0
      @geometry = new THREE.BoxGeometry 20, 20, 20
      @material = new THREE.MeshBasicMaterial color: 0xFF0000, wireframe: true
      @cube     = new THREE.Mesh @geometry, @material

      @scene.add @cube

      @camera.position.z = 50


   render: ->
      @renderer.setSize @$el.width(), @$el.height()
      @$el.append @renderer.domElement
      @tick()



   tick: =>
      @cube.rotation.x += .01
      @cube.rotation.y += .01

      @renderer.render @scene, @camera
      requestAnimationFrame @tick




module.exports = CanvasView