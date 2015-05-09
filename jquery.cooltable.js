function CoolTable(placeholder, metadata, data,tableclassname,pagesize,rowsettings,header) {
      this.clone = function (o){
           var out, v, key;
           out = ($.isArray(o)) ? [] : {};
           for (key in o) {
           v = o[key];
           out[key] = (typeof v === "object") ? this.clone(v) : v;
           }
           return out;
      }
     
      this.placeholder = placeholder;
      this.metadata = metadata;
      this.data = data;
      this.pagesize = pagesize;
      this.paginated = false;
      this.pageIndex = 0;
      this.table = null;
      this.pageCount = 0;
      this.originalData = this.clone(data);
      this.rowsettings = rowsettings;
      this.filterEnabled = false;
      this.filtered = false;
      this.tableclassname =tableclassname;
      this.header = header;
      this.hStartIndex = 0;
      this.filterRow =[];
     
      this.drawTable= function () {
            this.table = $('<table></table>').attr('class',tableclassname);
            $('#'+this.placeholder).append(this.table);
            var heading = $('<tr></tr>');
            var hRow = $('<tr></tr>');
            var paginated = false;
           
            if(this.header) {
                  heading.append($('<td></td>').attr('colspan',this.metadata.length).attr('class',this.tableclassname+'Header').append(this.header));
                  this.table.append(heading);
                  this.hStartIndex++;
            }
 
            if(this.pagesize!= null) {
                  this.paginated = true;
                  this.pageCount =  Math.ceil(this.data.length/this.pagesize);
            }
           
            var tableInstance = this;
            for(var headerIndex=0; headerIndex<this.metadata.length;headerIndex++) {
                  var sortIndex = headerIndex.toString();
                  hRow.append($('<th></th>').append($('<div></div>').css({'text-align':'center','width':'100%','display':'table-row'}) /*this.metadata[headerIndex].headerStyle.width*/
                  .append($('<div></div>').append('').css({'display':'table-cell','height':'15px','cursor':'pointer','vertical-align':'middle','max-width':'100%','text-align':'center'}).append(this.metadata[headerIndex].label)
                        .click(function() {
                              if($(this).attr('sortable') =='true') {
                                   if($(this).attr('sortDirection') =='none') {
                                         $(this).attr('sortDirection','down');
                                         tableInstance.table.find("th").not(':eq('+$(this).attr('sortId')+')').each(function(){$($(this).find('div div')[1]).text('');$($(this).find('div div')[0]).attr('sortDirection','none');});
                                         tableInstance.sort($(this).attr('sortId'),'down');
                                         $($(this).parent().children()[1]).append('&#x25BC;');
                                   } else  {
                                         if($(this).attr('sortDirection') =='down') {
                                               $(this).attr('sortDirection','up');
                                               tableInstance.table.find("th").not(':eq('+$(this).attr('sortId')+')').each(function(){$($(this).find('div div')[1]).text('');$($(this).find('div div')[0]).attr('sortDirection','none');});
                                               tableInstance.sort($(this).attr('sortId'),'up');
                                               $($(this).parent().children()[1]).text('').append('&#x25B2;');
                                         } else {
                                               $(this).attr('sortDirection','none');
                                               tableInstance.table.find("th").each(function(){$($(this).find('div div')[1]).text('');$($(this).find('div div')[0]).attr('sortDirection','none');});
                                               tableInstance.data = tableInstance.clone(tableInstance.originalData);
                                               if(tableInstance.filtered) {
                                                     tableInstance.filter(tableInstance);
                                               } else {
                                                     if(tableInstance.filterEnabled)       tableInstance.table.find("tr:gt("+(tableInstance.hStartIndex+1)+")").remove(); else      tableInstance.table.find("tr:gt("+(tableInstance.hStartIndex)+")").remove();
                                                     tableInstance.fillData();
                                               }
                                         }
                                   }
                              }
                        }).
                        attr('sortId',sortIndex).
                        attr('sortDirection','none').
                        attr('title',this.metadata[headerIndex].label).
                        attr('sortable',(this.metadata[headerIndex].sortable!=null)?this.metadata[headerIndex].sortable:'true')
                  ).append($('<div></div>').append('').css({'display':'table-cell','min-width':'13px','height':'15px','min-height':'15px','vertical-align':'middle'})))
                  .css(this.metadata[headerIndex].headerStyle!=null?this.metadata[headerIndex].headerStyle:{}));
            }
            this.table.append(hRow);
           
            var fRow = $('<tr></tr>');
            for(var filterIndex=0; filterIndex<this.metadata.length;filterIndex++) {
                  if(this.metadata[filterIndex].filterable!=null&&(this.metadata[filterIndex].filterable=='true'||this.metadata[filterIndex].filterable==true)) {
                        var filterCell = $('<input type="text">').css({'width':'100%','height':'auto'}).bind('keyup input paste',this,this.applyFilter).attr('filterKey',this.metadata[filterIndex].name)
                        fRow.append($('<td></td>').append(filterCell));
                        this.filterRow.push(filterCell);
                  } else {
                        fRow.append($('<td></td>'));
                  }                
            }
            if($(fRow).find(':input').length > 0) {
                  this.filterEnabled = true;
                  this.table.append(fRow);
            }
                 
           
            this.fillData();
           
           
      }
     
      this.changePage= function(pageIndex) {
            if(pageIndex<0 || pageIndex>this.pageCount)
                  return;
            this.pageIndex = pageIndex;
            if(this.filterEnabled)       this.table.find("tr:gt("+(this.hStartIndex+1)+")").remove(); else      this.table.find("tr:gt("+(this.hStartIndex)+")").remove();
            this.fillData();
      }
     
      this.fillData= function() {
            var startRow = 0;
            var endRow = this.data.length;
           
            if(this.paginated == true) {
                  startRow = this.pageIndex*this.pagesize;
                  if(this.data.length<this.pagesize+startRow)
                        endRow = startRow+this.data.length%this.pagesize;
                  else
                        endRow = startRow+this.pagesize;
            }
     
            var index = 0;
            var tableInstance = this;
           
            for(var rowIndex=startRow; rowIndex <endRow;rowIndex++) {
                  var row = $('<tr></tr>');
                  if(null!= rowsettings) {
                        if(index%2==0 && rowsettings.evenRowStyle != null) {
                              row.css(rowsettings.evenRowStyle);
                              if(rowsettings.hoverStyle != null) {
                                   row.hover(function() {
                                         $(this).css(rowsettings.hoverStyle);
                                    }, function() {
                                         $(this).css(rowsettings.evenRowStyle);
                                   });
                              }
                        } else if(index%2==1  && rowsettings.oddRowStyle != null) {
                              row.css(rowsettings.oddRowStyle);
                              if(rowsettings.hoverStyle != null) {
                                   row.hover(function() {
                                         $(this).css(rowsettings.hoverStyle);
                                   }, function() {
                                         $(this).css(rowsettings.oddRowStyle);
                                   });
                              }
                        }
                       
                        if(rowsettings.rowFunctions != null){
                              for(var i = 0;i<rowsettings.rowFunctions.length;i++) {
                                    row.bind(rowsettings.rowFunctions[i].eventType,this.data[rowIndex],rowsettings.rowFunctions[i].functionToCall);
                              }
                        }
                  }
                 
                 
                  for(var headerIndex = 0; headerIndex <this.metadata.length;headerIndex++) {
                        row.append($('<td></td>').css(this.metadata[headerIndex].dataStyle!=null?this.metadata[headerIndex].dataStyle:{})
                                    .append(this.metadata[headerIndex].renderFunction!=null? this.metadata[headerIndex].renderFunction(this.data[rowIndex],this.data[rowIndex].values[this.metadata[headerIndex].name]):
                                               this.data[rowIndex].values[this.metadata[headerIndex].name]));
                  }
                  this.table.append(row);
                  index++;
            }
           
        if(this.paginated == true && this.pageCount !=0) {
            var tableInstance = this;
            var first = null;
            var goFirst = null;
            if(this.pageIndex !=0) {
                            goFirst = $('<span></span>').click(function() {tableInstance.changePage(0)}).text('<<  ').css({ '-webkit-touch-callout': 'none', '-webkit-user-select': 'none','-khtml-user-select': 'none','-moz-user-select': 'none','-ms-user-select': 'none','user-select': 'none','outline-style':'none','padding-right':'5px','padding-left':'5px','font-weight':'900','cursor':'pointer'});
                            first = $('<span></span>').click(function() {tableInstance.changePage(tableInstance.pageIndex-1)}).text('<  ').css({ '-webkit-touch-callout': 'none', '-webkit-user-select': 'none','-khtml-user-select': 'none','-moz-user-select': 'none','-ms-user-select': 'none','user-select': 'none','outline-style':'none','padding-right':'5px','padding-left':'5px','font-weight':'900','cursor':'pointer'});
            }
            else {
                            first = $('<span></span>').text('<  ').css({"font-weight":900,"cursor":"pointer","visibility":"hidden"}).css({ '-webkit-touch-callout': 'none', '-webkit-user-select': 'none','-khtml-user-select': 'none','-moz-user-select': 'none','-ms-user-select': 'none','user-select': 'none','outline-style':'none','padding-right':'5px','padding-left':'5px','font-weight':'900','cursor':'pointer'});
                            goFirst = $('<span></span>').text('<<  ').css({"font-weight":900,"cursor":"pointer","visibility":"hidden"}).css({ '-webkit-touch-callout': 'none', '-webkit-user-select': 'none','-khtml-user-select': 'none','-moz-user-select': 'none','-ms-user-select': 'none','user-select': 'none','outline-style':'none','padding-right':'5px','padding-left':'5px','font-weight':'900','cursor':'pointer'});
            }
            var last = null;
            var goLast = null;
            if(this.pageIndex !=this.pageCount-1) {
                            goLast = $('<span></span>').click(function() {tableInstance.changePage(tableInstance.pageCount-1)}).text('  >>').css({ '-webkit-touch-callout': 'none', '-webkit-user-select': 'none','-khtml-user-select': 'none','-moz-user-select': 'none','-ms-user-select': 'none','user-select': 'none','outline-style':'none','padding-right':'5px','padding-left':'5px','font-weight':'900','cursor':'pointer'});
                            last = $('<span></span>').click(function() {tableInstance.changePage(tableInstance.pageIndex+1)}).text('  >').css({ '-webkit-touch-callout': 'none', '-webkit-user-select': 'none','-khtml-user-select': 'none','-moz-user-select': 'none','-ms-user-select': 'none','user-select': 'none','outline-style':'none','padding-right':'5px','padding-left':'5px','font-weight':'900','cursor':'pointer'});
            }                                             
            else {
                            last = $('<span></span>').append('  >').css({"font-weight":900,"cursor":"pointer","visibility":"hidden"}).css({ '-webkit-touch-callout': 'none', '-webkit-user-select': 'none','-khtml-user-select': 'none','-moz-user-select': 'none','-ms-user-select': 'none','user-select': 'none','outline-style':'none','padding-right':'5px','padding-left':'5px','font-weight':'900','cursor':'pointer'});                                    
                            goLast = $('<span></span>').append('  >>').css({"font-weight":900,"cursor":"pointer","visibility":"hidden"}).css({ '-webkit-touch-callout': 'none', '-webkit-user-select': 'none','-khtml-user-select': 'none','-moz-user-select': 'none','-ms-user-select': 'none','user-select': 'none','outline-style':'none','padding-right':'5px','padding-left':'5px','font-weight':'900','cursor':'pointer'});                                    
            }
           
            this.table.append($('<tr></tr>').append($('<td></td>').attr('colspan',this.metadata.length).append(goFirst).append(first).append((this.pageIndex+1)+'/'+this.pageCount).append(last).append(goLast)).attr('class',this.tableclassname+'Paginator').css({'text-align': 'center', '-webkit-touch-callout': 'none', '-webkit-user-select': 'none','-khtml-user-select': 'none','-moz-user-select': 'none','-ms-user-select': 'none','user-select': 'none','outline-style':'none','padding-right':'5px','padding-left':'5px','font-weight':'900'}));
        }
      }
     
     
      this.sort= function(columnIndex,direction) {
            var customSortFunction = null;
            if(this.metadata[columnIndex].customSortFunction != null)
                  customSortFunction =this.metadata[columnIndex].customSortFunction;
            if(null == customSortFunction) {
                  this.data.sort(function (a, b) {
                        if(typeof a.values[metadata[columnIndex].name] =='number') {                     
                              if (a.values[metadata[columnIndex].name] > b.values[metadata[columnIndex].name]) {
                                   return -1;
                              }
                              else if (a.values[metadata[columnIndex].name] < b.values[metadata[columnIndex].name]) {
                                   return 1;
                              }
                              return 0;
                        } else if(typeof a.values[metadata[columnIndex].name] =='string') {                    
                              return a.values[metadata[columnIndex].name].localeCompare(b.values[metadata[columnIndex].name]);
                        }
                  });
            } else {
                  this.data.sort(customSortFunction);
            }
            if(direction =='down') {
                  this.data.reverse();
            }    
            if(this.filterEnabled)       this.table.find("tr:gt("+(this.hStartIndex+1)+")").remove(); else      this.table.find("tr:gt("+(this.hStartIndex)+")").remove();
            this.fillData(); 
      }
     
      this.applyFilter = function(event) {
                        event.data.filter(event.data);
      }
     
      this.filter = function(tableInstance) {
                  var rawData = [];
                  rawData = tableInstance.originalData;
                  var filteredData = [];
                  tableInstance.filtered = false;
                  var filters =  [];
                  for(var i = 0;i<tableInstance.filterRow.length;i++){
                        if(tableInstance.filterRow[i].val()!="")
                              filters.push(tableInstance.filterRow[i]);
                  }
     
                  if(filters == null || filters.length== 0) {
                        filteredData = tableInstance.clone(tableInstance.originalData);
                  }
                  else {
                        tableInstance.filtered = true;
                        for(var i = 0; i< rawData.length;i++) {
                              var rowIsOk = true;
                              for(var k=0; k<filters.length;k++) {
                                    if((rawData[i].values[filters[k].attr('filterKey')]+'').indexOf(filters[k].val()) <0) {
                                         rowIsOk = false;
                                         break;
                                   }    
                              }
                              if(rowIsOk) {
                                   filteredData.push(rawData[i]);
                              }
                        }
                  }
                  tableInstance.data = filteredData;
                       
                  tableInstance.pageIndex = 0;
                  if(tableInstance.filterEnabled)       tableInstance.table.find("tr:gt("+(tableInstance.hStartIndex+1)+")").remove(); else      tableInstance.table.find("tr:gt("+(tableInstance.hStartIndex)+")").remove();
                  if(tableInstance.pagesize!= null) {
                              tableInstance.pageCount =  Math.ceil(tableInstance.data.length/tableInstance.pagesize);
                  }
                 
                  var tableSorted = false;
                 
                 
                  tableInstance.table.find("th div div[sortDirection]").each(function(){if($(this).attr('sortDirection')!='none'){tableSorted = true; tableInstance.sort($(this).attr('sortId'),$(this).attr('sortDirection'))}});
                 
                  if(!tableSorted)
                        tableInstance.fillData();    
      }
     
      this.appendRow= function(rowData) {
           
            var rawData = this.originalData;
            if(rowData instanceof Array){
                  for(var i=0;i<rowData.length;i++){
                        rawData.push(rowData[i]);
                  }
            }
            else {
                  rawData.push(rowData);
            }
            this.table.find("th").each(function(){$($(this).find('div div')[1]).text('');
            $($(this).find('div div')[0]).attr('sortDirection','none');});
            this.data = this.clone(rawData);//this.clone(rawData);
            this.pageIndex = 0;
            if(this.filterEnabled) this.table.find("tr:gt("+(this.hStartIndex+1)+")").remove(); else      this.table.find("tr:gt("+(this.hStartIndex)+")").remove();
            if(this.pagesize!= null) {
                        this.pageCount =  Math.ceil(this.data.length/this.pagesize);
            }
            if(this.filterEnabled)
                  this.filter(this);
            else
                  this.fillData();
      }
     
      this.removeRow= function(id) {
           
            var rawData = this.clone(this.originalData);
            var indexToRemove;
            for(var i=0;i<rawData.length;i++){
                  if(rawData[i].id == id) {
                        indexToRemove = i;
                        break;
                  }
            }
			if(rawData.length==1 && indexToRemove==0) {
				rawData = [];
			} else if(indexToRemove)
                  rawData.splice(indexToRemove,1);
            else
                  return;
           
            this.table.find("th").each(function(){$($(this).find('div div')[1]).text('');$($(this).find('div div')[0]).attr('sortDirection','none');});
            this.data = rawData;
            this.originalData = this.clone(this.data);
            this.pageIndex = 0;
            if(this.filterEnabled) this.table.find("tr:gt("+(this.hStartIndex+1)+")").remove(); else      this.table.find("tr:gt("+(this.hStartIndex)+")").remove();
            if(this.pagesize!= null) {
                        this.pageCount =  Math.ceil(this.data.length/this.pagesize);
            }
            if(this.filterEnabled)
                  this.filter(this);
            else
                  this.fillData();
      }
}