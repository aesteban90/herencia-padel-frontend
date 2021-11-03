import React, {Component} from 'react';
import FacturasForm from './facturas-form.component';
import { convertMiles } from '../../../utils/utils';
import { pagosListDetalle } from '../pagos/pagos-list.component';

export default class FacturasList extends Component{
    constructor(props){
        super(props);
        this.state = {
            reserva: {},
            datos: [],
            loading: true,
        }
        this.datalist = this.datalist.bind(this);
    }

    componentDidUpdate(){
        if(this.state.datos.length === 0 && pagosListDetalle.length > 0){
            this.setState({
                datos: pagosListDetalle,
                loading: false
            }) 
        }
    }
    componentDidMount(){
        this.setState({
            reserva: this.props.reserva
        }) 
    }

    updateData = (jsondatos) => {this.setState({idUpdate: jsondatos._id})}
    createData = (id) => {this.setState({idUpdate: id})}

    datalist(){
        if(this.state.datos){
            let ids = [];
            let groupByItem = [];
            document.querySelectorAll('#facturacheck:checked').forEach(item => {ids.push(item.value)})
            let subtotal_iva10incluido = 0
            let subtotal_iva5incluido = 0
            let subtotal_excentas = 0
            let total_pagar = 0;
            let total_iva5 = 0;
            let total_iva10 = 0;
            let total_iva = 0;

            this.state.datos.map(dato => {
                if(ids.includes(dato._id)){                    
                    let id = '';
                    let idPago = dato._id;
                    let descripcion = ''; 
                    let cantidad = parseInt(dato.cantidad);
                    let precioUnitario = parseInt(dato.precio_unitario.replace(/\./gi,''));
                    let excentas = 0;
                    let iva5incluido = 0;
                    let iva10incluido = parseInt(dato.precio_total.replace(/\./gi,''));
                    let group = true;

                    if(dato.cancha){
                        id =  dato.cancha._id
                        descripcion = dato.cancha.descripcion;          
                    }else{
                        id = dato.producto._id;
                        descripcion = dato.producto.descripcion;
                    }

                    groupByItem.map(item => {              
                        if(item.id === id){
                            if(dato.cancha){
                                item.cantidad = 1;
                                item.precioUnitario += precioUnitario;
                                item.iva10incluido = item.precioUnitario;
                                group = false; 
                            }else{                                
                                item.cantidad += cantidad;
                                item.precioUnitario = precioUnitario;
                                item.iva10incluido += iva10incluido;                                 
                                group = false;
                            }
                        }
                    })
                    
                    //######### Calculando los subtotales ############
                    subtotal_iva10incluido += iva10incluido;
                    subtotal_iva5incluido += iva5incluido;
                    subtotal_excentas += excentas;

                    if(group){
                        groupByItem.push({
                            id, 
                            idPago,
                            descripcion,
                            precioUnitario,
                            cantidad,
                            excentas,
                            iva5incluido,
                            iva10incluido
                        })
                    }
                }
            })

           //######### Calculando los totales ############
           total_pagar = subtotal_iva10incluido + subtotal_iva5incluido + subtotal_excentas;
            //######### Calculando liquidacion IVA ############
            total_iva5 = subtotal_iva5incluido - (subtotal_iva5incluido / 1.05);
            total_iva10 = subtotal_iva10incluido / 11;
            total_iva = total_iva5 + total_iva10;

            let table = groupByItem.map(dato => {                
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
                    <td className="text-right">{convertMiles(subtotal_excentas)}</td>
                    <td className="text-right">{convertMiles(subtotal_iva5incluido)}</td>
                    <td className="text-right">{convertMiles(subtotal_iva10incluido)}</td>
                </tr>)
            table.push(
                <tr key='totales'>
                    <th colSpan={5}>Total a Pagar</th>
                    <th className="text-right">{convertMiles(total_pagar)}</th>
                </tr>
            )
            table.push(
                <tr key='liquidacion'>
                    <th>IVA 5%</th>
                    <td>{convertMiles(total_iva5)}</td>
                    <th>IVA 10%</th>
                    <td>{convertMiles(total_iva10)}</td>
                    <th>Total IVA</th>
                    <td>{convertMiles(total_iva)}</td>
                </tr>
            )

            return table
        }
    }
    render(){       
        return(            
            <div className="row">
                <div className="col-md-8 row">
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
                <div className="col-md-4">
                    <FacturasForm reserva={this.state.reserva}/>
                </div>
            </div>            
        )
    }
}