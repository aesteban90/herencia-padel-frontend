import React, {Component} from 'react';
import axios from 'axios';
import NumberFormat from 'react-number-format';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { getDiv } from '../../../utils/utils.js'
import { usuarioLogueado } from '../../../App.js';
const configData = require('../../../config.json');

export default class ClienteForm extends Component{
    constructor(props){
        super(props);
        this.state = {  
            ruc:'',
            div:'',
            razonsocial:'',
            user_created: usuarioLogueado.name,
            user_updated: usuarioLogueado.name,
            textButton:'Crear',
            titleForm: 'Crear Cliente',
            idUpdate: 'NEW'
        };        
    }
    //Metodo que obtiene cualquier actualizacion de otros componentes donde fue llamado
    componentDidUpdate(){        
        if(this.state.idUpdate !== this.props.idUpdate ){
            this.setState({ idUpdate: this.props.idUpdate});
            if(this.props.idUpdate !== "NEW" && this.props.idUpdate !== "" ){
                axios.get(configData.serverUrl + "/clientes/"+this.props.idUpdate)
                .then(response => {
                    this.setState({
                        ruc: response.data.ruc,
                        razonsocial: response.data.razonsocial,
                        div: response.data.div,
                        textButton:'Editar',
                        titleForm: 'Editar Cliente'
                    })
                })
                .catch(err => console.log(err));
            }else{
                this.setState({
                    ruc:'',
                    div:'',
                    razonsocial:'',
                    textButton:'Crear',
                    titleForm: 'Crear Cliente',
                    idUpdate: this.props.idUpdate
                });
            }
        }
    }
    componentDidMount(){
        //Enfocar el input
        this._input.focus(); 
    }

    onChangeRazonSocial = (e) => {this.setState({razonsocial: e.target.value})}
    onChangeRuc = (e) => {
        this.setState({
            ruc: e.target.value,
            div: getDiv(e.target.value)
        })
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
            const clientes = {
                ruc: this.state.ruc,
                div: this.state.div,
                razonsocial: this.state.razonsocial,
                user_created: this.state.user_created,
                user_updated: this.state.user_updated
            }
            axios.post(configData.serverUrl + '/clientes/add',clientes)
                .then(res => this.showNotification(true))
                .catch(err => this.showNotification(false));
            this.setState({
                ruc:'',
                div:'',
                razonsocial:'',
                textButton:'Crear',
                titleForm: 'Crear Cliente',
                idUpdate:'NEW'
            })       
        }else{
            const clientes = {
                ruc: this.state.ruc,
                razonsocial: this.state.razonsocial,
                div: this.state.div,
                user_updated: this.state.user_updated
            }
            axios.post(configData.serverUrl + '/Clientes/update/'+this.state.idUpdate,clientes)
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
                                <label>Ruc: </label>
                                <NumberFormat 
                                    thousandSeparator = "."
                                    decimalSeparator = "_"
                                    autoFocus={true}       
                                    getInputRef={c => (this._input = c)}                                 
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
                                    value={this.state.razonsocial}
                                    onChange={this.onChangeRazonSocial}
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
