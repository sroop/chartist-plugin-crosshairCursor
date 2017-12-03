(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(["chartist"], function (Chartist) {
      return (root.returnExportsGlobal = factory(Chartist));
    });
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like enviroments that support module.exports,
    // like Node.
    module.exports = factory(require("chartist"));
  } else {
    root['Chartist.plugins.crosshairCursor'] = factory(Chartist);
  }
}(this, function (Chartist) {

  /**
   * Chartist.js plugin that generates a crosshair cursor for a line chart which highlights and notifies you of any data points that fall along the crosshair axis
   *
   */
  /* global Chartist */
  (function(window, document, Chartist) {
    'use strict';

    var defaultOptions = {
      wrapperName: '',
      type: 'full',
      sendDataOn: 'hover'
    };

    Chartist.plugins = Chartist.plugins || {};
    Chartist.plugins.crosshairCursor = function(options) {

      options = Chartist.extend({}, defaultOptions, options);
      var dataPoints = []

      return function crosshairCursor(chart) {

        function sendMetaData(points) {
          var meta = points.map(function(point) {
            return point.meta;
          })
          chart.eventEmitter.emit('crosshairCursor:hovered', meta);
        }

        function sendFrozenStatus(frozenStatus) {
          chart.eventEmitter.emit('crosshairCursor:frozen', frozenStatus);
        }

        function currentPoints() {
          return dataPoints.filter(function(point) {
            return point.current
          })
        }

        function toPixels(number) {
          return number + "px"
        }

        function generateCursor(type) {
          var div = document.createElement("div")
          div.setAttribute("id", "crosshairCursor-" + type)
          element.insertBefore(div, element.firstChild);
          var crosshair = document.querySelector('#crosshairCursor-' + type)
          crosshair.style.position = "absolute"
          crosshair.style.display = 'none'
          if(type == 'x') {
            crosshair.style.height = '95%'
            crosshair.style.width = '1px'
          } else if(type == 'y') {
            crosshair.style.width = '100%'
            crosshair.style.height = '1px'
          }
          return crosshair
        }

        function inPointArea(cursorPosition, pointPosition, padding) {
          return (cursorPosition >= (pointPosition - padding) && cursorPosition <= (pointPosition + padding))
        }

        function formattedPointData(point) {
          var meta = point.meta
          meta.value = point.value
          meta.value.x = point.axisX.ticks[point.index]
          return {
            meta: meta,
            position: {x: Math.round(point.x), y: Math.round(point.y)},
            element: point.element
          }
        }

        function toggleHighlight(points, addHighlight) {
          points.forEach(function(point) {
            if(addHighlight) {
              point.element.addClass('crosshairCursor-highlight')
            } else {
              point.element.removeClass('crosshairCursor-highlight')
            }
          })
        }

        function cursorIsOnPoint(cursorPosition, pointPosition, padding) {
          if(options.type == 'x') {
            return inPointArea(cursorPosition.x, pointPosition.x, padding)
          } else if(options.type == 'y') {
            return inPointArea(cursorPosition.y, pointPosition.y , padding)
          } else if(options.type == 'full') {
            return inPointArea(cursorPosition.x, pointPosition.x, padding) || inPointArea(cursorPosition.y, pointPosition.y , padding)
          }
        }

        if(chart instanceof Chartist.Line) {

          var element = document.createElement('div')
          if(options.wrapperName.startsWith('#')) {
            element.id = options.wrapperName.substr(1)
          } else if(options.wrapperName.startsWith('.')) {
            element.className = options.wrapperName.substr(1)
          } else {
            throw('Must be a class or id!')
          }
          chart.container.parentNode.insertBefore(element, chart.container);
          element.appendChild(chart.container);
          element.className = element.className + " crosshairCursor-wrapper"
          element.style.cursor = "pointer"
          element.style.position = "relative"

          var xCrosshair = generateCursor('x')
          var yCrosshair = generateCursor('y')

          chart.on('draw', function(data) {
            if(data.type == "point") {
              dataPoints.push(formattedPointData(data))
            }
          });

          chart.on('created', function(e) {
            var created = true
            var frozen = false
            var ctPoints = document.querySelectorAll('.ct-point')
            var pointWidth = window.getComputedStyle(ctPoints[0])["stroke-width"].replace('px', '')
            var pointPadding = +pointWidth/2

            var initial = options.initial > 0 ? options.initial - 1 : undefined
            if(options.initial) dataPoints[initial].current = true
            if(currentPoints().length) { 
              sendMetaData(currentPoints())
              toggleHighlight(currentPoints(), true)
            }

            element.onclick = function(e) {
              e.stopPropagation();
              if(!frozen && currentPoints().length && options.sendDataOn == 'click') {
                sendMetaData(currentPoints())
                if(options.clickToFreeze) {
                  frozen = !frozen
                  sendFrozenStatus(frozen)
                }
              } else if(options.clickToFreeze) {
                frozen = !frozen
                sendFrozenStatus(frozen)
              }
            }

            if(dataPoints.length) {
              element.onmousemove = function(e){
                if(!frozen) {
                  var pendingEvent = false
                  var pos = {};
                  pos.x = e.pageX - this.offsetLeft
                  pos.y = e.pageY - this.offsetTop
                  xCrosshair.style.left = toPixels(pos.x)
                  yCrosshair.style.top = toPixels(pos.y)


                  dataPoints.forEach(function(point) {
                    onPoint = cursorIsOnPoint(pos, point.position, pointPadding)
                    toggleHighlight([point], onPoint)
                    if(point.current !== onPoint && !pendingEvent) {
                      pendingEvent = true
                    }
                    point.current = onPoint
                  })

                  if(currentPoints().length && options.sendDataOn == 'hover' && pendingEvent) { 
                    sendMetaData(currentPoints())
                  } else if(!currentPoints().length && pendingEvent) {
                    sendMetaData([])
                  }
                }
              }
              element.onmouseenter = function(e){
                if(options.type == 'x') {
                  xCrosshair.style.display = '';
                } else if(options.type == 'y') {
                  yCrosshair.style.display = '';
                } else if(options.type == 'full') {
                  xCrosshair.style.display = '';
                  yCrosshair.style.display = '';
                }
              }
              element.onmouseleave = function(e){
                if(!frozen) {
                  if(options.type == 'x') {
                    xCrosshair.style.display = 'none';
                  } else if(options.type == 'y') {
                    yCrosshair.style.display = 'none';
                  } else if(options.type == 'full') {
                    xCrosshair.style.display = 'none';
                    yCrosshair.style.display = 'none';
                  }
                }
              };
            }

          })
        }

      };
    };

  }(window, document, Chartist));
  return Chartist.plugins.crosshairCursor;

}));