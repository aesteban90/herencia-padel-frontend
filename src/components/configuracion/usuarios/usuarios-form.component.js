import React, {Component} from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { usuarioLogueado } from '../../../App';
const configData = require('../../../config.json');

export default class UsuariosForm extends Component{
    constructor(props){
        super(props);
        this.state = {  
            nickname: '',
            nombre_completo: '',
            password: '',
            roles: configData.roles,
            rolesSelected: [],
            user_created: usuarioLogueado.name,
            user_updated: usuarioLogueado.name,
            textButton:'Crear',
            titleForm: 'Crear Usuario',
            idUpdate: 'NEW'
        };        
    }
    getRolesSelected = (e) => { 
        //Limpiando primero
        document.querySelectorAll('[type=checkbox]').forEach(item => item.checked = false)
        this.state.rolesSelected.forEach(item => {
            if(document.querySelector('#check_'+item)){
                document.querySelector('#check_'+item).checked = true; 
            }
        })
    }

    //Metodo que obtiene cualquier actualizacion de otros componentes donde fue llamado
    componentDidUpdate(){        
        if(this.state.idUpdate !== this.props.idUpdate ){
            this.setState({ idUpdate: this.props.idUpdate});
            if(this.props.idUpdate !== "NEW" && this.props.idUpdate !== "" ){
                axios.get(configData.serverUrl + "/usuarios/"+this.props.idUpdate)
                .then(response => {
                    this.setState({
                        nickname: response.data.nickname,
                        nombre_completo: response.data.nombre_completo,
                        password: response.data.password,
                        rolesSelected: response.data.roles,
                        textButton:'Editar',
                        titleForm: 'Editar Usuario'
                    }, () => this.getRolesSelected())
                })
                .catch(err => console.log(err));
            }else{
                this.setState({
                    nickname: '',
                    nombre_completo: '',
                    password: '',
                    textButton:'Crear',
                    titleForm: 'Crear Usuario',
                    idUpdate: this.props.idUpdate
                });
            }
        }
    }
    onChangeNickname = (e) => {this.setState({nickname: e.target.value})}
    onChangeNombreCompleto = (e) => {this.setState({nombre_completo: e.target.value})}
    onChangePassword = (e) => {this.setState({password: e.target.value})}
    
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
    roleslist = () => {    
        return this.state.roles.map((rol,index) => {
            return (<li className="list-group-item list-group-item-roles " key={"key-"+index}>
                    <div className="col-md-1">
                        <input className="form-check-input" type="checkbox" value={rol.rol} id={"check_"+rol.rol}></input>
                    </div>
                    <div className="col-md-4">{rol.rol}</div>
                    <div className="col-md-7">{rol.descripcion}</div>
                </li>)
        })
    }
    
    onSubtmit = (e) => {
        e.preventDefault();
        let rolesSelected = [];
        document.querySelectorAll("[type='checkbox']:checked").forEach((item) => {rolesSelected.push(item.value)});

        if(this.props.idUpdate === "NEW" || this.props.idUpdate === "" ){
            const usuario = {
                nickname: this.state.nickname,
                nombre_completo: this.state.nombre_completo,
                password: this.state.password,
                roles: rolesSelected,
                user_created: this.state.user_created,
                user_updated: this.state.user_updated
            }
            axios.post(configData.serverUrl + '/usuarios/add',usuario)
                .then(res => this.showNotification(true))
                .catch(err => this.showNotification(false));
             
            this.setState({
                nickname: '',
                nombre_completo: '',
                password: '',
                rolesSelected: [],
                textButton:'Crear',
                titleForm: 'Crear Usuario',
                idUpdate:'NEW'
            })     
        }else{
            const usuario = {
                nickname: this.state.nickname,
                nombre_completo: this.state.nombre_completo,
                password: this.state.password,
                roles: rolesSelected,
                user_updated: this.state.user_updated
            }
            axios.post(configData.serverUrl + '/usuarios/update/'+this.state.idUpdate,usuario)
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
                            <label>Nombre Completo: </label>
                            <input type="text" 
                                autoFocus={true}
                                ref={c => (this._input = c)}
                                required
                                className="form-control"
                                value={this.state.nombre_completo}
                                onChange={this.onChangeNombreCompleto}
                            />
                        </div>
                        <div className="form-group col-md-6">
                            <label>Nickname: </label>
                            <input type="text" 
                                required
                                className="form-control"
                                value={this.state.nickname}
                                onChange={this.onChangeNickname}
                            />
                        </div>      
                        <div className="form-group col-md-6">
                            <label>Password: </label>
                            <input type="password" 
                                required
                                className="form-control"
                                value={this.state.password}
                                onChange={this.onChangePassword} 
                            />
                        </div>
                        <div className="col-md-12">                                                      
                            <div className="card">
                                <div className="card-header">
                                    <div className="card-title d-flex">  
                                        <div className="col-md-1"></div>
                                        <div className="col-md-4">Rol</div>
                                        <div className="col-md-7">Descripcion</div>  
                                    </div>                              
                                </div>
                                <ul id="list" className="list-group">
                                    {this.roleslist()}  
                                </ul>
                            </div>                            
                        </div>  
                    </div>
                    <br />
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
