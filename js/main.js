(function( $ ) {

$(function() {
	const formSections = $('.formBlock');
	const progressSections = $('.ordinarySection');
	const activeSection = $('.activeSection');
	const adaptSections = $('.adaptSection');
	const adaptNumbers = $('.adaptNumber');
	const osrBoxes = $('.is_osr');
	const checkboxOSR = $('.checkboxOSR');
	const btnPrev = $('.btns .prev');
	const btnNext = $('.btns .next');
	const storage = window.sessionStorage;
	const isDesktop = $(window).width() > 768;
	let curIndex = 0;
	let nextIndex = 0;
	let isFirstEntryToSecondFormSection = true;

	if (typeof(Storage) === "undefined" || storage.getItem("input0") === null)
		$(formSections[0]).addClass('active');
	else
		$(formSections[formSections.length - 1]).addClass('active');
	$('.btns').addClass('flexBtns');

	// if(!isDesktop) $('.address').addClass('triple');// repeat code from switchTabs?

	// datepicker Initialization
  // dp1
  const disabledDates = $('#disabled_days').val();
  
  const dp1 = $('#dp1');  
  dp1.datepicker({  
  	weekStart	: 1,
  	todayHighlight: true,
  	startDate: '+3d',
  	daysOfWeekDisabled: [0, 6],
    format: 'dd-mm-yyyy',
    datesDisabled: disabledDates,
  });

  dp1.on('changeDate', function(e) {
  	dp1.parents('.wrap').find('.dataWarning').hide();
  	const timeStamp = dp1.datepicker("getDate").valueOf();
  	const date = moment(timeStamp);
  	$('.dateInfoTopData .choosenDate').first().text(date.format('ddd DD MMM'));
	var day = (e.format("dd-mm-yyyy"));
  	jQuery(".dateCalendarBox").append("<input name='calendar1' type='hidden' value='"+day+"'>");
  });

	// dp2
  const dp2 = $('#dp2');
  dp2.datepicker({  
  	weekStart	: 1,	
  	todayHighlight: true,
  	startDate: '+3d',
  	daysOfWeekDisabled: [0, 6],
  	format: 'dd-mm-yyyy',
    datesDisabled: disabledDates,
  });

  dp2.on('changeDate', function(e) {
  	dp2.parents('.wrap').find('.dataWarning').hide();
  	const timeStamp = dp2.datepicker("getDate").valueOf();
  	const date = moment(timeStamp);
  	$($('.dateInfoTopData .choosenDate')[1]).text(date.format('ddd DD MMM'));
  	let activeDays = 2;

  	const activeDay = dp2.find('.active.day');
  	const ableDays = dp2.find('.day:not(".disabled-date")');
  	const indexOdActiveDay = ableDays.index(activeDay);
	  const newTimeStamp = $(ableDays.get(indexOdActiveDay + activeDays)).data('date');
  	const newDate = moment(newTimeStamp);
  	$('.dateInfoTopData .choosenDate').last().text(newDate.format('ddd DD MMM'));

  	var day = (e.format("dd-mm-yyyy"));
    jQuery(".dateCalendarBox").append("<input name='calendar2' type='hidden' value='"+day+"'>");	
  });

	// fill forms after registration 
	if (typeof(Storage) !== "undefined") fillForms();

	// btnNext handler	
	btnNext.click(function(event) {
		curIndex = getCurIndex();
		if(curIndex == 0) {	
			if(!validateItemsToSend()) return;

			setDp1();

			if (isDesktop) setTimeout(setPhoneTextSameHeight, 100);

		} else if(curIndex == 1 && !validateForm())
			return;

		if(curIndex == 1) {
			if(!validateForm()) return;
		}

		if(curIndex == 2) {
			if(!validateDate()) return;
		}

		nextIndex = curIndex + 1;
		$(progressSections[curIndex]).addClass('ready');

		if (curIndex == 3) {
			submitForm();
		} else {
			switchTab(curIndex, curIndex + 1);			
		}
	});

	//btnPrev handler	
	btnPrev.click(function(event) {	
		curIndex = getCurIndex();
		if (curIndex == 0) return;			
		nextIndex = curIndex - 1;			
		switchTab(curIndex, nextIndex);
	});

	// progressSection click handler
	progressSections.on('click', function() {
		if (!$(this).hasClass('ready')) return;
		curIndex = getCurIndex();
		nextIndex = progressSections.index(this);
		switchTab(curIndex, nextIndex);		
	});

  //Address section checkbox
  checkboxOSR.on('click', toggleCheckbox);
  function toggleCheckbox() {  	
  	$('.thirdAddress').toggle();
  	if (isDesktop) {
  		$('.address').toggleClass('triple');
  		if (isDesktop) setTimeout(setPhoneTextSameHeight, 100);
  	}
  }

  // helpIcon Insurance
  const insuranceHelp = $('.insurance .helpIcon');
  insuranceHelp.hover(hoverInInsurance, hoverOutInsurance);
  $('.time .helpIcon').hover(hoverInTime, hoverOutTime);   

  // popup    
  const layer = $('.dark-layer');
  const popupBlock = $('.popup');
  const popupClose = popupBlock.find('.close');
  $('.helpIcon').click(function() {
  	const text = $(this).hasClass('compensationHelp') ? $('.compensationPopupText').data('value') :
  		$(this).hasClass('osrHelp') ? $('.osrBlockPopup').data('value') :
  		$(this).hasClass('collectionHelp') ? $('.collectionBlockPopup').data('value') : $('.deliveryBlockPopup').data('value');

  	popupBlock.find('.popupContent').text(text);
  	popupBlock.addClass('higherZIndex');
  	popupBlock.animate({
  		opacity: 1,
  	}, 1000);
  	layer.css('zIndex', '1005');
    layer.fadeIn(); //400
  });

  popupClose.click(closePopup);
  layer.click(closePopup);

  // calculation total price from data-prices
  $('select').change(function() {
  	const totals = $('.cost-field');
  	const options = $('select option:selected');
  	let totalValue = 0;
  	options.each(function() {
  		totalValue += parseFloat($(this).data('price'));
  	});
  	totals.text(totalValue.toFixed(2));
  });

  // saving form's data to sessionStorage
  $('.smyBtn').click(saveFormData);

	function getCurIndex() {
		for (let i = 0; i < formSections.length; i++) {
			if($(formSections[i]).hasClass('active'))	return i;
		}
	}

	function switchTab(curInd, nextInd) {
		curIndex = curInd;
		nextIndex = nextInd;
		if (!isDesktop) togglePrevBtn();
		if(arguments.length > 2)
			switchProgressTab("switch tabs without animation");
		else 
			switchProgressTab();
		switchProgressAdapt();

		if(curIndex == 0 && nextIndex != 3) setDp1();

		if(nextIndex > curIndex) {
			if (curIndex == 0) {
				btnPrev.find('.btnText').text('Back');
			}
			if(curIndex == 2 || nextIndex == 3) {
				btnNext.find('.btnText').text('Pay now');
				fillConfirmPage();
			}
		} else {
			if (curIndex == 1) {
				btnPrev.find('.btnText').text('Cancel');
			}
			if (curIndex == 3) {
				btnNext.find('.btnText').text('Next');
			}		
		}

		// show checkbox
		const osrBoxes = $('.is_osr');
  	let isOsr = false;
  	osrBoxes.each(function() {
  		if ($(this).val() > 0) {
  			isOsr = true;
  		} 
  	});
		if(nextIndex == 1 && isOsr) {	
			$('.checkbox').addClass('flexCheckbox');
			if (isFirstEntryToSecondFormSection) {
				isFirstEntryToSecondFormSection = false;
				if (typeof(Storage) === "undefined" || storage.getItem("input0") === null) {
					checkboxOSR.prop('checked', true);
					toggleCheckbox();
				} else if (checkboxOSR.prop('checked')) toggleCheckbox();				
			} else if (checkboxOSR.prop('checked')) {
				$('.thirdAddress').show();
				$('.address').addClass('triple');
			}
		} else {			
			if($('.checkbox').css('display') == 'none') {
				$('.thirdAddress').hide();
				$('.address').removeClass('triple');
			}	
			$('.checkbox').removeClass('flexCheckbox');		
		}
	}

	function togglePrevBtn() {
		if (curIndex == 0) btnPrev.parent().addClass('showPrevBtn');
		if (nextIndex == 0) btnPrev.parent().removeClass('showPrevBtn');
	}

	function switchProgressTab() {
		let duration = (arguments.length) ? 10 : 1000;
		activeSection.animate({left: (nextIndex) * 184}, duration);
		$(progressSections[curIndex]).removeClass('currentDesc');
		$(progressSections[nextIndex]).addClass('currentDesc');		
		setTimeout(function() {
			$(progressSections[curIndex]).removeClass('currentNumber');
			$(progressSections[nextIndex]).addClass('currentNumber');
		}, duration / 2);
		$(formSections[curIndex]).removeClass('active');
		$(formSections[nextIndex]).addClass('active');
	}

	function switchProgressAdapt() {
		if(!$(adaptSections[curIndex]).hasClass('ready') && nextIndex > curIndex) {
			$(adaptSections[curIndex]).addClass('ready');
			$(adaptNumbers[curIndex]).addClass('ready');
		}
		$(adaptNumbers[curIndex]).removeClass('active');
		$(adaptNumbers[nextIndex]).addClass('active');
	}

	function submitForm() {
		//authorization checking
		if(!$('.username').val()) {
			alert("you need be authorized user");
			return;
		}
		
		//terms acception checking
		if (!$('.cbTerms').prop('checked')) {
			alert("you need to accept the terms");
			return;
		} 
		$(".form.container").submit();
	}

	function validateItemsToSend() {
		let boxSelects = $('.boxSelect');
		for (let i = 0; i < boxSelects.length; i++) {
			if ($(boxSelects[i]).val() != 0) return true;
		}
		alert('you have to choose at least one select');
		return false;
	}

	function validateForm() {
		const addressBlocks = $('.address:visible');
		const elements = addressBlocks.find('.addressElement');
		let isFormValid = true;

		// names validation
		const names = elements.find('input[name="name"]');
		validateFields(names, 2);

		// phone validation
		const phones = elements.find('input[name="phone"]');
		validateFields(phones, 6);

		// postcodes validation
		const postcodes = elements.find('input[name="postcode"]');
		validateFields(postcodes, 4);

		// addresses validation
		const addresses = elements.find('input[name="address"]');
		validateFields(addresses, 2);

		// towns validation
		const towns = elements.find('input[name="town"]');
		validateFields(towns, 2);		
		
		return isFormValid;

		function validateFields(fields, minNumber) {
			fields.each(function() {
				if ($(this).val().length < minNumber) {
					if(!$(this).hasClass('errInput')) {
						showErrorNotify(this);
					}	
					isFormValid = false;
				} else if ($(this).hasClass('errInput')) {
					hideErrorNotify(this);
				}				
			}); 
		}
	}

	function validateDate() {
		let isDateValid = true;
		const dates = $('.dateInfoTopData:visible');
		dates.each(function() {
			if (!$(this).find('.choosenDate').text()) {				
				if ($(this).find('.dataWarning').css('display') == 'none') {
					$(this).find('.dataWarning').show();
				}
				isDateValid = false;
			}	else {
				if ($(this).find('.dataWarning').css('display') == 'block') {
					$(this).find('.dataWarning').hide();
				}
			}
		});

		return isDateValid;
	}

	function showErrorNotify(input) {
		$(input).addClass('errInput');
		$(input).parents('.addressElement').find('.addressFieldError').first().show();
	}

	function hideErrorNotify(input) {
		$(input).removeClass('errInput');
		$(input).parents('.addressElement').find('.addressFieldError').first().hide();
	}

  function closePopup() {
  	popupBlock.animate({
  		opacity: 0,
  	}, 1000);  	
    layer.fadeOut(600); //400
    setTimeout(function() {
    	popupBlock.removeClass('higherZIndex');
    	layer.css('zIndex', '-1');
    }, 1000);
  }    

  function hoverInInsurance() {
  	const text = $(this).prev();
  	text.addClass('underline');
  }

  function hoverOutInsurance() {
  	const text = $(this).prev();
  	text.removeClass('underline');
  }

  function hoverInTime() {
  	const parent = $(this).parent();
  	parent.addClass('underline');
  }

  function hoverOutTime() {
  	const parent = $(this).parent();
  	parent.removeClass('underline');
  }

  function fillConfirmPage() {
  	//left part
  	const compensationValue = $('.insuranceSelect option:selected').text();
  	$('.compensationValue').text(compensationValue);

  	const elements = $('.element');
  	let totalItemsToSend = [];
  	for (let i = 0; i < elements.length; i++) {  		
  		if($(elements[i]).find('.boxSelect').val() == 0) continue;
  		totalItemsToSend.push($(elements[i]).find('.headerText').text() +
  			'(' + $(elements[i]).find('.boxSelect').val() + ')');
  	}

  	$('.totalItemsToSend').text(totalItemsToSend.join(', '));

  	//right part
  	const inputs = $('.addressLineInput');
  	const data = $('.collectionSpan');
  	const isChecked = $('#checkboxAddress').prop('checked');
  	const osrBoxes = $('.is_osr');
  	let isOsr = false;
  	osrBoxes.each(function() {
  		if ($(this).val() > 0) {
  			isOsr = true;
  		} 
  	});
  	let startIndex = 0;
  	if(!isOsr) {
  		$($('.wrapBlock')[0]).hide();
  		$('.divider').hide();
  		startIndex = 6;
  	}  	
  	
  	for(let i = 0; i < inputs.length; i++) {
  		if (i < 6 && !isChecked) {
  			$(data[i]).text($(inputs[i + 6]).val());
  		} else {
  	  	$(data[i]).text($(inputs[i]).val());		
  		}
  	}

  	const dpDates = $('.dateInfoTopData .choosenDate');
  	const dates = $('.wrapBlock .dateSpan');

  	for (let i = 0; i < dates.length; i++) { 
  		$(dates[i]).text($(dpDates[i]).text());
  	}
  }

  function setDp1() {
  	const osrBoxes = $('.is_osr');
  	let isOsr = false;
  	osrBoxes.each(function() {
  		if ($(this).val() > 0) {
  			isOsr = true;
  		} 
  	});
  	if(!isOsr) {
				$('.dateSection').first().hide();
			} else {
				$('.dateSection').first().show();
			}
  }
  
  function setPhoneTextSameHeight() {
  	$('.address .phoneText').css('min-height', 0);

  	let collHeight = $('.collectionAddress .phoneText').height();
  	let minHeight = collHeight;

  	let delivHeight = $('.deliveryAddress .phoneText').height();
  	if(delivHeight > minHeight) {
  		minHeight = $('.deliveryAddress .phoneText').height();
  	}

  	if($('.thirdAddress').css('display') == 'block') {
  		let thirdHeight = $('.thirdAddress .phoneText').height();
  		if(thirdHeight > minHeight) {
  			minHeight = $('.thirdAddress .phoneText').height();
  		}
  	} 

  	$('.address .phoneText').css('min-height', minHeight + 'px');
  }

  function saveFormData() {
  	//box selects
  	const boxSelects = $('.boxSelect');
  	for (let i = 0; i < boxSelects.length; i++) {
  		storage.setItem("boxSelect"+ i, $(boxSelects[i]).val());
  	}

  	//insurance select
  	const insuranceSelect = $('.insuranceSelect');
  	storage.setItem("insuranceSelect", insuranceSelect.val());

  	//checkboxOSR
  	storage.setItem("checkboxOSR", checkboxOSR.prop("checked"));

  	//inputs
  	const inputs = $('.addressLineInput');
  	for (let i = 0; i < inputs.length; i++) {
	  	storage.setItem("input"+ i, $(inputs[i]).val());
	  }

	  //datepickers	
	  const dateSections = $('.dateSection').filter(function() {
	  	return $(this).css("display") == "block";
	  });
	  
	  for (let i = 0; i < dateSections.length; i++) {
	  	// let data = $(dateSections[i]).find('.myDatepicker').datepicker("getDate");	  	
	  	let data = $(dateSections[i]).find('.myDatepicker').datepicker("getDate").valueOf();	 
	  	storage.setItem("datepicker" + i + "data", data);	  	
	  }

	  //checkbox Terms
	  const checkboxTerms = $('.cbTerms');
	  storage.setItem("checkboxTerms", checkboxTerms.prop("checked"));

	  // totalPrice
	  const totalPrice = $('.cost-field')[0].innerHTML;
	  storage.setItem("totalPrice", totalPrice);
  }

  function fillForms() {  
  	if (storage.getItem("input0") === null) return;
  	//box selects
  	const boxSelects = $('.boxSelect');
  	for (let i = 0; i < boxSelects.length; i++) {
  		$(boxSelects[i]).val(storage.getItem("boxSelect"+ i));
  	}
  	setDp1();

  	//insurance select
  	const insuranceSelect = $('.insuranceSelect');
  	insuranceSelect.val(storage.getItem("insuranceSelect"));  
  		
  	//checkbox Osr
  	const boolValue = storage.getItem('checkboxOSR') === 'true' ? true : false;
  	checkboxOSR.prop("checked", boolValue);  	

  	//form inputs
  	const inputs = $('.addressLineInput');
  	for (let i = 0; i < inputs.length; i++) {
	  	$(inputs[i]).val(storage.getItem("input" + i));	  	
	  }  

	  //datepickers	
	  const dateSections = $('.dateSection').filter(function() {
	  	return $(this).css("display") == "block";
	  });
	  
	  for (let i = 0; i < dateSections.find('.myDatepicker').length; i++) {
	  	let date = storage.getItem("datepicker" + i + "data");
	  	let timeStamp = parseInt(date);
	  	$(dateSections[i]).find('.myDatepicker').datepicker("setDate", new Date(timeStamp));	 
	  }

	  //checkbox Terms
	  const checkboxTerms = $('.cbTerms');
	  if (storage.getItem("checkboxTerms") === "true")
	  	checkboxTerms.prop("checked", true);
	  else
	  	checkboxTerms.prop("checked", false);

	  // totalPrice
	  const totalPrice = storage.getItem("totalPrice");
	  $('.cost-field').text(totalPrice);

	  // go to 4 page
	  switchTab(0, 3, "return from login page");
	  progressSections.addClass('ready');	  	
	  //if(!checkboxTerms.prop("checked")) $(progressSections[progressSections.length - 1]).removeClass('ready');
	  
	  adaptNumbers.addClass('ready');
	  adaptSections.addClass('ready');
	  
  }

});

})(jQuery);