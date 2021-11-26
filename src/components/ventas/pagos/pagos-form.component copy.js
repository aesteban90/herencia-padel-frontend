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
            precioUnitario:'',
            precioTotal: '',
            cantidad: '',
            saldo:'',
            consumisionSelected: {},
            consumisionOptions: [],
            user_created: usuarioLogueado.name,
            user_updated: usuarioLogueado.name,            
            textButton:'Crear',
            titleForm: 'Crear Pagos',
            idUpdate: 'NEW',
            reserva: {}
        };        
    }
    //Metodo que obtiene cualquier actualizacion de otros componentes donde fue llamado
    componentDidUpdate(){    
        //Obteniendo dados de la reserva
        if(this.props.statePagoslist.updateForm){
            this.props.statePagoslist.updateForm = false;
            //Obtener Productos
            this.getConsumisionOptions();
            this.setState({reserva: this.props.reserva})
        }

        //Obteniendo datos de la consumision para editar o crear
        if(this.state.idUpdate !== this.props.idUpdate ){            
            this.setState({ idUpdate: this.props.idUpdate});
            if(this.props.idUpdate !== "NEW" && this.props.idUpdate !== "" ){
                axios.get(configData.serverUrl + "/pagos/"+this.props.idUpdate)
                .then(response => {
                    const pagos = response.data;
                    console.log('Editando',pagos)
                    this.setState({
                        precioUnitario: pagos.precio_unitario,
                        precioTotal: pagos.precio_total,
                        pagado_por: pagos.pagado_por,
                        cantidad: pagos.cantidad,
                        consumisionSelected: this.state.consumisionOptions.filter(el => el.value._id === response.data.consumision._id),
                        codigo: response.data.codigo,
                        textButton:'Editar',
                        titleForm: 'Editar Pagos' 
                    })
                })
                .catch(err => console.log(err));
            }else{
                this.setState({
                    precioUnitario: '',
                    precioTotal: '',
                    cantidad: '',
                    consumisionSelected: this.state.consumisionOptions[0],
                    textButton:'Crear',
                    titleForm: 'Crear Pagos',
                    idUpdate: this.props.idUpdate
                });
            }
        }
    }

    getConsumisionOptions = () => {
        if(this.props.reserva._id){            
            axios.get(configData.serverUrl + "/consumisiones/reserva/"+this.props.reserva._id)
            .then(response => {
                let options = [];
                if(response.data.length > 0 ){
                    response.data.forEach(element => {                        
                        let total_pagado = 0;
                        this.props.statePagoslist.datos.map(data => {
                            if(data.consumision._id === element._id){
                                total_pagado += parseInt(data.precio_total.replace(/\./gi,''))
                            }
                        })
                        element.saldo = parseInt(element.precio_total.replace(/\./gi,'')) - total_pagado;
                        
                        //Si el saldo de la consumision es 0, no se visualiza para el pago                        
                        if(element.saldo > 0 ){
                            if(element.producto){
                                options.push({value:element,label:element.producto.descripcion});
                            }else if(element.cancha){
                                options.push({value:element,label:element.cancha.descripcion});
                            }
                            
                        }
                    });  
                    //Controla que tenga consumision                  
                    if(options.length > 0 ){
                        this.setState({
                            consumisionSelected: options[0],
                            saldo: convertMiles(options[0].value.saldo),
                            precioUnitario: options[0].value.precio_unitario,
                            precioTotal: options[0].value.precio_total.replace(/\./gi,''),
                            cantidad: options[0].value.cantidad,
                            consumisionOptions: options,                
                        },() => this.controlarBotones());
                    }else{
                        this.setState({
                            consumisionSelected: {},
                            consumisionOptions: [],
                            saldo: ''
                        })
                    }
                }else{
                    this.setState({
                        consumisionSelected: {},
                        precioUnitario: '',
                        precioTotal: '',
                        cantidad: '',
                        consumisionOptions: [],
                    });
                }
            })
            .catch(err => console.log(err))
        }
    }
    controlarBotones = () =>{
        if(this.state.consumisionSelected.value.cancha){
            document.querySelector('#cantidad').setAttribute('disabled',true)
            document.querySelector('#precioUnitario').removeAttribute('disabled')
        }else if(this.state.consumisionSelected.value.producto){
            document.querySelector('#cantidad').removeAttribute('disabled')
            document.querySelector('#precioUnitario').setAttribute('disabled',true)
        }
    }
    //Metodo que se ejecuta antes del render
    componentDidMount(){
        //Obtener Productos
        this.getConsumisionOptions();
    }
    onChangeProducto = (selectedOption) => {
        
        let precioUnitario = (selectedOption.value.precio_unitario !== undefined ? selectedOption.value.precio_unitario : '0')
        this.setState({
            consumisionSelected: selectedOption,
            saldo: convertMiles(selectedOption.value.saldo),
            cantidad: selectedOption.value.cantidad,
            precioUnitario: precioUnitario,
            precioTotal: parseInt(precioUnitario.replace(/\./gi,'')) * selectedOption.value.cantidad
        },() => this.controlarBotones())
    }
    onChangePagadoPor = (e) => {this.setState({pagado_por: e.target.value})}
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
        console.log('show message',message);
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
        let saldo = parseInt(this.state.saldo.replace(/\./gi,''));
        let precioTotal = parseInt(this.state.precioTotal);
        if(precioTotal > saldo){
            try {
                this.showMessage("El Precio Total no puede superar el saldo de " + this.state.saldo + " Gs.");
            } catch (error) {
                console.log(error);
            }
            
            return false;
        }

        if(this.props.idUpdate === "NEW" || this.props.idUpdate === "" ){
            const pagos = {
                reserva: this.state.reserva._id,
                consumision: this.state.consumisionSelected.value._id,
                producto: this.state.consumisionSelected.value.producto,
                cancha: this.state.consumisionSelected.value.cancha,
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
                this.setState({
                    cantidad:'',
                    consumisionSelected: this.state.consumisionOptions[0],
                    precioUnitario: this.state.consumisionOptions[0].value.precio_unitario,
                    textButton:'Crear',
                    titleForm: 'Crear Cancha',
                    idUpdate:'NEW'
                })      
        }else{
            const consumision = {
                cantidad: this.state.cantidad,
                user_updated: this.state.user_updated
            }
            axios.post(configData.serverUrl + '/pagos/update/'+this.state.idUpdate,consumision)
                .then(res => this.showNotification(true))
                .catch(err => this.showNotification(false));
        }

        
    }   
    
    render(){          
        return(
            <div className="container"> 
                <h3>{this.state.titleForm}</h3>
                <form onSubmit={this.onSubtmit}>
                        <div className="row">
                            <div className="form-group col-md-12">
                                <label>Consumision: </label>
                                <Select                                     
                                    ref={c => (this._input = c)}
                                    noOptionsMessage={() => 'Sin resultados'}
                                    value={this.state.consumisionSelected} 
                                    options={this.state.consumisionOptions} 
                                    onChange={this.onChangeProducto}                                    
                                    required/>
                                    
                            </div> 
                            <div className="form-group col-md-12">
                                <label>Pedido Por: </label>
                                <Select                                     
                                    ref={c => (this._input = c)}
                                    noOptionsMessage={() => 'Sin resultados'}
                                    value={this.state.consumisionSelected} 
                                    options={this.state.consumisionOptions} 
                                    onChange={this.onChangeProducto}                                    
                                    required/>
                                    
                            </div>   
                            <div className="form-group col-md-12">
                                <label>Pagado Por: </label>
                                <input type="text" 
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
