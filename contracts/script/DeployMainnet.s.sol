// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/ClawQuests.sol";

contract DeployClawQuestsMainnet is Script {
    // Base Mainnet USDC
    address constant USDC = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;
    // Base Mainnet ERC-8004 IdentityRegistry
    address constant IDENTITY_REGISTRY = 0x8004A169FB4a3325136EB29fA0ceB6D2e539a432;

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
