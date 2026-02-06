import React, { useState, useRef } from 'react'
import { Button, Collapse } from 'react-bootstrap'
import '../Styles/report.css'


function ReportTableDropdown(props) {

    const ref = useRef(null);
    const [open, setOpen] = useState(false);

    console.log(props, typeof props.data_to_display);

    return (
        <div className='container report-dropdown-div rounded bg-primary text-light'>
            <div className='row justify-content-between'>
                <div className='col'>
                    <h4 className='m-1'>{props.title}</h4>
                </div>
                <div className='col text-end'>
                    <Button
                        className='btn py-0 px-2'
                        variant='none'
                        onClick={() => setOpen(!open)}
                        aria-controls='collapseContent'
                        aria-expanded={open}
                    >
                        <i
                            className={open ? 'arrow up ' : 'arrow'}
                            ref={ref}
                        ></i>
                    </Button>
                </div>
            </div>
            <Collapse in={open}>
                {Array.isArray(props.data_to_display) ? (
                    <>
                        {props.data_to_display?.map((el, key) => {
                            return (
                                <Collapse in={open}>
                                    <div className='row' key={key}>
                                        <h5 className='m-1 col'> {el?.title}</h5>
                                        <h5 className='col'>{el?.value}</h5>
                                        <h5 className='col'> <span className={`severity-${el?.severity}`}>{el?.severity}</span></h5>
                                    </div>
                                </Collapse>
                            )
                        })}
                    </>
                ) : (
                    <div className='row'>
                        <h5 className='m-1 col'>Title: {props.data_to_display?.title}</h5>
                        <h5 className='col'>Value: {props.data_to_display?.value}</h5>
                        <h5 className='col'>Severity: <span className={`severity-${props.data_to_display?.severity}`}>{props.data_to_display?.severity}</span></h5>
                    </div>
                )}
            </Collapse>
        </div>
    )
}

export default ReportTableDropdown