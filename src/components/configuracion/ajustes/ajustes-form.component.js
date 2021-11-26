import React, {Component} from 'react';
import axios from 'axios';
import Select from 'react-select';
import NumberFormat from 'react-number-format';
import DatePicker from 'react-datepicker';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { usuarioLogueado } from '../../../App.js';
const configData = require('../../../config.json');

export default class AjustesForm extends Component{
    constructor(props){
        super(props);
        this.state = {  
            fecha_ajuste: new Date(),
            inventarioSelected: {},
            inventarioOptions: [],
            motivo: '',
            cantidad: '',
            user_created: usuarioLogueado.name,
            user_updated: usuarioLogueado.name,
            textButton:'Crear',
            titleForm: 'Crear Ajuste',
            idUpdate: 'NEW'
        };        
    }
    //Metodo que obtiene cualquier actualizacion de otros componentes donde fue llamado
    componentDidUpdate(){        
        if(this.state.idUpdate !== this.props.idUpdate ){
            this.setState({ idUpdate: this.props.idUpdate});
            if(this.props.idUpdate !== "NEW" && this.props.idUpdate !== "" ){
                axios.get(configData.serverUrl + "/ajustes/"+this.props.idUpdate)
                .then(response => {
                    this.setState({
                        fecha_ajuste: response.data.fecha_ajuste,
                        inventarioSelected: this.state.inventarioOptions.filter(el => el.value === response.data.inventario),
                        cantidad: response.data.cantidad,
                        motivo: response.data.motivo,
                        textButton:'Editar',
                        titleForm: 'Editar Ajuste'
                    })
                })
                .catch(err => console.log(err));
            }else{
                this.setState({
                    fecha_ajuste: new Date(),
                    inventario: this.state.inventarioOptions[0],
                    cantidad: '',
                    motivo: '',
                    textButton:'Crear',
                    titleForm: 'Crear Ajuste',
                    idUpdate: this.props.idUpdate
                });
            }
        }
    }

    //Metodo que se ejecuta antes del render
    componentDidMount(){
        this.getInventariosOptions(); //Obtener Inventarios
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
        
        console.log('Inventario',this.state.inventarioOptions);
    }
    onChangeFechaAjuste = (date) => {this.setState({fecha_ajuste: date})}    
    onChangeMotivo = (e) => {this.setState({motivo: e.target.value})}
    onChangeInventario = (selectedOption) => {this.setState({inventarioSelected: selectedOption})}
    onChangeCantidad = (e) => {this.setState({cantidad: e.target.value}, () => this.calcularTotal())}
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
            const ajuste = {
                motivo: this.state.motivo,
                inventario: this.state.inventarioSelected.value,
                descripcion: this.state.inventarioSelected.label,
                fecha_ajuste: this.state.fecha_ajuste,
                cantidad: this.state.cantidad,
                user_created: this.state.user_created,
                user_updated: this.state.user_updated
            }
            axios.post(configData.serverUrl + '/ajustes/add',ajuste)
                .then(res => this.showNotification(true))
                .catch(err => this.showNotification(false));
                this.setState({
                    fecha_ajuste: new Date(),
                    inventario: this.state.inventarioOptions[0],
                    cantidad: '',
                    motivo: '',
                    textButton:'Crear',
                    titleForm: 'Crear Ajuste',
                    idUpdate:'NEW'
                })                   
        }else{            
            const ajuste = {
                motivo: this.state.motivo,
                inventario: this.state.inventarioSelected.value,
                descripcion: this.state.inventarioSelected.label,
                fecha_ajuste: this.state.fecha_ajuste,
                cantidad: this.state.cantidad,
                user_updated: this.state.user_updated
            }
            axios.post(configData.serverUrl + '/ajustes/update/'+this.state.idUpdate,ajuste)
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
                            <div className="form-group col-md-12 d-none">
                                <label>Fecha Ajuste: </label>
                                    <DatePicker     
                                        className="form-control" 
                                        locale="esp"
                                        required
                                        dateFormat="dd/MM/yyyy"
                                        selected={this.state.fecha_ajuste}
                                        onChange={this.onChangeFechaAjuste}
                                        showYearDropdown
                                        isClearable
                                    />    
                            </div>                                 
                            <div className="form-group col-md-12">
                                <label>Inventario: </label>
                                <Select        
                                    autoFocus={true}
                                    ref={c => (this._input = c)}
                                    noOptionsMessage={() => <a href="/Inventarios">Cargar Inventario</a>}
                                    value={this.state.inventarioSelected} 
                                    options={this.state.inventarioOptions} 
                                    onChange={this.onChangeInventario}                                    
                                    required/>
                            </div>  
                            <div className="form-group col-md-12">
                                <label>Motivo: </label>
                                <input type="text" 
                                    required
                                    className="form-control"
                                    value={this.state.motivo}
                                    onChange={this.onChangeMotivo}
                                />
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
