###*
 * Individual Three.js Scenes
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   5.8.14
###

WintrGradient = require '../utils/WintrGradient.coffee'
MapConfig     = require '../config/MapConfig.coffee'
View          = require '../supers/View.coffee'
template      = require './templates/scene-template.hbs'


class ThreeScene extends View


   # Class name of DOM container for individual Three.js scenes
   # @type {String}

   className: 'scene'




   constructor: (options) ->
      super options

      @setupThreeJSRenderer()




   render: ->
      size = MapConfig.CANVAS_SIZE

      # Add Scene canvas to the dom
      _.defer =>

         @renderer.setSize size, size

         # Append three.js canvas
         @$el.append @renderer.domElement

         # Data / stats
         @$el.parent().append template
            index: @index
            state: @wage.state
            wage: "$#{@wage.wage.toFixed(2)}"

         @$stat = @$el.parent().find "#stat-#{@index}"

         TweenMax.fromTo @$stat, .8, autoAlpha: 0, scale: 1, top: 100,
            immediateRender: true
            top: 140
            autoAlpha: 1
            scale: 1
            ease: Expo.easeOut
            delay: .7 + Math.random() * .6

         @addEventListeners()

      @



   addEventListeners: ->
      @$stat.on 'mouseover', @onMouseOver
      @$stat.on 'mouseout',  @onMouseOut




   tick: ->
      @cube.rotation.y += .01 if @cube
      @renderer.render @scene, @camera




   updateCameraAngle: (x, y) ->
      @camera.position.x = x
      @camera.position.y = y






   # EVENT HANDLERS
   # --------------------------------------------------------------------------------



   onMouseOver: (event) =>
      @$el.parent().append @$stat

      TweenMax.to @$stat, .4,
         backgroundColor: '#fff'
         scale: 1.3
         ease: Expo.easeOut

      TweenMax.to @$stat.find('.wage'), .4,
         color: '#000'




   onMouseOut: (event) =>
      TweenMax.to @$stat, .4,
         backgroundColor: '#333'
         scale: 1
         ease: Expo.easeOut

      TweenMax.to @$stat.find('.wage'), .4,
         color: '#fff'

      TweenMax.to @$stat.find('.state'), .4,
         color: '#60a3d7'
         overwrite: 'all'








   # PRIVATE METHODS
   # --------------------------------------------------------------------------------



   setupThreeJSRenderer: ->
      @height = if @wage.wage isnt 0 then @wage.wage * 3 else 2

      cameraAttributes =
         angle: 45
         aspect: MapConfig.CANVAS_SIZE / MapConfig.CANVAS_SIZE
         near: .1
         far: 100

      # Scene parameters
      @scene    = new THREE.Scene
      @camera   = new THREE.PerspectiveCamera cameraAttributes.angle, cameraAttributes.aspect, cameraAttributes.near, cameraAttributes.far
      @renderer = new THREE.CanvasRenderer alpha: true

      @scene.add @returnRandomColorCube()

      # Update view
      @renderer.setClearColor 0x000000, 0
      @camera.position.z = 50




   returnGradient: (wage) =>
      if wage < 5                 then return WintrGradient.generate WintrGradient.yellowPink()
      if wage < 6   and wage > 5  then return WintrGradient.generate WintrGradient.yellowPink()
      if wage < 7   and wage > 6  then return WintrGradient.generate WintrGradient.yellowAqua()
      if wage < 8   and wage > 7  then return WintrGradient.generate WintrGradient.yellowPink()
      if wage < 9   and wage > 8  then return WintrGradient.generate WintrGradient.orangePink()
      if wage < 25  and wage > 9  then return WintrGradient.generate WintrGradient.yellowGreen()




   randomColor: ->
      letters = '0123456789ABCDEF'.split ''
      color = '#'
      for i in [0..5]
         color += letters[Math.floor(Math.random() * 16)]

      return color




   returnRandomColorCube: ->
      @geometry = new THREE.BoxGeometry 2, @height, 2

      for i in [0..@geometry.faces.length - 1] by +2
         hex = Math.random() * 0xffffff
         @geometry.faces[i].color.setHex hex
         @geometry.faces[i + 1].color.setHex hex

      @material = new THREE.MeshBasicMaterial vertexColors: THREE.FaceColors, overdraw: 0.5
      @cube = new THREE.Mesh @geometry, @material
      @cube.rotation.x = 20
      @cube.rotation.y = 20

      return @cube




   returnGradientCube: ->
      @geometry = new THREE.BoxGeometry 2, @height, 2, 2, 2, 2

      texture  = new THREE.Texture @returnGradient @wage.wage
      texture.needsUpdate = true

      material = new THREE.MeshBasicMaterial( { map: texture, overdraw: 0.5 } )
      @cube = new THREE.Mesh( @geometry, material )
      @cube.rotation.x = 20
      @cube.rotation.y = 20

      return @cube






module.exports = ThreeScene