import React, {Component} from 'react';
import Select from 'react-select';
import axios from 'axios';
import NumberFormat from 'react-number-format';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { usuarioLogueado } from '../../../App';
import { parse } from '@fortawesome/fontawesome-svg-core';
const configData = require('../../../config.json');
const { convertMiles } = require('../../../utils/utils')

export default class PagosForm extends Component{
    constructor(props){
        super(props);
        this.state = {  
            pagado_por: '',
            pedido_por: '',
            precioUnitario:'',
            precioTotal: '',
            cantidad: '',
            saldo:'',
            consumision: {},
            descripcion: '',
            user_created: usuarioLogueado.name,
            user_updated: usuarioLogueado.name,            
            textButton:'Pagar',
            titleForm: 'Detalle a Pagar',
            idUpdate: 'NEW',
            reserva: {}
        };        
    }
    componentDidMount(){
        this.obtenerDatosConsumicion();
    }
    componentDidUpdate(){    
        this.obtenerDatosConsumicion();
    }

    obtenerDatosConsumicion = () =>{
        if(this.props.consumision){
            if(this.state.saldo !== this.props.consumision.saldo){
                this.setState({saldo: this.props.consumision.saldo});
            }

            if(this.state.consumision._id !== this.props.consumision._id){
                const descripcion = (this.props.consumision.producto ? this.props.consumision.producto.descripcion : this.props.consumision.cancha.descripcion);
                this.setState({
                    precioUnitario: this.props.consumision.precio_unitario,
                    precioTotal: this.props.consumision.precio_total,
                    pedido_por: this.props.consumision.pedido_por,
                    cantidad: this.props.consumision.cantidad,
                    
                    descripcion,    
                    consumision: this.props.consumision
                })
            }
        }
    }

    controlarBotones = () =>{
        if(this.state.consumision.cancha){
            document.querySelector('#cantidad').setAttribute('disabled',true)
            document.querySelector('#precioUnitario').removeAttribute('disabled')
        }else if(this.state.consumision.producto){
            document.querySelector('#cantidad').removeAttribute('disabled')
            document.querySelector('#precioUnitario').setAttribute('disabled',true)
        }
    }
    
    onChangePagadoPor = (e) => {this.setState({pagado_por: e.target.value})}
    onChangeConsumision = (e) => {this.setState({consumision:{descripcion: e.target.value} })}
    onChangePedidoPor = (e) => {this.setState({pedido_por: e.target.value})}
    onchangePrecioUnitario = (e) => {
        this.setState({
            precioUnitario: e.target.value, 
            precioTotal: parseInt(e.target.value.replace(/\./gi,''))
        })}
    onChangeCantidad = (e) => {
        this.setState({
            cantidad: e.target.value,
            precioTotal: parseInt(this.state.precioUnitario.replace(/\./gi,'')) * e.target.value
        })}
    showMessage(message){
        document.querySelector('#alert-pagos').classList.replace('hide','show');
        document.querySelector('#alert-pagos').classList.replace('alert-success','alert-warning');
        document.querySelector('#alert-pagos #text').innerHTML = message;
        setTimeout(function(){  document.querySelector('#alert-pagos').classList.replace('show','hide'); }, 3000);
    }
    showNotification(isSuccess){
        document.querySelector('#alert-pagos').classList.replace('hide','show');
        if(isSuccess === true){
            document.querySelector('#alert-pagos').classList.replace('alert-warning','alert-success');
            document.querySelector('#alert-pagos #text').innerHTML = '<strong>Exito!</strong> Los datos han sido actualizados.'
        }else{
            document.querySelector('#alert-pagos').classList.replace('alert-success','alert-warning');
            document.querySelector('#alert-pagos #text').innerHTML = '<strong>Error!</strong> Contacte con el administrador.'
        }
        //Enfocar el input
        this._input.focus(); 
        //actualizar Lista
        this.props.onUpdateParentList('true');
        setTimeout(function(){  document.querySelector('#alert-pagos').classList.replace('show','hide'); }, 3000);
    }

