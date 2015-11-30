// used when zooming
var zoomScale = 2;
var zoomLevel = 0;
var circleSize = 60;
var lineSize = 10;

$(document).ready(function() {
  // Parse is cloud based database https://www.parse.com/docs/js/guide
  Parse.initialize("vuy4wJOqWfcqAhipECk6g3bIFKL0sRG58VWSqyWr", "ufzZkjqxGC5jJjlClWMmnmK1pWLJKPKgQj0inIIi");
  // initialize (app key, javascript key)

  // Census maps
  // Floor 1: https://www.dropbox.com/s/kc66qyqvqb6sy93/Floor1st.jpeg?dl=1
  // Floor 2: https://www.dropbox.com/s/ux39my7mfmijxki/Floor2nd.jpeg?dl=1
  // Floor 3: https://www.dropbox.com/s/cjwmnoh4e2c3vnj/Floor3.jpeg?dl=1
  // Floor 4: https://www.dropbox.com/s/c1yj8ko7rr5xa9a/Floor4th.jpeg?dl=1
  // Floor 5: https://www.dropbox.com/s/lky7jg1ym651u9x/Floor5th.jpeg?dl=1
  // Floor 6: https://www.dropbox.com/s/7np25fzidqvzaw2/Floor6th.jpeg?dl=1
  // Floor 7: https://www.dropbox.com/s/kaji31hf8gpjdpk/Floor7th.jpeg?dl=1
  // Floor 8: https://www.dropbox.com/s/wdoct0y6gobfcj1/Floor8th.jpeg?dl=1

  addNewCircle('Hello');

  $('.edit-mode').removeClass('edit-mode-on');
  $('.edit-mode').text('Login');
  $('.right-panel, .bottom-panel, .circle.z10, .circle.z9').hide();
  $('.map-name').removeAttr('contenteditable');
  loadData('initial start');

  $('.map').css('max-width', $('.map').css('width'));
  $('.map').css('max-height', $('.map').css('height'));
  $('.circles-lines-container').css('width', $('.map').css('width'));
  $('.circles-lines-container').css('height', $('.map').css('height'));
  // Used for accelerated sliding maps
  var start = {};
  var stop = {};
  var diff = {};
  var current = {};

  // used for mouse based clicks
  var mouseStateMap = "";
  var mouseOffset = 0;

  // used for browser window resizing
  var prevBodyWidth = parseInt($('body').css('width'));
  var prevDistance = 0;

  $(window).resize(function() {
    var newBodyWidth = parseInt($('body').css('width'));
    var newOffset = newBodyWidth - prevBodyWidth;

    $('.circle.z10').each(function() {
      $(this).removeClass('zooms-circle');
      var currentLeft = parseInt($(this).css('left'));
      $(this).css('left', currentLeft + newOffset + 'px');

    });

    prevBodyWidth = parseInt($('body').css('width'));

  });

  $('.circles-lines-container').bind('mousedown touchstart', function(e) {

    if ($('.zoom-in').hasClass('zoom-in-active') || $('.zoom-out').hasClass('zoom-out-active')) {
      return (e);
    }

    // circle selected instead.  map doesnt move (return)
    if ($('.selected').length > 0) {
      return;
    }

    e.preventDefault();
    var orig = e.originalEvent;

    $('.circles, .lines').removeClass('zooms');

    if ((event.type == "mousedown") ||
      (orig.touches.length == 1)) { // Note: touches is not available on desktop browsers

      $('.slides').removeClass('slides');
      $('.zooms').removeClass('zooms');
      $('.circle-slides').removeClass('circle-slides');
      start.x = e.originalEvent.pageX;
      start.y = e.originalEvent.pageY;
      stop.x = 0;
      stop.y = 0;
      diff.x = 0;
      diff.y = 0;
      mouseStateMap = "down";

    } else if (orig.touches.length > 1) {
      prevDistance = Math.sqrt(Math.pow(parseInt(orig.touches[0].pageX) - parseInt(orig.touches[1].pageX), 2) + Math.pow(parseInt(orig.touches[0].pageY) - parseInt(orig.touches[1].pageX), 2));
      mouseStateMap = "down";
    }
  });

  $(".circles-lines-container").bind('mouseup touchend', function(e) {
    mouseStateMap = "";
  });
  /*
  $(".map").bind('mouseup touchend', function(e) {

    $(this).text((diff.x * 10) + "," + (diff.y * 10));
    $(this).addClass('slides');
    $(this).css({
      'background-position': (current.x - (diff.x * 10)) + 'px ' + (current.y - (diff.y * 10)) + 'px'
    });

    $('.circle').each(function() {

    $(this).addClass('circle-slides');
      
      $(this).css('left', parseInt($(this).css('left')) - (diff.x * 10) + 'px');
      $(this).css('top', parseInt($(this).css('top')) - (diff.y * 10) + 'px');
    });

    setTimeout(function() {
      $('.slides').removeClass('slides');

      $('.circle-slides').removeClass('circle-slides');

    }, 1000);
    
  });
  */
  $('.circles-lines-container').bind('mousemove touchmove', function(e) {
    e.preventDefault();

    if (mouseStateMap == "down") {

      // Zoom when pinching
      var orig = e.originalEvent;
      if (event.type == "touchmove") {
        if (orig.touches.length > 1) {
          if (prevDistance == 0) {
            return;
          }
          mouseStateMap = "";
          var newDistance = Math.sqrt(Math.pow(parseInt(orig.touches[0].pageX) - parseInt(orig.touches[1].pageX), 2) + Math.pow(parseInt(orig.touches[0].pageY) - parseInt(orig.touches[1].pageX), 2));
          if (prevDistance > newDistance) {
            zoomOut();
          } else {
            zoomIn();
          }
          prevDistance = 0;
          return;
        }
      }

      stop.x = e.originalEvent.pageX;
      stop.y = e.originalEvent.pageY;

      diff.x = start.x - stop.x;
      diff.y = start.y - stop.y;

      var backgroundPosition = $('.map').css('background-position').split(' ');
      current.x = parseInt(backgroundPosition[0].split('px'));
      current.y = parseInt(backgroundPosition[1].split('px'));

      $('.map').css({
        'background-position': (current.x - diff.x) + 'px ' + (current.y - diff.y) + 'px'
      });
      start.x = stop.x;
      start.y = stop.y;

      $('.circle:not(.z10,.z9)').each(function() {
        var left = parseInt($(this).css('left'));
        var top = parseInt($(this).css('top'));
        var viewWidth = parseInt($('.map').css('width'));
        var viewHeight = parseInt($('.map').css('height'));
        if ((left > viewWidth) || (top > viewHeight)) {
          $(this).hide();
        } else {
          $(this).show();
        }
        $(this).css('left', left - diff.x);
        $(this).css('top', top - diff.y);
      });

      $('.line').each(function() {
        var beginCircle = $('.circle:contains(' + $(this).attr('data-begin') + ')');
        var endCircle = $('.circle:contains(' + $(this).attr('data-end') + ')');

        if (beginCircle.hasClass('z10') || endCircle.hasClass('z10')) {
          var xBegin = parseInt($(beginCircle).css('left'));
          var yBegin = parseInt($(beginCircle).css('top'));
          var xEnd = parseInt($(endCircle).css('left'));
          var yEnd = parseInt($(endCircle).css('top'));

          var rightMost;
          var bottomMost;

          if (xBegin > xEnd) {
            rightMost = xBegin;
          } else {
            rightMost = xEnd;
          }

          if (yBegin > yEnd) {
            bottomMost = yBegin;
          } else {
            bottomMost = yEnd;
          }

          var viewWidth = parseInt($('.map').css('width'));
          var viewHeight = parseInt($('.map').css('height'));
          if ((rightMost > viewWidth) || (bottomMost > viewHeight)) {
            $(this).hide();
          } else {
            $(this).show();
          }

          updateLine($(this), xBegin, yBegin, xEnd, yEnd);

        } else {
          $(this).css('left', parseInt($(this).css('left')) - diff.x);
          $(this).css('top', parseInt($(this).css('top')) - diff.y);
        }
      });

    }
  });

  $(".circle").draggable();
}); // Document ready done

