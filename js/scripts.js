// Loading Home Page
(function (global) {

var aradeco = {};

var homeHTML = "snippets/home-snippet.html";
var allCategoriesURL = "";
var categoriesTitleUrl = "snippets/categoryOptions-snippet.html";
var categoryHTML  = "snippets/category-snippet.html";
var singleItemHtmlUrl = "snippets/singleItem-snippet.html";
var testUrl = "snippets/testSnippet.html";
var currWidth = 0;
var numOfTiles = 0;
var debug = true;
var checkedOptions = [];
var globalURL = "";

var insertHTML = function (selector, html) {
	var element = document.querySelector(selector);
	element.innerHTML = html;
}

var showLoading = function (selector) {
	var html = "<div class='text-center'>";
	html += "<img src='media/loader.gif'></div>";
	insertHTML(selector, html);
}

var insertProperty = function (string, propName, propValue){
	var propToReplace = "{{" + propName + "}}";
	string = string.replace(new RegExp(propToReplace, "g"), propValue);
	return string;
}

var isInt = function(value) {
  var x;
  if (isNaN(value)) {
    return false;
  }
  x = parseFloat(value);
  return (x | 0) === x;
}

// Load and url changes
var loadURL = function(url){
	globalURL = url;
	var currURL = url.split('/');
	var catID = currURL[0];
	console.log("MAP:" + url.split('/').length);
	var states = {

		'#home-carousel': 
		//DO NOTHING
		function(){
		},
		// Home Page
		'#home': function() {
			showLoading("#main-content");
			$ajaxUtils.sendGetRequest(homeHTML, function (responseText) {
				document.querySelector("#main-content").innerHTML = responseText;
				currWidth = $(global).width();
				//history.pushState(null, null, "home.html");
			},
			false, false);
		}, 

		// Also Home 
		'': function() {
			showLoading("#main-content");
			$ajaxUtils.sendGetRequest(homeHTML, function (responseText) {
				document.querySelector("#main-content").innerHTML = responseText;
				currWidth = $(global).width();
			},
			false, false);
		},

		// Load Category
		'#decoraciones': function() {
			showLoading("#main-content");
			if((currURL.length) > 2){
				if(isInt(currURL[2]) && currURL.length == 3){
					$aradeco.loadItem(currURL[2]);
				}
			}else{
				$aradeco.loadCategory(1, true);
			}
		},
		'#arreglos': function() {
			showLoading("#main-content");
			if((currURL.length) > 2){
				if(isInt(currURL[2]) && currURL.length == 3){
					$aradeco.loadItem(currURL[2]);
				}
			}else{
				$aradeco.loadCategory(2, true);
			}
		},
		'#postres': function() {
			showLoading("#main-content");
			if((currURL.length) > 2){
				if(isInt(currURL[2])  && currURL.length == 3){
					$aradeco.loadItem(currURL[1]);
				}
			}else{
				$aradeco.loadCategory(3, true);
			}
		}

	}

	if(states[catID]){
		states[catID]();
	} else {
		showLoading("#main-content");
	}
}

document.addEventListener("DOMContentLoaded", function(event){
	showLoading("#main-content");
	loadURL(decodeURI(global.location.hash));
});

// Takes the category ID and loads the items for that category
// by updating the main content only.
aradeco.loadCategory = function (catID, urlLoad) {
	showLoading("#main-content");
	$ajaxUtils.sendGetRequest(catID, buildAndShowCategoriesHTML, true, urlLoad)
}


// Builds HTML for the categories page based on the data
// from the server
function buildAndShowCategoriesHTML (categories, urlLoad) {
	if(typeof categories === undefined) {
		console.log("Categories is undefined!");
	} else {
	  // Load title snippet of categories page
		$ajaxUtils.sendGetRequest(categoriesTitleUrl, function (categoriesTitleHtml) {
		    	  // Retrieve single category snippet
		    	categoriesTitleHtml = buildOptionsView(categoriesTitleHtml, categories);
		    	$ajaxUtils.sendGetRequest(categoryHTML, function (categoryHtml) {
		      		var categoriesViewHtml = buildCategoriesViewHtml(categories, categoriesTitleHtml, categoryHtml);
		        	insertHTML("#main-content", categoriesViewHtml);
		        	//history.pushState(null, null, categories[0].category);
		        	if($(global).width() > 992){
		        		$("#optsBtn").trigger('click');
		        	}
		        	if(urlLoad){
					var urlOptions = ["RS"];
					console.log(globalURL+"=====");
					optionsList = globalURL.split('/')[1].split('=')[1];
					$aradeco.loadOptions(optionsList[0]);
						/*for(var i = 0; i < urlOptions.length; i++){
							optCode = urlOptions[i].toUpperCase();

							$("#"+optCode).prop('checked', true);
							console.log(optCode+"::::");
							$aradeco.loadOptions($("#"+optCode).val());
						}*/
		        	}
		    	},
		    	false, false);
	    },
	    false, false);
	}
}


function buildOptionsView(categoriesTitleHtml, categories){
	if(debug){
		console.log("In buildOptionsView: Categories: " + categories[0].category);
	}

	var finalSideHtml = "";
	var collapsedHtml = "";

	var currOptions;

	switch(categories[0].category){
		case 'decoraciones':
			currOptions = $aradeco.decoOptions;
			break;
		case 'arreglos':
			currOptions = arreglosOptions;
			break;
		case 'postres':
			currOptions = postreOptions;
			break;
		default:
			currOptions = [];
	}

	for(var i=0; i < currOptions.title.length; i++){
		var html = "<li> \
						<input type='checkbox' id='{{OptID}}' onchange='$aradeco.loadOptions(0,this);' value='{{OptID}}' style='display: none;'> \
						<label for='{{OptID}}'> {{opcion}} </label> \
					</li>";
	
		html = insertProperty(html, "opcion", currOptions.title[i]);
		html = insertProperty(html, "OptID", currOptions.code[i]);

		finalSideHtml += html;
	}
	var categoriesTitleUpdatedHtml = insertProperty(categoriesTitleHtml, "list-items", finalSideHtml);

	return categoriesTitleUpdatedHtml;
}


// Using categories data and snippets html
// build categories view HTML to be inserted into page;
function buildCategoriesViewHtml(categories, categoriesTitleHtml, categoryHtml) {

  var finalHtml = categoriesTitleHtml;
  finalHtml += "<section id='items-section' class='col-sm-12 col-md-12 col-lg-10'>";
  nTiles = categories.length;
  if(nTiles > 41){nTiles = 41}
  // Loop over categories
  for(numOfTiles = 0; numOfTiles < nTiles; numOfTiles++) {
    // Insert category values
    var html = categoryHtml;
    var title = "" + categories[numOfTiles].title;
    var category = categories[numOfTiles].category;
    var imgSrc = categories[numOfTiles].imgSrc;
    var itmID = categories[numOfTiles].itemID;
    var options = "";
    categories[numOfTiles].opciones.forEach(function(item, index){
    	options += item + " ";
    });
    
    html = insertProperty(html, "title", title);
    html = insertProperty(html, "category", category);
    html = insertProperty(html, "itmID", itmID);
    html = insertProperty(html, "img", imgSrc);
    html = insertProperty(html, "opciones", options);
    html = insertProperty(html, "num", numOfTiles);
    finalHtml += html;
  }

  if(debug){console.log("In buildCategoriesViewHtml: numOfTiles="+numOfTiles);}
  finalHtml += "</section> </div>";
  return finalHtml;
}


aradeco.loadItem = function (itemID) {
	showLoading("#main-content");
	console.log(itemID + "{{{{");
	$ajaxUtils.sendGetRequest(itemID, buildAndShowSingleItem, true, false);
}

function buildAndShowSingleItem(itemObj, itmFooter) {
	$ajaxUtils.sendGetRequest(singleItemHtmlUrl, function(singleItemHtml){

		finalHtml = "<div id='item-row' class='row'>";

		var html = singleItemHtml;
		var title = itemObj.title;
		var desc = itemObj.des;
		var category = itemObj.category;
		var imgSrc = itemObj.imgSrc;
		html = insertProperty(html, "title", title);
		html = insertProperty(html, "category", category);
		html = insertProperty(html, "img", imgSrc);
		html = insertProperty(html, "desc", desc);
		html = insertProperty(html, "itm-footer", itmFooter);

		finalHtml += html;
		finalHtml += "</div>";
		insertHTML("#main-content", finalHtml);
		var h = document.getElementById("myimage").clientHeight;
		var w = document.getElementById("myimage").clientWidth;
		$aradeco.zoomIn("myimage", "myresult", w, h); 

		//history.pushState(null, null, category+"/"+"item/"+itemObj.itemID);
	}, false, false);
}

aradeco.loadOptions = function(UrlOptions,checkBox) {


	var checked;
	var checkedValue;
	if(typeof checkBox !== 'undefined'){
		checked = checkBox.checked;
		checkedValue = checkBox.value;
	} else {
		checked = true;
		checkedValue = "RS";
		$("#"+checkedValue).prop('checked', true);
	}

	var numChecked = document.querySelectorAll('input[type="checkbox"]:checked').length; //number of curr checked boxes


	// Checked if current items displayed have the class checked/unchecked
	// If so hide item or show all if all options are unchecked
	console.log("p: " + checkedValue);
	for(var i=0; i<numOfTiles; i++){
		if(checked){
	    	if(numChecked == 1){//Only Display checked option, removed the rest
	    		if(!($("#"+i).hasClass(checkedValue))){
	    			$("#"+i).addClass("d-none");
	    		}
	    	}
		} else {
			if(numChecked == 0){
				if($("#"+i).hasClass("d-none")){
					$("#"+i).removeClass("d-none");
				}
			} else{
				if($("#"+i).hasClass(checkBox.value)){
					$("#"+i).addClass("d-none");
				}
			}
		}
	}

	// Add or remove checked.value to the array of currently
	// selected options
	if(checked){
		checkedOptions.push(checkedValue);
	} else {
		checkedOptions.forEach(function(item, index){
			if(item === checkBox.value){
				checkedOptions.splice(index, 1);
			}
		});
	}

	// Checked if a still checked item was removed due to sharing
	// options with a prev unselected item
	checkedOptions.forEach(function(item, index){
		if(debug){console.log("checkedOptions[i]:"+item);}
		if($("section ."+checkedOptions[index]).hasClass("d-none")){
			$("."+item).removeClass("d-none");
		}
	});
}

function buildAndShowOptions(optionsList){
	//console.log(JSON.stringify(optionsList));
	$ajaxUtils.sendGetRequest(categoryHTML, function (responseText) {
		var numItem = optionsList.length;
		var finalHtml;
		for(var i=0; i < numItem; i++){

			var html = responseText;
			var title = optionsList[i].title;
			var category = optionsList[i].category;
			var imgSrc = optionsList[i].imgSrc;
			var itmID = optionsList[i].itemID;
			var options = optionsList[i].opciones;

			html = insertProperty(html, "title", title);
			html = insertProperty(html, "category", category);
			html = insertProperty(html, "img", imgSrc);
			html = insertProperty(html, "itmID", itmID);
			html = insertProperty(html, "opciones", options);

			finalHtml += html;
		}
		if(debug){console.log("In buildAndShowOptions: numItem = " + numItem);}	
		$("#items-section").append(finalHtml);
	},
	false, false);
}

// TESTING // 
aradeco.test = function(checkBox){
	console.log("TEST***********---------------");
	testFunction();
}
aradeco.loadTest = function () {
	showLoading("#main-content");
	$ajaxUtils.sendGetRequest(testUrl, function(responseText){
		document.querySelector("#main-content").innerHTML = responseText;
	}, false, false);
}


aradeco.zoomIn = function(imgID, resultID, width, height) {
	var img, lens, result, bck_x, bck_y, imgWidth, imgHeight;
	img = document.getElementById(imgID);
	result = document.getElementById(resultID);
	/* Create lens: */
	lens = document.createElement("DIV");
	lens.setAttribute("class", "img-zoom-lens");
	/* Insert lens: */
	img.parentElement.insertBefore(lens, img);
	/* Calculate the ratio between result DIV and lens: */
	cx = result.offsetWidth / lens.offsetWidth;
	cy = result.offsetHeight / lens.offsetHeight;

	/* Wait for image to load, then create lense and set up zoom */
	img.onload = function(){
		imgWidth = img.width;
		imgHeight = img.height;

		bck_x = imgWidth*cx;
		bck_y = imgHeight *cy;

		if(debug){	
		console.log("Image bck: " + imgWidth + "---- " + imgHeight);
		console.log("Image WIdth:5 " + img.height);
		console.log("Image WIdth:5 " + img.width);}


		result.style.backgroundImage = "url('" + img.src + "')";
		result.style.backgroundSize = (bck_x) + "px " + (bck_y) + "px";
		/* Execute a function when someone moves the cursor over the image, or the lens: */
		lens.addEventListener("mousemove", moveLens);
		img.addEventListener("mousemove", moveLens);
		/* And also for touch screens: */
		lens.addEventListener("touchmove", moveLens);
		img.addEventListener("touchmove", moveLens);


		$('.img-zoom-lens').hover(function(){
			$('#myresult').css('display', 'block');
			$('#myresult').css('float', 'left');			
		},
		function (){
			$('#myresult').css('display', 'none');
			$('#myresult').css('float', 'none');			
		});
	}

	function moveLens(e) {
		var pos, x, y;
		/* Prevent any other actions that may occur when moving over the image */
		e.preventDefault();
		/* Get the cursor's x and y positions: */
		pos = getCursorPos(e);
		/* Calculate the position of the lens: */
		x = pos.x - (lens.offsetWidth / 2);
		y = pos.y - (lens.offsetHeight / 2);
		/* Prevent the lens from being positioned outside the image: */
		if (x > img.width - lens.offsetWidth) {x = img.width - lens.offsetWidth;}
		if (x < 0) {x = 0;}
		if (y > img.height - lens.offsetHeight) {y = img.height - lens.offsetHeight;}
		if (y < 0) {y = 0;}
		/* Set the position of the lens: */
		lens.style.left = x + "px";
		lens.style.top = y + "px";
		/* Display what the lens "sees": */
		result.style.backgroundPosition = "-" + (x * cx) + "px -" + (y * cy) + "px";
	}
	function getCursorPos(e) {
		var a, x = 0, y = 0;
		e = e || window.event;
		/* Get the x and y positions of the image: */
		a = img.getBoundingClientRect();
		/* Calculate the cursor's x and y coordinates, relative to the image: */
		x = e.pageX - a.left;
		y = e.pageY - a.top;
		/* Consider any page scrolling: */
		x = x - window.pageXOffset;
		y = y - window.pageYOffset;
		return {x : x, y : y};
	}
} 

// Keep Navigaction var visible after scrolling past the header
$(global).bind('scroll', function() {
	headerHeight = 180;
	if($(global).scrollTop() >= headerHeight){
		$('#offset-bar').addClass("showbar-offset")
		$('#main-bar').addClass('fixed-top');
	} else {
		$('#main-bar').removeClass('fixed-top');
		$('#offset-bar').removeClass("showbar-offset")		
	}
});

$(global).on('hashchange', function(){
	loadURL(decodeURI(global.location.hash));
});

$(global).resize(function() {
	var newWidth = $(global).width();
	if((newWidth < currWidth) && (newWidth < 992)){
		$("#collapsed-options").removeClass("show");
	} else if ((newWidth > currWidth) && (newWidth > 991)){
		$("#collapsed-options").addClass("show");
	}
	currWidth = newWidth;
});

$("#menuToggle").blur(function(event){
	var screenWidth  = $(global).innerWidth();
	console.log(screenWidth);
	if(screenWidth < 768){
		$('#navbarNavDropdown').collapse('hide');
		console.log("LL");
	}
});

const arreglosOptions = {
	title: ["Pareja", "Hombre", "Rosas", "Botana", "Especial", "Lirios", "Funeral", "Fruta", "Centro Mesa", "Ramo", "Chico", "Peluche", "Grande", "Mensaje"],
	code: ["PJ", "HM", "RS", "BT", "ES", "LR", "FN", "FR", "CM", "RM", "CH","PL","GR","MS"]
};

const decoOptions = {
	title: ["Caricaturas", "Ninos/Ninas", "Animales", "Videojuegos","Deportes"],
	code: ["CC", "NN", "AN", "VJ", "DP"]
};

const postreOptions = {
	title: ["Dulce", "Salado","Personajes","Fruta"],
	code: ["DL", "SL","PS","FR"]
};

aradeco.decoOptions = decoOptions;
aradeco.postreOptions = postreOptions;
aradeco.arreglosOptions = arreglosOptions;




global.$aradeco = aradeco;

})(window);