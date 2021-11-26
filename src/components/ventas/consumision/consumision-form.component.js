import React, {Component} from 'react';
import Select from 'react-select';
import axios from 'axios';
import NumberFormat from 'react-number-format';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { usuarioLogueado }from '../../../App.js'
const configData = require('../../../config.json');
const {convertMiles} = require('../../../utils/utils')

export default class ConsumisionForm extends Component{
    constructor(props){
        super(props);
        this.state = {  
            precioUnitario:'',
            precioTotal: '',
            cantidad: '',
            pedidoPor: '',
            productoSelected: {},
            productoOptions: [],
            user_created: usuarioLogueado.name,
            user_updated: usuarioLogueado.name,            
            textButton:'Nueva',
            titleForm: 'Nueva Consumision',
            idUpdate: 'NEW',
            consumision: {},
            reserva: this.props.reserva
        };        
    }
    
    componentDidUpdate(){    
        //Obteniendo dados de la reserva
        if(this.state.reserva._id !== this.props.reserva._id){
            //Obtener Productos
            this.getProductosOptions();
            this.setState({reserva: this.props.reserva})
        }       
                
        if(this.props.consumision && this.state.consumision._id !== this.props.consumision._id){
            this.setState({
                consumision: this.props.consumision,
                precioUnitario: this.props.consumision.precio_unitario,
                precioTotal: this.props.consumision.precio_total,
                cantidad: this.props.consumision.cantidad,
                pedidoPor: this.props.consumision.pedido_por,
                productoSelected: this.state.productoOptions.filter(el => el.value._id === this.props.consumision.producto._id),
                codigo: this.props.consumision.producto.codigo,
                textButton:'Editar',
                titleForm: 'Editar Consumision' 
            })
        }else{            
            console.log('Crear Consumision',this.state.consumision._id)
            if(!this.props.consumision && this.state.consumision._id){
                console.log('Crear Consumision')
                this.setState({
                    consumision: {},
                    textButton:'Nueva',
                    titleForm: 'Nueva Consumision',
                })
            }
        }
    }

    getProductosOptions = () => {
        axios.get(configData.serverUrl + "/inventarios")
        .then(response => {
            let options = [];
            response.data.forEach(element => {
                options.push({value:element,label:element.descripcion +" | "+element.codigo});
            });
            this.setState({
                productoSelected: options[0],
                precioUnitario: options[0].value.precio_venta,
                productoOptions: options,
                
            });
        })
        .catch(err => console.log(err))
    }

    //Metodo que se ejecuta antes del render
    componentDidMount(){
        //Obtener Productos
        this.getProductosOptions();

        
    }
    onChangeProducto = (selectedOption) => {
        let precioUnitario = (selectedOption.value.precio_venta !== undefined ? selectedOption.value.precio_venta : '0');
        this.setState({
            productoSelected: selectedOption,
            precioUnitario: precioUnitario,
            precioTotal: parseInt(precioUnitario.replace(/\./gi,'')) * this.state.cantidad
            //precioTotal: parseInt(precioUnitario.replace(/\./gi,'')) * this.state.cantidad
        })
    }
    onChangePedidoPor = (e) => {this.setState({pedidoPor: e.target.value})}
    onChangeDescripcion = (e) => {this.setState({descripcion: e.target.value})}
    onChangeCantidad = (e) => {
        this.setState({
            cantidad: e.target.value,
            precioTotal: parseInt(this.state.precioUnitario.replace(/\./gi,'')) * e.target.value
        })}
    