var firstCircle = $('.circle');

// Original draggable code from http://popdevelop.com/2010/08/touching-the-web/
$.fn.draggable = function() {

    var offset = null;
    var mouseOffset = null;
    var mouseDownState = false;
    var selectedCircle = this;

    var start = function(e) {
      if ($('.edit-mode').hasClass('edit-mode-on') == false) {
        return;
      }

      if ($('.zoom-in').hasClass('zoom-in-active') ||
        $('.zoom-out').hasClass('zoom-out-active')) {
        return;
      }

      e.preventDefault();
      // new circles need to remove their zoom in animations once they start moving
      $(this).removeClass('zooms-circle');

      var orig = e.originalEvent;
      var pos = $(this).position();
      if (event.type == "touchstart") {
        offset = {
          x: orig.changedTouches[0].pageX - pos.left,
          y: orig.changedTouches[0].pageY - pos.top
        };
      } else if (event.type == "mousedown") {
        mouseDownState = true;
        mouseOffset = {
          x: orig.pageX - pos.left,
          y: orig.pageY - pos.top
        };
      }

      $(this).addClass('selected');

      if (event.type == "touchstart") {
        var firstName = firstCircle.text();
        var secondName = $(this).text();
        if (orig.touches.length == 1) {
          firstCircle = $(this);
        }
        if (orig.touches.length > 1) {
          var firstPos = firstCircle.position();
          var noDuplicate = true;
          $('div[data-begin="' + firstName + '"][data-end="' + secondName + '"],div[data-begin="' + secondName + '"][data-end="' + firstName + '"]').each(function() {
            noDuplicate = false;
          });
          if (noDuplicate == true) {
            createLine(firstPos.left, firstPos.top, pos.left, pos.top, firstName, secondName);
          }
        }

      }

      if ($('.move-connect').hasClass('move-connect-selected')) {
        if ($('.selected').get(0) != $('.selected-edit').get(0)) {
          firstCircle = $('.selected-edit');
          var firstName = firstCircle.text();
          var secondName = $(this).text();

          var firstPos = firstCircle.position();
          var noDuplicate = true;
          $('div[data-begin="' + firstName + '"][data-end="' + secondName + '"],div[data-begin="' + secondName + '"][data-end="' + firstName + '"]').each(function() {
            noDuplicate = false;
          });

          if (noDuplicate == true) {
            createLine(firstPos.left, firstPos.top, pos.left, pos.top, firstName, secondName);
          }

        }

      }

      updateEditBox($(this));

    }

    var moveMe = function(e) {
      selectedCircle = this;
      move(e);
    }

    var mouseMoveMe = function(e) {
      if (mouseDownState == false) {
        // mouse has not been clicked
        return;
      }
      selectedCircle = $('.selected');
      move(e);
    }

    var move = function(e) {
      e.preventDefault();
      // circles cannot be moved while outside edit mode
      if ($('.edit-mode').hasClass('edit-mode-on') == false) {
        return;
      }
      // circles cannot be moved while zooming
      if ($('.zoom-in').hasClass('zoom-in-active') ||
        $('.zoom-out').hasClass('zoom-out-active')) {
        return;
      }
      var bodyWidth = parseInt($('body').css('width'));
      var panelWidth = parseInt($('.right-panel').css('width'));
      var newCircleBoxHeight = parseInt($('.new-circle').css('height'));
      var removeCircleBoxHeight = parseInt($('.remove-circle').css('height'));

      var orig = e.originalEvent;

      var newYPos;
      var newXPos;

      if (event.type == "touchmove") {
        newYPos = orig.changedTouches[0].pageY - offset.y;
        newXPos = orig.changedTouches[0].pageX - offset.x;
      } else if (event.type == "mousemove") {
        if (mouseDownState == false) {
        // mouse has not been clicked
           return;
        }
        newYPos = orig.pageY - mouseOffset.y;
        newXPos = orig.pageX - mouseOffset.x;
      }

      $(selectedCircle).css({
        top: newYPos,
        left: newXPos
      });

      var currentName = $(selectedCircle).text();
      var circleXPos = parseInt($(selectedCircle).position().left);
      var circleYPos = parseInt($(selectedCircle).position().top);

      $('[data-begin="' + currentName + '"]').each(function() {

        var otherName = $(this).attr('data-end');
        var sameXPos = parseInt($('.circle:contains("' + otherName + '")').css('left'));
        var sameYPos = parseInt($('.circle:contains("' + otherName + '")').css('top'));
        updateLine($(this), circleXPos, circleYPos, sameXPos, sameYPos);

      });
      $('[data-end="' + currentName + '"]').each(function() {

        var otherName = $(this).attr('data-begin');
        var sameXPos = parseInt($('.circle:contains("' + otherName + '")').css('left'));
        var sameYPos = parseInt($('.circle:contains("' + otherName + '")').css('top'));
        updateLine($(this), sameXPos, sameYPos, circleXPos, circleYPos);
      });

      // Set on board z-index if moved to board
      if (newXPos < (bodyWidth - panelWidth)) {
        $(selectedCircle).removeClass('z10');

        var mapHeight = parseInt($('.map').css('height'));
        if (newYPos < mapHeight - 100) {
          $(selectedCircle).removeClass('z9');
          zoomCircle(selectedCircle, zoomLevel);
        } else {
          $(selectedCircle).addClass('z9');
          zoomCircle(selectedCircle, 1)
        }
      } else {
        $(selectedCircle).addClass('z10');
        zoomCircle(selectedCircle, 1)
      }

      // If the box is empty, add new circle
      if ((newXPos < (bodyWidth - panelWidth)) || ((newXPos > (bodyWidth - panelWidth)) && (newYPos > (newCircleBoxHeight + 20)))) {

        if (isBoxEmpty()) {
          addNewCircle();
        }
      }

      // Highlight trash can
      if ((newXPos > bodyWidth - panelWidth) &&
        (newYPos > newCircleBoxHeight + 20) &&
        (newYPos < 20 + newCircleBoxHeight + 20 + removeCircleBoxHeight + 20)) {
        $('.icon').addClass('icon-mouseover');
      } else {
        $('.icon').removeClass('icon-mouseover');
      }

    }

    var stopMe = function(e) {
      selectedCircle = this;
      stop(e);
    }

    var mouseStopMe = function(e) {
      if (mouseDownState == false) {
        // mouse has not been clicked
        return;
      }

      selectedCircle = $('.selected');
      stop(e);

    }

    var stop = function(e) {

      e.preventDefault();

      if ($('.edit-mode').hasClass('edit-mode-on') == false) {
        return;
      }

      var orig = e.originalEvent;
      var newYPos;
      var newXPos;

      if (event.type == "touchend") {
        newYPos = orig.changedTouches[0].pageY - offset.y;
        newXPos = orig.changedTouches[0].pageX - offset.x;
      } else if ((event.type == "mouseup") && (mouseDownState == true)) {
        newYPos = orig.pageY - mouseOffset.y;
        newXPos = orig.pageX - mouseOffset.x;
        // reset mouse down flag
        mouseDownState = false;
      }

      var bodyWidth = parseInt($('body').css('width'));
      var panelWidth = parseInt($('.right-panel').css('width'));
      var newCircleBoxHeight = parseInt($('.new-circle').css('height'));
      var removeCircleBoxHeight = parseInt($('.remove-circle').css('height'));

      // trash can removes circles dragged over it
      if ((newXPos > bodyWidth - panelWidth) &&
        (newYPos > newCircleBoxHeight + 20) &&
        (newYPos < 20 + newCircleBoxHeight + 20 + 
         removeCircleBoxHeight + 20)) {
        var currentName = $(selectedCircle).text();
        $('.line[data-begin=' + currentName + '],.line[data-end=' + currentName + ']').each(function() {
          $("#name").val('');
          $('#line-ends').html('');
          $(this).remove();
        });
        $(selectedCircle).remove();
      }

      // reselect newly select circle as long as the connect button (designed for mouse based browsers) is off
      if ($('.move-connect').hasClass('move-connect-selected') == false) {
        $('.selected-edit').removeClass('selected-edit');
        $(selectedCircle).addClass('selected-edit');

      }

      $(selectedCircle).removeClass('selected');
      
      $('.icon').removeClass('icon-mouseover');
      $('.line-moving').removeClass('line-moving')

    }

    // Initialization of new draggable circle by setting it as selected
    $('.selected-edit').removeClass('selected-edit');
    $(this).addClass('selected-edit');

    // add events to each circle
    this.bind("touchstart mousedown", start);
    this.bind("touchmove mousemove", moveMe);
    $(document).bind("mousemove", mouseMoveMe);
    this.bind("touchend mouseup", stopMe);
    $(document).bind("mouseup", mouseStopMe);
  } // End of draggable function

