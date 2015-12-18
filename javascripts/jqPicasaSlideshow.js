/*
    jqPicasaSlideshow - (c) 2010 - Emil M?ller
    http://ize.webhop.net/home/jquery-plugins/jqpicasaslideshow
  Released under the GPL License
  http://www.gnu.org/licenses/gpl-3.0.txt

  requires:
  - jQuery 1.4.x

  optional:
  - jqCurtainsTransition.js (required if you'd like to use transition: 'curtains')
*/
(function($) {

    $.fn.PicasaSlideshow = function(settings) {
        var config = {
            AlbumRSS: 'http://picasaweb.google.com/data/feed/base/user/izemanNL/albumid/5122324011051876481?alt=rss&kind=photo&hl=en_US',
            width: 640,
            height: 360,
            interval: 7000,
            showTitle: true,
            shuffle: false,
            linkToOriginal: true,
            transition: 'fadeInOut' // fadeInOut - standard jquery fadein/fadeout, curtains - curtains transition (requires jqCurtainsTransition.js)
        };
        var albumFeed;
        var index = -1;
        var imgWidth = 72;
        var titleTimeout = -1;

        if (settings) $.extend(config, settings);

        ImageInfo = function(title, src, url) {
            this.title = title;
            this.src = src;
            this.url = url;
        }

        init = function(el) {
            setupMainContainer(el);

            setupLoader(el);

            setupImagesContainer(el);
            setupTitleContainer(el);

            initImageWidth();

            setupEvents(el);

            loadAlbum(el);
        }

        setupMainContainer = function(el) {
            $(el).css({ 'width': config.width + 'px', 'height': config.height + 'px', 'overflow': 'hidden', 'position': 'relative' });
        }

        setupLoader = function(el) {
            var loader = $("<img />").attr("id", "loader").attr("src", "http://www.ajaxload.info/download.php?img=cache/00/00/00/09/3A/89/38-1.gif");
            loader.css({ 'top': '48%', 'left': '48%', 'position': 'absolute' });
            $(el).append(loader);
        }

        setupTitleContainer = function(el) {
            var titleContainer = $("<div />").attr("id", "titleContainer").attr("hidden", "true");
            titleContainer.css({ 'width': config.width + 'px', 'height': '20px', 'position': 'absolute', 'left': '0px', 'top': '-20px', 'overflow': 'hidden' });

            titleContainer.append($("<div />").attr("id", "label"));
            $(el).append(titleContainer);
        }

        setupImagesContainer = function(el) {
            var imagesContainer = $("<div />").attr("id", "imagesContainer");
            imagesContainer.css({ 'width': config.width + 'px', 'height': config.height + 'px', 'overflow': 'hidden', 'position': 'absolute', 'top': '0px', 'left': '0px' });
            $(el).append(imagesContainer);
        }

        initImageWidth = function() {
            if (config.width >= 72) imgWidth = "72";
            if (config.width >= 160) imgWidth = "160";
            if (config.width >= 320) imgWidth = "320";
            if (config.width >= 400) imgWidth = "400";
            if (config.width >= 640) imgWidth = "640";
            if (config.width >= 800) imgWidth = "800";
            if (config.width >= 1024) imgWidth = "1024";
            if (config.width >= 1280) imgWidth = "1280";
            if (config.width >= 1440) imgWidth = "1440";
            if (config.width >= 1600) imgWidth = "1600";
        }

        setupEvents = function(el) {
            $(el).mouseenter(function() { clearTimeout(titleTimeout); showTitleContainer(el); });
            $(el).mouseleave(function() { hideTitleContainer(el); });
        }

        loadAlbum = function(el) {
            //replace alt param with json-in-script
            var url = config.AlbumRSS.replace("alt=rss", "alt=json-in-script");
            url += "&callback=?";
            $.getJSON(url, function(data) {
                albumFeed = data.feed;
                $("#loader", $(el)).remove();

                if (config.shuffle) fisherYates(albumFeed.entry); //shuffle array

                switchSlide(el);
            });
        }

        getNextImage = function(el) {
            index++;
            if (index >= albumFeed.entry.length) index = 0;

            return new ImageInfo(albumFeed.entry[index].title.$t,
                                    albumFeed.entry[index].media$group.media$thumbnail[0].url.replace(/\/s72\//g, "/s" + imgWidth + "/"),
                                    albumFeed.entry[index].media$group.media$content[0].url);
        }

        switchSlide = function(el) {
            var nextImg = getNextImage(el);
            $('<img />')
            .attr('id', "nextImg")
            .attr('src', nextImg.src)
            .load(function() {
                if ($('#imagesContainer .picasaitem', $(el)).length > 0) {
                    $('#imagesContainer .picasaitem:eq(0) div', $(el)).attr("id", "oldImg");

                }
                newDiv = $('<div />').attr('class', 'picasaitem').css({ 'width': $(this).attr('width') + 'px',
                    'margin-left': -($(this).attr('width') / 2) + 'px',
                    'margin-top': -($(this).attr('height') / 2) + 'px',
                    'position': 'absolute',
                    'top': '50%',
                    'left': '50%'
                });
                $("#imagesContainer", $(el)).append(newDiv);
                newDiv.append($(this));

                if (config.linkToOriginal) {
                    $('#imagesContainer .picasaitem').css("cursor", "pointer");
                    newDiv.click(function() {
                        window.open(nextImg.url);
                    });
                }

                newDiv.hide();
                if (config.transition == 'fadeInOut') {
                    newDiv.fadeIn("slow", function() {
                        //set caption
                        $("#titleContainer #label", $(el)).text(nextImg.title);
                        //showcaption for a moment
                        if (showTitleContainer(el))
                        {
                          clearTimeout(titleTimeout);
                            titleTimeout = setTimeout(function() { hideTitleContainer(el); }, 5000);
                        }

                        if ($("#imagesContainer .picasaitem", $(el)).length > 1)
                            $("#imagesContainer .picasaitem:eq(0)", $(el)).fadeOut("normal", function() { $(this).remove(); });

                        setTimeout(function() { switchSlide(el); }, config.interval);
                    });
                } else {
                    newDiv.fadeIn("normal");
                    $(this).CurtainsTransition({ effect: 'random' }, function() {

                        //set caption
                        $("#titleContainer #label", $(el)).text(nextImg.title);
                        //showcaption for a moment
                        if (showTitleContainer(el))
                        {
                          clearTimeout(titleTimeout);
                            titleTimeout = setTimeout(function() { hideTitleContainer(el); }, 5000);
                        }
                        if ($("#imagesContainer .picasaitem", $(el)).length > 1)
                            $("#imagesContainer .picasaitem:eq(0)", $(el)).fadeOut("normal", function() { $(this).remove(); });

                        setTimeout(function() { switchSlide(el); }, config.interval);
                    });
                }

            });
        }

        showTitleContainer = function(el) {
            if (!config.showTitle) return false;
            if ($("#titleContainer", $(el)).attr("hidden") == "false") return false;
            $("#titleContainer", $(el)).animate({ 'top': '0px' });
            $("#titleContainer", $(el)).attr("hidden", "false");
            return true;
        }

        hideTitleContainer = function(el) {
            if ($("#titleContainer", $(el)).attr("hidden") == "true") return;
            $("#titleContainer", $(el)).animate({ 'top': '-20px' });
            $("#titleContainer", $(el)).attr("hidden", "true");
        }

        fisherYates = function(myArray) {
            var i = myArray.length;
            if (i == 0) return false;
            while (--i) {
                var j = Math.floor(Math.random() * (i + 1));
                var tempi = myArray[i];
                var tempj = myArray[j];
                myArray[i] = tempj;
                myArray[j] = tempi;
            }
        }

        this.each(function() {
            init(this);
        });

        return this;
    };

})(jQuery);
