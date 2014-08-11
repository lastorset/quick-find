//TODO: Cases
//iframes, multiple documents
(function($){

	var input = "",
		$displayEl = null,
		$searchIndex = null,
		$searchTotal =  null,
		$resultSet = null,
		caseSensitive = true;

	initDocEvents(document);

	function selectCallback(){
		var $this = $(this),
			data = $this.data(),
			$selected = getSelected();

		clearSelect($selected);
		$this.addClass('selected');

		if($resultSet.html() !== ''){
			$searchIndex.text($this.index() + 1);
			$searchTotal.text($this.siblings().length + 1);
		}

		data.textEl.html(data.textEl.html().replace(data.input,'<span class="ts-ce-hl">' + data.input + '</span>'));

		$('html, body').animate({
          scrollTop: data.offsetTop - 100
          },400);
	}

	function clearSelect($el){
		var $selected = $el || getSelected();
		if($selected.length > 0){
			var data = $selected.data();
			data.textEl.html(data.textEl.html().replace('<span class="ts-ce-hl">' + data.input + '</span>',data.input));
			$selected.removeClass('selected');
		}

		$searchIndex.text(0);
		$searchTotal.text(0);

	}

	function isVisible(element) {
	  var style;
	  while (element) {
	    style = window.getComputedStyle(element);
	    if (style && (style.getPropertyValue('display') == 'none' || style.getPropertyValue('visibility') == 'hidden')){
			return false;
	    }
	    element = element.parentNode;
	  }
	  return true;
	}

	function getSelected(){
		return $('#text-search-extension li.selected');
	}

	//add settimeout

	var keypressHandler = null,
		keydownHandlerLi = null;

	function initDocEvents(doc){
		$(doc).on('click','#text-search-extension li',selectCallback)
		.on('keydown','#text-search-extension li', function(evt){

			if(keydownHandlerLi){
				clearTimeout(keydownHandlerLi);
			}

			var $this = $(this);

			keydownHandlerLi = setTimeout(function(){
				var $prev = null,
					$next = null;

				if(evt.which === 38){ //up
					$prev = $this.prev();
					if($prev.length > 0){
						$prev.trigger('click').focus();
					} else {
						$('#text-search-extension input').focus();
					}
				} else if(evt.which === 40){ //down
					$next = $this.next();
					if($next.length > 0){
						$next.trigger('click').focus();
					}
				}
				return false;
			},100);

		}).on('keydown',function(evt){
			console.log(evt);
			if((evt.which === 191 || evt.which === 222 || (evt.which === 70 && evt.altKey === true)) && $(evt.target).is('body')){
				toggleMenu();
				return false;
			}
		});
	}

	function initSearchEvents(){
		 $displayEl.on('keydown','input', searchKeydownCb).on('click','i',toggleMenu);
	}

	function searchKeydownCb(evt){
		evt.stopPropagation();
		//check for invalid key inputs and return

		if(keypressHandler){
			clearTimeout(keypressHandler);
		}

		var $this = $(this);

		keypressHandler = setTimeout(function(){
			var $prev = null,
				$next = null,
				$selected = getSelected();

			if($selected.length > 0 && (evt.which === 38 || evt.which === 40)){
				if(evt.which === 38){ //up
					$prev = $selected.prev();
					if($prev.length > 0){
						$prev.trigger('click').focus();
					}
				} else if(evt.which === 40){ //down
					$next = $selected.next();
					if($next.length > 0){
						$next.trigger('click').focus();
					}
				}
				return false;
			}

			var $ul = $displayEl.find('ul'),
				$li;

			clearSelect();
			$ul.html('');

			input = $this.val();

			if(input.trim() === ''){
				return;
			}

			var nodeIterator = document.createNodeIterator(document.body, NodeFilter.SHOW_TEXT,textMatch),
				results = [],
				textNode = null;

			while ((textNode = nodeIterator.nextNode()) != null) {
				results.push(textNode);
			}

			for(var i=0; i<results.length; i++){
				var $parent = $(results[i]).parent();

				$li = $('<li role="menuitem" tabindex="0"></li>');
				$li.text(results[i].data)
					.html($li.html().replace(input,'<span class="ts-ce-hl">' + input + '</span>'));

				$li.data({
					textEl: $parent,
					offsetTop: $parent.offset().top,
					input: input
				});

				if(i === 0){
					$li.addClass('selected');
				}

				$ul.append($li);
			}

			getSelected().trigger('click');

		}, 150);
	}

	//update with regex
	function textMatch(node){
		var data = node ? node.data : '',
			parent = node ? node.parentNode : null;

		if($(parent).is('script,noscript')){
			return NodeFilter.FILER_REJECT;
		}

		if(!caseSensitive && data.toLowerCase().indexOf(input.toLowerCase()) !== -1){
			return NodeFilter.FILTER_ACCEPT;
		} else if(caseSensitive && data.indexOf(input) !== -1 && isVisible(parent)){
			return NodeFilter.FILTER_ACCEPT;
		} else {
			return NodeFilter.FILER_REJECT;
		}
	}

	function toggleMenu(){
		$displayEl = $('#text-search-extension');
		if($displayEl.length === 0){
			$displayEl = $('<div id="text-search-extension"><div class="search-wrap"><div class="search-wrap-inner"><input type="text" id="search" placeholder="Find in page" autocomplete="off"></input><div class="search-index-wrap"><div class="search-index">0</div>of<div class="search-total">0</div></div></div><i tabindex="0"></i></div><ul role="menu"></ul></div>');
			$('body').after($displayEl);
			$resultSet = $displayEl.find('ul');
			$searchIndex = $displayEl.find('.search-index');
			$searchTotal = $displayEl.find('.search-total');
			initSearchEvents();
			$displayEl.find('input').focus();
		} else {
			$displayEl.toggleClass('hide-text-search');
			if(!$displayEl.hasClass('hide-text-search')){
				$displayEl.find('input').focus();
			}
		}
	}

})(window.jQuery);