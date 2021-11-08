import React, { Component } from 'react';
import axios from 'axios';
import { convertMiles } from '../../../../utils/utils';
import companyLogo from '../../../../imagens/Herencia-padel-white.png';
import moment from 'moment';
const configData = require('../../../../config.json');

export default class FacturaImpresion extends Component{
    constructor(props){
        super(props);
        this.state = {
            factura: {}
        }
        this.datalist = this.datalist.bind(this);
    }
    
    async componentDidMount(){
        //Obtener los datos de la factura
        if(this.state.factura !== undefined){
            await axios.get(configData.serverUrl + "/facturas/"+this.props.match.params.id)
                .then(response => {
                    const factura = response.data;
                    this.setState({
                        factura: factura
                    })
                })
                .catch(err => console.log(err));

            document.querySelector('.direccion').innerHTML = this.state.factura.cabecera_datos_direccion;
        }
    }

    datalist(){   
        if(this.state.factura.productos){
            let table = this.state.factura.productos.map(dato => {                
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
                    <td className="text-right">{convertMiles(this.state.factura.subtotal_excentas)}</td>
                    <td className="text-right">{convertMiles(this.state.factura.subtotal_iva5incluido)}</td>
                    <td className="text-right">{convertMiles(this.state.factura.subtotal_iva10incluido)}</td>
                </tr>)
            table.push(
                <tr key='totales'>
                    <th colSpan={5}>Total a Pagar</th>
                    <th className="text-right">{convertMiles(this.state.factura.total_pagar)}</th>
                </tr>
            )
            table.push(
                <tr key='liquidacion'>
                    <th>IVA 5%</th>
                    <td>{convertMiles(this.state.factura.total_iva5)}</td>
                    <th>IVA 10%</th>
                    <td>{convertMiles(this.state.factura.total_iva10)}</td>
                    <th>Total IVA</th>
                    <td>{convertMiles(this.state.factura.total_iva)}</td>
                </tr>
            )
            return table
        }
    }
    render(){       
        let fecha_facturado = moment(new Date(this.state.factura.createdAt)).format("DD-MM-YYYY") ;
        
        return(            
            <div className="container mt-4">
                <div className="col-md-12 row">
                    <div className="card col-md-7">
                        <div className="col-md-12 pt-2">
                            <div>
                                <img src={companyLogo} style={{width:'120px',position:'absolute', left:'400px'}} alt="Herencia Padel"/>
                            </div>
                            <b>{this.state.factura.cabecera_datos_titulo}</b><br/>
                            <u>{this.state.factura.cabecera_datos_subtitulo}</u><br/>
                            <span className=" direccion"></span>
                        </div>              
                    </div>
                    <div className="card col-md-5 pt-2">                         
                        <div className="col-md-12 text-center">
                            <b>TIMBRADO N° {this.state.factura.cabecera_timbrado}</b><br/>
                            Fecha Inicio de Vigencia {this.state.factura.cabecera_vigencia_inicio}<br/>
                            Fecha Fin de Vigencia {this.state.factura.cabecera_vigencia_fin}<br/>
                            <b>RUC {this.state.factura.cabecera_ruc}</b><br/>
                            <b>FACTURA {this.state.factura.cabecera_factura}</b>
                        </div>                           
                    </div>
                    
                    <div className="card col-md-12">                        
                        <table className="table">
                            <thead>
                                <tr>
                                    <td colSpan='3'><b>Fecha:</b> {fecha_facturado}</td>
                                    <td colSpan='3'><b>Condicion de Venta:</b> Contado <b>X</b> - Credito</td>
                                </tr>
                                <tr>
                                    <td colSpan='3'><b>Nombre:</b> {this.state.factura.cliente_razon_social}</td>
                                    <td colSpan='3'><b>Ruc:</b> {this.state.factura.cliente_ruc}</td>
                                </tr>
                                <tr>
                                    <td colSpan='3'><b>Direccion:</b> Itaipu 548 c/ Herminio peralta</td>
                                    <td colSpan='3'><b>Telefono:</b> 0987-544-666</td>
                                </tr>
                                <tr>
                                    <th style={{width:'10px'}}>Cant</th>
                                    <th >Descripcion</th>
                                    <th style={{width:'130px'}} >Precio Unitario</th>
                                    <th style={{width:'120px'}} className="text-right">Excentas</th>
                                    <th style={{width:'120px'}} className="text-right">5%</th>
                                    <th style={{width:'120px'}} className="text-right">10%</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.datalist()}                                
                            </tbody>
                        </table>                     
                    </div>
                </div>
            </div>            
        )
    }
}