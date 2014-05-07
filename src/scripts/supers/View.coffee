###*
 * View superclass for shared functionality
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   5.7.14
###

class View


   # The view element
   # @type {$}

   $el: null



   # View constructor which accepts parameters and merges them
   # into the view prototype for easy access. Merges backbones
   # Event system in as well for observer and event dispatch
   # @param {Object} options

   constructor: (options) ->
      _.extend @, _.defaults( options = options || @defaults, @defaults || {} )

      # Extend Backbones events by merging into the View prototype
      _.extend View::, Backbone.Events

      if typeof @id isnt undefined and @className is undefined
         @$el = $ "##{@id}"

      else if @className isnt undefined
         @$el = $ ".#{@className}"



   # Renders the view to the dom and returns itself
   # @paranm {Object} options

   render: (options) ->

      @


module.exports = View