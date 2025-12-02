// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../../src/MockTokens.sol";

contract CheckBalances is Script {
    function run() external view {
        // 1. Setup Addresses (from previous deployment)
        address usdcAddr = 0x3Cd1E0dDF1691f001e8faf10f0f11f159050299E;
        address goldAddr = 0xc6cFA6409cEdf87DEFE55e92959a32C1f274ae39;
        address poolAddr = 0xAcaAF0d9545C5d0C66aBC8bCCF3Afa98fcF0c5cb;
        
        // 2. Get Deployer Address
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        MockUSDC usdc = MockUSDC(usdcAddr);
        MockGold gold = MockGold(goldAddr);

        console.log("--- BALANCES CHECK ---");
        console.log("Deployer Address:", deployer);
        console.log("Pool Address:    ", poolAddr);
        console.log("----------------------");

        // 3. Check Deployer Balances
        console.log("Deployer USDC:  ", usdc.balanceOf(deployer) / 1e6, "USDC");
        console.log("Deployer GOLD:  ", gold.balanceOf(deployer) / 1e18, "GOLD");
        console.log("Deployer ETH:   ", deployer.balance / 1e18, "MNT"); // Native token

        console.log("----------------------");

        // 4. Check Pool Balances
        console.log("Pool USDC:      ", usdc.balanceOf(poolAddr) / 1e6, "USDC");
        console.log("Pool GOLD:      ", gold.balanceOf(poolAddr) / 1e18, "GOLD");
    }
}
