import React, {Component} from 'react';
import axios from 'axios';
import Select from 'react-select';
import NumberFormat from 'react-number-format';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { usuarioLogueado } from '../../../App.js';
const { convertMiles } = require('../../../utils/utils.js')
const configData = require('../../../config.json');

export default class ComprasForm extends Component{
    constructor(props){
        super(props);
        this.state = {  
            numerofactura: '',
            inventarioSelected: {},
            inventarioOptions: [],
            proveedorSelected: {},
            proveedorOptions: [],
            cantidad: '',
            costo: '',
            total: '',
            user_created: usuarioLogueado.name,
            user_updated: usuarioLogueado.name,
            textButton:'Crear',
            titleForm: 'Crear Compra',
            idUpdate: 'NEW'
        };        
    }
    //Metodo que obtiene cualquier actualizacion de otros componentes donde fue llamado
    componentDidUpdate(){        
        if(this.state.idUpdate !== this.props.idUpdate ){
            this.setState({ idUpdate: this.props.idUpdate});
            if(this.props.idUpdate !== "NEW" && this.props.idUpdate !== "" ){
                axios.get(configData.serverUrl + "/compras/"+this.props.idUpdate)
                .then(response => {
                    this.setState({
                        numerofactura: response.data.numerofactura,
                        inventarioSelected: this.state.inventarioOptions.filter(el => el.value === response.data.inventario),
                        proveedorSelected: this.state.proveedorOptions.filter(el => el.value === response.data.proveedor),
                        cantidad: response.data.cantidad,
                        costo: response.data.costo,
                        total: response.data.total,
                        textButton:'Editar',
                        titleForm: 'Editar Compra'
                    })
                })
                .catch(err => console.log(err));
            }else{
                this.setState({
                    numerofactura: '',
                    inventario: this.state.inventarioOptions[0],
                    proveedor: this.state.proveedorOptions[0],
                    cantidad: '',
                    costo: '',
                    total: '',
                    textButton:'Crear',
                    titleForm: 'Crear Compra',
                    idUpdate: this.props.idUpdate
                });
            }
        }
    }

    //Metodo que se ejecuta antes del render
    componentDidMount(){
        this.getInventariosOptions(); //Obtener Inventarios
        this.getProveedoresOptions(); //Obtener Proveedores
    }

    getInventariosOptions = async () => {
        await axios.get(configData.serverUrl + "/Inventarios").then(response => {
            let options = [];
            if(response.data.length > 0 ){
                response.data.forEach(element => {options.push({value:element._id,label:element.descripcion +" | "+element.codigo})});
                this.setState({inventarioSelected: options[0], inventarioOptions: options});
            }else{
                this.setState({inventarioSelected: {}, inventarioOptions: []});
            }
        }).catch(err => console.log(err))        
    }
    getProveedoresOptions = async () => {
        await axios.get(configData.serverUrl + "/Proveedores").then(response => {
            let options = [];
            if(response.data.length > 0 ){
                response.data.forEach(element => {options.push({value:element._id,label:element.razonsocial})});
                this.setState({proveedorSelected: options[0], proveedorOptions: options});
            }else{
                this.setState({proveedorSelected: {}, proveedorOptions: []});
            }
        }).catch(err => console.log(err))        
    }

    onChangeNumeroFactura = (e) => {this.setState({numerofactura: e.target.value})}
    onChangeTotal = (e) => {this.setState({total: e.target.value})}
    onChangeInventario = (selectedOption) => {this.setState({inventarioSelected: selectedOption})}
    onChangeProveedor = (selectedOption) => {this.setState({proveedorSelected: selectedOption})}
    onChangeCantidad = (e) => {this.setState({cantidad: e.target.value}, () => this.calcularTotal())}
    onChangeCosto = (e) => {this.setState({costo: e.target.value}, () => this.calcularTotal())}
    calcularTotal = () => {
        let total = 0;
        total = parseInt(this.state.cantidad.replace(/\./gi,'')) * parseInt(this.state.costo.replace(/\./gi,''));
        this.setState({total})
    }
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
        
        if(this.props.idUpdate === "NEW" || this.props.idUpdate === "" ){
            const compras = {
                numerofactura: this.state.numerofactura,
                inventario: this.state.inventarioSelected.value,
                proveedor: this.state.proveedorSelected.value,
                cantidad: this.state.cantidad,
                costo: this.state.costo,
                total: convertMiles(this.state.total),
                user_created: this.state.user_created,
                user_updated: this.state.user_updated
            }
            axios.post(configData.serverUrl + '/compras/add',compras)
                .then(res => this.showNotification(true))
                .catch(err => this.showNotification(false));
                this.setState({
                    numerofactura: '',
                    inventarioSelected: this.state.inventarioOptions[0],
                    proveedorSelected: this.state.proveedorOptions[0],
                    cantidad: '',
                    costo: '',
                    total: '',
                    textButton:'Crear',
                    titleForm: 'Crear Compra',
                    idUpdate:'NEW'
                })                   
        }else{            
            const compras = {
                numerofactura: this.state.numerofactura,
                inventario: this.state.inventarioSelected[0].value,
                proveedor: this.state.proveedorSelected[0].value,
                cantidad: this.state.cantidad,
                costo: this.state.costo,
                total: convertMiles(this.state.total),
                user_updated: this.state.user_updated
            }
            axios.post(configData.serverUrl + '/compras/update/'+this.state.idUpdate,compras)
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
                                <label>Factura: </label>
                                <input type="text" 
                                    autoFocus={true}
                                    ref={c => (this._input = c)}
                                    required
                                    className="form-control"
                                    value={this.state.numerofactura}
                                    onChange={this.onChangeNumeroFactura}
                                />
                            </div>      
                            <div className="form-group col-md-12">
                                <label>Inventario: </label>
                                <Select               
                                    noOptionsMessage={() => <a href="/Inventarios">Cargar Inventario</a>}
                                    value={this.state.inventarioSelected} 
                                    options={this.state.inventarioOptions} 
                                    onChange={this.onChangeInventario}                                    
                                    required/>
                            </div>                          
                            <div className="form-group col-md-12">
                                <label>Proveedor: </label>
                                <Select               
                                    noOptionsMessage={() => <a href="/Proveedores">Cargar Proveedor</a>}
                                    value={this.state.proveedorSelected} 
                                    options={this.state.proveedorOptions} 
                                    onChange={this.onChangeProveedor}                                    
                                    required/>
                            </div>
                            <div className="form-group col-md-4">
                                <label>Cantidad: </label>
                                <NumberFormat 
                                    thousandSeparator = "."
                                    decimalSeparator = ","
                                    className="form-control"
                                    value={this.state.cantidad}
                                    onChange={this.onChangeCantidad}
                                    required
                                />
                            </div>  
                            <div className="form-group col-md-4">
                                <label>Costo: </label>
                                <NumberFormat 
                                    thousandSeparator = "."
                                    decimalSeparator = ","
                                    className="form-control"
                                    value={this.state.costo}
                                    onChange={this.onChangeCosto}
                                    required
                                />
                            </div> 
                            <div className="form-group col-md-4">
                                <label>Total: </label>
                                <NumberFormat 
                                    disabled
                                    thousandSeparator = "."
                                    decimalSeparator = ","
                                    className="form-control"
                                    value={this.state.total}
                                    onChange={this.onChangeTotal}
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
