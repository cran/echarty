/*global HTMLWidgets, echarts, Shiny*/
/* eslint no-undef: "error" */

// extra functions
ecf = {
  
  geojson: null,
  geofill: 0,
  geoz2: 0,
  zoom: {s: 0, e: 100 },  // dataZoom values
  fs: false,              // fullscreen flag Y/N
  dbg: false,             // debug flag: if (ecf.dbg) console.log(' change s:'+v)
  
  IsFullScreen: function() {
    	var full_screen_element = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement || null;
    	if (full_screen_element === null)
    	  return false;
    	else
    	  return true;
  },

  fscreen: function(chid) {
    // see also window.onresize
    function GoInFullscreen(element) {
       if (element.requestFullscreen)
           element.requestFullscreen();
       else if (element.mozRequestFullScreen)
           element.mozRequestFullScreen();
       else if (element.webkitRequestFullscreen)
           element.webkitRequestFullscreen();
       else if (element.msRequestFullscreen)
           element.msRequestFullscreen();
    }
    function GoOutFullscreen() {
       if (document.exitFullscreen)
           document.exitFullscreen();
       else if (document.mozCancelFullScreen)
           document.mozCancelFullScreen();
       else if (document.webkitExitFullscreen)
           document.webkitExitFullscreen();
       else if (document.msExitFullscreen)
           document.msExitFullscreen();
    }

    if (this.fs) {
      if (this.IsFullScreen())
        GoOutFullscreen();
    }
    else {
      let tmp = document.getElementById(chid);
      GoInFullscreen(tmp)
    }
    this.fs = !this.fs;
  },
  
  lottieGraphic: function(vv) {
    // transform lottie graphic element
    if (vv==undefined) return vv;
    if (vv.length) return vv;
    if (!vv.elements) return vv;
    vv.elements.forEach((elem) => {
      let loty = elem; 
      let data = loty.info; 
      if (!data) return;
      delete loty.info;
      if (!data.v || data.v.search('\\d\\.\\d\\.\\d')<0) return;  // not a lottie
      if (lottieParser==undefined) return;
      lottieParser.install(echarts);
      let loop= loty.loop; if (loop==undefined) loop = true;
      const { elements, width, height } = lottieParser.parse(data, {loop: loop});
      let scale= loty.scale; 
      if (scale) {
        delete loty.scale; 
        const sfactor = scale / Math.min(width, height);
        loty.scaleX= sfactor; loty.scaleY= sfactor;
      }
      loty.type= 'group';  loty.children= elements;
      elem = loty; 
    });
    return vv;
  },

  labelsInside: function(params) {
    // labelLayout= htmlwidgets::JS("(params) => ecf.labelsInside(params)")) 
    // https://github.com/apache/echarts/issues/17828   thanks to @plainheart
    if (echwid=='') return null;   // single chart only (TODO: many)
    dchart = get_e_charts(echwid);
    const chartWidth = dchart.getWidth();
    const labelRect = params.labelRect;
    const labelX = labelRect.x;
    const labelWidth = labelRect.width;
    const overflow = labelWidth + labelX > chartWidth;
    return {
      x: overflow ? chartWidth - labelWidth : labelX,
      verticalAlign: overflow ? 'top' : 'middle',
      dy: overflow ? -3 : 0
    }
  }

};