// circle size is scaled based off zoom level
function zoomCircle(selection, newZoomLevel) {
  var scaleFromBase = Math.pow(zoomScale, newZoomLevel);

  $(selection).css('width', circleSize * scaleFromBase);

  $(selection).css('height', circleSize * scaleFromBase);
  $(selection).css('margin-left', (-1) * circleSize * scaleFromBase / 2);
  $(selection).css('margin-top', (-1) * circleSize * scaleFromBase / 2);
  $(selection).css('border-radius', (circleSize * scaleFromBase) * 2 / 3);
}

// checks to see to if the the New Circle box is empty
function isBoxEmpty() {

  var isEmpty = true;

  var bodyWidth = parseInt($('body').css('width'));
  var panelWidth = parseInt($('.right-panel').css('width'));
  var newCircleBoxHeight = parseInt($('.new-circle').css('height'));

  $('.circle.z10').each(function() {
    var currentLeftPos = parseInt($(this).css('left'));
    var currentTopPos = parseInt($(this).css('top'));

    if ((currentLeftPos > (bodyWidth - panelWidth)) &&
      (currentTopPos < (newCircleBoxHeight + 20))) {
      isEmpty = false;
    }
  });
  return isEmpty;
}

// add a new circle to the NewCircle box.
// will use lowest available number as the name if no name is used
function addNewCircle(name) {
  // get next available number
  var circleIndex = 0;
  var hasDuplicate;
  do {
    hasDuplicate = false;
    circleIndex++;
    $('.circle:contains("' + circleIndex + '")').each(function() {
      hasDuplicate = true;
    });
  } while (hasDuplicate == true);

  var bodyWidth = parseInt($('body').css('width'));
  var panelWidth = parseInt($('.right-panel').css('width'));
  var newCircleBoxHeight = parseInt($('.new-circle').css('height'));

  if (typeof name == "undefined") {
    $(".circles-lines-container").append('<div class="circle draggable z10 selected-edit">' + circleIndex + '</div>');
  } else {
    $(".circles-lines.container").append('<div class="circle draggable z10 selected-edit">' + name + '</div>');
  }
  $('.circle').last().css('left', bodyWidth - panelWidth + 155 + 'px');
  $('.circle').last().css('top', 150 + 'px');
  $('.circle').last().draggable();

  setTimeout(function() {
    $('.circle').last().addClass('zooms-circle');
    $('.circle').last().css('left', bodyWidth - panelWidth + 120 + 'px');
    $('.circle').last().css('top', 120 + 'px');
    $('.circle').last().addClass('circle-60');
  }, 100);
  setTimeout(function() {
    $('.circle.z10').removeClass('zooms-circle');
  }, 2000)
}

