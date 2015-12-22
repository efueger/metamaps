Metamaps.Views = Metamaps.Views || {};

Metamaps.Views.videoView = (function () {

    var videoView;

    var Private = {
        addControls: function() {
            var self = this;

            this.$audioControl = $('<div class="video-audio"></div>');
            this.$videoControl = $('<div class="video-video"></div>');

            this.$audioControl.on('click', function () {
                Handlers.audioControlClick.call(self);
            });

            this.$videoControl.on('click', function () {
                Handlers.videoControlClick.call(self);
            });

            this.$container.append(this.$audioControl);
            this.$container.append(this.$videoControl);
        },
        cancelClick: function() {
            this.mouseIsDown = false;

            if (this.hasMoved) {

            }

            $(document).trigger(videoView.events.dragEnd);
        }
    };

    var Handlers = {
        mousedown: function(event) {
            this.mouseIsDown = true;
            this.hasMoved = false;
            this.mouseMoveStart = {
                x: event.pageX,
                y: event.pageY
            };
            this.posStart = {
                x: parseInt(this.$container.css('left'), '10'),
                y: parseInt(this.$container.css('top'), '10')
            }

            $(document).trigger(videoView.events.mousedown);
        },
        mouseup: function(event) {
            $(document).trigger(videoView.events.mouseup, [this]);

            var storedTime = this.lastClick;
            var now = Date.now();
            this.lastClick = now;

            if (now - storedTime < this.config.DOUBLE_CLICK_TOLERANCE) {
                $(document).trigger(videoView.events.doubleClick, [this]);
            }
        },
        mousemove: function(event) {
            var
              diffX,
              diffY,
              newX,
              newY;

            if (this.$parent && this.mouseIsDown) {
                this.hasMoved = true;
                diffX = event.pageX - this.mouseMoveStart.x;
                diffY = this.mouseMoveStart.y - event.pageY;
                newX = this.posStart.x + diffX;
                newY = this.posStart.y - diffY;
                this.$container.css({
                    top: newY,
                    left: newX
                });
            }
        },
        audioControlClick: function() {
            if (this.audioStatus) {
              this.audioOff();
            } else {
              this.audioOn();
            }
            $(document).trigger(videoView.events.audioControlClick, [this]);
        },
        videoControlClick: function() {
            if (this.videoStatus) {
              this.videoOff();
            } else {
              this.videoOn();
            }
            $(document).trigger(videoView.events.videoControlClick, [this]);
        },
        /*yesReceiveClick: function () {
          this.$receiveContainer.hide();
          this.$avatar.hide();
          $(this.video).prop('muted', false);
        },
        noReceiveClick: function () {
          this.$container.hide();
        }*/
    };

    var videoView = function(video, $parent, id, isMyself, config) {
        var self = this;

        this.$parent = $parent; // mapView

        this.video = video;
        this.id = id;

        this.config = config;

        this.mouseIsDown = false;
        this.mouseDownOffset = { x: 0, y: 0 };
        this.lastClick = null;
        this.hasMoved = false;

        this.audioStatus = true;
        this.videoStatus = true;

        this.$container = $('<div></div>');
        this.$container.addClass('collaborator-video' + (isMyself ? ' my-video' : ''));
        this.$container.attr('id', 'container_' + id);


        var $vidContainer = $('<div></div>');
        $vidContainer.addClass('video-cutoff');
        $vidContainer.append(this.video);

        /*
        if (!isMyself) {
          this.$receiveContainer = $('<div class="video-receive"><div class="video-statement">' + config.username + ' is sharing their audio and video. Do you wish to receive it?</div><div class="btn-group"><button type="button" class="button btn-yes">Yes</button><button type="button" class="button btn-no">No</button></div></div>');
          this.$container.append(this.$receiveContainer);
          this.$container.find('.btn-yes').on('click', function (event) {
              Handlers.yesReceiveClick.call(self, event);
          });
          this.$container.find('.btn-no').on('click', function (event) {
              Handlers.noReceiveClick.call(self, event);
          });
        }*/

        this.avatar = config.avatar;
        this.$avatar = $('<img draggable="false" class="collaborator-video-avatar" src="' + config.avatar + '" width="150" height="150" />');
        $vidContainer.append(this.$avatar);

        this.$container.append($vidContainer);

        this.$container.on('mousedown', function (event) {
            Handlers.mousedown.call(self, event);
        });

        if (isMyself) {
          Private.addControls.call(this);
        }

        // suppress contextmenu
        this.video.oncontextmenu = function () { return false; };

        if (this.$parent) this.setParent(this.$parent);
    };

    videoView.prototype.setParent = function($parent) {
        var self = this;
        this.$parent = $parent;
        this.$parent.off('.video' + this.id);
        this.$parent.on('mouseup.video' + this.id, function (event) {
            Handlers.mouseup.call(self, event);
            Private.cancelClick.call(self);
        });
        this.$parent.on('mousemove.video' + this.id, function (event) {
            Handlers.mousemove.call(self, event);
        });
    }

    videoView.prototype.setAvatar = function (src) {
        this.$avatar.attr('src', src);
        this.avatar = src;
    }

    videoView.prototype.remove = function () {
        this.$container.off();
        if (this.$parent) this.$parent.off('.video' + this.id);
        this.$container.remove();
    }

    videoView.prototype.videoOff = function () {
      this.$videoControl.addClass('active');
      this.$avatar.show();
      this.videoStatus = false;
    }

    videoView.prototype.videoOn = function () {
      this.$videoControl.removeClass('active');
      this.$avatar.hide();
      this.videoStatus = true;
    }

    videoView.prototype.audioOff = function () {
      this.$audioControl.addClass('active');
      this.audioStatus = false;
    }

    videoView.prototype.audioOn = function () {
      this.$audioControl.removeClass('active');
      this.audioStatus = true;
    }

    /**
     * @class
     * @static
     */
    videoView.events = {
        mousedown: "VideoView:mousedown",
        mouseup: "VideoView:mouseup",
        doubleClick: "VideoView:doubleClick",
        dragEnd: "VideoView:dragEnd",
        audioControlClick: "VideoView:audioControlClick",
        videoControlClick: "VideoView:videoControlClick",
    };

    return videoView;
})();
