import { React, useState, useEffect } from 'react';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import { Breadcrumb, Button, Col, Container, Row, Table } from 'react-bootstrap';
import { Link, useRouteMatch } from 'react-router-dom';
import { PropagateLoader } from "react-spinners";
import ApiService from '../../../helpers/ApiServices';
import { BsBoxArrowInUpRight, BsEyeFill } from 'react-icons/bs'
import { formatNumber } from '../../../helpers/Utils';
import { lastDayOfYear } from 'date-fns';
const moment = require('moment');

export default function PurchaseOrderList() {
    const [loderStatus, setLoderStatus] = useState("");
    const [state, setstate] = useState([]);
    const [poList, setpoList] = useState([]);
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    let { path, url } = useRouteMatch();

    function onGridReady(params) {
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);
    }
    const handleSearch = (e) => {
        gridApi.setQuickFilter(e.target.value);
    }

    const handleExportAsCsv = (e) => {
        gridApi.exportDataAsCsv();
    }
    const getSupervisorValue = (params) => params.data?.supervisor?.name ? params.data?.supervisor?.name : "Not Available";

    const columns = [
        {
            headerName: '#', field: 'id', sortable: false, filter: false, cellRendererFramework: (params) =>
                <>
                    <Button style={{ minWidth: "4rem" }} size="sm" as={Link} to={`/purchase/order/${params.value}?mode=edit`}><BsBoxArrowInUpRight /></Button>
                    <Button style={{ minWidth: "4rem" }} size="sm" as={Link} to={`/purchase/order/${params.value}?mode=view`}><BsEyeFill /></Button>
                </>
        },
        { headerName: 'Purchase Order', field: 'name' },
        { headerName: 'Confirmation Date', field: 'date', valueGetter: (params) => params.data?.date ? moment(params.data?.date).format("MM/DD/YYYY ") : "Not Available" },
        { headerName: 'Vendor', field: `vendor`, valueGetter: (params) => params.data?.vendor ?params.data?.vendor[0].name : "Not Available" },
        { headerName: 'Receipt Date', field: 'receiptDate', valueGetter: (params) => params.data?.receiptDate ? moment(params.data?.receiptDate).format("MM/DD/YYYY ") : "Not Available" },
        { headerName: 'Total', field: 'estimation.total', valueGetter: (params) => formatNumber(params.data.estimation?.total) },
        {
            headerName: 'Billing Status', field: 'billingStatus', minWidth:300, cellRendererFramework: (params) => (renderStatus(params.value)),
        },

    ]

    const renderStatus = (value) => {
        switch (value) {
            case 'Nothing to Bill': {
                return <div style={{ backgroundColor: '#B2BABB', borderRadius: '20px', color: 'white', width: '100%', height: '60%', maxHeight: '2rem', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>{value}</div>
                </div>
            }
            case 'Waiting Bills': {
                return <div style={{ backgroundColor: 'royalblue', borderRadius: '20px', color: 'white', width: '100%', height: '60%', maxHeight: '2rem', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>{value}</div>
                </div>
            }
            case 'Fully Billed': {
                return <div style={{ backgroundColor: '#2ECC71', borderRadius: '20px', color: 'white', width: '100%', height: '60%', maxHeight: '2rem', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>{value}</div>
                </div>
            }
            default: {
                return <div style={{ backgroundColor: 'royalblue', borderRadius: '20px', color: 'white', width: '100%', height: '60%', maxHeight: '2rem', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>{value}</div>
                </div>
            }
        }
    }

    

    useEffect(async () => {
        setLoderStatus("RUNNING");
        ApiService.setHeader();
        const response = await ApiService.get('purchaseOrder');
        setstate(response.data.documents)
        console.log(response.data.documents)

        setLoderStatus("SUCCESS");
    }, []);

console.log(poList);
    if (loderStatus === "RUNNING") {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '20%', }}><PropagateLoader color="#009999" style={{ height: 15 }} /></div>
        )
    }
    return (
        <Container className="pct-app-content-container p-0 m-0" fluid>
            <Container className="pct-app-content" fluid>
                <Container className="pct-app-content-header p-0 m-0 mt-2 pb-2" fluid>
                    <Row>
                        <Col>
                            <h3>Purchase Orders</h3>
                            {/* <Breadcrumb style={{ fontSize: '24px' }}>
                                <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/purchase' }} active>Purchase Orders</Breadcrumb.Item>
                            </Breadcrumb> */}
                        </Col>
                    </Row>
                    <Row>
                        <Col><Button as={Link} to="/purchase/order" variant="primary" size="sm">Create</Button></Col>
                        <Col md="4" sm="6">
                            <Row>
                                <Col md="8"><input type="text" className="openning-cash-control__amount--input" placeholder="Search here..." onChange={handleSearch}></input></Col>
                                <Col md="4"><Button onClick={handleExportAsCsv} variant="light" size="sm"><span>Export CSV</span></Button></Col>
                            </Row>
                        </Col>
                    </Row>
                </Container>
                <Container className="pct-app-content-body p-0 m-0" style={{ height: '100vh' }} fluid>
                    <div className="ag-theme-alpine" style={{ height: '100%', width: '100%' }}>
                        <AgGridReact
                            onGridReady={onGridReady}
                            rowData={state}
                            columnDefs={columns}
                            defaultColDef={{
                                editable: false,
                                sortable: true,
                                flex: 1,
                                minWidth: 100,
                                filter: true,
                                resizable: true,
                                minWidth: 200
                            }}
                            pagination={true}
                            paginationPageSize={50}
                            // overlayNoRowsTemplate="No Purchase Order found. Let's create one!"
                            overlayNoRowsTemplate='<span style="color: rgb(128, 128, 128); font-size: 2rem; font-weight: 100;">No Records Found!</span>'
                        />
                    </div>
                    {/* <Table striped bordered hover size="sm">
                        <thead>
                            <tr>
                                <th></th>
                                <th style={{ minWidth: '8rem' }} >Purchase Order</th>
                                <th style={{ minWidth: '8rem' }} >Vendor</th>
                                <th style={{ minWidth: '8rem' }} >Date</th>
                                <th style={{ minWidth: '8rem' }} >Receipt Date</th>
                                <th style={{ minWidth: '8rem' }} >Total Price</th>
                                <th style={{ minWidth: '8rem' }} >Billing Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                state.map((element, index) => {
                                    return <tr id={element.id} key={index}>
                                        <td >
                                            <Button style={{ minWidth: "4rem" }} as={Link} to={`/purchase/order/${element.id}`} size="sm"><BsBoxArrowInUpRight /></Button>
                                        </td>

                                        <td>{element.name}</td>
                                        <td>{element.vendor?.name}</td>
                                        <td>{moment(element.date).format("DD/MM/YYYY HH:mm:ss")}</td>
                                        <td>{moment(element.receiptDate).format("DD/MM/YYYY HH:mm:ss")}</td>
                                     
                                        <td>{formatNumber(element.estimation?.total)}</td>
                                        <td>{renderStatus(element.billingStatus)}</td>
                                    </tr>
                                })
                            }
                        </tbody>
                    </Table> */}
                    {/* {state.length == 0 ? <Container className="text-center mt-4">
                        <h4>No purchase order found. Let's create one!</h4>
                        <h6>Once you ordered your products to your supplier, confirm your request for quotation and it will turn into a purchase order.</h6>
                    </Container> : ""} */}

                </Container>


            </Container>
        </Container>
    )
}




// import { React, useState, useEffect } from 'react';
// import { AgGridColumn, AgGridReact } from 'ag-grid-react';
// import { Breadcrumb, Button, Col, Container, Row, Table } from 'react-bootstrap';
// import { Link, useRouteMatch } from 'react-router-dom';
// import { PropagateLoader } from "react-spinners";
// import ApiService from '../../../helpers/ApiServices';
// import { BsBoxArrowInUpRight, BsEyeFill } from 'react-icons/bs'
// import { formatNumber } from '../../../helpers/Utils';
// const moment = require('moment');

// export default function PurchaseOrderList() {
//     const [loderStatus, setLoderStatus] = useState("NOTHING");
//     const [state, setstate] = useState([]);
//     const [gridApi, setGridApi] = useState(null);
//     const [gridColumnApi, setGridColumnApi] = useState(null);
//     let { path, url } = useRouteMatch();

//     function onGridReady(params) {
//         setGridApi(params.api);
//         setGridColumnApi(params.columnApi);
//     }
//     const handleSearch = (e) => {
//         gridApi.setQuickFilter(e.target.value);
//     }

//     const handleExportAsCsv = (e) => {
//         gridApi.exportDataAsCsv();
//     }
//     const getSupervisorValue = (params) => params.data?.supervisor?.name ? params.data?.supervisor?.name : "Not Available";

//     const columns = [
//         {
//             headerName: '#', field: 'id', sortable: false, filter: false, cellRendererFramework: (params) =>
//                 <>
//                     <Button style={{ minWidth: "4rem" }} size="sm" as={Link} to={`/purchase/order/${params.value}?mode=edit`}><BsBoxArrowInUpRight /></Button>
//                     <Button style={{ minWidth: "4rem" }} size="sm" as={Link} to={`/purchase/order/${params.value}?mode=view`}><BsEyeFill /></Button>
//                 </>
//         },
//         { headerName: 'Purchase Order', field: 'name' },
//         { headerName: 'Confirmation Date', field: 'date', valueGetter: (params) => params.data?.date ? moment(params.data?.date).format("DD/MM/YYYY HH:mm:ss") : "Not Available" },
//         { headerName: 'Vendor', field: 'vendor.name' },
//         { headerName: 'Receipt Date', field: 'receiptDate', valueGetter: (params) => params.data?.receiptDate ? moment(params.data?.receiptDate).format("DD/MM/YYYY HH:mm:ss") : "Not Available" },
//         { headerName: 'Total', field: 'estimation.total', valueGetter: (params) => formatNumber(params.data.estimation?.total) },
//         {
//             headerName: 'Billing Status', field: 'billingStatus', cellRendererFramework: (params) => (renderStatus(params.value)),
//         },

//     ]

//     const renderStatus = (value) => {
//         switch (value) {
//             case 'Nothing to Bill': {
//                 return <div style={{ backgroundColor: '#B2BABB', borderRadius: '20px', color: 'white', width: '100%', height: '60%', maxHeight: '2rem', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
//                     <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>{value}</div>
//                 </div>
//             }
//             case 'Waiting Bills': {
//                 return <div style={{ backgroundColor: 'royalblue', borderRadius: '20px', color: 'white', width: '100%', height: '60%', maxHeight: '2rem', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
//                     <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>{value}</div>
//                 </div>
//             }
//             case 'Fully Billed': {
//                 return <div style={{ backgroundColor: '#2ECC71', borderRadius: '20px', color: 'white', width: '100%', height: '60%', maxHeight: '2rem', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
//                     <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>{value}</div>
//                 </div>
//             }
//             default: {
//                 return <div style={{ backgroundColor: 'royalblue', borderRadius: '20px', color: 'white', width: '100%', height: '60%', maxHeight: '2rem', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
//                     <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>{value}</div>
//                 </div>
//             }
//         }
//     }

//     useEffect(async () => {
//         setLoderStatus("RUNNING");
//         ApiService.setHeader();
//         const response = await ApiService.get('purchaseOrder');
//         setstate(response.data.documents)
//         console.log(response)
//         setLoderStatus("SUCCESS");

//     }, []);


//     if (loderStatus === "RUNNING") {
//         return (
//             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '20%', }}><PropagateLoader color="#009999" style={{ height: 15 }} /></div>
//         )
//     }

//     return (
//         <Container className="pct-app-content-container p-0 m-0" fluid>
//             <Container className="pct-app-content" fluid>
//                 <Container className="pct-app-content-header p-0 m-0 mt-2 pb-2" fluid>
//                     <Row>
//                         <Col>
//                             <h3>Purchase Orders</h3>
//                             {/* <Breadcrumb style={{ fontSize: '24px' }}>
//                                 <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/purchase' }} active>Purchase Orders</Breadcrumb.Item>
//                             </Breadcrumb> */}
//                         </Col>
//                     </Row>
//                     <Row>
//                         <Col><Button as={Link} to="/purchase/order" variant="primary" size="sm">Create</Button></Col>
//                         <Col md="4" sm="6">
//                             <Row>
//                                 <Col md="8"><input type="text" className="openning-cash-control__amount--input" placeholder="Search here..." onChange={handleSearch}></input></Col>
//                                 <Col md="4"><Button onClick={handleExportAsCsv} variant="light" size="sm"><span>Export CSV</span></Button></Col>
//                             </Row>
//                         </Col>
//                     </Row>
//                 </Container>
//                 <Container className="pct-app-content-body p-0 m-0" style={{ height: '700px' }} fluid>
//                     <div className="ag-theme-alpine" style={{ height: '100%', width: '100%' }}>
//                         <AgGridReact
//                             onGridReady={onGridReady}
//                             rowData={state}
//                             columnDefs={columns}
//                             defaultColDef={{
//                                 editable: true,
//                                 sortable: true,
//                                 flex: 1,
//                                 minWidth: 100,
//                                 filter: true,
//                                 resizable: true,
//                                 minWidth: 200
//                             }}
//                             pagination={true}
//                             paginationPageSize={50}
//                             overlayNoRowsTemplate="No Purchase Order found. Let's create one!"
//                         />
//                     </div>
//                     {/* <Table striped bordered hover size="sm">
//                         <thead>
//                             <tr>
//                                 <th></th>
//                                 <th style={{ minWidth: '8rem' }} >Purchase Order</th>
//                                 <th style={{ minWidth: '8rem' }} >Vendor</th>
//                                 <th style={{ minWidth: '8rem' }} >Date</th>
//                                 <th style={{ minWidth: '8rem' }} >Receipt Date</th>
//                                 <th style={{ minWidth: '8rem' }} >Total Price</th>
//                                 <th style={{ minWidth: '8rem' }} >Billing Status</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {
//                                 state.map((element, index) => {
//                                     return <tr id={element.id} key={index}>
//                                         <td >
//                                             <Button style={{ minWidth: "4rem" }} as={Link} to={`/purchase/order/${element.id}`} size="sm"><BsBoxArrowInUpRight /></Button>
//                                         </td>

//                                         <td>{element.name}</td>
//                                         <td>{element.vendor?.name}</td>
//                                         <td>{moment(element.date).format("DD/MM/YYYY HH:mm:ss")}</td>
//                                         <td>{moment(element.receiptDate).format("DD/MM/YYYY HH:mm:ss")}</td>
                                     
//                                         <td>{formatNumber(element.estimation?.total)}</td>
//                                         <td>{renderStatus(element.billingStatus)}</td>
//                                     </tr>
//                                 })
//                             }
//                         </tbody>
//                     </Table> */}
//                     {/* {state.length == 0 ? <Container className="text-center mt-4">
//                         <h4>No purchase order found. Let's create one!</h4>
//                         <h6>Once you ordered your products to your supplier, confirm your request for quotation and it will turn into a purchase order.</h6>
//                     </Container> : ""} */}

//                 </Container>


//             </Container>
//         </Container>
//     )
// }
