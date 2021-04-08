
/*!
 * BA Table Version v1.0 (https://gitlab.com/rabbi728/ba-table)
 *
 * Author By Rabbi Ahamed
 * Email : RabbiAhamed0728@gmail.com 
 *
 * Bootstrap Is Required For Use This Plugin
 */

(function($){
    $(document).ready(function(){

        $.fn.baTable = function(param) 
        {
            el  = $(this);
            
            if (param.data != undefined && param.keys != undefined) {
                $.each(param.data, function(i, v){
                    let tr = `<tr>`;
                    $.each(param.keys, function(i2, v2) {
                        tr += `<td>${v[v2]}</td>`;
                    });
                    tr +=`</tr>`;
                    el.find('tbody').append(tr);
                });
            }
            
            let 
                thead           = el.find('thead th'),
                pre_def_count   = 0,
                pre_def_size    = 0,
                thead_bg        = el.find('thead').attr('bg'),
                thead_text      = el.find('thead').attr('text'),
                tfoot_bg        = el.find('tfoot').attr('bg'),
                tfoot_text      = el.find('tfoot').attr('text'),
                input_tr        = ``;
                tfoot_tr        = ``;

            el.addClass('table table-sm table-bordered table-hover');

            $.each(el.find('thead th[width]'), function(i, v) {
                pre_def_count++
                pre_def_size += parseInt($(v).attr('width'));
            });

            let col_size    = (100 - pre_def_size) / (thead.length - pre_def_count);
            
            el.find('thead th').not('[width]').attr("width",`${col_size}%`);
                        
            el.find('thead').prepend(`<tr width="100%" style="background: #fff; font-size: 10px; color : #000;">
                                <th width="100%">
                                    <big class="float-left">${param.title}</big> <big class="float-right">DATE : ${get_timestamp('mysql')}</big>
                                </th>
                            </tr>`);

            if (thead_bg == undefined) 
            {
                el.find('thead').addClass('bg-dark text-white text-center');
            }
            else
            {
                el.find('thead').addClass(`${thead_bg} ${thead_text} text-center`);
            }

            if (tfoot_bg == undefined) 
            {
                el.find('tfoot').addClass('bg-dark text-white text-center');
            }
            else
            {
                el.find('tfoot').addClass(`${tfoot_bg} ${tfoot_text} text-center`);
            }

            input_tr += `<tr>`;
            tfoot_tr += `<tr>`;
            for (let input = 0; input < thead.length; input++) 
            {
                let 
                    field = '';
                    this_col_size = $(thead[input]).attr('width');

                if ($(thead[input]).attr('filter') == 'true') {
                    field = `<input type="text" data-col="${input}" class="form-control form-control-sm ba-table-search">`
                }
                else if ($(thead[input]).attr('filter') == 'select') {
                    field = select_filter(input + 1);
                }
                input_tr += `<th width="${this_col_size}">${field}</th>`;
                $(el.find(`tbody tr td:nth-child(${input + 1})`)).attr("width",this_col_size);

                tfoot_tr += `<td width="${this_col_size}">${summary_decision(thead[input], (input + 1))}</td>`;
            }
            tfoot_tr += `</tr>`;
            input_tr += `</tr>`;

            el.find('thead').append(input_tr);
            el.find('tfoot').html(tfoot_tr);

            el.find('thead, tbody, tfoot').css({"display" : "block", "overflow-y" : "scroll"});
            el.find('tr').css({"width": "100%", "display": "flex"});
            el.find('th, td').css({"flex-grow": "2"});
            el.find('tbody').css({"max-height": "60vh"});

            let modal  =    `<div id="ColSelect" class="modal fade" data-backdrop="static" data-keyboard="false" >
                                <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                                    <div class="modal-content">
                                        <div class="modal-header">
                                            <h5 class="modal-title">Column Selection</h5>
                                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                                <span aria-hidden="true">&times;</span>
                                            </button>
                                        </div>
                                        <div class="modal-body">
                                            <p>Modal body text goes here.</p>
                                        </div>
                                        <div class="modal-footer">
                                            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                                        </div>
                                    </div>
                                </div>
                            </div>`;

            if($('.container').length > 0){
                $('body').find('.container').append(modal);
            }
            else if($('.container-fluid').length > 0){
                $('body').find('.container-fluid').append(modal);
            }
            else{
                console.log('body not has any type of container');
            }

            $(document).on('keyup', '.ba-table-search', ba_table_search);
            $(document).on('change', '.ba-table-search', ba_table_search);
            $(document).on('dblclick', 'thead', generate_col_checkboxes);
            $(document).on('click', '.form-check-input.tbl-head', select_cols);
            
     
        };


        function select_filter(index) 
        {
            let 
                data            = el.find(`tbody tr td:nth-child(${index})`),
                unique_data     = [];
            for(let i=0; i<data.length; i++)
            {
                unique_data[$(data[i]).text()]=($(data[i]).text());
            }
            let select  = `<select class="form-control form-control-sm ba-table-search" data-col="${index-1}">`;
                select  += `<option value="">-- Choose --</option>`;
            for (const key in unique_data) {
                select += `<option value="${unique_data[key]}">${unique_data[key]}</option>`
            }
            select += `</select>`
            return select;
        }

        function ba_table_search() 
        {
            let 
                search_area     = el.find('tbody tr'),
                columns         = [];
 
            $.each($('.ba-table-search'), function(i, v)
            {
                if($(v).val().length > 0){
                    let data = {};
                    data.col_index = $(v).data('col');
                    data.col_value = $(v).val();
                    columns.push(data);
                }
            });

           $.each(search_area, function(index, row)
           {
               $(row).removeClass('d-none');
               $.each(columns, function(input_index, input_value)
               {
                   let 
                       el          = $(row).find('td').get(input_value.col_index),
                       el_result   = $(el).text().toLowerCase().indexOf(input_value.col_value.toLowerCase());
       
                  if(el_result == -1){
                       $(row).addClass('d-none');
                   }
               });
           });
           
           if(search_area.length == el.find('tbody tr.d-none').length)
           {
                let 
                   not_found_html = `
                                    <tr class="not-fount-tr" style="width: 100%; display: flex;">
                                        <td class="w-100">
                                            <h4 class="text-center w-100">
                                                Data Not Found !
                                            </h4>
                                        </td>
                                    </tr>
                                   `;
                el.find('tbody').append(not_found_html);
           }
           else
           {
               $('.not-fount-tr').remove();
           }

           let thead    = el.find('thead tr:nth-child(2) th');

           for (let input = 0; input < thead.length; input++) 
            {
                el.find(`tfoot tr td:nth-child(${input + 1})`).text(summary_decision(thead[input], (input + 1)));
            }


       }


    function select_cols()
    {
        let 
        el	= $(this),
        indx= parseInt(el.data('col-index'))+1,
        chk	= this.checked,
        colspan = parseInt($(`table:first>thead>tr:first-child>th:first-child`).attr('colspan'));

        if(chk)
        {
            $(`table>thead>tr:first-child>th:first-child`).attr('colspan',++colspan);
            $(`table>thead>tr:nth-child(2)>th:nth-child(${indx}), table>thead>tr:nth-child(3)>th:nth-child(${indx}), table>tfoot>tr>td:nth-child(${indx}), table>tbody>tr>td:nth-child(${indx})`).removeClass('d-none');
        }
        else
        {
            $(`table>thead>tr:first-child>th:first-child`).attr('colspan',--colspan);
            $(`table>thead>tr:nth-child(2)>th:nth-child(${indx}), table>thead>tr:nth-child(3)>th:nth-child(${indx}), table>tfoot>tr>td:nth-child(${indx}) , table>tbody>tr>td:nth-child(${indx})`).addClass('d-none');
        }
    }

    function generate_col_checkboxes()
    {
        let
        cols 	= $("table:first>thead>tr:nth-child(2)>th"),
        html	='';
        $.each(cols, function(i,v){
            let 
            col = $(v),
            indx= col.index(),
            chk = !col.hasClass('d-none') ? 'checked' : '',
            lock= col.hasClass('required') ? 'disabled' : '';
            
            html += `
                <div class="form-group form-check">
                    <input type="checkbox" class="form-check-input tbl-head" id="checkbox-${indx}" data-col-index="${i}" ${chk} ${lock}>
                    <label class="form-check-label" for="checkbox-${indx}">${col.text()} &nbsp;<span class="text-muted">${col.prop('title')}</span></label>
                </div>
            `;
        });
        
        $('#ColSelect .modal-body').html(html);
        $('#ColSelect').modal('show');
    }

    function get_timestamp(format=null)
	{
		let 
		ts		= {},
		xDateObj= new Date(),
		xYear 	= xDateObj.getFullYear(),
		xMonth 	= (xDateObj.getMonth() + 1),
		xDate 	= xDateObj.getDate(),
		xHour 	= xDateObj.getHours(),
		xMin 	= xDateObj.getMinutes(),
		xSec 	= xDateObj.getSeconds();
		if(xMonth<10)
			xMonth = '0'+xMonth;
		if(xDate<10)
			xDate = '0'+xDate;
		if(xHour<10)
			xHour = '0'+xHour;
		if(xMin<10)
			xMin = '0'+xMin;
		if(xSec<10)
			xSec = '0'+xSec;
		ts.mysql = xYear+'-'+xMonth+'-'+xDate+' '+xHour+':'+xMin+':'+xSec;
		ts.file = xYear+'-'+xMonth+'-'+xDate+'_'+xHour+'-'+xMin+'-'+xSec;
        
		if(format=='mysql')
			return ts.mysql;
		else if(format=='file')
			return ts.file;
		else
			return ts;
	}

    function summary_decision(thead, index) 
    {
        let summarytype = $(thead).attr('summarytype');
        
        if(summarytype == 'count')
        {
            return total_count(index);
        }  
        else if(summarytype == 'unique-count')
        {
            return unique_count(index);
        }  
        else if(summarytype == 'sum')
        {
            return sum(index);
        }  
        else
        {
            return '';
        }
    }

    function total_count(index) 
    {
        let el_not_d_none = el.find(`tbody tr`).not('.d-none');
        return el_not_d_none.find(`td:nth-child(${index})`).length;
    }

    function unique_count(index) 
    {
        let 
            el_not_d_none   = el.find(`tbody tr`).not('.d-none'),
            data            = el_not_d_none.find(`td:nth-child(${index})`),
            unique_data     = [];

        for(let i=0; i<data.length; i++)
        {
            unique_data[$(data[i]).text()]=($(data[i]).text());
        }
        return `[ ${Object.keys(unique_data).length} ]`;
    }

    function sum(index) 
    {
        let 
            el_not_d_none   = el.find(`tbody tr`).not('.d-none'),
            data            = el_not_d_none.find(`td:nth-child(${index})`),
            sum             = 0;

        for(let i=0; i<data.length; i++)
        {
            sum += parseFloat($(data[i]).text());
        }
        
        return sum.toLocaleString();
    }

    });
})(jQuery)