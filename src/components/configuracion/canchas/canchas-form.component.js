import React, {Component} from 'react';
import axios from 'axios';
import NumberFormat from 'react-number-format';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { usuarioLogueado } from '../../../App';
const configData = require('../../../config.json');

export default class CanchasForm extends Component{
    constructor(props){
        super(props);
        this.state = {  
            codigo:'',
            descripcion:'',
            precioHora:'',
            user_created: usuarioLogueado.name,
            user_updated: usuarioLogueado.name,
            textButton:'Crear',
            titleForm: 'Crear Cancha',
            idUpdate: 'NEW'
        };        
    }
    //Metodo que obtiene cualquier actualizacion de otros componentes donde fue llamado
    componentDidUpdate(){        
        if(this.state.idUpdate !== this.props.idUpdate ){
            this.setState({ idUpdate: this.props.idUpdate});
            if(this.props.idUpdate !== "NEW" && this.props.idUpdate !== "" ){
                axios.get(configData.serverUrl + "/canchas/"+this.props.idUpdate)
                .then(response => {
                    this.setState({
                        codigo: response.data.codigo,
                        descripcion: response.data.descripcion,
                        precioHora: response.data.precioHora,
                        textButton:'Editar',
                        titleForm: 'Editar Cancha'
                    })
                })
                .catch(err => console.log(err));
            }else{
                this.setState({
                    codigo:'',
                    precioHora:'',
                    descripcion:'',
                    textButton:'Crear',
                    titleForm: 'Crear Cancha',
                    idUpdate: this.props.idUpdate
                });
            }
        }
    }

    //Metodo que se ejecuta antes del render
    componentDidMount(){}

    onChangeDescripcion = (e) => {this.setState({descripcion: e.target.value})}
    onChangeCodigo = (e) => {this.setState({codigo: e.target.value})}
    onChangePrecioHora = (e) => {this.setState({precioHora: e.target.value})}
    
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
            const canchas = {
                codigo: this.state.codigo,
                precioHora: this.state.precioHora,
                descripcion: this.state.descripcion,
                user_created: this.state.user_created,
                user_updated: this.state.user_updated
            }
            axios.post(configData.serverUrl + '/canchas/add',canchas)
                .then(res => this.showNotification(true))
                .catch(err => this.showNotification(false));
            this.setState({
                codigo:'',
                precioHora:'',
                descripcion:'',
                textButton:'Crear',
                titleForm: 'Crear Cancha',
                idUpdate:'NEW'
            })       
        }else{
            const canchas = {
                codigo: this.state.codigo,
                descripcion: this.state.descripcion,
                precioHora: this.state.precioHora,
                user_updated: this.state.user_updated
            }
            axios.post(configData.serverUrl + '/canchas/update/'+this.state.idUpdate,canchas)
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
                            <div className="form-group col-md-6">
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
                            <div className="form-group col-md-6">
                                <label>Precio por Hora: </label>
                                <NumberFormat 
                                    thousandSeparator = "."
                                    decimalSeparator = ","
                                    className="form-control"
                                    value={this.state.precioHora}
                                    onChange={this.onChangePrecioHora}
                                    required
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
