import React, { useState } from 'react';
import PropTypes from 'prop-types';
import companyLogo from '../../imagens/herencia-padel.png';
import './login.css';
const configData = require('../../config.json');

async function loginUser(credentials) {    
    return fetch(configData.serverUrl + '/authenticate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    })
      .then(data => data.json())
}

export default function Login({ setToken }) {  
    const [nickname, setNickname] = useState('');
    const [password, setPassword] = useState('');
    
    const handleSubmit = async e => {
        e.preventDefault();
        const token = await loginUser({
            nickname,
            password
        });
        setToken(token);
        
        if(token.type){
            switch (token.type) {
                case 'erruser':
                    document.querySelector('#nickname-error').innerHTML = token.msg;
                    break;
                case 'errpass':
                    document.querySelector('#pass-error').innerHTML = token.msg;
                    break;
                default:
                    break;
            }
            localStorage.removeItem('token');
        }
    }    

    const handlerNickName = (value) => {
        setNickname(value)
        document.querySelector('#nickname-error').innerHTML = "";
    }
    const handlerPassword = (value) => {
        setPassword(value)
        document.querySelector('#pass-error').innerHTML = "";
    }
    const formIniciarSession = () => {
        return <div className="iniciarsession login-card card mt-5">
                <div className="card-body">                                
                    <h3 className="text-center pt-2"><img alt="" src={companyLogo} /></h3>
                    <br/>
                    <form action="" method="" onSubmit={handleSubmit}>
                        <div className="form-group row">
                            <label className="col-md-4 col-form-label text-md-right">Nickname</label>
                            <div className="col-md-6">
                                <input value={nickname} id="nickname" autoFocus={true} type="text" onChange={e => handlerNickName(e.target.value)} className="form-control" required />
                                <span id="nickname-error" className="validation-error"></span>
                            </div>                                            
                        </div>
                        <div className="form-group row">
                            <label className="col-md-4 col-form-label text-md-right">Password</label>
                            <div className="col-md-6">
                                <input value={password} id="password" type="password" onChange={e => handlerPassword(e.target.value)} className="form-control" required />
                                <span id="pass-error" className="validation-error"></span>
                            </div>                                                                                  
                        </div>
                        <div className="form-group col-md-12  text-center">
                            <button type="submit" className="btn btn-warning m-1 col-md-4">
                                Iniciar Sessión
                            </button>                             
                        </div>
                    </form>
                </div>
            </div>
    }

    const formulario = () => {
        return formIniciarSession();
    }
    return(
        
        <div id="login">       
            <div className="container">
                <div className="row justify-content-center space-pt--r100 space-pb--r100">
                    <div className="col-md-6">
                        {formulario()}                        
                    </div>
                </div>
            </div>
        </div>
    )    
}

Login.propTypes = {
    setToken: PropTypes.func.isRequired
}