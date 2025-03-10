# history of package _echarty_

# echarty 1.6.6  latest in development

* upgrade ECharts to v.5.6.0, built with R v.4.4.2.
* auto-load 3D plugin when 3D attributes present (xAxis3D, bar3D, etc.).
* auto-set 3D axes from data (name, type).
* change in _dataset_: store column names in _dimensions_ instead of _source_.
* fixed bug in ecr.ebars for single series.
* add optional placeholder '%@' in title$text for timeline.
* add _event_ parameter in _ec.util_ for cmd='morph'.
* integrate website with library using _pkgdown_.
* moved _examples.R_ into 'demo' folder, _ec.examples_ is no longer a command.

# echarty 1.6.4  on CRAN

* upgrade ECharts to v.5.5.0, built with R v.4.4.0.
* add _nasep_ parameter to _ec.data('names')_ to easily set nested lists from a _data.frame_.
* add [WebR](https://docs.r-wasm.org/webr/latest/) support and [test](https://helgasoft.github.io/echarty/test/coder.html).
* add explicit _leaflet_ dependency since dependencies changed in leaflet v.2.2.0.
* add optional tooltip formatter (tipFmt) in _ecr.band_.
* refactoring (leaflet, geo, geoJson, tests).
* add debug flags for messages in JS and R.
* fix _crosstalk_ bug for checkboxes unselect.

# echarty 1.6.3

* added coder.R demo.
* correct gridIndex numbering for xAxis/yAxis.
* deprecate _tl.series_, replace with _timeline_ and _series.param_.

# echarty 1.6.2.01

* make crosstalk work with improved _ec.clmn_.
* add _ecStat_ to built-in plugins.
* removed _dataTool.min.js_ from dependencies (yaml).
* dataset,geo,polar,etc. indexes in series now with R-counting.
* built with R v.4.3.2.
* add default _coordinateSystem_ for 3D charts.
* fix _datasetIndex_ for timeline 3D series.
* add _encode_ default, improve _ec.init_ docs.
* timeline 'map': add support dimension for visualMap, fix legend,title bugs.
* removed width/height from 'tabset', handled by _ec.init_.
* _ecr.band_ replaced default type from 'stack' to 'polygon'.

# echarty 1.6.2

* allow axis rename (fix).
* _ec.data_ grouped boxplots: outliers are custom series.
* _ec.clmn_ expanded usage of column names.

# echarty 1.6.0

* _ec.paxis_ could be chained now.
* _ec.data_ format='boxplot' with optional outliers.
* _ecr.bars_ with better alignment and horizontal layout.

# echarty 1.5.4.03

* upgrade ECharts to v.5.4.3, built with R v.4.3.1.
* breaking change in _ec.init_ signature.
* improved _ec.inspect_ and _ec.fromJson_.
* fixed small bugs and improved code.
* added more tests.

# echarty 1.5.4

* _ec.util_ command 'layout' updated.
* changes in axis names preset, _ec.clmn_ for empty values.
* problem running Shiny in R console: _No handler registered for mouseover_.

# echarty 1.5.3

* upgrade ECharts to v.5.4.2.
* _ec.util_ support for map GeoJSON objects, see test-renderers.R.
* _ec.init_ new parameter _xtKey_ for crosstalk (ID-column name).
* code cleanup in _ecr.band_.
* expand auto-generated axes names to multiple.

# echarty 1.5.2

* _ec.init_ to set default xAxis/yAxis names from _df_.
* _ec.clmn_ accepts JS functions in parameter _col_.
* _ec.util_ new command 'button' to run JS function.
* fix _tabset_ bug introduced in v.1.5.1.

# echarty 1.5.1 

* upgrade ECharts to v.5.4.1.
* remove redundant dependencies, only 3 used now.
* _ecr.band_ default type changed from 'polygon' to 'stack'.
* _ec.data_ type 'boxplot' remodeled and jitter-scatter added.
* new _series.param_ in _ec.init_ for additional parameters for preset series.
* make _ec.util_ tabset responsive by resizing tabs onclick.
* fix _visualMap_ piecewise dimension R-counts.
* set _visualMap_ default min/max values from df.
* _echarty.js_: add built-in 'mouseout' event.

# echarty 1.5.0  on CRAN

* upgrade ECharts to v.5.4.0.
* built with R v.4.2.2.
* added vignette with introduction.
* _ecr.ebars_ fix bug, enhance tooltips.
* _ec.util_ improvements in sf.series.
* _ec.util_ new commands fullscreen, morph, rescale, level.
* _ec.clmn_ new options 'json' and 'log'.
* _ec.init_ set R-counting for encode/xAxisIndex, visualMap$dimension.
* fixes to global options theme & font, group legend.
* fixed _load='world'_ with series set.
* new _load='lottie'_, lotties support now built-in.
* reorganize crosstalk code.

# echarty 1.4.7

* _ec.util_: add POLYGON/MULTIPOINT, new _sf.unzip_.
* _ec.util_: new cmd='tabset' to show multiple charts in tabs.
* _ec.util_: new cmd='layout' for multiple charts in table-like format.
* _ec.upd_ replaces _ec.snip_ for chained commands.
* improved _ec.data_ format='treeTK', see example in _test-other.R_.
* support for _lotties_ in _graphic_, see web gallery for sample.
* grouping column in 2D charts now could be at any position.

# echarty 1.4.6

* upgrade ECharts to v.5.3.3.
* expand docs for _ec.init_.
* fix timeline _tl.series_ for candlestick,boxplot,pictorialBar.
* add custom attribute _groupBy_ for _tl.series_.
* add _riErrBarSimple_ renderer.
* new _ec.data_ formats 'treePC' and 'treeTK' for hierarchies.
* changed _ec.data_ default parameter _header_ to FALSE.
* fixes in _ec.clmn_ and allow empty _col_ parameter for pie,sunburst,etc.
* add _ec.util_ to support map shapefiles thru library 'sf'.

# echarty 1.4.5

* upgrade ECharts to v.5.3.1, GL to v.2.0.9.
* _ec.init_ timeline (_tl.series_) to support 3D.
* _ec.init_ timeline (_tl.series_) to support map chart.
* updated _ec.clmn_ for single value charts like tree.
  Scale 0 to round values. Scale expanded to all numeric columns.
  Decimal indexes for combo charts. 
  L: locale number format. LR: locale rounded format.
* new _ec.data_ format='dendrogram' with new dependency _data.tree_.
* new _ec.data_ format='boxplot' - a helper for boxplot data.
* new package info via command "?echarty".
* added new brush/click events to demo(_eshiny_).
* cleanup `echarty.js` code for events.

# echarty 1.4.2

* replaced magrittr %>% dependency with R native pipe |>.
* added _ec.snip_ as option for better code readability.
* removed _ec.global_, use options('echarty.xxx') instead.
* added _shiny_ dependency to avoid CRAN warnings.
* added more unit tests.

# echarty 1.4.0

* _ec.init_: renamed 'group1' to 'ctype'. Presets for parallel chart, xAxis.
* _ec.paxis_ new helper for parallelAxis.
* _ec.clmn_ placeholders %d %s replaced with %@.
* added initial unit tests.

# echarty 0.3.2

* _ec.init_: _js_ parameter has now 3 levels of execution.
* _ec.clmn_: fix order of parameters, add message for missing data.
* _eshiny_ demo: button and code added to modify series.

# echarty 0.3.1.3

* _ec.init_: fix '3D' presets for groups and 'world' presets.
* _ec.clmn_: added new parameter _scale_.
* _echarty.js_ add resize parameter.
* updates to examples.R.
* upgrade ECharts to v.5.2.1, liquidfill to v.3.1.0.

# echarty 0.3.1.2

* _ec.init_ added ECharts parameters _locale_ and _useDirtyRect_.

# echarty 0.3.1

* _ec.init_ param _timeline_ renamed to _tl.series_.
* tweaks in docs, examples and _echarty.js_.

# echarty 0.3.0

* _ec.timegrp_ merged into _ec.init_ and removed.
* _ec.init_ can now build timeline, parameters simplified.
* _ecr.ebars_ now supports dataset, has default tooltip.
* _ecr.band_ changed parameter 'two' to 'type', improved tooltip support.
* _ec.inspect_ expanded with new parameter 'data'.
* _eshiny_ demo updated: brush parameters, new zoom capture.
* new _ec.clmn_ to reference data column(s) in formatter,color,symbolSize,etc.

# echarty 0.2.2

* _ec.init_ default _ask_=FALSE to _load_ without prompts.
* _echarty.js_: add 'mouseout' event.
* _echarty.js_: move legend to _p_append_data_.

# echarty 0.2.1

* upgrade to ECharts v.5.1.2.
* _ec.plugjs_: new parameter _ask_ to allow/suppress prompts.
* _ec.plugjs_: parameter _source_ now accepts 'file://' format.

# echarty 0.2.0

* removed dependencies for Shiny and crosstalk.
* _js2r_ and _eshiny_ are now R demos.
* change leaflet plugin source.data to dataset, preset center and zoom.
* built with latest R v.4.1.0.

# echarty 0.1.4

* upgrade to ECharts v.5.1.1.
* fixed _p_del_serie_ by seriesName.
* expand Shiny demo and moved from ec.examples() to a gist.
* replaced purrr with apply in ec.data, purrr no longer a dependency.
* _ec.init_ parameter _group1_ now is also default for ungrouped serie. 
* added svg maps, like ```registerMap=list(list(mapName=?, svg=?))```.
* new _ec.layout()_, a charts layout helper.

# echarty 0.1.3

* **crosstalk** support added, send & receive for brush and filter actions.
* _ec.timegrp_ added, a helper to build timeline data for a grouped data.frame.
* _ec.data_ with additional parameter *header*.

# echarty 0.1.2

* _ec.data_ now with three format values.
* _ec.fromJson_ has now "..." (additional arguments).
* _ecr.band_ has new parameter 'two' for alternative rendering.
* error bars added as _ecr.ebars_ with support for grouped data.
* more examples in _ec.examples_.
* some code optimization.

# echarty 0.1.1

* added _ec.plugjs_ - install unknown plugins, like JS maps.
* added _ec.js2r_ - a JS to R translation assistant, a Shiny app.
* _ec.init_ update: one-time install for all plugins except built-in leaflet/custom.
* GL merged with 3D as plugin '3D'.
* more plugins: liquidfill, world, wordcloud, gmodular.
* ec.sband renamed to _ec.band_.

# echarty 0.1.0
* initial release, approved by CRAN Feb 16, 2021.


