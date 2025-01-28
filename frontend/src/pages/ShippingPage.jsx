import React, { useEffect, useState } from "react";
import { Form, Button } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import FormContainer from "../components/FormContainer";

function ShippingPage() {

  const cart=useSelector(state=> state.cart)
  const {shippingAddress}=cart

  const [address, setAddress] = useState("");
  const [postOffice, setPostOffice] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [union, setUnion] = useState("");
  const [policeStation, setPoliceStation] = useState("");
  const [district, setDistrict] = useState("");
  const [division, setDivision] = useState("");

  const submitHandler =(e)=>{
    e.preventDefault()


  }


  return (
    <FormContainer>
      <Form onSubmit={submitHandler}>
        <Form.Group controlId="address">
          <Form.Label>Address</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="Enter address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          ></Form.Control>
        </Form.Group>
        <Form.Group controlId="union">
          <Form.Label>Union/City</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="Enter City or Union"
            value={union}
            onChange={(e) => setUnion(e.target.value)}
          ></Form.Control>
        </Form.Group>
        <Form.Group controlId="postOffice">
          <Form.Label>Post Office</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="Enter post office"
            value={postOffice}
            onChange={(e) => setPostOffice(e.target.value)}
          ></Form.Control>
        </Form.Group>
        <Form.Group controlId="postalCode">
          <Form.Label>Postal Code</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="Enter postal code"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
          ></Form.Control>
        </Form.Group>
        <Form.Group controlId="policeStation">
          <Form.Label>Police Station</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="Enter thana"
            value={policeStation}
            onChange={(e) => setPoliceStation(e.target.value)}
          ></Form.Control>
        </Form.Group>
        <Form.Group controlId="district">
          <Form.Label>District</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="Enter district"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
          ></Form.Control>
        </Form.Group>
        <Form.Group controlId="division">
          <Form.Label>Division</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="Enter division"
            value={division}
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
