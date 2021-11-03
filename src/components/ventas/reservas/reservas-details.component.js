import React, {Component} from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faPlus, faEdit, faTrash} from '@fortawesome/free-solid-svg-icons';
const configuracion = require('../../../config.json');

export default class ReservasDetails extends Component{
    constructor(props){
        super(props);
        this.state = {
            datos: [],
            idUpdate: '',
            fechaReserva: new Date(),
            didUpdate: true
        }
        this.datalist = this.datalist.bind(this);
    }

    updateList = async () => {
        await axios.get(configuracion.serverUrl + "/canchas/")
            .then(response => {
                if(response.data.length > 0){                    
                    this.setState({
                        datos: response.data
                    })  
                }
            })
            .catch(err => console.log(err))
    }

    componentDidMount(){this.updateList();}
    onChangeFechaReserva = (date) => {this.setState({fechaReserva: date})}    
    updateData = (jsondatos) => window.location.href = "/reservas/details/"+jsondatos._id;
    createData = (jsondatos) => window.location.href = "/reservas/create/"+jsondatos._id;

    datalist(){
        return this.state.datos.map(dato => {
            return (
                <li className="list-group-item d-flex" key={dato._id}>
                    <div className="col-md-2">{dato.codigo}</div>
                    <div className="col-md-8">{dato.descripcion}<br/>
                        <span className="details-user-actions">
                            <b> Horarios Disponibles: </b>
                        </span>
                    </div>
                    <div className="col-md-2 text-right">
                        <button onClick={() => this.createData(dato)} type="button" className="btn btn-success btn-sm mr-1"><FontAwesomeIcon icon={faPlus} /></button>
                        <button onClick={() => this.details(dato)} type="button" className="btn btn-light btn-sm mr-1"><FontAwesomeIcon icon={faEdit} /></button>
                    </div>
                </li>)
        })
    }
    render(){       
        return(
            <div className="content-wrapper" id="content">
                <h2>Detalles de Reservas de la [Cancha 1]</h2>
                <div className="row">
                    <div className="col-md-12">
                        <div className="card">
                            <div className="card-header">
                                <div className="card-title row mb-0">  
                                    <div className="col-md-2">Codigo</div>
                                    <div className="col-md-4">Descripcion</div>
                                    <div className="col-md-6 text-right d-flex">
                                        <div className="col-md-8">
                                        Reserva a la fecha de: 
                                        </div>
                                        <div className="col-md-4">
                                        <DatePicker     
                                            className="form-control" 
                                            locale="esp"
                                            required
                                            dateFormat="dd/MM/yyyy"
                                            selected={this.state.fechaReserva}
                                            onChange={this.onChangeFechaReserva}
                                            showYearDropdown
                                            isClearable
                                        />                        
                                        </div>             
                                    </div>                                                                     
                                </div>
                            </div>
                            <ul id="list" className="list-group">
                                {this.datalist()}
                            </ul>                     
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}