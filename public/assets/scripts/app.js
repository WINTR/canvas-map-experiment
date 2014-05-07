(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

/**
 * Map app configuration options
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   5.7.14
 */
var MapConfig;

MapConfig = {
  INIT: {
    location: [47.61356975397398, -122.34374999999999],
    zoom: 9
  }
};

module.exports = MapConfig;


},{}],2:[function(require,module,exports){

/**
 * Map Canvas application bootstrapper
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   5.7.14
 */
var MapCanvasApp, MapView;

MapView = require('./views/MapView.coffee');

MapCanvasApp = (function() {
  function MapCanvasApp() {
    new MapView;
  }

  return MapCanvasApp;

})();

$(function() {
  return new MapCanvasApp;
});


},{"./views/MapView.coffee":3}],3:[function(require,module,exports){

/**
 * MapBox map layer
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   5.7.14
 */
var MapConfig, MapView;

MapConfig = require('../config/MapConfig.coffee');

MapView = (function() {
  MapView.prototype.mapLayer = null;

  function MapView(options) {
    this.mapLayer = L.mapbox.map('map', 'examples.map-9ijuk24y');
    this.mapLayer.setView(MapConfig.INIT.location, MapConfig.INIT.zoom);
  }

  return MapView;

})();

module.exports = MapView;


},{"../config/MapConfig.coffee":1}]},{},[2])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvY2hyaXMvU2l0ZXMvV0lOVFIvRXhwZXJpbWVudHMvY2FudmFzLW1hcC1leHBlcmltZW50L25vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvV0lOVFIvRXhwZXJpbWVudHMvY2FudmFzLW1hcC1leHBlcmltZW50L3NyYy9zY3JpcHRzL2NvbmZpZy9NYXBDb25maWcuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL1dJTlRSL0V4cGVyaW1lbnRzL2NhbnZhcy1tYXAtZXhwZXJpbWVudC9zcmMvc2NyaXB0cy9pbml0aWFsaXplLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9XSU5UUi9FeHBlcmltZW50cy9jYW52YXMtbWFwLWV4cGVyaW1lbnQvc3JjL3NjcmlwdHMvdmlld3MvTWFwVmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUFBOzs7OztHQUFBO0FBQUEsSUFBQSxTQUFBOztBQUFBLFNBUUEsR0FNRztBQUFBLEVBQUEsSUFBQSxFQUNHO0FBQUEsSUFBQSxRQUFBLEVBQVUsQ0FBQyxpQkFBRCxFQUFvQixDQUFBLGtCQUFwQixDQUFWO0FBQUEsSUFDQSxJQUFBLEVBQU0sQ0FETjtHQURIO0NBZEgsQ0FBQTs7QUFBQSxNQW9CTSxDQUFDLE9BQVAsR0FBaUIsU0FwQmpCLENBQUE7Ozs7QUNBQTtBQUFBOzs7OztHQUFBO0FBQUEsSUFBQSxxQkFBQTs7QUFBQSxPQU9BLEdBQVUsT0FBQSxDQUFRLHdCQUFSLENBUFYsQ0FBQTs7QUFBQTtBQWVnQixFQUFBLHNCQUFBLEdBQUE7QUFDVixJQUFBLEdBQUEsQ0FBQSxPQUFBLENBRFU7RUFBQSxDQUFiOztzQkFBQTs7SUFmSCxDQUFBOztBQUFBLENBbUJBLENBQUUsU0FBQSxHQUFBO1NBQ0MsR0FBQSxDQUFBLGFBREQ7QUFBQSxDQUFGLENBbkJBLENBQUE7Ozs7QUNBQTtBQUFBOzs7OztHQUFBO0FBQUEsSUFBQSxrQkFBQTs7QUFBQSxTQU9BLEdBQVksT0FBQSxDQUFRLDRCQUFSLENBUFosQ0FBQTs7QUFBQTtBQWdCRyxvQkFBQSxRQUFBLEdBQVUsSUFBVixDQUFBOztBQUdhLEVBQUEsaUJBQUMsT0FBRCxHQUFBO0FBQ1YsSUFBQSxJQUFDLENBQUEsUUFBRCxHQUFZLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBVCxDQUFhLEtBQWIsRUFBb0IsdUJBQXBCLENBQVosQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLFFBQVEsQ0FBQyxPQUFWLENBQWtCLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBakMsRUFBMkMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUExRCxDQURBLENBRFU7RUFBQSxDQUhiOztpQkFBQTs7SUFoQkgsQ0FBQTs7QUFBQSxNQXdCTSxDQUFDLE9BQVAsR0FBaUIsT0F4QmpCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIiMjIypcbiAqIE1hcCBhcHAgY29uZmlndXJhdGlvbiBvcHRpb25zXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICA1LjcuMTRcbiMjI1xuXG5cbk1hcENvbmZpZyA9XG5cblxuICAgIyBNYXAgbGFuZHMgb24gU2VhdHRsZSBkdXJpbmcgaW5pdGlhbGl6YXRpb25cbiAgICMgQHR5cGUge0FycmF5fVxuXG4gICBJTklUOlxuICAgICAgbG9jYXRpb246IFs0Ny42MTM1Njk3NTM5NzM5OCwgLTEyMi4zNDM3NDk5OTk5OTk5OV1cbiAgICAgIHpvb206IDlcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gTWFwQ29uZmlnIiwiIyMjKlxuICogTWFwIENhbnZhcyBhcHBsaWNhdGlvbiBib290c3RyYXBwZXJcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDUuNy4xNFxuIyMjXG5cbk1hcFZpZXcgPSByZXF1aXJlICcuL3ZpZXdzL01hcFZpZXcuY29mZmVlJ1xuXG5cbmNsYXNzIE1hcENhbnZhc0FwcFxuXG4gICAjIEtpY2sgb2ZmIHRoZSBhcHBsaWNhdGlvbiBieSBpbnN0YW50aWF0aW5nXG4gICAjIG5lY2Nlc3Nhcnkgdmlld3NcblxuICAgY29uc3RydWN0b3I6IC0+XG4gICAgICBuZXcgTWFwVmlld1xuXG5cbiQgLT5cbiAgIG5ldyBNYXBDYW52YXNBcHBcbiIsIiMjIypcbiAqIE1hcEJveCBtYXAgbGF5ZXJcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDUuNy4xNFxuIyMjXG5cbk1hcENvbmZpZyA9IHJlcXVpcmUgJy4uL2NvbmZpZy9NYXBDb25maWcuY29mZmVlJ1xuXG5cbmNsYXNzIE1hcFZpZXdcblxuXG4gICAjIE1hcEJveCBtYXAgbGF5ZXJcbiAgICMgQHR5cGUge0wuTWFwfVxuXG4gICBtYXBMYXllcjogbnVsbFxuXG5cbiAgIGNvbnN0cnVjdG9yOiAob3B0aW9ucykgLT5cbiAgICAgIEBtYXBMYXllciA9IEwubWFwYm94Lm1hcCAnbWFwJywgJ2V4YW1wbGVzLm1hcC05aWp1azI0eSdcbiAgICAgIEBtYXBMYXllci5zZXRWaWV3IE1hcENvbmZpZy5JTklULmxvY2F0aW9uLCBNYXBDb25maWcuSU5JVC56b29tXG5cblxubW9kdWxlLmV4cG9ydHMgPSBNYXBWaWV3Il19
