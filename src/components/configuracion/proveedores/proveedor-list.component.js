import React, {Component} from 'react';
import axios from 'axios';
import ProveedorForm from './proveedor-form.component';
import { Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
const configuracion = require('../../../config.json');

export default class ProveedorList extends Component{
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
        await axios.get(configuracion.serverUrl + "/proveedores/")
            .then(response => {
                this.setState({
                    datos: response.data,
                    loading: false
                })  
            })
            .catch(err => console.log(err))

        //Pagina la lista
        window.paginar('list-group','list-group-item',true);
    }

    componentDidMount(){      
        this.updateList();
    }
    componentDidUpdate(){}

    deleteData = async (jsondatos) => {
        await axios.delete(configuracion.serverUrl + "/proveedores/"+jsondatos._id)
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
                    <div className="col-md-4">{dato.ruc + "-" + dato.div}</div>
                    <div className="col-md-6">{dato.razonsocial}</div>
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
                <h2>Proveedores</h2>
                <div className="row">
                    <div className="col-md-8">
                        <div className="card">
                            <div className="card-header">
                                <div className="card-title row mb-0">  
                                    <div className="col-md-4">Ruc</div>
                                    <div className="col-md-6">Razon Social</div>
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
                        <ProveedorForm idUpdate={this.state.idUpdate} onUpdateParentList={this.updateList}/>
                    </div>
                </div>
            </div>
        )
    }
}