    handleCloseAlert = () =>{
        document.querySelector('#alert').classList.replace('show','hide');
    }
    
    onSubtmit = (e) => {
        e.preventDefault();
        console.log('Precio total',this.state.precioTotal);
        let saldo = parseInt(this.state.saldo.replace(/\./gi,''))*-1;
        let precioTotal = parseInt((this.state.precioTotal+"").replace(/\./gi,''));

        if(precioTotal > saldo){
            try {
                this.showMessage("El Precio Total no puede superar el saldo de " + this.state.saldo + " Gs.");
            } catch (error) {
                console.log(error);
            }
            return false;
        }

        const pagos = {
            reserva: this.props.reserva._id,
            consumision: this.state.consumision._id,
            producto: this.state.consumision.producto,
            cancha: this.state.consumision.cancha,
            pagado_por: this.state.pagado_por,
            cantidad: this.state.cantidad,
            precio_unitario: this.state.precioUnitario,
            precio_total: convertMiles(this.state.precioTotal),
            user_created: this.state.user_created,
            user_updated: this.state.user_updated
        }
        
        axios.post(configData.serverUrl + '/pagos/add',pagos)
            .then(res => this.showNotification(true))
            .catch(err => this.showNotification(false));                    
    }   
    
    render(){          
        return(
            <div className="container"> 
                <h3>{this.state.titleForm}</h3>
                <form onSubmit={this.onSubtmit}>
                        <div className="row">
                            <div className="form-group col-md-12">
                                <label>Consumision: </label>
                                <input type="text" 
                                    required
                                    disabled
                                    className="form-control"
                                    value={this.state.descripcion}
                                />
                                    
                            </div> 
                            <div className="form-group col-md-12">
                                <label>Pedido Por: </label>
                                <input type="text" 
                                    required
                                    disabled
                                    className="form-control"
                                    value={this.state.pedido_por}
                                />
                                    
                            </div>   
                            <div className="form-group col-md-12">
                                <label>Pagado Por: </label>
                                <input type="text" 
                                    ref={c => (this._input = c)}
                                    required
                                    className="form-control"
                                    value={this.state.pagado_por}
                                    onChange={this.onChangePagadoPor}
                                />
                            </div>                               
                            <div className="form-group col-md-3">
                                <label>Cantidad: </label>
                                <NumberFormat 
                                    id="cantidad"
                                    thousandSeparator = ""
                                    decimalSeparator = ","
                                    className="form-control"
                                    value={this.state.cantidad}
                                    onChange={this.onChangeCantidad}
                                    required
                                />
                            </div>              
                            <div className="form-group col-md-9">
                                <label>Precio Unitario: </label>
                                <NumberFormat 
                                    id="precioUnitario"
                                    thousandSeparator = "."
                                    decimalSeparator = ","
                                    className="form-control"
                                    value={this.state.precioUnitario}
                                    onChange={this.onchangePrecioUnitario}
                                    required
                                    disabled
                                />
                            </div>
                            <div className="form-group col-md-12">
                                <label style={{color:'red'}}>Saldo: </label>
                                <input type="text" 
                                    disabled
                                    style={{borderColor:'red', color:'red'}}
                                    className="form-control"
                                    value={this.state.saldo}
                                />
                            </div>  
                            <div className="form-group col-md-12">
                                <label>Precio Total: </label>
                                <NumberFormat 
                                    thousandSeparator = "."
                                    decimalSeparator = ","
                                    className="form-control"
                                    value={`${this.state.precioTotal}Gs`}
                                    required
                                    disabled
                                />
                            </div>
                        </div>
                    <div className="form-group">
                        <button type="submit" className="btn btn-warning"><FontAwesomeIcon icon={faArrowLeft}/> {this.state.textButton}</button>
                    </div>        
                    <div id="alert-pagos" className="alert alert-success alert-dismissible fade hide" role="alert">
                        <span id="text"></span>
                        <button type="button" className="close" onClick={this.handleCloseAlert}>
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>                                
                </form>
            </div>
        )
    }
}
