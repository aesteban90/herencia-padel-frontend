import React, {Component} from 'react';
import axios from 'axios';
import Select from 'react-select';
import NumberFormat from 'react-number-format';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { usuarioLogueado } from '../../../App';
const configData = require('../../../config.json');
const { convertMiles } = require('../../../utils/utils.js')

export default class InventarioForm extends Component{
    constructor(props){
        super(props);
        this.state = {  
            codigo:'',
            descripcion: '',
            tipoSelected: {},
            tipoOptions: [],
            cantidad: '',
            precio_costo: '',
            precio_venta: '',
            user_created: usuarioLogueado.name,
            user_updated: usuarioLogueado.name,
            textButton:'Crear',
            titleForm: 'Crear Inventario',
            idUpdate: 'NEW'
        };        
    }
    //Metodo que obtiene cualquier actualizacion de otros componentes donde fue llamado
    componentDidUpdate(){        
        if(this.state.idUpdate !== this.props.idUpdate ){
            this.setState({ idUpdate: this.props.idUpdate});
            if(this.props.idUpdate !== "NEW" && this.props.idUpdate !== "" ){
                axios.get(configData.serverUrl + "/inventarios/"+this.props.idUpdate)
                .then(response => {
                    this.setState({
                        codigo: response.data.codigo,
                        descripcion: response.data.descripcion,
                        tipoSelected: this.state.tipoOptions.filter(el => el.value === response.data.tipo),
                        cantidad: (response.data.cantidad ? response.data.cantidad : ''),
                        precio_costo: (response.data.precio_costo ? response.data.precio_costo : ''),
                        precio_venta: (response.data.precio_venta ? response.data.precio_venta : ''),
                        textButton:'Editar',
                        titleForm: 'Editar Inventario'
                    })
                })
                .catch(err => console.log(err));
            }else{
                this.setState({
                    codigo:'',
                    descripcion:'',
                    cantidad: '',
                    precio_costo: '',
                    precio_venta: '',
                    tipoSelected: this.state.tipoOptions[0],
                    textButton:'Crear',
                    titleForm: 'Crear Inventario',
                    idUpdate: this.props.idUpdate
                });
            }
        }
    }    
    componentDidMount(){
        this.setState({
            tipoSelected: {value:'venta', label: 'Para Ventas'},
            tipoOptions: [{value:'venta', label: 'Para Vender'},{value:'alquiler', label: 'Para Alquilar'}]
        })
       
    }
    onChangeCodigo = (e) => {this.setState({codigo: e.target.value})}
    onChangeDescripcion = (e) => {this.setState({descripcion: e.target.value})}
    onChangePrecioCosto = (e) => {this.setState({precio_costo: e.target.value})}
    onChangePrecioVenta = (e) => {this.setState({precio_venta: e.target.value})}
    onChangeCantidad = (e) => {this.setState({cantidad: e.target.value})}    
    onChangeTipo = (selectedOption) => {this.setState({tipoSelected: selectedOption})}
    showNotification(isSuccess){
        document.querySelector('#alert').classList.replace('hide','show');
        if(isSuccess === true){
            document.querySelector('#alert').classList.replace('alert-warning','alert-success');
            document.querySelector('#alert #text').innerHTML = '<strong>Exito!</strong> Los datos han sido actualizados.'
        }else{
            document.querySelector('#alert').classList.replace('alert-success','alert-warning');
            document.querySelector('#alert #text').innerHTML = '<strong>Error!</strong> Contacte con el administrador.'
        }
        //Enfocar el input
        this._input.focus(); 
        //actualizar Lista
        this.props.onUpdateParentList('true');
        setTimeout(function(){  document.querySelector('#alert').classList.replace('show','hide'); }, 3000);
    }

    handleCloseAlert = () =>{
        document.querySelector('#alert').classList.replace('show','hide');
    }
    
    onSubtmit = (e) => {
        e.preventDefault();
        console.log(this.state)
        if(this.props.idUpdate === "NEW" || this.props.idUpdate === "" ){
            const inventario = {
                codigo: this.state.codigo,
                descripcion: this.state.descripcion,
                tipo: this.state.tipoSelected.value,
                cantidad: convertMiles(this.state.cantidad.replace(/\./gi,'')),
                precio_costo: convertMiles(this.state.precio_costo.replace(/\./gi,'')),
                precio_venta: convertMiles(this.state.precio_venta.replace(/\./gi,'')),
                user_created: this.state.user_created,
                user_updated: this.state.user_updated
            }
            axios.post(configData.serverUrl + '/inventarios/add',inventario)
                .then(res => this.showNotification(true))
                .catch(err => this.showNotification(false));

                this.setState({
                    codigo:'',
                    descripcion: '',
                    cantidad: '',
                    precio_costo: '',
                    precio_venta: '',
                    tipoSelected: this.state.tipoOptions[0],
                    textButton:'Crear',
                    titleForm: 'Crear Inventario',
                    idUpdate:'NEW'
                })
                   
        }else{
            const inventario = {
                codigo: this.state.codigo,
                descripcion: this.state.descripcion,
                tipo: this.state.tipoSelected.value,
                cantidad: convertMiles(this.state.cantidad.replace(/\./gi,'')),
                precio_costo: convertMiles(this.state.precio_costo.replace(/\./gi,'')),
                precio_venta: convertMiles(this.state.precio_venta.replace(/\./gi,'')),
                user_updated: this.state.user_updated
            }
            axios.post(configData.serverUrl + '/inventarios/update/'+this.state.idUpdate,inventario)
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
                                <label>Codigo: </label>
                                <input type="text" 
                                    autoFocus={true}
                                    ref={c => (this._input = c)}
                                    required
                                    className="form-control"
                                    value={this.state.codigo}
                                    onChange={this.onChangeCodigo}
                                />
                            </div>   
                            <div className="form-group col-md-12">
                                <label>Descripcion: </label>
                                <input type="text" 
                                    required
                                    className="form-control"
                                    value={this.state.descripcion}
                                    onChange={this.onChangeDescripcion} 
                                />
                            </div>
                            <div className="form-group col-md-12">
                                <label>Tipo: </label>
                                <Select         
                                    value={this.state.tipoSelected} 
                                    options={this.state.tipoOptions} 
                                    onChange={this.onChangeTipo}                                    
                                    required/>
                            </div>
                            
                            <div className="form-group col-md-4">
                                <label>Cantidad: </label>
                                <NumberFormat 
                                    disabled
                                    thousandSeparator = "."
                                    decimalSeparator = ","
                                    className="form-control"
                                    value={this.state.cantidad}
                                    onChange={this.onChangeCantidad}
                                    required
                                />
                            </div>  
                            <div className="form-group col-md-4">
                                <label>CPP: </label>
                                <NumberFormat 
                                    disabled
                                    thousandSeparator = "."
                                    decimalSeparator = ","
                                    className="form-control"
                                    value={this.state.precio_costo}
                                    onChange={this.onChangePrecioCosto}
                                    required
                                />
                            </div> 
                            <div className="form-group col-md-4">
                                <label>Precio Venta: </label>
                                <NumberFormat 
                                    thousandSeparator = "."
                                    decimalSeparator = ","
                                    className="form-control"
                                    value={this.state.precio_venta}
                                    onChange={this.onChangePrecioVenta}
                                    required
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
