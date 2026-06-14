import React, { useState } from "react";
import { Form, Button, Card } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import FormContainer from "../components/FormContainer";
import CheckoutSteps from "../components/CheckoutSteps";
import { savePaymentMethod } from '../actions/cartActions';
import { useNavigate } from "react-router-dom";

const PAYMENT_METHODS = [
  { id: 'paypal', label: 'PayPal', icon: 'fab fa-paypal', desc: 'Pay securely via PayPal', color: '#003087' },
  { id: 'stripe', label: 'Credit / Debit Card', icon: 'fas fa-credit-card', desc: 'Visa, Mastercard, AMEX', color: '#6772e5' },
  { id: 'bkash', label: 'bKash', icon: 'fas fa-mobile-alt', desc: 'Mobile banking - Bangladesh', color: '#E21F8E' },
  { id: 'cod', label: 'Cash on Delivery', icon: 'fas fa-money-bill-wave', desc: 'Pay when you receive', color: '#16a34a' },
]

function PaymentPage() {
  const cart = useSelector(state => state.cart)
  const { shippingAddress } = cart
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("PayPal");

  if (!shippingAddress || !shippingAddress.address) {
    navigate("/shipping");
    return null;
  }

  const submitHandler = (e) => {
    e.preventDefault()
    dispatch(savePaymentMethod(paymentMethod))
    navigate("/placeorder");
  }

  return (
    <FormContainer>
      <CheckoutSteps step1 step2 step3 />
      <div className="text-center mb-4">
        <h2 className="fw-bold mb-1" style={{ fontSize: '1.5rem' }}>Select Payment Method</h2>
        <p className="text-muted small">Choose how you'd like to pay for your order</p>
      </div>

      <Form onSubmit={submitHandler}>
        <div className="d-flex flex-column gap-3 mb-4">
          {PAYMENT_METHODS.map((method) => (
            <Card
              key={method.id}
              onClick={() => setPaymentMethod(method.label)}
              className={`border rounded-4 p-3 cursor-pointer transition-all ${paymentMethod === method.label ? 'border-primary bg-primary bg-opacity-10' : 'border-light bg-white'}`}
              style={{
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: paymentMethod === method.label ? '0 0 0 2px var(--primary-color)' : '0 2px 8px rgba(0,0,0,0.05)'
              }}
            >
              <div className="d-flex align-items-center gap-3">
                <Form.Check
                  type="radio"
                  id={method.id}
                  name="paymentMethod"
                  checked={paymentMethod === method.label}
                  onChange={() => setPaymentMethod(method.label)}
                  className="mt-0"
                />
                <div
                  className="d-flex align-items-center justify-content-center rounded-3"
                  style={{ width: '44px', height: '44px', backgroundColor: method.color + '18', flexShrink: 0 }}
                >
                  <i className={method.icon} style={{ color: method.color, fontSize: '1.2rem' }}></i>
                </div>
                <div>
                  <div className="fw-bold text-dark" style={{ fontSize: '0.95rem' }}>{method.label}</div>
                  <div className="text-muted small">{method.desc}</div>
                </div>
                {paymentMethod === method.label && (
                  <div className="ms-auto">
                    <i className="fas fa-check-circle text-primary" style={{ fontSize: '1.2rem' }}></i>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        <div className="d-flex align-items-center gap-3 mb-4 p-3 rounded-3 bg-light">
          <i className="fas fa-lock text-success"></i>
          <span className="small text-muted">All transactions are 256-bit SSL encrypted and 100% secure.</span>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-100 py-3 rounded-3 shadow-sm fw-bold"
          style={{ fontSize: '1rem' }}
        >
          <i className="fas fa-arrow-right me-2"></i>
          Continue to Review Order
        </Button>
      </Form>
    </FormContainer>
  )
}

export default PaymentPage