// The circle name/line editor box gets updated whenever a new circle is clicked
function updateEditBox(selection) {

  var name = selection.text();
  // Update edit box
  $('#name').val(name);

  $('#line-ends').html('');

  $('.line[data-begin="' + name + '"],.line[data-end="' + name + '"]').each(function() {
    var endName;
    if ($(this).attr('data-begin') == name) {
      endName = $(this).attr('data-end');
    } else {
      endName = $(this).attr('data-begin');
    }

    var lineEntry = $('<div>');
    var lineName = $('<div>')
      .addClass('entry-style')
      .text(endName);
    var deleteContainer = $('<div>')
      .addClass('set-right')
      .click(function() {
        var startName = $('.selected-edit').text();
        var endName = $(this).parent().find('div:nth-child(1)').text();
        $('.line[data-begin="' + startName + '"][data-end="' + endName + '"]').remove();
        
        $('.line[data-begin="' + endName + '"][data-end="' + startName + '"]').remove();

        $(this).parent().remove();
      });
    var deleteButton = $('<span>')
      .addClass('glyphicon glyphicon-remove');
    deleteButton.appendTo(deleteContainer);
    lineName.appendTo(lineEntry);
    deleteContainer.appendTo(lineEntry);
    lineEntry.appendTo('#line-ends');
  });

}

// creates a line connecting two points.  drawn as a rotated thin box. css and div based graphics.
// Original line code from http://www.monkeyandcrow.com/blog/drawing_lines_with_css3/
function createLine(x1, y1, x2, y2, name1, name2) {

  var scale = Math.pow(zoomScale, zoomLevel);

  var length = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
  var angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
  var transform = 'translate(' + ((1) / 2 * lineSize * scale) +
    'px,' + ((-1) / 2 * lineSize * scale) +
    'px) rotate(' + angle + 'deg)';

  var line = $('<div>')
    .appendTo('.circles-lines-container')
    .attr({
      'data-begin': name1,
      'data-end': name2,
      'angle': transform
    })
    .addClass('line')
    .css({
      'position': 'absolute',
      'transform': transform
    })
    .height(lineSize * scale)
    .width(length)
    .offset({
      left: x1,
      top: y1
    });

  return line;
}

// updates said line with new coordinates
function updateLine(line, x1, y1, x2, y2) {

  var scale = Math.pow(zoomScale, zoomLevel);

  var length = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
  var angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
  var transform = 'rotate(' + angle + 'deg) translate(' + ((0)  * lineSize * scale) +
    'px,' + ((0.5) * lineSize * scale) +
    'px)';

  line
    .addClass('line-moving')
    .attr({
      'angle': transform
    })
    .css({
      'transform': transform,
      left: x1,
      top: y1
    })
    .height(lineSize * scale)
    .width(length);
  /*.offset({
     left: x1,
     top: y1
   }); appears to be buggy*/

  return line;
}

// the input box below the map has a url that can be changed to change the map image source
function updateImage() {
  $('.map').css({
    'background-image': 'url(' + $('#map-url-input').val() + ')'
  });
  setImgSize('https://www.dropbox.com/s/kc66qyqvqb6sy93/Floor1st.jpeg?dl=1');
  // same image at https://www.dropbox.com/s/689cl77a1jojmrf/penguin_soccer_ball_icon_512x512.jpg?dl=1
}

// The background image is set to its original size when its first loaded
function setImgSize(imgSrc) {
  var newImg = new Image();
  newImg.onload = function() {
    var height = newImg.height;
    var width = newImg.width;
    $('.map').css('background-size', width + 'px ' + height + 'px');
  }
  newImg.src = imgSrc; // this must be done AFTER setting onload
  if (newImg.complete || newImg.readyState === 4) newImg.onload();
}

// Selected circle name can be updated
function updateName() {
  var oldName = $('.selected-edit').text();
  var newName = $('#name').val();

  var hasDuplicate = false;
  $('.circle:contains("' + newName + '")').each(function() {
    hasDuplicate = true;
  });

  var message = $('<div>')
    .text('No Duplicates')
    .addClass('message');
  if (hasDuplicate) {
    $('.message').remove();
    $('#name').after(message);
    return;
  } else {
    $('.message').remove();
  }

  $('[data-begin]').each(function() {
    if ($(this).attr('data-begin') == oldName) {
      $(this).attr('data-begin', newName);
    }
  });
  $('[data-end]').each(function() {
    if ($(this).attr('data-end') == oldName) {
      $(this).attr('data-end', newName);
    }
  });

  $('.selected-edit').text(newName);
}

// mouse based browsers need the connect button to draw lines.
// click a second point when the connect button is on to draw the line.
// there is always one circle selected
function toggleConnect() {
  $('.move-connect').toggleClass('move-connect-selected');
  if ($('.move-connect').hasClass('move-connect-selected')) {
    firstCircle = $('.selected');
  }
}

// our global map data.  contains data for all the maps.
// mapData is used when saving to the server and as well as when loading each indivudal map
var mapData = {};
for (var i = 1; i <= 8; i++) {
  mapData['floor' + i] = {
    'settings': {
      'url': $('#map-url-input').val(),
      'name': $('.map-name').text(),
      'x': 0,
      'y': 0,
      'width': '500px',
      'height': '500px',
      'viewWidth': $('.map').css('width'),
      'viewHeight': $('.map').css('height'),
      'zoom': 0
    },
    'circles': {},
    'lines': {}
  }
}

// map selection is based on selected overhead number buttons
function selectMap(selection) {
  saveMap($('.map-selected').text());
  $('.map-button').removeClass('map-selected');
  $(selection).addClass('map-selected');
  loadMap($(selection).text());
}

