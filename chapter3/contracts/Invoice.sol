// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract InvoiceSystem {
    struct Invoice {
        uint id;
        string customer;
        uint amount;
        uint issueDate;
        address issueBy;
    }
    Invoice[] public invoices;
    uint public nextId;
    event InvoiceIssued(uint id, string customer,uint amount, address issueBy);

    //Function to issue a new invoice
    function issueInvoice(string memory _customer,uint _amount) public {
        invoices.push(Invoice(nextId, _customer, _amount, block.timestamp ,msg.sender));
        emit InvoiceIssued(nextId,_customer, _amount, msg.sender);
        nextId++;
    }

    //Function to get invoice details by ID
    function getInvoice(uint _id) public view returns (Invoice memory) {
        require(_id < invoices.length, "Invoice does not exist");
        return invoices[_id];
    }

    //Function to get the total number of invoices
    function getInvoiceCount() public view returns (uint) {
        return invoices.length;
    }
}