// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/ClawQuests.sol";

contract DeployClawQuests is Script {
    // Base Sepolia USDC
    address constant USDC = 0x036CbD53842c5426634e7929541eC2318f3dCF7e;
    // Base Sepolia ERC-8004 IdentityRegistry
    address constant IDENTITY_REGISTRY = 0x8004A818BFB912233c491871b3d84c89A494BD9e;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("ETH_PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Deployer:", deployer);
        console.log("Treasury:", deployer);
        console.log("USDC:", USDC);
        console.log("IdentityRegistry:", IDENTITY_REGISTRY);

        vm.startBroadcast(deployerPrivateKey);

        ClawQuests quests = new ClawQuests(USDC, deployer, IDENTITY_REGISTRY);

        console.log("ClawQuests deployed at:", address(quests));

        vm.stopBroadcast();
    }
}
