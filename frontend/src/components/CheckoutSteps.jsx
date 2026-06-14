import React from 'react'
import { useNavigate } from 'react-router-dom'

function CheckoutSteps({ step1, step2, step3, step4 }) {
  const navigate = useNavigate()

  const steps = [
    { label: 'Sign In', icon: 'fas fa-user', active: step1, path: '/login' },
    { label: 'Shipping', icon: 'fas fa-truck', active: step2, path: '/shipping' },
    { label: 'Payment', icon: 'fas fa-credit-card', active: step3, path: '/payment' },
    { label: 'Place Order', icon: 'fas fa-check-circle', active: step4, path: '/placeorder' },
  ]

  return (
    <div className="checkout-stepper d-flex align-items-center justify-content-center mb-5">
      {steps.map((step, idx) => (
        <React.Fragment key={step.label}>
          <div
            className={`checkout-step d-flex flex-column align-items-center ${step.active ? 'step-active' : 'step-inactive'}`}
            onClick={() => step.active && navigate(step.path)}
            style={{ cursor: step.active ? 'pointer' : 'default', minWidth: '80px' }}
          >
            <div
              className={`step-circle d-flex align-items-center justify-content-center mb-2 ${step.active ? 'bg-primary text-white shadow' : 'bg-light text-muted border'}`}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                fontSize: '1.1rem',
                transition: 'all 0.3s ease',
                border: step.active ? '2px solid var(--primary-color)' : '2px solid #dee2e6',
              }}
            >
              <i className={step.icon}></i>
            </div>
            <span
              className={`small fw-semibold text-center ${step.active ? 'text-primary' : 'text-muted'}`}
              style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}
            >
              {step.label}
            </span>
          </div>

          {idx < steps.length - 1 && (
            <div
              className={`step-connector flex-grow-1 mx-2 ${steps[idx + 1].active ? 'bg-primary' : 'bg-light border'}`}
              style={{
                height: '2px',
                maxWidth: '60px',
                borderRadius: '2px',
                marginBottom: '22px',
                transition: 'background-color 0.3s ease',
              }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

export default CheckoutSteps
