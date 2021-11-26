import React, {Component} from 'react';
import axios from 'axios';
import NumberFormat from 'react-number-format';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { getDiv } from '../../../utils/utils.js'
import { usuarioLogueado } from '../../../App.js';
const configData = require('../../../config.json');

export default class CategoriasForm extends Component{
    constructor(props){
        super(props);
        this.state = {  
            descripcion:'',
            precio:'',
            user_created: usuarioLogueado.name,
            user_updated: usuarioLogueado.name,
            textButton:'Crear',
            titleForm: 'Crear Categoria',
            idUpdate: 'NEW'
        };        
    }
    //Metodo que obtiene cualquier actualizacion de otros componentes donde fue llamado
    componentDidUpdate(){        
        if(this.state.idUpdate !== this.props.idUpdate ){
            this.setState({ idUpdate: this.props.idUpdate});
            if(this.props.idUpdate !== "NEW" && this.props.idUpdate !== "" ){
                axios.get(configData.serverUrl + "/categorias/"+this.props.idUpdate)
                .then(response => {
                    this.setState({
                        descripcion: response.data.descripcion,
                        razonsocial: response.data.razonsocial,
                        precio: response.data.precio,
                        textButton:'Editar',
                        titleForm: 'Editar Categoria'
                    })
                })
                .catch(err => console.log(err));
            }else{
                this.setState({
                    descripcion:'',
                    precio:'',
                    textButton:'Crear',
                    titleForm: 'Crear Categoria',
                    idUpdate: this.props.idUpdate
                });
            }
        }
    }
    componentDidMount(){
        //Enfocar el input
        this._input.focus(); 
    }

    onChangeDescripcion = (e) => {this.setState({descripcion: e.target.value})}
    onChangePrecio = (e) => {this.setState({precio: e.target.value})}
    
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
            const categoria = {
                descripcion: this.state.descripcion,
                precio: this.state.precio,
                user_created: this.state.user_created,
                user_updated: this.state.user_updated
            }
            axios.post(configData.serverUrl + '/categorias/add',categoria)
                .then(res => this.showNotification(true))
                .catch(err => this.showNotification(false));
            this.setState({
                descripcion:'',
                precio:'',
                textButton:'Crear',
                titleForm: 'Crear Categoria',
                idUpdate:'NEW'
            })       
        }else{
            const categoria = {
                descripcion: this.state.descripcion,
                precio: this.state.precio,
                user_updated: this.state.user_updated
            }
            axios.post(configData.serverUrl + '/categorias/update/'+this.state.idUpdate,categoria)
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
                                <label>Descripcion: </label>
                                <input type="text" 
                                    required                                    
                                    className="form-control"
                                    value={this.state.descripcion}
                                    onChange={this.onChangeDescripcion}
                                />
                            </div>
                            <div className="form-group col-md-6">
                                <label>Precio: </label>
                                <NumberFormat 
                                    thousandSeparator = "."
                                    decimalSeparator = "_"
                                    autoFocus={true}       
                                    getInputRef={c => (this._input = c)}                                 
                                    required
                                    className="form-control"
                                    value={this.state.precio}
                                    onChange={this.onChangePrecio}
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
