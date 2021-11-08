import React, {Component} from 'react';
import axios from 'axios';
import NumberFormat from 'react-number-format';
import DatePicker from 'react-datepicker';
import MaskedInput from 'react-maskedinput';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import '../../../utils/registerLocaleEsp';
import { convertMiles } from '../../../utils/utils';
import { usuarioLogueado } from '../../../App';
const configData = require('../../../config.json');


export default class ReservasForm extends Component{
    constructor(props){
        super(props);
        this.state = {  
            user_created: usuarioLogueado.name,
            user_updated: usuarioLogueado.name,
            cancha: {id:'', title:''},
            monto:'', 
            reservadoPor: '',
            telefono:'',
            horasDisponibles: [7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24],
            fechaReserva: ''
        };        
    }
    getData = async () => {
        if((this.props.id && this.state.cancha._id !== this.props.id) || this.props.fechaReserva !== this.state.fechaReserva ){
           await axios.get(configData.serverUrl + "/canchas/"+this.props.id)
                .then(response => {
                    this.setState({
                        cancha: response.data,
                        fechaReserva: this.props.fechaReserva
                    })
                })
                .catch(err => console.log(err));

            this.initFields();
        }
    }

    //Metodo que se ejecuta antes del render
    componentDidMount(){this.getData()}
    componentDidUpdate(){this.getData()}

    onChangeReservadoPor = (e) => {this.setState({reservadoPor: e.target.value})}
    onChangeFechaReserva = (date) => {this.setState({fechaReserva: date})}  
    onChangeTelefono = (e) => {this.setState({telefono: e.target.value})}

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
        //this._input.focus(); 
        //actualizar Lista
        this.props.onUpdateParentList('true');
        setTimeout(function(){  document.querySelector('#alert').classList.replace('show','hide'); }, 3000);
    }

    handleCloseAlert = () =>{
        document.querySelector('#alert').classList.replace('show','hide');
    }
    
    calcularMonto = () => {
        let horas = [];
        let precioHora = parseInt(this.state.cancha.precioHora.replace(/\./gi,''));
        document.querySelectorAll("[type='checkbox']:checked").forEach((item) => {horas.push(item.value)})
        let monto = precioHora * horas.length;
        this.setState({monto});
        if(monto === 0){
            document.querySelectorAll("[type='checkbox']")[0].setAttribute('required','');
        }else{
            document.querySelectorAll("[type='checkbox']")[0].removeAttribute('required');
        }
    }

    initFields = () =>{ 
        document.querySelectorAll("[type='checkbox']")[0].setAttribute('required','');
        document.querySelectorAll("[type='checkbox']:checked").forEach((item) => item.checked = false);        
    }
    onSubtmit = (e) => {
        e.preventDefault();
        let horas = [];
        let precioHora = parseInt(this.state.cancha.precioHora.replace(/\./gi,''));
        document.querySelectorAll("[type='checkbox']:checked").forEach((item) => {horas.push(item.value)})
        let fecha = moment(this.state.fechaReserva).format('DD/MM/YYYY');

        const reserva = {
            cancha: this.state.cancha._id,
            reservado_por: this.state.reservadoPor,
            telefono: this.state.telefono,
            reserva_fecha: fecha,
            reserva_horas: horas, 
            reserva_hora_inicial: horas[0],
            estado: 'Reservado',
            total_monto: convertMiles(precioHora * horas.length),
            user_created: this.state.user_created,
            user_updated: this.state.user_updated
        }        
        axios.post(configData.serverUrl + '/reservas/add',reserva)
            .then(response => {
                const reservanew = response.data;
                //Creando la cancha como consumision
                const consumision = {
                    reserva: reservanew._id,
                    cancha: this.state.cancha._id,
                    cantidad: 1,
                    precio_unitario: reservanew.total_monto,
                    precio_total: reservanew.total_monto,
                    user_created: this.state.user_created,
                    user_updated: this.state.user_updated
                }
                
                axios.post(configData.serverUrl + '/consumisiones/add',consumision)
                    .then(res => this.showNotification(true))
                    .catch(err => this.showNotification(false));

                })
            .catch(err => this.showNotification(false));

        this.setState({ 
            monto:'',            
            reservadoPor: '',
            telefono:'',
            horasDisponibles: [7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24],
            fechaReserva: ''
        })       
        this.initFields();   
        

    }   
    
    render(){
        return(
            <div className="container"> 
                <h4>{this.state.cancha.descripcion}</h4>
                <form onSubmit={this.onSubtmit}>
                        <div className="row">
                            <div className="form-group col-md-6">
                                <label>Fecha</label>
                                <DatePicker     
                                    className="form-control datepicker"
                                    locale="esp"
                                    disabled
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
                            <div className="form-group col-md-6">
                                <label>Telefono: </label>
                                <MaskedInput type="text" 
                                    className="form-control"
                                    mask="(09##) ###-###"
                                    value={this.state.telefono}
                                    onChange={this.onChangeTelefono}
                                />
                            </div> 
                            <div className="form-group col-md-12">
                                <label>Reservado Por: </label>
                                <input type="text" 
                                    required
                                    className="form-control"
                                    value={this.state.reservadoPor}
                                    onChange={this.onChangeReservadoPor}
                                />
                            </div> 
                            
                            <div className="form-group col-md-12 hours-selected-container">
                                <label>Horas: </label>
                                {this.state.horasDisponibles.map(element => {
                                    return (
                                        <div key={element} className="hours-selected-item" >
                                            <input className="form-check-input" onClick={() => this.calcularMonto()} type="checkbox" value={`${element}`} id={"check_"+element} ></input>
                                            <span> {`${element}hs`} </span>
                                        </div>
                                        )
                                })}
                                
                            </div>                            
                            <div className="form-group col-md-6">
                                <label>Monto: </label>
                                <NumberFormat 
                                    thousandSeparator = "."
                                    decimalSeparator = ","
                                    className="form-control"
                                    disabled={true}
                                    value={this.state.monto}
                                />
                            </div> 
                        </div>
                    <div className="form-group">
                        <button type="submit" className="btn btn-warning"><FontAwesomeIcon icon={faArrowLeft}/> Crear</button>                        
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
