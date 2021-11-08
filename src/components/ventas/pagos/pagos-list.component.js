import React, {Component} from 'react';
import axios from 'axios';
import PagosForm from './pagos-form.component';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faEdit, faTrash, faCheckSquare } from '@fortawesome/free-solid-svg-icons';
import Spinner from 'react-bootstrap/Spinner';
const configuracion = require('../../../config.json');

export let pagosListDetalle = [];

export default class PagosList extends Component{
    constructor(props){
        super(props);        
        this.state = {
            datos: [],
            loading: true,
            idUpdate: '',
            updateForm: true,
            reserva: {}
        }
        this.datalist = this.datalist.bind(this);
    }

    updateList = async () => {   
        await axios.get(configuracion.serverUrl + "/pagos/reserva/"+this.props.reserva._id)
            .then(response => {
                this.setState({
                    reserva: this.props.reserva,
                    datos: response.data,
                    updateForm: true,
                    loading: false
                })
                //Agregando los pagos en la Lista para la exportacion
                pagosListDetalle = response.data;       
                
            })
            .catch(err => console.log(err))
        
        //Actualizando los montos de la reverva en el detalle padre
        this.props.updateDetallesMontos();
    }
    componentDidUpdate(){
        if(this.props.stateTabs.updateListPagos){
            this.props.stateTabs.updateListPagos = false;
            this.updateList();                
        }
        //Calculando Totales Pagos
        window.calcularTotalesPagos();
    }
    
    deleteData = async (jsondatos) => {
        await axios.delete(configuracion.serverUrl + "/pagos/"+jsondatos._id)
            .then(() => { 
                //Actualizando los montos de la reverva en el detalle padre
                this.props.updateDetallesMontos()
            })
            .catch(err => console.log(err))

        this.setState({
            datos: this.state.datos.filter(el => el._id !== jsondatos._id),
            updateForm: true
        });

        //Calculando Totales Pagos
        window.calcularTotalesPagos();
    }

    updateData = (jsondatos) => {this.setState({idUpdate: jsondatos._id})}
    createData = (id) => {this.setState({idUpdate: id})}
    checked = () => {
        document.querySelector('.btn-seleccionar').setAttribute('style','border:1px solid black; color: black')
    }
    seleccionarTodos = () => {
        // let checks = document.querySelectorAll('#facturacheck').length;
        // let checks_checked = document.querySelectorAll('#facturacheck:checked').length;
        let checks = document.querySelectorAll('#list-pagos .list-group-item:not([style*="display: none;"]) #facturacheck').length;
        let checks_checked = document.querySelectorAll('#list-pagos .list-group-item:not([style*="display: none;"]) #facturacheck:checked').length;

        if(checks ===  checks_checked ){
            //Desmarca todos
            document.querySelector('.btn-seleccionar').setAttribute('style','border:1px solid black; color: black')
            document.querySelectorAll('#list-pagos .list-group-item:not([style*="display: none;"]) #facturacheck').forEach(element => element.checked = false)
        }else{
            
            //Marca todos
            document.querySelector('.btn-seleccionar').setAttribute('style','border:1px solid blue; color: blue');
            document.querySelectorAll('#list-pagos .list-group-item:not([style*="display: none;"]) #facturacheck').forEach(element => element.checked = true)
        }
        
    }
    datalist(){
        if(this.state.datos){
            return this.state.datos.map(dato => {
                return (
                    <li className="list-group-item" key={dato._id}>
                        <div className="col-md-6">
                            {dato.producto && dato.producto.descripcion}
                            {dato.cancha && dato.cancha.descripcion}
                            <br/>
                            <span className="details-user-actions">
                                <b> Pagado por: </b>{dato.pagado_por}<br/>
                                <b> Creado por: </b>{dato.user_created}
                            </span>
                        </div>
                        <div className="col-md-4 details-pagos">
                            Cantidad: <span>{dato.cantidad}</span><br/>
                            Precio Unitario: <span>{dato.precio_unitario} Gs.</span><br/>
                            Precio Total: <span id="item-total">{dato.precio_total} Gs.</span><br/>
                        </div>
                        {!dato.factura ?
                            <div className="col-md-2 text-right">
                                <button onClick={() => this.updateData(dato)} type="button" className="btn btn-light btn-sm mr-1"><FontAwesomeIcon icon={faEdit} /></button>
                                <button onClick={() => this.deleteData(dato)} type="button" className="btn btn-danger btn-sm"><FontAwesomeIcon icon={faTrash} /></button>
                                
                                    <div>
                                        <input className="form-check-input m2" id="facturacheck" onClick={() => this.checked()} name="facturacheck" type="checkbox" value={dato._id} ></input>Facturar
                                    </div>                            
                            </div>
                            :
                            <div className="col-md-2 text-center">
                                <a href={'/Factura/Impresion/'+dato.factura} target='_blank' className="badge badge-pill badge-success p-2">Facturado</a>
                            </div>
                        }
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
                                <div className="col-md-8">Detalles de los Pagos</div>
                                <div className="col-md-4 text-right">
                                <button onClick={() => this.seleccionarTodos()} type="button" className="btn-seleccionar btn btn-light btn-sm mr-2"><FontAwesomeIcon icon={faCheckSquare} /> Seleccionar Todos</button>
                                    <button onClick={() => this.createData("NEW")} type="button" className="btn btn-warning btn-sm"><FontAwesomeIcon icon={faPlus} /> Nuevo</button>
                                </div>                                 
                            </div>
                        </div>
                        <input className="form-control inputsearch seccion-pagos" type="search" placeholder="Busqueda (minimo 3 letras)..." />
                        <ul id="list-pagos" className="list-group">
                            {this.state.loading  ? 
                                <Spinner animation="border" variant="primary" style={{margin:"25px",alignSelf:"center"}}/> 
                            :
                                this.state.datos.length === 0 ?
                                    <div className="col-md-12 text-center m-3">Sin registros encontrados</div>
                                :
                                    this.datalist()
                            }                            
                        </ul>
                        <ul>
                            <li className="list-group-item-nofilter">
                                <div className="col-md-10 details-pagos">
                                    <b>Totales:</b> <span className="list-totales-pagos text-right" ></span><br/>                                                
                                </div>
                            </li>
                        </ul>                     
                    </div>
                </div>
                <div className="col-md-4">
                    <PagosForm statePagoslist={this.state} reserva={this.state.reserva} idUpdate={this.state.idUpdate} onUpdateParentList={this.updateList}/>
                </div>
            </div>            
        )
    }
}