import React, {Component} from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import MaskedInput from 'react-maskedinput';
import ReservasForm from './reservas-form.component';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faPlus, faEdit} from '@fortawesome/free-solid-svg-icons';
import Spinner from 'react-bootstrap/Spinner';
const configuracion = require('../../../config.json');

export default class ReservasList extends Component{
    constructor(props){
        super(props);
        this.state = {
            datos: [],
            reservas: [],
            loadingDet: true,
            idUpdate: '',
            horasDisponibles: [7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24],
            fechaReserva: new Date(),
            didUpdate: true
        }
        this.datalist = this.datalist.bind(this);
    }

    updateList = () => {
        //Obteniendo la lista de canchas
        this.canchasList();
        //Obteniendo la lista de Reservas por fecha
        this.reservasList();
    }
    canchasList = async () => {
        await axios.get(configuracion.serverUrl + "/canchas")
            .then(response => {
                this.setState({
                    datos: response.data,
                    id: response.data[0]._id
                })  
                
            })
            .catch(err => console.log(err))
    }
    reservasList = async () => {
        let fecha = moment(this.state.fechaReserva).format('DD/MM/YYYY');
        //let fecha = new Date();
        await axios.post(configuracion.serverUrl + "/reservas/fecha",{fechaReserva: fecha})
            .then(response => {
                console.log()
                this.setState({
                    reservas: response.data,
                    loadingDet: false
                })
            })
            .catch(err => console.log(err))
    }

    componentDidMount(){this.updateList();}
    onChangeFechaReserva = (date) => {this.setState({fechaReserva: date}, () => this.reservasList())}    
    createData = (jsondatos) => this.setState({id:jsondatos._id})
    reservaDetails = (jsondatos) => {window.location.href = "/Reservas/Details/"+jsondatos._id}
    dataListReservas = (jsondatos) => {
        return this.state.reservas.map(reserva => {
            if(jsondatos._id === reserva.cancha){
                let saldoNegativo = (reserva.total_saldo && reserva.total_saldo.indexOf('-')>-1 ? {color:'red',fontWeight:'bold'} : undefined)
                return(
                    <li className="list-group-item" key={reserva._id}>
                        <div className="col-md-4">
                            <b>Reservado por: </b>{reserva.reservado_por}<br/>
                            <b>Reservado: </b>{reserva.fecha}<br/>
                            <div className="hours-selected-container">
                                <b>Horas:</b> 
                                {reserva.horas.map(element => {
                                    return (
                                        <div key={element} className="hours-selected-item-info" >
                                            <span> {`${element}hs`} </span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                        <div className="col-md-3">
                            <b>Telefono: </b>{reserva.telefono}<br/>
                            <b>Estado:</b> {reserva.estado}
                        </div>
                        <div className="col-md-3 details-consumision">
                            <b>Monto:</b> <span>{reserva.total_monto} Gs.</span><br/>
                            <b>Pagado:</b> <span>{reserva.total_pagado} Gs.</span><br />
                            <b>Saldo:</b> <span style={saldoNegativo}>{reserva.total_saldo} Gs.</span>
                        </div>
                        <div className="col-md-2 text-right">
                        <button onClick={() => this.reservaDetails(reserva)} type="button" className="btn btn-warning btn-sm mr-1"> Detalles</button>
                        </div>
                    </li>
                )
            }
        })
    }

    datalist(){
        return this.state.datos.map(dato => {
            return (
                <li className="list-group-item" key={dato._id}>
                    
                        <div className="col-md-10"><b>{dato.descripcion}</b><br/>
                            <span className="details-user-actions">
                                <b> Precio por Hora: </b>{dato.precioHora} Gs.
                            </span><br/>
                            <span className="details-user-actions">
                                <b> Horarios Disponibles: </b>
                            </span> 
                        </div>
                        <div className="col-md-2 text-right">
                            <button onClick={() => this.createData(dato)} type="button" className="btn btn-success btn-sm mr-1"><FontAwesomeIcon icon={faPlus} /> Reserva</button>                        
                        </div>
                        <div className="col-md-12">                            
                            <ul className="list-group list-reservas">
                                {this.state.loadingDet  ? 
                                    <Spinner animation="border" variant="primary" style={{margin:"25px",alignSelf:"center"}}/> 
                                :
                                    this.state.datos.length === 0 ?
                                        <div className="col-md-12 text-center m-3">Sin registros encontrados</div>
                                    :
                                        this.dataListReservas(dato)
                                }
                            </ul>
                        </div>
                    
                </li>)
        })
    }
    render(){       
        return(
            <div className="content-wrapper" id="content">
                <h2>Reservas</h2>
                <div className="row">
                    <div className="col-md-8">
                        <div className="card">
                            <div className="card-header">
                                <div className="card-title row mb-0">  
                                    <div className="col-md-4">Descripcion</div>
                                    <div className="col-md-8 text-right d-flex">
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
                                            customInput={
                                                <MaskedInput mask="11/11/1111" placeholder="mm/dd/yyyy" />
                                            }                                           
                                        />                        
                                        </div>             
                                    </div>                                                                     
                                </div>
                            </div>
                            <ul id="list" className="list-group">
                                {this.state.datos.length === 0 ? 
                                    <div className="text-center">
                                        <Spinner animation="border" variant="primary" style={{margin:"25px"}}/>
                                    </div>
                                    : 
                                    this.datalist()}
                            </ul>                     
                        </div>
                    </div>
                    <div className="col-md-4 text-center">
                        {!this.state.id ? 
                            <Spinner animation="border" variant="primary" style={{margin:"25px"}}/> 
                        : 
                            <ReservasForm id={this.state.id} fechaReserva={this.state.fechaReserva} onUpdateParentList={this.reservasList}/>
                        }
                    </div>
                </div>
            </div>
        )
    }
}