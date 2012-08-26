# jQueryUI Date Range Picker #

A refactoring of Filament Group's Date Range Picker to use the [jQueryUI Widget Factory](http://wiki.jqueryui.com/w/page/12138135/Widget%20factory).

## Features ##

For a full list of the original features of this plugin, see [Filament Group's documentation](http://filamentgroup.com/lab/date_range_picker_using_jquery_ui_16_and_jquery_ui_css_framework).

### Features added in this fork ###

#### Automatic closing ####

Open instances of the widget on the same page are automatically closed when a new one is opened.

#### Public methods ####

The following methods are now accessible via string invocation through the method on the jQuery prototype:

<pre>
  //showing
  $('#my-daterangepicker').daterangepicker('showRP');
  //hiding
  $('#my-daterangepicker').daterangepicker('hideRP');
  //toggling
  $('#my-daterangepicker').daterangepicker('toggleRP');  
  //positioning
  $('#my-daterangepicker').daterangepicker('positionRP');
</pre>

#### Callbacks with better params ####

onClose, onOpen, onChange methods are now called with the daterangepicker widget object, making them a tad more useful.

<pre>
  $('#my-daterangepicker').daterangepicker({
    ...
    onOpen: function (rp) {
      rp.doSomethingWonderful();
    }
  }); 
</pre>

#### Presets ####

In the interests of keeping it simple, all presetRanges and all but the 'specificDate' 
and 'dateRange' presets have been removed.

## Things left to do ##

* Allow for presetRanges and presets to be overwritten or added to, restoring original behaviour
* Further refactoring of functions
* Unify references to this.options / this.rangeInput etc.