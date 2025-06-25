// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
contract SimpleCoupon {
    string public name = "SimpleCoupon";
    string public symbol = "SCPT";
    address public owner;
    uint256 public nextTokenId;

    struct Coupon {
        string code; //รหัสคูปอง
        string description; //คำอธิบายคูปอง
        string image; //ลิงก์รูปภาพคูปอง (optional)
        bool isUsed; //สถานะการใช้งานคูปอง true = ใช้งานแล้ว, false = ยังไม่ใช้งาน
        address owner; //เจ้าของคูปอง
    }
    //mapping
    mapping(uint256 => Coupon) public coupons;
    mapping(address => uint256[]) public ownerCoupons;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not contract owner");
        _;
    }

    //constructor
    constructor() {
        owner = msg.sender;
    }

    //function
    function awardCoupon(
        address to,
        string memory code,
        string memory description,
        string memory image // optional image link
    ) public onlyOwner {
        coupons[nextTokenId] = Coupon(code, description, image, false, to);
        ownerCoupons[to].push(nextTokenId);
        nextTokenId++;
    }

    function markAsUsed(uint256 tokenId) public onlyOwner {
        require(
            bytes(coupons[tokenId].code).length > 0,
            "Coupon does not exist"
        );
        coupons[tokenId].isUsed = true;
    }

    function getMyCoupons() public view returns (Coupon[] memory) {
        uint256[] memory ids = ownerCoupons[msg.sender];
        Coupon[] memory result = new Coupon[](ids.length);
        for (uint i = 0; i < ids.length; i++) {
            result[i] = coupons[ids[i]];
        }
        return result;
    }

    function getCoupon(
        uint256 tokenId
    ) public view returns (string memory, string memory, string memory, bool, address) {
        Coupon memory c = coupons[tokenId];
        return (c.code, c.description, c.image, c.isUsed, c.owner);
    }
}
