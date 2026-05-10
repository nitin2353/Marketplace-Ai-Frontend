import React from "react";
import { Container } from "react-bootstrap";
import Toolbar from "../../components/Toolbar";
import CustomerReturnsList from "../../components/returns/CustomerReturnsList.jsx";

const CustomerReturns = () => {
    return (
        <>
            <Toolbar title="My Returns & Replacements" isSearch={false} isSideBar={false} />
            <Container className="py-4">
                <div className="bg-white p-4 rounded shadow-sm">
                    <CustomerReturnsList />
                </div>
            </Container>
        </>
    );
};

export default CustomerReturns;
