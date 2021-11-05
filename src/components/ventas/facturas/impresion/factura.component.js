import React, {Component} from 'react';
import FacturasForm from './facturas-form.component';
import { convertMiles } from '../../../utils/utils';
import { pagosListDetalle } from '../pagos/pagos-list.component';

export default class FacturaImpresion extends Component{
    constructor(props){
        super(props);
        this.state = {}
        this.datalist = this.datalist.bind(this);
    }

    componentDidMount(){
       //Obtener los datos de la factura
    }

    datalist(){
        if(this.state.datos){
            let table = this.state.groupByItem.map(dato => {                
                return (
                    <tr key={dato.id}>
                        <td>{dato.cantidad}</td>
                        <td>
                            {dato.descripcion}
                        </td>
                        <td>{convertMiles(dato.precioUnitario)}</td>
                        <td className="text-right">{convertMiles(dato.excentas)}</td>
                        <td className="text-right">{convertMiles(dato.iva5incluido)}</td>
                        <td className="text-right">{convertMiles(dato.iva10incluido)}</td>
                    </tr>
                )
            })
            
            table.push(
                <tr className="subtotales" key='subtotales'>
                    <th colSpan={3}>Subtotales</th>
                    <td className="text-right">{convertMiles(this.state.subtotal_excentas)}</td>
                    <td className="text-right">{convertMiles(this.state.subtotal_iva5incluido)}</td>
                    <td className="text-right">{convertMiles(this.state.subtotal_iva10incluido)}</td>
                </tr>)
            table.push(
                <tr key='totales'>
                    <th colSpan={5}>Total a Pagar</th>
                    <th className="text-right">{convertMiles(this.state.total_pagar)}</th>
                </tr>
            )
            table.push(
                <tr key='liquidacion'>
                    <th>IVA 5%</th>
                    <td>{convertMiles(this.state.total_iva5)}</td>
                    <th>IVA 10%</th>
                    <td>{convertMiles(this.state.total_iva10)}</td>
                    <th>Total IVA</th>
                    <td>{convertMiles(this.state.total_iva)}</td>
                </tr>
            )
            return table
        }
    }
    render(){       
        return(            
            <div className="row">
                <div className="col-md-12 row">
                    <div className="card col-md-7 factura_cabecera">
                        <div className="col-md-12">
                            <b>EMEVA S.R.L.</b><br/>
                            <u>ACTIVIDADES DE DIVERSION Y ENTRETENIMIENTO</u><br/>
                            <span className="factura_cabecera">
                                Calle: Paso de Patria 848 c/ Av. Bruno Guggiari - Lambare, Central<br/>
                                Sucursal 1: San Estanislao e/ Yuty y Carmen del Parana - Lambare, Central<br/>
                                Celulares: (0984) 919 991 / (0981) 203 966 <b>emevasrl@gmail.com</b>
                            </span>
                        </div>              
                    </div>
                    <div className="card col-md-5 factura_cabecera">                         
                        <div className="col-md-12 text-center">
                            <b>TIMBRADO N° 15180240</b><br/>
                            Fecha Inicio de Vigencia 19-10-2021<br/>
                            Fecha Fin de Vigencia 31-10-2022<br/>
                            <b>RUC 80117565-8</b><br/>
                            <b>FACTURA 002 001</b>
                        </div>                           
                    </div>
                    <div className="card col-md-12">                        
                        <table className="table">
                            <thead>
                                <tr>
                                    <th scope="col">Cant</th>
                                    <th >Descripcion</th>
                                    <th >Precio Unitario</th>
                                    <th className="text-right">Excentas</th>
                                    <th className="text-right">5%</th>
                                    <th className="text-right">10%</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                   this.state.datos.length === 0 ?
                                        <tr><td colSpan={6} className="text-center">Sin registros encontrados</td></tr>
                                    :
                                        this.datalist()
                                }
                            </tbody>
                        </table>                     
                    </div>
                </div>
            </div>            
        )
    }
}