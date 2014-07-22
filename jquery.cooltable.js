function CoolTable(placeholder, metadata, data,tableclassname,pagesize,rowsettings) {

	this.placeholder = placeholder;
	this.metadata = metadata;
	this.data = data;
	this.pagesize = pagesize;
	this.paginated = false;
	this.pageIndex = 0;
	this.table = null;
	this.pageCount = 0;
	this.originalData = JSON.parse(JSON.stringify(data));
	this.rowsettings = rowsettings;
	this.filterEnabled = false;
	this.filtered = false;
	this.tableclassname =tableclassname;
	
	this.drawTable= function () {
		this.table = $('<table></table>').attr('class',tableclassname);
		$('#'+this.placeholder).append(this.table);
		var hRow = $('<tr></tr>');
		var paginated = false;
		

		
		if(this.pagesize!= null) {
			this.paginated = true;
			this.pageCount =  Math.ceil(this.data.length/this.pagesize);
		}
		var tableInstance = this;
		for(var headerIndex=0; headerIndex<this.metadata.length;headerIndex++) {
			var sortIndex = headerIndex.toString();
			hRow.append($('<th></th>').append($('<div></div>').css({'text-align':'center','width':'100%','display':'table-row'}) /*this.metadata[headerIndex].headerStyle.width*/
			.append($('<div></div>').append('').css({'display':'table-cell','height':'15px','cursor':'pointer','vertical-align':'middle','min-width':'100%','text-align':'center'}).append(this.metadata[headerIndex].label)
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
							tableInstance.data = JSON.parse(JSON.stringify(tableInstance.originalData));
							if(tableInstance.filtered) {
								tableInstance.filter(tableInstance);
							} else {
								if(tableInstance.filterEnabled) 	tableInstance.table.find("tr:gt(1)").remove(); else	tableInstance.table.find("tr:gt(0)").remove();
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
			fRow.append($('<td></td>')
				.append((this.metadata[filterIndex].filterable!=null)?$('<input type="text">').css({'box-sizing':($.browser.msie)?'border-box':'','width':'100%','height':'auto'}).bind('keyup input paste',this,this.applyFilter).attr('filterKey',this.metadata[filterIndex].name):''));
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
		if(this.filterEnabled) 	this.table.find("tr:gt(1)").remove(); else	this.table.find("tr:gt(0)").remove();
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
		
		
		
		if(this.paginated == true && this.pageCount!=0) {
			var tableInstance = this;
			var first = null;
			if(this.pageIndex !=0)
				first = $('<span></span>').click(function() {tableInstance.changePage(tableInstance.pageIndex-1)}).text('<<   ').css({"font-weight":'bold',"cursor":"pointer","min-width":"15px"});
			else
				first = $('<span></span>').text('<<  ').css({"font-weight":'bold',"min-width":"15px","visibility":"hidden"});
			var last = null;
			if(this.pageIndex !=this.pageCount-1)
				last = $('<span></span>').click(function() {tableInstance.changePage(tableInstance.pageIndex+1)}).text('   >>').css({"font-weight":'bold',"cursor":"pointer","min-width":"15px"});
			else
				last = $('<span></span>').append('  >>').css({"font-weight":'bold',"min-width":"15px","visibility":"hidden"});
			this.table.append($('<tr></tr>').append($('<td></td>').attr('colspan',this.metadata.length).append(first).append($('<span>').css({"font-weight":'bold',"min-width":"40px"}).append((this.pageIndex+1)+'/'+this.pageCount)).append(last)).attr('class',this.tableclassname+'Paginator'));
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
		if(this.filterEnabled) 	this.table.find("tr:gt(1)").remove(); else	this.table.find("tr:gt(0)").remove();
		this.fillData();	
	}
	
	this.applyFilter = function(event) {
				event.data.filter(event.data);
	}
	
	this.filter = function(tableInstance) {
		var rawData = JSON.parse(JSON.stringify(tableInstance.originalData));
				var filteredData = [];
				tableInstance.filtered = false;
				for(var i = 0; i< rawData.length;i++) {
					var rowIsOk = true;
					var filters = $(tableInstance.table.find("tr")[1]).find('td');
					for(var k=0; k<filters.length;k++) {
						if($(filters[k]).find(':input').length == 0)
							continue;
						else
							tableInstance.filtered = true;
						if(rawData[i].values[$($(filters[k]).find(':input')[0]).attr('filterKey')].indexOf($($(filters[k]).find(':input')[0]).val()) <0) {
							rowIsOk = false;
							break;
						}	
					}
					if(rowIsOk) {
						filteredData.push(rawData[i]);
					}
					
				}
				tableInstance.data = filteredData;
					
				tableInstance.pageIndex = 0;
				if(tableInstance.filterEnabled) 	tableInstance.table.find("tr:gt(1)").remove(); else	tableInstance.table.find("tr:gt(0)").remove();
				if(tableInstance.pagesize!= null) {
						tableInstance.pageCount =  Math.ceil(tableInstance.data.length/tableInstance.pagesize);
				}
				
				var tableSorted = false;
				
				
				tableInstance.table.find("th div div[sortDirection]").each(function(){if($(this).attr('sortDirection')!='none'){tableSorted = true; tableInstance.sort($(this).attr('sortId'),$(this).attr('sortDirection'))}});
				
				if(!tableSorted)
					tableInstance.fillData();	
	}
	


}