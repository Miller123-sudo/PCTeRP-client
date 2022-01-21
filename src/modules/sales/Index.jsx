import { React, useContext, useState, useEffect } from 'react'
import { Button, Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { BsColumnsGap, BsGrid3X3GapFill, BsWifi, BsWifiOff } from 'react-icons/bs';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    useParams,
    useRouteMatch
} from "react-router-dom";
import { BsBell, BsGearFill } from 'react-icons/bs'
import { findInitLetters } from '../../helpers/Utils';

import { UserContext } from '../../components/states/contexts/UserContext';
import SalesOrderList from './salesOrder/SalesOrderList';
import SalesOrder from './salesOrder/SalesOrder';
import Customer from './customer/Customer';
import CustomerList from './customer/CustomerList';
import ProductList from './product/ProductList';
import Product from './product/Product';
import ProductDeliveryList from './productDelivery/ProductDeliveryList';
import ProductDelivery from './productDelivery/ProductDelivery';
import InvoiceList from './invoice/InvoiceList';
import Invoice from './invoice/Invoice';
import InvoicePaymentList from './invoicePayment/InvoicePaymentList';
import InvoicePayment from './invoicePayment/InvoicePayment';
import InvoicedList from './invoiced/InvoicedList';
import DeliveredProductList from './delivered/DeliveredProductList';
import TrialBalance from '../reporting/TrialBalance';
import Dashboard from './reporting/Dashboard';

import OutstandingSOReport from './reporting/OutstandingSOReport';
import OutstandingDeliveryReport from './reporting/OutstandingDeliveryReport';
import OutstandingInvoicesReport from './reporting/OutstandingInvoicesReport (1)';
import SalesOrderReport from './reporting/SalesOrderReport';
import DeliveriesReport from './reporting/DeliveriesReport';
import InvoicesReport from './reporting/InvoicesReport';



