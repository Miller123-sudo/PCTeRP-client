import 'bootstrap/dist/css/bootstrap.min.css';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import './index.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { UserContextProvider } from './components/states/contexts/UserContext';
import ApiService from './helpers/ApiServices';
import Routes from './routes/Routes';



ApiService.init();
ReactDOM.render(
  <React.StrictMode>
    <UserContextProvider>
      <Routes />
    </UserContextProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

