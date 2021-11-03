import React, {Component} from 'react';
import axios from 'axios';
import UsuariosForm from './usuarios-form.component';
import { Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faPlus, faEdit, faTrash, faExclamationCircle} from '@fortawesome/free-solid-svg-icons';
const configuracion = require('../../../config.json');

export default class UsuariosList extends Component{
    constructor(props){
        super(props);
        this.state = {
            datos: [],
            loading: true,
            idUpdate: '',
            didUpdate: true
        }
        this.datalist = this.datalist.bind(this);
    }

    updateList = async () => {
        await axios.get(configuracion.serverUrl + "/usuarios/")
            .then(response => {
                this.setState({
                    datos: response.data,
                    loading: false
                })  
            })
            .catch(err => console.log(err))
    }

    componentDidMount(){      
        this.updateList();
    }
    
    deleteData = async (jsondatos) => {
        await axios.delete(configuracion.serverUrl + "/usuarios/"+jsondatos._id)
            .then(res => console.log(res.data))
            .catch(err => console.log(err))

        this.setState({
            datos: this.state.datos.filter(el => el._id !== jsondatos._id)
        });
    }

    updateData = (jsondatos) => {this.setState({idUpdate: jsondatos._id})}
    createData = (id) => {this.setState({idUpdate: id})}

    datalist(){
        return this.state.datos.map(dato => {
            return (
                <li className="list-group-item" key={dato._id}>
                    <div className="col-md-2">{dato.nickname}</div>
                    <div className="col-md-5">{dato.nombre_completo}</div>
                    <div className="col-md-3">{dato.roles.join(', ')}</div>
                    <div className="col-md-2 text-right">
                        <button onClick={() => this.updateData(dato)} type="button" className="btn btn-light btn-sm mr-1"><FontAwesomeIcon icon={faEdit} /></button>
                        <button onClick={() => this.deleteData(dato)} type="button" className="btn btn-danger btn-sm"><FontAwesomeIcon icon={faTrash} /></button>
                    </div>
                </li>)
        })
    }
    render(){       
        return(
            <div className="content-wrapper" id="content">
                <h2>Usuarios</h2>
                <div className="row">
                    <div className="col-md-8">
                        <div className="alert alert-warning">
                            <FontAwesomeIcon icon={faExclamationCircle} /> Para ver los cambios cierre session y vuelva a ingresar
                        </div>
                        <div className="card">
                            <div className="card-header">
                                <div className="card-title row mb-0">  
                                    <div className="col-md-2">Nickname</div>
                                    <div className="col-md-5">Nombre Completo</div>
                                    <div className="col-md-3">Roles</div>
                                    <div className="col-md-2 text-right">
                                        <button onClick={() => this.createData("NEW")} type="button" className="btn btn-warning btn-sm"><FontAwesomeIcon icon={faPlus} /> Nuevo</button>
                                    </div>                                 
                                </div>
                            </div>
                            <input className="form-control inputsearch" type="search" placeholder="Busqueda (minimo 3 letras)..." />
                            <ul id="list" className="list-group">
                                {this.state.loading  ? 
                                    <Spinner animation="border" variant="primary" style={{margin:"25px",alignSelf:"center"}}/> 
                                :
                                    this.state.datos.length === 0 ?
                                        <div className="col-md-12 text-center m-3">Sin registros encontrados</div>
                                    :
                                        this.datalist()
                                }
                            </ul>                     
                        </div>
                    </div>
                    <div className="col-md-4">
                        <UsuariosForm idUpdate={this.state.idUpdate} onUpdateParentList={this.updateList}/>
                    </div>
                </div>
            </div>
        )
    }
}