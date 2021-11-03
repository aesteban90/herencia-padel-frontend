$( document ).ready(function() {    
    verifySearch();
});
var counter = 0;
function verifySearch(){
    counter++;
    if(counter > 5)return null;

    setTimeout(function(){
        console.log('Search',$(".inputsearch").length)    
        if($(".inputsearch").length){
            addEventSearch();
            counter = 0;
        }else{
            verifySearch();
        } 
    }, 500);
}

function addEventSearch(){
    $(".inputsearch").on("keyup", function() {
        var value = $(this).val().toLowerCase();    
        if(value != ""){
            if(value.length >2 ){
                $(".list-group-item").filter(function() {
                    $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
                });
                $(".pagination").css('display','none');
            }
        } else {
            $('.nav-pagination').remove();
            paginar("list-group","list-group-item");
        }
    });
}

function paginar(classUL,classList,refresh){
    let page = 1;
    if(refresh){
        if(document.querySelector('.page.active>a')){
            page = parseInt(document.querySelector('.page.active>a').innerText);
        }
        $('.nav-pagination').remove();
    }

    if(document.querySelectorAll('.list-group-item:not([style*="display: none"])').length == 0){
        if(page > 1) page--;
    }

    if($('.nav-pagination').length === 0 ){
        var perPageCalc = 8;
        var limitPaginationCalc = 8;
        var doubleCalc = $('.'+classList).length / perPageCalc ;
        var intCalc = parseInt(""+doubleCalc ) ;
        var paginationCalc = (doubleCalc > intCalc ? intCalc +1 : intCalc );
        limitPaginationCalc = (paginationCalc < limitPaginationCalc ? paginationCalc : limitPaginationCalc  );
        
        $('.'+classUL).paginathing({
            perPage: perPageCalc ,
            currentPage: page,
            limitPagination: limitPaginationCalc ,
            firstText: 'Inicio',
            lastText: 'Último',
            pageText: 'Página',
            containerClass: 'nav-pagination text-center',
            pageNumbers: true
        });
    }
}
