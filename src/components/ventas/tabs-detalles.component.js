import React, { Component} from 'react';
import { Tabs, Tab } from 'react-bootstrap';  
import { convertMiles } from '../../utils/utils.js';
import { usuarioLogueado } from '../../App';
import axios from 'axios';
import ConsumisionList from './consumision/consumision-list.component';
import PagosList from './pagos/pagos-list.component';
import FacturasList from './facturas/facturas-list.component.js';
const configuracion = require('../../config.json');

export default class TabsDetallesVentas extends Component{
    constructor(props){
        super(props);
        this.state = {
            keyTab:'detalles-ventas',
            updateTab: true,
            updateListPagos: true, 
            updateListConsumision: true,
            updateListFacturacion: true,
            nickname:'',
            nombre_completo:'',
            password:'',
            reserva: {},   
            det_total_monto: '',
            det_total_pagado:'',
            det_total_saldo:'',
            user_updated: usuarioLogueado.name
        }
    }
    actualizandoReserva = () => {
        //Actualizar la reserva al cerrar la pantalla
        const reserva = {
            total_monto: this.state.det_total_monto,
            total_pagado: this.state.det_total_pagado,
            total_saldo: this.state.det_total_saldo,
            user_updated: this.state.user_updated
        }
        axios.post(configuracion.serverUrl + '/reservas/update/'+this.state.reserva._id,reserva)
            .then(res => console.log('Reserva - Totales Actualizados'))
            .catch(err => console.log('Reserva - Totales Con Error', err));
    }
    async componentDidMount(){
        await this.getDataReserva()
        
        window.addEventListener('beforeunload', (event) => {
            // Cancel the event as stated by the standard.
            //event.preventDefault();
            // Chrome requires returnValue to be set.
            //event.returnValue = '';
          
            this.actualizandoReserva();
        });
    }
    setKey = (key) => {this.setState({keyTab: key, updateListPagos: true, updateListConsumision: true, updateListFacturacion: true})}
    
    getDataReserva = async () => {
        if(this.props.match.params.id){
            await axios.get(configuracion.serverUrl + "/reservas/"+this.props.match.params.id)
                .then(response => {this.setState({reserva: response.data})})
                .catch(err => console.log(err))
        }
    }
    updateDetallesMontos = async (consumisiones) => {        
        let detallesMontos = {total_saldo:0, total_pagado: 0, total_monto: 0}
       
        if(consumisiones !== undefined){
            await consumisiones.map(element => {
                
                detallesMontos.total_monto += parseInt(element.precio_total.replace(/\./gi,''));
                detallesMontos.total_pagado += parseInt(element.total_pagado.replace(/\./gi,''));
                detallesMontos.total_saldo += parseInt(element.saldo.replace(/\./gi,''));
            })            
        }else{
            let pagos =  await axios.get(configuracion.serverUrl + "/pagos/reserva/"+this.state.reserva._id)
            .then(datos => datos.data)
            .catch(err => undefined)

            let consumisiones =  await axios.get(configuracion.serverUrl + "/consumisiones/reserva/"+this.state.reserva._id)
                .then(datos => datos.data)
                .catch(err => undefined)
            
            await consumisiones.map(element => {
                let pagos_details = {total_pagado:0};
                pagos.map(pago => {
                    if(pago.consumision._id === element._id){ 
                        pagos_details.total_pagado += parseInt(pago.precio_total.replace(/\./gi,''));
                    }
                })

                detallesMontos.total_monto += parseInt(element.precio_total.replace(/\./gi,''));
                detallesMontos.total_pagado += pagos_details.total_pagado;
                detallesMontos.total_saldo += pagos_details.total_pagado - parseInt(element.precio_total.replace(/\./gi,''));
            })
        }

        this.setState({
            det_total_monto: convertMiles(detallesMontos.total_monto),
            det_total_pagado: convertMiles(detallesMontos.total_pagado),
            det_total_saldo: convertMiles(detallesMontos.total_saldo)
        })
        
    }
    detallesMontos = () => {        
        let saldoNegativo = (this.state.det_total_saldo.indexOf('-')>-1 ? {color:'red',fontWeight:'bold'} : undefined)
        return (
            <div className="col-md-3 details-consumision-tabs">
                <b>Total Monto:</b><span> {this.state.det_total_monto}Gs.</span><br/>
                <b>Total Pagado:</b><span> {this.state.det_total_pagado}Gs.</span><br/>
                <b>Total Saldo:</b><span style={saldoNegativo}> {this.state.det_total_saldo}Gs.</span><br/>
            </div>
        )
    }
    render(){       
        const reserva = this.state.reserva;  
        if(!reserva.cancha){
            return(<div>... Cargando Datos</div>)
        }else{
            return(
                <div className="content-wrapper" id="content">
                    <h2>Detalles de la Reserva</h2>
                    <div className="row">
                        <div className="col-md-4">
                            <b>Cancha: </b>{reserva.cancha.descripcion}<br/>
                            <b>Reservado por: </b>{reserva.reservado_por}<br/>
                            <b>Reservado: </b>{reserva.reserva_fecha}<br/>
                            <div className="hours-selected-container">
                                <b>Horas:</b> 
                                {reserva.reserva_horas && reserva.reserva_horas.map(element => {
                                    return (
                                        <div key={element} className="hours-selected-item-info" >
                                            <span> {`${element}hs`} </span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                        <div className="col-md-3">
                            <b>Telefono: </b>{reserva.telefono}<br/>
                            <b>Estado:</b> {reserva.estado}
                        </div>
                        
                        {/*########### Deploy de los montos de totales de la reserva*/}
                        {this.detallesMontos()}
                        
                    </div>
                    <br/>
                    <Tabs transition={false} activeKey={this.state.keyTab} onSelect={(k) => this.setKey(k)} className="mb-3 col tabsDetalles">
                        <Tab eventKey="detalles-ventas" title="Consumision" >
                            <ConsumisionList reserva={reserva} stateTabs={this.state} updateDetallesMontos={this.updateDetallesMontos}/>
                        </Tab>
                        <Tab eventKey="detalles-pagos" title="Pagos" >
                            <PagosList reserva={reserva} stateTabs={this.state} updateDetallesMontos={this.updateDetallesMontos}/>
                        </Tab>
                        <Tab eventKey="detalles-facturas" title="Facturacion" >
                            <FacturasList reserva={reserva} stateTabs={this.state} updateDetallesMontos={this.updateDetallesMontos}/>
                        </Tab>
                    </Tabs>
                </div>
            )
        }
        
    }
}   