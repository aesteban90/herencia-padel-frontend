import { useState }  from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import companyLogo from '../../imagens/herencia-padel.png';
import logout from '../login/logout';

const NavbarTop = (props) =>{
    return(
        <div className="navigation-top" id="nav">
            <ul className="nav-wrapper-top">
                {props.children}
            </ul>
        </div>
    )
}
const NavbarTopItem = (props) =>{
    const [open, setOpen] = useState(false);  
    var varid = ( props.id  ? { id:props.id } : '');

    if(props.id === "account"){
        return (        
            <li className="nav-wrapper-top-item">
                <span {...varid}  href="#" className="icon-button" >
                    <FontAwesomeIcon icon={ props.icon }  /> {props.children}
                </span>
            </li>
        )
    }
    if(props.id === "closesession"){
        return (        
            <li className="nav-wrapper-top-item">
                <a {...varid}  href="#" className="icon-button" onClick={() => logout()}>
                    <FontAwesomeIcon icon={ props.icon }  /> {props.children}
                </a>
            </li>
        )
    }
    return (        
        <li className="nav-wrapper-top-item">
            <a {...varid}  href="#" className="icon-button" onClick={() => setOpen(!open)}>
                <FontAwesomeIcon icon={ props.icon }  /> 
            </a>
            {open && props.children }
        </li>
    )
}

const Navbar = (props) =>{
    return(
        <div className="nav-wrapper">
            <div className="logo-wrapper">
                <img src={companyLogo} alt="Herencia Padel"/>
                <a id="btn-menu"><FontAwesomeIcon icon={ faBars }  /> </a>
            </div>
            <div className="navigation" id="nav">
                {props.children}
            </div>
        </div>
    )
}

const NavBarItemFolder = (props) => {
    if(props.class === "account"){
        return(
            <div className="nav-item">
                <div className="sub-nav" style={{display:'block'}}>
                    {props.children}
                </div>
            </div>
        )
    }
   
    return(
        <div className="nav-item active">
            {/* <span className={`nav-list-item ${props.class ? props.class : ''}`}><i className={props.icon} ></i>{props.name}</span> */}
            <span className={`nav-list-item ${props.class ? props.class : ''}`}><FontAwesomeIcon icon={ props.icon }  /> {props.name}</span>
            <div className="sub-nav" style={{display:'block'}}>
                {props.children}
            </div>
        </div>
    )
}

const NavBarItem = (props) => {
    return(
        <a className="sub-nav-item" href={props.path}>{props.name}</a>
    )
}
export { Navbar, NavBarItemFolder, NavBarItem, NavbarTop, NavbarTopItem }