export function getDiv(numero){
    let numero_al = numero.trim().replaceAll('.','');
    let total = 0;
    let k = 2;
    for (let index = numero_al.length-1; index >= 0; index--){
        const element = numero_al[index];
        total += parseInt(element) * k;
        k++; 
    }
    let resto = total % 11;
    let digito = 0;
    if(resto > 1){
        digito = 11 - resto 
    }else{
        digito = 0 
    }
    return digito;
}

export function convertMiles(nStr) {
    nStr += '';
    var x = nStr.split('.');
    var x1 = x[0];
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1.$2');
    }
    
    return ( x1 === 'null' ? '' : x1);
}