HTMLWidgets.widget({

  name: 'echarty',
  type: 'output',

  factory: function(el, width, height) {
    
    var initialized = false;
    var chart, opts;

    return {

    renderValue: function(x) {
      
      chart = echarts.init(document.getElementById(el.id));
      chart.dispose();    // remove previous if any
      if (!initialized) {
        initialized = true;
        if(x.themeCode){
          let tcode = JSON.parse(x.themeCode);
          echarts.registerTheme(x.theme, tcode);
        }
      }
      
      if (x.hasOwnProperty('registerMap')) {
        /*  for( let map = 0; map < x.registerMap.length; map++){
          if (x.registerMap[map].geoJSON)
            echarts.registerMap(x.registerMap[map].mapName, 
                                x.registerMap[map].geoJSON);
          else if (x.registerMap[map].svg)
            echarts.registerMap(x.registerMap[map].mapName, 
              { svg: x.registerMap[map].svg });
        } */
        for (const map of x.registerMap) {
          if (map.geoJSON)
            echarts.registerMap(map.mapName, map.geoJSON);
          else if (map.svg)
            echarts.registerMap(map.mapName, { svg: map.svg });
        }
      }
        
      var eva2 = null, eva3 = null;
      if (x.hasOwnProperty('jcode')) {
        if (x.jcode) {
          let tmp = null;
          if (Array.isArray(x.jcode)) {
            // #1 run before init, can set window.vars
            tmp = x.jcode[0];
            try {
              eval(tmp);
            } catch(err) { console.log('eva1: ' + err.message) }
            eva2 = x.jcode[1];
            eva3 = x.jcode[2];
          } else
            eva3 = x.jcode;
        }
      }
      if (x.hasOwnProperty('dbg')) { ecf.dbg= x.dbg; }
      
      chart = echarts.init(document.getElementById(el.id), x.theme, 
      	{ renderer: x.renderer, locale: x.locale, useDirtyRect: x.useDirtyRect }
      );

      if (window.onresize==undefined)   // single chart only, TODO: many
        window.onresize = function() {
        	//chart.resize();
        	ecf.fs = ecf.IsFullScreen();  // handle ESC key
        }

      opts = x.opts;
      opts.echwid = el.id;    // fullscreen support, multiple charts
      window.echwid = el.id;  // save for single charts
      
      if (eva2) {	// #2 to change opts
        try {
          eval(eva2);
        } catch(err) { console.log('eva2: ' + err.message) }
      }
      
      if(x.draw === true)
        chart.setOption(opts);
      
      if (eva3) {	// #3 to use chart object
        try {
          eval(eva3);
        } catch(err) { console.log('eva3: ' + err.message) }
      }
      
      if (opts.graphic && typeof lottieParser!='undefined') {
        let tmp = ecf.lottieGraphic(opts.graphic);
        chart.setOption({graphic: tmp}, { replaceMerge: 'graphic'});
      }
      
      if (HTMLWidgets.shinyMode) {

        // built-in Shiny event callbacks
        
        chart.on("click", function(e){
          Shiny.setInputValue(el.id + '_click', 
            { name: e.name, data: e.data, dataIndex: e.dataIndex,
              seriesName: e.seriesName, value: e.value
            },  {priority:'event'});
        });
        
        chart.on("mouseover", function(e){
          Shiny.setInputValue(el.id + '_mouseover', 
            { name: e.name, data: e.data, dataIndex: e.dataIndex,
              seriesName: e.seriesName, value: e.value
            },  {priority:'event'});
        });
        
        chart.on("mouseout", function(e){
          Shiny.setInputValue(el.id + '_mouseout', 
            { name: e.name, data: e.data, dataIndex: e.dataIndex,
              seriesName: e.seriesName, value: e.value
            },  {priority:'event'});
        });

        if(x.hasOwnProperty('capture')){
          // for events like datazoom, click, etc.
          // defined in https://echarts.apache.org/en/api.html#events
          if (Array.isArray(x.capture)) {  // multiple events
            x.capture.forEach(ev => chart.on(ev, function(es) {
                Shiny.setInputValue(el.id +'_' +ev, es, {priority: 'event'});
              })
            )
          } else   // just one event
            chart.on(x.capture, function(e) {
              Shiny.setInputValue(el.id +'_' +x.capture, e, {priority: 'event'});
            });
        }
      }
      
      if(x.hasOwnProperty('on')) {
        x.on.forEach(ev => chart.on(ev.event, ev.query, ev.handler) )
      }
      
      if(x.hasOwnProperty('off')){
        x.off.forEach(ev => chart.on(ev.event, ev.query, ev.handler) )
      }
      
      if(x.hasOwnProperty('group')){
        chart.group = x.group;
      }
      
      if(x.hasOwnProperty('connect')){
        if (Array.isArray(x.connect)) {
          let connections = [];
          x.connect.forEach(cc => connections.push(get_e_charts(cc)) )
          connections.push(chart);
          echarts.connect(connections);  
        } else
          echarts.connect(x.connect);
      }
      
      if(x.hasOwnProperty('disconnect')){
        echarts.disconnect(x.disconnect);
      }
      
  // ---------------- crosstalk ----------------
      // keys are numbered differently depending on the source: 
      //      R = 1:n, JS = 0:(n-1)
      //  ECharts 5.4.0: map selections are 'hidden' after filtering:
      //  see https://github.com/apache/echarts/issues/17772

      if ((typeof x.settings)!='undefined' &&
    	    (typeof x.settings.crosstalk_key)!='undefined' && 
    	    (typeof x.settings.crosstalk_group)!='undefined' &&
    	    x.settings.crosstalk_key !=null && 
    	    x.settings.crosstalk_group !=null) {

        var tmp = opts.series.findIndex(x => x.datasetId === 'Xtalk');
        if (tmp==undefined) 
          console.log('no series found preset for crosstalk')
      	console.log(' echarty crosstalk on');
        chart.sext = tmp;
        // chart.akeys = chart.filk = x.settings.crosstalk_key.map(x=>Number(x));
      	chart.akeys = chart.filk = x.settings.crosstalk_key;  // save all keys
        chart.sele = [];
      	
      	var sel_handle = new crosstalk.SelectionHandle();
      	sel_handle.setGroup(x.settings.crosstalk_group);
      	var ct_filter =  new crosstalk.FilterHandle();
      	ct_filter.setGroup(x.settings.crosstalk_group);
      	
      	chart.on("brushselected", function(keys) {    // send keys FROM echarty
      		let items = [];
      		if (keys.batch && keys.batch.length>0)
      			items = keys.batch[0].selected[0].dataIndex;
    	    tmp = items.map(i=> chart.filk[i])
      		sel_handle.set(tmp);
      	});
      	chart.on("brushEnd", function(keys) {    // release selection FROM echarty
      		if (keys.areas.length==0)
      			sel_handle.set([]);
      			//sel_handle.set(this.akeys.map(String));  // restore
      	})
      	chart.on("selectchanged", function(keys) { // send keys FROM echarty
        		let items = [];
        		if (keys.selected.length>0)
        		    items = keys.selected[0].dataIndex;
        		if (keys.isFromClick) {
        		  //if (items.length==0) items = this.akeys; // send all keys: bad for map
        	    tmp = items.map(i=> chart.filk[i])
        		  sel_handle.set(tmp.map(String));
              chart.sele = items;
        		}
      	})
    
    	  sel_handle.on("change", function(e) {  // external keys to our select
        	if (e.sender == sel_handle) return;
          if (e.oldValue && e.oldValue.length>0) {   // clear previous
      	    tmp = e.oldValue;  //.map(x=>Number(x));
      	    tmp = tmp.map(r=> chart.filk.indexOf(r));
            chart.dispatchAction({type: 'downplay', 
                  seriesIndex: chart.sext, dataIndex: tmp });
          }
          if (e.value.length > 0) {
    	      tmp = e.value;  //.map(x=>Number(x))
      	    tmp = tmp.map(r=> chart.filk.indexOf(r))
    	      chart.dispatchAction({type: 'highlight', 
    	            seriesIndex: chart.sext, dataIndex: tmp });
          }
    	  });
    	  
      	ct_filter.on('change', function(e) {    // external keys to filter
      		if (e.sender == ct_filter) return;
      		if (e.value == undefined) e.value = chart.akeys; // sent by filter_checkbox
          
          rexp = (e.value.length == chart.akeys.length)
                  ? '^' : '^('+ e.value.join('|') +')$';
          opt = chart.getOption();
          dtf = opt.dataset.find(x => x.id === 'Xtalk');
          //dtf.transform = {type:'filter', config: {dimension: 'XkeyX', reg: rexp } }
          dtf.transform.config.reg = rexp;
          chart.filk = e.value.sort((a, b) => a - b);
          chart.setOption(opt, false);
      	});
  	
      }   // ---------------- end crosstalk

    },   // end renderValue
    
    getChart: function(){
      return chart;
    },
    
    getOpts: function(){
      return opts;
    },

    resize: function(width, height) {
      if (chart)
        chart.resize({width: width, height: height});
    }

    };  // return
  }
});

