import { React, useState, useEffect } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { BsBank2, BsBuilding, BsFillPeopleFill, BsCashCoin, BsFileEarmarkSpreadsheetFill, BsGearFill, BsGraphUp, BsBagCheckFill, BsPersonFill } from 'react-icons/bs';
import { MdPointOfSale, MdPrecisionManufacturing, MdMoreTime } from 'react-icons/md';
import { Link } from 'react-router-dom';
import ApiService from '../../../helpers/ApiServices';
import './appGallery.css';

const apps = [
    {
        linkTo: "crm",
        icon: "CRMICON.png",
        description: "CRM App",
        name: "CRM"
    },
    {
        linkTo: "customers",
        icon: "CUSTOMER.png",
        description: "Customer App",
        name: "Customers"
    },
    {
        linkTo: "employees",
        icon: "EMPICON.png",
        description: "Employee App",
        name: "Employees"
    },
    {
        linkTo: "Expenses",
        icon: "EXPENSESICON.png",
        description: "Expense app",
        name: "Expense"
    },
    {
        linkTo: "inventory",
        icon: "INVENTORYICON.png",
        description: "Inventory app",
        name: "Inventory"
    },
    {
        linkTo: "invoices",
        icon: "INVOICINGICON.png",
        description: "Invoice app",
        name: "Invoices"
    },
    {
        linkTo: "notes",
        icon: "NOTESICON.png",
        description: "Notes app",
        name: "Notes"
    },
    {
        linkTo: "pos",
        icon: "POSICON.png",
        description: "POS app",
        name: "POS"
    },
    {
        linkTo: "purchase",
        icon: "PURCHASEICON.png",
        description: "Purchase app",
        name: "Purchases"
    },
    {
        linkTo: "sales",
        icon: "SALESICON.png",
        description: "Sales Order app",
        name: "Sales"
    },
    {
        linkTo: "accounting",
        icon: "ACCOUNTING.png",
        description: "Accounting app",
        name: "Accounting"
    },
    {
        linkTo: "settings",
        icon: "SETTINGSICON.png",
        description: "Settings app",
        name: "Settings"
    },
    {
        linkTo: "manufacturing",
        icon: "MANUFACTURING.png",
        description: "Manufacturing app",
        name: "Manufacturing"
    }

]

