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

      # Merge passed props or instance defaults
      _.extend @, _.defaults( options = options || @defaults, @defaults || {} )

      # Extend Backbones events by merging into the View prototype
      _.extend View::, Backbone.Events

      # Mimick Backbone's $el by checking if className or id is defined on ivew
      if typeof @id isnt undefined and @className is undefined
         @$el = $ "##{@id}"

         if @$el.length is 0
            @$el = $("<div id=#{@id} />")

      else if @className isnt undefined
         @$el = $ ".#{@className}"

         if @$el.length is 0
            @$el = $("<div class=#{@className} />")



   # Renders the view to the dom and returns itself
   # @paranm {Object} options

   render: (options) ->

      @


module.exports = View