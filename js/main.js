var Cleany = {
    init : function() {
        this.initMenuToggle();
        this.initMenuInteraction();
        this.initPostSlider();
        this.initVideoPlayer();
        this.initContactForm();
    },
    initContactForm : function() {
        $('#contact-form').submit(this.submitContact);
    },
    submitContact : function() {
        $('#message-submit').text('Sending...');
        $.ajax({
            url: '/contact.php',
            type: "POST",
            data: {
                "message-select" : $('#message-select').val(),
                "message-name" : $('#message-name').val(),
                "message-email" : $('#message-email').val(),
                "message" : $('#message').val(),
                "message-submit" : true
            }
        }).done(function(rsp) {
                alert('message sent');
                $('#message-submit').text('Send Message').attr('disabled', 'disabled');
            });
        e.preventDefault();
    },
    initVideoPlayer : function() {
        $("#jquery_jplayer_1").jPlayer({
            ready: function () {
                $(this).jPlayer("setMedia", {
                    title: "Bubble",
                    m4v: "media/Glassboy-SD.mp4"
                });
            },
            backgroundColor : "#cccccc",
            swfPath: "plugins/jplayer",
            supplied: "m4v",
            cssSelectorAncestor: "#video-player",
            cssSelector: {
                play: "#video-play",
                pause: "#video-pause",
                stop: "#video-stop",
                mute: "#video-mute",
                unmute: "#video-unmute",
                currentTime: "#video-currentTime",
                duration: "#video-duration",
                fullScreen : "#video-full"
            }
        });
    },
    initPostSlider : function() {
        $('.nivoSlider').nivoSlider({
            effect: 'sliceDownLeft',        // Specify sets like: 'fold,fade,sliceDown'
            slices: 15,                     // For slice animations
            boxCols: 8,                     // For box animations
            boxRows: 4,                     // For box animations
            animSpeed: 500,                 // Slide transition speed
            pauseTime: 10000,                // How long each slide will show
            startSlide: 0,                  // Set starting Slide (0 index)
            directionNav: true,            // Next & Prev navigation
            controlNav: false,               // 1,2,3... navigation
            controlNavThumbs: false,        // Use thumbnails for Control Nav
            pauseOnHover: true,             // Stop animation while hovering
            prevText: '',               // Prev directionNav text
            nextText: '',               // Next directionNav text
            manualAdvance: false,             // Next directionNav text
            randomStart: false,             // Start on a random slide
            beforeChange: function(){},     // Triggers before a slide transition
            afterChange: function(){},      // Triggers after a slide transition
            slideshowEnd: function(){},     // Triggers after all slides have been shown
            lastSlide: function(){},        // Triggers when last slide is shown
            afterLoad: function(){}         // Triggers when slider has loaded
        });
    },
    initMenuToggle : function() {
        $('.menu').outerHeight($(window).height());
        $('.menu-button').click(this.toggleSideMenu);
    },
    initMenuInteraction : function() {
        $('.menu').find('>ul').find('>li').find('>a').click(this.sideMenuInteraction);
    },
    toggleSideMenu : function(e) {
        var $body = $('body');
        var $menuButton = $('.menu-button');
        $('#main-container').css('min-height', $(window).height() + "px");
        if($body.hasClass('menu-open')) {
            $menuButton.removeClass('open').addClass('closed');
            $body.removeClass('menu-open');
        } else {
            $menuButton.removeClass('closed').addClass('open');
            setTimeout(function() {
                $body.addClass('menu-open');
            }, 50);
        }
        e.preventDefault();
    },
    sideMenuInteraction : function(e) {
        var $el = $(this);
        var $next = $(this).next();
        if($next.is('ul')) {
            if($next.is(':visible')) {
                $next.slideUp(300);
                $el.parent().removeClass('selected');
            } else {
                $next.slideDown(300);
                $el.parent().addClass('selected');
            }
            e.preventDefault();
        }
    }
}
$(document).ready(function() {
    Cleany.init();
});
$(window).resize(function() {

});
$(window).scroll(function(){
});