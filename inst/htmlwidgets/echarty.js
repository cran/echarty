
HTMLWidgets.widget({

  name: 'echarty',

  type: 'output',

  factory: function(el, width, height) {
    
    var initialized = false;

    var chart,opts;

    const evalFun = (sourceOpts) => {
      let opts = Object.assign({}, sourceOpts);
      Object.keys(opts).forEach((key) => {
        if (opts[key] !== null) {
          if (typeof opts[key] === 'object') {
            evalFun(opts[key]);
            return;
          }
          if (typeof opts[key] === 'string') {
            try {
              opts[key] = eval('(' + opts[key] + ')');
            } catch { }
          }
        }
      });
      return(opts);
    }
    
    return {

      renderValue: function(x) {
        
        chart = echarts.init(document.getElementById(el.id));
        chart.dispose();
        if (!initialized) {
          initialized = true;
          if(x.themeCode){
            let tcode = JSON.parse(x.themeCode);
            echarts.registerTheme(x.theme, tcode);
          }
        }
        if(x.hasOwnProperty('registerMap')){
          for( let map = 0; map < x.registerMap.length; map++){
            echarts.registerMap(x.registerMap[map].mapName, 
                                x.registerMap[map].geoJSON);
          }
        }
        
        let eva2 = null;
        if (x.hasOwnProperty('eval')) {
          if (x.eval) {
            let tmp = null;
            if (Array.isArray(x.eval)) {
              tmp = x.eval[0];
              eva2 = x.eval[1];
            } else
              tmp = x.eval;
            try {
              eval(tmp);
            } catch(err) { console.log('Eva1:' + err.message) }
          }
        }
        
        chart = echarts.init(document.getElementById(el.id), x.theme, 
                            {renderer: x.renderer});
        
        opts = evalFun(x.opts);
        
        if(x.draw === true)
          chart.setOption(opts);
        
        if (eva2) {
          try {
            eval(eva2);
          } catch(err) { console.log('eva2:' + err.message) }
        }
        
        // shiny callbacks
        if (HTMLWidgets.shinyMode) {
          
          chart.on("brushselected", function(e){
            Shiny.onInputChange(el.id + '_brush' + ":echartyParse", e);
          });

          chart.on("brush", function(e){
            Shiny.onInputChange(el.id + '_brush_released' + ":echartyParse", e);
          });
          
          chart.on("legendselectchanged", function(e){
            Shiny.onInputChange(el.id + '_legend_change' + ":echartyParse", e.name);
            Shiny.onInputChange(el.id + '_legend_selected' + ":echartyParse", e.selected);
          });
          
          chart.on("globalout", function(e){
            Shiny.onInputChange(el.id + '_global_out' + ":echartyParse", e);
          });
          
          if(x.hasOwnProperty('capture')){
            chart.on(x.capture, function(e){
              Shiny.onInputChange(el.id + '_' + x.capture + ":echartyParse", e, {priority: 'event'});
            });
          }
          
          chart.on("click", function(e){
            Shiny.onInputChange(el.id + '_clicked_data' + ":echartyParse", e.data, {priority: 'event'});
            Shiny.onInputChange(el.id + '_clicked_row' + ":echartyParse", e.dataIndex + 1, {priority: 'event'});
            Shiny.onInputChange(el.id + '_clicked_serie' + ":echartyParse", e.seriesName, {priority: 'event'});
          });
          
          chart.on("mouseover", function(e){
            Shiny.onInputChange(el.id + '_mouseover_data' + ":echartyParse", e.data);
            Shiny.onInputChange(el.id + '_mouseover_row' + ":echartyParse", e.dataIndex + 1);
            Shiny.onInputChange(el.id + '_mouseover_serie' + ":echartyParse", e.seriesName);
          });
          
          $(document).on('shiny:recalculating', function() {
            
            if(x.hideWhite === true){
              var css = '.recalculating {opacity: 1.0 !important; }',
                  head = document.head || document.getElementsByTagName('head')[0],
                  style = document.createElement('style');
              
              style.type = 'text/css';
              if (style.styleSheet){
                style.styleSheet.cssText = css;
              } else {
                style.appendChild(document.createTextNode(css));
              }
              head.appendChild(style);
            }
            
            if(x.loading === true){
              chart.showLoading('default', x.loadingOpts);
            } else if(x.loading === false) {
              chart.hideLoading();
            }
            
          });
          
          $(document).on('shiny:value', function() {
            chart.hideLoading();
          });
        }
        
        if(x.hasOwnProperty('connect')){
          var connections = [];
          for(var c = 0; c < x.connect.length; c++){
            connections.push(get_e_charts(x.connect[c]));
          }
          connections.push(chart);
          echarts.connect(connections);
        }
        
        // actions
        if(x.events.length >= 1){
          for(var i = 0; i < x.events.length; i++){
            chart.dispatchAction(x.events[i].data);
          }  
        }
        
        // buttons
        var buttons = x.buttons;
        Object.keys(buttons).map( function(buttonId){
          document.getElementById(buttonId).addEventListener('click', 
            (function(id) {
              const scoped_id = id;
              return function(e){
                buttons[scoped_id].forEach(function(el){
                  chart.dispatchAction(el.data);
                });
              };
            }
            )(buttonId)
          );
        });
          
        if(x.hasOwnProperty('on')){
          for(var e = 0; e < x.on.length; e++){
            chart.on(x.on[e].event, x.on[e].query, x.on[e].handler);
          }
        }
        
        if(x.hasOwnProperty('off')){
          for(var ev = 0; ev < x.off.length; ev++){
            chart.off(x.off[ev].event, x.off[ev].query, x.off[ev].handler);
          }
        }
        
        if(x.hasOwnProperty('chartGroup')){
          chart.group = x.chartGroup;
        }
        
        if(x.hasOwnProperty('groupConnect')){
          echarts.connect(x.groupConnect);
        }
        
        if(x.hasOwnProperty('groupDisconnect')){
          echarts.disconnect(x.groupDisconnect);
        }
        
        /* ---------------- crosstalk ----------------
          keys are numbered differently depending on the source: 
              R = 1:n, JS = 0:(n-1)   unselect all if sel.count==total
        */
    	  // check crosstalk bindings
      	if ((typeof x.settings)!='undefined' &&
      	    (typeof x.settings.crosstalk_key)!='undefined' && 
      	    (typeof x.settings.crosstalk_group)!='undefined' &&
      	    x.settings.crosstalk_key !=null && 
      	    x.settings.crosstalk_group !=null) {

      	  console.log(' echarty crosstalk on');
      	  
      	  var sel_handle = new crosstalk.SelectionHandle();
          var ct_filter = new crosstalk.FilterHandle();
    
      	  chart.on("brushselected", function(keys) {    // send keys FROM echarty
      	    let items = [];
      	    if (keys.batch)
        	    items = keys.batch[0].selected[0].dataIndex;
      	    if (items && items.length>0) {
      	      //console.log('dindex='+items);
      	      for (let i=0; i < items.length; ++i) ++items[i];
              sel_handle.set(items);
      	    }
          });
      	  chart.on("brushEnd", function(keys) {    // release selection FROM echarty
      	    if (keys.areas.length==0)
      	      sel_handle.set([]);
      	  })
      	  
      	  // Highlight points selected by another widget
      	  sel_handle.on("change", function(e) {  
      	    if (e.sender !== sel_handle) {     // get external keys to highlight/brush
      	      //console.log('brush='+e.value);
              
        	    if (e.value.length>0) {
        	      for (let i=0; i < e.value.length; ++i) --e.value[i];
        	      chart.dispatchAction({type:'highlight', 
        	                            seriesIndex:0, dataIndex:e.value });
        	      sel_handle.save = e.value;
        	    } else if (sel_handle.save) {   // clear selected
                chart.dispatchAction({type:'downplay', 
                                      seriesIndex:0, dataIndex:sel_handle.save }); 
                sel_handle.save = null;
              }
            }
      	  });
      	  
      	  chart.key = x.settings.crosstalk_key;
      	  
          sel_handle.setGroup(x.settings.crosstalk_group);
      
          // --- filtering ---
      	  chart.on("selectchanged", function(keys) {
      	    let items = [];
            if (keys.selected.length>0)
        	      items = keys.selected[0].dataIndex;
        	  //console.log('fselchg=' + items);
      	    if (keys.isFromClick) {           // send keys FROM echarty
      	      for (let i=0; i < items.length; ++i) ++items[i];
      	      if (items.length==0) items = this.key;   // send all keys = filter off
        	    ct_filter.set(items);
      	    } else if (keys.fromAction != 'unselect')
        	    ct_filter.save = items;
      	  })
      	  ct_filter.on("change", function(e) {    // only external keys to filter
      	    if (e.sender == ct_filter) return;
      	    //console.log('filter='+e.value);
            if (ct_filter.save) {   // clear selected 
              chart.dispatchAction({type:'unselect', 
                                    seriesIndex:0, dataIndex:ct_filter.save });
              ct_filter.save = null;
            }
      	    if (e.value) {
      	      for (let i=0; i < e.value.length; ++i) --e.value[i];
      	      if (e.value.length == chart.key.length) {
                chart.dispatchAction({type:'unselect', 
                                            seriesIndex:0, dataIndex:e.value });
                return;
      	      }
        	    chart.dispatchAction({type:'select', 
        	                          seriesIndex:0, dataIndex:e.value });
        	    ct_filter.save = e.value;  // save to unselect later
      	    }
      	  })
          // Choose group for Filter
          ct_filter.setGroup(x.settings.crosstalk_group);	  
      
      	}   
      	// ---------------- end crosstalk

      },
      
      getChart: function(){
        return chart;
      },
      
      getOpts: function(){
        return opts;
      },

      resize: function(width, height) {

        if(chart){
          chart.resize({width: width, height: height});
        }

      }

    };
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
          } catch(err) { console.log('eval action:' + err.message) }
          break;
        
        case 'p_resize':
          chart.resize();
          break;
          
        case 'p_merge':
          chart.setOption(data.opts);
          break;
          
        case 'p_replace':     // replace entire chart
          chart.setOption(data.opts, true);
          break;
          
        case 'p_update':    // more like 'append serie'
          
          if(!cpts.series)  // add series array if none
            cpts.series = [];
  
          data.opts.series.forEach(function(serie){
            // for JS_EVAL and renderItem
            if (typeof serie.renderItem == 'string') 
              serie.renderItem = eval(serie.renderItem);
            cpts.series.push(serie);
          })
  
          if (data.opts.legend) {    // legend
            if(cpts.legend.length > 0)
              if(data.opts.legend.data)
                cpts.legend[0].data = cpts.legend[0].data.concat(data.opts.legend.data);
          }
          if (data.opts.xAxis) {    // x Axis
            if(cpts.xAxis){
              if(cpts.xAxis[0].data){
                let xaxis = cpts.xAxis[0].data.concat(data.opts.xAxis[0].data);
                xaxis = xaxis.filter(distinct);
                cpts.xAxis[0].data = xaxis;
              }
            } else
              cpts.xAxis = data.opts.xAxis;
          }
          if (data.opts.yAxis) {    // y Axis
            if(cpts.yAxis){
              if(cpts.yAxis[0].data){
                let yaxis = cpts.yAxis[0].data.concat(data.opts.yAxis[0].data);
                yaxis = yaxis.filter(distinct);
                cpts.yAxis[0].data = yaxis;
              }
            }
          }
          if (data.opts.dataset) 
            cpts.dataset = data.opts.dataset;
console.log('user.opts='+Object.keys(data.opts))
          chart.setOption(cpts, true);
          break;
          
        case 'p_append_data':       // add data to one serie
          if (!cpts.series) break;
          if (data.opts.seriesName) {
            // find index by name
            var idx = 0;
            cpts.series.forEach(function(serie) {
              if (serie.name==data.opts.seriesName) data.opts.seriesIndex = idx;
              idx++;
            })
            //console.log('appd ',data.opts.seriesName,'=',data.opts.seriesIndex)
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
            series.forEach( function(s, index) {
              if(s.name == data.opts.seriesName){
                this.splice(index, 1);
              }
            }, series)
            cpts.series = series;
          }
          else if (data.opts.seriesIndex)
            cpts.series = cpts.series.splice(data.opts.seriesIndex, 1);
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
      }
  });
  
}


/*
---------------------------------------
Original work Copyright 2018 John Coene

Modified work Copyright 2021 Larry Helgason

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
