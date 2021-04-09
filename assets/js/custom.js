(function($) {
    $(document).ready(function() 
    {  
        
        $.get('data/data.json', function(res) 
        {
            $('#ba-table-id').baTable({
                title   : "Demo Table",
                data    : res,
                keys    : ['id',"name","job_title","gender","birth_year","country","company","selary"],
                print   : true
            });
        });
        
    });
})(jQuery)