import React, { useState } from 'react'
import { useEffect } from 'react'
import Table from 'react-bootstrap/Table'
import Card from 'react-bootstrap/Card';
import CardGroup from 'react-bootstrap/CardGroup';

function Format(props) {
    console.log(props.rawData);
    const [data, setData] = useState([])
    useEffect(() => {
        let temp = props.rawData?.map((ele) => ele.split(' ').map((s) => s.trim()).filter((s) => s.length > 0))
        temp = temp?.map((ele) => {
            if (ele.length > 4) {
                for (let i = 4; i < ele.length; i++) {
                    ele[3] = ele[3] + " " + ele[i];
                }
                ele = ele.slice(0, 4);
            } return ele
        })
        if(temp) {
            setData([...temp]);
        } else {
            setData(['No Data']);
        }
    }, [props.rawData]);
    if (props.title === "PORTS Raw Report") {
        return (
            <Table striped bordered hover>
                <thead>
                    <tr>
                        {
                            data[0]?.map((ele, key) => {
                                return (
                                    <th key={key}>{ele}</th>
                                )
                            })
                        }
                    </tr>
                </thead>
                <tbody>
                    {
                        data?.map((ele, key) => {
                            if (ele[0] !== 'PORT') {
                                return (
                                    <tr key={key}>
                                        {
                                            ele?.map((el, ke) => {
                                                return (
                                                    <td key={ke}>{el}</td>
                                                )
                                            })
                                        }
                                    </tr>
                                )
                            } else { return (<></>) }
                        })
                    }
                </tbody>
            </Table>
        )
    } else if (props.title === "NUCLEI TEST Raw Report") {
        return (
            <>
                {
                    props.rawData?.map((el,key)=>{
                        el = JSON.parse(el);
                        let cve_id=el.info.classification?el.info.classification["cve-id"]:"null"
                        let cwe_id=el.info.classification?el.info.classification["cwe-id"]:"null";
                        return(
                            <CardGroup>
                                {/* <div>{el}</div> */}
                                <Card body>{el.info.name}</Card>
                                <Card body>{el.info.description}</Card>
                                <Card body>{el.info.severity}</Card>
                                <Card body>{el.info.tags.join(", ")}</Card>
                                <Card body>cve-id : {cve_id}</Card>
                                <Card body>cwe-id : {cwe_id}</Card>
                            </CardGroup>
                        )
                    })
                }
            </>
        );
    } else if (props.title === "CVE Raw Report") {
        return (
            <>
                {
                    props.rawData?.map((el,key)=>{
                        el = JSON.parse(el);
                        let date = new Date(el.published);
                        if(el.noData==="true"){
                            return(
                                <CardGroup>
                                    <Card>
                                        <Card.Body>
                                            <Card.Title>
                                                {el.reason}
                                            </Card.Title>
                                        </Card.Body>
                                    </Card>
                                </CardGroup>
                            )
                        }
                        return(
                            <CardGroup>
                                <Card>
                                    <Card.Body>
                                        <Card.Title>{el.id}</Card.Title>
                                        <Card.Subtitle>{el.scoreType}: <span className={'cve_'+el.severity.toLowerCase()}>{el.score} {el.severity}</span></Card.Subtitle>
                                        <Card.Text>
                                            <p><b><u>Summary:</u></b> {el.descriptions}</p>
                                            <p><b><u>Published on:</u></b> {date.toUTCString()}</p>
                                            <p><b><u>Vuln Status:</u></b> {el.vulnStatus}</p>
                                        </Card.Text>
                                        <Card.Link href={el.url}>CVE Link</Card.Link>
                                    </Card.Body>
                                </Card>
                            </CardGroup>
                        )
                    })
                }
            </>
        );
    } else {
        return (
            <div>
                {
                    props.rawData?.map((el, key) => {
                        return (<p key={key}>{el}</p>)
                    })
                }
            </div>
        )
    }
}

export default Format;