/*
 * atvImg
 * Copyright 2015 Drew Wilson
 * www.drewwilson.com
 *
 * Version 1.0   -   Updated: Oct. 24, 2015
 *
 *
 * This atvImg plug-in is dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */

function atvImg(opts){
	if(typeof opts == 'undefined'){
		opts = {};
	}
	if(opts.class == undefined){
		opts.class = 'atvImg';
	}
	if(opts.target == undefined){
		opts.target = 'parent';
	}

	var d = document,
		de = d.documentElement,
		bd = d.getElementsByTagName('body')[0],
		win = window,
		imgs = d.querySelectorAll('.'+opts.class),
		totalImgs = imgs.length;

	if(totalImgs <= 0){
		return;
	}

	// build HTML
	for(var l=0;l<totalImgs;l++){

		var layerElems = d.querySelectorAll('.'+opts.class+' .atvImg-layer'),
			totalLayerElems = layerElems.length;

		if(totalLayerElems <= 0){
			continue;
		}
	
		var containerHTML = d.createElement('div'),
			shineHTML = d.createElement('div'),
			shadowHTML = d.createElement('div'),
			layersHTML = d.createElement('div');

		containerHTML.className = 'atvImg-container';
		containerHTML.id = 'atvImg_container_'+l;
		shineHTML.className = 'atvImg-shine';
		shadowHTML.className = 'atvImg-shadow';
		layersHTML.className = 'atvImg-layers';

		for(var i=0;i<totalLayerElems;i++){
			var layer = d.createElement('div'),
				imgSrc = layerElems[i].getAttribute('data-img');

			layer.className = 'atvImg-rendered-layer';
			layer.setAttribute('data-layer',i);
			layer.style.backgroundImage = 'url('+imgSrc+')';
			layersHTML.appendChild(layer);
		}

		containerHTML.appendChild(shadowHTML);
		containerHTML.appendChild(layersHTML);
		containerHTML.appendChild(shineHTML);

		while(imgs[l].firstChild) {
			imgs[l].removeChild(imgs[l].firstChild);
		}

		imgs[l].appendChild(containerHTML);

		if(opts.target == 'parent'){
			imgs[l].addEventListener('mousemove', function(e){
				processMovement(e,containerHTML);		
			});
			imgs[l].addEventListener('mouseenter', function(e){
				processEnter(e,containerHTML);		
			});
			imgs[l].addEventListener('mouseleave', function(e){
				processExit(e,containerHTML);		
			});
		}
	}

	if(opts.target == 'window'){
		win.addEventListener('mousemove', function(e){
			processMovement(e,false);		
		});
		win.addEventListener('mouseenter', function(e){
			processEnter(e,false);		
		});
		win.addEventListener('mouseleave', function(e){
			processExit(e,false);		
		});
	}

	function processMovement(e, elem){

		if(elem){
			var offsets = elem.parentNode.getBoundingClientRect(),
				w = elem.clientWidth || elem.offsetWidth || elem.scrollWidth, // width
				h = elem.clientHeight || elem.offsetHeight || elem.scrollHeight, // height
				offsetX = 0.52 - (e.pageX - offsets.left)/w, //cursor position X
				offsetY = 0.52 - (e.pageY - offsets.top)/h, //cursor position Y
				dy = (e.pageY - offsets.top) - h / 2, //@h/2 = center of container
				dx = (e.pageX - offsets.left) - w / 2; //@w/2 = center of container
		} else {
			var w = win.innerWidth || de.clientWidth || bd.clientWidth, // width
				h = win.innerHeight || de.clientHeight || bd.clientHeight, // height
				offsetX = 0.5 - e.pageX / w, //cursor position X
				offsetY = 0.5 - e.pageY / h, //cursor position Y
				dy = e.pageY - h / 2, //@h/2 = center of container
				dx = e.pageX - w / 2; //@w/2 = center of container
		}

		var containers = (elem)? [elem] : d.querySelectorAll('.'+opts.class),
			totalContainers = containers.length,
			layers = (elem)? d.querySelectorAll('#'+elem.id+' .atvImg-rendered-layer') : d.querySelectorAll('.'+opts.class+' .atvImg-rendered-layer'),
			totalLayers = layers.length,
			shine = (elem)? d.querySelectorAll('#'+elem.id+' .atvImg-shine') : d.querySelectorAll('.'+opts.class+' .atvImg-shine'),
			totalShine = shine.length,
			arad = Math.atan2(dy, dx), //angle between cursor and center of container in RAD
			angle = arad * 180 / Math.PI - 90, //convert rad in degrees
			transformCSS = 'translateY(' + -offsetX * totalLayers + 'px) rotateX(' + (-offsetY * totalLayers) + 'deg) rotateY(' + (offsetX * (totalLayers * 2)) + 'deg) scale3d(1.05,1.05,1.05)'; //container transform


			//get angle between 0-360
			if (angle < 0) {
				angle = angle + 360;
			}

			var revNum = totalLayers;

			//gradient angle and opacity
			for(var s=0;s<totalShine;s++){
				shine[s].style.background = 'linear-gradient(' + angle + 'deg, rgba(255,255,255,' + e.pageY / h * .25 + ') 0%,rgba(255,255,255,0) 80%)';
				shine[s].style.transform = 'translateX(' + offsetX * (revNum *2) + 'px) translateY(' + offsetY * (totalLayers *2) + 'px)';
			}

			//container transform
			for(var c=0;c<totalContainers;c++){
				containers[c].style.transform = transformCSS;
			}

			//parallax foreach layer
			for(var ly=0;ly<totalLayers;ly++){
				layers[ly].style.transform = 'translateX(' + offsetX * (revNum *2) + 'px) translateY(' + offsetY * (totalLayers *2) + 'px)';
				revNum--;
			}
	}

	function processEnter(e, elem){

		var containers = (elem)? [elem] : d.querySelectorAll('.'+opts.class),
			totalContainers = containers.length,
			layers = (elem)? d.querySelectorAll('#'+elem.id+' .atvImg-rendered-layer') : d.querySelectorAll('.'+opts.class+' .atvImg-rendered-layer'),
			totalLayers = layers.length,
			shine = (elem)? d.querySelectorAll('#'+elem.id+' .atvImg-shine') : d.querySelectorAll('.'+opts.class+' .atvImg-shine'),
			totalShine = shine.length;

		for(var c=0;c<totalContainers;c++){
			containers[c].className += ' over';
		}

	}

	function processExit(e, elem){

		var containers = (elem)? [elem] : d.querySelectorAll('.'+opts.class),
			totalContainers = containers.length,
			layers = (elem)? d.querySelectorAll('#'+elem.id+' .atvImg-rendered-layer') : d.querySelectorAll('.'+opts.class+' .atvImg-rendered-layer'),
			totalLayers = layers.length,
			shine = (elem)? d.querySelectorAll('#'+elem.id+' .atvImg-shine') : d.querySelectorAll('.'+opts.class+' .atvImg-shine'),
			totalShine = shine.length;

		for(var c=0;c<totalContainers;c++){
			containers[c].className = containers[c].className.replace(' over','');
			containers[c].style.transform = '';
		}
		for(var s=0;s<totalShine;s++){
			shine[s].style.cssText = '';
		}
		for(var ly=0;ly<totalLayers;ly++){
			layers[ly].style.transform = '';
		}

	}

}