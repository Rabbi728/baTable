/*!
 * baTable Version v1.2.1 (https://github.com/Rabbi728/baTable)
 *
 * Author By Rabbi Ahamed
 * Email : RabbiAhamed0728@gmail.com 
 *
 * (Bootstrap and proper) Or (Bootstrap.Bundle) Is Required For Use This Plugin
 */

(function($){
    $(document).ready(function(){

        $.fn.baTable = function(param) 
        {
            el      = $(this);
            title   = param.title;

            let printButton = ``;
            if(param.print){
                printButton = `<div class="col-12 my-2">
                        <button id="baTable-Print" class="btn btn-sm btn-success float-right mr-2">Print</button>
                    </div>`;
            }
            
            if(el.parent(".row").length > 0){
                el.parent(".row").html(`${printButton}
                                        <div class="col-12">
                                            <div id="baTable-mainArea">
                                                ${el.parent().html()}
                                            </div>
                                        </div>`);
            }
            else{
                alert('The parent class of this table is not row');
            }

            el = $("#baTable-mainArea").find('table');

            let optionbar = `<div class="baTable-optionbar p-2 d-none">
                            </div>`;

            $("#baTable-mainArea").append(optionbar);
            
            if (param.data != undefined && param.keys != undefined) {
                $.each(param.data, function(i, v){
                    let tr = `<tr width="100%">`;
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
            
            el.find('thead th').not('[width]').attr("width",`${col_size.toFixed(2)}%`);
                        
            el.find('thead').prepend(`<tr width="100%" style="background: #fff; font-size: 10px; color : #000;">
                                <th width="100%" colspan="${param.keys.length}">
                                    <span class="baTable-option float-left mr-2"></span><big class="float-left">${param.title}</big> <big class="float-right">DATE : ${get_timestamp('mysql')}</big>
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

            input_tr += `<tr width="100%">`;
            tfoot_tr += `<tr width="100%">`;
            for (let input = 0; input < thead.length; input++) 
            {
                $(thead[input]).addClass('baTable-head')
                let 
                    field = '';
                    this_col_size = $(thead[input]).attr('width');

                if ($(thead[input]).attr('filter') == 'true') {
                    field = `<input type="text" data-col="${input}" class="form-control form-control-sm baTable-search">`
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

            $(document).on('keyup', '.baTable-search', ba_table_search);
            $(document).on('change', '.baTable-search', ba_table_search);
            $(document).on('click', '.baTable-option', generate_col_checkboxes);
            $(document).on('click', '.form-check-input.tbl-head', select_cols);
            $(document).on('click', '.baTable-head', sorting); 
            $(document).on('click', '#baTable-Print', printData); 

            $('body').click(function(event){
                if ($(event.target).parent('#baTable-mainArea .baTable-optionbar, #baTable-mainArea .baTable-optionbar .form-group').length == 0) {
                    $('.baTable-optionbar').addClass('d-none');
                }
            });            
     
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
            let select  = `<select class="form-control form-control-sm baTable-search" data-col="${index-1}">`;
                select  += `<option value="">Choose</option>`;
            for (const key in unique_data) {
                select += `<option value="${unique_data[key]}">${unique_data[key]}</option>`
            }
            select += `</select>`
            return select;
        }

        function sorting() 
        {
            let 
                index       = $(this).index(),
                trs         = el.find(`tbody tr`),
                sort_attr   = $(this).attr('sort');

            if (sort_attr == undefined || sort_attr == 'asc')
            {
                trs.sort(function(a, b) 
                {
                    let 
                        a_val = $(a).find(`td:nth-child(${index + 1})`).text(),
                        b_val = $(b).find(`td:nth-child(${index + 1})`).text();

                    if (a_val < b_val) {return -1;}
                    if (a_val > b_val) {return 1;}
                    return 0;
                });
                $(this).attr('sort', 'desc');
            }
            else if (sort_attr == 'desc')
            {
                trs.sort(function(a, b) 
                {
                    let 
                        a_val = $(a).find(`td:nth-child(${index + 1})`).text(),
                        b_val = $(b).find(`td:nth-child(${index + 1})`).text();

                    if (a_val < b_val) {return 1;}
                    if (a_val > b_val) {return -1;}
                    return 0;
                });
                $(this).attr('sort', 'asc');
            }
            
            el.find('tbody').html(trs);
        }

        function ba_table_search() 
        {
            let 
                search_area     = el.find('tbody tr'),
                columns         = [];
 
            $.each($('.baTable-search'), function(i, v)
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
                                    <tr width="100%" class="not-fount-tr">
                                        <th class="w-100">
                                            <h4 class="text-center w-100">
                                                Data Not Found !
                                            </h4>
                                        </th>
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
                <div class="form-group form-check m-0 ml-2">
                    <input type="checkbox" class="form-check-input tbl-head" id="checkbox-${indx}" data-col-index="${i}" ${chk} ${lock}>
                    <label class="form-check-label" for="checkbox-${indx}">${col.text()} &nbsp;<span class="text-muted">${col.prop('title')}</span></label>
                </div>
            `;
        });
        
        let 
            offset_top  = $('#baTable-mainArea .baTable-option').offset().top,
            offset_left = $('#baTable-mainArea .baTable-option').offset().left;
            
        $('#baTable-mainArea').find('.baTable-optionbar').css({"top" : (offset_top + 20), "left" : (offset_left + 10)});
        $('#baTable-mainArea').find('.baTable-optionbar').html(html).removeClass('d-none');
        // $('#ColSelect').modal('show');
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

    function printData()
    {
        let selector = $('#baTable-mainArea').find('table');

        newWin= window.open("","_blank");
        let html = `
                    <!DOCTYPE html>
                    <html>
                        <head>
                        <title>${title}</title>
                        <style>
                                table {
                                    border-collapse: collapse;
                                    text-align: center;
                                    margin : 0 auto;
                                }
                                table td, table th {
                                    border: 1px solid #000;
                                }
                                h1 {text-align: center;}
                                h5 {text-align: center;}
                                h3 {text-align: center;}
                                th, td{
                                    width: auto
                                }
                                .d-none{
                                    display: none;
                                }
                                table thead tr:nth-child(3)
                                {
                                    display: none !important;
                                }

                                table thead tr:nth-child(2)
                                {
                                    color: #000;
                                }

                                table tbody td{
                                    white-space: normal;
                                }
                                table thead tr:nth-child(1) big.float-left{
                                    float: left;
                                }
                                table thead tr:nth-child(1) big.float-right{
                                    float: right;
                                }
                                @media print {
                                    @-moz-document url-prefix() {
                                        table {
                                            border-collapse: unset;
                                        }
                                    }
                                }
                            </style>
                        </head>
                        <body>

                        <h1>${selector.attr('pdfTitle')}<h1>
                        <h5>${selector.attr('pdfDes')}</h5>
                        <h3> ${title} </h3>
                        ${selector.parent().html()}

                        </body>
                    </html>`;
        newWin.document.write(html);
        newWin.print();
        newWin.close();
    }

    });
})(jQuery)