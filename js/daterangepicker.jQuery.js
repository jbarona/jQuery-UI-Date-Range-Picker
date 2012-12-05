/**
 * --------------------------------------------------------------------
 * jQuery-Plugin "daterangepicker.jQuery.js"
 * by Scott Jehl, scott@filamentgroup.com
 * reference article: http://www.filamentgroup.com/lab/update_date_range_picker_with_jquery_ui/
 * demo page: http://www.filamentgroup.com/examples/daterangepicker/
 * 
 * Copyright (c) 2010 Filament Group, Inc
 * Dual licensed under the MIT (filamentgroup.com/examples/mit-license.txt) and GPL (filamentgroup.com/examples/gpl-license.txt) licenses.
 *
 * Dependencies: jquery, jquery UI datepicker, date.js, jQuery UI CSS Framework
 
 *	12.15.2010 Made some fixes to resolve breaking changes introduced by jQuery UI 1.8.7
 *	08.15.2012 James Barona - Refactored into a jQuery widget factory type plugin.
 *
 * TODO:
 *	 * Allow for presetRanges and presets to be overwritten or added to
 *	 * Further refactoring of functions
 *	 * Unify references to this.options / this.rangeInput etc.
 * --------------------------------------------------------------------
 */
(function($) {
	$.widget("ux.daterangepicker", {
		// These options will be used as defaults
		options: {
			//commented all of these out, let the user decide which options they want.
			presetRanges: [
				//{text: 'Today', dateStart: 'today', dateEnd: 'today' },
				//{text: 'Last 7 days', dateStart: 'today-7days', dateEnd: 'today' },
				//{text: 'Month to date', dateStart: function() { return Date.parse('today').moveToFirstDayOfMonth();	}, dateEnd: 'today' },
				//{text: 'Year to date', dateStart: function() { var x= Date.parse('today'); x.setMonth(0); x.setDate(1); return x; }, dateEnd: 'today' },
				//extras:
				//{text: 'The previous Month', dateStart: function() { return Date.parse('1 month ago').moveToFirstDayOfMonth();	}, dateEnd: function() { return Date.parse('1 month ago').moveToLastDayOfMonth();	} }
				//{text: 'Tomorrow', dateStart: 'Tomorrow', dateEnd: 'Tomorrow' },
				//{text: 'Ad Campaign', dateStart: '03/07/08', dateEnd: 'Today' },
				//{text: 'Last 30 Days', dateStart: 'Today-30', dateEnd: 'Today' },
				//{text: 'Next 30 Days', dateStart: 'Today', dateEnd: 'Today+30' },
				//{text: 'Our Ad Campaign', dateStart: '03/07/08', dateEnd: '07/08/08' }
			], 
			//presetRanges: array of objects for each menu preset. 
			//Each obj must have text, dateStart, dateEnd. dateStart, dateEnd accept date.js string or a function which returns a date object
			presets: {
				//again, commented out
				// allDatesBefore: 'All Dates Before', 
				// allDatesAfter: 'All Dates After',
				specificDate: 'Specific Date', 
				dateRange: 'Date Range'
			},
			rangeStartTitle: 'Start date',
			rangeEndTitle: 'End date',
			nextLinkText: 'Next',
			prevLinkText: 'Prev',
			//target: rangeInput,
			doneButtonText: 'Done',
			earliestDate: Date.parse('-15years'), //earliest date allowed 
			latestDate: Date.parse('+15years'), //latest date allowed 
			constrainDates: false,
			rangeSplitter: '-', //string to use between dates in single input
			dateFormat: 'm/d/yy', // date formatting. Available formats: http://docs.jquery.com/UI/Datepicker/%24.datepicker.formatDate
			closeOnSelect: true, //if a complete selection is made, close the menu
			arrows: false,
			appendTo: 'body',
			onClose: function(daterangepicker) {},
			onOpen: function(daterangepicker) {},
			onChange: function(daterangepicker) {},
			datepickerOptions: null //object containing native UI datepicker API options
		},
		_create: function() {
			var self = this;

			this.rangeInput = this.element;

			//convenient access for old code.
			var rangeInput = this.rangeInput; 
			var options = this.options;

			//allows us to find other instances of the datepicker easily
			this.rangeInput.addClass('daterangePickerInput');

			//custom datepicker options, extended by options
			var datepickerOptions = {
				onSelect: function(dateText, inst) {
						var range_start = rp.find('.range-start');
						var range_end = rp.find('.range-end');

						if (rp.find('.ui-daterangepicker-specificDate').is('.ui-state-active')) {
							range_end.datepicker('setDate', range_start.datepicker('getDate') ); 
						}

						$(this).trigger('constrainOtherPicker');

						var rangeA = fDate( range_start.datepicker('getDate') );
						var rangeB = fDate( range_end.datepicker('getDate') );

						//send back to input or inputs
						if (rangeInput.length == 2) {
							rangeInput.eq(0).val(rangeA);
							rangeInput.eq(1).val(rangeB);
						} else {
							rangeInput.val((rangeA != rangeB) ? rangeA + ' ' + options.rangeSplitter + ' ' + rangeB : rangeA);
						}
						//if closeOnSelect is true
						if (options.closeOnSelect) {
							if (!rp.find('li.ui-state-active').is('.ui-daterangepicker-dateRange') && !rp.is(':animated') ) {
								self.hideRP();
							}
						}
						options.onChange(self);
					},
					defaultDate: +0
			};

			//change event fires both when a calendar is updated or a change event on the input is triggered
			rangeInput.bind('change', function() {
				options.onChange(self);
			});

			//datepicker options from options
			options.datepickerOptions = $.extend(datepickerOptions, options.datepickerOptions);

			//Capture Dates from input(s)
			var inputDateA, inputDateB = Date.parse('today');
			var inputDateAtemp, inputDateBtemp;

			var parseDate = function(input) {
				if (!input) {
					return null;
				}

				return $.datepicker.parseDate(options.dateFormat, input);
			};

			if (rangeInput.size() == 2) {
				inputDateA = parseDate(rangeInput.eq(0).val()) || new Date;
				inputDateB = parseDate(rangeInput.eq(1).val()) || new Date;
			} else {
				var items = rangeInput.val().split(options.rangeSplitter);

				inputDateA = parseDate($.trim(items[0])) || new Date;
				inputDateB = parseDate($.trim(items[1])) || new Date;
			}


			//build picker and 
			var rp = $('<div class="ui-daterangepicker ui-widget ui-helper-clearfix ui-widget-content ui-corner-all"></div>');
			this.rp = rp;
			var rpPresets = (function() {
				var ul = $('<ul class="ui-widget-content"></ul>').appendTo(rp);
				$.each(options.presetRanges,function() {
					$('<li class="ui-daterangepicker-'+ $(this).text().replace('/\u0020/g', '') +' ui-corner-all"><a href="#">'+ this.text +'</a></li>')
					.data('dateStart', this.dateStart)
					.data('dateEnd', this.dateEnd)
					.appendTo(ul);
				});
				var x=0;
				$.each(options.presets, function(key, value) {
					$('<li class="ui-daterangepicker-'+ key +' preset_'+ x +' ui-helper-clearfix ui-corner-all"><span class="ui-icon ui-icon-triangle-1-e"></span><a href="#">'+ value +'</a></li>')
					.appendTo(ul);
					x++;
				});

				ul.find('li').hover(
						function() {
							$(this).addClass('ui-state-hover');
						},
						function() {
							$(this).removeClass('ui-state-hover');
						})
					.click(function() {
						rp.find('.ui-state-active').removeClass('ui-state-active');
						$(this).addClass('ui-state-active');
						self._clickActions($(this),rp, rpPickers, doneBtn);
						return false;
					});
				return ul;
			})();

			//function to format a date string
			function fDate(date) {
				if (!date || !date.getDate()) {
					return '';
				}

				var day = date.getDate();
				var month = date.getMonth();
				var year = date.getFullYear();
				month++; // adjust javascript month
				var dateFormat = options.dateFormat;
				return $.datepicker.formatDate( dateFormat, date ); 
			}


			$.fn.restoreDateFromData = function() {
				if ($(this).data('saveDate')) {
					$(this).datepicker('setDate', $(this).data('saveDate')).removeData('saveDate'); 
				}
				return this;
			};

			$.fn.saveDateToData = function() {
				if (!$(this).data('saveDate')) {
					$(this).data('saveDate', $(this).datepicker('getDate') );
				}
				return this;
			};

			//picker divs
			var rpPickers = $('<div class="ranges ui-widget-header ui-corner-all ui-helper-clearfix"><div class="range-start"><span class="title-start">Start Date</span></div><div class="range-end"><span class="title-end">End Date</span></div></div>').appendTo(rp);
			rpPickers.find('.range-start, .range-end')
				.datepicker(options.datepickerOptions);
			this.rpPickers = rpPickers; //convenience for destroy method

			rpPickers.find('.range-start').datepicker('setDate', inputDateA);
			rpPickers.find('.range-end').datepicker('setDate', inputDateB);

			rpPickers.find('.range-start, .range-end')
				.bind('constrainOtherPicker', function() {
					if (options.constrainDates) {
						//constrain dates
						if ($(this).is('.range-start')) {
							rp.find('.range-end').datepicker( "option", "minDate", $(this).datepicker('getDate'));
						}
						else{
							rp.find('.range-start').datepicker( "option", "maxDate", $(this).datepicker('getDate'));
						}
					}
				})
				.trigger('constrainOtherPicker');

			var doneBtn = $('<button class="btnDone ui-state-default ui-corner-all">'+ options.doneButtonText +'</button>')
			.click(function() {
				rp.find('.ui-datepicker-current-day').trigger('click');
				self.hideRP();
			})
			.hover(
					function() {
						$(this).addClass('ui-state-hover');
					},
					function() {
						$(this).removeClass('ui-state-hover');
					}
			)
			.appendTo(rpPickers);


			//inputs toggle rangepicker visibility
			$(this.element).click(function() {
				self.toggleRP();
				return false;
			});
			//hide em all
			rpPickers.hide().find('.range-start, .range-end, .btnDone').hide();

			rp.data('state', 'closed');

			//Fixed for jQuery UI 1.8.7 - Calendars are hidden otherwise!
			rpPickers.find('.ui-datepicker').css("display","block");

			//inject rp
			$(options.appendTo).append(rp);

			//wrap and position
			rp.wrap('<div class="ui-daterangepickercontain"></div>');

			//add arrows (only available on one input)
			if (options.arrows && rangeInput.size()==1) {
				var prevLink = $('<a href="#" class="ui-daterangepicker-prev ui-corner-all" title="'+ options.prevLinkText +'"><span class="ui-icon ui-icon-circle-triangle-w">'+ options.prevLinkText +'</span></a>');
				var nextLink = $('<a href="#" class="ui-daterangepicker-next ui-corner-all" title="'+ options.nextLinkText +'"><span class="ui-icon ui-icon-circle-triangle-e">'+ options.nextLinkText +'</span></a>');

				$(this.element)
				.addClass('ui-rangepicker-input ui-widget-content')
				.wrap('<div class="ui-daterangepicker-arrows ui-widget ui-widget-header ui-helper-clearfix ui-corner-all"></div>')
				.before( prevLink )
				.before( nextLink )
				.parent().find('a').click(function() {
					var dateA = rpPickers.find('.range-start').datepicker('getDate');
					var dateB = rpPickers.find('.range-end').datepicker('getDate');
					var diff = Math.abs( new TimeSpan(dateA - dateB).getTotalMilliseconds() ) + 86400000; //difference plus one day
					if ($(this).is('.ui-daterangepicker-prev')) { diff = -diff; }

					rpPickers.find('.range-start, .range-end ').each(function() {
							var thisDate = $(this).datepicker( "getDate");
							if (thisDate == null) {return false;}
							$(this).datepicker( "setDate", thisDate.add({milliseconds: diff}) ).find('.ui-datepicker-current-day').trigger('click');
					});
					return false;
				})
				.hover(
					function() {
						$(this).addClass('ui-state-hover');
					},
					function() {
						$(this).removeClass('ui-state-hover');
					});

				var riContain = rangeInput.parent();
				this.riContain = riContain;
			}


			$(document).click(function() {
				if (rp.is(':visible')) {
					self.hideRP();
				}
			});

			rp.click(function() {return false;}).hide();
		},

		showRP: function() {
			if (this.rp.data('state') == 'closed') {
				$('.daterangePickerInput').each(function(i, el) {
					$(el).daterangepicker('hideRP');
				});

				this.positionRP();
				this.rp.fadeIn(300).data('state', 'open');
				this.options.onOpen(this);
			}
		},
		hideRP: function() {
			if (this.rp.data('state') == 'open') { 
				this.rp.fadeOut(300).data('state', 'closed');
				this.options.onClose(this); 
			}
		},
		toggleRP: function() {
			if ( this.rp.data('state') == 'open' ) { this.hideRP(); }
			else { this.showRP(); }
		},
		positionRP: function() {
			var relEl = this.riContain || this.rangeInput; //if arrows, use parent for offsets
			var riOffset = relEl.offset(),
				side = 'left',
				val = riOffset.left,
				offRight = $(window).width() - val - relEl.outerWidth();

			if (val > offRight) {
				side = 'right';
				val = offRight;
			}

			this.rp.parent().css(side, val).css('top', riOffset.top + relEl.outerHeight());
		},

		//preset menu click events
		_clickActions: function(el, rp, rpPickers, doneBtn) {
			if (el.is('.ui-daterangepicker-specificDate')) {
				//Specific Date (show the "start" calendar)
				doneBtn.hide();
				rpPickers.show();
				rp.find('.title-start').text(this.options.presets.specificDate );
				rp.find('.range-start').restoreDateFromData().css('opacity',1).show(400);
				rp.find('.range-end').restoreDateFromData().css('opacity',0).hide(400);
				setTimeout(function() {doneBtn.fadeIn();}, 400);
			}
			else if (el.is('.ui-daterangepicker-allDatesBefore')) {
				//All dates before specific date (show the "end" calendar and set the "start" calendar to the earliest date)
				doneBtn.hide();
				rpPickers.show();
				rp.find('.title-end').text(this.options.presets.allDatesBefore );
				rp.find('.range-start').saveDateToData().datepicker('setDate', this.options.earliestDate).css('opacity',0).hide(400);
				rp.find('.range-end').restoreDateFromData().css('opacity',1).show(400);
				setTimeout(function() {doneBtn.fadeIn();}, 400);
			}
			else if (el.is('.ui-daterangepicker-allDatesAfter')) {
				//All dates after specific date (show the "start" calendar and set the "end" calendar to the latest date)
				doneBtn.hide();
				rpPickers.show();
				rp.find('.title-start').text(this.options.presets.allDatesAfter );
				rp.find('.range-start').restoreDateFromData().css('opacity',1).show(400);
				rp.find('.range-end').saveDateToData().datepicker('setDate', this.options.latestDate).css('opacity',0).hide(400);
				setTimeout(function() {doneBtn.fadeIn();}, 400);
			}
			else if (el.is('.ui-daterangepicker-dateRange')) {
				//Specific Date range (show both calendars)
				doneBtn.hide();
				rpPickers.show();
				rp.find('.title-start').text(this.options.rangeStartTitle);
				rp.find('.title-end').text(this.options.rangeEndTitle);
				rp.find('.range-start').restoreDateFromData().css('opacity',1).show(400);
				rp.find('.range-end').restoreDateFromData().css('opacity',1).show(400);
				setTimeout(function() {doneBtn.fadeIn();}, 400);
			}
			else {
				//custom date range specified in the options (no calendars shown)
				doneBtn.hide();
				rp.find('.range-start, .range-end').css('opacity',0).hide(400, function() {
					rpPickers.hide();
				});
				var dateStart = (typeof el.data('dateStart') == 'string') ? Date.parse(el.data('dateStart')) : el.data('dateStart')();
				var dateEnd = (typeof el.data('dateEnd') == 'string') ? Date.parse(el.data('dateEnd')) : el.data('dateEnd')();
				rp.find('.range-start').datepicker('setDate', dateStart).find('.ui-datepicker-current-day').trigger('click');
				rp.find('.range-end').datepicker('setDate', dateEnd).find('.ui-datepicker-current-day').trigger('click');
			}

			return false;
		},
		_setOption: function(key, value) {
			// Use the _setOption method to respond to changes to options
			$.Widget.prototype._setOption.apply(this,arguments);
		},
		destroy: function() {
			// TODO reverse everything we've applied
			this.rangeInput.removeClass('daterangePickerInput');
			this.rp.closest('.ui-daterangepickercontain').remove();
			this.rpPickers.each(function(index, item) {
				$(item).datepicker('destroy');
			});

			$.Widget.prototype.destroy.call(this);
		}
	});
})(jQuery);