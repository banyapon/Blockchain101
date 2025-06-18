// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title Car Rental Contract (Simple Version)
/// @dev เก็บรายการรถ ให้ user จอง และคืนรถได้
contract CarRental {
    // struct เก็บข้อมูลรถ (id, ชื่อยี่ห้อ, สถานะ)
    struct Car {
        uint256 id;
        string brand;
        bool available;
    }

    // struct เก็บประวัติการทำรายการ (จอง หรือ คืน)
    struct RentalRecord {
        uint256 carId;
        address renter;
        bool isReturn;     // ถ้า false = จอง, true = คืน
        uint256 timestamp;
    }

    Car[] public cars;  // รายการรถทั้งหมด
    RentalRecord[] public records;  // ประวัติการจอง/คืนทั้งหมด
    mapping(uint256 => address) public bookedBy; 
    // bookedBy[carId] = address ที่จอง (แต่ก่อนจอง available = true)

    /// @notice เพิ่มรถใหม่ (เรียกครั้งแรกโดย Owner/Test Script)
    function addCar(string memory _brand) public {
        cars.push(Car(cars.length, _brand, true));
    }

    /// @notice จองรถ (เฉพาะรถที่ available = true เท่านั้น)
    function bookCar(uint256 _carId) public {
        require(_carId < cars.length, "Invalid carId");
        Car storage c = cars[_carId];
        require(c.available, "Car is not available");
        // แก้สถานะเป็นไม่ว่าง
        c.available = false;
        bookedBy[_carId] = msg.sender;

        // บันทึกประวัติว่าเป็นการจอง (isReturn = false)
        records.push(RentalRecord(_carId, msg.sender, false, block.timestamp));
    }

    /// @notice คืนรถ (เฉพาะรถที่ถูกจองโดย msg.sender เท่านั้น)
    function returnCar(uint256 _carId) public {
        require(_carId < cars.length, "Invalid carId");
        Car storage c = cars[_carId];
        require(!c.available, "Car is not rented");
        require(bookedBy[_carId] == msg.sender, "Not your booking");

        // แก้สถานะรถเป็น available = true
        c.available = true;
        bookedBy[_carId] = address(0);

        // บันทึกประวัติว่าคืน (isReturn = true)
        records.push(RentalRecord(_carId, msg.sender, true, block.timestamp));
    }

    /// @notice ดูจำนวนรถทั้งหมด
    function getCarCount() public view returns (uint256) {
        return cars.length;
    }

    /// @notice ดูข้อมูลรถตาม index
    function getCar(uint256 _carId) public view 
        returns (uint256 id, string memory brand, bool available) 
    {
        require(_carId < cars.length, "Invalid carId");
        Car memory c = cars[_carId];
        return (c.id, c.brand, c.available);
    }

    /// @notice ดูจำนวนบันทึกประวัติทั้งหมด
    function getRecordCount() public view returns (uint256) {
        return records.length;
    }

    /// @notice ดูข้อมูลบันทึกตาม index
    function getRecord(uint256 _index) public view 
        returns (uint256 carId, address renter, bool isReturn, uint256 timestamp)
    {
        require(_index < records.length, "Invalid index");
        RentalRecord memory r = records[_index];
        return (r.carId, r.renter, r.isReturn, r.timestamp);
    }
}
