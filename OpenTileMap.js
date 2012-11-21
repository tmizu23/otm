var otm = new Object();
otm.Tile = new Object();

otm.Tile.OpenTileMap = OpenLayers.Class(OpenLayers.Tile, {

  
    url: null,
    
   
    imgDiv: null,
    
   
    frame: null, 

  
    imageReloadAttempts: null,
    
  
    layerAlphaHack: null,
    
   
    asyncRequestId: null,
    
   
    maxGetUrlLength: null,

   
    canvasContext: null,
    
  
    crossOriginKeyword: null,

  
    initialize: function(layer, position, bounds, url, size, options) {
        OpenLayers.Tile.prototype.initialize.apply(this, arguments);

        this.url = url; //deprecated remove me
        
        this.layerAlphaHack = this.layer.alpha && OpenLayers.Util.alphaHack();

        if (this.maxGetUrlLength != null || this.layer.gutter || this.layerAlphaHack) {
            // only create frame if it's needed
            this.frame = document.createElement("div");
            this.frame.style.position = "absolute";
            this.frame.style.overflow = "hidden";
        }
        if (this.maxGetUrlLength != null) {
            OpenLayers.Util.extend(this, OpenLayers.Tile.Image.IFrame);
        }
    },
    
    /** 
     * APIMethod: destroy
     * nullify references to prevent circular references and memory leaks
     */
    destroy: function() {
        if (this.imgDiv)  {
            this.clear();
            this.imgDiv = null;
            this.frame = null;
        }
        // don't handle async requests any more
        this.asyncRequestId = null;
        OpenLayers.Tile.prototype.destroy.apply(this, arguments);
    },
    
    /**
     * Method: draw
     * Check that a tile should be drawn, and draw it.
     * 
     * Returns:
     * {Boolean} Was a tile drawn?
     */
    draw: function() {
        var drawn = OpenLayers.Tile.prototype.draw.apply(this, arguments);
        if (drawn) {
            // The layer's reproject option is deprecated.
            if (this.layer != this.layer.map.baseLayer && this.layer.reproject) {
                // getBoundsFromBaseLayer is defined in deprecated.js.
                this.bounds = this.getBoundsFromBaseLayer(this.position);
            }
            if (this.isLoading) {
                //if we're already loading, send 'reload' instead of 'loadstart'.
                this._loadEvent = "reload"; 
            } else {
                this.isLoading = true;
                this._loadEvent = "loadstart";
            }
				this.url = this.layer.getURL(this.bounds);
			     this.request = OpenLayers.Request.GET({
                    url: this.url,
                    callback: function(response) {
                        this.isLoading = false;
                        this.events.triggerEvent("loadend");
                        if (response.status === 200) {
                            this.parseData(response.responseText);
			    this.url = this.text.data[0].url + "${z}/${x}/${y}.png";
			    this.TMS = this.text.data[0].TMS;
			    this.positionTile();
			    this.renderTile();
			    return drawn;
                        }
                    },
                    scope: this
                });
            
        } else {
            this.unload();
        }
        
    },
    parseData: function(str) {
	var data=[];
	str = str.replace( /\r\n/g , "\n" );//IE対策 改行コード\r\nを\rに変換
	str = str.replace( /^(\n+)|(\n+)$/g , "" );//文頭と文末の余計な改行を除去
        var lines = str.split(/\n/);
	var colname = lines[0].split(/,/);
	for (var i = 1; i < lines.length; i++) {
    	 var line = lines[i];
	 var rowdata = line.match(/"[^"]*"|[^,]+/g);
	 var row={};
	 for (var j = 0; j < rowdata.length; j++) {
	  row[colname[j]] = rowdata[j];
	 }
	 data[i-1] = row;
	}
	this.text = {"data":data};
    },
    /**
     * Method: renderTile
     * Internal function to actually initialize the image tile,
     *     position it correctly, and set its url.
     */
    renderTile: function() {
        this.layer.div.appendChild(this.getTile());
        if (this.layer.async) {
            // Asynchronous image requests call the asynchronous getURL method
            // on the layer to fetch an image that covers 'this.bounds'.
            var id = this.asyncRequestId = (this.asyncRequestId || 0) + 1;
            this.layer.getURLasync(this.bounds, function(url) {
                if (id == this.asyncRequestId) {
                    this.url = url;
                    this.initImage();
                }
            }, this);
        } else {
            // synchronous image requests get the url immediately.
            this.url = this.getURL(this.bounds);
            this.initImage();
			
        }
    },
	getURL: function (bounds) {
	/*タイルを表示
        var xyz = this.layer.getXYZ(bounds);
        var url = this.url;
	if(parseInt(this.TMS)){
	     xyz.y = ((Math.pow(2,xyz.z)-1)-xyz.y);
	}
        if (OpenLayers.Util.isArray(url)) {
	    var s = '' + xyz.x + xyz.y + xyz.z;
            url = this.selectUrl(s, url);
        }
        return OpenLayers.String.format(url, xyz);
	*/
//	/*タイル情報を表示
	var xyz = this.layer.getXYZ(bounds);
	var ctx = this.getCanvasContext();
	ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
	ctx.fillRect(0, 0, 255, 255);
        ctx.textAlign = 'center';
        ctx.font = '12px sans-serif';
        ctx.fillStyle = '#f00';
        ctx.strokeStyle = '#fff'
	for(var i=0;i<this.text.data.length;i++){
	 ctx.fillText(this.text.data[i].name, 128, 128+i*15);
	}
	return ctx.canvas.toDataURL();
//	*/ 
    },
    /**
     * Method: positionTile
     * Using the properties currenty set on the layer, position the tile correctly.
     * This method is used both by the async and non-async versions of the Tile.Image
     * code.
     */
    positionTile: function() {
        var style = this.getTile().style,
            size = this.frame ? this.size :
                this.layer.getImageSize(this.bounds),
            ratio = 1;
        if (this.layer instanceof OpenLayers.Layer.Grid) {
            ratio = this.layer.getServerResolution() / this.layer.map.getResolution();
        }
        style.left = this.position.x + "px";
        style.top = this.position.y + "px";
        style.width = Math.round(ratio * size.w) + "px";
        style.height = Math.round(ratio * size.h) + "px";
    },

    /** 
     * Method: clear
     * Remove the tile from the DOM, clear it of any image related data so that
     * it can be reused in a new location.
     */
    clear: function() {
        OpenLayers.Tile.prototype.clear.apply(this, arguments);
        var img = this.imgDiv;
        if (img) {
            var tile = this.getTile();
            if (tile.parentNode === this.layer.div) {
                this.layer.div.removeChild(tile);
            }
            this.setImgSrc();
            if (this.layerAlphaHack === true) {
                img.style.filter = "";
            }
            OpenLayers.Element.removeClass(img, "olImageLoadError");
        }
        this.canvasContext = null;
    },
    
    /**
     * Method: getImage
     * Returns or creates and returns the tile image.
     */
    getImage: function() {
        if (!this.imgDiv) {
            this.imgDiv = OpenLayers.Tile.Image.IMAGE.cloneNode(false);

            var style = this.imgDiv.style;
            if (this.frame) {
                var left = 0, top = 0;
                if (this.layer.gutter) {
                    left = this.layer.gutter / this.layer.tileSize.w * 100;
                    top = this.layer.gutter / this.layer.tileSize.h * 100;
                }
                style.left = -left + "%";
                style.top = -top + "%";
                style.width = (2 * left + 100) + "%";
                style.height = (2 * top + 100) + "%";
            }
            style.visibility = "hidden";
            style.opacity = 0;
            if (this.layer.opacity < 1) {
                style.filter = 'alpha(opacity=' +
                               (this.layer.opacity * 100) +
                               ')';
            }
            style.position = "absolute";
            if (this.layerAlphaHack) {
                // move the image out of sight
                style.paddingTop = style.height;
                style.height = "0";
                style.width = "100%";
            }
            if (this.frame) {
                this.frame.appendChild(this.imgDiv);
            }
        }

        return this.imgDiv;
    },

    /**
     * Method: initImage
     * Creates the content for the frame on the tile.
     */
    initImage: function() {
        this.events.triggerEvent(this._loadEvent);
        var img = this.getImage();
        if (this.url && img.getAttribute("src") == this.url) {
            this.onImageLoad();
        } else {
            OpenLayers.Event.stopObservingElement(img);
            if (this.crossOriginKeyword) {
                img.removeAttribute("crossorigin");
            }
            OpenLayers.Event.observe(img, "load",
                OpenLayers.Function.bind(this.onImageLoad, this)
            );
            OpenLayers.Event.observe(img, "error",
                OpenLayers.Function.bind(this.onImageError, this)
            );
            this.imageReloadAttempts = 0;
            this.setImgSrc(this.url);
        }
    },
    
    /**
     * Method: setImgSrc
     * Sets the source for the tile image
     *
     * Parameters:
     * url - {String} or undefined to hide the image
     */
    setImgSrc: function(url) {
        var img = this.imgDiv;
        if (url) {
            img.style.visibility = 'hidden';
            img.style.opacity = 0;
            // don't set crossOrigin if the url is a data URL
            if (this.crossOriginKeyword) {
                if (url.substr(0, 5) !== 'data:') {
                    img.setAttribute("crossorigin", this.crossOriginKeyword);
                } else {
                    img.removeAttribute("crossorigin");
                }
            }
            img.src = url;
			
			//img.onclick = "alert('a')";
			//img.src = "http://upload.wikimedia.org/wikipedia/commons/e/e7/Mozilla_Firefox_3.5_logo_256.png"
        } else {
            // Remove reference to the image, and leave it to the browser's
            // caching and garbage collection.
            OpenLayers.Event.stopObservingElement(this.imgDiv);
            this.imgDiv = null;
            if (img.parentNode) {
                img.parentNode.removeChild(img);
            }
        }
    },
    
    /**
     * Method: getTile
     * Get the tile's markup.
     *
     * Returns:
     * {DOMElement} The tile's markup
     */
    getTile: function() {
        return this.frame ? this.frame : this.getImage();
    },

    /**
     * Method: createBackBuffer
     * Create a backbuffer for this tile. A backbuffer isn't exactly a clone
     * of the tile's markup, because we want to avoid the reloading of the
     * image. So we clone the frame, and steal the image from the tile.
     *
     * Returns:
     * {DOMElement} The markup, or undefined if the tile has no image
     * or if it's currently loading.
     */
    createBackBuffer: function() {
        if (!this.imgDiv || this.isLoading) {
            return;
        }
        var backBuffer;
        if (this.frame) {
            backBuffer = this.frame.cloneNode(false);
            backBuffer.appendChild(this.imgDiv);
        } else {
            backBuffer = this.imgDiv;
        }
        this.imgDiv = null;
        return backBuffer;
    },

    /**
     * Method: onImageLoad
     * Handler for the image onload event
     */
    onImageLoad: function() {
        var img = this.imgDiv;
        OpenLayers.Event.stopObservingElement(img);
        img.style.visibility = 'inherit';
        img.style.opacity = this.layer.opacity;
        this.isLoading = false;
        this.canvasContext = null;
        this.events.triggerEvent("loadend");

        if (this.layerAlphaHack === true) {
            img.style.filter =
                "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" +
                img.src + "', sizingMethod='scale')";
        }
    },
    
    /**
     * Method: onImageError
     * Handler for the image onerror event
     */
    onImageError: function() {
        var img = this.imgDiv;
        if (img.src != null) {
            this.imageReloadAttempts++;
            if (this.imageReloadAttempts <= OpenLayers.IMAGE_RELOAD_ATTEMPTS) {
                this.setImgSrc(this.layer.getURL(this.bounds));
            } else {
                OpenLayers.Element.addClass(img, "olImageLoadError");
                this.events.triggerEvent("loaderror");
                this.onImageLoad();
            }
        }
    },

    /**
     * APIMethod: getCanvasContext
     * Returns a canvas context associated with the tile image (with
     * the image drawn on it).
     * Returns undefined if the browser does not support canvas, if
     * the tile has no image or if it's currently loading.
     *
     * The function returns a canvas context instance but the
     * underlying canvas is still available in the 'canvas' property:
     * (code)
     * var context = tile.getCanvasContext();
     * if (context) {
     *     var data = context.canvas.toDataURL('image/jpeg');
     * }
     * (end)
     *
     * Returns:
     * {Boolean}
     */
    getCanvasContext: function() {
        if (OpenLayers.CANVAS_SUPPORTED && this.imgDiv && !this.isLoading) {
            if (!this.canvasContext) {
                var canvas = document.createElement("canvas");
                canvas.width = this.size.w;
                canvas.height = this.size.h;
                this.canvasContext = canvas.getContext("2d");
                this.canvasContext.drawImage(this.imgDiv, 0, 0);
            }
            return this.canvasContext;
        }
    },

    CLASS_NAME: "otm.Tile.OpenTileMap"

});

