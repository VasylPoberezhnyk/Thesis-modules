// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DidController {
    string[] private values;

    event StringAdded(string newValue);

    function addValue(string memory _value) public {
        values.push(_value);
        emit StringAdded(_value);
    }

    function getValues() public view returns (string[] memory) {
        return values;
    }

    function getValue(uint256 index) public view returns (string memory) {
        require(index < values.length, "Index out of bounds");
        return values[index];
    }

    function getCount() public view returns (uint256) {
        return values.length;
    }
}