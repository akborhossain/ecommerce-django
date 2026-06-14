import React, { useState } from 'react'
import { Form, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'

function SearchBox() {
    const [keyword, setKeyword] = useState('')
    const navigate = useNavigate()

    const submitHandler = (e) => {
        e.preventDefault()
        if (keyword.trim()) {
            navigate(`/?keyword=${keyword}`)
        } else {
            navigate('/')
        }
    }

    return (
        <Form onSubmit={submitHandler} className="d-flex mx-auto my-2 my-lg-0 align-items-center" style={{ maxWidth: '450px', width: '100%' }}>
            <Form.Control
                type='text'
                name='q'
                placeholder='Search products...'
                onChange={(e) => setKeyword(e.target.value)}
                className='mr-sm-2 ml-sm-5 rounded-pill border-0 px-3 py-2 bg-light shadow-none'
                style={{ fontSize: '0.9rem' }}
            />
            <Button type='submit' variant='outline-primary' className='p-2 ms-2 rounded-circle border-0 bg-transparent text-primary hover-bg-light'>
                <i className='fas fa-search'></i>
            </Button>
        </Form>
    )
}

export default SearchBox
