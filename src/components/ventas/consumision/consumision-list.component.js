import React, {Component} from 'react';
import axios from 'axios';
import ConsumisionForm from './consumision-form.component';
import { Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { convertMiles } from '../../../utils/utils';
const configuracion = require('../../../config.json');

export default class ConsumisionList extends Component{
    constructor(props){
        super(props);
        this.state = {
            datos: [],
            loading: true,
            idUpdate: '',
            didUpdate: true,
            total_pagado: '',
            salgo: '',
            reserva: {}
        }
        this.datalist = this.datalist.bind(this);
    }

    updateList = async () => {  
        let pagos =  await axios.get(configuracion.serverUrl + "/pagos/reserva/"+this.props.reserva._id)
            .then(datos => datos.data)
            .catch(err => undefined)

        let consumisiones =  await axios.get(configuracion.serverUrl + "/consumisiones/reserva/"+this.props.reserva._id)
            .then(datos => datos.data)
            .catch(err => undefined)
        
        await consumisiones.map(element => {
            let pagos_details = {total_pagado:0, total_pagado_cantidad:0};
            pagos.map(pago => {
                if(pago.consumision._id === element._id){ 
                    pagos_details.total_pagado += parseInt(pago.precio_total.replace(/\./gi,''));
                    pagos_details.total_pagado_cantidad += parseInt(pago.cantidad)
                }
            })
            element.saldo = convertMiles(pagos_details.total_pagado - parseInt(element.precio_total.replace(/\./gi,'')));
            element.total_pagado = convertMiles(pagos_details.total_pagado);
            element.total_pagado_cantidad = convertMiles(pagos_details.total_pagado_cantidad);            
        })
        this.setState({
            reserva: this.props.reserva,
            datos: consumisiones,
            loading: false
        })
        //Pagina la lista
        //window.paginar('list-group','list-group-item',true);
        //Actualizando los montos de la reverva en el detalle padre
        this.props.updateDetallesMontos();
    }

    componentDidUpdate(){
        if(this.props.stateTabs.updateListConsumision){
            this.props.stateTabs.updateListConsumision = false;
            this.updateList();
        }
    }
    componentDidMount(){this.updateList()}

    deleteData = async (jsondatos) => {
        await axios.delete(configuracion.serverUrl + "/consumisiones/"+jsondatos._id)
            .then(res => console.log(res.data))
            .catch(err => console.log(err))

        this.setState({
            datos: this.state.datos.filter(el => el._id !== jsondatos._id)
        });
    }

    updateData = (jsondatos) => {this.setState({idUpdate: jsondatos._id})}
    createData = (id) => {this.setState({idUpdate: id})}

    datalist(){
        if(this.state.datos){
            return this.state.datos.map(dato => {
                let saldoNegativo = (dato.saldo.indexOf('-')>-1 ? {color:'red',fontWeight:'bold'} : undefined)
                return (
                    <li className="list-group-item" key={dato._id}>
                        <div className="col-md-3 ">
                            {dato.producto && dato.producto.descripcion}
                            {dato.cancha && dato.cancha.descripcion}
                            <br/>
                            <span className="details-user-actions">
                                <b> Creado por: </b>{dato.user_created}
                            </span>
                        </div>
                        <div className="col-md-4 details-consumision ">
                            Cantidad: <span>
                                {dato.producto && dato.cantidad}
                                {dato.cancha && this.state.reserva.reserva_horas.length+' horas'}
                            </span><br/>
                            Cantidad Pagado: <span>{dato.total_pagado_cantidad}</span><br/>
                            Precio Unitario: <span>{dato.precio_unitario}</span>
                        </div>
                        <div className="col-md-4 details-consumision ">
                            Precio Total: <span>{dato.precio_total}</span><br/>
                            Total Pagado: <span>{dato.total_pagado}</span><br/>
                            Saldo: <span style={saldoNegativo}>{dato.saldo}</span><br/>
                        </div>
                        <div className="col-md-1 text-right ">
                            {!dato.cancha && <button onClick={() => this.updateData(dato)} type="button" className="btn btn-light btn-sm mr-1"><FontAwesomeIcon icon={faEdit} /></button>}
                            {!dato.cancha && <button onClick={() => this.deleteData(dato)} type="button" className="btn btn-danger btn-sm"><FontAwesomeIcon icon={faTrash} /></button>}
                        </div>
                    </li>)
            })
        }
    }
    render(){       
        return(            
            <div className="row">
                <div className="col-md-8">
                    <div className="card">
                        <div className="card-header">
                            <div className="card-title row mb-0">  
                                <div className="col-md-10">Detalles de la Consumision</div>
                                <div className="col-md-2 text-right">
                                    <button onClick={() => this.createData("NEW")} type="button" className="btn btn-warning btn-sm"><FontAwesomeIcon icon={faPlus} /> Nuevo</button>
                                </div>                                 
                            </div>
                        </div>
                        <input className="form-control inputsearch" type="text" placeholder="Busqueda (minimo 3 letras)..." />
                        <ul id="list" className="list-group list-group-consumision">
                            {this.state.loading  ? 
                                <Spinner animation="border" variant="primary" style={{margin:"25px",alignSelf:"center"}}/> 
                            :
                                this.state.datos.length === 0 ?
                                    <div className="col-md-12 text-center m-3">Sin registros encontrados</div>
                                :
                                    this.datalist()
                            } 
                        </ul>                     
                    </div>
                </div>
                <div className="col-md-4">
                    <ConsumisionForm reserva={this.state.reserva} idUpdate={this.state.idUpdate} onUpdateParentList={this.updateList}/>
                </div>
            </div>            
        )
    }
}