import { React, useContext } from 'react'
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
import { UserContext } from '../../components/states/contexts/UserContext';
import { findInitLetters } from '../../helpers/Utils';
import AccountList from './account/AccountList';
import Account from './account/Account';
import GeneralLedgerList from './generalLedger/GeneralLedgerList';
import InvoiceList from './standaloneInvoice/InvoiceList';
import Invoice from './standaloneInvoice/Invoice';
import BillList from './standaloneBill/BillList';
import Bill from './standaloneBill/Bill';
import InvoicePaymentList from './standaloneInvoice/InvoicePaymentList';
import BillPaymentList from './billpayment/BillPaymentList';
import BillPayment from './billpayment/BillPayment';
import InvoicePayment from './invoicepayment/InvoicePayment';
import TrialBalance from '../reporting/TrialBalance';
import Dashboard from '../sales/reporting/Dashboard';
// import InvoicePayment from '../sales/invoicePayment/InvoicePayment';



export default function AccountingRoutes() {
    const { dispatch, user } = useContext(UserContext)
    const handleLogout = () => {
        dispatch({ type: "LOGOUT_USER" });
    }
    let { path, url } = useRouteMatch();


    return (
        <Container className="pct-app-container p-0 m-0" fluid>
            <Container className="pct-app-header p-0 m-0" fluid>
                <Navbar className="shadow" style={{ backgroundColor: '#009999' }} variant="dark" expand="lg">
                    <Container fluid>
                        <Navbar.Brand as={Link} to="/"><BsGrid3X3GapFill style={{ marginTop: '-5px' }} /></Navbar.Brand>
                        <Navbar.Brand as={Link} to={`${url}`}>Accounting</Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav" />
                        <Navbar.Collapse id="basic-navbar-nav">
                            <Nav className="me-auto">

                                <NavDropdown title="Customers" id="basic-nav-dropdown">
                                    {/* <NavDropdown.Item as={Link} to={`${url}/rfqs`}>Requests for Quatation</NavDropdown.Item> */}
                                    <NavDropdown.Item as={Link} to={`${url}/invoices`}>Invoices</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`${url}/invoicepayments`}>Payments</NavDropdown.Item>

                                </NavDropdown>
                                <NavDropdown title="Vendors" id="basic-nav-dropdown">
                                    {/* <NavDropdown.Item as={Link} to={`${url}/rfqs`}>Requests for Quatation</NavDropdown.Item> */}
                                    <NavDropdown.Item as={Link} to={`${url}/bills`}>Bills</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`${url}/billpayments`}>Payments</NavDropdown.Item>

                                </NavDropdown>
                                <NavDropdown title="Accounting" id="basic-nav-dropdown">
                                    <NavDropdown.Item as={Link} to={`${url}/gls`}>General Ledger</NavDropdown.Item>
                                </NavDropdown>
                                <NavDropdown title="Reporting" id="basic-nav-dropdown">
                                    <NavDropdown.Item as={Link} to={`${url}/analysis`}>Inventory Analysis</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`${url}/trialbalance`}>Inventory Report</NavDropdown.Item>
                                    {/* <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item> */}
                                </NavDropdown>
                                <NavDropdown title="Settings" id="basic-nav-dropdown">
                                    {/* <NavDropdown.Item as={Link} to={`/purchase/settings`}>Settings</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to={`/purchase/products`}>Vendor Settings</NavDropdown.Item>
                                    <NavDropdown.Divider /> */}
                                    <NavDropdown.Item as={Link} to={`${url}/accounts`}>Chart of Accounts</NavDropdown.Item>
                                </NavDropdown>
                            </Nav>
                            <Nav>

                                <Nav.Link style={{ backgroundColor: '#e6fff9', color: '#009999', fontWeight: '600', borderRadius: '50%', minWidth: '40px', maxWidth: '40px', minHeight: '40px', display: 'flex', justifyContent: 'center' }}>{findInitLetters(user.name)}</Nav.Link>
                                <NavDropdown title={user.name} id="nav-dropdown">
                                    <NavDropdown.Item className="d-grid gap-2">
                                        <Button onClick={handleLogout} variant="primary" size="sm">Logout</Button>
                                    </NavDropdown.Item>
                                </NavDropdown>
                                <Nav.Link active><BsWifi /></Nav.Link>
                                {/* <Nav.Link><BsWifiOff /></Nav.Link> */}
                                <Nav.Link as={Link} to="/settings"><BsGearFill /></Nav.Link>
                            </Nav>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>
            </Container>

            <Switch>

                /*Default*/
                <Route exact path={`${path}`}>
                    <AccountList />
                </Route>

                /*Account Routes*/
                <Route path={`${path}/accounts`}>
                    <AccountList />
                </Route>
                <Route exact path={`${path}/account`}>
                    <Account />
                </Route>
                <Route exact path={`${path}/account/:id`}>
                    <Account />
                </Route>

                /*Standalone Invoice Routes*/
                <Route path={`${path}/invoices`}>
                    <InvoiceList />
                </Route>
                <Route exact path={`${path}/invoice`}>
                    <Invoice />
                </Route>
                <Route exact path={`${path}/invoicepayments`}>
                    <InvoicePaymentList />
                </Route>
                <Route exact path={`${path}/invoice/:id`}>
                    <Invoice />
                </Route>
                <Route exact path={`${path}/invoicePayment/:id`}>
                    <InvoicePayment />
                </Route>

                /*Standalone Bill Routes*/
                <Route path={`${path}/bills`}>
                    <BillList />
                </Route>
                <Route exact path={`${path}/bill`}>
                    <Bill />
                </Route>
                <Route exact path={`${path}/billpayments`}>
                    <BillPaymentList />
                </Route>
                <Route exact path={`${path}/billpayment/:id`}>
                    <BillPayment />
                </Route>
                <Route exact path={`${path}/bill/:id`}>
                    <Bill />
                </Route>

                /*General Ledger List Routes*/
                <Route path={`${path}/gls`}>
                    <GeneralLedgerList />
                </Route>

                /*Inventory Report List Routes*/
                <Route path={`${path}/trialbalance`}>
                    <TrialBalance />
                </Route>

                /*Analysis*/
                <Route path={`${path}/analysis`}>
                    <Dashboard />
                </Route>


            </Switch>


        </Container >
    )
}


