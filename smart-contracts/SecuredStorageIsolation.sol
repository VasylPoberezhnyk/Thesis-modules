// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SecuredStorageIsolation {
    
    // Хеш-таблиця, що прив'язує адресу гаманця до хешу (CID) бекапу
    mapping(address => string) private backups;

    // Подія, яка записується в лог блокчейну при кожному оновленні
    event BackupSaved(address indexed user, string cid);

    /**
     * Зберігає CID резервної копії. 
     * Запис робиться ТІЛЬКИ в комірку пам'яті того, хто викликав функцію (msg.sender).
     */
    function saveBackup(string calldata _cid) external {
        backups[msg.sender] = _cid;
        emit BackupSaved(msg.sender, _cid);
    }

    /**
     * Дозволяє користувачеві прочитати свій власний бекап.
     */
    function getMyBackup() external view returns (string memory) {
        return backups[msg.sender];
    }

    /**
     * Допоміжна функція для Досліду 3.
     * Дозволяє подивитися CID будь-якого користувача, щоб переконатися, 
     * що чужі маніпуляції не змінили ваші дані.
     */
    function checkUserBackup(address _user) external view returns (string memory) {
        return backups[_user];
    }
}