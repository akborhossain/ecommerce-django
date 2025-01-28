import React, { useEffect, useState } from "react";
import { Form, Button } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import FormContainer from "../components/FormContainer";
import CheckoutSteps from "../components/CheckoutSteps";

import {saveShippingAddress} from '../actions/cartActions'

function ShippingPage() {

  const cart=useSelector(state=> state.cart)
  const {shippingAddress}=cart
  const dispatch=useDispatch();
  const [address, setAddress] = useState(shippingAddress.address);
  const [postOffice, setPostOffice] = useState(shippingAddress.postOffice);
  const [postalCode, setPostalCode] = useState(shippingAddress.postalCode);
  const [union, setUnion] = useState(shippingAddress.union);
  const [policeStation, setPoliceStation] = useState(shippingAddress.policeStation);
  const [district, setDistrict] = useState(shippingAddress.district);
  const [division, setDivision] = useState(shippingAddress.division);

  const submitHandler =(e)=>{
    e.preventDefault()
    dispatch(saveShippingAddress({
      address,
      union,
      postOffice,
      postalCode,
      policeStation,
      district,
      division
    }))

  }


  return (
    <FormContainer>
      <CheckoutSteps step1 step2 />
      <Form onSubmit={submitHandler}>
        <Form.Group controlId="address">
          <Form.Label>Address</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="Enter address"
            value={address ? address:''}
            onChange={(e) => setAddress(e.target.value)}
          ></Form.Control>
        </Form.Group>
        <Form.Group controlId="union">
          <Form.Label>Union/City</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="Enter City or Union"
            value={union ? union:''}
            onChange={(e) => setUnion(e.target.value)}
          ></Form.Control>
        </Form.Group>
        <Form.Group controlId="postOffice">
          <Form.Label>Post Office</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="Enter post office"
            value={postOffice ? postOffice:''}
            onChange={(e) => setPostOffice(e.target.value)}
          ></Form.Control>
        </Form.Group>
        <Form.Group controlId="postalCode">
          <Form.Label>Postal Code</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="Enter postal code"
            value={postalCode ? postalCode:''}
            onChange={(e) => setPostalCode(e.target.value)}
          ></Form.Control>
        </Form.Group>
        <Form.Group controlId="policeStation">
          <Form.Label>Police Station</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="Enter thana"
            value={policeStation ? policeStation:''}
            onChange={(e) => setPoliceStation(e.target.value)}
          ></Form.Control>
        </Form.Group>
        <Form.Group controlId="district">
          <Form.Label>District</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="Enter district"
            value={district ? district:''}
            onChange={(e) => setDistrict(e.target.value)}
          ></Form.Control>
        </Form.Group>
        <Form.Group controlId="division">
          <Form.Label>Division</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="Enter division"
            value={division ? division:''}
            onChange={(e) => setDivision(e.target.value)}
          ></Form.Control>
        </Form.Group>
        <Button type="submit" variant='primary'>
          Save
        </Button>
      </Form>
    </FormContainer>
  )
}

export default ShippingPage
