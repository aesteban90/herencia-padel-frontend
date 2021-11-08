import React, {Component} from 'react';
import Select from 'react-select';
import axios from 'axios';
import NumberFormat from 'react-number-format';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileInvoiceDollar } from '@fortawesome/free-solid-svg-icons';
import { usuarioLogueado }from '../../../App.js'
import { getDiv } from '../../../utils/utils.js'
const configData = require('../../../config.json');

export default class FacturasForm extends Component{
    constructor(props){
        super(props);
        this.state = {  
            reserva: {},
            ruc: '',
            div:'',
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
        
        //Obteniendo la lista de clientes para la facturacion
        this.getClientesOptions();

        //Obteniendo los datos de la Reserva y los productos
        this.setState({reserva: this.props.reserva})
    }

    onChangeCliente = (selectedOption) => {
        this.setState({
            clienteSelected: selectedOption,
            ruc: selectedOption.value.ruc,
            div: selectedOption.value.div,
            razonSocial: selectedOption.value.razonsocial
        })
    }
    onChangeRuc = (e) => {
        this.setState({
            ruc: e.target.value,
            div: getDiv(e.target.value)
        })
    }  
    onChangeRazonSocial = (e) => {this.setState({razonSocial: e.target.value})}

    showNotification(success, factura){        
        document.querySelector('#alert').classList.replace('hide','show');
        if(success){
            document.querySelector('#alert').classList.replace('alert-warning','alert-success');
            document.querySelector('#alert #text').innerHTML = '<strong>Exito!</strong> Factura Generada'

            window.open('/Factura/Impresion/'+factura._id , '_blank');
        }else{
            document.querySelector('#alert').classList.replace('alert-success','alert-warning');
            document.querySelector('#alert #text').innerHTML = '<strong>Error!</strong> No se pudo generar la Factura. <br />Contacte con el administrador.'
        }        
        setTimeout(function(){  document.querySelector('#alert').classList.replace('show','hide'); }, 3000);        
    }

    handleCloseAlert = () =>{
        document.querySelector('#alert').classList.replace('show','hide');
    }
    
    onSubtmit = (e) => {
        e.preventDefault(); 
        document.querySelector('#alert').classList.replace('hide','show');   
        document.querySelector('#alert').classList.replace('alert-warning','alert-light');
        document.querySelector('#alert #text').innerHTML = '<div class="spinner-border" role="status"></div> Generando la factura..'         
        
        const factura = {
            reserva: this.state.reserva._id,
            cabecera_datos_titulo: 'EMEVA S.R.L.',  
            cabecera_datos_subtitulo: 'ACTIVIDADES DE DIVERSION Y ENTRETENIMIENTO',
            cabecera_datos_direccion: 'Calle: Paso de Patria 848 c/ Av. Bruno Guggiari - Lambare, Central<br />Sucursal 1: San Estanislao e/ Yuty y Carmen del Parana - Lambare, Central<br />Celulares: (0984) 919 991 / (0981) 203 966 emevasrl@gmail.com',
            cabecera_timbrado: '15180240',
            cabecera_vigencia_inicio: '19-10-2021',
            cabecera_vigencia_fin: '31-10-2022',
            cabecera_ruc: '80117565-8',
            cabecera_factura: '002 001',
            cliente_ruc: this.state.ruc + '-' + this.state.div,
            cliente_razon_social: this.state.razonSocial,
            productos: this.props.FacturasListState.groupByItem,
            subtotal_iva5incluido: this.props.FacturasListState.subtotal_iva5incluido,
            subtotal_iva10incluido: this.props.FacturasListState.subtotal_iva10incluido,
            subtotal_excentas: this.props.FacturasListState.subtotal_excentas,
            total_pagar: this.props.FacturasListState.total_pagar,
            total_iva5: this.props.FacturasListState.total_iva5,
            total_iva10: this.props.FacturasListState.total_iva10,
            total_iva: this.props.FacturasListState.total_iva,
            user_created: this.state.user_created,
            user_updated: this.state.user_created  
        }
        axios.post(configData.serverUrl + '/facturas/add',factura)
            .then(res => {
                const factura = res.data;
                const pagos = {
                    factura: factura._id,
                    idsPagos: this.props.FacturasListState.idsPagos
                }
                
                //Actualizando los pagos
                axios.post(configData.serverUrl + '/pagos/updateMany', pagos)
                    .then(() => console.log('Pagos actualizados'))
                    .catch(err => console.log('Error en actualizacion de pagos', err));
                this.showNotification(true, factura)
            })
            .catch(err => this.showNotification(false));
        this.setState({
            ruc:'',
            div:'',
            razonSocial:'',
            clienteSelected: {}
        })
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
                        <div className="form-group col-md-6">
                            <label>Ruc: </label>
                            <NumberFormat 
                                thousandSeparator = "."
                                decimalSeparator = "_"                               
                                required
                                className="form-control"
                                value={this.state.ruc}
                                onChange={this.onChangeRuc}
                            />
                        </div> 
                        <div className="form-group col-md-6">
                            <label>DIV: </label>
                            <input type="number" 
                                disabled
                                id="idDiv"
                                className="form-control"
                                value={this.state.div}                                    
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