function get_e_charts(id){

  let htmlWidgetsObj = HTMLWidgets.find("#" + id);
  if (!htmlWidgetsObj) return(null);

  let echarts;

  if (typeof htmlWidgetsObj != 'undefined') {
    echarts = htmlWidgetsObj.getChart();
  }

  return(echarts);
}

function get_e_charts_opts(id){

  let htmlWidgetsObj = HTMLWidgets.find("#" + id);
  if (!htmlWidgetsObj) return(null);

  let opts;

  if (typeof htmlWidgetsObj != 'undefined') {
    opts = htmlWidgetsObj.getOpts();
  }

  return(opts);
}

function ec_chart(id) { return(get_e_charts(id)); }
function ec_option(id) { return(get_e_charts_opts(id)); }

function distinct(value, index, self) { 
  return self.indexOf(value) === index;
}

if (HTMLWidgets.shinyMode) {

  Shiny.addCustomMessageHandler('kahuna',
  
    function(data) {
      
      var chart = get_e_charts(data.id);
      if (typeof chart == 'undefined') return;
      if (!data.action) return;
      // add JS dependencies if any
      if (data.deps) Shiny.renderDependencies(data.deps);
      let cpts = chart.getOption();

      switch(data.action) {
        
        case 'p_js':
          try {
            eval(data.opts.code);
          } catch(err) { console.log('p_js action:' + err.message) }
          break;
        
        case 'p_resize':
          // see https://echarts.apache.org/en/api.html#echartsInstance.resize
          if (data.opts.resizeOpts)
            chart.resize(data.opts.resizeOpts);
          else
            chart.resize()
          break;
          
        case 'p_merge':
          chart.setOption(data.opts);
          break;
          
        case 'p_replace':     // replace entire chart
          chart.setOption(data.opts, true);
          break;
          
        case 'p_update':    // used also to 'append serie'
          
          if(!cpts.series)  // add series array if none
            cpts.series = [];
          
          data.opts.series.forEach(function(serie){
            // for renderItem
            if (typeof serie.renderItem == 'string') 
              serie.renderItem = eval(serie.renderItem);
            cpts.series.push(serie);
          })
  
          if (data.opts.xAxis) {
            if(cpts.xAxis.length > 0){
              if(cpts.xAxis[0].data){
                let xaxis = cpts.xAxis[0].data.concat(data.opts.xAxis[0].data);
                xaxis = xaxis.filter(distinct);
                cpts.xAxis[0].data = xaxis;
              }
            } else
              cpts.xAxis = data.opts.xAxis;
          }
          if (data.opts.yAxis) {
            if(cpts.yAxis.length > 0){
              if(cpts.yAxis[0].data){
                let yaxis = cpts.yAxis[0].data.concat(data.opts.yAxis[0].data);
                yaxis = yaxis.filter(distinct);
                cpts.yAxis[0].data = yaxis;
              }
            } else
              cpts.yAxis = data.opts.yAxis;
          }

          if (data.opts.dataset) 
            cpts.dataset = data.opts.dataset;
            
          if (data.opts.toolbox) 
            cpts.toolbox = data.opts.toolbox;
            
          chart.setOption(cpts, true);
          break;
          
        case 'p_append_data':       // add data to legend or one serie
        
          if (data.opts.legend) {
            if(cpts.legend.length > 0)
              if(data.opts.legend.data)
                cpts.legend[0].data = cpts.legend[0].data.concat(data.opts.legend.data);
          }
          if (!cpts.series) break;
          if (data.opts.seriesName) {
            // find index by name
            let idx = cpts.series.findIndex(item => 
                item.name === Number(data.opts.seriesName));
            if (idx > -1) data.opts.seriesIndex = idx;
          }
          if (data.opts.seriesIndex)
            chart.appendData({
              seriesIndex: data.opts.seriesIndex,
              data: data.opts.data
            });
          break;
        
        case 'p_del_serie':
          if (data.opts.seriesName) {
            let series = cpts.series;
            series.forEach( function(s, index, object) {
              if(s.name == data.opts.seriesName){
                object.splice(index, 1);
              }
            })
            cpts.series = series;
          }
          else if (data.opts.seriesIndex)
            cpts.series.splice(data.opts.seriesIndex, 1);
          chart.setOption(cpts, true);
          break;
        
        case 'p_del_marks':
          let sindx = null;
          if(data.opts.seriesName){
            for (let i = 0; i < cpts.series.length; i++) {
              if(cpts.series[i].name == data.opts.seriesName) {
                sindx = i; break;
              }
            }
          }
          else if(data.opts.seriesIndex)
            sindx = data.opts.seriesIndex;
          if (sindx != null && sindx>0) {
            let dm = data.opts.delMarks;
            if (!Array.isArray(dm)) break;
            if (dm.includes('markArea')) cpts.series[sindx-1].markArea=null;
            if (dm.includes('markLine')) cpts.series[sindx-1].markLine=null;
            if (dm.includes('markPoint')) cpts.series[sindx-1].markPoint=null;
          }
          chart.setOption(cpts, true);
          break;
          
        case 'p_dispatch':
          chart.dispatchAction(data.opts);
          break;
          
        default:
          console.log('unknown command ',data.action);
      }
  });
  
}


/*
---------------------------------------
Original work Copyright 2018 John Coene

Modified work Copyright 2021-2024 Larry Helgason

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
---------------------------------------
*/
