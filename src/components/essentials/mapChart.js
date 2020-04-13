import React from 'react';
import { Map, Marker, Popup, TileLayer, LayerGroup, LayersControl } from "react-leaflet";
import L from 'leaflet';
import Search from './search'
import 'leaflet/dist/leaflet.css'
import * as knn from "leaflet-knn";
import GeoData from "./essentials.json";
import { Sidebar, Tab } from 'react-leaflet-sidebarv2';

// import Spiderfy from "./spiderfy";


const { Overlay } = LayersControl

const user = new L.Icon({
  iconUrl:require('./icons/user.svg'),
  iconRetinaUrl: require('./icons/user.svg'),
  iconSize:[40,40]
  });


function medFilter(feature) {
    return (feature.properties.priority);
  }
function othersFilter(feature) {
    return (!feature.properties.priority);
  }

// constructor(props){
//   super(props);
//   this.state = {
//     collapsed: false,
//     selected: 'home'
//   };
// }

function onClose() {
  this.setState({ collapsed: true });
}
function onOpen(id) {
  this.setState({
    collapsed: false,
    selected: id
  });
}


export default  function MapChart(props) {

// base function for sidebar autoPan 
//  function(openClose) {
//    var panWidth = Number.parseInt(L.DomUtil.getStyle(this._sidebar, 'max-width')) / 2;
//    if (
//      openClose === 'open' && this.options.position === 'left' ||
//      openClose === 'close' && this.options.position === 'right'
//    ) panWidth *= -1;
//    this._map.panBy([panWidth, 0], { duration: 0.5 });
//  }


  const center = props.pLocation||props.currentLocation||[25.7041,77.1025];
  const zoom = props.radius?(props.radius>6?11:12):7;
  var medKnn;
  var restKnn;
  var icon;
  const userLocation = props.pLocation||props.currentLocation
  const hK= 5; // Finds the K nearest hospitals/labs wrt user location
  const rK= 10;// Finds the K nearest essentials wrt user location
  const rad = 100*1000; // Max distance of the K points, in meters
  
  if (userLocation){
  medKnn = new knn(L.geoJSON(GeoData, {filter: medFilter} )).nearestLayer([userLocation[1],userLocation[0]] , hK);
  restKnn = new knn(L.geoJSON(GeoData, {filter: othersFilter})).nearest([userLocation[1],userLocation[0]] , rK, rad);
  }

  var gjKnn = {
    "name":"NearestK-Essentials",
    "type":"FeatureCollection",
    "features":[]
  
  };


  
  
  if (medKnn){
    for(var i=0; i < medKnn.length ; i++){
        gjKnn.features.push({"type": "Feature",
                            "geometry": {"type": "Point","coordinates": medKnn[i].layer.feature.geometry.coordinates},
                            "properties": { "name": medKnn[i].layer.feature.properties.name,
                                            "desc": medKnn[i].layer.feature.properties.desc,
                                            "addr": medKnn[i].layer.feature.properties.addr,
                                            "phone": medKnn[i].layer.feature.properties.phone,
                                            "contact": medKnn[i].layer.feature.properties.contact,
                                            "icon": icon = new L.Icon({
                                                      iconUrl:require('./icons/'+medKnn[i].layer.feature.properties.icon+'.svg'),
                                                      iconRetinaUrl: require('./icons/'+medKnn[i].layer.feature.properties.icon+'.svg'),
                                                      iconSize:[25,25],
                                                    }),
                                            "id": i+1 }  
                          });
                          
    }
  }
  

  if (restKnn){
    for(var j=0; j < restKnn.length ; j++){
        gjKnn.features.push({"type": "Feature",
                            "geometry": {"type": "Point","coordinates": restKnn[j].layer.feature.geometry.coordinates},
                            "properties": { "name": restKnn[j].layer.feature.properties.name,
                                            "desc": restKnn[i].layer.feature.properties.desc,
                                            "addr": restKnn[i].layer.feature.properties.addr,
                                            "phone": restKnn[i].layer.feature.properties.phone,
                                            "contact": restKnn[i].layer.feature.properties.contact,
                                            "icon": icon = new L.Icon({
                                                      iconUrl:require('./icons/'+restKnn[i].layer.feature.properties.icon+'.svg'),
                                                      iconRetinaUrl: require('./icons/'+restKnn[i].layer.feature.properties.icon+'.svg'),
                                                      iconSize:[25,25],
                                                    }),
                                            "id": j+100 }  
                          });
                          
    }
  }

  return (
      <div>
      {/*sideBar not being built properly */}
      {/* <Sidebar
        id="sidebar"
        collapsed= {false}
        selected="home"
        closeIcon='fa fa-times'
        // onOpen={onOpen.bind(this)}
        // onClose={onClose.bind(this)}
        >
        <Tab id="home" header="Home" icon="fa fa-home">
          <p>No place like home!</p>
        </Tab>
        <Tab id="settings" header="Settings" icon="fa fa-cog" anchor="bottom">
          <p><h2>Set your own parameters</h2><br /> Under construction</p>
        </Tab>
      </Sidebar> */}

      <Map center={center} zoom={zoom}>
        <LayersControl position="topright">
          {/* <BaseLayer checked hideSingleBase ="True" name = "Baselayer Map"  > */}
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url='https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
              // "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}" //This map is too detailed
            />
            <Search  search={props.searchMap}/>
            {(props.currentLocation)&&(
              <Marker  position={props.currentLocation} icon = {user} key="userLoc">
                  <Popup>Your current location</Popup>
              </Marker>
              )}

          <Overlay checked name = "Essentials near me" >
            <LayerGroup>
              
              {/* <Spiderfy> */}
              {gjKnn.features.map(d => (
                <Marker
                  key={d.properties.id}
                  position={[d.geometry.coordinates[1], d.geometry.coordinates[0]]}
                  icon = {d.properties.icon}
                >
                  <Popup>
                    <div>
                      <h2>{d.properties.name}</h2>
                      <p> 
                        <b>Description:</b> {d.properties.desc}<br />
                        <b>Address:</b> {d.properties.addr}<br />
                        <b>Contact:</b> {d.properties.contact}<br />
                        <b>Phone:</b> {d.properties.phone}                      
                      </p>
                    </div>{" "}
                  </Popup>
                </Marker>
                
              ))}
              {/* </Spiderfy> */}
              
            </LayerGroup>
          </Overlay>
          
        </LayersControl>
        
      </Map>

      </div>
    )
}