export default function SalesRoutes() {
    const [isonline, setisonline] = useState()
    const { user } = useContext(UserContext)
    let { path, url } = useRouteMatch();

    useEffect(async () => {
        setInterval(function () {
            if (navigator.onLine) {
                setisonline(true)
            } else {
                setisonline(false)
            }
        }, 0);

    }, [isonline]);


    return (
        <Container className="pct-app-container p-0 m-0" fluid>
            <Container className="pct-app-header p-0 m-0" fluid>
                <Navbar className="shadow" style={{ backgroundColor: '#009999' }} variant="dark" expand="lg">
                    <Container fluid>
                        <Navbar.Brand as={Link} to="/"><BsGrid3X3GapFill style={{ marginTop: '-5px' }} /></Navbar.Brand>
                        <Navbar.Brand as={Link} to={`${url}/orders`}>Sales</Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav" />
                        <Navbar.Collapse id="basic-navbar-nav">
                            <Nav className="me-auto">
                                <NavDropdown title="Orders" id="basic-nav-dropdown">
                                    <NavDropdown.Item as={Link} to={`${url}/orders`}>Sales Orders</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`${url}/productDeliveries`}>Delivered Product</NavDropdown.Item>

                                </NavDropdown>
                                <NavDropdown title="Customers" id="basic-nav-dropdown">
                                    <NavDropdown.Item as={Link} to={`${url}/customers`}>Customers</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`${url}/invoices`}>Customer Invoices</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`${url}/invoicepayments`}>Customer Payments</NavDropdown.Item>
                                </NavDropdown>
                                <NavDropdown title="Products" id="basic-nav-dropdown">
                                    <NavDropdown.Item as={Link} to={`/sales/products`}>Products</NavDropdown.Item>
                                </NavDropdown>
                                <NavDropdown title="Reporting" id="basic-nav-dropdown">
                                    <NavDropdown.Item as={Link} to={`/sales/analysis`}>Sales Analysis</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`/sales/trialbalance`}>Sales Reporting</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`/sales/salesorderreport`}>Sales Order Report</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`/sales/deliveryreport`}>Delivery Report</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`/sales/invoicesreport`}>Invoice Report</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`/sales/outstandingsoreport`}>Outstanding SO Report</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`/sales/outstandingdeliveryreport`}>Outstanding Delivery Report</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`/sales/outstandinginvoicesreport`}>Outstanding Invoices Report</NavDropdown.Item>
                                </NavDropdown>
                                {/* <NavDropdown title="Settings" id="basic-nav-dropdown">
                                    <NavDropdown.Item as={Link} to={`/sales/products`}>Settings</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`/sales/products`}>Sales Teams Settings</NavDropdown.Item>
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item href="#action/3.3">Units of Measure Categories</NavDropdown.Item>
                                </NavDropdown> */}
                            </Nav>
                            <Nav>

                                <Nav.Link style={{ backgroundColor: 'white', color: 'black', fontWeight: '600', borderRadius: '50%', minWidth: '40px', maxWidth: '40px', minHeight: '40px', display: 'flex', justifyContent: 'center' }}>{findInitLetters(user.name)}</Nav.Link>
                                <Nav.Link >{user.name}</Nav.Link>
                                {

                                    isonline ? <Nav.Link active><BsWifi /></Nav.Link> : <Nav.Link><BsWifiOff /></Nav.Link>

                                }
                                <Nav.Link as={Link} to="/notification"><BsBell /></Nav.Link>
                                <Nav.Link as={Link} to="/settings"><BsGearFill /></Nav.Link>
                            </Nav>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>
            </Container>

            <Switch>

                /*Default*/
                <Route exact path={`${path}`}>
                    <SalesOrderList />
                </Route>

                /*Sales Order Routes*/
                <Route path={`${path}/orders`}>
                    <SalesOrderList />
                </Route>
                <Route exact path={`${path}/order`}>
                    <SalesOrder />
                </Route>
                <Route exact path={`${path}/order/:id`}>
                    <SalesOrder />
                </Route>

                /*Customer Routes*/
                <Route path={`${path}/customers`}>
                    <CustomerList />
                </Route>
                <Route exact path={`${path}/customer`}>
                    <Customer />
                </Route>
                <Route exact path={`${path}/customer/:id`}>
                    <Customer />
                </Route>

                /*Customer Invoice Routes*/
                <Route path={`${path}/invoices`}>
                    <InvoiceList />
                </Route>
                <Route exact path={`${path}/invoice`}>
                    <Invoice />
                </Route>
                <Route exact path={`${path}/invoice/:id`}>
                    <Invoice />
                </Route>

                /*Invoice Payment Routes*/
                <Route path={`${path}/invoicepayments`}>
                    <InvoicePaymentList />
                </Route>
                <Route exact path={`${path}/invoicepayment`}>
                    <InvoicePayment />
                </Route>
                <Route exact path={`${path}/invoicepayment/:id`}>
                    <InvoicePayment />
                </Route>

                /*Product Routes*/
                <Route path={`${path}/products`}>
                    <ProductList />
                </Route>
                <Route exact path={`${path}/product`}>
                    <Product />
                </Route>
                <Route exact path={`${path}/product/:id`}>
                    <Product />
                </Route>

                /*Product Delivery Routes*/
                <Route path={`${path}/productdeliveries`}>
                    <ProductDeliveryList />
                </Route>
                <Route exact path={`${path}/productdelivery`}>
                    <ProductDelivery />
                </Route>
                <Route exact path={`${path}/productdelivery/:id`}>
                    <ProductDelivery />
                </Route>

                /*Reporting Routes*/
                <Route path={`${path}/salesorderreport`}><SalesOrderReport /> </Route>
                <Route path={`${path}/deliveryreport`}><DeliveriesReport /></Route>
                <Route path={`${path}/invoicesreport`}> <InvoicesReport /></Route>
                <Route path={`${path}/outstandingsoreport`}> <OutstandingSOReport /></Route>
                <Route path={`${path}/outstandingdeliveryreport`}> <OutstandingDeliveryReport /></Route>
                <Route path={`${path}/outstandinginvoicesreport`}> <OutstandingInvoicesReport /></Route>


                {/* <Route path={`${path}/analysis`}>
                    <Dashboard />
                </Route>
                <Route path={`${path}/reporting`}>
                    <Reporting />
                </Route>

                */}
                <Route path={`${path}/analysis`}>
                    <Dashboard />
                </Route>

                <Route exact path={`${path}/delivered/:id`}>
                    <DeliveredProductList />
                </Route>
                <Route exact path={`${path}/invoiced/:id`}>
                    <InvoicedList />
                </Route>



                /*Inventory Report List Routes*/
                <Route path={`${path}/trialbalance`}>
                    <TrialBalance />
                </Route>

                /*Analysis*/
                <Route path={`${path}/analysis`}>
                    <Dashboard />
                </Route>

                <Route exact path="*">
                    <h1 className="text-center">Not Completed Yet!</h1>
                </Route>


            </Switch>


        </Container >
    )
}
