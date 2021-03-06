import React, {Component} from 'react';
import axios from 'axios';
import NumberFormat from 'react-number-format';
import DatePicker from 'react-datepicker';
import MaskedInput from 'react-maskedinput';
import moment from 'moment';
import Select from 'react-select';
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
            id: undefined,
            user_created: usuarioLogueado.name,
            user_updated: usuarioLogueado.name,
            categoriaOptions: [],
            categoriaSelected: {},
            cancha: {id:'', title:''},
            monto:'', 
            pagado: 0,
            reservadoPor: '',
            horas: [],
            telefono:'',
            horasDisponibles: configData.horasDisponibles,
            fechaReserva: new Date()
        };        
    }
    getData = async () => {
        //Si existe la reserva
        if(this.props.reserva && this.props.reserva._id !== this.state.id){   
            let fecha = new Date(this.props.reserva.fecha_date)
            this.setState({
                id: this.props.reserva._id,
                cancha: this.props.reserva.cancha,
                fechaReserva: fecha,
                pagado: parseInt(this.props.reserva.total_pagado.replace('/\./gi','')),
                horas: this.props.reserva.horas,
                reservadoPor: this.props.reserva.reservado_por,                
                telefono: this.props.reserva.telefono,
                categoriaSelected: this.state.categoriaOptions.filter(el => el.label === this.props.reserva.categoria)[0],
                monto: this.props.reserva.total_monto
            }, () => this.initFields());     
        }else{
            if(!this.props.reserva){
                if((this.props.id && this.state.cancha._id !== this.props.id) || this.props.fechaReserva !== this.state.fechaReserva){
                    await axios.get(configData.serverUrl + "/canchas/"+this.props.id)
                        .then(response => {
                            this.setState({
                                id: undefined,
                                cancha: response.data,
                                fechaReserva: this.props.fechaReserva,
                                reservadoPor: '',
                                pagado: 0,
                                horas: [],
                                telefono: '',
                                monto: ''
                            }, () => this.initFields());
                        })
                        .catch(err => console.log(err));
                    
                    //Obteniendo categorias
                    let options = [];
                    await axios.get(configData.serverUrl + "/categorias")
                        .then(response => {
                            response.data.forEach(element => {
                                options.push({value:element,label:element.descripcion + " | "+ element.precio });
                            });
                        })
                        .catch(err => console.log(err));
                    this.setState({
                        categoriaSelected: options[0],
                        categoriaOptions: options            
                    }, () => this.initFields());
                }
            }
        }

       
    }

    //Metodo que se ejecuta antes del render
    componentDidMount(){this.getData()}
    componentDidUpdate(){this.getData()}
    onChangeCategoria = (element) => {
        this.setState({categoriaSelected: element}, () => this.calcularMonto())
    }
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
        if(this.state.categoriaSelected.value){
            let horas = [];
            let precioHora = parseInt(this.state.categoriaSelected.value.precio.replace(/\./gi,''));
            document.querySelectorAll("[type='checkbox']:checked").forEach((item) => {horas.push(item.value)});

            let monto = precioHora * horas.length;
            this.setState({monto});
            if(monto === 0){
                document.querySelectorAll("[type='checkbox']")[0].setAttribute('required','');
            }else{
                document.querySelectorAll("[type='checkbox']")[0].removeAttribute('required');
            }
        }
    }

    initFields = async () =>{ 
        console.log('############### Init Fields #################'); 
        console.log('State', this.state);

        document.querySelectorAll("[type='checkbox']")[0].setAttribute('required','');
        document.querySelectorAll("[type='checkbox']:checked").forEach((item) => item.checked = false); 

        //Limpia todos los disabled
        document.querySelectorAll("[type='checkbox']:disabled").forEach(item => {
            item.removeAttribute("disabled");
            item.removeAttribute("style");
            item.nextSibling.removeAttribute("style");
        });
        
        //Coloca los nuevos disabled
        document.querySelectorAll('.c-'+this.state.cancha._id+' .no-disponible>span').forEach(element => {
            const hour = parseInt(element.innerText.replace('hs',''));
            let input = document.querySelector('#check_'+hour);
            if(this.state.horas.includes(hour)){      
                input.checked = true;
            }else{
                input.checked = false;
                input.setAttribute("disabled", "true");
                input.setAttribute("style", "cursor:auto");
                input.nextSibling.setAttribute("style", "color: #c6c3c3");
            }            
        })

        //Calculando Monto al iniciar
        this.calcularMonto();
    }
    onSubtmit = async (e) => {
        e.preventDefault();
        let horas = [];
        let precioHora = parseInt(this.state.categoriaSelected.value.precio.replace(/\./gi,''));
        document.querySelectorAll("[type='checkbox']:checked").forEach((item) => {horas.push(item.value)})
        let fecha_string = moment(this.state.fechaReserva).format('DD/MM/YYYY');

        if(!this.props.reserva){
            const reserva = {
                cancha: this.state.cancha._id,
                reservado_por: this.state.reservadoPor,
                categoria: this.state.categoriaSelected.label,
                telefono: this.state.telefono,
                fecha_string,
                fecha_date: this.state.fechaReserva,
                horas: horas, 
                hora_inicial: horas[0],
                estado: 'Reservado',
                total_monto: convertMiles(precioHora * horas.length),
                user_created: this.state.user_created,
                user_updated: this.state.user_updated
            }        
            await axios.post(configData.serverUrl + '/reservas/add',reserva)
                .then(response => {
                    const reservanew = response.data;
                    //Creando la cancha como consumision
                    const consumision = {
                        reserva: reservanew._id,
                        cancha: this.state.cancha._id,
                        pedido_por: reservanew.reservado_por,
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
                    id: undefined,
                    monto:'',            
                    reservadoPor: '',
                    telefono:'',
                    horas: [],
                    horasDisponibles: configData.horasDisponibles,
                    fechaReserva: ''
                }, () => this.initFields()); 
        }else{
            let total_monto = precioHora * horas.length;
            let total_saldo = this.state.pagado - total_monto;

            //Actualizar solo monto y horas
            const reserva = {
                horas: horas, 
                hora_inicial: horas[0],
                categoria: this.state.categoriaSelected.label, 
                total_monto: convertMiles(total_monto),
                total_saldo: convertMiles(total_saldo),
                user_updated: this.state.user_updated
            }
            await axios.post(configData.serverUrl + '/reservas/update/horas/'+this.props.reserva._id, reserva)
                .then(res => {

                     //Creando la cancha como consumision
                     const consumision = {
                        precio_unitario: convertMiles(precioHora),
                        pedido_por: reserva.reservado_por,
                        precio_unitario: reserva.total_monto,
                        precio_total: reserva.total_monto,
                        user_updated: this.state.user_updated
                    }

                    axios.post(configData.serverUrl + '/consumisiones/update/'+this.props.reserva._id+"/"+this.state.cancha._id,consumision)
                        .then(res => this.showNotification(true))
                        .catch(err => this.showNotification(false));
                    
                    this.showNotification(true)
                                        
                })
                .catch(err => this.showNotification(false));

                this.setState({ 
                    horas
                })
        }
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
                                    //disabled = {this.props.reserva}
                                    className="form-control"
                                    mask="(09##) ###-###"
                                    value={this.state.telefono}
                                    onChange={this.onChangeTelefono}
                                />
                            </div> 
                            <div className="form-group col-md-12">
                                <label>Reservado Por: </label>
                                <input type="text" 
                                    //disabled = {this.props.reserva}
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
                            <div className="form-group col-md-12">
                                <label>Categoria: </label>
                                <Select                                       
                                    value={this.state.categoriaSelected} 
                                    options={this.state.categoriaOptions} 
                                    onChange={this.onChangeCategoria}                                    
                                    required/>
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
                        <button type="submit" className="btn btn-warning"><FontAwesomeIcon icon={faArrowLeft}/> {this.props.reserva ? 'Actualizar' : 'Crear' }</button>                        
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
