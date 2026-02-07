// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/ClawQuests.sol";

contract DeployClawQuests is Script {
    // Base Sepolia USDC
    address constant USDC = 0x036CbD53842c5426634e7929541eC2318f3dCF7e;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("ETH_PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Deployer:", deployer);
        console.log("Treasury:", deployer);
        console.log("USDC:", USDC);

        vm.startBroadcast(deployerPrivateKey);

        ClawQuests quests = new ClawQuests(USDC, deployer);

        console.log("ClawQuests deployed at:", address(quests));

        vm.stopBroadcast();
    }
}
