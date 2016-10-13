// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel

// MIT license

(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

/*
 * atvImg
 * Copyright 2015 Drew Wilson
 * http://drewwilson.com
 *
 * Version 1.2   -   Updated: Dec. 09, 2015
 *
 * atvImg = 'AppleTV Image'
 * 
 * This plug-in will automatically turn your layered Apple TV PNGs into
 * 3D parallax icons, the same way the new Apple TV treats app icons.
 * You can have any number of AppleTV Images on the page.
 *
 * An example of this plug-in can bee seen here: http://kloc.pm
 *
 * -------------------
 *
 * Here is how to setup the HTML for a single atvImg:
 * <div class="atvImg">
 * 		<img src="/images/flattened-icon.jpg">
 *
 *		<div class="atvImg-layer" data-img="/images/back.png"></div>
 *		<div class="atvImg-layer" data-img="/images/front.png"></div>
 * </div>
 * 
 * You can have any number of 'atvImg-layer' elements. So add as many
 * as your icon needs. Be sure to use 2x (retina) scale PNGs. The plug-in
 * will downscale for 1x screens. Using 2x scale PNGs is recommended
 * so the icon will appear crisp on 2x screens. 
 * Layer images should be 2x the size you want to display the icon as.
 * The plug-in will adapt the atvImg to be whatever size it's parent
 * element is. So if you set your '.atvImg' element to be 320px X 190px,
 * that is how big the icon will appear. If you set it to be 
 * 640px X 380px, that is how big it will appear. Just be sure to
 * use the correct aspect ratio for AppleTV icons.
 *
 * The <img> element in the example above is a fallback in case 
 * javascript is not allowed to run. It will be removed when the plug-in
 * is running. Put a flattened version (no layers) of you icon in there.
 * 
 * Then call the funciton in you <script> tag or JS file like this: 
 *
 * atvImg();
 *
 *
 * Just be sure you add that line after you've loaded the DOM. So put
 * it below all your page's HTML just before the closing </body> tag or
 * in a document.ready() function.
 *
 * -------------------
 *
 * This atvImg plug-in is dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 * I used http://designmodo.com/apple-tv-effect as reference and
 * inspiration when creating this plug-in.
 */


function atvImg(){

	var d = document,
		de = d.documentElement,
		bd = d.getElementsByTagName('body')[0],
		htm = d.getElementsByTagName('html')[0],
		win = window,
		thisImg,
		imgs = d.querySelectorAll('.atvImg'),
		supportsTouch = 'ontouchstart' in win || navigator.msMaxTouchPoints;


	// build HTML
	for(var l=0;(thisImg=imgs[l]);l++){

		var layerElems = thisImg.querySelectorAll('.atvImg-layer'),
			totalLayerElems = layerElems.length,
			w = thisImg.clientWidth || thisImg.offsetWidth || thisImg.scrollWidth,
			h = thisImg.clientHeight || thisImg.offsetHeight || thisImg.scrollHeight;

		if(totalLayerElems <= 0){
			continue;
		}

		var containerHTML = d.createElement('div'),
			shineHTML = d.createElement('div'),
			shadowHTML = d.createElement('div'),
			layersHTML = d.createElement('div'),
			layers = [];

		thisImg.id = 'atvImg__'+l;
		containerHTML.className = 'atvImg-container';
		shineHTML.className = 'atvImg-shine';
		shadowHTML.className = 'atvImg-shadow';
		layersHTML.className = 'atvImg-layers';

		for(var i=0;i<totalLayerElems;i++){
			var layer = layerElems[i].cloneNode(true),
				imgSrc = layerElems[i].getAttribute('data-img');

			layer.className = layer.className.replace('atvImg-', 'atvImg-rendered-');
			layer.setAttribute('data-layer',i);
			if(imgSrc) {
				layer.style.backgroundImage = 'url('+imgSrc+')';
			}
			/* Don't allow the image to misalign the bottom/top of the card */
			layer.style.width = layer.style.height = (100 + (i*3)) + '%';
			layer.style.left = layer.style.top = '-' + (i*1.5) + '%';
			layersHTML.appendChild(layer);

			layers.push(layer);
		}

		var node;
		while(node=thisImg.firstChild) {
			thisImg.removeChild(node);
		}

		containerHTML.appendChild(shadowHTML);
		containerHTML.appendChild(layersHTML);
		containerHTML.appendChild(shineHTML);
		thisImg.appendChild(containerHTML);
		thisImg.style.transform = 'perspective('+ w*3 +'px)';
		thisImg.__STEP = 0;

		if(supportsTouch){
			win.preventScroll = false;

	        (function(_thisImg,_container,_w,_h,_layers,_totalLayers,_shine) {
				thisImg.addEventListener('touchmove', function(e){
					if (win.preventScroll){
						e.preventDefault();
					}
					processMovement(e,true,_thisImg,_container,_w,_h,_layers,_totalLayers,_shine);		
				});
	            thisImg.addEventListener('touchstart', function(e){
	            	win.preventScroll = true;
					processEnter(e,_thisImg,_container);	
				});
				thisImg.addEventListener('touchend', function(e){
					win.preventScroll = false;
					processExit(e,_thisImg,_container,_layers,_totalLayers,_shine);		
				});
	        })(thisImg,containerHTML,w,h,layers,totalLayerElems,shineHTML);
	    } else {
	    	(function(_thisImg,_container,_w,_h,_layers,_totalLayers,_shine) {
				thisImg.addEventListener('mousemove', function(e){
					processMovement(e,false,_thisImg,_container,_w,_h,_layers,_totalLayers,_shine);		
				});
	            thisImg.addEventListener('mouseenter', function(e){
					processEnter(e,_thisImg,_container);		
				});
				thisImg.addEventListener('mouseleave', function(e){
					processExit(e,_thisImg,_container,_layers,_totalLayers,_shine);
				});
	        })(thisImg,containerHTML,w,h,layers,totalLayerElems,shineHTML);
	    }
	}

	function processMovement(e, touchEnabled, elem, container, w, h, layers, totalLayers, shine) {
		cancelAnimationFrame(elem.__STEP);
		elem.__STEP = requestAnimationFrame(_processMovement.bind(this, e, touchEnabled, elem, container, w, h, layers, totalLayers, shine));
	}
	function _processMovement(e, touchEnabled, elem, container, w, h, layers, totalLayers, shine){

		var bdst = bd.scrollTop || htm.scrollTop,
			bdsl = bd.scrollLeft,
			pageX = (touchEnabled)? e.touches[0].pageX : e.pageX,
			pageY = (touchEnabled)? e.touches[0].pageY : e.pageY,
			offsets = elem.getBoundingClientRect(),
			
			/* Measuring every time can cause thrashing / repaints */
			// w = elem.clientWidth || elem.offsetWidth || elem.scrollWidth, // width
			// h = elem.clientHeight || elem.offsetHeight || elem.scrollHeight, // height
			
			wMultiple = 320/w,
			offsetX = 0.52 - (pageX - offsets.left - bdsl)/w, //cursor position X
			offsetY = 0.52 - (pageY - offsets.top - bdst)/h, //cursor position Y
			dy = (pageY - offsets.top - bdst) - h / 2, //@h/2 = center of container
			dx = (pageX - offsets.left - bdsl) - w / 2, //@w/2 = center of container
			yRotate = (offsetX - dx)*(0.07 * wMultiple), //rotation for container Y
			xRotate = (dy - offsetY)*(0.1 * wMultiple), //rotation for container X
			imgCSS = 'rotateX(' + xRotate + 'deg) rotateY(' + yRotate + 'deg)', //img transform
			arad = Math.atan2(dy, dx), //angle between cursor and center of container in RAD
			angle = arad * 180 / Math.PI - 90; //convert rad in degrees

		//get angle between 0-360
		if (angle < 0) {
			angle = angle + 360;
		}

		//container transform
		if(container.className.indexOf(' over') != -1){
			imgCSS += ' scale3d(1.07,1.07,1.07)';
		}
		container.style.transform = imgCSS;
		
		//gradient angle and opacity for shine
		shine.style.background = 'linear-gradient(' + angle + 'deg, rgba(255,255,255,' + (pageY - offsets.top - bdst)/h * 0.4 + ') 0%,rgba(255,255,255,0) 80%)';
		shine.style.transform = 'translateX(' + (offsetX * totalLayers) - 0.1 + 'px) translateY(' + (offsetY * totalLayers) - 0.1 + 'px)';	

		//parallax for each layer
		var revNum = totalLayers, effect = 1.5;
		for(var ly=0;ly<totalLayers;ly++){
			layers[ly].style.transform = 'translateX(' + (offsetX * revNum) * ((ly * effect) / wMultiple) + 'px) translateY(' + (offsetY * totalLayers) * ((ly * effect) / wMultiple) + 'px)';
			revNum--;
		}
	}

	/* probably doesn't need an animation frame */
	function processEnter(e, elem, container){
		container.className += ' over';
	}

	function processExit(e, elem, container, layers, totalLayers, shine) {
		cancelAnimationFrame(elem.__STEP);
		elem.__STEP = requestAnimationFrame(_processExit.bind(this, e, elem, container, layers, totalLayers, shine));
	}
	function _processExit(e, elem, container, layers, totalLayers, shine){

		container.className = container.className.replace(' over','');
		container.style.transform = '';
		shine.style.cssText = '';
		
		for(var ly=0;ly<totalLayers;ly++){
			layers[ly].style.transform = '';
		}

	}

}