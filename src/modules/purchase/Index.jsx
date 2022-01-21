import { React, useContext, useEffect, useState } from 'react'
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
import PurchaseOrderList from './purchaseOrder/PurchaseOrderList';
import VendorList from './vendor/VendorList';
import Vendor from './vendor/Vendor';
import { UserContext } from '../../components/states/contexts/UserContext';
import { findInitLetters } from '../../helpers/Utils';
import PurchaseOrder from './purchaseOrder/PurchaseOrder';
import ProductList from './product/ProductList';
import Product from './product/Product';
import BillList from './bill/BillList';
import Bill from './bill/Bill';
import BillPaymentList from './billPayment/BillPaymentList';
import BillPayment from './billPayment/BillPayment';
import ProductReceiveList from './productReceive/ProductReceiveList';
import ProductReceive from './productReceive/ProductReceive';
// import Dashboard from './reporting/Dashboard';
import ReceivedProductList from './received/ReceivedProductList';
import BilledList from './billed/BilledList';
import TrialBalance from '../reporting/TrialBalance';
import Dashboard from './reporting/Dashboard';
import PurchaseOrderReport from './reporting/PurchaseOrderReport';
import ReceiptReport from './reporting/ReceiptReport';
import BillReport from './reporting/BillReport';
import OutstandingPOReport from './reporting/OutstandingPOReport';
import OutstandingBillsReport from './reporting/OutstandingBillsReport';
import OutstandingReceipt from './reporting/OutstandingReceipt';
import ItemReport from './reporting/ItemReport';



function PurchaseRoutes() {
    const [isonline, setisonline] = useState()
    const { dispatch, user } = useContext(UserContext)
    const handleLogout = () => {
        dispatch({ type: "LOGOUT_USER" });
    }
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
                        <Navbar.Brand as={Link} to={`${url}/orders`}>Purchase</Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav" />
                        <Navbar.Collapse id="basic-navbar-nav">
                            <Nav className="me-auto">
                                <NavDropdown title="Orders" id="basic-nav-dropdown">
                                    <NavDropdown.Item as={Link} to={`${url}/orders`}>Purchase Orders</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`${url}/receivedproducts`}>Received Product</NavDropdown.Item>

                                </NavDropdown>
                                <NavDropdown title="Vendor" id="basic-nav-dropdown">
                                    <NavDropdown.Item as={Link} to={`${url}/vendors`}>Vendor</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`${url}/bills`}>Vendor Bill</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`${url}/billpayments`}>Vendor Bill Payments</NavDropdown.Item>
                                </NavDropdown>
                                <NavDropdown title="Products" id="basic-nav-dropdown">
                                    <NavDropdown.Item as={Link} to={`/purchase/products`}>Products</NavDropdown.Item>
                                </NavDropdown>
                                <NavDropdown title="Reporting" id="basic-nav-dropdown">
                                    <NavDropdown.Item as={Link} to={`/purchase/analysis`}>Purchase Analysis</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`/purchase/trialbalance`}>Purchase Reporting</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`/purchase/poReport`}>Purchase Order Report</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`/purchase/poReceiveReport`}>Purchase Receipt Report</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`/purchase/poBillReport`}>Bill Report</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`/purchase/outstandingpoReport`}>Outstanding Purchase Order Report</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`/purchase/outstandingpoReceiveReport`}>Outstanding Purchase Receipt Report</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`/purchase/outstandingpoBillReport`}>Outstanding Bill Report</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`/purchase/itemReport`}>Products Report</NavDropdown.Item>
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
                    <PurchaseOrderList />
                    {/* <Dashboard /> */}
                </Route>

                /*Reporting Routes*/
                <Route path={`${path}/analysis`}>
                    <Dashboard />
                </Route>
                <Route path={`${path}/trialbalance`}>
                    <TrialBalance />
                </Route>
                <Route path={`${path}/poReport`}>
                    <PurchaseOrderReport />
                </Route>
                <Route path={`${path}/itemReport`}>
                    <ItemReport />
                </Route>
                <Route path={`${path}/poReceiveReport`}>
                    <ReceiptReport />
                </Route>
                <Route path={`${path}/poBillReport`}>
                    <BillReport />
                </Route>
                <Route path={`${path}/outstandingpoReport`}>
                    <OutstandingPOReport />
                </Route>
                <Route path={`${path}/outstandingpoReceiveReport`}>
                    <OutstandingReceipt />
                </Route>
                <Route path={`${path}/outstandingpoBillReport`}>
                    <OutstandingBillsReport />
                </Route>

                /*Purchase Order Routes*/
                <Route path={`${path}/orders`}>
                    <PurchaseOrderList />
                </Route>
                <Route exact path={`${path}/order`}>
                    {/* <TestMUIPurchaseOrder /> */}
                    <PurchaseOrder />
                </Route>
                <Route exact path={`${path}/order/:id`}>
                    <PurchaseOrder />
                    {/* <TestMUIPurchaseOrder /> */}
                </Route>

                /*Vendor Routes*/
                <Route path={`${path}/vendors`}>
                    <VendorList />
                </Route>
                <Route exact path={`${path}/vendor`}>
                    <Vendor />
                </Route>
                <Route exact path={`${path}/vendor/:id`}>
                    <Vendor />
                </Route>

                /*Vendor Bills Routes*/
                <Route path={`${path}/bills`}>
                    <BillList />
                </Route>
                <Route exact path={`${path}/bill`}>
                    <Bill />
                </Route>
                <Route exact path={`${path}/bill/:id`}>
                    <Bill />
                </Route>

                /*Vendor Bill Payment Routes*/
                <Route path={`${path}/billpayments`}>
                    <BillPaymentList />
                </Route>
                <Route exact path={`${path}/billpayment`}>
                    <BillPayment />
                </Route>
                <Route exact path={`${path}/billpayment/:id`}>
                    <BillPayment />
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


                /*Product Receipt Routes*/
                <Route path={`${path}/receivedproducts`}>
                    <ProductReceiveList />
                </Route>
                <Route exact path={`${path}/receiveproduct`}>
                    <ProductReceive />
                </Route>
                <Route exact path={`${path}/receiveproduct/:id`}>
                    <ProductReceive />
                </Route>


                <Route exact path={`${path}/received/:id`}>
                    <ReceivedProductList />
                </Route>
                <Route exact path={`${path}/billed/:id`}>
                    <BilledList />
                </Route>



                <Route exact path="*">
                    <h1 className="text-center">Not Completed Yet!</h1>
                </Route>

            </Switch>


        </Container >
    )
}

export { PurchaseRoutes }