export default function AppGallery() {
    const [appList, setAppList] = useState(apps);

    const getApps = async () => {
        const response = await ApiService.get('dashboard');
        if (response.data.status === 'success') {
            console.log(response.data.data.apps)
            setAppList(response.data.data.apps);
        }
    }
    useEffect(() => {

        getApps();

    }, [])


    return (
        <div className="appGallery">
            <Container fluid>
                <Row className="justify-content-md-center justify-content-center">

                    <Col className="appBoxes" xs={12} sm={12} md={11} lg={11} xl={10}>

                        {/* {appList.map(app => {
                            return <Link to={`/${app.linkTo}`} className="link">
                                <div className="appBox">
                                    <div className="appBoxLogo">
                                        <BsFillPeopleFill style={{ color: '#cc0000', fontSize: '4rem' }} />
                                    </div>
                                    <div className="appBoxName">{app.name}</div>
                                </div>
                            </Link>

                        })} */}
                        {/* <Link to={`/crm`} className="link">
                            <div className="appBox" style={{ backgroundColor: "#ffe6e6", }}>
                                <div className="appBoxLogo">
                                    <BsFillPeopleFill style={{ color: '#cc0000', fontSize: '3rem', marginTop: '10px' }} />
                                </div>
                                <div className="appBoxName">CRM</div>
                            </div>
                        </Link> */}
                        <Link to={`/employees`} className="link">
                            <div className="appBox" style={{ backgroundColor: "#e6ecff", }}>
                                <div className="appBoxLogo">
                                    <BsPersonFill style={{ color: '#003d99', fontSize: '3rem', marginTop: '10px' }} />
                                </div>
                                <div className="appBoxName">Employees</div>
                            </div>
                        </Link>
                        {/* <Link to={`/inventory`} className="link">
                            <div className="appBox" style={{ backgroundColor: "#ffffe6", }}>
                                <div className="appBoxLogo">
                                    <BsBuilding style={{ color: '#999900', fontSize: '3rem', marginTop: '10px' }} />
                                </div>
                                <div className="appBoxName">Inventory</div>
                            </div>
                        </Link> */}
                        <Link to={`/purchase`} className="link">
                            <div className="appBox" style={{ backgroundColor: "#e6fff9", }}>
                                <div className="appBoxLogo">
                                    <BsBagCheckFill style={{ color: '#009999', fontSize: '3rem', marginTop: '10px' }} />
                                </div>
                                <div className="appBoxName">Purchase</div>
                            </div>
                        </Link>
                        <Link to={`/sales`} className="link">
                            <div className="appBox" style={{ backgroundColor: "#e6f2ff", }}>
                                <div className="appBoxLogo">
                                    <BsGraphUp style={{ color: '#006699', fontSize: '3rem', marginTop: '10px' }} />
                                </div>
                                <div className="appBoxName">Sales</div>
                            </div>
                        </Link>
                        {/* <Link to={`/pos`} className="link">
                            <div className="appBox" style={{ backgroundColor: "#6dab3654", }}>
                                <div className="appBoxLogo">
                                    <MdPointOfSale style={{ color: '#6CAB36', fontSize: '3rem', marginTop: '10px' }} />
                                </div>
                                <div className="appBoxName">POS</div>
                            </div>
                        </Link> */}
                        <Link to={`/accountings`} className="link">
                            <div className="appBox" style={{ backgroundColor: "#ffe6ff", }}>
                                <div className="appBoxLogo">
                                    <BsBank2 style={{ color: '#7a0099', fontSize: '3rem', marginTop: '10px' }} />
                                </div>
                                <div className="appBoxName">Accounting</div>
                            </div>
                        </Link>
                        <Link to={`/reporting`} className="link">
                            <div className="appBox" style={{ backgroundColor: "#e6faff", }}>
                                <div className="appBoxLogo">
                                    <BsFileEarmarkSpreadsheetFill style={{ color: '#007a99', fontSize: '3rem', marginTop: '10px' }} />
                                </div>
                                <div className="appBoxName">Reporting</div>
                            </div>
                        </Link>
                        <Link to={`/manufacturings`} className="link">
                            <div className="appBox" style={{ backgroundColor: "#ffebe6", }}>
                                <div className="appBoxLogo">
                                    <MdPrecisionManufacturing style={{ color: '#991f00', fontSize: '3rem', marginTop: '10px' }} />
                                </div>
                                <div className="appBoxName">Manufacturing</div>
                            </div>
                        </Link>


                        {/* <Link to={`/expenses`} className="link">
                            <div className="appBox" style={{ backgroundColor: "#f7ffe6", }}>
                                <div className="appBoxLogo">
                                    <BsCashCoin style={{ color: '#699900', fontSize: '3rem', marginTop: '10px' }} />
                                </div>
                                <div className="appBoxName">Expense</div>
                            </div>
                        </Link> */}
                        {/* <Link to={`/manufacturings`} className="link">
                            <div className="appBox" style={{ backgroundColor: "#ffe6e6", }}>
                                <div className="appBoxLogo">
                                    <MdPrecisionManufacturing style={{ color: '#cc0000', fontSize: '3rem', marginTop: '10px' }} />
                                </div>
                                <div className="appBoxName">Manufacturing</div>
                            </div>
                        </Link> */}
                        {/* <Link to={`/purchase`} className="link">
                            <div className="appBox" style={{ backgroundColor: "#e6fff9", }}>
                                <div className="appBoxLogo">
                                    <MdMoreTime style={{ color: '#009999', fontSize: '3rem', marginTop: '10px' }} />
                                </div>
                                <div className="appBoxName">Timesheet</div>
                            </div>
                        </Link> */}
                        {/* <Link to={`/settings`} className="link">
                            <div className="appBox" style={{ backgroundColor: "#ffe6f2", }}>
                                <div className="appBoxLogo">
                                    <BsGearFill style={{ color: '#99004d', fontSize: '3rem', marginTop: '10px' }} />
                                </div>
                                <div className="appBoxName">Settings</div>
                            </div>
                        </Link> */}

                    </Col>

                </Row>

            </Container>
        </div >
        // <div className="appGallery">
        //     <div className="appBoxes">

        //         {appList.map(app => {

        //             return <Link to={`/${app.linkTo}`} className="link">
        //                 <div className="appBox">
        //                     <div className="appBoxLogo">
        //                         <img src={`/static/img/${app.icon}`} alt={app.description} />
        //                     </div>
        //                     <div className="appBoxName">{app.name}</div>
        //                 </div>
        //             </Link>

        //         })}
        //     </div>
        // </div>
    )
}
