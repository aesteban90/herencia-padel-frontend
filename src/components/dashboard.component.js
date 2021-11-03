import React, {Component} from 'react';  

export default class Dashboard extends Component{
    constructor(props){
        super(props);
        this.state = {}
    }
    render(){       
        return(
            <div className="content-wrapper" id="content">
                <div className="doc-hero-wrap">
                    <div className="hero-wrap-inner">
                    <h2 className="title">Dashboard Herencia Padel</h2>
                    <h5 className="subtitle">Subtitle </h5>
                    </div>
                </div>
            </div>
        )
    }
}