    showNotification(response){        
        document.querySelector('#alert').classList.replace('hide','show');
        if(response.data.success === true){
            document.querySelector('#alert').classList.replace('alert-warning','alert-success');
            document.querySelector('#alert #text').innerHTML = '<strong>Exito!</strong> Los datos han sido actualizados.'

            //Enfocar el input
            this._input.focus(); 
            //actualizar Lista
            this.props.onUpdateParentList('true');
        }else{
            document.querySelector('#alert').classList.replace('alert-success','alert-warning');
            if(response.data.menssage_error_text === 'duplicate'){
                document.querySelector('#alert #text').innerHTML = '<strong>Error!</strong> Ya existe la consumision con el producto seleccionado.'
            }else{                
                document.querySelector('#alert #text').innerHTML = '<strong>Error!</strong> Contacte con el administrador.'
            }
        }        
        setTimeout(function(){  document.querySelector('#alert').classList.replace('show','hide'); }, 3000);        
    }

    handleCloseAlert = () =>{
        document.querySelector('#alert').classList.replace('show','hide');
    }
    
    onSubtmit = (e) => {
        e.preventDefault();
        if(!this.state.consumision._id){
            const consumision = {
                reserva: this.state.reserva._id,
                producto: this.state.productoSelected.value._id,
                cantidad: this.state.cantidad,
                pedido_por: this.state.pedidoPor,
                precio_unitario: this.state.precioUnitario,
                precio_total: convertMiles(this.state.precioTotal),
                user_created: this.state.user_created,
                user_updated: this.state.user_updated
            }
            axios.post(configData.serverUrl + '/consumisiones/add',consumision)
                .then(res => this.showNotification(res))
                .catch(err => this.showNotification(err));
                this.setState({
                    cantidad:'',
                    productoSelected: this.state.productoOptions[0],
                    precioTotal: '',
                    precioUnitario: this.state.productoOptions[0].value.precio_venta,
                    textButton:'Crear',
                    titleForm: 'Crear Consumision',
                    idUpdate:'NEW'
                })
        }else{
            const consumision = {
                cantidad: this.state.cantidad,
                pedido_por: this.state.pedidoPor,
                precio_total: convertMiles(this.state.precioTotal),
                user_updated: this.state.user_updated
            }
            axios.post(configData.serverUrl + '/consumisiones/update/'+this.state.consumision._id,consumision)
                .then(res => this.showNotification(res))
                .catch(err => this.showNotification(err));
        }        
    }   
    
    render(){  
        
        return(
            <div className="container"> 
                <h3>{this.state.titleForm}</h3>
                <form onSubmit={this.onSubtmit}>
                        <div className="row">
                            <div className="form-group col-md-12">
                                <label>Producto: </label>
                                <Select                                     
                                    ref={c => (this._input = c)}
                                    noOptionsMessage={() => 'Sin resultados'}
                                    value={this.state.productoSelected} 
                                    options={this.state.productoOptions} 
                                    onChange={this.onChangeProducto}                                    
                                    required/>
                                    
                            </div>   
                            <div className="form-group col-md-12">
                                <label>Pedido por: </label>
                                <input type="text" 
                                    required
                                    className="form-control"
                                    onChange={this.onChangePedidoPor}  
                                    value={this.state.pedidoPor}
                                />
                            </div> 
                            <div className="form-group col-md-3">
                                <label> Stock: </label>
                                <NumberFormat 
                                    disabled
                                    thousandSeparator = ""
                                    decimalSeparator = ","
                                    className="form-control"
                                    value={this.state.cantidad}
                                    onChange={this.onChangeCantidad}
                                    required
                                />
                            </div>  
                            <div className="form-group col-md-3">
                                <label>Cantidad: </label>
                                <NumberFormat 
                                    thousandSeparator = ""
                                    decimalSeparator = ","
                                    className="form-control"
                                    value={this.state.cantidad}
                                    onChange={this.onChangeCantidad}
                                    required
                                />
                            </div>           
                            <div className="form-group col-md-6">
                                <label>Precio Unitario: </label>
                                <input type="text" 
                                    required
                                    disabled
                                    className="form-control"
                                    value={`${this.state.precioUnitario}Gs`}
                                />
                            </div>
                            <div className="form-group col-md-6">
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
                    <div id="alert" className="alert alert-success alert-dismissible fade hide" role="alert">
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