// maps, circles, and line are saved after each map selection.
// also used when saving to the Parse database server
function saveMap(mapNumber) {
  var circleList = [];
  var lineList = [];
  $('.circle').each(function() {
    var circle = {};
    circle.name = $(this).text();
    circle.class = $(this).attr('class');
    circle.left = $(this).css('left');
    circle.top = $(this).css('top');
    circle.z10 = $(this).hasClass('z10');

    circleList.push(circle);
  });
  $('.line').each(function() {
    var line = {};
    line.begin = $(this).attr('data-begin');
    line.end = $(this).attr('data-end');
    line.left = $(this).css('left');
    line.top = $(this).css('top');
    line.lineWidth = $(this).css('height');
    line.length = $(this).css('width');
    line.angle = $(this).attr('angle');

    lineList.push(line);
  });

  var size = $('.map').css('background-size').split(' ');
  var position = $('.map').css('background-position').split(' ');
  var settings = {};

  settings.url = $('#map-url-input').val();
  settings.name = $('.map-name').text();
  settings.x = position[0];
  settings.y = position[1];
  settings.width = size[0];
  settings.height = size[1];
  settings.zoom = zoomLevel;
  settings.viewWidth = $('.map').css('width');
  settings.viewHeight = $('.map').css('height');
  settings.circleSize = $('#circle-size-value-input').val();

  var floorName = 'floor' + mapNumber;
  mapData[floorName] = {
    'settings': settings,
    'circles': circleList,
    'lines': lineList
  }

}

// Maps are loaded when an overhead button is selected.
// also used to load from the database server
function loadMap(mapNumber) {
  $('.circle').remove();
  $('.line').remove();
  var floorName = 'floor' + mapNumber;

  preLoadZoom(floorName, zoomLevel);

  $('.map-name').text(mapData[floorName].settings.name);

  $('.map').css({
    'background-image': 'url(' + mapData[floorName].settings.url + ')',
    'background-size': mapData[floorName].settings.width + ' ' + mapData[floorName].settings.height,
    'background-position': mapData[floorName].settings.x + ' ' + mapData[floorName].settings.y,
  });

  $('#map-url-input').val(mapData[floorName].settings.url);
  var savedBodyWidth = parseInt(mapData[floorName].settings.viewWidth);
  $('#circle-size-value-input').val(mapData[floorName].settings.circleSize);
  circleSize = mapData[floorName].settings.circleSize;

  var totalCircles = mapData[floorName].circles;
  var totalLines = mapData[floorName].lines;

  var scaleFromBase = Math.pow(zoomScale, zoomLevel);
  for (var index in totalCircles) {
    var circle = $('<div>')
      .appendTo('.circles-lines-container')
      .addClass(totalCircles[index].class)
      .css({
        'left': totalCircles[index].left,
        'top': totalCircles[index].top
      })
      .text(totalCircles[index].name);

    circle.draggable();
    //circle.addClass('circle-60');
    // Move outside circle to correct location due to different screen sizes
    if ($('.circle').last().hasClass('z10')) {
      $('.circle').last().removeClass('zooms-circle');
      var currentLeft = parseInt($('.circle').last().css('left'));
      var newOffset = parseInt($('body').css('width')) - savedBodyWidth;
      $('.circle').last().css('left', currentLeft + newOffset);
      if ($('.edit-mode').hasClass('edit-mode-on') == false) {
        $('.circle').last().hide();
      }
    } else {
      $('.circle').last().css({
        'width': circleSize * scaleFromBase,
        'height': circleSize * scaleFromBase,
        'margin-left': (-1) * circleSize / 2 * scaleFromBase,
        'margin-top': (-1) * circleSize / 2 * scaleFromBase,
        'border-radius': (circleSize * scaleFromBase) * 2 / 3
      });
    }
  }

  if (isBoxEmpty()) {
    addNewCircle();
  }

  for (var index in totalLines) {

    $('<div>')
      .appendTo('.circles-lines-container')
      .attr({
        'data-begin': totalLines[index].begin,
        'data-end': totalLines[index].end,
        'angle': totalLines[index].angle
      })
      .addClass('line')
      .css({
        'position': 'absolute',
        'transform': totalLines[index].angle,
        left: totalLines[index].left,
        top: totalLines[index].top
      })
      .height(totalLines[index].lineWidth)
      .width(totalLines[index].length);

  }

  updateEditBox($('.selected-edit'));

}

// map data (mapData) is loaded from a Parse database.
// it also centers the image but keeps the loaded zoom level.
// if initialStart is set to "inital start" then it hides the default
// editing menus
function loadData(initialStart) {

  $('.circle').remove();
  $('.line').remove();

  var dataTableObject = Parse.Object.extend("SaveTable");
  var dataTable = new dataTableObject();

  var query = new Parse.Query(dataTableObject);
  query.first({
    success: function(result) {
      var totalDataJSON = JSON.parse(result.get('data'));
      mapData = totalDataJSON;

      // Center loaded floor map to center
      var floorName = 'floor' + $('.map-selected').text();
      zoomLevel = mapData[floorName].settings.zoom;
      var currentMapCenterX = parseInt($('.map').css('width')) / 2;
      var loadedMapCenterX = parseInt(mapData[floorName].settings.viewWidth) / 2;
      var currentMapCenterY = parseInt($('.map').css('height')) / 2;
      var loadedMapCenterY = parseInt(mapData[floorName].settings.viewHeight) / 2;
      var startingXPos = parseInt(mapData[floorName].settings.x) + (currentMapCenterX - loadedMapCenterX);
      var startingYPos = parseInt(mapData[floorName].settings.y) + (currentMapCenterY - loadedMapCenterY);
      $('.map').css('background-position', startingXPos + 'px ' + startingYPos + 'px');

      // Load map to current setting
      loadMap($('.map-selected').text());

      if (initialStart == 'initial start') {
        $('.edit-mode').removeClass('edit-mode-on');
        $('.edit-mode').text('Login');
        $('.right-panel, .bottom-panel, .circle.z10, .circle.z9').hide();
        $('.map-name').removeAttr('contenteditable');
      } else {
        alert("Data loaded from Parse cloud");
      }
    },
    error: function(error) {
      alert('Error: ' + error);
    }
  });
}

