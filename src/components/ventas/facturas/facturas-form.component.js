import React, {Component} from 'react';
import Select from 'react-select';
import axios from 'axios';
import NumberFormat from 'react-number-format';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faFileInvoiceDollar } from '@fortawesome/free-solid-svg-icons';
import { usuarioLogueado }from '../../../App.js'
const configData = require('../../../config.json');
const {convertMiles} = require('../../../utils/utils')

export default class FacturasForm extends Component{
    constructor(props){
        super(props);
        this.state = {  
            reserva: {},
            ruc: '',
            razonSocial: '',
            clienteSelected: {},
            clienteOptions: [],
            user_created: usuarioLogueado.name,
            user_updated: usuarioLogueado.name,            
            textButton:'Imprimir',
            titleForm: 'Datos Factura',
            idUpdate: 'NEW'
        };        
    }
    //Metodo que obtiene cualquier actualizacion de otros componentes donde fue llamado
    componentDidUpdate(){    
    }

    getClientesOptions = () => {
        axios.get(configData.serverUrl + "/clientes")
        .then(response => {
            let options = [];
            response.data.forEach(element => {
                options.push({value:element,label:element.ruc+"-"+element.div +" "+element.razonsocial +" | CI:"+element.ruc.replace(/\./gi,'')});
            });
            this.setState({
                clienteOptions: options,                
            });
        })
        .catch(err => console.log(err))
    }


    //Metodo que se ejecuta antes del render
    componentDidMount(){
        this.getClientesOptions();

        //Obteniendo los datos de la Reserva
        this.setState({reserva: this.props.reserva})
    }

    onChangeCliente = (selectedOption) => {
        this.setState({
            clienteSelected: selectedOption,
            ruc: selectedOption.value.ruc + "-" + selectedOption.value.div,
            razonSocial: selectedOption.value.razonsocial
        })
    }
    onChangeRuc = (e) => {this.setState({ruc: e.target.value})}
    onChangeRazonSocial = (e) => {this.setState({razonSocial: e.target.value})}

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

    }   
    
    render(){  
        
        return(
            <div className="container"> 
                
                <form onSubmit={this.onSubtmit}>
                        <div className="row">
                            <div className="form-group col-md-12">
                                <label>Buscar Cliente Registrado: </label>
                                <Select                         
                                    noOptionsMessage={() => 'Sin resultados'}
                                    value={this.state.clienteSelected} 
                                    options={this.state.clienteOptions} 
                                    onChange={this.onChangeCliente}                                    
                                    required/>
                            </div>   
                            <hr className="solid"></hr>         
                            <h3>{this.state.titleForm}</h3>               
                            <div className="form-group col-md-12">
                                <label>Ruc: </label>
                                <input type="text" 
                                    required
                                    className="form-control"
                                    value={this.state.ruc}
                                    onChange={this.onChangeRuc}
                                />
                            </div>
                            <div className="form-group col-md-12">
                                <label>Razon Social: </label>
                                <input type="text" 
                                    required
                                    className="form-control"
                                    value={this.state.razonSocial}
                                    onChange={this.onChangeRazonSocial}
                                />
                            </div>
                        </div>
                        

                    <div className="form-group">
                        <button type="submit" className="btn btn-warning"><FontAwesomeIcon icon={faFileInvoiceDollar}/> {this.state.textButton}</button>
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
