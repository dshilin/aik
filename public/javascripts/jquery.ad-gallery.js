/**
 * Copyright (c) 2009 Anders Ekdahl (http://coffeescripter.com/)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 *
 * Version: 1.1.1
 *
 * Demo and documentation: http://coffeescripter.com/code/ad-gallery/
 */
(function($) {
  $.fn.adGallery = function(options) {
    var defaults = { loader_image: 'loader.gif',
                     start_at_index: 0,
                     thumb_opacity: 0.7,
                     animate_first_image: false,
                     animation_speed: 400,
                     width: false,
                     height: false,
                     display_next_and_prev: true,
                     display_back_and_forward: true,
                     scroll_jump: 0, // If 0, it jumps the width of the container
                     animated_scroll: true,
                     slideshow: {
                       enable: false,
                       autostart: false,
                       speed: 5000,
                       start_label: 'Start',
                       stop_label: 'Stop',
                       stop_on_scroll: true,
                       countdown_prefix: '(',
                       countdown_sufix: ')'
                     },
                     effect: 'slide-vert', // or 'slide-vert', 'fade', or 'resize', 'none', false
                     enable_keyboard_move: true,
                     cycle: true,
                     callbacks: {
                       init: false,
                       afterImageVisible: false,
                       beforeImageVisible: false,
                       slideShowStart: false,
                       slideShowStop: false
                     }
    };
    var settings = $.extend(defaults, options);
    if(!settings.slideshow.enable) {
      settings.slideshow.autostart = false;
    };
    var galleries = [];
    $(this).each(function() {
      var gallery = new AdGallery(this, settings);
      galleries[galleries.length] = gallery;
    });
    // Sorry, breaking the jQuery chain because the gallery instances
    // are returned so you can fiddle with them
    return galleries;
  };

  function AdGallery(wrapper, settings) {
    this.init(wrapper, settings);
  };
  AdGallery.prototype = {
    // Elements
    wrapper: false,
    image_wrapper: false,
    gallery_info: false,
    nav: false,
    loader: false,
    preloads: false,
    thumbs_wrapper: false,
    scroll_back: false,
    scroll_forward: false,
    next_link: false,
    prev_link: false,
    start_slideshow_link: false,
    stop_slideshow_link: false,
    slideshow_countdown: false,
    slideshow_controls: false,

    slideshow_enabled: false,
    slideshow_running: false,
    slideshow_timeout: false,
    slideshow_countdown_interval: false,
    thumbs_scroll_interval: false,
    image_wrapper_width: 0,
    image_wrapper_height: 0,
    current_index: 0,
    current_image: false,
    nav_display_width: 0,
    settings: false,
    images: false,
    in_transition: false,
    init: function(wrapper, settings) {
      var context = this;
      this.wrapper = $(wrapper);
      this.settings = settings;
      this.setupElements();
      if(this.settings.width) {
        this.image_wrapper_width = this.settings.width;
        this.image_wrapper.width(this.settings.width);
        this.wrapper.width(this.settings.width);
      } else {
        this.image_wrapper_width = this.image_wrapper.width();
      };
      if(this.settings.height) {
        this.image_wrapper_height = this.settings.height;
        this.image_wrapper.height(this.settings.height);
      } else {
        this.image_wrapper_height = this.image_wrapper.height();
      };
      this.nav_display_width = this.nav.width();
      this.images = [];
      this.current_index = 0;
      this.current_image = false;
      this.in_transition = false;
      this.slideshow_enabled = false;
      this.findImages();

      if(this.settings.display_next_and_prev) {
        this.initNextAndPrev();
      };
      this.initSlideshow();
      if(!this.settings.slideshow.enable) {
        this.disableSlideshow();
      } else {
        this.enableSlideshow();
      };
      if(this.settings.display_back_and_forward) {
        this.initBackAndForward();
      };
      if(this.settings.enable_keyboard_move) {
        this.initKeyEvents();
      };
      var start_at = this.settings.start_at_index;
      if(window.location.hash && window.location.hash.indexOf('#ad-image') === 0) {
        start_at = window.location.hash.replace(/[^0-9]+/g, '');
        // Check if it's a number
        if((start_at * 1) != start_at) {
          start_at = this.settings.start_at_index;
        };
      };

      this.loading(true);
      this.showImage(start_at,
        function() {
          // This function gets fired when the image is visible, that is,
          // after it has been loaded, and after some effect has made it visible
          // We don't want to start the slideshow before the image has been
          // displayed
          if(context.settings.slideshow.autostart) {
            context.preloadImage(start_at + 1);
            context.startSlideshow();
          };
        }
      );
      if(typeof this.settings.callbacks.init == 'function') {
        this.settings.callbacks.init.call(this);
      };
    },
    setupElements: function() {
      this.controls = this.wrapper.find('.ad-controls');
      this.gallery_info = $('<p class="ad-info"></p>');
      this.controls.append(this.gallery_info);
      this.image_wrapper = this.wrapper.find('.ad-image-wrapper');
      this.image_wrapper.empty();
      this.nav = this.wrapper.find('.ad-nav');
      this.thumbs_wrapper = this.nav.find('.ad-thumbs');
      this.preloads = $('<div class="ad-preloads"></div>');
      this.loader = $('<img class="ad-loader" src="'+ this.settings.loader_image +'">');
      this.image_wrapper.append(this.loader);
      this.loader.hide();
      $(document.body).append(this.preloads);
    },
    loading: function(bool) {
      if(bool) {
        this.loader.show();
      } else {
        this.loader.hide();
      };
    },
    findImages: function() {
      var context = this;
      var thumb_wrapper_width = 0;
      var thumbs_loaded = 0;
      var thumbs = this.thumbs_wrapper.find('a');
      var thumb_count = thumbs.length;
      if(this.settings.thumb_opacity < 1) {
        thumbs.find('img').css('opacity', this.settings.thumb_opacity);
      };
      thumbs.each(
        function(i) {
          var link = $(this);
          var image = link.attr('href');
          var thumb = link.find('img');
          // Check if the thumb has already loaded
          if(!context.isImageLoaded(thumb[0])) {
            thumb.load(
              function() {
                var width = this.parentNode.parentNode.offsetWidth;
                thumb_wrapper_width += width;
                thumbs_loaded++;
              }
            );
          } else{
            var width = thumb[0].parentNode.parentNode.offsetWidth;
            thumb_wrapper_width += width;
            thumbs_loaded++;
          };
          link.addClass('ad-thumb'+ i);
          link.click(
            function() {
              context.showImage(i);
              context.stopSlideshow();
              return false;
            }
          ).hover(
            function() {
              if(!$(this).is('.ad-active') && context.settings.thumb_opacity < 1) {
                $(this).find('img').fadeTo(300, 1);
              };
              context.preloadImage(i);
            },
            function() {
              if(!$(this).is('.ad-active') && context.settings.thumb_opacity < 1) {
                $(this).find('img').fadeTo(300, context.settings.thumb_opacity);
              };
            }
          );
          var desc = false;
          if(thumb.data('ad-desc')) {
            desc = thumb.data('ad-desc');
          } else if(thumb.attr('longdesc').length) {
            desc = thumb.attr('longdesc');
          };
          var title = false;
          if(thumb.data('ad-title')) {
            title = thumb.data('ad-title');
          } else if(thumb.attr('title').length) {
            title = thumb.attr('title');
          };
          context.images[i] = { thumb: thumb.attr('src'), image: image, error: false,
                                preloaded: false, desc: desc, title: title, size: false };
        }
      );
      // Wait until all thumbs are loaded, and then set the width of the ul
      var inter = setInterval(
        function() {
          if(thumb_count == thumbs_loaded) {
            context.nav.find('ul').css('width', thumb_wrapper_width +'px');
            clearInterval(inter);
          };
        },
        100
      );
    },
    initKeyEvents: function() {
      var context = this;
      $(document).keydown(
        function(e) {
          if(e.keyCode == 39) {
            // right arrow
            context.nextImage();
            context.stopSlideshow();
          } else if(e.keyCode == 37) {
            // left arrow
            context.prevImage();
            context.stopSlideshow();
          } else if(e.keyCode == 83) {
            // 's'
            if(context.slideshow_running) {
              context.stopSlideshow();
            } else {
              context.startSlideshow();
            };
          };
        }
      );
    },
    initNextAndPrev: function() {
      this.next_link = $('<div class="ad-next"><div class="ad-next-image"></div></div>');
      this.prev_link = $('<div class="ad-prev"><div class="ad-prev-image"></div></div>');
      this.image_wrapper.append(this.next_link);
      this.image_wrapper.append(this.prev_link);
      var context = this;
      this.prev_link.add(this.next_link).mouseover(
        function(e) {
          // IE 6 hides the wrapper div, so we have to set it's width
          $(this).css('height', context.image_wrapper_height);
          $(this).find('div').show();
        }
      ).mouseout(
        function(e) {
          $(this).find('div').hide();
        }
      ).click(
        function() {
          if($(this).is('.ad-next')) {
            context.nextImage();
            context.stopSlideshow();
          } else {
            context.prevImage();
            context.stopSlideshow();
          };
        }
      ).find('div').css('opacity', 0.7);
    },
    initBackAndForward: function() {
      var context = this;
      this.scroll_forward = $('<div class="ad-forward"></div>');
      this.scroll_back = $('<div class="ad-back"></div>');
      this.nav.append(this.scroll_forward);
      this.nav.prepend(this.scroll_back);
      var has_scrolled = 0;
      $(this.scroll_back).add(this.scroll_forward).click(
        function() {
          // We don't want to jump the whole width, since an image
          // might be cut at the edge
          var width = context.nav_display_width - 50;
          if(context.settings.scroll_jump > 0) {
            var width = context.settings.scroll_jump;
          };
          if($(this).is('.ad-forward')) {
            var left = context.thumbs_wrapper.scrollLeft() + width;
          } else {
            var left = context.thumbs_wrapper.scrollLeft() - width;
          };
          if(context.settings.slideshow.stop_on_scroll) {
            context.stopSlideshow();
          };
          if(context.settings.animated_scroll) {
            context.thumbs_wrapper.animate({scrollLeft: left +'px'});
          } else {
            context.thumbs_wrapper.scrollLeft(left);
          };
          return false;
        }
      ).css('opacity', 0.6).hover(
        function() {
          var direction = 'left';
          if($(this).is('.ad-forward')) {
            direction = 'right';
          };
          context.thumbs_scroll_interval = setInterval(
            function() {
              has_scrolled++;
              if(has_scrolled > 30 && context.settings.slideshow.stop_on_scroll) {
                context.stopSlideshow();
              };
              var left = context.thumbs_wrapper.scrollLeft() + 1;
              if(direction == 'left') {
                left = context.thumbs_wrapper.scrollLeft() - 1;
              };
              context.thumbs_wrapper.scrollLeft(left);
            },
            10
          );
          $(this).css('opacity', 1);
        },
        function() {
          has_scrolled = 0;
          clearInterval(context.thumbs_scroll_interval);
          $(this).css('opacity', 0.6);
        }
      );
    },
    initSlideshow: function() {
      var context = this;
      this.start_slideshow_link = $('<span class="ad-slideshow-start">'+ this.settings.slideshow.start_label +'</span>');
      this.stop_slideshow_link = $('<span class="ad-slideshow-stop">'+ this.settings.slideshow.stop_label +'</span>');
      this.slideshow_countdown = $('<span class="ad-slideshow-countdown"></span>');
      this.slideshow_controls = $('<div class="ad-slideshow-controls"></div>');
      this.slideshow_controls.append(this.start_slideshow_link).append(this.stop_slideshow_link).append(this.slideshow_countdown);
      this.controls.append(this.slideshow_controls);
      this.slideshow_countdown.hide();

      this.start_slideshow_link.click(
        function() {
          context.startSlideshow();
        }
      );
      this.stop_slideshow_link.click(
        function() {
          context.stopSlideshow();
        }
      );
    },
    disableSlideshow: function() {
      this.slideshow_enabled = false;
      this.stopSlideshow();
      this.slideshow_controls.hide();
    },
    enableSlideshow: function() {
      this.slideshow_enabled = true;
      this.slideshow_controls.show();
    },
    toggleSlideshow: function() {
      if(this.slideshow_enabled) {
        this.disableSlideshow();
      } else {
        this.enableSlideshow();
      };
    },
    startSlideshow: function() {
      if(this.slideshow_running || !this.slideshow_enabled) return false;
      var context = this;
      this.slideshow_running = true;
      this.slideshow_controls.addClass('ad-slideshow-running');
      this._slideshowNext();
      if(typeof this.settings.callbacks.slideShowStart == 'function') {
        this.settings.callbacks.slideShowStart.call(this);
      };
      return true;
    },
    _slideshowNext: function() {
      var context = this;
      var pre = this.settings.slideshow.countdown_prefix;
      var su = this.settings.slideshow.countdown_sufix;
      clearInterval(context.slideshow_countdown_interval);
      this.slideshow_countdown.show().html(pre + (this.settings.slideshow.speed / 1000) + su);
      var slide_timer = 0;
      this.preloadImage(this.nextIndex(),
        function() {
          context.slideshow_countdown_interval = setInterval(
            function() {
              slide_timer += 1000;
              if(slide_timer >= context.settings.slideshow.speed) {
                if(!context.nextImage()) {
                  context.stopSlideshow();
                } else {
                  context._slideshowNext();
                  return;
                };
                slide_timer = 0;
              };
              context.slideshow_countdown.show();
              var sec = parseInt(context.slideshow_countdown.text().replace(/[^0-9]/g, ''), 10);
              sec--;
              if(sec > 0) {
                context.slideshow_countdown.html(pre + sec + su);
              };
            },
            1000
          );
        }
      );
    },
    stopSlideshow: function() {
      if(!this.slideshow_running) return false;
      this.slideshow_running = false;
      this.slideshow_countdown.hide();
      this.slideshow_controls.removeClass('ad-slideshow-running');
      clearTimeout(this.slideshow_timeout);
      clearInterval(this.slideshow_countdown_interval);
      if(typeof this.settings.callbacks.slideShowStop == 'function') {
        this.settings.callbacks.slideShowStop.call(this);
      };
      return true;
    },
    /**
     * @param function callback Gets fired when the image has loaded and is displaying
     */
    showImage: function(index, callback) {
      if(this.images[index] && !this.in_transition) {
        var context = this;
        var image = this.images[index];
        this.in_transition = true;
        if(!image.preloaded) {
          this.loading(true);
          this.preloadImage(index, function() {
            context.loading(false);
            context._showWhenLoaded(index, callback);
          });
        } else {
          this._showWhenLoaded(index, callback);
        };
      };
    },
    _afterShow: function() {
      this.gallery_info.html((this.current_index + 1) +' / '+ this.images.length);
      if(!this.settings.cycle) {
        this.prev_link.show().css('height', this.image_wrapper_height);
        this.next_link.show().css('height', this.image_wrapper_height);
        if(this.current_index == (this.images.length - 1)) {
          this.next_link.hide();
        };
        if(this.current_index == 0) {
          this.prev_link.hide();
        };
      };
      if(typeof this.settings.callbacks.afterImageVisible == 'function') {
        this.settings.callbacks.afterImageVisible.call(this);
      };
    },
    /**
     * Checks if the image is small enough to fit inside the container
     * If it's not, shrink it proportionally
     */
    _getContainedImageSize: function(image_width, image_height) {
      if(image_height > this.image_wrapper_height) {
        var ratio = image_width / image_height;
        image_height = this.image_wrapper_height;
        image_width = this.image_wrapper_height * ratio;
      };
      if(image_width > this.image_wrapper_width) {
  	    var ratio = image_height / image_width;
  	    image_width = this.image_wrapper_width;
  	    image_height = this.image_wrapper_width * ratio;
  	  };
      return {width: image_width, height: image_height};
    },
    /**
     * If the image dimensions are smaller than the wrapper, we position
     * it in the middle anyway
     */
    _centerImage: function(img_container, image_width, image_height) {
      img_container.css('top', '0px');
      if(image_height < this.image_wrapper_height) {
        var dif = this.image_wrapper_height - image_height;
        img_container.css('top', (dif / 2) +'px');
      };
      img_container.css('left', '0px');
      if(image_width < this.image_wrapper_width) {
        var dif = this.image_wrapper_width - image_width;
        img_container.css('left', (dif / 2) +'px');
      };
    },
    _showDescription: function(image, img_container) {
      var desc = false;
      if(image.desc.length || image.title.length) {
        var title = '';
        if(image.title.length) {
          title = '<strong class="ad-description-title">'+ image.title +'</strong>';
        };
        var desc = '';
        if(image.desc.length) {
          desc = '<span>'+ image.desc +'</span>';
        };
        var desc = $('<p class="ad-image-description">'+ title + desc +'</p>');
        img_container.append(desc);
      };
      return desc;
    },
    /**
     * @param function callback Gets fired when the image has loaded and is displaying
     */
    _showWhenLoaded: function(index, callback) {
      if(this.images[index]) {
        var context = this;
        var image = this.images[index];
        var img_container = $(document.createElement('div'));
        var img = $(new Image());
        img_container.addClass('ad-image');
        img_container.append(img);
        img.attr('src', image.image);
        this.image_wrapper.prepend(img_container);
        var size = this._getContainedImageSize(image.size.width, image.size.height);
        var image_width = size.width;
        var image_height = size.height;
        img.attr('width', image_width);
        img.attr('height', image_height);
        img_container.css({width: image_width +'px', height: image_height +'px'});
        this._centerImage(img_container, image_width, image_height);
        var desc = this._showDescription(image, img_container);

        var thumb = this.nav.find('.ad-thumb'+ index);
        this.highLightThumb(thumb);

        var direction = 'right';
        if(this.current_index < index) {
          direction = 'left';
        };
        if(typeof this.settings.callbacks.beforeImageVisible == 'function') {
          this.settings.callbacks.beforeImageVisible.call(this, img_container, this.current_image);
        };
        var animation_speed = this.settings.animation_speed;
        if(this.current_image || this.settings.animate_first_image) {
          var new_image_animation = {};
          var old_image_animation = {};
          if(this.settings.effect == 'fade') {
            img_container.css('opacity', 0);
            old_image_animation = {opacity: 0};
            new_image_animation = {opacity: 1};
          } else if(this.settings.effect == 'resize') {
            var current_left = parseInt(img_container.css('left'), 10);
            var current_top = parseInt(img_container.css('top'), 10);
            img_container.css({width: 0, height: 0, top: this.image_wrapper_height / 2, left: this.image_wrapper_width / 2});
            old_image_animation = {width: 0,
                                   height: 0,
                                   top: this.image_wrapper_height / 2,
                                   left: this.image_wrapper_width / 2};
            new_image_animation = {width: image_width,
                                   height: image_height,
                                   top: current_top,
                                   left: current_left};
          } else if(this.settings.effect == 'slide-hori') {
            if(direction == 'left') {
              var old_image_left = '-'+ this.image_wrapper_width +'px';
              var new_image_left = this.image_wrapper_width +'px';
            } else {
              var old_image_left = this.image_wrapper_width +'px';
              var new_image_left = '-'+ this.image_wrapper_width +'px';
            };
            var current_left = parseInt(img_container.css('left'), 10);
            img_container.css('left', new_image_left);
            old_image_animation = {left: old_image_left};
            new_image_animation = {left: current_left};
            if(desc) {
              desc.css('bottom', '-'+ desc[0].offsetHeight +'px');
              desc.animate({bottom: 0}, this.settings.animation_speed * 2);
            };
          } else if(this.settings.effect == 'slide-vert') {
            if(direction == 'left') {
              var old_image_top = '-'+ this.image_wrapper_height +'px';
              var new_image_top = this.image_wrapper_height +'px';
            } else {
              var old_image_top = this.image_wrapper_height +'px';
              var new_image_top = '-'+ this.image_wrapper_height +'px';
            };
            var current_top = parseInt(img_container.css('top'), 10);
            img_container.css('top', new_image_top);
            old_image_animation = {top: old_image_top};
            new_image_animation = {top: current_top};
            if(desc) {
              desc.css('bottom', '-'+ desc[0].offsetHeight +'px');
              desc.animate({bottom: 0}, this.settings.animation_speed * 2);
            };
          } else if(!this.settings.effect || this.settings.effect == 'none') {
            old_image_animation = {opacity: 1};
            new_image_animation = {opacity: 1};
            animation_speed = 0;
          };
          if(this.current_image) {
            var old_image = this.current_image;
            old_image.animate(old_image_animation, animation_speed,
              function() {
                old_image.remove();
              }
            );
          };
          img_container.animate(new_image_animation, animation_speed,
            function() {
              context.current_index = index;
              context.current_image = img_container;
              context.in_transition = false;
              context._afterShow();
            }
          );
        } else {
          this.current_index = index;
          this.current_image = img_container;
          this.in_transition = false;
          context._afterShow();
        };
        if(typeof callback == 'function') {
          callback.call(this);
        };
      };
    },
    nextIndex: function() {
      if(this.current_index == (this.images.length - 1)) {
        if(!this.settings.cycle) {
          return false;
        };
        var next = 0;
      } else {
        var next = this.current_index + 1;
      };
      return next;
    },
    nextImage: function(callback) {
      var next = this.nextIndex();
      if(next === false) return false;
      this.preloadImage(next + 1);
      this.showImage(next, callback);
      return true;
    },
    prevIndex: function() {
      if(this.current_index == 0) {
        if(!this.settings.cycle) {
          return false;
        };
        var prev = this.images.length - 1;
      } else {
        var prev = this.current_index - 1;
      };
      return prev;
    },
    prevImage: function(callback) {
      var prev = this.prevIndex();
      if(prev === false) return false;
      this.preloadImage(prev - 1);
      this.showImage(prev, callback);
      return true;
    },
    preloadAll: function() {
      var context = this;
      var i = 0;
      function preloadNext() {
        if(i < context.images.length) {
          i++;
          context.preloadImage(i, preloadNext);
        };
      };
      context.preloadImage(i, preloadNext);
    },
    preloadImage: function(index, callback) {
      if(this.images[index]) {
        var image = this.images[index];
        if(!this.images[index].preloaded) {
          var img = $(new Image());
          img.attr('src', image.image);
          if(!this.isImageLoaded(img[0])) {
            this.preloads.append(img);
            var context = this;
            image.is_preloading = true;
            img.load(
              function() {
                image.preloaded = true;
                image.is_preloading = false;
                image.size = { width: this.width, height: this.height };
                if(typeof callback == 'function') {
                  callback.call(this);
                };
              }
            ).error(
              function() {
                image.error = true;
                image.preloaded = false;
                image.is_preloading = false;
                image.size = false;
              }
            );
          } else {
            image.preloaded = true;
            image.is_preloading = false;
            image.size = { width: img[0].width, height: img[0].height };
            if(typeof callback == 'function') {
              callback.call(this);
            };
          };
        } else {
          if(typeof callback == 'function') {
            callback.call(this);
          };
        };
      };
    },
    isImageLoaded: function(img) {
      if(typeof img.complete != 'undefined' && !img.complete) {
        return false;
      };
      if(typeof img.naturalWidth != 'undefined' && img.naturalWidth == 0) {
        return false;
      };
      return true;
    },
    highLightThumb: function(thumb) {
      this.thumbs_wrapper.find('.ad-active').removeClass('ad-active');
      thumb.addClass('ad-active');
      if(this.settings.thumb_opacity < 1) {
        this.thumbs_wrapper.find('a:not(.ad-active) img').fadeTo(300, this.settings.thumb_opacity);
        thumb.find('img').fadeTo(300, 1);
      };
      var left = thumb[0].parentNode.offsetLeft;
      left -= (this.nav_display_width / 2) - (thumb[0].offsetWidth / 2);
      if(this.settings.animated_scroll) {
        this.thumbs_wrapper.animate({scrollLeft: left +'px'});
      } else {
        this.thumbs_wrapper.scrollLeft(left);
      };
    }
  };
})(jQuery);