// map data (mapData) is saved to a Parse database
function saveData() {

  saveMap($('.map-selected').text());

  var totalDataJSON = JSON.stringify(mapData);
  var dataTableObject = new Parse.Object.extend("SaveTable");
  var dataTable = new dataTableObject();

  var saveQuery = new Parse.Query(dataTableObject);

  saveQuery.first({
    success: function(result) {
      if (typeof result == 'undefined') {
        dataTable.set('data', totalDataJSON);
        dataTable.save();
      } else {
        result.set('data', totalDataJSON);

        result.save();
      }
      alert("Data saved to Parse cloud");
      status.success("Data saved to Parse cloud");
    },
    error: function(error) {
      alert('Error: ' + error);
      status.error("Error: " + error.code + " " + error.message);
    }
  });

}

function zoomIn() {
  if ($('.zoom-in').hasClass('zoom-in-active') || $('.zoom-out').hasClass('zoom-out-active')) {
    return;
  }
  $('.zoom-in').addClass('zooms');
  $('.zoom-in').addClass('zoom-in-active');
  $('.map').addClass('zooms');

  zoom(zoomLevel + 1);

  setTimeout(function() {
    $('.zooms').removeClass('zooms');
    $('.zoom-in').removeClass('zoom-in-active');
    $('.line-moving').removeClass('line-moving');
  }, 2000);

}

function zoomOut() {
  if ($('.zoom-in').hasClass('zoom-in-active') || $('.zoom-out').hasClass('zoom-out-active')) {
    return;
  }
  $('.zoom-out').addClass('zooms');
  $('.zoom-out').addClass('zoom-out-active');
  $('.map').addClass('zooms');

  zoom(zoomLevel - 1);

  setTimeout(function() {
    $('.zooms').removeClass('zooms');
    $('.zoom-out').removeClass('zoom-out-active');
    $('.line-moving').removeClass('line-moving');
  }, 2000);

}

function zoom(newZoomLevel) {
  var scaleFromBase = Math.pow(zoomScale, newZoomLevel);
  var scaleFromCurrent = Math.pow(zoomScale, newZoomLevel - zoomLevel);
  zoomLevel = newZoomLevel;

  var backgroundSize = $('.map').css('background-size').split(' ');
  var newWidth = parseInt(backgroundSize[0]);
  var newHeight = parseInt(backgroundSize[1]);
  newWidth = newWidth * scaleFromCurrent;
  newHeight = newHeight * scaleFromCurrent;
  $('.map').css('background-size', newWidth + 'px ' + newHeight + 'px');

  var mapCenterX = (parseInt($('.map').css('width')) - 200) / 2;
  var mapCenterY = (parseInt($('.map').css('height')) - 200) / 2;
  var position = $('.map').css('background-position').split(' ');
  var newLeft = parseInt(position[0]);
  var newTop = parseInt(position[1]);
  newLeft = mapCenterX + ((newLeft - mapCenterX) * scaleFromCurrent);
  newTop = mapCenterY + ((newTop - mapCenterY) * scaleFromCurrent);
  $('.map').css('background-position', newLeft + 'px ' + newTop + 'px');

  var circlesPos = {};

  $('.circle').each(function() {
    var circleName = $(this).text();
    if ($(this).hasClass('z10')) {
      circlesPos[circleName] = {
        'left': $(this).css('left'),
        'top': $(this).css('top')
      }
    } else {
      var newLeft = parseInt($(this).css('left'));
      var newTop = parseInt($(this).css('top'));
      newLeft = mapCenterX + ((newLeft - mapCenterX) * scaleFromCurrent);
      newTop = mapCenterY + ((newTop - mapCenterY) * scaleFromCurrent);

      var viewWidth = parseInt($('.map').css('width'));
      var viewHeight = parseInt($('.map').css('height'));
      if ((newLeft > viewWidth) || (newTop > viewHeight)) {
        //$(this).hide();
      } else {
        //$(this).show();
        $(this).addClass('zooms');
      }
      $(this).addClass('zooms');
      $(this).css('left', newLeft);
      $(this).css('top', newTop);
      $(this).css('width', circleSize * scaleFromBase);
      $(this).css('height', circleSize * scaleFromBase);
      $(this).css('margin-left', (-1) * circleSize * scaleFromBase / 2);
      $(this).css('margin-top', (-1) * circleSize * scaleFromBase / 2);
      $(this).css('border-radius', (circleSize * scaleFromBase) * 2 / 3);

      circlesPos[circleName] = {
        'left': newLeft,
        'top': newTop
      }
    }
  });

  $('.line').each(function() {

    var beginName = $(this).attr('data-begin');
    var endName = $(this).attr('data-end');

    var xBegin = parseInt(circlesPos[beginName].left);
    var yBegin = parseInt(circlesPos[beginName].top);
    var xEnd = parseInt(circlesPos[endName].left);
    var yEnd = parseInt(circlesPos[endName].top);

    var rightMost;
    var bottomMost;

    if (xBegin > xEnd) {
      rightMost = xBegin;
    } else {
      rightMost = xEnd;
    }

    if (yBegin > yEnd) {
      bottomMost = yBegin;
    } else {
      bottomMost = yEnd;
    }

    var currentLeft = parseInt($(this).css('left'));
    var currentTop = parseInt($(this).css('top'));

    var viewWidth = parseInt($('.map').css('width'));
    var viewHeight = parseInt($('.map').css('height'));
    // line needs to be hidden when going offscreen due to mobile window rescaling
    if ((rightMost > viewWidth) || (bottomMost > viewHeight)) {
      //$(this).hide();
    } else {
      //$(this).show();
      if ((currentLeft < viewWidth) || (currentTop < viewHeight)) {
        //$(this).addClass('zooms');
      }
    }
    $(this).addClass('zooms');
    updateLine($(this), xBegin, yBegin, xEnd, yEnd);

  });

}

