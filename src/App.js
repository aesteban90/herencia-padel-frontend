import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Navbar,NavBarItemFolder,NavBarItem, NavbarTop, NavbarTopItem } from './components/nav/navbar.component';
import { faUser, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import Dashboard from './components/dashboard.component'; 
import ReservasList from './components/ventas/reservas/reservas-list.component';
import ReseravasForm from './components/ventas/reservas/reservas-form.component';
import InventarioList from './components/configuracion/inventario/inventario-list.component';
import UsuariosList from './components/configuracion/usuarios/usuarios-list.component';
import CanchasList from './components/configuracion/canchas/canchas-list.component';
import ClientesList from './components/configuracion/clientes/cliente-list.component';
import ProveedorList from './components/configuracion/proveedores/proveedor-list.component';
import ComprasList from './components/configuracion/compras/compras-list.component';
import FacturaImpresion from './components/ventas/facturas/impresion/factura.component';
import TabsDetallesVentas from './components/ventas/tabs-detalles.component';
import Login from './components/login/login';
import logout from './components/login/logout';
import useToken from './utils/useToken';

let usuarioLogueado = {};
const jwt = require('jsonwebtoken');
const configData = require('./config.json');
const key = configData.JWTKEY;

const App = () => {
    const { token, setToken } = useToken(); 
    
    if(!token) {
      console.log('Unauthorized: No token provided');
      return <Login setToken={setToken} />
    }else{
      //Obteniendo Datos del usuario
      jwt.verify(token, key, async function(err, decoded) {
        if (err) {
          console.log('Unauthorized: Invalid token');  
          logout();
        }else{       
          usuarioLogueado = {
            id: decoded.id,
            name: decoded.nombre_completo,
            roles: decoded.roles,
            nick: decoded.nickname
          }
        }
      });

      const menu_ventas = () => {
        if(usuarioLogueado.roles.includes('VENTAS')){
          return (
            <div> 
              <NavBarItemFolder icon="fa fa-ball" name="Inicio" class="inicio">
                <NavBarItem name="Dasboard" path="/" />
                <NavBarItem name="Reservas" path="/Reservas" />
                <NavBarItem name="Consultas/Informes" path="/" /> 
              </NavBarItemFolder>
            </div> 
          )
        }
      }
      const menu_adm = () => {
        if(usuarioLogueado.roles.includes('ADM')){
          return (
            <div> 
              <NavBarItemFolder icon="fa fa-usd" name="Productos">
                <NavBarItem name="Inventarios" path="/Inventarios" />
                <NavBarItem name="Ajustes" path="/" /> 
                <NavBarItem name="Consultas/Informes" path="/" /> 
              </NavBarItemFolder>
              <NavBarItemFolder icon="fa fa-usd" name="Entrada">
                <NavBarItem name="Proveedores" path="/Proveedores" />
                <NavBarItem name="Compras" path="/Compras" />                        
                <NavBarItem name="Consultas/Informes" path="/" />                        
              </NavBarItemFolder>
              <NavBarItemFolder icon="fa fa-cog" name="Configuracion">
                <NavBarItem name="Clientes" path="/Clientes" />
                <NavBarItem name="Usuarios" path="/Usuarios" />
                <NavBarItem name="Canchas" path="/Canchas" />                        
              </NavBarItemFolder>    
            </div> 
          )
        }
      }

      const menu_ventas_ROUTE = () => {
        if(usuarioLogueado.roles.includes('VENTAS')){
          return (
            <div>
              <Route path="/Reservas" exact component={ReservasList} />
              <Route path="/Reservas/Create/:id" exact component={ReseravasForm} />
              <Route path="/Reservas/Details/:id" exact component={TabsDetallesVentas} />
            </div>
          )
        }
      }
      const menu_adm_ROUTE = () => {
        if(usuarioLogueado.roles.includes('ADM')){
          return (
            <div> 
              <Route path="/Usuarios" exact component={UsuariosList} />
              <Route path="/Canchas" exact component={CanchasList} />
              <Route path="/Inventarios" exact component={InventarioList} />
              <Route path="/Clientes" exact component={ClientesList} />
              <Route path="/Proveedores" exact component={ProveedorList} />
              <Route path="/Compras" exact component={ComprasList} />
            </div>
          )
        }
      }
      const noDisplayMenu = !window.location.pathname.includes("/Factura/Impresion/");
      
      return (
          <div id="container"> 
              <div className="body-wrapper container-fluid p-0">
                  <Router>
                      { noDisplayMenu &&
                        <div>
                          <NavbarTop>
                            <NavbarTopItem id="account" icon={faUser} > {usuarioLogueado.name}</NavbarTopItem>
                            <NavbarTopItem id="closesession" icon={faSignOutAlt} > Cerrar Session</NavbarTopItem>
                          </NavbarTop>
      
                          <Navbar> 
                            {menu_ventas()} 
                            {menu_adm()}     
                          </Navbar>
                        </div>                         
                      } 
                      
                      <Route path="/" exact component={Dashboard} />
                      <Route path="/Factura/Impresion/:id" exact component={FacturaImpresion} /> 
                      {menu_ventas_ROUTE()} 
                      {menu_adm_ROUTE()} 
                  </Router>
              </div>
          </div>
      )
    }
}

export default App;
export { usuarioLogueado }