import React, { useState, useEffect } from 'react';
import { ButtonGroup, Col, Container, Dropdown, DropdownButton, Form, Row } from 'react-bootstrap';
import { AreaChart, YAxis, XAxis, Area, Tooltip, CartesianGrid, Label, Legend, BarChart, Bar } from 'recharts'
import ApiService from '../../../helpers/ApiServices';
import './reporting.css';

export default function Reports() {
    const [state, setState] = useState([]);

    useEffect(async () => {
        const response = await ApiService.get('Product');
        console.log(response.data.documents)
        setState(response.data.documents)
    }, [])

    return (
        < Container className="pct-app-content-container p-0 m-0" fluid >
            <Form className="pct-app-content" >
                <Container className="pct-app-content-header  m-0 pb-2" style={{ borderBottom: '1px solid black' }} fluid>
                    <Row>
                        <Col><h3>{"Products Report"}</h3></Col>
                    </Row>
                </Container>
                <Container className="pct-app-content-body p-0 m-0 mt-2" fluid>
                    <BarChart width={getWindowDimensions().width} height={getWindowDimensions().height - 150} data={state}
                        margin={{ top: 10, right: 30, left: 30, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis >
                            <Label value="Quantity" angle={-90} position="left" />
                        </YAxis>
                        <Tooltip formatter={(value, name, props) => [value, name === "available" ? "Available Qty." : name === "totalPurchasedQuantity" ? "Total Purchased Qty." : "Total Sold Qty."]} />
                        <Legend iconType="circle" formatter={(name) => [name === "available" ? "Available Qty." : name === "totalPurchasedQuantity" ? "Total Purchased Qty." : "Total Sold Qty."]} />
                        <Bar dataKey="available" fill="#8884d8" />
                        <Bar dataKey="totalPurchasedQuantity" fill="#82ca9d" />
                        <Bar dataKey="totalSoldQuantity" fill="#8dd1e1" />
                        {/* <Bar dataKey="uv" fill="#82ca9d" /> */}
                    </BarChart>
                </Container >
            </Form >
        </Container >
    )
}


function getWindowDimensions() {
    const { innerWidth: width, innerHeight: height } = window;
    return {
        width,
        height
    };
}