// Also translates to current view position
function preLoadZoom(floorName, newZoomLevel) {
  var scaleFromCurrent = Math.pow(2, newZoomLevel - mapData[floorName].settings.zoom);
  mapData[floorName].settings.zoom = newZoomLevel;
  var currentPosition = $('.map').css('background-position').split(' ');
  var currentXPos = parseInt(currentPosition[0]);
  var currentYPos = parseInt(currentPosition[1]);

  var newWidth = parseInt(mapData[floorName].settings.width);
  var newHeight = parseInt(mapData[floorName].settings.height);
  newWidth = newWidth * scaleFromCurrent;
  newHeight = newHeight * scaleFromCurrent;
  mapData[floorName].settings.width = newWidth + 'px';
  mapData[floorName].settings.height = newHeight + 'px';

  var mapCenterX = (parseInt($('.map').css('width')) - 200) / 2;
  var mapCenterY = (parseInt($('.map').css('height')) - 200) / 2;

  var newLeft = parseInt(mapData[floorName].settings.x);
  var newTop = parseInt(mapData[floorName].settings.y);

  newLeft = mapCenterX + ((newLeft - mapCenterX) * scaleFromCurrent);
  newTop = mapCenterY + ((newTop - mapCenterY) * scaleFromCurrent);

  var newLeftOffset = currentXPos - newLeft;
  var newTopOffset = currentYPos - newTop;
  newLeft = newLeft + newLeftOffset;
  newTop = newTop + newTopOffset;

  mapData[floorName].settings.x = newLeft + 'px';
  mapData[floorName].settings.y = newTop + 'px';

  var totalCircles = mapData[floorName].circles;
  var totalLines = mapData[floorName].lines;

  var circlesPos = {}; // position saved for moving lines

  for (var index in totalCircles) {
    var circleName = totalCircles[index].name;
    var classes = totalCircles[index].class.split(' ');
    var hasZ10Class = false;
    for (var index2 in classes) {
      if (classes[index2] == 'z10') {
        hasZ10Class = true;
      }
    }
    if (hasZ10Class == true) {
      circlesPos[circleName] = {
        'left': totalCircles[index].left,
        'top': totalCircles[index].top
      }
    } else {
      var newLeft = parseInt(totalCircles[index].left);
      var newTop = parseInt(totalCircles[index].top);
      newLeft = mapCenterX + ((newLeft - mapCenterX) * scaleFromCurrent);
      newTop = mapCenterY + ((newTop - mapCenterY) * scaleFromCurrent);
      newLeft = newLeft + newLeftOffset;
      newTop = newTop + newTopOffset;
      totalCircles[index].left = newLeft + 'px';
      totalCircles[index].top = newTop + 'px';
      circlesPos[circleName] = {
        'left': newLeft,
        'top': newTop
      }

    }
  }
  for (var index in totalLines) {
    var beginName = totalLines[index].begin;
    var endName = totalLines[index].end;

    var xBegin = parseInt(circlesPos[beginName].left);
    var yBegin = parseInt(circlesPos[beginName].top);
    var xEnd = parseInt(circlesPos[endName].left);
    var yEnd = parseInt(circlesPos[endName].top);

    var scale = Math.pow(zoomScale, newZoomLevel);

    var length = Math.sqrt((xBegin - xEnd) * (xBegin - xEnd) + (yBegin - yEnd) * (yBegin - yEnd));
    var angle = Math.atan2(yEnd - yBegin, xEnd - xBegin) * 180 / Math.PI;
    var transform = 'translate(' + ((1) / 2 * lineSize * scale) +
      'px,' + ((-1) / 2 * lineSize * scale) +
      'px) rotate(' + angle + 'deg)';

    totalLines[index].left = xBegin + 'px';
    totalLines[index].top = yBegin + 'px';
    totalLines[index].length = length;
    totalLines[index].angle = transform;
  }

}

function toggleEdit() {
  if ($('.edit-mode').hasClass('edit-mode-on')) {
    $('.edit-mode').removeClass('edit-mode-on');
    $('.edit-mode').text('Login');
    $('.right-panel, .bottom-panel, .circle.z10, .circle.z9').hide('slide');
    $('.map-name').removeAttr('contenteditable');
    saveMap($('.map-selected').text());
  } else {
    $('.edit-mode').addClass('edit-mode-on');
    $('.edit-mode').text('Log off');
    $('.right-panel, .bottom-panel, .circle.z10, .circle.z9').show('slide');
    $('.map-name').attr('contenteditable', true);
    $('.circle').removeClass('route-circle-animation route-circle-animation-hidden zooms')
  }

}

function updateCircleSize() {
  circleSize = $('#circle-size-value-input').val();
  var scaleFromBase = Math.pow(zoomScale, zoomLevel);
  $('.circle:not(.z10,.z9)').each(function() {
    $(this).css('width', circleSize * scaleFromBase);
    $(this).css('height', circleSize * scaleFromBase);
    $(this).css('margin-left', (-1) * circleSize * scaleFromBase / 2);
    $(this).css('margin-top', (-1) * circleSize * scaleFromBase / 2);
    $(this).css('border-radius', (circleSize * scaleFromBase) * 2 / 3);
  });
}

/* Tried to auto correct zoom from iphone input.  Settings by turning user zoom off in meta
<meta name="viewport" content="width=640px, user-scalable=no">

$('input, select, textarea').on('blur', function(event) {
 $('meta[name=viewport]').attr('content', 'device-width = 640, width = 640');

}); */

/*
points = {
  
}
*/

function showRoute() {
  $('.circle').removeClass('route-circle-color zooms');
  $('.line').removeClass('line-fill line-fill-begin zooms');
  if ($('#start-input').val() == '' || $('#destination-input').val() == '') {
    return;
  }
  var shortestPath = buildShortestPathTree($('#start-input').val(), $('#destination-input').val());
  alert('path waypoints ' + shortestPath.toString())
  drawPath(shortestPath)
}

