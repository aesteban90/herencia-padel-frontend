import { registerLocale, setDefaultLocale } from  "react-datepicker";
import es from "date-fns/locale/es";
import buildLocalizeFn from 'date-fns/locale/_lib/buildLocalizeFn';
  
  const dayValues = {
    narrow: ["D","L", "M", "М", "J", "V", "S"],
    abbreviated: [
      "Do",
      "Lu",
      "Ma",
      "Mi",
      "Ju",
      "Vi",
      "Sa"
    ],
    wide: [
      "Domingo",
      "Lunes",
      "Martes",
      "Miercoles",
      "Jueves",
      "Viernes",
      "Sabado"
    ]
  };

  const monthValues = {
    narrow: ["E", "F", "М", "А", "М", "J", "J", "A", "S", "О", "N", "D"],
    abbreviated: [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Oct",
      "Nov",
      "Dic"
    ],
    wide: [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Setiembre",
      "Octubre",
      "Noviembre",
      "Diciembre"
    ]
  };
  
  es.localize.month = buildLocalizeFn({
    values: monthValues,
    defaultWidth: 'wide',
    defaultFormattingWidth: 'wide'
  });

  es.localize.day = buildLocalizeFn({
    values: dayValues,
    defaultWidth: 'abbreviated',
    defaultFormattingWidth: 'abbreviated'
  });

registerLocale('esp',es);
setDefaultLocale('esp');