function buildShortestPathTree(startingPoint, endPoint) {

  var shortestPath = [];

  if ((typeof startingPoint == "undefined") || (typeof endPoint == "undefined")) {
    return shortestPath;
  }
  console.log('Starting route');
  // checklist used to verify the shortest path to each point
  var pointsChecklist = {};
  for (var floorName in mapData) {
    var circlesList = mapData[floorName].circles;
    for (var index in circlesList) {
      var name = circlesList[index].name;
      pointsChecklist[name] = {};
      pointsChecklist[name].parent = "";
      pointsChecklist[name].shortestDistanceToHere = Number.MAX_VALUE;
      pointsChecklist[name].noOtherPaths = false; // Lets you know if the point is a dead end (or final point)
    }
  }

  console.log('Points checklist built');

  // Starting and end points have to be in the checklist to work
  if ((pointsChecklist.hasOwnProperty(startingPoint) == false) ||
    (pointsChecklist.hasOwnProperty(endPoint) == false)) {
    return;
  }

  // reset origin
  pointsChecklist[startingPoint].shortestDistanceToHere = 0;

  // Starting point will be point with distance initially set to zero
  var nextClosestPoint = getNextClosestPoint();

  // This loop finds the shortest path at each point.  Djikstra's algorithm
  while (nextClosestPoint != "none") {
    console.log("Start looping through index " + nextClosestPoint);
    var nextPoint = "none";
    for (var floorName in mapData) {
      var linesList = mapData[floorName].lines;
      for (var index in linesList) {
        var found = false;
        if (linesList[index].begin == nextClosestPoint) {
          nextPoint = linesList[index].end;
          found = true;
        } else if (linesList[index].end == nextClosestPoint) {
          nextPoint = linesList[index].begin;
          found = true;
        }
        if (found) {
          if (pointsChecklist[nextPoint].noOtherPaths == false) {
            if ((pointsChecklist[nextPoint].shortestDistanceToHere == Number.MAX_VALUE) ||
              (pointsChecklist[nextPoint].shortestDistanceToHere >
                (pointsChecklist[nextClosestPoint].shortestDistanceToHere + linesList[index].length))) {

              pointsChecklist[nextPoint].shortestDistanceToHere =
                pointsChecklist[nextClosestPoint].shortestDistanceToHere + linesList[index].length;
              pointsChecklist[nextPoint].parent = nextClosestPoint;
            }
          }

        }
      }
    }

    pointsChecklist[nextClosestPoint].noOtherPaths = true;
    //console.log("Finished checking all paths leaving current point " + nextClosestPoint);
    nextClosestPoint = getNextClosestPoint();
  }
  console.log("Done");

  // Path is obtained by going from end point and following the parents to the starting point
  // Sequence is reversed by stacking on the front of the array with unshift
  var nextName = endPoint;
  while (pointsChecklist[nextName].parent != "") {
    //console.log("Point traversed: " + nextName);
    shortestPath.unshift(nextName); // unshift places items first in the array, unlike push
    nextName = pointsChecklist[nextName].parent;
  }
  shortestPath.unshift(nextName);

  return shortestPath;

  // Finds the next closest point thats connected and hasnt been determined as a dead end
  function getNextClosestPoint() {
    var shortestDistance = -1;
    var locatedPoint = "none";
    // Find the cloest point that hasn't been checked off (confirmed not shortest path)
    for (var name in pointsChecklist) {
      //console.log("Searching index " + index);
      if (pointsChecklist[name].noOtherPaths == false) {
        if ((shortestDistance == -1) ||
          (pointsChecklist[name].shortestDistanceToHere < shortestDistance)) {
          shortestDistance = pointsChecklist[name].shortestDistanceToHere;
          if (shortestDistance != Number.MAX_VALUE) {
            locatedPoint = name;
          }
        }
      }
    }
    return locatedPoint;
  }
}

function drawPath(path) {
  $('.circle').removeClass('zooms');
  $('.line').removeClass('zooms');
  var startCircle = '';
  var animationSequence = 0;
  var widths = [];
  for (var index in path) {
    var circle = $('.circle:contains(' + path[index] + ')');

    if (circle.length > 0) {
      circle.removeClass('route-circle-animation');
      circle.addClass('route-circle-animation-hidden');
      if (startCircle == '') {
        startCircle = index;
      }
    } else {
      continue;
    }

    if (index < path.length - 1) {
      var firstName = path[index];
      var secondName = path[parseInt(index) + 1];
      var line = $('.line[data-begin=' + firstName + '][data-end=' + secondName + '], .line[data-begin=' + secondName + '][data-end=' + firstName + ']');
      widths.push(line.css('width'));

      $('.circle:contains(' + path[index] + ')').on('webkitTransitionEnd', function(event) {

        animationSequence++;
        if (animationSequence + 1 < path.length) {
          var firstName = path[animationSequence];
          var secondName = path[animationSequence + 1];

          var line = $('.line[data-begin=' + firstName + '][data-end=' + secondName + ']');
          if (line.length > 0) {
            var prevWidth = widths[animationSequence];

            line.addClass('zooms');
            line.css('width', prevWidth);
          }

          // lines going the opposite direction can be translated to appear to be drawn from the other direction
          line = $('.line[data-begin=' + secondName + '][data-end=' + firstName + ']');
          if (line.length > 0) {
            var prevWidth = widths[animationSequence];

            var firstCircle = $('.circle:contains(' + firstName + ')');
            var secondCircle = $('.circle:contains(' + secondName + ')');

            var xOffset = parseInt(firstCircle.css('left')) - parseInt(secondCircle.css('left'));
            var yOffset = parseInt(firstCircle.css('top')) - parseInt(secondCircle.css('top'));

            line.css('transform', 'translate(' + xOffset + 'px,' + yOffset + 'px) ' + line.attr('angle'));
            setTimeout(function() {
              line.addClass('zooms');
              line.css({
                'width': prevWidth,
                'transform': line.attr('angle')
              });
            }, 100);
          }
        }
        $('.circle:contains(' + path[animationSequence] + ')').addClass('route-circle-animation');
        $(this).off('webkitTransitionEnd');

      });
      if (line.length > 0) {
        line.css('width', 0);
      }
    }

  }

  if (startCircle == '') {
    return;
  }

  $('.circle:contains(' + path[startCircle] + ')').addClass('route-circle-animation');

  if (path.length > 1) {
    var firstName = path[startCircle];
    var secondName = path[parseInt(startCircle) + 1];

    var line = $('.line[data-begin=' + firstName + '][data-end=' + secondName + ']');
    if (line.length > 0) {
      var prevWidth = widths[startCircle];

      line.addClass('zooms');
      line.css('width', prevWidth);
    }

    // lines going the opposite direction can be translated to appear to be drawn from the other direction
    line = $('.line[data-begin=' + secondName + '][data-end=' + firstName + ']');
    if (line.length > 0) {
      var prevWidth = widths[startCircle];

      var firstCircle = $('.circle:contains(' + firstName + ')');
      var secondCircle = $('.circle:contains(' + secondName + ')');

      var xOffset = parseInt(firstCircle.css('left')) - parseInt(secondCircle.css('left'));
      var yOffset = parseInt(firstCircle.css('top')) - parseInt(secondCircle.css('top'));

      line.css('transform', 'translate(' + xOffset + 'px,' + yOffset + 'px) ' + line.attr('angle'));
      setTimeout(function() {
        line.addClass('zooms');
        line.css({
          'width': prevWidth,
          'transform': line.attr('angle')
        });
      }, 100);
    }
  }

}